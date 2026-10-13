-- Migration 0004: Rename Campus from Aura to Awrora University

UPDATE products SET 
  name = REPLACE(name, 'Aura', 'Awrora'),
  description = REPLACE(description, 'Aura', 'Awrora'),
  slug = REPLACE(slug, 'aura', 'awrora');

UPDATE product_variants SET 
  color = REPLACE(color, 'Aura', 'Awrora'),
  sku = REPLACE(sku, 'AURA', 'AWRORA');

UPDATE reviews SET 
  comment = REPLACE(comment, 'Aura', 'Awrora');

UPDATE promotions SET 
  code = REPLACE(code, 'AURA', 'AWRORA'),
  description = REPLACE(description, 'Aura', 'Awrora');
