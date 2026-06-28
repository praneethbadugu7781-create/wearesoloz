"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { ArrowLeft, ArrowRight, Calendar, Clock, Users } from "lucide-react";
import Link from "next/link";
import { getOptimizedImageUrl } from "@/lib/utils";

interface Trip {
  id?: string;
  _id?: string;
  destination: string;
  state: string;
  category: string;
  date: string;
  duration: string;
  price: string;
  seats: number;
  image: string;
  slug?: string;
}

interface TripsHeroSliderProps {
  trips: Trip[];
}

export default function TripsHeroSlider({ trips }: TripsHeroSliderProps) {
  // Use first 6 trips as featured slides
  const featuredTrips = trips.slice(0, 6);
  const [order, setOrder] = useState<number[]>([]);

  // Initialize order when trips are loaded
  useEffect(() => {
    if (featuredTrips.length > 0) {
      setOrder(Array.from({ length: featuredTrips.length }, (_, i) => i));
    }
  }, [trips]);

  if (order.length === 0 || featuredTrips.length === 0) {
    return (
      <div className="h-screen bg-stone-950 flex items-center justify-center text-white font-display uppercase tracking-widest text-sm">
        Loading Featured Trips...
      </div>
    );
  }

  const activeIndex = order[0];
  const activeTrip = featuredTrips[activeIndex];

  const handleNext = () => {
    setOrder((prev) => [...prev.slice(1), prev[0]]);
  };

  const handlePrev = () => {
    setOrder((prev) => [prev[prev.length - 1], ...prev.slice(0, prev.length - 1)]);
  };

  const handleCardClick = (targetIndex: number) => {
    const idx = order.indexOf(targetIndex);
    if (idx > 0) {
      setOrder((prev) => {
        const next = [...prev];
        for (let i = 0; i < idx; i++) {
          next.push(next.shift()!);
        }
        return next;
      });
    }
  };

  const tripSlug = activeTrip.slug || activeTrip.destination?.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  // Helper to split destination into clean lines based on structure
  const getTitleLines = (dest: string) => {
    if (dest.includes(" - ")) {
      return dest.split(" - ").map(s => s.trim().toUpperCase());
    }
    if (dest.toLowerCase().includes(" to ")) {
      const parts = dest.split(/ to /i);
      return [parts[0].trim().toUpperCase(), `TO ${parts.slice(1).join(" TO ").trim().toUpperCase()}`];
    }
    if (dest.includes(" & ")) {
      const parts = dest.split(" & ");
      return [parts[0].trim().toUpperCase(), `& ${parts.slice(1).join(" & ").trim().toUpperCase()}`];
    }
    const wordsList = dest.split(" ");
    if (wordsList.length > 1) {
      return [wordsList[0].toUpperCase(), wordsList.slice(1).join(" ").toUpperCase()];
    }
    return [dest.toUpperCase()];
  };

  // Animation variants for text reveal crop transition
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.3 }
    }
  };

  const textRevealVariants: any = {
    hidden: { y: "100%", opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: [0.25, 1, 0.5, 1] }
    },
    exit: {
      y: "-100%",
      opacity: 0,
      transition: { duration: 0.4, ease: "easeInOut" }
    }
  };

  return (
    <LayoutGroup id="hero-slider">
      <section className="relative h-screen w-full bg-stone-950 overflow-hidden select-none">
        
        {/* 1. White entrance reveal cover */}
        <motion.div
          initial={{ x: 0 }}
          animate={{ x: "100%" }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.25, 1, 0.5, 1] as const }}
          className="absolute inset-0 bg-white z-[100] pointer-events-none"
        />

        {/* 2. Top Progress Timer Indicator */}
        <div className="fixed top-0 left-0 right-0 h-1 bg-black/10 z-[9999] pointer-events-none">
          <motion.div
            key={activeIndex} // resets the animation on active slide change
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 4, ease: "linear" }}
            style={{ originX: 0 }}
            className="h-full bg-[#ea580c]"
            onAnimationComplete={handleNext}
          />
        </div>

        {/* 3a. Active Background Slide with shared LayoutId (Desktop - xl screens) */}
        <div className="absolute inset-0 z-0 hidden xl:block">
          <motion.div
            key={`desktop-${activeTrip.id || activeTrip._id}`}
            layoutId={`card-${activeTrip.id || activeTrip._id}`}
            className="absolute inset-0 w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${getOptimizedImageUrl(activeTrip.image, 1200)})` }}
            transition={{ type: "spring", stiffness: 120, damping: 22 }}
          >
            {/* Dual gradient overlays for perfect text readability and contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/70 to-black/25" />
            <div className="absolute inset-0 bg-gradient-to-r from-stone-950/85 via-stone-950/30 to-transparent" />
          </motion.div>
        </div>

        {/* 3b. Active Background Slide with Cross-fade Zoom transition (Mobile/Tablet - xl hidden) */}
        <div className="absolute inset-0 z-0 xl:hidden">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={`mobile-${activeTrip.id || activeTrip._id}`}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
              className="absolute inset-0 w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url(${getOptimizedImageUrl(activeTrip.image, 1200)})` }}
            >
              {/* Dual gradient overlays for mobile */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/70 to-black/25" />
              <div className="absolute inset-0 bg-gradient-to-r from-stone-950/85 via-stone-950/30 to-transparent" />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 4. Details Box (Left Aligned) with stagger text slide reveals */}
        <div className="trips-slider-details-box absolute left-6 md:left-20 top-20 xl:top-[16%] max-w-md md:max-w-xl xl:max-w-3xl z-20 text-white flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              {/* Small State Badge (Cropped Reveal) */}
              <div className="overflow-hidden mb-2 md:mb-3 h-6 flex items-center">
                <motion.div
                  variants={textRevealVariants}
                  className="flex items-center gap-2"
                >
                  <span className="h-[3px] w-8 rounded-full bg-[#ea580c]" />
                  <span className="text-xs uppercase font-extrabold tracking-[0.2em] text-orange-200">
                    {activeTrip.state}
                  </span>
                  {activeTrip.state?.toLowerCase() === "sri lanka" && (
                    <span className="ml-2 px-2.5 py-0.5 rounded-full bg-[#ea580c] text-white text-[9px] uppercase tracking-widest font-black shadow-sm shadow-orange-500/20 animate-pulse">
                      Budget International
                    </span>
                  )}
                </motion.div>
              </div>

              {/* Split Title (Cropped Reveal) - resized to prevent height overflow on wrapping */}
              <div className="trips-slider-title font-display leading-[1.3] tracking-[0.02em] font-black text-3xl sm:text-4xl md:text-[52px] lg:text-[62px] uppercase select-text mb-4 md:mb-5">
                {getTitleLines(activeTrip.destination).map((line, idx) => (
                  <div key={idx} className={`overflow-hidden py-1.5 ${idx > 0 ? "mt-3 md:mt-4" : ""}`}>
                    <motion.div
                      variants={textRevealVariants}
                      className={idx === 0 ? "text-white/95" : "text-[#ea580c]"}
                      style={{ paddingBottom: "2px" }}
                    >
                      {line}
                    </motion.div>
                  </div>
                ))}
              </div>

              {/* Trip Specs (Cropped Reveal) */}
              <div className="trips-slider-specs overflow-hidden mb-3 md:mb-4 py-1">
                <motion.div
                  variants={textRevealVariants}
                  className="flex flex-wrap gap-2 md:gap-4 text-[10px] md:text-xs font-semibold text-stone-250 uppercase tracking-wider bg-white/5 border border-white/10 backdrop-blur-md px-3 py-1.5 md:px-4 md:py-2.5 rounded-xl w-fit"
                >
                  <span className={`flex items-center gap-1.5 ${activeTrip.destination?.toLowerCase().includes("sabarimala") ? "border-r border-white/10 pr-3 md:pr-4" : ""}`}>
                    <Clock className="w-3.5 h-3.5 text-orange-400 shrink-0" /> {activeTrip.duration}
                  </span>
                  {activeTrip.destination?.toLowerCase().includes("sabarimala") && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-orange-400 shrink-0" /> Every Month
                    </span>
                  )}
                </motion.div>
              </div>

              {/* Description (Cropped Reveal) */}
              <div className="trips-slider-description overflow-hidden mb-4 md:mb-5 max-w-lg">
                <motion.p
                  variants={textRevealVariants}
                  className="text-stone-200/90 font-body text-xs sm:text-[13px] md:text-[14px] leading-relaxed select-text font-normal"
                >
                  Explore the untouched beauty of {activeTrip.destination}. This curated solo-friendly journey includes comfortable sharing accommodations, AC or Non-AC transportation, breakfasts and dinners, alongside guidance from Akhil.
                </motion.p>
              </div>

              {/* Action CTAs (Cropped Reveal) */}
              <div className="trips-slider-actions overflow-hidden py-1">
                <motion.div
                  variants={textRevealVariants}
                  className="flex flex-wrap items-center gap-4"
                >
                  <Link
                    href={`/upcoming-trips/${tripSlug}`}
                    className="inline-flex items-center justify-center bg-[#ea580c] hover:bg-[#ff7a1a] text-white px-7 py-3 md:px-9 md:py-3.5 rounded-full font-bold text-[10px] md:text-xs tracking-widest active:scale-95 hover:-translate-y-0.5 transition-all shadow-lg shadow-orange-600/30 duration-200 pointer-events-auto"
                  >
                    Book Now
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center bg-white text-stone-950 hover:bg-stone-100 px-7 py-3 md:px-9 md:py-3.5 rounded-full font-bold text-[10px] md:text-xs tracking-widest active:scale-95 hover:-translate-y-0.5 transition-all shadow-md duration-200 pointer-events-auto"
                  >
                    Enquire
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 5. Thumbnail Card Queue (Desktop / xl screens only) */}
        <div className="absolute right-20 bottom-24 w-[580px] h-[260px] z-20 pointer-events-none hidden xl:block">
          <div className="relative w-full h-full">
            {order.slice(1, 4).map((tripIndex, i) => {
              const trip = featuredTrips[tripIndex];
              return (
                <motion.div
                  layoutId={`card-${trip.id || trip._id}`}
                  key={trip.id || trip._id}
                  className="absolute bottom-0 w-[180px] h-[260px] rounded-2xl bg-cover bg-center shadow-[0_12px_40px_rgba(0,0,0,0.6)] border border-white/20 pointer-events-auto cursor-pointer overflow-hidden group"
                  style={{
                    backgroundImage: `url(${getOptimizedImageUrl(trip.image, 600)})`,
                    left: `${i * 200}px`,
                  }}
                  transition={{ type: "spring", stiffness: 150, damping: 22 }}
                  whileHover={{ y: -10, transition: { duration: 0.2 } }}
                  onClick={() => handleCardClick(tripIndex)}
                >
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/20 to-transparent transition-opacity duration-300 group-hover:via-stone-900/10" />
                  
                  {/* Content */}
                  <div className="absolute bottom-5 left-5 right-5 text-white flex flex-col gap-1">
                    <span className="w-6 h-1 bg-[#ea580c] rounded-full" />
                    <span className="text-[10px] uppercase tracking-wider text-orange-200 font-extrabold leading-none">
                      {trip.state}
                    </span>
                    <span className="font-display font-black text-sm uppercase truncate leading-tight mt-0.5">
                      {trip.destination}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* 6. Pagination Controls (Desktop & Mobile responsive) */}
        {/* Desktop Controls (Aligned with Thumbnails) */}
        <div className="absolute bottom-12 right-20 z-30 hidden xl:flex items-center gap-6">
          <div className="flex gap-3">
            <button
              onClick={handlePrev}
              className="w-12 h-12 rounded-full border border-white/25 hover:border-white text-white flex items-center justify-center hover:bg-white/10 active:scale-90 transition-all pointer-events-auto"
              aria-label="Previous Trip"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="w-12 h-12 rounded-full border border-white/25 hover:border-white text-white flex items-center justify-center hover:bg-white/10 active:scale-90 transition-all pointer-events-auto"
              aria-label="Next Trip"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Static Step Progress Bar (represents active slide index) */}
          <div className="w-[260px] h-1 bg-white/25 rounded-full overflow-hidden relative">
            <motion.div
              className="absolute top-0 left-0 h-full bg-[#ea580c] rounded-full"
              animate={{ width: `${((activeIndex + 1) / featuredTrips.length) * 100}%` }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
            />
          </div>

          {/* Sliding Slide Counter */}
          <div className="flex items-center gap-2 text-white/60 text-xs font-bold uppercase tracking-[0.25em] whitespace-nowrap min-w-[70px]">
            <div className="relative w-8 h-10 overflow-hidden flex items-center justify-center">
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={activeIndex}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="absolute text-white text-xl font-extrabold"
                >
                  {activeIndex + 1}
                </motion.span>
              </AnimatePresence>
            </div>
            <span className="text-white/40 text-sm">/</span>
            <span className="text-sm font-semibold">{featuredTrips.length}</span>
          </div>
        </div>

        {/* Mobile / Tablet Controls (Centered at bottom) */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex xl:hidden items-center gap-6 bg-black/30 backdrop-blur-md px-6 py-3 rounded-full border border-white/10">
          <button
            onClick={handlePrev}
            className="w-10 h-10 rounded-full border border-white/20 text-white flex items-center justify-center active:scale-90 transition-all pointer-events-auto"
            aria-label="Previous Trip"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-1.5 text-white/60 text-xs font-bold uppercase tracking-wider min-w-[45px] justify-center">
            <div className="relative w-6 h-8 overflow-hidden flex items-center justify-center">
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={activeIndex}
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -15, opacity: 0 }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  className="absolute text-white text-base font-extrabold"
                >
                  {activeIndex + 1}
                </motion.span>
              </AnimatePresence>
            </div>
            <span className="text-white/40 font-semibold">/</span>
            <span className="font-semibold text-white/85">{featuredTrips.length}</span>
          </div>

          <button
            onClick={handleNext}
            className="w-10 h-10 rounded-full border border-white/20 text-white flex items-center justify-center active:scale-90 transition-all pointer-events-auto"
            aria-label="Next Trip"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </section>
    </LayoutGroup>
  );
}
