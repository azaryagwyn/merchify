export type Role = 'CUSTOMER' | 'ADMIN';
export type LoyaltyTier = 'BRONZE' | 'SILVER' | 'GOLD';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  studentId?: string;
  loyaltyPoints: number;
  loyaltyTier: LoyaltyTier;
  notes?: string;
  createdAt: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  size: string | null;
  color: string | null;
  sku: string;
  stock: number;
  priceAdjustment: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  basePrice: number;
  discountPercentage: number;
  discountPrice: number | null;
  images: string[];
  isFeatured: boolean;
  variants: ProductVariant[];
  averageRating?: number;
  totalReviews?: number;
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userId?: string;
  reviewerName: string;
  rating: number;
  comment: string;
  isVerifiedBuyer: boolean;
  createdAt: string;
}

export interface Promotion {
  id: string;
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minPurchase: number;
  isActive: boolean;
  expiresAt?: string;
}

export type OrderStatus = 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED';

export interface OrderItem {
  id: string;
  orderId: string;
  productVariantId: string;
  productName: string;
  variantInfo: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  shippingMethod: 'PICKUP' | 'SAMEDAY_CAMPUS' | 'REGULAR_COURIER';
  shippingCost: number;
  estimatedDelivery: string;
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  status: OrderStatus;
  snapToken?: string;
  paymentType?: string;
  trackingNumber?: string;
  items?: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  variantId: string;
  productId: string;
  productName: string;
  productSlug: string;
  image: string;
  size: string | null;
  color: string | null;
  unitPrice: number;
  quantity: number;
  maxStock: number;
}

export interface ShippingOption {
  id: 'PICKUP' | 'SAMEDAY_CAMPUS' | 'REGULAR_COURIER';
  name: string;
  description: string;
  cost: number;
  estimatedTime: string;
}
