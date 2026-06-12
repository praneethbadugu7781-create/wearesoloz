"use client";

import React from "react";
import { MessageCircle, Users, Sparkles, MapPin } from "lucide-react";
import Reveal, { SectionLabel } from "@/components/Reveal";

interface CommunityClientProps {
  settings: any;
}

export default function CommunityClient({ settings = {} }: CommunityClientProps) {
  const whatsappLink = settings.whatsapp || settings.whatsapp_link || "https://wa.me/919966085310";
  const instagramLink = settings.instagram || settings.instagram_link || "https://www.instagram.com/wearesolozindia?igsh=MWZjNjN0MXhidWJ2Yw==";

  return (
    <div data-testid="community-page" className="bg-white min-h-screen text-[#1c1917]">
      <section className="relative pt-40 pb-16 px-6 md:px-10 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1530789253388-582c481c54b0?auto=format&fit=crop&w=2400&q=85"
            alt=""
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/15 to-white" />
        </div>
        <div className="relative max-w-5xl mx-auto text-center">
          <SectionLabel>The Soloz Community</SectionLabel>
          <h1 className="font-display text-5xl md:text-7xl font-light tracking-tighter mt-5 text-white">
            Solo at start. <br /><span className="gradient-text font-medium">Family by the end.</span>
          </h1>
          <p className="text-white/90 mt-8 max-w-2xl mx-auto leading-relaxed font-body">
            A growing family of travelers, trekkers, bikers, photographers and dreamers. Real conversations. Real meetups. Real adventures.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-10 justify-center">
            <a
              data-testid="community-whatsapp"
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 gradient-orange text-white px-7 py-4 rounded-full font-medium hover:scale-[1.02] transition-transform"
            >
              <MessageCircle className="w-4 h-4" /> Join WhatsApp Community
            </a>
            <a
              data-testid="community-instagram"
              href={instagramLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 glass text-stone-900 px-7 py-4 rounded-full font-medium hover:bg-stone-100 border border-stone-200 transition-colors"
            >
              Follow on Instagram
            </a>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 md:px-10">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Users,
              title: "Travel Buddies",
              text: "Find fellow soloz heading the same way. Bikes, treks, weekend escapes.",
            },
            {
              icon: Sparkles,
              title: "Meetups",
              text: "City meetups, photo walks, sunset gatherings — across India.",
            },
            {
              icon: MapPin,
              title: "Group Adventures",
              text: "Curated group trips to mountains, temples, coasts and beyond.",
            },
          ].map((c) => (
            <div key={c.title} className="glass rounded-2xl p-8 hover-lift border border-stone-200">
              <div className="w-12 h-12 rounded-full bg-soloz-primary/15 border border-soloz-primary/30 flex items-center justify-center mb-5">
                <c.icon className="w-5 h-5 text-soloz-primary" />
              </div>
              <div className="font-display text-2xl font-medium text-stone-900">{c.title}</div>
              <div className="text-soloz-textSecondary mt-2 leading-relaxed font-body">{c.text}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
