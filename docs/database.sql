-- =====================================================
-- LAUNDRY CASHIER APP - DATABASE SCHEMA
-- =====================================================
-- Copy paste this entire file to Supabase SQL Editor
-- Then click RUN to execute
-- =====================================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. CREATE ENUMS
-- =====================================================

-- Transaction status enum
DO $$ BEGIN
    CREATE TYPE transaction_status AS ENUM ('proses', 'selesai', 'diambil');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Item type enum
DO $$ BEGIN
    CREATE TYPE item_type AS ENUM ('kiloan_reguler', 'kiloan_ekspres', 'karpet', 'bedcover');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- 2. CREATE TABLES
-- =====================================================

-- Table: customers
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: transactions
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id),
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    total_amount DECIMAL(10,2) NOT NULL,
    paid_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    status transaction_status DEFAULT 'proses',
    payment_method VARCHAR(50) DEFAULT 'Tunai',
    notes TEXT,
    date_in TIMESTAMP WITH TIME ZONE NOT NULL,
    date_out TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: transaction_items
CREATE TABLE IF NOT EXISTS transaction_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    item_type item_type NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit VARCHAR(10) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: price_settings
CREATE TABLE IF NOT EXISTS price_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_type VARCHAR(50) UNIQUE NOT NULL,
    item_label VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    unit VARCHAR(10) NOT NULL,
    duration_days INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: app_settings
CREATE TABLE IF NOT EXISTS app_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: user_profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    is_owner BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. CREATE INDEXES
-- =====================================================

-- Customers indexes
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);

-- Transactions indexes
CREATE INDEX IF NOT EXISTS idx_transactions_number ON transactions(transaction_number);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_date_in ON transactions(date_in);
CREATE INDEX IF NOT EXISTS idx_transactions_customer_phone ON transactions(customer_phone);
CREATE INDEX IF NOT EXISTS idx_transactions_customer_id ON transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_by ON transactions(created_by);

-- Transaction items indexes
CREATE INDEX IF NOT EXISTS idx_transaction_items_transaction_id ON transaction_items(transaction_id);

-- User profiles indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_owner ON user_profiles(is_owner);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_active ON user_profiles(is_active);

-- =====================================================
-- 4. CREATE FUNCTIONS & TRIGGERS
-- =====================================================

-- Function: update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_price_settings_updated_at BEFORE UPDATE ON price_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_app_settings_updated_at BEFORE UPDATE ON app_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 5. INSERT DEFAULT DATA
-- =====================================================

-- Default price settings (adjust prices as needed)
INSERT INTO price_settings (item_type, item_label, price, unit, duration_days)
VALUES 
    ('kiloan_reguler', 'Baju Kiloan (Reguler)', 6000.00, 'kg', 3),
    ('kiloan_ekspres', 'Baju Kiloan (Ekspres)', 10000.00, 'kg', 1),
    ('karpet', 'Karpet', 25000.00, 'pcs', NULL),
    ('bedcover', 'Bedcover', 30000.00, 'pcs', NULL)
ON CONFLICT (item_type) DO NOTHING;

-- Default app settings
-- NOTE: laundry_name has been manually updated to 'Laundry New Mahkota' in Supabase
-- NOTE: laundry_address and laundry_phone are placeholders, will be updated later
INSERT INTO app_settings (key, value)
VALUES 
    ('laundry_name', 'Laundry New Mahkota'),
    ('laundry_address', 'Jl. Contoh No. 123, Kota Anda'),
    ('laundry_phone', '08XX-XXXX-XXXX')
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (to avoid conflicts)
DROP POLICY IF EXISTS "Authenticated users can view customers" ON customers;
DROP POLICY IF EXISTS "Authenticated users can insert customers" ON customers;
DROP POLICY IF EXISTS "Authenticated users can update customers" ON customers;

DROP POLICY IF EXISTS "Authenticated users can view transactions" ON transactions;
DROP POLICY IF EXISTS "Authenticated users can insert transactions" ON transactions;
DROP POLICY IF EXISTS "Authenticated users can update transactions" ON transactions;
DROP POLICY IF EXISTS "Authenticated users can delete transactions" ON transactions;

DROP POLICY IF EXISTS "Authenticated users can view transaction_items" ON transaction_items;
DROP POLICY IF EXISTS "Authenticated users can insert transaction_items" ON transaction_items;
DROP POLICY IF EXISTS "Authenticated users can update transaction_items" ON transaction_items;
DROP POLICY IF EXISTS "Authenticated users can delete transaction_items" ON transaction_items;

DROP POLICY IF EXISTS "Authenticated users can view price_settings" ON price_settings;
DROP POLICY IF EXISTS "Authenticated users can update price_settings" ON price_settings;

DROP POLICY IF EXISTS "Authenticated users can view app_settings" ON app_settings;
DROP POLICY IF EXISTS "Authenticated users can update app_settings" ON app_settings;

DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Owners can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Owners can manage all profiles" ON user_profiles;

-- Customers policies (all authenticated users)
CREATE POLICY "Authenticated users can view customers" ON customers
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert customers" ON customers
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update customers" ON customers
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Transactions policies (all authenticated users)
CREATE POLICY "Authenticated users can view transactions" ON transactions
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert transactions" ON transactions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update transactions" ON transactions
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete transactions" ON transactions
    FOR DELETE USING (auth.role() = 'authenticated');

-- Transaction items policies (all authenticated users)
CREATE POLICY "Authenticated users can view transaction_items" ON transaction_items
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert transaction_items" ON transaction_items
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update transaction_items" ON transaction_items
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete transaction_items" ON transaction_items
    FOR DELETE USING (auth.role() = 'authenticated');

-- Price settings policies (read all, update all)
CREATE POLICY "Authenticated users can view price_settings" ON price_settings
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update price_settings" ON price_settings
    FOR UPDATE USING (auth.role() = 'authenticated');

-- App settings policies (read all, update all)
CREATE POLICY "Authenticated users can view app_settings" ON app_settings
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update app_settings" ON app_settings
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Function to check if current user is an owner (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.is_owner()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid() AND is_owner = true AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- User profiles policies
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Owners can view all profiles" ON user_profiles
    FOR SELECT USING (public.is_owner());

CREATE POLICY "Owners can manage all profiles" ON user_profiles
    FOR ALL USING (public.is_owner());

-- =====================================================
-- 7. CREATE FUNCTION FOR NEW USER SIGNUP
-- =====================================================

-- Function to create user profile when new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, full_name, is_owner, is_active)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
        COALESCE((NEW.raw_user_meta_data->>'is_owner')::boolean, false),
        true
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call handle_new_user function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 8. GRANT PERMISSIONS
-- =====================================================

-- Grant usage on schemas
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant permissions on tables
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Grant permissions on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================
-- Next steps:
-- 1. Create your first owner user via Supabase Auth Dashboard
-- 2. Manually set is_owner = true in user_profiles table
-- 3. Login and start using the app!
-- =====================================================