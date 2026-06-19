"use client";

import React from "react";
import Link from "next/link";
import { Instagram, Phone, MessageCircle, Youtube, ArrowUpRight, Heart } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer data-testid="footer" className="relative border-t border-white/10 bg-[#0c0a09] text-stone-300 overflow-hidden font-body">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-[#ea580c]/5 to-transparent rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-gradient-to-tr from-[#12352d]/15 to-transparent rounded-full blur-[100px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 md:px-10 pt-20 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <div className="space-y-6 lg:col-span-1">
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
                <div className="font-sans text-xl font-bold text-white tracking-tight">
                  We<span className="text-[#ea580c]">Are</span>Soloz
                </div>
                <div className="text-[9px] uppercase tracking-[0.3em] text-[#ff7a1a] font-semibold mt-0.5">
                  Travel Solo · You're Not Alone
                </div>
              </div>
            </div>
            <p className="text-stone-400 leading-relaxed text-sm">
              A premium travel club for solo explorers. Crossing mountain peaks, sacred temples, untouched villages, and hidden forest trails together.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a 
                data-testid="footer-youtube" 
                href="https://youtube.com/@akhillrockstartravelstories?si=_c7w-zLBaUwBgMSi" 
                target="_blank" 
                rel="noreferrer" 
                className="w-10 h-10 rounded-full border border-white/10 bg-white/[0.02] flex items-center justify-center hover:bg-[#ef4444] hover:text-white hover:border-[#ef4444] hover:shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all duration-300 text-stone-400 group"
              >
                <Youtube className="w-4 h-4 transition-transform group-hover:scale-110" />
              </a>
              <a 
                data-testid="footer-instagram" 
                href="https://www.instagram.com/wearesolozindia?igsh=MWZjNjN0MXhidWJ2Yw==" 
                target="_blank" 
                rel="noreferrer" 
                className="w-10 h-10 rounded-full border border-white/10 bg-white/[0.02] flex items-center justify-center hover:bg-gradient-to-tr hover:from-[#f9ce34] hover:to-[#ee2a7b] hover:text-white hover:border-transparent hover:shadow-[0_0_15px_rgba(238,42,123,0.4)] transition-all duration-300 text-stone-400 group"
              >
                <Instagram className="w-4 h-4 transition-transform group-hover:scale-110" />
              </a>
              <a 
                data-testid="footer-whatsapp" 
                href="https://wa.me/919966085310" 
                target="_blank" 
                rel="noreferrer" 
                className="w-10 h-10 rounded-full border border-white/10 bg-white/[0.02] flex items-center justify-center hover:bg-[#25d366] hover:text-white hover:border-[#25d366] hover:shadow-[0_0_15px_rgba(37,211,102,0.4)] transition-all duration-300 text-stone-400 group"
              >
                <MessageCircle className="w-4 h-4 transition-transform group-hover:scale-110" />
              </a>
              <a 
                data-testid="footer-phone" 
                href="tel:+919966085310" 
                className="w-10 h-10 rounded-full border border-white/10 bg-white/[0.02] flex items-center justify-center hover:bg-[#ea580c] hover:text-white hover:border-[#ea580c] hover:shadow-[0_0_15px_rgba(234,88,12,0.4)] transition-all duration-300 text-stone-400 group"
              >
                <Phone className="w-4 h-4 transition-transform group-hover:scale-110" />
              </a>
            </div>
          </div>

          {/* Quick Links: Explore */}
          <div className="space-y-5">
            <div className="text-xs uppercase tracking-[0.25em] text-white font-bold border-l-2 border-[#ea580c] pl-3">
              Explore
            </div>
            <ul className="space-y-3.5 text-sm text-stone-400">
              <li>
                <Link href="/upcoming-trips" className="hover:text-[#ff7a1a] transition-all duration-300 flex items-center gap-1.5 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ea580c] scale-0 group-hover:scale-100 transition-transform duration-300" />
                  Upcoming Trips
                </Link>
              </li>
              <li>
                <Link href="/travel-stories" className="hover:text-[#ff7a1a] transition-all duration-300 flex items-center gap-1.5 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ea580c] scale-0 group-hover:scale-100 transition-transform duration-300" />
                  Travel Stories
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-[#ff7a1a] transition-all duration-300 flex items-center gap-1.5 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ea580c] scale-0 group-hover:scale-100 transition-transform duration-300" />
                  Gallery
                </Link>
              </li>
              <li>
                <Link href="/soloz-community" className="hover:text-[#ff7a1a] transition-all duration-300 flex items-center gap-1.5 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ea580c] scale-0 group-hover:scale-100 transition-transform duration-300" />
                  Community
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links: Connect */}
          <div className="space-y-5">
            <div className="text-xs uppercase tracking-[0.25em] text-white font-bold border-l-2 border-[#ea580c] pl-3">
              Connect
            </div>
            <ul className="space-y-3.5 text-sm text-stone-400">
              <li>
                <Link href="/about-akhil" className="hover:text-[#ff7a1a] transition-all duration-300 flex items-center gap-1.5 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ea580c] scale-0 group-hover:scale-100 transition-transform duration-300" />
                  About Akhil
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-[#ff7a1a] transition-all duration-300 flex items-center gap-1.5 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ea580c] scale-0 group-hover:scale-100 transition-transform duration-300" />
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#ff7a1a] transition-all duration-300 flex items-center gap-1.5 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ea580c] scale-0 group-hover:scale-100 transition-transform duration-300" />
                  Contact
                </Link>
              </li>
              <li>
                <a href="tel:+919966085310" className="hover:text-[#ff7a1a] transition-all duration-300 flex items-center gap-1.5 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ea580c] scale-0 group-hover:scale-100 transition-transform duration-300" />
                  +91 9966085310
                </a>
              </li>
              <li>
                <a href="https://www.instagram.com/wearesolozindia?igsh=MWZjNjN0MXhidWJ2Yw==" target="_blank" rel="noreferrer" className="hover:text-[#ff7a1a] transition-all duration-300 flex items-center gap-1.5 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ea580c] scale-0 group-hover:scale-100 transition-transform duration-300" />
                  @wearesolozindia
                </a>
              </li>
              <li>
                <a href="https://youtube.com/@akhillrockstartravelstories?si=_c7w-zLBaUwBgMSi" target="_blank" rel="noreferrer" className="hover:text-[#ff7a1a] transition-all duration-300 flex items-center gap-1.5 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ea580c] scale-0 group-hover:scale-100 transition-transform duration-300" />
                  YouTube Channel
                </a>
              </li>
            </ul>
          </div>

          {/* CTA Box Column */}
          <div className="lg:col-span-1">
            <div className="relative rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-4 overflow-hidden group hover:border-[#ea580c]/30 transition-colors duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#ea580c]/5 rounded-full blur-xl pointer-events-none transition-all group-hover:bg-[#ea580c]/10" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white tracking-wide">Next Solo Trip?</h4>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Join our exclusive WhatsApp community. Chat with fellow travelers and get real-time schedule updates.
                </p>
              </div>
              <a 
                href="https://wa.me/919966085310" 
                target="_blank" 
                rel="noreferrer" 
                className="w-full py-2.5 px-4 rounded-xl bg-[#ea580c] text-white hover:bg-[#ff7a1a] font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md hover:shadow-[0_0_15px_rgba(234,88,12,0.35)]"
              >
                Join Community <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500 font-medium">
          <div className="flex items-center gap-1.5">
            <span>© {new Date().getFullYear()} WeAreSoloz. All rights reserved.</span>
            <span className="text-stone-700 hidden sm:inline">|</span>
            <span className="flex items-center gap-1">
              Built with <Heart className="w-3 h-3 text-[#ea580c] fill-[#ea580c]" /> for solo travellers
            </span>
          </div>
          <button 
            type="button"
            onClick={scrollToTop} 
            className="text-stone-500 hover:text-white transition-colors duration-300 flex items-center gap-1"
          >
            Back to Top
          </button>
        </div>
      </div>
    </footer>
  );
}
