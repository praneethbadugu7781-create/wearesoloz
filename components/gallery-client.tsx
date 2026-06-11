"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Compass } from "lucide-react";

interface GalleryItem {
  image: string;
  category: string;
  title: string;
}

interface GalleryClientProps {
  gallery: GalleryItem[];
}

const categories = ["All", "Treks", "Spiritual Tours", "Road Trips", "Community Events", "Hidden Destinations"];

export function GalleryClient({ gallery }: GalleryClientProps) {
  const [activeTab, setActiveTab] = useState("All");

  const filteredItems = activeTab === "All"
    ? gallery
    : gallery.filter((item) => item.category.toLowerCase() === activeTab.toLowerCase());

  return (
    <div className="space-y-10">
      {/* Category Tabs */}
      <div className="flex flex-wrap justify-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-wider transition ${
              activeTab === cat
                ? "bg-soloz-ember text-white shadow-glow"
                : "border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Masonry-Style Grid with Framer Motion */}
      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center text-soloz-ash/60">
          <Compass className="mb-3 animate-pulse text-soloz-ember" size={36} />
          <p className="text-sm font-medium">No items found in this category.</p>
        </div>
      ) : (
        <motion.div layout className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.image + index}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/10 bg-black/45"
              >
                {/* Image */}
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />

                {/* Dark Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                {/* Content Reveal */}
                <div className="absolute bottom-0 inset-x-0 p-6 translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  <span className="inline-block rounded-full bg-soloz-ember/20 border border-soloz-ember/30 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-soloz-amber mb-2">
                    {item.category}
                  </span>
                  <h4 className="font-display text-lg font-bold text-white">{item.title}</h4>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
