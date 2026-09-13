import React, { useState, useMemo, useEffect } from 'react';
import {
  Boxes,
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  ArrowRightLeft,
  SlidersHorizontal,
  AlertTriangle,
  Building2,
  ChevronDown,
  ChevronRight,
  Info,
  CheckCircle2,
  X,
  ExternalLink,
  Layers,
  LayoutGrid,
  List,
  Edit2,
  Sparkles,
  Camera,
  Check,
  FileSpreadsheet,
  Image as ImageIcon,
  Barcode,
  RefreshCw,
} from 'lucide-react';
import { Product, Branch, InventoryItem, User, ProductForm, ProductCategory, PetAvatarType, Supplier } from '../types.js';
import { PetAvatar, PawIcon, PetEmptyState } from './PetAvatars.js';
import { ProductFormBadge, ProductImageThumb } from './ProductImageThumb.js';
import { EditProductModal } from './EditProductModal.js';
import { AddInventoryModal } from './AddInventoryModal.js';
import { BarcodeScannerModal } from './BarcodeScannerModal.js';
import { ImageUploadPicker } from './ImageUploadPicker.js';
import { getProductImageUrl } from '../utils/productImages.js';

interface InventoryManagementProps {
  products: Product[];
  inventory: InventoryItem[];
  branches: Branch[];
  currentUser: User;
  suppliers?: Supplier[];
  onAddStock?: (data: any) => Promise<any>;
  onAdjustStock?: (data: any) => Promise<any>;
  onTransferStock?: (data: any) => Promise<any>;
  onCreateProduct?: (data: any) => Promise<any>;
  onUpdateProduct?: (productId: string, data: any) => Promise<any>;
  onStockInward?: (data: any) => Promise<any>;
  onStockTransfer?: (data: any) => Promise<any>;
  onStockAdjustment?: (data: any) => Promise<any>;
  onBulkImportCsv?: (items: any[], branchId: string) => Promise<any>;
  preselectedBranchId?: string;
}

export const InventoryManagement: React.FC<InventoryManagementProps> = ({
  products,
  inventory,
  branches,
  currentUser,
  suppliers = [],
  onAddStock,
  onAdjustStock,
  onTransferStock,
  onCreateProduct,
  onUpdateProduct,
  onStockInward,
  onStockTransfer,
  onStockAdjustment,
  onBulkImportCsv,
  preselectedBranchId,
}) => {
  const isOwner = currentUser.role === 'OWNER';
  const defaultBranch = !isOwner && currentUser.branchId ? currentUser.branchId : (preselectedBranchId || 'ALL');

  const [selectedBranch, setSelectedBranch] = useState<string>(defaultBranch);

  useEffect(() => {
    if (preselectedBranchId) {
      setSelectedBranch(preselectedBranchId);
    }
  }, [preselectedBranchId]);

  // View mode: Hierarchical Company -> Dried/Wet view, or Master Table, or Visual Grid
  const [viewMode, setViewMode] = useState<'hierarchy' | 'table' | 'grid'>('hierarchy');

  // Filters
  const [selectedCompany, setSelectedCompany] = useState<string>('ALL');
  const [selectedProductForm, setSelectedProductForm] = useState<'ALL' | 'DRIED' | 'WET' | 'OTHER'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStockStatus, setSelectedStockStatus] = useState<'ALL' | 'HEALTHY' | 'LOW' | 'OUT'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Accordion state for companies
  const [collapsedCompanies, setCollapsedCompanies] = useState<Record<string, boolean>>({});

  // Modals
  const [addStockModalProduct, setAddStockModalProduct] = useState<Product | null>(null);
  const [adjustStockModalProduct, setAdjustStockModalProduct] = useState<Product | null>(null);
  const [transferStockModalProduct, setTransferStockModalProduct] = useState<Product | null>(null);
  const [breakdownProduct, setBreakdownProduct] = useState<Product | null>(null);
  const [editModalProduct, setEditModalProduct] = useState<Product | null>(null);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAddInventoryModal, setShowAddInventoryModal] = useState(false);
  const [showQuickScanner, setShowQuickScanner] = useState(false);

  // Add Product form state
  const [newProdCompany, setNewProdCompany] = useState('');
  const [newProdBarcode, setNewProdBarcode] = useState('');
  const [showRegisterScanner, setShowRegisterScanner] = useState(false);
  const [newProdForm, setNewProdForm] = useState<ProductForm>('DRIED');
  const [newProdCategory, setNewProdCategory] = useState<ProductCategory>('Dog Food');
  const [newProdAvatar, setNewProdAvatar] = useState<PetAvatarType>('dog');
  const [newProdImageUrl, setNewProdImageUrl] = useState('');

  const generateNewProdEan = () => {
    const raw = '890' + Math.floor(100000000 + Math.random() * 900000000).toString();
    const digits = raw.slice(0, 12).split('').map(Number);
    const sum = digits.reduce((acc, digit, idx) => acc + digit * (idx % 2 === 0 ? 1 : 3), 0);
    const checkDigit = (10 - (sum % 10)) % 10;
    setNewProdBarcode(raw.slice(0, 12) + checkDigit);
  };

  // Form states
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Distinct companies list
  const existingCompanies = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      const c = p.company || p.brand;
      if (c) set.add(c);
    });
    return Array.from(set).sort();
  }, [products]);

  // Categories list
  const categories = [
    'ALL',
    'Dog Food',
    'Cat Food',
    'Pet Treats',
    'Bird Food',
    'Fish Food',
    'Toys',
    'Leashes & Collars',
    'Beds & Mats',
    'Grooming',
    'Medicines & Care',
    'Accessories',
    'Aquarium Products',
  ];

  // Calculate stock per product
  const getProductStock = (productId: string, branchId: string) => {
    if (branchId === 'ALL') {
      return inventory
        .filter((inv) => inv.productId === productId)
        .reduce((sum, item) => sum + item.quantity, 0);
    }
    const match = inventory.find((inv) => inv.productId === productId && inv.branchId === branchId);
    return match ? match.quantity : 0;
  };

  const getProductStockBreakdown = (productId: string) => {
    return branches.map((b) => {
      const item = inventory.find((inv) => inv.productId === productId && inv.branchId === b.id);
      return {
        branch: b,
        quantity: item ? item.quantity : 0,
      };
    });
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Company filter
      if (selectedCompany !== 'ALL') {
        const comp = p.company || p.brand;
        if (comp !== selectedCompany) return false;
      }

      // Product Form (Dried vs Wet) filter
      if (selectedProductForm !== 'ALL') {
        const form = p.productForm || 'OTHER';
        if (form !== selectedProductForm) return false;
      }

      // Category filter
      if (selectedCategory !== 'ALL' && p.category !== selectedCategory) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const comp = (p.company || '').toLowerCase();
        const brand = (p.brand || '').toLowerCase();
        const name = p.name.toLowerCase();
        const sku = p.sku.toLowerCase();
        const barcode = p.barcode.toLowerCase();
        const form = (p.productForm || '').toLowerCase();

        const match =
          name.includes(q) ||
          comp.includes(q) ||
          brand.includes(q) ||
          sku.includes(q) ||
          barcode.includes(q) ||
          (q === 'dry' && form === 'dried') ||
          (q === 'dried' && form === 'dried') ||
          (q === 'wet' && form === 'wet');

        if (!match) return false;
      }

      // Stock status filter
      const stock = getProductStock(p.id, selectedBranch);
      if (selectedStockStatus === 'OUT' && stock > 0) return false;
      if (selectedStockStatus === 'LOW' && (stock <= 0 || stock > p.reorderLevel)) return false;
      if (selectedStockStatus === 'HEALTHY' && stock <= p.reorderLevel) return false;

      return true;
    });
  }, [
    products,
    inventory,
    selectedBranch,
    selectedCompany,
    selectedProductForm,
    selectedCategory,
    selectedStockStatus,
    searchQuery,
  ]);

  // Group filtered products by Company, and inside each by Dried vs Wet
  const companyHierarchy = useMemo(() => {
    const map = new Map<
      string,
      {
        companyName: string;
        driedProducts: Product[];
        wetProducts: Product[];
        otherProducts: Product[];
        totalStock: number;
        totalValue: number;
      }
    >();

    filteredProducts.forEach((p) => {
      const companyKey = p.company || p.brand || 'Other / Independent';
      if (!map.has(companyKey)) {
        map.set(companyKey, {
          companyName: companyKey,
          driedProducts: [],
          wetProducts: [],
          otherProducts: [],
          totalStock: 0,
          totalValue: 0,
        });
      }

      const group = map.get(companyKey)!;
      const stock = getProductStock(p.id, selectedBranch);
      group.totalStock += stock;
      group.totalValue += stock * p.sellingPrice;

      const form = p.productForm || 'OTHER';
      if (form === 'DRIED') {
        group.driedProducts.push(p);
      } else if (form === 'WET') {
        group.wetProducts.push(p);
      } else {
        group.otherProducts.push(p);
      }
    });

    return Array.from(map.values()).sort((a, b) =>
      a.companyName.localeCompare(b.companyName)
    );
  }, [filteredProducts, inventory, selectedBranch]);

  // Overall Catalog Statistics
  const catalogStats = useMemo(() => {
    let totalDriedCount = 0;
    let totalWetCount = 0;
    let totalDriedUnits = 0;
    let totalWetUnits = 0;
    let totalValuation = 0;

    products.forEach((p) => {
      const stock = getProductStock(p.id, selectedBranch);
      totalValuation += stock * p.sellingPrice;
      const form = p.productForm || 'OTHER';
      if (form === 'DRIED') {
        totalDriedCount++;
        totalDriedUnits += stock;
      } else if (form === 'WET') {
        totalWetCount++;
        totalWetUnits += stock;
      }
    });

    return {
      totalProducts: products.length,
      totalCompanies: existingCompanies.length,
      totalDriedCount,
      totalDriedUnits,
      totalWetCount,
      totalWetUnits,
      totalValuation,
    };
  }, [products, inventory, selectedBranch, existingCompanies]);

  const formatINR = (val?: number | null) =>
    '₹' + Math.round(Number(val) || 0).toLocaleString('en-IN');

  const toggleCompanyCollapse = (companyName: string) => {
    setCollapsedCompanies((prev) => ({
      ...prev,
      [companyName]: !prev[companyName],
    }));
  };

  const expandAll = () => setCollapsedCompanies({});
  const collapseAll = () => {
    const all: Record<string, boolean> = {};
    companyHierarchy.forEach((c) => {
      all[c.companyName] = true;
    });
    setCollapsedCompanies(all);
  };

  // Handle Add Stock submission
  const handleAddStockSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!addStockModalProduct) return;
    const form = new FormData(e.currentTarget);
    setActionLoading(true);
    try {
      const addFn = onAddStock || onStockInward;
      if (addFn) {
        await addFn({
          productId: addStockModalProduct.id,
          branchId: form.get('branchId') as string,
          quantity: Number(form.get('quantity')),
          purchasePrice: Number(form.get('purchasePrice')),
          supplierName: form.get('supplierName') as string,
          purchaseBillNumber: form.get('purchaseBillNumber') as string,
          notes: form.get('notes') as string,
        });
      }
      setFeedbackMsg(`Stock successfully added for ${addStockModalProduct.name}!`);
      setTimeout(() => setFeedbackMsg(''), 3000);
      setAddStockModalProduct(null);
    } catch (err: any) {
      alert('Error adding stock: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Adjust Stock submission
  const handleAdjustStockSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!adjustStockModalProduct) return;
    const form = new FormData(e.currentTarget);
    setActionLoading(true);
    try {
      const adjustFn = onAdjustStock || onStockAdjustment;
      if (adjustFn) {
        await adjustFn({
          productId: adjustStockModalProduct.id,
          branchId: form.get('branchId') as string,
          newQuantity: Number(form.get('newQuantity')),
          reason: form.get('reason') as string,
        });
      }
      setFeedbackMsg(`Stock adjusted for ${adjustStockModalProduct.name}!`);
      setTimeout(() => setFeedbackMsg(''), 3000);
      setAdjustStockModalProduct(null);
    } catch (err: any) {
      alert('Error adjusting stock: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Transfer Stock submission
  const handleTransferStockSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!transferStockModalProduct) return;
    const form = new FormData(e.currentTarget);
    setActionLoading(true);
    try {
      const transferFn = onTransferStock || onStockTransfer;
      if (transferFn) {
        await transferFn({
          productId: transferStockModalProduct.id,
          fromBranchId: form.get('fromBranchId') as string,
          toBranchId: form.get('toBranchId') as string,
          quantity: Number(form.get('quantity')),
          reason: form.get('reason') as string,
        });
      }
      setFeedbackMsg(`Stock transferred successfully!`);
      setTimeout(() => setFeedbackMsg(''), 3000);
      setTransferStockModalProduct(null);
    } catch (err: any) {
      alert('Error transferring stock: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Create Product submission
  const handleCreateProductSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setActionLoading(true);
    try {
      if (onCreateProduct) {
        const brandVal = (form.get('brand') as string) || newProdCompany;
        const generatedFallback = '890' + Math.floor(100000000 + Math.random() * 900000000).toString();
        await onCreateProduct({
          name: form.get('name') as string,
          barcode: newProdBarcode.trim() || generatedFallback,
          company: newProdCompany || brandVal,
          brand: brandVal,
          productForm: newProdForm,
          category: newProdCategory,
          imageUrl: newProdImageUrl,
          unit: (form.get('unit') as string) || 'packet',
          purchasePrice: Number(form.get('costPrice') || form.get('sellingPrice') || 0),
          costPrice: Number(form.get('costPrice') || form.get('sellingPrice') || 0),
          sellingPrice: Number(form.get('sellingPrice')),
          mrp: Number(form.get('mrp')),
          taxPercent: Number(form.get('taxPercent') || 18),
          minStockLevel: Number(form.get('minStockLevel') || 5),
          reorderLevel: Number(form.get('reorderLevel') || 10),
          avatarType: newProdAvatar,
          status: 'ACTIVE',
        });
      }
      setFeedbackMsg(`New product added successfully!`);
      setTimeout(() => setFeedbackMsg(''), 3000);
      setShowAddProductModal(false);
      // Reset
      setNewProdCompany('');
      setNewProdBarcode('');
      setNewProdForm('DRIED');
      setNewProdImageUrl('');
    } catch (err: any) {
      alert('Error creating product: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E76F51]/10 text-[#E76F51] text-xs font-bold mb-1">
            <PawIcon className="w-3.5 h-3.5" />
            <span>Categorized by Company & Dried vs Wet Products</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-[#264653] font-['Fredoka',sans-serif]">
            Inventory & Catalog Management
          </h1>
          <p className="text-xs text-[#7C9082]">
            Visual inventory organized by manufacturer, food form, and stored packaging images
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {feedbackMsg && (
            <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>{feedbackMsg}</span>
            </div>
          )}

          <button
            onClick={() => setShowAddInventoryModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md transition-all cursor-pointer"
            title="Scan barcode or paste from supplier invoice to inward stock"
          >
            <Plus className="w-4 h-4" />
            <span>+ ADD INVENTORY</span>
          </button>

          <button
            onClick={() => setShowQuickScanner(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#264653] hover:bg-[#1E3741] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            title="Scan product barcode with mobile camera"
          >
            <Camera className="w-4 h-4 text-emerald-400" />
            <span>Scan Barcode</span>
          </button>

          {isOwner && (
            <button
              onClick={() => setShowAddProductModal(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#E76F51] hover:bg-[#D95D3E] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Product</span>
            </button>
          )}
        </div>
      </div>



      {/* Control Bar: Branch Selector, Search, Company Filter, Dried/Wet Pill Filter, View Switcher */}
      <div className="p-4 rounded-3xl bg-white border border-[#EADDCE] shadow-xs space-y-3">
        {/* Row 1: Branch context, Search input, and View mode switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Branch filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#5B7065]">Branch:</span>
            {isOwner ? (
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-[#D5C7B8] bg-[#FAF8F5] text-xs font-semibold text-[#264653] focus:ring-2 focus:ring-[#E76F51] focus:outline-hidden"
              >
                <option value="ALL">All 6 Branches (Consolidated)</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.code})
                  </option>
                ))}
              </select>
            ) : (
              <span className="px-3 py-1.5 rounded-xl bg-[#FAF1E8] text-[#E76F51] font-bold text-xs border border-[#E76F51]/20">
                {branches.find((b) => b.id === currentUser.branchId)?.name || 'Assigned Branch'}
              </span>
            )}
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-auto sm:flex-1 sm:max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#7C9082]" />
            <input
              type="text"
              placeholder="Search product, company, brand, SKU, dry/wet..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 sm:py-1.5 rounded-xl border border-[#D5C7B8] bg-[#FAF8F5] text-xs focus:ring-2 focus:ring-[#E76F51] focus:outline-hidden"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center rounded-xl bg-[#F2ECE4] p-1 text-xs font-bold w-full sm:w-auto justify-around sm:justify-start">
            <button
              onClick={() => setViewMode('hierarchy')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                viewMode === 'hierarchy'
                  ? 'bg-white text-[#264653] shadow-xs'
                  : 'text-[#7C9082] hover:text-[#264653]'
              }`}
              title="Hierarchical View: Grouped by Company, with Dried & Wet products under each"
            >
              <Layers className="w-3.5 h-3.5 text-[#E76F51]" />
              <span className="hidden sm:inline">Company & Dried/Wet</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-[#264653] shadow-xs'
                  : 'text-[#7C9082] hover:text-[#264653]'
              }`}
              title="Master Table View with Image Thumbnails"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Master Table</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-[#264653] shadow-xs'
                  : 'text-[#7C9082] hover:text-[#264653]'
              }`}
              title="Visual Cards View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cards</span>
            </button>
          </div>
        </div>

        {/* Row 2: Secondary Filter Bar (Company, Food Form Dried/Wet, Category, Stock Status) */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-[#F2ECE4] text-xs">
          {/* Company Selector */}
          <div className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-[#7C9082]" />
            <span className="font-bold text-[#7C9082]">Company:</span>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-[#D5C7B8] bg-[#FAF8F5] text-xs font-semibold text-[#264653] focus:ring-2 focus:ring-[#E76F51] focus:outline-hidden"
            >
              <option value="ALL">All Companies ({existingCompanies.length})</option>
              {existingCompanies.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Form Filter (Dried / Wet / Other) */}
          <div className="flex items-center gap-1">
            <span className="font-bold text-[#7C9082] mr-0.5">Form:</span>
            <button
              onClick={() => setSelectedProductForm('ALL')}
              className={`px-2.5 py-1 rounded-lg transition-colors font-bold ${
                selectedProductForm === 'ALL'
                  ? 'bg-[#264653] text-white'
                  : 'bg-[#F4EDE4] text-[#5B7065] hover:bg-[#EAE0D3]'
              }`}
            >
              All Forms
            </button>
            <button
              onClick={() => setSelectedProductForm('DRIED')}
              className={`px-2.5 py-1 rounded-lg transition-colors font-bold flex items-center gap-1 ${
                selectedProductForm === 'DRIED'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              <span>🌾</span>
              <span>Dried</span>
            </button>
            <button
              onClick={() => setSelectedProductForm('WET')}
              className={`px-2.5 py-1 rounded-lg transition-colors font-bold flex items-center gap-1 ${
                selectedProductForm === 'WET'
                  ? 'bg-cyan-600 text-white'
                  : 'bg-cyan-50 text-cyan-800 hover:bg-cyan-100 border border-cyan-200'
              }`}
            >
              <span>🥫</span>
              <span>Wet</span>
            </button>
            <button
              onClick={() => setSelectedProductForm('OTHER')}
              className={`px-2.5 py-1 rounded-lg transition-colors font-bold ${
                selectedProductForm === 'OTHER'
                  ? 'bg-stone-600 text-white'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              📦 Supplies
            </button>
          </div>

          {/* Stock Level Filter */}
          <div className="flex items-center gap-1">
            <span className="font-bold text-[#7C9082] mr-0.5">Stock:</span>
            <button
              onClick={() => setSelectedStockStatus('ALL')}
              className={`px-2 py-1 rounded-lg transition-colors font-semibold ${
                selectedStockStatus === 'ALL'
                  ? 'bg-[#264653] text-white'
                  : 'bg-[#F4EDE4] text-[#5B7065] hover:bg-[#EAE0D3]'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedStockStatus('HEALTHY')}
              className={`px-2 py-1 rounded-lg transition-colors font-semibold ${
                selectedStockStatus === 'HEALTHY'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              Healthy
            </button>
            <button
              onClick={() => setSelectedStockStatus('LOW')}
              className={`px-2 py-1 rounded-lg transition-colors font-semibold ${
                selectedStockStatus === 'LOW'
                  ? 'bg-amber-500 text-white'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              Low
            </button>
            <button
              onClick={() => setSelectedStockStatus('OUT')}
              className={`px-2 py-1 rounded-lg transition-colors font-semibold ${
                selectedStockStatus === 'OUT'
                  ? 'bg-red-500 text-white'
                  : 'bg-red-50 text-red-700 hover:bg-red-100'
              }`}
            >
              Out
            </button>
          </div>
        </div>

        {/* View Mode Helper Actions */}
        {viewMode === 'hierarchy' && companyHierarchy.length > 0 && (
          <div className="flex items-center justify-between pt-2 border-t border-[#F2ECE4] text-[11px] text-[#7C9082]">
            <span>
              Showing {companyHierarchy.length} companies with {filteredProducts.length} matching items
            </span>
            <div className="flex items-center gap-2 font-bold">
              <button
                onClick={expandAll}
                className="text-[#E76F51] hover:underline"
              >
                Expand All
              </button>
              <span>•</span>
              <button
                onClick={collapseAll}
                className="text-[#7C9082] hover:underline"
              >
                Collapse All
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main View Display */}
      {filteredProducts.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-[#EADDCE]">
          <PetEmptyState
            title="No Products Found"
            description="Try adjusting your company, dried/wet filter, or search query to find inventory items."
          />
        </div>
      ) : viewMode === 'hierarchy' ? (
        /* HIERARCHICAL VIEW: Grouped by Company -> Dried Products / Wet Products */
        <div className="space-y-4">
          {companyHierarchy.map((group) => {
            const isCollapsed = Boolean(collapsedCompanies[group.companyName]);
            const totalItems =
              group.driedProducts.length +
              group.wetProducts.length +
              group.otherProducts.length;

            return (
              <div
                key={group.companyName}
                className="rounded-3xl bg-white border border-[#EADDCE] shadow-xs overflow-hidden transition-all"
              >
                {/* Company Header Card */}
                <div
                  onClick={() => toggleCompanyCollapse(group.companyName)}
                  className="p-4 sm:p-5 bg-linear-to-r from-[#FAF8F5] via-white to-[#FAF8F5] border-b border-[#F2ECE4] flex flex-wrap items-center justify-between gap-3 cursor-pointer hover:bg-[#F7F3EE] transition-colors select-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#E76F51]/10 text-[#E76F51] flex items-center justify-center font-bold">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base sm:text-lg font-bold text-[#264653] font-['Fredoka',sans-serif]">
                          {group.companyName}
                        </h2>
                        <span className="px-2 py-0.5 rounded-full bg-[#FAF1E8] text-[#E76F51] text-[10px] font-extrabold">
                          {totalItems} Products
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-[#7C9082] mt-0.5">
                        {group.driedProducts.length > 0 && (
                          <span className="flex items-center gap-1 text-amber-800 font-bold">
                            <span>🌾</span> {group.driedProducts.length} Dried
                          </span>
                        )}
                        {group.wetProducts.length > 0 && (
                          <span className="flex items-center gap-1 text-cyan-800 font-bold">
                            <span>🥫</span> {group.wetProducts.length} Wet
                          </span>
                        )}
                        {group.otherProducts.length > 0 && (
                          <span className="flex items-center gap-1 text-stone-700">
                            <span>📦</span> {group.otherProducts.length} Supplies
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <div className="text-xs text-[#7C9082]">Company Stock</div>
                      <div className="font-extrabold text-sm text-[#264653]">
                        {group.totalStock} units ({formatINR(group.totalValue)})
                      </div>
                    </div>

                    <button
                      type="button"
                      className="p-2 rounded-xl text-[#7C9082] hover:text-[#264653] hover:bg-[#F2ECE4] transition-colors"
                      title={isCollapsed ? 'Expand Company' : 'Collapse Company'}
                    >
                      {isCollapsed ? (
                        <ChevronRight className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Company Body Content */}
                {!isCollapsed && (
                  <div className="p-4 sm:p-6 space-y-6">
                    {/* SUB-CATEGORY 1: 🌾 DRIED PRODUCTS */}
                    {group.driedProducts.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 pb-2 border-b border-amber-200">
                          <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-bold">
                            🌾
                          </div>
                          <h3 className="text-sm font-bold text-amber-950 font-['Fredoka',sans-serif]">
                            Dried Products ({group.driedProducts.length})
                          </h3>
                          <span className="text-[11px] text-amber-700">
                            — Kibble, Pellets, Flakes, Dehydrated Jerky & Biscuits
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                          {group.driedProducts.map((p) => (
                            <ProductCardItem
                              key={p.id}
                              product={p}
                              stock={getProductStock(p.id, selectedBranch)}
                              formatINR={formatINR}
                              isOwner={isOwner}
                              onEdit={() => setEditModalProduct(p)}
                              onAddStock={() => setAddStockModalProduct(p)}
                              onAdjustStock={() => setAdjustStockModalProduct(p)}
                              onTransferStock={() => setTransferStockModalProduct(p)}
                              onBreakdown={() => setBreakdownProduct(p)}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* SUB-CATEGORY 2: 🥫 WET PRODUCTS */}
                    {group.wetProducts.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 pb-2 border-b border-cyan-200">
                          <div className="w-6 h-6 rounded-lg bg-cyan-100 text-cyan-800 flex items-center justify-center text-xs font-bold">
                            🥫
                          </div>
                          <h3 className="text-sm font-bold text-cyan-950 font-['Fredoka',sans-serif]">
                            Wet Products ({group.wetProducts.length})
                          </h3>
                          <span className="text-[11px] text-cyan-700">
                            — Gravy Pouches, Canned Tins, Jellied Loaf, Pâté & Stews
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                          {group.wetProducts.map((p) => (
                            <ProductCardItem
                              key={p.id}
                              product={p}
                              stock={getProductStock(p.id, selectedBranch)}
                              formatINR={formatINR}
                              isOwner={isOwner}
                              onEdit={() => setEditModalProduct(p)}
                              onAddStock={() => setAddStockModalProduct(p)}
                              onAdjustStock={() => setAdjustStockModalProduct(p)}
                              onTransferStock={() => setTransferStockModalProduct(p)}
                              onBreakdown={() => setBreakdownProduct(p)}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* SUB-CATEGORY 3: 📦 OTHER SUPPLIES */}
                    {group.otherProducts.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
                          <div className="w-6 h-6 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center text-xs font-bold">
                            📦
                          </div>
                          <h3 className="text-sm font-bold text-[#264653] font-['Fredoka',sans-serif]">
                            Accessories & Care Supplies ({group.otherProducts.length})
                          </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                          {group.otherProducts.map((p) => (
                            <ProductCardItem
                              key={p.id}
                              product={p}
                              stock={getProductStock(p.id, selectedBranch)}
                              formatINR={formatINR}
                              isOwner={isOwner}
                              onEdit={() => setEditModalProduct(p)}
                              onAddStock={() => setAddStockModalProduct(p)}
                              onAdjustStock={() => setAdjustStockModalProduct(p)}
                              onTransferStock={() => setTransferStockModalProduct(p)}
                              onBreakdown={() => setBreakdownProduct(p)}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : viewMode === 'table' ? (
        /* MASTER TABLE VIEW */
        <div className="rounded-3xl bg-white border border-[#EADDCE] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] text-[#5B7065] font-extrabold uppercase text-[10px] tracking-wider border-b border-[#F2ECE4]">
                <tr>
                  <th className="py-3 px-4">Product / Item</th>
                  <th className="py-3 px-4">Company & Brand</th>
                  <th className="py-3 px-4">Classification</th>
                  <th className="py-3 px-4">SKU & Barcode</th>
                  <th className="py-3 px-4 text-right">Selling Price</th>
                  <th className="py-3 px-4 text-center">Stock</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2ECE4]">
                {filteredProducts.map((p) => {
                  const stock = getProductStock(p.id, selectedBranch);
                  const isOutOfStock = stock <= 0;
                  const isLowStock = stock > 0 && stock <= p.reorderLevel;

                  return (
                    <tr key={p.id} className="hover:bg-[#FAF8F5] transition-colors">
                      {/* Avatar & Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <ProductImageThumb
                            src={getProductImageUrl(p)}
                            alt={p.name}
                            brand={p.brand || p.company}
                            company={p.company || p.brand}
                            avatarType={p.avatarType}
                            productForm={p.productForm}
                            size="sm"
                          />
                          <div>
                            <span className="font-bold text-[#264653] line-clamp-1">
                              {p.name}
                            </span>
                            <span className="text-[10px] text-[#7C9082]">
                              {p.category} • {p.unit}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Company & Brand */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#264653]">
                          {p.company || p.brand}
                        </div>
                        {p.company && p.brand && p.company !== p.brand && (
                          <div className="text-[10px] text-[#7C9082]">{p.brand}</div>
                        )}
                      </td>

                      {/* Dried or Wet Classification */}
                      <td className="py-3 px-4">
                        <ProductFormBadge form={p.productForm} size="sm" />
                      </td>

                      {/* SKU & Barcode */}
                      <td className="py-3 px-4 font-mono text-[11px]">
                        <div className="font-bold text-[#264653]">{p.sku}</div>
                        <div className="text-[10px] text-[#7C9082]">{p.barcode}</div>
                      </td>

                      {/* Selling Price */}
                      <td className="py-3 px-4 text-right font-bold text-[#264653]">
                        {formatINR(p.sellingPrice)}
                        <span className="block text-[9px] text-[#7C9082]">MRP: {formatINR(p.mrp)}</span>
                      </td>

                      {/* Stock Badge */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                            isOutOfStock
                              ? 'bg-red-100 text-red-700'
                              : isLowStock
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {stock} in stock
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {isOwner && (
                            <button
                              onClick={() => setEditModalProduct(p)}
                              className="p-1.5 rounded-lg text-[#5B7065] hover:bg-[#F2ECE4] hover:text-[#264653] transition-colors"
                              title="Edit Image, Company & Details"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => setAddStockModalProduct(p)}
                            className="p-1.5 rounded-lg text-[#E76F51] hover:bg-[#FAF1E8] transition-colors"
                            title="Add / Inward Stock"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setTransferStockModalProduct(p)}
                            className="p-1.5 rounded-lg text-[#2A9D8F] hover:bg-[#EDF7F6] transition-colors"
                            title="Transfer Stock"
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setBreakdownProduct(p)}
                            className="p-1.5 rounded-lg text-[#264653] hover:bg-[#F2ECE4] transition-colors"
                            title="6-Branch Breakdown"
                          >
                            <Building2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* VISUAL CARDS GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((p) => (
            <ProductCardItem
              key={p.id}
              product={p}
              stock={getProductStock(p.id, selectedBranch)}
              formatINR={formatINR}
              isOwner={isOwner}
              onEdit={() => setEditModalProduct(p)}
              onAddStock={() => setAddStockModalProduct(p)}
              onAdjustStock={() => setAdjustStockModalProduct(p)}
              onTransferStock={() => setTransferStockModalProduct(p)}
              onBreakdown={() => setBreakdownProduct(p)}
            />
          ))}
        </div>
      )}

      {/* EDIT PRODUCT MODAL */}
      <EditProductModal
        isOpen={Boolean(editModalProduct)}
        onClose={() => setEditModalProduct(null)}
        product={editModalProduct}
        existingCompanies={existingCompanies}
        onSave={async (productId, updates) => {
          if (onUpdateProduct) {
            await onUpdateProduct(productId, updates);
            setFeedbackMsg('Product details and image updated successfully!');
            setTimeout(() => setFeedbackMsg(''), 3000);
          }
        }}
      />

      {/* ADD / REGISTER PRODUCT MODAL */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative bg-white rounded-3xl max-w-2xl w-full border border-[#EADDCE] shadow-2xl overflow-hidden my-8">
            <div className="p-5 border-b border-[#F2ECE4] flex items-center justify-between bg-[#FAF8F5]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#E76F51]/10 text-[#E76F51] flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#264653] font-['Fredoka',sans-serif]">
                    Register New Product
                  </h3>
                  <p className="text-[11px] text-[#7C9082]">
                    Add product with image, company, and dried/wet classification
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddProductModal(false)}
                className="p-1.5 rounded-full hover:bg-black/5 text-[#7C9082]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleCreateProductSubmit}
              className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs"
            >
              {/* Company & Form Classification Box */}
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EADDCE] space-y-3">
                <div className="flex items-center gap-1.5 font-bold text-[#264653] uppercase text-[11px]">
                  <Building2 className="w-3.5 h-3.5 text-[#E76F51]" />
                  <span>Company Categorization & Food Form</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold mb-1">Company / Manufacturer *</label>
                    <input
                      type="text"
                      list="add-companies"
                      value={newProdCompany}
                      onChange={(e) => setNewProdCompany(e.target.value)}
                      placeholder="e.g. Royal Canin, Pedigree (Mars)"
                      required
                      className="w-full px-3 py-2 rounded-xl border border-[#D5C7B8] bg-white focus:ring-2 focus:ring-[#E76F51] focus:outline-hidden"
                    />
                    <datalist id="add-companies">
                      {existingCompanies.map((c) => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label className="block font-bold mb-1">Brand Name *</label>
                    <input
                      type="text"
                      name="brand"
                      required
                      defaultValue={newProdCompany}
                      placeholder="e.g. Royal Canin"
                      className="w-full px-3 py-2 rounded-xl border border-[#D5C7B8] bg-white focus:ring-2 focus:ring-[#E76F51] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold mb-1">Product Form (Under Company) *</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewProdForm('DRIED')}
                      className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                        newProdForm === 'DRIED'
                          ? 'border-amber-500 bg-amber-50/90 ring-2 ring-amber-400'
                          : 'border-[#D5C7B8] bg-white hover:border-amber-400'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-base">🌾</span>
                        {newProdForm === 'DRIED' && <Check className="w-3.5 h-3.5 text-amber-600" />}
                      </div>
                      <span className="font-bold text-[#264653]">Dried Product</span>
                      <span className="text-[9px] text-[#7C9082]">Kibble, Dry Food, Pellets</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setNewProdForm('WET')}
                      className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                        newProdForm === 'WET'
                          ? 'border-cyan-500 bg-cyan-50/90 ring-2 ring-cyan-400'
                          : 'border-[#D5C7B8] bg-white hover:border-cyan-400'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-base">🥫</span>
                        {newProdForm === 'WET' && <Check className="w-3.5 h-3.5 text-cyan-600" />}
                      </div>
                      <span className="font-bold text-[#264653]">Wet Product</span>
                      <span className="text-[9px] text-[#7C9082]">Gravy, Pouch, Loaf, Can</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setNewProdForm('OTHER')}
                      className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                        newProdForm === 'OTHER'
                          ? 'border-stone-500 bg-stone-100 ring-2 ring-stone-400'
                          : 'border-[#D5C7B8] bg-white hover:border-stone-400'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-base">📦</span>
                        {newProdForm === 'OTHER' && <Check className="w-3.5 h-3.5 text-stone-700" />}
                      </div>
                      <span className="font-bold text-[#264653]">Other / Supplies</span>
                      <span className="text-[9px] text-[#7C9082]">Accessories, Toys</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Section: Barcode Number */}
              <div className="p-4 rounded-2xl bg-[#E76F51]/5 border border-[#E76F51]/30 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-[#E76F51] flex items-center gap-1.5">
                    <Barcode className="w-4 h-4" />
                    <span>Barcode Number (EAN-13 / UPC)</span>
                  </label>
                  <span className="text-[10px] text-[#7C9082]">Scannable at POS counter</span>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={newProdBarcode}
                      onChange={(e) => setNewProdBarcode(e.target.value)}
                      placeholder="e.g. 8901234567890 (or click Generate)"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#D5C7B8] bg-white font-mono font-bold text-xs text-[#264653] focus:ring-2 focus:ring-[#E76F51] focus:outline-hidden"
                    />
                    <Barcode className="w-4 h-4 text-[#7C9082] absolute left-3 top-2.5" />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setShowRegisterScanner(true)}
                      className="px-3 py-2 rounded-xl bg-white border border-[#D5C7B8] hover:bg-[#FAF8F5] text-[#E76F51] font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                      title="Scan barcode with camera"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Scan</span>
                    </button>

                    <button
                      type="button"
                      onClick={generateNewProdEan}
                      className="px-3 py-2 rounded-xl bg-white border border-[#D5C7B8] hover:bg-[#FAF8F5] text-[#264653] font-semibold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                      title="Generate Indian GS1 EAN-13 barcode"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Generate</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Product Image Selection */}
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EADDCE] space-y-2">
                <label className="text-xs font-bold text-[#264653] mb-1 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-[#E76F51]" />
                  <span>Product Image (Upload Photo, Pick Packshot, or Paste URL)</span>
                </label>
                <ImageUploadPicker
                  value={newProdImageUrl}
                  onChange={(url) => setNewProdImageUrl(url)}
                  brandHint={newProdCompany}
                  formHint={newProdForm}
                />
              </div>

              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold mb-1">Product Title *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="e.g. Royal Canin Maxi Adult Dog Food 15kg"
                    className="w-full px-3 py-2 rounded-xl border border-[#D5C7B8] focus:ring-2 focus:ring-[#E76F51] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Category *</label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-[#D5C7B8] focus:ring-2 focus:ring-[#E76F51] focus:outline-hidden"
                  >
                    <option value="Dog Food">Dog Food</option>
                    <option value="Cat Food">Cat Food</option>
                    <option value="Pet Treats">Pet Treats</option>
                    <option value="Bird Food">Bird Food</option>
                    <option value="Fish Food">Fish Food</option>
                    <option value="Toys">Toys</option>
                    <option value="Leashes & Collars">Leashes & Collars</option>
                    <option value="Beds & Mats">Beds & Mats</option>
                    <option value="Grooming">Grooming</option>
                    <option value="Medicines & Care">Medicines & Care</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Aquarium Products">Aquarium Products</option>
                    <option value="Bird Accessories">Bird Accessories</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1">Unit of Measurement *</label>
                  <input
                    type="text"
                    name="unit"
                    defaultValue="packet"
                    placeholder="e.g. 15kg, 85g pouch, can"
                    className="w-full px-3 py-2 rounded-xl border border-[#D5C7B8] focus:ring-2 focus:ring-[#E76F51] focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    name="sellingPrice"
                    step="0.01"
                    required
                    placeholder="e.g. 1599"
                    className="w-full px-3 py-2 rounded-xl border border-[#D5C7B8] focus:ring-2 focus:ring-[#E76F51] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">MRP (₹) *</label>
                  <input
                    type="number"
                    name="mrp"
                    step="0.01"
                    required
                    placeholder="e.g. 1750"
                    className="w-full px-3 py-2 rounded-xl border border-[#D5C7B8] focus:ring-2 focus:ring-[#E76F51] focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Animal Avatar & Reorder */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Pet Representation</label>
                  <select
                    value={newProdAvatar}
                    onChange={(e) => setNewProdAvatar(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-[#D5C7B8] focus:ring-2 focus:ring-[#E76F51] focus:outline-hidden"
                  >
                    <option value="dog">🐶 Dog</option>
                    <option value="cat">🐱 Cat</option>
                    <option value="bird">🦜 Bird</option>
                    <option value="fish">🐠 Fish</option>
                    <option value="rabbit">🐰 Rabbit</option>
                    <option value="hamster">🐹 Hamster</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1">Target Reorder Level</label>
                  <input
                    type="number"
                    name="reorderLevel"
                    defaultValue="10"
                    className="w-full px-3 py-2 rounded-xl border border-[#D5C7B8] focus:ring-2 focus:ring-[#E76F51] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F2ECE4]">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-4 py-2 rounded-xl font-bold text-[#7C9082] hover:bg-[#F2ECE4]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl font-bold bg-[#E76F51] hover:bg-[#D95D3E] text-white shadow-xs"
                >
                  {actionLoading ? 'Saving...' : 'Save to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD / INWARD STOCK MODAL */}
      {addStockModalProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-[#EADDCE] shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-[#264653] font-['Fredoka',sans-serif]">
                  Inward Stock (Purchase Entry)
                </h3>
                <p className="text-xs text-[#7C9082]">{addStockModalProduct.name}</p>
              </div>
              <button
                onClick={() => setAddStockModalProduct(null)}
                className="p-1 rounded-full hover:bg-black/5 text-[#7C9082]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStockSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1 text-[#264653]">Destination Branch</label>
                <select
                  name="branchId"
                  defaultValue={selectedBranch === 'ALL' ? branches[0]?.id : selectedBranch}
                  className="w-full px-3 py-2 rounded-xl border border-[#D5C7B8] focus:ring-2 focus:ring-[#E76F51] focus:outline-hidden"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1 text-[#264653]">Quantity Received</label>
                <input
                  type="number"
                  name="quantity"
                  min="1"
                  required
                  placeholder="e.g. 20"
                  className="w-full px-3 py-2 rounded-xl border border-[#D5C7B8] focus:ring-2 focus:ring-[#E76F51] focus:outline-hidden"
                />
                <input
                  type="hidden"
                  name="purchasePrice"
                  value={addStockModalProduct.purchasePrice || addStockModalProduct.costPrice || addStockModalProduct.sellingPrice || 0}
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-[#264653]">Supplier / Vendor</label>
                <input
                  type="text"
                  name="supplierName"
                  defaultValue={addStockModalProduct.supplierName || 'Official Distributor'}
                  className="w-full px-3 py-2 rounded-xl border border-[#D5C7B8] focus:ring-2 focus:ring-[#E76F51] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-[#264653]">Invoice / Bill Ref #</label>
                <input
                  type="text"
                  name="purchaseBillNumber"
                  placeholder="e.g. INV-2026-098"
                  className="w-full px-3 py-2 rounded-xl border border-[#D5C7B8] focus:ring-2 focus:ring-[#E76F51] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-[#264653]">Audit Notes</label>
                <textarea
                  name="notes"
                  rows={2}
                  placeholder="Optional inward notes..."
                  className="w-full px-3 py-2 rounded-xl border border-[#D5C7B8] focus:ring-2 focus:ring-[#E76F51] focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F2ECE4]">
                <button
                  type="button"
                  onClick={() => setAddStockModalProduct(null)}
                  className="px-4 py-2 rounded-xl font-bold text-[#7C9082] hover:bg-[#F2ECE4]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl font-bold bg-[#E76F51] hover:bg-[#D95D3E] text-white shadow-xs"
                >
                  {actionLoading ? 'Recording...' : 'Confirm Inward'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADJUST STOCK MODAL */}
      {adjustStockModalProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-[#EADDCE] shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-[#264653] font-['Fredoka',sans-serif]">
                  Manual Stock Adjustment
                </h3>
                <p className="text-xs text-[#7C9082]">{adjustStockModalProduct.name}</p>
              </div>
              <button
                onClick={() => setAdjustStockModalProduct(null)}
                className="p-1 rounded-full hover:bg-black/5 text-[#7C9082]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustStockSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1 text-[#264653]">Branch Location</label>
                <select
                  name="branchId"
                  defaultValue={selectedBranch === 'ALL' ? branches[0]?.id : selectedBranch}
                  className="w-full px-3 py-2 rounded-xl border border-[#D5C7B8] focus:ring-2 focus:ring-[#E76F51] focus:outline-hidden"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1 text-[#264653]">New Verified Physical Count</label>
                <input
                  type="number"
                  name="newQuantity"
                  min="0"
                  required
                  placeholder="e.g. 15"
                  className="w-full px-3 py-2 rounded-xl border border-[#D5C7B8] focus:ring-2 focus:ring-[#E76F51] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-[#264653]">Reason for Variance</label>
                <select
                  name="reason"
                  className="w-full px-3 py-2 rounded-xl border border-[#D5C7B8] focus:ring-2 focus:ring-[#E76F51] focus:outline-hidden"
                >
                  <option value="Physical Audit Count">Physical Audit Count</option>
                  <option value="Damaged Stock Write-off">Damaged Stock Write-off</option>
                  <option value="Expired Product">Expired Product</option>
                  <option value="Sample / Tester Demonstration">Sample / Tester</option>
                  <option value="Theft or Shrinkage">Theft / Shrinkage</option>
                  <option value="Correction of Entry Error">Data Entry Correction</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F2ECE4]">
                <button
                  type="button"
                  onClick={() => setAdjustStockModalProduct(null)}
                  className="px-4 py-2 rounded-xl font-bold text-[#7C9082] hover:bg-[#F2ECE4]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl font-bold bg-[#E76F51] hover:bg-[#D95D3E] text-white shadow-xs"
                >
                  {actionLoading ? 'Updating...' : 'Apply Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TRANSFER STOCK MODAL */}
      {transferStockModalProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-[#EADDCE] shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-[#264653] font-['Fredoka',sans-serif]">
                  Inter-Branch Stock Transfer
                </h3>
                <p className="text-xs text-[#7C9082]">{transferStockModalProduct.name}</p>
              </div>
              <button
                onClick={() => setTransferStockModalProduct(null)}
                className="p-1 rounded-full hover:bg-black/5 text-[#7C9082]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTransferStockSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1 text-[#264653]">From Branch</label>
                  <select
                    name="fromBranchId"
                    defaultValue={branches[0]?.id}
                    className="w-full px-3 py-2 rounded-xl border border-[#D5C7B8] focus:ring-2 focus:ring-[#E76F51] focus:outline-hidden"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1 text-[#264653]">To Branch</label>
                  <select
                    name="toBranchId"
                    defaultValue={branches[1]?.id}
                    className="w-full px-3 py-2 rounded-xl border border-[#D5C7B8] focus:ring-2 focus:ring-[#E76F51] focus:outline-hidden"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1 text-[#264653]">Transfer Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  min="1"
                  required
                  placeholder="e.g. 5"
                  className="w-full px-3 py-2 rounded-xl border border-[#D5C7B8] focus:ring-2 focus:ring-[#E76F51] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-[#264653]">Transfer Purpose</label>
                <input
                  type="text"
                  name="reason"
                  placeholder="e.g. Evening peak replenishment"
                  defaultValue="Rebalance branch inventory levels"
                  className="w-full px-3 py-2 rounded-xl border border-[#D5C7B8] focus:ring-2 focus:ring-[#E76F51] focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F2ECE4]">
                <button
                  type="button"
                  onClick={() => setTransferStockModalProduct(null)}
                  className="px-4 py-2 rounded-xl font-bold text-[#7C9082] hover:bg-[#F2ECE4]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl font-bold bg-[#E76F51] hover:bg-[#D95D3E] text-white shadow-xs"
                >
                  {actionLoading ? 'Dispatching...' : 'Dispatch Transfer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6-BRANCH DISTRIBUTION BREAKDOWN MODAL */}
      {breakdownProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-[#EADDCE] shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <ProductImageThumb
                  src={getProductImageUrl(breakdownProduct)}
                  alt={breakdownProduct.name}
                  avatarType={breakdownProduct.avatarType}
                  productForm={breakdownProduct.productForm}
                  size="sm"
                />
                <div>
                  <h3 className="font-bold text-base text-[#264653] font-['Fredoka',sans-serif]">
                    6-Branch Distribution
                  </h3>
                  <p className="text-xs text-[#7C9082]">{breakdownProduct.name}</p>
                </div>
              </div>
              <button
                onClick={() => setBreakdownProduct(null)}
                className="p-1 rounded-full hover:bg-black/5 text-[#7C9082]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#EADDCE] flex items-center justify-between text-xs">
              <div>
                <span className="text-[#7C9082]">Company: </span>
                <span className="font-bold text-[#264653]">
                  {breakdownProduct.company || breakdownProduct.brand}
                </span>
              </div>
              <ProductFormBadge form={breakdownProduct.productForm} size="sm" />
            </div>

            <div className="divide-y divide-[#F2ECE4] border border-[#EADDCE] rounded-2xl overflow-hidden">
              {getProductStockBreakdown(breakdownProduct.id).map((b) => (
                <div
                  key={b.branch.id}
                  className="flex items-center justify-between p-3 text-xs hover:bg-[#FAF8F5] transition-colors"
                >
                  <div>
                    <div className="font-bold text-[#264653]">{b.branch.name}</div>
                    <div className="text-[10px] text-[#7C9082]">{b.branch.address}</div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full font-extrabold text-[10px] ${
                        b.quantity <= 0
                          ? 'bg-red-100 text-red-700'
                          : b.quantity <= breakdownProduct.reorderLevel
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {b.quantity} in stock
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#F2ECE4] text-xs">
              <span className="font-bold text-[#7C9082]">Total Consolidated Stock</span>
              <span className="font-extrabold text-[#264653] text-sm">
                {getProductStock(breakdownProduct.id, 'ALL')} units
              </span>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setBreakdownProduct(null)}
                className="px-4 py-1.5 rounded-xl font-bold text-xs bg-[#264653] text-white hover:bg-[#1e3742]"
              >
                Close Breakdown
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD INVENTORY FROM SUPPLIER INVOICE (STOCK MANAGER DEDICATED MODAL) */}
      <AddInventoryModal
        isOpen={showAddInventoryModal}
        onClose={() => setShowAddInventoryModal(false)}
        products={products}
        branches={branches}
        suppliers={suppliers}
        currentBranchId={selectedBranch === 'ALL' ? (branches[0]?.id || 'branch-1') : selectedBranch}
        onStockInward={async (data) => {
          try {
            const inwardFn = onStockInward || onAddStock;
            if (inwardFn) {
              await inwardFn(data);
              setFeedbackMsg(`Stock inward successful!`);
              setTimeout(() => setFeedbackMsg(''), 3000);
              return { success: true };
            }
            return { success: false, message: 'Stock inward handler not available' };
          } catch (err: any) {
            return { success: false, message: err.message || 'Failed to inward stock' };
          }
        }}
        onCreateProductAndStock={async (productData) => {
          try {
            if (onCreateProduct) {
              await onCreateProduct(productData);
              setFeedbackMsg(`Product created and stock added!`);
              setTimeout(() => setFeedbackMsg(''), 3000);
              return { success: true };
            }
            return { success: false, message: 'Create product handler not available' };
          } catch (err: any) {
            return { success: false, message: err.message || 'Failed to create product' };
          }
        }}
        onBulkImportCsv={async (items, branchId) => {
          try {
            if (onBulkImportCsv) {
              const res = await onBulkImportCsv(items, branchId);
              setFeedbackMsg(`Bulk import completed successfully!`);
              setTimeout(() => setFeedbackMsg(''), 3000);
              return { success: true, message: res?.message };
            }
            return { success: false, message: 'Bulk import handler not configured' };
          } catch (err: any) {
            return { success: false, message: err.message || 'Import error' };
          }
        }}
      />

      {/* QUICK BARCODE SCANNER MODAL */}
      <BarcodeScannerModal
        isOpen={showQuickScanner}
        onClose={() => setShowQuickScanner(false)}
        continuous={false}
        products={products}
        title="Scan Barcode to Filter Inventory"
        subtitle="Point mobile camera at product barcode to locate in stock"
        demoBarcodes={products.slice(0, 6).map((p) => ({ barcode: p.barcode, name: p.name }))}
        onScan={(scanned) => {
          setSearchQuery(scanned);
          setShowQuickScanner(false);
          setFeedbackMsg(`Filtered catalog by barcode: ${scanned}`);
          setTimeout(() => setFeedbackMsg(''), 3000);
        }}
        onOpenAddProductWithBarcode={(code) => {
          setNewProdBarcode(code);
          setShowAddProductModal(true);
        }}
      />

      {/* REGISTER PRODUCT BARCODE SCANNER MODAL */}
      <BarcodeScannerModal
        isOpen={showRegisterScanner}
        onClose={() => setShowRegisterScanner(false)}
        continuous={false}
        products={products}
        title="Scan Barcode for New Product"
        subtitle="Point mobile camera at product barcode to auto-fill barcode field"
        demoBarcodes={products.slice(0, 6).map((p) => ({ barcode: p.barcode, name: p.name }))}
        onScan={(scanned) => {
          setNewProdBarcode(scanned);
          setShowRegisterScanner(false);
          setFeedbackMsg(`Scanned barcode: ${scanned}`);
          setTimeout(() => setFeedbackMsg(''), 3000);
        }}
      />
    </div>
  );
};

// Reusable Product Card Component used in Hierarchy View and Grid View
interface ProductCardItemProps {
  product: Product;
  stock: number;
  formatINR: (val?: number | null) => string;
  isOwner: boolean;
  onEdit: () => void;
  onAddStock: () => void;
  onAdjustStock: () => void;
  onTransferStock: () => void;
  onBreakdown: () => void;
}

const ProductCardItem: React.FC<ProductCardItemProps> = ({
  product,
  stock,
  formatINR,
  isOwner,
  onEdit,
  onAddStock,
  onAdjustStock,
  onTransferStock,
  onBreakdown,
}) => {
  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= product.reorderLevel;

  return (
    <div className="group rounded-2xl bg-white border border-[#EADDCE] p-3.5 hover:border-[#E76F51] hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        {/* Top bar with Avatar, Brand & Stock Status */}
        <div className="flex items-start gap-3 mb-2.5">
          <ProductImageThumb
            src={getProductImageUrl(product)}
            alt={product.name}
            brand={product.brand || product.company}
            company={product.company || product.brand}
            avatarType={product.avatarType}
            productForm={product.productForm}
            size="md"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="text-[10px] font-bold text-[#E76F51] uppercase tracking-wider truncate">
                {product.brand || product.company}
              </span>
              <span
                className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded shrink-0 ${
                  isOutOfStock
                    ? 'bg-red-100 text-red-700'
                    : isLowStock
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {stock} in stock
              </span>
            </div>

            <h4
              className="font-bold text-xs text-[#264653] leading-snug line-clamp-2"
              title={product.name}
            >
              {product.name}
            </h4>

            <div className="flex items-center gap-1.5 mt-1">
              <ProductFormBadge form={product.productForm} size="sm" />
              <span className="text-[10px] text-[#7C9082]">• {product.unit}</span>
            </div>
          </div>
        </div>

        {/* Pricing & Barcode */}
        <div className="pt-2 border-t border-[#F2ECE4] flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] text-[#7C9082] block">Retail Price</span>
            <span className="font-extrabold text-[#264653]">
              {formatINR(product.sellingPrice)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-[#7C9082] block">MRP: {formatINR(product.mrp)}</span>
            <span className="text-[10px] font-mono text-[#7C9082]">{product.sku}</span>
          </div>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="mt-3 pt-2 border-t border-[#F2ECE4] flex items-center justify-between gap-1">
        <div className="flex items-center gap-1">
          {isOwner && (
            <button
              onClick={onEdit}
              className="px-2 py-1 rounded-lg bg-[#FAF8F5] hover:bg-[#F2ECE4] text-[#5B7065] text-[11px] font-bold flex items-center gap-1 transition-colors"
              title="Edit image, company, dried/wet status, prices"
            >
              <Edit2 className="w-3 h-3 text-[#E76F51]" />
              <span>Edit</span>
            </button>
          )}

          <button
            onClick={onBreakdown}
            className="p-1.5 rounded-lg text-[#7C9082] hover:bg-[#F2ECE4] hover:text-[#264653] transition-colors"
            title="View 6-branch stock allocation"
          >
            <Building2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onAddStock}
            className="px-2 py-1 rounded-lg bg-[#FAF1E8] hover:bg-[#E76F51] hover:text-white text-[#E76F51] text-[11px] font-bold flex items-center gap-0.5 transition-colors"
            title="Inward / Add Stock"
          >
            <Plus className="w-3 h-3" />
            <span>Inward</span>
          </button>
          <button
            onClick={onTransferStock}
            className="p-1.5 rounded-lg text-[#2A9D8F] hover:bg-[#EDF7F6] transition-colors"
            title="Transfer to branch"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
