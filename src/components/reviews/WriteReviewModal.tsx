import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Star, ShieldCheck, Camera, CheckCircle2 } from 'lucide-react';
import { useReviewStore } from '../../store/useReviewStore';
import { useAuthStore } from '../../store/useAuthStore';
import { submitProductReview } from '../../services/api/reviews';
import type { OrderItem } from '../../types';

interface WriteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: OrderItem | null;
  orderId?: string;
}

export const WriteReviewModal: React.FC<WriteReviewModalProps> = ({
  isOpen,
  onClose,
  item,
  orderId,
}) => {
  const { user } = useAuthStore();
  const { addReview } = useReviewStore();

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [fit, setFit] = useState<'Runs Small' | 'True to Size' | 'Runs Large'>('True to Size');
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!item) return null;

  const handleSimulatePhotoUpload = () => {
    // Add sample lifestyle apparel photo
    const samplePhotos = [
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&auto=format&fit=crop&q=80',
    ];
    if (uploadedPhotos.length < 3) {
      setUploadedPhotos([...uploadedPhotos, samplePhotos[uploadedPhotos.length % samplePhotos.length]]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !text.trim()) return;

    setLoading(true);
    try {
      await submitProductReview(item.productId, {
        rating,
        fit,
        title: title.trim(),
        text: text.trim(),
        images: uploadedPhotos.length > 0 ? uploadedPhotos : undefined,
        orderId,
      });

      addReview({
        productId: item.productId,
        orderId,
        userId: user?.id || 'usr-demo-1',
        userName: user?.name || 'Verified Customer',
        rating,
        fit,
        title: title.trim(),
        text: text.trim(),
        verifiedBuyer: true,
        images: uploadedPhotos.length > 0 ? uploadedPhotos : undefined,
      });

      setLoading(false);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 1400);
    } catch {
      // Graceful fallback to client store
      addReview({
        productId: item.productId,
        orderId,
        userId: user?.id || 'usr-demo-1',
        userName: user?.name || 'Verified Customer',
        rating,
        fit,
        title: title.trim(),
        text: text.trim(),
        verifiedBuyer: true,
        images: uploadedPhotos.length > 0 ? uploadedPhotos : undefined,
      });
      setLoading(false);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 1400);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Rate & Review Product" size="md">
      {submitted ? (
        <div className="py-8 text-center space-y-3">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={32} />
          </div>
          <h3 className="text-base font-extrabold text-primary">Review Published!</h3>
          <p className="text-xs text-muted max-w-sm mx-auto">
            Thank you for helping fellow shoppers on StyleBazaar. You've earned 50 bonus Insider Points!
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Product Header */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200/70 rounded-xl">
            <img
              src={item.image}
              alt={item.title}
              className="w-12 h-14 object-cover rounded-md flex-shrink-0"
            />
            <div className="flex-1 truncate">
              <span className="font-extrabold text-primary block truncate">{item.title}</span>
              <span className="text-muted text-[11px] block">
                Brand: {item.brand} • Size: {item.size}
              </span>
              <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                <ShieldCheck size={12} /> Verified Purchase
              </span>
            </div>
          </div>

          {/* Star Rating Picker */}
          <div className="space-y-1.5 text-center py-2 bg-rose-50/30 rounded-xl border border-rose-100">
            <span className="font-bold text-gray-700 block">Overall Experience</span>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = (hoverRating !== null ? hoverRating : rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    onClick={() => setRating(star)}
                    className="p-1 focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      size={28}
                      className={
                        isFilled
                          ? 'fill-amber-400 text-amber-400 filter drop-shadow-xs'
                          : 'text-gray-300'
                      }
                    />
                  </button>
                );
              })}
            </div>
            <span className="text-[11px] font-bold text-accent block">
              {rating === 5 && 'Excellent - Loved everything!'}
              {rating === 4 && 'Good - Worth buying'}
              {rating === 3 && 'Average - Met expectations'}
              {rating === 2 && 'Disappointed - Needs improvement'}
              {rating === 1 && 'Poor - Did not like it'}
            </span>
          </div>

          {/* Fit Sentiment */}
          <div className="space-y-1.5">
            <label className="font-bold text-gray-700 block">How does the size fit?</label>
            <div className="grid grid-cols-3 gap-2">
              {(['Runs Small', 'True to Size', 'Runs Large'] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setFit(opt)}
                  className={`py-2 px-1 border rounded-lg text-center font-bold text-xs transition-colors ${
                    fit === opt
                      ? 'border-accent bg-rose-50/60 text-accent ring-2 ring-rose-200'
                      : 'border-border text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Review Headline */}
          <div>
            <label className="font-bold text-gray-700 block mb-1">Review Headline *</label>
            <input
              type="text"
              required
              placeholder="e.g. Crisp fit, breathable cotton fabric!"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg outline-none focus:border-accent text-xs"
            />
          </div>

          {/* Detailed Feedback */}
          <div>
            <label className="font-bold text-gray-700 block mb-1">Detailed Review *</label>
            <textarea
              required
              rows={3}
              placeholder="Tell other shoppers about the material quality, comfort, color fidelity, and stitching..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg outline-none focus:border-accent text-xs"
            />
          </div>

          {/* Upload Customer Photos Simulation */}
          <div className="space-y-1.5">
            <span className="font-bold text-gray-700 block">Add Customer Photos (Optional)</span>
            <div className="flex items-center gap-2">
              {uploadedPhotos.map((url, i) => (
                <div key={i} className="relative w-14 h-14 rounded-lg overflow-hidden border border-border">
                  <img src={url} alt="upload" className="w-full h-full object-cover" />
                </div>
              ))}
              {uploadedPhotos.length < 3 && (
                <button
                  type="button"
                  onClick={handleSimulatePhotoUpload}
                  className="w-14 h-14 rounded-lg border-2 border-dashed border-gray-300 hover:border-accent hover:bg-rose-50/30 flex flex-col items-center justify-center gap-1 text-gray-500 hover:text-accent transition-colors"
                >
                  <Camera size={16} />
                  <span className="text-[9px] font-bold">+ Photo</span>
                </button>
              )}
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3 border-t border-gray-100">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" size="sm" loading={loading}>
              Submit Review
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
