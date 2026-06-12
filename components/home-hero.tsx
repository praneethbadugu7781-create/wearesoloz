"use client";

import { useRef, useState, useEffect } from "react";
import { Star } from "lucide-react";

interface TripItem {
  destination: string;
  slug: string;
  duration: string;
  price: string;
  image: string;
}

interface HomeHeroProps {
  title: string;
  subheading: string;
  trips: TripItem[];
  heroImage?: string;
}

export function HomeHero({ title, subheading, trips, heroImage }: HomeHeroProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(25); // Starts at 25% or 33.33%

  const openBookingModal = (e: React.MouseEvent, destName?: string) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent("open-booking-modal", {
      detail: { destination: destName }
    }));
  };

  const handleScroll = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      const maxScroll = scrollWidth - clientWidth;
      if (maxScroll > 0) {
        // Map scroll percentage to width between 25% and 100%
        const pct = (scrollLeft / maxScroll) * 75 + 25;
        setScrollProgress(pct);
      } else {
        setScrollProgress(25);
      }
    }
  };

  // Attach native scroll listener to handle inertia scrolling on mobile/trackpads
  useEffect(() => {
    const el = sliderRef.current;
    if (el) {
      el.addEventListener("scroll", handleScroll, { passive: true });
      return () => el.removeEventListener("scroll", handleScroll);
    }
  }, []);

  return (
    <section className="home-hero-section min-h-screen pt-32 pb-16 flex flex-col justify-between z-10 bg-[#faf9f6] relative overflow-hidden">
      {/* Background Image webp layout */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 scale-102"
          style={{
            backgroundImage: `url('${heroImage || 'https://cdn.prod.website-files.com/68b4aefe0f5b95bfbdc12b0b/68b6a7425c15d1ac23bc168e_Hero%20image%20(1).webp'}')`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#faf9f6] via-[#faf9f6]/40 to-transparent" />
      </div>

      {/* Floating ambient glow */}
      <div className="absolute top-1/4 left-1/4 size-[400px] rounded-full bg-[#ff7a1a]/5 blur-[120px] pointer-events-none" />

      {/* Hero Typography & CTA */}
      <div className="section-shell relative z-10 w-full text-center my-auto px-4">
        <div className="max-w-4xl mx-auto flex flex-col items-center space-y-6">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white/75 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.25em] text-[#ea580c] backdrop-blur-md"
          >
            Start Solo. Travel Together.
          </div>

          {/* Heading */}
          <h1
            className="font-display text-4xl sm:text-6xl md:text-7xl font-extrabold leading-[1.12] tracking-tight text-stone-900 max-w-3xl"
          >
            {title || "Your Next Adventure Starts Here"}
          </h1>

          {/* Subheading */}
          <p
            className="mx-auto max-w-xl text-sm sm:text-base text-stone-600 leading-relaxed font-medium font-body"
          >
            {subheading}
          </p>

          {/* Webflow button-2 (Gooey SVG Filter CTA) */}
          <div className="pt-2">
            <a href="#" onClick={(e) => openBookingModal(e)} className="button-2 w-inline-block">
              <div className="button-3_content-wrap border border-stone-200/50 shadow-sm">
                <div>Book Your Tour</div>
              </div>
              <div className="button-3_arrow-wrapper">
                <div className="button_arrow-icon">
                  <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#clip0_200_259)">
                      <path d="M15.4999 0H7.16657V0.666667H15.3619L0.503906 15.5247L0.97524 15.996L15.8332 1.138V9.33333H16.4999V1C16.4999 0.448667 16.0512 0 15.4999 0Z" fill="#080705"/>
                    </g>
                    <defs>
                      <clipPath id="clip0_200_259">
                        <rect width="16" height="16" fill="white" transform="translate(0.5)"/>
                      </clipPath>
                    </defs>
                  </svg>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Content: Reviews (Left) + Horizontal Slider (Right) */}
      <div className="relative z-10 mt-auto pt-10 border-t border-stone-200/40 bg-gradient-to-t from-[#faf9f6]/90 to-transparent">
        <div className="mx-auto max-w-7xl px-4 md:px-8 flex flex-col lg:grid lg:grid-cols-[1fr_1.8fr] gap-8 items-center">
          
          {/* Trust Index Card (Gavisor style review-box) */}
          <div className="review-box shrink-0 flex flex-col md:flex-row md:items-center justify-between md:max-w-none lg:flex-col lg:items-start lg:justify-start gap-4 w-full bg-white/80 border border-stone-200/50 shadow-sm backdrop-blur-xl rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <img 
                src="https://cdn.prod.website-files.com/68b4aefe0f5b95bfbdc12b0b/68b6bed98318d5e10f50a3ea_Govaisor.webp" 
                alt="Gavisor Rating Logo" 
                className="gavisor-image"
              />
              <div className="gavisor-line" />
              <span className="rating-num">5.0</span>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <div className="gavisor-stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <img 
                    key={i} 
                    src="https://cdn.prod.website-files.com/68b4aefe0f5b95bfbdc12b0b/68b6bf529795d46ee5eed98b_star.webp" 
                    alt="Review Star" 
                    className="gavisor-star"
                  />
                ))}
              </div>
              <p className="text-xs text-stone-500 font-semibold uppercase tracking-wider">Based on 500+ memories</p>
            </div>
          </div>

          {/* Slider Overflow for upcoming trips */}
          <div className="relative w-full overflow-hidden flex flex-col gap-3">
            {/* Slider Track */}
            <div
              ref={sliderRef}
              className="flex gap-4 overflow-x-auto scrollbar-none pb-4 scroll-smooth select-none snap-x snap-mandatory"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {trips.map((trip) => (
                <div
                  key={trip.slug}
                  className="snap-start flex-none w-[270px] sm:w-[310px] bg-white text-[#080705] rounded-3xl p-2 pb-4 flex flex-col justify-between group cursor-pointer border border-stone-200/50 shadow-sm hover:shadow-md transition-all duration-300"
                  onClick={(e) => openBookingModal(e, trip.destination)}
                >
                  <div className="packages-overflow relative aspect-[16/11] w-full rounded-2xl overflow-hidden mb-4 bg-stone-100">
                    <img
                      src={trip.image}
                      alt={trip.destination}
                      className="packages-item-image h-full w-full object-cover transition-transform duration-700 group-hover:scale-103"
                    />
                    <div className="booking-open white-color">
                      {trip.price === "Contact for Price" ? "Contact for Price" : `From ${trip.price}`}
                    </div>
                  </div>

                  <div className="px-3 flex items-center justify-between">
                    <div className="min-w-0 pr-2">
                      <h4 className="font-display text-base font-extrabold text-[#080705] truncate leading-tight group-hover:text-soloz-ember transition duration-300">
                        {trip.destination}
                      </h4>
                      <p className="text-[10px] text-stone-500 font-bold mt-1 uppercase tracking-wider">{trip.duration}</p>
                    </div>
                    
                    {/* Shifting Arrow Button */}
                    <div className="button-icon-block slider flex-shrink-0 bg-stone-100 border border-stone-200 text-[#080705] group-hover:bg-[#ff7a1a] group-hover:border-[#ff7a1a] group-hover:text-white transition duration-300">
                      <div className="button-arrow-block">
                        <div className="arrow-item">
                          <svg width="12" height="12" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15.4999 0H7.16657V0.666667H15.3619L0.503906 15.5247L0.97524 15.996L15.8332 1.138V9.33333H16.4999V1C16.4999 0.448667 16.0512 0 15.4999 0Z" fill="currentColor"/>
                          </svg>
                        </div>
                        <div className="arrow-item-02">
                          <svg width="12" height="12" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15.4999 0H7.16657V0.666667H15.3619L0.503906 15.5247L0.97524 15.996L15.8332 1.138V9.33333H16.4999V1C16.4999 0.448667 16.0512 0 15.4999 0Z" fill="currentColor"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Slider Progress Bar synced with scroll */}
            <div className="booking-underline !bg-stone-200/50">
              <div 
                className="booking-line-animation"
                style={{ width: `${scrollProgress}%` }}
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
