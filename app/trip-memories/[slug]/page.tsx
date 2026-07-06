"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getApiUrl } from "@/lib/api";
import { useLanguage } from "@/lib/LanguageContext";
import { getOptimizedImageUrl } from "@/lib/utils";
import {
  Users,
  Camera,
  BookOpen,
  MapPin,
  Calendar,
  Loader2,
  ArrowLeft,
  X,
  Compass,
  Play,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MemoryPost {
  _id: string;
  tripId: string;
  title?: string;
  text: string;
  photos: string[];
  authorName: string;
  createdAt: string;
}

interface CompletedTrip {
  _id: string;
  destination: string;
  state: string;
  category: string;
  slug: string;
  date: string;
  duration: string;
  price: string;
  seats: number;
  image: string;
  images: string[];
  recap?: string;
  memoryImage?: string;
  memoryCoverImage?: string;
}

export default function TripMemoryDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { locale } = useLanguage();

  const [trip, setTrip] = useState<CompletedTrip | null>(null);
  const [posts, setPosts] = useState<MemoryPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxMediaIndex, setLightboxMediaIndex] = useState(0);
  const [lightboxMediaList, setLightboxMediaList] = useState<{ url: string; authorName: string; text: string; date: string }[]>([]);

  useEffect(() => {
    fetchTripDetails();
  }, [slug]);

  const fetchTripDetails = async () => {
    setLoading(true);
    try {
      const API_URL = getApiUrl();
      // Fetch trip settings
      const tripRes = await fetch(`${API_URL}/trips/${slug}`);
      if (!tripRes.ok) throw new Error("Trip not found");
      const tripData = await tripRes.json();
      setTrip(tripData);

      // Fetch memory posts
      const postsRes = await fetch(`${API_URL}/memories/trips/${tripData._id}/posts`);
      if (postsRes.ok) {
        const postsData = await postsRes.json();
        setPosts(postsData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(locale === "te" ? "te-IN" : locale === "hi" ? "hi-IN" : "en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const isVideo = (url: string) => {
    if (!url) return false;
    const cleanUrl = url.split("?")[0].toLowerCase();
    return (
      cleanUrl.endsWith(".mp4") ||
      cleanUrl.endsWith(".webm") ||
      cleanUrl.endsWith(".ogg") ||
      cleanUrl.endsWith(".mov") ||
      url.includes("/video/upload/")
    );
  };

  const openLightbox = (url: string) => {
    const mediaList: { url: string; authorName: string; text: string; date: string }[] = [];
    posts.forEach(post => {
      if (post.photos) {
        post.photos.forEach(ph => {
          mediaList.push({
            url: ph,
            authorName: post.authorName,
            text: post.title || post.text,
            date: formatDateTime(post.createdAt)
          });
        });
      }
    });

    const index = mediaList.findIndex(item => item.url === url);
    if (index !== -1) {
      setLightboxMediaList(mediaList);
      setLightboxMediaIndex(index);
      setLightboxOpen(true);
    }
  };

  // Compile all photos across all memories for the sidebar gallery
  const allPostPhotos: string[] = [];
  posts.forEach(p => {
    if (p.photos && p.photos.length > 0) {
      allPostPhotos.push(...p.photos);
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50/50 flex flex-col justify-center items-center gap-2.5 text-stone-400">
        <Loader2 className="animate-spin text-[#ea580c]" size={28} />
        <span className="text-xs uppercase tracking-widest font-semibold font-display">Loading scrapbook archive...</span>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-stone-50/50 flex flex-col justify-center items-center gap-3 p-4 text-center">
        <p className="text-sm font-semibold text-stone-500">Trip scrapbook memory details could not be found.</p>
        <Link href="/trip-memories" className="px-5 py-2 bg-stone-900 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-stone-850 transition">
          Back to Memories
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-stone-50/50 pb-20">
      
      {/* Cinematic Banner */}
      <section className="relative h-[40vh] md:h-[50vh] w-full bg-stone-950 overflow-hidden">
        <img
          src={getOptimizedImageUrl(trip.memoryCoverImage || trip.image, 1200)}
          alt={trip.destination}
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/35 to-black/20" />
        
        <div className="absolute bottom-6 left-4 md:bottom-12 md:left-12 text-white space-y-2">
          <Link 
            href="/trip-memories"
            className="inline-flex items-center gap-1.5 text-xs text-white/80 hover:text-white mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Memories
          </Link>
          <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-widest text-orange-300">
            <MapPin className="w-3.5 h-3.5" /> {trip.state} · {trip.category}
          </div>
          <h1 className="font-display text-2xl md:text-5xl font-extrabold uppercase tracking-tight">
            {trip.destination}
          </h1>
          <div className="flex flex-wrap gap-4 text-xs text-white/95 mt-1 font-semibold">
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-[#ea580c]" /> {formatDate(trip.date)}</span>
            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-[#ea580c]" /> {trip.seats || 0} Travelers</span>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-10 mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Memories feed & recap */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* Trip Recap Written by Admin */}
          {trip.recap && (
            <div className="bg-white border border-stone-200/80 rounded-2xl p-6 shadow-sm space-y-3">
              <h3 className="font-display text-lg font-bold text-stone-850 flex items-center gap-2">
                <Compass className="w-5 h-5 text-[#ea580c]" /> Trip Recap
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed font-body">
                {trip.recap}
              </p>
            </div>
          )}

          {/* Traveler Memory Posts */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl font-medium text-stone-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#ea580c]" /> Traveler Memory Cards
              </h3>
            </div>

            {posts.length === 0 ? (
              <div className="text-center py-16 bg-white border border-stone-200/80 rounded-2xl shadow-sm p-6 text-stone-400 italic text-xs">
                No memories posted yet. Check back soon for scrapbook updates!
              </div>
            ) : (
              <div className="space-y-6">
                {posts.map((post) => {
                  return (
                    <div 
                      key={post._id}
                      className="bg-white border border-stone-200/80 rounded-2xl p-5 md:p-6 shadow-sm space-y-4"
                    >
                      {/* Post Header */}
                      <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                        <div>
                          <div className="text-sm font-bold text-stone-900">{post.authorName}</div>
                          <div className="text-[10px] text-stone-500 uppercase font-semibold">{formatDateTime(post.createdAt)}</div>
                        </div>
                        <div className="px-2 py-0.5 rounded bg-orange-50 text-[#ea580c] text-[9px] uppercase tracking-wider font-extrabold">
                          Verified Moment
                        </div>
                      </div>

                      {/* Post Content */}
                      <div className="space-y-3">
                        {post.title && (
                          <h4 className="font-display text-base md:text-lg font-bold text-stone-850">
                            {post.title}
                          </h4>
                        )}
                        <p className="text-sm text-stone-600 leading-relaxed whitespace-pre-line font-body">
                          {post.text}
                        </p>

                        {/* Post Media Grid */}
                        {post.photos && post.photos.length > 0 && (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                            {post.photos.map((ph, idx) => {
                              const isVid = isVideo(ph);
                              return (
                                <div 
                                  key={idx} 
                                  onClick={() => openLightbox(ph)}
                                  className="relative aspect-video rounded-xl overflow-hidden bg-stone-100 border border-stone-200/50 cursor-pointer group shadow-sm select-none"
                                >
                                  {isVid ? (
                                    <div className="relative w-full h-full">
                                      <video 
                                        src={ph}
                                        className="object-cover w-full h-full pointer-events-none"
                                        muted
                                        playsInline
                                      />
                                      {/* Play overlay button */}
                                      <div className="absolute inset-0 bg-black/10 flex items-center justify-center group-hover:bg-black/35 transition-colors">
                                        <div className="size-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 transition transform group-hover:scale-110 shadow-md">
                                          <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <img 
                                      src={getOptimizedImageUrl(ph, 400)}
                                      alt="Travel scrap" 
                                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                                    />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Right Side: Photo Scrapbook Gallery */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Trip Gallery compilations */}
          <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-[#ea580c]" /> Scrapbook Gallery
            </h3>
            {allPostPhotos.length === 0 ? (
              <div className="text-xs text-stone-400 italic py-6 text-center">
                No photos or videos compiled yet.
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {allPostPhotos.slice(0, 12).map((pic, idx) => {
                  const isVid = isVideo(pic);
                  return (
                    <div 
                      key={idx} 
                      onClick={() => openLightbox(pic)}
                      className="relative aspect-square rounded-lg overflow-hidden bg-stone-100 border border-stone-200/50 cursor-pointer group shadow-sm select-none"
                    >
                      {isVid ? (
                        <div className="relative w-full h-full">
                          <video 
                            src={pic}
                            className="object-cover w-full h-full pointer-events-none"
                            muted
                            playsInline
                          />
                          <div className="absolute inset-0 bg-black/10 flex items-center justify-center group-hover:bg-black/35 transition-colors">
                            <div className="size-6 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 transition transform group-hover:scale-110 shadow-sm">
                              <Play className="w-2.5 h-2.5 fill-white ml-0.5" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <img 
                          src={getOptimizedImageUrl(pic, 250)}
                          alt="Scrapbook snapshot"
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Cinematic Lightbox Modal */}
      <AnimatePresence>
        {lightboxOpen && lightboxMediaList.length > 0 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute right-6 top-6 text-white/70 hover:text-white transition-colors z-50 bg-white/10 hover:bg-white/20 p-2 rounded-full backdrop-blur-md"
            >
              <X size={20} />
            </button>

            {/* Previous Button */}
            {lightboxMediaList.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxMediaIndex((prev) => (prev === 0 ? lightboxMediaList.length - 1 : prev - 1));
                }}
                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-50 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full backdrop-blur-md transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
            )}

            {/* Next Button */}
            {lightboxMediaList.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxMediaIndex((prev) => (prev === lightboxMediaList.length - 1 ? 0 : prev + 1));
                }}
                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-50 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full backdrop-blur-md transition-colors"
              >
                <ChevronRight size={24} />
              </button>
            )}

            {/* Media Content Wrapper */}
            <div 
              className="w-full max-w-5xl h-[80vh] flex flex-col md:flex-row rounded-2xl overflow-hidden bg-stone-900 border border-white/10 shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Left Column: Media Display */}
              <div className="flex-1 bg-black flex items-center justify-center relative group min-h-[40vh] md:min-h-0">
                {isVideo(lightboxMediaList[lightboxMediaIndex].url) ? (
                  <video
                    key={lightboxMediaList[lightboxMediaIndex].url}
                    src={lightboxMediaList[lightboxMediaIndex].url}
                    controls
                    autoPlay
                    playsInline
                    className="max-w-full max-h-[75vh] object-contain"
                  />
                ) : (
                  <img
                    src={lightboxMediaList[lightboxMediaIndex].url}
                    alt="Lightbox media preview"
                    className="max-w-full max-h-[75vh] object-contain select-none"
                  />
                )}
              </div>

              {/* Right Column: Author Info & Story Description */}
              <div className="w-full md:w-80 bg-stone-950 p-6 flex flex-col justify-between text-white shrink-0 border-t md:border-t-0 md:border-l border-white/10">
                <div className="space-y-4 overflow-y-auto max-h-[25vh] md:max-h-full">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-orange-600 flex items-center justify-center text-xs font-bold text-white uppercase select-none">
                      {lightboxMediaList[lightboxMediaIndex].authorName.slice(0, 2)}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white leading-tight">
                        {lightboxMediaList[lightboxMediaIndex].authorName}
                      </div>
                      <div className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider">
                        {lightboxMediaList[lightboxMediaIndex].date}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-4 space-y-2">
                    <h5 className="text-[10px] uppercase tracking-wider text-orange-400 font-bold">Memory Share</h5>
                    <p className="text-xs text-stone-300 leading-relaxed font-body whitespace-pre-line">
                      {lightboxMediaList[lightboxMediaIndex].text}
                    </p>
                  </div>
                </div>

                <div className="mt-4 border-t border-white/10 pt-4 flex items-center justify-between text-[10px] text-stone-500 font-bold uppercase tracking-wider">
                  <span>WeAreSoloz Scrapbook</span>
                  <span>{lightboxMediaIndex + 1} of {lightboxMediaList.length}</span>
                </div>
              </div>

            </div>
          </div>
        )}
      </AnimatePresence>

    </main>
  );
}
