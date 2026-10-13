import React, { useState, useEffect } from 'react';
import { Package, ShoppingBag, Users, DollarSign, AlertTriangle, Edit3, Check, Save, Truck, Search, ShieldCheck } from 'lucide-react';
import { Product, Order } from '../../shared/types';

interface CustomerCRM {
  id: string;
  name: string;
  email: string;
  phone: string;
  studentId: string;
  loyaltyPoints: number;
  loyaltyTier: 'BRONZE' | 'SILVER' | 'GOLD';
  notes: string;
  totalOrders: number;
  lifetimeValue: number;
}

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'metrics' | 'products' | 'orders' | 'crm'>('metrics');
  
  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<CustomerCRM[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit stock state
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [stockInput, setStockInput] = useState<number>(0);

  // Edit discount state
  const [editingDiscountId, setEditingDiscountId] = useState<string | null>(null);
  const [discountInput, setDiscountInput] = useState<number>(0);

  // Edit CRM note state
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState<string>('');
  const [tierInput, setTierInput] = useState<string>('BRONZE');

  // Tracking number edit
  const [editingTrackingId, setEditingTrackingId] = useState<string | null>(null);
  const [trackingInput, setTrackingInput] = useState<string>('');

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [prodRes, orderRes, crmRes] = await Promise.all([
        fetch('/api/products').then((r) => r.json() as Promise<any>),
        fetch('/api/orders').then((r) => r.json() as Promise<any>),
        fetch('/api/crm/customers').then((r) => r.json() as Promise<any>),
      ]);

      if (prodRes?.success) setProducts(prodRes.data);
      if (orderRes?.success) setOrders(orderRes.data);
      if (crmRes?.success) setCustomers(crmRes.data);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Update Variant Stock
  const handleSaveStock = async (variantId: string) => {
    try {
      await fetch(`/api/products/variants/${variantId}/stock`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: Number(stockInput) }),
      });
      setEditingStockId(null);
      loadAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // Update Item-Specific Discount
  const handleSaveDiscount = async (productId: string) => {
    try {
      await fetch(`/api/products/${productId}/discount`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ discountPercentage: Number(discountInput) }),
      });
      setEditingDiscountId(null);
      loadAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // Update Order Status
  const handleUpdateOrderStatus = async (orderId: string, status: string, trackingNumber?: string) => {
    try {
      await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, trackingNumber }),
      });
      setEditingTrackingId(null);
      loadAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // Update Customer CRM
  const handleSaveCRM = async (customerId: string) => {
    try {
      await fetch(`/api/crm/customers/${customerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: noteInput, loyaltyTier: tierInput }),
      });
      setEditingNoteId(null);
      loadAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // Metrics
  const totalRevenue = orders
    .filter((o) => o.status === 'PAID' || o.status === 'SHIPPED' || o.status === 'COMPLETED')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const lowStockVariants = products.flatMap((p) =>
    p.variants
      .filter((v) => v.stock <= 5)
      .map((v) => ({ ...v, productName: p.name }))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-campus-600">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Merchify Store Administrator • Awrora University</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            Dashboard Manajemen Merchify
          </h1>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-1 p-1.5 bg-slate-200/80 rounded-2xl border border-slate-300 text-xs font-bold">
          <button
            onClick={() => setActiveTab('metrics')}
            className={`px-3.5 py-2 rounded-xl transition-all ${
              activeTab === 'metrics' ? 'bg-white text-campus-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ringkasan
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-3.5 py-2 rounded-xl transition-all ${
              activeTab === 'products' ? 'bg-white text-campus-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Produk & Stok ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3.5 py-2 rounded-xl transition-all ${
              activeTab === 'orders' ? 'bg-white text-campus-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pesanan ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('crm')}
            className={`px-3.5 py-2 rounded-xl transition-all ${
              activeTab === 'crm' ? 'bg-white text-campus-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            CRM Mahasiswa ({customers.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">Memuat data manajemen...</div>
      ) : (
        <>
          {/* TAB 1: METRICS */}
          {activeTab === 'metrics' && (
            <div className="space-y-8">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-emerald-600 mb-2">
                    <span className="text-xs font-bold text-slate-500">Total Omzet Lunas</span>
                    <DollarSign className="w-5 h-5 bg-emerald-50 rounded-lg p-0.5" />
                  </div>
                  <p className="text-2xl font-black text-slate-900">
                    Rp {totalRevenue.toLocaleString('id-ID')}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">Dari transaksi lunas Midtrans</p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-campus-600 mb-2">
                    <span className="text-xs font-bold text-slate-500">Pesanan Masuk</span>
                    <ShoppingBag className="w-5 h-5 bg-campus-50 rounded-lg p-0.5" />
                  </div>
                  <p className="text-2xl font-black text-slate-900">{orders.length}</p>
                  <p className="text-[11px] text-slate-400 mt-1">Total order diproses</p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-campus-600 mb-2">
                    <span className="text-xs font-bold text-slate-500">Pelanggan Mahasiswa</span>
                    <Users className="w-5 h-5 bg-campus-50 rounded-lg p-0.5" />
                  </div>
                  <p className="text-2xl font-black text-slate-900">{customers.length}</p>
                  <p className="text-[11px] text-slate-400 mt-1">Terdaftar dalam CRM</p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-amber-600 mb-2">
                    <span className="text-xs font-bold text-slate-500">Peringatan Stok Tipis</span>
                    <AlertTriangle className="w-5 h-5 bg-amber-50 rounded-lg p-0.5" />
                  </div>
                  <p className="text-2xl font-black text-amber-700">{lowStockVariants.length} varian</p>
                  <p className="text-[11px] text-slate-400 mt-1">Stok &le; 5 pcs</p>
                </div>
              </div>

              {/* Low Stock Alerts */}
              {lowStockVariants.length > 0 && (
                <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200">
                  <h3 className="font-bold text-sm text-amber-900 flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Peringatan Inventaris: Stok Perlu Restock Segera!
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {lowStockVariants.map((item) => (
                      <div key={item.id} className="p-3 rounded-xl bg-white border border-amber-200 text-xs">
                        <p className="font-bold text-slate-900">{item.productName}</p>
                        <p className="text-slate-500 mt-0.5">
                          Varian: {[item.size, item.color].filter(Boolean).join(' • ')} (SKU: {item.sku})
                        </p>
                        <span className={`inline-block mt-2 px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          item.stock === 0 ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {item.stock === 0 ? 'Habis (0 pcs)' : `Sisa ${item.stock} pcs`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PRODUCTS & STOCK MANAGEMENT */}
          {activeTab === 'products' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-base text-slate-900">Katalog Produk & Kelola Stok Varian</h3>
                  <p className="text-xs text-slate-500">Ubah stok real-time atau sesuaikan persentase diskon per item.</p>
                </div>
              </div>

              <div className="divide-y divide-slate-200">
                {products.map((product) => (
                  <div key={product.id} className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                        />
                        <div>
                          <span className="text-[10px] font-bold text-campus-600 uppercase">{product.category}</span>
                          <h4 className="font-bold text-sm text-slate-900">{product.name}</h4>
                          <p className="text-xs text-slate-500">
                            Harga Pokok: Rp {product.basePrice.toLocaleString('id-ID')}
                          </p>
                        </div>
                      </div>

                      {/* Item-specific discount manager */}
                      <div className="flex items-center gap-2">
                        {editingDiscountId === product.id ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-slate-600">Diskon (%):</span>
                            <input
                              type="number"
                              min="0"
                              max="90"
                              value={discountInput}
                              onChange={(e) => setDiscountInput(Number(e.target.value))}
                              className="w-16 px-2 py-1 text-xs border border-slate-300 rounded-lg"
                            />
                            <button
                              onClick={() => handleSaveDiscount(product.id)}
                              className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                              title="Simpan diskon"
                            >
                              <Save className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingDiscountId(null)}
                              className="p-1.5 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 text-xs"
                            >
                              Batal
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingDiscountId(product.id);
                              setDiscountInput(product.discountPercentage || 0);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>
                              {product.discountPercentage > 0 ? `Diskon: ${product.discountPercentage}%` : 'Set Diskon Item'}
                            </span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Variants and Stocks Table */}
                    <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80">
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Stok per Varian (Ukuran / Warna):
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {product.variants.map((v) => (
                          <div
                            key={v.id}
                            className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs flex items-center justify-between"
                          >
                            <div>
                              <p className="font-semibold text-slate-800">
                                {[v.size, v.color].filter(Boolean).join(' - ') || 'Standard'}
                              </p>
                              <p className="text-[10px] text-slate-400">SKU: {v.sku}</p>
                            </div>

                            {editingStockId === v.id ? (
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  min="0"
                                  value={stockInput}
                                  onChange={(e) => setStockInput(Number(e.target.value))}
                                  className="w-14 px-1.5 py-1 text-xs border border-campus-500 rounded-lg"
                                />
                                <button
                                  onClick={() => handleSaveStock(v.id)}
                                  className="p-1 bg-campus-600 text-white rounded-lg hover:bg-campus-700"
                                >
                                  <Save className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setEditingStockId(v.id);
                                  setStockInput(v.stock);
                                }}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors flex items-center gap-1 ${
                                  v.stock === 0
                                    ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                                    : v.stock <= 5
                                    ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                                    : 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200'
                                }`}
                                title="Klik untuk ubah stok"
                              >
                                <span>Stok: {v.stock}</span>
                                <Edit3 className="w-2.5 h-2.5 opacity-50" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: ORDERS MANAGEMENT */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-200">
                <h3 className="font-bold text-base text-slate-900">Daftar Transaksi Pesanan Mahasiswa</h3>
                <p className="text-xs text-slate-500">Perbarui status pengiriman dan masukkan nomor resi.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="p-4">No. Pesanan</th>
                      <th className="p-4">Pelanggan</th>
                      <th className="p-4">Total</th>
                      <th className="p-4">Pengiriman</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Resi / Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700">
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400">
                          Belum ada transaksi pesanan.
                        </td>
                      </tr>
                    ) : (
                      orders.map((o) => (
                        <tr key={o.id} className="hover:bg-slate-50/80">
                          <td className="p-4 font-mono font-bold text-slate-900">
                            {o.orderNumber}
                            <span className="block text-[10px] font-normal text-slate-400">
                              {new Date(o.createdAt).toLocaleDateString('id-ID')}
                            </span>
                          </td>
                          <td className="p-4">
                            <p className="font-bold text-slate-900">{o.customerName}</p>
                            <p className="text-[10px] text-slate-400">{o.customerPhone}</p>
                          </td>
                          <td className="p-4 font-extrabold text-slate-900">
                            Rp {o.totalAmount.toLocaleString('id-ID')}
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                              {o.shippingMethod}
                            </span>
                          </td>
                          <td className="p-4">
                            <select
                              value={o.status}
                              onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                              className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-300 bg-white"
                            >
                              <option value="PENDING">PENDING</option>
                              <option value="PAID">PAID (Lunas)</option>
                              <option value="PROCESSING">PROCESSING</option>
                              <option value="SHIPPED">SHIPPED</option>
                              <option value="COMPLETED">COMPLETED</option>
                              <option value="CANCELLED">CANCELLED</option>
                            </select>
                          </td>
                          <td className="p-4">
                            {editingTrackingId === o.id ? (
                              <div className="flex items-center gap-1">
                                <input
                                  type="text"
                                  placeholder="No. Resi"
                                  value={trackingInput}
                                  onChange={(e) => setTrackingInput(e.target.value)}
                                  className="w-28 px-2 py-1 text-xs border border-slate-300 rounded-lg"
                                />
                                <button
                                  onClick={() => handleUpdateOrderStatus(o.id, o.status, trackingInput)}
                                  className="p-1 bg-campus-600 text-white rounded-lg hover:bg-campus-700"
                                >
                                  <Save className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setEditingTrackingId(o.id);
                                  setTrackingInput(o.trackingNumber || '');
                                }}
                                className="inline-flex items-center gap-1 text-[11px] text-campus-700 hover:underline font-semibold"
                              >
                                <Truck className="w-3 h-3" />
                                <span>{o.trackingNumber || 'Input Resi'}</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: CRM PELANGGAN MAHASISWA */}
          {activeTab === 'crm' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-200">
                <h3 className="font-bold text-base text-slate-900">CRM & Manajemen Hubungan Pelanggan (Mahasiswa)</h3>
                <p className="text-xs text-slate-500">Analitik LTV belanja, tingkat loyalitas, poin reward, dan catatan interaksi.</p>
              </div>

              <div className="divide-y divide-slate-200">
                {customers.map((c) => (
                  <div key={c.id} className="p-5">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900">{c.name}</h4>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                            c.loyaltyTier === 'GOLD' ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-slate-100 text-slate-800 border-slate-300'
                          }`}>
                            ⭐ {c.loyaltyTier}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {c.email} • {c.phone} • NIM: {c.studentId || 'N/A'}
                        </p>

                        <div className="flex gap-4 mt-3 text-xs">
                          <div>
                            <span className="text-slate-400">Total Order:</span>{' '}
                            <span className="font-bold text-slate-800">{c.totalOrders} kali</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Lifetime Value:</span>{' '}
                            <span className="font-extrabold text-campus-700">Rp {c.lifetimeValue.toLocaleString('id-ID')}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Poin Loyalitas:</span>{' '}
                            <span className="font-bold text-amber-600">{c.loyaltyPoints} Poin</span>
                          </div>
                        </div>
                      </div>

                      {/* CRM Notes & Tier Adjustment */}
                      <div className="w-full md:w-96">
                        {editingNoteId === c.id ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <label className="text-xs font-semibold text-slate-600">Tier:</label>
                              <select
                                value={tierInput}
                                onChange={(e) => setTierInput(e.target.value)}
                                className="px-2 py-1 text-xs border border-slate-300 rounded-lg"
                              >
                                <option value="BRONZE">BRONZE</option>
                                <option value="SILVER">SILVER</option>
                                <option value="GOLD">GOLD</option>
                              </select>
                            </div>
                            <textarea
                              rows={2}
                              value={noteInput}
                              onChange={(e) => setNoteInput(e.target.value)}
                              placeholder="Catatan CRM (preferensi, status organisasi, dsb.)"
                              className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-campus-500"
                            ></textarea>
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => setEditingNoteId(null)}
                                className="px-2.5 py-1 text-xs font-semibold text-slate-500"
                              >
                                Batal
                              </button>
                              <button
                                onClick={() => handleSaveCRM(c.id)}
                                className="px-3 py-1 bg-campus-600 hover:bg-campus-700 text-white text-xs font-bold rounded-lg flex items-center gap-1"
                              >
                                <Save className="w-3 h-3" />
                                <span>Simpan</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-slate-500 uppercase text-[10px]">Catatan Admin CRM:</span>
                              <button
                                onClick={() => {
                                  setEditingNoteId(c.id);
                                  setNoteInput(c.notes || '');
                                  setTierInput(c.loyaltyTier || 'BRONZE');
                                }}
                                className="text-campus-600 hover:underline flex items-center gap-0.5 text-[11px] font-semibold"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>Edit</span>
                              </button>
                            </div>
                            <p className="text-slate-600 italic">
                              {c.notes || 'Belum ada catatan khusus untuk mahasiswa ini.'}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
