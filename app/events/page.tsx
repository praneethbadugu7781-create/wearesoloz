"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Trophy,
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Users,
  Search,
  Sparkles,
  Award
} from "lucide-react";
import { LiquidMetalButton } from "@/components/LiquidMetalButton";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface EventItem {
  _id: string;
  title: string;
  slug: string;
  tagline?: string;
  category: string;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  date: string;
  time?: string;
  venue: string;
  city?: string;
  bannerImage?: string;
  description?: string;
  prizePool?: string;
  entryFee: number;
  teamSize?: string;
  registrationOpen: boolean;
}

export default function EventsDirectoryPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"upcoming" | "completed" | "all">("upcoming");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadEvents() {
      try {
        const res = await fetch(`${API_URL}/events?all=true`);
        if (res.ok) {
          const data = await res.json();
          setEvents(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to load events", err);
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, []);

  const filteredEvents = events.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.venue.toLowerCase().includes(search.toLowerCase()) ||
      (e.city && e.city.toLowerCase().includes(search.toLowerCase())) ||
      (e.category && e.category.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;

    if (filter === "all") return true;
    if (filter === "upcoming") return e.status === "upcoming" || e.status === "ongoing";
    if (filter === "completed") return e.status === "completed";
    return true;
  });

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900 pt-28 pb-20 font-sans">
      {/* Hero Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="relative rounded-3xl bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 p-8 sm:p-12 md:p-16 text-white overflow-hidden shadow-2xl border border-stone-800">
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-bold tracking-wider uppercase">
              <Trophy className="w-3.5 h-3.5" />
              SoloZ Community Events
            </div>

            <h1 className="font-display text-3xl sm:text-5xl font-medium tracking-tight leading-tight">
              Tournaments, Meetups & <span className="text-[#ea580c]">Sports Events</span>
            </h1>

            <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
              Connect beyond travels. Compete in community tournaments, attend weekend sports championships, and make lifelong friends in your city.
            </p>

            {/* Quick Filter Pill Buttons */}
            <div className="pt-4 flex flex-wrap gap-2.5">
              {[
                { id: "upcoming", label: "Upcoming Events" },
                { id: "completed", label: "Past Events / Highlights" },
                { id: "all", label: "All Events" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id as any)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                    filter === tab.id
                      ? "bg-[#ea580c] text-white shadow-md shadow-orange-600/30"
                      : "bg-white/10 text-stone-300 hover:bg-white/20"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Events Grid Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-3.5 rounded-2xl border border-stone-200/90 shadow-2xs">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-400" />
            <input
              type="text"
              placeholder="Search by event name, sport, or venue..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="text-xs font-semibold text-stone-500 self-end sm:self-center">
            Showing <span className="font-bold text-stone-900">{filteredEvents.length}</span> event{filteredEvents.length === 1 ? "" : "s"}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="py-24 text-center bg-white rounded-3xl border border-stone-200 shadow-2xs">
            <div className="w-10 h-10 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-stone-600">Discovering upcoming events...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          /* Empty State */
          <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-stone-300 p-8 space-y-4">
            <div className="w-16 h-16 bg-orange-50 text-[#ea580c] rounded-2xl flex items-center justify-center mx-auto">
              <Trophy className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-1.5">
              <h3 className="text-xl font-bold text-stone-900">
                {filter === "upcoming" ? "No Upcoming Events Right Now" : "No Events Found"}
              </h3>
              <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
                {filter === "upcoming"
                  ? "Previous tournaments have concluded! New sports championships and city meetups are announced regularly. Join our community to be the first to know!"
                  : "Try clearing your search query or check back soon for newly scheduled events."}
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/soloz-community"
                className="inline-flex items-center justify-center px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-stone-900 text-white hover:bg-black transition-all shadow-sm"
              >
                Join SoloZ Community
              </Link>
            </div>
          </div>
        ) : (
          /* Event Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((ev) => {
              const isUpcoming = ev.status === "upcoming" || ev.status === "ongoing";
              const isCompleted = ev.status === "completed";

              return (
                <div
                  key={ev._id}
                  className="group bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Event Banner */}
                    <div className="relative h-48 bg-stone-900 overflow-hidden">
                      {ev.bannerImage ? (
                        <img
                          src={ev.bannerImage}
                          alt={ev.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-tr from-stone-950 to-stone-800 text-white">
                          <Trophy className="w-12 h-12 text-[#ea580c] mb-2" />
                          <span className="text-xs uppercase tracking-widest font-bold text-stone-400">
                            {ev.category}
                          </span>
                        </div>
                      )}

                      {/* Status Badge */}
                      <div className="absolute top-3 left-3">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            ev.status === "upcoming"
                              ? "bg-emerald-500 text-white shadow-xs"
                              : ev.status === "ongoing"
                              ? "bg-purple-600 text-white animate-pulse shadow-xs"
                              : "bg-stone-800/90 backdrop-blur-md text-stone-300"
                          }`}
                        >
                          {ev.status === "completed" ? "Concluded" : ev.status}
                        </span>
                      </div>

                      {/* Entry Fee Badge */}
                      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black text-stone-900 shadow-sm">
                        {ev.entryFee && ev.entryFee > 0 ? `₹${ev.entryFee}` : "FREE ENTRY"}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 sm:p-6 space-y-4">
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-[#ea580c]">
                          {ev.category} {ev.tagline && `• ${ev.tagline}`}
                        </div>
                        <h3 className="text-lg font-bold text-stone-900 mt-1 line-clamp-2 leading-snug">
                          {ev.title}
                        </h3>
                      </div>

                      <div className="space-y-2 text-xs text-stone-600">
                        <div className="flex items-center gap-2.5">
                          <Calendar className="w-4 h-4 text-orange-500 shrink-0" />
                          <span className="font-semibold text-stone-800">{ev.date}</span>
                          {ev.time && <span className="text-stone-400">({ev.time})</span>}
                        </div>

                        <div className="flex items-center gap-2.5">
                          <MapPin className="w-4 h-4 text-orange-500 shrink-0" />
                          <span className="truncate">{ev.venue}, {ev.city}</span>
                        </div>

                        {ev.prizePool && (
                          <div className="flex items-center gap-2.5 text-emerald-700 font-bold">
                            <Award className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>Prize Pool: {ev.prizePool}</span>
                          </div>
                        )}
                      </div>

                      {ev.description && (
                        <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                          {ev.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Card Footer CTA */}
                  <div className="p-5 sm:p-6 pt-0">
                    <Link
                      href={`/events/${ev.slug}`}
                      className={`w-full py-3 px-4 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                        isUpcoming && ev.registrationOpen
                          ? "bg-stone-900 hover:bg-black text-white shadow-sm"
                          : "bg-stone-100 hover:bg-stone-200 text-stone-700"
                      }`}
                    >
                      <span>{isUpcoming && ev.registrationOpen ? "View & Register" : "Event Details"}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
