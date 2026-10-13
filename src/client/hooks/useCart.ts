import { useState, useEffect } from 'react';
import { CartItem, ShippingOption } from '../../shared/types';

export const SHIPPING_OPTIONS: ShippingOption[] = [
  {
    id: 'PICKUP',
    name: 'Ambil di Kampus (Koperasi / SC)',
    description: 'Bebas ongkir, siap diambil hari ini di Gedung Student Center Lt. 1',
    cost: 0,
    estimatedTime: 'Hari ini',
  },
  {
    id: 'SAMEDAY_CAMPUS',
    name: 'Kurir Kilat Kampus (Sameday)',
    description: 'Diantar langsung oleh kurir mahasiswa ke Asrama / Kost / Fakultas',
    cost: 10000,
    estimatedTime: '2 - 4 jam',
  },
  {
    id: 'REGULAR_COURIER',
    name: 'Ekspedisi Reguler (JNE / SiCepat)',
    description: 'Pengiriman ke seluruh Indonesia dengan nomor resi resmi',
    cost: 20000,
    estimatedTime: '1 - 2 hari',
  },
];

export interface PromoState {
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  calculatedDiscount: number;
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('univ_merch_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [promo, setPromo] = useState<PromoState | null>(() => {
    try {
      const saved = localStorage.getItem('univ_merch_promo');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [shippingMethod, setShippingMethod] = useState<'PICKUP' | 'SAMEDAY_CAMPUS' | 'REGULAR_COURIER'>('PICKUP');

  useEffect(() => {
    localStorage.setItem('univ_merch_cart', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (promo) {
      localStorage.setItem('univ_merch_promo', JSON.stringify(promo));
    } else {
      localStorage.removeItem('univ_merch_promo');
    }
  }, [promo]);

  const addToCart = (newItem: Omit<CartItem, 'quantity'>, qty: number = 1) => {
    setItems((prev) => {
      const index = prev.findIndex((i) => i.variantId === newItem.variantId);
      if (index > -1) {
        const updated = [...prev];
        const newQty = Math.min(updated[index].quantity + qty, updated[index].maxStock);
        updated[index] = { ...updated[index], quantity: newQty };
        return updated;
      }
      return [...prev, { ...newItem, quantity: Math.min(qty, newItem.maxStock) }];
    });
  };

  const updateQuantity = (variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(variantId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.variantId === variantId
          ? { ...item, quantity: Math.min(quantity, item.maxStock) }
          : item
      )
    );
  };

  const removeFromCart = (variantId: string) => {
    setItems((prev) => prev.filter((i) => i.variantId !== variantId));
  };

  const clearCart = () => {
    setItems([]);
    setPromo(null);
  };

  const selectedShipping = SHIPPING_OPTIONS.find((s) => s.id === shippingMethod) || SHIPPING_OPTIONS[0];

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  // Recalculate discount
  let discountAmount = 0;
  if (promo) {
    if (promo.discountType === 'PERCENTAGE') {
      discountAmount = Math.round((subtotal * promo.discountValue) / 100);
    } else {
      discountAmount = promo.discountValue;
    }
    discountAmount = Math.min(discountAmount, subtotal);
  }

  const shippingCost = selectedShipping.cost;
  const totalAmount = Math.max(0, subtotal - discountAmount + shippingCost);
  const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    items,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    promo,
    setPromo,
    shippingMethod,
    setShippingMethod,
    selectedShipping,
    subtotal,
    discountAmount,
    shippingCost,
    totalAmount,
    totalItemCount,
  };
}
