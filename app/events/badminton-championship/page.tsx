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
  ChevronRight
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
    if (!formData.player1Phone.trim() || formData.player1Phone.trim().length < 10) return setError("Valid 10-digit phone number for Player 1 is required");
    if (!formData.player1Email.trim() || !formData.player1Email.includes("@")) return setError("Valid email address for Player 1 is required");
    if (!formData.player2Name.trim()) return setError("Player 2 (Partner) name is required");
    if (!formData.player2Phone.trim() || formData.player2Phone.trim().length < 10) return setError("Valid 10-digit phone number for Player 2 is required");

    setLoading(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${API_URL}/payment/create-event-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: "badminton-season-1",
          eventName: "WeAreSoloZ Badminton Championship Season 1",
          teamName: formData.teamName,
          player1Name: formData.player1Name,
          player1Phone: formData.player1Phone,
          player1Email: formData.player1Email,
          player2Name: formData.player2Name,
          player2Phone: formData.player2Phone,
          amount: 500
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to initialize payment");
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-b border-slate-800/80">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ea580c_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        
        {/* Glow Spheres */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-orange-600/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs sm:text-sm font-bold uppercase tracking-widest mb-6 animate-pulse">
            <Zap className="w-4 h-4 text-orange-400" />
            <span>Official WeAreSoloZ Event • Season 1</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white uppercase mb-4 leading-tight">
            Badminton <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500">Championship</span>
          </h1>

          <div className="inline-block bg-slate-900/90 border border-orange-500/40 px-5 py-2 rounded-xl mb-6 shadow-xl">
            <span className="text-orange-400 font-extrabold text-sm sm:text-lg tracking-wider uppercase">
              🏸 Only For Men's Doubles
            </span>
          </div>

          <p className="text-slate-300 text-base sm:text-xl max-w-2xl mx-auto mb-8 font-medium">
            Travel Solo. You're Not Alone. <br />
            <span className="text-amber-400 font-semibold">PLAY FAIR ★ PLAY HARD ★ ENJOY THE GAME!</span>
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <button
              onClick={() => setShowRegisterModal(true)}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black text-lg rounded-2xl shadow-xl shadow-orange-500/25 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3 uppercase tracking-wider"
            >
              <span>Register Team (₹500)</span>
              <ChevronRight className="w-5 h-5" />
            </button>
            <a
              href="#rules"
              className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-base rounded-2xl border border-slate-700 transition-all flex items-center justify-center gap-2"
            >
              <Award className="w-5 h-5 text-amber-400" />
              <span>Match Format & Rules</span>
            </a>
          </div>

          {/* Quick Info Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-900/80 backdrop-blur-md p-4 sm:p-6 rounded-2xl border border-slate-800 shadow-2xl max-w-4xl mx-auto text-left">
            <div className="flex items-start gap-3">
              <Calendar className="w-6 h-6 text-orange-400 shrink-0 mt-1" />
              <div>
                <div className="text-slate-400 text-xs font-semibold uppercase">Date</div>
                <div className="text-white font-bold text-sm sm:text-base">Sunday, Sep 20</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-6 h-6 text-amber-400 shrink-0 mt-1" />
              <div>
                <div className="text-slate-400 text-xs font-semibold uppercase">Time</div>
                <div className="text-white font-bold text-sm sm:text-base">9:15 AM Onwards</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Trophy className="w-6 h-6 text-yellow-400 shrink-0 mt-1" />
              <div>
                <div className="text-slate-400 text-xs font-semibold uppercase">Prize Pool</div>
                <div className="text-amber-400 font-extrabold text-sm sm:text-base">₹10,000 Total</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-6 h-6 text-orange-400 shrink-0 mt-1" />
              <div>
                <div className="text-slate-400 text-xs font-semibold uppercase">Venue</div>
                <div className="text-white font-bold text-xs sm:text-sm truncate">IBA, Manikonda</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Prize Pool Section */}
      <section className="py-16 bg-slate-950 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-xs sm:text-sm font-extrabold text-orange-400 tracking-widest uppercase mb-2">Rewards & Cash Prizes</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white uppercase">★ Prize Pool <span className="text-amber-400">₹10,000</span> ★</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1st Prize */}
            <div className="relative bg-gradient-to-b from-slate-900 to-slate-900/90 border-2 border-amber-500/60 p-8 rounded-3xl text-center shadow-2xl hover:border-amber-400 transition-all transform hover:-translate-y-1">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 font-black text-xs uppercase px-4 py-1.5 rounded-full shadow-lg">
                Champion 🥇
              </div>
              <div className="w-20 h-20 bg-amber-500/10 rounded-2xl border border-amber-500/30 flex items-center justify-center mx-auto mb-6">
                <Trophy className="w-10 h-10 text-amber-400" />
              </div>
              <h4 className="text-slate-400 font-bold uppercase tracking-wider text-sm mb-2">1st Prize</h4>
              <div className="text-4xl sm:text-5xl font-black text-amber-400 mb-2">₹6,000</div>
              <p className="text-slate-300 text-sm font-semibold">Cash Prize Money + Trophy</p>
            </div>

            {/* 2nd Prize */}
            <div className="relative bg-gradient-to-b from-slate-900 to-slate-900/90 border border-slate-700 p-8 rounded-3xl text-center shadow-xl hover:border-slate-500 transition-all transform hover:-translate-y-1">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-slate-300 text-slate-950 font-black text-xs uppercase px-4 py-1.5 rounded-full shadow-lg">
                Runner Up 🥈
              </div>
              <div className="w-20 h-20 bg-slate-400/10 rounded-2xl border border-slate-400/30 flex items-center justify-center mx-auto mb-6">
                <Award className="w-10 h-10 text-slate-300" />
              </div>
              <h4 className="text-slate-400 font-bold uppercase tracking-wider text-sm mb-2">2nd Prize</h4>
              <div className="text-4xl sm:text-5xl font-black text-slate-200 mb-2">₹4,000</div>
              <p className="text-slate-300 text-sm font-semibold">Cash Prize Money</p>
            </div>

            {/* 3rd Prize */}
            <div className="relative bg-gradient-to-b from-slate-900 to-slate-900/90 border border-orange-500/40 p-8 rounded-3xl text-center shadow-xl hover:border-orange-400 transition-all transform hover:-translate-y-1">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-orange-500 text-slate-950 font-black text-xs uppercase px-4 py-1.5 rounded-full shadow-lg">
                3rd Place 🥉
              </div>
              <div className="w-20 h-20 bg-orange-500/10 rounded-2xl border border-orange-500/30 flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-10 h-10 text-orange-400" />
              </div>
              <h4 className="text-slate-400 font-bold uppercase tracking-wider text-sm mb-2">3rd Prize</h4>
              <div className="text-2xl sm:text-3xl font-extrabold text-orange-400 mb-2 uppercase">Surprise Gift</div>
              <p className="text-slate-300 text-sm font-semibold">Special Gift Hamper 🎁</p>
            </div>
          </div>
        </div>
      </section>

      {/* Rules & Format Section */}
      <section id="rules" className="py-16 bg-slate-900/50 border-y border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Tournament Format */}
            <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <ShieldCheck className="w-7 h-7 text-orange-400" />
                <h3 className="text-2xl font-extrabold text-white uppercase">Tournament Format</h3>
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

            {/* Match Format & Details */}
            <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <Zap className="w-7 h-7 text-amber-400" />
                <h3 className="text-2xl font-extrabold text-white uppercase">Match Format</h3>
              </div>

              <div className="space-y-4 mb-8">
                <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300 font-bold text-sm">League / Knockout Matches</span>
                  <span className="text-amber-400 font-extrabold text-sm">Best of 3 Sets • 15 Pts/Set</span>
                </div>

                <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300 font-bold text-sm">Semi-Finals</span>
                  <span className="text-amber-400 font-extrabold text-sm">21 Points</span>
                </div>

                <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300 font-bold text-sm">Final Match</span>
                  <span className="text-amber-400 font-extrabold text-sm">30 Points</span>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-6 space-y-3">
                <div className="flex items-center gap-2 text-slate-300 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />
                  <span>Official Shuttle: <strong>Yonex Mavis 350</strong></span>
                </div>
                <div className="flex items-center gap-2 text-slate-300 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />
                  <span>Umpire's decision will be final and binding.</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Venue & Organizer Details */}
      <section className="py-16 bg-slate-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Event Location */}
            <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl">
              <h3 className="text-xl font-extrabold text-white uppercase mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-400" />
                <span>Venue & Location</span>
              </h3>
              <p className="text-lg font-bold text-white mb-2">Indian Badminton Academy</p>
              <p className="text-slate-400 text-sm mb-6">Beside Begonia Homes, Manikonda, Hyderabad, Telangana</p>
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-slate-300 text-xs sm:text-sm font-mono">
                📅 Sunday, 20th September 2026 | ⏰ 9:15 AM Onwards
              </div>
            </div>

            {/* Organizers Contact */}
            <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl">
              <h3 className="text-xl font-extrabold text-white uppercase mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                <span>Event Organizers</span>
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800">
                  <div>
                    <div className="text-white font-bold">Babu Yadav</div>
                    <div className="text-slate-400 text-xs">Event Organizer</div>
                  </div>
                  <a href="tel:9492063442" className="flex items-center gap-2 text-orange-400 hover:text-orange-300 font-extrabold text-sm">
                    <Phone className="w-4 h-4" />
                    <span>94920 63442</span>
                  </a>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800">
                  <div>
                    <div className="text-white font-bold">Akhil</div>
                    <div className="text-slate-400 text-xs">WeAreSoloZ Organizer</div>
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
      <div className="sticky bottom-0 z-30 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div>
            <div className="text-slate-400 text-xs font-semibold uppercase">Entry Fee</div>
            <div className="text-amber-400 font-black text-xl sm:text-2xl">₹500 <span className="text-slate-400 text-xs font-normal">/ Team</span></div>
          </div>
          <button
            onClick={() => setShowRegisterModal(true)}
            className="px-8 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black text-base rounded-xl shadow-lg uppercase tracking-wider"
          >
            Register Team Now
          </button>
        </div>
      </div>

      {/* Registration Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 relative shadow-2xl my-8">
            <button
              onClick={() => setShowRegisterModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="mb-6">
              <h3 className="text-2xl font-extrabold text-white uppercase">Team Registration</h3>
              <p className="text-slate-400 text-sm mt-1">WeAreSoloZ Badminton Championship (Season 1)</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-3 text-red-400 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-300 text-xs font-bold uppercase mb-1">Team Name *</label>
                <input
                  type="text"
                  name="teamName"
                  value={formData.teamName}
                  onChange={handleChange}
                  placeholder="e.g. Manikonda Smashers"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 text-sm"
                />
              </div>

              <div className="border-t border-slate-800 pt-4">
                <h4 className="text-orange-400 font-bold text-xs uppercase mb-3">Player 1 (Captain) Details</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    name="player1Name"
                    value={formData.player1Name}
                    onChange={handleChange}
                    placeholder="Full Name *"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 text-sm"
                  />
                  <input
                    type="tel"
                    name="player1Phone"
                    value={formData.player1Phone}
                    onChange={handleChange}
                    placeholder="Mobile Number (10 digits) *"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 text-sm"
                  />
                  <input
                    type="email"
                    name="player1Email"
                    value={formData.player1Email}
                    onChange={handleChange}
                    placeholder="Email Address (for ticket/receipt) *"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 text-sm"
                  />
                </div>
              </div>

              <div className="border-t border-slate-800 pt-4">
                <h4 className="text-amber-400 font-bold text-xs uppercase mb-3">Player 2 (Partner) Details</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    name="player2Name"
                    value={formData.player2Name}
                    onChange={handleChange}
                    placeholder="Partner Full Name *"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 text-sm"
                  />
                  <input
                    type="tel"
                    name="player2Phone"
                    value={formData.player2Phone}
                    onChange={handleChange}
                    placeholder="Partner Mobile Number *"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 text-sm"
                  />
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between text-sm mt-4">
                <span className="text-slate-400">Total Entry Fee:</span>
                <span className="text-amber-400 font-extrabold text-lg">₹500</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-extrabold text-base rounded-2xl shadow-xl uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2"
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
