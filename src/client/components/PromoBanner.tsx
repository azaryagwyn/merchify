import React from 'react';
import { Tag, Sparkles, Copy, Check } from 'lucide-react';

interface PromoBannerProps {
  onApplyPromoCode?: (code: string) => void;
}

export const PromoBanner: React.FC<PromoBannerProps> = ({ onApplyPromoCode }) => {
  const [copied, setCopied] = React.useState(false);
  const promoCode = 'AWRORA2026';

  const handleCopy = () => {
    navigator.clipboard.writeText(promoCode);
    setCopied(true);
    if (onApplyPromoCode) {
      onApplyPromoCode(promoCode);
    }
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gradient-to-r from-campus-900 via-campus-800 to-campus-950 text-white py-2.5 px-4 text-xs shadow-inner">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <span className="font-semibold text-amber-300 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            Promo Spesial Awrora University:
          </span>
          <span className="hidden sm:inline text-slate-200">
            Diskon 20% belanja merchandise resmi di Merchify!
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-300">Gunakan Kupon:</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/40 rounded-md font-mono font-bold tracking-wider transition-all"
            title="Klik untuk salin kupon"
          >
            <Tag className="w-3 h-3" />
            <span>{promoCode}</span>
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-amber-300/70" />}
          </button>
          {copied && <span className="text-[11px] text-emerald-400 font-medium">Tersalin!</span>}
        </div>
      </div>
    </div>
  );
};
