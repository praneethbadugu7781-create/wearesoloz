"use client";

import React from "react";
import Link from "next/link";
import { Youtube, Instagram, Phone, MessageCircle, ArrowRight, Leaf, Quote } from "lucide-react";
import { motion } from "framer-motion";
import Reveal, { SectionLabel } from "@/components/Reveal";
import indiaMap from "@svg-maps/india";
import Card3D from "@/components/Card3D";

interface AboutClientProps {
  settings: any;
}

const uniqueOfferings = [
  {
    title: "Travel With Your Mother",
    desc: "A journey of gratitude and connection, creating beautiful travel memories with the woman who gave you everything.",
    emoji: "👩‍👦",
    color: "hover:border-pink-200 hover:bg-pink-50/20 hover:shadow-pink-100/30"
  },
  {
    title: "Travel With Your Father",
    desc: "Strengthen your bond and share road trips, outdoor campfires, and meaningful stories with your father.",
    emoji: "👨‍👦",
    color: "hover:border-blue-200 hover:bg-blue-50/20 hover:shadow-blue-100/30"
  },
  {
    title: "Travel With Your Grandparents",
    desc: "A comfortable, slower-paced journey focusing on respect, story-sharing, and multi-generational warmth.",
    emoji: "👴👵",
    color: "hover:border-amber-200 hover:bg-amber-50/20 hover:shadow-amber-100/30"
  },
  {
    title: "Travel With Your Siblings",
    desc: "Reignite childhood bonds, sibling rivalries, and shared laughs on amazing trails and road trips.",
    emoji: "🧑‍🤝‍🧑",
    color: "hover:border-emerald-200 hover:bg-emerald-50/20 hover:shadow-emerald-100/30"
  },
  {
    title: "Solo Traveler Meetups",
    desc: "Set out alone but join a welcoming, close-knit community of like-minded solo explorers to form your new travel family.",
    emoji: "🤝",
    color: "hover:border-purple-200 hover:bg-purple-50/20 hover:shadow-purple-100/30"
  },
  {
    title: "Adventure, Spiritual & Healing Trips",
    desc: "Reconnect with yourself. Rejuvenate your mind, body, and spirit on sacred trails, mountain summits, and yoga retreats.",
    emoji: "🏔️✨",
    color: "hover:border-orange-200 hover:bg-orange-50/20 hover:shadow-orange-100/30"
  }
];

export default function AboutClient({ settings = {} }: AboutClientProps) {
  const founderImage = settings.founder_image || settings.founderImage || "/images/akhil.jpg";
  const instagramLink = settings.instagram_link || "https://www.instagram.com/akhillrockstar";
  const whatsappLink = settings.whatsapp_link || "https://wa.me/919966085310";

  return (
    <div data-testid="about-page" className="bg-white min-h-screen text-[#1c1917] pt-20 relative overflow-hidden">
      
      {/* Background Decorative floating plane */}
      <div className="absolute top-48 left-10 opacity-[0.015] pointer-events-none hidden lg:block animate-bounce" style={{ animationDuration: '10s' }}>
        <svg className="w-56 h-56" fill="currentColor" viewBox="0 0 24 24">
          <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L14 19v-5.5L21 16z"/>
        </svg>
      </div>

      {/* Background Decorative floating Globe */}
      <div className="absolute bottom-96 right-10 opacity-[0.015] pointer-events-none hidden lg:block animate-pulse" style={{ animationDuration: '12s' }}>
        <svg className="w-64 h-64 rotate-12" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L11 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
        </svg>
      </div>

      {/* SECTION 1: Top Philosophy Quote Banner */}
      <section className="pt-36 pb-12 px-6 md:px-10 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 to-transparent pointer-events-none" />
        <Reveal className="max-w-4xl mx-auto">
          <Quote className="w-12 h-12 mx-auto text-orange-500/25 mb-6 rotate-180" />
          <h2 className="font-display text-3xl md:text-5xl lg:text-6xl font-light italic tracking-tight text-stone-850 leading-tight">
            &ldquo;If you think travel is expensive, wait until you see the price of a <span className="gradient-text font-semibold animate-pulse">wasted life</span>.&rdquo;
          </h2>
        </Reveal>
      </section>

      {/* SECTION 2: Hero Intro - Founder Story */}
      <section className="py-20 px-6 md:px-10">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          
          {/* Left Panel: 3D Animated Image */}
          <Reveal className="w-full">
            <Card3D className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl shadow-stone-400/20 bg-stone-100 group cursor-pointer" maxRotate={8} scale={1.02}>
              <img
                src={founderImage}
                alt="Akhil - Founder of WeAreSoloz"
                className="w-full h-full object-cover transition-transform duration-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-stone-900/10 to-transparent opacity-75" />
              <div style={{ transform: "translateZ(45px)", transformStyle: "preserve-3d" }} className="absolute bottom-8 left-8 text-white z-10">
                <div className="text-[10px] uppercase font-bold tracking-widest opacity-80 text-orange-400">Founder of WeAreSoloz</div>
                <h3 className="font-display text-3xl font-bold mt-2 tracking-tight">Akhil 🌍✈️</h3>
              </div>
            </Card3D>
          </Reveal>

          {/* Right Panel: Bio Text */}
          <Reveal>
            <SectionLabel>Founder Story</SectionLabel>
            <h1 className="font-display text-4xl md:text-6xl font-light tracking-tighter mt-5 text-stone-900 leading-tight">
              Hi, I&apos;m <span className="gradient-text font-semibold">Akhil</span>.
            </h1>

            <div className="space-y-6 mt-8 text-stone-600 leading-relaxed font-body text-base md:text-lg">
              <p className="font-medium text-stone-850 text-lg md:text-xl leading-snug">
                I am a passionate traveler with 7+ years of travel experience across 12 countries and countless destinations throughout India.
              </p>
              <p>
                Travel has taught me lessons that no classroom ever could. It helped me discover new cultures, build meaningful connections, gain confidence, and understand the true value of life. 
              </p>
              <p>
                That&apos;s why I created this community—to bring solo travelers together in one positive space where people can connect, share experiences, inspire one another, and explore the world without limits.
              </p>
            </div>

            {/* Founder Social Links */}
            <div className="flex flex-wrap gap-3 mt-10">
              <a
                data-testid="about-youtube"
                href="https://youtube.com/@akhillrockstartravelstories?si=_c7w-zLBaUwBgMSi"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-white rounded-full px-5 py-2.5 text-xs font-semibold border border-stone-200 hover:border-red-200 hover:bg-red-50 hover:text-[#ef4444] transition-all shadow-sm text-stone-700"
              >
                <Youtube className="w-4 h-4 text-red-600" /> YouTube Channel
              </a>
              <a
                data-testid="about-instagram"
                href={instagramLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-white rounded-full px-5 py-2.5 text-xs font-semibold border border-stone-200 hover:border-orange-200 hover:bg-orange-50 hover:text-[#ea580c] transition-all shadow-sm text-stone-700"
              >
                <Instagram className="w-4 h-4" /> Instagram
              </a>
              <a
                data-testid="about-phone"
                href="tel:+919966085310"
                className="inline-flex items-center gap-2 bg-white rounded-full px-5 py-2.5 text-xs font-semibold border border-stone-200 hover:border-orange-200 hover:bg-orange-50 hover:text-[#ea580c] transition-all shadow-sm text-stone-700"
              >
                <Phone className="w-4 h-4" /> Call Founder
              </a>
              <a
                data-testid="about-whatsapp"
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-white rounded-full px-5 py-2.5 text-xs font-semibold border border-stone-200 hover:border-orange-200 hover:bg-orange-50 hover:text-[#ea580c] transition-all shadow-sm text-stone-700"
              >
                <MessageCircle className="w-4 h-4" /> WhatsApp Chat
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* SECTION 3: The Mission pillars (Travel, Connect, Heal, Grow) with 3D Float */}
      <section className="py-24 px-6 md:px-10 border-t border-stone-200 bg-stone-50/40">
        <div className="max-w-6xl mx-auto">
          <Reveal className="text-center mb-16">
            <SectionLabel>Our Mission</SectionLabel>
            <h2 className="font-display text-4xl md:text-5xl font-light tracking-tighter mt-5 text-stone-900">
              A simple path: <span className="gradient-text font-medium">Travel • Connect • Heal • Grow</span>
            </h2>
            <p className="text-stone-500 mt-4 leading-relaxed font-body text-base max-w-xl mx-auto">
              Our core values guide every single tour we organize, ensuring travellers return with healed hearts and expanded minds.
            </p>
          </Reveal>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: "Travel", desc: "Discovering remote trails, unknown terrains, and new horizons across the globe.", emoji: "🌍", color: "from-orange-500/10 to-transparent", border: "group-hover:border-orange-300" },
              { label: "Connect", desc: "Bringing solo adventurers together to form a close-knit, supportive travel family.", emoji: "🤝", color: "from-blue-500/10 to-transparent", border: "group-hover:border-blue-300" },
              { label: "Heal", desc: "Finding peace, digital detox, and spiritual grounding in sacred nature.", emoji: "🌱", color: "from-emerald-500/10 to-transparent", border: "group-hover:border-emerald-300" },
              { label: "Grow", desc: "Expanding your comfort zone, building confidence, and discovering who you are.", emoji: "🚀", color: "from-purple-500/10 to-transparent", border: "group-hover:border-purple-300" }
            ].map((pillar) => (
              <Reveal key={pillar.label} className="h-full">
                <Card3D className={`bg-white rounded-3xl p-8 border border-stone-200/60 h-full relative overflow-hidden flex flex-col justify-between hover:shadow-2xl hover:shadow-stone-300/30 transition-all duration-300 group cursor-pointer ${pillar.border}`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${pillar.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  <div className="relative z-10 space-y-4" style={{ transform: "translateZ(30px)", transformStyle: "preserve-3d" }}>
                    <div style={{ transform: "translateZ(40px)" }} className="text-4xl">{pillar.emoji}</div>
                    <h3 style={{ transform: "translateZ(35px)" }} className="font-display text-2xl font-bold text-stone-900 group-hover:text-[#ea580c] transition-colors">{pillar.label}</h3>
                    <p style={{ transform: "translateZ(20px)" }} className="text-stone-500 font-body text-sm leading-relaxed">{pillar.desc}</p>
                  </div>
                </Card3D>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: Unique Monthly Travel Offerings Grid with 3D Tilt */}
      <section className="py-24 px-6 md:px-10 border-t border-stone-200">
        <div className="max-w-7xl mx-auto">
          
          <Reveal className="text-center mb-16">
            <SectionLabel>Monthly Trips</SectionLabel>
            <h2 className="font-display text-4xl md:text-6xl font-light tracking-tighter mt-5 text-stone-900">
              Unique <span className="gradient-text">Experiences</span> Every Month.
            </h2>
            <p className="text-stone-500 mt-6 max-w-xl mx-auto leading-relaxed font-body text-base">
              Every month, we curate and organize customized journeys designed to bring families, friends, and solo travelers closer together.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {uniqueOfferings.map((item, idx) => (
              <Reveal key={idx} className="h-full">
                <Card3D className={`bg-white rounded-3xl p-8 border border-stone-200/60 shadow-sm transition-all duration-300 h-full flex flex-col justify-between group ${item.color} hover:shadow-2xl hover:shadow-stone-300/35 cursor-pointer`}>
                  <div className="space-y-4" style={{ transform: "translateZ(25px)", transformStyle: "preserve-3d" }}>
                    <div style={{ transform: "translateZ(40px)" }} className="text-4xl">{item.emoji}</div>
                    <h3 style={{ transform: "translateZ(30px)" }} className="font-display text-xl font-bold text-stone-900 group-hover:text-[#ea580c] transition-colors">
                      {item.title}
                    </h3>
                    <p style={{ transform: "translateZ(20px)" }} className="text-stone-500 text-sm font-body leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </Card3D>
              </Reveal>
            ))}
          </div>

          {/* 3D Social Initiative Card for Farmers */}
          <Reveal className="mt-16">
            <Card3D className="relative overflow-hidden rounded-3xl border border-amber-250 bg-amber-50/45 p-8 md:p-12 shadow-xl shadow-amber-200/20 max-w-5xl mx-auto group cursor-pointer" maxRotate={6} scale={1.015}>
              <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-48 h-48 bg-amber-200/20 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-300/35 transition-colors" />
              <div className="flex flex-col md:flex-row items-center gap-8 relative z-10" style={{ transform: "translateZ(30px)", transformStyle: "preserve-3d" }}>
                <div style={{ transform: "translateZ(50px)" }} className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center shrink-0">
                  <Leaf className="w-8 h-8 text-amber-600 animate-pulse" />
                </div>
                <div className="space-y-3 text-center md:text-left">
                  <div style={{ transform: "translateZ(35px)" }} className="text-[10px] uppercase font-bold tracking-widest text-amber-600">Social Initiative</div>
                  <h3 style={{ transform: "translateZ(40px)" }} className="font-display text-2xl md:text-3xl font-bold text-stone-900 tracking-tight leading-tight">
                    Giving Back: Supporting Our Farmers
                  </h3>
                  <p style={{ transform: "translateZ(20px)" }} className="text-stone-600 leading-relaxed font-body text-base max-w-3xl">
                    We also believe in giving back to society. As a mark of respect for the people who feed our nation, **one deserving farmer** will receive a fully sponsored free trip every single month.
                  </p>
                </div>
              </div>
            </Card3D>
          </Reveal>

        </div>
      </section>

      {/* SECTION 5: India Exploration Map */}
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
                viewBox="0 0 612 696"
                className="w-full h-full drop-shadow-[0_10px_30px_rgba(234,88,12,0.04)]"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Geographically accurate outline map of India */}
                {indiaMap.locations.map((loc: any) => (
                  <motion.path
                    key={loc.id}
                    d={loc.path}
                    stroke="#ea580c"
                    strokeWidth="1.2"
                    strokeOpacity="0.15"
                    fill="rgba(234,88,12,0.015)"
                    className="transition-colors hover:fill-orange-500/10 hover:stroke-orange-500/40 cursor-default"
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                  />
                ))}

                {/* Connecting travel route lines (constellation lines) */}
                {[
                  // Himalayas to Delhi Base
                  { x1: 232, y1: 175, x2: 186, y2: 210 },
                  // Delhi Base to Gokarna/Hampi
                  { x1: 186, y1: 210, x2: 170, y2: 518 },
                  // Delhi Base to Gandikota/Araku
                  { x1: 186, y1: 210, x2: 310, y2: 460 },
                  // Gokarna/Hampi to Hyderabad
                  { x1: 170, y1: 518, x2: 237, y2: 456 },
                  // Hyderabad to Gandikota/Araku
                  { x1: 237, y1: 456, x2: 310, y2: 460 },
                  // Hyderabad to Munnar/Vagamon
                  { x1: 237, y1: 456, x2: 166, y2: 615 },
                  // Gandikota/Araku to Munnar/Vagamon
                  { x1: 310, y1: 460, x2: 166, y2: 615 },
                  // Munnar/Vagamon to Kanyakumari
                  { x1: 166, y1: 615, x2: 195, y2: 665 },
                  // Kanyakumari to Sri Lanka
                  { x1: 195, y1: 665, x2: 270, y2: 660 }
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
                  { x: 232, y: 175, r: 24 }, // Himalayan Peaks
                  { x: 170, y: 518, r: 20 }, // Gokarna/Hampi
                  { x: 310, y: 460, r: 20 }, // Gandikota/Araku
                  { x: 166, y: 615, r: 22 }, // Munnar/Vagamon
                  { x: 270, y: 660, r: 18 }  // Sri Lanka
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
                  { x: 232, y: 175 },
                  { x: 170, y: 518 },
                  { x: 310, y: 460 },
                  { x: 166, y: 615 },
                  { x: 270, y: 660 }
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
                  { x: 232, y: 175, label: "Himalayas", sub: "Kedarnath/Mana", align: "middle" as const, dy: -12 },
                  { x: 186, y: 210, label: "Delhi Base", sub: "", align: "end" as const, dx: -10, dy: 4 },
                  { x: 170, y: 518, label: "Gokarna/Hampi", sub: "Karnataka", align: "end" as const, dx: -10, dy: 4 },
                  { x: 237, y: 456, label: "Hyderabad", sub: "Telangana", align: "middle" as const, dy: -10 },
                  { x: 310, y: 460, label: "Gandikota/Araku", sub: "Andhra Pradesh", align: "start" as const, dx: 10, dy: 4 },
                  { x: 166, y: 615, label: "Munnar/Vagamon", sub: "Kerala", align: "end" as const, dx: -10, dy: 4 },
                  { x: 195, y: 665, label: "Kanyakumari", sub: "", align: "middle" as const, dy: 14 },
                  { x: 270, y: 660, label: "Sri Lanka", sub: "Expedition", align: "start" as const, dx: 10, dy: 4 }
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

      {/* SECTION 6: Philosophy & Community Statement */}
      <section className="py-24 px-6 md:px-10 border-t border-stone-200 bg-stone-50/40">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <Reveal>
            <h2 className="font-display text-3xl md:text-5xl font-light tracking-tight text-stone-900 leading-tight">
              More than a travel startup — it&apos;s a <span className="gradient-text font-medium">community for dreamers</span>.
            </h2>
            <p className="text-stone-600 mt-6 leading-relaxed font-body text-lg max-w-3xl mx-auto">
              This is a community for dreamers, explorers, and anyone who believes that life is meant to be experienced, not just lived. Because the money spent on travel is never wasted — it returns as memories, friendships, experiences, and stories that last forever.
            </p>
          </Reveal>
        </div>
      </section>

      {/* SECTION 7: CTA with final slogan quote */}
      <section className="relative py-32 px-6 md:px-10 border-t border-stone-200 bg-[#0c0a09] text-white overflow-hidden text-center">
        <div className="absolute inset-0 bg-gradient-to-t from-orange-500/10 to-transparent pointer-events-none" />
        <div className="relative max-w-4xl mx-auto space-y-12">
          
          <Reveal>
            <img
              src="/logo.png"
              alt="WeAreSoloz"
              className="w-20 h-20 rounded-full object-cover mx-auto ring-4 ring-orange-500/20 mb-8 animate-spin"
              style={{ animationDuration: '30s' }}
            />
            <h2 className="font-display text-4xl md:text-6xl font-light italic tracking-tight text-stone-200 leading-tight">
              &ldquo;Travel isn&apos;t expensive. <span className="text-[#ea580c] font-semibold font-sans italic">A wasted life is.</span>&rdquo;
            </h2>
            <p className="text-base text-stone-400 mt-4 font-body font-medium uppercase tracking-wider">
              Founder — Akhil 🌍✈️
            </p>
          </Reveal>

          <Reveal className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/upcoming-trips"
                className="inline-flex items-center justify-center gap-2 bg-[#ea580c] text-white px-8 py-4 rounded-full font-bold hover:bg-orange-600 hover:scale-[1.02] transition-all hover:shadow-xl hover:shadow-orange-500/20"
              >
                Explore Trips <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 bg-white/10 text-white hover:bg-white/20 border border-white/10 px-8 py-4 rounded-full font-bold hover:scale-[1.02] transition-all"
              >
                Join The Community
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

    </div>
  );
}
