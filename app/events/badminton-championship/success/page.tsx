"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CheckCircle2, Trophy, Calendar, MapPin, Phone, Users, ShieldCheck, Download, Loader2 } from "lucide-react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");

  const [registration, setRegistration] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!bookingId) {
      setLoading(false);
      return;
    }

    const fetchRegistration = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const res = await fetch(`${API_URL}/payment/event-registration/${bookingId}`);
        if (!res.ok) throw new Error("Could not find registration details");
        const data = await res.json();
        setRegistration(data);
      } catch (err: any) {
        console.error("Fetch event registration error:", err);
        setError(err.message || "Failed to load registration details.");
      } finally {
        setLoading(false);
      }
    };

    fetchRegistration();
  }, [bookingId]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pt-32 pb-20 px-4 sm:px-6 max-w-4xl mx-auto w-full">
        {loading ? (
          <div className="text-center py-20">
            <Loader2 className="w-12 h-12 text-orange-400 animate-spin mx-auto mb-4" />
            <p className="text-slate-400 font-semibold">Confirming team registration details...</p>
          </div>
        ) : error ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center max-w-lg mx-auto shadow-2xl">
            <CheckCircle2 className="w-16 h-16 text-amber-400 mx-auto mb-4" />
            <h1 className="text-2xl font-extrabold text-white mb-2 uppercase">Registration Received!</h1>
            <p className="text-slate-300 text-sm mb-6">Your registration payment has been processed. Registration ID: <strong className="text-orange-400">{bookingId}</strong></p>
            <Link
              href="/events/badminton-championship"
              className="inline-block px-6 py-3 bg-orange-500 hover:bg-orange-600 text-slate-950 font-extrabold text-sm rounded-xl uppercase tracking-wider"
            >
              Back to Tournament Page
            </Link>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
            {/* Header Glow */}
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500" />

            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              </div>
              <span className="inline-block px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-extrabold uppercase rounded-full tracking-widest mb-2">
                Payment Successful • Verified
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white uppercase">Team Registration Confirmed!</h1>
              <p className="text-slate-400 text-sm mt-1">WeAreSoloZ Badminton Championship (Season 1)</p>
            </div>

            {/* Registration Pass Card */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 mb-8 space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 pb-4 gap-2">
                <div>
                  <div className="text-slate-400 text-xs font-semibold uppercase">Registration ID</div>
                  <div className="text-amber-400 font-extrabold text-lg sm:text-xl">{registration?.bookingId || bookingId}</div>
                </div>
                <div className="sm:text-right">
                  <div className="text-slate-400 text-xs font-semibold uppercase">Entry Fee Paid</div>
                  <div className="text-emerald-400 font-black text-xl">₹{registration?.amount || 500}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-slate-400 text-xs font-bold uppercase mb-1">Team Name</div>
                  <div className="text-white font-extrabold text-lg">{registration?.teamName}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-xs font-bold uppercase mb-1">Status</div>
                  <div className="text-emerald-400 font-extrabold text-base flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>REGISTERED & CONFIRMED</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800/80">
                <div>
                  <div className="text-orange-400 font-bold text-xs uppercase mb-1">Player 1 (Captain)</div>
                  <div className="text-white font-bold text-base">{registration?.player1Name}</div>
                  <div className="text-slate-400 text-xs">{registration?.player1Phone} • {registration?.player1Email}</div>
                </div>
                <div>
                  <div className="text-amber-400 font-bold text-xs uppercase mb-1">Player 2 (Partner)</div>
                  <div className="text-white font-bold text-base">{registration?.player2Name}</div>
                  <div className="text-slate-400 text-xs">{registration?.player2Phone}</div>
                </div>
              </div>
            </div>

            {/* Event Summary Card */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-6 mb-8 space-y-4">
              <h3 className="text-white font-extrabold text-base uppercase flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <span>Tournament Details</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-slate-400 text-xs">Date & Time</div>
                    <div className="text-white font-bold">Sunday, 20th September 2026 | 9:15 AM</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-slate-400 text-xs">Venue</div>
                    <div className="text-white font-bold">Indian Badminton Academy, Manikonda</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/events/badminton-championship"
                className="w-full sm:w-auto px-8 py-3.5 bg-orange-500 hover:bg-orange-600 text-slate-950 font-extrabold text-sm rounded-xl uppercase tracking-wider text-center"
              >
                Back to Tournament Page
              </Link>
              <a
                href="https://wearesoloz.com"
                className="w-full sm:w-auto px-8 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm rounded-xl text-center"
              >
                Return to WeAreSoloZ Home
              </a>
            </div>

          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function BadmintonSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Loading confirmation...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
