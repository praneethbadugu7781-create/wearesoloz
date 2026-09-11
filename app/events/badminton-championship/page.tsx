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
  Ticket
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
      return setError("Valid 10-digit phone number for Player 1 is required");
    }
    if (!formData.player1Email.trim() || !formData.player1Email.includes("@")) {
      return setError("Valid email address for Player 1 is required");
    }
    if (!formData.player2Name.trim()) return setError("Player 2 (Partner) name is required");
    if (!formData.player2Phone.trim() || formData.player2Phone.trim().replace(/[^0-9]/g, "").length < 10) {
      return setError("Valid 10-digit phone number for Player 2 is required");
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
        throw new Error("Server payment endpoint returned an invalid response. Please check server connection.");
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || data.message || "Failed to initialize payment");
      }

      // Automatically construct and submit PayU form
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
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans selection:bg-orange-500 selection:text-white antialiased">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-36 pb-24 overflow-hidden border-b border-slate-800/60 bg-gradient-to-b from-[#0e131f] via-[#07090e] to-[#07090e]">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ea580c_1px,transparent_1px)] [background-size:32px_32px] pointer-events-none" />
        
        {/* Ambient Glows */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-orange-600/15 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute top-1/4 right-10 w-[400px] h-[400px] bg-amber-500/10 blur-[150px] rounded-full pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/30 text-orange-400 text-xs sm:text-sm font-extrabold uppercase tracking-widest mb-6 shadow-xs">
            <Zap className="w-4 h-4 text-orange-400 animate-pulse" />
            <span>Official WeAreSoloZ Event • Season 1</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-white uppercase mb-4 leading-none">
            BADMINTON <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500">CHAMPIONSHIP</span>
          </h1>

          {/* Men's Doubles Pill */}
          <div className="inline-block bg-slate-900/90 border border-orange-500/30 px-6 py-2.5 rounded-2xl mb-6 shadow-2xl backdrop-blur-md">
            <span className="text-amber-400 font-extrabold text-sm sm:text-base tracking-widest uppercase flex items-center gap-2">
              <span>🏸</span>
              <span>ONLY FOR MEN'S DOUBLES</span>
            </span>
          </div>

          <p className="text-slate-300 text-base sm:text-xl max-w-2xl mx-auto mb-8 font-medium leading-relaxed">
            Travel Solo. You're Not Alone. <br />
            <span className="text-amber-400 font-bold tracking-wide">PLAY FAIR ★ PLAY HARD ★ ENJOY THE GAME!</span>
          </p>

          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <button
              onClick={() => setShowRegisterModal(true)}
              className="w-full sm:w-auto px-9 py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black text-base sm:text-lg rounded-2xl shadow-xl shadow-orange-500/20 hover:shadow-orange-500/35 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-3 uppercase tracking-wider"
            >
              <Ticket className="w-5 h-5" />
              <span>REGISTER TEAM (₹500)</span>
              <ChevronRight className="w-5 h-5" />
            </button>
            <a
              href="#rules"
              className="w-full sm:w-auto px-8 py-4 bg-slate-900/90 hover:bg-slate-800 text-white font-bold text-base rounded-2xl border border-slate-700/80 transition-all flex items-center justify-center gap-2 shadow-md"
            >
              <Award className="w-5 h-5 text-amber-400" />
              <span>Match Format & Rules</span>
            </a>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-900/80 backdrop-blur-xl p-5 sm:p-7 rounded-3xl border border-slate-800/90 shadow-2xl max-w-4xl mx-auto text-left">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">Date</div>
                <div className="text-white font-extrabold text-xs sm:text-sm mt-0.5">Sunday, Sep 20</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">Time</div>
                <div className="text-white font-extrabold text-xs sm:text-sm mt-0.5">9:15 AM Onwards</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 shrink-0">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <div className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">Prize Pool</div>
                <div className="text-amber-400 font-extrabold text-xs sm:text-sm mt-0.5">₹10,000 Total</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">Venue</div>
                <div className="text-white font-extrabold text-xs sm:text-sm truncate mt-0.5" title="Indian Badminton Academy, Manikonda">IBA, Manikonda</div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Prize Pool Section */}
      <section className="py-20 bg-[#07090e] relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <span className="text-xs font-extrabold text-orange-400 tracking-widest uppercase block mb-2">Rewards & Cash Prizes</span>
            <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">★ PRIZE POOL <span className="text-amber-400">₹10,000</span> ★</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* 1st Prize */}
            <div className="relative bg-gradient-to-b from-slate-900 to-[#0e131f] border-2 border-amber-500/60 p-8 rounded-3xl text-center shadow-2xl hover:border-amber-400 transition-all transform hover:-translate-y-1">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs uppercase px-5 py-1.5 rounded-full shadow-lg tracking-wider">
                CHAMPION 🥇
              </div>
              <div className="w-20 h-20 bg-amber-500/10 rounded-2xl border border-amber-500/30 flex items-center justify-center mx-auto mb-6 mt-2">
                <Trophy className="w-10 h-10 text-amber-400" />
              </div>
              <h3 className="text-slate-400 font-extrabold uppercase tracking-wider text-xs mb-2">1ST PRIZE</h3>
              <div className="text-4xl sm:text-5xl font-black text-amber-400 mb-2">₹6,000</div>
              <p className="text-slate-300 text-sm font-semibold">Cash Prize Money + Trophy 🏆</p>
            </div>

            {/* 2nd Prize */}
            <div className="relative bg-gradient-to-b from-slate-900 to-[#0e131f] border border-slate-700/80 p-8 rounded-3xl text-center shadow-xl hover:border-slate-500 transition-all transform hover:-translate-y-1">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-slate-200 text-slate-950 font-black text-xs uppercase px-5 py-1.5 rounded-full shadow-lg tracking-wider">
                RUNNER UP 🥈
              </div>
              <div className="w-20 h-20 bg-slate-400/10 rounded-2xl border border-slate-400/30 flex items-center justify-center mx-auto mb-6 mt-2">
                <Award className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-slate-400 font-extrabold uppercase tracking-wider text-xs mb-2">2ND PRIZE</h3>
              <div className="text-4xl sm:text-5xl font-black text-slate-200 mb-2">₹4,000</div>
              <p className="text-slate-300 text-sm font-semibold">Cash Prize Money 💰</p>
            </div>

            {/* 3rd Prize */}
            <div className="relative bg-gradient-to-b from-slate-900 to-[#0e131f] border border-orange-500/40 p-8 rounded-3xl text-center shadow-xl hover:border-orange-400 transition-all transform hover:-translate-y-1">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-500 text-slate-950 font-black text-xs uppercase px-5 py-1.5 rounded-full shadow-lg tracking-wider">
                3RD PLACE 🥉
              </div>
              <div className="w-20 h-20 bg-orange-500/10 rounded-2xl border border-orange-500/30 flex items-center justify-center mx-auto mb-6 mt-2">
                <Sparkles className="w-10 h-10 text-orange-400" />
              </div>
              <h3 className="text-slate-400 font-extrabold uppercase tracking-wider text-xs mb-2">3RD PRIZE</h3>
              <div className="text-2xl sm:text-3xl font-black text-orange-400 mb-2 uppercase">SURPRISE GIFT</div>
              <p className="text-slate-300 text-sm font-semibold">Special Gift Hamper 🎁</p>
            </div>
          </div>
        </div>
      </section>

      {/* Rules & Format Section */}
      <section id="rules" className="py-20 bg-[#0a0d14] border-y border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            
            {/* Tournament Eligibility Rules */}
            <div className="bg-slate-900/90 p-8 rounded-3xl border border-slate-800 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <ShieldAlert className="w-7 h-7 text-orange-400" />
                <h3 className="text-2xl font-black text-white uppercase">Tournament Rules</h3>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 font-extrabold text-sm flex items-center justify-center shrink-0 mt-0.5">1</div>
                  <div>
                    <h4 className="text-white font-bold text-base mb-1">Non-Medallist Tournament</h4>
                    <p className="text-slate-400 text-sm">Players who have won medals in badminton tournaments are not eligible to participate.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 font-extrabold text-sm flex items-center justify-center shrink-0 mt-0.5">2</div>
                  <div>
                    <h4 className="text-white font-bold text-base mb-1">No Coaches / Trained Players</h4>
                    <p className="text-slate-400 text-sm">Coaches or professionally trained players are strictly not allowed to participate.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 font-extrabold text-sm flex items-center justify-center shrink-0 mt-0.5">3</div>
                  <div>
                    <h4 className="text-white font-bold text-base mb-1">Objection & Disqualification</h4>
                    <p className="text-slate-400 text-sm">If any player is found to be ineligible, the concerned player/team will be disqualified immediately.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 font-extrabold text-sm flex items-center justify-center shrink-0 mt-0.5">4</div>
                  <div>
                    <h4 className="text-white font-bold text-base mb-1">Knockout Format</h4>
                    <p className="text-slate-400 text-sm">All matches will be played in a fast-paced Knockout format.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Match Format & Scoring */}
            <div className="bg-slate-900/90 p-8 rounded-3xl border border-slate-800 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <Zap className="w-7 h-7 text-amber-400" />
                <h3 className="text-2xl font-black text-white uppercase">Match Scoring</h3>
              </div>

              <div className="space-y-4 mb-8">
                <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300 font-bold text-sm">League / Initial Matches</span>
                  <span className="text-amber-400 font-extrabold text-sm">Best of 3 Sets • 15 Pts/Set</span>
                </div>

                <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300 font-bold text-sm">Semi-Finals</span>
                  <span className="text-amber-400 font-extrabold text-sm">21 Points Match</span>
                </div>

                <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300 font-bold text-sm">Final Championship Match</span>
                  <span className="text-amber-400 font-extrabold text-sm">30 Points Match</span>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-6 space-y-3">
                <div className="flex items-center gap-2.5 text-slate-300 text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />
                  <span>Official Shuttle: <strong className="text-white font-bold">Yonex Mavis 350</strong></span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-300 text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />
                  <span>Umpire's decision will be final and binding for all matches.</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Venue & Organizer Details */}
      <section className="py-20 bg-[#07090e]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Event Location */}
            <div className="bg-slate-900/90 p-8 rounded-3xl border border-slate-800 shadow-xl">
              <h3 className="text-xl font-black text-white uppercase mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-400" />
                <span>Venue & Location</span>
              </h3>
              <p className="text-xl font-bold text-white mb-1">Indian Badminton Academy</p>
              <p className="text-slate-400 text-sm mb-6">Beside Begonia Homes, Manikonda, Hyderabad, Telangana</p>
              <div className="p-4 bg-slate-950/90 rounded-2xl border border-slate-800 text-slate-300 text-xs sm:text-sm font-semibold">
                📅 Sunday, 20th September 2026 &nbsp;|&nbsp; ⏰ 9:15 AM Onwards
              </div>
            </div>

            {/* Organizers Contact */}
            <div className="bg-slate-900/90 p-8 rounded-3xl border border-slate-800 shadow-xl">
              <h3 className="text-xl font-black text-white uppercase mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                <span>Event Organizers</span>
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-950/90 rounded-2xl border border-slate-800">
                  <div>
                    <div className="text-white font-bold text-base">Babu Yadav</div>
                    <div className="text-slate-400 text-xs font-medium">Event Organizer</div>
                  </div>
                  <a href="tel:9492063442" className="flex items-center gap-2 text-orange-400 hover:text-orange-300 font-extrabold text-sm">
                    <Phone className="w-4 h-4" />
                    <span>94920 63442</span>
                  </a>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-950/90 rounded-2xl border border-slate-800">
                  <div>
                    <div className="text-white font-bold text-base">Akhil</div>
                    <div className="text-slate-400 text-xs font-medium">WeAreSoloZ Founder</div>
                  </div>
                  <a href="tel:9966085310" className="flex items-center gap-2 text-orange-400 hover:text-orange-300 font-extrabold text-sm">
                    <Phone className="w-4 h-4" />
                    <span>99660 85310</span>
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Floating Bottom CTA */}
      <div className="sticky bottom-0 z-30 bg-[#090d16]/95 backdrop-blur-xl border-t border-slate-800/90 p-4 sm:p-5 shadow-2xl">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div>
            <div className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">Team Entry Fee</div>
            <div className="text-amber-400 font-black text-xl sm:text-2xl">₹500 <span className="text-slate-400 text-xs font-normal">/ Team</span></div>
          </div>
          <button
            onClick={() => setShowRegisterModal(true)}
            className="px-7 sm:px-9 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black text-sm sm:text-base rounded-xl shadow-lg uppercase tracking-wider transition-all transform hover:scale-[1.02]"
          >
            REGISTER TEAM NOW
          </button>
        </div>
      </div>

      {/* Registration Modal - Fully Fixed & Responsive */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-[#0e1320] border border-slate-700/80 rounded-3xl max-w-lg w-full p-6 sm:p-8 relative shadow-2xl my-auto max-h-[90vh] overflow-y-auto custom-scrollbar">
            
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4 mb-6">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-orange-400">Team Entry Registration</span>
                <h3 className="text-2xl font-black text-white uppercase mt-0.5">Badminton Championship</h3>
                <p className="text-slate-400 text-xs font-medium">Season 1 (Men's Doubles)</p>
              </div>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-rose-500/15 border border-rose-500/40 rounded-2xl flex items-start gap-3 text-rose-300 text-xs font-semibold">
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-5">
              <div>
                <label className="block text-slate-300 text-xs font-extrabold uppercase mb-1.5 tracking-wider">
                  Team Name *
                </label>
                <input
                  type="text"
                  name="teamName"
                  value={formData.teamName}
                  onChange={handleChange}
                  placeholder="e.g. Manikonda Smashers"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm font-medium"
                />
              </div>

              {/* Player 1 Details */}
              <div className="border-t border-slate-800/80 pt-4">
                <h4 className="text-orange-400 font-extrabold text-xs uppercase tracking-wider mb-3">
                  Player 1 (Captain) Details
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-400 text-[11px] font-semibold mb-1">Captain Full Name *</label>
                    <input
                      type="text"
                      name="player1Name"
                      value={formData.player1Name}
                      onChange={handleChange}
                      placeholder="e.g. Rahul Sharma"
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[11px] font-semibold mb-1">Mobile Number (10 digits) *</label>
                    <input
                      type="tel"
                      name="player1Phone"
                      value={formData.player1Phone}
                      onChange={handleChange}
                      placeholder="e.g. 9876543210"
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[11px] font-semibold mb-1">Email Address (Ticket & Pass Receipt) *</label>
                    <input
                      type="email"
                      name="player1Email"
                      value={formData.player1Email}
                      onChange={handleChange}
                      placeholder="e.g. rahul@gmail.com"
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Player 2 Details */}
              <div className="border-t border-slate-800/80 pt-4">
                <h4 className="text-amber-400 font-extrabold text-xs uppercase tracking-wider mb-3">
                  Player 2 (Partner) Details
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-400 text-[11px] font-semibold mb-1">Partner Full Name *</label>
                    <input
                      type="text"
                      name="player2Name"
                      value={formData.player2Name}
                      onChange={handleChange}
                      placeholder="e.g. Vikram Reddy"
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[11px] font-semibold mb-1">Partner Mobile Number *</label>
                    <input
                      type="tel"
                      name="player2Phone"
                      value={formData.player2Phone}
                      onChange={handleChange}
                      placeholder="e.g. 9123456789"
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Amount Summary */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between text-sm mt-4">
                <span className="text-slate-400 font-semibold">Total Entry Fee:</span>
                <span className="text-amber-400 font-black text-xl">₹500</span>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black text-sm sm:text-base rounded-2xl shadow-xl uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2"
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
