import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, FileText, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms & Conditions | WeAreSoloz",
  description: "Terms and conditions for booking trips and services with WeAreSoloz.",
};

export default function TermsAndConditionsPage() {
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
          <div className="p-3 bg-orange-100 text-[#ea580c] rounded-2xl">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-stone-900">
              Terms & Conditions
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">Last Updated: August 2026</p>
          </div>
        </div>

        <div className="prose prose-stone max-w-none space-y-6 text-sm text-stone-700 leading-relaxed mt-8 border-t border-stone-100 pt-6">
          <p>
            Welcome to <strong>WeAreSoloz</strong> (operated by Pasupuleti Akhil, UDYAM-TS-09-0255691). By booking any trip, tour package, or utilizing our services on wearesoloz.com, you agree to comply with and be bound by the following terms and conditions.
          </p>

          <h3 className="font-display text-lg font-bold text-stone-900">1. Booking & Payments</h3>
          <p>
            All bookings are confirmed upon receipt of valid payment through our authorized payment gateway (PayU) or official booking channels. Full payment or the stipulated advance amount must be cleared before the trip departure.
          </p>

          <h3 className="font-display text-lg font-bold text-stone-900">2. Travel Responsibility & Health</h3>
          <p>
            Travelers must be physically and mentally fit for outdoor treks and adventure activities. Travelers are required to disclose any pre-existing health conditions prior to joining the expedition.
          </p>

          <h3 className="font-display text-lg font-bold text-stone-900">3. Transport & Exclusions</h3>
          <p>
            Unless explicitly mentioned in the itinerary, long-distance train/flight tickets from your home location to the designated assembly point are <strong>not included</strong> in the trip cost. All travelers must reach the meeting point independently.
          </p>

          <h3 className="font-display text-lg font-bold text-stone-900">4. Code of Conduct</h3>
          <p>
            WeAreSoloz promotes inclusive, respectful, and safe group travel experiences. Any behavior compromising group safety, harassment, or illegal substance usage will result in immediate termination from the trip without refund.
          </p>

          <h3 className="font-display text-lg font-bold text-stone-900">5. Changes & Itinerary Modifications</h3>
          <p>
            WeAreSoloz reserves the right to alter itineraries due to weather conditions, landslides, road blockages, government regulations, or force majeure events to ensure traveler safety.
          </p>

          <h3 className="font-display text-lg font-bold text-stone-900">6. Merchant Information</h3>
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 text-xs font-mono space-y-1">
            <p><strong>Enterprise Name:</strong> WEARESOLOZ</p>
            <p><strong>Proprietor:</strong> Pasupuleti Akhil</p>
            <p><strong>Udyam Registration:</strong> UDYAM-TS-09-0255691</p>
            <p><strong>Registered Address:</strong> Plot no. 395, Ayan Nilayam, TNGO colony phase-2, Gachibowli, Serilingampally, Ranga Reddy District, Telangana - 500032</p>
            <p><strong>Support Email:</strong> travel@wearesoloz.com | praneethbadugu7781@gmail.com</p>
            <p><strong>Support Phone:</strong> +91 9966085310 / +91 9281017746</p>
          </div>
        </div>
      </div>
    </div>
  );
}
