import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { Truck, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Shipping & Service Fulfillment Policy | WeAreSoloz",
  description: "Service fulfillment and ticket delivery information for WeAreSoloz travel bookings.",
};

export default function ShippingPolicyPage() {
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
          <div className="p-3 bg-blue-100 text-blue-700 rounded-2xl">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-stone-900">
              Shipping & Service Delivery Policy
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">Last Updated: August 2026</p>
          </div>
        </div>

        <div className="prose prose-stone max-w-none space-y-6 text-sm text-stone-700 leading-relaxed mt-8 border-t border-stone-100 pt-6">
          <p>
            As <strong>WeAreSoloz</strong> provides experiential group travel, treks, and tour packages, no physical goods are shipped. All travel services, passes, and confirmations are delivered digitally.
          </p>

          <h3 className="font-display text-lg font-bold text-stone-900">1. Instant Digital Confirmation</h3>
          <p>
            Upon successful payment completion via Razorpay, your digital Booking Confirmation and Booking ID are immediately generated online and sent via Email / WhatsApp within <strong>15 minutes</strong>.
          </p>

          <h3 className="font-display text-lg font-bold text-stone-900">2. Itinerary & Coordination Pass</h3>
          <p>
            Final trip assembly details, meeting points, guide contacts, and packing lists are shared with confirmed travelers <strong>48 hours before trip departure</strong> via dedicated WhatsApp group or email.
          </p>

          <h3 className="font-display text-lg font-bold text-stone-900">3. Certificates & Merchandise</h3>
          <p>
            Digital expedition completion certificates are issued upon finishing the trip. Physical merchandise (if applicable) is handed over directly at the assembly location.
          </p>
        </div>
      </div>
    </div>
  );
}
