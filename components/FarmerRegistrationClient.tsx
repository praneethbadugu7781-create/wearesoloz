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
import SuccessModal from "./SuccessModal";

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
  const [showSuccess, setShowSuccess] = useState(false);
  const [waUrl, setWaUrl] = useState("");

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

      // Open WhatsApp chat prefilled with form data
      const waText = encodeURIComponent(
        `Hi Akhil, my name is ${form.fullName}. I just applied for the Free Farmer Trip initiative on WeAreSoloz.\nFarming: ${form.farmingType} (${form.cropType})\nLocation: ${form.district}, ${form.state}\nBlood Group: ${form.bloodGroup}\nThank you for this beautiful initiative!`
      );
      const generatedWaUrl = `https://wa.me/919966085310?text=${waText}`;
      setWaUrl(generatedWaUrl);
      window.open(generatedWaUrl, "_blank");

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
      setShowSuccess(true);
    } catch {
      toast.error("Couldn't submit application. Please try again.");
    }
    setBusy(false);
  };

  return (
    <div data-testid="farmer-registration-page" className="relative min-h-screen text-[#1c1917] pt-20 overflow-hidden bg-stone-50">
      {/* Premium Farming Background Image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-75"
        style={{ 
          backgroundImage: `url('/images/farmer_bg.png')`,
        }}
      />
      {/* Soft overlay to blend image and ensure text is perfectly legible */}
      <div className="absolute inset-0 z-0 bg-white/60 backdrop-blur-[1px]" />

      <section className="relative z-10 pt-40 pb-24 px-6 md:px-10">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12">
          
          {/* Left Panel: Description */}
          <Reveal>
            <SectionLabel>🌾 Cultivating Gratitude</SectionLabel>
            <h1 className="font-display text-4xl md:text-5xl font-light tracking-tighter mt-5 text-stone-900 leading-tight">
              Our Farmer <span className="gradient-text font-medium">Initiative</span>
            </h1>
            
            <div className="text-stone-700 mt-6 space-y-6 leading-relaxed font-body text-sm sm:text-base">
              <p>
                At WeAreSoloZ, we believe travel has the power to transform lives. But true adventure isn't just about the horizons we chase—it’s about honoring the hands that sustain us right here at home.
              </p>
              <p>
                Farmers are the quiet heartbeat of our nation. Every single day, with tireless dedication and quiet resilience, they nurture the land to feed millions of families. Yet, the demanding rhythm of the earth rarely grants them the chance to step away, rest, and experience the vast beauty of the world they work so hard to sustain.
              </p>
              
              <div className="my-8 p-6 rounded-2xl bg-amber-500/10 border border-orange-500/15 text-stone-850">
                <h4 className="text-[10px] uppercase font-bold tracking-widest text-amber-700 mb-1.5">Sharing the Joy of the Journey</h4>
                <p className="text-sm font-semibold leading-relaxed">
                  To express our deepest gratitude, WeAreSoloZ is deeply honored to sponsor <span className="text-[#ea580c]">"one fully gifted journey every month for a deserving farmer"</span>.
                </p>
              </div>

              <p>
                This initiative is our humble way of giving back. It is an invitation for these incredible individuals to step out of the fields and into a world of well-deserved rest, inspiration, and beautiful new memories.
              </p>
              <p>
                This is more than a program; it is our heartbeat. It’s our way of looking at the hands that feed us and saying, with profound respect:
              </p>
              
              <p className="text-base sm:text-lg font-bold text-[#ea580c] italic border-l-4 border-[#ea580c] pl-4 py-2 bg-orange-500/5 rounded-r-xl leading-relaxed">
                “Thank you for sustaining our lives. Now, let us show you the world.” 🌾❤️
              </p>
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Application Submitted Successfully!"
        message="Thank you for your interest! Akhil will contact you shortly to verify your details."
        whatsappUrl={waUrl}
      />
    </div>
  );
}
