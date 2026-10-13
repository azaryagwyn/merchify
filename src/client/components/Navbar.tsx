import React from 'react';
import { ShoppingBag, GraduationCap, ShieldCheck, Sparkles, User as UserIcon, Download, Search, Lock, LogOut } from 'lucide-react';
import { User } from '../../shared/types';

interface NavbarProps {
  customerUser: User | null;
  adminUser: User | null;
  isAdminLoggedIn: boolean;
  onOpenCustomerAuth: () => void;
  onOpenCustomerProfile: () => void;
  onOpenAdminLogin: () => void;
  onLogoutAdmin: () => void;
  onOpenCart: () => void;
  cartCount: number;
  isAdminView: boolean;
  onToggleAdminView: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  deferredPrompt: any;
  onInstallPwa: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  customerUser,
  adminUser,
  isAdminLoggedIn,
  onOpenCustomerAuth,
  onOpenCustomerProfile,
  onOpenAdminLogin,
  onLogoutAdmin,
  onOpenCart,
  cartCount,
  isAdminView,
  onToggleAdminView,
  searchQuery,
  setSearchQuery,
  deferredPrompt,
  onInstallPwa,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Logo & Brand */}
          <div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => isAdminView && onToggleAdminView()}
          >
            <img 
              src="/images/awrora-logo.jpg" 
              alt="Awrora University Logo" 
              className="w-10 h-10 sm:w-12 sm:h-12 object-contain rounded-xl shadow-md border border-slate-200/80 bg-white p-0.5 group-hover:scale-105 transition-transform"
            />
            <div>
              <span className="text-lg sm:text-xl font-black tracking-tight text-campus-950 block leading-tight">
                MERCH<span className="text-campus-600">IFY</span>
              </span>
              <span className="text-[10px] sm:text-xs text-slate-500 font-bold tracking-wide uppercase">
                Awrora University Official
              </span>
            </div>
          </div>

          {/* Search Bar (Desktop & Tablet) */}
          {!isAdminView && (
            <div className="hidden md:flex flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari almet kampus, almet fakultas, tumbler, lanyard, hoodie..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100/80 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-campus-500 focus:bg-white transition-all"
                />
              </div>
            </div>
          )}

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* PWA Install Button */}
            {deferredPrompt && (
              <button
                onClick={onInstallPwa}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-campus-700 bg-campus-50 border border-campus-200 rounded-lg hover:bg-campus-100 transition-colors shadow-2xs"
                title="Install PWA ke HP / Laptop"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install App</span>
              </button>
            )}

            {/* Admin Portal Button */}
            {isAdminLoggedIn ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={onToggleAdminView}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all border ${
                    isAdminView
                      ? 'bg-campus-900 text-white border-campus-950 shadow-xs'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{isAdminView ? 'Tutup Admin' : 'Admin Panel'}</span>
                </button>
                
                <button
                  onClick={onLogoutAdmin}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                  title="Logout Administrator"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAdminLogin}
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 transition-colors"
                title="Masuk sebagai Administrator Toko"
              >
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Login Admin</span>
              </button>
            )}

            {/* Customer User Account Button */}
            {customerUser ? (
              <button
                onClick={onOpenCustomerProfile}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 text-xs font-medium text-slate-700 bg-campus-50 hover:bg-campus-100 border border-campus-200 rounded-xl transition-all"
                title="Buka Profil Mahasiswa & Riwayat Pesanan"
              >
                <div className="w-6 h-6 rounded-full bg-campus-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                  {customerUser.name.charAt(0)}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="font-bold text-xs leading-none text-slate-900 truncate max-w-[90px]">{customerUser.name}</p>
                  <p className="text-[10px] text-amber-600 font-bold flex items-center gap-0.5 mt-0.5">
                    <Sparkles className="w-2.5 h-2.5" />
                    {customerUser.loyaltyPoints} Poin
                  </p>
                </div>
              </button>
            ) : (
              <button
                onClick={onOpenCustomerAuth}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-campus-700 bg-white hover:bg-campus-50 border border-campus-300 rounded-xl transition-colors shadow-2xs"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Masuk Mahasiswa</span>
              </button>
            )}

            {/* Cart Button */}
            {!isAdminView && (
              <button
                onClick={onOpenCart}
                className="relative flex items-center gap-2 px-3.5 py-2 rounded-xl bg-campus-600 hover:bg-campus-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-campus-600/20 active:scale-95 transition-all"
              >
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Keranjang</span>
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-2xs">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

          </div>
        </div>
      </div>
    </header>
  );
};
