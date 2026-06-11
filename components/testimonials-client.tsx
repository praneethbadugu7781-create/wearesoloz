"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Testimonial {
  name: string;
  role: string;
  quote: string;
  image?: string;
  rating?: number;
}

interface TestimonialsClientProps {
  testimonials: Testimonial[];
}

export function TestimonialsClient({ testimonials }: TestimonialsClientProps) {
  const [index, setIndex] = useState(0);
  const [[page, direction], setPage] = useState([0, 0]);

  const slideToIndex = (newIndex: number) => {
    const dir = newIndex > index ? 1 : -1;
    setPage([newIndex, dir]);
    setIndex(newIndex);
  };

  const next = () => {
    const nextIdx = (index + 1) % testimonials.length;
    slideToIndex(nextIdx);
  };

  const prev = () => {
    const prevIdx = (index - 1 + testimonials.length) % testimonials.length;
    slideToIndex(prevIdx);
  };

  useEffect(() => {
    if (testimonials.length <= 1) return;
    const interval = setInterval(next, 6000);
    return () => clearInterval(interval);
  }, [testimonials, index]);

  if (!testimonials || testimonials.length === 0) return null;

  const current = testimonials[index];

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 80 : -80,
      opacity: 0
    })
  };

  return (
    <div className="relative w-full overflow-hidden flex flex-col gap-6">
      {/* Slider viewport */}
      <div className="min-h-[280px] flex items-center relative">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={index}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            className="w-full"
          >
            <div className="review-slider-content info flex flex-col justify-between border border-white/10 bg-white/5 backdrop-blur rounded-2xl p-8 min-h-[260px]">
              <div className="review-slider-info space-y-4">
                {/* 5 Stars */}
                <div className="review-stars-box">
                  {Array.from({ length: current.rating || 5 }).map((_, i) => (
                    <img
                      key={i}
                      src="https://cdn.prod.website-files.com/68b4aefe0f5b95bfbdc12b0b/68bc38dec4bd64cabac6da3a_star.webp"
                      alt="Star"
                      className="review-star"
                    />
                  ))}
                </div>

                {/* Review Text */}
                <p className="font-display italic text-lg leading-relaxed text-soloz-ash/95">
                  &ldquo;{current.quote}&rdquo;
                </p>
              </div>

              {/* Reviewer Author Info */}
              <div className="flex items-center gap-4 pt-6 border-t border-white/5 mt-4">
                {current.image ? (
                  <img
                    src={current.image}
                    alt={current.name}
                    className="size-11 rounded-full object-cover border border-soloz-ember/30"
                  />
                ) : (
                  <div className="grid size-11 place-items-center rounded-full border border-soloz-ember bg-soloz-ember/15 text-sm font-bold text-soloz-ember">
                    {current.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-bold text-white leading-tight">{current.name}</h4>
                  <p className="text-[10px] text-soloz-ash/60 uppercase tracking-widest font-semibold mt-1">
                    {current.role}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Slider Controls */}
      <div className="flex justify-end gap-2 pr-2">
        <button
          onClick={prev}
          className="grid size-10 place-items-center rounded-full border border-white/10 bg-[#14110d]/60 text-white hover:border-soloz-ember hover:bg-soloz-ember transition duration-300"
          aria-label="Previous review"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={next}
          className="grid size-10 place-items-center rounded-full border border-white/10 bg-[#14110d]/60 text-white hover:border-soloz-ember hover:bg-soloz-ember transition duration-300"
          aria-label="Next review"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
