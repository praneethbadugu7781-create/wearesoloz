import type { Metadata } from "next";
import { Outfit, Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { BookingModal } from "@/components/booking-modal";
import { Preloader } from "@/components/Preloader";
import { brand } from "@/lib/data";
import { Toaster } from "sonner";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", weight: ["300", "400", "500", "600", "700"] });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans", weight: ["400", "500", "600"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: `${brand.name} | ${brand.tagline}`,
    template: `%s | ${brand.name}`
  },
  description:
    "A premium solo travel community for curated expeditions, treks, spiritual journeys, road trips, and lifelong travel friendships.",
  openGraph: {
    title: `${brand.name} | ${brand.tagline}`,
    description: "Start solo, travel together with India's growing premium travel community.",
    type: "website",
    images: ["/og-image.jpg"]
  },
  keywords: ["solo travel", "solo trips", "Kedarnath", "travel community", "WeAreSoloz", "Akhil"]
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${outfit.variable} ${playfair.variable} ${dmSans.variable}`}>
      <body className="font-sans antialiased bg-white text-[#1c1917]">
        {/* Gooey SVG Filter used by premium buttons */}
        <svg width="0" height="0" className="absolute hidden" colorInterpolationFilters="sRGB">
          <defs>
            <filter id="buttonFilter">
              <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
              <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="buttonFilter" />
              <feComposite in="SourceGraphic" in2="buttonFilter" operator="atop" />
              <feBlend in="SourceGraphic" in2="buttonFilter" />
            </filter>
          </defs>
        </svg>

        <Preloader />
        <Navbar />
        {children}
        <Footer />
        <BookingModal />
        <Toaster theme="light" richColors closeButton position="bottom-right" />
      </body>
    </html>
  );
}


