"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, X, Flame } from "lucide-react";
import { usePathname } from "next/navigation";

export default function AnnouncementTicker() {
  const pathname = usePathname();
  const [tickerSettings, setTickerSettings] = useState<any>(null);
  const [upcomingTrips, setUpcomingTrips] = useState<any[]>([]);
  const [isDismissed, setIsDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  // Do not show on admin pages
  if (pathname.startsWith("/admin")) return null;

  useEffect(() => {
    // Check if dismissed in current session
    if (typeof window !== "undefined" && sessionStorage.getItem("soloz_ticker_dismissed") === "true") {
      setIsDismissed(true);
    }

    async function loadData() {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        
        // Fetch ticker settings
        const settingsRes = await fetch(`${API_URL}/settings/ticker`);
        let settingsData = null;
        if (settingsRes.ok) {
          settingsData = await settingsRes.json();
        }

        // Fetch upcoming trips for auto-populating ticker items if custom list is empty
        const tripsRes = await fetch(`${API_URL}/trips`);
        let tripsData = [];
        if (tripsRes.ok) {
          tripsData = await tripsRes.json();
        }

        setTickerSettings(settingsData || {});
        setUpcomingTrips(Array.isArray(tripsData) ? tripsData.slice(0, 5) : []);
      } catch (err) {
        console.error("Error loading ticker data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (isDismissed || loading) return null;

  // Check if enabled (defaults to true)
  const isEnabled = tickerSettings?.enabled !== false;
  if (!isEnabled) return null;

  // Items to display: either custom admin items or auto-generated from upcoming trips
  let items: { text: string; link?: string; badge?: string }[] = [];

  if (tickerSettings?.items && Array.isArray(tickerSettings.items) && tickerSettings.items.length > 0) {
    items = tickerSettings.items.map((item: any) => {
      if (typeof item === "string") {
        return { text: item, badge: "ANNOUNCEMENT" };
      }
      return { text: item.text || "", link: item.link || "", badge: item.badge || "FEATURED" };
    }).filter((i: any) => i.text);
  }

  // Fallback to upcoming trips if custom items empty
  if (items.length === 0 && upcomingTrips.length > 0) {
    items = upcomingTrips.map((t) => {
      const slug = t.slug || t.destination?.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const dateStr = t.batches && t.batches.length > 0
        ? `Upcoming Batch: ${t.batches[0].label || t.batches[0].startDate}`
        : (t.date ? new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Upcoming");

      return {
        text: `${t.title || t.destination} Expedition (${dateStr}) — Limited Seats Left!`,
        link: `/upcoming-trips/${slug}`,
        badge: "UPCOMING"
      };
    });
  }

  if (items.length === 0) return null;

  const handleDismiss = () => {
    setIsDismissed(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("soloz_ticker_dismissed", "true");
    }
  };

  const bgStyle = tickerSettings?.bgStyle || "orange";
  const bgClasses = bgStyle === "dark"
    ? "bg-stone-900 border-stone-800 text-stone-200"
    : bgStyle === "emerald"
    ? "bg-emerald-900 border-emerald-800 text-emerald-100"
    : "bg-gradient-to-r from-[#ea580c] via-orange-600 to-[#ff7a1a] text-white";

  return (
    <div
      data-testid="announcement-ticker"
      className={`relative z-50 py-2.5 px-4 md:px-8 border-b shadow-sm font-sans overflow-hidden ${bgClasses}`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-extrabold uppercase tracking-widest shrink-0 shadow-inner">
          <Flame className="w-3 h-3 text-amber-300 animate-pulse" />
          <span>{tickerSettings?.badgeText || "Trending"}</span>
        </div>

        {/* Marquee Scrolling Content */}
        <div className="flex-1 overflow-hidden relative group cursor-pointer py-0.5">
          <div className="inline-flex gap-8 whitespace-nowrap animate-marquee group-hover:[animation-play-state:paused]">
            {[...items, ...items, ...items].map((item, idx) => (
              <React.Fragment key={idx}>
                {item.link ? (
                  <Link
                    href={item.link}
                    className="inline-flex items-center gap-2 text-xs md:text-sm font-semibold hover:underline transition-all"
                  >
                    <span className="bg-white/15 px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase">
                      {item.badge || "INFO"}
                    </span>
                    <span>{item.text}</span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-80 group-hover:translate-x-1 transition-transform" />
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-2 text-xs md:text-sm font-semibold">
                    <span className="bg-white/15 px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase">
                      {item.badge || "INFO"}
                    </span>
                    <span>{item.text}</span>
                  </span>
                )}
                <span className="text-white/40 text-xs">•</span>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Dismiss Button */}
        <button
          type="button"
          onClick={handleDismiss}
          title="Dismiss Announcement"
          className="p-1 rounded-full hover:bg-white/20 transition-colors text-white/80 hover:text-white shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-33.333%); }
        }
        .animate-marquee {
          animation: marquee ${tickerSettings?.speed || 25}s linear infinite;
        }
      `}</style>
    </div>
  );
}
