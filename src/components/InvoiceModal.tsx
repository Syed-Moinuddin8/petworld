import React from 'react';
import { X, Printer, Download, Share2, Building2, FileText, MapPin, Phone, User, Mail } from 'lucide-react';
import { Sale, Branch, AppSettings } from '../types.js';
import { PawIcon } from './PetAvatars.js';

interface InvoiceModalProps {
  sale: Sale | null;
  onClose: () => void;
  branch?: Branch;
  settings?: AppSettings | null;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ sale, onClose, branch, settings }) => {
  if (!sale) return null;

  const handlePrint = () => {
    window.print();
  };

  const formatINR = (val?: number | null) =>
    (settings?.currencySymbol || '₹') + Math.round(Number(val) || 0).toLocaleString('en-IN');

  const halfTax = Math.round((sale?.taxAmount || 0) / 2);
  const companyName = settings?.businessName || 'PET WORLD';
  const gstin = branch?.gstin || settings?.gstin || '27AABCP1924M1Z5';
  const footerMsg = settings?.receiptFooter || 'Thank you for nurturing your pet with Pet World! 🐾';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 print:p-0 print:bg-white">
      <div className="w-full max-w-2xl bg-white rounded-3xl border border-[#EADDCE] shadow-2xl p-6 md:p-8 text-[#264653] max-h-[90vh] overflow-y-auto print:max-h-none print:shadow-none print:border-none print:rounded-none">
        {/* Modal Controls (Hidden in Print) */}
        <div className="flex items-center justify-between pb-4 border-b border-[#F2ECE4] mb-6 print:hidden">
          <span className="text-xs font-bold uppercase tracking-wider text-[#7C9082]">
            Tax Invoice Preview (A4 Format)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E76F51] hover:bg-[#D95D3E] text-white text-xs font-bold shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-[#7C9082] hover:bg-[#F2ECE4]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* INVOICE CONTENT */}
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#E76F51] text-white flex items-center justify-center shadow-md">
                <PawIcon className="w-8 h-8" />
              </div>
              <div>
                <h1 className="font-['Fredoka',sans-serif] text-2xl font-bold text-[#264653]">
                  {companyName}
                </h1>
                <p className="text-xs text-[#5B7065]">{settings?.tagline || 'Premium Pet Care & Retail Chain'}</p>
                <p className="text-[10px] text-[#7C9082]">Company GSTIN: {gstin}</p>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block px-2 py-0.5 rounded bg-[#FAF1E8] text-[#E76F51] text-xs font-extrabold">
                TAX INVOICE
              </span>
              <div className="text-sm font-bold text-[#264653] mt-1 font-mono">
                {sale.invoiceNumber}
              </div>
              <div className="text-xs text-[#7C9082] mt-0.5">
                Date: {sale.date} • {sale.time}
              </div>
            </div>
          </div>

          {/* Store Branch & Bill Information Panel */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 md:p-5 rounded-2xl bg-[#FAF8F5] border border-[#EADDCE] text-xs">
            {/* Store Branch Section */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#E76F51]" />
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#E76F51]">
                  Billed Store Branch
                </span>
                {branch?.code && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#E76F51]/10 text-[#E76F51] font-extrabold">
                    {branch.code}
                  </span>
                )}
              </div>
              <p className="font-bold text-[#264653] text-sm font-['Fredoka',sans-serif]">{sale.branchName}</p>
              <p className="text-[#5B7065] text-[11px] leading-tight">
                {branch?.address || 'Store Location'}, {branch?.city || 'Mumbai'}
              </p>
              {branch?.phone && (
                <p className="text-[#7C9082] text-[11px]">
                  Phone: <span className="font-semibold text-[#264653]">{branch.phone}</span>
                </p>
              )}
              {branch?.email && (
                <p className="text-[#7C9082] text-[11px]">
                  Email: <span className="font-semibold text-[#264653]">{branch.email}</span>
                </p>
              )}
              {gstin && (
                <p className="text-[#7C9082] text-[11px]">
                  GSTIN: <span className="font-semibold text-[#264653] font-mono">{gstin}</span>
                </p>
              )}
            </div>

            {/* Bill Details Section */}
            <div className="space-y-1 sm:border-l sm:border-[#EADDCE] sm:pl-4">
              <div className="flex items-center gap-1.5 mb-1.5">
                <FileText className="w-3.5 h-3.5 text-[#2A9D8F]" />
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#2A9D8F]">
                  Bill Information
                </span>
              </div>
              <p className="text-[11px] text-[#7C9082]">
                Invoice Number: <strong className="font-mono text-[#264653] text-xs">{sale.invoiceNumber}</strong>
              </p>
              <p className="text-[11px] text-[#7C9082]">
                Date & Time: <span className="font-semibold text-[#264653]">{sale.date} • {sale.time}</span>
              </p>
              <p className="text-[11px] text-[#7C9082]">
                Payment Mode: <strong className="text-[#E76F51]">{sale.paymentMethod}</strong>
              </p>
              {sale.cashReceived ? (
                <p className="text-[10px] text-[#5B7065]">
                  Cash Recd: {formatINR(sale.cashReceived)} • Change: {formatINR(sale.changeDue)}
                </p>
              ) : null}
            </div>
          </div>

          {/* Line Items Table */}
          <table className="w-full text-left text-xs border border-[#EADDCE] rounded-xl overflow-hidden">
            <thead className="bg-[#FAF8F5] text-[11px] font-bold text-[#7C9082] border-b border-[#EADDCE]">
              <tr>
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">Product Description</th>
                <th className="px-3 py-2">SKU</th>
                <th className="px-3 py-2 text-center">Qty</th>
                <th className="px-3 py-2 text-right">Unit Rate</th>
                <th className="px-3 py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2ECE4]">
              {sale.items.map((it, idx) => (
                <tr key={idx}>
                  <td className="px-3 py-2 text-[#7C9082]">{idx + 1}</td>
                  <td className="px-3 py-2 font-bold text-[#264653]">{it.productName}</td>
                  <td className="px-3 py-2 font-mono text-[11px] text-[#7C9082]">{it.sku}</td>
                  <td className="px-3 py-2 text-center font-bold">{it.quantity}</td>
                  <td className="px-3 py-2 text-right text-[#5B7065]">{formatINR(it.unitPrice)}</td>
                  <td className="px-3 py-2 text-right font-bold text-[#264653]">
                    {formatINR(it.totalPrice || it.lineTotal || (it.unitPrice * it.quantity))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals & Tax Breakdown */}
          <div className="flex justify-end">
            <div className="w-64 space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-[#5B7065]">
                <span>Taxable Subtotal:</span>
                <span className="font-semibold text-[#264653]">{formatINR(sale.subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-[#7C9082] text-[11px]">
                <span>CGST (9%):</span>
                <span>{formatINR(halfTax)}</span>
              </div>
              <div className="flex items-center justify-between text-[#7C9082] text-[11px]">
                <span>SGST (9%):</span>
                <span>{formatINR(halfTax)}</span>
              </div>
              <div className="flex items-center justify-between text-base font-bold text-[#264653] pt-2 border-t border-[#EADDCE] font-['Fredoka',sans-serif]">
                <span>Grand Total:</span>
                <span className="text-[#E76F51]">{formatINR(sale.grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Footer Terms */}
          <div className="pt-6 border-t border-[#F2ECE4] text-[10px] text-[#7C9082] flex items-center justify-between">
            <div>
              <p>1. Goods once sold can be exchanged within 7 days with original tax invoice.</p>
              <p>2. Keep vaccines, frozen raw diets and open food packs in recommended climate.</p>
              <p className="mt-1 font-semibold text-[#5B7065]">
                {footerMsg}
              </p>
            </div>
            <div className="text-right">
              <div className="h-10 border-b border-[#D5C7B8] w-28 mb-1" />
              <span>Authorized Signatory</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
