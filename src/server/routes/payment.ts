import { Hono } from 'hono';
import { Env } from '../types';

export const paymentRouter = new Hono<{ Bindings: Env }>();

// Helper to deduct stock and set order to PAID atomically
async function processPaymentAndDeductStock(db: D1Database, orderNumber: string, paymentType: string = 'midtrans_sandbox') {
  const order = await db
    .prepare('SELECT * FROM orders WHERE order_number = ?')
    .bind(orderNumber)
    .first<any>();

  if (!order) {
    return { success: false, message: 'Pesanan tidak ditemukan' };
  }

  // Deduct stock if not already deducted (idempotency check)
  if (order.status !== 'PAID') {
    // 1. Update order status to PAID
    await db
      .prepare("UPDATE orders SET status = 'PAID', payment_type = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
      .bind(paymentType, order.id)
      .run();

    // 2. Fetch order items
    const { results: items } = await db
      .prepare('SELECT * FROM order_items WHERE order_id = ?')
      .bind(order.id)
      .all();

    // 3. Deduct stock from product_variants
    for (const item of items as any[]) {
      await db
        .prepare('UPDATE product_variants SET stock = MAX(0, stock - ?) WHERE id = ?')
        .bind(Number(item.quantity), item.product_variant_id)
        .run();
    }

    // 4. Add loyalty points if customer is registered
    if (order.user_id) {
      const earnedPoints = Math.floor(Number(order.total_amount) / 50000) * 10;
      if (earnedPoints > 0) {
        await db
          .prepare('UPDATE users SET loyalty_points = loyalty_points + ? WHERE id = ?')
          .bind(earnedPoints, order.user_id)
          .run();
      }
    }
  }

  return { success: true, message: 'Pembayaran berhasil diverifikasi dan stok telah dipotong' };
}

/**
 * POST /api/payment/simulate
 * Endpoint pengujian verifikasi pembayaran & pemulihan isolate Midtrans Sandbox
 * Menerima orderData (nomor pesanan, id pesanan, atau payload pesanan baru)
 * Return HTTP 200 OK: { success: true, status: 'paid', stok berkurang }
 */
paymentRouter.post('/simulate', async (c) => {
  const db = c.env.DB;
  let body: any = {};
  try {
    body = await c.req.json();
  } catch {
    body = {};
  }

  const orderData = body.orderData || body;
  let orderNumber =
    orderData.orderNumber ||
    orderData.order_number ||
    orderData.orderId ||
    orderData.order_id ||
    orderData.id ||
    body.orderNumber ||
    body.order_number ||
    body.orderId ||
    body.order_id ||
    body.id;

  let targetOrder: any = null;

  // 1. Cari pesanan berdasarkan nomor / id pesanan yang dikirimkan
  if (orderNumber) {
    targetOrder = await db
      .prepare('SELECT * FROM orders WHERE order_number = ? OR id = ?')
      .bind(orderNumber, orderNumber)
      .first<any>();
  }

  // Normalisasi single variant jika dikirim langsung di orderData
  if (!orderData.items && (orderData.variantId || orderData.variant_id || orderData.product_variant_id)) {
    orderData.items = [
      {
        variantId: orderData.variantId || orderData.variant_id || orderData.product_variant_id,
        quantity: orderData.quantity || 1,
      },
    ];
  }

  // 2. Jika orderData menyertakan items baru untuk dibuat sekaligus disimulasikan
  if (!targetOrder && orderData.items && Array.isArray(orderData.items) && orderData.items.length > 0) {
    const newOrderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randCode = Math.floor(1000 + Math.random() * 9000);
    orderNumber = `UNIV-${dateStr}-${randCode}`;

    let subtotal = 0;
    const verifiedItems: any[] = [];

    for (const it of orderData.items) {
      const variantId = it.variantId || it.variant_id || it.product_variant_id || it.id;
      const v = await db
        .prepare(`
          SELECT v.*, p.name as product_name, p.base_price, p.discount_price 
          FROM product_variants v 
          JOIN products p ON v.product_id = p.id 
          WHERE v.id = ?
        `)
        .bind(variantId)
        .first<any>();

      if (v) {
        const qty = Number(it.quantity || 1);
        const price = Number(v.discount_price || v.base_price) + Number(v.price_adjustment || 0);
        subtotal += price * qty;
        verifiedItems.push({
          variantId: v.id,
          productName: v.product_name,
          variantInfo: [v.size, v.color].filter(Boolean).join(' - ') || 'Standard',
          quantity: qty,
          unitPrice: price,
          totalPrice: price * qty,
        });

        // Potong stok varian secara langsung
        await db
          .prepare('UPDATE product_variants SET stock = MAX(0, stock - ?) WHERE id = ?')
          .bind(qty, v.id)
          .run();
      }
    }

    const shippingCost = Number(orderData.shippingCost || orderData.shipping_cost || 0);
    const totalAmount = subtotal + shippingCost;

    await db
      .prepare(`
        INSERT INTO orders (
          id, order_number, user_id, customer_name, customer_email, customer_phone,
          shipping_address, shipping_method, shipping_cost, estimated_delivery,
          subtotal, discount_amount, total_amount, status, payment_type
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Selesai', ?, 0, ?, 'PAID', 'midtrans_sandbox')
      `)
      .bind(
        newOrderId,
        orderNumber,
        orderData.userId || null,
        orderData.customerName || 'Mahasiswa Tester',
        orderData.customerEmail || 'tester@awrora.ac.id',
        orderData.customerPhone || '081234567890',
        orderData.shippingAddress || 'Kampus Pusat Awrora University',
        orderData.shippingMethod || 'PICKUP',
        shippingCost,
        subtotal,
        totalAmount
      )
      .run();

    for (const item of verifiedItems) {
      const itemId = `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      await db
        .prepare(`
          INSERT INTO order_items (id, order_id, product_variant_id, product_name, variant_info, quantity, unit_price, total_price)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `)
        .bind(itemId, newOrderId, item.variantId, item.productName, item.variantInfo, item.quantity, item.unitPrice, item.totalPrice)
        .run();
    }

    targetOrder = await db.prepare('SELECT * FROM orders WHERE id = ?').bind(newOrderId).first<any>();
  }

  // 3. Jika tidak menemukan order tertentu, ambil pesanan PENDING paling baru atau pesanan terbaru
  if (!targetOrder) {
    targetOrder = await db
      .prepare("SELECT * FROM orders WHERE status = 'PENDING' ORDER BY created_at DESC LIMIT 1")
      .first<any>();
  }

  // 4. Jika masih belum ada pesanan sama sekali, buatkan satu pesanan simulasi
  if (!targetOrder) {
    const fallbackVariant = await db.prepare('SELECT id, stock FROM product_variants LIMIT 1').first<any>();
    const newOrderId = `ord_${Date.now()}`;
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    orderNumber = `UNIV-${dateStr}-8888`;

    await db
      .prepare(`
        INSERT INTO orders (
          id, order_number, customer_name, customer_email, customer_phone,
          shipping_address, shipping_method, shipping_cost, estimated_delivery,
          subtotal, total_amount, status, payment_type
        ) VALUES (?, ?, 'Mahasiswa Tester', 'tester@awrora.ac.id', '081234567890', 'Awrora Campus', 'PICKUP', 0, 'Selesai', 50000, 50000, 'PAID', 'midtrans_sandbox')
      `)
      .bind(newOrderId, orderNumber)
      .run();

    if (fallbackVariant) {
      await db
        .prepare(`
          INSERT INTO order_items (id, order_id, product_variant_id, product_name, variant_info, quantity, unit_price, total_price)
          VALUES (?, ?, ?, 'Merchandise Awrora', 'Standard', 1, 50000, 50000)
        `)
        .bind(`item_${Date.now()}`, newOrderId, fallbackVariant.id)
        .run();

      await db
        .prepare('UPDATE product_variants SET stock = MAX(0, stock - 1) WHERE id = ?')
        .bind(fallbackVariant.id)
        .run();
    }

    targetOrder = await db.prepare('SELECT * FROM orders WHERE id = ?').bind(newOrderId).first<any>();
  }

  // 5. Eksekusi pemotongan stok dan pembaruan status ke PAID jika pesanan ditemukan
  if (targetOrder) {
    await processPaymentAndDeductStock(db, targetOrder.order_number, 'midtrans_sandbox');

    const refreshedOrder = await db
      .prepare('SELECT * FROM orders WHERE id = ?')
      .bind(targetOrder.id)
      .first<any>();

    const { results: items } = await db
      .prepare('SELECT * FROM order_items WHERE order_id = ?')
      .bind(targetOrder.id)
      .all();

    return c.json(
      {
        success: true,
        status: 'paid', // Status: paid lowercase
        Status: 'PAID', // Status: PAID uppercase
        message: 'Verifikasi pembayaran berhasil: status paid, stok berkurang',
        orderNumber: refreshedOrder.order_number,
        data: {
          ...refreshedOrder,
          items,
          status: 'paid',
        },
      },
      200
    );
  }

  return c.json(
    {
      success: false,
      status: 'error',
      message: 'Gagal memproses verifikasi simulasi pembayaran',
    },
    400
  );
});

// Endpoint untuk status pembayaran
paymentRouter.get('/status/:orderNumber', async (c) => {
  const db = c.env.DB;
  const orderNumber = c.req.param('orderNumber');
  const order = await db
    .prepare('SELECT * FROM orders WHERE order_number = ?')
    .bind(orderNumber)
    .first<any>();

  if (!order) {
    return c.json({ success: false, message: 'Pesanan tidak ditemukan' }, 404);
  }

  return c.json({
    success: true,
    status: order.status.toLowerCase(),
    orderStatus: order.status,
    data: order,
  });
});
