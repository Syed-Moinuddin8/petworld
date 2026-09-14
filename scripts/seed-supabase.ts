import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Error: Please provide SUPABASE_URL and SUPABASE_ANON_KEY as environment variables.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function seed() {
  const dbFile = path.join(process.cwd(), 'data', 'petworld_db.json');
  if (!fs.existsSync(dbFile)) {
    console.error('Database file petworld_db.json not found!');
    return;
  }

  const raw = fs.readFileSync(dbFile, 'utf-8');
  const data = JSON.parse(raw);

  console.log('Pushing data to Supabase...');

  if (data.branches) {
    console.log(`Pushing ${data.branches.length} branches...`);
    await supabase.from('branches').upsert(data.branches.map((b: any) => ({
      id: b.id,
      code: b.code,
      name: b.name,
      address: b.address,
      city: b.city,
      phone: b.phone,
      email: b.email,
      manager_name: b.managerName,
      status: b.status,
      opening_date: b.openingDate,
      tax_rate: b.taxRate,
      gstin: b.gstin,
    })));
  }

  if (data.products) {
    console.log(`Pushing ${data.products.length} products...`);
    await supabase.from('products').upsert(data.products.map((p: any) => ({
      id: p.id,
      sku: p.sku,
      barcode: p.barcode,
      name: p.name,
      category: p.category,
      brand: p.brand,
      company: p.company,
      unit: p.unit,
      product_form: p.productForm,
      purchase_price: p.purchasePrice,
      selling_price: p.sellingPrice,
      mrp: p.mrp,
      tax_percent: p.taxPercent,
      min_stock_level: p.minStockLevel,
      reorder_level: p.reorderLevel,
      supplier_id: p.supplierId,
      supplier_name: p.supplierName,
      avatar_type: p.avatarType,
      image_url: p.imageUrl,
      status: p.status,
    })));
  }

  if (data.inventory) {
    console.log(`Pushing ${data.inventory.length} inventory records...`);
    await supabase.from('branch_inventory').upsert(data.inventory.map((i: any) => ({
      id: i.id || `inv-${i.branchId}-${i.productId}`,
      branch_id: i.branchId,
      product_id: i.productId,
      quantity: i.quantity,
      last_updated: i.lastUpdated || new Date().toISOString(),
    })));
  }

  if (data.suppliers) {
    console.log(`Pushing ${data.suppliers.length} suppliers...`);
    await supabase.from('suppliers').upsert(data.suppliers.map((s: any) => ({
      id: s.id,
      name: s.name,
      contact_person: s.contactPerson,
      phone: s.phone,
      email: s.email,
      city: s.city,
      address: s.address,
      gstin: s.gstin,
      payment_terms: s.paymentTerms,
      rating: s.rating,
    })));
  }

  if (data.staff) {
    console.log(`Pushing ${data.staff.length} staff members...`);
    await supabase.from('staff').upsert(data.staff.map((st: any) => ({
      id: st.id,
      staff_code: st.staffCode,
      username: st.username,
      name: st.name,
      designation: st.designation,
      role: st.role,
      branch_id: st.branchId,
      branch_name: st.branchName,
      phone: st.phone,
      email: st.email,
      basic_salary: st.basicSalary,
      joining_date: st.joiningDate,
      status: st.status,
      avatar_type: st.avatarType,
    })));
  }

  if (data.sales) {
    console.log(`Pushing ${data.sales.length} sales receipts...`);
    await supabase.from('sales').upsert(data.sales.map((s: any) => ({
      id: s.id,
      invoice_number: s.invoiceNumber,
      branch_id: s.branchId,
      branch_name: s.branchName,
      staff_id: s.staffId,
      staff_name: s.staffName,
      customer_name: s.customerName,
      customer_phone: s.customerPhone,
      subtotal: s.subtotal,
      tax_amount: s.taxAmount,
      grand_total: s.grandTotal,
      payment_method: s.paymentMethod,
      date: s.date,
      time: s.time,
      timestamp: s.timestamp,
      status: s.status,
      items: s.items,
    })));
  }

  if (data.settings) {
    console.log('Pushing application settings...');
    await supabase.from('settings').upsert([{
      id: 'app_settings',
      business_name: data.settings.businessName,
      tagline: data.settings.tagline,
      head_office_address: data.settings.headOfficeAddress,
      head_office_phone: data.settings.headOfficePhone,
      gstin: data.settings.gstin,
      invoice_prefix: data.settings.invoicePrefix,
      receipt_footer: data.settings.receiptFooter,
      thermal_width: data.settings.thermalWidth,
      currency_symbol: data.settings.currencySymbol,
      default_tax_rate: data.settings.defaultTaxRate,
    }]);
  }

  console.log('Successfully pushed database to Supabase!');
}

seed().catch((err) => {
  console.error('Error seeding to Supabase:', err);
});

