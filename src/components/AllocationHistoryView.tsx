import React, { useState, useMemo } from 'react';
import {
  GitFork,
  Search,
  Filter,
  Calendar,
  Building2,
  Package,
  User as UserIcon,
  FileText,
  FileCheck2,
  Printer,
  ChevronRight,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Plus,
  CheckCircle2,
  Store,
  Trash2,
  FileSpreadsheet,
} from 'lucide-react';
import { PurchaseAllocationRecord, Branch, Product, User } from '../types.js';
import { PetAvatar, PawIcon, PetEmptyState } from './PetAvatars.js';
import { exportToExcel } from '../utils/exportUtils.js';

interface AllocationHistoryViewProps {
  allocations: PurchaseAllocationRecord[];
  branches: Branch[];
  products: Product[];
  currentUser: User;
  onNavigateTab: (tab: any) => void;
  onRefresh?: () => void;
  onDeleteAllocation?: (allocationId: string) => Promise<any> | void;
}

export const AllocationHistoryView: React.FC<AllocationHistoryViewProps> = ({
  allocations = [],
  branches = [],
  products = [],
  currentUser,
  onNavigateTab,
  onRefresh,
  onDeleteAllocation,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('ALL');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('ALL');
  const [selectedRecordForModal, setSelectedRecordForModal] = useState<PurchaseAllocationRecord | null>(null);

  // Filter records
  const filteredRecords = useMemo(() => {
    return allocations.filter((rec) => {
      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesProduct = rec.productName?.toLowerCase().includes(query);
        const matchesSku = rec.sku?.toLowerCase().includes(query);
        const matchesPo = rec.purchaseNumber?.toLowerCase().includes(query);
        const matchesUser = rec.allocatedBy?.toLowerCase().includes(query);
        const matchesNotes = rec.notes?.toLowerCase().includes(query);
        const matchesBranch = rec.allocations?.some((a) =>
          a.branchName?.toLowerCase().includes(query)
        );
        if (
          !matchesProduct &&
          !matchesSku &&
          !matchesPo &&
          !matchesUser &&
          !matchesNotes &&
          !matchesBranch
        ) {
          return false;
        }
      }

      // Branch filter
      if (selectedBranchId !== 'ALL') {
        const hasBranch = rec.allocations?.some(
          (a) => a.branchId === selectedBranchId && (a.allocatedQuantity || 0) > 0
        );
        if (!hasBranch) return false;
      }

      // Date filter
      if (selectedDateFilter !== 'ALL' && rec.date) {
        const today = new Date().toISOString().split('T')[0];
        if (selectedDateFilter === 'TODAY' && rec.date !== today) {
          return false;
        }
      }

      return true;
    });
  }, [allocations, searchTerm, selectedBranchId, selectedDateFilter]);

  // Aggregate stats
  const totalUnitsDispatched = useMemo(() => {
    return allocations.reduce((sum, rec) => {
      const recTotal = rec.allocations?.reduce(
        (acc, curr) => acc + (Number(curr.allocatedQuantity) || 0),
        0
      ) || 0;
      return sum + recTotal;
    }, 0);
  }, [allocations]);

  const uniqueBranchesReached = useMemo(() => {
    const set = new Set<string>();
    allocations.forEach((rec) => {
      rec.allocations?.forEach((a) => {
        if ((a.allocatedQuantity || 0) > 0) set.add(a.branchId);
      });
    });
    return set.size;
  }, [allocations]);

  const handleExportAllocations = () => {
    exportToExcel({
      filename: `Stock_Allocation_History_${new Date().toISOString().slice(0, 10)}`,
      title: 'PET WORLD - STOCK ALLOCATION & DISPATCH LOG',
      subtitle: `Total Allocations: ${filteredRecords.length} | Units Dispatched: ${totalUnitsDispatched}`,
      headers: ['Product Name', 'SKU', 'Purchase Ref #', 'Allocated Date', 'Time', 'Allocated By', 'Total Units Dispatched', 'Notes'],
      rows: filteredRecords.map((rec) => [
        rec.productName,
        rec.sku,
        rec.purchaseNumber,
        rec.date,
        rec.time,
        rec.allocatedBy,
        rec.allocations?.reduce((sum, a) => sum + (Number(a.allocatedQuantity) || 0), 0) || 0,
        rec.notes || '—',
      ]),
    });
  };

  const handleDeleteAllocationItem = async (allocationId: string, productName: string) => {
    if (confirm(`Are you sure you want to delete the stock allocation record for ${productName}?`)) {
      if (onDeleteAllocation) {
        await onDeleteAllocation(allocationId);
        if (onRefresh) onRefresh();
      }
    }
  };

  const handleDeleteAllFilteredAllocations = async () => {
    if (filteredRecords.length === 0) return;
    if (confirm(`WARNING: Are you sure you want to permanently delete ALL ${filteredRecords.length} filtered stock allocation records? This action cannot be undone.`)) {
      if (onDeleteAllocation) {
        for (const a of filteredRecords) {
          await onDeleteAllocation(a.id);
        }
        if (onRefresh) onRefresh();
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#EADDCE] shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E76F51]/10 text-[#E76F51] text-xs font-bold mb-2">
            <GitFork className="w-3.5 h-3.5" />
            <span>Central Warehouse & Procurement Logistics</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-[#264653] font-['Fredoka',sans-serif]">
            Stock Allocation Records & History
          </h1>
          <p className="text-xs text-[#7C9082]">
            Detailed audit log of master purchase consignments divided and dispatched across retail branches
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2.5 rounded-2xl border border-[#EADDCE] text-[#5B7065] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
              title="Refresh Records"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={handleExportAllocations}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-white border border-[#EADDCE] hover:bg-[#FAF8F5] text-xs font-bold text-[#264653] shadow-xs transition-colors cursor-pointer"
            title="Export to Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#2E7D32]" />
            <span>Export Excel</span>
          </button>

          {currentUser.role === 'OWNER' && filteredRecords.length > 0 && (
            <button
              onClick={handleDeleteAllFilteredAllocations}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs font-bold text-rose-700 shadow-xs transition-colors cursor-pointer"
              title="Delete all currently filtered allocation records in one click"
            >
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span>Delete Filtered ({filteredRecords.length})</span>
            </button>
          )}

          <button
            onClick={() => onNavigateTab('allocation')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#E76F51] text-white text-xs font-bold shadow-md hover:bg-[#D45D40] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Stock Allocation</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 bg-white rounded-2xl border border-[#EADDCE] flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7C9082]" />
          <input
            type="text"
            placeholder="Search by product, SKU, PO ref, branch, notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#FAF8F5] border border-[#EADDCE] text-xs focus:outline-hidden focus:border-[#E76F51]"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-[#7C9082] shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span className="font-semibold">Branch:</span>
          </div>
          <select
            value={selectedBranchId}
            onChange={(e) => setSelectedBranchId(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#EADDCE] text-xs text-[#264653] font-medium focus:outline-hidden focus:border-[#E76F51]"
          >
            <option value="ALL">All 6 Branches</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          <select
            value={selectedDateFilter}
            onChange={(e) => setSelectedDateFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#EADDCE] text-xs text-[#264653] font-medium focus:outline-hidden focus:border-[#E76F51]"
          >
            <option value="ALL">All Dates</option>
            <option value="TODAY">Today Only</option>
          </select>
        </div>
      </div>

      {/* Allocation List */}
      {filteredRecords.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-[#EADDCE]">
          <PetEmptyState
            title="No Allocation Records Found"
            description={
              searchTerm || selectedBranchId !== 'ALL'
                ? 'Try adjusting your search criteria or branch filters.'
                : 'No central stock allocations have been logged yet.'
            }
            actionText="Create First Allocation"
            onAction={() => onNavigateTab('allocation')}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRecords.map((rec) => {
            const prod = products.find((p) => p.id === rec.productId);
            const totalAllocated = rec.allocations?.reduce(
              (acc, curr) => acc + (Number(curr.allocatedQuantity) || 0),
              0
            ) || 0;

            return (
              <div
                key={rec.id}
                className="p-5 bg-white rounded-3xl border border-[#EADDCE] hover:border-[#E76F51] transition-all shadow-xs space-y-4"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F2ECE4]">
                  <div className="flex items-center gap-3">
                    <PetAvatar type={prod?.avatarType || 'dog'} size="sm" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#264653]">
                          {rec.productName}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-[#FAF8F5] border border-[#EADDCE] text-[10px] font-mono text-[#7C9082]">
                          SKU: {rec.sku}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#7C9082] mt-0.5">
                        <span className="inline-flex items-center gap-1 font-semibold text-[#E76F51]">
                          <FileText className="w-3 h-3" />
                          Ref: {rec.purchaseNumber}
                        </span>
                        <span>•</span>
                        <span>{rec.date} at {rec.time}</span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1">
                          <UserIcon className="w-3 h-3" />
                          By: {rec.allocatedBy}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-[#7C9082] block">
                        Batch Total
                      </span>
                      <span className="text-base font-extrabold text-[#2A9D8F]">
                        {totalAllocated} Units
                      </span>
                    </div>

                    <button
                      onClick={() => setSelectedRecordForModal(rec)}
                      className="px-3 py-1.5 rounded-xl border border-[#EADDCE] bg-[#FAF8F5] text-xs font-bold text-[#264653] hover:bg-white hover:border-[#E76F51] transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Slip Details</span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#7C9082]" />
                    </button>

                    <button
                      onClick={() => handleDeleteAllocationItem(rec.id, rec.productName)}
                      className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                      title="Delete Allocation Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 6-Branch Allocation Breakdown Grid */}
                <div>
                  <div className="text-[11px] font-extrabold text-[#5B7065] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <Store className="w-3.5 h-3.5 text-[#E76F51]" />
                    <span>Store Breakdown & Stock Movements</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                    {rec.allocations && rec.allocations.length > 0 ? (
                      rec.allocations.map((item) => {
                        const hasStock = (item.allocatedQuantity || 0) > 0;
                        return (
                          <div
                            key={item.branchId}
                            className={`p-2.5 rounded-2xl border text-xs flex flex-col justify-between transition-all ${
                              hasStock
                                ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                                : 'bg-[#FAF8F5] border-[#EADDCE]/70 text-[#7C9082] opacity-75'
                            }`}
                          >
                            <div>
                              <span className="font-bold text-[11px] line-clamp-1 block" title={item.branchName}>
                                {item.branchName}
                              </span>
                              <div className="mt-1 flex items-baseline justify-between gap-1">
                                <span className={`text-base font-black ${hasStock ? 'text-emerald-700' : 'text-[#7C9082]'}`}>
                                  +{item.allocatedQuantity || 0}
                                </span>
                                <span className="text-[10px] font-bold text-[#7C9082]">
                                  units
                                </span>
                              </div>
                            </div>

                            {item.previousStock !== undefined && item.newStock !== undefined && (
                              <div className="mt-2 pt-1.5 border-t border-black/5 text-[10px] flex items-center justify-between text-[#5B7065]">
                                <span>Bal:</span>
                                <span className="font-mono font-bold">
                                  {item.previousStock} → {item.newStock}
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="col-span-full text-xs text-[#7C9082] italic">
                        No store breakdown available for this record.
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes footer */}
                {rec.notes && (
                  <div className="p-3 rounded-2xl bg-[#FAF8F5] text-xs text-[#5B7065] flex items-start gap-2">
                    <span className="font-bold text-[#264653] shrink-0">Notes:</span>
                    <span>{rec.notes}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Allocation Delivery Slip / Detail Modal */}
      {selectedRecordForModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 border border-[#EADDCE] shadow-2xl space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#F2ECE4] pb-4">
              <div>
                <div className="inline-flex items-center gap-1 text-[11px] font-bold text-[#E76F51] uppercase tracking-wider mb-1">
                  <PawIcon className="w-3.5 h-3.5" />
                  <span>Central Distribution Dispatch Note</span>
                </div>
                <h3 className="text-xl font-bold text-[#264653] font-['Fredoka',sans-serif]">
                  Allocation Slip #{selectedRecordForModal.id}
                </h3>
                <p className="text-xs text-[#7C9082]">
                  Purchase Reference: {selectedRecordForModal.purchaseNumber} • Generated on {selectedRecordForModal.date} at {selectedRecordForModal.time}
                </p>
              </div>
              <button
                onClick={() => setSelectedRecordForModal(null)}
                className="p-2 rounded-full hover:bg-[#FAF8F5] text-[#7C9082] transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Product Summary */}
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EADDCE] flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold text-[#7C9082] uppercase tracking-wider block">
                  Allocated Product
                </span>
                <span className="font-bold text-sm text-[#264653]">
                  {selectedRecordForModal.productName}
                </span>
                <div className="text-xs text-[#7C9082] font-mono mt-0.5">
                  SKU: {selectedRecordForModal.sku}
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold text-[#7C9082] uppercase tracking-wider block">
                  Total Dispatched
                </span>
                <span className="text-xl font-black text-[#2A9D8F]">
                  {selectedRecordForModal.allocations?.reduce(
                    (acc, curr) => acc + (Number(curr.allocatedQuantity) || 0),
                    0
                  )}{' '}
                  Units
                </span>
              </div>
            </div>

            {/* Detailed Stores Table */}
            <div>
              <h4 className="text-xs font-bold text-[#264653] uppercase tracking-wider mb-2">
                Store-by-Store Dispatch Breakdown
              </h4>
              <div className="rounded-2xl border border-[#EADDCE] overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#FAF8F5] text-[#5B7065] font-bold uppercase text-[10px] border-b border-[#EADDCE]">
                    <tr>
                      <th className="py-2.5 px-3">Branch Location</th>
                      <th className="py-2.5 px-3 text-right">Pre-Stock</th>
                      <th className="py-2.5 px-3 text-right">Allocated Quantity</th>
                      <th className="py-2.5 px-3 text-right">Post-Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F2ECE4]">
                    {selectedRecordForModal.allocations?.map((item) => (
                      <tr key={item.branchId} className="hover:bg-[#FAF8F5]/50">
                        <td className="py-2.5 px-3 font-semibold text-[#264653]">
                          {item.branchName}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-[#7C9082]">
                          {item.previousStock ?? '—'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-emerald-700">
                          +{item.allocatedQuantity || 0}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-[#264653]">
                          {item.newStock ?? '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Authorization & Signature Bar */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-[#FAF8F5] border border-[#EADDCE] text-xs">
              <div>
                <span className="text-[10px] font-bold text-[#7C9082] uppercase block">
                  Authorized Allocator
                </span>
                <span className="font-bold text-[#264653]">
                  {selectedRecordForModal.allocatedBy}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-[#7C9082] uppercase block">
                  Status
                </span>
                <span className="font-bold text-emerald-700 flex items-center justify-end gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Confirmed & Dispatched
                </span>
              </div>
            </div>

            {selectedRecordForModal.notes && (
              <div className="text-xs text-[#5B7065] italic">
                Note: {selectedRecordForModal.notes}
              </div>
            )}

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-[#F2ECE4]">
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 rounded-xl border border-[#EADDCE] text-xs font-bold text-[#264653] hover:bg-[#FAF8F5] flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5 text-[#E76F51]" />
                <span>Print Dispatch Note</span>
              </button>

              <button
                onClick={() => setSelectedRecordForModal(null)}
                className="px-5 py-2 rounded-xl bg-[#264653] text-white text-xs font-bold hover:bg-[#1f3742] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
