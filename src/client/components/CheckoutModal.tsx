import React, { useState } from 'react';
import { X, ShieldCheck, CreditCard, Lock, AlertCircle } from 'lucide-react';
import { CartItem, ShippingOption, User, Order } from '../../shared/types';
import { PromoState } from '../hooks/useCart';

declare global {
  interface Window {
    snap?: any;
  }
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: User;
  items: CartItem[];
  promo: PromoState | null;
  selectedShipping: ShippingOption;
  subtotal: number;
  discountAmount: number;
  shippingCost: number;
  totalAmount: number;
  onOrderCreated: (order: Order) => void;
  onClearCart: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  items,
  promo,
  selectedShipping,
  subtotal,
  discountAmount,
  shippingCost,
  totalAmount,
  onOrderCreated,
  onClearCart,
}) => {
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '081234567890');
  const [address, setAddress] = useState(
    selectedShipping.id === 'PICKUP'
      ? 'Gedung Student Center Lt. 1, Loket Koperasi Mahasiswa'
      : 'Asrama Mahasiswa Kampus Gedung B, Kamar 304, Kampus Pusat'
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim() || !address.trim()) {
      setError('Mohon lengkapi semua data formulir');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.id,
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          shippingAddress: address,
          shippingMethod: selectedShipping.id,
          shippingCost,
          promoCode: promo?.code,
          items: items.map((i) => ({
            variantId: i.variantId,
            quantity: i.quantity,
          })),
        }),
      });

      const result = await response.json() as any;

      if (!result.success) {
        setError(result.message || 'Gagal membuat pesanan');
        setLoading(false);
        return;
      }

      const { orderNumber, snapToken } = result.data;

      // Ambil detail order lengkap untuk post-purchase
      const orderDetailRes = await fetch(`/api/orders/${orderNumber}`);
      const orderDetailData = await orderDetailRes.json() as any;
      const createdOrder: Order = orderDetailData.data;

      onClearCart();
      onClose();
      onOrderCreated(createdOrder);

      // Trigger Midtrans Snap jika script terload
      if (window.snap && snapToken && !snapToken.startsWith('SANDBOX-SNAP')) {
        window.snap.pay(snapToken, {
          onSuccess: (res: any) => {
            console.log('Snap Success:', res);
            fetch(`/api/webhooks/simulate-pay/${orderNumber}`, { method: 'POST' });
          },
          onPending: (res: any) => {
            console.log('Snap Pending:', res);
          },
          onError: (err: any) => {
            console.error('Snap Error:', err);
          },
          onClose: () => {
            console.log('Customer closed popup Snap window');
          },
        });
      }
    } catch (err) {
      console.error(err);
      setError('Terjadi kesalahan jaringan saat memproses checkout.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2 text-campus-700">
          <CreditCard className="w-6 h-6" />
          <h2 className="text-xl font-black text-slate-900">Checkout & Pembayaran</h2>
        </div>
        <p className="text-xs text-slate-500 mb-6">
          Transaksi aman terenkripsi dengan payment gateway resmi <span className="font-bold text-campus-800">Midtrans Sandbox</span>.
        </p>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handlePay} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nama Mahasiswa / Pemesan</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-campus-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">No. WhatsApp / HP</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-campus-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Konfirmasi</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-campus-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {selectedShipping.id === 'PICKUP' ? 'Lokasi Pengambilan' : 'Alamat Pengiriman (Kos/Asrama/Fakultas)'}
            </label>
            <textarea
              required
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-campus-500 focus:outline-none"
            ></textarea>
          </div>

          {/* Shipping Summary */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex justify-between items-center">
            <div>
              <p className="font-bold text-slate-800">{selectedShipping.name}</p>
              <p className="text-[11px] text-slate-500">{selectedShipping.estimatedTime}</p>
            </div>
            <span className="font-extrabold text-slate-900">
              {shippingCost === 0 ? 'GRATIS' : `Rp ${shippingCost.toLocaleString('id-ID')}`}
            </span>
          </div>

          {/* Pricing Breakdown */}
          <div className="p-4 rounded-2xl bg-campus-50/60 border border-campus-100 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal ({items.length} item)</span>
              <span>Rp {subtotal.toLocaleString('id-ID')}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Diskon Kupon ({promo?.code})</span>
                <span>-Rp {discountAmount.toLocaleString('id-ID')}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>Ongkos Kirim</span>
              <span>{shippingCost === 0 ? 'Rp 0' : `Rp ${shippingCost.toLocaleString('id-ID')}`}</span>
            </div>
            <div className="pt-2 border-t border-campus-200/80 flex justify-between text-sm sm:text-base font-black text-slate-900">
              <span>Total Tagihan</span>
              <span className="text-campus-600">Rp {totalAmount.toLocaleString('id-ID')}</span>
            </div>
          </div>

          {/* Payment Gateway Selection Card */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border-2 border-campus-500/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-campus-900 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-campus-700" />
                Payment Gateway: Midtrans Sandbox
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-900 uppercase tracking-wide">
                Simulator Ready
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Mendukung pengujian simulasi lengkap: <strong>BCA VA</strong>, <strong>Mandiri Bill</strong>, <strong>BNI VA</strong>, <strong>BRI VA</strong>, <strong>QRIS</strong>, dan <strong>Kartu Kredit Test</strong> via Midtrans Payment Simulator resmi.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-campus-700 via-campus-600 to-campus-500 hover:from-campus-800 hover:to-campus-600 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-campus-600/30 flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>{loading ? 'Menghubungkan ke Midtrans...' : `Lanjut Bayar Rp ${totalAmount.toLocaleString('id-ID')} (Midtrans Sandbox)`}</span>
            </button>
            <p className="text-[10px] text-center text-slate-400 mt-2 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Tersambung langsung ke Midtrans Simulator & Endpoint POST /api/payment/simulate
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
