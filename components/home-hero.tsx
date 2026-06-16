"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

interface HomeHeroProps {
  title: string;
  subheading: string;
  heroImage?: string;
}

export function HomeHero({ title, subheading, heroImage }: HomeHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // Parallax effects
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const yContent = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacityContent = useTransform(scrollYProgress, [0, 1], [1, 0]);

  const displayTitle = (title || "Start Solo. Travel Together.").toUpperCase();
  const displayTagline = "Discover The Colorful World".toUpperCase();
  const words = displayTitle.split(" ");

  return (
    <section ref={containerRef} className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-black">
      {/* Background Image - Cinematic Parallax Zoom */}
      <motion.div style={{ y: yBg }} className="absolute inset-0 z-0 overflow-hidden">
        <motion.img
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 3.5, ease: [0.16, 1, 0.3, 1] }}
          src={heroImage || "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2400&q=85"}
          alt="Adventure Background"
          className="w-full h-full object-cover"
        />
        {/* Soft dark overlay to ensure readability of white text */}
        <div className="absolute inset-0 bg-black/40" />
      </motion.div>

      {/* Premium ambient light leaks / glow blobs */}
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
        <motion.div
          animate={{
            x: [30, -30, 30],
            y: [30, -20, 30],
            scale: [1.1, 0.95, 1.1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-emerald-500/5 blur-[160px] rounded-full"
        />
      </div>

      {/* Hero Content - Staggered Reveals */}
      <motion.div
        style={{ y: yContent, opacity: opacityContent }}
        className="relative z-10 max-w-4xl mx-auto px-6 text-center text-white flex flex-col items-center space-y-6"
      >
        <div className="flex flex-col items-center space-y-4">
          {/* Small Tagline */}
          <div className="overflow-hidden">
            <motion.span
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="inline-block text-[10px] sm:text-xs font-extrabold uppercase tracking-[0.25em] text-white/95"
            >
              {displayTagline}
            </motion.span>
          </div>

          {/* Main Title Heading (Split Word Reveal) */}
          <h1 className="font-sans text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-wide leading-none text-white drop-shadow-sm flex flex-wrap justify-center gap-x-4 gap-y-2 py-2">
            {words.map((word, idx) => (
              <span key={idx} className="inline-block overflow-hidden py-1">
                <motion.span
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.9, delay: 0.2 + idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  className={`inline-block ${
                    word.toLowerCase().includes("together") || word.toLowerCase().includes("solo")
                      ? "text-[#ea580c]"
                      : "text-white"
                  }`}
                >
                  {word}
                </motion.span>
              </span>
            ))}
          </h1>

          {/* Subtitle Description */}
          <div className="overflow-hidden">
            <motion.p
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-white/90 leading-relaxed font-body drop-shadow-sm pt-2"
            >
              {subheading || "Join solo travelers, explore new destinations, meet incredible people and create unforgettable memories together."}
            </motion.p>
          </div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
          >
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
          </motion.div>
        </div>
      </motion.div>

      {/* Floating ambient glow details */}
      <div className="absolute -bottom-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-white/5 blur-[120px] rounded-full pointer-events-none" />
    </section>
  );
}
