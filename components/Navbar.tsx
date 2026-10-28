"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/LanguageContext";
import { Locale } from "@/lib/translations";

import AnnouncementTicker from "@/components/AnnouncementTicker";

export function Navbar() {
  const pathname = usePathname();
  const { locale, setLocale, t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  if (pathname.startsWith("/admin")) return null;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setShowLangMenu(false);
  }, [pathname]);

  const hasDarkHero = 
    pathname === "/" || 
    pathname === "/upcoming-trips" ||
    pathname.startsWith("/upcoming-trips/");

  const showScrolled = scrolled || !hasDarkHero;

  const localizedLinks = [
    { href: "/", labelKey: "nav_home" },
    { href: "/upcoming-trips", labelKey: "nav_trips" },
    { href: "/reviews", labelKey: "nav_reviews" },
    { href: "/gallery", labelKey: "nav_gallery" },
    { href: "/trip-memories", labelKey: "nav_memories" },
    { href: "/about-akhil", labelKey: "nav_about" },
    { href: "/careers", labelKey: "nav_careers" },
    { href: "/farmer-registration", labelKey: "nav_farmer_trip" },
    { href: "/contact", labelKey: "nav_contact" },
  ];

  return (
    <header
      data-testid="navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 font-sans ${
        showScrolled
          ? "bg-white/95 backdrop-blur-xl shadow-[0_2px_15px_rgba(0,0,0,0.05)] border-b border-stone-200/70 pb-1.5"
          : "bg-stone-950/60 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.4)] pb-2"
      }`}
    >
      <AnnouncementTicker />
      
      {/* Subtle orange accent line at top */}
      <div className="h-[2px] gradient-orange w-full" />

      <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between pt-2">
        
        {/* Logo */}
        <Link href="/" data-testid="logo-link" className="flex items-center gap-3 group shrink-0">
          <div className="relative shrink-0">
            <img
              src="/logo.png"
              alt="WeAreSoloz"
              width={46}
              height={46}
              className={`rounded-full object-cover shrink-0 transition-all duration-300 ring-2 ring-orange-500/40 group-hover:ring-orange-500 shadow-md ${
                showScrolled ? "h-10 w-10 md:h-11 md:w-11" : "h-11 w-11 md:h-12 md:w-12"
              }`}
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-stone-900 shadow-xs" />
          </div>
          <div className="leading-tight shrink-0">
            <div className={`font-sans font-black tracking-tight transition-all duration-300 ${
              showScrolled ? "text-lg md:text-[21px] text-stone-900" : "text-xl md:text-[22px] text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)]"
            }`}>
              We<span className="text-[#ea580c]">Are</span>SoloZ
            </div>
            <div className={`text-[8.5px] md:text-[9.5px] uppercase tracking-[0.22em] font-bold transition-all duration-300 ${
              showScrolled ? "text-stone-400" : "text-stone-300 drop-shadow-sm"
            } mt-0.5 whitespace-nowrap hidden sm:block`}>
              Travel Solo · You're Not Alone
            </div>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2 shrink-0">
          {localizedLinks.map((l: any) => {
            const isActive = pathname === l.href;
            const linkText = l.isCustom ? l.label : t(l.labelKey);
            return (
              <Link
                key={l.href}
                href={l.href}
                data-testid={`nav-${linkText.toLowerCase().replace(/\s+/g, "-")}`}
                className={`relative px-3 py-1.5 text-[13.5px] xl:text-[14px] font-medium tracking-[-0.01em] rounded-lg transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? showScrolled
                      ? "text-[#ea580c] font-bold"
                      : "text-white font-bold"
                    : showScrolled
                      ? "text-stone-600 hover:text-stone-950 hover:bg-stone-100/70"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                {linkText}
                {isActive && (
                  <motion.span
                    layoutId="activeNavIndicator"
                    className="absolute -bottom-0.5 left-2.5 right-2.5 h-[2px] bg-gradient-to-r from-orange-500 to-amber-400 rounded-full shadow-[0_0_8px_rgba(234,88,12,0.9)]"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* CTA + Language Selector + Mobile Toggle */}
        <div className="flex items-center gap-2.5 xl:gap-3.5 shrink-0">
          
          {/* Desktop Language Selector */}
          <div className="relative hidden lg:block shrink-0">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border whitespace-nowrap ${
                showScrolled
                  ? "bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200"
                  : "bg-white/10 hover:bg-white/20 text-white border-white/15"
              }`}
              aria-label="Select Language"
            >
              <Globe className="w-3.5 h-3.5 text-[#ea580c]" />
              <span className="uppercase font-bold tracking-wider">{locale}</span>
            </button>
            <AnimatePresence>
              {showLangMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowLangMenu(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-32 bg-white/95 backdrop-blur-md rounded-2xl border border-stone-150 p-1.5 shadow-xl z-20 overflow-hidden"
                  >
                    {[
                      { code: "en", label: "English" },
                      { code: "te", label: "తెలుగు" },
                      { code: "hi", label: "हिन्दी" },
                    ].map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLocale(lang.code as Locale);
                          setShowLangMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                          locale === lang.code
                            ? "bg-orange-50 text-[#ea580c]"
                            : "text-stone-600 hover:text-stone-900 hover:bg-stone-50"
                        }`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Badminton Event Badge */}
          <Link
            href="/events/badminton-championship"
            className={`hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap shrink-0 border ${
              showScrolled
                ? "bg-orange-50 text-orange-600 border-orange-200/90 hover:bg-orange-100 shadow-2xs"
                : "bg-orange-500/15 text-orange-300 border-orange-500/30 hover:bg-orange-500/25"
            }`}
          >
            <span>🏸</span>
            <span>Badminton Event</span>
          </Link>

          {/* Join Community CTA */}
          <Link
            href="/soloz-community"
            data-testid="nav-join-community"
            className="hidden md:inline-flex items-center justify-center px-5 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white shadow-md shadow-orange-600/30 hover:scale-[1.03] active:scale-[0.98] transition-all whitespace-nowrap shrink-0"
          >
            {t("join_community")}
          </Link>
          
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setOpen(!open)}
            data-testid="mobile-menu-toggle"
            className={`lg:hidden w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 shrink-0 ${
              showScrolled
                ? "bg-stone-100 hover:bg-stone-200 text-stone-700"
                : "bg-white/10 hover:bg-white/20 text-white"
            }`}
            aria-label="Menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            data-testid="mobile-menu"
            className="lg:hidden mt-3 mx-4 bg-white rounded-3xl p-3 border border-stone-200/90 shadow-2xl max-h-[calc(100vh-110px)] overflow-y-auto"
          >
            <Link
              href="/events/badminton-championship"
              className="block px-4 py-3 rounded-2xl text-sm font-extrabold bg-gradient-to-r from-orange-500 to-amber-500 text-white mb-3 text-center shadow-sm uppercase tracking-wider"
            >
              🏸 Badminton Championship (Season 1)
            </Link>

            {localizedLinks.map((l: any) => {
              const isActive = pathname === l.href;
              const linkText = l.isCustom ? l.label : t(l.labelKey);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  data-testid={`mobile-nav-${linkText.toLowerCase().replace(/\s+/g, "-")}`}
                  className={`block px-4 py-3 rounded-xl text-sm font-bold transition-colors whitespace-nowrap ${
                    isActive
                      ? "bg-orange-50 text-[#ea580c]"
                      : "text-stone-700 hover:text-stone-900 hover:bg-stone-50"
                  }`}
                >
                  {linkText}
                </Link>
              );
            })}
            <div className="mx-3 my-2 h-px bg-stone-100" />
            
            {/* Mobile Language Selector */}
            <div className="px-4 py-3 flex items-center justify-between">
              <span className="text-stone-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-stone-400" /> Language
              </span>
              <div className="flex gap-1.5">
                {[
                  { code: "en", label: "EN" },
                  { code: "te", label: "TE" },
                  { code: "hi", label: "HI" },
                ].map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLocale(lang.code as Locale)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                      locale === lang.code
                        ? "bg-[#ea580c] text-white"
                        : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mx-3 my-2 h-px bg-stone-100" />
            <Link
              href="/soloz-community"
              className="block mx-2 mb-2 text-center px-4 py-3 rounded-xl bg-stone-900 text-white text-sm font-extrabold uppercase tracking-wider"
            >
              {t("join_community")}
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
