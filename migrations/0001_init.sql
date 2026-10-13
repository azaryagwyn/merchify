-- Migration 0001: Initial Database Schema for University Merch Store

-- 1. Tabel Users (Customer & Admin)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'CUSTOMER', -- 'CUSTOMER' atau 'ADMIN'
    phone TEXT,
    student_id TEXT,                      -- NIM Mahasiswa
    loyalty_points INTEGER DEFAULT 0,
    loyalty_tier TEXT DEFAULT 'BRONZE',   -- 'BRONZE', 'SILVER', 'GOLD'
    notes TEXT,                           -- Catatan CRM
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabel Produk Merchandise
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    category TEXT NOT NULL,               -- 'Apparel', 'Accessories', 'Stationery', 'Drinkware'
    base_price REAL NOT NULL,
    discount_percentage REAL DEFAULT 0,  -- Diskon spesifik per item (%)
    discount_price REAL,                  -- Harga setelah diskon item
    images TEXT NOT NULL,                 -- JSON array string gambar
    is_featured INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabel Varian Produk (Ukuran, Warna, Stok)
CREATE TABLE IF NOT EXISTS product_variants (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    size TEXT,                            -- S, M, L, XL, XXL, All Size
    color TEXT,                           -- Navy Blue, Maroon, Jet Black, Ivory White
    sku TEXT UNIQUE NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    price_adjustment REAL DEFAULT 0,      -- Tambahan harga untuk size jumbo dll
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabel Customer Reviews
CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    reviewer_name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
    comment TEXT,
    is_verified_buyer INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabel Kupon & Promosi Global
CREATE TABLE IF NOT EXISTS promotions (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,            -- e.g. MABA2026, DIESNATALIS, MERDEKA
    description TEXT,
    discount_type TEXT NOT NULL,          -- 'PERCENTAGE' atau 'FIXED'
    discount_value REAL NOT NULL,
    min_purchase REAL DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    expires_at DATETIME
);

-- 6. Tabel Pesanan (Orders)
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    shipping_address TEXT NOT NULL,
    shipping_method TEXT NOT NULL,        -- 'PICKUP', 'SAMEDAY_CAMPUS', 'REGULAR_COURIER'
    shipping_cost REAL NOT NULL DEFAULT 0,
    estimated_delivery TEXT,              -- 'Hari ini (2-4 jam)' / '1-2 hari'
    subtotal REAL NOT NULL,
    discount_amount REAL DEFAULT 0,
    total_amount REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, PAID, PROCESSING, SHIPPED, COMPLETED, CANCELLED
    snap_token TEXT,
    payment_type TEXT,
    tracking_number TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 7. Tabel Item Pesanan
CREATE TABLE IF NOT EXISTS order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_variant_id TEXT NOT NULL REFERENCES product_variants(id),
    product_name TEXT NOT NULL,
    variant_info TEXT NOT NULL,           -- e.g. "Ukuran: L, Warna: Navy"
    quantity INTEGER NOT NULL,
    unit_price REAL NOT NULL,
    total_price REAL NOT NULL
);
