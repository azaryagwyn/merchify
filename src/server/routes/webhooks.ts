import { Hono } from 'hono';
import { Env } from '../types';
import { MidtransService } from '../services/midtrans';

export const webhooksRouter = new Hono<{ Bindings: Env }>();

// Helper untuk proses pembayaran sukses & potong stok otomatis
async function processSuccessfulPayment(db: D1Database, orderNumber: string, paymentType: string = 'qris') {
  const order = await db
    .prepare('SELECT * FROM orders WHERE order_number = ?')
    .bind(orderNumber)
    .first<any>();

  if (!order) {
    return { success: false, message: 'Pesanan tidak ditemukan' };
  }

  // Jika sudah PAID sebelumnya, hindari potong stok ganda (idempotent)
  if (order.status === 'PAID') {
    return { success: true, message: 'Pesanan sudah lunas sebelumnya' };
  }

  // 1. Update status order menjadi PAID
  await db
    .prepare("UPDATE orders SET status = 'PAID', payment_type = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
    .bind(paymentType, order.id)
    .run();

  // 2. Ambil item-item pesanan
  const { results: items } = await db
    .prepare('SELECT * FROM order_items WHERE order_id = ?')
    .bind(order.id)
    .all();

  // 3. Potong stok varian secara atomik
  for (const item of items as any[]) {
    await db
      .prepare('UPDATE product_variants SET stock = MAX(0, stock - ?) WHERE id = ?')
      .bind(Number(item.quantity), item.product_variant_id)
      .run();
  }

  // 4. Tambah Poin Loyalitas Mahasiswa jika terdaftar (10 poin tiap Rp 50.000)
  if (order.user_id) {
    const earnedPoints = Math.floor(Number(order.total_amount) / 50000) * 10;
    if (earnedPoints > 0) {
      await db
        .prepare('UPDATE users SET loyalty_points = loyalty_points + ? WHERE id = ?')
        .bind(earnedPoints, order.user_id)
        .run();
    }
  }

  return { success: true, message: 'Pembayaran berhasil diproses dan stok telah diperbarui' };
}

// POST /api/webhooks/midtrans - Endpoint resmi callback Midtrans
webhooksRouter.post('/midtrans', async (c) => {
  const db = c.env.DB;
  const payload = await c.req.json<any>();

  const orderId = payload.order_id;
  const statusCode = payload.status_code;
  const grossAmount = payload.gross_amount;
  const signatureKey = payload.signature_key;
  const transactionStatus = payload.transaction_status;
  const paymentType = payload.payment_type || 'midtrans';

  const midtrans = new MidtransService({
    serverKey: c.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-univ-sandbox-test',
    clientKey: c.env.MIDTRANS_CLIENT_KEY || 'SB-Mid-client-univ-sandbox-test',
    isProduction: c.env.MIDTRANS_IS_PRODUCTION === 'true',
  });

  // Verifikasi signature jika signature_key ada
  if (signatureKey) {
    const isValid = await midtrans.verifySignature(orderId, statusCode, grossAmount, signatureKey);
    if (!isValid) {
      return c.json({ success: false, message: 'Invalid signature key' }, 403);
    }
  }

  if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
    await processSuccessfulPayment(db, orderId, paymentType);
  } else if (transactionStatus === 'cancel' || transactionStatus === 'expire') {
    await db
      .prepare("UPDATE orders SET status = 'CANCELLED', updated_at = CURRENT_TIMESTAMP WHERE order_number = ?")
      .bind(orderId)
      .run();
  }

  return c.json({ success: true, message: 'Webhook received' });
});

// POST /api/webhooks/simulate-pay/:orderNumber - Simulasi bayar sukses untuk kemudahan testing lokal
webhooksRouter.post('/simulate-pay/:orderNumber', async (c) => {
  const db = c.env.DB;
  const orderNumber = c.req.param('orderNumber');
  const result = await processSuccessfulPayment(db, orderNumber, 'qris_sandbox');

  return c.json(result);
});
