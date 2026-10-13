import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { Env } from './types';
import { productsRouter } from './routes/products';
import { promotionsRouter } from './routes/promotions';
import { checkoutRouter } from './routes/checkout';
import { webhooksRouter } from './routes/webhooks';
import { ordersRouter } from './routes/orders';
import { reviewsRouter } from './routes/reviews';
import { crmRouter } from './routes/crm';
import { authRouter } from './routes/auth';
import { paymentRouter } from './routes/payment';

const app = new Hono<{ Bindings: Env }>();

// Middlewares
app.use('*', logger());
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Health check
app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Universitas Merch Cloudflare Worker',
  });
});

// API Routes
app.route('/api/products', productsRouter);
app.route('/api/promotions', promotionsRouter);
app.route('/api/checkout', checkoutRouter);
app.route('/api/webhooks', webhooksRouter);
app.route('/api/orders', ordersRouter);
app.route('/api/reviews', reviewsRouter);
app.route('/api/crm', crmRouter);
app.route('/api/auth', authRouter);
app.route('/api/payment', paymentRouter);

// Fallback to static assets (Vite frontend) when deployed
app.all('*', async (c) => {
  if (c.env.ASSETS) {
    return await c.env.ASSETS.fetch(c.req.raw);
  }
  return c.text('Not Found', 404);
});

export default app;
