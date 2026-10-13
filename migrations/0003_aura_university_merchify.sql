-- Migration 0003: Update Branding to Merchify - Aura University

-- 1. Bersihkan produk lama dan ganti dengan katalog resmi Aura University
DELETE FROM order_items;
DELETE FROM reviews;
DELETE FROM product_variants;
DELETE FROM products;

-- 2. Insert Katalog Produk Resmi Aura University di Merchify
INSERT INTO products (id, name, slug, description, category, base_price, discount_percentage, discount_price, images, is_featured)
VALUES
-- 1. Almet Kampus Utama
(
    'prod_almet_univ',
    'Jas Almamater Resmi Aura University',
    'jas-almamater-resmi-aura-university',
    'Jas almamater resmi Aura University berbahan twist premium anti kusut dengan furing dormeuil adem, kancing emboss kuningan lambang universitas, dan bordir logo timbul presisi.',
    'Almamater',
    275000,
    0,
    NULL,
    '["https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80"]',
    1
),
-- 2. Almet FILKOM
(
    'prod_almet_filkom',
    'Jas Almamater FILKOM Aura University (Ilmu Komputer)',
    'jas-almamater-filkom-aura-university',
    'Jas almamater khusus Fakultas Ilmu Komputer (FILKOM) Aura University dengan lis perak cyber-cyan di kerah dan bordir emblem resmi FILKOM di lengan kanan.',
    'Almamater',
    285000,
    0,
    NULL,
    '["https://images.unsplash.com/photo-1598808503746-f34c53b9323e?auto=format&fit=crop&w=800&q=80"]',
    1
),
-- 3. Almet FEB
(
    'prod_almet_feb',
    'Jas Almamater FEB Aura University (Ekonomi & Bisnis)',
    'jas-almamater-feb-aura-university',
    'Jas almamater Fakultas Ekonomi & Bisnis (FEB) Aura University berbalut lis kuning emas kebanggaan FEB dengan bahan wool feel dingin dan kancing eksklusif.',
    'Almamater',
    285000,
    0,
    NULL,
    '["https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80"]',
    1
),
-- 4. Almet FK
(
    'prod_almet_fk',
    'Jas Almamater FK Aura University (Kedokteran)',
    'jas-almamater-fk-aura-university',
    'Jas almamater Fakultas Kedokteran (FK) Aura University dengan lis hijau tosca medis dan furing higienis berkualitas tinggi. Nyaman untuk praktikum dan dinas kampus.',
    'Almamater',
    295000,
    0,
    NULL,
    '["https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80"]',
    1
),
-- 5. Vintage Varsity Kampus
(
    'prod_varsity',
    'Vintage Varsity Jacket Champions Aura University',
    'vintage-varsity-jacket-champions-aura-university',
    'Jaket varsity vintage perpaduan wool blend tebal dan leather sleeves premium dengan bordir patch lambang kampus Aura University. Outfit ikonik mahasiswa berprestasi.',
    'Apparel',
    380000,
    15,
    323000,
    '["https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80"]',
    1
),
-- 6. Hoodie Kampus
(
    'prod_hoodie',
    'Official Hoodie Almamater Aura University',
    'official-hoodie-almamater-aura-university',
    'Hoodie katun fleece 330 gsm terhangat dengan bordir logo Aura University di dada kiri dan tulisan kampus di punggung. Kantong kangguru luas dan tali bertutup metal.',
    'Apparel',
    250000,
    20,
    200000,
    '["https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=800&q=80"]',
    1
),
-- 7. Kaos Almamater
(
    'prod_kaos',
    'Kaos Almamater Signature Cotton 24s Aura University',
    'kaos-almamater-signature-cotton-24s-aura-university',
    'T-Shirt bahan 100% Cotton Combed 24s lembut dan adem dengan tipografi modern Aura University. Sablon plastisol HD tahan cuci tidak mudah pecah.',
    'Apparel',
    95000,
    0,
    NULL,
    '["https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80"]',
    0
),
-- 8. Tumbler Stainless
(
    'prod_tumbler',
    'Stainless Vacuum Tumbler 500ml Aura University',
    'stainless-vacuum-tumbler-500ml-aura-university',
    'Tumbler thermo double-wall tahan panas & dingin hingga 16 jam dengan grafir laser logo Aura University. Dukung program Green Campus ramah lingkungan!',
    'Drinkware',
    130000,
    10,
    117000,
    '["https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80"]',
    1
),
-- 9. Lanyard Kampus
(
    'prod_lanyard_univ',
    'Lanyard Signature Aura University & Card Holder',
    'lanyard-signature-aura-university-card-holder',
    'Tali ID card bahan tisue satin halus 2 sisi warna royal navy & gold khas Aura University, dilengkapi stopper putar, pengait metal krom, dan tempat KTM akrilik bening.',
    'Accessories',
    35000,
    0,
    NULL,
    '["https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=800&q=80"]',
    1
),
-- 10. Lanyard FILKOM
(
    'prod_lanyard_filkom',
    'Lanyard FILKOM Aura University (Fakultas Ilmu Komputer)',
    'lanyard-filkom-aura-university',
    'Lanyard tema cyber tech Fakultas Ilmu Komputer Aura University dengan aksen warna silver cyan dan logo FILKOM. Cocok untuk KTM dan gantungan USB drive.',
    'Accessories',
    35000,
    0,
    NULL,
    '["https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80"]',
    0
),
-- 11. Lanyard FEB
(
    'prod_lanyard_feb',
    'Lanyard FEB Aura University (Fakultas Ekonomi & Bisnis)',
    'lanyard-feb-aura-university',
    'Lanyard resmi Fakultas Ekonomi dan Bisnis Aura University dengan nuansa kuning emas elegan dan tipografi korporat modern.',
    'Accessories',
    35000,
    0,
    NULL,
    '["https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80"]',
    0
),
-- 12. Lanyard FK
(
    'prod_lanyard_fk',
    'Lanyard FK Aura University (Fakultas Kedokteran)',
    'lanyard-fk-aura-university',
    'Lanyard resmi Fakultas Kedokteran Aura University dengan aksen hijau tosca medis dan putih bersih, bahan satin anti alergi nyaman dipakai saat stase klinis.',
    'Accessories',
    35000,
    0,
    NULL,
    '["https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80"]',
    0
);

-- 3. Insert Varian Produk & Stok Real-Time
INSERT INTO product_variants (id, product_id, size, color, sku, stock, price_adjustment)
VALUES
-- Varian Almet Kampus Utama
('var_almet_u_s', 'prod_almet_univ', 'S', 'Royal Navy', 'AURA-ALMET-S', 15, 0),
('var_almet_u_m', 'prod_almet_univ', 'M', 'Royal Navy', 'AURA-ALMET-M', 30, 0),
('var_almet_u_l', 'prod_almet_univ', 'L', 'Royal Navy', 'AURA-ALMET-L', 25, 0),
('var_almet_u_xl', 'prod_almet_univ', 'XL', 'Royal Navy', 'AURA-ALMET-XL', 4, 10000), -- Stok Terbatas!
('var_almet_u_xxl', 'prod_almet_univ', 'XXL', 'Royal Navy', 'AURA-ALMET-XXL', 0, 20000), -- Habis!

-- Varian Almet FILKOM
('var_almet_filkom_s', 'prod_almet_filkom', 'S', 'Navy-Silver', 'FILKOM-ALMET-S', 10, 0),
('var_almet_filkom_m', 'prod_almet_filkom', 'M', 'Navy-Silver', 'FILKOM-ALMET-M', 20, 0),
('var_almet_filkom_l', 'prod_almet_filkom', 'L', 'Navy-Silver', 'FILKOM-ALMET-L', 18, 0),
('var_almet_filkom_xl', 'prod_almet_filkom', 'XL', 'Navy-Silver', 'FILKOM-ALMET-XL', 3, 10000), -- Stok Terbatas!

-- Varian Almet FEB
('var_almet_feb_s', 'prod_almet_feb', 'S', 'Navy-Gold', 'FEB-ALMET-S', 12, 0),
('var_almet_feb_m', 'prod_almet_feb', 'M', 'Navy-Gold', 'FEB-ALMET-M', 22, 0),
('var_almet_feb_l', 'prod_almet_feb', 'L', 'Navy-Gold', 'FEB-ALMET-L', 15, 0),
('var_almet_feb_xl', 'prod_almet_feb', 'XL', 'Navy-Gold', 'FEB-ALMET-XL', 5, 10000),

-- Varian Almet FK
('var_almet_fk_s', 'prod_almet_fk', 'S', 'Navy-Tosca', 'FK-ALMET-S', 8, 0),
('var_almet_fk_m', 'prod_almet_fk', 'M', 'Navy-Tosca', 'FK-ALMET-M', 16, 0),
('var_almet_fk_l', 'prod_almet_fk', 'L', 'Navy-Tosca', 'FK-ALMET-L', 14, 0),
('var_almet_fk_xl', 'prod_almet_fk', 'XL', 'Navy-Tosca', 'FK-ALMET-XL', 2, 10000), -- Stok Terbatas!

-- Varian Varsity
('var_varsity_m', 'prod_varsity', 'M', 'Navy-Cream', 'AURA-VAR-M', 8, 0),
('var_varsity_l', 'prod_varsity', 'L', 'Navy-Cream', 'AURA-VAR-L', 6, 0),
('var_varsity_xl', 'prod_varsity', 'XL', 'Navy-Cream', 'AURA-VAR-XL', 3, 15000),

-- Varian Hoodie
('var_hoodie_m_navy', 'prod_hoodie', 'M', 'Royal Navy', 'AURA-HD-NV-M', 20, 0),
('var_hoodie_l_navy', 'prod_hoodie', 'L', 'Royal Navy', 'AURA-HD-NV-L', 15, 0),
('var_hoodie_xl_navy', 'prod_hoodie', 'XL', 'Royal Navy', 'AURA-HD-NV-XL', 4, 10000),
('var_hoodie_m_maroon', 'prod_hoodie', 'M', 'Maroon Aura', 'AURA-HD-MR-M', 10, 0),
('var_hoodie_l_maroon', 'prod_hoodie', 'L', 'Maroon Aura', 'AURA-HD-MR-L', 3, 0), -- Stok Terbatas!

-- Varian Kaos
('var_kaos_s_blk', 'prod_kaos', 'S', 'Jet Black', 'AURA-TS-BLK-S', 30, 0),
('var_kaos_m_blk', 'prod_kaos', 'M', 'Jet Black', 'AURA-TS-BLK-M', 45, 0),
('var_kaos_l_blk', 'prod_kaos', 'L', 'Jet Black', 'AURA-TS-BLK-L', 35, 0),
('var_kaos_xl_blk', 'prod_kaos', 'XL', 'Jet Black', 'AURA-TS-BLK-XL', 12, 5000),
('var_kaos_m_wht', 'prod_kaos', 'M', 'Ivory White', 'AURA-TS-WHT-M', 25, 0),
('var_kaos_l_wht', 'prod_kaos', 'L', 'Ivory White', 'AURA-TS-WHT-L', 20, 0),

-- Varian Tumbler Stainless
('var_tb_blk', 'prod_tumbler', '500ml', 'Matte Black', 'AURA-TB-BLK', 25, 0),
('var_tb_nvy', 'prod_tumbler', '500ml', 'Royal Navy', 'AURA-TB-NVY', 18, 0),
('var_tb_slv', 'prod_tumbler', '500ml', 'Silver Steel', 'AURA-TB-SLV', 5, 0), -- Stok Terbatas!

-- Varian Lanyard Kampus
('var_lan_u_gold', 'prod_lanyard_univ', 'Standard', 'Navy Gold', 'AURA-LAN-GOLD', 150, 0),
('var_lan_u_mid', 'prod_lanyard_univ', 'Standard', 'Midnight Blue', 'AURA-LAN-MID', 90, 0),

-- Varian Lanyard FILKOM
('var_lan_filkom', 'prod_lanyard_filkom', 'Standard', 'Cyan Silver', 'FILKOM-LAN-STD', 80, 0),

-- Varian Lanyard FEB
('var_lan_feb', 'prod_lanyard_feb', 'Standard', 'Gold Navy', 'FEB-LAN-STD', 80, 0),

-- Varian Lanyard FK
('var_lan_fk', 'prod_lanyard_fk', 'Standard', 'Tosca White', 'FK-LAN-STD', 70, 0);

-- 4. Insert Review Pelanggan untuk Aura University
INSERT INTO reviews (id, product_id, user_id, reviewer_name, rating, comment, is_verified_buyer)
VALUES
('rev_aura_1', 'prod_almet_univ', 'usr_cust_1', 'Budi Santoso (FILKOM 22)', 5, 'Kualitas bahan almet Aura University ini juara! Kain twist-nya jatuh pas di badan, furing adem gak gerah pas gladi resik wisuda. Kancing kuningan logonya sangat mewah.', 1),
('rev_aura_2', 'prod_almet_filkom', 'usr_cust_1', 'Budi Santoso (FILKOM 22)', 5, 'Bangga banget pake almet FILKOM dengan lis silver! Desainnya futuristik dan bordir lengan sangat rapi.', 1),
('rev_aura_3', 'prod_almet_fk', 'usr_cust_2', 'Siti Rahmawati (FK 23)', 5, 'Lis tosca-nya elegan banget, bahan lembut cocok buat stase klinik di RS pendidikan Aura University.', 1),
('rev_aura_4', 'prod_hoodie', 'usr_cust_1', 'Budi Santoso', 5, 'Hoodie Aura University ini wajib punya. Bahannya fleece 330gsm beneran hangat buat nugas di lab komputer ber-AC dingin.', 1),
('rev_aura_5', 'prod_tumbler', 'usr_cust_2', 'Siti Rahmawati', 5, 'Tumbler stainless Aura University awet dingin es kopi sampai 12 jam. Grafir laser logonya rapi.', 1);

-- 5. Update Promo Kupon Khusus Aura University
INSERT OR REPLACE INTO promotions (id, code, description, discount_type, discount_value, min_purchase, is_active, expires_at)
VALUES
('promo_aura_1', 'AURA2026', 'Diskon Spesial Mahasiswa Baru Aura University 20%', 'PERCENTAGE', 20, 100000, 1, '2026-12-31 23:59:59'),
('promo_aura_2', 'MERCHIFY', 'Potongan Rp 30.000 Belanja di Merchify', 'FIXED', 30000, 150000, 1, '2026-12-31 23:59:59'),
('promo_aura_3', 'AURAGREAT', 'Subsidi Ongkir Kurir Kampus Rp 10.000', 'FIXED', 10000, 50000, 1, '2026-12-31 23:59:59');
