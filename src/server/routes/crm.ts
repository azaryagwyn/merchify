import { Hono } from 'hono';
import { Env } from '../types';

export const crmRouter = new Hono<{ Bindings: Env }>();

// GET /api/crm/customers - Analitik pelanggan, LTV, total orders, loyalty tier
crmRouter.get('/customers', async (c) => {
  const db = c.env.DB;

  const { results: users } = await db
    .prepare("SELECT * FROM users WHERE role = 'CUSTOMER' ORDER BY created_at DESC")
    .all();

  // Hitung LTV (Total Belanja) dan Frekuensi Order per Customer
  const { results: orderStats } = await db
    .prepare(`
      SELECT user_id, COUNT(id) as total_orders, SUM(total_amount) as lifetime_value 
      FROM orders 
      WHERE user_id IS NOT NULL AND status IN ('PAID', 'SHIPPED', 'COMPLETED')
      GROUP BY user_id
    `)
    .all();

  const statsMap = new Map<string, { totalOrders: number; ltv: number }>();
  for (const s of orderStats as any[]) {
    statsMap.set(s.user_id, {
      totalOrders: Number(s.total_orders || 0),
      ltv: Number(s.lifetime_value || 0),
    });
  }

  const customers = (users as any[]).map((u) => {
    const stat = statsMap.get(u.id) || { totalOrders: 0, ltv: 0 };
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      studentId: u.student_id,
      loyaltyPoints: Number(u.loyalty_points || 0),
      loyaltyTier: u.loyalty_tier || 'BRONZE',
      notes: u.notes,
      totalOrders: stat.totalOrders,
      lifetimeValue: stat.ltv,
      createdAt: u.created_at,
    };
  });

  return c.json({ success: true, data: customers });
});

// PUT /api/crm/customers/:id - Update catatan CRM & tier loyalitas pelanggan
crmRouter.put('/customers/:id', async (c) => {
  const db = c.env.DB;
  const id = c.req.param('id');
  const { notes, loyaltyTier } = await c.req.json<{ notes?: string; loyaltyTier?: string }>();

  let query = 'UPDATE users SET ';
  const updates: string[] = [];
  const params: any[] = [];

  if (notes !== undefined) {
    updates.push('notes = ?');
    params.push(notes);
  }

  if (loyaltyTier !== undefined) {
    updates.push('loyalty_tier = ?');
    params.push(loyaltyTier);
  }

  if (updates.length === 0) {
    return c.json({ success: false, message: 'Tidak ada data yang diperbarui' }, 400);
  }

  query += updates.join(', ') + ' WHERE id = ?';
  params.push(id);

  await db.prepare(query).bind(...params).run();

  return c.json({ success: true, message: 'Data CRM pelanggan berhasil disimpan' });
});
