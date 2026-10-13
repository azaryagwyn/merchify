import React, { useState } from 'react';
import { X, Trash2, ArrowRight, Tag, ShoppingBag, Check, AlertCircle } from 'lucide-react';
import { CartItem, ShippingOption } from '../../shared/types';
import { PromoState } from '../hooks/useCart';
import { ShippingEstimator } from './ShippingEstimator';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (variantId: string, quantity: number) => void;
  onRemoveItem: (variantId: string) => void;
  promo: PromoState | null;
  onSetPromo: (promo: PromoState | null) => void;
  shippingMethod: 'PICKUP' | 'SAMEDAY_CAMPUS' | 'REGULAR_COURIER';
  onSetShippingMethod: (method: 'PICKUP' | 'SAMEDAY_CAMPUS' | 'REGULAR_COURIER') => void;
  subtotal: number;
  discountAmount: number;
  shippingCost: number;
  totalAmount: number;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  promo,
  onSetPromo,
  shippingMethod,
  onSetShippingMethod,
  subtotal,
  discountAmount,
  shippingCost,
  totalAmount,
  onProceedToCheckout,
}) => {
  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  if (!isOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setCouponLoading(true);
    setCouponError('');
    setCouponSuccess('');

    try {
      const res = await fetch('/api/promotions/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponInput, subtotal }),
      });

      const data = await res.json() as any;
      if (data.success) {
        onSetPromo(data.data);
        setCouponSuccess(`Kupon ${data.data.code} berhasil diterapkan!`);
        setCouponInput('');
      } else {
        setCouponError(data.message || 'Kupon tidak valid');
      }
    } catch {
      setCouponError('Gagal memvalidasi kupon');
    } finally {
      setCouponLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-campus-600" />
            <h3 className="font-extrabold text-base sm:text-lg text-slate-900">Keranjang Belanja</h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {items.length} item
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Item List */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-12">
              <ShoppingBag className="w-16 h-16 stroke-1 text-slate-300 mb-3" />
              <p className="font-bold text-slate-700 text-sm">Keranjang masih kosong</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Pilih hoodie, jaket almamater, atau merchandise favorit Anda untuk mulai berbelanja!
              </p>
            </div>
          ) : (
            <>
              {items.map((item) => (
                <div
                  key={item.variantId}
                  className="flex gap-3 p-3 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white transition-colors"
                >
                  <img
                    src={item.image}
                    alt={item.productName}
                    className="w-16 h-16 rounded-xl object-cover bg-slate-100 flex-shrink-0 border border-slate-200"
                  />
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 truncate">{item.productName}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {[item.size, item.color].filter(Boolean).join(' • ') || 'Standard'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="font-extrabold text-xs text-slate-900">
                        Rp {(item.unitPrice * item.quantity).toLocaleString('id-ID')}
                      </span>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1">
                        <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden text-xs">
                          <button
                            onClick={() => onUpdateQuantity(item.variantId, item.quantity - 1)}
                            className="px-2 py-0.5 text-slate-600 hover:bg-slate-100 font-bold"
                          >
                            -
                          </button>
                          <span className="px-2 font-bold min-w-5 text-center">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity(item.variantId, item.quantity + 1)}
                            disabled={item.quantity >= item.maxStock}
                            className="px-2 py-0.5 text-slate-600 hover:bg-slate-100 disabled:opacity-30 font-bold"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => onRemoveItem(item.variantId)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors ml-1"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Coupon Form */}
              <div className="pt-3 border-t border-slate-200">
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Masukkan kode kupon (MABA2026)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl uppercase font-mono focus:ring-2 focus:ring-campus-500 focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={couponLoading}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition-colors disabled:opacity-50"
                  >
                    {couponLoading ? 'Cek...' : 'Terapkan'}
                  </button>
                </form>

                {couponSuccess && (
                  <p className="text-[11px] text-emerald-600 font-semibold mt-1.5 flex items-center gap-1">
                    <Check className="w-3 h-3" /> {couponSuccess}
                  </p>
                )}
                {couponError && (
                  <p className="text-[11px] text-rose-600 font-semibold mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {couponError}
                  </p>
                )}

                {promo && (
                  <div className="mt-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs flex items-center justify-between text-emerald-800">
                    <div>
                      <span className="font-bold font-mono">{promo.code}</span>
                      <p className="text-[10px] text-emerald-600">{promo.description}</p>
                    </div>
                    <button
                      onClick={() => onSetPromo(null)}
                      className="text-xs text-rose-600 hover:underline font-semibold"
                    >
                      Batal
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile Shipping Selection */}
              <div className="pt-3 border-t border-slate-200">
                <ShippingEstimator
                  selectedMethod={shippingMethod}
                  onSelectMethod={onSetShippingMethod}
                />
              </div>
            </>
          )}
        </div>

        {/* Footer Summary & Checkout CTA */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 space-y-2.5">
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal Produk</span>
                <span className="font-bold text-slate-800">Rp {subtotal.toLocaleString('id-ID')}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Diskon Kupon</span>
                  <span>-Rp {discountAmount.toLocaleString('id-ID')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Ongkos Kirim</span>
                <span className="font-bold text-slate-800">
                  {shippingCost === 0 ? 'GRATIS' : `Rp ${shippingCost.toLocaleString('id-ID')}`}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between text-sm sm:text-base font-black text-slate-900">
                <span>Total Pembayaran</span>
                <span className="text-campus-600">Rp {totalAmount.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <button
              onClick={onProceedToCheckout}
              className="w-full py-3.5 px-4 bg-campus-600 hover:bg-campus-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-campus-600/25 flex items-center justify-center gap-2 active:scale-98 transition-all"
            >
              <span>Lanjut ke Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
