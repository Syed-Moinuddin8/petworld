import { Sale, Branch, AppSettings } from '../types.js';

// Standard BLE GATT Thermal Printer / Serial Service UUIDs
const BLE_PRINTER_SERVICES = [
  '000018f0-0000-1000-8000-00805f9b34fb', // Standard Printer Service
  '0000ffe0-0000-1000-8000-00805f9b34fb', // HM-10 / Common BLE Serial
  '0000ff00-0000-1000-8000-00805f9b34fb', // Custom BLE SPP Service
  '49535343-fe7d-4ae5-8fa9-9fafd205e455', // Microchip ISSC Transparent Service
  'e7810a71-73ae-499d-8c15-faa9aef0c3f2', // Nordic UART Service
];

const BLE_PRINTER_CHARACTERISTICS = [
  '00002af1-0000-1000-8000-00805f9b34fb',
  '0000ffe1-0000-1000-8000-00805f9b34fb',
  '0000ff02-0000-1000-8000-00805f9b34fb',
  '49535343-8841-43f4-a540-d69f269b6579',
  'e7810a72-73ae-499d-8c15-faa9aef0c3f2',
];

interface ConnectedBluetoothPrinter {
  device: any;
  gatt: any;
  characteristic: any;
  name: string;
}

let activePrinter: ConnectedBluetoothPrinter | null = null;

// Helper to format currency in INR
function formatINR(val?: number | null, symbol = 'Rs.'): string {
  return symbol + Math.round(Number(val) || 0).toLocaleString('en-IN');
}

/**
 * Encodes bill receipt data into binary ESC/POS commands
 */
export function encodeEscPosReceipt(sale: Sale, paperWidth: '58mm' | '80mm' = '80mm', branch?: Branch, settings?: AppSettings | null): Uint8Array {
  const bytes: number[] = [];

  const add = (...arr: number[]) => bytes.push(...arr);
  const addText = (text: string) => {
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);
      bytes.push(code < 128 ? code : 63); // Fallback non-ASCII to '?'
    }
  };
  const addLine = (text: string = '') => {
    addText(text);
    add(0x0a); // Line feed
  };

  const lineCharWidth = paperWidth === '58mm' ? 32 : 48;

  const padLine = (left: string, right: string) => {
    const spaceCount = Math.max(1, lineCharWidth - left.length - right.length);
    return left + ' '.repeat(spaceCount) + right;
  };

  const centerText = (text: string) => {
    const pad = Math.max(0, Math.floor((lineCharWidth - text.length) / 2));
    return ' '.repeat(pad) + text;
  };

  // 1. ESC @ - Initialize Printer
  add(0x1b, 0x40);

  // 2. Alignment Center (ESC a 1)
  add(0x1b, 0x61, 0x01);

  // Bold & Double Height for Store Header (GS ! 0x11)
  add(0x1d, 0x21, 0x11);
  add(0x1b, 0x45, 0x01); // Bold ON
  addLine(settings?.businessName || 'PET WORLD');

  // Reset Text Size & Bold OFF
  add(0x1d, 0x21, 0x00);
  add(0x1b, 0x45, 0x00);

  addLine(sale.branchName || 'Pet Care & Retail');
  if (branch?.address || settings?.headOfficeAddress) addLine(branch?.address || settings?.headOfficeAddress || '');
  addLine('Ph: ' + (branch?.phone || settings?.headOfficePhone || '+91 98200 11111'));
  addLine('GSTIN: ' + (branch?.gstin || settings?.gstin || '27AABCP1924M1Z5'));
  addLine('-'.repeat(lineCharWidth));

  // 3. Alignment Left (ESC a 0)
  add(0x1b, 0x61, 0x00);
  addLine(padLine('Invoice:', sale.invoiceNumber));
  addLine(padLine('Date:', `${sale.date} ${sale.time}`));
  addLine(padLine('Payment:', sale.paymentMethod || 'CASH'));
  addLine('-'.repeat(lineCharWidth));

  // 4. Line Items Table
  addLine(padLine('ITEM', 'QTY  TOTAL'));
  addLine('-'.repeat(lineCharWidth));

  sale.items.forEach((it) => {
    let name = it.productName;
    if (name.length > lineCharWidth - 14) {
      name = name.substring(0, lineCharWidth - 14);
    }
    const itemTot = it.totalPrice || it.lineTotal || (it.unitPrice * it.quantity);
    const rightCol = `${it.quantity}x ${formatINR(itemTot)}`;
    addLine(padLine(name, rightCol));
  });

  addLine('-'.repeat(lineCharWidth));

  // 5. Totals
  addLine(padLine('Subtotal:', formatINR(sale.subtotal)));
  addLine(padLine('GST Tax (18%):', formatINR(sale.taxAmount)));

  // Double Height / Bold for Grand Total
  add(0x1b, 0x45, 0x01); // Bold ON
  addLine(padLine('GRAND TOTAL:', formatINR(sale.grandTotal)));
  add(0x1b, 0x45, 0x00); // Bold OFF

  addLine('-'.repeat(lineCharWidth));

  // 6. Footer (Center Aligned)
  add(0x1b, 0x61, 0x01);
  addLine('*** THANK YOU FOR SHOPPING ***');
  addLine('Nurturing your pets with care!');
  addLine('Exchange within 7 days with this slip.');
  addLine();

  // 7. Feed 3 lines & Paper Cut (GS V 0)
  add(0x1b, 0x64, 0x03); // Feed 3 lines
  add(0x1d, 0x56, 0x00); // Cut paper

  return new Uint8Array(bytes);
}

/**
 * Checks if Web Bluetooth API is supported in current browser
 */
export function isWebBluetoothSupported(): boolean {
  return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
}

/**
 * Returns current active printer status
 */
export function getActiveBluetoothPrinter(): ConnectedBluetoothPrinter | null {
  return activePrinter;
}

/**
 * Connect to BLE Thermal Printer via Web Bluetooth
 */
export async function connectWebBluetoothPrinter(): Promise<ConnectedBluetoothPrinter> {
  if (!isWebBluetoothSupported()) {
    throw new Error('Web Bluetooth is not supported in this browser. Please use Google Chrome or Edge on Android / Desktop.');
  }

  const navBT = (navigator as any).bluetooth;

  try {
    const device = await navBT.requestDevice({
      filters: [
        { services: BLE_PRINTER_SERVICES },
        { namePrefix: 'Print' },
        { namePrefix: 'POS' },
        { namePrefix: 'Thermal' },
        { namePrefix: 'RP' },
        { namePrefix: 'MTP' },
        { namePrefix: 'InnerPrinter' },
      ],
      optionalServices: BLE_PRINTER_SERVICES,
      acceptAllDevices: false,
    }).catch(async () => {
      // Fallback: prompt for all devices if service filtering doesn't match cheap BLE printers
      return await navBT.requestDevice({
        acceptAllDevices: true,
        optionalServices: BLE_PRINTER_SERVICES,
      });
    });

    if (!device) {
      throw new Error('No Bluetooth printer selected.');
    }

    const gatt = await device.gatt.connect();

    let targetCharacteristic: any = null;

    // Discover services & characteristics
    const services = await gatt.getPrimaryServices().catch(() => []);
    for (const service of services) {
      const characteristics = await service.getCharacteristics().catch(() => []);
      for (const char of characteristics) {
        if (char.properties.write || char.properties.writeWithoutResponse) {
          targetCharacteristic = char;
          break;
        }
      }
      if (targetCharacteristic) break;
    }

    if (!targetCharacteristic) {
      throw new Error(`Connected to "${device.name || 'Bluetooth Device'}", but could not find an ESC/POS writable GATT characteristic.`);
    }

    activePrinter = {
      device,
      gatt,
      characteristic: targetCharacteristic,
      name: device.name || 'BLE Thermal Printer',
    };

    return activePrinter;
  } catch (err: any) {
    activePrinter = null;
    throw err;
  }
}

/**
 * Disconnect current active Web Bluetooth printer
 */
export async function disconnectWebBluetoothPrinter(): Promise<void> {
  if (activePrinter?.gatt && activePrinter.gatt.connected) {
    try {
      activePrinter.gatt.disconnect();
    } catch {
      // ignore
    }
  }
  activePrinter = null;
}

/**
 * Send ESC/POS receipt directly via Web Bluetooth
 */
export async function printViaWebBluetooth(
  sale: Sale,
  paperWidth: '58mm' | '80mm' = '80mm',
  branch?: Branch
): Promise<{ success: boolean; message: string }> {
  try {
    let printer = activePrinter;
    if (!printer || !printer.gatt || !printer.gatt.connected) {
      printer = await connectWebBluetoothPrinter();
    }

    const rawBytes = encodeEscPosReceipt(sale, paperWidth, branch);

    // Chunk bytes into 100-byte packets for BLE GATT MTU compliance
    const chunkSize = 100;
    for (let i = 0; i < rawBytes.length; i += chunkSize) {
      const chunk = rawBytes.slice(i, i + chunkSize);
      if (printer.characteristic.properties.writeWithoutResponse) {
        await printer.characteristic.writeValueWithoutResponse(chunk);
      } else {
        await printer.characteristic.writeValue(chunk);
      }
      // Brief 20ms pause between BLE packets
      await new Promise((resolve) => setTimeout(resolve, 20));
    }

    return {
      success: true,
      message: `✅ Printed receipt for Invoice #${sale.invoiceNumber} on ${printer.name}!`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Failed to print via Web Bluetooth.',
    };
  }
}

/**
 * Generates RawBT (Bluetooth Classic / SPP) Android intent URL for cheap Classic SPP thermal printers
 */
export function generateRawBTIntentUrl(sale: Sale, paperWidth: '58mm' | '80mm' = '80mm', branch?: Branch): string {
  const rawBytes = encodeEscPosReceipt(sale, paperWidth, branch);
  
  // Base64 encode ESC/POS binary data for RawBT app
  let binaryString = '';
  for (let i = 0; i < rawBytes.length; i++) {
    binaryString += String.fromCharCode(rawBytes[i]);
  }
  const base64Data = typeof btoa !== 'undefined' ? btoa(binaryString) : '';

  // Android RawBT intent format for Bluetooth Classic SPP thermal printers
  return `intent:base64,${base64Data}#Intent;scheme=rawbt;package=ru.a404m.rawbtprinter;end;`;
}
