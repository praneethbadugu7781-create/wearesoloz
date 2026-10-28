"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { getOptimizedImageUrl } from "@/lib/utils";
import { ArrowRight, Compass, Users, Sparkles } from "lucide-react";

interface HomeHeroProps {
  title?: string;
  subheading?: string;
  heroImage?: string;
  featuredTrips?: any[];
}

export function HomeHero({ title, subheading, heroImage }: HomeHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // Parallax effects
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const yContent = useTransform(scrollYProgress, [0, 1], ["0%", "45%"]);
  const opacityContent = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[92vh] md:h-screen w-full flex flex-col items-center justify-center pt-28 md:pt-36 pb-16 md:pb-24 overflow-hidden bg-stone-950 font-sans"
    >
      {/* Background Image - Cinematic Parallax Zoom */}
      <motion.div style={{ y: yBg }} className="absolute inset-0 z-0 overflow-hidden">
        <motion.img
          initial={{ scale: 1.15, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 2.5, ease: [0.16, 1, 0.3, 1] }}
          src={getOptimizedImageUrl(
            heroImage || "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1920&q=80",
            1920
          )}
          alt="Adventure Background"
          className="w-full h-full object-cover select-none"
        />
        {/* Cinematic gradient overlay for maximum readability and luxury depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/70 via-stone-950/40 to-stone-950/80" />
      </motion.div>

      {/* Ambient glowing light leaks */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute -top-1/4 left-1/4 w-[550px] h-[550px] bg-orange-600/15 blur-[160px] rounded-full" />
        <div className="absolute -bottom-1/4 right-1/4 w-[600px] h-[600px] bg-amber-500/10 blur-[170px] rounded-full" />
      </div>

      {/* Hero Content */}
      <motion.div
        style={{ y: yContent, opacity: opacityContent }}
        className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center text-white flex flex-col items-center space-y-6"
      >
        {/* Top Eyebrow Tagline Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10.5px] sm:text-xs font-semibold uppercase tracking-[0.24em] shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#ea580c]" />
          <span>Discover The Colorful World</span>
        </motion.div>

        {/* Main Title Heading - Geist Brand Typography */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="font-sans text-4xl sm:text-6xl md:text-7xl lg:text-[82px] font-extrabold tracking-[-0.035em] leading-[1.04] text-white drop-shadow-[0_4px_30px_rgba(0,0,0,0.65)] select-none"
        >
          Start <span className="text-[#ea580c]">Solo.</span>
          <br className="hidden sm:inline" />{" "}
          Travel <span className="text-[#ea580c]">Together.</span>
        </motion.h1>

        {/* Subtitle Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-stone-200/90 leading-relaxed font-sans font-normal drop-shadow-sm pt-1"
        >
          {subheading ||
            "Join solo travellers, explore new destinations, meet incredible people and create unforgettable memories together."}
        </motion.p>

        {/* CTA Action Buttons (Badminton removed) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto"
        >
          <Link
            href="/upcoming-trips"
            className="inline-flex items-center justify-center gap-2 bg-white text-stone-950 px-8 py-3.5 rounded-full font-bold text-xs sm:text-sm uppercase tracking-wider hover:bg-stone-100 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 shadow-[0_4px_24px_rgba(0,0,0,0.25)] w-full sm:w-auto text-center"
          >
            <Compass className="w-4 h-4 text-[#ea580c]" />
            <span>Explore Trips</span>
          </Link>

          <Link
            href="/soloz-community"
            className="inline-flex items-center justify-center gap-2 bg-stone-900/85 hover:bg-stone-900 text-white border border-white/20 backdrop-blur-md px-8 py-3.5 rounded-full font-bold text-xs sm:text-sm uppercase tracking-wider hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 shadow-[0_4px_20px_rgba(0,0,0,0.2)] w-full sm:w-auto text-center"
          >
            <Users className="w-4 h-4 text-orange-400" />
            <span>Join Community</span>
          </Link>
        </motion.div>
      </motion.div>

      {/* Subtle bottom edge gradient fade into next section */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-stone-950/80 to-transparent pointer-events-none" />
    </section>
  );
}
