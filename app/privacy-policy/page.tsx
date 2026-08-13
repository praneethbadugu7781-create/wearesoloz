import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | WeAreSoloz",
  description: "Privacy policy detailing how WeAreSoloz collects, stores, and protects user information.",
};

export default function PrivacyPolicyPage() {
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
          <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-stone-900">
              Privacy Policy
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">Last Updated: August 2026</p>
          </div>
        </div>

        <div className="prose prose-stone max-w-none space-y-6 text-sm text-stone-700 leading-relaxed mt-8 border-t border-stone-100 pt-6">
          <p>
            At <strong>WeAreSoloz</strong>, accessible from wearesoloz.com, your privacy is paramount. This Privacy Policy outlines the types of personal data we collect, how it is processed, and the security measures enforced.
          </p>

          <h3 className="font-display text-lg font-bold text-stone-900">1. Information We Collect</h3>
          <p>
            When you register for a trip or contact us, we may collect personal details including your Name, Mobile Number, Email Address, Age, Blood Group, Emergency Contact, and Payment Transaction IDs.
          </p>

          <h3 className="font-display text-lg font-bold text-stone-900">2. Payment Security</h3>
          <p>
            All online transactions are securely processed through <strong>PayU Payment Gateway</strong> using 256-bit SSL encryption. WeAreSoloz does not store your credit/debit card numbers, UPI PINs, or banking passwords on our servers.
          </p>

          <h3 className="font-display text-lg font-bold text-stone-900">3. Use of Information</h3>
          <p>
            Your information is used strictly to process trip bookings, issue travel waivers and certificates, send trip updates via WhatsApp/Email, and facilitate safety coordination during expeditions.
          </p>

          <h3 className="font-display text-lg font-bold text-stone-900">4. Third-Party Sharing</h3>
          <p>
            We do not sell, rent, or trade user information. Necessary traveler lists may be shared only with verified local guides, forest officials, or transport vendors solely for permit issuance and emergency coordination.
          </p>

          <h3 className="font-display text-lg font-bold text-stone-900">5. Contact Us</h3>
          <p>
            If you have questions regarding your data privacy, email us at <strong>travel@wearesoloz.com</strong> or call <strong>+91 9966085310</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
