"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Reveal, { SectionLabel } from "@/components/Reveal";
import { TripCard } from "@/components/HomeClient";

interface TripsClientProps {
  initialTrips: any[];
}

export default function TripsClient({ initialTrips = [] }: TripsClientProps) {
  const [q, setQ] = useState("");

  const filteredTrips = initialTrips.filter((t) => {
    const searchStr = `${t.destination || ""} ${t.title || ""}`.toLowerCase();
    return searchStr.includes(q.toLowerCase());
  });

  return (
    <div data-testid="trips-page" className="bg-white min-h-screen text-[#1c1917] pt-20">
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

      <section className="pb-32 px-6 md:px-10">
        <div className="max-w-7xl mx-auto">
          {filteredTrips.length === 0 ? (
            <div className="text-center glass rounded-3xl py-20 text-soloz-textSecondary border border-stone-200">
              No trips published yet. Visit the community to be notified first.
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
