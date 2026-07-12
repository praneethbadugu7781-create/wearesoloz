"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { 
  ShieldAlert, 
  Loader2, 
  Calendar, 
  MapPin, 
  User, 
  Star, 
  ThumbsUp, 
  Camera, 
  CheckCircle2, 
  Sparkles,
  Heart
} from "lucide-react";
import { CloudinaryUpload } from "@/components/cloudinary-upload";
import Reveal from "@/components/Reveal";

interface TripDetails {
  _id: string;
  destination: string;
  title?: string;
  date: string;
}

export default function TripFeedbackPage() {
  const { id } = useParams() as { id: string };

  const [trip, setTrip] = useState<TripDetails | null>(null);
  const [loadingTrip, setLoadingTrip] = useState(true);
  const [tripError, setTripError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submissionId, setSubmissionId] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    mobile: "",
    email: "",
    commentsLoved: "",
    commentsImprovements: "",
    travelAgain: "Yes",
    recommendFriends: "Yes",
    allowTestimonial: false,
    photos: [] as string[]
  });

  const [ratings, setRatings] = useState({
    overallExperience: 0,
    accommodation: 0,
    transport: 0,
    captain: 0
  });

  useEffect(() => {
    fetchTripDetails();
  }, [id]);

  const fetchTripDetails = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${API_URL}/trip-feedback/${id}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Feedback link is invalid or expired.");
      }
      const data = await res.json();
      setTrip(data);
    } catch (err: any) {
      setTripError(err.message || "Failed to load trip details.");
    } finally {
      setLoadingTrip(false);
    }
  };

  const handleRatingChange = (category: keyof typeof ratings, value: number) => {
    setRatings(prev => ({ ...prev, [category]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.fullName.trim()) {
      toast.error("Please enter your name.");
      return;
    }
    if (!form.mobile.trim() || form.mobile.length < 10) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (ratings.overallExperience === 0) {
      toast.error("Please select an Overall Experience rating.");
      return;
    }
    if (ratings.accommodation === 0) {
      toast.error("Please rate the Accommodation.");
      return;
    }
    if (ratings.transport === 0) {
      toast.error("Please rate the Transport quality.");
      return;
    }
    if (ratings.captain === 0) {
      toast.error("Please rate the Trip Captain / Guide.");
      return;
    }

    setSubmitting(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${API_URL}/trip-feedback/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fullName: form.fullName,
          mobile: form.mobile,
          email: form.email,
          ratings,
          commentsLoved: form.commentsLoved,
          commentsImprovements: form.commentsImprovements,
          travelAgain: form.travelAgain,
          recommendFriends: form.recommendFriends,
          allowTestimonial: form.allowTestimonial,
          photos: form.photos
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Submission failed.");
      }

      const resData = await res.json();
      setSubmissionId(resData.submissionId);
      setSuccess(true);
      toast.success("Feedback submitted successfully! Thank you!");
    } catch (err: any) {
      toast.error(err.message || "An error occurred during submission.");
    } finally {
      setSubmitting(false);
    }
  };

  // Render clickable stars helper
  const renderStarInput = (category: keyof typeof ratings, label: string) => {
    const currentValue = ratings[category];
    return (
      <div className="space-y-1">
        <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
          {label} *
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => handleRatingChange(category, star)}
              className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
            >
              <Star
                size={28}
                className={star <= currentValue ? "fill-amber-400 text-amber-400" : "text-stone-300"}
              />
            </button>
          ))}
        </div>
      </div>
    );
  };

  if (loadingTrip) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center flex-col gap-4">
        <Loader2 className="animate-spin text-[#ea580c]" size={36} />
        <p className="text-sm font-medium text-stone-600">Retrieving feedback settings...</p>
      </div>
    );
  }

  if (tripError) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-stone-200 shadow-xl text-center space-y-6">
          <div className="size-16 rounded-full bg-red-50 text-red-500 border border-red-100 flex items-center justify-center mx-auto">
            <ShieldAlert size={32} />
          </div>
          <div className="space-y-2">
            <h2 className="font-display text-2xl font-bold text-stone-900">Feedback Closed</h2>
            <p className="text-sm text-stone-500 leading-relaxed">{tripError}</p>
          </div>
          <p className="text-xs text-stone-400">If you believe this is an error, please reach out to WeAreSoloZ team support.</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
        <div className="max-w-xl w-full bg-white rounded-3xl p-8 border border-stone-200 shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-300">
          <div className="size-16 rounded-full bg-green-50 text-[#ea580c] border border-green-100 flex items-center justify-center mx-auto">
            <CheckCircle2 size={36} />
          </div>
          
          <div className="space-y-2">
            <h1 className="font-display text-3xl font-bold text-stone-900">🎉 Thank You!</h1>
            <p className="text-xs font-mono text-[#ea580c] uppercase tracking-wider font-bold">Submission ID: {submissionId}</p>
          </div>

          <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100 text-left space-y-4 text-sm text-stone-600 leading-relaxed">
            <p className="font-semibold text-stone-850">Your feedback has been successfully recorded.</p>
            <p>We appreciate you taking the time to share your experiences. Reviews like yours help us shape better solo-adventure getaways across India!</p>
            <p className="font-bold text-stone-900">Hope to see you on another trip soon!</p>
            <p className="font-display text-stone-800 text-right">— Team WeAreSoloZ 🌿</p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => window.close()}
              className="text-stone-400 hover:text-stone-600 text-xs font-semibold hover:underline"
            >
              You can safely close this window now.
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] text-stone-950 py-10 px-4 md:px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Logo and branding */}
        <Reveal>
          <header className="flex flex-col items-center text-center space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="grid size-10 place-items-center rounded-full border border-soloz-ember bg-soloz-ember/15 text-sm font-black text-soloz-ember">
                WS
              </span>
              <span className="font-display font-bold text-2xl tracking-wider text-stone-900">WeAreSoloZ</span>
            </div>
            <p className="text-[10px] uppercase tracking-widest text-soloz-ash/60 font-bold">Travel Solo. You're not alone.</p>
          </header>
        </Reveal>

        {/* Welcome Details Card */}
        <Reveal>
          <div className="rounded-3xl border border-stone-200 bg-white p-6 md:p-8 shadow-xl relative overflow-hidden space-y-4">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-soloz-amber via-soloz-ember to-orange-600" />
            <div>
              <span className="bg-orange-500/10 text-[#ea580c] px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-orange-500/20">
                Trip Feedback Form
              </span>
              <h1 className="font-display text-2xl font-bold text-stone-900 mt-2">
                {trip?.title || `${trip?.destination} Expedition`}
              </h1>
              <div className="flex flex-wrap gap-4 text-xs text-stone-500 mt-1">
                <span className="flex items-center gap-1">
                  <Calendar size={13} className="text-[#ea580c]" />
                  Date: {trip ? new Date(trip.date).toLocaleDateString() : ""}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin size={13} className="text-[#ea580c]" />
                  Destination: {trip?.destination}
                </span>
              </div>
            </div>

            <p className="text-xs text-stone-500 leading-relaxed pt-2 border-t border-stone-100">
              Welcome back from your trip! We hope you gathered incredible memories and made friends for life. Please share your honest feedback to help us refine and improve future batches.
            </p>
          </div>
        </Reveal>

        {/* Feedback Questionnaire Form */}
        <Reveal>
          <form onSubmit={handleSubmit} className="rounded-3xl border border-stone-200 bg-white p-6 md:p-8 shadow-2xl space-y-8">
            
            {/* Section 1: Passenger Info */}
            <div className="space-y-4">
              <h2 className="font-display text-lg font-bold text-stone-900 border-b border-stone-100 pb-2 flex items-center gap-2">
                <span className="size-6 rounded-full bg-[#ea580c]/10 text-[#ea580c] text-xs flex items-center justify-center font-bold">1</span>
                Traveler Profile
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    className="h-10 w-full rounded-lg border border-stone-200 bg-stone-50/50 px-3 text-xs text-stone-900 focus:border-[#ea580c] focus:bg-white focus:outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit mobile"
                    value={form.mobile}
                    onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                    className="h-10 w-full rounded-lg border border-stone-200 bg-stone-50/50 px-3 text-xs text-stone-900 focus:border-[#ea580c] focus:bg-white focus:outline-none transition-all"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">Email Address (Optional)</label>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="h-10 w-full rounded-lg border border-stone-200 bg-stone-50/50 px-3 text-xs text-stone-900 focus:border-[#ea580c] focus:bg-white focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Section 2: Ratings */}
            <div className="space-y-4">
              <h2 className="font-display text-lg font-bold text-stone-900 border-b border-stone-100 pb-2 flex items-center gap-2">
                <span className="size-6 rounded-full bg-[#ea580c]/10 text-[#ea580c] text-xs flex items-center justify-center font-bold">2</span>
                Trip Ratings
              </h2>
              
              <div className="grid gap-6 sm:grid-cols-2 bg-stone-50/50 p-5 rounded-2xl border border-stone-100">
                {renderStarInput("overallExperience", "Overall Experience")}
                {renderStarInput("accommodation", "Accommodation & Stays")}
                {renderStarInput("transport", "Transport & Driver Quality")}
                {renderStarInput("captain", "Trip Captain / Guide")}
              </div>
            </div>

            {/* Section 3: Review Text */}
            <div className="space-y-4">
              <h2 className="font-display text-lg font-bold text-stone-900 border-b border-stone-100 pb-2 flex items-center gap-2">
                <span className="size-6 rounded-full bg-[#ea580c]/10 text-[#ea580c] text-xs flex items-center justify-center font-bold">3</span>
                Detailed Review
              </h2>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">What did you love most about this trip?</label>
                  <textarea
                    rows={3}
                    placeholder="Share what parts of the itinerary, group vibes, or sightseeing you enjoyed most..."
                    value={form.commentsLoved}
                    onChange={(e) => setForm({ ...form, commentsLoved: e.target.value })}
                    className="w-full rounded-lg border border-stone-200 bg-stone-50/50 p-3 text-xs text-stone-900 focus:border-[#ea580c] focus:bg-white focus:outline-none resize-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">Areas of improvement / suggestions</label>
                  <textarea
                    rows={3}
                    placeholder="Is there anything we could have done better? (hotels, itinerary pace, transport delays etc)..."
                    value={form.commentsImprovements}
                    onChange={(e) => setForm({ ...form, commentsImprovements: e.target.value })}
                    className="w-full rounded-lg border border-stone-200 bg-stone-50/50 p-3 text-xs text-stone-900 focus:border-[#ea580c] focus:bg-white focus:outline-none resize-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Experience Toggles */}
            <div className="space-y-4">
              <h2 className="font-display text-lg font-bold text-stone-900 border-b border-stone-100 pb-2 flex items-center gap-2">
                <span className="size-6 rounded-full bg-[#ea580c]/10 text-[#ea580c] text-xs flex items-center justify-center font-bold">4</span>
                Future Intent
              </h2>
              
              <div className="grid gap-6 sm:grid-cols-2 bg-stone-50/40 p-4 rounded-xl border border-stone-100">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">Would you travel with WeAreSoloZ again?</label>
                  <div className="flex gap-4">
                    {["Yes", "Maybe", "No"].map(val => (
                      <label key={val} className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                        <input
                          type="radio"
                          name="travelAgain"
                          value={val}
                          checked={form.travelAgain === val}
                          onChange={(e) => setForm({ ...form, travelAgain: e.target.value })}
                          className="accent-[#ea580c] size-4"
                        />
                        {val}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">Would you recommend WeAreSoloZ to friends?</label>
                  <div className="flex gap-4">
                    {["Yes", "Maybe", "No"].map(val => (
                      <label key={val} className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                        <input
                          type="radio"
                          name="recommendFriends"
                          value={val}
                          checked={form.recommendFriends === val}
                          onChange={(e) => setForm({ ...form, recommendFriends: e.target.value })}
                          className="accent-[#ea580c] size-4"
                        />
                        {val}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Allow Testimonial Switch */}
              <div className="flex items-start gap-3 p-4 rounded-xl border border-dashed border-stone-200 bg-stone-50/20">
                <input
                  type="checkbox"
                  id="allowTestimonial"
                  checked={form.allowTestimonial}
                  onChange={(e) => setForm({ ...form, allowTestimonial: e.target.checked })}
                  className="accent-[#ea580c] size-4 mt-0.5 cursor-pointer"
                />
                <label htmlFor="allowTestimonial" className="text-xs text-stone-600 leading-normal cursor-pointer select-none">
                  <span className="font-bold text-stone-900 block">Feature my review on the website</span>
                  Yes, I give WeAreSoloZ permission to publish my rating and review as a testimonial on the main website.
                </label>
              </div>
            </div>

            {/* Section 5: Photos Memories */}
            <div className="space-y-4">
              <h2 className="font-display text-lg font-bold text-stone-900 border-b border-stone-100 pb-2 flex items-center gap-2">
                <span className="size-6 rounded-full bg-[#ea580c]/10 text-[#ea580c] text-xs flex items-center justify-center font-bold">5</span>
                Trip Memories Upload (Optional)
              </h2>
              
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">Share photos from your trip (Up to 3 images)</label>
                <div className="grid gap-4 sm:grid-cols-3">
                  {[0, 1, 2].map((idx) => (
                    <div key={idx} className="bg-stone-50 rounded-xl p-2 border border-stone-200 flex flex-col items-center justify-center min-h-[120px]">
                      <CloudinaryUpload
                        value={form.photos[idx] || ""}
                        onChange={(url) => {
                          const newPhotos = [...form.photos];
                          if (url) {
                            newPhotos[idx] = url;
                          } else {
                            newPhotos.splice(idx, 1);
                          }
                          setForm({ ...form, photos: newPhotos.filter(Boolean) });
                        }}
                        label={`Photo Memory #${idx + 1}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Submit Block */}
            <div className="pt-6 border-t border-stone-100 flex flex-col gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="w-full h-12 rounded-xl bg-[#ea580c] hover:bg-[#ea580c]/90 text-white font-bold text-sm uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin" size={16} /> Submitting Feedback...
                  </>
                ) : (
                  <>
                    <ThumbsUp size={16} /> Submit Feedback
                  </>
                )}
              </button>
              <p className="text-[10px] text-center text-stone-400">
                Your privacy is respected. Reviews marked as testimonial consent are only published under your first name or anonymously.
              </p>
            </div>

          </form>
        </Reveal>

      </div>
    </div>
  );
}
