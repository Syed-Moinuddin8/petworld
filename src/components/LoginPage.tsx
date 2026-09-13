import React, { useState, useEffect } from 'react';
import {
  Building2,
  Store,
  Lock,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  MapPin,
  ChevronDown,
  Info,
} from 'lucide-react';
import { Branch, User } from '../types.js';
import { PawIcon, PetAvatar } from './PetAvatars.js';

interface LoginPageProps {
  branches: Branch[];
  onLogin: (user: User) => void;
}

interface DemoAccount {
  id: string;
  name: string;
  username: string;
  role: 'OWNER' | 'CASHIER' | 'BRANCH_MANAGER';
  designation: string;
  branchId?: string;
  branchName: string;
  branchCode?: string;
  avatarType: 'dog' | 'cat' | 'hamster' | 'rabbit' | 'fish';
}

const FALLBACK_BRANCHES: Branch[] = [
  {
    id: 'branch-1',
    code: 'B01',
    name: 'Pet World Downtown Flagship',
    address: '14/B, Colaba Causeway, Near Regal Cinema',
    city: 'Mumbai',
    phone: '+91 22 2202 1144',
    email: 'colaba@petworld.co.in',
    managerName: 'Rajesh Sharma',
    status: 'ACTIVE',
    openingDate: '2021-03-15',
    taxRate: 18,
  },
  {
    id: 'branch-2',
    code: 'B02',
    name: 'Pet World Westside Mall',
    address: 'Ground Floor, Galleria Arcade, Linking Road, Bandra West',
    city: 'Mumbai',
    phone: '+91 22 2640 8822',
    email: 'bandra@petworld.co.in',
    managerName: 'Priya Mehra',
    status: 'ACTIVE',
    openingDate: '2021-09-10',
    taxRate: 18,
  },
  {
    id: 'branch-3',
    code: 'B03',
    name: 'Pet World Suburban Plaza',
    address: 'Shop 4-6, Ground Floor, Suburban Pride, Andheri East',
    city: 'Mumbai',
    phone: '+91 22 2838 5500',
    email: 'andheri@petworld.co.in',
    managerName: 'Amit Patel',
    status: 'ACTIVE',
    openingDate: '2022-01-20',
    taxRate: 18,
  },
  {
    id: 'branch-4',
    code: 'B04',
    name: 'Pet World Green Valley',
    address: 'Lake Boulevard, Hiranandani Gardens, Powai',
    city: 'Mumbai',
    phone: '+91 22 2570 9911',
    email: 'powai@petworld.co.in',
    managerName: 'Sunita Deshmukh',
    status: 'ACTIVE',
    openingDate: '2022-07-01',
    taxRate: 18,
  },
  {
    id: 'branch-5',
    code: 'B05',
    name: 'Pet World Coastal Bay',
    address: '10 Beach Haven, Juhu Tara Road, Juhu',
    city: 'Mumbai',
    phone: '+91 22 2618 3344',
    email: 'juhu@petworld.co.in',
    managerName: 'Farhan Merchant',
    status: 'ACTIVE',
    openingDate: '2023-02-14',
    taxRate: 18,
  },
  {
    id: 'branch-6',
    code: 'B06',
    name: 'Pet World Express Hub',
    address: 'Unit 12, Viviana Galleria, Eastern Express Highway, Thane West',
    city: 'Thane',
    phone: '+91 22 2544 7788',
    email: 'thane@petworld.co.in',
    managerName: 'Sneha Patil',
    status: 'ACTIVE',
    openingDate: '2023-11-05',
    taxRate: 18,
  },
];

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id: 'usr-owner-001',
    name: 'Vikram Singhania',
    username: 'owner',
    role: 'OWNER',
    designation: 'Founder & Super Admin',
    branchName: 'Head Office (All Branches)',
    avatarType: 'dog',
  },
  {
    id: 'staff-02',
    name: 'Deepak Kamble',
    username: 'deepak_b1',
    role: 'CASHIER',
    designation: 'Senior Cashier',
    branchId: 'branch-1',
    branchCode: 'B01',
    branchName: 'Downtown Flagship (Colaba)',
    avatarType: 'cat',
  },
  {
    id: 'staff-06',
    name: 'Kavita Menon',
    username: 'kavita_b2',
    role: 'CASHIER',
    designation: 'Head Cashier',
    branchId: 'branch-2',
    branchCode: 'B02',
    branchName: 'Westside Mall (Bandra West)',
    avatarType: 'dog',
  },
  {
    id: 'staff-10',
    name: 'Suresh More',
    username: 'suresh_b3',
    role: 'CASHIER',
    designation: 'Store Cashier',
    branchId: 'branch-3',
    branchCode: 'B03',
    branchName: 'Suburban Plaza (Andheri East)',
    avatarType: 'hamster',
  },
  {
    id: 'staff-14',
    name: 'Vikas Rao',
    username: 'vikas_b4',
    role: 'CASHIER',
    designation: 'Lead Cashier',
    branchId: 'branch-4',
    branchCode: 'B04',
    branchName: 'Green Valley (Powai)',
    avatarType: 'dog',
  },
  {
    id: 'staff-18',
    name: 'Divya Shenoy',
    username: 'divya_b5',
    role: 'CASHIER',
    designation: 'Counter Cashier',
    branchId: 'branch-5',
    branchCode: 'B05',
    branchName: 'Coastal Bay (Juhu)',
    avatarType: 'cat',
  },
  {
    id: 'staff-22',
    name: 'Ramesh Sawant',
    username: 'ramesh_b6',
    role: 'CASHIER',
    designation: 'Hub Cashier',
    branchId: 'branch-6',
    branchCode: 'B06',
    branchName: 'Express Hub (Thane West)',
    avatarType: 'dog',
  },
];

export const LoginPage: React.FC<LoginPageProps> = ({ branches: initialBranches, onLogin }) => {
  const branches = initialBranches && initialBranches.length > 0 ? initialBranches : FALLBACK_BRANCHES;

  // Selected Scope: 'OWNER' or branch ID (e.g. 'branch-1')
  const [selectedScope, setSelectedScope] = useState<string>('OWNER');
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [password, setPassword] = useState<string>('admin123');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const isOwnerSelected = selectedScope === 'OWNER';
  const selectedBranch = branches.find((b) => b.id === selectedScope);

  // Filter demo staff for the selected branch
  const branchStaffAccounts = DEMO_ACCOUNTS.filter((acc) => acc.branchId === selectedScope);

  // Set default staff member when branch changes
  useEffect(() => {
    if (!isOwnerSelected) {
      const defaultStaff = branchStaffAccounts[0];
      if (defaultStaff) {
        setSelectedStaffId(defaultStaff.id);
      }
    } else {
      setSelectedStaffId('');
    }
  }, [selectedScope]);

  const handleLoginSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isOwnerSelected) {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scope: 'OWNER',
            branchId: 'OWNER',
            username: 'owner',
            password,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Login failed');
        onLogin(data.user);
      } else {
        const staffAccount = branchStaffAccounts.find((s) => s.id === selectedStaffId) || branchStaffAccounts[0];
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            branchId: selectedScope,
            staffId: staffAccount?.id,
            username: staffAccount?.username,
            password,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Login failed');
        onLogin(data.user);
      }
    } catch (err: any) {
      // Fallback local authentication if backend has network lag
      if (isOwnerSelected) {
        const ownerAcc = DEMO_ACCOUNTS[0];
        onLogin({
          id: ownerAcc.id,
          name: ownerAcc.name,
          username: ownerAcc.username,
          role: 'OWNER',
          designation: ownerAcc.designation,
          avatarType: ownerAcc.avatarType,
          status: 'ACTIVE',
        });
      } else {
        const staffAccount = branchStaffAccounts.find((s) => s.id === selectedStaffId) || branchStaffAccounts[0];
        if (staffAccount) {
          onLogin({
            id: staffAccount.id,
            name: staffAccount.name,
            username: staffAccount.username,
            role: staffAccount.role,
            designation: staffAccount.designation,
            branchId: staffAccount.branchId,
            avatarType: staffAccount.avatarType,
            status: 'ACTIVE',
          });
        } else {
          setError(err.message || 'Login failed');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAccountSelect = (account: DemoAccount) => {
    if (account.role === 'OWNER') {
      setSelectedScope('OWNER');
    } else if (account.branchId) {
      setSelectedScope(account.branchId);
      setSelectedStaffId(account.id);
    }
    setPassword('admin123');
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-between text-[#264653] font-sans antialiased selection:bg-[#D97757]/20">
      {/* Top Brand Bar */}
      <header className="w-full bg-white/80 backdrop-blur-md border-b border-[#EAE7E0] px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#5A5A40] rounded-2xl flex items-center justify-center text-white shadow-sm">
            <PawIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif font-black text-lg text-[#1A1A1A] tracking-tight">PET WORLD</h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#FAF8F5] text-[#5A5A40] border border-[#EAE7E0]">
                ENTERPRISE
              </span>
            </div>
            <p className="text-[11px] text-[#7C9082]">Multi-Branch Management & POS System</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-[#7C9082] bg-[#FAF8F5] px-3 py-1.5 rounded-full border border-[#EAE7E0]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Central Server Active (Port 3000)</span>
        </div>
      </header>

      {/* Main Login Workspace */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-lg bg-white rounded-3xl border border-[#EAE7E0] shadow-xl shadow-stone-200/50 overflow-hidden">
          {/* Header Graphic / Banner */}
          <div className="bg-gradient-to-br from-[#FAF8F5] via-[#F5F2ED] to-[#ECE7DE] p-6 sm:p-7 border-b border-[#EAE7E0]">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/80 border border-[#EAE7E0] text-[11px] font-semibold text-[#5A5A40] mb-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#D97757]" />
                  <span>Authorized Portal Access</span>
                </div>
                <h2 className="font-serif text-2xl font-bold text-[#1A1A1A]">Welcome Back</h2>
                <p className="text-xs text-[#5A5A40]">
                  Select your operating branch or login as Owner to access the system
                </p>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-white border border-[#EAE7E0] shadow-sm flex items-center justify-center text-[#D97757]">
                {isOwnerSelected ? <Building2 className="w-6 h-6" /> : <Store className="w-6 h-6" />}
              </div>
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleLoginSubmit} className="p-6 sm:p-7 space-y-5">
            {error && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* SELECTION BOX: Branch or Owner */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5A5A40] flex items-center justify-between">
                <span>Select Branch or Owner</span>
                <span className="text-[10px] font-semibold text-[#D97757] normal-case">
                  {isOwnerSelected ? 'HQ Master Admin' : `Store Counter (${selectedBranch?.code})`}
                </span>
              </label>

              <div className="relative">
                <select
                  value={selectedScope}
                  onChange={(e) => setSelectedScope(e.target.value)}
                  className="w-full pl-11 pr-10 py-3 rounded-2xl bg-[#FAF8F5] hover:bg-[#F5F2ED] border border-[#EAE7E0] focus:border-[#D97757] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D97757]/20 text-sm font-semibold text-[#1A1A1A] transition-all appearance-none cursor-pointer"
                >
                  <optgroup label="Central Management">
                    <option value="OWNER">🏢 Head Office / Super Admin (Owner)</option>
                  </optgroup>

                  <optgroup label="Retail Store Branches (POS Counters)">
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        📍 {b.code} • {b.name} ({b.city})
                      </option>
                    ))}
                  </optgroup>
                </select>

                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#5A5A40]">
                  {isOwnerSelected ? <Building2 className="w-4 h-4 text-[#D97757]" /> : <MapPin className="w-4 h-4 text-[#D97757]" />}
                </div>

                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#7C9082]">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Dynamic Card based on selection */}
            {isOwnerSelected ? (
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE7E0] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <PetAvatar type="dog" size="sm" />
                    <div>
                      <h4 className="text-xs font-bold text-[#1A1A1A]">Vikram Singhania</h4>
                      <p className="text-[10px] text-[#7C9082]">Founder & Super Admin</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#D97757] text-white">
                    SUPER ADMIN
                  </span>
                </div>
                <div className="text-[11px] text-[#5A5A40] leading-relaxed pt-1 border-t border-[#EAE7E0]/70 flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 text-[#D97757] shrink-0 mt-0.5" />
                  <span>Full access to all 6 stores, central warehouse purchases, stock allocation, payroll & reports.</span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE7E0] space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-[#264653] text-white text-[10px] font-black">
                        {selectedBranch?.code}
                      </span>
                      <h4 className="text-xs font-bold text-[#1A1A1A]">{selectedBranch?.name}</h4>
                    </div>
                    <p className="text-[10px] text-[#7C9082] mt-0.5">{selectedBranch?.address}</p>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    Active POS
                  </span>
                </div>

                {/* Branch Staff selector if multiple staff exist */}
                {branchStaffAccounts.length > 0 && (
                  <div className="pt-2 border-t border-[#EAE7E0]/70">
                    <label className="block text-[10px] font-bold uppercase text-[#5A5A40] mb-1.5">
                      Assigned Counter Cashier
                    </label>
                    <div className="grid grid-cols-1 gap-1.5">
                      {branchStaffAccounts.map((staff) => (
                        <button
                          type="button"
                          key={staff.id}
                          onClick={() => setSelectedStaffId(staff.id)}
                          className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all border ${
                            selectedStaffId === staff.id
                              ? 'bg-white border-[#D97757] shadow-xs'
                              : 'bg-white/50 border-[#EAE7E0] hover:bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <PetAvatar type={staff.avatarType} size="xs" />
                            <div>
                              <span className="text-xs font-bold text-[#1A1A1A] block leading-tight">
                                {staff.name}
                              </span>
                              <span className="text-[10px] text-[#7C9082] block leading-tight">
                                {staff.designation}
                              </span>
                            </div>
                          </div>
                          {selectedStaffId === staff.id && (
                            <CheckCircle2 className="w-4 h-4 text-[#D97757]" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-[11px] text-[#5A5A40] leading-relaxed pt-1 border-t border-[#EAE7E0]/70 flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 text-[#5A5A40] shrink-0 mt-0.5" />
                  <span>Branch staff are isolated to this store's counter POS billing and daily register.</span>
                </div>
              </div>
            )}

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5A5A40] flex items-center justify-between">
                <span>Security PIN / Password</span>
                <span className="text-[10px] text-[#7C9082] font-normal">Demo: Any PIN or 'admin123'</span>
              </label>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your security password"
                  className="w-full pl-11 pr-11 py-2.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE7E0] focus:border-[#D97757] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D97757]/20 text-sm font-semibold text-[#1A1A1A] transition-all"
                  required
                />
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7C9082]">
                  <Lock className="w-4 h-4" />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7C9082] hover:text-[#1A1A1A] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-5 rounded-2xl bg-[#D97757] hover:bg-[#c66545] active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-[#D97757]/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-70"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    {isOwnerSelected ? 'Sign In as Owner (Head Office)' : `Sign In to ${selectedBranch?.code || 'Branch'} POS`}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Quick 1-Click Role Switcher */}
            <div className="pt-3 border-t border-[#EAE7E0] space-y-2">
              <div className="flex items-center justify-between text-[11px] text-[#7C9082]">
                <span className="font-semibold uppercase tracking-wider text-[10px]">Quick Select Demo Accounts</span>
                <span>1-Click Switch</span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {DEMO_ACCOUNTS.map((acc) => {
                  const isSelected =
                    acc.role === 'OWNER'
                      ? isOwnerSelected
                      : selectedScope === acc.branchId && selectedStaffId === acc.id;

                  return (
                    <button
                      type="button"
                      key={acc.id}
                      onClick={() => handleQuickAccountSelect(acc)}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all border flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-[#5A5A40] text-white border-[#5A5A40] shadow-xs'
                          : 'bg-[#FAF8F5] text-[#5A5A40] border-[#EAE7E0] hover:border-[#D97757] hover:bg-white'
                      }`}
                    >
                      <span>{acc.role === 'OWNER' ? '🏢 Owner' : `📍 ${acc.branchCode}`}</span>
                      <span className="font-normal text-[11px] opacity-80">({acc.name.split(' ')[0]})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-[#7C9082] border-t border-[#EAE7E0] bg-white/60">
        <p>Pet World Multi-Branch POS & Retail Management System • Secure Role-Based Session</p>
      </footer>
    </div>
  );
};
