"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Award, 
  Download, 
  Share2, 
  CheckCircle, 
  Compass, 
  Loader2, 
  Sparkles,
  ArrowLeft
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
      const res = await fetch(`${API_URL}/public/certificates/${certId}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Certificate not found.");
      }
      const data = await res.json();
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

      // Background canvas fill
      doc.setFillColor(20, 17, 13);
      doc.rect(0, 0, pageWidth, pageHeight, "F");

      // Outer Gold Double Border
      doc.setDrawColor(234, 88, 12);
      doc.setLineWidth(1.5);
      doc.rect(8, 8, pageWidth - 16, pageHeight - 16, "S");
      doc.setDrawColor(254, 215, 170);
      doc.setLineWidth(0.5);
      doc.rect(11, 11, pageWidth - 22, pageHeight - 22, "S");

      // Corner Accents
      doc.setFillColor(234, 88, 12);
      doc.rect(8, 8, 8, 8, "F");
      doc.rect(pageWidth - 16, 8, 8, 8, "F");
      doc.rect(8, pageHeight - 16, 8, 8, "F");
      doc.rect(pageWidth - 16, pageHeight - 16, 8, 8, "F");

      // Top Logo & Brand Title
      try {
        const logoImg = await new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = (e) => reject(e);
          img.src = "/logo.png";
        });
        doc.addImage(logoImg, "PNG", pageWidth / 2 - 8, 18, 16, 16);
      } catch (e) {}

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(234, 88, 12);
      doc.text("WEARESOLOZ", pageWidth / 2, 40, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(180, 180, 180);
      doc.text("TRAVEL SOLO. YOU'RE NOT ALONE.", pageWidth / 2, 45, { align: "center" });

      // Certificate Title
      doc.setFont("times", "bold");
      doc.setFontSize(26);
      doc.setTextColor(255, 255, 255);
      doc.text("CERTIFICATE OF EXPLORATION", pageWidth / 2, 60, { align: "center" });

      doc.setFont("helvetica", "italic");
      doc.setFontSize(10);
      doc.setTextColor(254, 215, 170);
      doc.text("This official certificate of achievement is proudly awarded to", pageWidth / 2, 70, { align: "center" });

      // Traveler Name
      doc.setFont("times", "bold");
      doc.setFontSize(28);
      doc.setTextColor(234, 88, 12);
      doc.text(cert.fullName.toUpperCase(), pageWidth / 2, 86, { align: "center" });

      // Decorative Line
      doc.setDrawColor(234, 88, 12);
      doc.setLineWidth(0.8);
      doc.line(pageWidth / 2 - 50, 92, pageWidth / 2 + 50, 92);

      // Achievement Text
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(220, 220, 220);
      const textLine1 = "For stepping out of the comfort zone, embracing the true spirit of solo travel,";
      const textLine2 = `and successfully conquering the ${cert.trip.title} expedition.`;
      doc.text(textLine1, pageWidth / 2, 103, { align: "center" });
      doc.text(textLine2, pageWidth / 2, 109, { align: "center" });

      // Explorer Badge Pill
      const badgeText = getBadgeTitle(cert.trip.destination, cert.trip.title).toUpperCase();
      doc.setFillColor(234, 88, 12);
      doc.roundedRect(pageWidth / 2 - 45, 118, 90, 9, 2, 2, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.text(badgeText, pageWidth / 2, 124, { align: "center" });

      // Details Row
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(160, 160, 160);
      doc.text(`Departure Date: ${new Date(cert.trip.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}`, pageWidth / 2 - 60, 138, { align: "center" });
      doc.text(`Certificate ID: ${cert.certificateId}`, pageWidth / 2 + 60, 138, { align: "center" });

      // Signatures & Official Seal
      const stampX = pageWidth / 2;
      const stampY = 162;

      // Official Stamp Circle
      doc.setDrawColor(220, 38, 38);
      doc.setLineWidth(0.8);
      doc.circle(stampX, stampY, 15, "S");
      doc.setLineWidth(0.3);
      doc.circle(stampX, stampY, 13.5, "S");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(6);
      doc.setTextColor(220, 38, 38);
      doc.text("WEARESOLOZ", stampX, stampY - 7, { align: "center" });
      doc.setFontSize(5);
      doc.text("OFFICIAL EXPEDITION SEAL", stampX, stampY - 3, { align: "center" });
      doc.setFontSize(7.5);
      doc.text("VERIFIED", stampX, stampY + 1.5, { align: "center" });
      doc.setFontSize(5);
      doc.text("UDYAM-TS-09-0255691", stampX, stampY + 6.5, { align: "center" });

      // Founder Signature (Left)
      doc.setFont("times", "bolditalic");
      doc.setFontSize(14);
      doc.setTextColor(255, 255, 255);
      doc.text("Pasupuleti Akhil", 45, 162);
      doc.setDrawColor(100, 100, 100);
      doc.line(30, 166, 85, 166);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(180, 180, 180);
      doc.text("PASUPULETI AKHIL", 57.5, 171, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.text("Founder & Lead Captain", 57.5, 175, { align: "center" });

      // Verification Badge (Right)
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(34, 197, 94);
      doc.text("OFFICIALLY VERIFIED", pageWidth - 55, 162, { align: "center" });
      doc.line(pageWidth - 85, 166, pageWidth - 25, 166);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(180, 180, 180);
      doc.text("Authentic Travel Record", pageWidth - 55, 171, { align: "center" });
      doc.text("wearesoloz.com", pageWidth - 55, 175, { align: "center" });

      // Footer Note
      doc.setFont("helvetica", "italic");
      doc.setFontSize(7);
      doc.setTextColor(120, 120, 120);
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
      <div className="min-h-screen bg-[#0d0b08] text-white flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-[#ea580c]" size={40} />
        <p className="text-xs uppercase tracking-wider text-stone-400 font-bold">Verifying Certificate Authenticity...</p>
      </div>
    );
  }

  if (error || !cert) {
    return (
      <div className="min-h-screen bg-[#0d0b08] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4 text-red-400">
          <Award size={32} />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Certificate Not Found</h1>
        <p className="text-sm text-stone-400 max-w-md mb-6">{error || "The requested certificate ID is invalid or has not been issued yet."}</p>
        <Link 
          href="/" 
          className="px-6 py-2.5 rounded-xl bg-[#ea580c] hover:bg-[#ea580c]/90 text-white font-bold text-xs uppercase tracking-wider transition-all"
        >
          Return to Home Page
        </Link>
      </div>
    );
  }

  const badgeTitle = getBadgeTitle(cert.trip.destination, cert.trip.title);

  return (
    <div className="min-h-screen bg-[#0a0806] text-white flex flex-col">
      {/* Navbar Header */}
      <header className="border-b border-white/10 bg-[#120e0a]/80 backdrop-blur-md sticky top-0 z-50 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-stone-300 hover:text-white transition-all text-xs font-semibold">
            <ArrowLeft size={16} /> Back to WeAreSoloZ
          </Link>
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="SoloZ" width={24} height={24} className="rounded-full" />
            <span className="font-bold text-sm tracking-tight text-white">WeAreSoloZ</span>
          </div>
          <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
            <CheckCircle size={12} /> Verified
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-8 space-y-8">
        {/* Banner Alert */}
        <div className="rounded-2xl bg-gradient-to-r from-[#ea580c]/20 via-orange-500/10 to-amber-500/20 border border-[#ea580c]/30 p-4 sm:p-6 text-center space-y-2 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#ea580c]/20 rounded-full blur-2xl" />
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ea580c]/20 border border-[#ea580c]/40 text-[#ea580c] text-[10px] font-bold uppercase tracking-wider">
            <Sparkles size={12} /> Official Achievement Award
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            Congratulations, {cert.fullName}! 🎉
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 max-w-xl mx-auto">
            You have officially completed the <span className="text-[#ea580c] font-bold">{cert.trip.title}</span> expedition. Here is your verified Certificate of Exploration!
          </p>
        </div>

        {/* Certificate Rendering Box */}
        <div className="relative rounded-2xl bg-[#14110d] border-2 border-[#ea580c]/50 p-6 sm:p-12 shadow-2xl space-y-6 text-center overflow-hidden">
          {/* Background Decorative Circles */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#ea580c]/5 rounded-full blur-3xl pointer-events-none" />

          {/* Header Seal & Brand */}
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="w-14 h-14 rounded-full bg-[#ea580c]/10 border border-[#ea580c]/30 flex items-center justify-center text-[#ea580c] shadow-lg">
              <Compass size={28} />
            </div>
            <div className="text-xs uppercase font-bold tracking-widest text-[#ea580c]">WEARESOLOZ</div>
            <div className="text-[10px] text-stone-400 uppercase tracking-wider">Travel Solo. You're Not Alone.</div>
          </div>

          {/* Certificate Title */}
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-4xl font-serif font-bold tracking-wide text-white">
              CERTIFICATE OF EXPLORATION
            </h2>
            <p className="text-xs text-amber-200/80 italic font-serif">
              This official certificate of achievement is proudly awarded to
            </p>
          </div>

          {/* Traveler Name */}
          <div className="py-2">
            <div className="text-2xl sm:text-4xl font-bold font-serif text-[#ea580c] tracking-wide uppercase drop-shadow-md">
              {cert.fullName}
            </div>
            <div className="w-32 h-0.5 bg-[#ea580c] mx-auto mt-2 rounded-full" />
          </div>

          {/* Citation Body */}
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed max-w-xl mx-auto">
            For stepping out of the comfort zone, embracing the true spirit of solo travel, and successfully conquering the <strong className="text-white">{cert.trip.title}</strong> expedition.
          </p>

          {/* Badge Pill */}
          <div className="inline-block px-4 py-2 rounded-xl bg-gradient-to-r from-[#ea580c] to-amber-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg">
            {badgeTitle}
          </div>

          {/* Details Bar */}
          <div className="pt-4 grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-white/10 text-xs text-stone-400">
            <div>
              <span className="block text-[10px] uppercase text-stone-500 font-bold">Departure Date</span>
              <span className="text-stone-200 font-semibold">{new Date(cert.trip.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase text-stone-500 font-bold">Certificate ID</span>
              <span className="text-[#ea580c] font-mono font-bold">{cert.certificateId}</span>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="block text-[10px] uppercase text-stone-500 font-bold">Status</span>
              <span className="text-emerald-400 font-bold flex items-center justify-center gap-1">
                <CheckCircle size={12} /> Officially Verified
              </span>
            </div>
          </div>

          {/* Footer Signatures */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-white/10 text-left">
            {/* Captain Signature */}
            <div className="space-y-1 text-center sm:text-left">
              <div className="font-serif italic text-lg text-white font-bold">Pasupuleti Akhil</div>
              <div className="w-28 h-px bg-stone-600 mx-auto sm:mx-0" />
              <div className="text-[10px] font-bold uppercase text-stone-300">PASUPULETI AKHIL</div>
              <div className="text-[9px] text-stone-500">Founder & Lead Captain, WeAreSoloZ</div>
            </div>

            {/* Stamp Graphic */}
            <div className="w-24 h-24 rounded-full border-2 border-red-500/80 p-1 flex flex-col items-center justify-center text-center text-red-400 space-y-0.5 shadow-lg bg-red-500/5 rotate-[-6deg]">
              <span className="text-[7px] font-bold tracking-widest uppercase">WEARESOLOZ</span>
              <span className="text-[9px] font-bold uppercase">OFFICIAL SEAL</span>
              <span className="text-[8px] font-bold">PAID & VERIFIED</span>
              <span className="text-[6px] text-stone-400 font-mono">UDYAM-TS-09-0255691</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <button
            onClick={generatePDF}
            disabled={generatingPdf}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#ea580c] hover:bg-[#ea580c]/90 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#ea580c]/20 disabled:opacity-50"
          >
            {generatingPdf ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Generating PDF...
              </>
            ) : (
              <>
                <Download size={16} /> Download A4 PDF Certificate
              </>
            )}
          </button>

          <button
            onClick={handleShareWhatsApp}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg"
          >
            <Share2 size={16} /> Share on WhatsApp
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 text-center text-stone-500 text-xs">
        <p>© {new Date().getFullYear()} WeAreSoloZ India. All Rights Reserved. Govt Reg: UDYAM-TS-09-0255691</p>
      </footer>
    </div>
  );
}
