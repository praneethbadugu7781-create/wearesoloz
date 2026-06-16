"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, LayoutGroup, useScroll, useTransform } from "framer-motion";
import { ArrowLeft, ArrowRight, Calendar, Clock, Users } from "lucide-react";
import Link from "next/link";

interface HomeHeroProps {
  title: string;
  subheading: string;
  heroImage?: string;
  featuredTrips?: any[];
}

interface Slide {
  image: string;
  tagline: string;
  title1: string;
  title2: string;
  description: string;
  link: string;
  btnText: string;
  isTrip?: boolean;
  duration?: string;
  date?: string;
}

export function HomeHero({ title, subheading, heroImage, featuredTrips = [] }: HomeHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // Parallax transforms for active slide
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const yContent = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacityContent = useTransform(scrollYProgress, [0, 1], [1, 0]);

  // Build slides array
  const slides: Slide[] = [
    {
      image: heroImage || "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2400&q=85",
      tagline: "Discover The Colorful World",
      title1: "START SOLO.",
      title2: "TRAVEL TOGETHER.",
      description: subheading || "Join solo travelers, explore new destinations, meet incredible people and create unforgettable memories together.",
      link: "/upcoming-trips",
      btnText: "Explore Trips",
    }
  ];

  // Add published featured trips (up to 3)
  featuredTrips.forEach((trip) => {
    const tripSlug = trip.slug || trip.destination?.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const words = trip.destination.split(" ");
    const t1 = words[0].toUpperCase();
    const t2 = words.slice(1).join(" ").toUpperCase() || (trip.state || "DESTINATION").toUpperCase();

    slides.push({
      image: trip.image || "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
      tagline: trip.state || "Destination",
      title1: t1,
      title2: t2,
      description: trip.description || `Join us for an unforgettable solo travel journey to ${trip.destination}.`,
      link: `/upcoming-trips/${tripSlug}`,
      btnText: "Book Now",
      isTrip: true,
      duration: trip.duration,
      date: trip.date,
    });
  });

  // Add WhatsApp Community slide
  slides.push({
    image: "https://images.unsplash.com/photo-1519719498756-2f0d81cdf13b?auto=format&fit=crop&w=2400&q=85",
    tagline: "WeAreSoloz Family",
    title1: "CONNECT WITH",
    title2: "1,000+ TRAVELERS",
    description: "Join our official WhatsApp community to get instant updates on upcoming solo trips and chat with travel buddies.",
    link: "/soloz-community",
    btnText: "Join Community",
  });

  const [order, setOrder] = useState<number[]>([]);

  // Initialize order when slides are loaded
  useEffect(() => {
    if (slides.length > 0) {
      setOrder(Array.from({ length: slides.length }, (_, i) => i));
    }
  }, [featuredTrips, heroImage]);

  if (order.length === 0 || slides.length === 0) {
    return (
      <div className="h-screen bg-stone-950 flex items-center justify-center text-white font-display uppercase tracking-widest text-sm">
        Loading...
      </div>
    );
  }

  const activeIndex = order[0];
  const activeSlide = slides[activeIndex];

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

  // Animations variants
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
    <LayoutGroup id="home-hero-slider">
      <section ref={containerRef} className="relative h-screen w-full bg-stone-950 overflow-hidden select-none">
        
        {/* 1. White entrance reveal cover */}
        <motion.div
          initial={{ x: 0 }}
          animate={{ x: "100%" }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.25, 1, 0.5, 1] as const }}
          className="absolute inset-0 bg-white z-[100] pointer-events-none"
        />

        {/* 2. Active Background Slide Parallax */}
        <div className="absolute inset-0 z-0 hidden xl:block">
          <motion.div
            key={`desktop-${activeIndex}`}
            layoutId={`home-slide-${activeIndex}`}
            style={{ y: yBg, backgroundImage: `url(${activeSlide.image})` }}
            className="absolute inset-0 w-full h-full bg-cover bg-center"
            transition={{ type: "spring", stiffness: 120, damping: 22 }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/50 to-black/35" />
          </motion.div>
        </div>

        <div className="absolute inset-0 z-0 xl:hidden">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={`mobile-${activeIndex}`}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
              style={{ backgroundImage: `url(${activeSlide.image})` }}
              className="absolute inset-0 w-full h-full bg-cover bg-center"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/50 to-black/35" />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 2. Ambient Light Leaks */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <motion.div
            animate={{
              x: [-30, 30, -30],
              y: [-20, 30, -20],
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -top-1/4 -left-1/4 w-[500px] h-[500px] bg-orange-500/10 blur-[150px] rounded-full"
          />
        </div>

        {/* 3. Timer Indicator */}
        <div className="fixed top-0 left-0 right-0 h-1 bg-black/10 z-[9999] pointer-events-none">
          <motion.div
            key={activeIndex}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 5, ease: "linear" }}
            style={{ originX: 0 }}
            className="h-full bg-[#ea580c]"
            onAnimationComplete={handleNext}
          />
        </div>

        {/* 4. Active Slide Details */}
        <div className="absolute left-6 md:left-20 top-24 xl:top-1/4 max-w-md md:max-w-lg xl:max-w-xl z-20 text-white flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              {/* Tagline / State */}
              <div className="overflow-hidden mb-2 md:mb-4 h-6 flex items-center">
                <motion.div variants={textRevealVariants} className="flex items-center gap-2">
                  <span className="h-[3px] w-8 rounded-full bg-[#ea580c]" />
                  <span className="text-xs uppercase font-extrabold tracking-[0.2em] text-orange-200">
                    {activeSlide.tagline}
                  </span>
                </motion.div>
              </div>

              {/* Split Title (Cropped Reveal) */}
              <div className="font-display leading-none tracking-tight font-black text-3xl sm:text-6xl md:text-7xl uppercase select-text mb-4 md:mb-6">
                <div className="overflow-hidden py-1">
                  <motion.div variants={textRevealVariants} className="text-white/95">
                    {activeSlide.title1}
                  </motion.div>
                </div>
                <div className="overflow-hidden py-1 mt-1">
                  <motion.div variants={textRevealVariants} className="text-[#ea580c]">
                    {activeSlide.title2}
                  </motion.div>
                </div>
              </div>

              {/* Trip Specs (if active slide is a trip) */}
              {activeSlide.isTrip && (
                <div className="overflow-hidden mb-4 md:mb-6 py-1">
                  <motion.div
                    variants={textRevealVariants}
                    className="flex flex-wrap gap-2 md:gap-4 text-[10px] md:text-xs font-semibold text-stone-200 uppercase tracking-wider bg-white/5 border border-white/10 backdrop-blur-md px-3 py-1.5 md:px-4 md:py-2.5 rounded-xl w-fit"
                  >
                    {activeSlide.duration && (
                      <span className="flex items-center gap-1.5 border-r border-white/10 pr-3 md:pr-4">
                        <Clock className="w-3.5 h-3.5 text-orange-400 shrink-0" /> {activeSlide.duration}
                      </span>
                    )}
                    {activeSlide.date && (
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-orange-400 shrink-0" /> {new Date(activeSlide.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    )}
                  </motion.div>
                </div>
              )}

              {/* Description */}
              <div className="overflow-hidden mb-5 md:mb-8 max-w-lg">
                <motion.p
                  variants={textRevealVariants}
                  className="text-white/85 font-body text-xs sm:text-base leading-relaxed select-text"
                >
                  {activeSlide.description}
                </motion.p>
              </div>

              {/* Buttons */}
              <div className="overflow-hidden py-1">
                <motion.div variants={textRevealVariants} className="flex items-center gap-4">
                  <Link
                    href={activeSlide.link}
                    className="inline-flex items-center justify-center bg-white text-stone-950 hover:bg-stone-100 px-6 py-2.5 md:px-8 md:py-3.5 rounded-full font-bold text-[10px] md:text-xs tracking-widest active:scale-95 transition-all shadow-lg pointer-events-auto"
                  >
                    {activeSlide.btnText}
                  </Link>
                  {!activeSlide.isTrip && (
                    <Link
                      href="/contact"
                      className="inline-flex items-center justify-center bg-white/10 border border-white/20 hover:bg-white/20 text-white px-6 py-2.5 md:px-8 md:py-3.5 rounded-full font-bold text-[10px] md:text-xs tracking-widest active:scale-95 transition-all pointer-events-auto"
                    >
                      Inquire
                    </Link>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 5. Desktop Thumbnails Queue */}
        <div className="absolute right-20 bottom-24 w-[580px] h-[260px] z-20 pointer-events-none hidden xl:block">
          <div className="relative w-full h-full">
            {order.slice(1, 4).map((slideIndex, i) => {
              const slide = slides[slideIndex];
              return (
                <motion.div
                  layoutId={`home-slide-${slideIndex}`}
                  key={slideIndex}
                  className="absolute bottom-0 w-[180px] h-[260px] rounded-2xl bg-cover bg-center shadow-[0_12px_40px_rgba(0,0,0,0.6)] border border-white/20 pointer-events-auto cursor-pointer overflow-hidden group"
                  style={{
                    backgroundImage: `url(${slide.image})`,
                    left: `${i * 200}px`,
                  }}
                  transition={{ type: "spring", stiffness: 150, damping: 22 }}
                  whileHover={{ y: -10, transition: { duration: 0.2 } }}
                  onClick={() => handleCardClick(slideIndex)}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/20 to-transparent transition-opacity duration-300 group-hover:via-stone-900/10" />
                  
                  <div className="absolute bottom-5 left-5 right-5 text-white flex flex-col gap-1">
                    <span className="w-6 h-1 bg-[#ea580c] rounded-full" />
                    <span className="text-[10px] uppercase tracking-wider text-orange-200 font-extrabold leading-none">
                      {slide.tagline}
                    </span>
                    <span className="font-display font-black text-sm uppercase truncate leading-tight mt-0.5">
                      {slide.title1} {slide.title2}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* 6. Navigation Controls */}
        {/* Desktop controls */}
        <div className="absolute bottom-12 right-20 z-30 hidden xl:flex items-center gap-6">
          <div className="flex gap-3">
            <button
              onClick={handlePrev}
              className="w-12 h-12 rounded-full border border-white/25 hover:border-white text-white flex items-center justify-center hover:bg-white/10 active:scale-90 transition-all pointer-events-auto"
              aria-label="Previous Slide"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="w-12 h-12 rounded-full border border-white/25 hover:border-white text-white flex items-center justify-center hover:bg-white/10 active:scale-90 transition-all pointer-events-auto"
              aria-label="Next Slide"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          <div className="w-[260px] h-1 bg-white/25 rounded-full overflow-hidden relative">
            <motion.div
              className="absolute top-0 left-0 h-full bg-[#ea580c] rounded-full"
              animate={{ width: `${((activeIndex + 1) / slides.length) * 100}%` }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
            />
          </div>

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
            <span className="text-sm font-semibold">{slides.length}</span>
          </div>
        </div>

        {/* Mobile controls */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex xl:hidden items-center gap-6 bg-black/35 backdrop-blur-md px-6 py-3 rounded-full border border-white/10">
          <button
            onClick={handlePrev}
            className="w-10 h-10 rounded-full border border-white/20 text-white flex items-center justify-center active:scale-90 transition-all pointer-events-auto"
            aria-label="Previous Slide"
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
            <span className="font-semibold text-white/85">{slides.length}</span>
          </div>

          <button
            onClick={handleNext}
            className="w-10 h-10 rounded-full border border-white/20 text-white flex items-center justify-center active:scale-90 transition-all pointer-events-auto"
            aria-label="Next Slide"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </section>
    </LayoutGroup>
  );
}
