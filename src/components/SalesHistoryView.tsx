import React, { useState } from 'react';
import {
  CircleDollarSign,
  Search,
  Printer,
  Ban,
  Filter,
  Receipt,
  AlertTriangle,
  Building2,
  Calendar,
  Eye,
  CheckCircle2,
  Trash2,
  FileSpreadsheet,
} from 'lucide-react';
import { Sale, Branch, User } from '../types.js';
import { PawIcon, PetEmptyState } from './PetAvatars.js';
import { exportToExcel } from '../utils/exportUtils.js';

interface SalesHistoryViewProps {
  sales: Sale[];
  branches: Branch[];
  currentUser: User;
  onCancelSale: (saleId: string, reason: string) => Promise<any>;
  onDeleteSale?: (saleId: string) => Promise<any> | void;
  onPrintInvoice: (sale: Sale) => void;
  onPrintThermal: (sale: Sale) => void;
}

export const SalesHistoryView: React.FC<SalesHistoryViewProps> = ({
  sales,
  branches,
  currentUser,
  onCancelSale,
  onDeleteSale,
  onPrintInvoice,
  onPrintThermal,
}) => {
  const isOwner = currentUser.role === 'OWNER';
  const defaultBranch = !isOwner && currentUser.branchId ? currentUser.branchId : 'ALL';

  const [selectedBranch, setSelectedBranch] = useState(defaultBranch);
  const [searchQuery, setSearchQuery] = useState('');
  const [cancellingSale, setCancellingSale] = useState<Sale | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [inspectSale, setInspectSale] = useState<Sale | null>(null);

  const filteredSales = sales.filter((s) => {
    if (selectedBranch !== 'ALL' && s.branchId !== selectedBranch) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        s.invoiceNumber.toLowerCase().includes(q) ||
        (s.customerName && s.customerName.toLowerCase().includes(q)) ||
        (s.customerPhone && s.customerPhone.includes(q)) ||
        s.staffName.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const handleExportSales = () => {
    exportToExcel({
      filename: `Sales_Report_${new Date().toISOString().slice(0, 10)}`,
      title: 'PET WORLD BILLING - SALES TRANSACTIONS REPORT',
      subtitle: `Filtered Branch: ${selectedBranch} | Total Transactions: ${filteredSales.length}`,
      headers: ['Invoice #', 'Date', 'Time', 'Branch', 'Cashier', 'Item Count', 'Grand Total (₹)', 'Payment Method', 'Status'],
      rows: filteredSales.map((s) => [
        s.invoiceNumber,
        s.date,
        s.time,
        s.branchName,
        s.staffName,
        s.items.reduce((sum, it) => sum + it.quantity, 0),
        s.grandTotal,
        s.paymentMethod,
        s.status,
      ]),
    });
  };

  const handleDeleteSaleItem = async (saleId: string, invoiceNumber: string) => {
    if (confirm(`Are you sure you want to permanently delete sale invoice ${invoiceNumber}?`)) {
      if (onDeleteSale) {
        await onDeleteSale(saleId);
      }
    }
  };

  const handleDeleteAllFilteredSales = async () => {
    if (filteredSales.length === 0) return;
    if (confirm(`WARNING: Are you sure you want to permanently delete ALL ${filteredSales.length} filtered sales records? This action cannot be undone.`)) {
      if (onDeleteSale) {
        for (const s of filteredSales) {
          await onDeleteSale(s.id);
        }
      }
    }
  };

  const handleConfirmCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancellingSale || !cancelReason.trim()) return;
    setLoading(true);
    try {
      await onCancelSale(cancellingSale.id, cancelReason.trim());
      setCancellingSale(null);
      setCancelReason('');
    } catch (err: any) {
      alert('Failed to cancel sale: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatINR = (val?: number | null) =>
    '₹' + Math.round(Number(val) || 0).toLocaleString('en-IN');

  const totalRevenue = filteredSales
    .filter((s) => s.status !== 'CANCELLED')
    .reduce((sum, s) => sum + (Number(s.grandTotal) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E76F51]/10 text-[#E76F51] text-xs font-bold mb-1">
            <PawIcon className="w-3.5 h-3.5" />
            <span>Store Counter Transactions</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-[#264653] font-['Fredoka',sans-serif]">
            Sales History & Receipts
          </h1>
          <p className="text-xs text-[#7C9082]">
            Total Invoices: {filteredSales.length} • Total Active Revenue:{' '}
            <strong className="text-[#264653]">{formatINR(totalRevenue)}</strong>
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-3xl bg-white border border-[#EADDCE] shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Branch Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#5B7065]">Branch:</span>
          {isOwner ? (
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-[#D5C7B8] bg-[#FAF8F5] text-xs font-semibold focus:ring-2 focus:ring-[#E76F51] focus:outline-hidden"
            >
              <option value="ALL">All 6 Branches</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
          ) : (
            <span className="px-3 py-1.5 rounded-xl bg-[#FAF1E8] text-[#E76F51] font-bold text-xs">
              {branches.find((b) => b.id === currentUser.branchId)?.name}
            </span>
          )}
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#7C9082]" />
          <input
            type="text"
            placeholder="Search invoice #, branch, or cashier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-[#D5C7B8] bg-[#FAF8F5] text-xs focus:ring-2 focus:ring-[#E76F51] focus:outline-hidden"
          />
        </div>

        {/* Export Button */}
        <button
          onClick={handleExportSales}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#D5C7B8] hover:bg-[#FAF8F5] text-xs font-bold text-[#264653] shadow-2xs transition-colors cursor-pointer"
          title="Export sales data to Excel"
        >
          <FileSpreadsheet className="w-4 h-4 text-[#2E7D32]" />
          <span>Export Excel</span>
        </button>

        {/* Delete All Filtered Sales Button */}
        {isOwner && filteredSales.length > 0 && (
          <button
            onClick={handleDeleteAllFilteredSales}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-xs font-bold text-red-700 shadow-2xs transition-colors cursor-pointer"
            title="Delete all currently filtered sales records in one click"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
            <span>Delete Filtered ({filteredSales.length})</span>
          </button>
        )}
      </div>

      {/* Sales Table */}
      <div className="rounded-3xl bg-white border border-[#EADDCE] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#264653]">
            <thead className="bg-[#FAF8F5] border-b border-[#EADDCE] text-[11px] font-extrabold uppercase tracking-wider text-[#7C9082]">
              <tr>
                <th className="px-4 py-3">Invoice #</th>
                <th className="px-4 py-3">Date & Time</th>
                <th className="px-4 py-3">Branch & Cashier</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3 text-right">Grand Total</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2ECE4]">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12">
                    <PetEmptyState
                      title="No sales transactions found"
                      description="Process sales at the POS counter to generate records."
                      avatar="dog"
                    />
                  </td>
                </tr>
              ) : (
                filteredSales.map((s) => (
                  <tr
                    key={s.id}
                    className={`hover:bg-[#FAF8F5] transition-colors ${
                      s.status === 'CANCELLED' ? 'opacity-60 bg-red-50/30' : ''
                    }`}
                  >
                    <td className="px-4 py-3 font-mono font-bold text-xs text-[#264653]">
                      {s.invoiceNumber}
                    </td>
                    <td className="px-4 py-3 text-[#5B7065]">
                      <span>{s.date}</span>
                      <span className="block text-[10px] text-[#8C9B90]">{s.time}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-[#264653] block">{s.branchName}</span>
                      <span className="text-[10px] text-[#7C9082]">Cashier: {s.staffName}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-[#264653]">
                        {s.items.reduce((sum, it) => sum + it.quantity, 0)} items
                      </span>
                      <span className="block text-[10px] text-[#7C9082] truncate max-w-[150px]">
                        {s.items.map((i) => i.productName).join(', ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-extrabold text-sm text-[#264653]">
                      {formatINR(s.grandTotal)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          s.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setInspectSale(s)}
                          className="p-1.5 rounded-lg text-[#5B7065] hover:bg-[#F2ECE4]"
                          title="Inspect Items"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onPrintThermal(s)}
                          className="p-1.5 rounded-lg text-[#264653] hover:bg-[#F2ECE4]"
                          title="Print Thermal Receipt"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onPrintInvoice(s)}
                          className="p-1.5 rounded-lg text-[#E76F51] hover:bg-[#FAF1E8]"
                          title="Print Tax Invoice (A4)"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        {s.status !== 'CANCELLED' && isOwner && (
                          <button
                            onClick={() => setCancellingSale(s)}
                            className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50"
                            title="Cancel Sale & Restore Stock"
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {isOwner && (
                          <button
                            onClick={() => handleDeleteSaleItem(s.id, s.invoiceNumber)}
                            className="p-1.5 rounded-lg text-red-600 hover:bg-red-50"
                            title="Permanently Delete Sale Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* INSPECT ITEMS MODAL */}
      {inspectSale && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl border border-[#EADDCE] shadow-2xl p-6 text-[#264653] animate-in fade-in">
            <h3 className="font-['Fredoka',sans-serif] text-base font-bold mb-1">
              Invoice #{inspectSale.invoiceNumber}
            </h3>
            <p className="text-xs text-[#7C9082] mb-3">
              {inspectSale.branchName} • {inspectSale.date}
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {inspectSale.items.map((it, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EADDCE] flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-[#264653] block">{it.productName}</span>
                    <span className="text-[10px] text-[#7C9082]">
                      {it.quantity} x {formatINR(it.unitPrice)}
                    </span>
                  </div>
                  <span className="font-extrabold text-[#264653]">
                    {formatINR(it.totalPrice || it.lineTotal || (it.unitPrice * it.quantity))}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-[#F2ECE4] flex items-center justify-between font-bold text-sm">
              <span>Grand Total:</span>
              <span className="text-[#E76F51]">{formatINR(inspectSale.grandTotal)}</span>
            </div>

            <button
              onClick={() => setInspectSale(null)}
              className="mt-4 w-full py-2 rounded-xl bg-[#F2ECE4] text-xs font-bold text-[#5B7065]"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* CANCEL SALE MODAL */}
      {cancellingSale && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl border border-red-200 shadow-2xl p-6 text-[#264653] animate-in fade-in">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-['Fredoka',sans-serif] text-base font-bold">
                Cancel Sale #{cancellingSale.invoiceNumber}
              </h3>
            </div>

            <p className="text-xs text-[#5B7065] mb-4">
              Cancelling will reverse this transaction, automatically restore all item quantities back to{' '}
              <strong className="text-[#264653]">{cancellingSale.branchName}</strong> inventory, and log a permanent audit trail entry.
            </p>

            <form onSubmit={handleConfirmCancel} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Mandatory Cancellation Reason *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Customer returned items, wrong barcode scanned..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#D5C7B8] focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F2ECE4]">
                <button
                  type="button"
                  onClick={() => setCancellingSale(null)}
                  className="px-4 py-2 rounded-xl font-bold text-[#7C9082] hover:bg-[#F2ECE4]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-xl font-bold bg-red-600 hover:bg-red-700 text-white shadow-xs"
                >
                  {loading ? 'Reversing...' : 'Confirm Cancellation & Restore Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
