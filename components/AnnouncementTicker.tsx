"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, X, Flame, Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";

const DEFAULT_ANNOUNCEMENTS = [
  { text: "🏸 WEARESOLOZ BADMINTON CHAMPIONSHIP (SEASON 1) — Sep 20 at Manikonda! Prize Pool ₹10,000! Register Team (₹500)", link: "/events/badminton-championship", badge: "SPORTS EVENT" },
  { text: "🔥 Upcoming Batch: Ananthagiri Hills Adventure Trek — Limited Seats Left!", link: "/upcoming-trips", badge: "HOT BATCH" },
  { text: "✈️ Special International: Sri Lanka 5D/4N Expedition — Bookings Open!", link: "/upcoming-trips", badge: "FEATURED" },
  { text: "🛕 Sabarimala Monthly Pilgrimage Expedition — Reserved Group Slots Available!", link: "/upcoming-trips", badge: "PILGRIMAGE" },
  { text: "🌿 Munnar Tea Gardens & Wayanad Nature Retreat — Join Solo Travelers!", link: "/upcoming-trips", badge: "TRENDING" }
];

export default function AnnouncementTicker() {
  const pathname = usePathname();
  const [tickerSettings, setTickerSettings] = useState<any>(null);
  const [upcomingTrips, setUpcomingTrips] = useState<any[]>([]);
  const [isDismissed, setIsDismissed] = useState(false);

  // Do not show on admin pages
  if (pathname.startsWith("/admin")) return null;

  useEffect(() => {
    // Check if dismissed in current session
    if (typeof window !== "undefined" && sessionStorage.getItem("soloz_ticker_dismissed") === "true") {
      setIsDismissed(true);
    }

    async function loadData() {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://wearesoloz.com/api";
        
        // Fetch ticker settings with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const [settingsRes, tripsRes] = await Promise.allSettled([
          fetch(`${API_URL}/settings/ticker`, { signal: controller.signal }),
          fetch(`${API_URL}/trips`, { signal: controller.signal })
        ]);

        clearTimeout(timeoutId);

        if (settingsRes.status === "fulfilled" && settingsRes.value.ok) {
          const sData = await settingsRes.value.json();
          setTickerSettings(sData || {});
        }

        if (tripsRes.status === "fulfilled" && tripsRes.value.ok) {
          const tData = await tripsRes.value.json();
          if (Array.isArray(tData)) {
            setUpcomingTrips(tData.slice(0, 5));
          }
        }
      } catch (err) {
        console.warn("Ticker API fetch notice:", err);
      }
    }

    loadData();
  }, []);

  if (isDismissed) return null;

  // Check if explicitly disabled in admin settings
  if (tickerSettings?.enabled === false) return null;

  // Items to display: admin custom items > upcoming trips > DEFAULT_ANNOUNCEMENTS
  let items: { text: string; link?: string; badge?: string }[] = [];

  if (tickerSettings?.items && Array.isArray(tickerSettings.items) && tickerSettings.items.length > 0) {
    items = tickerSettings.items.map((item: any) => {
      if (typeof item === "string") {
        return { text: item, link: "/upcoming-trips", badge: "ANNOUNCEMENT" };
      }
      return { text: item.text || "", link: item.link || "/upcoming-trips", badge: item.badge || "FEATURED" };
    }).filter((i: any) => i.text);
  }

  // Fallback 1: Auto-generate from upcoming trips if no custom items set
  if (items.length === 0 && upcomingTrips.length > 0) {
    items = upcomingTrips.map((t) => {
      const slug = t.slug || t.destination?.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const dateStr = t.batches && t.batches.length > 0
        ? `Batch: ${t.batches[0].label || t.batches[0].startDate}`
        : (t.date ? new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Upcoming");

      return {
        text: `${t.title || t.destination} Expedition (${dateStr}) — Limited Seats Remaining!`,
        link: `/upcoming-trips/${slug}`,
        badge: "UPCOMING"
      };
    });
  }

  // Fallback 2: Default announcements if API empty/offline
  if (items.length === 0) {
    items = DEFAULT_ANNOUNCEMENTS;
  }

  // Ensure Badminton Championship Season 1 is always prepended to ticker items
  const badmintonTickerItem = {
    text: "🏸 WEARESOLOZ BADMINTON CHAMPIONSHIP (SEASON 1) — Sep 20 at Manikonda! Prize Pool ₹10,000! Register Team (₹500)",
    link: "/events/badminton-championship",
    badge: "SPORTS EVENT"
  };

  if (!items.some((i) => i.link?.includes("badminton-championship"))) {
    items.unshift(badmintonTickerItem);
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("soloz_ticker_dismissed", "true");
    }
  };

  return (
    <div
      data-testid="announcement-ticker"
      className="relative z-[60] py-2 px-4 md:px-8 border-b border-stone-800/80 bg-[#0e131f] text-stone-100 font-sans overflow-hidden backdrop-blur-md"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-[10px] font-extrabold uppercase tracking-widest shrink-0 shadow-xs">
          <Flame className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
          <span>{tickerSettings?.badgeText || "Trending"}</span>
        </div>

        {/* Marquee Scrolling Content */}
        <div className="flex-1 overflow-hidden relative group cursor-pointer py-0.5">
          <div className="inline-flex gap-10 whitespace-nowrap animate-marquee group-hover:[animation-play-state:paused]">
            {[...items, ...items, ...items, ...items].map((item, idx) => (
              <React.Fragment key={idx}>
                {item.link ? (
                  <Link
                    href={item.link}
                    className="inline-flex items-center gap-2.5 text-xs md:text-xs font-semibold text-stone-200 hover:text-[#ea580c] transition-colors"
                  >
                    <span className="bg-gradient-to-r from-[#ea580c] to-amber-500 text-white px-2.5 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider uppercase shadow-xs">
                      {item.badge || "INFO"}
                    </span>
                    <span className="tracking-tight">{item.text}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#ea580c] opacity-80 group-hover:translate-x-1 transition-transform" />
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-2.5 text-xs md:text-xs font-semibold text-stone-200">
                    <span className="bg-gradient-to-r from-[#ea580c] to-amber-500 text-white px-2.5 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider uppercase shadow-xs">
                      {item.badge || "INFO"}
                    </span>
                    <span className="tracking-tight">{item.text}</span>
                  </span>
                )}
                <span className="text-stone-600 text-xs font-bold">•</span>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Dismiss Button */}
        <button
          type="button"
          onClick={handleDismiss}
          title="Dismiss Announcement"
          className="p-1 rounded-full hover:bg-stone-800 transition-colors text-stone-400 hover:text-white shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-25%); }
        }
        .animate-marquee {
          animation: marquee ${tickerSettings?.speed || 28}s linear infinite;
        }
      `}</style>
    </div>
  );
}
