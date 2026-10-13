-- Migration 0002: Seed Data for University Merchandise Store

-- 1. Seed Users (Admin & Customers)
INSERT OR IGNORE INTO users (id, name, email, password_hash, role, phone, student_id, loyalty_points, loyalty_tier, notes)
VALUES
('usr_admin_1', 'Admin Koperasi Kampus', 'admin@univ.ac.id', 'admin123', 'ADMIN', '081234567890', 'ADM-001', 0, 'GOLD', 'Super administrator toko merchandise'),
('usr_cust_1', 'Budi Santoso', 'budi@student.univ.ac.id', 'user123', 'CUSTOMER', '081298765432', '220101001', 180, 'GOLD', 'Mahasiswa Teknik Informatika Semester 7. Sering beli merchandise angkatan & hoodie.'),
('usr_cust_2', 'Siti Rahmawati', 'siti@student.univ.ac.id', 'user123', 'CUSTOMER', '081377889900', '230202045', 75, 'SILVER', 'Mahasiswa FEB Semester 5. Aktif di BEM.');

-- 2. Seed Products
INSERT OR IGNORE INTO products (id, name, slug, description, category, base_price, discount_percentage, discount_price, images, is_featured)
VALUES
(
    'prod_1',
    'Official University Hoodie Almamater Edition',
    'official-university-hoodie-almamater',
    'Hoodie katun fleece premium 330 gsm dengan bordir timbul logo universitas di dada kiri dan tulisan kampus di punggung. Hangat, nyaman dipakai kuliah, dan tidak mudah berbulu.',
    'Apparel',
    250000,
    20,
    200000,
    '["https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=800&q=80"]',
    1
),
(
    'prod_2',
    'Vintage Varsity Jacket Kampus Champions',
    'vintage-varsity-jacket-kampus',
    'Jaket varsity perpaduan wool blend dan leather sleeves premium dengan bordir patch kebanggaan kampus. Cocok untuk acara formal organisasi maupun outfit harian.',
    'Apparel',
    380000,
    15,
    323000,
    '["https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80"]',
    1
),
(
    'prod_3',
    'Kaos Almamater Signature Cotton Combed 24s',
    'kaos-almamater-signature-cotton-24s',
    'T-Shirt bahan 100% Cotton Combed 24s lembut dan sejuk. Sablon plastisol HD tahan lama dengan tipografi modern nama almamater.',
    'Apparel',
    95000,
    0,
    NULL,
    '["https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80"]',
    0
),
(
    'prod_4',
    'Stainless Vacuum Tumbler 500ml Kampus Go-Green',
    'stainless-vacuum-tumbler-500ml',
    'Tumbler thermo double-wall tahan panas dan dingin hingga 12 jam. Grafir laser logo universitas anti luntur. Dukung kampus bebas sampah plastik!',
    'Drinkware',
    130000,
    10,
    117000,
    '["https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80"]',
    1
),
(
    'prod_5',
    'Totebag Kanvas Tebal Pocket Laptop',
    'totebag-kanvas-tebal-pocket-laptop',
    'Totebag berbahan kanvas premium 14oz dengan kompartemen khusus laptop 14 inch, resleting YKK, dan saku botol minum di bagian dalam.',
    'Accessories',
    85000,
    0,
    NULL,
    '["https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80"]',
    0
),
(
    'prod_6',
    'Lanyard Premium Satin & Card Holder Akrilik',
    'lanyard-premium-satin-card-holder',
    'Tali ID card bahan tisue satin lembut dengan sablon full color 2 sisi dilengkapi stopper dan kait metal tebal, lengkap dengan card holder akrilik transparan untuk KTM.',
    'Accessories',
    35000,
    0,
    NULL,
    '["https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=800&q=80"]',
    1
);

-- 3. Seed Product Variants & Stock
INSERT OR IGNORE INTO product_variants (id, product_id, size, color, sku, stock, price_adjustment)
VALUES
-- Hoodie
('var_h1', 'prod_1', 'M', 'Navy Blue', 'HD-NAVY-M', 18, 0),
('var_h2', 'prod_1', 'L', 'Navy Blue', 'HD-NAVY-L', 12, 0),
('var_h3', 'prod_1', 'XL', 'Navy Blue', 'HD-NAVY-XL', 3, 10000), -- Stok Terbatas!
('var_h4', 'prod_1', 'M', 'Maroon', 'HD-MRN-M', 8, 0),
('var_h5', 'prod_1', 'L', 'Maroon', 'HD-MRN-L', 2, 0), -- Stok Terbatas!
('var_h6', 'prod_1', 'XL', 'Maroon', 'HD-MRN-XL', 0, 10000), -- Habis!

-- Varsity
('var_v1', 'prod_2', 'M', 'Navy-White', 'VAR-NW-M', 7, 0),
('var_v2', 'prod_2', 'L', 'Navy-White', 'VAR-NW-L', 5, 0),
('var_v3', 'prod_2', 'XL', 'Navy-White', 'VAR-NW-XL', 4, 15000),

-- Kaos
('var_t1', 'prod_3', 'S', 'Jet Black', 'TS-BLK-S', 25, 0),
('var_t2', 'prod_3', 'M', 'Jet Black', 'TS-BLK-M', 40, 0),
('var_t3', 'prod_3', 'L', 'Jet Black', 'TS-BLK-L', 35, 0),
('var_t4', 'prod_3', 'XL', 'Jet Black', 'TS-BLK-XL', 15, 5000),
('var_t5', 'prod_3', 'M', 'Ivory White', 'TS-WHT-M', 20, 0),
('var_t6', 'prod_3', 'L', 'Ivory White', 'TS-WHT-L', 18, 0),

-- Tumbler
('var_tb1', 'prod_4', '500ml', 'Matte Black', 'TB-BLK-500', 30, 0),
('var_tb2', 'prod_4', '500ml', 'Navy Blue', 'TB-NAVY-500', 14, 0),
('var_tb3', 'prod_4', '500ml', 'Silver Steel', 'TB-SLV-500', 4, 0), -- Stok Terbatas!

-- Totebag
('var_tot1', 'prod_5', 'All Size', 'Natural Canvas', 'TOT-NAT-ALL', 45, 0),
('var_tot2', 'prod_5', 'All Size', 'Black Canvas', 'TOT-BLK-ALL', 32, 0),

-- Lanyard
('var_lan1', 'prod_6', 'Standard', 'Navy Gold', 'LAN-NG-STD', 120, 0),
('var_lan2', 'prod_6', 'Standard', 'Black White', 'LAN-BW-STD', 80, 0);

-- 4. Seed Reviews (Ratings & Feedback)
INSERT OR IGNORE INTO reviews (id, product_id, user_id, reviewer_name, rating, comment, is_verified_buyer)
VALUES
('rev_1', 'prod_1', 'usr_cust_1', 'Budi Santoso (Informatika)', 5, 'Bahan hoodienya tebal banget dan adem di dalam. Bordiran logo kampusnya presisi dan rapi. Pengiriman kurir kampus cepat sekali, 2 jam langsung sampai di asrama!', 1),
('rev_2', 'prod_1', 'usr_cust_2', 'Siti Rahmawati (FEB)', 5, 'Keren pol! Warna maroon-nya elegan, pas dipakai pas acara dies natalis kemarin banyak yang nanyain beli di mana.', 1),
('rev_3', 'prod_2', 'usr_cust_1', 'Budi Santoso', 5, 'Varsity terkeren yang pernah saya beli di toko kampus. Leather sleeves-nya lemas dan gak kaku.', 1),
('rev_4', 'prod_4', 'usr_cust_2', 'Siti Rahmawati', 4, 'Tumbler sangat kedap, air es tahan dingin seharian dari pagi kelas sampai sore praktikum.', 1);

-- 5. Seed Promotions (Coupons)
INSERT OR IGNORE INTO promotions (id, code, description, discount_type, discount_value, min_purchase, is_active, expires_at)
VALUES
('promo_1', 'MABA2026', 'Diskon Spesial Mahasiswa Baru 20%', 'PERCENTAGE', 20, 100000, 1, '2026-12-31 23:59:59'),
('promo_2', 'KAMPUSJUARA', 'Potongan Rp 25.000 Dies Natalis', 'FIXED', 25000, 150000, 1, '2026-12-31 23:59:59'),
('promo_3', 'GRATISONGKIR', 'Subsidi Ongkir Kurir Kampus Rp 10.000', 'FIXED', 10000, 50000, 1, '2026-12-31 23:59:59');
