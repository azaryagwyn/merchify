import React, { useState, useEffect } from 'react';
import { X, Check, ShoppingBag, ShieldCheck, Truck, RefreshCw, Star } from 'lucide-react';
import { Product, ProductVariant, User } from '../../shared/types';
import { CustomerReviews } from './CustomerReviews';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (variant: ProductVariant, product: Product, quantity: number) => void;
  currentUser?: User;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  currentUser,
}) => {
  if (!product) return null;

  // Cek apakah produk merupakan pakaian atau lanyard (tidak ada pilihan warna)
  const isClothingOrLanyard = 
    product.category === 'Almamater' || 
    product.category === 'Apparel' || 
    product.category === 'Accessories' ||
    product.slug.includes('almet') ||
    product.slug.includes('lanyard') ||
    product.slug.includes('kaos') ||
    product.slug.includes('hoodie') ||
    product.slug.includes('varsity');

  // Untuk pakaian & lanyard hilangkan pilihan warna; tumbler tetap memiliki Matte Black & Matte Maroon
  const availableColors = isClothingOrLanyard 
    ? [] 
    : (Array.from(new Set(product.variants.map((v) => v.color).filter(Boolean))) as string[]);
  const sizes = Array.from(new Set(product.variants.map((v) => v.size).filter(Boolean))) as string[];

  const [selectedColor, setSelectedColor] = useState<string>(availableColors[0] || '');
  const [selectedSize, setSelectedSize] = useState<string>(sizes[0] || '');
  const [selectedImage, setSelectedImage] = useState<string>(product.images[0] || '');
  const [quantity, setQuantity] = useState<number>(1);
  const [addedToast, setAddedToast] = useState(false);

  // Cari varian yang cocok dengan kombinasi warna & ukuran yang dipilih
  const currentVariant = product.variants.find((v) => {
    const matchColor = availableColors.length === 0 || v.color === selectedColor;
    const matchSize = sizes.length === 0 || v.size === selectedSize;
    return matchColor && matchSize;
  }) || product.variants[0];

  const currentStock = currentVariant ? currentVariant.stock : 0;
  const isOutOfStock = currentStock === 0;

  // Hitung harga efektif
  const baseEffectivePrice = product.discountPrice || product.basePrice;
  const finalUnitPrice = baseEffectivePrice + (currentVariant?.priceAdjustment || 0);

  useEffect(() => {
    setQuantity(1);
  }, [currentVariant]);

  const handleAdd = () => {
    if (!currentVariant || isOutOfStock) return;
    onAddToCart(currentVariant, product, quantity);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Gallery Images */}
            <div>
              <div className="aspect-square rounded-2xl bg-slate-100 overflow-hidden mb-3 border border-slate-200">
                <img
                  src={selectedImage}
                  alt={product.name}
                  className="w-full h-full object-cover object-center"
                />
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                        selectedImage === img ? 'border-campus-600 scale-95 ring-2 ring-campus-400' : 'border-slate-200 opacity-70'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details & Variant Selectors */}
            <div className="flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-campus-100 text-campus-800 uppercase tracking-wider">
                    {product.category}
                  </span>
                  {product.discountPercentage > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-rose-500 text-white">
                      DISKON {product.discountPercentage}%
                    </span>
                  )}
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                  {product.name}
                </h2>

                {/* Rating */}
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center text-amber-400">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  </div>
                  <span className="text-sm font-bold text-slate-800">{product.averageRating || 5.0}</span>
                  <span className="text-xs text-slate-400">({product.totalReviews || 0} ulasan verified)</span>
                </div>

                {/* Pricing */}
                <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900">
                      Rp {finalUnitPrice.toLocaleString('id-ID')}
                    </span>
                    {product.discountPrice && (
                      <span className="text-sm text-slate-400 line-through">
                        Rp {(product.basePrice + (currentVariant?.priceAdjustment || 0)).toLocaleString('id-ID')}
                      </span>
                    )}
                  </div>
                  {currentVariant?.priceAdjustment ? (
                    <p className="text-[11px] text-slate-500 mt-1">
                      * Termasuk penyesuaian varian (+Rp {currentVariant.priceAdjustment.toLocaleString('id-ID')})
                    </p>
                  ) : null}
                </div>

                {/* Description */}
                <p className="mt-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {product.description}
                </p>

                {/* Color Selector */}
                {availableColors.length > 0 && (
                  <div className="mt-5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      Pilih Warna: <span className="text-campus-600">{selectedColor}</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {availableColors.map((c) => {
                        const isSelected = selectedColor === c;
                        return (
                          <button
                            key={c}
                            onClick={() => setSelectedColor(c)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                              isSelected
                                ? 'bg-campus-800 text-white border-campus-900 shadow-sm'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            {c}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Size Selector */}
                {sizes.length > 0 && (
                  <div className="mt-4">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      Pilih Ukuran: <span className="text-campus-600">{selectedSize}</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {sizes.map((s) => {
                        const isSelected = selectedSize === s;
                        return (
                          <button
                            key={s}
                            onClick={() => setSelectedSize(s)}
                            className={`min-w-10 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                              isSelected
                                ? 'bg-campus-600 text-white border-campus-700 shadow-sm'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            {s}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Stock Indicator */}
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500">Status Stok:</span>
                  {isOutOfStock ? (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200">
                      Stok Habis untuk varian ini
                    </span>
                  ) : currentStock <= 5 ? (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse-subtle">
                      Stok Terbatas (Hanya sisa {currentStock} pcs!)
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Tersedia ({currentStock} pcs)
                    </span>
                  )}
                </div>
              </div>

              {/* Quantity and Add to Cart Button */}
              <div className="mt-6 pt-5 border-t border-slate-200">
                <div className="flex items-center gap-4">
                  
                  {/* Quantity Counter */}
                  {!isOutOfStock && (
                    <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 overflow-hidden">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        disabled={quantity <= 1}
                        className="px-3 py-2 text-slate-600 hover:bg-slate-200 disabled:opacity-30 text-sm font-bold"
                      >
                        -
                      </button>
                      <span className="px-3 py-2 text-xs font-bold text-slate-800 min-w-8 text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))}
                        disabled={quantity >= currentStock}
                        className="px-3 py-2 text-slate-600 hover:bg-slate-200 disabled:opacity-30 text-sm font-bold"
                      >
                        +
                      </button>
                    </div>
                  )}

                  {/* Add to Cart CTA */}
                  <button
                    onClick={handleAdd}
                    disabled={isOutOfStock}
                    className={`flex-1 py-3 px-6 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
                      isOutOfStock
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-campus-600 hover:bg-campus-700 text-white shadow-campus-600/25 active:scale-98'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>{isOutOfStock ? 'Stok Habis' : 'Tambah ke Keranjang'}</span>
                  </button>
                </div>

                {/* Added Toast */}
                {addedToast && (
                  <div className="mt-2.5 p-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center justify-center gap-1.5 animate-in fade-in">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Berhasil ditambahkan ke keranjang belanja!</span>
                  </div>
                )}

                {/* Guarantee Badges */}
                <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-campus-600" />
                    <span>100% Merchandise Resmi</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-campus-600" />
                    <span>Bisa Pick-up di Kampus (Rp 0)</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Customer Reviews Section */}
          <CustomerReviews productId={product.id} currentUser={currentUser} />
        </div>
      </div>
    </div>
  );
};
