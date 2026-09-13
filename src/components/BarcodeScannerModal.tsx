import React, { useState, useEffect, useRef } from 'react';
import { Camera, X, RefreshCw, AlertCircle, Check, Keyboard, Zap, Volume2, VolumeX, Upload, Image as ImageIcon, Sparkles, Plus, ShoppingCart, ArrowRight } from 'lucide-react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Product } from '../types.js';
import { normalizeBarcode } from '../utils/barcodeUtils.js';

export { normalizeBarcode };

export interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (barcode: string, product?: Product | null) => void;
  title?: string;
  subtitle?: string;
  continuous?: boolean;
  demoBarcodes?: { barcode: string; name: string }[];
  products?: Product[];
  zIndex?: string;
  onOpenAddProductWithBarcode?: (barcode: string) => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onScan,
  title = 'Scan Product Barcode',
  subtitle = 'Point your camera at the retail barcode (EAN-13, UPC, Code 128)',
  continuous = true,
  demoBarcodes = [],
  products = [],
  zIndex = 'z-70',
  onOpenAddProductWithBarcode,
}) => {
  const [manualCode, setManualCode] = useState('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const [notFoundBarcode, setNotFoundBarcode] = useState<string | null>(null);
  const [scanCount, setScanCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [hasTorchCapability, setHasTorchCapability] = useState(false);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const instanceIdRef = useRef(`html5qr-scanner-${Math.random().toString(36).substring(2, 9)}`);
  const readerElementId = instanceIdRef.current;
  const fileReaderElementId = useRef(`file-scanner-${Math.random().toString(36).substring(2, 9)}`).current;
  const lastScanTimestamp = useRef<number>(0);
  const lastScannedCodeRef = useRef<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const detectorTimeoutRef = useRef<any>(null);

  // Audio chime synthesizer on successful barcode scan
  const playBeep = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1046.5, ctx.currentTime); // High C6 pitch
      osc.frequency.exponentialRampToValueAtTime(1318.5, ctx.currentTime + 0.08); // E6

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.12);
    } catch (err) {
      // AudioContext fallback
    }
  };

  // Vibration feedback
  const triggerVibration = () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([80, 40, 80]);
      }
    } catch (e) {
      // Vibration not supported
    }
  };

  // Handle a successfully detected barcode string
  const handleDetectedCode = (rawCode: string) => {
    const clean = normalizeBarcode(rawCode);
    if (!clean) return;

    const now = Date.now();
    // Debounce duplicate scans within 1.5 seconds
    if (clean === lastScannedCodeRef.current && now - lastScanTimestamp.current < 1500) {
      return;
    }

    lastScanTimestamp.current = now;
    lastScannedCodeRef.current = clean;

    // Trigger feedback
    playBeep();
    triggerVibration();

    setLastScanned(clean);
    setScanCount((prev) => prev + 1);

    // Search inventory for matching product by exact barcode
    const match = products.find(
      (p) =>
        p.barcode && normalizeBarcode(p.barcode).toLowerCase() === clean.toLowerCase()
    );

    if (match) {
      setScannedProduct(match);
      setNotFoundBarcode(null);
      onScan(clean, match);
    } else {
      setScannedProduct(null);
      setNotFoundBarcode(clean);
      onScan(clean, null);
    }

    if (!continuous) {
      setTimeout(() => {
        stopScanner();
        onClose();
      }, 900);
    }
  };

  // Enumerate available video input devices (cameras)
  useEffect(() => {
    if (!isOpen) return;

    Html5Qrcode.getCameras()
      .then((deviceList) => {
        if (deviceList && deviceList.length > 0) {
          const formatted = deviceList.map((d) => ({
            id: d.id,
            label: d.label || `Camera ${d.id.substring(0, 4)}`,
          }));
          setCameras(formatted);

          // Prefer back/environment facing camera
          const backCam = formatted.find(
            (c) =>
              c.label.toLowerCase().includes('back') ||
              c.label.toLowerCase().includes('rear') ||
              c.label.toLowerCase().includes('environment')
          );
          setSelectedCameraId(backCam ? backCam.id : formatted[0].id);
        }
      })
      .catch((err) => {
        console.warn('Unable to enumerate cameras:', err);
      });
  }, [isOpen]);

  // Start Scanner Stream
  const startScanner = async () => {
    setCameraError(null);
    setIsScanning(false);

    // Ensure previous instance is stopped
    await stopScanner();

    // Check DOM element
    const container = document.getElementById(readerElementId);
    if (!container) {
      setCameraError('Camera container element not found. Please try reopening scanner.');
      return;
    }

    try {
      const html5QrCode = new Html5Qrcode(readerElementId, {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.CODE_93,
          Html5QrcodeSupportedFormats.ITF,
          Html5QrcodeSupportedFormats.CODABAR,
          Html5QrcodeSupportedFormats.DATA_MATRIX,
          Html5QrcodeSupportedFormats.QR_CODE,
        ],
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true,
        },
        verbose: false,
      });

      scannerRef.current = html5QrCode;

      // Pass single key object `{ facingMode: "environment" }` or camera ID string to avoid html5-qrcode multi-key warning
      const cameraConfig = selectedCameraId
        ? selectedCameraId
        : { facingMode: 'environment' };

      const qrboxFunction = (viewfinderWidth: number, viewfinderHeight: number) => {
        const validW = viewfinderWidth && viewfinderWidth > 50 ? viewfinderWidth : 360;
        const validH = viewfinderHeight && viewfinderHeight > 50 ? viewfinderHeight : 300;

        const width = Math.max(260, Math.floor(validW * 0.92));
        const height = Math.max(140, Math.floor(validH * 0.65));

        return { width, height };
      };

      await html5QrCode.start(
        cameraConfig,
        {
          fps: 20,
          qrbox: qrboxFunction,
        },
        (decodedText) => {
          handleDetectedCode(decodedText);
        },
        () => {
          // Ignore frame decode failures (happens continuously while searching for barcode)
        }
      );

      setIsScanning(true);

      // Check torch capability
      try {
        const videoElement = container.querySelector('video') as HTMLVideoElement | null;
        if (videoElement && videoElement.srcObject) {
          const track = (videoElement.srcObject as MediaStream).getVideoTracks()?.[0];
          if (track) {
            const caps: any = track.getCapabilities ? track.getCapabilities() : {};
            if (caps && caps.torch) {
              setHasTorchCapability(true);
            }
          }
        }
      } catch (e) {
        // Capabilities check fallback
      }
    } catch (err: any) {
      console.error('Camera Scanner start error:', err);
      let msg = 'Unable to access camera stream.';
      if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
        msg = 'Camera access requires HTTPS security context. Please access via https:// or localhost.';
      } else if (err?.message?.includes('Permission') || err?.name === 'NotAllowedError') {
        msg = 'Camera permission denied. Please enable camera access in browser settings.';
      } else if (err?.name === 'NotFoundError' || err?.name === 'DevicesNotFoundError') {
        msg = 'No camera device found on your phone or computer.';
      } else if (err?.name === 'NotReadableError' || err?.name === 'TrackStartError') {
        msg = 'Camera is already in use by another application or tab.';
      }
      setCameraError(msg);
      setIsScanning(false);
    }
  };

  // Stop Scanner Stream
  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (err) {
        console.warn('Scanner stop warning:', err);
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  // Lifecycle control
  useEffect(() => {
    if (isOpen) {
      setLastScanned(null);
      setScannedProduct(null);
      setNotFoundBarcode(null);
      setCameraError(null);

      // Small delay to ensure modal overlay DOM is rendered
      const timer = setTimeout(() => {
        startScanner();
      }, 150);

      return () => {
        clearTimeout(timer);
        stopScanner();
      };
    } else {
      stopScanner();
    }
  }, [isOpen, selectedCameraId]);

  // Parallel Native BarcodeDetector frame scanner for instant detection
  useEffect(() => {
    if (!isScanning || !('BarcodeDetector' in window)) return;

    let active = true;
    let detector: any = null;

    (async () => {
      try {
        const formats = await (window as any).BarcodeDetector.getSupportedFormats();
        detector = new (window as any).BarcodeDetector({ formats });
      } catch (e) {
        return;
      }

      const detectFrame = async () => {
        if (!active) return;
        try {
          const container = document.getElementById(readerElementId);
          const videoElement = container?.querySelector('video') as HTMLVideoElement | null;
          if (videoElement && videoElement.readyState >= 2) {
            const barcodes = await detector.detect(videoElement);
            if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
              handleDetectedCode(barcodes[0].rawValue);
            }
          }
        } catch (err) {
          // ignore frame errors
        }
        if (active) {
          detectorTimeoutRef.current = setTimeout(detectFrame, 80);
        }
      };

      detectFrame();
    })();

    return () => {
      active = false;
      if (detectorTimeoutRef.current) clearTimeout(detectorTimeoutRef.current);
    };
  }, [isScanning]);

  // Toggle Torch Light
  const toggleTorch = async () => {
    if (!scannerRef.current) return;
    try {
      const container = document.getElementById(readerElementId);
      const videoElement = container?.querySelector('video') as HTMLVideoElement | null;
      if (videoElement && videoElement.srcObject) {
        const track = (videoElement.srcObject as MediaStream).getVideoTracks()?.[0];
        if (track) {
          const newState = !isTorchOn;
          await track.applyConstraints({
            advanced: [{ torch: newState } as any],
          });
          setIsTorchOn(newState);
        }
      }
    } catch (e) {
      console.warn('Torch toggle error:', e);
    }
  };

  // File Upload fallback scan with dual-engine fallback
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Stage 1: Try Native BarcodeDetector on image element first
      if ('BarcodeDetector' in window) {
        try {
          const img = document.createElement('img');
          const imageUrl = URL.createObjectURL(file);
          img.src = imageUrl;
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          });

          const formats = await (window as any).BarcodeDetector.getSupportedFormats();
          const detector = new (window as any).BarcodeDetector({ formats });
          const detected = await detector.detect(img);
          URL.revokeObjectURL(imageUrl);

          if (detected && detected.length > 0 && detected[0].rawValue) {
            handleDetectedCode(detected[0].rawValue);
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
          }
        } catch (nativeErr) {
          console.warn('Native BarcodeDetector file scan fallback:', nativeErr);
        }
      }

      // Stage 2: Html5Qrcode scanFile fallback with stable element ID
      const html5QrCode = new Html5Qrcode(fileReaderElementId, {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.ITF,
          Html5QrcodeSupportedFormats.QR_CODE,
        ],
        verbose: false,
      });

      const decodedText = await html5QrCode.scanFile(file, false);
      html5QrCode.clear();

      if (decodedText) {
        handleDetectedCode(decodedText);
      } else {
        alert('Could not decode a valid barcode from this photo. Please try a clearer barcode photo or enter the barcode number manually below.');
      }
    } catch (err) {
      alert('Could not decode a valid barcode from this photo. Please try a clearer barcode photo or enter the barcode number manually below.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleDetectedCode(manualCode.trim());
    setManualCode('');
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 ${zIndex} bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200`}>
      {/* Hidden container with stable element ID for file scanning */}
      <div id={fileReaderElementId} className="hidden" />

      <div className="relative bg-white rounded-3xl max-w-lg w-full border border-[#EADDCE] shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* HEADER BAR */}
        <div className="p-4 border-b border-[#F2ECE4] bg-[#FAF8F5] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E76F51]/10 text-[#E76F51] flex items-center justify-center font-bold shadow-2xs">
              <Camera className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-[#264653] font-['Fredoka',sans-serif] flex items-center gap-2">
                <span>{title}</span>
                {isScanning && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 animate-pulse">
                    LIVE
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-[#7C9082] line-clamp-1">{subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Sound Toggle */}
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-xl border transition-colors ${
                soundEnabled
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-gray-100 text-gray-400 border-gray-200'
              }`}
              title={soundEnabled ? 'Mute scan chime' : 'Enable scan chime'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Torch Light Button */}
            {hasTorchCapability && (
              <button
                type="button"
                onClick={toggleTorch}
                className={`p-2 rounded-xl border transition-colors ${
                  isTorchOn
                    ? 'bg-amber-400 text-white border-amber-500 shadow-md'
                    : 'bg-white text-gray-600 border-[#D5C7B8] hover:bg-gray-50'
                }`}
                title="Toggle flashlight / torch"
              >
                <Zap className="w-4 h-4" />
              </button>
            )}

            {/* Close Button */}
            <button
              type="button"
              onClick={() => {
                stopScanner();
                onClose();
              }}
              className="p-2 rounded-full hover:bg-black/5 text-[#7C9082] transition-colors cursor-pointer"
              title="Close scanner"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MAIN SCANNER CONTAINER */}
        <div className="relative bg-black flex-1 min-h-[260px] sm:min-h-[320px] max-h-[420px] overflow-hidden flex items-center justify-center">
          {/* html5-qrcode video viewport target */}
          <div id={readerElementId} className="w-full h-full object-cover" />

          {/* Viewfinder Target Box Overlay */}
          {isScanning && !cameraError && (
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
              <div className="w-[75%] h-[55%] max-w-[280px] max-h-[200px] border-2 border-emerald-400/90 rounded-2xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center">
                {/* Glowing Corner Accents */}
                <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
                <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />

                {/* Animated Horizontal Laser Scanning Line */}
                <div className="w-[90%] h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399] animate-bounce my-auto" />
              </div>
              <p className="text-white/90 text-xs font-bold mt-4 bg-black/60 px-3 py-1 rounded-full backdrop-blur-xs tracking-wide">
                Align barcode inside frame
              </p>
            </div>
          )}

          {/* Camera Permission / Access Error Screen */}
          {cameraError && (
            <div className="absolute inset-0 bg-stone-900 p-6 flex flex-col items-center justify-center text-center text-white space-y-4">
              <div className="w-14 h-14 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-base text-red-200">Camera Access Error</h4>
                <p className="text-xs text-stone-300 max-w-xs">{cameraError}</p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={startScanner}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-md"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Try Camera Again</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs flex items-center gap-2 border border-stone-700"
                >
                  <Upload className="w-4 h-4 text-amber-400" />
                  <span>Upload Barcode Photo</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* CONTROLS & CAMERA SELECTION */}
        <div className="p-3 bg-[#FAF8F5] border-t border-[#F2ECE4] flex items-center justify-between text-xs gap-2 shrink-0">
          {/* Camera Selector Dropdown if multiple cameras exist */}
          {cameras.length > 1 ? (
            <select
              value={selectedCameraId}
              onChange={(e) => setSelectedCameraId(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-[#D5C7B8] bg-white text-[11px] font-bold text-[#264653] focus:ring-2 focus:ring-[#E76F51] focus:outline-hidden"
            >
              {cameras.map((c) => (
                <option key={c.id} value={c.id}>
                  📷 {c.label}
                </option>
              ))}
            </select>
          ) : (
            <span className="text-[11px] font-bold text-[#7C9082] flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-emerald-600" />
              <span>Mobile Camera Active</span>
            </span>
          )}

          {/* Photo Upload fallback button */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 rounded-xl bg-white border border-[#D5C7B8] hover:bg-[#FAF8F5] text-[#264653] font-bold text-[11px] flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            title="Scan barcode from image photo in gallery"
          >
            <Upload className="w-3.5 h-3.5 text-[#E76F51]" />
            <span>Upload Photo</span>
          </button>
        </div>

        {/* SCAN RESULT / PRODUCT FOUND DISPLAY */}
        <div className="p-4 space-y-3 bg-white border-t border-[#F2ECE4] overflow-y-auto max-h-[220px]">
          {/* FOUND PRODUCT CARD */}
          {scannedProduct && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-2 animate-in slide-in-from-bottom-2 duration-200">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {scannedProduct.imageUrl ? (
                    <img
                      src={scannedProduct.imageUrl}
                      alt={scannedProduct.name}
                      className="w-12 h-12 rounded-xl object-contain bg-white border border-emerald-200 p-1 shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg shrink-0">
                      📦
                    </div>
                  )}
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                      Product Found
                    </span>
                    <h4 className="font-bold text-sm text-[#264653] font-['Fredoka',sans-serif] line-clamp-1 mt-0.5">
                      {scannedProduct.name}
                    </h4>
                    <p className="text-[11px] text-[#7C9082] font-mono">
                      Barcode: <span className="font-bold text-[#264653]">{scannedProduct.barcode}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="block text-sm font-black text-[#264653] font-mono">
                    ₹{Math.round(scannedProduct.sellingPrice)}
                  </span>
                  <span className="text-[10px] text-[#7C9082]">
                    Cat: {scannedProduct.category}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-emerald-200/60 text-xs">
                <span className="text-[11px] font-bold text-emerald-800">
                  Total Scans: {scanCount}
                </span>
                <span className="text-[11px] font-semibold text-emerald-900">
                  Added to POS Cart / Filtered
                </span>
              </div>
            </div>
          )}

          {/* PRODUCT NOT FOUND CARD */}
          {notFoundBarcode && !scannedProduct && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 space-y-2 animate-in slide-in-from-bottom-2 duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <div>
                    <h4 className="font-bold text-xs text-amber-900">Product Not Found</h4>
                    <p className="text-[11px] font-mono text-amber-800">
                      Scanned Code: <span className="font-bold">{notFoundBarcode}</span>
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-amber-800">
                This barcode is not registered in your inventory yet.
              </p>

              <div className="flex items-center gap-2 pt-1">
                {onOpenAddProductWithBarcode && (
                  <button
                    type="button"
                    onClick={() => {
                      stopScanner();
                      onClose();
                      onOpenAddProductWithBarcode(notFoundBarcode);
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#E76F51] hover:bg-[#D95D3E] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Product</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setNotFoundBarcode(null)}
                  className="py-2 px-3 rounded-xl bg-white border border-amber-300 text-amber-900 font-bold text-xs hover:bg-amber-100 transition-colors cursor-pointer"
                >
                  Scan Next Item
                </button>
              </div>
            </div>
          )}

          {/* MANUAL BARCODE ENTRY */}
          <form onSubmit={handleManualSubmit} className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Or type/paste barcode (e.g. 8901234567890)..."
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                className="w-full pl-3 pr-3 py-2 rounded-xl border border-[#D5C7B8] text-xs font-mono font-bold text-[#264653] focus:ring-2 focus:ring-[#E76F51] focus:outline-hidden"
              />
            </div>
            <button
              type="submit"
              disabled={!manualCode.trim()}
              className="px-3.5 py-2 rounded-xl bg-[#264653] hover:bg-[#1E3741] text-white font-bold text-xs disabled:opacity-50 transition-colors cursor-pointer"
            >
              Lookup
            </button>
          </form>

          {/* DEMO / TEST BARCODES FOR CONVENIENCE */}
          {demoBarcodes.length > 0 && (
            <div className="space-y-1 pt-1 border-t border-[#F2ECE4]">
              <span className="text-[10px] font-bold text-[#7C9082] uppercase tracking-wider">
                Quick Test Barcodes:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {demoBarcodes.map((item) => (
                  <button
                    key={item.barcode}
                    type="button"
                    onClick={() => handleDetectedCode(item.barcode)}
                    className="px-2 py-1 rounded-lg bg-[#FAF8F5] border border-[#EADDCE] hover:bg-[#E76F51]/10 text-[10px] font-mono font-bold text-[#264653] transition-colors"
                  >
                    {item.barcode} ({item.name.substring(0, 10)})
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* FOOTER ACTION */}
        <div className="p-3 bg-[#FAF8F5] border-t border-[#F2ECE4] flex items-center justify-between shrink-0">
          <span className="text-[11px] font-bold text-[#7C9082]">
            {lastScanned ? `Last Scanned: ${lastScanned}` : 'Ready for barcode'}
          </span>

          <button
            type="button"
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-[#264653] hover:bg-[#1E3741] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            Done Scanning
          </button>
        </div>
      </div>
    </div>
  );
};
