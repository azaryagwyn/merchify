import React, { useState, useEffect } from 'react';
import { X, User as UserIcon, Sparkles, Package, LogOut, Clock, CheckCircle2, ChevronRight, Award } from 'lucide-react';
import { User, Order } from '../../shared/types';

interface CustomerProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onLogout: () => void;
  onSelectOrder: (order: Order) => void;
}

export const CustomerProfileDrawer: React.FC<CustomerProfileDrawerProps> = ({
  isOpen,
  onClose,
  user,
  onLogout,
  onSelectOrder,
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (isOpen && user?.id) {
      setLoadingOrders(true);
      fetch(`/api/orders?userId=${user.id}`)
        .then((res) => res.json() as Promise<any>)
        .then((data) => {
          if (data?.success) {
            setOrders(data.data);
          }
        })
        .catch((err) => console.error('Gagal mengambil pesanan:', err))
        .finally(() => setLoadingOrders(false));
    }
  }, [isOpen, user?.id]);

  if (!isOpen || !user) return null;

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'GOLD':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'SILVER':
        return 'bg-slate-200 text-slate-800 border-slate-300';
      default:
        return 'bg-orange-100 text-orange-800 border-orange-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-campus-600" />
            <h3 className="font-extrabold text-base text-slate-900">Profil & Akun Mahasiswa</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-6">
          
          {/* User Info Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-tr from-campus-900 via-campus-800 to-campus-950 text-white shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 border border-white/30 flex items-center justify-center font-black text-lg text-white">
                {user.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-extrabold text-base truncate">{user.name}</h4>
                <p className="text-xs text-slate-300 truncate">{user.email}</p>
                {user.studentId && (
                  <p className="text-[11px] text-amber-300 font-mono mt-0.5">NIM: {user.studentId}</p>
                )}
              </div>
            </div>

            {/* Loyalty & Points Banner */}
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" />
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getTierColor(user.loyaltyTier)}`}>
                  {user.loyaltyTier} MEMBER
                </span>
              </div>
              <div className="flex items-center gap-1 text-amber-300 font-extrabold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{user.loyaltyPoints} Poin</span>
              </div>
            </div>
          </div>

          {/* Order History Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Package className="w-4 h-4 text-campus-600" />
                <span>Riwayat Pesanan Saya ({orders.length})</span>
              </h4>
            </div>

            {loadingOrders ? (
              <p className="text-xs text-slate-400 py-4 text-center">Memuat riwayat transaksi...</p>
            ) : orders.length === 0 ? (
              <div className="p-6 text-center rounded-2xl bg-slate-50 border border-slate-200 text-slate-400 text-xs">
                <Package className="w-8 h-8 stroke-1 mx-auto mb-2 text-slate-300" />
                <p className="font-semibold text-slate-700">Belum ada transaksi</p>
                <p className="mt-1 text-[11px]">Merchandise yang Anda pesan akan tercatat rapi di sini.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    onClick={() => {
                      onSelectOrder(ord);
                      onClose();
                    }}
                    className="p-3.5 rounded-xl border border-slate-200/90 hover:border-campus-400 hover:shadow-xs transition-all bg-white cursor-pointer flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-slate-900">{ord.orderNumber}</span>
                        <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                          ord.status === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {ord.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {new Date(ord.createdAt).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                      </p>
                      <p className="text-xs font-black text-campus-700 mt-1">
                        Rp {ord.totalAmount.toLocaleString('id-ID')}
                      </p>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Logout Button */}
        <div className="p-5 border-t border-slate-200 bg-slate-50">
          <button
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="w-full py-2.5 px-4 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 hover:border-rose-300 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow-2xs"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar dari Akun Mahasiswa</span>
          </button>
        </div>
      </div>
    </div>
  );
};
