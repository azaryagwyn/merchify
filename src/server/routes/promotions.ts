import { Hono } from 'hono';
import { Env } from '../types';

export const promotionsRouter = new Hono<{ Bindings: Env }>();

// GET /api/promotions - List all active promos
promotionsRouter.get('/', async (c) => {
  const db = c.env.DB;
  const { results } = await db
    .prepare('SELECT * FROM promotions WHERE is_active = 1 ORDER BY min_purchase ASC')
    .all();

  return c.json({
    success: true,
    data: results.map((r: any) => ({
      id: r.id,
      code: r.code,
      description: r.description,
      discountType: r.discount_type,
      discountValue: Number(r.discount_value),
      minPurchase: Number(r.min_purchase),
      isActive: Boolean(r.is_active),
      expiresAt: r.expires_at,
    })),
  });
});

// POST /api/promotions/validate - Validate coupon code against subtotal
promotionsRouter.post('/validate', async (c) => {
  const db = c.env.DB;
  const { code, subtotal } = await c.req.json<{ code: string; subtotal: number }>();

  if (!code) {
    return c.json({ success: false, message: 'Kode kupon wajib diisi' }, 400);
  }

  const promo = await db
    .prepare('SELECT * FROM promotions WHERE code = ? AND is_active = 1')
    .bind(code.toUpperCase().trim())
    .first<any>();

  if (!promo) {
    return c.json({ success: false, message: 'Kode kupon tidak valid atau sudah kedaluwarsa' }, 404);
  }

  const minPurchase = Number(promo.min_purchase);
  if (subtotal < minPurchase) {
    return c.json({
      success: false,
      message: `Minimal belanja untuk kupon ini adalah Rp ${minPurchase.toLocaleString('id-ID')}`,
    }, 400);
  }

  let discountAmount = 0;
  if (promo.discount_type === 'PERCENTAGE') {
    discountAmount = Math.round((subtotal * Number(promo.discount_value)) / 100);
  } else {
    discountAmount = Number(promo.discount_value);
  }

  // Jangan sampai diskon melebihi subtotal
  discountAmount = Math.min(discountAmount, subtotal);

  return c.json({
    success: true,
    data: {
      code: promo.code,
      description: promo.description,
      discountType: promo.discount_type,
      discountValue: Number(promo.discount_value),
      calculatedDiscount: discountAmount,
    },
  });
});
