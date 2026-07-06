"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getApiUrl } from "@/lib/api";
import { Quote, Star, ArrowLeft, MessageSquare, Plus, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import WriteReviewModal from "@/components/WriteReviewModal";

interface Testimonial {
  _id: string;
  name: string;
  rating: number;
  quote: string;
  message?: string;
  location?: string;
  role?: string;
  avatar?: string;
  createdAt?: string;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWriteReview, setShowWriteReview] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const API_URL = getApiUrl();
      const res = await fetch(`${API_URL}/testimonials`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (err) {
      console.error("Error loading reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSuccess = (newReview: Testimonial) => {
    setReviews([newReview, ...reviews]);
  };

  return (
    <main className="min-h-screen bg-stone-50/60 pb-20 pt-28 px-4 md:px-10">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-stone-200 pb-8">
          <div className="space-y-3">
            <Link 
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-850 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
            </Link>
            <h1 className="font-display text-4xl md:text-6xl font-light tracking-tighter text-stone-900 leading-none">
              Real Stories. <span className="font-semibold text-[#ea580c]">Real Travellers.</span>
            </h1>
            <p className="text-sm text-stone-600 max-w-xl font-body leading-relaxed">
              Read genuine reviews and travel experiences shared by solo travelers who explored the world with the WeAreSoloz community.
            </p>
          </div>

          <button
            onClick={() => setShowWriteReview(true)}
            className="inline-flex items-center gap-2 border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 font-bold uppercase tracking-wider text-[11px] px-6 py-3.5 rounded-full transition-all duration-300 shadow-sm active:scale-95 shrink-0 self-start md:self-auto"
          >
            <Plus className="w-4 h-4 text-[#ea580c]" /> Write a Review
          </button>
        </div>

        {/* Reviews Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-24 gap-2 text-stone-400">
            <Loader2 className="animate-spin text-[#ea580c]" size={24} />
            <span className="text-xs uppercase tracking-widest font-semibold">Loading Traveler Reviews...</span>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-20 bg-white border border-stone-200/80 rounded-2xl p-8 max-w-md mx-auto space-y-3 shadow-sm">
            <MessageSquare className="w-8 h-8 text-stone-300 mx-auto" />
            <h3 className="font-display text-lg font-bold text-stone-850">No Reviews Yet</h3>
            <p className="text-xs text-stone-500">
              Be the first to share your travel feedback with the community! Click "Write a Review" above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            {reviews.map((t, idx) => (
              <motion.div
                key={t._id || idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: Math.min(idx * 0.05, 0.5) }}
                className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Quote className="w-6 h-6 text-[#ea580c] opacity-80" />
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={i < (t.rating || 5) ? "fill-amber-400 text-amber-400" : "text-stone-200"}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm sm:text-base text-stone-700 leading-relaxed font-body whitespace-pre-line">
                    {t.quote || t.message}
                  </p>
                </div>
                <div className="flex items-center gap-3 mt-6 border-t border-stone-100 pt-4">
                  {t.avatar ? (
                    <img src={t.avatar} alt={t.name} className="w-9 h-9 rounded-full object-cover border border-stone-200" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-xs font-bold text-stone-600 uppercase select-none">
                      {t.name.slice(0, 2)}
                    </div>
                  )}
                  <div>
                    <div className="font-semibold text-xs text-stone-900 leading-none">{t.name}</div>
                    <div className="text-[10px] text-stone-400 mt-1 font-medium">{t.location || t.role || "Solo Traveler"}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

      </div>

      {/* Review Modal Trigger */}
      <WriteReviewModal
        isOpen={showWriteReview}
        onClose={() => setShowWriteReview(false)}
        onSuccess={handleReviewSuccess}
      />
    </main>
  );
}
