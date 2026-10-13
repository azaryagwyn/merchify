import React, { useState } from 'react';
import { X, ExternalLink, Copy, Check, ShieldAlert, CreditCard, QrCode, Building2, Zap, RefreshCw, CheckCircle2, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Order } from '../../shared/types';

interface MidtransSimulatorModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (updatedOrder: Order) => void;
}

export const MidtransSimulatorModal: React.FC<MidtransSimulatorModalProps> = ({
  order: propOrder,
  isOpen,
  onClose,
  onPaymentSuccess,
}) => {
  if (!isOpen) return null;

  // Fallback jika dibuka tanpa order aktif
  const order: Order = propOrder || {
    id: 'ord_demo_sandbox',
    orderNumber: 'UNIV-20261008-8888',
    customerName: 'Mahasiswa Tester',
    customerEmail: 'tester@awrora.ac.id',
    customerPhone: '081234567890',
    shippingAddress: 'Gedung Student Center Lt. 1, Kampus Pusat Awrora University',
    shippingMethod: 'PICKUP',
    shippingCost: 0,
    estimatedDelivery: 'Siap Ambil di Koperasi Mahasiswa',
    subtotal: 117000,
    discountAmount: 0,
    totalAmount: 117000,
    status: 'PENDING',
    paymentType: 'midtrans_sandbox',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    items: [],
  };

  const [activeTab, setActiveTab] = useState<'bca' | 'mandiri' | 'bni' | 'bri' | 'permata' | 'qris' | 'card'>('bca');
  const [copied, setCopied] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkLoading, setCheckLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [paymentDone, setPaymentDone] = useState(false);

  // Ekstrak angka unik dari nomor pesanan untuk nomor VA Sandbox (misal UNIV-20261008-8888 -> 202610088888)
  const numericCode = order.orderNumber.replace(/[^0-9]/g, '').slice(-12) || '202610088888';
  const bcaVa = `91012${numericCode}`;
  const bniVa = `98812${numericCode}`;
  const briVa = `02012${numericCode}`;
  const permataVa = `8528${numericCode.slice(-10)}`;
  const mandiriBillKey = numericCode;
  const mandiriBillerCode = '70012';

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSimulatePayment = async (channel: string = activeTab) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/payment/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderData: order,
          orderNumber: order.orderNumber,
          paymentType: `midtrans_sandbox_${channel}`,
        }),
      });
      const data = await res.json() as any;

      if (data.success) {
        setPaymentDone(true);
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.5 },
        });

        // Tampilkan layar sukses sebentar agar pengguna melihat status berhasil diverifikasi
        setTimeout(async () => {
          try {
            const orderRes = await fetch(`/api/orders/${order.orderNumber}`);
            const orderData = await orderRes.json() as any;
            if (orderData.success) {
              onPaymentSuccess(orderData.data);
              return;
            }
          } catch {}

          onPaymentSuccess({
            ...order,
            status: 'PAID',
            updatedAt: new Date().toISOString(),
          });
        }, 1200);
      } else {
        setErrorMsg(data.message || 'Gagal mensimulasikan pembayaran');
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Terjadi kesalahan jaringan saat memproses simulasi pembayaran.');
      setLoading(false);
    }
  };

  const handleCheckStatus = async () => {
    setCheckLoading(true);
    try {
      const orderRes = await fetch(`/api/payment/status/${order.orderNumber}`);
      const orderData = await orderRes.json() as any;
      if (orderData.success && (orderData.status === 'paid' || orderData.orderStatus === 'PAID')) {
        setPaymentDone(true);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.5 },
        });
        setTimeout(() => {
          onPaymentSuccess(orderData.data || { ...order, status: 'PAID' });
        }, 1000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCheckLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tampilan Khusus Saat Pembayaran Berhasil */}
        {paymentDone ? (
          <div className="p-8 sm:p-12 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-800 border border-emerald-300 uppercase tracking-widest">
              STATUS: LUNAS (PAID)
            </span>
            <h2 className="text-2xl font-black text-slate-900">Pembayaran Berhasil!</h2>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              Transaksi Midtrans Sandbox untuk pesanan <strong className="text-slate-900 font-mono">{order.orderNumber}</strong> sebesar <strong>Rp {order.totalAmount.toLocaleString('id-ID')}</strong> berhasil diverifikasi. Stok produk telah dipotong secara otomatis.
            </p>
            <div className="pt-2 text-xs font-semibold text-emerald-700 flex items-center justify-center gap-1.5 animate-pulse">
              <span>Membuka bukti pembayaran pesanan...</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        ) : (
          <>
            {/* Header Midtrans Sandbox Branding */}
            <div className="bg-gradient-to-r from-sky-900 via-blue-900 to-indigo-950 text-white p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="px-2.5 py-1 rounded-md bg-amber-400 text-slate-900 font-black text-xs uppercase tracking-wider">
                    MIDTRANS SANDBOX
                  </div>
                  <span className="font-extrabold text-sm sm:text-base tracking-wide text-white">
                    Payment Gateway Simulator
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="Tutup (Bayar Nanti)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 pt-3 border-t border-white/15 flex items-end justify-between">
                <div>
                  <p className="text-[11px] text-sky-200 uppercase font-semibold">Total Tagihan Pesanan</p>
                  <p className="text-xl sm:text-2xl font-black text-white">
                    Rp {order.totalAmount.toLocaleString('id-ID')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-sky-200 uppercase font-semibold">Order ID</p>
                  <p className="text-xs font-mono font-bold text-amber-300">{order.orderNumber}</p>
                </div>
              </div>
            </div>

            {/* Simulator Info Notice */}
            <div className="bg-amber-50 px-5 py-2.5 border-b border-amber-200 flex items-center justify-between text-xs text-amber-900">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>Tekan tombol <strong>Bayar di Simulator</strong> untuk menandai pesanan berhasil.</span>
              </div>
              <span className="text-[10px] font-black uppercase bg-amber-200 px-2 py-0.5 rounded text-amber-900">
                PENDING
              </span>
            </div>

            {/* Body & Payment Channels Tabs */}
            <div className="p-5 sm:p-6">
              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold">
                  {errorMsg}
                </div>
              )}

              {/* Payment Method Selector Grid */}
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-1 p-1 bg-slate-100 rounded-2xl mb-5 text-[11px] font-bold text-slate-600">
                <button
                  onClick={() => setActiveTab('bca')}
                  className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                    activeTab === 'bca' ? 'bg-white text-blue-900 shadow-xs' : 'hover:text-slate-900'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>BCA</span>
                </button>
                <button
                  onClick={() => setActiveTab('mandiri')}
                  className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                    activeTab === 'mandiri' ? 'bg-white text-blue-900 shadow-xs' : 'hover:text-slate-900'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Mandiri</span>
                </button>
                <button
                  onClick={() => setActiveTab('bni')}
                  className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                    activeTab === 'bni' ? 'bg-white text-blue-900 shadow-xs' : 'hover:text-slate-900'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>BNI</span>
                </button>
                <button
                  onClick={() => setActiveTab('bri')}
                  className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                    activeTab === 'bri' ? 'bg-white text-blue-900 shadow-xs' : 'hover:text-slate-900'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>BRI</span>
                </button>
                <button
                  onClick={() => setActiveTab('permata')}
                  className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                    activeTab === 'permata' ? 'bg-white text-blue-900 shadow-xs' : 'hover:text-slate-900'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Permata</span>
                </button>
                <button
                  onClick={() => setActiveTab('qris')}
                  className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                    activeTab === 'qris' ? 'bg-white text-blue-900 shadow-xs' : 'hover:text-slate-900'
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>QRIS</span>
                </button>
                <button
                  onClick={() => setActiveTab('card')}
                  className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                    activeTab === 'card' ? 'bg-white text-blue-900 shadow-xs' : 'hover:text-slate-900'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Kartu</span>
                </button>
              </div>

              {/* Tab Content: BCA VA */}
              {activeTab === 'bca' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Nomor Virtual Account (BCA Sandbox)
                    </span>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-lg sm:text-xl font-mono font-black text-slate-900 tracking-wider">
                        {bcaVa}
                      </span>
                      <button
                        onClick={() => handleCopy(bcaVa, 'bca')}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors shadow-2xs cursor-pointer"
                      >
                        {copied === 'bca' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied === 'bca' ? 'Tersalin' : 'Salin VA'}</span>
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSimulatePayment('bca_va')}
                    disabled={loading}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white font-black text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{loading ? 'Memverifikasi...' : `Bayar Rp ${order.totalAmount.toLocaleString('id-ID')} via Simulator BCA`}</span>
                  </button>

                  <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200 text-xs text-blue-900 space-y-1">
                    <p className="font-extrabold">Uji via Web Simulator Resmi:</p>
                    <a
                      href="https://simulator.sandbox.midtrans.com/bca/va/index"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 font-bold text-blue-700 hover:text-blue-900 underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Buka Midtrans BCA VA Simulator Resmi</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Tab Content: Mandiri Bill */}
              {activeTab === 'mandiri' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                        Kode Perusahaan / Biller Code
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="text-base font-mono font-black text-slate-900">{mandiriBillerCode}</span>
                        <button
                          onClick={() => handleCopy(mandiriBillerCode, 'biller')}
                          className="text-xs font-bold text-blue-700 hover:underline inline-flex items-center gap-1 cursor-pointer"
                        >
                          {copied === 'biller' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          Salin
                        </button>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                        Nomor Tagihan / Bill Key
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="text-base font-mono font-black text-slate-900">{mandiriBillKey}</span>
                        <button
                          onClick={() => handleCopy(mandiriBillKey, 'billkey')}
                          className="text-xs font-bold text-blue-700 hover:underline inline-flex items-center gap-1 cursor-pointer"
                        >
                          {copied === 'billkey' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          Salin
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSimulatePayment('mandiri_bill')}
                    disabled={loading}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-900 to-slate-900 hover:from-black hover:to-slate-900 text-white font-black text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{loading ? 'Memverifikasi...' : `Bayar Rp ${order.totalAmount.toLocaleString('id-ID')} via Simulator Mandiri`}</span>
                  </button>

                  <a
                    href="https://simulator.sandbox.midtrans.com/mandiri/bill/index"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 font-bold text-xs text-blue-700 hover:text-blue-900 underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Buka Midtrans Mandiri Bill Simulator Resmi</span>
                  </a>
                </div>
              )}

              {/* Tab Content: BNI VA */}
              {activeTab === 'bni' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Nomor Virtual Account (BNI Sandbox)
                    </span>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-lg sm:text-xl font-mono font-black text-slate-900 tracking-wider">
                        {bniVa}
                      </span>
                      <button
                        onClick={() => handleCopy(bniVa, 'bni')}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors shadow-2xs cursor-pointer"
                      >
                        {copied === 'bni' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied === 'bni' ? 'Tersalin' : 'Salin VA'}</span>
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSimulatePayment('bni_va')}
                    disabled={loading}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-teal-800 to-cyan-900 hover:from-teal-900 hover:to-cyan-950 text-white font-black text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{loading ? 'Memverifikasi...' : `Bayar Rp ${order.totalAmount.toLocaleString('id-ID')} via Simulator BNI`}</span>
                  </button>

                  <a
                    href="https://simulator.sandbox.midtrans.com/bni/va/index"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 font-bold text-xs text-blue-700 hover:text-blue-900 underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Buka Midtrans BNI VA Simulator Resmi</span>
                  </a>
                </div>
              )}

              {/* Tab Content: BRI VA */}
              {activeTab === 'bri' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Nomor Virtual Account (BRI Sandbox)
                    </span>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-lg sm:text-xl font-mono font-black text-slate-900 tracking-wider">
                        {briVa}
                      </span>
                      <button
                        onClick={() => handleCopy(briVa, 'bri')}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors shadow-2xs cursor-pointer"
                      >
                        {copied === 'bri' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied === 'bri' ? 'Tersalin' : 'Salin VA'}</span>
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSimulatePayment('bri_va')}
                    disabled={loading}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-800 to-sky-900 hover:from-blue-900 hover:to-sky-950 text-white font-black text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{loading ? 'Memverifikasi...' : `Bayar Rp ${order.totalAmount.toLocaleString('id-ID')} via Simulator BRI`}</span>
                  </button>

                  <a
                    href="https://simulator.sandbox.midtrans.com/bri/va/index"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 font-bold text-xs text-blue-700 hover:text-blue-900 underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Buka Midtrans BRI VA Simulator Resmi</span>
                  </a>
                </div>
              )}

              {/* Tab Content: Permata VA */}
              {activeTab === 'permata' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Nomor Virtual Account (Permata Sandbox)
                    </span>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-lg sm:text-xl font-mono font-black text-slate-900 tracking-wider">
                        {permataVa}
                      </span>
                      <button
                        onClick={() => handleCopy(permataVa, 'permata')}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors shadow-2xs cursor-pointer"
                      >
                        {copied === 'permata' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied === 'permata' ? 'Tersalin' : 'Salin VA'}</span>
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSimulatePayment('permata_va')}
                    disabled={loading}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-800 to-teal-900 hover:from-emerald-900 hover:to-teal-950 text-white font-black text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{loading ? 'Memverifikasi...' : `Bayar Rp ${order.totalAmount.toLocaleString('id-ID')} via Simulator Permata`}</span>
                  </button>

                  <a
                    href="https://simulator.sandbox.midtrans.com/permata/va/index"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 font-bold text-xs text-blue-700 hover:text-blue-900 underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Buka Midtrans Permata VA Simulator Resmi</span>
                  </a>
                </div>
              )}

              {/* Tab Content: QRIS */}
              {activeTab === 'qris' && (
                <div className="space-y-4 text-center">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center">
                    <div className="w-40 h-40 bg-white p-2 rounded-2xl border border-slate-300 shadow-sm flex items-center justify-center">
                      <img
                        src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https://simulator.sandbox.midtrans.com/qris/index"
                        alt="Midtrans QRIS Test"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className="text-xs font-extrabold text-slate-800 mt-2 block">
                      QRIS Sandbox Midtrans
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      NMID: ID1020023901923 • Merchify Awrora University
                    </p>
                  </div>

                  <button
                    onClick={() => handleSimulatePayment('qris')}
                    disabled={loading}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-rose-700 to-pink-800 hover:from-rose-800 hover:to-pink-900 text-white font-black text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 disabled:opacity-50"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>{loading ? 'Memverifikasi...' : `Simulasikan Scan & Bayar QRIS (Rp ${order.totalAmount.toLocaleString('id-ID')})`}</span>
                  </button>

                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <a
                      href="https://simulator.sandbox.midtrans.com/qris/index"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 font-bold text-xs text-blue-700 hover:text-blue-900 underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Simulator QRIS Resmi</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Tab Content: Credit Card */}
              {activeTab === 'card' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-900 text-white font-mono space-y-3 shadow-md">
                    <div className="flex justify-between items-center text-xs text-slate-400">
                      <span>MIDTRANS TEST CARD</span>
                      <span className="text-amber-400 font-bold">VISA 3DS</span>
                    </div>
                    <div className="text-base sm:text-lg tracking-widest font-black text-amber-200">
                      4811 1111 1111 1114
                    </div>
                    <div className="flex justify-between text-xs text-slate-300">
                      <span>EXP: 12/28</span>
                      <span>CVV: 123</span>
                      <span className="text-emerald-400 font-bold">OTP: 112233</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSimulatePayment('credit_card')}
                    disabled={loading}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-700 to-purple-800 hover:from-indigo-800 hover:to-purple-900 text-white font-black text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 disabled:opacity-50"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>{loading ? 'Memverifikasi...' : `Konfirmasi Bayar Kartu Kredit (OTP: 112233)`}</span>
                  </button>
                </div>
              )}

              {/* Bottom Actions: Check Status & Close */}
              <div className="mt-6 pt-5 border-t border-slate-200 flex items-center justify-between text-xs">
                <button
                  onClick={handleCheckStatus}
                  disabled={checkLoading}
                  className="text-slate-600 hover:text-slate-900 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${checkLoading ? 'animate-spin' : ''}`} />
                  <span>{checkLoading ? 'Mengecek...' : 'Cek Status Pembayaran'}</span>
                </button>

                <button
                  onClick={onClose}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer transition-colors"
                >
                  Bayar Nanti
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
