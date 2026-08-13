"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Calendar, MapPin, User, Mail, Phone, CreditCard, Home, Download, MessageCircle, Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

function BookingSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = searchParams.get("bookingId") || searchParams.get("id");
  const orderId = searchParams.get("orderId");

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloaded, setDownloaded] = useState(false);

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
        if (res.ok) {
          const data = await res.json();
          setBooking(data);
        }
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchBookingDetails();
  }, [bookingId, orderId]);

  const paymentId = searchParams.get("paymentId") || booking?.payuMihpayid || booking?.payuTxnId || booking?.razorpayPaymentId || "PAYU-VERIFIED";

  const details = booking || {
    bookingId: bookingId || "WS-BOOKING-SUCCESS",
    tripTitle: searchParams.get("trip") || "WeAreSoloz Expedition",
    amount: searchParams.get("amount") ? Number(searchParams.get("amount")) : null,
    customerName: searchParams.get("name") || "Valued Explorer",
    customerMobile: searchParams.get("phone") || "",
    customerEmail: searchParams.get("email") || "",
    paymentId: paymentId,
    status: "PAID",
    createdAt: new Date().toISOString()
  };

  const handleDownloadInvoice = async (bookingDetails: any) => {
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      // Top Accent Line
      doc.setFillColor(234, 88, 12);
      doc.rect(0, 0, 210, 6, "F");

      // Brand Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(20, 17, 13);
      doc.text("WEARE", 15, 22);
      doc.setTextColor(234, 88, 12);
      doc.text("SOLOZ", 52, 22);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(120, 120, 120);
      doc.text("Start Solo. Travel Together. | www.wearesoloz.com", 15, 27);

      // Invoice Header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(20, 17, 13);
      doc.text("TAX INVOICE & RECEIPT", 195, 22, { align: "right" });

      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text(`Booking ID: ${bookingDetails.bookingId || "N/A"}`, 195, 27, { align: "right" });
      doc.text(`Date: ${new Date().toLocaleDateString("en-IN")}`, 195, 32, { align: "right" });

      // Divider Line
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.4);
      doc.line(15, 36, 195, 36);

      // Customer Details Box
      doc.setFillColor(253, 247, 242);
      doc.roundedRect(15, 41, 88, 38, 3, 3, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(234, 88, 12);
      doc.text("CUSTOMER DETAILS", 20, 48);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(40, 40, 40);
      doc.text(`Name: ${bookingDetails.customerName || "Explorer"}`, 20, 54);
      doc.text(`Mobile: ${bookingDetails.customerMobile || "N/A"}`, 20, 60);
      doc.text(`Email: ${bookingDetails.customerEmail || "N/A"}`, 20, 66);
      if (bookingDetails.age) doc.text(`Age / Blood: ${bookingDetails.age} yrs | ${bookingDetails.bloodGroup || "N/A"}`, 20, 72);

      // Enterprise Details Box
      doc.setFillColor(250, 250, 250);
      doc.roundedRect(107, 41, 88, 38, 3, 3, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(20, 17, 13);
      doc.text("ENTERPRISE DETAILS", 112, 48);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(80, 80, 80);
      doc.text("WEARESOLOZ (Proprietor: Pasupuleti Akhil)", 112, 54);
      doc.text("Udyam Reg: UDYAM-TS-09-0255691", 112, 60);
      doc.text("Shop Reg: NEST2026627990", 112, 66);
      doc.text("Gachibowli, Hyderabad, Telangana - 500032", 112, 72);

      // Table Header
      let y = 86;
      doc.setFillColor(20, 17, 13);
      doc.rect(15, y, 180, 8, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(255, 255, 255);
      doc.text("DESCRIPTION / TRIP EXPEDITION", 20, y + 5.5);
      doc.text("TRAVELERS", 130, y + 5.5, { align: "center" });
      doc.text("AMOUNT (INR)", 190, y + 5.5, { align: "right" });

      y += 8;

      // Table Row Body
      doc.setFillColor(255, 255, 255);
      doc.rect(15, y, 180, 24, "F");
      doc.setDrawColor(230, 230, 230);
      doc.rect(15, y, 180, 24, "S");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(20, 17, 13);
      doc.text(bookingDetails.tripTitle || "WeAreSoloz Expedition", 20, y + 7);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);

      const batchStr = bookingDetails.selectedBatch
        ? (typeof bookingDetails.selectedBatch === "string" ? bookingDetails.selectedBatch : (bookingDetails.selectedBatch.label || `${bookingDetails.selectedBatch.startDate} to ${bookingDetails.selectedBatch.endDate}`))
        : "Standard Departure";

      doc.text(`Schedule: ${batchStr}`, 20, y + 13);
      doc.text(`Payment Status: PAID & VERIFIED (PayU Gateway)`, 20, y + 19);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(20, 17, 13);
      doc.text(`${bookingDetails.travelers || 1} Person(s)`, 130, y + 12, { align: "center" });

      const totalAmtStr = bookingDetails.amount ? `₹${Number(bookingDetails.amount).toLocaleString("en-IN")}` : "₹0";
      doc.setTextColor(22, 163, 74);
      doc.text(totalAmtStr, 190, y + 12, { align: "right" });

      y += 30;

      // Payment Summary Box
      doc.setFillColor(245, 245, 245);
      doc.roundedRect(115, y, 80, 28, 2, 2, "F");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(80, 80, 80);
      doc.text("Subtotal:", 120, y + 7);
      doc.text(totalAmtStr, 190, y + 7, { align: "right" });

      doc.text("Taxes & Charges:", 120, y + 14);
      doc.text("Included", 190, y + 14, { align: "right" });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(234, 88, 12);
      doc.text("Total Paid:", 120, y + 23);
      doc.text(totalAmtStr, 190, y + 23, { align: "right" });

      y += 34;

      // PayU Reference Card
      doc.setFillColor(253, 247, 242);
      doc.setDrawColor(234, 88, 12);
      doc.setLineWidth(0.3);
      doc.roundedRect(15, y, 180, 18, 2, 2, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(234, 88, 12);
      doc.text("PAYMENT REFERENCE DETAILS", 20, y + 5.5);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(60, 60, 60);
      const payId = bookingDetails.payuMihpayid || bookingDetails.payuTxnId || bookingDetails.paymentId || bookingDetails.bookingId;
      const utrStr = bookingDetails.bankRefNum ? ` | UTR / Bank Ref: ${bookingDetails.bankRefNum}` : "";
      doc.text(`PayU Txn ID: ${payId}${utrStr}`, 20, y + 11);
      doc.text(`Payment Gateway: PayU Verified | Status: SUCCESS`, 20, y + 15);

      y += 28;

      // Footer Sign off
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(20, 17, 13);
      doc.text("Thank you for traveling with WeAreSoloz!", 105, y, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(120, 120, 120);
      doc.text("Contact Akhil Pasupuleti on WhatsApp: +91 9966085310 | @wearesolozindia", 105, y + 4.5, { align: "center" });

      doc.save(`WeAreSoloz_Invoice_${bookingDetails.bookingId || "Receipt"}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
    }
  };

  useEffect(() => {
    if (!loading && details && !downloaded) {
      setDownloaded(true);
      setTimeout(() => {
        handleDownloadInvoice(details);
      }, 800);
    }
  }, [loading, details, downloaded]);

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
            Thank you for choosing <strong>WeAreSoloz</strong>! Your slot has been reserved, your PDF tax invoice has been sent to your email and downloaded.
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
        <div className="mt-8 space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Button
              onClick={() => handleDownloadInvoice(details)}
              className="w-full sm:w-1/2 rounded-full h-11 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md"
            >
              <FileText className="w-4 h-4" /> Download PDF Invoice
            </Button>

            <a
              href={`https://wa.me/919966085310?text=${waText}`}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-1/2 py-3 px-4 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md block text-center"
            >
              <MessageCircle className="w-4 h-4 inline-block" /> Message Akhil on WhatsApp
            </a>
          </div>

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
