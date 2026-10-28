"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Trophy,
  Calendar,
  MapPin,
  Clock,
  IndianRupee,
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Share2,
  ChevronLeft,
  Loader2,
  ExternalLink,
  Award
} from "lucide-react";
import { Button } from "@/components/ui/button";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function DynamicEventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Registration Form State
  const [teamName, setTeamName] = useState("");
  const [player1Name, setPlayer1Name] = useState("");
  const [player1Phone, setPlayer1Phone] = useState("");
  const [player1Email, setPlayer1Email] = useState("");
  const [player2Name, setPlayer2Name] = useState("");
  const [player2Phone, setPlayer2Phone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [regSuccess, setRegSuccess] = useState<any>(null);

  useEffect(() => {
    if (!slug) return;

    async function loadEvent() {
      try {
        const res = await fetch(`${API_URL}/events/${slug}`);
        if (!res.ok) {
          throw new Error("Event not found");
        }
        const data = await res.json();
        setEvent(data);
      } catch (err: any) {
        setError(err.message || "Failed to load event");
      } finally {
        setLoading(false);
      }
    }

    loadEvent();
  }, [slug]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;

    setSubmitting(true);
    setError(null);

    try {
      // Create payment order or direct registration
      const payload = {
        eventId: event.slug || event._id,
        eventName: event.title,
        teamName,
        player1Name,
        player1Phone,
        player1Email,
        player2Name: player2Name || "N/A",
        player2Phone: player2Phone || "N/A",
        amount: event.entryFee || 0
      };

      if (event.entryFee && event.entryFee > 0) {
        // Submit PayU event order
        const res = await fetch(`${API_URL}/payment/create-event-order`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to initialize payment");

        // Submit form to PayU checkout URL
        if (data.paymentUrl && data.params) {
          const form = document.createElement("form");
          form.method = "POST";
          form.action = data.paymentUrl;

          Object.keys(data.params).forEach((key) => {
            const input = document.createElement("input");
            input.type = "hidden";
            input.name = key;
            input.value = data.params[key];
            form.appendChild(input);
          });

          document.body.appendChild(form);
          form.submit();
          return;
        }
      } else {
        // Free Event Registration
        const res = await fetch(`${API_URL}/payment/create-event-order`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, amount: 0 })
        });
        const data = await res.json();
        setRegSuccess({
          bookingId: data.bookingId || `EVT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          teamName
        });
      }
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-stone-50 flex items-center justify-center pt-24 font-sans">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-stone-600">Loading event details...</p>
        </div>
      </main>
    );
  }

  if (error || !event) {
    return (
      <main className="min-h-screen bg-stone-50 flex items-center justify-center pt-24 px-4 font-sans">
        <div className="bg-white p-8 rounded-3xl border border-stone-200 max-w-md text-center space-y-4 shadow-sm">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold text-stone-900">Event Not Found</h2>
          <p className="text-xs text-stone-500">
            This event may have been updated, removed, or concluded by the organizers.
          </p>
          <Link
            href="/events"
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-stone-900 text-white hover:bg-black transition-all"
          >
            Browse All Events
          </Link>
        </div>
      </main>
    );
  }

  const isCompleted = event.status === "completed";
  const isCancelled = event.status === "cancelled";
  const isOpen = event.registrationOpen && !isCompleted && !isCancelled;

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900 pt-24 pb-20 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-900 transition-colors uppercase tracking-wider"
          >
            <ChevronLeft className="w-4 h-4" /> Back to All Events
          </Link>

          <span
            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              isCompleted
                ? "bg-stone-200 text-stone-700"
                : isCancelled
                ? "bg-red-100 text-red-600"
                : "bg-emerald-100 text-emerald-700"
            }`}
          >
            {isCompleted ? "Event Concluded" : isCancelled ? "Cancelled" : "Registration Open"}
          </span>
        </div>

        {/* Hero Banner Card */}
        <div className="bg-stone-950 rounded-3xl overflow-hidden border border-stone-800 text-white shadow-xl relative">
          {event.bannerImage ? (
            <div className="relative h-64 sm:h-80 md:h-96 w-full">
              <img
                src={event.bannerImage}
                alt={event.title}
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/50 to-transparent" />
            </div>
          ) : (
            <div className="h-48 sm:h-64 bg-gradient-to-tr from-stone-950 via-stone-900 to-stone-950" />
          )}

          <div className="p-6 sm:p-10 -mt-24 sm:-mt-32 relative z-10 space-y-4 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-wider">
              <Trophy className="w-3.5 h-3.5" />
              {event.category} {event.tagline && `• ${event.tagline}`}
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
              {event.title}
            </h1>

            {/* Quick Specs Bar */}
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs sm:text-sm text-stone-300">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#ea580c]" />
                <span>{event.date}</span>
                {event.time && <span className="text-stone-400">({event.time})</span>}
              </div>

              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#ea580c]" />
                <span>{event.venue}, {event.city}</span>
              </div>

              {event.prizePool && (
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <Award className="w-4 h-4" />
                  <span>Prize Pool: {event.prizePool}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Details & Rules */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Description */}
            {event.description && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-2xs space-y-3">
                <h2 className="text-lg font-bold text-stone-900">About the Event</h2>
                <p className="text-sm text-stone-600 leading-relaxed whitespace-pre-line">
                  {event.description}
                </p>
              </div>
            )}

            {/* Rules & Guidelines */}
            {Array.isArray(event.rules) && event.rules.length > 0 && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-2xs space-y-4">
                <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-orange-600" />
                  Rules & Eligibility Guidelines
                </h2>
                <ul className="space-y-2.5 text-xs sm:text-sm text-stone-600">
                  {event.rules.map((rule: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-orange-100 text-[#ea580c] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Venue Location Details */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-2xs space-y-4">
              <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-600" />
                Tournament Venue
              </h2>
              <div className="space-y-1 text-sm text-stone-700">
                <p className="font-bold text-stone-900">{event.venue}</p>
                <p className="text-xs text-stone-500">{event.city}</p>
              </div>

              {event.googleMapsUrl && (
                <a
                  href={event.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#ea580c] hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Open in Google Maps
                </a>
              )}
            </div>
          </div>

          {/* Right Column: Registration Card */}
          <div className="space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-md space-y-5 sticky top-28">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Entry Details</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-black text-stone-900">
                    {event.entryFee && event.entryFee > 0 ? `₹${event.entryFee}` : "FREE"}
                  </span>
                  {event.teamSize && (
                    <span className="text-xs text-stone-500 font-semibold">/ {event.teamSize}</span>
                  )}
                </div>
              </div>

              {/* Status Message */}
              {!isOpen ? (
                <div className="p-4 bg-stone-100 rounded-2xl text-center space-y-2">
                  <p className="text-xs font-bold text-stone-700">
                    {isCompleted
                      ? "This event has already concluded."
                      : "Registrations are currently closed for this event."}
                  </p>
                  <p className="text-[11px] text-stone-500">
                    Stay tuned for upcoming editions by joining our community group.
                  </p>
                  <Link
                    href="/events"
                    className="block text-xs font-bold text-[#ea580c] hover:underline pt-1"
                  >
                    View other events →
                  </Link>
                </div>
              ) : regSuccess ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <h4 className="text-sm font-bold text-emerald-900">Registration Confirmed!</h4>
                  <p className="text-xs text-emerald-700">
                    Team: <strong>{regSuccess.teamName}</strong>
                    <br />
                    Ref ID: {regSuccess.bookingId}
                  </p>
                  <p className="text-[11px] text-stone-500 pt-1">
                    See you on the court/field!
                  </p>
                </div>
              ) : (
                /* Registration Form */
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-700">Team / Participant Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Smash Strikers"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-700">Primary Contact Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={player1Name}
                      onChange={(e) => setPlayer1Name(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-stone-700">Phone *</label>
                      <input
                        type="tel"
                        required
                        placeholder="9876543210"
                        value={player1Phone}
                        onChange={(e) => setPlayer1Phone(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-stone-700">Email *</label>
                      <input
                        type="email"
                        required
                        placeholder="you@email.com"
                        value={player1Email}
                        onChange={(e) => setPlayer1Email(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  {event.teamSize?.toLowerCase().includes("double") && (
                    <div className="space-y-2 pt-2 border-t border-stone-100">
                      <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Player 2 Details</div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          required
                          placeholder="Partner Name *"
                          value={player2Name}
                          onChange={(e) => setPlayer2Name(e.target.value)}
                          className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none"
                        />
                        <input
                          type="tel"
                          required
                          placeholder="Partner Phone *"
                          value={player2Phone}
                          onChange={(e) => setPlayer2Phone(e.target.value)}
                          className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="p-2.5 rounded-xl bg-red-50 text-red-600 text-xs font-semibold">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-[#ea580c] hover:bg-orange-600 text-white font-bold rounded-2xl shadow-sm text-xs uppercase tracking-wider"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Processing...
                      </>
                    ) : event.entryFee && event.entryFee > 0 ? (
                      `Pay Entry Fee (₹${event.entryFee})`
                    ) : (
                      "Confirm Free Registration"
                    )}
                  </Button>
                </form>
              )}

              {/* Helpline Info */}
              {event.contactPhone && (
                <div className="text-center pt-2 text-xs text-stone-500">
                  Questions? Call/WhatsApp{" "}
                  <a
                    href={`tel:${event.contactPhone}`}
                    className="font-bold text-stone-800 hover:text-[#ea580c]"
                  >
                    {event.contactPhone}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
