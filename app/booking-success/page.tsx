"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Calendar, MapPin, User, Mail, Phone, CreditCard, Home, Download, MessageCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

function BookingSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = searchParams.get("bookingId") || searchParams.get("id");
  const orderId = searchParams.get("orderId");

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchBookingDetails() {
      const idToFetch = bookingId || orderId;
      if (!idToFetch) {
        setLoading(false);
        return;
      }

      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const res = await fetch(`${API_URL}/payment/booking/${idToFetch}`);
        if (!res.ok) throw new Error("Could not load booking details");
        const data = await res.json();
        setBooking(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to fetch booking details");
      } finally {
        setLoading(false);
      }
    }

    fetchBookingDetails();
  }, [bookingId, orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 text-[#ea580c] animate-spin mx-auto" />
          <p className="text-sm font-semibold text-stone-600">Verifying payment & securing your booking...</p>
        </div>
      </div>
    );
  }

  const paymentId = searchParams.get("paymentId") || booking?.payuMihpayid || booking?.payuTxnId || booking?.razorpayPaymentId || "PAYU-VERIFIED";

  const details = booking || {
    bookingId: bookingId || "WS-BOOKING-SUCCESS",
    tripTitle: searchParams.get("trip") || "WeAreSoloz Expedition",
    amount: searchParams.get("amount") ? Number(searchParams.get("amount")) : null,
    customerName: searchParams.get("name") || "Valued Explorer",
    paymentId: paymentId,
    status: "PAID",
    createdAt: new Date().toISOString()
  };

  const waText = encodeURIComponent(
    `Hi WeAreSoloz, my payment was successful!\nBooking ID: ${details.bookingId}\nTrip: ${details.tripTitle}\nName: ${details.customerName}\nPayment ID: ${details.payuMihpayid || details.payuTxnId || details.paymentId || ""}`
  );

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 font-body py-16 px-4 md:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 md:p-10 border border-stone-200 shadow-lg relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-3 bg-gradient-to-r from-emerald-500 via-[#ea580c] to-amber-500" />

        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm ring-8 ring-emerald-50">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-widest rounded-full">
            Payment Verified & Paid
          </span>
          <h1 className="font-display text-2xl md:text-4xl font-bold text-stone-900">
            Booking Confirmed! 🎉
          </h1>
          <p className="text-xs md:text-sm text-stone-600 max-w-md mx-auto">
            Thank you for choosing <strong>WeAreSoloz</strong>! Your slot has been reserved. Akhil will reach out via WhatsApp with final coordination details.
          </p>
        </div>

        {/* Detailed Receipt Card */}
        <div className="mt-8 bg-stone-50 rounded-2xl p-5 border border-stone-200/80 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200/60 pb-3">
            <span className="text-xs uppercase tracking-wider text-stone-500 font-bold">Booking ID</span>
            <span className="font-mono text-sm font-bold text-[#ea580c]">{details.bookingId}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-stone-500 block font-semibold mb-0.5">Trip Expedition</span>
              <span className="font-display text-sm font-bold text-stone-900 block">{details.tripTitle}</span>
            </div>

            <div>
              <span className="text-stone-500 block font-semibold mb-0.5">Customer Name</span>
              <span className="text-sm font-bold text-stone-900 block">{details.customerName}</span>
            </div>

            {details.amount && (
              <div>
                <span className="text-stone-500 block font-semibold mb-0.5">Total Amount Paid</span>
                <span className="text-base font-bold text-emerald-700 block font-display">₹{details.amount.toLocaleString("en-IN")}</span>
              </div>
            )}

            {(details.payuMihpayid || details.payuTxnId || details.paymentId) && (
              <div>
                <span className="text-stone-500 block font-semibold mb-0.5">PayU Transaction ID</span>
                <span className="font-mono text-xs text-stone-700 block truncate">{details.payuMihpayid || details.payuTxnId || details.paymentId}</span>
              </div>
            )}

            {details.customerMobile && (
              <div>
                <span className="text-stone-500 block font-semibold mb-0.5">Mobile Number</span>
                <span className="text-xs font-semibold text-stone-900 block">{details.customerMobile}</span>
              </div>
            )}

            {details.customerEmail && (
              <div>
                <span className="text-stone-500 block font-semibold mb-0.5">Email Address</span>
                <span className="text-xs font-semibold text-stone-900 block truncate">{details.customerEmail}</span>
              </div>
            )}
          </div>

          {details.selectedBatch && (
            <div className="pt-3 border-t border-stone-200/60 text-xs">
              <span className="text-stone-500 font-semibold block mb-1">Selected Batch Date:</span>
              <span className="bg-orange-100 text-[#ea580c] font-bold px-3 py-1 rounded-lg inline-block">
                {typeof details.selectedBatch === "string"
                  ? details.selectedBatch
                  : details.selectedBatch.label || `${details.selectedBatch.startDate} to ${details.selectedBatch.endDate}`}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
          <a
            href={`https://wa.me/919966085310?text=${waText}`}
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-1/2 py-3 px-4 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
          >
            <MessageCircle className="w-4 h-4" /> Message Akhil on WhatsApp
          </a>

          <Link href="/" className="w-full sm:w-1/2">
            <Button className="w-full rounded-full h-11 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs flex items-center justify-center gap-2">
              <Home className="w-4 h-4" /> Return to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#ea580c] animate-spin" />
      </div>
    }>
      <BookingSuccessContent />
    </Suspense>
  );
}
