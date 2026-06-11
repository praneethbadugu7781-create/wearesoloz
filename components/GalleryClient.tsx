"use client";

import React, { useState } from "react";
import Reveal, { SectionLabel } from "@/components/Reveal";

interface GalleryClientProps {
  initialItems: any[];
}

const CATS = ["All", "Treks", "Spiritual Tours", "Road Trips", "Community Events", "Hidden Destinations"];

export default function GalleryClient({ initialItems = [] }: GalleryClientProps) {
  const [cat, setCat] = useState("All");

  const filteredItems = initialItems.filter((item) => {
    if (cat === "All") return true;
    return item.category && item.category.toLowerCase() === cat.toLowerCase();
  });

  return (
    <div data-testid="gallery-page" className="bg-white min-h-screen text-[#1c1917] pt-20">
      <section className="pt-40 pb-12 px-6 md:px-10 text-center">
        <SectionLabel>The Soloz Gallery</SectionLabel>
        <h1 className="font-display text-5xl md:text-7xl font-light tracking-tighter mt-5 text-stone-900">
          Moments, <span className="gradient-text font-medium">frozen</span>.
        </h1>
        <div className="flex flex-wrap items-center justify-center gap-2 mt-10">
          {CATS.map((c) => (
            <button
              key={c}
              data-testid={`gallery-cat-${c.toLowerCase().replace(/\s+/g, "-")}`}
              onClick={() => setCat(c)}
              className={`px-4 py-1.5 text-xs uppercase tracking-widest rounded-full border transition-colors ${
                cat === c
                  ? "bg-soloz-primary border-soloz-primary text-white"
                  : "border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      <section className="pb-32 px-6 md:px-10">
        <div className="max-w-7xl mx-auto">
          {filteredItems.length === 0 ? (
            <div className="text-center glass rounded-3xl py-20 text-soloz-textSecondary border border-stone-200">
              No gallery images yet. Akhil is uploading after the next trip.
            </div>
          ) : (
            <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
              {filteredItems.map((g) => (
                <div
                  key={g.id || g._id || g.image}
                  className="mb-4 break-inside-avoid rounded-xl overflow-hidden group relative"
                >
                  <img
                    src={g.image}
                    alt={g.alt || g.caption || g.title || "Gallery"}
                    className="w-full h-auto image-zoom"
                  />
                  {(g.caption || g.title) && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4 text-sm text-white font-body">
                      {g.caption || g.title}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
