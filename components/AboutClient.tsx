"use client";

import React from "react";
import Link from "next/link";
import { Youtube, Instagram, Phone, MessageCircle, Mountain, Compass, Camera, Users, Car, Heart, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
  { icon: Car, label: "Road Trips & Solo Journeys", emoji: "🚗" },
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
                I&apos;m the creator of <a href="https://youtube.com/@akhillrockstartravelstories?si=_c7w-zLBaUwBgMSi" target="_blank" rel="noreferrer" className="text-stone-900 font-semibold hover:text-[#ef4444] transition-colors underline decoration-red-500/30 underline-offset-4">Akhill Rockstar Travel Stories</a> and founder of <strong className="text-stone-900">WeAreSoloz</strong>.
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
                data-testid="about-youtube"
                href="https://youtube.com/@akhillrockstartravelstories?si=_c7w-zLBaUwBgMSi"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-white rounded-full px-5 py-2.5 text-sm font-medium border border-stone-200 hover:border-red-200 hover:bg-red-50 hover:text-[#ef4444] transition-all shadow-sm text-stone-700"
              >
                <Youtube className="w-4 h-4 text-red-600" /> YouTube
              </a>
              <a
                data-testid="about-instagram"
                href={instagramLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-white rounded-full px-5 py-2.5 text-sm font-medium border border-stone-200 hover:border-orange-200 hover:bg-orange-50 hover:text-[#ea580c] transition-all shadow-sm text-stone-700"
              >
                <Instagram className="w-4 h-4" /> {instagramLink.includes("akhillrockstar") ? "@akhillrockstar" : "@wearesolozindia"}
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

      {/* SECTION: India Exploration Map */}
      <section className="py-24 px-6 md:px-10 border-t border-stone-200 bg-stone-50/30 overflow-hidden relative">
        <div className="max-w-7xl mx-auto grid md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-5 space-y-6">
            <Reveal>
              <SectionLabel>My Travel Footprints</SectionLabel>
              <h2 className="font-display text-4xl md:text-5xl font-light tracking-tighter text-stone-900 leading-tight">
                7 Years of <span className="gradient-text font-medium">Solo Exploration</span>.
              </h2>
              <p className="text-stone-600 font-body text-base leading-relaxed mt-4">
                From the freezing heights of the Himalayas down to the backwaters of Kerala and the pristine trails of Sri Lanka, I have spent the last seven years exploring the diverse terrains of our subcontinent.
              </p>
              <p className="text-stone-600 font-body text-base leading-relaxed">
                This map highlights the routes traveled, connections forged, and the regions where WeAreSoloz brings solo travelers together. Click on any of the active hubs to see the highlights of my expeditions.
              </p>
            </Reveal>

            {/* Glowing active hubs list */}
            <div className="grid grid-cols-2 gap-3 pt-4">
              {[
                { name: "Himalayan Peaks", region: "North (Kedarnath, Badrinath)" },
                { name: "Western Ghats", region: "West (Gokarna, Hampi, Coorg)" },
                { name: "Eastern Valleys", region: "East (Gandikota, Araku)" },
                { name: "Southern Coast", region: "South (Munnar, Alappuzha)" },
              ].map((hub, idx) => (
                <div key={idx} className="glass rounded-xl p-3 border border-stone-200/60 bg-white/50">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ea580c] animate-pulse" />
                    <span className="text-xs font-bold text-stone-950 font-display">{hub.name}</span>
                  </div>
                  <p className="text-[10px] text-stone-500 mt-1 font-body">{hub.region}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-7 flex justify-center items-center relative min-h-[480px]">
            {/* Minimalist Vector India Map with Constellation Routes */}
            <div className="w-full max-w-[500px] aspect-[1/1.1] relative">
              <svg
                viewBox="0 0 500 550"
                className="w-full h-full drop-shadow-[0_10px_30px_rgba(234,88,12,0.04)]"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Minimalist outline map of India */}
                <motion.path
                  d="M250 30 Q210 50 190 90 Q160 120 120 180 Q110 210 140 230 Q150 280 170 360 Q180 430 190 480 L195 490 Q215 450 250 380 Q290 320 310 240 Q330 220 370 230 Q430 235 440 200 Q430 170 380 180 Q320 170 280 140 Q270 90 250 30 Z"
                  stroke="#ea580c"
                  strokeWidth="1.5"
                  strokeOpacity="0.12"
                  strokeDasharray="4 4"
                  fill="rgba(234,88,12,0.01)"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                />

                {/* Connecting travel route lines (constellation lines) */}
                {[
                  // North to Center
                  { x1: 250, y1: 60, x2: 230, y2: 140 },
                  // Delhi to West
                  { x1: 230, y1: 140, x2: 160, y2: 340 },
                  // Delhi to East
                  { x1: 230, y1: 140, x2: 290, y2: 300 },
                  // West to Center
                  { x1: 160, y1: 340, x2: 240, y2: 320 },
                  // Center to East
                  { x1: 240, y1: 320, x2: 290, y2: 300 },
                  // Center to South-West
                  { x1: 240, y1: 320, x2: 180, y2: 440 },
                  // East to South-West
                  { x1: 290, y1: 300, x2: 180, y2: 440 },
                  // South-West to South
                  { x1: 180, y1: 440, x2: 190, y2: 490 },
                  // South to Sri Lanka
                  { x1: 190, y1: 490, x2: 250, y2: 530 }
                ].map((route, idx) => (
                  <motion.line
                    key={idx}
                    x1={route.x1}
                    y1={route.y1}
                    x2={route.x2}
                    y2={route.y2}
                    stroke="url(#routeGradient)"
                    strokeWidth="1.2"
                    strokeDasharray="3 3"
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, delay: 0.5 + idx * 0.1, ease: "easeOut" }}
                  />
                ))}

                {/* Definitions for Gradients */}
                <defs>
                  <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ea580c" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#ea580c" stopOpacity="0.4" />
                  </linearGradient>
                  <radialGradient id="glowGradient" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#ea580c" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#ea580c" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Glowing underlays for major active hubs */}
                {[
                  { x: 250, y: 60, r: 24 }, // Himalayan Peaks
                  { x: 160, y: 340, r: 20 }, // Gokarna/Hampi
                  { x: 290, y: 300, r: 20 }, // Gandikota/Araku
                  { x: 180, y: 440, r: 22 }, // Munnar/Vagamon
                  { x: 250, y: 530, r: 18 }  // Sri Lanka
                ].map((glow, idx) => (
                  <circle
                    key={idx}
                    cx={glow.x}
                    cy={glow.y}
                    r={glow.r}
                    fill="url(#glowGradient)"
                  />
                ))}

                {/* Pulse lines */}
                {[
                  { x: 250, y: 60 },
                  { x: 160, y: 340 },
                  { x: 290, y: 300 },
                  { x: 180, y: 440 },
                  { x: 250, y: 530 }
                ].map((pulse, idx) => (
                  <circle
                    key={`pulse-${idx}`}
                    cx={pulse.x}
                    cy={pulse.y}
                    r="6"
                    stroke="#ea580c"
                    strokeWidth="1"
                    className="origin-center scale-[2] opacity-0 animate-ping"
                    style={{ animationDuration: '3s', animationDelay: `${idx * 0.5}s` }}
                  />
                ))}

                {/* Map Nodes (Cities/Regions) */}
                {[
                  { x: 250, y: 60, label: "Himalayas", sub: "Kedarnath/Mana", align: "middle" as const, dy: -12 },
                  { x: 230, y: 140, label: "Delhi Base", sub: "", align: "end" as const, dx: -10, dy: 4 },
                  { x: 160, y: 340, label: "Gokarna/Hampi", sub: "Karnataka", align: "end" as const, dx: -10, dy: 4 },
                  { x: 240, y: 320, label: "Hyderabad", sub: "Telangana", align: "middle" as const, dy: -10 },
                  { x: 290, y: 300, label: "Gandikota/Araku", sub: "Andhra Pradesh", align: "start" as const, dx: 10, dy: 4 },
                  { x: 180, y: 440, label: "Munnar/Vagamon", sub: "Kerala", align: "end" as const, dx: -10, dy: 4 },
                  { x: 190, y: 490, label: "Kanyakumari", sub: "", align: "middle" as const, dy: 14 },
                  { x: 250, y: 530, label: "Sri Lanka", sub: "Expedition", align: "start" as const, dx: 10, dy: 4 }
                ].map((node, idx) => (
                  <g key={idx} className="cursor-pointer group">
                    {/* Node Dot */}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="4"
                      className="fill-[#ea580c] stroke-white stroke-[1.5px] transition-all group-hover:r-6 group-hover:fill-stone-900 group-hover:stroke-[#ea580c]"
                    />
                    
                    {/* Text Label */}
                    <text
                      x={node.x + (node.dx || 0)}
                      y={node.y + (node.dy || 0)}
                      textAnchor={node.align}
                      className="fill-stone-800 font-display text-[9px] font-bold tracking-wider opacity-85 group-hover:opacity-100 group-hover:fill-[#ea580c] transition-opacity select-none"
                    >
                      {node.label}
                    </text>
                    {node.sub && (
                      <text
                        x={node.x + (node.dx || 0)}
                        y={node.y + (node.dy || 0) + 8}
                        textAnchor={node.align}
                        className="fill-stone-400 font-body text-[7px] tracking-wide select-none"
                      >
                        {node.sub}
                      </text>
                    )}
                  </g>
                ))}
              </svg>
            </div>
          </div>
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
