"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { brand, navItems } from "@/lib/data";
import { cn } from "@/lib/utils";

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (pathname?.startsWith("/admin")) return null;

  const openBookingModal = (e: React.MouseEvent) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent("open-booking-modal"));
    setOpen(false);
  };

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled ? "border-b border-white/10 bg-black/45 shadow-2xl backdrop-blur-xl" : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 md:px-8">
        {/* Brand Logo & Tagline */}
        <Link href="/" className="group flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-full border border-soloz-ember/50 bg-soloz-ember/15 text-sm font-black text-soloz-ember transition-transform group-hover:scale-105 duration-300">
            WS
          </span>
          <span>
            <span className="block font-display text-lg font-bold leading-none tracking-tight">{brand.name}</span>
            <span className="text-[9px] uppercase tracking-[0.25em] text-soloz-ash/60">Community</span>
          </span>
        </Link>

        {/* Navigation links (Desktop) */}
        <nav className="hidden items-center gap-8 lg:flex">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href} 
              className={cn(
                "text-xs uppercase tracking-wider font-semibold text-soloz-ash/80 transition-colors hover:text-white duration-200",
                pathname === item.href && "text-soloz-ember"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Action Button (Desktop & Mobile Header) */}
        <div className="flex items-center gap-3">
          {/* Tripvana style sliding button */}
          <a href="#" onClick={openBookingModal} className="button-01 transparent w-inline-block">
            <div className="button-text-block">
              <div className="button-text">Book Now</div>
              <div className="button-text-02">Book Now</div>
            </div>
            <div className="button-icon-block transparent">
              <div className="button-arrow-block">
                <div className="arrow-item">
                  <svg width="14" height="14" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15.4999 0H7.16657V0.666667H15.3619L0.503906 15.5247L0.97524 15.996L15.8332 1.138V9.33333H16.4999V1C16.4999 0.448667 16.0512 0 15.4999 0Z" fill="currentColor"/>
                  </svg>
                </div>
                <div className="arrow-item-02">
                  <svg width="14" height="14" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15.4999 0H7.16657V0.666667H15.3619L0.503906 15.5247L0.97524 15.996L15.8332 1.138V9.33333H16.4999V1C16.4999 0.448667 16.0512 0 15.4999 0Z" fill="currentColor"/>
                  </svg>
                </div>
              </div>
            </div>
            <div className="hover-eliment transparent"></div>
          </a>

          {/* Hamburger Menu Toggle (Mobile) */}
          <button
            aria-label="Toggle menu"
            className="grid size-10 place-items-center rounded-full border border-white/10 bg-white/5 text-white lg:hidden hover:bg-white/10 transition-colors"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {open ? (
        <div className="border-t border-white/10 bg-black/95 px-4 py-6 backdrop-blur-xl lg:hidden animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="grid gap-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-xl px-4 py-3 text-sm font-semibold uppercase tracking-wider text-soloz-ash/80 hover:bg-white/5 hover:text-white transition-all duration-200",
                  pathname === item.href && "bg-white/5 text-soloz-ember"
                )}
              >
                {item.label}
              </Link>
            ))}
            <a 
              href="#" 
              onClick={openBookingModal} 
              className="button-01 transparent justify-center w-full mt-4 py-3"
            >
              <div className="button-text-block mx-auto">
                <div className="button-text">Book Now</div>
                <div className="button-text-02">Book Now</div>
              </div>
              <div className="button-icon-block transparent">
                <div className="button-arrow-block">
                  <div className="arrow-item">
                    <svg width="14" height="14" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M15.4999 0H7.16657V0.666667H15.3619L0.503906 15.5247L0.97524 15.996L15.8332 1.138V9.33333H16.4999V1C16.4999 0.448667 16.0512 0 15.4999 0Z" fill="currentColor"/>
                    </svg>
                  </div>
                  <div className="arrow-item-02">
                    <svg width="14" height="14" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M15.4999 0H7.16657V0.666667H15.3619L0.503906 15.5247L0.97524 15.996L15.8332 1.138V9.33333H16.4999V1C16.4999 0.448667 16.0512 0 15.4999 0Z" fill="currentColor"/>
                    </svg>
                  </div>
                </div>
              </div>
              <div className="hover-eliment transparent"></div>
            </a>
          </div>
        </div>
      ) : null}
    </header>
  );
}
