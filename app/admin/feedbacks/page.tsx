"use client";

import { getAuthHeaders } from "@/lib/api";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

import { useEffect, useState } from "react";
import { 
  Search, 
  Printer, 
  Download, 
  ExternalLink, 
  Copy, 
  RefreshCw, 
  Loader2, 
  Calendar, 
  Users, 
  X, 
  ChevronLeft, 
  Star, 
  CheckCircle,
  MessageSquare,
  ThumbsUp,
  Image as ImageIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Participant {
  name: string;
  phone: string;
}

interface TripData {
  _id?: string;
  destination: string;
  state: string;
  slug: string;
  date: string;
  duration: string;
  price: string;
  seats: number;
  description: string;
  image: string;
  images: string[];
  featured: boolean;
  status: "draft" | "published";
  participants?: Participant[];
  recap?: string;
  feedbackCode?: string;
  feedbackLinkEnabled?: boolean;
}

export default function AdminFeedbacksPage() {
  const [trips, setTrips] = useState<TripData[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [tripsSearch, setTripsSearch] = useState("");

  const [selectedTrip, setSelectedTrip] = useState<TripData | null>(null);
  const [feedbackSubmissions, setFeedbackSubmissions] = useState<any[]>([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);
  const [feedbacksSearch, setFeedbacksSearch] = useState("");
  const [selectedFeedbackDetail, setSelectedFeedbackDetail] = useState<any | null>(null);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    setLoadingTrips(true);
    try {
      const res = await fetch(`${API_URL}/admin/trips`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error("Failed to load trips");
      const data = await res.json();
      // Show trips that are published or have a feedback code
      setTrips(data.filter((t: TripData) => t.status === "published" || t.feedbackCode));
    } catch (err) {
      console.error(err);
      alert("Error loading trips. Please make sure you are signed in.");
    } finally {
      setLoadingTrips(false);
    }
  };

  const fetchFeedbacks = async (tripId: string) => {
    setLoadingFeedbacks(true);
    try {
      const res = await fetch(`${API_URL}/admin/trips/${tripId}/feedbacks`, {
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error("Failed to load feedback submissions");
      const data = await res.json();
      setFeedbackSubmissions(data);
    } catch (err: any) {
      alert(err.message || "Error loading feedbacks.");
    } finally {
      setLoadingFeedbacks(false);
    }
  };

  const handleDeleteFeedback = async (submissionId: string) => {
    if (!confirm("Are you sure you want to delete this feedback submission? This action cannot be undone.")) return;
    try {
      const res = await fetch(`${API_URL}/admin/feedbacks/${submissionId}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error("Failed to delete feedback submission");
      alert("Feedback submission deleted successfully.");
      setFeedbackSubmissions(prev => prev.filter(f => f._id !== submissionId));
    } catch (err: any) {
      alert(err.message || "Failed to delete feedback submission.");
    }
  };

  const handleSelectTrip = (trip: TripData) => {
    setSelectedTrip(trip);
    setFeedbackSubmissions([]);
    setFeedbacksSearch("");
    fetchFeedbacks(trip._id!);
  };

  const handleToggleFeedbackLink = async (trip: TripData) => {
    const currentStatus = trip.feedbackLinkEnabled !== false;
    const newStatus = !currentStatus;

    try {
      const res = await fetch(`${API_URL}/admin/trips/${trip._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ feedbackLinkEnabled: newStatus })
      });

      if (!res.ok) throw new Error("Failed to update status");

      setTrips(prev => prev.map(t => t._id === trip._id ? { ...t, feedbackLinkEnabled: newStatus } : t));
    } catch (err: any) {
      alert(err.message || "Failed to toggle feedback link status.");
    }
  };

  const handleUpdateFeedbackInDetail = async (updatedFields: Partial<TripData>) => {
    if (!selectedTrip) return;
    try {
      const res = await fetch(`${API_URL}/admin/trips/${selectedTrip._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(updatedFields)
      });

      if (!res.ok) throw new Error("Failed to update settings");

      const newTrip = { ...selectedTrip, ...updatedFields };
      setSelectedTrip(newTrip);
      setTrips(prev => prev.map(t => t._id === selectedTrip._id ? newTrip : t));
    } catch (err: any) {
      alert(err.message || "Failed to update feedback settings.");
    }
  };

  // CSV download helper
  const downloadFeedbacksCSV = () => {
    if (!selectedTrip || feedbackSubmissions.length === 0) return;
    
    const headers = [
      "Submission ID",
      "Full Name",
      "Mobile",
      "Email",
      "Overall Rating",
      "Accommodation Rating",
      "Transport Rating",
      "Captain Rating",
      "Loved Most Comments",
      "Improvement Comments",
      "Travel Again",
      "Recommend Friends",
      "Allow Testimonial",
      "Photos Count",
      "Submission Date"
    ];

    const rows = feedbackSubmissions.map(f => [
      f.submissionId,
      f.fullName,
      f.mobile,
      f.email || "N/A",
      f.ratings?.overallExperience || 0,
      f.ratings?.accommodation || 0,
      f.ratings?.transport || 0,
      f.ratings?.captain || 0,
      f.commentsLoved || "",
      f.commentsImprovements || "",
      f.travelAgain || "Yes",
      f.recommendFriends || "Yes",
      f.allowTestimonial ? "Yes" : "No",
      f.photos?.length || 0,
      new Date(f.createdAt).toLocaleDateString()
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${val.toString().replace(/"/g, '""')}"`).join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Feedbacks_${selectedTrip.destination.replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print helper
  const handlePrint = () => {
    if (!selectedTrip) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const rowsHTML = feedbackSubmissions.map(f => `
      <tr>
        <td>${f.submissionId}</td>
        <td>${f.fullName}<br/>${f.mobile}</td>
        <td>Overall: ${f.ratings?.overallExperience || 0} ⭐<br/>Stay: ${f.ratings?.accommodation || 0} ⭐</td>
        <td>Captain: ${f.ratings?.captain || 0} ⭐<br/>Drive: ${f.ratings?.transport || 0} ⭐</td>
        <td>Loved: ${f.commentsLoved || "N/A"}<br/>Improvements: ${f.commentsImprovements || "N/A"}</td>
        <td>Testimonial: ${f.allowTestimonial ? "Allowed" : "No"}</td>
      </tr>
    `).join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>Participant Review Feedback - ${selectedTrip.destination}</title>
          <style>
            body { font-family: sans-serif; padding: 20px; }
            h1 { font-size: 20px; margin-bottom: 5px; }
            h2 { font-size: 14px; color: #555; margin-top: 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 11px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; vertical-align: top; }
            th { background-color: #f4f4f4; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <h1>WeAreSoloZ - Travelers Feedback Summary</h1>
          <h2>Trip: ${selectedTrip.destination} | Departure Date: ${new Date(selectedTrip.date).toLocaleDateString()}</h2>
          <p>Total Review Submissions: ${feedbackSubmissions.length}</p>
          <table>
            <thead>
              <tr>
                <th>Sub ID</th>
                <th>Passenger</th>
                <th>Ratings (Group A)</th>
                <th>Ratings (Group B)</th>
                <th>Comments Details</th>
                <th>Consent</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHTML}
            </tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Filtered trips
  const filteredTrips = trips.filter(t => 
    t.destination.toLowerCase().includes(tripsSearch.toLowerCase())
  );

  return (
    <main className="space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-white flex items-center gap-2">
            <Star className="text-soloz-ember fill-soloz-ember" size={28} />
            Trip Feedbacks & Ratings
          </h1>
          <p className="text-xs text-soloz-ash/75 mt-1">
            Analyze customer reviews, trip captain ratings, stay quality scores, and photo uploads.
          </p>
        </div>

        {selectedTrip && (
          <Button onClick={() => setSelectedTrip(null)} variant="secondary" className="pt-0.5">
            <ChevronLeft size={16} className="mr-1.5" /> Back to Trips List
          </Button>
        )}
      </div>

      {/* TRIP GRID SELECTOR */}
      {!selectedTrip && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 max-w-sm">
            <Search className="text-soloz-ash/40" size={16} />
            <input
              type="text"
              placeholder="Search trips..."
              value={tripsSearch}
              onChange={(e) => setTripsSearch(e.target.value)}
              className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-white focus:border-soloz-ember/50 focus:outline-none"
            />
          </div>

          {loadingTrips ? (
            <div className="flex flex-col items-center justify-center py-20 text-soloz-ash/60">
              <Loader2 className="animate-spin text-soloz-ember mb-3" size={32} />
              <p className="text-xs">Loading trip feedback panels...</p>
            </div>
          ) : filteredTrips.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 p-12 text-center text-soloz-ash/60">
              No matching published trips found.
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTrips.map((trip) => {
                const isLinkEnabled = trip.feedbackLinkEnabled !== false;
                return (
                  <div
                    key={trip._id}
                    className="rounded-xl border border-white/10 bg-[#14110d] p-5 flex flex-col justify-between hover:border-white/20 transition-all space-y-4"
                  >
                    <div className="space-y-2">
                      <h3 className="font-display text-lg font-bold text-white leading-tight">
                        {trip.destination}
                      </h3>
                      <div className="flex flex-col gap-1 text-xs text-soloz-ash/70">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-soloz-ember" />
                          Departure: {new Date(trip.date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Users size={13} className="text-soloz-ember" />
                          Expected: {trip.participants?.length || 0} Travelers
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-4">
                      <button
                        onClick={() => handleToggleFeedbackLink(trip)}
                        className={`text-[10px] px-2.5 py-1 rounded font-bold uppercase tracking-wider border transition-all ${
                          isLinkEnabled
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                            : "bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20"
                        }`}
                      >
                        Link: {isLinkEnabled ? "Active" : "Disabled"}
                      </button>

                      <button
                        onClick={() => handleSelectTrip(trip)}
                        className="px-3 py-1.5 rounded bg-soloz-ember/10 border border-soloz-ember/25 text-soloz-ember hover:bg-soloz-ember/20 text-xs font-bold transition-all"
                      >
                        Reviews Dashboard
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TRIP DETAIL FEEDBACK LEDGER */}
      {selectedTrip && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Header Summary Card */}
          <div className="rounded-xl border border-white/10 bg-[#14110d] p-6 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="bg-orange-500/10 text-[#ea580c] px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-orange-500/20">
                  Trips Rating Summary
                </span>
                <h2 className="font-display text-2xl font-bold text-white mt-2">
                  {selectedTrip.destination}
                </h2>
                <div className="flex flex-wrap gap-4 text-xs text-soloz-ash/60 mt-1">
                  <span>Departure Date: {new Date(selectedTrip.date).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button 
                  onClick={handlePrint}
                  variant="secondary" 
                  className="h-9 text-xs border-white/10 text-white hover:bg-white/5"
                >
                  <Printer size={14} className="mr-1.5 text-blue-400" /> Print Summary
                </Button>
                <Button 
                  onClick={downloadFeedbacksCSV}
                  variant="secondary" 
                  className="h-9 text-xs border-white/10 text-white hover:bg-white/5"
                >
                  <Download size={14} className="mr-1.5 text-emerald-400" /> Export CSV
                </Button>
                <Button
                  onClick={() => fetchFeedbacks(selectedTrip._id!)}
                  variant="secondary"
                  className="h-9 text-xs border-white/10 text-white hover:bg-white/5"
                >
                  <RefreshCw size={14} className="mr-1.5" /> Refresh List
                </Button>
              </div>
            </div>

            {/* Waiver Confirmation Link Container */}
            <div className="border-t border-white/5 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/[0.01] p-3 rounded-lg border border-white/[0.05]">
              <div className="space-y-1 flex-1">
                <div className="text-[10px] uppercase font-bold text-soloz-ash/60">Shareable Feedback Request Link</div>
                {selectedTrip.feedbackCode ? (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="font-mono text-xs text-soloz-amber break-all">
                      {`${typeof window !== "undefined" ? window.location.origin : ""}/trip-feedback/${selectedTrip.feedbackCode}`}
                    </span>
                    <button
                      onClick={() => {
                        const link = `${window.location.origin}/trip-feedback/${selectedTrip.feedbackCode}`;
                        navigator.clipboard.writeText(link);
                        alert("Feedback Link Copied!");
                      }}
                      className="text-[10px] text-soloz-ember font-bold hover:underline flex items-center gap-1 shrink-0"
                    >
                      <Copy size={11} /> Copy URL
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("Are you sure you want to regenerate the link code? The old link will stop working.")) {
                          const newCode = Math.random().toString(36).substring(2, 9).toUpperCase();
                          handleUpdateFeedbackInDetail({ feedbackCode: newCode });
                        }
                      }}
                      className="text-[10px] text-red-400 font-bold hover:underline flex items-center gap-1 shrink-0"
                    >
                      <RefreshCw size={11} /> Regenerate
                    </button>
                  </div>
                ) : (
                  <div className="text-xs text-soloz-ash/40 italic">No feedback link generated yet.</div>
                )}
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {selectedTrip.feedbackCode ? (
                  <>
                    <span className="text-xs text-soloz-ash/60">Feedback Access:</span>
                    <button
                      onClick={() => {
                        const isEnabled = selectedTrip.feedbackLinkEnabled !== false;
                        handleUpdateFeedbackInDetail({ feedbackLinkEnabled: !isEnabled });
                      }}
                      className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider border transition-all ${
                        (selectedTrip.feedbackLinkEnabled !== false)
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                          : "bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20"
                      }`}
                    >
                      {selectedTrip.feedbackLinkEnabled !== false ? "Active" : "Disabled"}
                    </button>
                  </>
                ) : (
                  <Button
                    onClick={() => {
                      const newCode = Math.random().toString(36).substring(2, 9).toUpperCase();
                      handleUpdateFeedbackInDetail({ feedbackCode: newCode, feedbackLinkEnabled: true });
                    }}
                    className="h-8 text-[10px] font-bold uppercase px-3"
                  >
                    Generate Feedback Link
                  </Button>
                )}
              </div>
            </div>

          </div>

          {/* Average Rating scores */}
          {(() => {
            if (feedbackSubmissions.length === 0) return null;
            const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);
            
            const overallAvg = sum(feedbackSubmissions.map(f => f.ratings?.overallExperience || 0)) / feedbackSubmissions.length;
            const stayAvg = sum(feedbackSubmissions.map(f => f.ratings?.accommodation || 0)) / feedbackSubmissions.length;
            const driveAvg = sum(feedbackSubmissions.map(f => f.ratings?.transport || 0)) / feedbackSubmissions.length;
            const captainAvg = sum(feedbackSubmissions.map(f => f.ratings?.captain || 0)) / feedbackSubmissions.length;

            return (
              <div className="grid gap-4 sm:grid-cols-4">
                <div className="rounded-xl border border-white/10 bg-[#14110d] p-5 space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-soloz-ash/60 font-bold">Overall Rating</span>
                  <div className="text-3xl font-bold text-amber-400 flex items-baseline gap-1">
                    {overallAvg.toFixed(1)} <span className="text-xs text-soloz-ash/40">/ 5.0</span>
                  </div>
                  <div className="flex gap-0.5 text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={11} className={i < Math.round(overallAvg) ? "fill-amber-400" : "text-stone-700"} />
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-[#14110d] p-5 space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-soloz-ash/60 font-bold">Accommodations</span>
                  <div className="text-3xl font-bold text-soloz-amber flex items-baseline gap-1">
                    {stayAvg.toFixed(1)} <span className="text-xs text-soloz-ash/40">/ 5.0</span>
                  </div>
                  <div className="flex gap-0.5 text-soloz-amber">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={11} className={i < Math.round(stayAvg) ? "fill-soloz-amber" : "text-stone-700"} />
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-[#14110d] p-5 space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-soloz-ash/60 font-bold">Transport & Driver</span>
                  <div className="text-3xl font-bold text-soloz-amber flex items-baseline gap-1">
                    {driveAvg.toFixed(1)} <span className="text-xs text-soloz-ash/40">/ 5.0</span>
                  </div>
                  <div className="flex gap-0.5 text-soloz-amber">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={11} className={i < Math.round(driveAvg) ? "fill-soloz-amber" : "text-stone-700"} />
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-[#14110d] p-5 space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-soloz-ash/60 font-bold">Trip Captain</span>
                  <div className="text-3xl font-bold text-[#ea580c] flex items-baseline gap-1">
                    {captainAvg.toFixed(1)} <span className="text-xs text-soloz-ash/40">/ 5.0</span>
                  </div>
                  <div className="flex gap-0.5 text-[#ea580c]">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={11} className={i < Math.round(captainAvg) ? "fill-[#ea580c]" : "text-stone-700"} />
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Submissions list ledger */}
          <div className="rounded-xl border border-white/10 bg-[#14110d] p-6 space-y-4">
            <div className="flex items-center gap-2 max-w-sm">
              <Search className="text-soloz-ash/40" size={16} />
              <input
                type="text"
                placeholder="Search reviewer name or contact..."
                value={feedbacksSearch}
                onChange={(e) => setFeedbacksSearch(e.target.value)}
                className="h-9 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-white focus:border-soloz-ember/50 focus:outline-none"
              />
            </div>

            {loadingFeedbacks ? (
              <div className="flex flex-col items-center justify-center py-10 text-soloz-ash/60">
                <Loader2 className="animate-spin text-soloz-ember mb-2" size={24} />
                <p className="text-[10px]">Retrieving feedback submissions...</p>
              </div>
            ) : feedbackSubmissions.length === 0 ? (
              <div className="text-center py-10 text-xs text-soloz-ash/40 italic">
                No feedback received for this trip yet. Send request links to travelers.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-white border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-[10px] uppercase tracking-wider text-soloz-ash/60">
                      <th className="py-3 px-4 font-bold">Sub ID</th>
                      <th className="py-3 px-4 font-bold">Traveler</th>
                      <th className="py-3 px-4 font-bold">Overall Rating</th>
                      <th className="py-3 px-4 font-bold">Other Scores</th>
                      <th className="py-3 px-4 font-bold">Testimonial Consent</th>
                      <th className="py-3 px-4 font-bold">Memory Photos</th>
                      <th className="py-3 px-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feedbackSubmissions
                      .filter(f => {
                        const term = feedbacksSearch.toLowerCase();
                        return (
                          f.fullName?.toLowerCase().includes(term) ||
                          f.mobile?.includes(term) ||
                          f.submissionId?.toLowerCase().includes(term)
                        );
                      })
                      .map((f) => (
                        <tr key={f._id} className="border-b border-white/5 hover:bg-white/[0.02]">
                          <td className="py-3 px-4 font-mono font-bold text-soloz-amber">{f.submissionId}</td>
                          <td className="py-3 px-4">
                            <div className="font-bold">{f.fullName}</div>
                            <div className="text-[10px] text-soloz-ash/50">{f.mobile}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-1 items-center font-bold text-amber-400">
                              {f.ratings?.overallExperience} <Star size={12} className="fill-amber-400" />
                            </div>
                          </td>
                          <td className="py-3 px-4 text-[10px] text-soloz-ash/70 space-y-0.5">
                            <div>Stay: {f.ratings?.accommodation} ⭐</div>
                            <div>Ride: {f.ratings?.transport} ⭐</div>
                            <div>Guide: {f.ratings?.captain} ⭐</div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                              f.allowTestimonial 
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                                : "bg-white/5 text-soloz-ash/60 border border-white/10"
                            }`}>
                              {f.allowTestimonial ? "Yes" : "No"}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {f.photos?.length > 0 ? (
                              <span className="text-soloz-ember font-bold inline-flex items-center gap-1">
                                <ImageIcon size={12} /> {f.photos.length} Photo(s)
                              </span>
                            ) : (
                              <span className="text-soloz-ash/40">None</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex justify-end items-center gap-2">
                              <button
                                onClick={() => setSelectedFeedbackDetail(f)}
                                className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-white hover:bg-white/10 text-[10px] font-semibold transition-all"
                              >
                                Read Comments
                              </button>
                              <button
                                onClick={() => handleDeleteFeedback(f._id)}
                                className="px-2.5 py-1 rounded bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-[10px] font-semibold transition-all"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FEEDBACK DETAILS MODAL */}
      {selectedFeedbackDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-xl border border-white/10 bg-[#14110d] p-6 shadow-2xl relative space-y-5 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedFeedbackDetail(null)}
              className="absolute right-4 top-4 text-soloz-ash/60 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>

            <div className="space-y-1 border-b border-white/5 pb-3">
              <span className="text-[9px] uppercase tracking-wider text-soloz-amber font-mono font-bold">
                Review ID: {selectedFeedbackDetail.submissionId}
              </span>
              <h3 className="font-display text-lg font-bold text-white">
                Detailed Feedback & Comments
              </h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 text-xs">
              {/* Profile info */}
              <div className="space-y-1 bg-white/[0.02] p-4 rounded-lg border border-white/5">
                <span className="text-[10px] font-bold text-soloz-amber uppercase block">Reviewer Details</span>
                <p className="text-sm font-bold text-white mt-1">{selectedFeedbackDetail.fullName}</p>
                <p className="text-soloz-ash/70">Phone: {selectedFeedbackDetail.mobile}</p>
                <p className="text-soloz-ash/70">Email: {selectedFeedbackDetail.email || "N/A"}</p>
                <p className="text-soloz-ash/70">Consent: {selectedFeedbackDetail.allowTestimonial ? "Yes, allow publication" : "Do not publish"}</p>
              </div>

              {/* Future intentions */}
              <div className="space-y-2 bg-white/[0.02] p-4 rounded-lg border border-white/5 text-xs text-soloz-ash/80">
                <span className="text-[10px] font-bold text-soloz-amber uppercase block">Future Travel Sentiment</span>
                <p className="mt-1">
                  <span className="text-white/60">Would travel again:</span>{" "}
                  <span className="font-bold text-white">{selectedFeedbackDetail.travelAgain || "Yes"}</span>
                </p>
                <p>
                  <span className="text-white/60">Would recommend to friends:</span>{" "}
                  <span className="font-bold text-white">{selectedFeedbackDetail.recommendFriends || "Yes"}</span>
                </p>
              </div>
            </div>

            {/* Ratings scorecard */}
            <div className="bg-white/[0.02] p-4 rounded-lg border border-white/5 space-y-3">
              <span className="text-[10px] font-bold text-soloz-amber uppercase block">Scorecard Breakdowns</span>
              <div className="grid gap-4 grid-cols-2 sm:grid-cols-4 text-xs text-soloz-ash/80">
                <div>
                  <p className="text-white/65 font-medium">Overall Experience</p>
                  <p className="text-base font-bold text-amber-400 mt-0.5">{selectedFeedbackDetail.ratings?.overallExperience} / 5 ⭐</p>
                </div>
                <div>
                  <p className="text-white/65 font-medium">Accommodation</p>
                  <p className="text-base font-bold text-soloz-amber mt-0.5">{selectedFeedbackDetail.ratings?.accommodation} / 5 ⭐</p>
                </div>
                <div>
                  <p className="text-white/65 font-medium">Transport Quality</p>
                  <p className="text-base font-bold text-soloz-amber mt-0.5">{selectedFeedbackDetail.ratings?.transport} / 5 ⭐</p>
                </div>
                <div>
                  <p className="text-white/65 font-medium">Captain / Guide</p>
                  <p className="text-base font-bold text-[#ea580c] mt-0.5">{selectedFeedbackDetail.ratings?.captain} / 5 ⭐</p>
                </div>
              </div>
            </div>

            {/* Written reviews */}
            <div className="space-y-4 text-xs">
              <div className="bg-white/[0.02] p-4 rounded-lg border border-white/5 space-y-1">
                <span className="text-[10px] font-bold text-emerald-400 uppercase block">What they loved most</span>
                <p className="text-soloz-ash/90 leading-relaxed italic pt-1">
                  "{selectedFeedbackDetail.commentsLoved || "No comments shared."}"
                </p>
              </div>

              <div className="bg-white/[0.02] p-4 rounded-lg border border-white/5 space-y-1">
                <span className="text-[10px] font-bold text-orange-400 uppercase block">Suggestions & improvements</span>
                <p className="text-soloz-ash/90 leading-relaxed italic pt-1">
                  "{selectedFeedbackDetail.commentsImprovements || "No notes shared."}"
                </p>
              </div>
            </div>

            {/* Photo memories previews */}
            {selectedFeedbackDetail.photos?.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-soloz-amber uppercase block">Shared Photo Memories</span>
                <div className="grid gap-4 grid-cols-3">
                  {selectedFeedbackDetail.photos.map((photoUrl: string, idx: number) => (
                    <a key={idx} href={photoUrl} target="_blank" rel="noreferrer" className="relative group rounded-lg overflow-hidden border border-white/5 aspect-video bg-white/5">
                      <img src={photoUrl} alt="Trip Memory" className="object-cover w-full h-full group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <ExternalLink size={14} className="text-white" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button onClick={() => setSelectedFeedbackDetail(null)} className="text-xs">
                Close Comments
              </Button>
            </div>

          </div>
        </div>
      )}
    </main>
  );
}
