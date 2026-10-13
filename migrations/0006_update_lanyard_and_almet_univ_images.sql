-- Migration 0006: Update images for Almamater Signature University Maroon & Faculty Lanyards
UPDATE products 
SET images = '["/images/products/almet-univ.jpg"]'
WHERE id = 'prod_almet_univ';

UPDATE products 
SET images = '["/images/products/lanyard-filkom.jpg"]'
WHERE id = 'prod_lanyard_filkom';

UPDATE products 
SET images = '["/images/products/lanyard-feb.jpg"]'
WHERE id = 'prod_lanyard_feb';

UPDATE products 
SET images = '["/images/products/lanyard-fk.jpg"]'
WHERE id = 'prod_lanyard_fk';

UPDATE products 
SET images = '["/images/products/lanyard-univ.jpg"]'
WHERE id = 'prod_lanyard_univ';
