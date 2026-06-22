"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Phone, Instagram, MessageCircle, MapPin, ArrowRight, Briefcase, Calendar, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Reveal, { SectionLabel } from "@/components/Reveal";
import { getApiUrl } from "@/lib/api";
import TermsModal from "./TermsModal";
import SuccessModal from "./SuccessModal";

interface CareersClientProps {
  settings: any;
}

export default function CareersClient({ settings = {} }: CareersClientProps) {
  const whatsappLink = settings.whatsapp_link || "https://wa.me/919966085310";
  const instagramLink = settings.instagram_link || "https://www.instagram.com/wearesolozindia";
  const phone = settings.phone || "+91 9966085310";
  const formattedPhone = phone.replace(/\s/g, "");

  const [form, setForm] = useState({
    fullName: "",
    gender: "",
    age: "",
    bloodGroup: "",
    email: "",
    mobile: "",
    instagram: "",
    experience: "",
    whyJoin: "",
  });
  const [busy, setBusy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [waUrl, setWaUrl] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || form.fullName.length < 2) {
      toast.error("Full name must be at least 2 characters");
      return;
    }
    if (!form.gender) {
      toast.error("Please select your gender");
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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email || !emailRegex.test(form.email.trim())) {
      toast.error("Please enter a valid email address (e.g. name@example.com)");
      return;
    }
    const phoneRegex = /^[+]?[0-9\s\-]{7,15}$/;
    if (!form.mobile || !phoneRegex.test(form.mobile.trim())) {
      toast.error("Please enter a valid 10-digit mobile number (e.g. +91 9966085310)");
      return;
    }
    if (!form.experience || form.experience.length < 10) {
      toast.error("Travel experience description must be at least 10 characters");
      return;
    }
    if (!form.whyJoin || form.whyJoin.length < 10) {
      toast.error("Explanation must be at least 10 characters");
      return;
    }

    setShowTerms(true);
  };

  const handleActualSubmit = async () => {
    setBusy(true);
    try {
      const API_URL = getApiUrl();
      const res = await fetch(`${API_URL}/careers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        throw new Error("Failed to submit");
      }

      // Open WhatsApp chat prefilled with form data
      const waText = encodeURIComponent(
        `Hi Akhil, my name is ${form.fullName}. I just submitted my travel careers application on WeAreSoloz.\nAge: ${form.age}\nBlood Group: ${form.bloodGroup}\nGender: ${form.gender}\nInstagram: ${form.instagram || "N/A"}\nLooking forward to co-hosting and traveling together!`
      );
      const generatedWaUrl = `https://wa.me/919966085310?text=${waText}`;
      setWaUrl(generatedWaUrl);
      window.open(generatedWaUrl, "_blank");

      // Reset Form
      setForm({
        fullName: "",
        gender: "",
        age: "",
        bloodGroup: "",
        email: "",
        mobile: "",
        instagram: "",
        experience: "",
        whyJoin: "",
      });
      setShowSuccess(true);
    } catch {
      toast.error("Couldn't submit application. Please try again.");
    }
    setBusy(false);
  };

  return (
    <div data-testid="careers-page" className="bg-white min-h-screen text-[#1c1917] pt-20">
      <section className="pt-40 pb-24 px-6 md:px-10">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12">
          
          {/* Left Panel: Description */}
          <Reveal>
            <SectionLabel>We Are Hiring</SectionLabel>
            <h1 className="font-display text-5xl md:text-7xl font-light tracking-tighter mt-5 text-stone-900">
              Travel & co-host <span className="gradient-text font-medium">with Akhil</span>.
            </h1>
            <p className="text-soloz-textSecondary mt-8 max-w-md leading-relaxed font-body">
              Are you passionate about travel, group experiences, and exploring the unknown? Akhil is seeking like-minded travel enthusiasts to join him and co-host WeAreSoloZ group tours across India.
            </p>
            
            <div className="space-y-4 mt-10 max-w-md">
              <div className="flex items-start gap-4 glass rounded-xl p-4 border border-stone-200">
                <div className="w-10 h-10 rounded-full bg-soloz-primary/15 flex items-center justify-center shrink-0">
                  <Briefcase className="w-4 h-4 text-soloz-primary" />
                </div>
                <div>
                  <div className="text-xs uppercase font-bold tracking-wider text-stone-900">Co-Host Role</div>
                  <p className="text-xs text-stone-500 mt-1">Manage logistics, create travel content, capture memories, and host solo travel buddies on the road.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 glass rounded-xl p-4 border border-stone-200">
                <div className="w-10 h-10 rounded-full bg-soloz-primary/15 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-soloz-primary" />
                </div>
                <div>
                  <div className="text-xs uppercase font-bold tracking-wider text-stone-900">Who Can Apply?</div>
                  <p className="text-xs text-stone-500 mt-1">Men and women (18+) who love outdoor adventures, social meetups, road trips, and building close-knit travel families.</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 mt-10">
              <a
                href={`tel:${formattedPhone}`}
                className="inline-flex items-center gap-4 glass rounded-xl px-5 py-3 hover:bg-stone-50 border border-stone-200/50 transition-colors text-sm font-medium text-stone-700"
              >
                <Phone className="w-4 h-4 text-soloz-primary" /> Call Admin: {phone}
              </a>
              <br />
              <a
                href={instagramLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-4 glass rounded-xl px-5 py-3 hover:bg-stone-50 border border-stone-200/50 transition-colors text-sm font-medium text-stone-700"
              >
                <Instagram className="w-4 h-4 text-soloz-primary" /> @wearesolozindia
              </a>
            </div>
          </Reveal>

          {/* Right Panel: Form */}
          <Reveal className="self-start">
            <form onSubmit={submit} data-testid="careers-form" className="glass rounded-3xl p-8 bg-stone-50 border border-stone-200 space-y-4 shadow-sm">
              <div className="text-xs uppercase tracking-widest text-[#ea580c] font-semibold mb-2">Careers Application Form</div>
              
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                  Full Name
                </label>
                <Input
                  required
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="Enter your full name"
                  className="glass border-stone-200 bg-white/90 h-12 text-stone-900 placeholder:text-stone-400 focus-visible:ring-soloz-primary focus:border-[#ea580c]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Gender */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                    Gender
                  </label>
                  <div className="relative">
                    <select
                      required
                      value={form.gender}
                      onChange={(e) => setForm({ ...form, gender: e.target.value })}
                      className="w-full glass border border-stone-200 bg-white/90 h-12 text-stone-900 focus-visible:ring-soloz-primary text-sm px-3 pr-10 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ea580c]/20 focus:border-[#ea580c] appearance-none cursor-pointer"
                    >
                      <option value="" disabled className="text-stone-400">Select Gender</option>
                      <option value="Male" className="text-stone-950">Male</option>
                      <option value="Female" className="text-stone-950">Female</option>
                      <option value="Other" className="text-stone-950">Other</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Age */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                    Age
                  </label>
                  <Input
                    required
                    type="number"
                    min="18"
                    max="100"
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                    placeholder="Min 18"
                    className="glass border-stone-200 bg-white/90 h-12 text-stone-900 placeholder:text-stone-400 focus-visible:ring-soloz-primary focus:border-[#ea580c]"
                  />
                </div>

                {/* Blood Group */}
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
                  Mobile Number (WhatsApp)
                </label>
                <Input
                  required
                  type="tel"
                  value={form.mobile}
                  onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                  placeholder="e.g. +91 9966085310"
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
                  placeholder="name@example.com"
                  className="glass border-stone-200 bg-white/90 h-12 text-stone-900 placeholder:text-stone-400 focus-visible:ring-soloz-primary focus:border-[#ea580c]"
                />
              </div>

              {/* Instagram Handle */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                  Instagram Handle (Optional)
                </label>
                <Input
                  value={form.instagram}
                  onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                  placeholder="e.g. @yourprofile"
                  className="glass border-stone-200 bg-white/90 h-12 text-stone-900 placeholder:text-stone-400 focus-visible:ring-soloz-primary focus:border-[#ea580c]"
                />
              </div>

              {/* Travel Experience */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                  Describe Your Travel Experience
                </label>
                <Textarea
                  required
                  value={form.experience}
                  onChange={(e) => setForm({ ...form, experience: e.target.value })}
                  placeholder="Tell us about the destinations you've explored, your travel style, or outdoor hobbies..."
                  rows={3}
                  className="glass border-stone-200 bg-white/90 text-stone-900 placeholder:text-stone-400 focus-visible:ring-soloz-primary focus:border-[#ea580c]"
                />
              </div>

              {/* Why Join */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                  Why do you want to travel and co-host with Akhil?
                </label>
                <Textarea
                  required
                  value={form.whyJoin}
                  onChange={(e) => setForm({ ...form, whyJoin: e.target.value })}
                  placeholder="Tell us why you want to travel, what value you bring to group hosting, and why we should select you..."
                  rows={3}
                  className="glass border-stone-200 bg-white/90 text-stone-900 placeholder:text-stone-400 focus-visible:ring-soloz-primary focus:border-[#ea580c]"
                />
              </div>

              {/* Disclaimer Card */}
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-900 leading-normal font-body">
                <strong>⚠️ Careers Policy:</strong> All applicants must be 18 years or older. Selected co-hosts will travel with Akhil on scheduled WeAreSoloz group itineraries.
              </div>

              <Button
                type="submit"
                disabled={busy}
                className="w-full gradient-orange text-white h-12 rounded-full font-medium"
              >
                {busy ? "Submitting Application…" : "Submit Application"} <ArrowRight className="w-4 h-4 ml-1" />
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
        title="Application Submitted Successfully!"
        message="Thank you for your application! Akhil will review your profile shortly and connect with you."
        whatsappUrl={waUrl}
      />
    </div>
  );
}
