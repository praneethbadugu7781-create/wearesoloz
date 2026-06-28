"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Reveal, { SectionLabel } from "@/components/Reveal";
import { TripCard } from "@/components/HomeClient";
import TripsHeroSlider from "@/components/TripsHeroSlider";
import { useLanguage } from "@/lib/LanguageContext";

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
  const { t, locale } = useLanguage();
  
  const translateMonthToTelugu = (monthStr: string) => {
    const [m, y] = monthStr.split(" ");
    const months: Record<string, string> = {
      January: "జనవరి", February: "ఫిబ్రవరి", March: "మార్చి", April: "ఏప్రిల్",
      May: "మే", June: "జూన్", July: "జూలై", August: "ఆగస్టు",
      September: "సెప్టెంబరు", October: "అక్టోబరు", November: "నవంబరు", December: "డిసెంబరు"
    };
    return `${months[m] || m} ${y || ""}`;
  };

  const translateMonthToHindi = (monthStr: string) => {
    const [m, y] = monthStr.split(" ");
    const months: Record<string, string> = {
      January: "जनवरी", February: "फरवरी", March: "मार्च", April: "अप्रैल",
      May: "मई", June: "जून", July: "जुलाई", August: "अगस्त",
      September: "सितंबर", October: "अक्टूबर", November: "नवंबर", December: "दिसंबर"
    };
    return `${months[m] || m} ${y || ""}`;
  };

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
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#ea580c] block">{locale === "te" ? "ట్రిప్స్ జాబితా" : locale === "hi" ? "यात्रा निर्देशिका" : "Expedition Directory"}</span>
            <h2 className="font-display text-2xl sm:text-3xl font-light text-stone-900 mt-1">
              {locale === "te" ? <>మా ప్రయాణాలను <span className="gradient-text font-medium">అన్వేషించండి</span></> : locale === "hi" ? <>हमारी यात्राओं को <span className="gradient-text font-medium">ब्राउज़ करें</span></> : <>Browse our <span className="gradient-text font-medium">journeys</span></>}
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
              {locale === "te" ? "అన్ని ప్యాకేజీలు" : locale === "hi" ? "सभी पैकेज" : "All Packages"}
            </button>
            <button
              onClick={() => setSubView("months")}
              className={`px-5 py-2 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                subView === "months"
                  ? "bg-stone-950 text-white shadow-md"
                  : "text-stone-600 hover:text-stone-950"
              }`}
            >
              {locale === "te" ? "నెలవారీ షెడ్యూల్" : locale === "hi" ? "मासिक समय-सारणी" : "Month-wise Schedule"}
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
                    {locale === "te" ? "రాష్ట్రాల వారీగా" : locale === "hi" ? "राज्य-वार (भारत)" : "State-wise (India)"}
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
                    {locale === "te" ? "అంతర్జాతీయం" : locale === "hi" ? "अंतर्राष्ट्रीय" : "International"}
                  </button>
                </div>
              </Reveal>

              <Reveal>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                  <div>
                    <SectionLabel>{locale === "te" ? "ప్రాంతం ద్వారా వెతకండి" : locale === "hi" ? "क्षेत्र के अनुसार खोजें" : "Browse by Region"}</SectionLabel>
                    <h2 className="font-display text-2xl md:text-3xl font-light text-stone-900 mt-2">
                      {regionType === "domestic" ? (
                        locale === "te" ? <>ట్రిప్స్‌ను ఫిల్టర్ చేయడానికి <span className="gradient-text font-medium">రాష్ట్రాన్ని ఎంచుకోండి</span></> : locale === "hi" ? <>यात्राओं को फ़िल्टर करने के लिए <span className="gradient-text font-medium">एक राज्य चुनें</span></> : <>Select a State to <span className="gradient-text font-medium">filter trips</span></>
                      ) : (
                        locale === "te" ? <>ట్రిప్స్‌ను ఫిల్టర్ చేయడానికి <span className="gradient-text font-medium">దేశాన్ని ఎంచుకోండి</span></> : locale === "hi" ? <>यात्राओं को फ़िल्टर करने के लिए <span className="gradient-text font-medium">एक देश चुनें</span></> : <>Select a Country to <span className="gradient-text font-medium">filter trips</span></>
                      )}
                    </h2>
                  </div>
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative w-full md:w-80">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                      <Input
                        type="text"
                        placeholder={locale === "te" ? "ట్రిప్స్, రాష్ట్రాలను వెతకండి..." : locale === "hi" ? "यात्राएं, राज्य खोजें..." : "Search trips, states..."}
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
                        {locale === "te" ? "అన్నీ క్లియర్ చేయండి" : locale === "hi" ? "सभी साफ करें" : "Clear All"}
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
                            {count} {locale === "te" ? "ట్రిప్స్" : locale === "hi" ? "यात्राएं" : (count === 1 ? "trip" : "trips")}
                          </span>
                          <h3 className="font-display text-sm md:text-base font-semibold text-white leading-tight">
                            {state.name === "All" ? (locale === "te" ? "అన్ని ప్రాంతాలు" : locale === "hi" ? "सभी क्षेत्र" : "All Regions") : state.name === "All International" ? (locale === "te" ? "అన్ని అంతర్జాతీయ" : locale === "hi" ? "सभी अंतर्राष्ट्रीय" : "All International") : state.name}
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
                    {locale === "te" ? <>అనుభవం ద్వారా <span className="gradient-text font-medium">ఫిల్టర్ చేయండి</span></> : locale === "hi" ? <>अनुभव द्वारा <span className="gradient-text font-medium">फ़िल्टर करें</span></> : <>Filter by <span className="gradient-text font-medium">Experience</span></>}
                  </h3>
                  <p className="text-xs text-stone-400 mt-1">
                    {locale === "te" ? (
                      <>మొత్తం {filteredTrips.length} ట్రిప్స్ ఉన్నాయి - {selectedState === "All" ? "అన్ని ప్రాంతాలు" : selectedState === "All International" ? "అన్ని అంతర్జాతీయ ప్రాంతాలు" : selectedState}</>
                    ) : locale === "hi" ? (
                      <>कुल {filteredTrips.length} यात्राएं दिखा रहा है - {selectedState === "All" ? "सभी क्षेत्र" : selectedState === "All International" ? "सभी अंतर्राष्ट्रीय क्षेत्र" : selectedState}</>
                    ) : (
                      <>Showing {filteredTrips.length} {filteredTrips.length === 1 ? "trip" : "trips"} for {selectedState === "All" ? "all regions" : selectedState === "All International" ? "all international" : selectedState}</>
                    )}
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {categoriesList.map((cat) => {
                    const isActive = selectedCategory.toLowerCase() === cat.toLowerCase();
                    const count = countCategoryTrips(cat);
                    const label = cat === "All" ? (locale === "te" ? "అన్నీ" : locale === "hi" ? "सभी" : "All") : 
                                  cat === "Temples" ? (locale === "te" ? "ఆధ్యాత్మికం" : locale === "hi" ? "मंदिर" : "Temples") :
                                  cat === "Treks" ? (locale === "te" ? "ట్రెక్స్" : locale === "hi" ? "ट्रेक" : "Treks") :
                                  cat === "Adventure" ? (locale === "te" ? "సాహసం" : locale === "hi" ? "रोमांच" : "Adventure") : cat;
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
                        <span>{label}</span>
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
                  {locale === "te" ? "ఈ ఎంపికకు ఇంకా ఎలాంటి ట్రిప్స్ ప్రచురించబడలేదు. మొదటగా నోటిఫికేషన్ పొందడానికి కమ్యూనిటీని సందర్శించండి." : locale === "hi" ? "इस चयन के लिए अभी तक कोई यात्रा प्रकाशित नहीं हुई है। सबसे पहले सूचित होने के लिए कम्युनिटी पर जाएं।" : "No trips published yet for this selection. Visit the community to be notified first."}
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
                              {cat === "Temples" ? (locale === "te" ? "దేవాలయాలు / ఆధ్యాత్మికం" : locale === "hi" ? "मंदिर" : "Temples") :
                               cat === "Treks" ? (locale === "te" ? "పర్వతారోహణ / ట్రెక్స్" : locale === "hi" ? "ट्रेक" : "Treks") :
                               (locale === "te" ? "సాహసాలు" : locale === "hi" ? "रोमांच" : "Adventure")
                              }
                            </h3>
                            <p className="text-xs text-stone-400 mt-0.5">
                              {catTrips.length} {locale === "te" ? "ట్రిప్స్" : locale === "hi" ? "यात्राएं" : (catTrips.length === 1 ? "trip" : "trips")} in {selectedState}
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
                      {locale === "te" ? translateMonthToTelugu(month) : locale === "hi" ? translateMonthToHindi(month) : month}
                    </h3>
                    <span className="text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full bg-orange-100 text-[#ea580c] font-bold uppercase tracking-wider">
                      {monthTrips.length} {locale === "te" ? "ట్రిప్స్" : locale === "hi" ? "यात्राएं" : (monthTrips.length === 1 ? "trip" : "trips")}
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
                      {locale === "te" ? (
                        <>{translateMonthToTelugu(month).split(" ")[0]} నెలకు ఇంకా ఎలాంటి ట్రిప్స్ షెడ్యూల్ చేయలేదు. అఖిల్ కొత్త మార్గాలను సిద్ధం చేస్తున్నారు!</>
                      ) : locale === "hi" ? (
                        <>{translateMonthToHindi(month).split(" ")[0]} के लिए अभी तक कोई यात्रा निर्धारित नहीं है। अखिल नए ट्रेल्स को अंतिम रूप दे रहे हैं!</>
                      ) : (
                        <>No trips scheduled for {month.split(" ")[0]} yet. Akhil is finalizing new trails!</>
                      )}
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
