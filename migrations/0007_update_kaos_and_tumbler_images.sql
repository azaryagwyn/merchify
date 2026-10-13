-- Migration 0007: Update Kaos Almamater & Stainless Tumbler with official visuals
UPDATE products 
SET images = '["/images/products/kaos-almamater.jpg"]'
WHERE id = 'prod_kaos';

UPDATE products 
SET images = '["/images/products/stainless-tumbler.jpg"]'
WHERE id = 'prod_tumbler';
