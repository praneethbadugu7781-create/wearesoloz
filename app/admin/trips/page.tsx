"use client";
import { getAuthHeaders } from "@/lib/api";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

import { useEffect, useState } from "react";
import { Compass, Plus, Edit2, Trash2, Check, Loader2, Calendar, Users, Sparkles, X, FileSpreadsheet, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CloudinaryUpload } from "@/components/cloudinary-upload";
import { exportToCSV, exportToPDF, formatPriceForExport } from "@/lib/export";

interface ItineraryItem {
  day: string;
  title: string;
  description: string;
}

interface Participant {
  name: string;
  phone: string;
}

interface TripData {
  _id?: string;
  destination: string;
  state: string;
  category?: string;
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
  itinerary: ItineraryItem[];
  inclusions: string[];
  participants?: Participant[];
  recap?: string;
}

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

const emptyForm: TripData = {
  destination: "",
  state: "Telangana",
  category: "Adventure",
  slug: "",
  date: "",
  duration: "",
  price: "",
  seats: 10,
  description: "",
  image: "",
  images: [],
  featured: false,
  status: "published",
  itinerary: [
    { day: "Day 1", title: "Arrival", description: "Arrive at pickup location." }
  ],
  inclusions: ["Shared accommodation (AC/Non-AC)", "Transfers (AC/Non-AC)", "Breakfast & Dinner", "Tour Guide"],
  participants: [],
  recap: ""
};

export default function AdminTripsPage() {
  const [trips, setTrips] = useState<TripData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState<"list" | "form">("list");
  const [formData, setFormData] = useState<TripData>(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [subView, setSubView] = useState<"all" | "months">("all");
  const [isInternational, setIsInternational] = useState(false);

  // State for scheduling draft templates
  const [schedulingMonth, setSchedulingMonth] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [scheduleDate, setScheduleDate] = useState<string>("");
  const [scheduling, setScheduling] = useState(false);

  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState("");

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
      date: formattedDate,
      images: trip.images || [],
      participants: trip.participants || [],
      recap: trip.recap || ""
    });
    setEditId(trip._id || null);
    const isInter = trip.state ? !indianStates.includes(trip.state) : false;
    setIsInternational(isInter);
    setView("form");
  };

  const addParticipant = () => {
    const current = formData.participants || [];
    setFormData({
      ...formData,
      participants: [...current, { name: "", phone: "" }]
    });
  };

  const removeParticipant = (idxToRemove: number) => {
    const current = formData.participants || [];
    setFormData({
      ...formData,
      participants: current.filter((_, idx) => idx !== idxToRemove)
    });
  };

  const updateParticipant = (index: number, field: "name" | "phone", value: string) => {
    const current = formData.participants || [];
    const updated = current.map((p, idx) => {
      if (idx === index) {
        return { ...p, [field]: value };
      }
      return p;
    });
    setFormData({
      ...formData,
      participants: updated
    });
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
      const current = formData.participants || [];
      setFormData({
        ...formData,
        participants: [...current, ...parsed]
      });
      setImportText("");
      setShowImportModal(false);
      alert(`Successfully imported ${parsed.length} participants!`);
    } else {
      alert("Could not parse any valid phone numbers. Ensure input has names and phone numbers.");
    }
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

  const handleExportCSV = () => {
    if (trips.length === 0) return alert("No data to export.");
    const headersMap = {
      destination: "Destination",
      state: "State",
      category: "Category",
      date: "Departure Date",
      duration: "Duration",
      price: "Price",
      seats: "Seats",
      status: "Status"
    };

    const dataToExport = trips.map(t => ({
      ...t,
      date: t.date ? new Date(t.date).toLocaleDateString() : "",
      price: formatPriceForExport(t.price)
    }));

    exportToCSV(dataToExport, headersMap, `trips_export_${new Date().toISOString().split("T")[0]}.csv`);
  };

  const handleExportPDF = async () => {
    if (trips.length === 0) return alert("No data to export.");
    const headers = ["Destination", "State", "Category", "Departure Date", "Duration", "Price", "Seats", "Status"];
    const rows = trips.map(t => [
      t.destination,
      t.state || "Telangana",
      t.category || "Adventure",
      t.date ? new Date(t.date).toLocaleDateString() : "",
      t.duration,
      formatPriceForExport(t.price),
      t.seats,
      t.status
    ]);

    await exportToPDF(
      "WeAreSoloz - Group Trips Report",
      headers,
      rows,
      `trips_report_${new Date().toISOString().split("T")[0]}.pdf`
    );
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
      setIsInternational(false);
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

  // Group trips by month, pre-initializing 12 months starting from July 2026
  // Only displays published/scheduled trips in the Month-wise calendar slots
  const groupTripsByMonth = (tripsList: TripData[]) => {
    const groups: { [key: string]: TripData[] } = {};
    
    // Pre-initialize 12 upcoming months starting from July 2026
    const startDate = new Date(2026, 6, 1); // July 2026
    for (let i = 0; i < 12; i++) {
      const d = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
      const label = d.toLocaleString("en-US", { month: "long", year: "numeric" });
      groups[label] = [];
    }

    const sorted = [...tripsList]
      .filter((t) => t.status === "published")
      .sort((a, b) => {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });

    sorted.forEach((trip) => {
      if (trip.date) {
        const d = new Date(trip.date);
        if (!isNaN(d.getTime())) {
          const label = d.toLocaleString("en-US", { month: "long", year: "numeric" });
          if (!groups[label]) groups[label] = []; // Fallback for outside the 12 month range
          groups[label].push(trip);
        }
      }
    });

    return groups;
  };

  const handleCreateForMonth = (monthLabel: string) => {
    setSchedulingMonth(monthLabel);
    const parsedDate = new Date(monthLabel);
    let defaultDate = "";
    if (!isNaN(parsedDate.getTime())) {
      const year = parsedDate.getFullYear();
      const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
      defaultDate = `${year}-${month}-01`;
    }
    setScheduleDate(defaultDate);
    const firstDraft = trips.find((t) => t.status === "draft") || trips[0];
    setSelectedTemplateId(firstDraft?._id || "");
  };

  const handleScheduleTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplateId) {
      alert("Please select a template trip.");
      return;
    }
    if (!scheduleDate) {
      alert("Please select a date.");
      return;
    }

    const template = trips.find((t) => t._id === selectedTemplateId);
    if (!template) return;

    // Clone the template data without ID so it saves as a NEW trip copy!
    const { _id, __v, createdAt, updatedAt, id, ...cloneData } = template as any;

    setScheduling(true);
    try {
      const res = await fetch(`${API_URL}/admin/trips`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({
          ...cloneData,
          date: scheduleDate,
          status: "published"
        })
      });

      if (!res.ok) throw new Error("Failed to schedule trip");

      setSchedulingMonth(null);
      setSelectedTemplateId("");
      setScheduleDate("");
      fetchTrips();
    } catch (err: any) {
      alert(err.message || "Error scheduling trip.");
    } finally {
      setScheduling(false);
    }
  };

  const handleCustomizeTemplate = () => {
    if (!selectedTemplateId) {
      alert("Please select a template trip first.");
      return;
    }
    const template = trips.find((t) => t._id === selectedTemplateId);
    if (!template) return;

    // Clone the template data without ID so it saves as a NEW trip copy when they save!
    const { _id, __v, createdAt, updatedAt, id, ...cloneData } = template as any;

    setFormData({
      ...cloneData,
      date: scheduleDate,
      status: "published"
    });
    setEditId(null); // Setting editId to null creates a NEW trip on save!
    setSchedulingMonth(null);
    const isInter = template.state ? !indianStates.includes(template.state) : false;
    setIsInternational(isInter);
    setView("form");
  };

  const handleCreateNewFromScratch = () => {
    setFormData({
      ...emptyForm,
      date: scheduleDate,
      status: "published"
    });
    setEditId(null);
    setSchedulingMonth(null);
    setIsInternational(false);
    setView("form");
  };

  // Render a single trip card to avoid code duplication
  const renderTripCard = (trip: TripData) => (
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
  );

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
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleExportCSV} variant="secondary" className="pt-0.5 border-white/10 hover:bg-white/5 text-white">
              <FileSpreadsheet size={16} className="mr-2 text-emerald-500" /> Export Excel
            </Button>
            <Button onClick={handleExportPDF} variant="secondary" className="pt-0.5 border-white/10 hover:bg-white/5 text-white">
              <FileText size={16} className="mr-2 text-red-500" /> Export PDF
            </Button>
            <Button onClick={() => { setFormData(emptyForm); setEditId(null); setIsInternational(false); setView("form"); }} className="pt-0.5">
              <Plus size={16} className="mr-2" /> Create New Trip
            </Button>
          </div>
        ) : (
          <Button onClick={() => setView("list")} variant="secondary" className="pt-0.5">
            Cancel Edit
          </Button>
        )}
      </div>

      {view === "list" && !loading && trips.length > 0 && (
        <div className="flex border-b border-white/10 pb-1 gap-6">
          <button
            onClick={() => setSubView("all")}
            className={`text-sm font-semibold pb-2 border-b-2 transition-all duration-300 ${
              subView === "all"
                ? "border-soloz-ember text-white"
                : "border-transparent text-soloz-ash/60 hover:text-white"
            }`}
          >
            All Trips ({trips.length})
          </button>
          <button
            onClick={() => setSubView("months")}
            className={`text-sm font-semibold pb-2 border-b-2 transition-all duration-300 ${
              subView === "months"
                ? "border-soloz-ember text-white"
                : "border-transparent text-soloz-ash/60 hover:text-white"
            }`}
          >
            Month-wise ({Object.keys(groupTripsByMonth(trips)).length} Months)
          </button>
        </div>
      )}

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
          <div className="space-y-10">
            {subView === "all" ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {trips.map((trip) => renderTripCard(trip))}
              </div>
            ) : (
              <div className="space-y-12">
                {Object.entries(groupTripsByMonth(trips)).map(([month, monthTrips]) => (
                  <div key={month} className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <h3 className="font-display text-sm font-bold text-white uppercase tracking-wider text-soloz-amber">
                          {month}
                        </h3>
                        <span className="bg-white/10 text-white/70 px-2 py-0.5 rounded text-[10px] font-bold">
                          {monthTrips.length} {monthTrips.length === 1 ? "trip" : "trips"}
                        </span>
                      </div>
                      <div className="flex-1 h-px bg-white/10" />
                      {monthTrips.length > 0 && (
                        <button
                          type="button"
                          onClick={() => handleCreateForMonth(month)}
                          className="text-[10px] uppercase font-bold text-[#ff7a1a] hover:text-[#ff7a1a]/85 transition-all flex items-center gap-1 shrink-0"
                        >
                          <Plus size={12} /> Add Trip
                        </button>
                      )}
                    </div>
                    {monthTrips.length > 0 ? (
                      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {monthTrips.map((trip) => renderTripCard(trip))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center border border-dashed border-white/10 rounded-xl py-6 px-4 bg-white/[0.01] text-soloz-ash/40 text-center gap-2">
                        <span className="text-xs">No trips scheduled for this month.</span>
                        <button
                          type="button"
                          onClick={() => handleCreateForMonth(month)}
                          className="text-[10px] uppercase font-bold text-[#ff7a1a] hover:underline flex items-center gap-1"
                        >
                          <Plus size={10} /> Add Trip for {month.split(" ")[0]}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      ) : (
        /* EDIT / CREATE FORM */
        <form onSubmit={handleSave} className="rounded-xl border border-white/10 bg-[#14110d] p-6 sm:p-8 space-y-6 max-w-4xl">
          <h3 className="font-display text-xl font-bold text-white border-b border-white/5 pb-3">
            {editId ? "Edit Trip Details" : "Create New Group Tour"}
          </h3>

          <div className="grid gap-6 sm:grid-cols-4">
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
              <label className="text-[10px] uppercase tracking-wider text-soloz-ash/60 block mb-1">Region Type</label>
              <select
                value={isInternational ? "international" : "domestic"}
                onChange={(e) => {
                  const isInter = e.target.value === "international";
                  setIsInternational(isInter);
                  setFormData({ ...formData, state: isInter ? "" : "Telangana" });
                }}
                className="h-10 w-full rounded-lg border border-white/10 bg-[#14110d] px-3 text-sm text-white focus:border-soloz-ember/50 focus:outline-none mb-4"
              >
                <option value="domestic">State-wise (India)</option>
                <option value="international">International</option>
              </select>
            </div>
            
            {isInternational ? (
              <div>
                <label className="text-[10px] uppercase tracking-wider text-soloz-ash/60 block mb-1">Country / Region</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sri Lanka"
                  value={formData.state || ""}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="h-10 w-full rounded-lg border border-white/10 bg-[#14110d] px-3 text-sm text-white focus:border-soloz-ember/50 focus:outline-none"
                />
              </div>
            ) : (
              <div>
                <label className="text-[10px] uppercase tracking-wider text-soloz-ash/60 block mb-1">State / Region</label>
                <select
                  value={formData.state || "Telangana"}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="h-10 w-full rounded-lg border border-white/10 bg-[#14110d] px-3 text-sm text-white focus:border-soloz-ember/50 focus:outline-none"
                >
                  {indianStates.map((state) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="text-[10px] uppercase tracking-wider text-soloz-ash/60 block mb-1">Category</label>
              <select
                value={formData.category || "Adventure"}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="h-10 w-full rounded-lg border border-white/10 bg-[#14110d] px-3 text-sm text-white focus:border-soloz-ember/50 focus:outline-none"
              >
                <option value="Temples">Temples</option>
                <option value="Treks">Treks</option>
                <option value="Adventure">Adventure</option>
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

          {/* Additional Gallery Images Section */}
          <div className="space-y-4 pt-4 border-t border-white/5">
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-soloz-amber">Additional Gallery Images</h4>
              <p className="text-xs text-soloz-ash/60 mt-1">Upload multiple photos. If two or more are added, they will scroll side-by-side in a slideshow on the website.</p>
            </div>

            {formData.images && formData.images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {formData.images.map((imgUrl, index) => (
                  <div key={index} className="relative aspect-video rounded-lg overflow-hidden border border-white/10 group bg-black/40">
                    <img src={imgUrl} alt={`Gallery image ${index + 1}`} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = formData.images.filter((_, idx) => idx !== index);
                        setFormData({ ...formData, images: updated });
                      }}
                      className="absolute right-2 top-2 grid size-6 place-items-center rounded-full bg-red-500/90 text-white hover:bg-red-600 transition-colors"
                      title="Remove Image"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="max-w-md">
              <CloudinaryUpload
                value=""
                onChange={(url) => {
                  if (url) {
                    const currentImages = formData.images || [];
                    setFormData({ ...formData, images: [...currentImages, url] });
                  }
                }}
                label="Add Gallery Image"
              />
            </div>
          </div>

          {/* Trip Recap Section */}
          <div className="space-y-4 pt-4 border-t border-white/5">
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-soloz-amber">Trip Recap</h4>
              <p className="text-xs text-soloz-ash/60 mt-1">Written recap of this completed trip for the scrapbook page.</p>
            </div>
            <textarea
              rows={3}
              placeholder="e.g. We had an amazing time trekking through the Ananthagiri Hills! 12 travelers joined and we experienced a beautiful sunset..."
              value={formData.recap || ""}
              onChange={(e) => setFormData({ ...formData, recap: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white focus:border-soloz-ember/50 focus:outline-none resize-none"
            />
          </div>

          {/* Participants section */}
          <div className="space-y-4 pt-4 border-t border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-soloz-amber">Trip Participants</h4>
                <p className="text-xs text-soloz-ash/60 mt-1">Attendees who are verified to upload/comment/react to memories.</p>
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowImportModal(true)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-soloz-ember hover:underline"
                >
                  Import List
                </button>
                <button
                  type="button"
                  onClick={addParticipant}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-soloz-ember hover:underline"
                >
                  + Add Attendee
                </button>
              </div>
            </div>

            {(formData.participants || []).length === 0 ? (
              <div className="text-xs text-soloz-ash/40 italic p-3 border border-white/5 rounded-lg bg-black/10">
                No participants added yet. Add participants manually or import a list so they can verify and post memories.
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {(formData.participants || []).map((part, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input
                      type="text"
                      required
                      placeholder="Full Name (e.g. Akhil)"
                      value={part.name}
                      onChange={(e) => updateParticipant(index, "name", e.target.value)}
                      className="h-10 flex-1 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-soloz-ember/50 focus:outline-none"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Phone (e.g. 9876543210)"
                      value={part.phone}
                      onChange={(e) => updateParticipant(index, "phone", e.target.value)}
                      className="h-10 flex-1 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-soloz-ember/50 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => removeParticipant(index)}
                      className="grid size-10 shrink-0 place-items-center rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                    >
                      <X size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
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

      {/* Scheduling Modal */}
      {schedulingMonth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-xl border border-white/10 bg-[#14110d] p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setSchedulingMonth(null)}
              className="absolute right-4 top-4 text-soloz-ash/60 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>

            <div className="space-y-1">
              <h3 className="font-display text-lg font-bold text-white">
                Schedule Trip for {schedulingMonth}
              </h3>
              <p className="text-xs text-soloz-ash/60">
                Choose an existing draft template to schedule, or build a new one.
              </p>
            </div>

            <form onSubmit={handleScheduleTrip} className="space-y-4 pt-2">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-soloz-ash/60 block font-semibold">
                  Select Template Trip
                </label>
                {trips.length === 0 ? (
                  <div className="text-xs text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded p-2">
                    No template trips available in the database.
                  </div>
                ) : (
                  <select
                    required
                    value={selectedTemplateId}
                    onChange={(e) => setSelectedTemplateId(e.target.value)}
                    className="h-10 w-full rounded-lg border border-white/10 bg-[#1a1712] px-3 text-sm text-white focus:border-soloz-ember/50 focus:outline-none"
                  >
                    <option value="" disabled>-- Select a template --</option>
                    {trips.map((t) => {
                      const dateStr = t.date ? ` - ${new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}` : "";
                      const statusStr = t.status === "draft" ? " (Draft)" : dateStr;
                      return (
                        <option key={t._id} value={t._id}>
                          {t.destination} ({t.state} - {t.duration}){statusStr}
                        </option>
                      );
                    })}
                  </select>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-soloz-ash/60 block font-semibold">
                  Departure Date
                </label>
                <input
                  type="date"
                  required
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="h-10 w-full rounded-lg border border-white/10 bg-[#1a1712] px-3 text-sm text-white focus:border-soloz-ember/50 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <Button
                  type="submit"
                  disabled={scheduling || trips.length === 0}
                  className="w-full justify-center pt-0.5"
                >
                  {scheduling ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={15} /> Scheduling...
                    </>
                  ) : (
                    "Schedule & Publish Now"
                  )}
                </Button>
                
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleCustomizeTemplate}
                    disabled={scheduling || !selectedTemplateId}
                    className="h-10 rounded-lg border border-white/10 bg-white/5 px-4 text-xs font-semibold text-white hover:bg-white/10 transition-colors disabled:opacity-50 disabled:pointer-events-none"
                  >
                    Customize Details
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateNewFromScratch}
                    disabled={scheduling}
                    className="h-10 rounded-lg border border-white/10 bg-white/5 px-4 text-xs font-semibold text-white hover:bg-white/10 transition-colors"
                  >
                    New from Scratch
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Participants Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-xl border border-white/10 bg-[#14110d] p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => {
                setShowImportModal(false);
                setImportText("");
              }}
              className="absolute right-4 top-4 text-soloz-ash/60 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>

            <div className="space-y-1">
              <h3 className="font-display text-lg font-bold text-white">
                Import Attendees
              </h3>
              <p className="text-xs text-soloz-ash/60">
                Paste names and phone numbers. Format: One participant per line, e.g. <code className="text-soloz-amber">Name - 9876543210</code> or <code className="text-soloz-amber">Name, 9876543210</code>.
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
                  Parse & Add
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
