"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  Trophy, 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  Award, 
  Zap, 
  Users, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  X,
  ChevronRight,
  ShieldAlert,
  Ticket,
  Flame,
  ArrowUpRight
} from "lucide-react";

export default function BadmintonChampionshipPage() {
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    teamName: "",
    player1Name: "",
    player1Phone: "",
    player1Email: "",
    player2Name: "",
    player2Phone: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.teamName.trim()) return setError("Team name is required");
    if (!formData.player1Name.trim()) return setError("Player 1 (Captain) name is required");
    if (!formData.player1Phone.trim() || formData.player1Phone.trim().replace(/[^0-9]/g, "").length < 10) {
      return setError("Valid 10-digit mobile number for Player 1 is required");
    }
    if (!formData.player1Email.trim() || !formData.player1Email.includes("@")) {
      return setError("Valid email address for Player 1 is required");
    }
    if (!formData.player2Name.trim()) return setError("Player 2 (Partner) name is required");
    if (!formData.player2Phone.trim() || formData.player2Phone.trim().replace(/[^0-9]/g, "").length < 10) {
      return setError("Valid 10-digit mobile number for Player 2 is required");
    }

    setLoading(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://wearesoloz.com/api";
      const res = await fetch(`${API_URL}/payment/create-event-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: "badminton-season-1",
          eventName: "WeAreSoloZ Badminton Championship Season 1",
          teamName: formData.teamName.trim(),
          player1Name: formData.player1Name.trim(),
          player1Phone: formData.player1Phone.trim(),
          player1Email: formData.player1Email.trim(),
          player2Name: formData.player2Name.trim(),
          player2Phone: formData.player2Phone.trim(),
          amount: 500
        })
      });

      const contentType = res.headers.get("content-type");
      let data: any = {};

      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const textErr = await res.text();
        console.error("Non-JSON API Response:", textErr);
        throw new Error("Server payment endpoint returned an unexpected response. Please try again.");
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || data.message || "Failed to initialize payment order");
      }

      // Submit form directly to PayU gateway
      const form = document.createElement("form");
      form.method = "POST";
      form.action = data.actionUrl || "https://secure.payu.in/_payment";

      const params: Record<string, string> = {
        key: data.key,
        txnid: data.txnid,
        amount: data.amount,
        productinfo: data.productinfo,
        firstname: data.firstname,
        email: data.email,
        phone: data.phone,
        surl: data.surl,
        furl: data.furl,
        hash: data.hash,
        udf1: data.udf1 || "",
        udf2: data.udf2 || "",
        udf3: data.udf3 || "",
        udf4: data.udf4 || "",
        udf5: data.udf5 || ""
      };

      Object.entries(params).forEach(([k, v]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = k;
        input.value = v;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (err: any) {
      console.error("PayU registration error:", err);
      setError(err.message || "Something went wrong initializing PayU payment. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] text-stone-900 flex flex-col font-sans selection:bg-orange-500 selection:text-white antialiased">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-white border-b border-stone-200/80">
        {/* Soft Ambient Light Glows */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-gradient-to-br from-orange-500/5 to-amber-500/5 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[350px] bg-gradient-to-tr from-[#12352d]/5 to-transparent rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-200/80 text-[#ea580c] text-xs font-extrabold uppercase tracking-widest mb-6 shadow-xs">
            <Flame className="w-3.5 h-3.5 text-[#ea580c]" />
            <span>WeAreSoloZ Official Event • Season 1</span>
          </div>

          {/* Main Title Heading */}
          <h1 className="font-sans text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-stone-900 uppercase mb-4 leading-tight">
            Badminton <span className="text-[#ea580c]">Championship</span>
          </h1>

          {/* Men's Doubles Tag */}
          <div className="inline-block bg-stone-900 text-white px-5 py-2 rounded-2xl mb-6 shadow-md">
            <span className="font-extrabold text-xs sm:text-sm tracking-widest uppercase flex items-center gap-2 text-amber-400">
              <span>🏸</span>
              <span>Men's Doubles Tournament</span>
            </span>
          </div>

          <p className="text-stone-600 text-base sm:text-xl max-w-2xl mx-auto mb-8 font-medium leading-relaxed">
            Travel Solo. You're Not Alone. <br />
            <span className="text-[#ea580c] font-bold">PLAY FAIR ★ PLAY HARD ★ ENJOY THE GAME!</span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <button
              onClick={() => setShowRegisterModal(true)}
              className="w-full sm:w-auto px-9 py-4 gradient-orange text-white font-extrabold text-base rounded-2xl shadow-lg shadow-orange-500/20 hover:opacity-95 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-3 uppercase tracking-wider"
            >
              <Ticket className="w-5 h-5" />
              <span>Register Team (₹500)</span>
              <ChevronRight className="w-5 h-5" />
            </button>
            <a
              href="#rules"
              className="w-full sm:w-auto px-8 py-4 bg-white text-stone-800 font-bold text-base rounded-2xl border border-stone-200/90 hover:bg-stone-50 transition-all flex items-center justify-center gap-2 shadow-xs"
            >
              <Award className="w-5 h-5 text-[#ea580c]" />
              <span>Match Rules & Format</span>
            </a>
          </div>

          {/* Quick Info Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-stone-50 p-5 sm:p-7 rounded-[2.5rem] border border-stone-200/80 shadow-sm max-w-4xl mx-auto text-left">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-2xl bg-white border border-stone-200 text-[#ea580c] shadow-xs shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="text-stone-400 text-[11px] font-extrabold uppercase tracking-wider">Date</div>
                <div className="text-stone-900 font-bold text-xs sm:text-sm mt-0.5">Sunday, Sep 20</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-2xl bg-white border border-stone-200 text-amber-600 shadow-xs shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-stone-400 text-[11px] font-extrabold uppercase tracking-wider">Time</div>
                <div className="text-stone-900 font-bold text-xs sm:text-sm mt-0.5">9:15 AM Onwards</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-2xl bg-white border border-stone-200 text-[#ea580c] shadow-xs shrink-0">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <div className="text-stone-400 text-[11px] font-extrabold uppercase tracking-wider">Prize Pool</div>
                <div className="text-[#ea580c] font-extrabold text-xs sm:text-sm mt-0.5">₹10,000 Total</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-2xl bg-white border border-stone-200 text-emerald-700 shadow-xs shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="text-stone-400 text-[11px] font-extrabold uppercase tracking-wider">Venue</div>
                <div className="text-stone-900 font-bold text-xs sm:text-sm truncate mt-0.5" title="Indian Badminton Academy, Manikonda">IBA, Manikonda</div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Prize Pool Section */}
      <section className="py-20 bg-[#faf9f6]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <span className="text-xs font-extrabold text-[#ea580c] tracking-widest uppercase block mb-2">Rewards & Cash Prizes</span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-stone-900 uppercase tracking-tight">★ Prize Pool <span className="text-[#ea580c]">₹10,000</span> ★</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* 1st Prize */}
            <div className="relative bg-white border-2 border-amber-400 p-8 rounded-[2.5rem] text-center shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-stone-950 font-extrabold text-xs uppercase px-5 py-1.5 rounded-full shadow-sm tracking-wider">
                Champion 🥇
              </div>
              <div className="w-20 h-20 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-center mx-auto mb-6 mt-2">
                <Trophy className="w-10 h-10 text-amber-600" />
              </div>
              <h3 className="text-stone-400 font-extrabold uppercase tracking-wider text-xs mb-2">1st Prize</h3>
              <div className="text-4xl sm:text-5xl font-extrabold text-amber-600 mb-2">₹6,000</div>
              <p className="text-stone-700 text-sm font-semibold">Cash Prize Money + Trophy 🏆</p>
            </div>

            {/* 2nd Prize */}
            <div className="relative bg-white border border-stone-200/90 p-8 rounded-[2.5rem] text-center shadow-sm hover:shadow-md transition-all transform hover:-translate-y-1">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-stone-200 text-stone-800 font-extrabold text-xs uppercase px-5 py-1.5 rounded-full shadow-xs tracking-wider">
                Runner Up 🥈
              </div>
              <div className="w-20 h-20 bg-stone-100 rounded-2xl border border-stone-200 flex items-center justify-center mx-auto mb-6 mt-2">
                <Award className="w-10 h-10 text-stone-600" />
              </div>
              <h3 className="text-stone-400 font-extrabold uppercase tracking-wider text-xs mb-2">2nd Prize</h3>
              <div className="text-4xl sm:text-5xl font-extrabold text-stone-800 mb-2">₹4,000</div>
              <p className="text-stone-700 text-sm font-semibold">Cash Prize Money 💰</p>
            </div>

            {/* 3rd Prize */}
            <div className="relative bg-white border border-orange-200/80 p-8 rounded-[2.5rem] text-center shadow-sm hover:shadow-md transition-all transform hover:-translate-y-1">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#ea580c] text-white font-extrabold text-xs uppercase px-5 py-1.5 rounded-full shadow-xs tracking-wider">
                3rd Place 🥉
              </div>
              <div className="w-20 h-20 bg-orange-50 rounded-2xl border border-orange-200 flex items-center justify-center mx-auto mb-6 mt-2">
                <Sparkles className="w-10 h-10 text-[#ea580c]" />
              </div>
              <h3 className="text-stone-400 font-extrabold uppercase tracking-wider text-xs mb-2">3rd Prize</h3>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#ea580c] mb-2 uppercase">Surprise Gift</div>
              <p className="text-stone-700 text-sm font-semibold">Special Gift Hamper 🎁</p>
            </div>
          </div>
        </div>
      </section>

      {/* Rules & Format Section */}
      <section id="rules" className="py-20 bg-white border-y border-stone-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            
            {/* Tournament Rules */}
            <div className="bg-stone-50 p-8 rounded-[2.5rem] border border-stone-200/80 shadow-xs">
              <div className="flex items-center gap-3 mb-6">
                <ShieldAlert className="w-7 h-7 text-[#ea580c]" />
                <h3 className="text-2xl font-bold text-stone-900 uppercase">Tournament Rules</h3>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-orange-100 text-[#ea580c] font-extrabold text-sm flex items-center justify-center shrink-0 mt-0.5">1</div>
                  <div>
                    <h4 className="text-stone-900 font-bold text-base mb-1">Non-Medallist Tournament</h4>
                    <p className="text-stone-600 text-sm leading-relaxed">Players who have won medals in badminton tournaments are not eligible to participate.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-orange-100 text-[#ea580c] font-extrabold text-sm flex items-center justify-center shrink-0 mt-0.5">2</div>
                  <div>
                    <h4 className="text-stone-900 font-bold text-base mb-1">No Coaches / Trained Players</h4>
                    <p className="text-stone-600 text-sm leading-relaxed">Coaches or professionally trained players are strictly not allowed to participate.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-orange-100 text-[#ea580c] font-extrabold text-sm flex items-center justify-center shrink-0 mt-0.5">3</div>
                  <div>
                    <h4 className="text-stone-900 font-bold text-base mb-1">Objection & Disqualification</h4>
                    <p className="text-stone-600 text-sm leading-relaxed">If any player is found to be ineligible, the concerned player/team will be disqualified immediately.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-orange-100 text-[#ea580c] font-extrabold text-sm flex items-center justify-center shrink-0 mt-0.5">4</div>
                  <div>
                    <h4 className="text-stone-900 font-bold text-base mb-1">Knockout Format</h4>
                    <p className="text-stone-600 text-sm leading-relaxed">All matches will be played in a fast-paced Knockout format.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Match Scoring & Details */}
            <div className="bg-stone-50 p-8 rounded-[2.5rem] border border-stone-200/80 shadow-xs">
              <div className="flex items-center gap-3 mb-6">
                <Zap className="w-7 h-7 text-amber-600" />
                <h3 className="text-2xl font-bold text-stone-900 uppercase">Match Format</h3>
              </div>

              <div className="space-y-4 mb-8">
                <div className="p-4 bg-white rounded-2xl border border-stone-200/80 flex items-center justify-between shadow-2xs">
                  <span className="text-stone-700 font-bold text-sm">League / Initial Matches</span>
                  <span className="text-[#ea580c] font-extrabold text-sm">Best of 3 Sets • 15 Pts/Set</span>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-stone-200/80 flex items-center justify-between shadow-2xs">
                  <span className="text-stone-700 font-bold text-sm">Semi-Finals</span>
                  <span className="text-[#ea580c] font-extrabold text-sm">21 Points Match</span>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-stone-200/80 flex items-center justify-between shadow-2xs">
                  <span className="text-stone-700 font-bold text-sm">Final Championship Match</span>
                  <span className="text-[#ea580c] font-extrabold text-sm">30 Points Match</span>
                </div>
              </div>

              <div className="border-t border-stone-200/80 pt-6 space-y-3">
                <div className="flex items-center gap-2.5 text-stone-700 text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#ea580c] shrink-0" />
                  <span>Official Shuttle: <strong className="text-stone-900 font-bold">Yonex Mavis 350</strong></span>
                </div>
                <div className="flex items-center gap-2.5 text-stone-700 text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#ea580c] shrink-0" />
                  <span>Umpire's decision will be final and binding for all matches.</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Venue & Organizer Details */}
      <section className="py-20 bg-[#faf9f6]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Event Location */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-stone-200/80 shadow-sm">
              <h3 className="text-xl font-bold text-stone-900 uppercase mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#ea580c]" />
                <span>Venue & Location</span>
              </h3>
              <p className="text-xl font-bold text-stone-900 mb-1">Indian Badminton Academy</p>
              <p className="text-stone-500 text-sm mb-6">Beside Begonia Homes, Manikonda, Hyderabad, Telangana</p>
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 text-stone-800 text-xs sm:text-sm font-semibold">
                📅 Sunday, 20th September 2026 &nbsp;|&nbsp; ⏰ 9:15 AM Onwards
              </div>
            </div>

            {/* Organizers Contact */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-stone-200/80 shadow-sm">
              <h3 className="text-xl font-bold text-stone-900 uppercase mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#ea580c]" />
                <span>Event Organizers</span>
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-200/80">
                  <div>
                    <div className="text-stone-900 font-bold text-base">Babu Yadav</div>
                    <div className="text-stone-500 text-xs font-medium">Event Organizer</div>
                  </div>
                  <a href="tel:9492063442" className="flex items-center gap-2 text-[#ea580c] hover:underline font-extrabold text-sm">
                    <Phone className="w-4 h-4" />
                    <span>94920 63442</span>
                  </a>
                </div>

                <div className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-200/80">
                  <div>
                    <div className="text-stone-900 font-bold text-base">Akhil</div>
                    <div className="text-stone-500 text-xs font-medium">WeAreSoloZ Founder</div>
                  </div>
                  <a href="tel:9966085310" className="flex items-center gap-2 text-[#ea580c] hover:underline font-extrabold text-sm">
                    <Phone className="w-4 h-4" />
                    <span>99660 85310</span>
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Floating Bottom CTA Bar */}
      <div className="sticky bottom-0 z-30 bg-white/95 backdrop-blur-md border-t border-stone-200 p-4 sm:p-5 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div>
            <div className="text-stone-400 text-[11px] font-bold uppercase tracking-wider">Team Entry Fee</div>
            <div className="text-[#ea580c] font-extrabold text-xl sm:text-2xl">₹500 <span className="text-stone-400 text-xs font-normal">/ Team</span></div>
          </div>
          <button
            onClick={() => setShowRegisterModal(true)}
            className="px-7 sm:px-9 py-3.5 gradient-orange text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-md uppercase tracking-wider transition-all hover:opacity-95"
          >
            Register Team Now
          </button>
        </div>
      </div>

      {/* Team Registration Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-[100] bg-stone-900/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white border border-stone-200 rounded-[2.5rem] max-w-lg w-full p-6 sm:p-8 relative shadow-2xl my-auto max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-stone-150 pb-4 mb-6">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#ea580c]">Official Team Registration</span>
                <h3 className="text-2xl font-bold text-stone-900 mt-0.5">Badminton Championship</h3>
                <p className="text-stone-500 text-xs font-medium">Season 1 (Men's Doubles)</p>
              </div>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-800 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-700 text-xs font-semibold">
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-5">
              <div>
                <label className="block text-stone-700 text-xs font-bold uppercase mb-1.5 tracking-wider">
                  Team Name *
                </label>
                <input
                  type="text"
                  name="teamName"
                  value={formData.teamName}
                  onChange={handleChange}
                  placeholder="e.g. Manikonda Smashers"
                  required
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#ea580c] focus:bg-white text-sm font-semibold transition-all"
                />
              </div>

              {/* Player 1 Details */}
              <div className="border-t border-stone-150 pt-4">
                <h4 className="text-[#ea580c] font-extrabold text-xs uppercase tracking-wider mb-3">
                  Player 1 (Captain) Details
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-stone-500 text-[11px] font-semibold mb-1">Captain Full Name *</label>
                    <input
                      type="text"
                      name="player1Name"
                      value={formData.player1Name}
                      onChange={handleChange}
                      placeholder="e.g. Rahul Sharma"
                      required
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#ea580c] focus:bg-white text-sm font-semibold transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-500 text-[11px] font-semibold mb-1">Mobile Number (10 digits) *</label>
                    <input
                      type="tel"
                      name="player1Phone"
                      value={formData.player1Phone}
                      onChange={handleChange}
                      placeholder="e.g. 9876543210"
                      required
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#ea580c] focus:bg-white text-sm font-semibold transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-500 text-[11px] font-semibold mb-1">Email Address (Ticket & Pass Receipt) *</label>
                    <input
                      type="email"
                      name="player1Email"
                      value={formData.player1Email}
                      onChange={handleChange}
                      placeholder="e.g. rahul@gmail.com"
                      required
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#ea580c] focus:bg-white text-sm font-semibold transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Player 2 Details */}
              <div className="border-t border-stone-150 pt-4">
                <h4 className="text-amber-600 font-extrabold text-xs uppercase tracking-wider mb-3">
                  Player 2 (Partner) Details
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-stone-500 text-[11px] font-semibold mb-1">Partner Full Name *</label>
                    <input
                      type="text"
                      name="player2Name"
                      value={formData.player2Name}
                      onChange={handleChange}
                      placeholder="e.g. Vikram Reddy"
                      required
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#ea580c] focus:bg-white text-sm font-semibold transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-500 text-[11px] font-semibold mb-1">Partner Mobile Number *</label>
                    <input
                      type="tel"
                      name="player2Phone"
                      value={formData.player2Phone}
                      onChange={handleChange}
                      placeholder="e.g. 9123456789"
                      required
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#ea580c] focus:bg-white text-sm font-semibold transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Amount Summary */}
              <div className="bg-orange-50/70 p-4 rounded-2xl border border-orange-200/80 flex items-center justify-between text-sm mt-4">
                <span className="text-stone-600 font-semibold">Total Entry Fee:</span>
                <span className="text-[#ea580c] font-extrabold text-xl">₹500</span>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 gradient-orange text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-lg shadow-orange-500/20 uppercase tracking-wider transition-all hover:opacity-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>Connecting PayU Gateway...</span>
                ) : (
                  <span>Proceed to Pay ₹500 via PayU</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
