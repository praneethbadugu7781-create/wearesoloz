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

      // Permanent Master PNG Template Background
      const templateImg = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new window.Image();
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(e);
        img.src = "/images/master_certificate_template_clean.png";
      });

      doc.addImage(templateImg, "PNG", 0, 0, pageWidth, pageHeight);

      // Dynamic Layer 1: Traveler Name (With Auto-Scaling Font Size)
      let nameFontSize = 28;
      if (cert.fullName.length > 35) nameFontSize = 18;
      else if (cert.fullName.length > 25) nameFontSize = 22;

      doc.setFont("times", "bolditalic");
      doc.setFontSize(nameFontSize);
      doc.setTextColor(24, 24, 27);
      doc.text(cert.fullName, pageWidth / 2, 101, { align: "center" });

      // Dynamic Layer 2: Certificate ID
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(24, 24, 27);
      doc.text(cert.certificateId, 84, 178, { align: "center" });

      // Dynamic Layer 3: Issue Date
      const formattedDate = new Date(cert.trip.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(24, 24, 27);
      doc.text(formattedDate, 189, 178, { align: "center" });

      // Dynamic Layer 4: Verification QR Code
      try {
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(window.location.href)}`;
        const qrImg = await new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new window.Image();
          img.crossOrigin = "anonymous";
          img.onload = () => resolve(img);
          img.onerror = (e) => reject(e);
          img.src = qrUrl;
        });
        doc.addImage(qrImg, "PNG", 22, 160, 20, 20);
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

  const getNameFontSizeClass = (name: string) => {
    if (name.length > 35) return "text-xl sm:text-2xl md:text-3xl";
    if (name.length > 25) return "text-2xl sm:text-3xl md:text-4xl";
    return "text-3xl sm:text-5xl md:text-6xl";
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
  const nameFontSizeClass = getNameFontSizeClass(cert.fullName);

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

        {/* PERMANENT MASTER CANVA-STYLE CERTIFICATE CONTAINER */}
        <div className="relative w-full max-w-4xl mx-auto aspect-[1536/1024] rounded-2xl shadow-2xl overflow-hidden border-2 border-stone-300 bg-[#faf4ec] select-none">
          
          {/* PERMANENT MASTER PNG BACKGROUND TEMPLATE */}
          <img 
            src="/images/master_certificate_template_clean.png" 
            alt="Master Certificate Template" 
            className="absolute inset-0 w-full h-full object-fill pointer-events-none"
          />

          {/* DYNAMIC FIELD 1: Traveler Name (Auto-scaled & centered) */}
          <div 
            className="absolute left-1/2 -translate-x-1/2 text-center pointer-events-none w-full px-6 flex items-center justify-center"
            style={{ top: "47.5%" }}
          >
            <span className={`font-serif italic font-extrabold text-[#18181b] tracking-wide drop-shadow-sm ${nameFontSizeClass}`}>
              {cert.fullName}
            </span>
          </div>

          {/* DYNAMIC FIELD 2: Certificate ID */}
          <div 
            className="absolute -translate-x-1/2 text-center pointer-events-none"
            style={{ top: "85.2%", left: "28.5%" }}
          >
            <span className="font-mono font-extrabold text-[10px] sm:text-xs md:text-sm text-stone-900">
              {cert.certificateId}
            </span>
          </div>

          {/* DYNAMIC FIELD 3: Issue Date */}
          <div 
            className="absolute -translate-x-1/2 text-center pointer-events-none"
            style={{ top: "85.2%", left: "63.8%" }}
          >
            <span className="font-bold text-[10px] sm:text-xs md:text-sm text-stone-900">
              {formattedDate}
            </span>
          </div>

          {/* DYNAMIC FIELD 4: Verification QR Code */}
          <div 
            className="absolute pointer-events-none"
            style={{ top: "87.8%", left: "11.5%", width: "7.8%", transform: "translate(-50%, -50%)" }}
          >
            <img 
              src={qrCodeUrl} 
              alt="QR Code Verification" 
              className="w-full h-full aspect-square object-contain bg-white p-0.5 rounded shadow-sm border border-stone-300"
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
