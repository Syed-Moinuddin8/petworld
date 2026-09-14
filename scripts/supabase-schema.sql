-- Supabase Schema for Pet World Billing & POS Software
CREATE TABLE IF NOT EXISTS public.branches (id TEXT PRIMARY KEY, code TEXT NOT NULL, name TEXT NOT NULL, address TEXT, city TEXT, phone TEXT, email TEXT, manager_name TEXT, status TEXT DEFAULT 'ACTIVE', opening_date TEXT, tax_rate NUMERIC DEFAULT 18, gstin TEXT);
CREATE TABLE IF NOT EXISTS public.products (id TEXT PRIMARY KEY, sku TEXT UNIQUE NOT NULL, barcode TEXT, name TEXT NOT NULL, category TEXT, brand TEXT, company TEXT, unit TEXT, product_form TEXT, purchase_price NUMERIC, selling_price NUMERIC NOT NULL, mrp NUMERIC NOT NULL, tax_percent NUMERIC DEFAULT 18, min_stock_level INT DEFAULT 5, reorder_level INT DEFAULT 10, supplier_id TEXT, supplier_name TEXT, avatar_type TEXT, image_url TEXT, status TEXT DEFAULT 'ACTIVE');
CREATE TABLE IF NOT EXISTS public.branch_inventory (id TEXT PRIMARY KEY, branch_id TEXT NOT NULL, product_id TEXT NOT NULL, quantity INT DEFAULT 0, last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE (branch_id, product_id));
CREATE TABLE IF NOT EXISTS public.suppliers (id TEXT PRIMARY KEY, name TEXT NOT NULL, contact_person TEXT, phone TEXT, email TEXT, city TEXT, address TEXT, gstin TEXT, payment_terms TEXT, rating NUMERIC);
CREATE TABLE IF NOT EXISTS public.staff (id TEXT PRIMARY KEY, staff_code TEXT NOT NULL, username TEXT UNIQUE NOT NULL, name TEXT NOT NULL, designation TEXT, role TEXT NOT NULL, branch_id TEXT, branch_name TEXT, phone TEXT, email TEXT, basic_salary NUMERIC, joining_date TEXT, status TEXT DEFAULT 'ACTIVE', avatar_type TEXT);
CREATE TABLE IF NOT EXISTS public.purchases (id TEXT PRIMARY KEY, purchase_number TEXT UNIQUE NOT NULL, supplier_id TEXT, supplier_name TEXT, purchase_date TEXT, branch_id TEXT, branch_name TEXT, subtotal NUMERIC, tax_amount NUMERIC, grand_total NUMERIC, payment_status TEXT, status TEXT, items JSONB);
CREATE TABLE IF NOT EXISTS public.purchase_bills (id TEXT PRIMARY KEY, bill_number TEXT NOT NULL, purchase_id TEXT, purchase_reference TEXT, supplier_id TEXT, supplier_name TEXT, invoice_date TEXT, invoice_amount NUMERIC, payment_status TEXT, file_name TEXT, file_url TEXT, notes TEXT);
CREATE TABLE IF NOT EXISTS public.purchase_allocations (id TEXT PRIMARY KEY, purchase_id TEXT, purchase_number TEXT, product_id TEXT, product_name TEXT, sku TEXT, total_purchased INT, allocations JSONB, allocated_by TEXT, date TEXT, time TEXT, timestamp BIGINT, notes TEXT);
CREATE TABLE IF NOT EXISTS public.sales (id TEXT PRIMARY KEY, invoice_number TEXT UNIQUE NOT NULL, branch_id TEXT, branch_name TEXT, staff_id TEXT, staff_name TEXT, customer_name TEXT, customer_phone TEXT, subtotal NUMERIC, tax_amount NUMERIC, grand_total NUMERIC, payment_method TEXT, date TEXT, time TEXT, timestamp BIGINT, status TEXT, items JSONB);
CREATE TABLE IF NOT EXISTS public.stock_movements (id TEXT PRIMARY KEY, product_id TEXT, product_name TEXT, sku TEXT, branch_id TEXT, branch_name TEXT, previous_quantity INT, quantity_added INT, quantity_removed INT, new_quantity INT, operation_type TEXT, reason TEXT, reference_number TEXT, user_name TEXT, user_role TEXT, date TEXT, time TEXT, timestamp BIGINT);
CREATE TABLE IF NOT EXISTS public.attendance (id TEXT PRIMARY KEY, date TEXT, staff_id TEXT, staff_name TEXT, branch_id TEXT, branch_name TEXT, login_time TEXT, logout_time TEXT, status TEXT, remarks TEXT);
CREATE TABLE IF NOT EXISTS public.salaries (id TEXT PRIMARY KEY, staff_id TEXT, staff_name TEXT, branch_id TEXT, branch_name TEXT, month TEXT, basic_salary NUMERIC, allowances NUMERIC, deductions NUMERIC, bonus NUMERIC, overtime NUMERIC, advance NUMERIC, net_salary NUMERIC, payment_status TEXT, payment_date TEXT, payment_mode TEXT, transaction_ref TEXT, advances JSONB);
CREATE TABLE IF NOT EXISTS public.notifications (id TEXT PRIMARY KEY, title TEXT, message TEXT, type TEXT, timestamp BIGINT, read BOOLEAN DEFAULT FALSE, branch_id TEXT);
CREATE TABLE IF NOT EXISTS public.settings (id TEXT PRIMARY KEY DEFAULT 'app_settings', business_name TEXT, tagline TEXT, head_office_address TEXT, head_office_phone TEXT, gstin TEXT, invoice_prefix TEXT, receipt_footer TEXT, thermal_width TEXT, currency_symbol TEXT, default_tax_rate NUMERIC);

-- Disable Row Level Security (RLS) for public access from anon key
ALTER TABLE public.branches DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.branch_inventory DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_bills DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_allocations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.salaries DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;
