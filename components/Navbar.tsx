"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/LanguageContext";
import { Locale } from "@/lib/translations";

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

  const isPlainPage = 
    pathname.startsWith("/about-akhil") ||
    pathname.startsWith("/careers") ||
    pathname.startsWith("/farmer-registration") ||
    pathname.startsWith("/gallery") ||
    pathname.startsWith("/contact") ||
    pathname.startsWith("/admin");

  const showScrolled = scrolled || isPlainPage;

  // Localized navigation items
  const localizedLinks = [
    { href: "/", label: t("nav_home") },
    { href: "/upcoming-trips", label: t("nav_trips") },
    { href: "/soloz-community", label: t("nav_community") },
    { href: "/gallery", label: t("nav_gallery") },
    { href: "/about-akhil", label: t("nav_about") },
    { href: "/careers", label: t("nav_careers") },
    { href: "/farmer-registration", label: t("nav_farmer_trip") },
    { href: "/contact", label: t("nav_contact") },
  ];

  return (
    <header
      data-testid="navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        showScrolled
          ? "bg-white/80 backdrop-blur-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] border-b border-stone-100 py-2"
          : "bg-white/5 backdrop-blur-md border-b border-white/10 shadow-sm py-4"
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
              className={`rounded-full object-cover transition-all duration-300 ring-2 ring-orange-500/45 group-hover:ring-orange-500 shadow-[0_0_12px_rgba(234,88,12,0.25)] group-hover:shadow-[0_0_20px_rgba(234,88,12,0.5)] ${
                showScrolled ? "h-12 w-12 md:h-14 md:w-14" : "h-14 w-14 md:h-16 md:w-16"
              }`}
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white animate-pulse" />
          </div>
          <div className="leading-none">
            <div className={`font-sans font-extrabold tracking-tight transition-all duration-300 ${
              showScrolled ? "text-lg md:text-xl text-stone-900" : "text-xl md:text-2xl text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
            }`}>
              We<span className="text-[#ea580c]">Are</span>Soloz
            </div>
            <div className={`text-[8.5px] md:text-[10px] uppercase tracking-[0.08em] md:tracking-[0.2em] transition-all duration-300 ${
              showScrolled ? "text-stone-500" : "text-white/95 drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]"
            } font-semibold mt-0.5 whitespace-nowrap`}>
              Travel Solo · You're Not Alone
            </div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className={`hidden lg:flex items-center gap-1 xl:gap-1.5 backdrop-blur-sm rounded-full px-2 py-1.5 border transition-all duration-300 ${
          showScrolled ? "bg-stone-50/80 border-stone-100" : "bg-white/10 border-white/10"
        }`}>
          {localizedLinks.map((l) => {
            const isActive = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                data-testid={`nav-${l.label.toLowerCase().replace(/\s+/g, "-")}`}
                className={`relative px-3.5 xl:px-4 py-2 text-[13.5px] xl:text-[14.5px] font-semibold rounded-full transition-all duration-300 ${
                  isActive
                    ? (showScrolled ? "bg-white text-stone-900 shadow-sm" : "bg-white/20 text-white shadow-sm")
                    : (showScrolled ? "text-stone-500 hover:text-stone-900 hover:bg-white/60" : "text-white/80 hover:text-white hover:bg-white/10")
                }`}
              >
                {l.label}
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#ea580c]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* CTA + Language Selector + Mobile Toggle */}
        <div className="flex items-center gap-3">
          {/* Desktop Language Selector */}
          <div className="relative hidden lg:block">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-[12px] font-bold transition-all duration-300 border ${
                showScrolled
                  ? "bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200"
                  : "bg-white/10 hover:bg-white/20 text-white border-white/10"
              }`}
              aria-label="Select Language"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="uppercase">{locale}</span>
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
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                          locale === lang.code
                            ? "bg-orange-50 text-[#ea580c] font-bold"
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

          <Link
            href="/soloz-community"
            data-testid="nav-join-community"
            className={`hidden md:inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-semibold transition-all duration-300 hover:shadow-lg ${
              showScrolled
                ? "bg-stone-900 text-white hover:bg-stone-800 hover:shadow-stone-900/10"
                : "bg-white text-stone-900 hover:bg-stone-100 hover:shadow-white/10"
            }`}
          >
            {t("join_community")}
          </Link>
          
          <button
            onClick={() => setOpen(!open)}
            data-testid="mobile-menu-toggle"
            className={`lg:hidden w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
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
            {localizedLinks.map((l) => {
              const isActive = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  data-testid={`mobile-nav-${l.label.toLowerCase().replace(/\s+/g, "-")}`}
                  className={`block px-4 py-3 rounded-xl text-base font-semibold transition-colors ${
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
            
            {/* Mobile Language Selector */}
            <div className="px-4 py-3 flex items-center justify-between">
              <span className="text-stone-500 text-sm font-semibold flex items-center gap-1.5">
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
            <Link
              href="/soloz-community"
              className="block mx-2 mb-2 text-center px-4 py-3 rounded-xl bg-stone-900 text-white text-base font-bold"
            >
              {t("join_community")}
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
