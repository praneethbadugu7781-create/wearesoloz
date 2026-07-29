"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { 
  Download, 
  Share2, 
  Loader2, 
  Sparkles,
  ArrowLeft,
  ShieldCheck
} from "lucide-react";

interface CertificateData {
  certificateId: string;
  fullName: string;
  signedDate: string;
  certificateIssuedAt: string;
  trip: {
    title: string;
    destination: string;
    date: string;
    duration: string;
  };
}

export default function CertificatePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const certId = resolvedParams.id;

  const [cert, setCert] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [generatingPdf, setGeneratingPdf] = useState(false);

  useEffect(() => {
    fetchCertificate();
  }, [certId]);

  const fetchCertificate = async () => {
    setLoading(true);
    setError("");
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      let res = await fetch(`${API_URL}/certificates/${certId}`);
      if (!res.ok) {
        res = await fetch(`${API_URL}/public/certificates/${certId}`);
      }

      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error("Certificate not found or invalid Certificate ID.");
      }

      if (!res.ok) {
        throw new Error(data.error || "Certificate not found.");
      }

      setCert(data);
    } catch (err: any) {
      setError(err.message || "Failed to load certificate.");
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async () => {
    if (!cert) return;
    setGeneratingPdf(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4"
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Load Template Image Background
      const templateImg = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new window.Image();
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(e);
        img.src = "/images/certificate_template.png";
      });

      doc.addImage(templateImg, "PNG", 0, 0, pageWidth, pageHeight);

      // Clean Patch 1: Traveler Name Cover Box (Parchment Cream)
      doc.setFillColor(253, 250, 243);
      doc.rect(pageWidth / 2 - 60, 93, 120, 15, "F");

      // Traveler Name Text
      doc.setFont("times", "bolditalic");
      doc.setFontSize(26);
      doc.setTextColor(24, 24, 27);
      doc.text(cert.fullName, pageWidth / 2, 104, { align: "center" });

      // Clean Patch 2: Certificate ID Cover Box
      doc.setFillColor(253, 250, 243);
      doc.rect(65, 172, 38, 8, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(24, 24, 27);
      doc.text(cert.certificateId, 84, 177, { align: "center" });

      // Clean Patch 3: Issued Date Cover Box
      doc.setFillColor(253, 250, 243);
      doc.rect(170, 172, 38, 8, "F");

      const formattedDate = new Date(cert.trip.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(24, 24, 27);
      doc.text(formattedDate, 189, 177, { align: "center" });

      // Clean Patch 4: QR Code Cover & Render
      try {
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(window.location.href)}`;
        const qrImg = await new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new window.Image();
          img.crossOrigin = "anonymous";
          img.onload = () => resolve(img);
          img.onerror = (e) => reject(e);
          img.src = qrUrl;
        });
        doc.setFillColor(253, 250, 243);
        doc.rect(20, 156, 24, 24, "F");
        doc.addImage(qrImg, "PNG", 22, 158, 20, 20);
      } catch (e) {}

      doc.save(`Certificate_${cert.fullName.replace(/\s+/g, "_")}_${cert.certificateId}.pdf`);
    } catch (err: any) {
      console.error("PDF export error:", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleShareWhatsApp = () => {
    if (!cert) return;
    const text = encodeURIComponent(
      `🎓 I just completed the ${cert.trip.title} expedition with WeAreSoloZ! Check out my Official Certificate of Memories here: ${window.location.href} 🎒✨ #TravelSoloYoureNotAlone #WeAreSoloZ`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8f5] text-stone-900 flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-[#ea580c]" size={40} />
        <p className="text-xs uppercase tracking-wider text-stone-600 font-bold">Verifying Certificate Authenticity...</p>
      </div>
    );
  }

  if (error || !cert) {
    return (
      <div className="min-h-screen bg-[#faf8f5] text-stone-900 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4 text-red-500">
          <ShieldCheck size={32} />
        </div>
        <h1 className="text-2xl font-bold text-stone-900 mb-2">Certificate Not Found</h1>
        <p className="text-sm text-stone-600 max-w-md mb-6">{error || "The requested certificate ID is invalid or has not been issued yet."}</p>
        <Link 
          href="/" 
          className="px-6 py-2.5 rounded-xl bg-[#ea580c] hover:bg-[#ea580c]/90 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md"
        >
          Return to Home Page
        </Link>
      </div>
    );
  }

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`;
  const formattedDate = new Date(cert.trip.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div className="min-h-screen bg-[#f4f1eb] text-stone-900 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="border-b border-stone-300 bg-white/90 backdrop-blur-md sticky top-0 z-50 px-4 py-3 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-stone-600 hover:text-[#ea580c] transition-all text-xs font-bold">
            <ArrowLeft size={16} /> Back to WeAreSoloZ
          </Link>
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="SoloZ" className="w-8 h-8 rounded-full object-cover shadow-sm border border-[#ea580c]" />
            <span className="font-extrabold text-sm tracking-tight text-stone-900">WeAreSoloZ</span>
          </div>
          <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-300 px-3 py-1 rounded-full text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
            <ShieldCheck size={14} /> Verified Certificate
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl mx-auto w-full p-4 sm:p-8 space-y-6">
        {/* Banner Alert */}
        <div className="rounded-2xl bg-gradient-to-r from-[#ea580c] via-orange-600 to-amber-600 text-white p-5 text-center space-y-2 shadow-xl relative overflow-hidden">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/20 border border-white/30 text-white text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md">
            <Sparkles size={12} /> Official Achievement Award
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Congratulations, {cert.fullName}! 🎉
          </h1>
          <p className="text-xs sm:text-sm text-orange-100 max-w-xl mx-auto font-medium">
            You have officially conquered the <strong className="text-white underline">{cert.trip.title}</strong> expedition. Here is your official Certificate of Memories!
          </p>
        </div>

        {/* 100% EXACT TEMPLATE ARTWORK CONTAINER WITH DYNAMIC OVERLAYS */}
        <div className="relative w-full aspect-[1000/667] max-w-4xl mx-auto rounded-2xl shadow-2xl overflow-hidden border-2 border-stone-300 bg-[#fdfaf3]">
          {/* Base Template Image Artwork */}
          <img 
            src="/images/certificate_template.png" 
            alt="WeAreSoloZ Certificate of Memories" 
            className="w-full h-full object-fill select-none pointer-events-none"
          />

          {/* DYNAMIC OVERLAY 1: Traveler Name (With Cream Cover Patch) */}
          <div 
            className="absolute left-1/2 -translate-x-1/2 text-center pointer-events-none w-full px-4"
            style={{ top: "45%" }}
          >
            <div className="px-6 py-1 bg-[#fdfaf3] rounded-lg shadow-sm border border-amber-200/80 inline-block">
              <span className="font-serif italic font-extrabold text-[#18181b] text-2xl sm:text-4xl md:text-5xl tracking-wide drop-shadow-sm">
                {cert.fullName}
              </span>
            </div>
          </div>

          {/* DYNAMIC OVERLAY 2: Certificate ID (With Cover Patch) */}
          <div 
            className="absolute -translate-x-1/2 text-center pointer-events-none"
            style={{ bottom: "14.5%", left: "28.5%" }}
          >
            <div className="px-3 py-0.5 bg-[#fdfaf3] rounded font-mono font-extrabold text-[10px] sm:text-xs text-stone-900 border border-amber-200/80 shadow-sm">
              {cert.certificateId}
            </div>
          </div>

          {/* DYNAMIC OVERLAY 3: Issued On Date (With Cover Patch) */}
          <div 
            className="absolute -translate-x-1/2 text-center pointer-events-none"
            style={{ bottom: "14.5%", left: "63.5%" }}
          >
            <div className="px-3 py-0.5 bg-[#fdfaf3] rounded font-bold text-[10px] sm:text-xs text-stone-900 border border-amber-200/80 shadow-sm">
              {formattedDate}
            </div>
          </div>

          {/* DYNAMIC OVERLAY 4: Scannable QR Code (With Cover Patch) */}
          <div 
            className="absolute pointer-events-none"
            style={{ bottom: "8.5%", left: "7.4%", width: "7.8%" }}
          >
            <img 
              src={qrCodeUrl} 
              alt="QR Code Verification" 
              className="w-full h-full aspect-square object-contain bg-[#fdfaf3] p-1 rounded shadow-md border border-amber-200/80"
            />
          </div>

        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <button
            onClick={generatePDF}
            disabled={generatingPdf}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#ea580c] hover:bg-[#ea580c]/90 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#ea580c]/20 disabled:opacity-50"
          >
            {generatingPdf ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Generating High-Res PDF...
              </>
            ) : (
              <>
                <Download size={16} /> Download Certificate PDF
              </>
            )}
          </button>

          <button
            onClick={handleShareWhatsApp}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-600/20"
          >
            <Share2 size={16} /> Share on WhatsApp
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-300 py-6 text-center text-stone-600 text-xs bg-white">
        <p>© {new Date().getFullYear()} WeAreSoloZ India. All Rights Reserved. Govt Reg: UDYAM-TS-09-0255691</p>
      </footer>
    </div>
  );
}
