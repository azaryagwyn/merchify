-- Migration 0005: Update product showcase images with official Awrora University merchandise visuals
UPDATE products 
SET images = '["/images/products/almet-filkom.jpg"]'
WHERE id = 'prod_almet_filkom';

UPDATE products 
SET images = '["/images/products/almet-feb.jpg"]'
WHERE id = 'prod_almet_feb';

UPDATE products 
SET images = '["/images/products/almet-fk.jpg"]'
WHERE id = 'prod_almet_fk';

UPDATE products 
SET images = '["/images/products/official-hoodie.jpg"]'
WHERE id = 'prod_hoodie';

UPDATE products 
SET images = '["/images/products/vintage-varsity.jpg"]'
WHERE id = 'prod_varsity';
