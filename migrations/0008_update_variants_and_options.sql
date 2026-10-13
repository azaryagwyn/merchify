-- Migration 0008: Remove color options from clothing & lanyards, configure Tumbler to Matte Black & Matte Maroon

-- 1. Configure Stainless Tumbler with exactly two colors: Matte Black & Matte Maroon
UPDATE product_variants 
SET color = 'Matte Black', size = '500ml', stock = 35, sku = 'TB-500-BLK' 
WHERE id = 'var_tb_blk';

UPDATE product_variants 
SET color = 'Matte Maroon', size = '500ml', stock = 35, sku = 'TB-500-MRN' 
WHERE id = 'var_tb_nvy';

DELETE FROM product_variants WHERE id = 'var_tb_slv';

-- 2. Remove color options from Jas Almamater
UPDATE product_variants 
SET color = NULL 
WHERE product_id IN ('prod_almet_univ', 'prod_almet_filkom', 'prod_almet_feb', 'prod_almet_fk');

-- 3. Remove color options from Vintage Varsity Jacket
UPDATE product_variants 
SET color = NULL 
WHERE product_id = 'prod_varsity';

-- 4. Clean Hoodie variants to S, M, L, XL with NO color options
DELETE FROM product_variants WHERE id IN ('var_hoodie_m_navy', 'var_hoodie_l_navy', 'var_hoodie_xl_navy');

UPDATE product_variants 
SET color = NULL, size = 'M', stock = 30 
WHERE id = 'var_hoodie_m_maroon';

UPDATE product_variants 
SET color = NULL, size = 'L', stock = 25 
WHERE id = 'var_hoodie_l_maroon';

INSERT OR REPLACE INTO product_variants (id, product_id, size, color, sku, stock, price_adjustment) VALUES
('var_hoodie_s', 'prod_hoodie', 'S', NULL, 'HD-AWR-S', 20, 0),
('var_hoodie_xl', 'prod_hoodie', 'XL', NULL, 'HD-AWR-XL', 15, 10000);

-- 5. Clean Kaos Almamater variants to S, M, L, XL with NO color options
DELETE FROM product_variants WHERE id IN ('var_kaos_m_wht', 'var_kaos_l_wht');

UPDATE product_variants 
SET color = NULL 
WHERE id IN ('var_kaos_s_blk', 'var_kaos_m_blk', 'var_kaos_l_blk', 'var_kaos_xl_blk');

-- 6. Clean Lanyards: 1 standard variant per lanyard with NO color options
UPDATE product_variants 
SET color = NULL, size = 'Standard', stock = 150 
WHERE id = 'var_lan_u_gold';

DELETE FROM product_variants WHERE id = 'var_lan_u_mid';

UPDATE product_variants 
SET color = NULL, size = 'Standard', stock = 120 
WHERE product_id IN ('prod_lanyard_filkom', 'prod_lanyard_feb', 'prod_lanyard_fk');
