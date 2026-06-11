"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const links = [
  { href: "/", label: "Home" },
  { href: "/upcoming-trips", label: "Trips" },
  { href: "/travel-stories", label: "Stories" },
  { href: "/soloz-community", label: "Community" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about-akhil", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  if (pathname.startsWith("/admin")) return null;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header
      data-testid="navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/80 backdrop-blur-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] py-2"
          : "bg-transparent py-4"
      }`}
    >
      {/* Subtle orange accent line at top */}
      <div className="absolute top-0 left-0 right-0 h-[2px] gradient-orange" />

      <div className="max-w-7xl mx-auto px-4 md:px-10 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" data-testid="logo-link" className="flex items-center gap-2 md:gap-3 group">
          <div className="relative">
            <img
              src="/logo.png"
              alt="WeAreSoloz"
              className={`rounded-full object-cover transition-all duration-300 ring-2 ring-orange-500/20 group-hover:ring-orange-500/40 ${
                scrolled ? "h-8 w-8 md:h-10 md:w-10" : "h-10 w-10 md:h-12 md:w-12"
              }`}
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white" />
          </div>
          <div className="leading-none">
            <div className={`font-sans font-bold tracking-tight transition-all duration-300 ${
              scrolled ? "text-base md:text-lg" : "text-lg md:text-xl"
            } text-stone-900`}>
              We<span className="text-[#ea580c]">Are</span>Soloz
            </div>
            <div className="text-[7.5px] md:text-[9px] uppercase tracking-[0.08em] md:tracking-[0.3em] text-stone-400 font-medium mt-0.5 whitespace-nowrap">
              Travel Solo · You're Not Alone
            </div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-0.5 bg-stone-50/80 backdrop-blur-sm rounded-full px-1.5 py-1.5 border border-stone-100">
          {links.map((l) => {
            const isActive = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                data-testid={`nav-${l.label.toLowerCase().replace(/\s+/g, "-")}`}
                className={`relative px-4 py-2 text-[13px] font-medium rounded-full transition-all duration-300 ${
                  isActive
                    ? "bg-white text-stone-900 shadow-sm"
                    : "text-stone-500 hover:text-stone-900 hover:bg-white/60"
                }`}
              >
                {l.label}
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#ea580c]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* CTA + Mobile Toggle */}
        <div className="flex items-center gap-3">
          <Link
            href="/soloz-community"
            data-testid="nav-join-community"
            className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-900 text-white text-[13px] font-semibold hover:bg-stone-800 transition-all duration-300 hover:shadow-lg hover:shadow-stone-900/10"
          >
            Join Community
          </Link>
          <button
            onClick={() => setOpen(!open)}
            data-testid="mobile-menu-toggle"
            className="lg:hidden w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center transition-colors hover:bg-stone-200 text-stone-700"
            aria-label="Menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            data-testid="mobile-menu"
            className="lg:hidden mt-3 mx-4 bg-white rounded-2xl p-2 border border-stone-100 shadow-xl shadow-stone-200/50"
          >
            {links.map((l) => {
              const isActive = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  data-testid={`mobile-nav-${l.label.toLowerCase().replace(/\s+/g, "-")}`}
                  className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-orange-50 text-[#ea580c]"
                      : "text-stone-600 hover:text-stone-900 hover:bg-stone-50"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
            <div className="mx-3 my-2 h-px bg-stone-100" />
            <Link
              href="/soloz-community"
              className="block mx-2 mb-2 text-center px-4 py-3 rounded-xl bg-stone-900 text-white text-sm font-semibold"
            >
              Join Community
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
