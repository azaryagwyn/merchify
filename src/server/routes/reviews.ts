import { Hono } from 'hono';
import { Env } from '../types';
import { Review } from '../../shared/types';

export const reviewsRouter = new Hono<{ Bindings: Env }>();

// GET /api/reviews/:productId - Ambil semua review untuk produk tertentu
reviewsRouter.get('/:productId', async (c) => {
  const db = c.env.DB;
  const productId = c.req.param('productId');

  const { results } = await db
    .prepare('SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC')
    .bind(productId)
    .all();

  const reviews: Review[] = (results as any[]).map((r) => ({
    id: r.id,
    productId: r.product_id,
    userId: r.user_id,
    reviewerName: r.reviewer_name,
    rating: Number(r.rating),
    comment: r.comment,
    isVerifiedBuyer: Boolean(r.is_verified_buyer),
    createdAt: r.created_at,
  }));

  return c.json({ success: true, data: reviews });
});

// POST /api/reviews - Tambah review baru dari customer
reviewsRouter.post('/', async (c) => {
  const db = c.env.DB;
  const body = await c.req.json<{
    productId: string;
    userId?: string;
    reviewerName: string;
    rating: number;
    comment: string;
  }>();

  if (!body.productId || !body.reviewerName || !body.rating || !body.comment) {
    return c.json({ success: false, message: 'Semua kolom ulasan wajib diisi' }, 400);
  }

  // Cek apakah customer sudah pernah beli produk ini (verified buyer check)
  let isVerifiedBuyer = 0;
  if (body.userId) {
    const verifiedOrder = await db
      .prepare(`
        SELECT oi.id 
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        JOIN product_variants pv ON oi.product_variant_id = pv.id
        WHERE o.user_id = ? AND pv.product_id = ? AND o.status IN ('PAID', 'SHIPPED', 'COMPLETED')
        LIMIT 1
      `)
      .bind(body.userId, body.productId)
      .first<any>();

    if (verifiedOrder) {
      isVerifiedBuyer = 1;
    }
  }

  const reviewId = `rev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  await db
    .prepare(`
      INSERT INTO reviews (id, product_id, user_id, reviewer_name, rating, comment, is_verified_buyer)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    .bind(
      reviewId,
      body.productId,
      body.userId || null,
      body.reviewerName,
      Math.min(5, Math.max(1, Number(body.rating))),
      body.comment,
      isVerifiedBuyer
    )
    .run();

  return c.json({
    success: true,
    message: 'Ulasan berhasil dikirim! Terima kasih atas feedback Anda.',
    data: { id: reviewId, isVerifiedBuyer: Boolean(isVerifiedBuyer) },
  });
});
