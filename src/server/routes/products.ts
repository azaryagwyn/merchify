import { Hono } from 'hono';
import { Env } from '../types';
import { Product, ProductVariant } from '../../shared/types';

export const productsRouter = new Hono<{ Bindings: Env }>();

// GET /api/products - List all products with variants & ratings
productsRouter.get('/', async (c) => {
  const db = c.env.DB;
  const category = c.req.query('category');
  const search = c.req.query('q');

  let query = 'SELECT * FROM products WHERE 1=1';
  const params: any[] = [];

  if (category && category !== 'All') {
    query += ' AND category = ?';
    params.push(category);
  }

  if (search) {
    query += ' AND (name LIKE ? OR description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY is_featured DESC, created_at DESC';

  const { results: productRows } = await db.prepare(query).bind(...params).all();

  // Ambil semua varian
  const { results: variantRows } = await db
    .prepare('SELECT * FROM product_variants ORDER BY id ASC')
    .all();

  // Ambil agregat rating review
  const { results: reviewStats } = await db
    .prepare('SELECT product_id, AVG(rating) as avg_rating, COUNT(id) as total_reviews FROM reviews GROUP BY product_id')
    .all();

  const reviewMap = new Map<string, { avg: number; total: number }>();
  for (const r of reviewStats as any[]) {
    reviewMap.set(r.product_id, {
      avg: Number(r.avg_rating || 0),
      total: Number(r.total_reviews || 0),
    });
  }

  const products: Product[] = productRows.map((row: any) => {
    const variants: ProductVariant[] = (variantRows as any[])
      .filter((v) => v.product_id === row.id)
      .map((v) => ({
        id: v.id,
        productId: v.product_id,
        size: v.size,
        color: v.color,
        sku: v.sku,
        stock: Number(v.stock),
        priceAdjustment: Number(v.price_adjustment || 0),
      }));

    const stat = reviewMap.get(row.id) || { avg: 5.0, total: 0 };

    let images: string[] = [];
    try {
      images = JSON.parse(row.images);
    } catch {
      images = [row.images];
    }

    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      category: row.category,
      basePrice: Number(row.base_price),
      discountPercentage: Number(row.discount_percentage || 0),
      discountPrice: row.discount_price ? Number(row.discount_price) : null,
      images,
      isFeatured: Boolean(row.is_featured),
      variants,
      averageRating: Math.round(stat.avg * 10) / 10,
      totalReviews: stat.total,
      createdAt: row.created_at,
    };
  });

  return c.json({ success: true, data: products });
});

// GET /api/products/:slug - Detail single product
productsRouter.get('/:slug', async (c) => {
  const db = c.env.DB;
  const slug = c.req.param('slug');

  const row = await db
    .prepare('SELECT * FROM products WHERE slug = ?')
    .bind(slug)
    .first<any>();

  if (!row) {
    return c.json({ success: false, message: 'Produk tidak ditemukan' }, 404);
  }

  const { results: variantRows } = await db
    .prepare('SELECT * FROM product_variants WHERE product_id = ?')
    .bind(row.id)
    .all();

  const stat = await db
    .prepare('SELECT AVG(rating) as avg_rating, COUNT(id) as total_reviews FROM reviews WHERE product_id = ?')
    .bind(row.id)
    .first<any>();

  let images: string[] = [];
  try {
    images = JSON.parse(row.images);
  } catch {
    images = [row.images];
  }

  const product: Product = {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    category: row.category,
    basePrice: Number(row.base_price),
    discountPercentage: Number(row.discount_percentage || 0),
    discountPrice: row.discount_price ? Number(row.discount_price) : null,
    images,
    isFeatured: Boolean(row.is_featured),
    variants: (variantRows as any[]).map((v) => ({
      id: v.id,
      productId: v.product_id,
      size: v.size,
      color: v.color,
      sku: v.sku,
      stock: Number(v.stock),
      priceAdjustment: Number(v.price_adjustment || 0),
    })),
    averageRating: stat?.avg_rating ? Math.round(Number(stat.avg_rating) * 10) / 10 : 5.0,
    totalReviews: Number(stat?.total_reviews || 0),
    createdAt: row.created_at,
  };

  return c.json({ success: true, data: product });
});

// PUT /api/products/:id/discount - Set diskon spesifik per item (Admin)
productsRouter.put('/:id/discount', async (c) => {
  const db = c.env.DB;
  const id = c.req.param('id');
  const { discountPercentage } = await c.req.json<{ discountPercentage: number }>();

  const product = await db.prepare('SELECT * FROM products WHERE id = ?').bind(id).first<any>();
  if (!product) {
    return c.json({ success: false, message: 'Produk tidak ditemukan' }, 404);
  }

  const basePrice = Number(product.base_price);
  const discountPrice = discountPercentage > 0 
    ? Math.round(basePrice * (1 - discountPercentage / 100))
    : null;

  await db
    .prepare('UPDATE products SET discount_percentage = ?, discount_price = ? WHERE id = ?')
    .bind(discountPercentage, discountPrice, id)
    .run();

  return c.json({ success: true, message: 'Diskon produk berhasil diperbarui', discountPrice });
});

// PUT /api/products/variants/:id/stock - Update stok varian langsung (Admin)
productsRouter.put('/variants/:id/stock', async (c) => {
  const db = c.env.DB;
  const id = c.req.param('id');
  const { stock } = await c.req.json<{ stock: number }>();

  await db
    .prepare('UPDATE product_variants SET stock = ? WHERE id = ?')
    .bind(Math.max(0, Number(stock)), id)
    .run();

  return c.json({ success: true, message: 'Stok varian berhasil diperbarui' });
});
