"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import SuccessModal from "./SuccessModal";
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
  Volume2,
  VolumeX,
} from "lucide-react";
import Reveal, { stagger, item, SectionLabel } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { getOptimizedImageUrl } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { HomeHero } from "@/components/home-hero";
import Card3D from "@/components/Card3D";
import TermsModal from "./TermsModal";
import WriteReviewModal from "./WriteReviewModal";
import { useLanguage } from "@/lib/LanguageContext";

const WHY = [
  { icon: Users, title: "Travel Together", text: "Solo at start. Family by the end of every trip." },
  { icon: Shield, title: "Safe Community", text: "Verified travellers, vetted hosts, secure trips." },
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
  reels?: any[];
}

function ReelCard({ reel }: { reel: any }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);

  const toggleMute = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (videoRef.current) {
      const newMuted = !videoRef.current.muted;
      videoRef.current.muted = newMuted;
      setIsMuted(newMuted);
    }
  };

  return (
    <div className="relative aspect-[9/16] w-[260px] sm:w-[280px] shrink-0 rounded-2xl overflow-hidden bg-stone-950 border border-white/5 shadow-lg group snap-start">
      <video
        ref={videoRef}
        src={reel.video}
        className="w-full h-full object-cover"
        loop
        muted
        playsInline
        autoPlay
      />
      {/* Dark overlay at bottom */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

      {/* sound controls */}
      <button
        onClick={toggleMute}
        className="absolute top-4 right-4 z-10 grid size-10 place-items-center rounded-full bg-black/60 backdrop-blur-md text-white border border-white/10 hover:bg-black/80 transition-all duration-300 pointer-events-auto"
        aria-label={isMuted ? "Unmute video" : "Mute video"}
      >
        {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
      </button>

      {/* Info details */}
      <div className="absolute bottom-5 left-5 right-5 text-white flex flex-col gap-1.5 pointer-events-none">
        {reel.category && (
          <span className="self-start text-[8px] tracking-[0.15em] font-extrabold bg-[#ea580c]/25 border border-orange-500/25 px-2 py-0.5 rounded uppercase text-soloz-amber">
            {reel.category}
          </span>
        )}
        <h4 className="font-display font-bold text-sm sm:text-base leading-tight uppercase drop-shadow-md">
          {reel.title}
        </h4>
        {reel.caption && (
          <p className="text-[10px] text-stone-300 line-clamp-2 leading-relaxed drop-shadow-sm font-body">
            {reel.caption}
          </p>
        )}
      </div>
    </div>
  );
}

export default function HomeClient({
  settings = {},
  trips = [],
  destinations = [],
  blogs = [],
  testimonials = [],
  gallery = [],
  reels = [],
}: HomeClientProps) {
  const { t, locale } = useLanguage();

  const localizedWHY = [
    { icon: Users, title: t("why_1_title"), text: t("why_1_desc") },
    { icon: Shield, title: t("why_2_title"), text: t("why_2_desc") },
    { icon: Star, title: t("why_3_title"), text: t("why_3_desc") },
    { icon: MapPin, title: t("why_4_title"), text: t("why_4_desc") },
    { icon: Sparkles, title: t("why_5_title"), text: t("why_5_desc") },
    { icon: Heart, title: t("why_6_title"), text: t("why_6_desc") },
  ];
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
  const [form, setForm] = useState({ full_name: "", mobile: "", email: "", destination: "", message: "", age: "", bloodGroup: "" });
  const [selectedState, setSelectedState] = useState("");
  const [busy, setBusy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [waUrl, setWaUrl] = useState("");

  // Testimonials State
  const [allTestimonials, setAllTestimonials] = useState(testimonials);
  const [showWriteReview, setShowWriteReview] = useState(false);

  const handleNewReview = (newReview: any) => {
    setAllTestimonials([newReview, ...allTestimonials]);
  };

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
    if (!form.full_name || form.full_name.length < 2) {
      toast.error("Please enter your full name (minimum 2 characters)");
      return;
    }
    const ageNum = Number(form.age);
    if (!form.age || isNaN(ageNum) || ageNum < 18 || ageNum > 100) {
      toast.error("Please enter a valid age (18 or older)");
      return;
    }
    if (!form.bloodGroup) {
      toast.error("Please select your blood group");
      return;
    }
    const phoneRegex = /^[+]?[0-9\s\-]{7,15}$/;
    if (!form.mobile || !phoneRegex.test(form.mobile.trim())) {
      toast.error("Please enter a valid 10-digit mobile number (e.g. +91 9966085310)");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email || !emailRegex.test(form.email.trim())) {
      toast.error("Please enter a valid email address (e.g. name@example.com)");
      return;
    }
    if (!selectedState) {
      toast.error("Please select a state of interest");
      return;
    }
    if (!form.destination) {
      toast.error("Please select a destination of interest");
      return;
    }
    if (!form.message || form.message.length < 5) {
      toast.error("Please enter a message (minimum 5 characters)");
      return;
    }

    setShowTerms(true);
  };

  const handleActualSubmit = async () => {
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
          age: Number(form.age),
          bloodGroup: form.bloodGroup,
          destination: combinedDestination,
          message: form.message,
        }),
      });

      if (!res.ok) {
        throw new Error("API error");
      }

      // Open WhatsApp chat prefilled with form data
      const waText = encodeURIComponent(`Hi WeAreSoloz, my name is ${form.full_name}.\nAge: ${form.age}\nBlood Group: ${form.bloodGroup}\nMobile: ${form.mobile}\nEmail: ${form.email}\nInterested in: ${combinedDestination}\nMessage: ${form.message}`);
      const generatedWaUrl = `https://wa.me/919966085310?text=${waText}`;
      setWaUrl(generatedWaUrl);
      window.open(generatedWaUrl, "_blank");

      setForm({ full_name: "", mobile: "", email: "", destination: "", message: "", age: "", bloodGroup: "" });
      setSelectedState("");
      setShowSuccess(true);
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
        subheading={settings.hero_subheading || settings.heroSubheading || "Join solo travellers, explore new destinations, meet incredible people and create unforgettable memories together."}
        heroImage={settings.hero_image || settings.heroImage}
        featuredTrips={trips.filter(t => t.status === "published").length > 0 ? trips.filter(t => t.status === "published").slice(0, 3) : trips.slice(0, 3)}
      />

      {/* 📅 SECTION 2 — Upcoming Trips */}
      <section data-testid="upcoming-trips-section" className="py-16 md:py-24 px-4 md:px-10 border-t border-stone-200">
        <div className="max-w-7xl mx-auto">
          <Reveal className="text-center mb-16">
            <SectionLabel>📅 {t("upcoming_trips")}</SectionLabel>
            <h2 className="font-display text-4xl md:text-6xl font-light tracking-tighter mt-4 text-stone-900">
              {locale === "te" ? "తదుపరి సాహస యాత్రలు." : locale === "hi" ? "अगले अभियान।" : <>The next <span className="gradient-text font-medium">expeditions</span>.</>}
            </h2>
          </Reveal>
          {displayUpcoming.length === 0 ? (
            <div className="text-center py-16 glass rounded-3xl">
              <div className="text-soloz-textSecondary">New trips are being curated. Check back soon.</div>
            </div>
          ) : (
            <motion.div {...stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
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
            <SectionLabel>🛕 {locale === "te" ? "ఆధ్యాత్మిక యాత్రలు" : locale === "hi" ? "आध्यात्मिक यात्राएं" : "Spiritual Journeys"}</SectionLabel>
            <h2 className="font-display text-4xl md:text-6xl font-light tracking-tighter mt-4 text-stone-900">
              {locale === "te" ? "పవిత్ర మార్గాలు మరియు ఆధ్యాత్మిక అనుభూతులు." : locale === "hi" ? "पवित्र मार्ग और आध्यात्मिक अनुभूतियाँ।" : <>Sacred trails and <span className="gradient-text font-medium">soulful yatras</span>.</>}
            </h2>
          </Reveal>
          {displaySpiritual.length === 0 ? (
            <div className="text-center py-16 glass rounded-3xl bg-white">
              <div className="text-soloz-textSecondary">Spiritual journeys are being curated. Check back soon.</div>
            </div>
          ) : (
            <motion.div {...stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
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
            <SectionLabel>👥 {t("why_choose_us")}</SectionLabel>
            <h2 className="font-display text-4xl md:text-6xl font-light tracking-tighter mt-4 text-stone-900">
              {locale === "te" ? "సోలోల కోసం ప్రత్యేకంగా నిర్మించబడింది." : locale === "hi" ? "सोलोज़ के लिए विशेष रूप से निर्मित।" : <>Built for <span className="gradient-text font-medium">soloz</span>, by a solo.</>}
            </h2>
          </Reveal>
          <motion.div {...stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {localizedWHY.map((w) => (
              <motion.div key={w.title} variants={item}>
                <Card3D maxRotate={7} scale={1.02} className="h-full">
                  <div className="bg-white/80 border border-stone-200/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] backdrop-blur-md rounded-2xl p-6 md:p-8 hover-lift hover:shadow-md hover:border-orange-500/20 transition-all duration-300 h-full">
                    <div className="w-12 h-12 rounded-full bg-soloz-primary/10 border border-soloz-primary/20 flex items-center justify-center mb-5">
                      <w.icon className="w-5 h-5 text-soloz-primary" />
                    </div>
                    <div className="font-display text-xl font-semibold text-stone-900">{w.title}</div>
                    <div className="text-sm text-stone-600 mt-2 leading-relaxed font-body">{w.text}</div>
                  </div>
                </Card3D>
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
              <SectionLabel>📸 {locale === "te" ? "ప్రయాణ జ్ఞాపకాల గ్యాలరీ" : locale === "hi" ? "यात्रा यादों की गैलरी" : "Travel Memories Gallery"}</SectionLabel>
              <h2 className="font-display text-4xl md:text-6xl font-light tracking-tighter mt-4 text-stone-900">{locale === "te" ? "మరపురాని క్షణాలు." : locale === "hi" ? "अविस्मरणीय क्षण।" : "Moments, frozen."}</h2>
            </div>
            <Link
              href="/gallery"
              data-testid="see-all-gallery"
              className="text-sm text-soloz-textSecondary hover:text-stone-900 inline-flex items-center gap-2 group transition-colors"
            >
              {locale === "te" ? "గ్యాలరీని తెరవండి" : locale === "hi" ? "गैलरी खोलें" : "Open gallery"} <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
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
                  <img
                    src={getOptimizedImageUrl(g.image, 600)}
                    alt={g.caption || g.title}
                    loading="lazy"
                    className="w-full h-auto image-zoom"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 🎥 NEW SECTION — Reels in Motion */}
      {reels && reels.length > 0 && (
        <section data-testid="reels-section" className="py-16 md:py-24 px-4 md:px-10 border-t border-stone-200 bg-stone-50/50">
          <div className="max-w-7xl mx-auto space-y-12">
            <Reveal className="text-center flex flex-col items-center">
              <SectionLabel>🎥 Moments in Motion</SectionLabel>
              <h2 className="font-display text-4xl md:text-6xl font-light tracking-tighter mt-4 text-stone-900">
                Soloz <span className="gradient-text font-medium">Reels</span>
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 mt-2 max-w-xl">
                Watch raw, unfiltered snippets from our latest journeys. Click the audio icons to unmute.
              </p>
            </Reveal>

            {/* Horizontal Reels Track */}
            <div className="flex gap-5 overflow-x-auto pb-6 scrollbar-hide snap-x snap-mandatory pr-4">
              {reels.map((reel) => (
                <ReelCard key={reel._id || reel.video} reel={reel} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ⭐ SECTION 7 — Testimonials */}
      <section data-testid="testimonials-section" className="py-16 md:py-24 px-4 md:px-10 border-t border-stone-200 bg-white">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-16 flex flex-col items-center">
            <SectionLabel>⭐ {t("what_travellers_say")}</SectionLabel>
            <h2 className="font-display text-4xl md:text-6xl font-light tracking-tighter mt-4 text-stone-900">
              {locale === "te" ? "నిజమైన ప్రయాణీకులు. నిజమైన కథనాలు." : locale === "hi" ? "वास्तविक यात्री। वास्तविक कहानियाँ।" : "Real travellers. Real stories."}
            </h2>
            <button
              onClick={() => setShowWriteReview(true)}
              className="mt-6 inline-flex items-center gap-2 border border-stone-300 hover:bg-stone-50 text-stone-700 font-bold uppercase tracking-wider text-[11px] px-6 py-3 rounded-full transition-all duration-300"
            >
              {locale === "te" ? "సమీక్ష రాయండి" : locale === "hi" ? "समीक्षा लिखें" : "Write a Review"}
            </button>
          </Reveal>
          {allTestimonials.length === 0 ? (
            <div className="text-center py-16 glass rounded-3xl text-soloz-textSecondary border border-stone-200 bg-white">
              Testimonials coming from real Soloz travellers.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {allTestimonials.slice(0, 4).map((t) => (
                <motion.div
                  key={t.id || t._id || t.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Card3D maxRotate={5} scale={1.01} className="h-full">
                    <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-sm h-full flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <Quote className="w-7 h-7 text-soloz-primary" />
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                className={i < (t.rating || 5) ? "fill-amber-400 text-amber-400" : "text-stone-200"}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="font-display text-lg sm:text-xl font-light leading-relaxed text-stone-900">{t.quote || t.message}</p>
                      </div>
                      <div className="flex items-center gap-3 mt-6">
                        {t.avatar && <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" />}
                        <div>
                          <div className="font-medium text-stone-900">{t.name}</div>
                          <div className="text-xs text-soloz-textMuted">{t.location || t.role}</div>
                        </div>
                      </div>
                    </div>
                  </Card3D>
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
          <Reveal className="flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-6">
              <MessageCircle className="w-4 h-4 text-emerald-600 animate-bounce" /> {locale === "te" ? "అధికారిక వాట్సాప్ కమ్యూనిటీ" : locale === "hi" ? "आधिकारिक व्हाट्सएप कम्युनिटी" : "Official WhatsApp Community"}
            </div>
            <h2 className="font-display text-4xl sm:text-5xl md:text-7xl font-light tracking-tighter leading-none text-stone-900">
              {locale === "te" ? <>కనెక్ట్ అవ్వండి <span className="text-emerald-600 font-medium">1,000+</span> <br />సోలో ప్రయాణీకులతో</> : locale === "hi" ? <>जुड़ें <span className="text-emerald-600 font-medium">1,000+</span> <br />सोलो यात्रियों से</> : <>Connect with <span className="text-emerald-600 font-medium">1,000+</span> <br />Solo Travellers</>}
            </h2>
            <p className="text-stone-600 mt-6 max-w-xl mx-auto leading-relaxed font-body">
              {locale === "te" ? (
                "రాబోయే సోలో ట్రిప్స్ గురించి తక్షణ అప్‌డేట్‌లను పొందడానికి, ట్రిప్ ప్లానింగ్ చర్చల్లో పాల్గొనడానికి మరియు మీలాగే ప్రయాణాలను ఇష్టపడే స్నేహితులతో చాట్ చేయడానికి మా అధికారిక వాట్సాప్ కమ్యూనిటీలో చేరండి."
              ) : locale === "hi" ? (
                "आगामी सोलो ट्रिप्स पर तुरंत अपडेट प्राप्त करने, ट्रिप प्लानिंग चर्चाओं में भाग लेने और यात्रा के शौकीन मित्रों के साथ चैट करने के लिए हमारे आधिकारिक व्हाट्सएप समुदाय में शामिल हों।"
              ) : (
                "Join our official WhatsApp community to get instant updates on upcoming solo trips, participate in trip planning Q&A, and chat with travel buddies who share your passion for adventure."
              )}
            </p>
            <div className="mt-8">
              <a
                href={settings.whatsapp_link || "https://chat.whatsapp.com/E7aoVfUi66S4VDEBsdXoMW"}
                target="_blank"
                rel="noreferrer"
                data-testid="cta-join-whatsapp"
                className="inline-flex items-center justify-center gap-3 bg-emerald-600 text-white hover:bg-emerald-700 px-8 py-4 rounded-full font-bold text-sm uppercase tracking-wider transition-all duration-300 shadow-[0_4px_20px_rgba(5,150,105,0.25)] hover:scale-[1.03]"
              >
                <MessageCircle className="w-5 h-5" /> {t("join_whatsapp")}
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 📞 SECTION 9 — Contact / Join Now */}
      <section data-testid="contact-join-section" className="py-16 md:py-28 px-4 md:px-10 border-t border-stone-200 bg-stone-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-5 gap-12 items-start">
            {/* Info panel */}
            <Reveal className="md:col-span-2">
              <SectionLabel>📞 {t("contact_us")}</SectionLabel>
              <h2 className="font-display text-4xl md:text-6xl font-light tracking-tighter mt-4 text-stone-900 leading-none">
                {locale === "te" ? <>మీ <br /><span className="gradient-text font-medium">సాహసాన్ని</span> ప్రారంభించండి.</> : locale === "hi" ? <>अपना <br /><span className="gradient-text font-medium">रोमांच</span> शुरू करें।</> : <>Start your <br /><span className="gradient-text font-medium">adventure</span>.</>}
              </h2>
              <p className="text-stone-600 mt-6 leading-relaxed font-body">
                {locale === "te" ? (
                  "రాబోయే ట్రిప్‌లో చేరడానికి సిద్ధంగా ఉన్నారా లేదా ఏవైనా ప్రశ్నలు ఉన్నాయా? ఇక్కడ వివరాలను పూరించండి మరియు మీ బుకింగ్‌ను ఖరారు చేయడానికి అఖిల్ వెంటనే మిమ్మల్ని సంప్రదిస్తారు."
                ) : locale === "hi" ? (
                  "आगामी यात्रा में शामिल होने के लिए तैयार हैं या कोई प्रश्न हैं? यहाँ विवरण भरें, और बुकिंग को अंतिम रूप देने के लिए अखिल तुरंत आपसे संपर्क करेंगे।"
                ) : (
                  "Ready to join an upcoming trip or have questions? Fill out the details here, and Akhil will get back to you immediately to finalize your booking."
                )}
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
            </Reveal>

            {/* Form panel */}
            <Reveal className="md:col-span-3 bg-white p-6 sm:p-10 rounded-3xl border border-stone-200 shadow-sm relative">
              <h3 className="font-display text-2xl font-semibold text-stone-900 mb-6">
                {locale === "te" ? "విచారణ & బుకింగ్ ఫారమ్" : locale === "hi" ? "पूछताछ और बुकिंग फॉर्म" : "Inquiry & Booking Form"}
              </h3>
              
              <form onSubmit={submitContactForm} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-stone-400 block mb-1">{t("full_name")}</label>
                    <Input
                      required
                      value={form.full_name}
                      onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                      placeholder="Your name"
                      className="border-stone-200 focus-visible:ring-orange-500 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-stone-400 block mb-1">{t("phone_number")}</label>
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

                {/* Age & Blood Group */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-stone-400 block mb-1">
                      {locale === "te" ? "వయస్సు" : locale === "hi" ? "उम्र" : "Age"}
                    </label>
                    <Input
                      required
                      type="number"
                      value={form.age}
                      onChange={(e) => setForm({ ...form, age: e.target.value })}
                      placeholder="Your Age"
                      className="border-stone-200 focus-visible:ring-orange-500 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-stone-400 block mb-1">
                      {locale === "te" ? "రక్త గ్రూపు" : locale === "hi" ? "रक्त समूह" : "Blood Group"}
                    </label>
                    <div className="relative">
                      <select
                        required
                        value={form.bloodGroup}
                        onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
                        className="w-full h-10 px-3 pr-10 rounded-lg border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 text-stone-800 appearance-none cursor-pointer"
                      >
                        <option value="" disabled>Select Blood</option>
                        {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-stone-400 block mb-1">{t("email_address")}</label>
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
                    <label className="text-[10px] uppercase font-bold text-stone-400 block mb-1">
                      {locale === "te" ? "రాష్ట్రం" : locale === "hi" ? "राज्य" : "State"}
                    </label>
                    <div className="relative">
                      <select
                        required
                        value={selectedState}
                        onChange={(e) => {
                          setSelectedState(e.target.value);
                          setForm({ ...form, destination: "" });
                        }}
                        className="w-full h-10 px-3 pr-10 rounded-lg border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 text-stone-800 appearance-none cursor-pointer"
                      >
                        <option value="" disabled>Select State</option>
                        {statesList.map((st) => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path>
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-stone-400 block mb-1">
                      {locale === "te" ? "ఆసక్తి గల గమ్యస్థానం" : locale === "hi" ? "गंतव्य जिसमें रुचि है" : "Destination Interested"}
                    </label>
                    <div className="relative">
                      <select
                        required
                        disabled={!selectedState}
                        value={form.destination}
                        onChange={(e) => setForm({ ...form, destination: e.target.value })}
                        className="w-full h-10 px-3 pr-10 rounded-lg border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 text-stone-800 appearance-none cursor-pointer"
                      >
                        <option value="" disabled>Select Destination</option>
                        {destinationsForState.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-stone-400 block mb-1">{t("message_optional")}</label>
                  <Textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Tell us if you have any questions or custom dates..."
                    className="border-stone-200 focus-visible:ring-orange-500 rounded-lg min-h-[100px]"
                  />
                </div>

                {/* Styled Travel Policy Notice Card */}
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-900 leading-normal font-body">
                  {locale === "te" ? (
                    "⚠️ బుకింగ్ గమనిక: ప్రారంభ నగరానికి రైలు/విమాన టిక్కెట్లు చేర్చబడలేదు. మీరు నేరుగా అసెంబ్లీ పాయింట్ వద్ద అఖిల్‌ను కలుస్తారు."
                  ) : locale === "hi" ? (
                    "⚠️ बुकिंग सूचना: शुरुआती शहर के लिए ट्रेन/उड़ान टिकट शामिल नहीं हैं। आप सीधे असेंबली पॉइंट पर अखिल से मिलेंगे।"
                  ) : (
                    "⚠️ Booking Notice: Train/flight tickets to the starting city are not included. You will meet Akhil directly at the assembly point."
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={busy}
                  className="w-full h-12 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold transition-all duration-300"
                >
                  {busy 
                    ? t("submitting") 
                    : (locale === "te" 
                        ? "విచారణను సమర్పించండి & వాట్సాప్‌లో చాట్ చేయండి" 
                        : locale === "hi" 
                          ? "पूछताछ भेजें और व्हाट्सएप पर चैट करें" 
                          : "Send Inquiry & Chat on WhatsApp"
                      )
                  }
                </Button>
              </form>
            </Reveal>
          </div>
        </div>
      </section>

      <TermsModal
        isOpen={showTerms}
        onClose={() => setShowTerms(false)}
        onAccept={handleActualSubmit}
      />

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Enquiry Submitted Successfully!"
        message="Thank you for your interest! Akhil will contact you shortly to plan your escape."
        whatsappUrl={waUrl}
      />

      <WriteReviewModal
        isOpen={showWriteReview}
        onClose={() => setShowWriteReview(false)}
        onSuccess={handleNewReview}
      />
    </div>
  );
}

export function TripCard({ trip, showDate = false }: { trip: any; showDate?: boolean }) {
  const tripSlug = trip.slug || trip.destination?.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return (
    <Link href={`/upcoming-trips/${tripSlug}`} data-testid={`trip-card-${trip.id || trip._id}`} className="block group h-full">
      <Card3D maxRotate={6} scale={1.02} className="h-full">
        <div className="bg-white rounded-2xl overflow-hidden border border-stone-200/80 shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col justify-between">
          <div>
            <div className="relative aspect-[4/3] overflow-hidden">
              <img
                src={getOptimizedImageUrl(trip.image || "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80", 600)}
                alt={trip.title || trip.destination}
                loading="lazy"
                className="w-full h-full object-cover image-zoom"
              />
              {trip.date && (showDate || trip.destination?.toLowerCase().includes("sabarimala")) && (
                <div className="absolute top-2 left-2 md:top-4 md:left-4 bg-white/90 backdrop-blur-md border border-stone-200 rounded-full px-2 py-0.5 md:px-3 md:py-1 text-[8px] md:text-[10px] uppercase tracking-widest text-stone-900 font-semibold">
                  {trip.destination?.toLowerCase().includes("sabarimala")
                    ? "Every Month"
                    : new Date(trip.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </div>
              )}
              {trip.state?.toLowerCase() === "sri lanka" && (
                <div className="absolute top-2 right-2 md:top-4 md:right-4 bg-[#ea580c] border border-orange-500 rounded-full px-2 py-0.5 md:px-3 md:py-1 text-[8px] md:text-[9px] uppercase tracking-widest text-white font-extrabold shadow-md animate-pulse">
                  Budget <span className="hidden sm:inline">International</span><span className="sm:hidden">Intl</span>
                </div>
              )}
            </div>
            <div className="p-3 md:p-6">
              <div className="flex items-center justify-between gap-1.5 text-[8px] md:text-[10px] uppercase font-semibold">
                <span className="tracking-[0.1em] md:tracking-[0.2em] text-[#ea580c] truncate max-w-[60%] sm:max-w-none">{trip.destination}</span>
                <span className="tracking-wider text-stone-500 bg-stone-100/80 rounded-md px-1 md:px-1.5 py-0.5 scale-90 md:scale-100 origin-right shrink-0">{trip.category || "Adventure"}</span>
              </div>
              <div className="font-display text-sm md:text-xl font-medium mt-1 md:mt-2 text-stone-900 truncate">{trip.title || `${trip.destination} Expedition`}</div>
              <div className="flex items-center gap-2 md:gap-4 mt-2 md:mt-4 text-[10px] md:text-xs text-stone-600">
                {trip.duration && <span className="inline-flex items-center gap-0.5 md:gap-1"><Clock className="w-3 h-3 text-stone-500 shrink-0" /> {trip.duration}</span>}
              </div>
            </div>
          </div>
          <div className="p-3 md:p-6 pt-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-3 pt-3 md:mt-5 md:pt-4 border-t border-stone-100 gap-1 sm:gap-2">
              <div className="text-[10px] md:text-sm font-semibold text-stone-500">Contact for Price</div>
              <div className="text-[10px] md:text-xs text-soloz-primary inline-flex items-center gap-0.5 md:gap-1 font-bold group-hover:text-orange-600 transition-colors">Join trip <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" /></div>
            </div>
          </div>
        </div>
      </Card3D>
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
