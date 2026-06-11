"use client";

import { useState } from "react";
import { Compass } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MarqueeItem {
  image: string;
  category: string;
  title: string;
}

interface ActivitiesMarqueeProps {
  items: MarqueeItem[];
}

const categories = ["All", "Treks", "Spiritual Tours", "Road Trips", "Community Events", "Hidden Destinations"];

const lines = [
  "Whether you seek adventure,",
  "culture, or calm — we’ve got the",
  "perfect experience for every kind",
  "of traveler."
];

export function ActivitiesMarquee({ items }: ActivitiesMarqueeProps) {
  const [activeTab, setActiveTab] = useState("All");

  const filtered = activeTab === "All"
    ? items
    : items.filter((item) => item.category.toLowerCase() === activeTab.toLowerCase());

  // Duplicate items to ensure smooth continuous marquee flow (need enough items to fill screen width)
  const marqueeItems = [...filtered, ...filtered, ...filtered, ...filtered];

  return (
    <section className="tour-activities-section py-24 border-t border-white/5 bg-[#080705] overflow-hidden">
      <div className="section-shell space-y-12">
        {/* Subtitle badge & Heading */}
        <div className="text-center max-w-4xl mx-auto flex flex-col items-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.25em] text-soloz-ember">
            <Compass size={13} className="text-soloz-ember animate-spin-slow" />
            Our Tour Activities
          </div>

          {/* Desktop Heading with Staggered Reveal Overlays */}
          <div className="activities-main-wrap hidden md:flex flex-col items-center gap-2">
            {lines.map((line, idx) => (
              <div key={idx} className="activities-heading-block">
                <h2 className="activities-title text-center text-4xl sm:text-5xl font-extrabold text-white leading-tight font-display py-1">
                  {line}
                </h2>
                <motion.div
                  initial={{ width: "100%" }}
                  whileInView={{ width: "0%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: idx * 0.2, ease: "easeInOut" }}
                  className="activities-heading-overlay"
                />
              </div>
            ))}
          </div>

          {/* Mobile Fallback Heading */}
          <h2 className="activities-title text-center text-2xl font-extrabold text-white leading-tight font-display md:hidden px-4">
            Whether you seek adventure, culture, or calm — we’ve got the perfect experience for every kind of traveler.
          </h2>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap justify-center gap-2 pt-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={cn(
                "rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-300 border",
                activeTab === cat
                  ? "bg-soloz-ember border-soloz-ember text-white shadow-glow"
                  : "border-white/10 bg-white/5 text-soloz-ash/60 hover:bg-white/10 hover:text-white"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Staggered Wave Marquee Track */}
      <div className="relative w-full overflow-hidden mt-12 py-6 border-y border-white/5 bg-black/30">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-xs text-soloz-ash/50">
            No active moments found in this category.
          </div>
        ) : (
          <div className="flex select-none">
            {/* Sliding row */}
            <div className="animate-marquee gap-5 flex items-center pr-5">
              {marqueeItems.map((item, idx) => {
                // Determine staggered wave class based on index (1-9 loop)
                const clsNum = (idx % 9) + 1;
                const staggerClass = `_${clsNum < 10 ? "0" + clsNum : clsNum}`;
                
                return (
                  <div
                    key={idx}
                    className={cn(
                      "activities-image relative group overflow-hidden border border-white/10 bg-[#14110d] shadow-lg",
                      staggerClass
                    )}
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" />
                    <div className="absolute bottom-5 left-5 right-5 space-y-1 text-left">
                      <span className="inline-block rounded bg-soloz-ember/25 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-soloz-amber">
                        {item.category}
                      </span>
                      <h4 className="font-display text-sm font-bold text-white leading-tight truncate">
                        {item.title}
                      </h4>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
