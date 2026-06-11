"use client";
import { getAuthHeaders } from "@/lib/api";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

import { useEffect, useState } from "react";
import { Compass, Plus, Edit2, Trash2, Check, Loader2, Calendar, Users, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CloudinaryUpload } from "@/components/cloudinary-upload";

interface ItineraryItem {
  day: string;
  title: string;
  description: string;
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
  featured: boolean;
  status: "draft" | "published";
  itinerary: ItineraryItem[];
  inclusions: string[];
}

const emptyForm: TripData = {
  destination: "",
  state: "Telangana",
  slug: "",
  date: "",
  duration: "",
  price: "",
  seats: 10,
  description: "",
  image: "",
  featured: false,
  status: "published",
  itinerary: [
    { day: "Day 1", title: "Arrival", description: "Arrive at pickup location." }
  ],
  inclusions: ["Shared accommodation", "AC transfers", "Breakfast & Dinner", "Tour Guide"]
};

export default function AdminTripsPage() {
  const [trips, setTrips] = useState<TripData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState<"list" | "form">("list");
  const [formData, setFormData] = useState<TripData>(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/trips`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error("Failed to load trips");
      const data = await res.json();
      setTrips(data);
    } catch (err) {
      console.error(err);
      alert("Error loading trips. Please make sure you are signed in.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (trip: TripData) => {
    // Format date string to YYYY-MM-DD for date input
    const formattedDate = trip.date ? new Date(trip.date).toISOString().split("T")[0] : "";
    setFormData({
      ...trip,
      date: formattedDate
    });
    setEditId(trip._id || null);
    setView("form");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this trip? This action is permanent.")) return;

    try {
      const res = await fetch(`${API_URL}/admin/trips/${id}`, { method: "DELETE", headers: getAuthHeaders() });
      if (!res.ok) throw new Error("Failed to delete trip");
      setTrips(trips.filter((t) => t._id !== id));
    } catch (err: any) {
      alert(err.message || "Error deleting trip.");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image) {
      alert("Please upload a cover image first.");
      return;
    }

    setSaving(true);
    try {
      const url = editId ? `${API_URL}/admin/trips/${editId}` : `${API_URL}/admin/trips`;
      const method = editId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error("Failed to save trip settings");

      setView("list");
      setFormData(emptyForm);
      setEditId(null);
      fetchTrips();
    } catch (err: any) {
      alert(err.message || "Error saving trip.");
    } finally {
      setSaving(false);
    }
  };

  const handleDestinationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dest = e.target.value;
    const generatedSlug = dest
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    setFormData({
      ...formData,
      destination: dest,
      slug: generatedSlug
    });
  };

  // Dynamic itinerary builders
  const addItineraryDay = () => {
    const nextDayNum = formData.itinerary.length + 1;
    setFormData({
      ...formData,
      itinerary: [...formData.itinerary, { day: `Day ${nextDayNum}`, title: "", description: "" }]
    });
  };

  const removeItineraryDay = (index: number) => {
    const filteredItinerary = formData.itinerary.filter((_, i) => i !== index).map((day, i) => ({
      ...day,
      day: `Day ${i + 1}`
    }));
    setFormData({
      ...formData,
      itinerary: filteredItinerary
    });
  };

  const updateItineraryDay = (index: number, field: keyof ItineraryItem, val: string) => {
    const updated = formData.itinerary.map((item, i) => {
      if (i === index) return { ...item, [field]: val };
      return item;
    });
    setFormData({ ...formData, itinerary: updated });
  };

  // Dynamic inclusion builders
  const addInclusion = () => {
    setFormData({ ...formData, inclusions: [...formData.inclusions, ""] });
  };

  const removeInclusion = (index: number) => {
    setFormData({ ...formData, inclusions: formData.inclusions.filter((_, i) => i !== index) });
  };

  const updateInclusion = (index: number, val: string) => {
    const updated = formData.inclusions.map((item, i) => (i === index ? val : item));
    setFormData({ ...formData, inclusions: updated });
  };

  return (
    <main className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-white flex items-center gap-2">
            <Compass className="text-soloz-ember" size={28} />
            Manage Group Trips
          </h1>
          <p className="text-xs text-soloz-ash/75 mt-1">Configure tour packages, pricing itineraries, and seats.</p>
        </div>

        {view === "list" ? (
          <Button onClick={() => { setFormData(emptyForm); setEditId(null); setView("form"); }} className="pt-0.5">
            <Plus size={16} className="mr-2" /> Create New Trip
          </Button>
        ) : (
          <Button onClick={() => setView("list")} variant="secondary" className="pt-0.5">
            Cancel Edit
          </Button>
        )}
      </div>

      {view === "list" ? (
        loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-soloz-ash/60">
            <Loader2 className="animate-spin text-soloz-ember mb-3" size={32} />
            <p className="text-xs">Fetching active trips...</p>
          </div>
        ) : trips.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 p-12 text-center text-soloz-ash/60">
            No group trips configured. Click "Create New Trip" or seed the database.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {trips.map((trip) => (
              <div
                key={trip._id}
                className="rounded-xl border border-white/10 bg-[#14110d] overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-video w-full">
                    <img src={trip.image} alt={trip.destination} className="h-full w-full object-cover" />
                    <div className="absolute right-3 top-3 flex gap-2">
                      <span className="bg-orange-500/90 text-white rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                        {trip.state || "Andhra Pradesh"}
                      </span>
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          trip.status === "published" ? "bg-emerald-500/80 text-white" : "bg-white/20 text-white"
                        }`}
                      >
                        {trip.status}
                      </span>
                    </div>
                  </div>
                  <div className="p-5 space-y-3">
                    <h3 className="font-display text-lg font-bold text-white leading-tight">{trip.destination}</h3>
                    <div className="grid grid-cols-2 gap-2 text-xs text-soloz-ash/70">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} />
                        {new Date(trip.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users size={13} />
                        {trip.seats} seats
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-white/5 mt-4 flex items-center justify-between">
                  <span className="text-base font-bold text-soloz-amber">{trip.price}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(trip)}
                      className="grid size-8 place-items-center rounded bg-white/5 border border-white/10 text-white hover:bg-white/10"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(trip._id!)}
                      className="grid size-8 place-items-center rounded bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* EDIT / CREATE FORM */
        <form onSubmit={handleSave} className="rounded-xl border border-white/10 bg-[#14110d] p-6 sm:p-8 space-y-6 max-w-4xl">
          <h3 className="font-display text-xl font-bold text-white border-b border-white/5 pb-3">
            {editId ? "Edit Trip Details" : "Create New Group Tour"}
          </h3>

          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-soloz-ash/60 block mb-1">Destination Name</label>
              <input
                type="text"
                required
                placeholder="Kedarnath Community Yatra"
                value={formData.destination}
                onChange={handleDestinationChange}
                className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-soloz-ember/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-soloz-ash/60 block mb-1">State / Region</label>
              <select
                value={formData.state || "Telangana"}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="h-10 w-full rounded-lg border border-white/10 bg-[#14110d] px-3 text-sm text-white focus:border-soloz-ember/50 focus:outline-none"
              >
                <option value="Telangana">Telangana</option>
                <option value="Andhra Pradesh">Andhra Pradesh</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Kerala">Kerala</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-soloz-ash/60 block mb-1">URL Slug</label>
              <input
                type="text"
                required
                disabled
                placeholder="kedarnath-community-yatra"
                value={formData.slug}
                className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white/40 focus:outline-none cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-4">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-soloz-ash/60 block mb-1">Date</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-soloz-ember/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-soloz-ash/60 block mb-1">Duration</label>
              <input
                type="text"
                required
                placeholder="6D / 5N"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-soloz-ember/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-soloz-ash/60 block mb-1">Price</label>
              <input
                type="text"
                required
                placeholder="₹18,999"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-soloz-ember/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-soloz-ash/60 block mb-1">Seats Available</label>
              <input
                type="number"
                required
                value={formData.seats}
                onChange={(e) => setFormData({ ...formData, seats: parseInt(e.target.value) || 0 })}
                className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-soloz-ember/50 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider text-soloz-ash/60 block mb-1">Description</label>
            <textarea
              required
              rows={4}
              placeholder="Provide a detailed description of the tour route, difficulty, and highlights..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white focus:border-soloz-ember/50 focus:outline-none resize-none"
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <CloudinaryUpload
              value={formData.image}
              onChange={(url) => setFormData({ ...formData, image: url })}
              label="Cover Image"
            />

            <div className="space-y-4">
              <label className="text-[10px] uppercase tracking-wider text-soloz-ash/60 block">Publish Settings</label>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="size-4 accent-soloz-ember"
                  />
                  Featured Trip
                </label>
                <div className="flex items-center gap-2 text-sm">
                  <span>Status:</span>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="h-8 rounded bg-black border border-white/10 text-xs text-white"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Inclusions builder */}
          <div className="space-y-4 pt-4 border-t border-white/5">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold uppercase tracking-wider text-soloz-amber">Inclusions</h4>
              <button
                type="button"
                onClick={addInclusion}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-soloz-ember hover:underline"
              >
                + Add Inclusion
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {formData.inclusions.map((inc, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Breakfast & Dinner"
                    value={inc}
                    onChange={(e) => updateInclusion(index, e.target.value)}
                    className="h-10 flex-1 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-soloz-ember/50 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeInclusion(index)}
                    className="grid size-10 shrink-0 place-items-center rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                  >
                    <X size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Dynamic Itinerary builder */}
          <div className="space-y-4 pt-4 border-t border-white/5">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold uppercase tracking-wider text-soloz-amber">Day-By-Day Itinerary</h4>
              <button
                type="button"
                onClick={addItineraryDay}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-soloz-ember hover:underline"
              >
                + Add Itinerary Day
              </button>
            </div>

            <div className="space-y-4">
              {formData.itinerary.map((day, index) => (
                <div key={index} className="rounded-lg border border-white/10 bg-black/20 p-4 space-y-3 relative">
                  <div className="flex gap-3 items-center">
                    <span className="inline-block rounded bg-soloz-ember/15 border border-soloz-ember/25 px-2 py-1 text-[10px] font-bold text-soloz-amber uppercase tracking-wider">
                      {day.day}
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="Day Title (e.g. Scenic Hike to Camp)"
                      value={day.title}
                      onChange={(e) => updateItineraryDay(index, "title", e.target.value)}
                      className="h-9 flex-1 rounded border border-white/10 bg-white/5 px-3 text-xs text-white focus:border-soloz-ember/50 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => removeItineraryDay(index)}
                      className="grid size-9 shrink-0 place-items-center rounded border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <textarea
                    required
                    rows={2}
                    placeholder="Describe what activities and trails are scheduled for this day..."
                    value={day.description}
                    onChange={(e) => updateItineraryDay(index, "description", e.target.value)}
                    className="w-full rounded border border-white/10 bg-white/5 p-3 text-xs text-white focus:border-soloz-ember/50 focus:outline-none resize-none"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setView("list")} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={15} /> Saving...
                </>
              ) : (
                <>
                  <Check className="mr-2" size={15} /> Save Trip Settings
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </main>
  );
}
