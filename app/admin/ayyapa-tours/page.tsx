"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Flame, 
  Plus, 
  Edit3, 
  Trash2, 
  Calendar, 
  Clock, 
  Users, 
  ExternalLink, 
  Loader2, 
  CheckCircle2, 
  X, 
  Sparkles, 
  Image as ImageIcon,
  ChevronRight,
  TrendingUp,
  MapPin,
  Eye
} from "lucide-react";
import { getAuthHeaders } from "@/lib/api";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const DEFAULT_AYYAPA_IMAGE = "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80";

const DEFAULT_INCLUSIONS = [
  "Traditional Irumudi Kattu & Pooja Guidance",
  "Dedicated Guruswamy Supervision",
  "Comfortable AC / Non-AC Travel",
  "Pure Vegetarian Satvik Annadanam Meals",
  "Pilgrim Rest Halts at Erumely & Pamba",
  "Special Darshan Assistance at Sannidhanam"
];

const DEFAULT_ITINERARY = [
  { day: "Day 1", title: "Mala Dharana, Irumudi Pooja & Sacred Departure", description: "Assembling at designated Mandapam for sacred Irumudi Kattu by respected Guruswamy. Saranam Vili, traditional bhajan, and departure towards Kerala." },
  { day: "Day 2", title: "Arrival at Erumely, Vavar Swamy & Pamba Sacred Bath", description: "Reach Erumely, participate in sacred Pettathullal, visit Vavar Swamy Mosque and Sastha Temple. Continue to Pamba, holy holy bath in Pamba river." },
  { day: "Day 3", title: "Ascent via Neelimala, Holy 18 Steps & Sannidhanam Darshan", description: "Early morning trek through Appachimedu and Sabaripeedam. Ascend the sacred 18 gold-plated steps (Pathinettampadi) for Lord Ayyappa Maha Darshan, Neyyabhishekam, and Harivarasanam." },
  { day: "Day 4", title: "Descent to Pamba & Return Journey with Divine Blessings", description: "Early morning descent to Pamba with Appam and Aravana Prasadam. Board transport for return journey with hearts filled with Swamiye Saranam Ayyappa energy." }
];

export default function AdminAyyapaToursPage() {
  const [tours, setTours] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingTour, setEditingTour] = useState<any>(null);

  // Form State
  const [form, setForm] = useState({
    destination: "Sabarimala",
    state: "Kerala",
    title: "Swami Sharanam Ayyapa Diksha Devotional Tour",
    slug: "swami-sharanam-ayyapa-diksha-tour",
    date: new Date(Date.now() + 86400000 * 14).toISOString().split("T")[0],
    duration: "4 Days / 3 Nights",
    price: "₹4,999",
    seats: 40,
    image: DEFAULT_AYYAPA_IMAGE,
    images: "",
    description: "Join the sacred community pilgrimage to Lord Ayyappa's divine abode Sabarimala. Complete with traditional Irumudi pooja, experienced Guruswamy guidance, comfortable travel, and Satvik Annadanam meals.",
    inclusions: DEFAULT_INCLUSIONS.join("\n"),
    batches: [
      { label: "Mandala Kalam Batch 1", startDate: "2026-11-20", endDate: "2026-11-24", seats: 40, price: "₹4,999" },
      { label: "Mandala Kalam Batch 2", startDate: "2026-12-15", endDate: "2026-12-19", seats: 40, price: "₹4,999" },
      { label: "Makaravilakku Special Batch", startDate: "2027-01-10", endDate: "2027-01-15", seats: 40, price: "₹5,499" }
    ],
    showInTicker: true,
    tickerBadge: "AYYAPA SPECIAL",
    featured: true,
    status: "published"
  });

  const loadTours = async () => {
    setLoading(true);
    try {
      const headers = { ...getAuthHeaders(), "Content-Type": "application/json" };
      const res = await fetch(`${API_URL}/admin/trips`, { headers });
      if (res.ok) {
        const data = await res.json();
        // Filter trips that are Ayyapa trips or Sabarimala
        const ayyapaTours = data.filter((t: any) => 
          t.isAyyapaTrip === true || 
          t.category === "Ayyapa Diksha Devotional Tours" ||
          (t.destination && t.destination.toLowerCase().includes("sabarimala")) ||
          (t.title && t.title.toLowerCase().includes("ayyapa"))
        );
        setTours(ayyapaTours);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load Ayyapa tours");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTours();
  }, []);

  const openCreateModal = () => {
    setEditingTour(null);
    setForm({
      destination: "Sabarimala",
      state: "Kerala",
      title: "Swami Sharanam Ayyapa Diksha Devotional Tour",
      slug: `ayyapa-diksha-tour-${Date.now().toString().slice(-4)}`,
      date: new Date(Date.now() + 86400000 * 14).toISOString().split("T")[0],
      duration: "4 Days / 3 Nights",
      price: "₹4,999",
      seats: 40,
      image: DEFAULT_AYYAPA_IMAGE,
      images: "",
      description: "Join the sacred community pilgrimage to Lord Ayyappa's divine abode Sabarimala. Complete with traditional Irumudi pooja, experienced Guruswamy guidance, comfortable travel, and Satvik Annadanam meals.",
      inclusions: DEFAULT_INCLUSIONS.join("\n"),
      batches: [
        { label: "Mandala Kalam Batch 1", startDate: "2026-11-20", endDate: "2026-11-24", seats: 40, price: "₹4,999" },
        { label: "Mandala Kalam Batch 2", startDate: "2026-12-15", endDate: "2026-12-19", seats: 40, price: "₹4,999" },
        { label: "Makaravilakku Special Batch", startDate: "2027-01-10", endDate: "2027-01-15", seats: 40, price: "₹5,499" }
      ],
      showInTicker: true,
      tickerBadge: "AYYAPA SPECIAL",
      featured: true,
      status: "published"
    });
    setModalOpen(true);
  };

  const openEditModal = (tour: any) => {
    setEditingTour(tour);
    setForm({
      destination: tour.destination || "Sabarimala",
      state: tour.state || "Kerala",
      title: tour.title || "Swami Sharanam Ayyapa Diksha Devotional Tour",
      slug: tour.slug || "",
      date: tour.date ? new Date(tour.date).toISOString().split("T")[0] : "",
      duration: tour.duration || "4 Days / 3 Nights",
      price: tour.price || "₹4,999",
      seats: tour.seats || 40,
      image: tour.image || DEFAULT_AYYAPA_IMAGE,
      images: Array.isArray(tour.images) ? tour.images.join("\n") : "",
      description: tour.description || "",
      inclusions: Array.isArray(tour.inclusions) ? tour.inclusions.join("\n") : DEFAULT_INCLUSIONS.join("\n"),
      batches: tour.batches || [],
      showInTicker: tour.showInTicker ?? true,
      tickerBadge: tour.tickerBadge || "AYYAPA SPECIAL",
      featured: tour.featured ?? true,
      status: tour.status || "published"
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      const headers = { ...getAuthHeaders() };
      const res = await fetch(`${API_URL}/admin/trips/${id}`, { method: "DELETE", headers });
      if (res.ok) {
        toast.success("Tour deleted successfully");
        setTours(prev => prev.filter(t => t._id !== id));
      } else {
        toast.error("Failed to delete tour");
      }
    } catch (e) {
      toast.error("Error deleting tour");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: any = {
        destination: form.destination,
        state: form.state,
        title: form.title,
        slug: form.slug.toLowerCase().replace(/[^a-z0-9-]+/g, "-"),
        date: form.date,
        duration: form.duration,
        price: form.price,
        seats: Number(form.seats) || 40,
        category: "Ayyapa Diksha Devotional Tours",
        isAyyapaTrip: true,
        image: form.image,
        images: form.images ? form.images.split("\n").map(s => s.trim()).filter(Boolean) : [],
        description: form.description,
        inclusions: form.inclusions.split("\n").map(s => s.trim()).filter(Boolean),
        batches: form.batches,
        itinerary: editingTour?.itinerary?.length ? editingTour.itinerary : DEFAULT_ITINERARY,
        showInTicker: Boolean(form.showInTicker),
        tickerBadge: form.tickerBadge || "AYYAPA SPECIAL",
        featured: Boolean(form.featured),
        status: form.status
      };

      const headers = { ...getAuthHeaders(), "Content-Type": "application/json" };
      const url = editingTour ? `${API_URL}/admin/trips/${editingTour._id}` : `${API_URL}/admin/trips`;
      const method = editingTour ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save tour");
      }

      toast.success(editingTour ? "Ayyapa tour updated!" : "New Ayyapa tour added!");
      setModalOpen(false);
      loadTours();
    } catch (err: any) {
      toast.error(err.message || "Failed to save tour");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="space-y-8 pb-16">
      {/* Top Banner & Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1c1917] via-[#29221b] to-[#1c1917] p-6 sm:p-10 border border-orange-500/25 shadow-xl text-white">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-widest">
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              Swami Sharanam
            </div>
            <h1 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-white">
              Ayyapa Diksha Devotional Tours
            </h1>
            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
              Manage sacred Sabarimala & Ayyapa Diksha pilgrimage trips. Easily add batch departures, Guruswamy coordination details, Irumudi guidelines, and control presence in the top ticker bar.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/ayyapa-diksha-devotional-tours"
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold text-stone-200 bg-white/10 hover:bg-white/15 border border-white/15 transition-all"
            >
              <Eye className="w-3.5 h-3.5 text-orange-400" />
              View Public Page
              <ExternalLink className="w-3 h-3 text-stone-400" />
            </Link>

            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white shadow-lg shadow-orange-600/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Ayyapa Tour
            </button>
          </div>
        </div>
      </div>

      {/* Tours List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <span>Sacred Tours</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 font-bold">
              {tours.length}
            </span>
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-16 bg-white rounded-3xl border border-stone-200">
            <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
          </div>
        ) : tours.length === 0 ? (
          <div className="text-center p-12 sm:p-16 bg-white rounded-3xl border border-stone-200 space-y-4">
            <div className="size-16 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto border border-orange-200">
              <Flame className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="font-display text-xl font-bold text-stone-900">No Ayyapa Tours Added Yet</h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                Click the button below to add your first Swami Sharanam Ayyapa Diksha Devotional Tour with pre-filled sacred Sabarimala details!
              </p>
            </div>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-600 hover:bg-orange-700 text-white transition-all shadow-md"
            >
              <Plus className="w-4 h-4" /> Add Sabarimala Tour
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tours.map((tour) => (
              <div 
                key={tour._id} 
                className="bg-white rounded-3xl overflow-hidden border border-stone-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-48 w-full overflow-hidden bg-stone-950">
                    <img
                      src={tour.image || DEFAULT_AYYAPA_IMAGE}
                      alt={tour.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-500 text-white shadow-sm flex items-center gap-1">
                        <Flame className="w-3 h-3" />
                        Ayyapa Diksha
                      </span>
                      {tour.showInTicker && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-amber-300 border border-amber-300/30">
                          {tour.tickerBadge || "TICKER"}
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <div className="text-[10.5px] uppercase font-bold text-orange-400 tracking-wider flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {tour.destination}, {tour.state || "Kerala"}
                      </div>
                      <h3 className="font-display text-base font-bold text-white truncate">
                        {tour.title}
                      </h3>
                    </div>
                  </div>

                  <div className="p-5 space-y-3 text-xs text-stone-600">
                    <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                      <span className="text-stone-400 uppercase tracking-wider font-semibold text-[10px]">Price / Seat</span>
                      <span className="text-sm font-bold text-stone-900">{tour.price}</span>
                    </div>

                    <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                      <span className="text-stone-400 uppercase tracking-wider font-semibold text-[10px]">Duration</span>
                      <span className="font-semibold text-stone-800 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-orange-600" />
                        {tour.duration}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                      <span className="text-stone-400 uppercase tracking-wider font-semibold text-[10px]">Batches</span>
                      <span className="font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full text-[11px]">
                        {tour.batches?.length || 0} Scheduled
                      </span>
                    </div>

                    <p className="text-stone-500 text-xs line-clamp-2">
                      {tour.description}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-2">
                  <Link
                    href={`/upcoming-trips/${tour.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-stone-600 hover:text-stone-900"
                  >
                    <span>View</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(tour)}
                      className="p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-200 transition-colors"
                      title="Edit Tour"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(tour._id, tour.title)}
                      className="p-2 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                      title="Delete Tour"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-stone-900">
                    {editingTour ? "Edit Ayyapa Tour" : "Add Swami Sharanam Ayyapa Tour"}
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Configure pilgrimage details, batches, ticker visibility, and inclusions.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setModalOpen(false)}
                className="size-8 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Destination Name</label>
                  <input
                    type="text"
                    required
                    value={form.destination}
                    onChange={(e) => setForm({ ...form, destination: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-stone-200 text-sm focus:border-orange-500 focus:outline-none"
                    placeholder="Sabarimala"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-stone-200 text-sm focus:border-orange-500 focus:outline-none"
                    placeholder="Kerala"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Tour Title</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-stone-200 text-sm focus:border-orange-500 focus:outline-none"
                  placeholder="Swami Sharanam Ayyapa Diksha Devotional Tour"
                />
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Price per Person</label>
                  <input
                    type="text"
                    required
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-stone-200 text-sm focus:border-orange-500 focus:outline-none"
                    placeholder="₹4,999"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Duration</label>
                  <input
                    type="text"
                    required
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-stone-200 text-sm focus:border-orange-500 focus:outline-none"
                    placeholder="4 Days / 3 Nights"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Total Seats</label>
                  <input
                    type="number"
                    required
                    value={form.seats}
                    onChange={(e) => setForm({ ...form, seats: Number(e.target.value) })}
                    className="w-full h-10 px-3 rounded-xl border border-stone-200 text-sm focus:border-orange-500 focus:outline-none"
                    placeholder="40"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Main Cover Photo URL</label>
                <input
                  type="url"
                  required
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-stone-200 text-sm focus:border-orange-500 focus:outline-none"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Additional Gallery Images (one URL per line)
                </label>
                <textarea
                  rows={2}
                  value={form.images}
                  onChange={(e) => setForm({ ...form, images: e.target.value })}
                  className="w-full p-3 rounded-xl border border-stone-200 text-xs focus:border-orange-500 focus:outline-none font-mono"
                  placeholder="https://image1.jpg&#10;https://image2.jpg"
                />
              </div>

              {/* Ticker & Featured Control */}
              <div className="p-4 rounded-2xl bg-orange-50/70 border border-orange-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-stone-900 block">Float in Top Announcement Ticker</span>
                    <span className="text-[11px] text-stone-500">Makes this sacred tour continuously scroll across the top bar.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.showInTicker}
                    onChange={(e) => setForm({ ...form, showInTicker: e.target.checked })}
                    className="size-5 rounded border-stone-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                  />
                </div>

                {form.showInTicker && (
                  <div className="pt-2 border-t border-orange-200/60">
                    <label className="text-[11px] font-bold text-stone-700 block mb-1">Ticker Badge Label</label>
                    <input
                      type="text"
                      value={form.tickerBadge}
                      onChange={(e) => setForm({ ...form, tickerBadge: e.target.value })}
                      className="w-full h-9 px-3 rounded-xl border border-orange-200 text-xs bg-white text-stone-900 focus:outline-none font-semibold"
                      placeholder="AYYAPA SPECIAL"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full p-3 rounded-xl border border-stone-200 text-xs focus:border-orange-500 focus:outline-none"
                  placeholder="Sacred trip description..."
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Inclusions (one per line)
                </label>
                <textarea
                  rows={4}
                  value={form.inclusions}
                  onChange={(e) => setForm({ ...form, inclusions: e.target.value })}
                  className="w-full p-3 rounded-xl border border-stone-200 text-xs focus:border-orange-500 focus:outline-none font-mono"
                  placeholder="Inclusion 1&#10;Inclusion 2"
                />
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-full text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-600 hover:bg-orange-700 text-white transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingTour ? "Save Changes" : "Create Ayyapa Tour"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
