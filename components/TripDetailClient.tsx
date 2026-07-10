"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Calendar, Clock, Users, MapPin, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Reveal, { SectionLabel } from "@/components/Reveal";
import TermsModal from "./TermsModal";
import SuccessModal from "./SuccessModal";
import { getOptimizedImageUrl } from "@/lib/utils";
import { useLanguage } from "@/lib/LanguageContext";

interface TripDetailClientProps {
  trip: any;
}

function parseItineraryDetails(text: string) {
  if (!text) return [];
  
  let lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  
  if (lines.length <= 1) {
    const timeRegex = /(?=\b(?:0?[1-9]|1[0-2]):[0-5][0-9]\s*(?:AM|PM|am|pm)\b|\b(?:[0-1]?[0-9]|2[0-3]):[0-5][0-9]\b|\b\d{2}\s*(?:AM|PM|am|pm)\b)/i;
    lines = text.split(timeRegex).map(l => l.trim()).filter(Boolean);
  }
  
  return lines.map(line => {
    const timeMatch = line.match(/^(\b(?:0?[1-9]|1[0-2]):[0-5][0-9]\s*(?:AM|PM|am|pm)\b|\b(?:[0-1]?[0-9]|2[0-3]):[0-5][0-9]\b|\b\d{2}\s*(?:AM|PM|am|pm)\b)(?:\s*[-–—:]\s*)?(.*)/i);
    if (timeMatch) {
      return {
        time: timeMatch[1],
        content: timeMatch[2] || ""
      };
    }
    const bulletMatch = line.match(/^[-*•]\s*(.*)/);
    if (bulletMatch) {
      return {
        time: null,
        content: bulletMatch[1]
      };
    }
    return {
      time: null,
      content: line
    };
  });
}

export default function TripDetailClient({ trip }: TripDetailClientProps) {
  const { t, locale } = useLanguage();
  const [form, setForm] = useState({ full_name: "", mobile: "", email: "", travelers: 1, message: "", age: "", bloodGroup: "" });
  const [submitting, setSubmitting] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [waUrl, setWaUrl] = useState("");

  // Auto-scroll image slider states
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const gallery = [trip.image, ...(trip.images || [])].filter(Boolean);

  useEffect(() => {
    if (gallery.length <= 1) return;
    const interval = setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % gallery.length);
    }, 4500); // Cycle every 4.5 seconds
    return () => clearInterval(interval);
  }, [gallery.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd || gallery.length <= 1) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      setActiveImageIndex((prev) => (prev + 1) % gallery.length);
    }
    if (isRightSwipe) {
      setActiveImageIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name || form.full_name.length < 2) {
      toast.error(locale === "te" ? "దయచేసి మీ పూర్తి పేరును నమోదు చేయండి (కనీసం 2 అక్షరాలు)" : locale === "hi" ? "कृपया अपना पूरा नाम दर्ज करें (कम से कम 2 अक्षर)" : "Please enter your full name (minimum 2 characters)");
      return;
    }
    const ageNum = Number(form.age);
    if (!form.age || isNaN(ageNum) || ageNum < 18 || ageNum > 100) {
      toast.error(locale === "te" ? "దయచేసి సరైన వయస్సును నమోదు చేయండి (18 లేదా అంతకంటే ఎక్కువ)" : locale === "hi" ? "कृपया एक मान्य आयु दर्ज करें (18 या उससे अधिक)" : "Please enter a valid age (18 or older)");
      return;
    }
    if (!form.bloodGroup) {
      toast.error(locale === "te" ? "దయచేసి మీ రక్త గ్రూపును ఎంచుకోండి" : locale === "hi" ? "कृपया अपना रक्त समूहं चुनें" : "Please select your blood group");
      return;
    }
    const phoneRegex = /^[+]?[0-9\s\-]{7,15}$/;
    if (!form.mobile || !phoneRegex.test(form.mobile.trim())) {
      toast.error(locale === "te" ? "దయచేసి సరైన మొబైల్ నంబర్ నమోదు చేయండి" : locale === "hi" ? "कृपया एक मान्य मोबाइल नंबर दर्ज करें" : "Please enter a valid 10-digit mobile number (e.g. +91 9966085310)");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email || !emailRegex.test(form.email.trim())) {
      toast.error(locale === "te" ? "దయచేసి సరైన ఈమెయిల్ చిరునామాను నమోదు చేయండి" : locale === "hi" ? "कृपया एक मान्य ईमेल पता दर्ज करें" : "Please enter a valid email address (e.g. name@example.com)");
      return;
    }
    setShowTerms(true);
  };

  const handleActualSubmit = async () => {
    setSubmitting(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${API_URL}/contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.full_name,
          mobile: form.mobile,
          email: form.email,
          age: Number(form.age),
          bloodGroup: form.bloodGroup,
          destination: trip.destination,
          message: `Trip booking request for: "${trip.title || trip.destination}" (${trip.duration}). Travellers: ${form.travelers}. Additional Message: ${form.message}`
        })
      });

      if (!res.ok) {
        throw new Error("API error");
      }

      // Open WhatsApp chat prefilled with booking data
      const waText = encodeURIComponent(`Hi WeAreSoloz, my name is ${form.full_name}.\nAge: ${form.age}\nBlood Group: ${form.bloodGroup}\nMobile: ${form.mobile}\nEmail: ${form.email}\nI want to book a seat for the trip: "${trip.title || trip.destination}" (${trip.duration}). Travellers: ${form.travelers}.\nMessage: ${form.message}`);
      const generatedWaUrl = `https://wa.me/919966085310?text=${waText}`;
      setWaUrl(generatedWaUrl);
      window.open(generatedWaUrl, "_blank");

      setForm({ full_name: "", mobile: "", email: "", travelers: 1, message: "", age: "", bloodGroup: "" });
      setShowSuccess(true);
    } catch (e) {
      toast.error("Couldn't send. Please try again.");
    }
    setSubmitting(false);
  };

  const formattedDate = trip.destination?.toLowerCase().includes("sabarimala")
    ? (locale === "te" ? "ప్రతి నెల" : locale === "hi" ? "हर महीने" : "Every Month")
    : (trip.date
      ? new Date(trip.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : "TBA");

  const seatsVal = trip.seats ?? trip.seats_available ?? "—";

  return (
    <div data-testid="trip-detail-page" className="bg-white min-h-screen text-[#1c1917]">
      <section className="relative h-[60vh] min-h-[480px] overflow-hidden bg-stone-950">
        {gallery.length <= 1 ? (
          <img
            src={getOptimizedImageUrl(trip.image || "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=2400&q=85", 1200)}
            alt={trip.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div 
            className="relative h-full w-full overflow-hidden bg-stone-950"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Sliding Flex Container */}
            <div 
              className="flex h-full w-full transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${activeImageIndex * 100}%)` }}
            >
              {gallery.map((imgSrc, index) => (
                <div
                  key={index}
                  className="relative h-full w-full shrink-0"
                >
                  <img
                    src={getOptimizedImageUrl(imgSrc, 1200)}
                    alt={`${trip.title} Gallery ${index + 1}`}
                    loading={index === 0 ? "eager" : "lazy"}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>

            {/* Slider Dots indicators */}
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 flex gap-2 bg-black/30 backdrop-blur-md px-3.5 py-2 rounded-full border border-white/5">
              {gallery.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImageIndex(index)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    activeImageIndex === index ? "w-5 bg-[#ea580c]" : "w-1.5 bg-white/40 hover:bg-white"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/15 to-transparent pointer-events-none" />
        <div className="absolute bottom-12 left-0 right-0 max-w-7xl mx-auto px-6 md:px-10 pointer-events-none">
          <SectionLabel>{trip.destination}</SectionLabel>
          <h1 className="font-display text-5xl md:text-7xl font-light tracking-tighter mt-3 max-w-3xl text-stone-900">
            {trip.title || `${trip.destination} Expedition`}
          </h1>
        </div>
        {gallery.length > 1 && (
          <div className="absolute right-6 bottom-12 z-10 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider rounded-full px-3.5 py-1.5 border border-white/10 select-none pointer-events-none flex items-center gap-1.5">
            <span>{activeImageIndex + 1} / {gallery.length} {locale === "te" ? "ఫోటోలు" : locale === "hi" ? "तस्वीरें" : "Photos"}</span>
            <span className="text-[#ea580c] font-black">•</span>
            <span>{locale === "te" ? "స్వైప్ ➜" : locale === "hi" ? "स्वाइप करें ➜" : "Swipe ➜"}</span>
          </div>
        )}
      </section>

      <section className="px-6 md:px-10 py-20">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12">
          <div className="md:col-span-2">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
              {[
                trip.destination?.toLowerCase().includes("sabarimala") ? { icon: Calendar, label: locale === "te" ? "ప్రారంభ తేదీ" : locale === "hi" ? "प्रारंभ तिथि" : "Start Date", value: locale === "te" ? "ప్రతి నెల" : locale === "hi" ? "हर महीने" : "Every Month" } : null,
                { icon: Clock, label: locale === "te" ? "వ్యవధి" : locale === "hi" ? "अवधि" : "Duration", value: trip.duration || "—" },
                { icon: MapPin, label: locale === "te" ? "ప్రాంతం" : locale === "hi" ? "क्षेत्र" : "Region", value: trip.destination },
              ].filter(Boolean).map((s: any) => (
                <div key={s.label} className="glass rounded-xl p-4 border border-stone-200">
                  <s.icon className="w-4 h-4 text-soloz-primary mb-2" />
                  <div className="text-[10px] uppercase tracking-widest text-soloz-textMuted">{s.label}</div>
                  <div className="font-display text-lg mt-1 text-stone-900">{s.value}</div>
                </div>
              ))}
            </div>
            <div className="prose prose-stone max-w-none">
              <h3 className="font-display text-2xl mb-4 text-stone-900">{locale === "te" ? "ఈ ప్రయాణం గురించి" : locale === "hi" ? "इस यात्रा के बारे में" : "About this trip"}</h3>
              <p className="text-soloz-textSecondary leading-relaxed whitespace-pre-line font-body">{trip.description}</p>
            </div>
            {trip.highlights && trip.highlights.length > 0 && (
              <div className="mt-10">
                <h3 className="font-display text-2xl mb-4 text-stone-900">{locale === "te" ? "ముఖ్యాంశాలు" : locale === "hi" ? "मुख्य विशेषताएं" : "Highlights"}</h3>
                <ul className="grid md:grid-cols-2 gap-3">
                  {trip.highlights.map((h: string, i: number) => (
                    <li key={i} className="glass rounded-lg px-4 py-3 text-sm text-soloz-textSecondary font-body border border-stone-200">
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {/* If itinerary exists, let's render it */}
            {trip.itinerary && trip.itinerary.length > 0 && (
              <div className="mt-12 space-y-6">
                <h3 className="font-display text-2xl mb-4 text-stone-900">
                  {locale === "te" ? "వివరణాత్మక ప్రయాణ ప్రణాళిక" : locale === "hi" ? "विस्तृत यात्रा कार्यक्रम" : "Detailed Itinerary"}
                </h3>
                <div className="space-y-6">
                  {trip.itinerary.map((item: any, i: number) => {
                    const parsedLines = parseItineraryDetails(item.description);
                    
                    return (
                      <div 
                        key={i} 
                        className="glass rounded-2xl p-6 border border-stone-200 hover:border-soloz-primary/30 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-500 group"
                      >
                        <div className="flex items-center gap-3 border-b border-stone-100 pb-4 mb-5">
                          <span className="inline-flex items-center justify-center rounded-full bg-soloz-primary/10 px-3 py-1 text-xs font-semibold text-soloz-primary uppercase tracking-wider">
                            {item.day || (locale === "te" ? `రోజు ${i + 1}` : locale === "hi" ? `दिन ${i + 1}` : `Day ${i + 1}`)}
                          </span>
                          <h4 className="font-display text-lg font-bold text-stone-900 group-hover:text-soloz-primary transition-colors duration-300">
                            {item.title}
                          </h4>
                        </div>

                        {/* Dotted Vertical Timeline */}
                        <div className="relative border-l-2 border-dashed border-stone-200/60 pl-6 ml-3 space-y-6">
                          {parsedLines.map((line: any, idx: number) => (
                            <div key={idx} className="relative group/item transition-all duration-300">
                              {/* Hollow hover-fill timeline node */}
                              <div className="absolute -left-[32px] top-1.5 size-3.5 rounded-full bg-white border-2 border-stone-300 group-hover/item:border-soloz-primary transition-all duration-300 flex items-center justify-center">
                                <div className="size-1.5 rounded-full bg-stone-300 group-hover/item:bg-soloz-primary transition-colors duration-300" />
                              </div>

                              <div className="flex flex-col sm:flex-row sm:items-start gap-1.5 sm:gap-4">
                                {line.time && (
                                  <span className="inline-block shrink-0 bg-soloz-primary/5 border border-soloz-primary/15 rounded px-2 py-0.5 text-[10px] font-bold text-soloz-primary font-mono tracking-wider w-fit select-none">
                                    {line.time}
                                  </span>
                                )}
                                <p className="text-sm text-stone-600 leading-relaxed font-body">
                                  {line.content}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {/* If inclusions exist, let's render them */}
            {trip.inclusions && trip.inclusions.length > 0 && (
              <div className="mt-12">
                <h3 className="font-display text-2xl mb-4 text-stone-900">{locale === "te" ? "ఏమి చేర్చబడింది" : locale === "hi" ? "क्या शामिल है" : "What's Included"}</h3>
                <ul className="grid sm:grid-cols-2 gap-3">
                  {trip.inclusions.map((inc: string, i: number) => (
                    <li key={i} className="flex gap-2.5 items-start text-sm text-soloz-textSecondary font-body">
                      <span className="w-1.5 h-1.5 rounded-full bg-soloz-primary mt-2 shrink-0" />
                      {inc}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* ⚠️ Travel & Transportation Notice */}
            <div className="mt-12 p-6 rounded-2xl bg-amber-50 border border-amber-200 text-stone-900 font-body">
              <h4 className="font-display text-lg font-semibold text-amber-800 flex items-center gap-2 mb-2">
                {locale === "te" ? "⚠️ ముఖ్యమైన ప్రయాణ విధానం" : locale === "hi" ? "⚠️ महत्वपूर्ण यात्रा नीति" : "⚠️ Important Travel Policy"}
              </h4>
              <p className="text-sm text-stone-700 leading-relaxed">
                {locale === "te" ? (
                  <>దయచేసి గమనించండి <strong>ప్రయాణ ఖర్చులో రైలు టిక్కెట్లు మరియు విమాన టిక్కెట్లు చేర్చబడవు</strong>. ప్రయాణీకులందరూ తమంతట తాముగా ప్రారంభ నగరంలో కేటాయించిన సమావేశ స్థానానికి చేరుకోవాలి. ట్రిప్ ప్రారంభానికి ముందే అఖిల్ ఖచ్చితమైన ప్రారంభ ప్రదేశం మరియు సమావేశ వివరాలను తెలియజేస్తారు.</>
                ) : locale === "hi" ? (
                  <>कृपया ध्यान दें कि <strong>यात्रा लागत में ट्रेन टिकट और उड़ान टिकट शामिल नहीं हैं</strong>। सभी यात्रियों को अपने दम पर शुरुआती शहर में निर्धारित बैठक बिंदु तक पहुंचना होगा। अखिल यात्रा प्रस्थान से पहले सटीक प्रारंभिक स्थान और बैठक के विवरण साझा करेंगे।</>
                ) : (
                  <>Please note that <strong>train tickets and flight tickets are not included</strong> in the trip cost. All travellers must reach the designated meeting point in the starting city by themselves. Akhil will communicate the exact starting location and meeting coordinates prior to the trip departure.</>
                )}
              </p>
            </div>
          </div>
          <div>
            <form onSubmit={submit} data-testid="trip-join-form" className="glass rounded-2xl p-6 bg-stone-50 border border-stone-200 sticky top-28 space-y-4">
              <div>
                <div className="text-xs uppercase tracking-widest text-[#ea580c] font-semibold">{locale === "te" ? "ఈ ట్రిప్ కోసం విచారించండి" : locale === "hi" ? "इस यात्रा के लिए पूछताछ करें" : "Inquire for this Trip"}</div>
                <div className="font-display text-2xl font-light text-stone-900 mt-1">
                  {locale === "te" ? "ధర కోసం సంప్రదించండి" : locale === "hi" ? "कीमत के लिए संपर्क करें" : "Contact for Price"}
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                  {t("full_name")}
                </label>
                <Input
                  required
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  placeholder={locale === "te" ? "మీ పూర్తి పేరు నమోదు చేయండి" : locale === "hi" ? "अपना पूरा नाम दर्ज करें" : "Enter your full name"}
                  data-testid="join-name"
                  className="glass border-stone-200 bg-white/90 text-stone-900 placeholder:text-stone-400 focus-visible:ring-soloz-primary focus:border-[#ea580c]"
                />
              </div>

              {/* Age & Blood Group */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                    {locale === "te" ? "వయస్సు" : locale === "hi" ? "उम्र" : "Age"}
                  </label>
                  <Input
                    required
                    type="number"
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                    placeholder={locale === "te" ? "వయస్సు" : locale === "hi" ? "उम्र" : "Age"}
                    className="glass border-stone-200 bg-white/90 text-stone-900 placeholder:text-stone-400 focus-visible:ring-soloz-primary focus:border-[#ea580c]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                    {locale === "te" ? "రక్త గ్రూపు" : locale === "hi" ? "रक्त समूह" : "Blood Group"}
                  </label>
                  <div className="relative">
                    <select
                      required
                      value={form.bloodGroup}
                      onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
                      className="w-full glass border border-stone-200 bg-white/90 h-10 text-stone-900 text-sm px-3 pr-10 rounded-md focus:outline-none focus:ring-1 focus:ring-[#ea580c]/20 focus:border-[#ea580c] appearance-none cursor-pointer"
                    >
                      <option value="" disabled className="text-stone-400">{locale === "te" ? "రక్తం" : locale === "hi" ? "रक्त" : "Blood"}</option>
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

              {/* Mobile Number */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                  {locale === "te" ? "మొబైల్ నంబర్" : locale === "hi" ? "मोबाइल नंबर" : "Mobile Number"}
                </label>
                <Input
                  required
                  type="tel"
                  value={form.mobile}
                  onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                  placeholder={locale === "te" ? "10 అంకెల మొబైల్ నంబర్" : locale === "hi" ? "10-अंकीय मोबाइल नंबर" : "Enter 10-digit mobile number"}
                  data-testid="join-mobile"
                  className="glass border-stone-200 bg-white/90 text-stone-900 placeholder:text-stone-400 focus-visible:ring-soloz-primary focus:border-[#ea580c]"
                />
              </div>

              {/* Email Address */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                  {t("email_address")}
                </label>
                <Input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="yourname@example.com"
                  data-testid="join-email"
                  className="glass border-stone-200 bg-white/90 text-stone-900 placeholder:text-stone-400 focus-visible:ring-soloz-primary focus:border-[#ea580c]"
                />
              </div>

              {/* Number of Travelers Select Dropdown */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                  {locale === "te" ? "ప్రయాణీకుల సంఖ్య" : locale === "hi" ? "यात्रियों की संख्या" : "Number of Travellers"}
                </label>
                <div className="relative">
                  <select
                    required
                    value={form.travelers}
                    onChange={(e) => setForm({ ...form, travelers: parseInt(e.target.value) || 1 })}
                    data-testid="join-travelers"
                    className="w-full glass border border-stone-200 bg-white/90 h-10 text-stone-900 text-sm px-3 pr-10 rounded-md focus:outline-none focus:ring-1 focus:ring-[#ea580c]/20 focus:border-[#ea580c] appearance-none cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? (locale === "te" ? "ప్రయాణీకుడు" : locale === "hi" ? "यात्री" : "Traveller") : (locale === "te" ? "ప్రయాణీకులు" : locale === "hi" ? "यात्री" : "Travellers")}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Message for Akhil */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                  {locale === "te" ? "అఖిల్‌కు సందేశం (ఐచ్ఛికం)" : locale === "hi" ? "अखिल के लिए संदेश (वैकल्पिक)" : "Message for Akhil (Optional)"}
                </label>
                <Textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder={locale === "te" ? "ఏవైనా ప్రశ్నలు లేదా ప్రయాణ ప్రాధాన్యతలు?" : locale === "hi" ? "कोई प्रश्न या यात्रा प्राथमिकताएं?" : "Any questions or travel preferences?"}
                  data-testid="join-message"
                  className="glass border-stone-200 bg-white/90 text-stone-900 placeholder:text-stone-400 focus-visible:ring-soloz-primary focus:border-[#ea580c] min-h-[80px]"
                />
              </div>

              {/* Styled Travel Policy Notice Card */}
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-900 leading-normal font-body">
                <strong>{locale === "te" ? "⚠️ బుకింగ్ నోటీసు:" : locale === "hi" ? "⚠️ बुकिंग सूचना:" : "⚠️ Booking Notice:"}</strong> {locale === "te" ? "ప్రారంభ నగరానికి రైలు/విమాన టిక్కెట్లు చేర్చబడవు. మీరు నేరుగా అసెంబ్లీ పాయింట్ వద్ద అఖిల్‌ను కలుస్తారు." : locale === "hi" ? "शुरुआती शहर के लिए ट्रेन/उड़ान टिकट शामिल नहीं हैं। आप सीधे असेंबली पॉइंट पर अखिल से मिलेंगे।" : "Train/flight tickets to the starting city are not included. You will meet Akhil directly at the assembly point."}
              </div>

              <Button
                type="submit"
                disabled={submitting}
                data-testid="join-submit"
                className="w-full gradient-orange text-white hover:opacity-95 rounded-full h-12 font-medium"
              >
                {submitting ? t("submitting") : (locale === "te" ? "చేరడానికి అభ్యర్థించండి" : locale === "hi" ? "शामिल होने का अनुरोध करें" : "Request to Join")} <ArrowRight className="w-4 h-4 ml-1 inline-block" />
              </Button>
            </form>
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
        title={locale === "te" ? "అభ్యర్థన విజయవంతంగా సమర్పించబడింది!" : locale === "hi" ? "अनुरोध सफलतापूर्वक प्रस्तुत किया गया!" : "Request Submitted Successfully!"}
        message={locale === "te" ? "ధన్యవాదాలు! మీ బుకింగ్‌ను ధృవీకరించడానికి అఖిల్ త్వరలోనే వాట్సాప్ లేదా ఈమెయిల్ ద్వారా మిమ్మల్ని సంప్రదిస్తారు." : locale === "hi" ? "धन्यवाद! आपकी बुकिंग की पुष्टि करने के लिए अखिल जल्द ही व्हाट्सएप या ईमेल के माध्यम से आपसे संपर्क करेंगे।" : "Thank you! Akhil will contact you shortly via WhatsApp or email to confirm your booking."}
        whatsappUrl={waUrl}
      />
    </div>
  );
}
