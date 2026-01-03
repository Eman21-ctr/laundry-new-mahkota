-- =====================================================
-- SEED DATA UNTUK UJICOBA (DUMMY DATA)
-- =====================================================
-- Jalankan di SQL Editor Supabase untuk mengisi data contoh
-- =====================================================

-- 1. Bersihkan data lama (Opsional, hati-hati data asli terhapus!)
-- DELETE FROM transaction_items;
-- DELETE FROM transactions;
-- DELETE FROM customers;

-- 2. Tambah Data Pelanggan Contoh
INSERT INTO customers (id, name, phone)
VALUES 
    ('c1111111-1111-1111-1111-111111111111', 'Budi Santoso', '081234567890'),
    ('c2222222-2222-2222-2222-222222222222', 'Siti Aminah', '085777888999'),
    ('c3333333-3333-3333-3333-333333333333', 'Andi Wijaya', '089966655544')
ON CONFLICT (id) DO NOTHING;

-- 3. Tambah Data Transaksi (Bulan Ini)
-- Transaksi 1: Selesai
INSERT INTO transactions (id, transaction_number, customer_id, customer_name, customer_phone, total_amount, paid_amount, status, date_in, date_out, created_at)
VALUES (
    't1111111-1111-1111-1111-111111111111', 
    'LDR-20240101-001', 
    'c1111111-1111-1111-1111-111111111111', 
    'Budi Santoso', 
    '081234567890', 
    45000, 
    45000, 
    'selesai', 
    NOW() - INTERVAL '2 days', 
    NOW() + INTERVAL '1 day',
    NOW() - INTERVAL '2 days'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO transaction_items (transaction_id, item_type, quantity, unit, unit_price, subtotal)
VALUES 
    ('t1111111-1111-1111-1111-111111111111', 'kiloan_reguler', 5, 'kg', 6000, 30000),
    ('t1111111-1111-1111-1111-111111111111', 'karpet', 1, 'pcs', 15000, 15000)
ON CONFLICT (id) DO NOTHING;

-- Transaksi 2: Proses
INSERT INTO transactions (id, transaction_number, customer_id, customer_name, customer_phone, total_amount, paid_amount, status, date_in, date_out, created_at)
VALUES (
    't2222222-2222-2222-2222-222222222222', 
    'LDR-20240101-002', 
    'c2222222-2222-2222-2222-222222222222', 
    'Siti Aminah', 
    '085777888999', 
    120000, 
    50000, 
    'proses', 
    NOW() - INTERVAL '1 day', 
    NOW() + INTERVAL '2 days',
    NOW() - INTERVAL '1 day'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO transaction_items (transaction_id, item_type, quantity, unit, unit_price, subtotal)
VALUES 
    ('t2222222-2222-2222-2222-222222222222', 'kiloan_ekspres', 12, 'kg', 10000, 120000)
ON CONFLICT (id) DO NOTHING;

-- Transaksi 3: Diambil
INSERT INTO transactions (id, transaction_number, customer_id, customer_name, customer_phone, total_amount, paid_amount, status, date_in, date_out, created_at)
VALUES (
    't3333333-3333-3333-3333-333333333333', 
    'LDR-20240101-003', 
    'c3333333-3333-3333-3333-333333333333', 
    'Andi Wijaya', 
    '089966655544', 
    30000, 
    30000, 
    'diambil', 
    NOW() - INTERVAL '5 days', 
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '5 days'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO transaction_items (transaction_id, item_type, quantity, unit, unit_price, subtotal)
VALUES 
    ('t3333333-3333-3333-3333-333333333333', 'bedcover', 1, 'pcs', 30000, 30000)
ON CONFLICT (id) DO NOTHING;

-- 4. Update stats (OPSIONAL)
-- Query ini akan membantu mengecek data yang baru masuk
SELECT status, count(*), sum(total_amount) as revenue 
FROM transactions 
GROUP BY status;
