"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FAQItem {
  question: string;
  answer: string;
}

const defaultFAQs: FAQItem[] = [
  {
    question: "What makes WeAreSoloz different from standard tour operators?",
    answer: "We are a travel community, not a travel agency. We focus heavily on traveller compatibility, safety, and fostering friendships. We coordinate verified departures where solo travellers move as a supportive crew rather than a bus full of strangers."
  },
  {
    question: "Is it safe for solo female travellers?",
    answer: "Absolutely. Safety is our primary pillar. All participants are verified through brief confirmation profiles prior to slot approvals. Our trip captains are trained in local safety guidelines and first-aid support, creating a secure, respectful community environment."
  },
  {
    question: "How do I confirm my slot placement?",
    answer: "Once you submit an enquiry form on a trip details page, our team will coordinate a quick call on WhatsApp. Upon review, you secure your seat with a token deposit. Remaining amounts are cleared prior to base camp pickups."
  },
  {
    question: "What gear is required for Himalayan treks like Kedarnath or Valley of Flowers?",
    answer: "We share complete gear checklists (including thermal layers, high-ankle hiking boots, raincovers, and trekking poles) 2 weeks before departure. Pre-departure local orientation meetups also cover packing guidelines."
  },
  {
    question: "What is the cancellation and refund policy?",
    answer: "Deposits are refundable or transferable to any future WeAreSoloz trip if cancelled 30 days prior to departure. cancellations within 15-30 days receive 50% credit. cancellations within 15 days are non-refundable due to base bookings."
  }
];

export function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="faq-section py-24 border-t border-white/5 bg-[#080705]">
      <div className="section-shell grid gap-12 lg:grid-cols-[1fr_1.5fr] items-start">
        {/* Left header */}
        <div className="space-y-4 lg:sticky lg:top-28">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.25em] text-soloz-ember">
            <HelpCircle size={14} className="text-soloz-ember" /> FAQ
          </div>
          <h2 className="font-display text-3xl font-extrabold sm:text-5xl text-white leading-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-soloz-ash/80 leading-relaxed max-w-sm">
            Need guidance on slot allocations, physical preparation, gear checkpoints, or group logistics? Explore quick answers below.
          </p>
        </div>

        {/* Accordions using Tripvana classes */}
        <div className="space-y-4">
          {defaultFAQs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="faq-item"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="faq-question flex w-full items-center justify-between text-left text-white focus:outline-none"
                >
                  <span className="font-display text-base sm:text-lg font-bold leading-snug pr-4">{faq.question}</span>
                  <ChevronDown
                    size={18}
                    className={`text-soloz-ash/60 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180 text-soloz-ember" : ""}`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                      <div className="faq-answer pt-4 text-xs sm:text-sm text-soloz-ash/80 leading-relaxed border-t border-white/5 mt-4">
                        <p>{faq.answer}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
