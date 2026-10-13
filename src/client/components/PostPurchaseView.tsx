import React, { useState, useEffect } from 'react';
import { CheckCircle2, Clock, PackageCheck, Printer, ArrowLeft, Zap, CreditCard, ChevronRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Order } from '../../shared/types';

interface PostPurchaseViewProps {
  order: Order;
  onBackToStore: () => void;
  onOpenProductReview?: (productId: string) => void;
  onOpenMidtransSimulator?: () => void;
}

export const PostPurchaseView: React.FC<PostPurchaseViewProps> = ({
  order: initialOrder,
  onBackToStore,
  onOpenMidtransSimulator,
}) => {
  const [order, setOrder] = useState<Order>(initialOrder);
  const [simulating, setSimulating] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Sinkronisasi jika initialOrder diperbarui dari App.tsx (misal status berubah jadi PAID)
  useEffect(() => {
    setOrder(initialOrder);
  }, [initialOrder]);

  // HANYA nyalakan konfeti jika pembayaran SUDAH LUNAS (PAID)
  useEffect(() => {
    if (order.status === 'PAID') {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
    }
  }, [order.status]);

  const handleSimulatePayment = async () => {
    setSimulating(true);
    setStatusMessage('');

    try {
      const res = await fetch('/api/payment/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderData: order, orderNumber: order.orderNumber }),
      });
      const data = await res.json() as any;

      if (data.success) {
        setStatusMessage('Pembayaran berhasil diverifikasi! Stok produk telah dipotong.');
        // Refresh status order terbaru
        const orderRes = await fetch(`/api/orders/${order.orderNumber}`);
        const orderData = await orderRes.json() as any;
        if (orderData.success) {
          setOrder(orderData.data);
          confetti({ particleCount: 100, spread: 90, origin: { y: 0.5 } });
        }
      }
    } catch {
      setStatusMessage('Gagal memproses simulasi pembayaran');
    } finally {
      setSimulating(false);
    }
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  const getStatusBadge = () => {
    switch (order.status) {
      case 'PAID':
        return (
          <span className="px-3.5 py-1 text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full flex items-center gap-1.5 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Pembayaran Lunas
          </span>
        );
      case 'SHIPPED':
        return (
          <span className="px-3.5 py-1 text-xs font-bold bg-campus-100 text-campus-900 border border-campus-300 rounded-full flex items-center gap-1.5 shadow-2xs">
            <PackageCheck className="w-3.5 h-3.5 text-campus-600" />
            Dalam Pengiriman (Resi: {order.trackingNumber || 'UNIV-EXP-01'})
          </span>
        );
      default:
        return (
          <span className="px-3.5 py-1 text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 rounded-full flex items-center gap-1.5 shadow-2xs animate-pulse">
            <Clock className="w-3.5 h-3.5 text-amber-700" />
            Menunggu Pembayaran (Sandbox)
          </span>
        );
    }
  };

  const isPaid = order.status === 'PAID' || order.status === 'SHIPPED';

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 animate-in fade-in duration-300">
      
      {/* Top Back Action */}
      <button
        onClick={onBackToStore}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-campus-600 mb-6 transition-colors print:hidden cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali Belanja Merchandise</span>
      </button>

      {/* Main Order Card / Printable Invoice */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden print:border-none print:shadow-none">
        
        {/* Header Banner: Berbeda Tampilan Jika LUNAS vs PENDING */}
        {isPaid ? (
          <div className="bg-gradient-to-r from-emerald-950 via-emerald-800 to-campus-950 text-white p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-extrabold text-emerald-300 uppercase tracking-widest block mb-1">
                  ✓ PEMBAYARAN BERHASIL • STATUS LUNAS
                </span>
                <h1 className="text-2xl sm:text-3xl font-black">Pembayaran Berhasil!</h1>
                <p className="text-xs text-slate-200 mt-1">
                  Terima kasih! Pembayaran Anda telah kami terima dan pesanan almamater Awrora University sedang diproses.
                </p>
              </div>

              <div className="sm:text-right">
                <p className="text-xs text-slate-300">Nomor Pesanan:</p>
                <p className="text-base sm:text-lg font-mono font-black text-amber-300">{order.orderNumber}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-slate-900 text-white p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-extrabold text-amber-300 uppercase tracking-widest block mb-1">
                  STATUS: MENUNGGU PEMBAYARAN
                </span>
                <h1 className="text-2xl sm:text-3xl font-black">Pesanan Berhasil Dibuat</h1>
                <p className="text-xs text-slate-300 mt-1">
                  Silakan selesaikan pembayaran via <strong>Midtrans Payment Gateway</strong> menggunakan simulator agar pesanan ditandai lunas.
                </p>
              </div>

              <div className="sm:text-right">
                <p className="text-xs text-slate-300">Nomor Pesanan:</p>
                <p className="text-base sm:text-lg font-mono font-black text-amber-300">{order.orderNumber}</p>
              </div>
            </div>
          </div>
        )}

        {/* Status Bar */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500">Status Transaksi:</span>
            {getStatusBadge()}
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={handlePrintInvoice}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors shadow-2xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Invoice</span>
            </button>
          </div>
        </div>

        {/* Sandbox Payment Action Box (Khusus Jika Belum Lunas) */}
        {!isPaid && (
          <div className="m-6 p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 text-xs text-amber-950 print:hidden shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="font-black flex items-center gap-1.5 text-amber-950 text-sm">
                  <CreditCard className="w-4 h-4 text-amber-700" />
                  Selesaikan Pembayaran (Midtrans Payment Gateway)
                </p>
                <p className="text-[11px] text-amber-900 leading-relaxed max-w-lg">
                  Total tagihan: <strong className="text-slate-900 font-black">Rp {order.totalAmount.toLocaleString('id-ID')}</strong>. Pilih metode pembayaran di simulator (BCA VA, Mandiri Bill, BNI, BRI, Permata, QRIS, atau Kartu Kredit) lalu tekan bayar.
                </p>
                {statusMessage && (
                  <p className="mt-2 text-xs font-bold text-emerald-700">✓ {statusMessage}</p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                {onOpenMidtransSimulator && (
                  <button
                    onClick={onOpenMidtransSimulator}
                    className="px-4 py-2.5 bg-gradient-to-r from-blue-900 to-indigo-950 hover:from-blue-950 hover:to-black text-white font-black text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Buka Midtrans & Bayar</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={handleSimulatePayment}
                  disabled={simulating}
                  className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-xs rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 fill-white" />
                  <span>{simulating ? 'Memverifikasi...' : 'Simulasi Bayar Lunas'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Customer & Shipping Information */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs pb-6 border-b border-slate-200">
            <div>
              <p className="font-bold text-slate-400 uppercase tracking-wider mb-2">Informasi Pemesan</p>
              <p className="font-bold text-sm text-slate-900">{order.customerName}</p>
              <p className="text-slate-600 mt-0.5">{order.customerEmail}</p>
              <p className="text-slate-600">{order.customerPhone}</p>
            </div>

            <div>
              <p className="font-bold text-slate-400 uppercase tracking-wider mb-2">Metode & Alamat Pengiriman</p>
              <p className="font-bold text-sm text-campus-700">{order.shippingMethod}</p>
              <p className="text-slate-600 mt-0.5 leading-relaxed">{order.shippingAddress}</p>
              <p className="text-emerald-700 font-semibold mt-1">Estimasi: {order.estimatedDelivery}</p>
            </div>
          </div>

          {/* Purchased Items Table */}
          <div>
            <h3 className="font-bold text-sm text-slate-900 mb-3">Rincian Barang yang Dipesan</h3>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
              {order.items?.map((item) => (
                <div key={item.id} className="p-4 flex items-center justify-between gap-4 bg-white">
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">{item.productName}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Varian: {item.variantInfo}</p>
                    <p className="text-[11px] text-slate-400">{item.quantity} x Rp {item.unitPrice.toLocaleString('id-ID')}</p>
                  </div>
                  <span className="font-bold text-xs text-slate-900">
                    Rp {item.totalPrice.toLocaleString('id-ID')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Totals */}
          <div className="pt-4 border-t border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal Produk</span>
              <span>Rp {order.subtotal.toLocaleString('id-ID')}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Diskon Kupon Promo</span>
                <span>-Rp {order.discountAmount.toLocaleString('id-ID')}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>Ongkos Kirim</span>
              <span>{order.shippingCost === 0 ? 'GRATIS' : `Rp ${order.shippingCost.toLocaleString('id-ID')}`}</span>
            </div>
            <div className="pt-3 border-t border-slate-200 flex justify-between text-base font-black text-slate-900">
              <span>Total Tagihan</span>
              <span className="text-campus-600">Rp {order.totalAmount.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-500">
          <p>Jika ada pertanyaan terkait pesanan ini, hubungi WhatsApp Helpdesk Merchify Awrora University: <span className="font-bold text-slate-800">0812-3456-7890</span></p>
        </div>
      </div>
    </div>
  );
};
