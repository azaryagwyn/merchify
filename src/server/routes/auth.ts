import { Hono } from 'hono';
import { Env } from '../types';
import { User } from '../../shared/types';

export const authRouter = new Hono<{ Bindings: Env }>();

// GET /api/auth/users - List users for testing / quick-fill demo
authRouter.get('/users', async (c) => {
  const db = c.env.DB;
  const { results } = await db
    .prepare('SELECT id, name, email, role, phone, student_id, loyalty_points, loyalty_tier, notes, created_at FROM users')
    .all();

  const users: User[] = (results as any[]).map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    phone: u.phone,
    studentId: u.student_id,
    loyaltyPoints: Number(u.loyalty_points || 0),
    loyaltyTier: u.loyalty_tier || 'BRONZE',
    notes: u.notes,
    createdAt: u.created_at,
  }));

  return c.json({ success: true, data: users });
});

// POST /api/auth/customer/login - Login khusus Mahasiswa / Customer
authRouter.post('/customer/login', async (c) => {
  const db = c.env.DB;
  const { identifier, password } = await c.req.json<{ identifier: string; password?: string }>();

  if (!identifier) {
    return c.json({ success: false, message: 'Email atau NIM wajib diisi' }, 400);
  }

  const cleanIdentifier = identifier.trim().toLowerCase();

  // Cari berdasarkan email ATAU student_id (NIM)
  const user = await db
    .prepare('SELECT * FROM users WHERE LOWER(email) = ? OR student_id = ?')
    .bind(cleanIdentifier, identifier.trim())
    .first<any>();

  if (!user) {
    return c.json({ success: false, message: 'Akun mahasiswa tidak ditemukan. Silakan daftar terlebih dahulu.' }, 401);
  }

  if (password && user.password_hash !== password) {
    return c.json({ success: false, message: 'Password yang Anda masukkan salah' }, 401);
  }

  const userData: User = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    studentId: user.student_id,
    loyaltyPoints: Number(user.loyalty_points || 0),
    loyaltyTier: user.loyalty_tier || 'BRONZE',
    notes: user.notes,
    createdAt: user.created_at,
  };

  return c.json({
    success: true,
    message: `Selamat datang kembali, ${user.name}!`,
    data: userData,
  });
});

// POST /api/auth/customer/register - Pendaftaran Akun Mahasiswa Baru
authRouter.post('/customer/register', async (c) => {
  const db = c.env.DB;
  const body = await c.req.json<{
    name: string;
    email: string;
    studentId?: string;
    phone?: string;
    password?: string;
  }>();

  if (!body.name || !body.email || !body.password) {
    return c.json({ success: false, message: 'Nama, Email, dan Password wajib diisi' }, 400);
  }

  const cleanEmail = body.email.toLowerCase().trim();

  // Cek apakah email sudah terdaftar
  const existingEmail = await db
    .prepare('SELECT id FROM users WHERE LOWER(email) = ?')
    .bind(cleanEmail)
    .first<any>();

  if (existingEmail) {
    return c.json({ success: false, message: 'Email kampus ini sudah terdaftar. Silakan login.' }, 400);
  }

  // Cek apakah NIM sudah terdaftar jika diisi
  if (body.studentId) {
    const existingNIM = await db
      .prepare('SELECT id FROM users WHERE student_id = ?')
      .bind(body.studentId.trim())
      .first<any>();

    if (existingNIM) {
      return c.json({ success: false, message: 'NIM Mahasiswa ini sudah terdaftar.' }, 400);
    }
  }

  const userId = `usr_cust_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const passwordHash = body.password;

  await db
    .prepare(`
      INSERT INTO users (id, name, email, password_hash, role, phone, student_id, loyalty_points, loyalty_tier, notes)
      VALUES (?, ?, ?, ?, 'CUSTOMER', ?, ?, 50, 'BRONZE', 'Pendaftaran baru melalui web merchandise')
    `)
    .bind(
      userId,
      body.name.trim(),
      cleanEmail,
      passwordHash,
      body.phone?.trim() || null,
      body.studentId?.trim() || null
    )
    .run();

  const newUser: User = {
    id: userId,
    name: body.name.trim(),
    email: cleanEmail,
    role: 'CUSTOMER',
    studentId: body.studentId?.trim(),
    phone: body.phone?.trim(),
    loyaltyPoints: 50, // Bonus 50 Poin Pendaftaran!
    loyaltyTier: 'BRONZE',
    createdAt: new Date().toISOString(),
  };

  return c.json({
    success: true,
    message: 'Pendaftaran akun mahasiswa berhasil! Anda mendapatkan bonus 50 Poin Loyalitas.',
    data: newUser,
  });
});

// POST /api/auth/admin/login - Login Khusus Administrator Toko / Koperasi
authRouter.post('/admin/login', async (c) => {
  const db = c.env.DB;
  const { email, password } = await c.req.json<{ email: string; password?: string }>();

  if (!email || !password) {
    return c.json({ success: false, message: 'Email administrator dan password wajib diisi' }, 400);
  }

  const cleanEmail = email.toLowerCase().trim();

  const user = await db
    .prepare('SELECT * FROM users WHERE LOWER(email) = ?')
    .bind(cleanEmail)
    .first<any>();

  if (!user) {
    return c.json({ success: false, message: 'Akun administrator tidak ditemukan' }, 401);
  }

  // Verifikasi role harus ADMIN
  if (user.role !== 'ADMIN') {
    return c.json({
      success: false,
      message: 'Akses Ditolak: Akun Anda adalah akun Mahasiswa/Customer dan tidak memiliki hak akses administrator.',
    }, 403);
  }

  // Verifikasi password
  if (user.password_hash !== password) {
    return c.json({ success: false, message: 'Password administrator salah' }, 401);
  }

  const adminData: User = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: 'ADMIN',
    phone: user.phone,
    studentId: user.student_id,
    loyaltyPoints: Number(user.loyalty_points || 0),
    loyaltyTier: user.loyalty_tier || 'GOLD',
    notes: user.notes,
    createdAt: user.created_at,
  };

  return c.json({
    success: true,
    message: `Autentikasi Administrator Berhasil. Selamat bertugas, ${user.name}!`,
    data: adminData,
  });
});

// POST /api/auth/login - Generic fallback login
authRouter.post('/login', async (c) => {
  const db = c.env.DB;
  const { email, password } = await c.req.json<{ email: string; password?: string }>();

  const user = await db
    .prepare('SELECT * FROM users WHERE LOWER(email) = ?')
    .bind(email.toLowerCase().trim())
    .first<any>();

  if (!user) {
    return c.json({ success: false, message: 'Email tidak terdaftar' }, 401);
  }

  if (password && user.password_hash !== password) {
    return c.json({ success: false, message: 'Password salah' }, 401);
  }

  return c.json({
    success: true,
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      studentId: user.student_id,
      loyaltyPoints: Number(user.loyalty_points || 0),
      loyaltyTier: user.loyalty_tier || 'BRONZE',
    },
  });
});
