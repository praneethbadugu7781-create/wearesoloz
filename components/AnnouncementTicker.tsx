"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, X } from "lucide-react";
import { usePathname } from "next/navigation";

const DEFAULT_ANNOUNCEMENTS = [
  { text: "Upcoming Batch: Ananthagiri Hills Adventure Trek — Limited Seats Available", link: "/upcoming-trips", badge: "HOT BATCH" },
  { text: "Special International: Sri Lanka 5D/4N Expedition — Bookings Open", link: "/upcoming-trips", badge: "FEATURED" },
  { text: "SoloZ Community Events & Tournaments — Explore What's Next", link: "/events", badge: "COMMUNITY" },
  { text: "Sabarimala Monthly Pilgrimage — Reserved Group Slots Open", link: "/upcoming-trips", badge: "PILGRIMAGE" },
  { text: "Munnar Tea Gardens & Wayanad Nature Retreat — Join Solo Travelers", link: "/upcoming-trips", badge: "TRENDING" }
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
        text: `${cleanDest} Expedition (${dateStr}) — Limited Seats Available`,
        link: `/upcoming-trips/${slug}`,
        badge: t.tickerBadge || "HOT BATCH"
      };
    });
  } else if (tickerSettings?.items && Array.isArray(tickerSettings.items) && tickerSettings.items.length > 0) {
    // 2. Custom ticker items from admin settings (filtered for non-badminton, strip emojis)
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
          text: `${cleanDest} Expedition (${dateStr}) — Limited Seats Left`,
          link: `/upcoming-trips/${slug}`,
          badge: "UPCOMING"
        };
      });
  }

  // 4. Default announcements fallback
  if (items.length === 0) {
    items = DEFAULT_ANNOUNCEMENTS;
  }

  // Double-safety filter: remove any badminton mentions & clean up any stray emojis
  items = items
    .filter((i) => !i.text?.toLowerCase().includes("badminton") && !i.link?.includes("badminton"))
    .map((i) => ({
      ...i,
      // Strip any stray unicode emoji symbols for a clean luxury look
      text: i.text.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "").trim()
    }));

  const handleDismiss = () => {
    setIsDismissed(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("soloz_ticker_dismissed", "true");
    }
  };

  return (
    <div
      data-testid="announcement-ticker"
      className="relative z-[60] py-1.5 px-4 md:px-8 border-b border-white/[0.08] bg-[#0c0a09]/92 text-stone-300 font-sans overflow-hidden backdrop-blur-2xl"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left Live Indicator Badge */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.1] text-stone-300 text-[10px] font-semibold uppercase tracking-wider shrink-0 select-none">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ea580c] animate-pulse" />
          <span className="text-stone-300 font-bold">{tickerSettings?.badgeText || "Updates"}</span>
        </div>

        {/* Marquee Scrolling Content */}
        <div className="flex-1 overflow-hidden relative group cursor-pointer py-0.5 [mask-image:linear-gradient(to_right,transparent,black_32px,black_calc(100%-32px),transparent)]">
          <div className="inline-flex gap-8 whitespace-nowrap animate-marquee group-hover:[animation-play-state:paused] pl-4">
            {[...items, ...items, ...items, ...items].map((item, idx) => (
              <React.Fragment key={idx}>
                {item.link ? (
                  <Link
                    href={item.link}
                    className="inline-flex items-center gap-2 text-[12px] font-medium text-stone-300 hover:text-white transition-colors"
                  >
                    <span className="bg-[#ea580c]/15 text-[#ff8a3d] border border-[#ea580c]/30 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase shrink-0">
                      {item.badge || "EXPEDITION"}
                    </span>
                    <span className="tracking-tight">{item.text}</span>
                    <ArrowRight className="w-3 h-3 text-stone-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-2 text-[12px] font-medium text-stone-300">
                    <span className="bg-[#ea580c]/15 text-[#ff8a3d] border border-[#ea580c]/30 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase shrink-0">
                      {item.badge || "EXPEDITION"}
                    </span>
                    <span className="tracking-tight">{item.text}</span>
                  </span>
                )}
                <span className="text-white/20 text-xs font-mono select-none mx-2">/</span>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Dismiss Button */}
        <button
          type="button"
          onClick={handleDismiss}
          title="Dismiss Announcement"
          className="p-1 rounded-full text-stone-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
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
