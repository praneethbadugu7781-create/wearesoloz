"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Reveal, { SectionLabel } from "@/components/Reveal";
import { TripCard } from "@/components/HomeClient";

interface TripsClientProps {
  initialTrips: any[];
}

const stateCategories = [
  { name: "All", image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80" },
  { name: "Telangana", image: "https://images.unsplash.com/photo-1626139575290-4b1ded4a8a24?auto=format&fit=crop&w=800&q=80" },
  { name: "Andhra Pradesh", image: "https://images.unsplash.com/photo-1616038242814-a6eac7845d88?auto=format&fit=crop&w=800&q=80" },
  { name: "Karnataka", image: "https://images.unsplash.com/photo-1600100397608-f010e45fa674?auto=format&fit=crop&w=800&q=80" },
  { name: "Tamil Nadu", image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80" },
  { name: "Kerala", image: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=800&q=80" }
];

export default function TripsClient({ initialTrips = [] }: TripsClientProps) {
  const [q, setQ] = useState("");
  const [selectedState, setSelectedState] = useState("All");

  const countTrips = (stateName: string) => {
    if (stateName === "All") return initialTrips.length;
    return initialTrips.filter(t => (t.state || "Andhra Pradesh").toLowerCase() === stateName.toLowerCase()).length;
  };

  const filteredTrips = initialTrips.filter((t) => {
    const searchStr = `${t.destination || ""} ${t.title || ""} ${t.state || ""}`.toLowerCase();
    const matchesQuery = searchStr.includes(q.toLowerCase());
    const matchesState = selectedState === "All" || (t.state || "Andhra Pradesh").toLowerCase() === selectedState.toLowerCase();
    return matchesQuery && matchesState;
  });

  return (
    <div data-testid="trips-page" className="bg-white min-h-screen text-[#1c1917] pt-20">
      {/* Header Banner */}
      <section className="relative pt-40 pb-20 px-6 md:px-10 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=2400&q=85"
            alt=""
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/15 to-white" />
        </div>
        <div className="relative max-w-7xl mx-auto text-center">
          <SectionLabel>Upcoming Group Trips</SectionLabel>
          <h1 className="font-display text-5xl md:text-7xl font-light tracking-tighter mt-5 text-white">
            Find your <span className="gradient-text font-medium">next escape</span>.
          </h1>
          <div className="max-w-xl mx-auto mt-10 relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <Input
              data-testid="trips-search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by destination or trip name…"
              className="glass border-stone-200 bg-white/90 h-14 pl-12 rounded-full text-stone-900 placeholder:text-stone-400 focus-visible:ring-soloz-primary"
            />
          </div>
        </div>
      </section>

      {/* State/Region Selector Categories */}
      <section className="py-12 px-6 md:px-10 bg-stone-50 border-b border-stone-100">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="flex items-center justify-between mb-8">
              <div>
                <SectionLabel>Browse by Region</SectionLabel>
                <h2 className="font-display text-2xl md:text-3xl font-light text-stone-900 mt-2">
                  Select a State to <span className="gradient-text font-medium">filter trips</span>
                </h2>
              </div>
              {selectedState !== "All" && (
                <button
                  onClick={() => setSelectedState("All")}
                  className="text-xs font-semibold text-[#ea580c] hover:underline transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </Reveal>

          {/* Grid of state cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {stateCategories.map((state) => {
              const count = countTrips(state.name);
              const isActive = selectedState.toLowerCase() === state.name.toLowerCase();
              return (
                <Reveal key={state.name}>
                  <button
                    onClick={() => setSelectedState(state.name)}
                    className={`relative w-full aspect-[4/3] rounded-2xl overflow-hidden border group transition-all duration-300 ${
                      isActive
                        ? "border-[#ea580c] ring-2 ring-orange-500/20 scale-[1.02]"
                        : "border-stone-100 hover:border-orange-200 hover:scale-[1.01]"
                    }`}
                  >
                    {/* Background Image */}
                    <img
                      src={state.image}
                      alt={state.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {/* Overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-t transition-opacity duration-300 ${
                      isActive ? "from-orange-950/90 via-black/40 to-transparent" : "from-black/85 via-black/35 to-transparent group-hover:via-black/25"
                    }`} />
                    
                    {/* Content */}
                    <div className="absolute inset-0 p-4 flex flex-col justify-end items-start text-left">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-orange-200/90 mb-0.5">
                        {count} {count === 1 ? "trip" : "trips"}
                      </span>
                      <h3 className="font-display text-sm md:text-base font-semibold text-white leading-tight">
                        {state.name === "All" ? "All Regions" : state.name}
                      </h3>
                    </div>
                  </button>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trips Grid */}
      <section className="py-20 px-6 md:px-10">
        <div className="max-w-7xl mx-auto">
          {filteredTrips.length === 0 ? (
            <div className="text-center glass rounded-3xl py-20 text-stone-500 border border-stone-200">
              No trips published yet for this selection. Visit the community to be notified first.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {filteredTrips.map((t) => (
                <TripCard key={t.id || t._id} trip={t} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
