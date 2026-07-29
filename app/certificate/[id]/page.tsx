"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { 
  Download, 
  Share2, 
  CheckCircle, 
  Loader2, 
  Sparkles,
  ArrowLeft,
  ShieldCheck,
  Compass,
  Users,
  Camera,
  Mountain
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

      // Background Canvas (Warm Cream)
      doc.setFillColor(252, 250, 245);
      doc.rect(0, 0, pageWidth, pageHeight, "F");

      // Orange Brush Accents & Border Frame
      doc.setDrawColor(234, 88, 12);
      doc.setLineWidth(1.5);
      doc.rect(8, 8, pageWidth - 16, pageHeight - 16, "S");

      doc.setDrawColor(217, 119, 6);
      doc.setLineWidth(0.5);
      doc.rect(10, 10, pageWidth - 20, pageHeight - 20, "S");

      // WeAreSoloZ Official Logo
      try {
        const logoImg = await new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new window.Image();
          img.onload = () => resolve(img);
          img.onerror = (e) => reject(e);
          img.src = "/logo.png";
        });
        doc.addImage(logoImg, "PNG", pageWidth / 2 - 10, 16, 20, 20);
      } catch (e) {}

      // Brand Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(234, 88, 12);
      doc.text("WEARESOLOZ", pageWidth / 2, 41, { align: "center" });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(100, 100, 100);
      doc.text("TRAVEL SOLO. YOU'RE NOT ALONE.", pageWidth / 2, 46, { align: "center" });

      // Title
      doc.setFont("times", "bold");
      doc.setFontSize(26);
      doc.setTextColor(24, 24, 27);
      doc.text("CERTIFICATE", pageWidth / 2, 60, { align: "center" });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(234, 88, 12);
      doc.text("— OF MEMORIES —", pageWidth / 2, 68, { align: "center" });

      // Presentation
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9.5);
      doc.setTextColor(120, 120, 120);
      doc.text("Proudly presented to", pageWidth / 2, 77, { align: "center" });

      // Traveler Name
      doc.setFont("times", "bolditalic");
      doc.setFontSize(28);
      doc.setTextColor(234, 88, 12);
      doc.text(cert.fullName, pageWidth / 2, 92, { align: "center" });

      // Underline
      doc.setDrawColor(234, 88, 12);
      doc.setLineWidth(0.8);
      doc.line(pageWidth / 2 - 45, 96, pageWidth / 2 + 45, 96);

      // Citation Paragraph
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(60, 60, 60);
      doc.text(`for being an amazing part of our ${cert.trip.title} journey.`, pageWidth / 2, 106, { align: "center" });
      doc.text("The world is wide, but the memories we create together make every place feel like home.", pageWidth / 2, 112, { align: "center" });

      // 4 Features Bar (Icons Text)
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.3);
      doc.line(20, 122, pageWidth - 20, 122);
      doc.line(20, 140, pageWidth - 20, 140);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(234, 88, 12);
      doc.text("NEW PLACES EXPLORED", 50, 131, { align: "center" });
      doc.text("CONNECTIONS MADE", 110, 131, { align: "center" });
      doc.text("MEMORIES CREATED", 175, 131, { align: "center" });
      doc.text("ADVENTURES LIVED", 240, 131, { align: "center" });

      // Footer Row
      const footY = 160;

      // Certificate ID
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(120, 120, 120);
      doc.text("CERTIFICATE ID", 45, footY);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(24, 24, 27);
      doc.text(cert.certificateId, 45, footY + 5);

      // Issued On
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(120, 120, 120);
      doc.text("ISSUED ON", 135, footY);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(24, 24, 27);
      doc.text(new Date(cert.trip.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }), 135, footY + 5);

      // Signature (Akhil)
      doc.setFont("times", "bolditalic");
      doc.setFontSize(16);
      doc.setTextColor(24, 24, 27);
      doc.text("Akhil", 205, footY - 1);
      doc.setDrawColor(120, 120, 120);
      doc.line(190, footY + 1, 230, footY + 1);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(120, 120, 120);
      doc.text("FOUNDER / Pasupuleti Akhil", 210, footY + 6, { align: "center" });

      // Official Badge Seal
      const sealX = pageWidth - 35;
      const sealY = footY + 2;

      doc.setFillColor(234, 88, 12);
      doc.circle(sealX, sealY, 12, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6);
      doc.setTextColor(255, 255, 255);
      doc.text("OFFICIAL", sealX, sealY - 1, { align: "center" });
      doc.text("TRAVELER", sealX, sealY + 3, { align: "center" });

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

  return (
    <div className="min-h-screen bg-[#f5f2eb] text-stone-900 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="border-b border-stone-300 bg-white/90 backdrop-blur-md sticky top-0 z-50 px-4 py-3 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-stone-600 hover:text-[#ea580c] transition-all text-xs font-bold">
            <ArrowLeft size={16} /> Back to WeAreSoloZ
          </Link>
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="SoloZ" className="w-7 h-7 rounded-full object-cover shadow-sm border border-[#ea580c]" />
            <span className="font-extrabold text-sm tracking-tight text-stone-900">WeAreSoloZ</span>
          </div>
          <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-300 px-3 py-1 rounded-full text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
            <ShieldCheck size={14} /> Verified Certificate
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl mx-auto w-full p-4 sm:p-8 space-y-8">
        {/* Banner Alert */}
        <div className="rounded-2xl bg-gradient-to-r from-[#ea580c] via-orange-600 to-amber-600 text-white p-5 sm:p-6 text-center space-y-2 shadow-xl relative overflow-hidden">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/20 border border-white/30 text-white text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md">
            <Sparkles size={12} /> Official Achievement Award
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Congratulations, {cert.fullName}! 🎉
          </h1>
          <p className="text-xs sm:text-sm text-orange-100 max-w-xl mx-auto font-medium">
            You have officially conquered the <strong className="text-white underline">{cert.trip.title}</strong> expedition. Here is your verified Certificate of Memories!
          </p>
        </div>

        {/* 1:1 REPLICATED LUXURY CERTIFICATE CARD */}
        <div className="relative rounded-2xl bg-[#fdfcf9] border-[3px] border-[#ea580c] p-6 sm:p-12 shadow-2xl space-y-8 text-center overflow-hidden">
          
          {/* Top Brush Stroke Accents (Orange & Dark Theme) */}
          <div className="absolute top-0 left-0 w-36 sm:w-64 h-12 bg-[#ea580c] rounded-br-full opacity-90 pointer-events-none" />
          <div className="absolute top-0 left-0 w-28 sm:w-48 h-8 bg-stone-900 rounded-br-full opacity-80 pointer-events-none" />

          {/* Top Flight Trail & Pin Graphic (Right Side) */}
          <div className="absolute top-4 right-8 flex items-center gap-1 text-[#ea580c] opacity-80 pointer-events-none">
            <span className="text-xs font-mono">✈ ... 📍</span>
          </div>

          {/* Header Branding with Official Logo */}
          <div className="flex flex-col items-center justify-center space-y-2 pt-2 relative z-10">
            <img src="/logo.png" alt="WeAreSoloZ Logo" className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover shadow-lg border-2 border-[#ea580c]" />
            <div className="text-sm font-extrabold tracking-widest text-[#ea580c] uppercase">WEARESOLOZ</div>
            <div className="inline-block px-3 py-0.5 rounded-full bg-stone-900 text-white text-[9px] font-bold uppercase tracking-wider">
              Travel Solo. <span className="text-[#ea580c]">You're Not Alone.</span>
            </div>
          </div>

          {/* Certificate Main Title */}
          <div className="space-y-1 relative z-10 pt-2">
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-wider text-stone-900 uppercase">
              CERTIFICATE
            </h2>
            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-0.5 bg-[#ea580c]" />
              <h3 className="text-base sm:text-xl font-extrabold tracking-widest text-[#ea580c] uppercase">
                OF MEMORIES
              </h3>
              <div className="w-12 h-0.5 bg-[#ea580c]" />
            </div>
            <p className="text-xs text-stone-500 italic font-serif pt-2">
              Proudly presented to
            </p>
          </div>

          {/* Recipient Name */}
          <div className="py-2 relative z-10">
            <div className="text-3xl sm:text-5xl font-extrabold font-serif text-[#ea580c] tracking-wide uppercase drop-shadow-sm inline-block relative">
              {cert.fullName}
              <div className="w-full h-1 bg-gradient-to-r from-transparent via-[#ea580c] to-transparent mt-1 rounded-full" />
            </div>
          </div>

          {/* Citation Body */}
          <div className="max-w-xl mx-auto space-y-1 text-stone-700 text-xs sm:text-sm font-medium leading-relaxed relative z-10">
            <p>for being an amazing part of our <strong className="text-stone-900 font-extrabold">{cert.trip.title}</strong> journey.</p>
            <p className="text-stone-500 italic text-xs">The world is wide, but the memories we create together make every place feel like home.</p>
          </div>

          {/* 4 Feature Columns Grid */}
          <div className="py-4 border-y border-stone-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center relative z-10 bg-white/50 rounded-xl p-4">
            <div className="flex flex-col items-center space-y-1">
              <div className="w-8 h-8 rounded-full bg-orange-100 text-[#ea580c] flex items-center justify-center">
                <Compass size={18} />
              </div>
              <span className="text-[10px] font-extrabold uppercase text-stone-800 tracking-wider">NEW PLACES EXPLORED</span>
            </div>

            <div className="flex flex-col items-center space-y-1 sm:border-l sm:border-stone-200">
              <div className="w-8 h-8 rounded-full bg-orange-100 text-[#ea580c] flex items-center justify-center">
                <Users size={18} />
              </div>
              <span className="text-[10px] font-extrabold uppercase text-stone-800 tracking-wider">CONNECTIONS MADE</span>
            </div>

            <div className="flex flex-col items-center space-y-1 sm:border-l sm:border-stone-200">
              <div className="w-8 h-8 rounded-full bg-orange-100 text-[#ea580c] flex items-center justify-center">
                <Camera size={18} />
              </div>
              <span className="text-[10px] font-extrabold uppercase text-stone-800 tracking-wider">MEMORIES CREATED</span>
            </div>

            <div className="flex flex-col items-center space-y-1 sm:border-l sm:border-stone-200">
              <div className="w-8 h-8 rounded-full bg-orange-100 text-[#ea580c] flex items-center justify-center">
                <Mountain size={18} />
              </div>
              <span className="text-[10px] font-extrabold uppercase text-stone-800 tracking-wider">ADVENTURES LIVED</span>
            </div>
          </div>

          {/* Footer Information Row */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-6 text-left relative z-10">
            {/* QR Code Verification Box */}
            <div className="flex items-center gap-3">
              <img src={qrCodeUrl} alt="QR Code" className="w-16 h-16 rounded border border-stone-300 p-1 bg-white shadow-sm" />
              <div>
                <span className="block text-[9px] uppercase font-bold text-stone-500">Scan to verify</span>
                <span className="text-[10px] font-extrabold text-[#ea580c] uppercase tracking-wider">Official Certificate</span>
              </div>
            </div>

            {/* Certificate ID */}
            <div>
              <span className="block text-[9px] uppercase font-bold text-stone-500">Certificate ID</span>
              <span className="text-xs font-mono font-extrabold text-stone-900">{cert.certificateId}</span>
            </div>

            {/* Issued On */}
            <div>
              <span className="block text-[9px] uppercase font-bold text-stone-500">Issued On</span>
              <span className="text-xs font-bold text-stone-900">{new Date(cert.trip.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
            </div>

            {/* Founder Signature */}
            <div className="text-center sm:text-left">
              <div className="font-serif italic text-xl font-extrabold text-stone-900">Akhil</div>
              <div className="w-24 h-0.5 bg-stone-300 mx-auto sm:mx-0 my-0.5" />
              <div className="text-[9px] font-extrabold uppercase text-stone-900">FOUNDER</div>
              <div className="text-[9px] text-[#ea580c] font-bold">Pasupuleti Akhil</div>
            </div>

            {/* Official Badge Seal */}
            <div className="w-20 h-20 rounded-full border-2 border-[#ea580c] bg-stone-900 text-white p-2 flex flex-col items-center justify-center text-center shadow-lg rotate-[-6deg]">
              <span className="text-[7px] font-extrabold tracking-widest text-[#ea580c] uppercase">OFFICIAL</span>
              <span className="text-[8px] font-extrabold uppercase text-white">TRAVELER</span>
              <span className="text-[6px] text-stone-400 font-mono">WEARESOLOZ</span>
            </div>
          </div>

          {/* Bottom Brush Border */}
          <div className="absolute bottom-0 right-0 w-48 h-8 bg-[#ea580c] rounded-tl-full opacity-80 pointer-events-none" />
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
