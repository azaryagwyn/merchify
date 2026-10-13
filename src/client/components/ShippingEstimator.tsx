import React from 'react';
import { Truck, Clock, MapPin, CheckCircle } from 'lucide-react';
import { SHIPPING_OPTIONS } from '../hooks/useCart';

interface ShippingEstimatorProps {
  selectedMethod: string;
  onSelectMethod: (method: 'PICKUP' | 'SAMEDAY_CAMPUS' | 'REGULAR_COURIER') => void;
}

export const ShippingEstimator: React.FC<ShippingEstimatorProps> = ({
  selectedMethod,
  onSelectMethod,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <Truck className="w-4 h-4 text-campus-600" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Pilihan & Estimasi Pengiriman Kampus
        </h4>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {SHIPPING_OPTIONS.map((option) => {
          const isSelected = selectedMethod === option.id;
          return (
            <div
              key={option.id}
              onClick={() => onSelectMethod(option.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                isSelected
                  ? 'border-campus-600 bg-campus-50/70 shadow-xs ring-1 ring-campus-500'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center ${
                  isSelected ? 'border-campus-600 bg-campus-600' : 'border-slate-300'
                }`}>
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-slate-900">{option.name}</p>
                    {option.cost === 0 && (
                      <span className="px-1.5 py-0.2 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded">
                        GRATIS
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{option.description}</p>
                  <div className="flex items-center gap-1.5 mt-1.5 text-[11px] font-semibold text-campus-700">
                    <Clock className="w-3 h-3 text-campus-500" />
                    <span>Estimasi tiba: {option.estimatedTime}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <p className="text-xs font-extrabold text-slate-900">
                  {option.cost === 0 ? 'Rp 0' : `Rp ${option.cost.toLocaleString('id-ID')}`}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
