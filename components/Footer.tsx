"use client";

import React from "react";
import Link from "next/link";
import { Instagram, Phone, MessageCircle, Youtube } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <footer data-testid="footer" className="relative border-t border-stone-200 bg-stone-50 overflow-hidden">
      <div className="absolute inset-0 radial-orange-glow opacity-20 pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-6 md:px-10 py-20 grid md:grid-cols-4 gap-12">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-5">
            <img
              src="/logo.png"
              alt="WeAreSoloz"
              className="h-14 w-14 rounded-full object-cover ring-2 ring-orange-500/15"
            />
            <div>
              <div className="font-sans text-xl font-bold text-stone-900">
                We<span className="text-[#ea580c]">Are</span>Soloz
              </div>
              <div className="text-[9px] uppercase tracking-[0.3em] text-stone-400 font-medium mt-0.5">
                Travel Solo · You're Not Alone
              </div>
            </div>
          </div>
          <p className="text-stone-500 max-w-md leading-relaxed text-sm font-body">
            A family of solo explorers crossing mountains, temples, villages and hidden trails. Travel Solo. You&apos;re Not Alone.
          </p>
          <div className="flex items-center gap-3 mt-6">
            <a data-testid="footer-youtube" href="https://youtube.com/@akhillrockstartravelstories?si=_c7w-zLBaUwBgMSi" target="_blank" rel="noreferrer" className="w-11 h-11 rounded-full bg-white border border-stone-100 flex items-center justify-center hover:bg-red-50 hover:text-[#ef4444] hover:border-red-200 transition-all text-stone-500 shadow-sm">
              <Youtube className="w-4 h-4" />
            </a>
            <a data-testid="footer-instagram" href="https://www.instagram.com/wearesolozindia?igsh=MWZjNjN0MXhidWJ2Yw==" target="_blank" rel="noreferrer" className="w-11 h-11 rounded-full bg-white border border-stone-100 flex items-center justify-center hover:bg-orange-50 hover:text-[#ea580c] hover:border-orange-200 transition-all text-stone-500 shadow-sm">
              <Instagram className="w-4 h-4" />
            </a>
            <a data-testid="footer-whatsapp" href="https://wa.me/919966085310" target="_blank" rel="noreferrer" className="w-11 h-11 rounded-full bg-white border border-stone-100 flex items-center justify-center hover:bg-orange-50 hover:text-[#ea580c] hover:border-orange-200 transition-all text-stone-500 shadow-sm">
              <MessageCircle className="w-4 h-4" />
            </a>
            <a data-testid="footer-phone" href="tel:+919966085310" className="w-11 h-11 rounded-full bg-white border border-stone-100 flex items-center justify-center hover:bg-orange-50 hover:text-[#ea580c] hover:border-orange-200 transition-all text-stone-500 shadow-sm">
              <Phone className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-[#ea580c] font-semibold mb-5">Explore</div>
          <ul className="space-y-3 text-sm text-stone-500">
            <li><Link href="/upcoming-trips" className="hover:text-stone-900 transition-colors">Upcoming Trips</Link></li>
            <li><Link href="/travel-stories" className="hover:text-stone-900 transition-colors">Travel Stories</Link></li>
            <li><Link href="/gallery" className="hover:text-stone-900 transition-colors">Gallery</Link></li>
            <li><Link href="/soloz-community" className="hover:text-stone-900 transition-colors">Community</Link></li>
          </ul>
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-[#ea580c] font-semibold mb-5">Connect</div>
          <ul className="space-y-3 text-sm text-stone-500">
            <li><Link href="/about-akhil" className="hover:text-stone-900 transition-colors">About Akhil</Link></li>
            <li><Link href="/contact" className="hover:text-stone-900 transition-colors">Contact</Link></li>
            <li><a href="tel:+919966085310" className="hover:text-stone-900 transition-colors">+91 9966085310</a></li>
            <li><a href="https://www.instagram.com/wearesolozindia?igsh=MWZjNjN0MXhidWJ2Yw==" target="_blank" rel="noreferrer" className="hover:text-stone-900 transition-colors">@wearesolozindia</a></li>
            <li><a href="https://youtube.com/@akhillrockstartravelstories?si=_c7w-zLBaUwBgMSi" target="_blank" rel="noreferrer" className="hover:text-stone-900 transition-colors">YouTube Channel</a></li>
          </ul>
        </div>
      </div>
      <div className="relative border-t border-stone-200 py-6 text-center text-xs text-stone-400 font-medium">
        © {new Date().getFullYear()} WeAreSoloz · Built with ❤️ for solo travelers
      </div>
    </footer>
  );
}
