"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getApiUrl } from "@/lib/api";
import { useLanguage } from "@/lib/LanguageContext";
import { getOptimizedImageUrl } from "@/lib/utils";
import { Users, Camera, BookOpen, MapPin, Calendar, Compass, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface Participant {
  name: string;
  phone?: string;
  email?: string;
}

interface CompletedTrip {
  _id: string;
  destination: string;
  state: string;
  category: string;
  slug: string;
  date: string;
  duration: string;
  price: string;
  seats: number;
  image: string;
  images: string[];
  participants: Participant[];
  memoryImage?: string;
  memoryCoverImage?: string;
  memoriesCount: number;
  photosCount: number;
}

export default function TripMemoriesPage() {
  const { locale, t } = useLanguage();
  const [trips, setTrips] = useState<CompletedTrip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCompletedTrips() {
      try {
        const API_URL = getApiUrl();
        const res = await fetch(`${API_URL}/memories/completed-trips`);
        if (!res.ok) throw new Error("Failed to load completed trips");
        const data = await res.json();
        setTrips(data);
      } catch (err) {
        console.error("Error loading completed trips:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCompletedTrips();
  }, []);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(locale === "te" ? "te-IN" : locale === "hi" ? "hi-IN" : "en-US", {
      month: "short",
      year: "numeric"
    });
  };

  const stagger: any = {
    animate: {
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item: any = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  return (
    <main className="min-h-screen bg-stone-50/50 pt-24 pb-16 px-4 md:px-10">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-[#ea580c] text-[10px] font-bold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5 animate-spin-slow" /> {locale === "te" ? "మన జ్ఞాపకాలు" : locale === "hi" ? "हमारी यादें" : "Our Scrapbook"}
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-light tracking-tighter text-stone-900">
            {locale === "te" ? "ప్రయాణ జ్ఞాపకాలు." : locale === "hi" ? "यात्रा की यादें।" : <>Trip <span className="gradient-text font-semibold">Memories</span></>}
          </h1>
          <p className="text-xs sm:text-sm text-stone-600">
            {locale === "te" ? "మేము కలిసి చేసిన ప్రయాణాల నుండి పంచుకున్న అద్భుతమైన క్షణాలు." : locale === "hi" ? "हमारे द्वारा एक साथ की गई यात्राओं के साझा किए गए अद्भुत क्षण।" : "Relive the sharing, laughs, and adventures from our completed group departures."}
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-stone-400">
            <Loader2 className="w-8 h-8 animate-spin text-[#ea580c]" />
            <p className="text-xs tracking-widest uppercase font-semibold">Loading Memories...</p>
          </div>
        ) : trips.length === 0 ? (
          <div className="text-center py-20 bg-white border border-stone-200/80 rounded-2xl max-w-xl mx-auto shadow-sm p-6 space-y-3">
            <BookOpen className="w-10 h-10 text-stone-300 mx-auto" />
            <h3 className="font-display text-lg font-medium text-stone-850">No memories available yet</h3>
            <p className="text-xs text-stone-500">
              Completed trips will appear here once attendees start posting their scrapbook stories. Check back soon!
            </p>
          </div>
        ) : (
          <motion.div 
            variants={stagger}
            initial="initial"
            animate="animate"
            className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-6 md:gap-8"
          >
            {trips.map((trip) => (
              <motion.div 
                key={trip._id} 
                variants={item}
                className="bg-white rounded-xl sm:rounded-2xl overflow-hidden border border-stone-200/80 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Trip Banner Image */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
                    <img
                      src={getOptimizedImageUrl(trip.memoryImage || trip.image || "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80", 500)}
                      alt={trip.destination}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-white/95 backdrop-blur-sm px-2 py-0.5 sm:px-3 sm:py-1 rounded-full border border-stone-200/50 flex items-center gap-1 text-[8px] sm:text-[10px] uppercase tracking-wider font-bold text-stone-900">
                      <Calendar className="w-3 h-3 text-[#ea580c] shrink-0" /> {formatDate(trip.date)}
                    </div>
                  </div>

                  {/* Card Info */}
                  <div className="p-2.5 sm:p-5 space-y-1.5 sm:space-y-2">
                    <div className="flex items-center gap-1 text-[8px] sm:text-[10px] text-stone-500 uppercase tracking-widest font-bold">
                      <MapPin className="w-3 h-3 text-[#ea580c] shrink-0" /> {trip.state || "India"}
                    </div>
                    <h3 className="font-display text-xs sm:text-base md:text-lg font-medium text-stone-900 truncate leading-tight">
                      {trip.destination}
                    </h3>

                    {/* Stats List */}
                    <div className="grid grid-cols-3 gap-1 pt-1.5 sm:pt-3 border-t border-stone-100 text-center">
                      <div className="space-y-0.5">
                        <div className="text-[10px] sm:text-sm font-bold text-stone-850">{trip.participants?.length || 0}</div>
                        <div className="text-[7.5px] sm:text-[9px] uppercase tracking-wider text-stone-500 font-semibold flex items-center justify-center gap-0.5">
                          <Users className="w-2.5 h-2.5 text-[#ea580c] hidden xs:inline" /> Travelers
                        </div>
                      </div>
                      <div className="space-y-0.5 border-x border-stone-100">
                        <div className="text-[10px] sm:text-sm font-bold text-stone-850">{trip.photosCount}</div>
                        <div className="text-[7.5px] sm:text-[9px] uppercase tracking-wider text-stone-500 font-semibold flex items-center justify-center gap-0.5">
                          <Camera className="w-2.5 h-2.5 text-[#ea580c] hidden xs:inline" /> Photos
                        </div>
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-[10px] sm:text-sm font-bold text-stone-850">{trip.memoriesCount}</div>
                        <div className="text-[7.5px] sm:text-[9px] uppercase tracking-wider text-stone-500 font-semibold flex items-center justify-center gap-0.5">
                          <BookOpen className="w-2.5 h-2.5 text-[#ea580c] hidden xs:inline" /> Memories
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-2.5 sm:p-5 pt-0">
                  <Link 
                    href={`/trip-memories/${trip.slug}`}
                    className="w-full inline-flex items-center justify-center gap-1 py-1.5 sm:py-2.5 rounded-lg bg-stone-900 text-white hover:bg-stone-850 text-[9px] sm:text-xs font-bold uppercase tracking-widest transition-colors duration-200"
                  >
                    {locale === "te" ? "జ్ఞాపకాలు చూడండి" : locale === "hi" ? "यादें देखें" : "View Memories"} 
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

              </motion.div>
            ))}
          </motion.div>
        )}

      </div>
    </main>
  );
}
