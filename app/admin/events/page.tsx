"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Trophy,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Loader2,
  Calendar,
  MapPin,
  Clock,
  IndianRupee,
  Users,
  Eye,
  Sparkles,
  Globe,
  Radio,
  ExternalLink,
  Search,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CloudinaryUpload } from "@/components/cloudinary-upload";
import { getAuthHeaders } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface EventData {
  _id?: string;
  title: string;
  slug?: string;
  tagline?: string;
  category: string;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  featured: boolean;
  showInNavbar: boolean;
  date: string;
  time?: string;
  venue: string;
  city?: string;
  googleMapsUrl?: string;
  bannerImage?: string;
  description?: string;
  rules?: string[];
  prizePool?: string;
  entryFee: number;
  teamSize?: string;
  registrationOpen: boolean;
  maxRegistrations?: number;
  contactPhone?: string;
  contactEmail?: string;
  createdAt?: string;
}

const emptyEvent: EventData = {
  title: "",
  slug: "",
  tagline: "",
  category: "Tournament",
  status: "upcoming",
  featured: true,
  showInNavbar: true,
  date: "",
  time: "09:00 AM - 06:00 PM",
  venue: "",
  city: "Hyderabad",
  googleMapsUrl: "",
  bannerImage: "",
  description: "",
  rules: [],
  prizePool: "",
  entryFee: 0,
  teamSize: "Solo",
  registrationOpen: true,
  maxRegistrations: 100,
  contactPhone: "+91 91000 00000",
  contactEmail: "events@wearesoloz.com"
};

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState<"list" | "form">("list");
  const [formData, setFormData] = useState<EventData>(emptyEvent);
  const [editId, setEditId] = useState<string | null>(null);
  const [rulesInput, setRulesInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/events`, {
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error("Failed to load events");
      const data = await res.json();
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: EventData) => {
    setFormData(item);
    setRulesInput(Array.isArray(item.rules) ? item.rules.join("\n") : "");
    setEditId(item._id || null);
    setView("form");
  };

  const handleCreateNew = () => {
    setFormData(emptyEvent);
    setRulesInput("");
    setEditId(null);
    setView("form");
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) return;

    try {
      const res = await fetch(`${API_URL}/admin/events/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error("Failed to delete event");
      setEvents((prev) => prev.filter((e) => e._id !== id));
    } catch (err: any) {
      alert(err.message || "Error deleting event.");
    }
  };

  const handleToggleNavbar = async (event: EventData) => {
    try {
      const updatedValue = !event.showInNavbar;
      const res = await fetch(`${API_URL}/admin/events/${event._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ showInNavbar: updatedValue })
      });
      if (!res.ok) throw new Error("Failed to update status");
      setEvents((prev) =>
        prev.map((e) => (e._id === event._id ? { ...e, showInNavbar: updatedValue } : e))
      );
    } catch (err: any) {
      alert(err.message || "Failed to update navbar toggle");
    }
  };

  const handleQuickStatusChange = async (event: EventData, newStatus: EventData["status"]) => {
    try {
      const res = await fetch(`${API_URL}/admin/events/${event._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error("Failed to update status");
      setEvents((prev) =>
        prev.map((e) => (e._id === event._id ? { ...e, status: newStatus } : e))
      );
    } catch (err: any) {
      alert(err.message || "Failed to change status");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = editId ? `${API_URL}/admin/events/${editId}` : `${API_URL}/admin/events`;
      const method = editId ? "PATCH" : "POST";

      const parsedRules = rulesInput
        .split("\n")
        .map((r) => r.trim())
        .filter((r) => r.length > 0);

      const payload = {
        ...formData,
        rules: parsedRules,
        entryFee: Number(formData.entryFee) || 0,
        maxRegistrations: Number(formData.maxRegistrations) || 100
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to save event");
      }

      setView("list");
      setFormData(emptyEvent);
      setEditId(null);
      setRulesInput("");
      fetchEvents();
    } catch (err: any) {
      alert(err.message || "Error saving event.");
    } finally {
      setSaving(false);
    }
  };

  // Filtered events
  const filteredEvents = events.filter((ev) => {
    const matchesSearch =
      ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ev.category && ev.category.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (statusFilter === "all") return true;
    if (statusFilter === "navbar") return ev.showInNavbar && (ev.status === "upcoming" || ev.status === "ongoing");
    return ev.status === statusFilter;
  });

  const upcomingCount = events.filter((e) => e.status === "upcoming").length;
  const navbarActiveCount = events.filter((e) => e.showInNavbar && (e.status === "upcoming" || e.status === "ongoing")).length;
  const completedCount = events.filter((e) => e.status === "completed").length;

  return (
    <main className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-orange-100 text-[#ea580c] rounded-xl">
              <Trophy className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-stone-900">Events & Tournaments</h1>
          </div>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Add, update, or remove events and sports tournaments. Changes reflect live on the website and navbar instantly.
          </p>
        </div>

        {view === "list" ? (
          <Button
            onClick={handleCreateNew}
            className="bg-[#ea580c] hover:bg-orange-600 text-white gap-2 rounded-xl shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add New Event
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={() => setView("list")}
            className="rounded-xl gap-2"
          >
            <X className="w-4 h-4" /> Cancel / Back to List
          </Button>
        )}
      </div>

      {view === "list" ? (
        <>
          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
              <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Total Events</div>
              <div className="text-2xl font-black text-stone-900 mt-1">{events.length}</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
              <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Upcoming
              </div>
              <div className="text-2xl font-black text-stone-900 mt-1">{upcomingCount}</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
              <div className="text-xs font-semibold text-orange-600 uppercase tracking-wider flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-orange-500" /> Live in Navbar
              </div>
              <div className="text-2xl font-black text-orange-600 mt-1">{navbarActiveCount}</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
              <div className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Completed / Past</div>
              <div className="text-2xl font-black text-stone-600 mt-1">{completedCount}</div>
            </div>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-3 rounded-2xl border border-stone-200 shadow-2xs">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
              <input
                type="text"
                placeholder="Search events, venue, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs md:text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
              {[
                { id: "all", label: "All" },
                { id: "upcoming", label: "Upcoming" },
                { id: "ongoing", label: "Ongoing" },
                { id: "navbar", label: "In Navbar" },
                { id: "completed", label: "Completed" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    statusFilter === tab.id
                      ? "bg-stone-900 text-white"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Events List / Cards */}
          {loading ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-stone-200 shadow-2xs">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#ea580c] mb-2" />
              <p className="text-sm font-semibold text-stone-500">Loading events...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-stone-300">
              <Trophy className="w-12 h-12 mx-auto text-stone-300 mb-3" />
              <h3 className="text-base font-bold text-stone-800">No events found</h3>
              <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                {searchQuery || statusFilter !== "all"
                  ? "No events match your current filter. Try clearing your search or filter."
                  : "You haven't created any events yet. Click 'Add New Event' above to get started!"}
              </p>
              <Button
                onClick={handleCreateNew}
                className="mt-4 bg-[#ea580c] hover:bg-orange-600 text-white text-xs rounded-xl"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" /> Create First Event
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEvents.map((item) => (
                <div
                  key={item._id}
                  className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Card Banner / Header */}
                    <div className="relative h-36 bg-gradient-to-r from-stone-900 to-stone-800 overflow-hidden">
                      {item.bannerImage ? (
                        <img
                          src={item.bannerImage}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-stone-900">
                          <Trophy className="w-10 h-10 text-orange-500/70 mb-1" />
                          <span className="text-xs text-stone-400 font-semibold">{item.category}</span>
                        </div>
                      )}

                      {/* Status Badge */}
                      <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            item.status === "upcoming"
                              ? "bg-emerald-500 text-white"
                              : item.status === "ongoing"
                              ? "bg-purple-600 text-white animate-pulse"
                              : item.status === "completed"
                              ? "bg-stone-700 text-stone-300"
                              : "bg-red-500 text-white"
                          }`}
                        >
                          {item.status}
                        </span>

                        {item.showInNavbar && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-orange-600 text-white flex items-center gap-1 shadow-xs">
                            <Radio className="w-2.5 h-2.5" /> In Navbar
                          </span>
                        )}
                      </div>

                      {/* Entry Fee Badge */}
                      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black text-stone-900 shadow-sm">
                        {item.entryFee && item.entryFee > 0 ? `₹${item.entryFee}` : "FREE"}
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 space-y-3">
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-[#ea580c]">
                          {item.category} {item.tagline && `• ${item.tagline}`}
                        </div>
                        <h3 className="text-base font-bold text-stone-900 line-clamp-1 mt-0.5">
                          {item.title}
                        </h3>
                      </div>

                      <div className="space-y-1.5 text-xs text-stone-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          <span>{item.date || "Date TBA"}</span>
                          {item.time && <span className="text-stone-400">({item.time})</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          <span className="truncate">{item.venue}, {item.city}</span>
                        </div>
                        {item.prizePool && (
                          <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                            <Trophy className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>Prize Pool: {item.prizePool}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="p-4 pt-2 border-t border-stone-100 bg-stone-50/50 space-y-2.5">
                    {/* Toggle Switches */}
                    <div className="flex items-center justify-between text-xs">
                      <button
                        onClick={() => handleToggleNavbar(item)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold transition-all ${
                          item.showInNavbar
                            ? "bg-orange-100 text-[#ea580c]"
                            : "bg-stone-200 text-stone-600 hover:bg-stone-300"
                        }`}
                        title="Toggle whether this event is highlighted in the website header badge"
                      >
                        <Radio className="w-3 h-3" />
                        <span>{item.showInNavbar ? "Visible in Navbar" : "Hidden from Navbar"}</span>
                      </button>

                      {/* Quick Status Selector */}
                      <select
                        value={item.status}
                        onChange={(e) => handleQuickStatusChange(item, e.target.value as any)}
                        className="text-xs bg-white border border-stone-200 rounded-lg px-2 py-1 font-semibold text-stone-700 focus:outline-none"
                      >
                        <option value="upcoming">Upcoming</option>
                        <option value="ongoing">Ongoing</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-1">
                      <Link
                        href={`/events/${item.slug || ""}`}
                        target="_blank"
                        className="text-xs text-stone-500 hover:text-stone-900 font-semibold flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Public
                      </Link>

                      <div className="flex items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(item)}
                          className="h-8 px-2.5 rounded-lg text-xs"
                        >
                          <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(item._id!, item.title)}
                          className="h-8 px-2.5 rounded-lg text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        /* Event Create / Edit Form */
        <form onSubmit={handleSave} className="bg-white p-6 md:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <div>
              <h2 className="text-xl font-bold text-stone-900">
                {editId ? "Edit Event Details" : "Create New Event"}
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Fill in the event specifics. The changes will be instantly live on the website.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setView("list")}
              className="rounded-xl text-xs"
            >
              Cancel
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                Event Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. WeAreSoloZ Badminton Championship Season 2"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
              >
                <option value="Tournament">Tournament</option>
                <option value="Sports">Sports</option>
                <option value="Trek">Trek & Adventure</option>
                <option value="Meetup">Community Meetup</option>
                <option value="Workshop">Workshop & Training</option>
                <option value="Cultural">Cultural & Festival</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Tagline / Subtitle */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                Tagline / Subtitle
              </label>
              <input
                type="text"
                placeholder="e.g. Season 2 • Hyderabad Edition"
                value={formData.tagline || ""}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Event Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                Event Date *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 20 Nov 2026 or Sunday, Nov 20"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Event Timing */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                Timing
              </label>
              <input
                type="text"
                placeholder="e.g. 09:00 AM - 06:00 PM"
                value={formData.time || ""}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Venue */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                Venue Name & Address *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Indian Badminton Academy, Manikonda"
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* City */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                City
              </label>
              <input
                type="text"
                placeholder="e.g. Hyderabad"
                value={formData.city || ""}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Entry Fee */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                Entry Fee (₹)
              </label>
              <input
                type="number"
                min="0"
                placeholder="0 for Free"
                value={formData.entryFee}
                onChange={(e) => setFormData({ ...formData, entryFee: Number(e.target.value) })}
                className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <span className="text-[11px] text-stone-400">Set to 0 if event is free to attend.</span>
            </div>

            {/* Prize Pool */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                Prize Pool / Awards
              </label>
              <input
                type="text"
                placeholder="e.g. ₹15,000 + Trophies"
                value={formData.prizePool || ""}
                onChange={(e) => setFormData({ ...formData, prizePool: e.target.value })}
                className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Team Size / Format */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                Participation Format
              </label>
              <input
                type="text"
                placeholder="e.g. Doubles (2 Players), Solo, or Team of 4"
                value={formData.teamSize || ""}
                onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })}
                className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Google Maps Link */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                Google Maps Location URL
              </label>
              <input
                type="url"
                placeholder="https://maps.app.goo.gl/..."
                value={formData.googleMapsUrl || ""}
                onChange={(e) => setFormData({ ...formData, googleMapsUrl: e.target.value })}
                className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                Event Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-semibold"
              >
                <option value="upcoming">Upcoming (Accepting registrations)</option>
                <option value="ongoing">Ongoing (Happening today)</option>
                <option value="completed">Completed (Event has concluded)</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Contact Phone */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                Event Helpline Phone
              </label>
              <input
                type="text"
                placeholder="+91 91000 00000"
                value={formData.contactPhone || ""}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Show In Navbar Toggle */}
            <div className="flex items-center gap-3 p-4 bg-orange-50/70 border border-orange-200/80 rounded-2xl md:col-span-2">
              <input
                type="checkbox"
                id="showInNavbar"
                checked={formData.showInNavbar}
                onChange={(e) => setFormData({ ...formData, showInNavbar: e.target.checked })}
                className="w-5 h-5 accent-orange-600 rounded cursor-pointer"
              />
              <label htmlFor="showInNavbar" className="cursor-pointer">
                <div className="text-sm font-bold text-stone-900 flex items-center gap-2">
                  <Radio className="w-4 h-4 text-orange-600" />
                  Show in Website Navbar Badge
                </div>
                <div className="text-xs text-stone-500 mt-0.5">
                  When enabled, this event will be highlighted in the top navbar pill across the entire website so visitors can see it instantly.
                </div>
              </label>
            </div>

            {/* Registration Open Toggle */}
            <div className="flex items-center gap-3 p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl md:col-span-2">
              <input
                type="checkbox"
                id="registrationOpen"
                checked={formData.registrationOpen}
                onChange={(e) => setFormData({ ...formData, registrationOpen: e.target.checked })}
                className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
              />
              <label htmlFor="registrationOpen" className="cursor-pointer">
                <div className="text-sm font-bold text-stone-900">
                  Registrations Open
                </div>
                <div className="text-xs text-stone-500 mt-0.5">
                  Allow travelers/participants to submit team details and register online.
                </div>
              </label>
            </div>

            {/* Banner Image Upload */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                Event Banner / Poster Image
              </label>
              <CloudinaryUpload
                value={formData.bannerImage || ""}
                onChange={(url) => setFormData({ ...formData, bannerImage: url })}
                label="Upload Event Poster / Banner"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                Event Description & Overview
              </label>
              <textarea
                rows={4}
                placeholder="Explain the tournament format, who can participate, what to bring, etc."
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Rules (One per line) */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                Rules & Eligibility Guidelines (Enter one rule per line)
              </label>
              <textarea
                rows={5}
                placeholder="1. Standard Yonex Mavis 350 shuttles will be used.&#10;2. Knockout match format (21 points).&#10;3. Non-marking badminton shoes mandatory on court.&#10;4. Medalists not eligible."
                value={rulesInput}
                onChange={(e) => setRulesInput(e.target.value)}
                className="w-full px-4 py-3 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono text-xs"
              />
            </div>
          </div>

          {/* Form Submit Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setView("list")}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-[#ea580c] hover:bg-orange-600 text-white rounded-xl shadow-sm min-w-36"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : editId ? (
                "Update Event"
              ) : (
                "Create Event"
              )}
            </Button>
          </div>
        </form>
      )}
    </main>
  );
}
