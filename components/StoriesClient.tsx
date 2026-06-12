"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Reveal, { SectionLabel } from "@/components/Reveal";
import { StoryCard } from "@/components/HomeClient";

interface StoriesClientProps {
  initialStories: any[];
}

const CATS = ["All", "Treks", "Spiritual", "Road Trips", "Solo Lessons"];

export default function StoriesClient({ initialStories = [] }: StoriesClientProps) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");

  const filteredStories = initialStories.filter((s) => {
    const searchStr = `${s.title || ""} ${s.excerpt || ""} ${s.content || ""}`.toLowerCase();
    const matchesSearch = searchStr.includes(q.toLowerCase());
    
    // Category mapping check
    const matchesCategory =
      cat === "All" || (s.category && s.category.toLowerCase() === cat.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  return (
    <div data-testid="stories-page" className="bg-white min-h-screen text-[#1c1917]">
      <section className="relative pt-40 pb-16 px-6 md:px-10 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1530789253388-582c481c54b0?auto=format&fit=crop&w=2400&q=85"
            alt=""
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/15 to-white" />
        </div>
        <div className="relative max-w-7xl mx-auto text-center">
          <SectionLabel>Travel Stories</SectionLabel>
          <h1 className="font-display text-5xl md:text-7xl font-light tracking-tighter mt-5 text-white">
            From the <span className="gradient-text font-medium">road</span>.
          </h1>
          <div className="max-w-xl mx-auto mt-10 relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <Input
              data-testid="stories-search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search stories…"
              className="glass border-stone-200 bg-white/90 h-14 pl-12 rounded-full text-stone-900 placeholder:text-stone-400 focus-visible:ring-soloz-primary"
            />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            {CATS.map((c) => (
              <button
                key={c}
                data-testid={`story-cat-${c.toLowerCase().replace(/\s+/g, "-")}`}
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
        </div>
      </section>

      <section className="pb-32 px-6 md:px-10">
        <div className="max-w-7xl mx-auto">
          {filteredStories.length === 0 ? (
            <div className="text-center glass rounded-3xl py-20 text-soloz-textSecondary border border-stone-200">
              No stories yet. Akhil&apos;s pen is busy on the next one.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredStories.map((s) => (
                <StoryCard key={s.id || s._id || s.slug} story={s} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
