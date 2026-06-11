"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Clock, ArrowRight, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BlogItem {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  image: string;
  readTime: string;
  createdAt?: string;
}

interface StoriesClientProps {
  initialStories: BlogItem[];
}

const categories = ["All", "Spiritual Travel", "Hidden Destinations", "Treks", "Community"];

export function StoriesClient({ initialStories }: StoriesClientProps) {
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("All");

  const filtered = initialStories.filter((story) => {
    const matchesSearch =
      story.title.toLowerCase().includes(search.toLowerCase()) ||
      story.excerpt.toLowerCase().includes(search.toLowerCase());

    const matchesCat =
      selectedCat === "All" ||
      story.category.toLowerCase() === selectedCat.toLowerCase();

    return matchesSearch && matchesCat;
  });

  // Highlight first featured article if any
  const featured = filtered[0];
  const regularStories = filtered.slice(1);

  return (
    <div className="space-y-12">
      {/* Search and Category Filter */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-soloz-ash/60" size={18} />
          <input
            type="text"
            placeholder="Search stories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 w-full rounded-full border border-white/10 bg-white/5 pl-12 pr-6 text-sm text-white placeholder-white/40 focus:border-soloz-ember/50 focus:outline-none transition"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 items-center">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
                selectedCat === cat
                  ? "bg-soloz-ember text-white shadow-glow"
                  : "border border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Listing Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center text-soloz-ash/60">
          <Compass className="mb-4 animate-pulse text-soloz-ember" size={44} />
          <h3 className="text-lg font-bold text-white">No Stories Found</h3>
          <p className="text-sm mt-1">Try another category or search query.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Featured Hero Article */}
          {!search && selectedCat === "All" && featured && (
            <Link
              href={`/travel-stories/${featured.slug}`}
              className="group grid gap-8 md:grid-cols-2 rounded-3xl border border-white/10 bg-[#14110d] overflow-hidden shadow-2xl hover:border-soloz-ember/25 transition duration-300"
            >
              <div className="relative aspect-video md:aspect-auto w-full overflow-hidden">
                <img
                  src={featured.image}
                  alt={featured.title}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-102"
                />
                <div className="absolute left-6 top-6 rounded-full bg-black/60 px-4 py-1 text-xs font-bold uppercase tracking-wider text-white backdrop-blur">
                  Featured Story
                </div>
              </div>
              <div className="flex flex-col justify-center p-8 md:p-12 space-y-6">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-soloz-ember">
                  {featured.category}
                </span>
                <h2 className="font-display text-3xl font-extrabold sm:text-4xl text-white leading-tight group-hover:text-soloz-ember transition">
                  {featured.title}
                </h2>
                <p className="text-sm leading-relaxed text-soloz-ash/90">
                  {featured.excerpt}
                </p>
                <div className="flex items-center justify-between text-xs text-soloz-ash/60 pt-4 border-t border-white/5">
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} />
                    {featured.readTime || "5 min read"}
                  </span>
                  <span className="font-bold text-soloz-amber flex items-center gap-1 group-hover:underline">
                    Read Full Story <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            </Link>
          )}

          {/* Grid of Regular Articles */}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {(!search && selectedCat === "All" ? regularStories : filtered).map((story) => (
              <Link
                key={story.slug}
                href={`/travel-stories/${story.slug}`}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#14110d] hover:border-soloz-ember/30 transition shadow-xl"
              >
                <div>
                  <div className="relative aspect-[16/10] w-full overflow-hidden">
                    <img
                      src={story.image}
                      alt={story.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute right-4 top-4 rounded-full bg-black/60 px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur">
                      {story.category}
                    </div>
                  </div>
                  <div className="p-6 space-y-3">
                    <h3 className="font-display text-xl font-bold text-white leading-snug line-clamp-2 group-hover:text-soloz-ember transition">
                      {story.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-soloz-ash/80 line-clamp-2">
                      {story.excerpt}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-white/5 mt-4 flex items-center justify-between text-xs text-soloz-ash/60">
                  <span className="flex items-center gap-1">
                    <Clock size={13} />
                    {story.readTime || "5 min read"}
                  </span>
                  <span className="font-bold text-soloz-amber group-hover:underline flex items-center gap-0.5">
                    Read Story <ArrowRight size={13} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
