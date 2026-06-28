"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Reveal, { SectionLabel } from "@/components/Reveal";
import { TripCard } from "@/components/HomeClient";
import TripsHeroSlider from "@/components/TripsHeroSlider";

interface TripsClientProps {
  initialTrips: any[];
}

const indianStates = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal"
];

const isInternationalTrip = (stateName: string) => {
  if (!stateName) return false;
  return !indianStates.some(s => s.toLowerCase() === stateName.toLowerCase());
};

const domesticStates = [
  { name: "All", image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80" },
  { name: "Telangana", image: "/images/telangana_charminar.jpg" },
  { name: "Andhra Pradesh", image: "/images/andhrapradesh_gandikota.jpg" },
  { name: "Karnataka", image: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80" },
  { name: "Tamil Nadu", image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80" },
  { name: "Kerala", image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80" }
];

const internationalDestinations = [
  { name: "All International", image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80" },
  { name: "Sri Lanka", image: "https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=800&q=80" }
];

const groupTripsByMonth = (tripsList: any[]) => {
  const groups: { [key: string]: any[] } = {};
  
  // Pre-initialize 12 upcoming months starting from July 2026
  const startDate = new Date(2026, 6, 1); // July 2026
  for (let i = 0; i < 12; i++) {
    const d = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
    const label = d.toLocaleString("en-US", { month: "long", year: "numeric" });
    groups[label] = [];
  }

  // Sort published/scheduled trips chronologically ascending and partition them
  tripsList
    .filter((t) => t.status === "published" && t.date)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .forEach((trip) => {
      const tripDate = new Date(trip.date);
      if (!isNaN(tripDate.getTime())) {
        const label = tripDate.toLocaleString("en-US", { month: "long", year: "numeric" });
        if (!groups[label]) groups[label] = []; // Fallback for outside the 12 month range
        groups[label].push(trip);
      }
    });

  return groups;
};

export default function TripsClient({ initialTrips = [] }: TripsClientProps) {
  const [q, setQ] = useState("");
  const [regionType, setRegionType] = useState<"domestic" | "international">("domestic");
  const [selectedState, setSelectedState] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [subView, setSubView] = useState<"all" | "months">("all");

  const categoriesList = ["All", "Temples", "Treks", "Adventure"];

  // Sort trips chronologically by date to guarantee next month's trips show first
  const sortedTrips = [...initialTrips].sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  const countTrips = (stateName: string) => {
    if (stateName === "All") {
      return sortedTrips.filter(t => !isInternationalTrip(t.state)).length;
    }
    if (stateName === "All International") {
      return sortedTrips.filter(t => isInternationalTrip(t.state)).length;
    }
    return sortedTrips.filter(t => (t.state || "").toLowerCase() === stateName.toLowerCase()).length;
  };

  const countCategoryTrips = (categoryName: string) => {
    return sortedTrips.filter(t => {
      const isDomestic = !isInternationalTrip(t.state);
      if (regionType === "domestic" && !isDomestic) return false;
      if (regionType === "international" && isDomestic) return false;

      const matchesState = regionType === "domestic"
        ? (selectedState === "All" || (t.state || "").toLowerCase() === selectedState.toLowerCase())
        : (selectedState === "All International" || (t.state || "").toLowerCase() === selectedState.toLowerCase());

      const matchesCategory = categoryName === "All" || (t.category || "Adventure").toLowerCase() === categoryName.toLowerCase();
      return matchesState && matchesCategory;
    }).length;
  };

  const filteredTrips = sortedTrips.filter((t) => {
    const searchStr = `${t.destination || ""} ${t.title || ""} ${t.state || ""} ${t.category || ""}`.toLowerCase();
    const matchesQuery = searchStr.includes(q.toLowerCase());
    
    const matchesCategory = selectedCategory === "All" || (t.category || "Adventure").toLowerCase() === selectedCategory.toLowerCase();
    
    if (regionType === "domestic") {
      const isDomestic = !isInternationalTrip(t.state);
      if (!isDomestic) return false;
      const matchesState = selectedState === "All" || (t.state || "").toLowerCase() === selectedState.toLowerCase();
      return matchesQuery && matchesState && matchesCategory;
    } else {
      const isInternational = isInternationalTrip(t.state);
      if (!isInternational) return false;
      const matchesState = selectedState === "All International" || (t.state || "").toLowerCase() === selectedState.toLowerCase();
      return matchesQuery && matchesState && matchesCategory;
    }
  });

  return (
    <div data-testid="trips-page" className="bg-white min-h-screen text-[#1c1917]">
      {/* 🏠 Animated Hero Slider - Timed Cards Opening */}
      <TripsHeroSlider trips={sortedTrips.filter(t => t.status === "published").length > 0 ? sortedTrips.filter(t => t.status === "published") : sortedTrips} />

      {/* View Toggle (All Packages vs Month-wise Schedule) */}
      <section className="pt-12 px-6 md:px-10 bg-stone-50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200/65 pb-6">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#ea580c] block">Expedition Directory</span>
            <h2 className="font-display text-2xl sm:text-3xl font-light text-stone-900 mt-1">
              Browse our <span className="gradient-text font-medium">journeys</span>
            </h2>
          </div>
          <div className="flex bg-stone-200/60 p-1 rounded-full self-start sm:self-center border border-stone-300/30">
            <button
              onClick={() => setSubView("all")}
              className={`px-5 py-2 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                subView === "all"
                  ? "bg-stone-950 text-white shadow-md"
                  : "text-stone-600 hover:text-stone-950"
              }`}
            >
              All Packages
            </button>
            <button
              onClick={() => setSubView("months")}
              className={`px-5 py-2 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                subView === "months"
                  ? "bg-stone-950 text-white shadow-md"
                  : "text-stone-600 hover:text-stone-950"
              }`}
            >
              Month-wise Schedule
            </button>
          </div>
        </div>
      </section>

      {subView === "all" ? (
        <>
          {/* State/Region Selector Categories */}
          <section className="py-12 px-6 md:px-10 bg-stone-50 border-b border-stone-100">
            <div className="max-w-7xl mx-auto">
              {/* Region Type Switcher */}
              <Reveal>
                <div className="flex bg-stone-200/60 p-1 rounded-full w-full max-w-[280px] sm:max-w-xs mb-8 border border-stone-300/30">
                  <button
                    onClick={() => {
                      setRegionType("domestic");
                      setSelectedState("All");
                      setSelectedCategory("All");
                    }}
                    className={`flex-1 py-2 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                      regionType === "domestic"
                        ? "bg-stone-950 text-white shadow-md"
                        : "text-stone-600 hover:text-stone-950"
                    }`}
                  >
                    State-wise (India)
                  </button>
                  <button
                    onClick={() => {
                      setRegionType("international");
                      setSelectedState("All International");
                      setSelectedCategory("All");
                    }}
                    className={`flex-1 py-2 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                      regionType === "international"
                        ? "bg-stone-950 text-white shadow-md"
                        : "text-stone-600 hover:text-stone-950"
                    }`}
                  >
                    International
                  </button>
                </div>
              </Reveal>

              <Reveal>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                  <div>
                    <SectionLabel>Browse by Region</SectionLabel>
                    <h2 className="font-display text-2xl md:text-3xl font-light text-stone-900 mt-2">
                      {regionType === "domestic" ? (
                        <>Select a State to <span className="gradient-text font-medium">filter trips</span></>
                      ) : (
                        <>Select a Country to <span className="gradient-text font-medium">filter trips</span></>
                      )}
                    </h2>
                  </div>
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative w-full md:w-80">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                      <Input
                        type="text"
                        placeholder="Search trips, states..."
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full bg-white border border-stone-200 focus-visible:border-[#ea580c] rounded-full text-sm placeholder:text-stone-400 focus-visible:ring-1 focus-visible:ring-[#ea580c]/20"
                      />
                    </div>
                    {((regionType === "domestic" ? selectedState !== "All" : selectedState !== "All International") || selectedCategory !== "All" || q !== "") && (
                      <button
                        onClick={() => {
                          setSelectedState(regionType === "domestic" ? "All" : "All International");
                          setSelectedCategory("All");
                          setQ("");
                        }}
                        className="text-xs font-semibold text-[#ea580c] hover:underline transition-colors whitespace-nowrap"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                </div>
              </Reveal>

              {/* Grid of state cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
                {(regionType === "domestic" ? domesticStates : internationalDestinations).map((state) => {
                  const count = countTrips(state.name);
                  const isActive = selectedState.toLowerCase() === state.name.toLowerCase();
                  return (
                    <Reveal key={state.name}>
                      <button
                        onClick={() => {
                          setSelectedState(state.name);
                          setSelectedCategory("All");
                        }}
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
                            {state.name === "All" ? "All Regions" : state.name === "All International" ? "All International" : state.name}
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
              {/* Category Tabs */}
              <div className="flex flex-wrap items-center justify-between border-b border-stone-100 pb-8 mb-12 gap-4">
                <div>
                  <h3 className="font-display text-xl md:text-2xl font-light text-stone-900">
                    Filter by <span className="gradient-text font-medium">Experience</span>
                  </h3>
                  <p className="text-xs text-stone-400 mt-1">
                    Showing {filteredTrips.length} {filteredTrips.length === 1 ? "trip" : "trips"} for {
                      selectedState === "All" ? "all regions" : selectedState === "All International" ? "all international" : selectedState
                    }
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {categoriesList.map((cat) => {
                    const isActive = selectedCategory.toLowerCase() === cat.toLowerCase();
                    const count = countCategoryTrips(cat);
                    return (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide border transition-all duration-300 flex items-center gap-2 ${
                          isActive
                            ? "bg-stone-900 text-white border-stone-900 shadow-md shadow-stone-900/10 scale-105"
                            : "bg-white text-stone-600 border-stone-200 hover:border-stone-400 hover:text-stone-900"
                        }`}
                      >
                        <span>{cat}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                          isActive ? "bg-white/20 text-white" : "bg-stone-100 text-stone-500"
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {filteredTrips.length === 0 ? (
                <div className="text-center glass rounded-3xl py-20 text-stone-500 border border-stone-200">
                  No trips published yet for this selection. Visit the community to be notified first.
                </div>
              ) : selectedState !== "All" && selectedCategory === "All" ? (
                /* ── Grouped by Category within a State ── */
                <div className="space-y-16">
                  {(["Temples", "Treks", "Adventure"] as const).map((cat) => {
                    const catIcon = cat === "Temples" ? "🛕" : cat === "Treks" ? "🏔️" : "🌊";
                    const catTrips = filteredTrips.filter(
                      (t) => (t.category || "Adventure").toLowerCase() === cat.toLowerCase()
                    );
                    if (catTrips.length === 0) return null;
                    return (
                      <div key={cat}>
                        {/* Category Section Header */}
                        <div className="flex items-center gap-3 mb-6">
                          <span className="text-2xl">{catIcon}</span>
                          <div>
                            <h3 className="font-display text-xl md:text-2xl font-semibold text-stone-900">
                              {cat}
                            </h3>
                            <p className="text-xs text-stone-400 mt-0.5">
                              {catTrips.length} {catTrips.length === 1 ? "trip" : "trips"} in {selectedState}
                            </p>
                          </div>
                          <div className="flex-1 h-px bg-gradient-to-r from-stone-200 to-transparent ml-4" />
                        </div>
                        {/* Category Trip Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 md:gap-8">
                          {catTrips.map((t) => (
                            <TripCard key={t.id || t._id} trip={t} />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 md:gap-8">
                  {filteredTrips.map((t) => (
                    <TripCard key={t.id || t._id} trip={t} />
                  ))}
                </div>
              )}
            </div>
          </section>
        </>
      ) : (
        /* Month-wise Schedule */
        <section className="py-16 px-6 md:px-10">
          <div className="max-w-7xl mx-auto space-y-16">
            {Object.entries(groupTripsByMonth(sortedTrips)).map(([month, monthTrips]) => (
              <Reveal key={month}>
                <div className="space-y-6">
                  {/* Month header */}
                  <div className="flex items-center gap-4">
                    <h3 className="font-display text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
                      {month}
                    </h3>
                    <span className="text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full bg-orange-100 text-[#ea580c] font-bold uppercase tracking-wider">
                      {monthTrips.length} {monthTrips.length === 1 ? "trip" : "trips"}
                    </span>
                    <div className="flex-1 h-px bg-gradient-to-r from-stone-200 to-transparent" />
                  </div>

                  {/* Grid of trips for this month */}
                  {monthTrips.length > 0 ? (
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 md:gap-8">
                      {monthTrips.map((t) => (
                        <TripCard key={t.id || t._id} trip={t} showDate={true} />
                      ))}
                    </div>
                  ) : (
                    <div className="border border-dashed border-stone-200 rounded-2xl p-8 text-center text-stone-400 text-xs sm:text-sm bg-stone-50/50">
                      No trips scheduled for {month.split(" ")[0]} yet. Akhil is finalizing new trails!
                    </div>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
