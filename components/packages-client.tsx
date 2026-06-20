"use client";

import { getOptimizedImageUrl } from "@/lib/utils";

interface TripItem {
  destination: string;
  slug: string;
  duration: string;
  price: string;
  image: string;
}

interface PackagesClientProps {
  trips: TripItem[];
}

export function PackagesClient({ trips }: PackagesClientProps) {
  const openBookingModal = (e: React.MouseEvent, destName: string) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent("open-booking-modal", {
      detail: { destination: destName }
    }));
  };

  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {trips.map((trip: any) => (
        <div key={trip.slug} className="w-dyn-item">
          <a
            href="#"
            onClick={(e) => openBookingModal(e, trip.destination)}
            className="packages-item-link w-inline-block group"
          >
            <div className="overflow-hidden packages-overflow aspect-[16/11] bg-stone-900 border border-white/10">
              <img
                src={getOptimizedImageUrl(trip.image, 600)}
                alt={trip.destination}
                loading="lazy"
                className="packages-item-image h-full w-full object-cover transition-transform duration-700 group-hover:scale-103"
              />
              <div className="booking-open white-color">Booking Open</div>
            </div>
            
            <div className="package-item-detaik">
              <div className="package-item-top flex justify-between items-center w-full mb-3">
                <div className="package-item-name font-display text-lg font-bold text-white group-hover:text-soloz-ember transition duration-300">
                  {trip.destination}
                </div>
                <div className="package-item-price shrink-0 text-[11px] font-bold text-soloz-amber border border-white/10 bg-white/5 px-3 py-1 rounded-full">
                  {trip.price} / {trip.duration}
                </div>
              </div>
              
              <p className="large-paragraph package-short-desp text-soloz-ash/80 text-xs leading-relaxed mb-4 line-clamp-2">
                Join our community group for this unforgettable route. Includes base camps, guides, local transit, and compatible solo matching.
              </p>
              
              {/* Button 03 (slide dual text) */}
              <div className="button-03 white w-full text-center">
                <div className="button-2-texts mx-auto">
                  <div className="button-text">Book Now</div>
                  <div className="button-text-02">Book Now</div>
                </div>
              </div>
            </div>
          </a>
        </div>
      ))}
    </div>
  );
}
