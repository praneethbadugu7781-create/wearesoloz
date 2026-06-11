"use client";

import Link from "next/link";
import { Instagram, Phone } from "lucide-react";
import { brand, navItems } from "@/lib/data";
import { usePathname } from "next/navigation";

export function SiteFooter() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return (
    <footer className="border-t border-white/10 bg-black">
      <div className="section-shell grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-display text-3xl font-bold">{brand.name}</p>
          <p className="mt-3 max-w-md text-sm leading-6 text-white/60">
            {brand.secondaryTagline} A premium community for solo travelers, trekkers, bikers,
            photographers, spiritual explorers, and curious people ready for the road.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-soloz-amber">Explore</p>
          <div className="mt-4 grid gap-2">
            {navItems.slice(1, 6).map((item) => (
              <Link key={item.href} href={item.href} className="text-sm text-white/60 hover:text-white">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-soloz-amber">Contact</p>
          <div className="mt-4 grid gap-3 text-sm text-white/65">
            <a href={`tel:${brand.phone.replace(/\s/g, "")}`} className="flex items-center gap-2 hover:text-white">
              <Phone size={16} /> {brand.phone}
            </a>
            <a href={brand.instagram} className="flex items-center gap-2 hover:text-white">
              <Instagram size={16} /> @akhillrockstar
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-white/40">
        © {new Date().getFullYear()} {brand.name}. Built for journeys that become friendships.
      </div>
    </footer>
  );
}
