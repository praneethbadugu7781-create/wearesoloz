"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export function Preloader() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (pathname.startsWith("/admin")) {
      setLoading(false);
      return;
    }

    // Lock body scroll during preloader animation
    document.body.style.overflow = "hidden";

    const timer = setTimeout(() => {
      setLoading(false);
      document.body.style.overflow = "unset";
    }, 2400);

    return () => {
      document.body.style.overflow = "unset";
      clearTimeout(timer);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (pathname.startsWith("/admin")) return null;

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ y: 0 }}
          exit={{ 
            y: "-100vh",
            transition: { duration: 0.85, ease: [0.76, 0, 0.24, 1] }
          }}
          className="fixed inset-0 bg-white z-[99999] flex items-center justify-center overflow-hidden"
        >
          {/* Centered Intro Container */}
          <div className="flex items-center justify-center gap-2 sm:gap-4 md:gap-6 lg:gap-8 select-none font-sans">
            
            {/* Left Text: "weare" */}
            <div className="overflow-hidden py-2">
              <motion.div
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, ease: [0.215, 0.61, 0.355, 1], delay: 0.2 }}
                className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black tracking-tighter lowercase flex"
              >
                <span className="text-stone-900">we</span>
                <span className="text-[#ea580c]">are</span>
              </motion.div>
            </div>

            {/* Logo Image in the Middle */}
            <div className="overflow-hidden p-1">
              <motion.div
                initial={{ scale: 0, rotate: -15 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  type: "spring",
                  stiffness: 110,
                  damping: 15,
                  delay: 0.4 
                }}
                className="w-12 h-12 sm:w-20 sm:h-20 md:w-28 md:h-28 lg:w-36 lg:h-36 rounded-full border border-stone-100 shadow-md overflow-hidden bg-white flex items-center justify-center"
              >
                <img
                  src="/logo.png"
                  alt="WeAreSoloz Logo"
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </div>

            {/* Right Text: "soloz" (outlined) */}
            <div className="overflow-hidden py-2">
              <motion.div
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, ease: [0.215, 0.61, 0.355, 1], delay: 0.2 }}
                className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black tracking-tighter lowercase text-transparent [-webkit-text-stroke:1.5px_#1c1917] sm:[-webkit-text-stroke:2px_#1c1917] md:[-webkit-text-stroke:2.5px_#1c1917] lg:[-webkit-text-stroke:3px_#1c1917]"
              >
                solo<span style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>z</span>
              </motion.div>
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
