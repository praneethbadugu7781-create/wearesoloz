"use client";

import React from "react";
import Link from "next/link";
import { Instagram, Phone, MessageCircle, Youtube, ArrowRight, ArrowUpRight, Heart } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer data-testid="footer" className="relative rounded-t-[3rem] md:rounded-t-[5rem] border-t border-stone-200 bg-white text-stone-600 overflow-hidden font-body mt-20 shadow-[0_-8px_30px_rgb(0,0,0,0.02)]">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[500px] bg-gradient-to-br from-[#ea580c]/3 to-transparent rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[400px] bg-gradient-to-tr from-[#12352d]/5 to-transparent rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 md:px-10 pt-24 pb-12 z-10">
        
        {/* Bento Grid Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          
          {/* Card 1: Brand & Stats */}
          <div className="lg:col-span-2 rounded-3xl border border-stone-200/60 bg-stone-50/50 p-8 flex flex-col justify-between space-y-8 hover:border-stone-300 hover:bg-stone-50/80 transition-all duration-300 shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center gap-3.5">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#ea580c] rounded-full blur-sm opacity-20" />
                  <img
                    src="/logo.png"
                    alt="WeAreSoloz Logo"
                    className="relative h-14 w-14 rounded-full object-cover ring-2 ring-[#ea580c]/30"
                  />
                </div>
                <div>
                  <div className="font-sans text-xl font-bold text-stone-900 tracking-tight">
                    We<span className="text-[#ea580c]">Are</span>Soloz
                  </div>
                  <div className="text-[9px] uppercase tracking-[0.3em] text-[#ff7a1a] font-semibold mt-0.5">
                    Travel Solo · You're Not Alone
                  </div>
                </div>
              </div>
              <p className="text-stone-600 leading-relaxed text-sm max-w-md">
                A premium travel club for solo explorers. Crossing mountain peaks, sacred temples, untouched villages, and hidden forest trails together.
              </p>
            </div>

            {/* Community Stats */}
            <div className="grid grid-cols-3 gap-4 border-t border-stone-100 pt-6">
              <div>
                <div className="text-2xl font-bold text-stone-900 font-sans">12+</div>
                <div className="text-[10px] uppercase tracking-widest text-[#ff7a1a] font-semibold mt-0.5">Countries</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-stone-900 font-sans">50+</div>
                <div className="text-[10px] uppercase tracking-widest text-[#ff7a1a] font-semibold mt-0.5">Trails</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-stone-900 font-sans">2k+</div>
                <div className="text-[10px] uppercase tracking-widest text-[#ff7a1a] font-semibold mt-0.5">Explorers</div>
              </div>
            </div>
          </div>

          {/* Card 2: Community CTA Card */}
          <div className="lg:col-span-2 rounded-3xl border border-stone-200/60 bg-gradient-to-br from-orange-50/20 via-stone-50/50 to-emerald-50/10 p-8 flex flex-col justify-between space-y-6 relative overflow-hidden group hover:border-[#ea580c]/30 hover:bg-stone-50/80 transition-all duration-300 shadow-sm">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#ea580c]/5 rounded-full blur-2xl pointer-events-none group-hover:bg-[#ea580c]/8 transition-colors" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#12352d]/5 rounded-full blur-xl pointer-events-none" />
            
            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ea580c]/10 text-[#ff7a1a] text-[10px] font-bold tracking-widest uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ea580c] animate-pulse" />
                  Active Clan
                </span>
                <span className="text-[10px] text-stone-500 font-mono">
                  Coordinates: 10.08° N, 77.06° E
                </span>
              </div>
              <h3 className="font-display text-2xl font-bold text-stone-900 leading-tight">
                Leave your footprints <br />
                <span className="text-[#ea580c] italic font-normal font-display">where others fear to tread.</span>
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed max-w-sm">
                Ready to find your family? Join our active solo travel community on WhatsApp to get real-time schedule updates, coordinates, and itineraries.
              </p>
            </div>

            <a
              href="https://wa.me/919966085310"
              target="_blank"
              rel="noreferrer"
              className="relative z-10 w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-[#ea580c] to-[#ff7a1a] text-white hover:from-[#ff7a1a] hover:to-[#ea580c] font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-[0_4px_20px_rgba(234,88,12,0.15)] hover:shadow-[0_4px_25px_rgba(234,88,12,0.3)]"
            >
              Join WhatsApp Community
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>

          {/* Card 3: Explore Links */}
          <div className="rounded-3xl border border-stone-200/60 bg-stone-50/50 p-6 space-y-6 hover:border-stone-300 hover:bg-stone-50/80 transition-all duration-300 shadow-sm">
            <div className="text-xs uppercase tracking-[0.25em] text-[#ea580c] font-bold border-l-2 border-[#ea580c] pl-3">
              Explore
            </div>
            <ul className="space-y-3.5 text-sm text-stone-600">
              <li>
                <Link href="/upcoming-trips" className="group flex items-center gap-2 hover:text-[#ff7a1a] transition-all duration-300 hover:translate-x-1">
                  <ArrowRight className="w-3.5 h-3.5 text-[#ea580c] opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 shrink-0" />
                  Upcoming Trips
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="group flex items-center gap-2 hover:text-[#ff7a1a] transition-all duration-300 hover:translate-x-1">
                  <ArrowRight className="w-3.5 h-3.5 text-[#ea580c] opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 shrink-0" />
                  Gallery
                </Link>
              </li>
              <li>
                <Link href="/soloz-community" className="group flex items-center gap-2 hover:text-[#ff7a1a] transition-all duration-300 hover:translate-x-1">
                  <ArrowRight className="w-3.5 h-3.5 text-[#ea580c] opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 shrink-0" />
                  Community
                </Link>
              </li>
            </ul>
          </div>

          {/* Card 4: Connect Links */}
          <div className="rounded-3xl border border-stone-200/60 bg-stone-50/50 p-6 space-y-6 hover:border-stone-300 hover:bg-stone-50/80 transition-all duration-300 shadow-sm">
            <div className="text-xs uppercase tracking-[0.25em] text-[#ea580c] font-bold border-l-2 border-[#ea580c] pl-3">
              Connect
            </div>
            <ul className="space-y-3.5 text-sm text-stone-600 font-medium">
              <li>
                <Link href="/about-akhil" className="group flex items-center gap-2 hover:text-[#ff7a1a] transition-all duration-300 hover:translate-x-1">
                  <ArrowRight className="w-3.5 h-3.5 text-[#ea580c] opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 shrink-0" />
                  About Akhil
                </Link>
              </li>
              <li>
                <Link href="/careers" className="group flex items-center gap-2 hover:text-[#ff7a1a] transition-all duration-300 hover:translate-x-1">
                  <ArrowRight className="w-3.5 h-3.5 text-[#ea580c] opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 shrink-0" />
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/contact" className="group flex items-center gap-2 hover:text-[#ff7a1a] transition-all duration-300 hover:translate-x-1">
                  <ArrowRight className="w-3.5 h-3.5 text-[#ea580c] opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 shrink-0" />
                  Contact
                </Link>
              </li>
              <li>
                <a href="tel:+919966085310" className="group flex items-center gap-2 hover:text-[#ff7a1a] transition-all duration-300 hover:translate-x-1">
                  <ArrowRight className="w-3.5 h-3.5 text-[#ea580c] opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 shrink-0" />
                  +91 9966085310
                </a>
              </li>
              <li>
                <a href="https://www.instagram.com/wearesolozindia?igsh=MWZjNjN0MXhidWJ2Yw==" target="_blank" rel="noreferrer" className="group flex items-center gap-2 hover:text-[#ff7a1a] transition-all duration-300 hover:translate-x-1">
                  <ArrowRight className="w-3.5 h-3.5 text-[#ea580c] opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 shrink-0" />
                  @wearesolozindia
                </a>
              </li>
            </ul>
          </div>

          {/* Card 5: Founder Quote Card */}
          <div className="lg:col-span-2 rounded-3xl border border-stone-200/60 bg-stone-50/50 p-6 flex flex-col sm:flex-row items-center gap-6 group hover:border-[#ea580c]/30 hover:bg-stone-50/80 transition-all duration-300 shadow-sm">
            <img
              src="/images/akhil.jpg"
              alt="Akhil Founder"
              className="w-16 h-16 rounded-full object-cover border-2 border-[#ea580c]/30 shadow-md shadow-[#ea580c]/10 shrink-0"
            />
            <div className="space-y-2 text-center sm:text-left">
              <p className="text-stone-800 leading-relaxed text-sm font-display italic">
                &ldquo;If you think travel is expensive, wait until you see the price of a wasted life.&rdquo;
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <span className="text-xs uppercase tracking-widest text-[#ff7a1a] font-bold">
                  — Akhil, Founder
                </span>
                <Link href="/about-akhil" className="text-[10px] uppercase tracking-wider font-bold text-stone-900 hover:text-[#ff7a1a] inline-flex items-center justify-center gap-1 transition-colors font-sans">
                  Read Founder's Story <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>

        </div>

        {/* Dynamic Massive Statement Backdrop */}
        <div className="absolute bottom-16 left-0 right-0 text-center select-none pointer-events-none z-0 overflow-hidden leading-none">
          <span 
            className="text-[12vw] font-black uppercase tracking-[0.15em] text-transparent opacity-40 block"
            style={{ WebkitTextStroke: "2px #f5f5f4" }}
          >
            WE ARE SOLOZ
          </span>
        </div>

        {/* Footer Bottom copyright */}
        <div className="relative border-t border-stone-100 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500 font-medium z-10">
          <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
            <span>© {new Date().getFullYear()} WeAreSoloz. All rights reserved.</span>
            <span className="text-stone-300 hidden sm:inline">|</span>
            <span className="flex items-center gap-1 justify-center">
              Built with <Heart className="w-3 h-3 text-[#ea580c] fill-[#ea580c]" /> for solo travellers
            </span>
          </div>
          
          {/* Social Icons & Back to Top */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <a href="https://youtube.com/@akhillrockstartravelstories?si=_c7w-zLBaUwBgMSi" target="_blank" rel="noreferrer" className="hover:text-stone-900 transition-colors duration-300 text-stone-400">
                <Youtube className="w-4 h-4" />
              </a>
              <a href="https://www.instagram.com/wearesolozindia?igsh=MWZjNjN0MXhidWJ2Yw==" target="_blank" rel="noreferrer" className="hover:text-stone-900 transition-colors duration-300 text-stone-400">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://wa.me/919966085310" target="_blank" rel="noreferrer" className="hover:text-stone-900 transition-colors duration-300 text-stone-400">
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
            <button 
              type="button"
              onClick={scrollToTop} 
              className="text-stone-400 hover:text-stone-900 transition-colors duration-300 flex items-center gap-1.5"
            >
              Back to Top
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
