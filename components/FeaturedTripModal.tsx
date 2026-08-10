"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, Calendar, Clock, MapPin, ArrowRight, X, MessageCircle, Flame, ShieldCheck } from "lucide-react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function FeaturedTripModal() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [popupSettings, setPopupSettings] = useState<any>(null);
  const [featuredTrip, setFeaturedTrip] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  // Do not show modal on admin pages
  if (pathname.startsWith("/admin")) return null;

  useEffect(() => {
    // Check if user already saw popup in this session
    if (typeof window !== "undefined" && sessionStorage.getItem("soloz_popup_seen") === "true") {
      return;
    }

    async function initModal() {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const settingsRes = await fetch(`${API_URL}/settings/featured_popup`);
        
        let settingsData: any = null;
        if (settingsRes.ok) {
          settingsData = await settingsRes.json();
        }

        // Check if enabled (defaults to true if trip exists)
        if (settingsData && settingsData.enabled === false) {
          return;
        }

        // Fetch trips to find the featured trip
        const tripsRes = await fetch(`${API_URL}/trips?all=true`);
        if (!tripsRes.ok) return;
        const allTrips = await tripsRes.json();

        if (!Array.isArray(allTrips) || allTrips.length === 0) return;

        // Find trip by slug configured in admin, or pick the first published upcoming trip
        let tripToFeature = null;
        if (settingsData?.tripSlug) {
          tripToFeature = allTrips.find((t: any) => t.slug === settingsData.tripSlug || t.id === settingsData.tripSlug);
        }

        if (!tripToFeature) {
          const published = allTrips.filter((t: any) => t.status === "published");
          tripToFeature = published.length > 0 ? published[0] : allTrips[0];
        }

        if (!tripToFeature) return;

        setPopupSettings(settingsData || {});
        setFeaturedTrip(tripToFeature);

        // Calculate countdown to trip date
        const targetDateStr = tripToFeature.batches && tripToFeature.batches.length > 0
          ? tripToFeature.batches[0].startDate
          : (tripToFeature.startDate || tripToFeature.date);

        if (targetDateStr) {
          const targetTime = new Date(targetDateStr).getTime();
          const updateCountdown = () => {
            const now = new Date().getTime();
            const diff = targetTime - now;

            if (diff > 0) {
              const days = Math.floor(diff / (1000 * 60 * 60 * 24));
              const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
              const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
              const seconds = Math.floor((diff % (1000 * 60)) / 1000);
              setTimeLeft({ days, hours, minutes, seconds });
            } else {
              setTimeLeft(null);
            }
          };

          updateCountdown();
          const timer = setInterval(updateCountdown, 1000);
          return () => clearInterval(timer);
        }

        // Open modal after delay (default 3 seconds)
        const delay = (settingsData?.delaySeconds || 3.5) * 1000;
        const timeout = setTimeout(() => {
          setOpen(true);
        }, delay);

        return () => clearTimeout(timeout);
      } catch (err) {
        console.error("Error initializing featured trip popup:", err);
      }
    }

    initModal();
  }, [pathname]);

  const handleClose = () => {
    setOpen(false);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("soloz_popup_seen", "true");
    }
  };

  if (!open || !featuredTrip) return null;

  const slug = featuredTrip.slug || featuredTrip.destination?.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const tripUrl = `/upcoming-trips/${slug}`;

  const waText = encodeURIComponent(
    `Hi Akhil, I saw the featured trip "${featuredTrip.title || featuredTrip.destination}" on your website! Can I get details and reserve a seat?`
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl border border-stone-200/80 transform transition-all animate-scaleUp font-body"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-stone-900/60 hover:bg-stone-900 text-white flex items-center justify-center backdrop-blur-md transition-all shadow-md"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Image Section */}
        <div className="relative aspect-[16/9] w-full overflow-hidden">
          <img
            src={featuredTrip.image || "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80"}
            alt={featuredTrip.title || featuredTrip.destination}
            className="w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />

          {/* Badge */}
          <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ea580c] text-white text-[10px] font-extrabold uppercase tracking-widest shadow-lg">
            <Flame className="w-3.5 h-3.5 text-amber-200 animate-bounce" />
            <span>{popupSettings?.badgeText || "Akhil's Pick of the Month"}</span>
          </div>

          <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#ff7a1a]">
              {featuredTrip.category || "Adventure Expedition"}
            </span>
            <h3 className="font-display text-2xl font-bold text-white truncate">
              {featuredTrip.title || featuredTrip.destination}
            </h3>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 space-y-5">
          <div className="space-y-1">
            <h4 className="font-display text-lg font-bold text-stone-900">
              {popupSettings?.title || "🔥 Featured Upcoming Expedition!"}
            </h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              {popupSettings?.subheading || "Join solo travelers on this curated trip. Limited seats remaining—book your slot online or via WhatsApp!"}
            </p>
          </div>

          {/* Countdown Timer (if target date exists and enabled) */}
          {timeLeft && popupSettings?.showCountdown !== false && (
            <div className="bg-orange-50/80 border border-orange-200/70 rounded-2xl p-3 text-center space-y-1.5">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#ea580c] block">
                ⏱️ Departure Countdown
              </span>
              <div className="grid grid-cols-4 gap-2 text-center font-display">
                <div className="bg-white rounded-xl p-2 border border-orange-100 shadow-sm">
                  <div className="text-lg font-bold text-stone-900">{String(timeLeft.days).padStart(2, "0")}</div>
                  <div className="text-[9px] uppercase tracking-wider text-stone-500 font-sans font-semibold">Days</div>
                </div>
                <div className="bg-white rounded-xl p-2 border border-orange-100 shadow-sm">
                  <div className="text-lg font-bold text-stone-900">{String(timeLeft.hours).padStart(2, "0")}</div>
                  <div className="text-[9px] uppercase tracking-wider text-stone-500 font-sans font-semibold">Hours</div>
                </div>
                <div className="bg-white rounded-xl p-2 border border-orange-100 shadow-sm">
                  <div className="text-lg font-bold text-stone-900">{String(timeLeft.minutes).padStart(2, "0")}</div>
                  <div className="text-[9px] uppercase tracking-wider text-stone-500 font-sans font-semibold">Mins</div>
                </div>
                <div className="bg-white rounded-xl p-2 border border-orange-100 shadow-sm">
                  <div className="text-lg font-bold text-stone-900">{String(timeLeft.seconds).padStart(2, "0")}</div>
                  <div className="text-[9px] uppercase tracking-wider text-stone-500 font-sans font-semibold">Secs</div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Trip Stats */}
          <div className="flex items-center justify-between text-xs text-stone-600 bg-stone-50 p-3 rounded-xl border border-stone-200/60 font-body">
            <span className="flex items-center gap-1 font-medium"><Clock className="w-3.5 h-3.5 text-[#ea580c]" /> {featuredTrip.duration || "2 Days / 1 Night"}</span>
            <span className="flex items-center gap-1 font-medium"><MapPin className="w-3.5 h-3.5 text-[#ea580c]" /> {featuredTrip.destination}</span>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-2.5 pt-1">
            <Link href={tripUrl} onClick={handleClose} className="block">
              <Button className="w-full h-12 gradient-orange text-white hover:opacity-95 rounded-full font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all">
                <span>⚡ View Trip Details & Book Slot</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            <a
              href={`https://wa.me/919966085310?text=${waText}`}
              target="_blank"
              rel="noreferrer"
              onClick={handleClose}
              className="w-full py-2.5 px-4 rounded-full border border-emerald-500/40 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-bold text-xs flex items-center justify-center gap-2 transition-all block text-center"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600 inline-block" />
              <span>💬 Reserve Seat on WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
