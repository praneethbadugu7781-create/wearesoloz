"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Calendar, Users, Compass } from "lucide-react";
import { cn } from "@/lib/utils";

interface TripItem {
  destination: string;
  slug: string;
  date: string;
  duration: string;
  price: string;
  seats: number;
  image: string;
  description: string;
}

interface TripsClientProps {
  initialTrips: TripItem[];
  initialSearch?: string;
}

const destinationTags = ["All", "Kedarnath", "Badrinath", "Valley of Flowers", "Hampta Pass", "Goa", "Kerala"];

export function TripsClient({ initialTrips, initialSearch = "" }: TripsClientProps) {
  const [search, setSearch] = useState(initialSearch);
  const [selectedTag, setSelectedTag] = useState("All");

  const filteredTrips = initialTrips.filter((trip) => {
    const matchesSearch =
      trip.destination.toLowerCase().includes(search.toLowerCase()) ||
      trip.description.toLowerCase().includes(search.toLowerCase());

    const matchesTag =
      selectedTag === "All" ||
      trip.destination.toLowerCase().includes(selectedTag.toLowerCase()) ||
      trip.description.toLowerCase().includes(selectedTag.toLowerCase());

    return matchesSearch && matchesTag;
  });

  return (
    <div className="space-y-12">
      {/* Search & Tags Filter Bar */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-soloz-ash/60" size={18} />
          <input
            type="text"
            placeholder="Search destination, treks, or beaches..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-12 w-full rounded-full border border-white/10 bg-white/5 pl-12 pr-6 text-sm text-white placeholder-white/40 focus:border-soloz-ember/50 focus:outline-none transition"
          />
        </div>

        {/* Quick Filter Tags */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs uppercase tracking-wider text-soloz-ash/65 mr-2 font-semibold">Quick Tags:</span>
          {destinationTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={cn(
                "rounded-full px-4 py-1.5 text-xs font-bold transition uppercase tracking-wider",
                selectedTag === tag
                  ? "bg-soloz-ember border border-soloz-ember text-white"
                  : "border border-white/10 bg-white/5 text-soloz-ash/60 hover:bg-white/10 hover:text-white"
              )}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Trip Cards */}
      {filteredTrips.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center text-soloz-ash/60">
          <Compass className="mb-4 animate-pulse text-soloz-ember" size={44} />
          <h3 className="text-lg font-bold text-white">No Trips Found</h3>
          <p className="text-sm mt-1">Try refining your search keyword or selected tag.</p>
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTrips.map((trip) => (
            <div key={trip.slug} className="w-dyn-item">
              <Link
                href={`/upcoming-trips/${trip.slug}`}
                className="packages-item-link w-inline-block group"
              >
                <div className="overflow-hidden packages-overflow aspect-[16/11] bg-stone-900 border border-white/10">
                  <img
                    src={trip.image}
                    alt={trip.destination}
                    className="packages-item-image h-full w-full object-cover transition-transform duration-700 group-hover:scale-103"
                  />
                  <div className="booking-open white-color">{trip.duration}</div>
                </div>
                
                <div className="package-item-detaik mt-1">
                  <div className="package-item-top flex justify-between items-center w-full mb-3">
                    <div className="package-item-name font-display text-lg font-bold text-white group-hover:text-soloz-ember transition duration-300">
                      {trip.destination}
                    </div>
                    <div className="package-item-price shrink-0 text-[11px] font-bold text-soloz-amber border border-white/10 bg-white/5 px-3 py-1 rounded-full">
                      {trip.price}
                    </div>
                  </div>
                  
                  <p className="large-paragraph package-short-desp text-soloz-ash/80 text-xs leading-relaxed mb-4 line-clamp-2">
                    {trip.description}
                  </p>
                  
                  {/* Trip details grid */}
                  <div className="grid grid-cols-2 gap-y-3 pt-3 text-xs text-soloz-ash/75 mb-6 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <Calendar size={15} className="text-soloz-ember" />
                      {new Date(trip.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={15} className="text-soloz-ember" />
                      {trip.seats} slots left
                    </div>
                  </div>
                  
                  {/* Button 03 (slide dual text) */}
                  <div className="button-03 white w-full text-center">
                    <div className="button-2-texts mx-auto">
                      <div className="button-text">View Details</div>
                      <div className="button-text-02">View Details</div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
