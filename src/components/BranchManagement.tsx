import React, { useState } from 'react';
import { Store, Phone, Mail, MapPin, User, Calendar, Edit3, ArrowUpRight, CheckCircle2, Shield } from 'lucide-react';
import { Branch } from '../types.js';
import { PawIcon } from './PetAvatars.js';

interface BranchManagementProps {
  branches: Branch[];
  onUpdateBranch: (branchId: string, updates: Partial<Branch>) => Promise<any>;
  onSelectBranchPos?: (branchId: string) => void;
  onViewBranchInventory?: (branchId: string) => void;
}

export const BranchManagement: React.FC<BranchManagementProps> = ({
  branches,
  onUpdateBranch,
  onSelectBranchPos,
  onViewBranchInventory,
}) => {
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [formData, setFormData] = useState<Partial<Branch>>({});
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleOpenEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setFormData({
      name: branch.name,
      address: branch.address,
      city: branch.city,
      phone: branch.phone,
      email: branch.email,
      managerName: branch.managerName,
      taxRate: branch.taxRate,
      status: branch.status,
      gstin: branch.gstin || '',
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBranch) return;
    setLoading(true);
    try {
      await onUpdateBranch(editingBranch.id, formData);
      setSuccessMsg(`Updated ${formData.name || editingBranch.name} successfully!`);
      setTimeout(() => setSuccessMsg(''), 3000);
      setEditingBranch(null);
    } catch (err: any) {
      alert('Error updating branch: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E76F51]/10 text-[#E76F51] text-xs font-bold mb-1">
            <PawIcon className="w-3.5 h-3.5" />
            <span>Multi-Store Network</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-[#264653] font-['Fredoka',sans-serif]">
            Store Branches (6 Retail Locations)
          </h1>
          <p className="text-xs text-[#7C9082]">
            Configure store identifiers, managers, contact details, and independent retail counters.
          </p>
        </div>

        {successMsg && (
          <div className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}
      </div>

      {/* Grid of 6 Branches */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {branches.map((b) => (
          <div
            key={b.id}
            className="p-6 rounded-3xl bg-white border border-[#EADDCE] shadow-xs hover:border-[#E76F51]/40 transition-all flex flex-col justify-between"
          >
            <div>
              {/* Branch Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-xs font-extrabold uppercase px-2 py-0.5 rounded-lg bg-[#E76F51]/10 text-[#E76F51]">
                    {b.code}
                  </span>
                  <h3 className="font-bold text-base text-[#264653] mt-2 font-['Fredoka',sans-serif]">
                    {b.name}
                  </h3>
                </div>
                <button
                  onClick={() => handleOpenEdit(b)}
                  className="p-2 rounded-xl bg-[#FAF1E8] hover:bg-[#F2ECE4] text-[#E76F51] transition-colors"
                  title="Edit Branch Settings"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>

              {/* Details List */}
              <div className="mt-4 space-y-2 text-xs text-[#5B7065]">
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#7C9082] shrink-0 mt-0.5" />
                  <span>{b.address}, {b.city}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#7C9082] shrink-0" />
                  <span>{b.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#7C9082] shrink-0" />
                  <span>{b.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-[#7C9082] shrink-0" />
                  <span>Manager: <strong className="text-[#264653]">{b.managerName}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-[#7C9082] shrink-0" />
                  <span>Established: {b.openingDate}</span>
                </div>
                {b.gstin && (
                  <div className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-[#7C9082] shrink-0" />
                    <span>GSTIN: <strong className="text-[#264653] font-mono">{b.gstin}</strong></span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 pt-4 border-t border-[#EAE7E0] flex items-center justify-between gap-2">
              <button
                onClick={() => onViewBranchInventory?.(b.id)}
                className="text-xs font-semibold text-[#5A5A40] hover:text-[#1A1A1A] underline transition-colors"
              >
                View Stock
              </button>
              <button
                onClick={() => onSelectBranchPos?.(b.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#D97757] hover:bg-[#C86646] text-white text-xs font-semibold transition-all shadow-xs"
              >
                <span>Launch Counter POS</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Branch Modal */}
      {editingBranch && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl border border-[#EADDCE] shadow-2xl p-6 text-[#264653] animate-in fade-in">
            <h3 className="font-['Fredoka',sans-serif] text-lg font-bold text-[#264653] mb-4">
              Edit Branch: {editingBranch.code}
            </h3>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold mb-1">Branch Name</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-[#D5C7B8] focus:ring-2 focus:ring-[#E76F51] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Address</label>
                <input
                  type="text"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-[#D5C7B8] focus:ring-2 focus:ring-[#E76F51] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city || ''}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-[#D5C7B8] focus:ring-2 focus:ring-[#E76F51] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Phone</label>
                  <input
                    type="text"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-[#D5C7B8] focus:ring-2 focus:ring-[#E76F51] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Branch GST Number (GSTIN)</label>
                <input
                  type="text"
                  value={formData.gstin || ''}
                  onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                  placeholder="e.g. 27AABCU9603R1ZM"
                  className="w-full px-3 py-2 rounded-xl border border-[#D5C7B8] focus:ring-2 focus:ring-[#E76F51] focus:outline-hidden font-mono uppercase"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Branch Manager</label>
                <input
                  type="text"
                  value={formData.managerName || ''}
                  onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-[#D5C7B8] focus:ring-2 focus:ring-[#E76F51] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-[#D5C7B8] focus:ring-2 focus:ring-[#E76F51] focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F2ECE4]">
                <button
                  type="button"
                  onClick={() => setEditingBranch(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#7C9082] hover:bg-[#F2ECE4]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#E76F51] hover:bg-[#D95D3E] text-white shadow-xs"
                >
                  {loading ? 'Saving...' : 'Save Branch Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
