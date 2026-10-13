# Universitas Merch Store (Cloudflare Full-Stack PWA E-Commerce)

Toko Online Resmi Merchandise Universitas berbasis **100% Cloudflare Native Stack** dengan database **Cloudflare D1 (Serverless SQLite)**, **Cloudflare Workers (Hono API & Static Assets)**, **React + Vite + Tailwind CSS**, **Progressive Web App (PWA)**, **SEO Engine**, dan Payment Gateway **Midtrans Sandbox**.

---

## 🚀 Fitur Unggulan

1. **Multi-Role (Mahasiswa & Admin)**:
   - **Customer**: Registrasi/login NIM & Email, Profil Mahasiswa, Poin Loyalitas (*Gold/Silver/Bronze*), dan Riwayat Pesanan.
   - **Admin**: Dashboard khusus untuk Ringkasan Omzet, Kelola Stok Varian, Diskon Item, Status Pengiriman & Nomor Resi, serta Panel CRM.
2. **Pilihan Varian Lengkap**:
   - Pilihan warna (*Navy Blue, Maroon, Jet Black, Ivory White*) dan ukuran (*S, M, L, XL, XXL*).
   - Indikator stok real-time (*Tersedia*, *Stok Terbatas*, *Habis*).
3. **Diskon Spesifik Item & Kupon Global**:
   - Diskon per item (misal Hoodie diskon 20%, Varsity diskon 15%) dengan badge persentase & harga coret.
   - Kupon promo tambahan saat checkout (contoh: `MABA2026` diskon 20%, `KAMPUSJUARA` potongan Rp 25.000).
4. **Mobile Shipping Estimator**:
   - Pilihan kurir fleksibel: *Ambil di Kampus (Rp 0)*, *Kurir Kilat Kampus Sameday (Rp 10.000)*, dan *Ekspedisi Reguler (JNE/J&T)* beserta estimasi durasi tiba.
5. **Customer Reviews & Ratings**:
   - Rating bintang 1–5, komentar ulasan, dan badge otomatis **"Pembeli Terverifikasi"** bagi mahasiswa yang sudah membeli produk.
6. **Post-Purchase Experience**:
   - Layar konfirmasi pesanan dengan nomor resi, tracking pengiriman, unduh/cetak **Invoice Digital**, dan tombol simulasi pembayaran instan untuk testing sandbox.
7. **CRM (Customer Relationship Management)**:
   - Pelacakan nilai belanja pelanggan (*Lifetime Value* / LTV), frekuensi order, tier loyalitas, dan catatan interaksi admin.
8. **Progressive Web App (PWA)**:
   - `manifest.webmanifest`, Service Worker offline cache, dan tombol *"Install App"* ke layar utama HP / Desktop.
9. **SEO Engine**:
   - Dynamic meta tags, OpenGraph WhatsApp preview, Twitter Cards, Schema.org JSON-LD Store, `robots.txt`, dan `sitemap.xml`.
10. **Midtrans Sandbox Payment Gateway**:
    - Popup modal Midtrans Snap terintegrasi (QRIS, GoPay, VA Bank BCA/Mandiri/BRI/BNI, Kartu Kredit).
    - Webhook callback dengan verifikasi signature hash SHA-512 `crypto.subtle` dan pemotongan stok otomatis di D1 SQLite.

---

## 🛠️ Menjalankan Proyek Secara Lokal

### 1. Menjalankan Server Cloudflare Workers & D1:
```bash
npx wrangler dev --port 8787
```
Server akan aktif di `http://127.0.0.1:8787` melayani API dan Static Assets frontend.

### 2. Menjalankan Client Vite dengan Hot-Reload (Dev Mode):
```bash
npm run dev:client
```
Frontend Vite akan aktif di `http://localhost:5173` dan otomatis mem-proxy API ke port 8787.

### 3. Migrasi Database D1:
```bash
npx wrangler d1 migrations apply univ_merch_db --local
```

### 4. Build Produksi:
```bash
npm run build:client
```

---

## 📁 Struktur Direktori
```
univ-merch-store/
├── migrations/
│   ├── 0001_init.sql              # Skema tabel D1 SQLite
│   └── 0002_seed.sql              # Seed data produk, varian, user, promo, review
├── public/
│   ├── manifest.webmanifest       # PWA Manifest
│   ├── sw.js                      # PWA Service Worker
│   ├── robots.txt
│   └── sitemap.xml
├── src/
│   ├── client/                    # Frontend React + Tailwind CSS
│   │   ├── components/            # Navbar, ProductCard, CartDrawer, Checkout, Admin, dll.
│   │   ├── hooks/                 # useCart, useAuth
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── server/                    # Cloudflare Worker API (Hono)
│   │   ├── routes/                # auth, products, orders, checkout, webhooks, crm, promotions
│   │   ├── services/              # midtrans.ts (Snap & Web Crypto SHA-512)
│   │   └── index.ts               # Worker entrypoint
│   └── shared/
│       └── types.ts               # Shared TypeScript types
├── wrangler.jsonc                 # Cloudflare Workers & D1 configuration
└── package.json
```
