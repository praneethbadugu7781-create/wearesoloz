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
  Eye,
  Upload,
  Check,
  FileText
} from "lucide-react";
import { getAuthHeaders } from "@/lib/api";
import { toast } from "sonner";
import { CloudinaryUpload } from "@/components/cloudinary-upload";

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
  { day: "Day 2", title: "Arrival at Erumely, Vavar Swamy & Pamba Sacred Bath", description: "Reach Erumely, participate in sacred Pettathullal, visit Vavar Swamy Mosque and Sastha Temple. Continue to Pamba, holy bath in Pamba river." },
  { day: "Day 3", title: "Ascent via Neelimala, Holy 18 Steps & Sannidhanam Darshan", description: "Early morning trek through Appachimedu and Sabaripeedam. Ascend the sacred 18 gold-plated steps (Pathinettampadi) for Lord Ayyappa Maha Darshan, Neyyabhishekam, and Harivarasanam." },
  { day: "Day 4", title: "Descent to Pamba & Return Journey with Divine Blessings", description: "Early morning descent to Pamba with Appam and Aravana Prasadam. Board transport for return journey with hearts filled with Swamiye Saranam Ayyappa energy." }
];

const indianStates = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal"
];

export default function AdminAyyapaToursPage() {
  const [tours, setTours] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingTour, setEditingTour] = useState<any>(null);

  // AI Extractor State
  const [showAiImport, setShowAiImport] = useState(false);
  const [aiText, setAiText] = useState("");
  const [aiImageUrl, setAiImageUrl] = useState("");
  const [aiExtracting, setAiExtracting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    destination: "Sabarimala",
    state: "Kerala",
    title: "Swami Sharanam Ayyapa Diksha Devotional Tour",
    slug: "swami-sharanam-ayyapa-diksha-tour",
    date: new Date(Date.now() + 86400000 * 14).toISOString().split("T")[0],
    duration: "4 Days / 3 Nights",
    price: "₹4,999",
    seats: 40,
    category: "Ayyapa Diksha Devotional Tours",
    isAyyapaTrip: true,
    image: DEFAULT_AYYAPA_IMAGE,
    images: [] as string[],
    description: "Join the sacred community pilgrimage to Lord Ayyappa's divine abode Sabarimala. Complete with traditional Irumudi pooja, experienced Guruswamy guidance, comfortable travel, and Satvik Annadanam meals.",
    inclusions: DEFAULT_INCLUSIONS,
    itinerary: DEFAULT_ITINERARY,
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
    setFormData({
      destination: "Sabarimala",
      state: "Kerala",
      title: "Swami Sharanam Ayyapa Diksha Devotional Tour",
      slug: `ayyapa-diksha-tour-${Date.now().toString().slice(-4)}`,
      date: new Date(Date.now() + 86400000 * 14).toISOString().split("T")[0],
      duration: "4 Days / 3 Nights",
      price: "₹4,999",
      seats: 40,
      category: "Ayyapa Diksha Devotional Tours",
      isAyyapaTrip: true,
      image: DEFAULT_AYYAPA_IMAGE,
      images: [],
      description: "Join the sacred community pilgrimage to Lord Ayyappa's divine abode Sabarimala. Complete with traditional Irumudi pooja, experienced Guruswamy guidance, comfortable travel, and Satvik Annadanam meals.",
      inclusions: DEFAULT_INCLUSIONS,
      itinerary: DEFAULT_ITINERARY,
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
    setShowAiImport(false);
    setAiText("");
    setAiImageUrl("");
    setModalOpen(true);
  };

  const openEditModal = (tour: any) => {
    setEditingTour(tour);
    setFormData({
      destination: tour.destination || "Sabarimala",
      state: tour.state || "Kerala",
      title: tour.title || "Swami Sharanam Ayyapa Diksha Devotional Tour",
      slug: tour.slug || "",
      date: tour.date ? new Date(tour.date).toISOString().split("T")[0] : "",
      duration: tour.duration || "4 Days / 3 Nights",
      price: tour.price || "₹4,999",
      seats: tour.seats || 40,
      category: "Ayyapa Diksha Devotional Tours",
      isAyyapaTrip: true,
      image: tour.image || DEFAULT_AYYAPA_IMAGE,
      images: tour.images || [],
      description: tour.description || "",
      inclusions: tour.inclusions?.length ? tour.inclusions : DEFAULT_INCLUSIONS,
      itinerary: tour.itinerary?.length ? tour.itinerary : DEFAULT_ITINERARY,
      batches: tour.batches || [],
      showInTicker: tour.showInTicker ?? true,
      tickerBadge: tour.tickerBadge || "AYYAPA SPECIAL",
      featured: tour.featured ?? true,
      status: tour.status || "published"
    });
    setShowAiImport(false);
    setAiText("");
    setAiImageUrl("");
    setModalOpen(true);
  };

  const handleAiExtract = async () => {
    if (!aiText && !aiImageUrl) {
      toast.error("Please provide either text notes or upload an itinerary poster.");
      return;
    }

    setAiExtracting(true);
    try {
      const res = await fetch(`${API_URL}/admin/extract-itinerary`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({
          text: aiText,
          imageUrl: aiImageUrl
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to extract itinerary details");
      }

      const data = await res.json();
      if (!data || typeof data !== "object") {
        throw new Error("AI could not extract details. Please try another image or paste text.");
      }

      setFormData((prev) => ({
        ...prev,
        destination: data.destination || prev.destination,
        state: data.state || prev.state,
        title: data.destination ? `Swami Sharanam ${data.destination} Devotional Tour` : prev.title,
        duration: data.duration || prev.duration,
        price: data.price || prev.price,
        seats: data.seats || prev.seats,
        description: data.description || prev.description,
        inclusions: data.inclusions?.length ? data.inclusions : prev.inclusions,
        itinerary: data.itinerary?.length ? data.itinerary : prev.itinerary,
        slug: data.destination 
          ? `ayyapa-${data.destination.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-")}`
          : prev.slug
      }));

      setShowAiImport(false);
      setAiText("");
      setAiImageUrl("");
      toast.success("✨ AI successfully extracted and filled the pilgrimage details!");
    } catch (err: any) {
      toast.error(err.message || "Error extracting itinerary.");
    } finally {
      setAiExtracting(false);
    }
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
        ...formData,
        category: "Ayyapa Diksha Devotional Tours",
        isAyyapaTrip: true,
        slug: formData.slug.toLowerCase().replace(/[^a-z0-9-]+/g, "-"),
        seats: Number(formData.seats) || 40,
        showInTicker: Boolean(formData.showInTicker),
        tickerBadge: formData.tickerBadge || "AYYAPA SPECIAL",
        featured: Boolean(formData.featured),
        status: formData.status
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

  // Batches Helpers
  const addBatch = () => {
    setFormData(prev => ({
      ...prev,
      batches: [
        ...prev.batches,
        { label: `Batch ${prev.batches.length + 1}`, startDate: "", endDate: "", seats: 40, price: prev.price }
      ]
    }));
  };

  const removeBatch = (index: number) => {
    setFormData(prev => ({
      ...prev,
      batches: prev.batches.filter((_, i) => i !== index)
    }));
  };

  // Itinerary Helpers
  const addItineraryDay = () => {
    setFormData(prev => ({
      ...prev,
      itinerary: [
        ...prev.itinerary,
        { day: `Day ${prev.itinerary.length + 1}`, title: "", description: "" }
      ]
    }));
  };

  const removeItineraryDay = (index: number) => {
    setFormData(prev => ({
      ...prev,
      itinerary: prev.itinerary.filter((_, i) => i !== index)
    }));
  };

  // Inclusions Helpers
  const [newInclusion, setNewInclusion] = useState("");
  const addInclusion = () => {
    if (!newInclusion.trim()) return;
    setFormData(prev => ({
      ...prev,
      inclusions: [...prev.inclusions, newInclusion.trim()]
    }));
    setNewInclusion("");
  };

  const removeInclusion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      inclusions: prev.inclusions.filter((_, i) => i !== index)
    }));
  };

  return (
    <main className="space-y-8 pb-16">
      {/* Top Banner & Header - Clean Light Theme */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200/90 text-[#ea580c] text-xs font-bold uppercase tracking-wider">
            <Flame className="w-3.5 h-3.5 fill-[#ea580c]" />
            Swami Sharanam • Sacred Yatras
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
            Ayyapa Diksha Devotional Tours
          </h1>
          <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
            Manage sacred Sabarimala & Ayyapa Diksha pilgrimage trips. Add batch departures, Guruswamy coordination details, Irumudi guidelines, and control presence in the top ticker bar.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/ayyapa-diksha-devotional-tours"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold text-stone-700 bg-stone-50 hover:bg-stone-100 border border-stone-200 transition-all shadow-2xs"
          >
            <Eye className="w-3.5 h-3.5 text-[#ea580c]" />
            <span>View Public Page</span>
            <ExternalLink className="w-3 h-3 text-stone-400" />
          </Link>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#ea580c] hover:bg-orange-700 text-white shadow-md shadow-orange-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Ayyapa Tour</span>
          </button>
        </div>
      </div>

      {/* Tours List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <span>Sacred Tours</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 font-bold">
              {tours.length}
            </span>
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-16 bg-white rounded-3xl border border-stone-200">
            <Loader2 className="w-8 h-8 animate-spin text-[#ea580c]" />
          </div>
        ) : tours.length === 0 ? (
          <div className="text-center p-12 sm:p-16 bg-white rounded-3xl border border-stone-200 space-y-4 shadow-sm">
            <div className="size-16 rounded-2xl bg-orange-50 text-[#ea580c] flex items-center justify-center mx-auto border border-orange-200">
              <Flame className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="font-display text-xl font-bold text-stone-900">No Ayyapa Tours Added Yet</h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                Click the button below to add your first Swami Sharanam Ayyapa Diksha Devotional Tour. You can also use the AI Extractor to automatically read from a flyer!
              </p>
            </div>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#ea580c] hover:bg-orange-700 text-white transition-all shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Sabarimala Tour
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tours.map((tour) => (
              <div 
                key={tour._id} 
                className="bg-white rounded-3xl overflow-hidden border border-stone-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-48 w-full overflow-hidden bg-stone-100">
                    <img
                      src={tour.image || DEFAULT_AYYAPA_IMAGE}
                      alt={tour.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                    
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-600 text-white shadow-sm flex items-center gap-1">
                        <Flame className="w-3 h-3 fill-white" />
                        Ayyapa Diksha
                      </span>
                      {tour.showInTicker && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur-md text-stone-900 border border-stone-200">
                          {tour.tickerBadge || "TICKER"}
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <div className="text-[10.5px] uppercase font-bold text-orange-300 tracking-wider flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-orange-400" />
                        {tour.destination}, {tour.state || "Kerala"}
                      </div>
                      <h3 className="font-display text-base font-bold text-white truncate">
                        {tour.title}
                      </h3>
                    </div>
                  </div>

                  <div className="p-5 space-y-3 text-xs text-stone-600">
                    <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                      <span className="text-stone-400 uppercase tracking-wider font-semibold text-[10px]">Price / Devotee</span>
                      <span className="text-sm font-bold text-stone-900">{tour.price}</span>
                    </div>

                    <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                      <span className="text-stone-400 uppercase tracking-wider font-semibold text-[10px]">Duration</span>
                      <span className="font-semibold text-stone-800 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#ea580c]" />
                        {tour.duration}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                      <span className="text-stone-400 uppercase tracking-wider font-semibold text-[10px]">Batches</span>
                      <span className="font-bold text-[#ea580c] bg-orange-50 px-2 py-0.5 rounded-full text-[11px]">
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
                    className="inline-flex items-center gap-1 text-xs font-semibold text-stone-700 hover:text-stone-900"
                  >
                    <span>View Public</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>

                  <div className="flex items-center gap-1.5">
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

      {/* Comprehensive Add / Edit Modal with AI Extractor */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto shadow-2xl border border-stone-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-2xl bg-orange-50 text-[#ea580c] flex items-center justify-center font-bold border border-orange-200">
                  <Flame className="w-5 h-5 fill-[#ea580c]" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-stone-900">
                    {editingTour ? "Edit Ayyapa Tour" : "Add Swami Sharanam Ayyapa Tour"}
                  </h3>
                  <p className="text-xs text-stone-500">
                    Complete with AI Itinerary Extractor, batch scheduler, and sacred inclusions.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setModalOpen(false)}
                className="size-8 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* ✨ AI Itinerary & Poster Extractor Section */}
            <div className="rounded-2xl border border-orange-200 bg-orange-50/60 p-4 sm:p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-[#ea580c]" />
                  <span>Gemini AI Poster & Itinerary Extractor</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAiImport(!showAiImport)}
                  className="text-xs font-semibold text-[#ea580c] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {showAiImport ? "Hide AI Extractor" : "✨ Extract from Poster / Notes"}
                </button>
              </div>

              {showAiImport && (
                <div className="pt-2 space-y-4 border-t border-orange-200/60">
                  <p className="text-xs text-stone-600">
                    Upload an Ayyapa yatra flyer/poster or paste WhatsApp itinerary notes. Gemini AI will automatically extract destination, duration, price, Day-by-Day itinerary, and inclusions!
                  </p>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block">
                        Option A: Upload Yatra Poster
                      </label>
                      <div className="bg-white rounded-xl p-2 border border-stone-200">
                        <CloudinaryUpload
                          value={aiImageUrl}
                          onChange={(url) => setAiImageUrl(url)}
                          label="Upload Yatra Poster / Flyer"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 flex flex-col justify-between">
                      <div>
                        <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block mb-1">
                          Option B: Paste Raw Notes / Message
                        </label>
                        <textarea
                          rows={4}
                          placeholder="Paste WhatsApp itinerary or notes here..."
                          value={aiText}
                          onChange={(e) => setAiText(e.target.value)}
                          className="w-full rounded-xl border border-stone-200 bg-white p-3 text-xs text-stone-900 focus:border-[#ea580c] focus:outline-none resize-none"
                        />
                      </div>

                      <button
                        type="button"
                        disabled={aiExtracting || (!aiText && !aiImageUrl)}
                        onClick={handleAiExtract}
                        className="w-full py-2 px-4 rounded-xl text-xs font-bold bg-[#ea580c] hover:bg-orange-700 disabled:opacity-50 text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                      >
                        {aiExtracting ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Extracting with Gemini AI...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Auto-Fill Details with AI</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Main Tour Form */}
            <form onSubmit={handleSave} className="space-y-6">
              
              {/* Basic Info */}
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Destination</label>
                  <input
                    type="text"
                    required
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-stone-200 bg-white text-sm text-stone-900 focus:border-[#ea580c] focus:outline-none"
                    placeholder="Sabarimala"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">State / Region</label>
                  <select
                    value={formData.state || "Kerala"}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-stone-200 bg-white text-sm text-stone-900 focus:border-[#ea580c] focus:outline-none"
                  >
                    {indianStates.map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">URL Slug</label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-stone-200 bg-stone-50 text-xs text-stone-600 focus:outline-none"
                    placeholder="ayyapa-diksha-tour"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Tour Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-stone-200 bg-white text-sm text-stone-900 focus:border-[#ea580c] focus:outline-none"
                  placeholder="Swami Sharanam Ayyapa Diksha Devotional Tour"
                />
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Price per Devotee</label>
                  <input
                    type="text"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-stone-200 bg-white text-sm text-stone-900 focus:border-[#ea580c] focus:outline-none"
                    placeholder="₹4,999"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Duration</label>
                  <input
                    type="text"
                    required
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-stone-200 bg-white text-sm text-stone-900 focus:border-[#ea580c] focus:outline-none"
                    placeholder="4 Days / 3 Nights"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Total Seats</label>
                  <input
                    type="number"
                    required
                    value={formData.seats}
                    onChange={(e) => setFormData({ ...formData, seats: Number(e.target.value) })}
                    className="w-full h-10 px-3 rounded-xl border border-stone-200 bg-white text-sm text-stone-900 focus:border-[#ea580c] focus:outline-none"
                    placeholder="40"
                  />
                </div>
              </div>

              {/* Batches Scheduler */}
              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#ea580c]" />
                    Departure Batches (Mandala Kalam / Makaravilakku)
                  </span>
                  <button
                    type="button"
                    onClick={addBatch}
                    className="text-xs font-bold text-[#ea580c] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Add Batch
                  </button>
                </div>

                <div className="space-y-2.5">
                  {formData.batches.map((batch, index) => (
                    <div key={index} className="grid grid-cols-1 sm:grid-cols-4 gap-2 bg-white p-3 rounded-xl border border-stone-200">
                      <div>
                        <input
                          type="text"
                          placeholder="Batch Label (e.g. Batch 1)"
                          value={batch.label || ""}
                          onChange={(e) => {
                            const newBatches = [...formData.batches];
                            newBatches[index].label = e.target.value;
                            setFormData({ ...formData, batches: newBatches });
                          }}
                          className="w-full h-8 px-2 text-xs rounded-lg border border-stone-200"
                        />
                      </div>
                      <div>
                        <input
                          type="date"
                          value={batch.startDate || ""}
                          onChange={(e) => {
                            const newBatches = [...formData.batches];
                            newBatches[index].startDate = e.target.value;
                            setFormData({ ...formData, batches: newBatches });
                          }}
                          className="w-full h-8 px-2 text-xs rounded-lg border border-stone-200"
                        />
                      </div>
                      <div>
                        <input
                          type="date"
                          value={batch.endDate || ""}
                          onChange={(e) => {
                            const newBatches = [...formData.batches];
                            newBatches[index].endDate = e.target.value;
                            setFormData({ ...formData, batches: newBatches });
                          }}
                          className="w-full h-8 px-2 text-xs rounded-lg border border-stone-200"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Price"
                          value={batch.price || ""}
                          onChange={(e) => {
                            const newBatches = [...formData.batches];
                            newBatches[index].price = e.target.value;
                            setFormData({ ...formData, batches: newBatches });
                          }}
                          className="w-full h-8 px-2 text-xs rounded-lg border border-stone-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeBatch(index)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Day-by-Day Itinerary Builder */}
              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#ea580c]" />
                    Day-by-Day Sacred Itinerary
                  </span>
                  <button
                    type="button"
                    onClick={addItineraryDay}
                    className="text-xs font-bold text-[#ea580c] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Add Day
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.itinerary.map((item, index) => (
                    <div key={index} className="bg-white p-3.5 rounded-xl border border-stone-200 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          placeholder="Day 1"
                          value={item.day}
                          onChange={(e) => {
                            const newIt = [...formData.itinerary];
                            newIt[index].day = e.target.value;
                            setFormData({ ...formData, itinerary: newIt });
                          }}
                          className="w-24 h-8 px-2 text-xs font-bold rounded-lg border border-stone-200"
                        />
                        <input
                          type="text"
                          placeholder="Day Title"
                          value={item.title}
                          onChange={(e) => {
                            const newIt = [...formData.itinerary];
                            newIt[index].title = e.target.value;
                            setFormData({ ...formData, itinerary: newIt });
                          }}
                          className="flex-1 h-8 px-2 text-xs font-semibold rounded-lg border border-stone-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeItineraryDay(index)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        placeholder="Detailed sacred schedule for this day..."
                        value={item.description}
                        onChange={(e) => {
                          const newIt = [...formData.itinerary];
                          newIt[index].description = e.target.value;
                          setFormData({ ...formData, itinerary: newIt });
                        }}
                        className="w-full p-2 text-xs rounded-lg border border-stone-200 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Inclusions */}
              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                <span className="text-xs font-bold text-stone-900 uppercase tracking-wider block">
                  Sacred Inclusions
                </span>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Daily Pure Satvik Meals"
                    value={newInclusion}
                    onChange={(e) => setNewInclusion(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addInclusion();
                      }
                    }}
                    className="flex-1 h-9 px-3 text-xs rounded-xl border border-stone-200 bg-white"
                  />
                  <button
                    type="button"
                    onClick={addInclusion}
                    className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {formData.inclusions.map((inc, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-stone-200 text-xs text-stone-800 shadow-2xs">
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>{inc}</span>
                      <button type="button" onClick={() => removeInclusion(i)} className="text-stone-400 hover:text-red-500 ml-1">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Images */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Main Cover Photo</label>
                  <CloudinaryUpload
                    value={formData.image}
                    onChange={(url) => setFormData({ ...formData, image: url })}
                    label="Upload Cover Photo"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Trip Description</label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-3 rounded-xl border border-stone-200 bg-white text-xs text-stone-900 focus:border-[#ea580c] focus:outline-none"
                    placeholder="Describe this sacred yatra..."
                  />
                </div>
              </div>

              {/* Ticker & Featured Control */}
              <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-stone-900 block">Float in Top Announcement Ticker</span>
                    <span className="text-[11px] text-stone-600">Continuously displays this sacred tour across the top bar.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.showInTicker}
                    onChange={(e) => setFormData({ ...formData, showInTicker: e.target.checked })}
                    className="size-5 rounded border-stone-300 text-[#ea580c] focus:ring-orange-500 cursor-pointer"
                  />
                </div>

                {formData.showInTicker && (
                  <div className="pt-2 border-t border-orange-200">
                    <label className="text-[11px] font-bold text-stone-700 block mb-1">Ticker Badge</label>
                    <input
                      type="text"
                      value={formData.tickerBadge}
                      onChange={(e) => setFormData({ ...formData, tickerBadge: e.target.value })}
                      className="w-full h-9 px-3 rounded-xl border border-orange-200 text-xs bg-white text-stone-900 font-semibold"
                      placeholder="AYYAPA SPECIAL"
                    />
                  </div>
                )}
              </div>

              {/* Footer Actions */}
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
                  className="px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#ea580c] hover:bg-orange-700 text-white transition-all shadow-md flex items-center gap-2 cursor-pointer"
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
