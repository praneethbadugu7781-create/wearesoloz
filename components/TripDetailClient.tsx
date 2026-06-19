"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Calendar, Clock, Users, MapPin, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Reveal, { SectionLabel } from "@/components/Reveal";
import TermsModal from "./TermsModal";
import SuccessModal from "./SuccessModal";

interface TripDetailClientProps {
  trip: any;
}

export default function TripDetailClient({ trip }: TripDetailClientProps) {
  const [form, setForm] = useState({ full_name: "", mobile: "", email: "", travelers: 1, message: "", age: "", bloodGroup: "" });
  const [submitting, setSubmitting] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [waUrl, setWaUrl] = useState("");

  const submit = async (e: React.FormEvent) => {
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
    if (!form.mobile || form.mobile.length < 7) {
      toast.error("Please enter a valid mobile number");
      return;
    }
    if (!form.email || !form.email.includes("@")) {
      toast.error("Please enter a valid email address");
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

  const formattedDate = trip.date
    ? new Date(trip.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "TBA";

  const seatsVal = trip.seats ?? trip.seats_available ?? "—";

  const gallery = [trip.image, ...(trip.images || [])].filter(Boolean);

  return (
    <div data-testid="trip-detail-page" className="bg-white min-h-screen text-[#1c1917]">
      <section className="relative h-[60vh] min-h-[480px] overflow-hidden bg-stone-950">
        {gallery.length <= 1 ? (
          <img
            src={trip.image || "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=2400&q=85"}
            alt={trip.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div 
            className="flex h-full w-full overflow-x-auto snap-x snap-mandatory bg-stone-950"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {gallery.map((imgSrc, index) => (
              <div
                key={index}
                className="relative h-full shrink-0 snap-center w-[85vw] md:w-[70vw] lg:w-[60vw]"
              >
                <img
                  src={imgSrc}
                  alt={`${trip.title} Gallery ${index + 1}`}
                  className="w-full h-full object-cover border-r border-stone-900"
                />
              </div>
            ))}
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
            <span>{gallery.length} Photos</span>
            <span className="text-[#ea580c] font-black">•</span>
            <span>Swipe ➜</span>
          </div>
        )}
      </section>

      <section className="px-6 md:px-10 py-20">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12">
          <div className="md:col-span-2">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
              {[
                { icon: Calendar, label: "Start Date", value: formattedDate },
                { icon: Clock, label: "Duration", value: trip.duration || "—" },
                { icon: MapPin, label: "Region", value: trip.destination },
              ].map((s) => (
                <div key={s.label} className="glass rounded-xl p-4 border border-stone-200">
                  <s.icon className="w-4 h-4 text-soloz-primary mb-2" />
                  <div className="text-[10px] uppercase tracking-widest text-soloz-textMuted">{s.label}</div>
                  <div className="font-display text-lg mt-1 text-stone-900">{s.value}</div>
                </div>
              ))}
            </div>
            <div className="prose prose-stone max-w-none">
              <h3 className="font-display text-2xl mb-4 text-stone-900">About this trip</h3>
              <p className="text-soloz-textSecondary leading-relaxed whitespace-pre-line font-body">{trip.description}</p>
            </div>
            {trip.highlights && trip.highlights.length > 0 && (
              <div className="mt-10">
                <h3 className="font-display text-2xl mb-4 text-stone-900">Highlights</h3>
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
                <h3 className="font-display text-2xl mb-4 text-stone-900">Detailed Itinerary</h3>
                <div className="space-y-4">
                  {trip.itinerary.map((item: any, i: number) => (
                    <div key={i} className="glass rounded-2xl p-6 border border-stone-200">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-soloz-primary uppercase tracking-wider">
                          {item.day || `Day ${i + 1}`}
                        </span>
                        <h4 className="font-display text-lg font-medium text-stone-900">{item.title}</h4>
                      </div>
                      <p className="text-sm text-soloz-textSecondary mt-2 leading-relaxed font-body">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* If inclusions exist, let's render them */}
            {trip.inclusions && trip.inclusions.length > 0 && (
              <div className="mt-12">
                <h3 className="font-display text-2xl mb-4 text-stone-900">What's Included</h3>
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
                ⚠️ Important Travel Policy
              </h4>
              <p className="text-sm text-stone-700 leading-relaxed">
                Please note that <strong>train tickets and flight tickets are not included</strong> in the trip cost. 
                All travellers must reach the designated meeting point in the starting city by themselves. 
                Akhil will communicate the exact starting location and meeting coordinates prior to the trip departure.
              </p>
            </div>
          </div>
          <div>
            <form onSubmit={submit} data-testid="trip-join-form" className="glass rounded-2xl p-6 bg-stone-50 border border-stone-200 sticky top-28 space-y-4">
              <div>
                <div className="text-xs uppercase tracking-widest text-[#ea580c] font-semibold">Inquire for this Trip</div>
                <div className="font-display text-2xl font-light text-stone-900 mt-1">
                  Contact for Price
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                  Full Name
                </label>
                <Input
                  required
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  placeholder="Enter your full name"
                  data-testid="join-name"
                  className="glass border-stone-200 bg-white/90 text-stone-900 placeholder:text-stone-400 focus-visible:ring-soloz-primary focus:border-[#ea580c]"
                />
              </div>

              {/* Age & Blood Group */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                    Age
                  </label>
                  <Input
                    required
                    type="number"
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                    placeholder="Your Age"
                    className="glass border-stone-200 bg-white/90 text-stone-900 placeholder:text-stone-400 focus-visible:ring-soloz-primary focus:border-[#ea580c]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                    Blood Group
                  </label>
                  <div className="relative">
                    <select
                      required
                      value={form.bloodGroup}
                      onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
                      className="w-full glass border border-stone-200 bg-white/90 h-10 text-stone-900 text-sm px-3 pr-10 rounded-md focus:outline-none focus:ring-1 focus:ring-[#ea580c]/20 focus:border-[#ea580c] appearance-none cursor-pointer"
                    >
                      <option value="" disabled className="text-stone-400">Select Blood</option>
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
                  Mobile Number (WhatsApp)
                </label>
                <Input
                  required
                  value={form.mobile}
                  onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                  placeholder="e.g. +91 9966085310"
                  data-testid="join-mobile"
                  className="glass border-stone-200 bg-white/90 text-stone-900 placeholder:text-stone-400 focus-visible:ring-soloz-primary focus:border-[#ea580c]"
                />
              </div>

              {/* Email Address */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                  Email Address
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
                  Number of Travellers
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
                      <option key={num} value={num}>{num} {num === 1 ? 'Traveller' : 'Travellers'}</option>
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
                  Message for Akhil (Optional)
                </label>
                <Textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Any questions or travel preferences?"
                  data-testid="join-message"
                  className="glass border-stone-200 bg-white/90 text-stone-900 placeholder:text-stone-400 focus-visible:ring-soloz-primary focus:border-[#ea580c] min-h-[80px]"
                />
              </div>

              {/* Styled Travel Policy Notice Card */}
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-900 leading-normal font-body">
                <strong>⚠️ Booking Notice:</strong> Train/flight tickets to the starting city are not included. You will meet Akhil directly at the assembly point.
              </div>

              <Button
                type="submit"
                disabled={submitting}
                data-testid="join-submit"
                className="w-full gradient-orange text-white hover:opacity-95 rounded-full h-12 font-medium"
              >
                {submitting ? "Sending…" : "Request to Join"} <ArrowRight className="w-4 h-4 ml-1" />
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
        title="Request Submitted Successfully!"
        message="Thank you! Akhil will contact you shortly via WhatsApp or email to confirm your booking."
        whatsappUrl={waUrl}
      />
    </div>
  );
}
