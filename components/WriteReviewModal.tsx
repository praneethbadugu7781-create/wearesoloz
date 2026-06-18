"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star } from "lucide-react";
import { toast } from "sonner";
import { getApiUrl } from "@/lib/api";

interface WriteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newReview: any) => void;
}

export default function WriteReviewModal({ isOpen, onClose, onSuccess }: WriteReviewModalProps) {
  const [form, setForm] = useState({
    name: "",
    rating: 5,
    quote: "",
    location: "",
    role: "Solo Traveller",
  });
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || form.name.length < 2) {
      toast.error("Please enter your name (minimum 2 characters)");
      return;
    }
    if (!form.quote || form.quote.length < 5) {
      toast.error("Please write a feedback description (minimum 5 characters)");
      return;
    }

    setBusy(true);
    try {
      const API_URL = getApiUrl();
      const res = await fetch(`${API_URL}/testimonials`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          quote: form.quote,
          rating: form.rating,
          location: form.location,
          role: form.role,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit review");
      }

      const newReview = await res.json();
      toast.success("Thank you! Your review has been published successfully.");
      onSuccess(newReview);
      
      // Reset Form
      setForm({
        name: "",
        rating: 5,
        quote: "",
        location: "",
        role: "Solo Traveller",
      });
      onClose();
    } catch {
      toast.error("Couldn't submit review. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative bg-white text-stone-900 rounded-3xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute right-5 top-5 text-stone-400 hover:text-stone-600 transition-colors p-1.5 rounded-full hover:bg-stone-50"
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div className="p-6 pb-4 border-b border-stone-100 shrink-0">
              <h3 className="font-display text-xl font-bold text-stone-900">
                Share Your Experience
              </h3>
              <p className="text-[11px] text-stone-400 mt-1 font-medium">
                Give us your genuine feedback and rating to display on our homepage.
              </p>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
              {/* Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                  Your Name
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Priya Sharma"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-md border border-stone-250 bg-white/90 px-3 py-2.5 h-11 text-sm text-stone-900 focus:outline-none focus:border-[#ea580c]"
                />
              </div>

              {/* Rating Star Selection */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                  Your Rating
                </label>
                <div className="flex items-center gap-1.5 py-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setForm({ ...form, rating: star })}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      className="text-stone-300 hover:scale-110 transition-transform focus:outline-none"
                    >
                      <Star
                        size={28}
                        className={
                          star <= (hoverRating ?? form.rating)
                            ? "fill-amber-400 text-amber-400"
                            : "text-stone-300"
                        }
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Trip Taken / Location */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                    Trip Taken / Destination
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Hampi Trip"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full rounded-md border border-stone-250 bg-white/90 px-3 py-2.5 h-11 text-sm text-stone-900 focus:outline-none focus:border-[#ea580c]"
                  />
                </div>

                {/* Subtitle / Role */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                    Role / Tag
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Solo Traveller"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full rounded-md border border-stone-250 bg-white/90 px-3 py-2.5 h-11 text-sm text-stone-900 focus:outline-none focus:border-[#ea580c]"
                  />
                </div>
              </div>

              {/* Quote / Feedback Text */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                  Your Review
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Tell us what you liked about WeAreSoloz, the itinerary, safety, co-hosting, or food..."
                  value={form.quote}
                  onChange={(e) => setForm({ ...form, quote: e.target.value })}
                  className="w-full rounded-md border border-stone-250 bg-white/90 p-3 text-sm text-stone-900 focus:outline-none focus:border-[#ea580c] resize-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 border border-stone-250 text-stone-600 hover:bg-stone-50 font-bold uppercase tracking-wider text-xs h-11 rounded-full transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="flex-1 font-bold uppercase tracking-wider text-xs h-11 rounded-full gradient-orange text-white hover:opacity-95 shadow-sm transition-all flex items-center justify-center gap-1.5"
                >
                  {busy ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
