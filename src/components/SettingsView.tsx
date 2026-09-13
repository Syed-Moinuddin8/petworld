import React, { useState, useEffect } from 'react';
import {
  Settings,
  Building2,
  Receipt,
  Printer,
  ShieldCheck,
  RotateCcw,
  Save,
  CheckCircle2,
  FileText,
  MapPin,
  Phone,
} from 'lucide-react';
import { Branch, User, AppSettings } from '../types.js';
import { PawIcon } from './PetAvatars.js';

interface SettingsViewProps {
  branches: Branch[];
  currentUser: User;
  settings?: AppSettings | null;
  onUpdateBranch?: (branchId: string, updates: Partial<Branch>) => Promise<any>;
  onUpdateSettings?: (updates: Partial<AppSettings>) => Promise<any>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  branches,
  currentUser,
  settings,
  onUpdateBranch,
  onUpdateSettings,
}) => {
  const [companyName, setCompanyName] = useState(settings?.businessName || 'PET WORLD');
  const [gstin, setGstin] = useState(settings?.gstin || '27AABCP1924M1Z5');
  const [currency, setCurrency] = useState(settings?.currencySymbol || '₹');
  const [defaultTaxRate, setDefaultTaxRate] = useState(settings?.defaultTaxRate ?? 18);
  const [thermalPaperWidth, setThermalPaperWidth] = useState<'80mm' | '58mm'>(settings?.thermalWidth || '80mm');
  const [invoicePrefix, setInvoicePrefix] = useState(settings?.invoicePrefix || 'PW-SAL-');
  const [receiptFooter, setReceiptFooter] = useState(settings?.receiptFooter || 'Thank you for caring for your furry friends! Visit us at www.petworld.co.in | No exchange without bill');
  const [headOfficeAddress, setHeadOfficeAddress] = useState(settings?.headOfficeAddress || 'Pet World Tower, Suite 402, Nariman Point, Mumbai, MH 400021');
  const [headOfficePhone, setHeadOfficePhone] = useState(settings?.headOfficePhone || '+91 22 4589 8800');
  
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Sync props when settings load from API
  useEffect(() => {
    if (settings) {
      if (settings.businessName !== undefined) setCompanyName(settings.businessName);
      if (settings.gstin !== undefined) setGstin(settings.gstin);
      if (settings.currencySymbol !== undefined) setCurrency(settings.currencySymbol);
      if (settings.defaultTaxRate !== undefined) setDefaultTaxRate(settings.defaultTaxRate);
      if (settings.thermalWidth !== undefined) setThermalPaperWidth(settings.thermalWidth);
      if (settings.invoicePrefix !== undefined) setInvoicePrefix(settings.invoicePrefix);
      if (settings.receiptFooter !== undefined) setReceiptFooter(settings.receiptFooter);
      if (settings.headOfficeAddress !== undefined) setHeadOfficeAddress(settings.headOfficeAddress);
      if (settings.headOfficePhone !== undefined) setHeadOfficePhone(settings.headOfficePhone);
    }
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (onUpdateSettings) {
        await onUpdateSettings({
          businessName: companyName.trim(),
          gstin: gstin.trim(),
          defaultTaxRate: Number(defaultTaxRate) || 18,
          thermalWidth: thermalPaperWidth,
          invoicePrefix: invoicePrefix.trim(),
          receiptFooter: receiptFooter.trim(),
          headOfficeAddress: headOfficeAddress.trim(),
          headOfficePhone: headOfficePhone.trim(),
        });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    } catch (err: any) {
      alert('Failed to save configuration: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E76F51]/10 text-[#E76F51] text-xs font-bold mb-1">
          <PawIcon className="w-3.5 h-3.5" />
          <span>Enterprise Configuration</span>
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-[#264653] font-['Fredoka',sans-serif]">
          System & Store Settings
        </h1>
        <p className="text-xs text-[#7C9082]">
          Manage company profiles, tax rates, thermal printer defaults, and multi-branch rules
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Company Profile Card */}
        <div className="p-6 rounded-3xl bg-white border border-[#EADDCE] shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-[#264653] font-['Fredoka',sans-serif] flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#E76F51]" />
            <span>Company & Tax Information</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold mb-1 text-[#5B7065]">Registered Company Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#D5C7B8] focus:ring-2 focus:ring-[#E76F51] focus:outline-hidden font-semibold text-[#264653]"
              />
            </div>

            <div>
              <label className="block font-bold mb-1 text-[#5B7065]">Head Office Address</label>
              <input
                type="text"
                value={headOfficeAddress}
                onChange={(e) => setHeadOfficeAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#D5C7B8] focus:ring-2 focus:ring-[#E76F51] focus:outline-hidden text-[#264653]"
              />
            </div>

            <div>
              <label className="block font-bold mb-1 text-[#5B7065]">Base Currency</label>
              <input
                type="text"
                disabled
                value={currency}
                className="w-full px-3 py-2 rounded-xl border border-[#D5C7B8] bg-gray-50 text-[#7C9082]"
              />
            </div>
          </div>
        </div>

        {/* Hardware & Receipt Preferences */}
        <div className="p-6 rounded-3xl bg-white border border-[#EADDCE] shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-[#264653] font-['Fredoka',sans-serif] flex items-center gap-2">
            <Printer className="w-4 h-4 text-[#2A9D8F]" />
            <span>POS Hardware & Receipt Defaults</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold mb-1 text-[#5B7065]">Default Thermal Paper Width</label>
              <select
                value={thermalPaperWidth}
                onChange={(e) => setThermalPaperWidth(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-[#D5C7B8] focus:ring-2 focus:ring-[#E76F51] focus:outline-hidden font-bold text-[#264653]"
              >
                <option value="80mm">80mm (Standard POS Receipt)</option>
                <option value="58mm">58mm (Compact Mobile Receipt)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold mb-1 text-[#5B7065]">Invoice Number Prefix</label>
              <input
                type="text"
                value={invoicePrefix}
                onChange={(e) => setInvoicePrefix(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#D5C7B8] focus:ring-2 focus:ring-[#E76F51] focus:outline-hidden font-mono text-[#264653]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold mb-1 text-[#5B7065]">Receipt Footer Message</label>
              <input
                type="text"
                value={receiptFooter}
                onChange={(e) => setReceiptFooter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#D5C7B8] focus:ring-2 focus:ring-[#E76F51] focus:outline-hidden text-[#264653]"
              />
            </div>
          </div>
        </div>

        {/* Active Branches Roster with Per-Branch GST Editing */}
        <div className="p-6 rounded-3xl bg-white border border-[#EADDCE] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#264653] font-['Fredoka',sans-serif] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#E9C46A]" />
              <span>Configured Branch Network & Per-Store GST Rates ({branches.length} Outlets)</span>
            </h3>
            <span className="text-[11px] text-[#7C9082]">Edit GST % per branch for local store billing</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {branches.map((b) => (
              <div
                key={b.id}
                className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EADDCE] flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <strong className="text-[#264653] block truncate">{b.name} ({b.code})</strong>
                  <span className="text-[10px] text-[#7C9082] block truncate">{b.address}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <input
                    type="number"
                    min={0}
                    max={28}
                    value={b.taxRate ?? 18}
                    onChange={(e) => {
                      const newRate = Number(e.target.value);
                      if (onUpdateBranch) {
                        onUpdateBranch(b.id, { taxRate: newRate });
                      }
                    }}
                    className="w-16 px-2 py-1 rounded-lg border border-[#D5C7B8] bg-white font-bold text-xs text-[#264653] focus:ring-2 focus:ring-[#E76F51] focus:outline-hidden text-center"
                  />
                  <span className="text-xs font-bold text-[#E76F51]">% GST</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Save button */}
        <div className="flex items-center justify-between pt-2">
          {saved ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-bold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>System settings saved permanently!</span>
            </span>
          ) : <div />}

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#E76F51] hover:bg-[#D95D3E] text-white text-xs font-bold shadow-xs transition-all active:scale-98 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving to Database...' : 'Save System Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
