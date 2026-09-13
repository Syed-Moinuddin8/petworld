import React, { useState } from 'react';
import { X, Printer, Bluetooth, Smartphone, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Sale, Branch, AppSettings } from '../types.js';
import { PawIcon } from './PetAvatars.js';
import {
  isWebBluetoothSupported,
  printViaWebBluetooth,
  generateRawBTIntentUrl,
  connectWebBluetoothPrinter,
  getActiveBluetoothPrinter,
} from '../utils/escpos.js';

interface ThermalReceiptModalProps {
  sale: Sale | null;
  onClose: () => void;
  branch?: Branch;
  settings?: AppSettings | null;
}

export const ThermalReceiptModal: React.FC<ThermalReceiptModalProps> = ({ sale, onClose, branch, settings }) => {
  const [paperWidth, setPaperWidth] = useState<'58mm' | '80mm'>(settings?.thermalWidth || '80mm');
  const [btStatus, setBtStatus] = useState<{ type: 'info' | 'success' | 'error'; message: string } | null>(null);
  const [isBtPrinting, setIsBtPrinting] = useState(false);

  if (!sale) return null;

  const handlePrintSystem = () => {
    window.print();
  };

  const handleWebBluetoothPrint = async () => {
    if (!sale) return;
    setIsBtPrinting(true);
    setBtStatus({ type: 'info', message: 'Connecting to Bluetooth ESC/POS Thermal Printer...' });

    try {
      const result = await printViaWebBluetooth(sale, paperWidth, branch);
      if (result.success) {
        setBtStatus({ type: 'success', message: result.message });
      } else {
        setBtStatus({ type: 'error', message: result.message });
      }
    } catch (err: any) {
      setBtStatus({ type: 'error', message: err.message || 'Bluetooth printing failed.' });
    } finally {
      setIsBtPrinting(false);
    }
  };

  const rawBtUrl = generateRawBTIntentUrl(sale, paperWidth, branch);
  const activeBtPrinter = getActiveBluetoothPrinter();

  const formatINR = (val?: number | null) =>
    '₹' + Math.round(Number(val) || 0).toLocaleString('en-IN');

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 print:p-0 print:bg-white">
      <div className="bg-white rounded-3xl border border-[#EADDCE] shadow-2xl p-6 text-[#264653] max-h-[92vh] overflow-y-auto print:max-h-none print:shadow-none print:border-none print:p-0 w-full max-w-lg">
        {/* Controls */}
        <div className="flex flex-col gap-3 pb-3 border-b border-[#F2ECE4] mb-4 print:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#7C9082]">Width:</span>
              <button
                onClick={() => setPaperWidth('58mm')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                  paperWidth === '58mm'
                    ? 'bg-[#264653] text-white'
                    : 'bg-[#F4EDE4] text-[#5B7065]'
                }`}
              >
                58mm
              </button>
              <button
                onClick={() => setPaperWidth('80mm')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                  paperWidth === '80mm'
                    ? 'bg-[#264653] text-white'
                    : 'bg-[#F4EDE4] text-[#5B7065]'
                }`}
              >
                80mm
              </button>
            </div>

            <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-[#F2ECE4] text-[#7C9082]">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Bluetooth Print Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* 1. Direct Web Bluetooth (BLE ESC/POS) */}
            <button
              onClick={handleWebBluetoothPrint}
              disabled={isBtPrinting}
              className="py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-colors disabled:opacity-50"
              title="Connect and print directly using browser Web Bluetooth (BLE Printers)"
            >
              <Bluetooth className="w-3.5 h-3.5" />
              <span>{isBtPrinting ? 'Printing...' : 'BLE Bluetooth'}</span>
            </button>

            {/* 2. Bluetooth Classic SPP (Android RawBT App Intent) */}
            <a
              href={rawBtUrl}
              className="py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-colors text-center"
              title="For cheap Bluetooth Classic SPP printers (Android RawBT Print Driver)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Classic SPP (RawBT)</span>
            </a>

            {/* 3. Standard Browser System Print */}
            <button
              onClick={handlePrintSystem}
              className="py-2 px-3 rounded-xl bg-[#264653] hover:bg-[#1b313b] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              title="Standard browser print dialog (USB / Windows / System Bluetooth Driver)"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>System Print</span>
            </button>
          </div>

          {/* Bluetooth Status / Protocol Note */}
          {btStatus && (
            <div
              className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                btStatus.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : btStatus.type === 'error'
                  ? 'bg-rose-50 text-rose-800 border border-rose-200'
                  : 'bg-blue-50 text-blue-800 border border-blue-200'
              }`}
            >
              {btStatus.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span className="flex-1">{btStatus.message}</span>
            </div>
          )}

          {!isWebBluetoothSupported() && (
            <div className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-xl border border-amber-200 flex items-start gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Web Bluetooth is available on Chrome/Edge (Android/Desktop). For cheap Bluetooth Classic (SPP) thermal printers on Android, tap <strong>"Classic SPP (RawBT)"</strong>.
              </span>
            </div>
          )}
        </div>

        {/* THERMAL PAPER CONTAINER */}
        <div
          className={`mx-auto bg-white p-4 font-mono text-[11px] text-black border border-dashed border-gray-300 print:border-none leading-relaxed ${
            paperWidth === '58mm' ? 'w-[260px]' : 'w-[320px]'
          }`}
        >
          {/* Header & Store Branch Section */}
          <div className="text-center space-y-1 pb-2 border-b border-dashed border-black">
            <div className="flex items-center justify-center gap-1">
              <PawIcon className="w-4 h-4" />
              <strong className="text-sm font-bold tracking-wider">{settings?.businessName || 'PET WORLD'}</strong>
              <PawIcon className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold uppercase">{sale.branchName} {branch?.code ? `(${branch.code})` : ''}</div>
            <div className="text-[9px] text-gray-700">{branch?.address || settings?.headOfficeAddress || 'Retail Outlets, Mumbai'}</div>
            <div className="text-[9px]">Ph: {branch?.phone || settings?.headOfficePhone || '+91 98200 11111'}</div>
            <div className="text-[9px]">GSTIN: {branch?.gstin || settings?.gstin || '27AABCP1924M1Z5'}</div>
          </div>

          {/* Bill Info Section */}
          <div className="py-2 border-b border-dashed border-black space-y-0.5 text-[10px]">
            <div className="flex justify-between">
              <span>Invoice:</span>
              <strong className="font-mono">{sale.invoiceNumber}</strong>
            </div>
            <div className="flex justify-between">
              <span>Date & Time:</span>
              <span>{sale.date} {sale.time}</span>
            </div>
            <div className="flex justify-between">
              <span>Payment Mode:</span>
              <strong>{sale.paymentMethod}</strong>
            </div>
            {sale.cashReceived ? (
              <div className="flex justify-between text-[9px] text-gray-700">
                <span>Cash Recd / Change:</span>
                <span>{formatINR(sale.cashReceived)} / {formatINR(sale.changeDue)}</span>
              </div>
            ) : null}
          </div>

          {/* Items List */}
          <div className="py-2 border-b border-dashed border-black space-y-1.5">
            {sale.items.map((it, idx) => (
              <div key={idx}>
                <div className="font-semibold truncate">{it.productName}</div>
                <div className="flex justify-between text-[10px] text-gray-800">
                  <span>
                    {it.quantity} x {formatINR(it.unitPrice)}
                  </span>
                  <span>{formatINR(it.totalPrice || it.lineTotal || (it.unitPrice * it.quantity))}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="py-2 border-b border-dashed border-black space-y-1">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatINR(sale.subtotal)}</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span>Tax (GST 18%):</span>
              <span>{formatINR(sale.taxAmount)}</span>
            </div>
            <div className="flex justify-between text-xs font-bold pt-1 border-t border-black">
              <span>GRAND TOTAL:</span>
              <span>{formatINR(sale.grandTotal)}</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span>Paid via {sale.paymentMethod}:</span>
              <span>{formatINR(sale.grandTotal)}</span>
            </div>
          </div>

          {/* Barcode & Footer */}
          <div className="pt-3 text-center space-y-1 text-[9px]">
            {/* Simulated barcode lines */}
            <div className="flex justify-center items-center gap-0.5 h-7 my-1">
              {[1, 2, 1, 3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 2, 1, 2].map((w, i) => (
                <div
                  key={i}
                  className="bg-black h-full"
                  style={{ width: `${w}px` }}
                />
              ))}
            </div>
            <p className="font-mono text-[8px] tracking-widest">{sale.invoiceNumber}</p>
            <p className="mt-1 font-bold">*** THANK YOU ***</p>
            <p>{settings?.receiptFooter || 'Keep your pets healthy & happy! 🐾'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
