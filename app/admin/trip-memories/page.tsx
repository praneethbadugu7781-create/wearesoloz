"use client";

import { useEffect, useState } from "react";
import { getAuthHeaders } from "@/lib/api";
import { Compass, Edit2, Check, Loader2, Calendar, Users, X, BookOpen, UserPlus, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface Participant {
  name: string;
  phone: string;
}

interface CompletedTrip {
  _id: string;
  destination: string;
  state: string;
  slug: string;
  date: string;
  duration: string;
  image: string;
  participants: Participant[];
  recap?: string;
  memoriesCount: number;
  photosCount: number;
}

export default function AdminTripMemoriesPage() {
  const [trips, setTrips] = useState<CompletedTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTrip, setActiveTrip] = useState<CompletedTrip | null>(null);
  
  // Participant List Edit States
  const [recapText, setRecapText] = useState("");
  const [participantsList, setParticipantsList] = useState<Participant[]>([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState("");

  useEffect(() => {
    fetchCompletedTrips();
  }, []);

  const fetchCompletedTrips = async () => {
    setLoading(true);
    try {
      // Pull completed trips directly from memories listing API
      const res = await fetch(`${API_URL}/memories/completed-trips`);
      if (!res.ok) throw new Error("Failed to load completed trips");
      const data = await res.json();
      setTrips(data);
    } catch (err) {
      console.error(err);
      alert("Error loading completed departures.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (trip: CompletedTrip) => {
    setActiveTrip(trip);
    setRecapText(trip.recap || "");
    setParticipantsList(trip.participants || []);
  };

  const handleCancel = () => {
    setActiveTrip(null);
    setRecapText("");
    setParticipantsList([]);
  };

  const addParticipant = () => {
    setParticipantsList([...participantsList, { name: "", phone: "" }]);
  };

  const removeParticipant = (index: number) => {
    setParticipantsList(participantsList.filter((_, idx) => idx !== index));
  };

  const updateParticipant = (index: number, field: "name" | "phone", value: string) => {
    setParticipantsList(
      participantsList.map((p, idx) => (idx === index ? { ...p, [field]: value } : p))
    );
  };

  const handleImportParticipants = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importText.trim()) return;

    const lines = importText.split("\n");
    const parsed: Participant[] = [];

    lines.forEach(line => {
      if (!line.trim()) return;
      let name = "";
      let phone = "";

      const separators = [" - ", " – ", " -", "- ", "-", " , ", ", ", ",", " : ", ": ", ":"];
      let foundSeparator = false;

      for (const sep of separators) {
        if (line.includes(sep)) {
          const parts = line.split(sep);
          if (parts.length >= 2) {
            name = parts[0].trim();
            phone = parts.slice(1).join(sep).trim().replace(/[\s-()]/g, "");
            foundSeparator = true;
            break;
          }
        }
      }

      if (!foundSeparator) {
        const phoneMatch = line.match(/\+?\d[\d\s-()]{7,14}/);
        if (phoneMatch) {
          phone = phoneMatch[0].trim().replace(/[\s-()]/g, "");
          name = line.replace(phoneMatch[0], "").trim().replace(/^[-–,:\s]+|[-–,:\s]+$/g, "");
        } else {
          name = line.trim();
        }
      }

      if (phone) {
        parsed.push({ name: name || "Guest", phone });
      }
    });

    if (parsed.length > 0) {
      setParticipantsList([...participantsList, ...parsed]);
      setImportText("");
      setShowImportModal(false);
      alert(`Imported ${parsed.length} attendees successfully!`);
    } else {
      alert("Failed to parse phone numbers. Verify list matches Name - Phone formatting.");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTrip) return;

    setSaving(true);
    try {
      // Patch through generic resource updates in admin endpoints
      const res = await fetch(`${API_URL}/admin/trips/${activeTrip._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          recap: recapText,
          participants: participantsList
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to update scrapbook configurations.");
      }

      alert("Scrapbook memory details updated successfully!");
      setActiveTrip(null);
      fetchCompletedTrips();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Error saving scrapbook data.");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  return (
    <main className="p-6 space-y-6">
      
      {/* Title */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2">
            <BookOpen className="text-soloz-amber" size={24} /> Manage Trip Memories
          </h1>
          <p className="text-xs text-soloz-ash/60 mt-1">
            Configure participant phone numbers, write completed trip summaries, and compile digital scrapbooks.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20 gap-2 text-soloz-ash/60">
          <Loader2 className="animate-spin text-soloz-ember" size={24} />
          <span className="text-sm font-semibold">Loading Past Departures...</span>
        </div>
      ) : activeTrip ? (
        
        /* Edit Scrapbook View */
        <form onSubmit={handleSave} className="space-y-6 max-w-4xl bg-[#14110d] rounded-xl border border-white/10 p-6 shadow-xl">
          
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Editing Scrapbook: {activeTrip.destination}
              </h2>
              <p className="text-[11px] text-soloz-ash/60">
                Departure Date: {formatDate(activeTrip.date)}
              </p>
            </div>
            <button 
              type="button" 
              onClick={handleCancel}
              className="text-soloz-ash/60 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          {/* Recap */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-wider text-soloz-ash/60 block font-bold">
              Trip Recap Story
            </label>
            <textarea
              rows={4}
              required
              placeholder="Provide a written summary of the trip itinerary highlights, group dynamic, and memories (e.g. We had a gorgeous sunset trek with 12 amazing people!)."
              value={recapText}
              onChange={(e) => setRecapText(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-white focus:border-soloz-ember/50 focus:outline-none resize-none"
            />
          </div>

          {/* Participants */}
          <div className="space-y-4 pt-2 border-t border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-soloz-ash/60 block font-bold">
                  Registered Attending Participants
                </label>
                <p className="text-[11px] text-soloz-ash/40">
                  Only attendees listed here can request OTPs and contribute memories.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowImportModal(true)}
                  className="inline-flex items-center gap-1.5 text-xs text-soloz-ember hover:underline font-bold"
                >
                  Import Attendee List
                </button>
                <button
                  type="button"
                  onClick={addParticipant}
                  className="inline-flex items-center gap-1.5 text-xs text-soloz-ember hover:underline font-bold"
                >
                  + Add Attendee
                </button>
              </div>
            </div>

            {participantsList.length === 0 ? (
              <div className="p-4 bg-white/5 border border-dashed border-white/10 rounded-lg text-center text-xs text-soloz-ash/50">
                No participants registered. Click "Add Attendee" or "Import Attendee List" to authorize travelers.
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 max-h-[300px] overflow-y-auto pr-1">
                {participantsList.map((p, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="text"
                      required
                      placeholder="Full Name"
                      value={p.name}
                      onChange={(e) => updateParticipant(idx, "name", e.target.value)}
                      className="h-10 flex-1 rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-white focus:border-soloz-ember/50 focus:outline-none"
                    />
                    <input
                      type="tel"
                      required
                      placeholder="Phone Number"
                      value={p.phone}
                      onChange={(e) => updateParticipant(idx, "phone", e.target.value)}
                      className="h-10 flex-1 rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-white focus:border-soloz-ember/50 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => removeParticipant(idx)}
                      className="grid size-10 place-items-center rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 shrink-0"
                    >
                      <X size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 border-t border-white/5 pt-4">
            <Button type="button" variant="secondary" onClick={handleCancel} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={15} /> Saving changes...
                </>
              ) : (
                <>
                  <Check className="mr-2" size={15} /> Save Scrapbook Settings
                </>
              )}
            </Button>
          </div>

        </form>

      ) : trips.length === 0 ? (
        
        <div className="p-8 rounded-xl border border-white/10 bg-[#14110d] text-center space-y-2">
          <AlertCircle className="text-soloz-ash/40 mx-auto" size={32} />
          <p className="text-sm text-soloz-ash/60">No completed departures found in database records.</p>
          <p className="text-xs text-soloz-ash/40">Only departures with dates in the past and status 'published' are listed here.</p>
        </div>

      ) : (
        
        /* Trips Listing Table */
        <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#14110d] shadow-xl">
          <table className="w-full text-left text-xs text-soloz-ash">
            <thead className="bg-white/5 text-[10px] uppercase tracking-wider font-semibold text-white border-b border-white/10">
              <tr>
                <th className="p-4">Destination</th>
                <th className="p-4">State</th>
                <th className="p-4">Departure Date</th>
                <th className="p-4">Attendees</th>
                <th className="p-4">Memory Posts</th>
                <th className="p-4">Photos</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {trips.map((t) => (
                <tr key={t._id} className="hover:bg-white/[0.02]">
                  <td className="p-4 font-bold text-white">{t.destination}</td>
                  <td className="p-4">{t.state}</td>
                  <td className="p-4 flex items-center gap-1.5"><Calendar size={14} className="text-soloz-amber" /> {formatDate(t.date)}</td>
                  <td className="p-4">{t.participants?.length || 0} registered</td>
                  <td className="p-4">{t.memoriesCount} posted</td>
                  <td className="p-4">{t.photosCount} files</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleEdit(t)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition"
                    >
                      <Edit2 size={12} /> Edit Scrapbook
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      )}

      {/* Bulk Import Attendees Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-white/10 bg-[#14110d] p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => {
                setShowImportModal(false);
                setImportText("");
              }}
              className="absolute right-4 top-4 text-soloz-ash/60 hover:text-white"
            >
              <X size={18} />
            </button>

            <div className="space-y-1">
              <h3 className="font-display text-lg font-bold text-white">
                Bulk Import Attendees
              </h3>
              <p className="text-xs text-soloz-ash/60">
                Paste list of participants (One per line). Supported format: <code className="text-soloz-amber">Name - Phone</code> or <code className="text-soloz-amber">Name, Phone</code>.
              </p>
            </div>

            <form onSubmit={handleImportParticipants} className="space-y-4 pt-2">
              <textarea
                required
                rows={8}
                placeholder="Akhil - 9876543210&#10;Praneeth - 7330820239&#10;Rahul - 9123456789"
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#1a1712] p-3 text-xs text-white focus:border-soloz-ember/50 focus:outline-none resize-none font-mono"
              />

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowImportModal(false);
                    setImportText("");
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Parse & Import
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </main>
  );
}
