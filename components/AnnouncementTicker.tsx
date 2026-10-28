"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, X, Flame, Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";

const DEFAULT_ANNOUNCEMENTS = [
  { text: "Upcoming Batch: Ananthagiri Hills Adventure Trek — Limited Seats Left!", link: "/upcoming-trips", badge: "HOT BATCH" },
  { text: "Special International: Sri Lanka 5D/4N Expedition — Bookings Open!", link: "/upcoming-trips", badge: "FEATURED" },
  { text: "SoloZ Sports & Community Tournaments — Check Out Latest Events!", link: "/events", badge: "COMMUNITY" },
  { text: "Sabarimala Monthly Pilgrimage Expedition — Reserved Group Slots Available!", link: "/upcoming-trips", badge: "PILGRIMAGE" },
  { text: "Munnar Tea Gardens & Wayanad Nature Retreat — Join Solo Travelers!", link: "/upcoming-trips", badge: "TRENDING" }
];

export default function AnnouncementTicker() {
  const pathname = usePathname();
  const [tickerSettings, setTickerSettings] = useState<any>(null);
  const [allTrips, setAllTrips] = useState<any[]>([]);
  const [isDismissed, setIsDismissed] = useState(false);

  // Do not show on admin console
  if (pathname.startsWith("/admin")) return null;

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("soloz_ticker_dismissed") === "true") {
      setIsDismissed(true);
    }

    async function loadData() {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://wearesoloz.com/api";
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const [settingsRes, tripsRes] = await Promise.allSettled([
          fetch(`${API_URL}/settings/ticker`, { signal: controller.signal }),
          fetch(`${API_URL}/trips?all=true`, { signal: controller.signal })
        ]);

        clearTimeout(timeoutId);

        if (settingsRes.status === "fulfilled" && settingsRes.value.ok) {
          const sData = await settingsRes.value.json();
          setTickerSettings(sData || {});
        }

        if (tripsRes.status === "fulfilled" && tripsRes.value.ok) {
          const tData = await tripsRes.value.json();
          if (Array.isArray(tData)) {
            setAllTrips(tData);
          }
        }
      } catch (err) {
        // Silently skip if offline
      }
    }

    loadData();
  }, []);

  if (isDismissed) return null;
  if (tickerSettings?.enabled === false) return null;

  // Determine items to float:
  // 1. Trips where admin checked "showInTicker" (Priority 1)
  const floatingTrips = allTrips.filter((t) => t.showInTicker === true && t.status !== "draft");

  let items: { text: string; link?: string; badge?: string }[] = [];

  if (floatingTrips.length > 0) {
    items = floatingTrips.map((t) => {
      const slug = t.slug || t.destination?.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const dateStr = t.batches && t.batches.length > 0
        ? `Batch: ${t.batches[0].label || t.batches[0].startDate}`
        : (t.date ? new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Upcoming");

      const destName = t.title || t.destination || "";
      const cleanDest = destName.replace(/\s*Expedition\s*/gi, "").trim();

      return {
        text: `${cleanDest} Expedition (${dateStr}) — Limited Seats Available!`,
        link: `/upcoming-trips/${slug}`,
        badge: t.tickerBadge || "HOT BATCH"
      };
    });
  } else if (tickerSettings?.items && Array.isArray(tickerSettings.items) && tickerSettings.items.length > 0) {
    // 2. Custom ticker items from admin settings (filtered for non-badminton)
    items = tickerSettings.items
      .map((item: any) => {
        if (typeof item === "string") {
          return { text: item, link: "/upcoming-trips", badge: "ANNOUNCEMENT" };
        }
        return { text: item.text || "", link: item.link || "/upcoming-trips", badge: item.badge || "FEATURED" };
      })
      .filter((i: any) => i.text && !i.text.toLowerCase().includes("badminton"));
  }

  // 3. Fallback to active upcoming trips if nothing explicitly set
  if (items.length === 0 && allTrips.length > 0) {
    items = allTrips
      .filter((t) => t.status === "published")
      .slice(0, 4)
      .map((t) => {
        const slug = t.slug || t.destination?.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        const dateStr = t.batches && t.batches.length > 0
          ? `${t.batches[0].label || t.batches[0].startDate}`
          : (t.date ? new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Upcoming");

        const destName = t.title || t.destination || "";
        const cleanDest = destName.replace(/\s*Expedition\s*/gi, "").trim();

        return {
          text: `${cleanDest} Expedition (${dateStr}) — Limited Seats Left!`,
          link: `/upcoming-trips/${slug}`,
          badge: "UPCOMING"
        };
      });
  }

  // 4. Default announcements fallback
  if (items.length === 0) {
    items = DEFAULT_ANNOUNCEMENTS;
  }

  // Double-safety filter: remove any badminton mentions
  items = items.filter((i) => !i.text?.toLowerCase().includes("badminton") && !i.link?.includes("badminton"));

  const handleDismiss = () => {
    setIsDismissed(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("soloz_ticker_dismissed", "true");
    }
  };

  return (
    <div
      data-testid="announcement-ticker"
      className="relative z-[60] py-2 px-4 md:px-8 border-b border-stone-800/80 bg-[#09090b]/95 text-stone-100 font-sans overflow-hidden backdrop-blur-xl"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-[10px] font-bold uppercase tracking-wider shrink-0 shadow-2xs">
          <Flame className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
          <span>{tickerSettings?.badgeText || "Trending"}</span>
        </div>

        {/* Marquee Scrolling Content */}
        <div className="flex-1 overflow-hidden relative group cursor-pointer py-0.5 [mask-image:linear-gradient(to_right,transparent,black_32px,black_calc(100%-32px),transparent)]">
          <div className="inline-flex gap-10 whitespace-nowrap animate-marquee group-hover:[animation-play-state:paused] pl-4">
            {[...items, ...items, ...items, ...items].map((item, idx) => (
              <React.Fragment key={idx}>
                {item.link ? (
                  <Link
                    href={item.link}
                    className="inline-flex items-center gap-2.5 text-[12.5px] font-medium text-stone-200 hover:text-white transition-colors"
                  >
                    <span className="bg-gradient-to-r from-[#ea580c] to-amber-500 text-white px-2.5 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider uppercase shadow-xs">
                      {item.badge || "FEATURED"}
                    </span>
                    <span className="tracking-tight">{item.text}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#ea580c] opacity-80 group-hover:translate-x-1 transition-transform" />
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-2.5 text-[12.5px] font-medium text-stone-200">
                    <span className="bg-gradient-to-r from-[#ea580c] to-amber-500 text-white px-2.5 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider uppercase shadow-xs">
                      {item.badge || "FEATURED"}
                    </span>
                    <span className="tracking-tight">{item.text}</span>
                  </span>
                )}
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500/50 shrink-0 self-center" />
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
