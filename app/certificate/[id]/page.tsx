"use client";

import { useEffect, useState, useRef, use } from "react";
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

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [cert, setCert] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);

  useEffect(() => {
    fetchCertificate();
  }, [certId]);

  useEffect(() => {
    if (cert && canvasRef.current) {
      renderCertificateCanvas();
    }
  }, [cert]);

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

  const renderCertificateCanvas = async () => {
    if (!cert || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Master Canvas Dimensions (1536 x 1024)
    canvas.width = 1536;
    canvas.height = 1024;

    // 1. Draw Master Template Background Image
    const templateImg = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(e);
      img.src = "/images/master_certificate_template_clean.png";
    });

    ctx.drawImage(templateImg, 0, 0, 1536, 1024);

    // 2. Draw Traveler Name (Centered on Canvas at Y: 490px)
    let fontSize = 56;
    if (cert.fullName.length > 35) fontSize = 36;
    else if (cert.fullName.length > 25) fontSize = 44;

    ctx.font = `bold italic ${fontSize}px "Times New Roman", Times, serif`;
    ctx.fillStyle = "#18181b";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(cert.fullName, 1536 / 2, 490);

    // 3. Draw Certificate ID (Centered at X: 438px, Y: 872px)
    ctx.font = "bold 20px monospace, sans-serif";
    ctx.fillStyle = "#18181b";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(cert.certificateId, 438, 872);

    // 4. Draw Issue Date (Centered at X: 980px, Y: 872px)
    const formattedDate = new Date(cert.trip.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    ctx.font = "bold 20px sans-serif";
    ctx.fillStyle = "#18181b";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(formattedDate, 980, 872);

    // 5. Draw Dynamic QR Code (at X: 110px, Y: 815px, W: 130px, H: 130px)
    try {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.href)}`;
      const qrImg = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new window.Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(e);
        img.src = qrUrl;
      });
      ctx.drawImage(qrImg, 110, 815, 130, 130);
    } catch (e) {}

    setCanvasReady(true);
  };

  const generatePDF = async () => {
    if (!cert || !canvasRef.current) return;
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

      // Export Flattened Canvas Image
      const canvasDataUrl = canvasRef.current.toDataURL("image/png");

      doc.addImage(canvasDataUrl, "PNG", 0, 0, pageWidth, pageHeight);
      doc.save(`Certificate_${cert.fullName.replace(/\s+/g, "_")}_${cert.certificateId}.pdf`);
    } catch (err: any) {
      console.error("PDF export error:", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleDownloadImage = () => {
    if (!canvasRef.current || !cert) return;
    const link = document.createElement("a");
    link.download = `Certificate_${cert.fullName.replace(/\s+/g, "_")}_${cert.certificateId}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
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

        {/* FLATTENED HTML5 CANVAS CERTIFICATE (ZERO FLOATING OVERLAYS) */}
        <div className="relative w-full max-w-4xl mx-auto rounded-2xl shadow-2xl overflow-hidden border-2 border-stone-300 bg-[#faf4ec] flex items-center justify-center p-2 sm:p-4">
          <canvas 
            ref={canvasRef} 
            className="w-full h-auto max-w-full rounded-xl shadow-md block"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <button
            onClick={generatePDF}
            disabled={generatingPdf || !canvasReady}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#ea580c] hover:bg-[#ea580c]/90 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#ea580c]/20 disabled:opacity-50"
          >
            {generatingPdf ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Exporting High-Res PDF...
              </>
            ) : (
              <>
                <Download size={16} /> Download Certificate PDF
              </>
            )}
          </button>

          <button
            onClick={handleDownloadImage}
            disabled={!canvasReady}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg"
          >
            <Download size={16} /> Download PNG Image
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
