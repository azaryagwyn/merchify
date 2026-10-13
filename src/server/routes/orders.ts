import { Hono } from 'hono';
import { Env } from '../types';
import { Order, OrderItem } from '../../shared/types';

export const ordersRouter = new Hono<{ Bindings: Env }>();

// GET /api/orders/:orderNumber - Ambil detail pesanan spesifik (Post-Purchase & Invoice)
ordersRouter.get('/:orderNumber', async (c) => {
  const db = c.env.DB;
  const orderNumber = c.req.param('orderNumber');

  const orderRow = await db
    .prepare('SELECT * FROM orders WHERE order_number = ?')
    .bind(orderNumber)
    .first<any>();

  if (!orderRow) {
    return c.json({ success: false, message: 'Pesanan tidak ditemukan' }, 404);
  }

  const { results: itemRows } = await db
    .prepare('SELECT * FROM order_items WHERE order_id = ?')
    .bind(orderRow.id)
    .all();

  const items: OrderItem[] = (itemRows as any[]).map((item) => ({
    id: item.id,
    orderId: item.order_id,
    productVariantId: item.product_variant_id,
    productName: item.product_name,
    variantInfo: item.variant_info,
    quantity: Number(item.quantity),
    unitPrice: Number(item.unit_price),
    totalPrice: Number(item.total_price),
  }));

  const order: Order = {
    id: orderRow.id,
    orderNumber: orderRow.order_number,
    userId: orderRow.user_id,
    customerName: orderRow.customer_name,
    customerEmail: orderRow.customer_email,
    customerPhone: orderRow.customer_phone,
    shippingAddress: orderRow.shipping_address,
    shippingMethod: orderRow.shipping_method,
    shippingCost: Number(orderRow.shipping_cost),
    estimatedDelivery: orderRow.estimated_delivery,
    subtotal: Number(orderRow.subtotal),
    discountAmount: Number(orderRow.discount_amount),
    totalAmount: Number(orderRow.total_amount),
    status: orderRow.status,
    snapToken: orderRow.snap_token,
    paymentType: orderRow.payment_type,
    trackingNumber: orderRow.tracking_number,
    items,
    createdAt: orderRow.created_at,
    updatedAt: orderRow.updated_at,
  };

  return c.json({ success: true, data: order });
});

// GET /api/orders - List pesanan (Customer & Admin)
ordersRouter.get('/', async (c) => {
  const db = c.env.DB;
  const userId = c.req.query('userId');

  let query = 'SELECT * FROM orders';
  const params: any[] = [];

  if (userId) {
    query += ' WHERE user_id = ?';
    params.push(userId);
  }

  query += ' ORDER BY created_at DESC LIMIT 50';

  const { results: orderRows } = await db.prepare(query).bind(...params).all();

  const orders: Order[] = (orderRows as any[]).map((r) => ({
    id: r.id,
    orderNumber: r.order_number,
    userId: r.user_id,
    customerName: r.customer_name,
    customerEmail: r.customer_email,
    customerPhone: r.customer_phone,
    shippingAddress: r.shipping_address,
    shippingMethod: r.shipping_method,
    shippingCost: Number(r.shipping_cost),
    estimatedDelivery: r.estimated_delivery,
    subtotal: Number(r.subtotal),
    discountAmount: Number(r.discount_amount),
    totalAmount: Number(r.total_amount),
    status: r.status,
    snapToken: r.snap_token,
    paymentType: r.payment_type,
    trackingNumber: r.tracking_number,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));

  return c.json({ success: true, data: orders });
});

// PUT /api/orders/:id/status - Update status pesanan & no resi (Admin)
ordersRouter.put('/:id/status', async (c) => {
  const db = c.env.DB;
  const id = c.req.param('id');
  const { status, trackingNumber } = await c.req.json<{ status: string; trackingNumber?: string }>();

  let query = 'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP';
  const params: any[] = [status];

  if (trackingNumber !== undefined) {
    query += ', tracking_number = ?';
    params.push(trackingNumber);
  }

  query += ' WHERE id = ?';
  params.push(id);

  await db.prepare(query).bind(...params).run();

  return c.json({ success: true, message: 'Status pesanan berhasil diperbarui' });
});
