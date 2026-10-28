"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Globe, ChevronDown, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/LanguageContext";
import { Locale } from "@/lib/translations";
import AnnouncementTicker from "@/components/AnnouncementTicker";
import { LiquidMetalButton } from "@/components/LiquidMetalButton";

export function Navbar() {
  const pathname = usePathname();
  const { locale, setLocale, t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  if (pathname.startsWith("/admin")) return null;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 25);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setShowLangMenu(false);
    setShowMoreMenu(false);
  }, [pathname]);

  const hasDarkHero =
    pathname === "/" ||
    pathname === "/upcoming-trips" ||
    pathname.startsWith("/upcoming-trips/");

  const showScrolled = scrolled || !hasDarkHero;

  // Primary navigation links in floating center pill
  const primaryLinks = [
    { href: "/", labelKey: "nav_home", defaultLabel: "Home" },
    { href: "/upcoming-trips", labelKey: "nav_trips", defaultLabel: "Trips" },
    { href: "/reviews", labelKey: "nav_reviews", defaultLabel: "Reviews" },
    { href: "/gallery", labelKey: "nav_gallery", defaultLabel: "Gallery" },
    { href: "/trip-memories", labelKey: "nav_memories", defaultLabel: "Memories" },
    { href: "/about-akhil", labelKey: "nav_about", defaultLabel: "About" },
    { href: "/contact", labelKey: "nav_contact", defaultLabel: "Contact" },
  ];

  // Secondary links inside More dropdown
  const secondaryLinks = [
    { href: "/events/badminton-championship", label: "🏸 Badminton Championship", badge: "Live" },
    { href: "/farmer-registration", label: "🌾 Farmer Trip Registration" },
    { href: "/careers", label: "💼 Careers at SoloZ" },
  ];

  const allMobileLinks = [
    ...primaryLinks,
    { href: "/farmer-registration", labelKey: "nav_farmer_trip", defaultLabel: "Farmer Trips" },
    { href: "/careers", labelKey: "nav_careers", defaultLabel: "Careers" },
  ];

  return (
    <header
      data-testid="navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 font-sans ${
        showScrolled
          ? "bg-white/85 backdrop-blur-xl border-b border-stone-200/70 shadow-[0_2px_16px_rgba(0,0,0,0.04)]"
          : "bg-gradient-to-b from-black/60 via-black/25 to-transparent backdrop-blur-[2px]"
      }`}
    >
      <AnnouncementTicker />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 md:py-3 flex items-center justify-between">
        
        {/* Left: Brand / Logo Card */}
        <Link
          href="/"
          data-testid="logo-link"
          className="flex items-center gap-3 group shrink-0"
        >
          <div className="w-10 h-10 md:w-11 md:h-11 rounded-2xl bg-white border border-stone-200/90 shadow-sm flex items-center justify-center p-1.5 transition-transform duration-300 group-hover:scale-105 shrink-0">
            <img
              src="/logo.png"
              alt="WeAreSoloZ"
              className="w-full h-full object-contain rounded-xl"
            />
          </div>
          <div className="leading-tight flex flex-col justify-center">
            <div
              className={`font-sans font-bold tracking-tight text-lg md:text-[20px] transition-colors duration-300 ${
                showScrolled ? "text-stone-900" : "text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]"
              }`}
            >
              WeAreSoloZ<span className="text-[#ea580c]">.</span>
            </div>
            <div
              className={`text-[9px] md:text-[9.5px] uppercase tracking-[0.2em] font-semibold transition-colors duration-300 ${
                showScrolled ? "text-stone-500" : "text-stone-300 drop-shadow-sm"
              }`}
            >
              Travel Solo
            </div>
          </div>
        </Link>

        {/* Center: Floating Island Capsule Navigation (Desktop) */}
        <nav
          aria-label="Main Navigation"
          className="hidden lg:flex items-center p-1.5 bg-white/95 backdrop-blur-xl rounded-full border border-stone-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.08)] gap-1 shrink-0"
        >
          {primaryLinks.map((item) => {
            const isActive = pathname === item.href;
            const label = t(item.labelKey) || item.defaultLabel;

            return (
              <Link
                key={item.href}
                href={item.href}
                data-testid={`nav-${label.toLowerCase().replace(/\s+/g, "-")}`}
                className={`relative px-4 py-1.5 text-[13.5px] tracking-tight transition-all duration-200 rounded-full select-none whitespace-nowrap ${
                  isActive
                    ? "bg-[#18181b] text-white font-semibold shadow-xs"
                    : "text-stone-600 hover:text-stone-950 font-medium hover:bg-stone-100/80"
                }`}
              >
                {label}
              </Link>
            );
          })}

          {/* More Dropdown for additional pages */}
          <div className="relative">
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="flex items-center gap-1 px-3 py-1.5 text-[13.5px] font-medium text-stone-600 hover:text-stone-950 hover:bg-stone-100/80 rounded-full transition-colors whitespace-nowrap"
            >
              <span>More</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showMoreMenu ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {showMoreMenu && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setShowMoreMenu(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-stone-200/90 p-1.5 shadow-xl z-30 overflow-hidden"
                  >
                    {secondaryLinks.map((sec) => (
                      <Link
                        key={sec.href}
                        href={sec.href}
                        onClick={() => setShowMoreMenu(false)}
                        className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-stone-700 hover:text-stone-950 hover:bg-stone-50 transition-colors"
                      >
                        <span>{sec.label}</span>
                        {sec.badge && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-[#ea580c]">
                            {sec.badge}
                          </span>
                        )}
                      </Link>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </nav>

        {/* Right: Liquid Metal Shader Button + Language + Mobile Hamburger */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          
          {/* Badminton Quick Badge (Tablet / Desktop) */}
          <Link
            href="/events/badminton-championship"
            className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/95 backdrop-blur-md border border-stone-200/90 text-stone-700 hover:bg-stone-100 shadow-2xs transition-all shrink-0"
          >
            <span>🏸</span>
            <span className="font-bold text-stone-800">Badminton</span>
          </Link>

          {/* Language Selector Pill */}
          <div className="relative hidden md:block shrink-0">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold bg-white/95 backdrop-blur-md border border-stone-200/90 text-stone-700 hover:bg-stone-100 shadow-sm transition-all"
              aria-label="Select Language"
            >
              <Globe className="w-3.5 h-3.5 text-[#ea580c]" />
              <span className="uppercase font-bold tracking-wider">{locale}</span>
              <ChevronDown className={`w-3 h-3 text-stone-400 transition-transform ${showLangMenu ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {showLangMenu && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setShowLangMenu(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-36 bg-white/95 backdrop-blur-md rounded-2xl border border-stone-200/90 p-1.5 shadow-xl z-30 overflow-hidden"
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

          {/* Liquid Metal Shader Button (Desktop & Tablet) */}
          <div className="hidden sm:block shrink-0">
            <LiquidMetalButton
              label={t("join_community") || "Join Community"}
              href="/soloz-community"
              width={160}
              height={42}
            />
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setOpen(!open)}
            data-testid="mobile-menu-toggle"
            className="lg:hidden w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 bg-white/95 backdrop-blur-md border border-stone-200/90 shadow-sm text-stone-800 hover:bg-stone-100 shrink-0"
            aria-label="Menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            data-testid="mobile-menu"
            className="lg:hidden mx-4 mb-4 bg-white/98 backdrop-blur-2xl rounded-3xl p-3 border border-stone-200/90 shadow-2xl max-h-[calc(100vh-100px)] overflow-y-auto"
          >
            <Link
              href="/events/badminton-championship"
              onClick={() => setOpen(false)}
              className="block px-4 py-3 rounded-2xl text-xs font-extrabold bg-gradient-to-r from-orange-500 to-amber-500 text-white mb-3 text-center shadow-sm uppercase tracking-wider"
            >
              🏸 Badminton Championship (Season 1)
            </Link>

            {allMobileLinks.map((l: any) => {
              const isActive = pathname === l.href;
              const linkText = l.isCustom ? l.label : (t(l.labelKey) || l.defaultLabel);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  data-testid={`mobile-nav-${linkText.toLowerCase().replace(/\s+/g, "-")}`}
                  className={`block px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap ${
                    isActive
                      ? "bg-stone-900 text-white font-bold"
                      : "text-stone-700 hover:text-stone-900 hover:bg-stone-50"
                  }`}
                >
                  {linkText}
                </Link>
              );
            })}

            <div className="mx-3 my-2 h-px bg-stone-100" />

            {/* Mobile Language Selector */}
            <div className="px-4 py-2.5 flex items-center justify-between">
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
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
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

            <div className="p-2">
              <LiquidMetalButton
                label={t("join_community") || "Join Community"}
                href="/soloz-community"
                width={280}
                height={46}
                className="w-full flex justify-center"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
