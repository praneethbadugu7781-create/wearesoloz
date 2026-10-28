import { Metadata } from "next";
import Link from "next/link";
import { fetchPublic } from "@/lib/api";
import { 
  Flame, 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  ChevronRight, 
  Sparkles, 
  ShieldCheck, 
  MessageCircle, 
  Users, 
  ArrowRight,
  Heart
} from "lucide-react";
import { getOptimizedImageUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Swami Sharanam Ayyapa Diksha Devotional Tours | Sabarimala Yatra",
  description: "Join sacred Swami Sharanam Ayyapa Diksha Devotional Tours to Sabarimala. Complete with traditional Irumudi pooja, Guruswamy guidance, comfortable travel, and pure Satvik meals.",
  keywords: [
    "Swami Sharanam Ayyapa Diksha Devotional Tours",
    "Sabarimala Yatra packages",
    "Ayyappa Swamy devotional tour",
    "Ayyapa deeksha trips",
    "Sabarimala bus packages from Hyderabad",
    "WeAreSoloZ Ayyapa tours"
  ]
};

const DEFAULT_AYYAPA_TRIP = {
  destination: "Sabarimala",
  state: "Kerala",
  title: "Swami Sharanam Ayyapa Diksha Devotional Tour",
  slug: "swami-sharanam-ayyapa-diksha-tour",
  duration: "4 Days / 3 Nights",
  price: "₹4,999",
  seats: 40,
  date: "2026-11-20",
  image: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80",
  description: "Sacred community pilgrimage to Sabarimala Sannidhanam with traditional Irumudi kattu, Guruswamy supervision, safe transport, and pure Satvik Annadanam.",
  batches: [
    { label: "Mandala Kalam Batch 1", startDate: "2026-11-20", endDate: "2026-11-24", price: "₹4,999" },
    { label: "Mandala Kalam Batch 2", startDate: "2026-12-15", endDate: "2026-12-19", price: "₹4,999" },
    { label: "Makaravilakku Mahotsavam", startDate: "2027-01-10", endDate: "2027-01-15", price: "₹5,499" }
  ],
  inclusions: [
    "Traditional Irumudi Kattu & Pooja Guidance",
    "Dedicated Guruswamy Coordination",
    "Comfortable AC / Non-AC Sleeper Travel",
    "Daily Pure Vegetarian Satvik Food",
    "Rest Halts at Erumely & Pamba",
    "Special Sannidhanam Darshan Coordination"
  ]
};

async function getAyyapaTrips() {
  try {
    const allTrips = await fetchPublic("/trips?all=true", []);
    if (allTrips && allTrips.length > 0) {
      const filtered = allTrips.filter((t: any) =>
        t.isAyyapaTrip === true ||
        t.category === "Ayyapa Diksha Devotional Tours" ||
        (t.destination && t.destination.toLowerCase().includes("sabarimala")) ||
        (t.title && t.title.toLowerCase().includes("ayyapa"))
      );
      if (filtered.length > 0) return filtered;
    }
  } catch (e) {
    console.error("Failed to load Ayyapa trips:", e);
  }
  return [DEFAULT_AYYAPA_TRIP];
}

export default async function AyyapaDevotionalToursPage() {
  const tours = await getAyyapaTrips();

  return (
    <main className="min-h-screen bg-stone-950 text-white selection:bg-orange-500 selection:text-white">
      {/* Sacred Ambient Light Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-b from-orange-600/20 via-amber-600/10 to-transparent blur-[140px]" />
        <div className="absolute top-1/3 left-10 w-96 h-96 bg-amber-500/10 blur-[130px]" />
      </div>

      {/* Hero Section with Official Banner Artwork */}
      <section className="relative z-10 pt-32 sm:pt-40 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center space-y-6">
        
        {/* Sacred Mahamantra Eyebrow */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/15 border border-orange-500/35 text-amber-300 text-[11px] sm:text-xs font-bold tracking-[0.22em] uppercase shadow-lg shadow-orange-950/50">
          <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
          <span>॥ స్వామియే శరణం అయ్యప్ప ॥</span>
        </div>

        {/* Official Banner Image Artwork */}
        <div className="max-w-2xl mx-auto rounded-3xl overflow-hidden border-2 border-amber-500/40 shadow-[0_10px_50px_rgba(234,88,12,0.35)] bg-stone-900/60 p-2 sm:p-3 backdrop-blur-xl group hover:border-amber-400/70 transition-all duration-500">
          <img
            src="/images/ayyapa-banner.png"
            alt="Swami Sharanam Ayyapa Diksha Devotional Tours"
            className="w-full h-auto object-contain rounded-2xl group-hover:scale-[1.01] transition-transform duration-500"
          />
        </div>

        {/* Editorial Subtitle */}
        <p className="max-w-3xl mx-auto text-sm sm:text-base md:text-lg text-stone-300 leading-relaxed font-sans font-normal pt-2">
          Experience a deeply sacred, devotional journey to Lord Ayyappa’s holy abode Sabarimala. Complete with traditional Irumudi pooja, respected Guruswamy guidance, comfortable travel, and pure Satvik Annadanam meals for all devotees and Kanniswamis.
        </p>

        {/* Sacred Quick Chips */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs font-semibold text-stone-300">
          <span className="px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 flex items-center gap-1.5">
            🛕 Guruswamy Supervision
          </span>
          <span className="px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 flex items-center gap-1.5">
            🥥 Traditional Irumudi Kattu
          </span>
          <span className="px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 flex items-center gap-1.5">
            🍲 Pure Satvik Annadanam
          </span>
          <span className="px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 flex items-center gap-1.5">
            🚌 Direct Pilgrim Travel
          </span>
        </div>
      </section>

      {/* 4 Pillars of Devotion */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: Flame,
              title: "Sacred Irumudi Pooja",
              desc: "Traditional Irumudi filling ceremony conducted by revered Guruswamy following ancient scriptures and Vedic rituals."
            },
            {
              icon: MapPin,
              title: "Complete Traditional Route",
              desc: "Sacred halts at Erumely (Pettathullal & Vavar Mosque), Pamba river holy bath, and Neelimala sacred trek."
            },
            {
              icon: ShieldCheck,
              title: "Hassle-Free Darshan",
              desc: "Pre-coordinated virtual queue assistance, safe hill climb guidance, and Neyyabhishekam support at Sannidhanam."
            },
            {
              icon: Heart,
              title: "Satvik Annadanam",
              desc: "Fresh, hygienic, pure vegetarian meals provided throughout the yatra to maintain sacred Deeksha vows."
            }
          ].map((pillar, i) => (
            <div
              key={i}
              className="bg-stone-900/80 rounded-2xl p-5 border border-amber-500/20 shadow-md space-y-2.5 backdrop-blur-md hover:border-amber-500/50 transition-colors"
            >
              <div className="size-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
                <pillar.icon className="w-5 h-5" />
              </div>
              <h3 className="font-display text-base font-bold text-white">{pillar.title}</h3>
              <p className="text-xs text-stone-400 leading-relaxed font-sans">{pillar.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Available Ayyapa Diksha Tours */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-800 pb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-400 uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              Sacred Yatra Batches
            </div>
            <h2 className="font-display text-2xl sm:text-4xl font-bold text-white mt-1">
              Available Pilgrimage Packages
            </h2>
          </div>
          <p className="text-xs text-stone-400 max-w-sm">
            Reserve your seat early for Mandala Kalam, Makaravilakku, and monthly pooja openings.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {tours.map((tour: any) => (
            <div
              key={tour._id || tour.slug}
              className="bg-stone-900 rounded-3xl overflow-hidden border border-amber-500/25 shadow-xl hover:shadow-2xl hover:border-amber-500/50 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Image Viewport */}
                <div className="relative h-64 w-full overflow-hidden bg-stone-950">
                  <img
                    src={getOptimizedImageUrl(tour.image || DEFAULT_AYYAPA_TRIP.image, 1000)}
                    alt={tour.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/40 to-transparent" />

                  <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-600 text-white shadow-md flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 fill-white" />
                      Ayyapa Diksha
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-amber-300 border border-amber-300/30">
                      Sabarimala
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <div className="text-xs font-semibold text-orange-400 flex items-center gap-1 mb-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {tour.destination}, {tour.state || "Kerala"}
                    </div>
                    <h3 className="font-display text-xl sm:text-2xl font-bold text-white leading-tight">
                      {tour.title}
                    </h3>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6 space-y-4">
                  {/* Meta Strip */}
                  <div className="grid grid-cols-2 gap-3 py-2 border-y border-stone-800 text-xs">
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase tracking-wider font-semibold">Duration</span>
                      <span className="font-bold text-stone-200 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-orange-400" />
                        {tour.duration}
                      </span>
                    </div>

                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase tracking-wider font-semibold">Pilgrim Contribution</span>
                      <span className="font-extrabold text-lg text-amber-400 block mt-0.5">
                        {tour.price}
                      </span>
                    </div>
                  </div>

                  {/* Scheduled Batches */}
                  {tour.batches && tour.batches.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[11px] uppercase tracking-wider font-bold text-stone-400 block">
                        Upcoming Departure Batches:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {tour.batches.map((batch: any, idx: number) => (
                          <span
                            key={idx}
                            className="px-3 py-1 rounded-xl bg-stone-800/80 border border-stone-700 text-stone-300 text-xs font-medium flex items-center gap-1.5"
                          >
                            <Calendar className="w-3 h-3 text-orange-400" />
                            {batch.label || (batch.startDate ? new Date(batch.startDate).toLocaleDateString() : `Batch ${idx + 1}`)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Inclusions */}
                  <div className="space-y-2 pt-2">
                    <span className="text-[11px] uppercase tracking-wider font-bold text-stone-400 block">
                      Sacred Inclusions:
                    </span>
                    <ul className="grid sm:grid-cols-2 gap-2 text-xs text-stone-300">
                      {(tour.inclusions || DEFAULT_AYYAPA_TRIP.inclusions).slice(0, 4).map((inc: string, idx: number) => (
                        <li key={idx} className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="truncate">{inc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-6 pt-0 flex flex-col sm:flex-row items-center gap-3">
                <Link
                  href={`/upcoming-trips/${tour.slug}`}
                  className="w-full sm:flex-1 py-3 px-5 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-center shadow-lg shadow-orange-600/30 transition-all flex items-center justify-center gap-2"
                >
                  <span>View Details & Reserve</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href={`https://wa.me/919966085310?text=${encodeURIComponent(`Swami Sharanam! I want to inquire about ${tour.title} (${tour.duration}). Please share batch dates and booking details.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto py-3 px-5 rounded-full text-xs font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Group / Bhajan Mandali Special Booking Callout */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="bg-gradient-to-r from-stone-900 via-[#231b14] to-stone-900 p-8 sm:p-12 rounded-3xl border border-amber-500/30 shadow-2xl space-y-6">
          <div className="size-14 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-400 flex items-center justify-center mx-auto shadow-inner">
            <Users className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-white">
              Bhajan Mandali & Devotee Group Bookings
            </h3>
            <p className="text-stone-300 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
              Planning a group yatra with your local temple or Ayyappa Seva Samithi? We provide customized AC/Non-AC buses, exclusive Guruswamy coordination, and tailored pooja stops for your group.
            </p>
          </div>

          <a
            href={`https://wa.me/919966085310?text=${encodeURIComponent("Swami Sharanam! We are planning an Ayyapa Swamy group yatra / Bhajan Mandali trip. Please provide details and special group arrangements.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white shadow-xl shadow-orange-600/30 transition-all active:scale-95"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Inquire for Group Yatra via WhatsApp</span>
          </a>
        </div>
      </section>
    </main>
  );
}
