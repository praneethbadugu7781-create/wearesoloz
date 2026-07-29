"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Award, 
  Download, 
  Share2, 
  CheckCircle, 
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

  const getBadgeTitle = (destination?: string, title?: string) => {
    const name = (title || destination || "Solo Expedition").toLowerCase();
    if (name.includes("hampi")) return "🏛️ Hampi Heritage Explorer";
    if (name.includes("gokarna")) return "🌊 Coastal Explorer & Trekker";
    if (name.includes("wayanad") || name.includes("kerala")) return "🌿 Rainforest Pathfinder";
    if (name.includes("coorg") || name.includes("chikmagalur")) return "☕ Coffee Hills Mountaineer";
    if (name.includes("pondicherry")) return "🏖️ French Colony Wanderer";
    return "⭐ Official Solo Explorer";
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

      // Authentic Parchment / Ivory Background
      doc.setFillColor(252, 250, 245); // Warm Luxury Off-White
      doc.rect(0, 0, pageWidth, pageHeight, "F");

      // Double Luxury Border Frame
      doc.setDrawColor(234, 88, 12); // Brand Orange
      doc.setLineWidth(1.8);
      doc.rect(10, 10, pageWidth - 20, pageHeight - 20, "S");

      doc.setDrawColor(217, 119, 6); // Gold Inner Line
      doc.setLineWidth(0.6);
      doc.rect(13, 13, pageWidth - 26, pageHeight - 26, "S");

      // Corner Ornaments
      const drawCorner = (x: number, y: number) => {
        doc.setFillColor(234, 88, 12);
        doc.rect(x, y, 6, 6, "F");
      };
      drawCorner(10, 10);
      drawCorner(pageWidth - 16, 10);
      drawCorner(10, pageHeight - 16);
      drawCorner(pageWidth - 16, pageHeight - 16);

      // WeAreSoloZ Official Logo
      try {
        const logoImg = await new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new window.Image();
          img.onload = () => resolve(img);
          img.onerror = (e) => reject(e);
          img.src = "/logo.png";
        });
        doc.addImage(logoImg, "PNG", pageWidth / 2 - 10, 18, 20, 20);
      } catch (e) {}

      // Brand Title & Tagline
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(234, 88, 12);
      doc.text("WEARESOLOZ", pageWidth / 2, 43, { align: "center" });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(120, 113, 108);
      doc.text("TRAVEL SOLO. YOU'RE NOT ALONE.", pageWidth / 2, 48, { align: "center" });

      // Main Certificate Header
      doc.setFont("times", "bold");
      doc.setFontSize(26);
      doc.setTextColor(28, 25, 23);
      doc.text("CERTIFICATE OF EXPLORATION", pageWidth / 2, 63, { align: "center" });

      doc.setFont("helvetica", "italic");
      doc.setFontSize(10);
      doc.setTextColor(120, 113, 108);
      doc.text("This official certificate of merit is proudly presented to", pageWidth / 2, 72, { align: "center" });

      // Traveler Name
      doc.setFont("times", "bold");
      doc.setFontSize(28);
      doc.setTextColor(234, 88, 12);
      doc.text(cert.fullName.toUpperCase(), pageWidth / 2, 88, { align: "center" });

      // Line Divider
      doc.setDrawColor(234, 88, 12);
      doc.setLineWidth(0.8);
      doc.line(pageWidth / 2 - 50, 94, pageWidth / 2 + 50, 94);

      // Citation Text
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(68, 64, 60);
      const text1 = "For stepping out of the comfort zone, embracing the spirit of solo travel,";
      const text2 = `and successfully conquering the ${cert.trip.title} expedition.`;
      doc.text(text1, pageWidth / 2, 104, { align: "center" });
      doc.text(text2, pageWidth / 2, 110, { align: "center" });

      // Achievement Badge Pill
      const badgeText = getBadgeTitle(cert.trip.destination, cert.trip.title).toUpperCase();
      doc.setFillColor(234, 88, 12);
      doc.roundedRect(pageWidth / 2 - 45, 119, 90, 9, 2, 2, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(255, 255, 255);
      doc.text(badgeText, pageWidth / 2, 125, { align: "center" });

      // Certificate Details Bar
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(120, 113, 108);
      doc.text(`Departure Date: ${new Date(cert.trip.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}`, pageWidth / 2 - 65, 139, { align: "center" });
      doc.text(`Certificate ID: ${cert.certificateId}`, pageWidth / 2 + 65, 139, { align: "center" });

      // Official Round Stamp (Right side)
      const stampX = pageWidth - 48;
      const stampY = 164;

      doc.setDrawColor(220, 38, 38); // Deep Stamp Red
      doc.setLineWidth(0.8);
      doc.circle(stampX, stampY, 15, "S");
      doc.setLineWidth(0.3);
      doc.circle(stampX, stampY, 13.5, "S");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      doc.setTextColor(220, 38, 38);
      doc.text("WEARESOLOZ", stampX, stampY - 7, { align: "center" });
      doc.setFontSize(5);
      doc.text("GOVT REGISTERED SEAL", stampX, stampY - 3, { align: "center" });
      doc.setFontSize(7.5);
      doc.text("PAID & VERIFIED", stampX, stampY + 1.5, { align: "center" });
      doc.setFontSize(5);
      doc.text("UDYAM-TS-09-0255691", stampX, stampY + 6.5, { align: "center" });

      // Founder Signature (Left side)
      doc.setFont("times", "bolditalic");
      doc.setFontSize(15);
      doc.setTextColor(28, 25, 23);
      doc.text("Pasupuleti Akhil", 45, 163);
      doc.setDrawColor(120, 113, 108);
      doc.setLineWidth(0.4);
      doc.line(30, 167, 85, 167);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(28, 25, 23);
      doc.text("PASUPULETI AKHIL", 57.5, 172, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(120, 113, 108);
      doc.text("Founder & Lead Captain", 57.5, 176, { align: "center" });

      // Verified Status Text
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(22, 101, 52); // Forest Green
      doc.text("OFFICIALLY VERIFIED EXPEDITION", pageWidth / 2, 163, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(120, 113, 108);
      doc.text("www.wearesoloz.com", pageWidth / 2, 168, { align: "center" });

      // Footer Note
      doc.setFont("helvetica", "italic");
      doc.setFontSize(7.5);
      doc.setTextColor(140, 135, 130);
      doc.text("This official digital certificate is issued by WEARESOLOZ (Reg: UDYAM-TS-09-0255691). Authenticity verified online.", pageWidth / 2, pageHeight - 12, { align: "center" });

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
      `🎓 I just completed the ${cert.trip.title} expedition with WeAreSoloZ! Check out my Official Certificate of Exploration here: ${window.location.href} 🎒✨ #TravelSoloYoureNotAlone #WeAreSoloZ`
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
          <Award size={32} />
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

  const badgeTitle = getBadgeTitle(cert.trip.destination, cert.trip.title);

  return (
    <div className="min-h-screen bg-[#f5f2eb] text-stone-900 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="border-b border-stone-300 bg-white/90 backdrop-blur-md sticky top-0 z-50 px-4 py-3 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-stone-600 hover:text-[#ea580c] transition-all text-xs font-bold">
            <ArrowLeft size={16} /> Back to WeAreSoloZ
          </Link>
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="WeAreSoloZ Logo" className="w-8 h-8 rounded-full object-cover shadow-sm border border-[#ea580c]" />
            <span className="font-extrabold text-sm tracking-tight text-stone-900">WeAreSoloZ</span>
          </div>
          <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-300 px-3 py-1 rounded-full text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
            <ShieldCheck size={14} /> Verified Certificate
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-8 space-y-8">
        {/* Banner Alert */}
        <div className="rounded-2xl bg-gradient-to-r from-[#ea580c] via-orange-600 to-amber-600 text-white p-5 sm:p-6 text-center space-y-2 shadow-xl relative overflow-hidden">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/20 border border-white/30 text-white text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md">
            <Sparkles size={12} /> Official Achievement Award
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Congratulations, {cert.fullName}! 🎉
          </h1>
          <p className="text-xs sm:text-sm text-orange-100 max-w-xl mx-auto font-medium">
            You have officially conquered the <strong className="text-white underline">{cert.trip.title}</strong> expedition. Here is your verified Certificate of Exploration!
          </p>
        </div>

        {/* REALISTIC LUXURY CERTIFICATE CARD (WARM IVORY / OFF-WHITE THEME) */}
        <div className="relative rounded-2xl bg-[#faf7f0] border-[3px] border-[#ea580c] p-6 sm:p-12 shadow-2xl space-y-6 text-center overflow-hidden">
          {/* Inner Gold Frame Border */}
          <div className="absolute inset-3 border border-amber-600/40 rounded-xl pointer-events-none" />

          {/* Corner Filigree Accents */}
          <div className="absolute top-3 left-3 w-4 h-4 bg-[#ea580c]" />
          <div className="absolute top-3 right-3 w-4 h-4 bg-[#ea580c]" />
          <div className="absolute bottom-3 left-3 w-4 h-4 bg-[#ea580c]" />
          <div className="absolute bottom-3 right-3 w-4 h-4 bg-[#ea580c]" />

          {/* Header Branding with Official Logo */}
          <div className="flex flex-col items-center justify-center space-y-2 pt-2">
            <img src="/logo.png" alt="WeAreSoloZ Logo" className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover shadow-md border-2 border-[#ea580c]" />
            <div className="text-xs uppercase font-extrabold tracking-widest text-[#ea580c] mt-1">WEARESOLOZ</div>
            <div className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">TRAVEL SOLO. YOU'RE NOT ALONE.</div>
          </div>

          {/* Certificate Main Title */}
          <div className="space-y-1 pt-2">
            <h2 className="text-3xl sm:text-5xl font-serif font-extrabold tracking-wide text-stone-900">
              CERTIFICATE OF EXPLORATION
            </h2>
            <p className="text-xs text-stone-600 italic font-serif pt-1">
              This official certificate of merit is proudly presented to
            </p>
          </div>

          {/* Traveler Name */}
          <div className="py-2">
            <div className="text-3xl sm:text-5xl font-extrabold font-serif text-[#ea580c] tracking-wide uppercase drop-shadow-sm">
              {cert.fullName}
            </div>
            <div className="w-40 h-0.5 bg-[#ea580c] mx-auto mt-2 rounded-full" />
          </div>

          {/* Citation Paragraph */}
          <p className="text-xs sm:text-sm text-stone-700 leading-relaxed max-w-xl mx-auto font-medium">
            For stepping out of the comfort zone, embracing the true spirit of solo travel, and successfully conquering the <strong className="text-stone-900 font-bold">{cert.trip.title}</strong> expedition.
          </p>

          {/* Achievement Badge */}
          <div className="inline-block px-5 py-2.5 rounded-xl bg-[#ea580c] text-white font-extrabold text-xs uppercase tracking-wider shadow-md">
            {badgeTitle}
          </div>

          {/* Details Metadata Bar */}
          <div className="pt-4 grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-stone-300 text-xs text-stone-600">
            <div>
              <span className="block text-[10px] uppercase text-stone-500 font-bold">Departure Date</span>
              <span className="text-stone-900 font-bold">{new Date(cert.trip.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase text-stone-500 font-bold">Certificate ID</span>
              <span className="text-[#ea580c] font-mono font-extrabold">{cert.certificateId}</span>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="block text-[10px] uppercase text-stone-500 font-bold">Status</span>
              <span className="text-emerald-700 font-extrabold flex items-center justify-center gap-1">
                <CheckCircle size={13} /> Officially Verified
              </span>
            </div>
          </div>

          {/* Signatures & Round Official Stamp */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-stone-300 text-left">
            {/* Captain Signature */}
            <div className="space-y-1 text-center sm:text-left">
              <div className="font-serif italic text-xl text-stone-900 font-extrabold">Pasupuleti Akhil</div>
              <div className="w-32 h-0.5 bg-stone-400 mx-auto sm:mx-0" />
              <div className="text-[10px] font-extrabold uppercase text-stone-900">PASUPULETI AKHIL</div>
              <div className="text-[9px] text-stone-600 font-bold">Founder & Lead Captain, WeAreSoloZ</div>
            </div>

            {/* Official Stamp Circle */}
            <div className="w-24 h-24 rounded-full border-2 border-red-600 p-1 flex flex-col items-center justify-center text-center text-red-600 space-y-0.5 shadow-md bg-red-50 rotate-[-6deg]">
              <span className="text-[7px] font-extrabold tracking-widest uppercase">WEARESOLOZ</span>
              <span className="text-[8.5px] font-extrabold uppercase">OFFICIAL SEAL</span>
              <span className="text-[7.5px] font-bold">PAID & VERIFIED</span>
              <span className="text-[6px] text-stone-600 font-mono">UDYAM-TS-09-0255691</span>
            </div>
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
                <Download size={16} /> Download A4 Print PDF
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
