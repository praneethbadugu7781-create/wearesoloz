"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Phone, Instagram, MessageCircle, MapPin, ArrowRight, Youtube } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Reveal, { SectionLabel } from "@/components/Reveal";
import TermsModal from "./TermsModal";
import SuccessModal from "./SuccessModal";

interface ContactClientProps {
  settings: any;
  trips?: any[];
}

export default function ContactClient({ settings = {}, trips = [] }: ContactClientProps) {
  const [form, setForm] = useState({ full_name: "", mobile: "", email: "", destination: "", message: "", age: "", bloodGroup: "" });
  const [selectedState, setSelectedState] = useState("");
  const [busy, setBusy] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [waUrl, setWaUrl] = useState("");

  const phone = settings.phone || "+91 99660 85310";
  const formattedPhone = phone.replace(/[^0-9+]/g, "");
  const phone2 = settings.phone2 || "+91 92810 17746";
  const formattedPhone2 = phone2.replace(/[^0-9+]/g, "");
  const instagramLink = settings.instagram || "https://www.instagram.com/wearesolozindia?igsh=MWZjNjN0MXhidWJ2Yw==";
  const whatsappLink = settings.whatsapp || "https://chat.whatsapp.com/E7aoVfUi66S4VDEBsdXoMW";

  // Extract unique states from active trips, falling back to default states
  const statesList = Array.from(new Set(trips.map(t => t.state || "Andhra Pradesh").filter(Boolean)));
  if (statesList.length === 0) {
    statesList.push("Andhra Pradesh", "Telangana", "Karnataka", "Kerala", "Tamil Nadu", "Sri Lanka");
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
      "Tamil Nadu": ["Ooty", "Kodaikanal", "Yercaud", "Rameshwaram", "Mahabalipuram", "Kanyakumari"],
      "Sri Lanka": ["Sri Lanka Expedition"]
    };
    destinationsForState.push(...(fallbackMap[selectedState] || []));
  }

  const [showTerms, setShowTerms] = useState(false);

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
    <div data-testid="contact-page" className="bg-white min-h-screen text-[#1c1917] pt-20">
      <section className="pt-40 pb-24 px-6 md:px-10">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12">
          <Reveal>
            <SectionLabel>Get in Touch</SectionLabel>
            <h1 className="font-display text-5xl md:text-7xl font-light tracking-tighter mt-5 text-stone-900">
              Let&apos;s turn <span className="gradient-text font-medium">dreams into destinations</span>.
            </h1>
            <p className="text-soloz-textSecondary mt-8 max-w-md leading-relaxed font-body">
              Have a trip in mind, a question, or just want to say hi? Drop a message — we read every word.
            </p>
            <div className="space-y-3 mt-10">
              <a
                data-testid="contact-phone"
                href={`tel:${formattedPhone}`}
                className="flex items-center gap-4 glass rounded-xl p-4 hover:bg-stone-50 border border-stone-200/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-soloz-primary/15 flex items-center justify-center">
                  <Phone className="w-4 h-4 text-soloz-primary" />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-soloz-textMuted">Phone (Primary)</div>
                  <div className="text-stone-900 font-semibold">{phone}</div>
                </div>
              </a>
              <a
                data-testid="contact-phone2"
                href={`tel:${formattedPhone2}`}
                className="flex items-center gap-4 glass rounded-xl p-4 hover:bg-stone-50 border border-stone-200/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-soloz-primary/15 flex items-center justify-center">
                  <Phone className="w-4 h-4 text-soloz-primary" />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-soloz-textMuted">Phone (Secondary)</div>
                  <div className="text-stone-900 font-semibold">{phone2}</div>
                </div>
              </a>
              <a
                data-testid="contact-instagram"
                href={instagramLink}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-4 glass rounded-xl p-4 hover:bg-stone-50 border border-stone-200/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-soloz-primary/15 flex items-center justify-center">
                  <Instagram className="w-4 h-4 text-soloz-primary" />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-soloz-textMuted">Instagram</div>
                  <div className="text-stone-900 font-semibold">
                    {instagramLink.includes("akhillrockstar") ? "@akhillrockstar" : "@wearesolozindia"}
                  </div>
                </div>
              </a>
              <a
                data-testid="contact-youtube"
                href="https://youtube.com/@akhillrockstartravelstories?si=_c7w-zLBaUwBgMSi"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-4 glass rounded-xl p-4 hover:bg-stone-50 border border-stone-200/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-soloz-primary/15 flex items-center justify-center">
                  <Youtube className="w-4 h-4 text-soloz-primary" />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-soloz-textMuted">YouTube</div>
                  <div className="text-stone-900 font-semibold">@akhillrockstartravelstories</div>
                </div>
              </a>
              <a
                data-testid="contact-whatsapp"
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-4 glass rounded-xl p-4 hover:bg-stone-50 border border-stone-200/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-soloz-primary/15 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-soloz-primary" />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-soloz-textMuted">WhatsApp</div>
                  <div className="text-stone-900 font-semibold">Chat now</div>
                </div>
              </a>
              <div className="flex items-center gap-4 glass rounded-xl p-4 border border-stone-200">
                <div className="w-10 h-10 rounded-full bg-soloz-primary/15 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-soloz-primary" />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-soloz-textMuted">Based in</div>
                  <div className="text-stone-900 font-semibold">India · On the road</div>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal className="self-start">
            <form onSubmit={submit} data-testid="contact-form" className="glass rounded-3xl p-8 bg-stone-50 border border-stone-200 space-y-4">
              <div className="text-xs uppercase tracking-widest text-[#ea580c] font-semibold mb-2">Send a message</div>
              
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
                  data-testid="contact-name"
                  className="glass border-stone-200 bg-white/90 h-12 text-stone-900 placeholder:text-stone-400 focus-visible:ring-soloz-primary focus:border-[#ea580c]"
                />
              </div>

              {/* Age & Blood Group */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
                    className="glass border-stone-200 bg-white/90 h-12 text-stone-900 placeholder:text-stone-400 focus-visible:ring-soloz-primary focus:border-[#ea580c]"
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
                      className="w-full glass border border-stone-200 bg-white/90 h-12 text-stone-900 focus-visible:ring-soloz-primary text-sm px-3 pr-10 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ea580c]/20 focus:border-[#ea580c] appearance-none cursor-pointer"
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
                  Mobile Number
                </label>
                <Input
                  required
                  value={form.mobile}
                  onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                  placeholder="e.g. +91 9966085310"
                  data-testid="contact-mobile"
                  className="glass border-stone-200 bg-white/90 h-12 text-stone-900 placeholder:text-stone-400 focus-visible:ring-soloz-primary focus:border-[#ea580c]"
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
                  data-testid="contact-email"
                  className="glass border-stone-200 bg-white/90 h-12 text-stone-900 placeholder:text-stone-400 focus-visible:ring-soloz-primary focus:border-[#ea580c]"
                />
              </div>

              {/* State Dropdown (Required) */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                  State Interested In
                </label>
                <div className="relative">
                  <select
                    required
                    value={selectedState}
                    onChange={(e) => {
                      setSelectedState(e.target.value);
                      setForm({ ...form, destination: "" });
                    }}
                    data-testid="contact-state"
                    className="w-full glass border border-stone-200 bg-white/90 h-12 text-stone-900 focus-visible:ring-soloz-primary text-sm px-3 pr-10 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ea580c]/20 focus:border-[#ea580c] appearance-none cursor-pointer"
                  >
                    <option value="" disabled className="text-stone-400">Select State</option>
                    {statesList.map((st) => (
                      <option key={st} value={st} className="text-stone-950">
                        {st}
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

              {/* Destination Dropdown (Required, dependent on State) */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                  Destination Interested In
                </label>
                <div className="relative">
                  <select
                    required
                    disabled={!selectedState}
                    value={form.destination}
                    onChange={(e) => setForm({ ...form, destination: e.target.value })}
                    data-testid="contact-destination"
                    className="w-full glass border border-stone-200 bg-white/90 h-12 text-stone-900 focus-visible:ring-soloz-primary text-sm px-3 pr-10 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ea580c]/20 focus:border-[#ea580c] appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="" disabled className="text-stone-400">
                      {selectedState ? "Select Destination" : "Choose a state first"}
                    </option>
                    {destinationsForState.map((dest) => (
                      <option key={dest} value={dest} className="text-stone-950">
                        {dest}
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

              {/* Message */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                  Your Message
                </label>
                <Textarea
                  required
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Tell us what you are looking for..."
                  data-testid="contact-message"
                  rows={4}
                  className="glass border-stone-200 bg-white/90 text-stone-900 placeholder:text-stone-400 focus-visible:ring-soloz-primary focus:border-[#ea580c]"
                />
              </div>

              {/* Styled Travel Policy Notice Card */}
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-900 leading-normal font-body">
                <strong>⚠️ Booking Notice:</strong> Train/flight tickets to the starting city are not included. You will meet Akhil directly at the assembly point.
              </div>

              <Button
                type="submit"
                disabled={busy}
                data-testid="contact-submit"
                className="w-full gradient-orange text-white h-12 rounded-full font-medium"
              >
                {busy ? "Sending…" : "Send Message"} <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </form>
          </Reveal>
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
    </div>
  );
}
