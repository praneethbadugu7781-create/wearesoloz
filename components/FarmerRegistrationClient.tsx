"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Phone, Instagram, ShieldCheck, Sprout, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Reveal, { SectionLabel } from "@/components/Reveal";
import { getApiUrl } from "@/lib/api";
import TermsModal from "./TermsModal";

export default function FarmerRegistrationClient() {
  const [form, setForm] = useState({
    fullName: "",
    gender: "",
    bloodGroup: "",
    age: "",
    email: "",
    mobile: "",
    state: "",
    district: "",
    farmingType: "",
    cropType: "",
    landSize: "",
    whyJoin: "",
  });
  const [busy, setBusy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const farmingTypes = ["Crop Farming", "Organic Farming", "Dairy Farming", "Horticulture", "Poultry Farming", "Mixed Farming", "Other"];
  const landSizes = ["Less than 2 acres", "2 to 5 acres", "More than 5 acres"];

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
    if (!form.email || !form.email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (!form.mobile || form.mobile.length < 7) {
      toast.error("Please enter a valid mobile number");
      return;
    }
    if (!form.state) {
      toast.error("State is required");
      return;
    }
    if (!form.district) {
      toast.error("District is required");
      return;
    }
    if (!form.farmingType) {
      toast.error("Please select a farming type");
      return;
    }
    if (!form.cropType) {
      toast.error("Please specify your crop types");
      return;
    }
    if (!form.landSize) {
      toast.error("Please select your land size");
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
      const res = await fetch(`${API_URL}/farmers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        throw new Error("Failed to submit");
      }

      toast.success("Application submitted! Akhil will contact you shortly.");

      // Open WhatsApp chat prefilled with form data
      const waText = encodeURIComponent(
        `Hi Akhil, my name is ${form.fullName}. I just applied for the Free Farmer Trip initiative on WeAreSoloz.\nFarming: ${form.farmingType} (${form.cropType})\nLocation: ${form.district}, ${form.state}\nBlood Group: ${form.bloodGroup}\nThank you for this beautiful initiative!`
      );
      const waUrl = `https://wa.me/919966085310?text=${waText}`;
      window.open(waUrl, "_blank");

      // Reset Form
      setForm({
        fullName: "",
        gender: "",
        bloodGroup: "",
        age: "",
        email: "",
        mobile: "",
        state: "",
        district: "",
        farmingType: "",
        cropType: "",
        landSize: "",
        whyJoin: "",
      });
    } catch {
      toast.error("Couldn't submit application. Please try again.");
    }
    setBusy(false);
  };

  return (
    <div data-testid="farmer-registration-page" className="bg-white min-h-screen text-[#1c1917] pt-20">
      <section className="pt-40 pb-24 px-6 md:px-10">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12">
          
          {/* Left Panel: Description */}
          <Reveal>
            <SectionLabel>Community Initiative</SectionLabel>
            <h1 className="font-display text-5xl md:text-7xl font-light tracking-tighter mt-5 text-stone-900">
              Free travel for <span className="gradient-text font-medium">our farmers</span>.
            </h1>
            <p className="text-soloz-textSecondary mt-8 max-w-md leading-relaxed font-body">
              At WeAreSoloz, we believe in honoring the backbone of our nation. Founder Akhil sponsors **one free travel slot per trip** exclusively for passionate farmers to let them rest, connect, and explore beautiful destinations across India at zero cost.
            </p>
            
            <div className="space-y-4 mt-10 max-w-md">
              <div className="flex items-start gap-4 glass rounded-xl p-4 border border-stone-200">
                <div className="w-10 h-10 rounded-full bg-soloz-primary/15 flex items-center justify-center shrink-0">
                  <Sprout className="w-4 h-4 text-soloz-primary" />
                </div>
                <div>
                  <div className="text-xs uppercase font-bold tracking-wider text-stone-900">100% Free Travel</div>
                  <p className="text-xs text-stone-500 mt-1">Includes all sharing accommodations, AC or Non-AC transportation, breakfasts and dinners, entry passes, and coordinates with zero application fees.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 glass rounded-xl p-4 border border-stone-200">
                <div className="w-10 h-10 rounded-full bg-soloz-primary/15 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 text-soloz-primary" />
                </div>
                <div>
                  <div className="text-xs uppercase font-bold tracking-wider text-stone-900">Verification Process</div>
                  <p className="text-xs text-stone-500 mt-1">Approved candidates must verify their farming background (e.g. presenting a government-issued farmer passbook/ID card) before trip boarding confirmation.</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 mt-10">
              <a
                href="tel:+919966085310"
                className="inline-flex items-center gap-4 glass rounded-xl px-5 py-3 hover:bg-stone-50 border border-stone-200/50 transition-colors text-sm font-medium text-stone-700"
              >
                <Phone className="w-4 h-4 text-soloz-primary" /> Contact Akhil: +91 9966085310
              </a>
              <br />
              <a
                href="https://www.instagram.com/wearesolozindia"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-4 glass rounded-xl px-5 py-3 hover:bg-stone-50 border border-stone-200/50 transition-colors text-sm font-medium text-stone-700"
              >
                <Instagram className="w-4 h-4 text-soloz-primary" /> Instagram: @wearesolozindia
              </a>
            </div>
          </Reveal>

          {/* Right Panel: Form */}
          <Reveal className="self-start">
            <form onSubmit={submit} className="glass rounded-3xl p-8 bg-stone-50 border border-stone-200 space-y-4 shadow-sm">
              <div className="text-xs uppercase tracking-widest text-[#ea580c] font-semibold mb-2">Farmer Registration Form</div>
              
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

              <div className="grid grid-cols-3 gap-2 md:gap-4">
                {/* Gender */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                    Gender
                  </label>
                  <select
                    required
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    className="w-full rounded-md border border-stone-250 bg-white/90 px-2 md:px-3 py-2 h-12 text-xs md:text-sm text-stone-900 focus-visible:outline-none focus:border-[#ea580c]"
                  >
                    <option value="">Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Age */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                    Age
                  </label>
                  <Input
                    required
                    type="number"
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                    placeholder="Age"
                    className="glass border-stone-200 bg-white/90 h-12 px-2 md:px-3 text-xs md:text-sm text-stone-900 placeholder:text-stone-400 focus-visible:ring-soloz-primary focus:border-[#ea580c]"
                  />
                </div>

                {/* Blood Group */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                    Blood Group
                  </label>
                  <select
                    required
                    value={form.bloodGroup}
                    onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
                    className="w-full rounded-md border border-stone-250 bg-white/90 px-2 md:px-3 py-2 h-12 text-xs md:text-sm text-stone-900 focus-visible:outline-none focus:border-[#ea580c]"
                  >
                    <option value="">Blood</option>
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
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
                  placeholder="Enter your email address"
                  className="glass border-stone-200 bg-white/90 h-12 text-stone-900 placeholder:text-stone-400 focus-visible:ring-soloz-primary focus:border-[#ea580c]"
                />
              </div>

              {/* Mobile WhatsApp */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                  Mobile (WhatsApp Preferred)
                </label>
                <Input
                  required
                  type="tel"
                  value={form.mobile}
                  onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                  placeholder="Enter 10-digit mobile number"
                  className="glass border-stone-200 bg-white/90 h-12 text-stone-900 placeholder:text-stone-400 focus-visible:ring-soloz-primary focus:border-[#ea580c]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* State */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                    State
                  </label>
                  <Input
                    required
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    placeholder="e.g. Telangana"
                    className="glass border-stone-200 bg-white/90 h-12 text-stone-900 placeholder:text-stone-400 focus-visible:ring-soloz-primary focus:border-[#ea580c]"
                  />
                </div>

                {/* District */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                    District
                  </label>
                  <Input
                    required
                    value={form.district}
                    onChange={(e) => setForm({ ...form, district: e.target.value })}
                    placeholder="e.g. Mahabubnagar"
                    className="glass border-stone-200 bg-white/90 h-12 text-stone-900 placeholder:text-stone-400 focus-visible:ring-soloz-primary focus:border-[#ea580c]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Farming Type */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                    Farming Category
                  </label>
                  <select
                    required
                    value={form.farmingType}
                    onChange={(e) => setForm({ ...form, farmingType: e.target.value })}
                    className="w-full rounded-md border border-stone-250 bg-white/90 px-3 py-2 h-12 text-sm text-stone-900 focus-visible:outline-none focus:border-[#ea580c]"
                  >
                    <option value="">Select Category</option>
                    {farmingTypes.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                {/* Land Size */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                    Land Holding Size
                  </label>
                  <select
                    required
                    value={form.landSize}
                    onChange={(e) => setForm({ ...form, landSize: e.target.value })}
                    className="w-full rounded-md border border-stone-250 bg-white/90 px-3 py-2 h-12 text-sm text-stone-900 focus-visible:outline-none focus:border-[#ea580c]"
                  >
                    <option value="">Select Size</option>
                    {landSizes.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Crop Types */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                  Crops Grown / Products Grown
                </label>
                <Input
                  required
                  value={form.cropType}
                  onChange={(e) => setForm({ ...form, cropType: e.target.value })}
                  placeholder="e.g. Rice, Cotton, Chillies"
                  className="glass border-stone-200 bg-white/90 h-12 text-stone-900 placeholder:text-stone-400 focus-visible:ring-soloz-primary focus:border-[#ea580c]"
                />
              </div>

              {/* Why Join */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                  Why do you want to join WeAreSoloz free travel?
                </label>
                <Textarea
                  required
                  rows={4}
                  value={form.whyJoin}
                  onChange={(e) => setForm({ ...form, whyJoin: e.target.value })}
                  placeholder="Tell us a little bit about yourself, your agricultural work, and why you would love to travel with our community..."
                  className="glass border-stone-200 bg-white/90 text-stone-900 placeholder:text-stone-400 focus-visible:ring-soloz-primary focus:border-[#ea580c]"
                />
              </div>

              {/* Disclaimer */}
              <p className="text-[10.5px] text-stone-400 leading-normal font-medium">
                * By submitting, you confirm you are actively engaged in farming. You agree to submit your farmer verification book/ID before trip departure.
              </p>

              {/* Submit button */}
              <Button
                type="submit"
                disabled={busy}
                className="w-full gradient-orange text-white hover:opacity-95 h-12 rounded-full font-bold uppercase tracking-wider transition-all duration-300 shadow-md flex items-center justify-center gap-2"
              >
                {busy ? "Submitting Application..." : "Submit Application"}
                {!busy && <ArrowRight size={15} />}
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
    </div>
  );
}
