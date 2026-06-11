"use client";

import { useState } from "react";
import { ChevronDown, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ItineraryItem {
  day: string;
  title: string;
  description: string;
}

interface ItineraryAccordionProps {
  itinerary: ItineraryItem[];
}

export function ItineraryAccordion({ itinerary }: ItineraryAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  if (!itinerary || itinerary.length === 0) {
    return <p className="text-soloz-ash/60 text-sm">Itinerary details will be shared soon.</p>;
  }

  return (
    <div className="space-y-4">
      {itinerary.map((item, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div
            key={idx}
            className="rounded-xl border border-white/10 bg-white/5 overflow-hidden transition duration-300"
          >
            <button
              onClick={() => toggle(idx)}
              className="flex w-full items-center justify-between p-5 text-left text-white focus:outline-none"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex size-9 items-center justify-center rounded-lg bg-soloz-ember/15 text-xs font-bold text-soloz-ember border border-soloz-ember/20">
                  {item.day}
                </span>
                <span className="font-semibold text-sm sm:text-base">{item.title}</span>
              </div>
              <ChevronDown
                size={18}
                className={`text-soloz-ash/70 transition-transform duration-300 ${isOpen ? "rotate-180 text-soloz-ember" : ""}`}
              />
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="px-5 pb-5 pt-0 border-t border-white/5 text-sm text-soloz-ash/90 leading-relaxed space-y-2">
                    <p>{item.description}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
