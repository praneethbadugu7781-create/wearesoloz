"use client";

import React, { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, RefreshCw, Home, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

function BookingFailedContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const errorMessage = searchParams.get("error") || "The payment transaction could not be completed or was cancelled by the user.";
  const tripSlug = searchParams.get("slug");

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 font-body py-16 px-4 md:px-8">
      <div className="max-w-md mx-auto bg-white rounded-3xl p-6 md:p-10 border border-red-200 shadow-lg text-center relative overflow-hidden">
        {/* Top Glow */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-red-500" />

        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 ring-8 ring-red-50">
          <AlertCircle className="w-10 h-10" />
        </div>

        <span className="inline-block px-3 py-1 bg-red-100 text-red-800 text-xs font-bold uppercase tracking-widest rounded-full mb-3">
          Payment Incomplete
        </span>

        <h1 className="font-display text-2xl md:text-3xl font-bold text-stone-900 mb-2">
          Payment Failed or Cancelled
        </h1>

        <p className="text-xs md:text-sm text-stone-600 mb-6 leading-relaxed">
          {errorMessage}
        </p>

        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 text-left mb-6 space-y-1">
          <p className="font-bold">💡 What to do next?</p>
          <p>• If money was deducted, it will automatically refund back to your account within 5-7 working days.</p>
          <p>• You can click below to retry payment or book via WhatsApp.</p>
        </div>

        <div className="space-y-3">
          {tripSlug ? (
            <Link href={`/upcoming-trips/${tripSlug}`} className="block">
              <Button className="w-full rounded-full h-11 bg-[#ea580c] hover:bg-[#ea580c]/90 text-white font-bold text-xs flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4" /> Retry Payment & Booking
              </Button>
            </Link>
          ) : (
            <Button
              onClick={() => router.back()}
              className="w-full rounded-full h-11 bg-[#ea580c] hover:bg-[#ea580c]/90 text-white font-bold text-xs flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Retry Payment
            </Button>
          )}

          <a
            href="https://wa.me/919966085310?text=Hi%20Akhil,%20my%20payment%20failed%20on%20the%20website.%20Can%20you%20help%20me%20book%20my%20seat?"
            target="_blank"
            rel="noreferrer"
            className="w-full py-3 px-4 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all block"
          >
            <MessageCircle className="w-4 h-4 inline-block" /> Contact Akhil on WhatsApp
          </a>

          <Link href="/" className="block">
            <Button variant="ghost" className="w-full rounded-full h-11 border border-stone-200 text-stone-700 hover:bg-stone-100 font-bold text-xs flex items-center justify-center gap-2">
              <Home className="w-4 h-4" /> Return to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function BookingFailedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <AlertCircle className="w-8 h-8 text-red-500 animate-bounce" />
      </div>
    }>
      <BookingFailedContent />
    </Suspense>
  );
}
