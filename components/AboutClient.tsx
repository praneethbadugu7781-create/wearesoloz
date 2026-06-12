"use client";

import React from "react";
import Link from "next/link";
import { Instagram, Phone, MessageCircle, Mountain, Compass, Camera, Users, Car, Heart, ArrowRight } from "lucide-react";
import Reveal, { SectionLabel } from "@/components/Reveal";

interface AboutClientProps {
  settings: any;
}

const offerings = [
  { icon: Mountain, label: "Trekking Adventures", emoji: "🏔️" },
  { icon: Compass, label: "Spiritual & Temple Tours", emoji: "🛕" },
  { icon: Heart, label: "Hidden Destinations", emoji: "🌍" },
  { icon: Camera, label: "Travel Stories & Experiences", emoji: "📸" },
  { icon: Users, label: "Travel Community Meetups", emoji: "🤝" },
  { icon: Car, label: "Road Trips & Group Journeys", emoji: "🚗" },
];

export default function AboutClient({ settings = {} }: AboutClientProps) {
  const founderImage = settings.founder_image || settings.founderImage || "/images/akhil.jpg";
  const instagramLink = settings.instagram_link || "https://www.instagram.com/akhillrockstar";
  const whatsappLink = settings.whatsapp_link || "https://wa.me/919966085310";

  return (
    <div data-testid="about-page" className="bg-white min-h-screen text-[#1c1917] pt-20">

      {/* HERO — About Me */}
      <section className="relative pt-32 pb-20 px-6 md:px-10">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <Reveal className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl shadow-stone-300/30 bg-stone-100">
            <img
              src={founderImage}
              alt="Akhil - Founder of WeAreSoloz"
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </Reveal>

          <Reveal>
            <SectionLabel>About Me</SectionLabel>
            <h1 className="font-display text-5xl md:text-7xl font-light tracking-tighter mt-5 text-stone-900">
              Hi, I&apos;m <span className="gradient-text">Akhil</span>.
            </h1>

            <div className="space-y-5 mt-10 text-stone-600 leading-relaxed font-body">
              <p>
                I&apos;m the creator of <strong className="text-stone-900">Akhill Rockstar Travel Stories</strong> and founder of <strong className="text-stone-900">WeAreSoloz</strong>.
              </p>
              <p>
                For the past 7+ years, I&apos;ve been exploring India, traveling through mountains, temples, villages, forests, trekking routes, and hidden destinations that many travelers never get to experience.
              </p>
              <p>
                What started as a personal passion for travel slowly became a journey of collecting stories, meeting incredible people, understanding different cultures, and creating unforgettable memories on the road.
              </p>
              <p>
                I&apos;ve traveled solo across various parts of India, visited spiritual destinations like Kedarnath, Badrinath, Kottiyoor, Mana Village, and many other remarkable places. Through every journey, I&apos;ve learned that travel is not just about destinations—it&apos;s about the people we meet, the experiences we share, and the memories we create.
              </p>
              <p className="text-stone-900 font-semibold text-lg">
                That&apos;s why I started WeAreSoloz.
              </p>
              <p>
                Many people want to travel but often don&apos;t have someone to travel with. WeAreSoloz is a community where travelers can join solo and become part of a travel family.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 mt-10">
              <a
                data-testid="about-instagram"
                href={instagramLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-white rounded-full px-5 py-2.5 text-sm font-medium border border-stone-200 hover:border-orange-200 hover:bg-orange-50 hover:text-[#ea580c] transition-all shadow-sm text-stone-700"
              >
                <Instagram className="w-4 h-4" /> @akhillrockstar
              </a>
              <a
                data-testid="about-phone"
                href="tel:+919966085310"
                className="inline-flex items-center gap-2 bg-white rounded-full px-5 py-2.5 text-sm font-medium border border-stone-200 hover:border-orange-200 hover:bg-orange-50 hover:text-[#ea580c] transition-all shadow-sm text-stone-700"
              >
                <Phone className="w-4 h-4" /> +91 9966085310
              </a>
              <a
                data-testid="about-whatsapp"
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-white rounded-full px-5 py-2.5 text-sm font-medium border border-stone-200 hover:border-orange-200 hover:bg-orange-50 hover:text-[#ea580c] transition-all shadow-sm text-stone-700"
              >
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* SECTION 2 — Our Mission */}
      <section className="py-24 px-6 md:px-10 border-t border-stone-200">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <SectionLabel>Our Mission</SectionLabel>
            <h2 className="font-display text-4xl md:text-6xl font-light tracking-tighter mt-5 text-stone-900">
              Travel Solo. <span className="gradient-text">Create Memories Together.</span>
            </h2>
            <p className="text-stone-600 mt-8 leading-relaxed font-body text-lg">
              Whether you&apos;re a solo traveler, adventure seeker, spiritual explorer, trekker, biker, photographer, or someone simply looking for new experiences — you&apos;re welcome here.
            </p>
          </Reveal>
        </div>
      </section>

      {/* SECTION 3 — What You'll Find Here */}
      <section className="py-24 px-6 md:px-10 border-t border-stone-200 bg-stone-50/50">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-16">
            <SectionLabel>What You&apos;ll Find Here</SectionLabel>
            <h2 className="font-display text-4xl md:text-6xl font-light tracking-tighter mt-5 text-stone-900">
              Adventures that <span className="gradient-text">define you</span>.
            </h2>
          </Reveal>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {offerings.map((item) => (
              <Reveal key={item.label}>
                <div className="bg-white rounded-2xl p-6 md:p-8 border border-stone-100 hover:border-orange-200 hover:shadow-lg hover:shadow-orange-100/30 transition-all duration-300 group">
                  <div className="text-3xl mb-4">{item.emoji}</div>
                  <div className="font-sans text-base font-semibold text-stone-900 group-hover:text-[#ea580c] transition-colors">
                    {item.label}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal className="text-center mt-16">
            <p className="text-stone-600 font-body text-lg max-w-2xl mx-auto leading-relaxed">
              Through my content and community, I aim to inspire people to step outside their comfort zones, explore the world, make new friends, and create stories worth remembering.
            </p>
          </Reveal>
        </div>
      </section>

      {/* SECTION 4 — Stats */}
      <section className="py-24 px-6 md:px-10 border-t border-stone-200">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { k: "7+", v: "Years on the road" },
                { k: "100+", v: "Destinations" },
                { k: "1000s", v: "Memories" },
                { k: "∞", v: "Friendships" },
              ].map((x) => (
                <div key={x.v} className="bg-white rounded-2xl p-6 border border-stone-100 text-center shadow-sm">
                  <div className="font-display text-4xl font-light gradient-text">{x.k}</div>
                  <div className="text-xs text-stone-500 mt-2 uppercase tracking-wider font-medium">{x.v}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* SECTION 5 — CTA */}
      <section className="relative py-32 px-6 md:px-10 border-t border-stone-200 bg-stone-50 overflow-hidden">
        <div className="absolute inset-0 radial-orange-glow opacity-30" />
        <div className="relative max-w-3xl mx-auto text-center">
          <Reveal>
            <img
              src="/logo.png"
              alt="WeAreSoloz"
              className="w-20 h-20 rounded-full object-cover mx-auto ring-2 ring-orange-500/20 mb-8"
            />
            <h2 className="font-display text-4xl md:text-6xl font-light tracking-tighter text-stone-900">
              WeAreSoloz
            </h2>
            <p className="text-2xl text-stone-600 mt-4 font-display">
              You&apos;re Not Alone.
            </p>
            <p className="text-stone-500 mt-6 font-body text-lg">
              Let&apos;s explore, connect, and create memories together.
            </p>
            <p className="text-stone-400 mt-4 font-body italic">
              — Akhil, Founder, WeAreSoloz 🌍✨
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-10 justify-center">
              <Link
                href="/upcoming-trips"
                data-testid="about-explore-trips"
                className="inline-flex items-center justify-center gap-2 bg-stone-900 text-white px-7 py-4 rounded-full font-semibold hover:bg-stone-800 transition-all hover:shadow-lg"
              >
                Explore Trips <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                data-testid="about-cta-contact"
                className="inline-flex items-center justify-center gap-2 gradient-orange text-white px-7 py-4 rounded-full font-semibold hover:scale-[1.02] transition-transform"
              >
                Get in Touch
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
