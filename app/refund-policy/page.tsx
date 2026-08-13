import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { RefreshCw, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy | WeAreSoloz",
  description: "Refund and cancellation guidelines for bookings with WeAreSoloz.",
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 font-body py-16 px-6 md:px-12">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 md:p-12 border border-stone-200 shadow-sm">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#ea580c] uppercase tracking-wider mb-8 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-amber-100 text-amber-700 rounded-2xl">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-stone-900">
              Refund & Cancellation Policy
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">Last Updated: August 2026</p>
          </div>
        </div>

        <div className="prose prose-stone max-w-none space-y-6 text-sm text-stone-700 leading-relaxed mt-8 border-t border-stone-100 pt-6">
          <p>
            Thank you for booking your trip with <strong>WeAreSoloz</strong>. We strive to provide transparent and fair cancellation and refund guidelines.
          </p>

          <h3 className="font-display text-lg font-bold text-stone-900">1. Customer Initiated Cancellations</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Cancellation 15 days or more before departure:</strong> 90% refund of total booking amount (10% retained for administrative charges).</li>
            <li><strong>Cancellation 7 to 14 days before departure:</strong> 50% refund of total booking amount.</li>
            <li><strong>Cancellation less than 7 days before departure:</strong> No refund will be issued as accommodation and transport allocations are locked.</li>
          </ul>

          <h3 className="font-display text-lg font-bold text-stone-900">2. Trip Rescheduling / Transfer</h3>
          <p>
            If you are unable to attend, you may transfer your seat to a friend or family member at least 48 hours prior to trip departure at no extra charge by notifying Akhil via WhatsApp or email.
          </p>

          <h3 className="font-display text-lg font-bold text-stone-900">3. Cancellations by WeAreSoloz</h3>
          <p>
            If a trip is cancelled by WeAreSoloz due to unavoidable natural disasters, severe weather conditions, or unforeseen safety issues, travelers will receive a <strong>100% full refund</strong> or a credit voucher valid for any future trip within 12 months.
          </p>

          <h3 className="font-display text-lg font-bold text-stone-900">4. Processing Time for Refunds</h3>
          <p>
            Eligible refunds are credited back to the original source of payment (bank account/card/UPI via PayU) within <strong>5 to 7 business days</strong> from the date of approval.
          </p>

          <h3 className="font-display text-lg font-bold text-stone-900">5. How to Request a Refund</h3>
          <p>
            To request a cancellation or refund, please email <strong>travel@wearesoloz.com</strong> or send a message on WhatsApp to <strong>+91 9966085310</strong> with your Booking ID and payment receipt.
          </p>
        </div>
      </div>
    </div>
  );
}
