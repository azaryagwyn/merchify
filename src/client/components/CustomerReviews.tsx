import React, { useState, useEffect } from 'react';
import { Star, CheckCircle2, MessageSquare, Send } from 'lucide-react';
import { Review, User } from '../../shared/types';

interface CustomerReviewsProps {
  productId: string;
  currentUser?: User;
}

export const CustomerReviews: React.FC<CustomerReviewsProps> = ({ productId, currentUser }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewerName, setReviewerName] = useState(currentUser?.name || '');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetch(`/api/reviews/${productId}`)
      .then((res) => res.json() as Promise<any>)
      .then((data) => {
        if (data?.success) {
          setReviews(data.data);
        }
      })
      .catch((err) => console.error('Gagal mengambil ulasan:', err))
      .finally(() => setLoading(false));
  }, [productId]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !reviewerName.trim()) return;

    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          userId: currentUser?.id,
          reviewerName,
          rating,
          comment,
        }),
      });

      const data = await res.json() as any;
      if (data.success) {
        setMessage({ text: data.message, type: 'success' });
        setComment('');
        // Tambahkan ke review lokal
        setReviews([
          {
            id: data.data.id,
            productId,
            userId: currentUser?.id,
            reviewerName,
            rating,
            comment,
            isVerifiedBuyer: data.data.isVerifiedBuyer,
            createdAt: new Date().toISOString(),
          },
          ...reviews,
        ]);
      } else {
        setMessage({ text: data.message || 'Gagal mengirim ulasan', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Terjadi kesalahan jaringan', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '5.0';

  return (
    <div className="mt-8 pt-8 border-t border-slate-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-campus-600" />
            Ulasan Mahasiswa & Pelanggan ({reviews.length})
          </h4>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center text-amber-400">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-4 h-4 ${
                    s <= Math.round(Number(avgRating)) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-bold text-slate-800">{avgRating} dari 5.0</span>
          </div>
        </div>
      </div>

      {/* Review List */}
      <div className="space-y-4 mb-8">
        {loading ? (
          <p className="text-xs text-slate-500">Memuat ulasan...</p>
        ) : reviews.length === 0 ? (
          <p className="text-xs text-slate-500 italic">Belum ada ulasan untuk produk ini. Jadilah yang pertama memberikan ulasan!</p>
        ) : (
          reviews.map((rev) => (
            <div key={rev.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs sm:text-sm text-slate-900">{rev.reviewerName}</span>
                  {rev.isVerifiedBuyer && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      Pembeli Terverifikasi
                    </span>
                  )}
                </div>
                <div className="flex items-center text-amber-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-3 h-3 ${star <= rev.rating ? 'fill-amber-400' : 'text-slate-300'}`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{rev.comment}</p>
              <p className="text-[10px] text-slate-400 mt-2">
                {new Date(rev.createdAt).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Write a Review Form */}
      <form onSubmit={handleSubmitReview} className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <h5 className="font-bold text-sm text-slate-900 mb-3">Tulis Ulasan Anda</h5>
        
        {message && (
          <div className={`p-3 rounded-lg text-xs font-medium mb-3 ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Mahasiswa / Pembeli</label>
            <input
              type="text"
              required
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              placeholder="Contoh: Budi Santoso (Informatika)"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-campus-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Rating Produk</label>
            <div className="flex items-center gap-1 py-1.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setRating(s)}
                  className="p-1 hover:scale-110 transition-transform focus:outline-none"
                >
                  <Star
                    className={`w-5 h-5 ${
                      s <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-bold text-slate-700 ml-2">{rating} Bintang</span>
            </div>
          </div>
        </div>

        <div className="mb-3">
          <label className="block text-xs font-semibold text-slate-700 mb-1">Komentar / Pengalaman Anda</label>
          <textarea
            required
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Bagaimana kualitas bahan, jahitan, atau ukuran merchandise ini? Apakah sesuai ekspektasi?"
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-campus-500 focus:outline-none"
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-campus-600 hover:bg-campus-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-50"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{submitting ? 'Mengirim...' : 'Kirim Ulasan'}</span>
        </button>
      </form>
    </div>
  );
};
