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
    <div className="bg-white min-h-screen text-[#1c1917] selection:bg-orange-500 selection:text-white">
      {/* Hero Section matching Public Website style */}
      <section className="pt-28 sm:pt-36 pb-14 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center space-y-5">
        
        {/* Sacred Mahamantra Eyebrow */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-200/90 text-[#ea580c] text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase shadow-2xs">
          <Flame className="w-3.5 h-3.5 text-[#ea580c] fill-[#ea580c]" />
          <span>॥ స్వామియే శరణం అయ్యప్ప ॥</span>
        </div>

        {/* Official Banner Artwork Container */}
        <div className="max-w-2xl mx-auto rounded-3xl overflow-hidden border border-orange-200/90 shadow-[0_12px_40px_rgba(234,88,12,0.12)] bg-gradient-to-b from-orange-50/50 to-white p-2 sm:p-3 group hover:border-orange-300 transition-all duration-300">
          <img
            src="/images/ayyapa-banner.png"
            alt="Swami Sharanam Ayyapa Diksha Devotional Tours"
            className="w-full h-auto object-contain rounded-2xl group-hover:scale-[1.01] transition-transform duration-500"
          />
        </div>

        {/* Grand Editorial Title */}
        <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-medium tracking-tight text-stone-900 max-w-4xl mx-auto pt-2">
          Swami Sharanam <span className="text-[#ea580c]">Ayyapa Diksha</span> Devotional Tours
        </h1>

        {/* Editorial Subtitle */}
        <p className="max-w-3xl mx-auto text-sm sm:text-base md:text-lg text-stone-600 leading-relaxed font-sans font-normal">
          Experience a deeply sacred, devotional journey to Lord Ayyappa’s holy abode Sabarimala. Complete with traditional Irumudi pooja, respected Guruswamy guidance, comfortable travel, and pure Satvik Annadanam meals for all devotees and Kanniswamis.
        </p>

        {/* Sacred Quick Chips */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs font-semibold text-stone-700">
          <span className="px-3.5 py-1.5 rounded-full bg-white border border-stone-200/90 shadow-2xs flex items-center gap-1.5">
            🛕 Guruswamy Supervision
          </span>
          <span className="px-3.5 py-1.5 rounded-full bg-white border border-stone-200/90 shadow-2xs flex items-center gap-1.5">
            🥥 Traditional Irumudi Kattu
          </span>
          <span className="px-3.5 py-1.5 rounded-full bg-white border border-stone-200/90 shadow-2xs flex items-center gap-1.5">
            🍲 Pure Satvik Annadanam
          </span>
          <span className="px-3.5 py-1.5 rounded-full bg-white border border-stone-200/90 shadow-2xs flex items-center gap-1.5">
            🚌 Direct Pilgrim Travel
          </span>
        </div>
      </section>

      {/* 4 Pillars of Devotion */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              className="bg-white rounded-2xl p-6 border border-stone-200/90 shadow-2xs space-y-2.5 hover:shadow-md hover:border-orange-300 transition-all"
            >
              <div className="size-10 rounded-xl bg-orange-50 border border-orange-200 text-[#ea580c] flex items-center justify-center">
                <pillar.icon className="w-5 h-5" />
              </div>
              <h3 className="font-display text-base font-semibold text-stone-900">{pillar.title}</h3>
              <p className="text-xs text-stone-600 leading-relaxed font-sans">{pillar.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Available Ayyapa Diksha Tours Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200 pb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#ea580c] uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              Sacred Yatra Batches
            </div>
            <h2 className="font-display text-2xl sm:text-4xl font-medium text-stone-900 mt-1">
              Available Pilgrimage Packages
            </h2>
          </div>
          <p className="text-xs text-stone-500 max-w-sm">
            Reserve your seat early for Mandala Kalam, Makaravilakku, and monthly pooja openings.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {tours.map((tour: any) => (
            <div
              key={tour._id || tour.slug}
              className="bg-white rounded-3xl overflow-hidden border border-stone-200/90 shadow-2xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Image Viewport */}
                <div className="relative h-64 w-full overflow-hidden bg-stone-100">
                  <img
                    src={getOptimizedImageUrl(tour.image || DEFAULT_AYYAPA_TRIP.image, 1000)}
                    alt={tour.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-600 text-white shadow-md flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 fill-white" />
                      Ayyapa Diksha
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/90 backdrop-blur-md text-stone-900 border border-stone-200 shadow-sm">
                      Sabarimala
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <div className="text-xs font-bold text-orange-300 flex items-center gap-1 mb-1">
                      <MapPin className="w-3.5 h-3.5 text-orange-400" />
                      {tour.destination}, {tour.state || "Kerala"}
                    </div>
                    <h3 className="font-display text-xl sm:text-2xl font-semibold text-white leading-tight">
                      {tour.title}
                    </h3>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6 space-y-4">
                  {/* Meta Strip */}
                  <div className="grid grid-cols-2 gap-3 py-2 border-y border-stone-100 text-xs">
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase tracking-wider font-semibold">Duration</span>
                      <span className="font-bold text-stone-800 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-[#ea580c]" />
                        {tour.duration}
                      </span>
                    </div>

                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase tracking-wider font-semibold">Pilgrim Contribution</span>
                      <span className="font-black text-xl text-stone-900 block mt-0.5">
                        {tour.price}
                      </span>
                    </div>
                  </div>

                  {/* Scheduled Batches */}
                  {tour.batches && tour.batches.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[11px] uppercase tracking-wider font-bold text-stone-500 block">
                        Upcoming Departure Batches:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {tour.batches.map((batch: any, idx: number) => (
                          <span
                            key={idx}
                            className="px-3 py-1 rounded-xl bg-orange-50/80 border border-orange-200/80 text-orange-950 text-xs font-semibold flex items-center gap-1.5"
                          >
                            <Calendar className="w-3 h-3 text-[#ea580c]" />
                            {batch.label || (batch.startDate ? new Date(batch.startDate).toLocaleDateString() : `Batch ${idx + 1}`)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Inclusions */}
                  <div className="space-y-2 pt-2">
                    <span className="text-[11px] uppercase tracking-wider font-bold text-stone-500 block">
                      Sacred Inclusions:
                    </span>
                    <ul className="grid sm:grid-cols-2 gap-2 text-xs text-stone-700">
                      {(tour.inclusions || DEFAULT_AYYAPA_TRIP.inclusions).slice(0, 4).map((inc: string, idx: number) => (
                        <li key={idx} className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
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
                  className="w-full sm:flex-1 py-3 px-5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#ea580c] hover:bg-orange-700 text-white text-center shadow-md shadow-orange-600/25 transition-all flex items-center justify-center gap-2"
                >
                  <span>View Details & Reserve</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href={`https://wa.me/919966085310?text=${encodeURIComponent(`Swami Sharanam! I want to inquire about ${tour.title} (${tour.duration}). Please share batch dates and booking details.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto py-3 px-5 rounded-full text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Group / Bhajan Mandali Special Booking Callout */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="bg-orange-50/70 p-8 sm:p-12 rounded-3xl border border-orange-200/90 shadow-sm space-y-6">
          <div className="size-14 rounded-full bg-orange-100 border border-orange-200 text-[#ea580c] flex items-center justify-center mx-auto shadow-xs">
            <Users className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-stone-900">
              Bhajan Mandali & Devotee Group Bookings
            </h3>
            <p className="text-stone-600 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
              Planning a group yatra with your local temple or Ayyappa Seva Samithi? We provide customized AC/Non-AC buses, exclusive Guruswamy coordination, and tailored pooja stops for your group.
            </p>
          </div>

          <a
            href={`https://wa.me/919966085310?text=${encodeURIComponent("Swami Sharanam! We are planning an Ayyapa Swamy group yatra / Bhajan Mandali trip. Please provide details and special group arrangements.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#ea580c] hover:bg-orange-700 text-white shadow-lg shadow-orange-600/25 transition-all active:scale-95"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Inquire for Group Yatra via WhatsApp</span>
          </a>
        </div>
      </section>
    </div>
  );
}
