"use client";

import { motion } from "framer-motion";

interface HomeHeroProps {
  title: string;
  subheading: string;
  heroImage?: string;
}

export function HomeHero({ title, subheading, heroImage }: HomeHeroProps) {
  const displayTitle = (title || "Start Solo. Travel Together.").toUpperCase();
  const displayTagline = "Discover The Colorful World".toUpperCase();

  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-black">
      {/* Background Image - Colorful Mountain Cloud Landscape */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage || "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2400&q=85"}
          alt="Adventure Background"
          className="w-full h-full object-cover"
        />
        {/* Soft dark overlay to ensure readability of white text */}
        <div className="absolute inset-0 bg-black/35" />
      </div>

      {/* Hero Content - Centered */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center text-white flex flex-col items-center space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center space-y-4"
        >
          {/* Small Tagline */}
          <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-[0.25em] text-white/95">
            {displayTagline}
          </span>

          {/* Main Title Heading */}
          <h1 className="font-sans text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-wide leading-none text-white drop-shadow-sm">
            {displayTitle}
          </h1>

          {/* Subtitle Description */}
          <p className="max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-white/90 leading-relaxed font-body drop-shadow-sm pt-2">
            {subheading || "Join solo travelers, explore new destinations, meet incredible people and create unforgettable memories together."}
          </p>

          {/* CTA Buttons */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <a
              href="/upcoming-trips"
              className="inline-flex items-center justify-center bg-white text-stone-950 px-8 py-3.5 rounded-full font-bold text-xs sm:text-sm uppercase tracking-widest hover:bg-stone-100 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.15)] w-full sm:w-auto text-center"
            >
              Explore Trips
            </a>
            <a
              href="/soloz-community"
              className="inline-flex items-center justify-center bg-white/15 hover:bg-white/25 text-white border border-white/20 backdrop-blur-md px-8 py-3.5 rounded-full font-bold text-xs sm:text-sm uppercase tracking-widest hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.05)] w-full sm:w-auto text-center"
            >
              Join Community
            </a>
          </div>
        </motion.div>
      </div>

      {/* Floating ambient glow details */}
      <div className="absolute -bottom-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-white/5 blur-[120px] rounded-full pointer-events-none" />
    </section>
  );
}
