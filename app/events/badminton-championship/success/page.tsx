"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CheckCircle2, Trophy, Calendar, MapPin, Phone, Users, ShieldCheck, Download, Loader2, ArrowLeft } from "lucide-react";

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
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://wearesoloz.com/api";
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
    <div className="min-h-screen bg-[#faf9f6] text-stone-900 flex flex-col font-sans selection:bg-orange-500 selection:text-white antialiased">
      <Navbar />

      <main className="flex-1 pt-32 pb-24 px-4 sm:px-6 max-w-4xl mx-auto w-full">
        {loading ? (
          <div className="text-center py-24 space-y-4">
            <Loader2 className="w-10 h-10 text-[#ea580c] animate-spin mx-auto" />
            <p className="text-stone-500 font-semibold text-sm">Verifying team registration details...</p>
          </div>
        ) : error ? (
          <div className="bg-white border border-stone-200/90 rounded-[2.5rem] p-8 sm:p-12 text-center max-w-lg mx-auto shadow-sm">
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-200">
              <CheckCircle2 className="w-8 h-8 text-amber-600" />
            </div>
            <h1 className="text-2xl font-extrabold text-stone-900 mb-2 uppercase">Registration Received!</h1>
            <p className="text-stone-600 text-sm mb-6 leading-relaxed">Your registration payment has been processed successfully. Registration ID: <strong className="text-[#ea580c]">{bookingId}</strong></p>
            <Link
              href="/events/badminton-championship"
              className="inline-flex items-center gap-2 px-7 py-3.5 gradient-orange text-white font-extrabold text-xs sm:text-sm rounded-2xl uppercase tracking-wider shadow-md hover:opacity-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Tournament Page</span>
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-stone-200/90 rounded-[2.5rem] p-6 sm:p-10 shadow-sm relative overflow-hidden">
            {/* Top Accent Line */}
            <div className="absolute top-0 inset-x-0 h-1.5 gradient-orange" />

            <div className="text-center mb-8 pt-2">
              <div className="w-20 h-20 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>
              <span className="inline-block px-4 py-1 bg-emerald-100/70 border border-emerald-200 text-emerald-800 text-[11px] font-extrabold uppercase rounded-full tracking-widest mb-3">
                Payment Verified & Confirmed
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 uppercase tracking-tight">Team Registration Confirmed!</h1>
              <p className="text-stone-500 text-sm mt-1">WeAreSoloZ Badminton Championship (Season 1)</p>
            </div>

            {/* Registration Pass Card */}
            <div className="bg-stone-50 border border-stone-200/80 rounded-3xl p-6 sm:p-8 mb-8 space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-stone-200/80 pb-4 gap-2">
                <div>
                  <div className="text-stone-400 text-xs font-extrabold uppercase tracking-wider">Registration ID</div>
                  <div className="text-[#ea580c] font-extrabold text-lg sm:text-xl font-mono mt-0.5">{registration?.bookingId || bookingId}</div>
                </div>
                <div className="sm:text-right">
                  <div className="text-stone-400 text-xs font-extrabold uppercase tracking-wider">Entry Fee Paid</div>
                  <div className="text-emerald-700 font-black text-xl mt-0.5">₹{registration?.amount || 500}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-stone-400 text-xs font-bold uppercase tracking-wider mb-1">Team Name</div>
                  <div className="text-stone-900 font-extrabold text-lg">{registration?.teamName}</div>
                </div>
                <div>
                  <div className="text-stone-400 text-xs font-bold uppercase tracking-wider mb-1">Status</div>
                  <div className="text-emerald-700 font-extrabold text-sm flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>REGISTERED & CONFIRMED</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-stone-200/80">
                <div>
                  <div className="text-[#ea580c] font-extrabold text-xs uppercase tracking-wider mb-1">Player 1 (Captain)</div>
                  <div className="text-stone-900 font-bold text-base">{registration?.player1Name}</div>
                  <div className="text-stone-500 text-xs mt-0.5">{registration?.player1Phone} • {registration?.player1Email}</div>
                </div>
                <div>
                  <div className="text-amber-600 font-extrabold text-xs uppercase tracking-wider mb-1">Player 2 (Partner)</div>
                  <div className="text-stone-900 font-bold text-base">{registration?.player2Name}</div>
                  <div className="text-stone-500 text-xs mt-0.5">{registration?.player2Phone}</div>
                </div>
              </div>
            </div>

            {/* Event Summary Card */}
            <div className="bg-orange-50/60 border border-orange-200/80 rounded-3xl p-6 mb-8 space-y-4">
              <h3 className="text-stone-900 font-bold text-base uppercase flex items-center gap-2">
                <Trophy className="w-5 h-5 text-[#ea580c]" />
                <span>Tournament Event Details</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-[#ea580c] shrink-0 mt-0.5" />
                  <div>
                    <div className="text-stone-500 text-xs font-semibold">Date & Time</div>
                    <div className="text-stone-900 font-bold">Sunday, 20th September 2026 | 9:15 AM</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#ea580c] shrink-0 mt-0.5" />
                  <div>
                    <div className="text-stone-500 text-xs font-semibold">Venue</div>
                    <div className="text-stone-900 font-bold">Indian Badminton Academy, Manikonda</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/events/badminton-championship"
                className="w-full sm:w-auto px-8 py-3.5 gradient-orange text-white font-extrabold text-xs sm:text-sm rounded-2xl uppercase tracking-wider text-center shadow-md hover:opacity-95"
              >
                Back to Tournament Page
              </Link>
              <Link
                href="/"
                className="w-full sm:w-auto px-8 py-3.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs sm:text-sm rounded-2xl text-center transition-colors"
              >
                Return to Home Page
              </Link>
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
    <Suspense fallback={<div className="min-h-screen bg-[#faf9f6] text-stone-700 flex items-center justify-center">Loading confirmation...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
