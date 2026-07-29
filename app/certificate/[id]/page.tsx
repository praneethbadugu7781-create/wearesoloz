"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { 
  Download, 
  Share2, 
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

      // Parchment Off-White Background
      doc.setFillColor(252, 250, 244);
      doc.rect(0, 0, pageWidth, pageHeight, "F");

      // Outer Orange Border Frame
      doc.setDrawColor(234, 88, 12);
      doc.setLineWidth(1.5);
      doc.rect(6, 6, pageWidth - 12, pageHeight - 12, "S");

      doc.setDrawColor(217, 119, 6);
      doc.setLineWidth(0.4);
      doc.rect(8, 8, pageWidth - 16, pageHeight - 16, "S");

      // WeAreSoloZ Header Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(24, 24, 27);
      doc.text("WeAre", pageWidth / 2 - 18, 26, { align: "right" });
      doc.setTextColor(234, 88, 12);
      doc.text("SoloZ", pageWidth / 2 - 16, 26, { align: "left" });

      // Tagline Pill Background
      doc.setFillColor(24, 24, 27);
      doc.roundedRect(pageWidth / 2 - 32, 30, 64, 6, 3, 3, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      doc.setTextColor(255, 255, 255);
      doc.text("TRAVEL SOLO. ", pageWidth / 2 - 4, 34, { align: "right" });
      doc.setTextColor(234, 88, 12);
      doc.text("YOU'RE NOT ALONE.", pageWidth / 2 - 2, 34, { align: "left" });

      // Main Certificate Header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(26);
      doc.setTextColor(24, 24, 27);
      doc.text("CERTIFICATE", pageWidth / 2, 50, { align: "center" });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(234, 88, 12);
      doc.text("— OF MEMORIES —", pageWidth / 2, 58, { align: "center" });

      // Presentation
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9.5);
      doc.setTextColor(120, 113, 108);
      doc.text("Proudly presented to", pageWidth / 2, 67, { align: "center" });

      // Traveler Name
      doc.setFont("times", "bolditalic");
      doc.setFontSize(30);
      doc.setTextColor(24, 24, 27);
      doc.text(cert.fullName, pageWidth / 2, 83, { align: "center" });

      // Orange Brush Line Underneath
      doc.setDrawColor(234, 88, 12);
      doc.setLineWidth(1);
      doc.line(pageWidth / 2 - 45, 87, pageWidth / 2 + 45, 87);

      // Citation Paragraph
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(70, 70, 70);
      doc.text(`for being an amazing part of our ${cert.trip.title} journey.`, pageWidth / 2, 97, { align: "center" });
      doc.text("The world is wide, but the memories we create together make every place feel like home.", pageWidth / 2, 103, { align: "center" });

      // 4 Highlight Columns Grid
      doc.setDrawColor(220, 215, 205);
      doc.setLineWidth(0.3);
      doc.line(20, 114, pageWidth - 20, 114);
      doc.line(20, 134, pageWidth - 20, 134);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(234, 88, 12);
      doc.text("NEW PLACES EXPLORED", 50, 125, { align: "center" });
      doc.text("CONNECTIONS MADE", 110, 125, { align: "center" });
      doc.text("MEMORIES CREATED", 175, 125, { align: "center" });
      doc.text("ADVENTURES LIVED", 240, 125, { align: "center" });

      // Footer Information
      const footY = 158;

      // QR Code
      try {
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(window.location.href)}`;
        const qrImg = await new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new window.Image();
          img.crossOrigin = "anonymous";
          img.onload = () => resolve(img);
          img.onerror = (e) => reject(e);
          img.src = qrUrl;
        });
        doc.addImage(qrImg, "PNG", 18, 150, 18, 18);
      } catch (e) {}

      doc.setFont("helvetica", "bold");
      doc.setFontSize(6);
      doc.setTextColor(120, 113, 108);
      doc.text("Scan to verify this certificate", 27, 172, { align: "center" });

      // Certificate ID
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(234, 88, 12);
      doc.text("CERTIFICATE ID", 65, footY);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(24, 24, 27);
      doc.text(cert.certificateId, 65, footY + 5);

      // Issued On
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(234, 88, 12);
      doc.text("ISSUED ON", 170, footY);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(24, 24, 27);
      const formattedDate = new Date(cert.trip.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
      doc.text(formattedDate, 170, footY + 5);

      // Signature (Akhil)
      doc.setFont("times", "bolditalic");
      doc.setFontSize(16);
      doc.setTextColor(24, 24, 27);
      doc.text("Akhil", 215, footY - 1);
      doc.setDrawColor(120, 113, 108);
      doc.line(200, footY + 1, 235, footY + 1);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(24, 24, 27);
      doc.text("FOUNDER", 217.5, footY + 5, { align: "center" });
      doc.setFontSize(6.5);
      doc.setTextColor(234, 88, 12);
      doc.text("Pasupuleti Akhil", 217.5, footY + 8.5, { align: "center" });

      // Official Badge Seal (Serrated Orange Badge)
      const sealX = pageWidth - 26;
      const sealY = footY + 2;
      doc.setFillColor(234, 88, 12);
      doc.circle(sealX, sealY, 11, "F");
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

        {/* PURE REACT / TAILWIND CERTIFICATE OF MEMORIES CARD (100% NATIVE REPLICA) */}
        <div className="relative w-full max-w-4xl mx-auto aspect-[1000/667] rounded-2xl shadow-2xl overflow-hidden border-[3px] border-[#ea580c] bg-[#fcfaf4] p-6 sm:p-12 flex flex-col justify-between text-center select-none">
          
          {/* Top Left Dynamic Orange & Black Splash Art */}
          <div className="absolute top-0 left-0 w-48 sm:w-80 h-16 sm:h-24 bg-[#ea580c] -skew-y-6 -translate-x-10 -translate-y-8 pointer-events-none opacity-90" />
          <div className="absolute top-0 left-0 w-40 sm:w-64 h-12 sm:h-16 bg-stone-900 -skew-y-6 -translate-x-8 -translate-y-6 pointer-events-none opacity-80" />

          {/* Top Right Flight Trail & Flight Icon */}
          <div className="absolute top-6 right-10 flex items-center gap-1.5 text-stone-400 pointer-events-none">
            <span className="text-xs font-mono tracking-widest text-[#ea580c]">✈ - - - - 📍</span>
          </div>

          {/* Top Header Logo & Tagline */}
          <div className="relative z-10 flex flex-col items-center space-y-1.5 pt-1">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="WeAreSoloZ Logo" className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover shadow-md border-2 border-[#ea580c]" />
              <div className="text-2xl sm:text-4xl font-extrabold tracking-tight text-stone-900">
                We<span className="text-[#ea580c]">Are</span>SoloZ
              </div>
            </div>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-stone-900 text-white text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider">
              Travel Solo.&nbsp;<span className="text-[#ea580c]">You're Not Alone.</span>
            </div>
          </div>

          {/* Certificate Main Titles */}
          <div className="relative z-10 space-y-1 my-auto">
            <h2 className="text-3xl sm:text-5xl font-black tracking-widest text-stone-900 uppercase">
              CERTIFICATE
            </h2>
            <div className="flex items-center justify-center gap-3">
              <div className="w-12 sm:w-20 h-0.5 bg-[#ea580c]" />
              <h3 className="text-base sm:text-xl font-extrabold tracking-widest text-[#ea580c] uppercase">
                — OF MEMORIES —
              </h3>
              <div className="w-12 sm:w-20 h-0.5 bg-[#ea580c]" />
            </div>

            <p className="text-xs sm:text-sm text-stone-500 italic font-serif pt-2">
              Proudly presented to
            </p>

            {/* Traveler Name with Brush Stroke Underline */}
            <div className="py-2 relative inline-block max-w-full">
              <div className="font-serif italic font-extrabold text-[#ea580c] text-3xl sm:text-5xl md:text-6xl tracking-wide drop-shadow-sm px-4">
                {cert.fullName}
              </div>
              <div className="w-full h-1 sm:h-1.5 bg-gradient-to-r from-transparent via-[#ea580c] to-transparent rounded-full mx-auto mt-1" />
            </div>

            {/* Citation Quote */}
            <div className="max-w-xl mx-auto space-y-1 text-stone-700 text-xs sm:text-sm font-medium leading-relaxed pt-1">
              <p>for being an amazing part of our <strong className="text-stone-900 font-extrabold">{cert.trip.title}</strong> journey.</p>
              <p className="text-stone-500 italic text-[11px] sm:text-xs">
                The world is wide, but the memories we create together make every place feel like home.
              </p>
            </div>
          </div>

          {/* 4 Feature Highlights Grid */}
          <div className="relative z-10 py-3 my-2 border-y border-stone-300/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center bg-stone-100/50 rounded-xl">
            <div className="flex flex-col items-center justify-center p-1 space-y-1">
              <div className="w-7 h-7 rounded-full bg-orange-100 text-[#ea580c] flex items-center justify-center shadow-xs">
                <Compass size={16} />
              </div>
              <span className="text-[9px] sm:text-[10px] font-extrabold uppercase text-stone-800 tracking-wider">NEW PLACES EXPLORED</span>
            </div>

            <div className="flex flex-col items-center justify-center p-1 space-y-1 sm:border-l sm:border-stone-300">
              <div className="w-7 h-7 rounded-full bg-orange-100 text-[#ea580c] flex items-center justify-center shadow-xs">
                <Users size={16} />
              </div>
              <span className="text-[9px] sm:text-[10px] font-extrabold uppercase text-stone-800 tracking-wider">CONNECTIONS MADE</span>
            </div>

            <div className="flex flex-col items-center justify-center p-1 space-y-1 sm:border-l sm:border-stone-300">
              <div className="w-7 h-7 rounded-full bg-orange-100 text-[#ea580c] flex items-center justify-center shadow-xs">
                <Camera size={16} />
              </div>
              <span className="text-[9px] sm:text-[10px] font-extrabold uppercase text-stone-800 tracking-wider">MEMORIES CREATED</span>
            </div>

            <div className="flex flex-col items-center justify-center p-1 space-y-1 sm:border-l sm:border-stone-300">
              <div className="w-7 h-7 rounded-full bg-orange-100 text-[#ea580c] flex items-center justify-center shadow-xs">
                <Mountain size={16} />
              </div>
              <span className="text-[9px] sm:text-[10px] font-extrabold uppercase text-stone-800 tracking-wider">ADVENTURES LIVED</span>
            </div>
          </div>

          {/* Footer Information Row */}
          <div className="relative z-10 pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
            {/* QR Code Verification */}
            <div className="flex items-center gap-2.5">
              <img src={qrCodeUrl} alt="QR Code" className="w-14 h-14 rounded border border-stone-300 p-1 bg-white shadow-sm" />
              <div>
                <span className="block text-[8px] uppercase font-bold text-stone-500">Scan to verify</span>
                <span className="text-[9px] font-extrabold text-[#ea580c] uppercase tracking-wider">Official Certificate</span>
              </div>
            </div>

            {/* Certificate ID */}
            <div>
              <span className="block text-[9px] uppercase font-extrabold text-[#ea580c]">CERTIFICATE ID</span>
              <span className="text-xs font-mono font-extrabold text-stone-900">{cert.certificateId}</span>
            </div>

            {/* Center Compass Rose Graphic */}
            <div className="hidden sm:flex flex-col items-center justify-center text-stone-700">
              <div className="text-[8px] font-extrabold tracking-widest text-[#ea580c]">N</div>
              <div className="flex items-center gap-1.5 text-[9px] font-extrabold">
                <span>W</span>
                <div className="w-5 h-5 rounded-full border border-stone-400 flex items-center justify-center text-[#ea580c] font-bold">❖</div>
                <span>E</span>
              </div>
              <div className="text-[8px] font-extrabold tracking-widest text-[#ea580c]">S</div>
            </div>

            {/* Issued On */}
            <div>
              <span className="block text-[9px] uppercase font-extrabold text-[#ea580c]">ISSUED ON</span>
              <span className="text-xs font-bold text-stone-900">{formattedDate}</span>
            </div>

            {/* Founder Signature */}
            <div className="text-center sm:text-left">
              <div className="font-serif italic text-xl font-extrabold text-stone-900">Akhil</div>
              <div className="w-24 h-0.5 bg-stone-400 mx-auto sm:mx-0 my-0.5" />
              <div className="text-[9px] font-extrabold uppercase text-stone-900">FOUNDER</div>
              <div className="text-[9px] text-[#ea580c] font-bold">Pasupuleti Akhil</div>
            </div>

            {/* Official Badge Seal */}
            <div className="w-16 h-16 rounded-full border-2 border-[#ea580c] bg-stone-900 text-white p-1 flex flex-col items-center justify-center text-center shadow-lg rotate-[-6deg]">
              <span className="text-[6.5px] font-extrabold tracking-widest text-[#ea580c] uppercase">OFFICIAL</span>
              <span className="text-[7.5px] font-extrabold uppercase text-white">TRAVELER</span>
            </div>
          </div>

          {/* Bottom Right Orange Accent */}
          <div className="absolute bottom-0 right-0 w-40 sm:w-64 h-8 sm:h-12 bg-[#ea580c] rounded-tl-full opacity-90 pointer-events-none" />
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
