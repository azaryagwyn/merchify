import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { PromoBanner } from './components/PromoBanner';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { PostPurchaseView } from './components/PostPurchaseView';
import { AdminDashboard } from './components/AdminDashboard';
import { CustomerAuthModal } from './components/CustomerAuthModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { CustomerProfileDrawer } from './components/CustomerProfileDrawer';
import { MidtransSimulatorModal } from './components/MidtransSimulatorModal';
import { useCart } from './hooks/useCart';
import { useAuth } from './hooks/useAuth';
import { Product, ProductVariant, Order } from '../shared/types';
import { Sparkles, Shield, Truck, Award, ShoppingBag } from 'lucide-react';

export const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Modals & Views
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [isAdminView, setIsAdminView] = useState(false);
  const [isMidtransModalOpen, setIsMidtransModalOpen] = useState(false);

  // Authentication Modals & Drawers
  const [isCustomerAuthOpen, setIsCustomerAuthOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isCustomerProfileOpen, setIsCustomerProfileOpen] = useState(false);

  // PWA Prompt
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Hooks
  const {
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
  } = useCart();

  const {
    customerUser,
    adminUser,
    isAdminLoggedIn,
    loginCustomer,
    registerCustomer,
    logoutCustomer,
    loginAdmin,
    logoutAdmin,
  } = useAuth();

  // Listen for PWA beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallPwa = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  // Fetch products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = '/api/products';
      const params = new URLSearchParams();
      if (selectedCategory !== 'All') params.append('category', selectedCategory);
      if (searchQuery.trim()) params.append('q', searchQuery.trim());

      const queryStr = params.toString();
      if (queryStr) url += `?${queryStr}`;

      const res = await fetch(url);
      const data = await res.json() as any;
      if (data.success) {
        setProducts(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchQuery]);

  const categories = ['All', 'Almamater', 'Apparel', 'Accessories', 'Drinkware'];

  const handleAddToCart = (variant: ProductVariant, product: Product, quantity: number) => {
    const effectivePrice = (product.discountPrice || product.basePrice) + (variant.priceAdjustment || 0);
    addToCart(
      {
        variantId: variant.id,
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        image: product.images[0],
        size: variant.size,
        color: variant.color,
        unitPrice: effectivePrice,
        maxStock: variant.stock,
      },
      quantity
    );
  };

  const handleToggleAdminView = () => {
    if (!isAdminLoggedIn) {
      setIsAdminLoginOpen(true);
      return;
    }
    setIsAdminView(!isAdminView);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      
      {/* 1. Header Promo Banner */}
      <PromoBanner />

      {/* 2. Main Navbar with Dedicated Customer & Admin Logins */}
      <Navbar
        customerUser={customerUser}
        adminUser={adminUser}
        isAdminLoggedIn={isAdminLoggedIn}
        onOpenCustomerAuth={() => setIsCustomerAuthOpen(true)}
        onOpenCustomerProfile={() => setIsCustomerProfileOpen(true)}
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
        onLogoutAdmin={() => {
          logoutAdmin();
          setIsAdminView(false);
        }}
        onOpenCart={() => setIsCartOpen(true)}
        cartCount={totalItemCount}
        isAdminView={isAdminView}
        onToggleAdminView={handleToggleAdminView}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        deferredPrompt={deferredPrompt}
        onInstallPwa={handleInstallPwa}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {isAdminView && isAdminLoggedIn ? (
          /* Admin Dashboard (Protected Gate) */
          <AdminDashboard />
        ) : currentOrder ? (
          /* Post Purchase / Order Status Tracking Screen */
          <PostPurchaseView
            order={currentOrder}
            onBackToStore={() => {
              setCurrentOrder(null);
              fetchProducts();
            }}
            onOpenMidtransSimulator={() => setIsMidtransModalOpen(true)}
          />
        ) : (
          /* Store Catalog View */
          <div>
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-b from-campus-950 via-campus-900 to-campus-800 text-white py-12 sm:py-20 px-4 sm:px-6 lg:px-8 shadow-inner">
              <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="max-w-2xl text-center md:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold mb-4">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Merchify • Official Store Awrora University 2026</span>
                  </div>
                  <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                    Merchify: Bangga Almamater Awrora University
                  </h1>
                  <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
                    Koleksi resmi jas almet kampus, almet tiap fakultas (FILKOM, FEB, FK), tumbler stainless, lanyard kampus & fakultas, kaos almamater, vintage varsity jacket, dan hoodie kebanggaan civitas akademika Awrora University!
                  </p>

                  <div className="mt-6 flex flex-wrap gap-4 justify-center md:justify-start text-xs font-semibold text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-emerald-400" />
                      <span>100% Produk Bergaransi</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-campus-400" />
                      <span>Pick-up Kampus Rp 0</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-amber-400" />
                      <span>Poin Reward Mahasiswa</span>
                    </div>
                  </div>
                </div>

                {/* Hero Showcase Image */}
                <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex-shrink-0">
                  <div className="absolute inset-0 bg-campus-500/30 rounded-3xl blur-2xl"></div>
                  <img
                    src="/images/products/vintage-varsity.jpg"
                    alt="Vintage Varsity Jacket Champions Awrora University"
                    className="relative w-full h-full object-cover rounded-3xl shadow-2xl border-2 border-white/20 transform hover:scale-102 transition-transform duration-500"
                  />
                  <div className="absolute -bottom-3 -left-3 bg-white text-slate-900 p-3 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-black text-xs">
                      %
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Flash Promo</p>
                      <p className="text-xs font-black text-slate-900">Diskon s/d 20%</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Catalog Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
              
              {/* Filter Tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                    Katalog Merchandise Resmi
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Pilih kategori dan temukan merchandise dengan pilihan warna dan ukuran lengkap.
                  </p>
                </div>

                {/* Category Pills */}
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        selectedCategory === cat
                          ? 'bg-campus-900 text-white shadow-md shadow-campus-900/20'
                          : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {cat === 'All' ? 'Semua Produk' : cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Grid */}
              {loading ? (
                <div className="py-20 text-center text-slate-400">
                  <p className="font-semibold text-sm">Memuat merchandise kampus...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="py-16 text-center text-slate-400">
                  <p className="font-bold text-slate-700 text-sm">Tidak ada produk ditemukan</p>
                  <p className="text-xs text-slate-400 mt-1">Coba gunakan kata kunci lain atau pilih kategori Semua Produk.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      onSelectProduct={(prod) => setSelectedProduct(prod)}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      {/* Floating Cart Button for Mobile */}
      {!isAdminView && !currentOrder && totalItemCount > 0 && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-6 right-6 z-40 sm:hidden flex items-center gap-2 px-4 py-3 bg-campus-600 text-white font-bold text-xs rounded-full shadow-2xl shadow-campus-600/50 active:scale-95 transition-all"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>{totalItemCount} Item (Rp {totalAmount.toLocaleString('id-ID')})</span>
        </button>
      )}

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        currentUser={customerUser || undefined}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={items}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        promo={promo}
        onSetPromo={setPromo}
        shippingMethod={shippingMethod}
        onSetShippingMethod={setShippingMethod}
        subtotal={subtotal}
        discountAmount={discountAmount}
        shippingCost={shippingCost}
        totalAmount={totalAmount}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        currentUser={customerUser || undefined}
        items={items}
        promo={promo}
        selectedShipping={selectedShipping}
        subtotal={subtotal}
        discountAmount={discountAmount}
        shippingCost={shippingCost}
        totalAmount={totalAmount}
        onOrderCreated={(order) => {
          setCurrentOrder(order);
          setIsMidtransModalOpen(true);
        }}
        onClearCart={clearCart}
      />

      {/* Midtrans Sandbox Payment Simulator Modal */}
      <MidtransSimulatorModal
        isOpen={isMidtransModalOpen}
        order={currentOrder}
        onClose={() => setIsMidtransModalOpen(false)}
        onPaymentSuccess={(paidOrder) => {
          setCurrentOrder(paidOrder);
          setIsMidtransModalOpen(false);
          fetchProducts();
        }}
      />

      {/* Customer Authentication Modal (Login & Register Mahasiswa) */}
      <CustomerAuthModal
        isOpen={isCustomerAuthOpen}
        onClose={() => setIsCustomerAuthOpen(false)}
        onLogin={loginCustomer}
        onRegister={registerCustomer}
      />

      {/* Customer Profile & Order History Drawer */}
      <CustomerProfileDrawer
        isOpen={isCustomerProfileOpen}
        onClose={() => setIsCustomerProfileOpen(false)}
        user={customerUser}
        onLogout={logoutCustomer}
        onSelectOrder={(ord) => setCurrentOrder(ord)}
      />

      {/* Admin Login Modal (Dedicated Gatekeeper) */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLogin={loginAdmin}
        onSuccessRedirect={() => setIsAdminView(true)}
      />

      {/* Footer */}
      <footer className="bg-campus-950 text-slate-400 py-12 px-4 sm:px-6 lg:px-8 border-t border-campus-900 mt-16 print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-center md:text-left">
          <div className="flex items-center gap-3">
            <img 
              src="/images/awrora-logo.jpg" 
              alt="Awrora University Logo" 
              className="w-11 h-11 object-contain rounded-xl p-0.5 bg-white shadow-sm border border-white/20"
            />
            <div>
              <span className="font-black text-base text-white tracking-wider block">MERCHIFY • AWRORA UNIVERSITY</span>
              <p className="mt-0.5 text-slate-400">Official Campus Store • Koperasi Mahasiswa & BEM Awrora University</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-6 justify-center text-slate-400 font-medium">
            <span>Kebijakan Privasi</span>
            <span>Syarat & Ketentuan</span>
            <span>Panduan Ukuran Almet</span>
            <span>Bantuan Pelanggan</span>
          </div>
          <p className="text-slate-500">
            &copy; 2026 Merchify by Awrora University. All rights reserved. Powered by Cloudflare D1 & Midtrans.
          </p>
        </div>
      </footer>

    </div>
  );
};
