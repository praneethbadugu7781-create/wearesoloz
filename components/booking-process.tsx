"use client";

import { useState } from "react";
import { Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const steps = [
  {
    num: "01",
    title: "Browse Journeys",
    description: "Explore our wide range of mountains, treks, spiritual yatras, and beach escapes to find your next route.",
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80"
  },
  {
    num: "02",
    title: "Select a Package",
    description: "Click on the trip detail cards to check daily itineraries, inclusions, durations, and slots availability.",
    image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80"
  },
  {
    num: "03",
    title: "Request Your Seat",
    description: "Submit our simple lead-capture booking form. We verify all profile details to keep our groups compatible.",
    image: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=800&q=80"
  },
  {
    num: "04",
    title: "Pack & Travel Together",
    description: "We coordinate local pickups, captains, and transfers. Hop in solo, return with lifelong friends.",
    image: "https://images.unsplash.com/photo-1530789253388-582c481c54b0?auto=format&fit=crop&w=800&q=80"
  }
];

export function BookingProcess() {
  const [activeStep, setActiveStep] = useState(0);
  const [[page, direction], setPage] = useState([0, 0]);

  const slideToIndex = (newIndex: number) => {
    const dir = newIndex > activeStep ? 1 : -1;
    setPage([newIndex, dir]);
    setActiveStep(newIndex);
  };

  const handleNext = () => {
    const nextIndex = (activeStep + 1) % steps.length;
    slideToIndex(nextIndex);
  };

  const handlePrev = () => {
    const prevIndex = (activeStep - 1 + steps.length) % steps.length;
    slideToIndex(prevIndex);
  };

  const progressPercent = ((activeStep + 1) / steps.length) * 100;

  // Slide transition animation variants
  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 100 : -100,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 100 : -100,
      opacity: 0
    })
  };

  const current = steps[activeStep];

  return (
    <section className="booking-process-section py-24 border-t border-white/5 bg-[#080705]">
      <div className="section-shell space-y-12">
        {/* Title Badge & Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.25em] text-soloz-ember">
            <Sparkles size={13} className="text-soloz-ember" />
            Booking Process
          </div>
          <h2 className="font-display text-3xl font-extrabold sm:text-5xl text-white leading-tight">
            Follow these simple steps to reserve your trip with ease.
          </h2>
        </div>

        {/* Slideshow main viewport */}
        <div className="booking-process-wrapper relative px-2">
          <div className="overflow-hidden min-h-[420px] sm:min-h-[380px] flex items-center">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={activeStep}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 }
                }}
                className="w-full"
              >
                <div className="booking-slider-contents w-full">
                  <div className="booking-slider-left flex flex-col justify-between py-2">
                    <h3 className="font-display text-7xl font-black text-white/10 mb-6 sm:mb-0">
                      {current.num}
                    </h3>
                    <div className="booking-slider-content space-y-3">
                      <h5 className="font-display text-xl font-bold text-white">{current.title}</h5>
                      <p className="large-paragraph text-sm leading-relaxed text-soloz-ash/80 max-w-md">
                        {current.description}
                      </p>
                    </div>
                  </div>
                  
                  <img
                    src={current.image}
                    alt={current.title}
                    className="booking-slider-image shadow-2xl bg-white/5 border border-white/10"
                  />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Left Arrow Button */}
          <button
            onClick={handlePrev}
            className="absolute left-[-20px] sm:left-[-40px] top-[45%] -translate-y-1/2 z-10 grid size-10 place-items-center rounded-full border border-white/10 bg-[#14110d]/85 text-white hover:border-soloz-ember hover:bg-soloz-ember transition-all duration-300"
            aria-label="Previous step"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Right Arrow Button */}
          <button
            onClick={handleNext}
            className="absolute right-[-20px] sm:right-[-40px] top-[45%] -translate-y-1/2 z-10 grid size-10 place-items-center rounded-full border border-white/10 bg-[#14110d]/85 text-white hover:border-soloz-ember hover:bg-soloz-ember transition-all duration-300"
            aria-label="Next step"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Dots Navigation & Progress Indicator Bar */}
        <div className="flex flex-col items-center gap-6 pt-4 max-w-md mx-auto">
          {/* Slide dots */}
          <div className="flex gap-2">
            {steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => slideToIndex(idx)}
                className={`size-2.5 rounded-full transition-all duration-300 ${
                  activeStep === idx
                    ? "bg-soloz-ember w-6"
                    : "bg-white/15 hover:bg-white/30"
                }`}
                aria-label={`Go to step ${idx + 1}`}
              />
            ))}
          </div>

          {/* Step Progress Line */}
          <div className="booking-underline">
            <div
              className="booking-line-animation"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
