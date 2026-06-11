"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, MapPin, Calendar, Clock, Users, Sparkles, Shield, Heart, Star, Quote, Instagram, Phone } from "lucide-react";
import Reveal, { stagger, item, SectionLabel } from "@/components/Reveal";
import { Button } from "@/components/ui/button";

const DEFAULT_DESTS = [
  { name: "Munnar", location: "Kerala", image: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1600&q=80", description: "Lush tea gardens, misty hills, and cool mountain air.", span: "wide" },
  { name: "Hampi", location: "Karnataka", image: "https://images.unsplash.com/photo-1600100397608-f010e45fa674?auto=format&fit=crop&w=1200&q=80", description: "Explore the ancient ruins and boulder-strewn landscapes.", span: "default" },
  { name: "Gandikota", location: "Andhra Pradesh", image: "https://images.unsplash.com/photo-1616038242814-a6eac7845d88?auto=format&fit=crop&w=1200&q=80", description: "The stunning Grand Canyon of India gorge.", span: "default" },
  { name: "Araku Valley", location: "Andhra Pradesh", image: "https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?auto=format&fit=crop&w=1200&q=80", description: "Cascading waterfalls and lush coffee plantations.", span: "tall" },
  { name: "Gokarna", location: "Karnataka", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80", description: "Trek along pristine beaches and rocky cliffs.", span: "default" },
  { name: "Ooty", location: "Tamil Nadu", image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80", description: "Misty pine forests and beautiful botanical gardens.", span: "default" },
  { name: "Coorg", location: "Karnataka", image: "https://images.unsplash.com/photo-1542856391-010fb87dcfed?auto=format&fit=crop&w=1600&q=80", description: "Scenic coffee estates and peaceful waterfalls.", span: "wide" },
];

const WHY = [
  { icon: Users, title: "Travel Together", text: "Solo at start. Family by the end of every trip." },
  { icon: Shield, title: "Safe Community", text: "Verified travelers, vetted hosts, secure trips." },
  { icon: Star, title: "Trusted Experiences", text: "Curated by Akhil over 7+ years on the road." },
  { icon: MapPin, title: "Unique Destinations", text: "Hidden trails, sacred temples, untouched valleys." },
  { icon: Sparkles, title: "Adventure First", text: "Treks, bikes, riverside camps, sunrise summits." },
  { icon: Heart, title: "Lifelong Memories", text: "Friendships and stories that outlast the journey." },
];

interface HomeClientProps {
  settings: any;
  trips: any[];
  destinations: any[];
  blogs: any[];
  testimonials: any[];
  gallery: any[];
}

export default function HomeClient({
  settings = {},
  trips = [],
  destinations = [],
  blogs = [],
  testimonials = [],
  gallery = [],
}: HomeClientProps) {
  const destList = destinations.length ? destinations : DEFAULT_DESTS;

  return (
    <div data-testid="home-page" className="bg-white min-h-screen text-[#1c1917] pt-20">
      {/* SECTION 1 — HERO */}
      <section data-testid="hero-section" className="relative min-h-[calc(100vh-80px)] flex items-end overflow-hidden bg-white">
        <div className="absolute inset-0 bg-white">
          <img
            src={settings.hero_image || "https://images.unsplash.com/photo-1692452376160-14194abefba8?auto=format&fit=crop&w=2400&q=85"}
            alt="Hero"
            className="w-full h-full object-cover opacity-55"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/15 to-white" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
        </div>


        <div className="relative max-w-7xl mx-auto px-4 md:px-10 pb-16 md:pb-32 pt-24 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <SectionLabel>WeAreSoloz · Est. 2017</SectionLabel>
            <h1 className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-light leading-[0.95] tracking-tighter mt-6 max-w-4xl text-white">
              Start Solo. <br />
              <span className="gradient-text font-medium">Travel Together.</span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-white/85 mt-6 sm:mt-8 max-w-xl leading-relaxed font-body">
              {settings.hero_subheading || "Join solo travelers, explore new destinations, meet incredible people and create unforgettable memories together."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-8 sm:mt-10">
              <Link
                href="/upcoming-trips"
                data-testid="hero-explore-trips"
                className="inline-flex items-center justify-center gap-2 gradient-orange text-white px-7 py-4 rounded-full font-medium hover:scale-[1.02] transition-transform"
              >
                Explore Trips <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/soloz-community"
                data-testid="hero-join-community"
                className="inline-flex items-center justify-center gap-2 glass text-white px-7 py-4 rounded-full font-medium hover:bg-white/10 transition-colors"
              >
                Join Community
              </Link>
            </div>
          </motion.div>

          {/* Floating stats card */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.9 }}
            className="hidden md:flex absolute right-10 bottom-32 glass rounded-2xl p-6 w-72 flex-col gap-4"
          >
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-soloz-primary">
              <span className="w-2 h-2 rounded-full bg-soloz-primary animate-pulse" /> Live community
            </div>
            <div>
              <div className="font-display text-4xl font-light text-stone-900">100+</div>
              <div className="text-xs text-stone-600 mt-1">Destinations explored across India</div>
            </div>
            <div className="h-px bg-stone-200" />
            <div>
              <div className="font-display text-4xl font-light text-stone-900">7+ yrs</div>
              <div className="text-xs text-stone-600 mt-1">Of solo travel, stories & friendships</div>
            </div>
          </motion.div>
        </div>

        {/* scroll cue */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.4em] text-stone-500 font-semibold">
          scroll
        </div>
      </section>

      {/* SECTION 2 — Featured Destinations (Bento) */}
      <section data-testid="destinations-section" className="py-16 md:py-32 px-4 md:px-10 relative">
        <div className="max-w-7xl mx-auto">
          <Reveal className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div>
              <SectionLabel>Featured Destinations</SectionLabel>
              <h2 className="font-display text-4xl md:text-6xl font-light tracking-tighter mt-4 max-w-2xl text-stone-900">
                Where the Soloz <span className="gradient-text">wander</span>.
              </h2>
            </div>
            <Link
              href="/upcoming-trips"
              data-testid="see-all-destinations"
              className="text-sm text-soloz-textSecondary hover:text-stone-900 inline-flex items-center gap-2 group transition-colors"
            >
              See all destinations <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Link>
          </Reveal>
 
          <motion.div {...stagger} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 auto-rows-[180px] md:auto-rows-[220px]">
            {destList.slice(0, 7).map((d, i) => {
              const spans = [
                "sm:col-span-2 sm:row-span-2", // 0 large
                "sm:col-span-1 sm:row-span-1",
                "sm:col-span-1 sm:row-span-1",
                "sm:col-span-1 sm:row-span-2", // tall
                "sm:col-span-1 sm:row-span-1",
                "sm:col-span-1 sm:row-span-1",
                "sm:col-span-2 sm:row-span-1", // wide
              ];
              return (
                <motion.div
                  key={d.id || d._id || d.name}
                  variants={item}
                  className={`group relative overflow-hidden rounded-2xl ${spans[i] || ""}`}
                >
                  <img
                    src={d.image}
                    alt={d.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                  <div className="absolute inset-0 p-5 md:p-7 flex flex-col justify-end">
                    <div className="text-[10px] uppercase tracking-[0.3em] text-soloz-primary mb-2">{d.location}</div>
                    <div className="font-display text-xl sm:text-2xl md:text-3xl font-medium tracking-tight text-white">{d.name || d.title}</div>
                    {d.description && i === 0 && <div className="text-sm text-white/70 mt-2 max-w-xs hidden md:block">{d.description}</div>}
                  </div>
                  <div className="absolute top-4 right-4 w-9 h-9 rounded-full glass flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight className="w-4 h-4 text-white" />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>
 
      {/* SECTION 3 — About */}
      <section data-testid="about-section" className="py-16 md:py-32 px-4 md:px-10 border-t border-stone-200">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 md:gap-20 items-center">
          <Reveal className="relative aspect-[4/5] overflow-hidden rounded-3xl">
            <img
              src="https://images.unsplash.com/photo-1530789253388-582c481c54b0?auto=format&fit=crop&w=1200&q=85"
              alt="About"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 glass rounded-xl p-4">
              <div className="text-xs uppercase tracking-widest text-soloz-primary">Since 2017</div>
              <div className="font-display text-xl mt-1 text-stone-900">Building a family of solo explorers.</div>
            </div>
          </Reveal>
          <Reveal>
            <SectionLabel>About WeAreSoloz</SectionLabel>
            <h2 className="font-display text-4xl md:text-6xl font-light tracking-tighter mt-4 leading-[1] text-stone-900">
              Travel Solo. <br />
              <span className="gradient-text">You&apos;re Not Alone.</span>
            </h2>
            <p className="text-soloz-textSecondary mt-8 leading-relaxed font-body">
              {settings.about_content || "WeAreSoloz is more than a travel community. It is a family of explorers who believe in adventure, friendship, self-discovery and unforgettable experiences."}
            </p>
            <p className="text-soloz-textSecondary mt-4 leading-relaxed font-body">
              Whether you&apos;re a solo traveler, trekker, biker, photographer, spiritual explorer or someone seeking new experiences — you&apos;re welcome here.
            </p>
            <Link
              href="/about-akhil"
              data-testid="about-read-more"
              className="inline-flex items-center gap-2 mt-8 text-stone-900 font-medium border-b border-soloz-primary pb-1 hover:text-soloz-primary transition-colors"
            >
              Read the full story <ArrowUpRight className="w-4 h-4" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* SECTION 4 — Upcoming Trips */}
      <section data-testid="upcoming-trips-section" className="py-16 md:py-32 px-4 md:px-10 border-t border-stone-200">
        <div className="max-w-7xl mx-auto">
          <Reveal className="text-center mb-16">
            <SectionLabel>Upcoming Group Trips</SectionLabel>
            <h2 className="font-display text-4xl md:text-6xl font-light tracking-tighter mt-4 text-stone-900">
              The next <span className="gradient-text">expeditions</span>.
            </h2>
          </Reveal>
          {trips.length === 0 ? (
            <div className="text-center py-16 glass rounded-3xl">
              <div className="text-soloz-textSecondary">New trips are being curated. Check back soon.</div>
              <Link href="/soloz-community" className="mt-5 inline-flex items-center gap-2 text-soloz-primary hover:text-white">
                Join the community to be notified <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <motion.div {...stagger} className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {trips.map((t) => (
                <motion.div key={t.id || t._id} variants={item}>
                  <TripCard trip={t} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>
 
      {/* SECTION 5 — Why Travel With Us */}
      <section data-testid="why-section" className="py-16 md:py-32 px-4 md:px-10 border-t border-stone-200 relative">
        <div className="max-w-7xl mx-auto">
          <Reveal className="max-w-2xl mb-16">
            <SectionLabel>Why Travel With Us</SectionLabel>
            <h2 className="font-display text-4xl md:text-6xl font-light tracking-tighter mt-4 text-stone-900">
              Built for <span className="gradient-text">soloz</span>, by a solo.
            </h2>
          </Reveal>
          <motion.div {...stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {WHY.map((w) => (
              <motion.div key={w.title} variants={item} className="glass rounded-2xl p-6 md:p-8 hover-lift border border-stone-200">
                <div className="w-12 h-12 rounded-full bg-soloz-primary/15 border border-soloz-primary/30 flex items-center justify-center mb-5">
                  <w.icon className="w-5 h-5 text-soloz-primary" />
                </div>
                <div className="font-display text-xl font-medium text-stone-900">{w.title}</div>
                <div className="text-sm text-soloz-textSecondary mt-2 leading-relaxed">{w.text}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
 
      {/* SECTION 6 — Meet Akhil */}
      <section data-testid="founder-section" className="py-16 md:py-32 px-4 md:px-10 border-t border-stone-200">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-12 items-center">
          <Reveal className="md:col-span-2 relative aspect-[4/5] rounded-3xl overflow-hidden">
            <img
              src={settings.founder_image || "https://images.unsplash.com/photo-1598966739654-5e9a252d8c32?auto=format&fit=crop&w=1200&q=85"}
              alt="Akhil"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-6 left-6">
              <div className="text-xs uppercase tracking-widest text-soloz-primary">Founder</div>
              <div className="font-display text-3xl mt-1 text-white">Akhil</div>
              <div className="text-xs text-stone-300">@akhillrockstar</div>
            </div>
          </Reveal>
          <Reveal className="md:col-span-3">
            <SectionLabel>Meet Akhil</SectionLabel>
            <h2 className="font-display text-4xl md:text-6xl font-light tracking-tighter mt-4 leading-[1] text-stone-900">
              Seven years <br /><span className="gradient-text">on the road</span>.
            </h2>
            <p className="text-soloz-textSecondary mt-8 leading-relaxed">
              {settings.founder_content || "Hi, I'm Akhil — creator of Akhill Rockstar Travel Stories and founder of WeAreSoloz. For 7+ years I've been exploring India through mountains, temples, villages, forests and hidden destinations. That's why I started WeAreSoloz."}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-10">
              {[
                { k: "7+", v: "Years Traveling" },
                { k: "100+", v: "Destinations" },
                { k: "1000s", v: "Memories" },
                { k: "∞", v: "Friendships" },
              ].map((s) => (
                <div key={s.v} className="glass rounded-xl p-4 sm:p-5 border border-stone-200">
                  <div className="font-display text-3xl font-light gradient-text">{s.k}</div>
                  <div className="text-xs text-soloz-textSecondary mt-1 uppercase tracking-wider">{s.v}</div>
                </div>
              ))}
            </div>
            <Link
              href="/about-akhil"
              data-testid="founder-read-bio"
              className="inline-flex items-center gap-2 mt-10 text-stone-900 font-medium border-b border-soloz-primary pb-1 hover:text-soloz-primary transition-colors"
            >
              Read full biography <ArrowUpRight className="w-4 h-4 text-soloz-primary" />
            </Link>
          </Reveal>
        </div>
      </section>
 
      {/* SECTION 7 — Stories */}
      <section data-testid="stories-section" className="py-16 md:py-32 px-4 md:px-10 border-t border-stone-200">
        <div className="max-w-7xl mx-auto">
          <Reveal className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div>
              <SectionLabel>From the Road</SectionLabel>
              <h2 className="font-display text-4xl md:text-6xl font-light tracking-tighter mt-4 max-w-2xl text-stone-900">Travel Stories.</h2>
            </div>
            <Link
              href="/travel-stories"
              data-testid="see-all-stories"
              className="text-sm text-soloz-textSecondary hover:text-stone-900 inline-flex items-center gap-2 transition-colors"
            >
              All stories <ArrowUpRight className="w-4 h-4" />
            </Link>
          </Reveal>
          {blogs.length === 0 ? (
            <div className="text-center py-16 glass rounded-3xl text-soloz-textSecondary">
              Akhil is writing the next story. Stay tuned.
            </div>
          ) : (
            <motion.div {...stagger} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {blogs.map((b) => (
                <motion.div key={b.id || b._id || b.slug} variants={item}>
                  <StoryCard story={b} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* SECTION 8 — Testimonials */}
      <section data-testid="testimonials-section" className="py-16 md:py-32 px-4 md:px-10 border-t border-stone-200">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-16">
            <SectionLabel>Voices of Soloz</SectionLabel>
            <h2 className="font-display text-4xl md:text-6xl font-light tracking-tighter mt-4 text-stone-900">Real travelers. Real stories.</h2>
          </Reveal>
          {testimonials.length === 0 ? (
            <div className="text-center py-16 glass rounded-3xl text-soloz-textSecondary border border-stone-200">
              Testimonials coming from real Soloz travelers.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {testimonials.slice(0, 4).map((t) => (
                <motion.div
                  key={t.id || t._id || t.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="glass rounded-2xl p-6 sm:p-8 border border-stone-200"
                >
                  <Quote className="w-7 h-7 text-soloz-primary mb-4" />
                  <p className="font-display text-lg sm:text-xl font-light leading-relaxed text-stone-900">{t.quote || t.message}</p>
                  <div className="flex items-center gap-3 mt-6">
                    {t.avatar && <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" />}
                    <div>
                      <div className="font-medium text-stone-900">{t.name}</div>
                      <div className="text-xs text-soloz-textMuted">{t.location || t.role}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
 
      {/* SECTION 9 — Gallery */}
      <section data-testid="gallery-section" className="py-16 md:py-32 px-4 md:px-10 border-t border-stone-200">
        <div className="max-w-7xl mx-auto">
          <Reveal className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div>
              <SectionLabel>Gallery</SectionLabel>
              <h2 className="font-display text-4xl md:text-6xl font-light tracking-tighter mt-4 text-stone-900">Moments, frozen.</h2>
            </div>
            <Link
              href="/gallery"
              data-testid="see-all-gallery"
              className="text-sm text-soloz-textSecondary hover:text-stone-900 inline-flex items-center gap-2"
            >
              Open gallery <ArrowUpRight className="w-4 h-4" />
            </Link>
          </Reveal>
          {gallery.length === 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {["1724161179561-e9b991c83ec1", "1593620529462-619501b0f7f1", "1570369336897-57984b6cf5dc", "1464822759023-fed622ff2c3b", "1626621331169-3526949dc1ec", "1626885930974-4b69aa21bbf9", "1582719471384-894fbb16e074", "1495819427834-1954f20ebb1f"].map((id, i) => (
                <div key={id} className={`relative overflow-hidden rounded-xl group ${i % 5 === 0 ? "row-span-2 col-span-2 md:col-span-1" : ""}`}>
                  <img src={`https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=80`} alt="Gallery" className="w-full h-48 md:h-64 object-cover image-zoom" />
                </div>
              ))}
            </div>
          ) : (
            <div className="columns-2 md:columns-4 gap-4">
              {gallery.map((g) => (
                <div key={g.id || g._id || g.image} className="mb-4 break-inside-avoid rounded-xl overflow-hidden group relative">
                  <img src={g.image} alt={g.caption || g.title} className="w-full h-auto image-zoom" />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
 
      {/* SECTION 10 — CTA */}
      <section data-testid="cta-section" className="relative py-20 md:py-32 px-4 md:px-10 border-t border-stone-200 overflow-hidden bg-stone-50">
        <div className="absolute inset-0 radial-orange-glow opacity-30" />
        <div className="absolute inset-0 grid-noise opacity-20" />
        <div className="relative max-w-4xl mx-auto text-center">
          <SectionLabel>The Soloz Family</SectionLabel>
          <h2 className="font-display text-4xl sm:text-5xl md:text-7xl font-light tracking-tighter mt-5 leading-[1] text-stone-900">
            Join Solo. <br /><span className="gradient-text">Return With Friends.</span>
          </h2>
          <p className="text-soloz-textSecondary mt-7 max-w-xl mx-auto">
            {settings.cta_subheading || "Step into a community where every traveler becomes family. Your next adventure starts with one message."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-10 justify-center">
            <a
              href={settings.whatsapp_link || "https://wa.me/919966085310"}
              target="_blank"
              rel="noreferrer"
              data-testid="cta-join-whatsapp"
              className="inline-flex items-center justify-center gap-2 gradient-orange text-white px-7 py-4 rounded-full font-medium hover:scale-[1.02] transition-transform"
            >
              Join WhatsApp Community <ArrowRight className="w-4 h-4" />
            </a>
            <Link
              href="/contact"
              data-testid="cta-contact"
              className="inline-flex items-center justify-center gap-2 glass text-stone-900 px-7 py-4 rounded-full font-medium hover:bg-stone-100 border border-stone-200"
            >
              Contact Us
            </Link>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mt-10 text-sm text-soloz-textSecondary">
            <a href="https://www.instagram.com/akhillrockstar" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-stone-900">
              <Instagram className="w-4 h-4" /> @akhillrockstar
            </a>
            <a href="tel:+919966085310" className="inline-flex items-center gap-2 hover:text-stone-900">
              <Phone className="w-4 h-4" /> +91 9966085310
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

export function TripCard({ trip }: { trip: any }) {
  const tripSlug = trip.slug || trip.destination?.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return (
    <Link href={`/upcoming-trips/${tripSlug}`} data-testid={`trip-card-${trip.id || trip._id}`} className="block group">
      <div className="glass rounded-2xl overflow-hidden hover-lift border border-stone-200">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={trip.image || "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80"}
            alt={trip.title || trip.destination}
            className="w-full h-full object-cover image-zoom"
          />
          {trip.date && (
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md border border-stone-200 rounded-full px-3 py-1 text-[10px] uppercase tracking-widest text-stone-900 font-semibold">
              {new Date(trip.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </div>
          )}
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between gap-2 text-[10px] uppercase font-semibold">
            <span className="tracking-[0.2em] text-[#ea580c]">{trip.destination}</span>
            <span className="tracking-wider text-stone-500 bg-stone-100/80 rounded-md px-1.5 py-0.5">{trip.category || "Adventure"}</span>
          </div>
          <div className="font-display text-xl font-medium mt-2 text-stone-900 truncate">{trip.title || `${trip.destination} Group Tour`}</div>
          <div className="flex items-center gap-4 mt-4 text-xs text-soloz-textSecondary">
            {trip.duration && <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3 text-stone-500" /> {trip.duration}</span>}
            {trip.seats > 0 && <span className="inline-flex items-center gap-1"><Users className="w-3 h-3 text-stone-500" /> {trip.seats} seats</span>}
          </div>
          <div className="flex items-center justify-between mt-5">
            <div className="text-2xl font-display font-light text-stone-900">{trip.price}</div>
            <div className="text-xs text-soloz-primary inline-flex items-center gap-1">Join trip <ArrowRight className="w-3 h-3" /></div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function StoryCard({ story }: { story: any }) {
  const storySlug = story.slug || story.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return (
    <Link href={`/travel-stories/${storySlug}`} data-testid={`story-card-${story.id || story._id}`} className="block group">
      <div className="aspect-[4/5] rounded-2xl overflow-hidden mb-4">
        <img
          src={story.image || "https://images.unsplash.com/photo-1519719498756-2f0d81cdf13b?auto=format&fit=crop&w=800&q=80"}
          alt={story.title}
          className="w-full h-full object-cover image-zoom"
        />
      </div>
      <div className="label-overline">{story.category}</div>
      <div className="font-display text-lg font-medium mt-2 text-stone-900 group-hover:text-soloz-primary transition-colors">{story.title}</div>
      <div className="text-sm text-soloz-textSecondary mt-2 line-clamp-2">{story.excerpt || story.content?.substring(0, 100)}</div>
    </Link>
  );
}
