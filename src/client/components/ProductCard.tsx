import React from 'react';
import { Star, Eye, ShoppingCart } from 'lucide-react';
import { Product } from '../../shared/types';

interface ProductCardProps {
  product: Product;
  onSelectProduct: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelectProduct }) => {
  const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);

  const getStockBadge = () => {
    if (totalStock === 0) {
      return (
        <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200 rounded-full">
          Stok Habis
        </span>
      );
    }
    if (totalStock <= 5) {
      return (
        <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 rounded-full animate-pulse-subtle">
          Sisa {totalStock} pcs!
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full">
        Tersedia ({totalStock})
      </span>
    );
  };

  const hasDiscount = product.discountPercentage > 0 && product.discountPrice;

  return (
    <div 
      onClick={() => onSelectProduct(product)}
      className="group relative bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-campus-300 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer"
    >
      {/* Thumbnail & Badges */}
      <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80'}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Item-Specific Discount Tag */}
        {hasDiscount && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-rose-600 to-rose-500 text-white font-extrabold text-[11px] px-2.5 py-1 rounded-lg shadow-md uppercase tracking-wider">
            HEMAT {product.discountPercentage}%
          </div>
        )}

        {/* Featured Tag */}
        {product.isFeatured && (
          <div className="absolute top-3 right-3 bg-amber-400 text-amber-950 font-bold text-[10px] px-2 py-0.5 rounded-md shadow-xs">
            ⭐ BEST SELLER
          </div>
        )}

        {/* Quick View Overlay on Hover */}
        <div className="absolute inset-0 bg-campus-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/95 text-campus-900 text-xs font-bold rounded-full shadow-lg backdrop-blur-xs transform translate-y-2 group-hover:translate-y-0 transition-all">
            <Eye className="w-3.5 h-3.5" />
            Pilih Varian & Cek Stok
          </span>
        </div>
      </div>

      {/* Product Information */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[11px] font-semibold text-campus-600 uppercase tracking-wider">
              {product.category}
            </span>
            {getStockBadge()}
          </div>

          <h3 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-campus-600 transition-colors line-clamp-2 leading-snug">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
            <div className="flex items-center text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            </div>
            <span className="font-bold text-slate-700">{product.averageRating || 5.0}</span>
            <span className="text-slate-400">({product.totalReviews || 0} ulasan)</span>
          </div>
        </div>

        {/* Pricing */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-end justify-between">
          <div>
            {hasDiscount && (
              <p className="text-[11px] text-slate-400 line-through">
                Rp {product.basePrice.toLocaleString('id-ID')}
              </p>
            )}
            <p className="text-base sm:text-lg font-extrabold text-slate-900">
              Rp {(product.discountPrice || product.basePrice).toLocaleString('id-ID')}
            </p>
          </div>

          <button
            type="button"
            className="w-8 h-8 rounded-full bg-campus-50 text-campus-700 group-hover:bg-campus-600 group-hover:text-white flex items-center justify-center transition-colors shadow-xs"
            title="Lihat detail produk"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
