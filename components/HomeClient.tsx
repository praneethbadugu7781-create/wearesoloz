"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowRight,
  ArrowUpRight,
  MapPin,
  Calendar,
  Clock,
  Users,
  Sparkles,
  Shield,
  Heart,
  Star,
  Quote,
  Instagram,
  Phone,
  MessageCircle,
} from "lucide-react";
import Reveal, { stagger, item, SectionLabel } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { HomeHero } from "@/components/home-hero";

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
  // 1. Upcoming Trips (Treks/Adventure combined - everything except Temples)
  const upcomingTrips = trips.filter(
    (t) => (t.category || "").toLowerCase() !== "temples"
  );
  const displayUpcoming = upcomingTrips.length > 0 ? upcomingTrips : trips;

  // 2. Spiritual Journeys (Temples)
  const spiritualJourneys = trips.filter(
    (t) => (t.category || "").toLowerCase() === "temples"
  );
  const displaySpiritual =
    spiritualJourneys.length > 0
      ? spiritualJourneys
      : trips.filter(
          (t) =>
            (t.destination || "").toLowerCase().includes("srisailam") ||
            (t.category || "").toLowerCase() === "temples"
        ).slice(0, 3);

  // Contact Form States
  const [form, setForm] = useState({ full_name: "", mobile: "", email: "", destination: "", message: "" });
  const [selectedState, setSelectedState] = useState("");
  const [busy, setBusy] = useState(false);

  // Extract unique states from active trips, falling back to default states
  const statesList = Array.from(new Set(trips.map(t => t.state || "Andhra Pradesh").filter(Boolean)));
  if (statesList.length === 0) {
    statesList.push("Andhra Pradesh", "Telangana", "Karnataka", "Kerala", "Tamil Nadu");
  }

  // Extract destinations filtered by selectedState
  const destinationsForState = selectedState 
    ? Array.from(new Set(
        trips
          .filter(t => (t.state || "Andhra Pradesh").toLowerCase() === selectedState.toLowerCase())
          .map(t => t.destination)
          .filter(Boolean)
      ))
    : [];

  // Fallback destinations per state if none found
  if (selectedState && destinationsForState.length === 0) {
    const fallbackMap: { [key: string]: string[] } = {
      "Andhra Pradesh": ["Gandikota", "Araku Valley", "Tirupati", "Lambasingi", "Ahobilam", "Horsley Hills"],
      "Telangana": ["Ananthagiri Hills", "Warangal", "Laknavaram", "Bhadrachalam", "Nagarjuna Sagar"],
      "Karnataka": ["Hampi", "Gokarna", "Coorg", "Chikmagalur", "Badami", "Dandeli"],
      "Kerala": ["Munnar", "Wayanad", "Vagamon", "Athirappilly", "Varkala", "Alappuzha"],
      "Tamil Nadu": ["Ooty", "Kodaikanal", "Yercaud", "Rameshwaram", "Mahabalipuram", "Kanyakumari"]
    };
    destinationsForState.push(...(fallbackMap[selectedState] || []));
  }

  const submitContactForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const combinedDestination = `${selectedState} - ${form.destination}`;
      
      const res = await fetch(`${API_URL}/contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.full_name,
          mobile: form.mobile,
          email: form.email,
          destination: combinedDestination,
          message: form.message,
        }),
      });

      if (!res.ok) {
        throw new Error("API error");
      }

      toast.success("Inquiry sent! Akhil will get back to you soon.");

      // Open WhatsApp chat prefilled with form data
      const waText = encodeURIComponent(`Hi WeAreSoloz, my name is ${form.full_name}. Mobile: ${form.mobile}. Email: ${form.email}. Interested in: ${combinedDestination}. Message: ${form.message}`);
      const waUrl = `https://wa.me/919966085310?text=${waText}`;
      window.open(waUrl, "_blank");

      setForm({ full_name: "", mobile: "", email: "", destination: "", message: "" });
      setSelectedState("");
    } catch {
      toast.error("Couldn't send. Try again.");
    }
    setBusy(false);
  };

  return (
    <div data-testid="home-page" className="bg-white min-h-screen text-[#1c1917]">
      {/* 🏠 SECTION 1 — HERO */}
      <HomeHero
        title={settings.hero_title || settings.heroTitle || "Start Solo. Travel Together."}
        subheading={settings.hero_subheading || settings.heroSubheading || "Join solo travelers, explore new destinations, meet incredible people and create unforgettable memories together."}
        heroImage={settings.hero_image || settings.heroImage}
      />

      {/* 📅 SECTION 2 — Upcoming Trips */}
      <section data-testid="upcoming-trips-section" className="py-16 md:py-24 px-4 md:px-10 border-t border-stone-200">
        <div className="max-w-7xl mx-auto">
          <Reveal className="text-center mb-16">
            <SectionLabel>📅 Upcoming Solo Trips</SectionLabel>
            <h2 className="font-display text-4xl md:text-6xl font-light tracking-tighter mt-4 text-stone-900">
              The next <span className="gradient-text font-medium">expeditions</span>.
            </h2>
          </Reveal>
          {displayUpcoming.length === 0 ? (
            <div className="text-center py-16 glass rounded-3xl">
              <div className="text-soloz-textSecondary">New trips are being curated. Check back soon.</div>
            </div>
          ) : (
            <motion.div {...stagger} className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {displayUpcoming.map((t) => (
                <motion.div key={t.id || t._id} variants={item}>
                  <TripCard trip={t} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* 🛕 SECTION 3 — Spiritual Journeys */}
      <section data-testid="spiritual-journeys-section" className="py-16 md:py-24 px-4 md:px-10 border-t border-stone-200 bg-stone-50/50">
        <div className="max-w-7xl mx-auto">
          <Reveal className="text-center mb-16">
            <SectionLabel>🛕 Spiritual Journeys</SectionLabel>
            <h2 className="font-display text-4xl md:text-6xl font-light tracking-tighter mt-4 text-stone-900">
              Sacred trails and <span className="gradient-text font-medium">soulful yatras</span>.
            </h2>
          </Reveal>
          {displaySpiritual.length === 0 ? (
            <div className="text-center py-16 glass rounded-3xl bg-white">
              <div className="text-soloz-textSecondary">Spiritual journeys are being curated. Check back soon.</div>
            </div>
          ) : (
            <motion.div {...stagger} className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {displaySpiritual.map((t) => (
                <motion.div key={t.id || t._id} variants={item}>
                  <TripCard trip={t} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* 👥 SECTION 5 — Why Join WeAreSoloz */}
      <section data-testid="why-section" className="py-16 md:py-24 px-4 md:px-10 border-t border-stone-200 bg-stone-50/50">
        <div className="max-w-7xl mx-auto">
          <Reveal className="max-w-2xl mb-16 mx-auto text-center">
            <SectionLabel>👥 Why Join WeAreSoloz?</SectionLabel>
            <h2 className="font-display text-4xl md:text-6xl font-light tracking-tighter mt-4 text-stone-900">
              Built for <span className="gradient-text font-medium">soloz</span>, by a solo.
            </h2>
          </Reveal>
          <motion.div {...stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {WHY.map((w) => (
              <motion.div key={w.title} variants={item} className="bg-white/80 border border-stone-200/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] backdrop-blur-md rounded-2xl p-6 md:p-8 hover-lift hover:shadow-md hover:border-orange-500/20 transition-all duration-300">
                <div className="w-12 h-12 rounded-full bg-soloz-primary/10 border border-soloz-primary/20 flex items-center justify-center mb-5">
                  <w.icon className="w-5 h-5 text-soloz-primary" />
                </div>
                <div className="font-display text-xl font-semibold text-stone-900">{w.title}</div>
                <div className="text-sm text-stone-600 mt-2 leading-relaxed font-body">{w.text}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 📸 SECTION 6 — Travel Memories Gallery */}
      <section data-testid="gallery-section" className="py-16 md:py-24 px-4 md:px-10 border-t border-stone-200">
        <div className="max-w-7xl mx-auto">
          <Reveal className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div>
              <SectionLabel>📸 Travel Memories Gallery</SectionLabel>
              <h2 className="font-display text-4xl md:text-6xl font-light tracking-tighter mt-4 text-stone-900">Moments, frozen.</h2>
            </div>
            <Link
              href="/gallery"
              data-testid="see-all-gallery"
              className="text-sm text-soloz-textSecondary hover:text-stone-900 inline-flex items-center gap-2 group transition-colors"
            >
              Open gallery <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
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
              {gallery.slice(0, 8).map((g) => (
                <div key={g.id || g._id || g.image} className="mb-4 break-inside-avoid rounded-xl overflow-hidden group relative">
                  <img src={g.image} alt={g.caption || g.title} className="w-full h-auto image-zoom" />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ⭐ SECTION 7 — Testimonials */}
      <section data-testid="testimonials-section" className="py-16 md:py-24 px-4 md:px-10 border-t border-stone-200 bg-stone-50/50">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-16">
            <SectionLabel>⭐ Voices of Soloz</SectionLabel>
            <h2 className="font-display text-4xl md:text-6xl font-light tracking-tighter mt-4 text-stone-900">Real travelers. Real stories.</h2>
          </Reveal>
          {testimonials.length === 0 ? (
            <div className="text-center py-16 glass rounded-3xl text-soloz-textSecondary border border-stone-200 bg-white">
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
                  className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-sm"
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

      {/* 📱 SECTION 8 — WhatsApp Community CTA */}
      <section data-testid="whatsapp-community-section" className="py-16 md:py-24 px-4 md:px-10 border-t border-stone-200 relative overflow-hidden bg-emerald-50/20">
        <div className="absolute inset-0 radial-orange-glow opacity-5 pointer-events-none" />
        <div className="relative max-w-4xl mx-auto text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-6">
            <MessageCircle className="w-4 h-4 text-emerald-600 animate-bounce" /> Official WhatsApp Community
          </div>
          <h2 className="font-display text-4xl sm:text-5xl md:text-7xl font-light tracking-tighter leading-none text-stone-900">
            Connect with <span className="text-emerald-600 font-medium">1,000+</span> <br />Solo Travelers
          </h2>
          <p className="text-stone-600 mt-6 max-w-xl mx-auto leading-relaxed font-body">
            Join our official WhatsApp community to get instant updates on upcoming solo trips, participate in trip planning Q&A, and chat with travel buddies who share your passion for adventure.
          </p>
          <div className="mt-8">
            <a
              href={settings.whatsapp_link || "https://wa.me/919966085310"}
              target="_blank"
              rel="noreferrer"
              data-testid="cta-join-whatsapp"
              className="inline-flex items-center justify-center gap-3 bg-emerald-600 text-white hover:bg-emerald-700 px-8 py-4 rounded-full font-bold text-sm uppercase tracking-wider transition-all duration-300 shadow-[0_4px_20px_rgba(5,150,105,0.25)] hover:scale-[1.03]"
            >
              <MessageCircle className="w-5 h-5" /> Join WhatsApp Community
            </a>
          </div>
        </div>
      </section>

      {/* 📞 SECTION 9 — Contact / Join Now */}
      <section data-testid="contact-join-section" className="py-16 md:py-28 px-4 md:px-10 border-t border-stone-200 bg-stone-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-5 gap-12 items-start">
            {/* Info panel */}
            <div className="md:col-span-2">
              <SectionLabel>📞 Contact / Join Now</SectionLabel>
              <h2 className="font-display text-4xl md:text-6xl font-light tracking-tighter mt-4 text-stone-900 leading-none">
                Start your <br /><span className="gradient-text font-medium">adventure</span>.
              </h2>
              <p className="text-stone-600 mt-6 leading-relaxed font-body">
                Ready to join an upcoming trip or have questions? Fill out the details here, and Akhil will get back to you immediately to finalize your booking.
              </p>

              <div className="mt-10 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-stone-400">Call / WhatsApp</div>
                    <a href="tel:+919966085310" className="text-stone-900 font-semibold hover:text-orange-500 transition-colors">+91 99660 85310</a>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                    <Instagram className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-stone-400">Instagram</div>
                    <a href="https://www.instagram.com/wearesolozindia?igsh=MWZjNjN0MXhidWJ2Yw==" target="_blank" rel="noreferrer" className="text-stone-900 font-semibold hover:text-orange-500 transition-colors">@wearesolozindia</a>
                  </div>
                </div>
              </div>
            </div>

            {/* Form panel */}
            <div className="md:col-span-3 bg-white p-6 sm:p-10 rounded-3xl border border-stone-200 shadow-sm relative">
              <h3 className="font-display text-2xl font-semibold text-stone-900 mb-6">Inquiry & Booking Form</h3>
              
              <form onSubmit={submitContactForm} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-stone-400 block mb-1">Full Name</label>
                    <Input
                      required
                      value={form.full_name}
                      onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                      placeholder="Your name"
                      className="border-stone-200 focus-visible:ring-orange-500 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-stone-400 block mb-1">Mobile Number</label>
                    <Input
                      required
                      type="tel"
                      value={form.mobile}
                      onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                      placeholder="Your mobile number"
                      className="border-stone-200 focus-visible:ring-orange-500 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-stone-400 block mb-1">Email Address</label>
                  <Input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="Your email address"
                    className="border-stone-200 focus-visible:ring-orange-500 rounded-lg"
                  />
                </div>

                {/* Dependent Dropdowns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-stone-400 block mb-1">State</label>
                    <select
                      required
                      value={selectedState}
                      onChange={(e) => {
                        setSelectedState(e.target.value);
                        setForm({ ...form, destination: "" });
                      }}
                      className="w-full h-10 px-3 rounded-lg border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 text-stone-800"
                    >
                      <option value="" disabled>Select State</option>
                      {statesList.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-stone-400 block mb-1">Destination Interested</label>
                    <select
                      required
                      disabled={!selectedState}
                      value={form.destination}
                      onChange={(e) => setForm({ ...form, destination: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 text-stone-800"
                    >
                      <option value="" disabled>Select Destination</option>
                      {destinationsForState.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-stone-400 block mb-1">Message (Optional)</label>
                  <Textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Tell us if you have any questions or custom dates..."
                    className="border-stone-200 focus-visible:ring-orange-500 rounded-lg min-h-[100px]"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={busy}
                  className="w-full h-12 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold transition-all duration-300"
                >
                  {busy ? "Sending Inquiry..." : "Send Inquiry & Chat on WhatsApp"}
                </Button>
              </form>
            </div>
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
      <div className="bg-white rounded-2xl overflow-hidden hover-lift border border-stone-200/80 shadow-sm hover:shadow-md transition-all duration-300">
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
          {trip.state?.toLowerCase() === "sri lanka" && (
            <div className="absolute top-4 right-4 bg-[#ea580c] border border-orange-500 rounded-full px-3 py-1 text-[9px] uppercase tracking-widest text-white font-extrabold shadow-md animate-pulse">
              Budget International
            </div>
          )}
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between gap-2 text-[10px] uppercase font-semibold">
            <span className="tracking-[0.2em] text-[#ea580c]">{trip.destination}</span>
            <span className="tracking-wider text-stone-500 bg-stone-100/80 rounded-md px-1.5 py-0.5">{trip.category || "Adventure"}</span>
          </div>
          <div className="font-display text-xl font-medium mt-2 text-stone-900 truncate">{trip.title || `${trip.destination} Expedition`}</div>
          <div className="flex items-center gap-4 mt-4 text-xs text-stone-600">
            {trip.duration && <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3 text-stone-500" /> {trip.duration}</span>}
            {trip.seats > 0 && <span className="inline-flex items-center gap-1"><Users className="w-3 h-3 text-stone-500" /> {trip.seats} seats</span>}
          </div>
          <div className="flex items-center justify-between mt-5 pt-4 border-t border-stone-100">
            <div className="text-sm font-medium text-stone-500">Contact for Price</div>
            <div className="text-xs text-soloz-primary inline-flex items-center gap-1 font-bold group-hover:text-orange-600 transition-colors">Join trip <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" /></div>
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
