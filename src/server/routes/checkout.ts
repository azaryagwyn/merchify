import { Hono } from 'hono';
import { Env } from '../types';
import { MidtransService } from '../services/midtrans';

export const checkoutRouter = new Hono<{ Bindings: Env }>();

interface CheckoutRequestBody {
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  shippingMethod: 'PICKUP' | 'SAMEDAY_CAMPUS' | 'REGULAR_COURIER';
  shippingCost: number;
  promoCode?: string;
  items: Array<{
    variantId: string;
    quantity: number;
  }>;
}

checkoutRouter.post('/', async (c) => {
  const db = c.env.DB;
  const body = await c.req.json<CheckoutRequestBody>();

  if (!body.items || body.items.length === 0) {
    return c.json({ success: false, message: 'Keranjang belanja kosong' }, 400);
  }

  if (!body.customerName || !body.customerEmail || !body.customerPhone || !body.shippingAddress) {
    return c.json({ success: false, message: 'Informasi pemesan dan alamat wajib diisi' }, 400);
  }

  // 1. Verifikasi dan hitung harga riil item dari D1
  let subtotal = 0;
  const verifiedItems: Array<{
    variantId: string;
    productName: string;
    variantInfo: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }> = [];

  for (const item of body.items) {
    const variantRow = await db
      .prepare(`
        SELECT v.*, p.name as product_name, p.base_price, p.discount_percentage, p.discount_price 
        FROM product_variants v 
        JOIN products p ON v.product_id = p.id 
        WHERE v.id = ?
      `)
      .bind(item.variantId)
      .first<any>();

    if (!variantRow) {
      return c.json({ success: false, message: `Varian item tidak ditemukan` }, 400);
    }

    if (variantRow.stock < item.quantity) {
      return c.json({
        success: false,
        message: `Stok untuk ${variantRow.product_name} (${variantRow.size || ''} ${variantRow.color || ''}) tidak mencukupi. Sisa stok: ${variantRow.stock}`,
      }, 400);
    }

    // Hitung harga satuan (dengan item discount + price adjustment)
    const effectiveBasePrice = variantRow.discount_price 
      ? Number(variantRow.discount_price) 
      : Number(variantRow.base_price);
    const unitPrice = effectiveBasePrice + Number(variantRow.price_adjustment || 0);
    const itemTotal = unitPrice * item.quantity;
    subtotal += itemTotal;

    const variantInfo = [variantRow.size, variantRow.color].filter(Boolean).join(' - ') || 'Default';

    verifiedItems.push({
      variantId: variantRow.id,
      productName: variantRow.product_name,
      variantInfo,
      quantity: item.quantity,
      unitPrice,
      totalPrice: itemTotal,
    });
  }

  // 2. Hitung diskon kupon promo jika ada
  let discountAmount = 0;
  if (body.promoCode) {
    const promo = await db
      .prepare('SELECT * FROM promotions WHERE code = ? AND is_active = 1')
      .bind(body.promoCode.toUpperCase().trim())
      .first<any>();

    if (promo && subtotal >= Number(promo.min_purchase)) {
      if (promo.discount_type === 'PERCENTAGE') {
        discountAmount = Math.round((subtotal * Number(promo.discount_value)) / 100);
      } else {
        discountAmount = Number(promo.discount_value);
      }
      discountAmount = Math.min(discountAmount, subtotal);
    }
  }

  const shippingCost = Math.max(0, Number(body.shippingCost || 0));
  const totalAmount = Math.max(0, subtotal - discountAmount + shippingCost);

  // 3. Generate ID dan Order Number
  const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randCode = Math.floor(1000 + Math.random() * 9000);
  const orderNumber = `UNIV-${dateStr}-${randCode}`;

  let estimatedDelivery = '1-2 hari kerja';
  if (body.shippingMethod === 'PICKUP') {
    estimatedDelivery = 'Bisa diambil hari ini di Koperasi Kampus';
  } else if (body.shippingMethod === 'SAMEDAY_CAMPUS') {
    estimatedDelivery = 'Hari ini (2-4 jam oleh Kurir Mahasiswa)';
  }

  // 4. Inisialisasi Midtrans Snap
  const midtrans = new MidtransService({
    serverKey: c.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-univ-sandbox-test',
    clientKey: c.env.MIDTRANS_CLIENT_KEY || 'SB-Mid-client-univ-sandbox-test',
    isProduction: c.env.MIDTRANS_IS_PRODUCTION === 'true',
  });

  const snapResult = await midtrans.createSnapToken({
    transaction_details: {
      order_id: orderNumber,
      gross_amount: Math.round(totalAmount),
    },
    customer_details: {
      first_name: body.customerName,
      email: body.customerEmail,
      phone: body.customerPhone,
      shipping_address: {
        address: body.shippingAddress,
      },
    },
    item_details: [
      ...verifiedItems.map((item) => ({
        id: item.variantId,
        price: Math.round(item.unitPrice),
        quantity: item.quantity,
        name: `${item.productName} (${item.variantInfo})`.slice(0, 50),
      })),
      ...(shippingCost > 0
        ? [{
            id: 'SHIPPING',
            price: Math.round(shippingCost),
            quantity: 1,
            name: `Ongkir (${body.shippingMethod})`,
          }]
        : []),
      ...(discountAmount > 0
        ? [{
            id: 'DISCOUNT',
            price: -Math.round(discountAmount),
            quantity: 1,
            name: `Diskon Kupon (${body.promoCode || 'PROMO'})`,
          }]
        : []),
    ],
  });

  // 5. Simpan Order ke D1 Database
  await db
    .prepare(`
      INSERT INTO orders (
        id, order_number, user_id, customer_name, customer_email, customer_phone,
        shipping_address, shipping_method, shipping_cost, estimated_delivery,
        subtotal, discount_amount, total_amount, status, snap_token
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?)
    `)
    .bind(
      orderId,
      orderNumber,
      body.userId || null,
      body.customerName,
      body.customerEmail,
      body.customerPhone,
      body.shippingAddress,
      body.shippingMethod,
      shippingCost,
      estimatedDelivery,
      subtotal,
      discountAmount,
      totalAmount,
      snapResult.token
    )
    .run();

  // 6. Simpan Detail Item Order
  for (const item of verifiedItems) {
    const itemId = `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    await db
      .prepare(`
        INSERT INTO order_items (
          id, order_id, product_variant_id, product_name, variant_info, quantity, unit_price, total_price
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        itemId,
        orderId,
        item.variantId,
        item.productName,
        item.variantInfo,
        item.quantity,
        item.unitPrice,
        item.totalPrice
      )
      .run();
  }

  return c.json({
    success: true,
    data: {
      orderId,
      orderNumber,
      snapToken: snapResult.token,
      redirectUrl: snapResult.redirect_url,
      totalAmount,
      subtotal,
      shippingCost,
      discountAmount,
      estimatedDelivery,
    },
  });
});
