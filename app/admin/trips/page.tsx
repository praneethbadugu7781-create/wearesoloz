"use client";
import { getAuthHeaders } from "@/lib/api";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

import { useEffect, useState } from "react";
import { Compass, Plus, Edit2, Trash2, Check, Loader2, Calendar, Users, Sparkles, X, FileSpreadsheet, FileText, ClipboardCheck, Search, Printer, Download, ExternalLink, Copy, RefreshCw } from "lucide-react";
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

export interface BatchItem {
  startDate: string;
  endDate: string;
  seats?: number;
  price?: string;
  label?: string;
}

interface TripData {
  _id?: string;
  destination: string;
  state: string;
  category?: string;
  slug: string;
  date: string;
  startDate?: string;
  endDate?: string;
  batches?: BatchItem[];
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
  confirmationCode?: string;
  confirmationLinkEnabled?: boolean;
  pickupLocation?: string;
  feedbackCode?: string;
  feedbackLinkEnabled?: boolean;
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
  startDate: "",
  endDate: "",
  batches: [],
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
  recap: "",
  confirmationCode: "",
  confirmationLinkEnabled: true,
  pickupLocation: "Default City Meeting Point",
  feedbackCode: "",
  feedbackLinkEnabled: true
};

export default function AdminTripsPage() {
  const [trips, setTrips] = useState<TripData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState<"list" | "form" | "confirmations">("list");
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

  // State for AI Itinerary Extractor
  const [aiText, setAiText] = useState("");
  const [aiImageUrl, setAiImageUrl] = useState("");
  const [aiExtracting, setAiExtracting] = useState(false);
  const [showAiImport, setShowAiImport] = useState(false);

  // Waiver Confirmations Dashboard States
  const [selectedTripForWaivers, setSelectedTripForWaivers] = useState<TripData | null>(null);
  const [waiverSubmissions, setWaiverSubmissions] = useState<any[]>([]);
  const [loadingWaivers, setLoadingWaivers] = useState(false);
  const [waiversSearch, setWaiversSearch] = useState("");
  const [selectedWaiverDetail, setSelectedWaiverDetail] = useState<any | null>(null);

  const fetchWaivers = async (tripId: string) => {
    setLoadingWaivers(true);
    try {
      const res = await fetch(`${API_URL}/admin/trips/${tripId}/waivers`, {
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error("Failed to load waiver submissions");
      const data = await res.json();
      setWaiverSubmissions(data);
    } catch (err: any) {
      alert(err.message || "Error loading waiver submissions.");
    } finally {
      setLoadingWaivers(false);
    }
  };

  const handleOpenWaivers = (trip: TripData) => {
    setSelectedTripForWaivers(trip);
    setWaiverSubmissions([]);
    fetchWaivers(trip._id!);
    setView("confirmations");
  };

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

  const [selectedBatchMonth, setSelectedBatchMonth] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  const calcDuration = (startStr?: string, endStr?: string): string => {
    if (!startStr || !endStr) return "";
    const s = new Date(startStr);
    const e = new Date(endStr);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return "";
    const diffTime = e.getTime() - s.getTime();
    if (diffTime < 0) return "1 Day";
    const days = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const nights = Math.max(0, days - 1);
    if (nights === 0) return `${days} Day${days > 1 ? "s" : ""}`;
    return `${days} Days / ${nights} Night${nights > 1 ? "s" : ""}`;
  };

  const handleStartDateChange = (val: string) => {
    const nextForm = { ...formData, startDate: val, date: val };
    if (!formData.endDate || formData.endDate < val) {
      nextForm.endDate = val;
    }
    const autoDur = calcDuration(val, nextForm.endDate);
    if (autoDur) {
      nextForm.duration = autoDur;
    }
    setFormData(nextForm);
  };

  const handleEndDateChange = (val: string) => {
    const nextForm = { ...formData, endDate: val };
    const autoDur = calcDuration(formData.startDate || formData.date, val);
    if (autoDur) {
      nextForm.duration = autoDur;
    }
    setFormData(nextForm);
  };

  const generateWeekendBatches = (yearMonthStr: string) => {
    if (!yearMonthStr) return;
    const [yearStr, monthStr] = yearMonthStr.split("-");
    const year = parseInt(yearStr);
    const monthIdx = parseInt(monthStr) - 1;

    let tripDays = 2;
    const durMatch = (formData.duration || "").match(/(\d+)\s*Day/i);
    if (durMatch) {
      tripDays = parseInt(durMatch[1]) || 2;
    }

    const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
    const newBatches: BatchItem[] = [];

    // For 3+ day trips start on Friday (5), else Saturday (6)
    const startDayTarget = tripDays >= 3 ? 5 : 6;

    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, monthIdx, d);
      if (dateObj.getDay() === startDayTarget) {
        const startStr = `${year}-${String(monthIdx + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        const endObj = new Date(year, monthIdx, d + (tripDays - 1));
        const endStr = `${endObj.getFullYear()}-${String(endObj.getMonth() + 1).padStart(2, "0")}-${String(endObj.getDate()).padStart(2, "0")}`;
        const monthName = dateObj.toLocaleDateString("en-IN", { month: "short" });

        newBatches.push({
          startDate: startStr,
          endDate: endStr,
          seats: formData.seats || 10,
          price: formData.price || "",
          label: `${monthName} ${d} - ${endObj.getDate()}`
        });
      }
    }

    if (newBatches.length > 0) {
      const existing = formData.batches || [];
      setFormData(prev => ({
        ...prev,
        startDate: prev.startDate || newBatches[0].startDate,
        endDate: prev.endDate || newBatches[0].endDate,
        date: prev.date || newBatches[0].startDate,
        batches: [...existing, ...newBatches]
      }));
    } else {
      alert("No weekend dates found for the selected month.");
    }
  };

  const addSingleBatch = () => {
    const existing = formData.batches || [];
    setFormData({
      ...formData,
      batches: [
        ...existing,
        {
          startDate: formData.startDate || "",
          endDate: formData.endDate || "",
          seats: formData.seats || 10,
          price: formData.price || "",
          label: `Batch ${existing.length + 1}`
        }
      ]
    });
  };

  const removeBatch = (idx: number) => {
    const existing = formData.batches || [];
    setFormData({
      ...formData,
      batches: existing.filter((_, i) => i !== idx)
    });
  };

  const updateBatch = (idx: number, field: keyof BatchItem, val: any) => {
    const existing = [...(formData.batches || [])];
    if (existing[idx]) {
      existing[idx] = { ...existing[idx], [field]: val };
      if (field === "startDate" && existing[idx].endDate && existing[idx].endDate < val) {
        existing[idx].endDate = val;
      }
      setFormData({ ...formData, batches: existing });
    }
  };

  const handleEdit = (trip: TripData) => {
    // Format date string to YYYY-MM-DD for date input
    const formattedDate = trip.date ? new Date(trip.date).toISOString().split("T")[0] : "";
    const formattedStartDate = trip.startDate ? new Date(trip.startDate).toISOString().split("T")[0] : formattedDate;
    const formattedEndDate = trip.endDate ? new Date(trip.endDate).toISOString().split("T")[0] : formattedDate;

    const formattedBatches = (trip.batches || []).map(b => ({
      ...b,
      startDate: b.startDate ? new Date(b.startDate).toISOString().split("T")[0] : "",
      endDate: b.endDate ? new Date(b.endDate).toISOString().split("T")[0] : ""
    }));

    setFormData({
      ...trip,
      date: formattedDate,
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      batches: formattedBatches,
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

  const handleAiExtract = async () => {
    if (!aiText && !aiImageUrl) {
      alert("Please provide either text or upload an itinerary image.");
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

      // Populate form data from extracted details!
      setFormData((prev) => ({
        ...prev,
        destination: data.destination || prev.destination,
        state: data.state || prev.state,
        category: data.category || prev.category,
        duration: data.duration || prev.duration,
        price: data.price || prev.price,
        seats: data.seats || prev.seats,
        description: data.description || prev.description,
        inclusions: data.inclusions && data.inclusions.length > 0 ? data.inclusions : prev.inclusions,
        itinerary: data.itinerary && data.itinerary.length > 0 ? data.itinerary : prev.itinerary,
        slug: data.destination 
          ? data.destination.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "")
          : prev.slug
      }));

      // Update international/domestic toggle if state is international
      if (data.state) {
        const isInter = !indianStates.includes(data.state);
        setIsInternational(isInter);
      }

      // Reset extractor state
      setAiText("");
      setAiImageUrl("");
      setShowAiImport(false);
      alert("✨ AI successfully extracted and filled the trip details!");
    } catch (err: any) {
      alert(err.message || "Error extracting itinerary.");
    } finally {
      setAiExtracting(false);
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

      const payload = {
        ...formData,
        date: formData.startDate || formData.date,
        startDate: formData.startDate || formData.date,
        endDate: formData.endDate || formData.startDate || formData.date,
        batches: formData.batches || []
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(payload)
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
      alert("Please select a template trip first.");
      return;
    }
    if (!scheduleDate) {
      alert("Please select a departure date.");
      return;
    }

    const template = trips.find((t) => t._id === selectedTemplateId);
    if (!template) {
      alert("Template trip not found.");
      return;
    }

    // Clone the template data without ID so it saves as a NEW trip copy!
    const { _id, __v, createdAt, updatedAt, id, ...cloneData } = template as any;

    // Ensure slug is unique by appending the scheduleDate and a random suffix if collision exists
    const baseSlug = (cloneData.slug || cloneData.destination || "trip")
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .replace(/-\d{4}-\d{2}-\d{2}.*$/, "");
    
    let newSlug = `${baseSlug}-${scheduleDate}`;
    if (trips.some((t) => t.slug === newSlug)) {
      newSlug = `${baseSlug}-${scheduleDate}-${Math.random().toString(36).substring(2, 6)}`;
    }

    setScheduling(true);
    try {
      const res = await fetch(`${API_URL}/admin/trips`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({
          ...cloneData,
          slug: newSlug,
          date: scheduleDate,
          startDate: scheduleDate,
          endDate: cloneData.endDate || scheduleDate,
          status: "published",
          participants: []
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to schedule trip");
      }

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

    const baseSlug = (cloneData.slug || cloneData.destination || "trip")
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .replace(/-\d{4}-\d{2}-\d{2}.*$/, "");
    
    let newSlug = `${baseSlug}-${scheduleDate}`;
    if (trips.some((t) => t.slug === newSlug)) {
      newSlug = `${baseSlug}-${scheduleDate}-${Math.random().toString(36).substring(2, 6)}`;
    }

    setFormData({
      ...cloneData,
      slug: newSlug,
      date: scheduleDate,
      startDate: scheduleDate,
      endDate: cloneData.endDate || scheduleDate,
      status: "published",
      participants: []
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
  const renderTripCard = (trip: TripData) => {
    const todayMidnight = new Date().setHours(0, 0, 0, 0);
    const batches = (trip.batches || []).filter((b: any) => b && (b.startDate || b.endDate));

    const isAllBatchesCompleted = batches.length > 0
      ? batches.every((b: any) => new Date(b.endDate || b.startDate).getTime() < todayMidnight)
      : trip.date && new Date(trip.date).getTime() < todayMidnight;

    const activeUpcomingBatches = batches.filter((b: any) => new Date(b.endDate || b.startDate).getTime() >= todayMidnight);

    return (
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
              {isAllBatchesCompleted ? (
                <span className="bg-red-600/90 text-white rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                  COMPLETED
                </span>
              ) : (
                <span
                  className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    trip.status === "published" ? "bg-emerald-500/80 text-white" : "bg-white/20 text-white"
                  }`}
                >
                  {trip.status}
                </span>
              )}
            </div>
          </div>
          <div className="p-5 space-y-3">
            <h3 className="font-display text-lg font-bold text-white leading-tight">{trip.destination}</h3>

            {batches.length > 0 ? (
              <div className="space-y-1.5 pt-1">
                <div className="text-[10px] uppercase tracking-wider text-soloz-amber font-extrabold flex items-center justify-between">
                  <span>Configured Batches ({batches.length})</span>
                  <span>{activeUpcomingBatches.length} Active</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {batches.map((b: any, idx: number) => {
                    const isDone = new Date(b.endDate || b.startDate).getTime() < todayMidnight;
                    const dateText = b.label || (b.startDate ? `${b.startDate}` : `Batch ${idx + 1}`);
                    return (
                      <span
                        key={idx}
                        className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                          isDone
                            ? "bg-red-950/60 text-red-300 border border-red-800/50 line-through"
                            : "bg-orange-950/60 text-orange-300 border border-orange-800/50 font-bold"
                        }`}
                      >
                        {dateText} {isDone ? "(Completed)" : ""}
                      </span>
                    );
                  })}
                </div>
              </div>
            ) : (
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
            )}
          </div>
        </div>

      <div className="p-5 pt-0 border-t border-white/5 mt-4 flex items-center justify-between">
        <span className="text-base font-bold text-soloz-amber">{trip.price}</span>
        <div className="flex gap-2">
          <button
            onClick={() => handleOpenWaivers(trip)}
            title="Manage Confirmations & Waivers"
            className="grid size-8 place-items-center rounded bg-orange-500/10 border border-orange-500/25 text-[#ea580c] hover:bg-orange-500/20"
          >
            <ClipboardCheck size={13} />
          </button>
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

        {view === "list" && (
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
        )}
        {view !== "list" && (
          <Button onClick={() => setView("list")} variant="secondary" className="pt-0.5">
            Back to Trips
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

      {view === "list" && (
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
      )}

      {view === "form" && (
        /* EDIT / CREATE FORM */
        <form onSubmit={handleSave} className="rounded-xl border border-white/10 bg-[#14110d] p-6 sm:p-8 space-y-6 max-w-4xl">
          <h3 className="font-display text-xl font-bold text-white border-b border-white/5 pb-3">
            {editId ? "Edit Trip Details" : "Create New Group Tour"}
          </h3>

          {/* AI Import Collapsible Panel */}
          <div className="rounded-xl border border-[#ff7a1a]/20 bg-[#ff7a1a]/5 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="text-[#ff7a1a] animate-pulse" size={18} />
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#ff7a1a]">
                  ✨ AI Itinerary & Details Extractor
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowAiImport(!showAiImport)}
                className="text-xs font-semibold text-white/80 hover:text-white bg-white/10 hover:bg-white/15 px-3 py-1 rounded-md transition-all"
              >
                {showAiImport ? "Hide Extractor" : "Open Extractor"}
              </button>
            </div>

            {showAiImport && (
              <div className="space-y-4 pt-2 border-t border-[#ff7a1a]/10">
                <p className="text-[11px] text-soloz-ash/80 leading-relaxed">
                  Have an image (poster/flyer) or a text version of your itinerary? Upload or paste it below, and Gemini AI will automatically extract the destination, region, duration, price, Day-by-Day itinerary, and inclusions for you!
                </p>

                <div className="grid gap-6 sm:grid-cols-2">
                  {/* Option A: Image Upload */}
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-wider text-soloz-ash/60 block font-semibold">
                      Option A: Upload Itinerary Image
                    </label>
                    <div className="bg-[#14110d] rounded-lg p-2 border border-white/5">
                      <CloudinaryUpload
                        value={aiImageUrl}
                        onChange={(url) => setAiImageUrl(url)}
                        label="Itinerary Image / Flyer / Poster"
                      />
                    </div>
                  </div>

                  {/* Option B: Text Paste */}
                  <div className="space-y-2 flex flex-col justify-between">
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-soloz-ash/60 block font-semibold mb-1">
                        Option B: Paste Raw Text Itinerary
                      </label>
                      <textarea
                        rows={6}
                        placeholder="Paste details, message, or notes from WhatsApp/PDF/Word here..."
                        value={aiText}
                        onChange={(e) => setAiText(e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-white focus:border-soloz-ember/50 focus:outline-none resize-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="button"
                    disabled={aiExtracting || (!aiText && !aiImageUrl)}
                    onClick={handleAiExtract}
                    className="pt-0.5"
                  >
                    {aiExtracting ? (
                      <>
                        <Loader2 className="animate-spin mr-2" size={14} /> Extracting with Gemini...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2" size={14} /> Extract Details & Auto-Fill Form
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

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

          {/* Main Trip Schedule: Start Date, End Date, Duration, Price, Seats */}
          <div className="grid gap-6 sm:grid-cols-5">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-soloz-ash/60 block mb-1">Start Date *</label>
              <input
                type="date"
                required
                value={formData.startDate || formData.date || ""}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-soloz-ember/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-soloz-ash/60 block mb-1">End Date *</label>
              <input
                type="date"
                required
                value={formData.endDate || formData.startDate || formData.date || ""}
                onChange={(e) => handleEndDateChange(e.target.value)}
                className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-soloz-ember/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-soloz-ash/60 block mb-1">Duration</label>
              <input
                type="text"
                required
                placeholder="2 Days / 1 Night"
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
                placeholder="₹5,599"
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

          {/* Upcoming Batches & Weekend Schedule Generator */}
          <div className="rounded-xl border border-soloz-ember/30 bg-soloz-ember/5 p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-soloz-ember/20 pb-3">
              <div>
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <span>📅</span> Upcoming Batches & Weekend Schedule Generator
                </h4>
                <p className="text-xs text-soloz-ash/70 mt-0.5">
                  Configure multiple batches for different weekends of the month.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="month"
                  value={selectedBatchMonth}
                  onChange={(e) => setSelectedBatchMonth(e.target.value)}
                  className="h-8 rounded-lg border border-white/10 bg-[#14110d] px-2 text-xs text-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => generateWeekendBatches(selectedBatchMonth)}
                  className="h-8 px-3 rounded-lg bg-soloz-ember text-white text-xs font-medium hover:bg-soloz-ember/90 transition-colors flex items-center gap-1"
                >
                  <span>⚡</span> Auto-Generate Weekend Batches
                </button>
                <button
                  type="button"
                  onClick={addSingleBatch}
                  className="h-8 px-3 rounded-lg bg-white/10 text-white text-xs font-medium hover:bg-white/20 transition-colors"
                >
                  + Add Single Batch
                </button>
              </div>
            </div>

            {(!formData.batches || formData.batches.length === 0) ? (
              <div className="text-center py-4 text-xs text-soloz-ash/50 italic border border-dashed border-white/10 rounded-lg">
                No extra batches configured. Click "Auto-Generate Weekend Batches" above to populate all weekend dates for the month automatically.
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-[11px] font-semibold text-soloz-ash/60 px-1 uppercase tracking-wider">
                  <span>Configured Batches ({(formData.batches || []).length})</span>
                  <span>Trip Duration: {formData.duration || "N/A"}</span>
                </div>
                <div className="grid gap-2.5 max-h-60 overflow-y-auto pr-1">
                  {(formData.batches || []).map((batch, bIdx) => (
                    <div key={bIdx} className="flex flex-wrap sm:flex-nowrap items-center gap-2 rounded-lg border border-white/10 bg-[#14110d] p-2.5">
                      <div className="w-full sm:w-28 text-xs font-medium text-soloz-ember truncate">
                        {batch.label || `Batch ${bIdx + 1}`}
                      </div>
                      <div className="flex-1 min-w-[120px]">
                        <span className="text-[9px] uppercase text-soloz-ash/50 block mb-0.5">Start Date</span>
                        <input
                          type="date"
                          value={batch.startDate || ""}
                          onChange={(e) => updateBatch(bIdx, "startDate", e.target.value)}
                          className="h-7 w-full rounded border border-white/10 bg-white/5 px-2 text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div className="flex-1 min-w-[120px]">
                        <span className="text-[9px] uppercase text-soloz-ash/50 block mb-0.5">End Date</span>
                        <input
                          type="date"
                          value={batch.endDate || ""}
                          onChange={(e) => updateBatch(bIdx, "endDate", e.target.value)}
                          className="h-7 w-full rounded border border-white/10 bg-white/5 px-2 text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div className="w-20">
                        <span className="text-[9px] uppercase text-soloz-ash/50 block mb-0.5">Seats</span>
                        <input
                          type="number"
                          value={batch.seats || formData.seats || 10}
                          onChange={(e) => updateBatch(bIdx, "seats", parseInt(e.target.value) || 0)}
                          className="h-7 w-full rounded border border-white/10 bg-white/5 px-2 text-xs text-white focus:outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeBatch(bIdx)}
                        className="h-7 w-7 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 flex items-center justify-center text-xs mt-3.5 transition-colors"
                        title="Remove Batch"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider text-soloz-ash/60 block mb-1">Pickup Location *</label>
            <input
              type="text"
              required
              placeholder="e.g. Rajahmundry RJY Station"
              value={formData.pickupLocation || ""}
              onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
              className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-soloz-ember/50 focus:outline-none mb-4"
            />
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

          {/* Trip Confirmation Link Section */}
          <div className="space-y-4 pt-4 border-t border-white/5 bg-white/5 p-4 rounded-xl border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-soloz-amber">Trip Confirmation & Waiver Link</h4>
                <p className="text-xs text-soloz-ash/60 mt-1">
                  Generate and share this link with participants after payment to get their digital signatures and medical disclosures.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/80">Waiver Link:</span>
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, confirmationLinkEnabled: !prev.confirmationLinkEnabled }));
                  }}
                  className={`px-3 py-1 rounded text-xs font-semibold uppercase tracking-wider transition-all ${
                    formData.confirmationLinkEnabled 
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                      : "bg-red-500/20 text-red-400 border border-red-500/30"
                  }`}
                >
                  {formData.confirmationLinkEnabled ? "Active" : "Disabled"}
                </button>
              </div>
            </div>

            {formData.confirmationCode ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${typeof window !== "undefined" ? window.location.origin : ""}/trip-confirmation/${formData.confirmationCode}`}
                    className="h-10 flex-grow rounded-lg border border-white/10 bg-black/40 px-3 text-xs text-soloz-ash/80 select-all focus:outline-none"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      const link = `${window.location.origin}/trip-confirmation/${formData.confirmationCode}`;
                      navigator.clipboard.writeText(link);
                      alert("Confirmation Link Copied!");
                    }}
                    className="h-10 px-4 text-xs"
                  >
                    <Copy size={12} className="mr-1.5" /> Copy Link
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      const newCode = Math.random().toString(36).substring(2, 9).toUpperCase();
                      setFormData(prev => ({ ...prev, confirmationCode: newCode }));
                    }}
                    className="h-10 px-4 text-xs text-red-400 hover:text-red-300 border border-red-500/10"
                  >
                    <RefreshCw size={12} className="mr-1.5 animate-spin-hover" /> Regenerate
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex justify-start">
                <Button
                  type="button"
                  onClick={() => {
                    const newCode = Math.random().toString(36).substring(2, 9).toUpperCase();
                    setFormData(prev => ({ ...prev, confirmationCode: newCode, confirmationLinkEnabled: true }));
                  }}
                  className="text-xs"
                >
                  <Plus size={12} className="mr-1.5" /> Generate Waiver & Confirmation Link
                </Button>
              </div>
            )}
          </div>

          {/* Trip Feedback Link Section */}
          <div className="space-y-4 pt-4 border-t border-white/5 bg-white/5 p-4 rounded-xl border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-soloz-amber">Trip Feedback Link</h4>
                <p className="text-xs text-soloz-ash/60 mt-1">
                  Generate and share this link with participants after the trip to collect feedback, captain ratings, and testimonials.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/80">Feedback Link:</span>
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, feedbackLinkEnabled: !prev.feedbackLinkEnabled }));
                  }}
                  className={`px-3 py-1 rounded text-xs font-semibold uppercase tracking-wider transition-all ${
                    formData.feedbackLinkEnabled 
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                      : "bg-red-500/20 text-red-400 border border-red-500/30"
                  }`}
                >
                  {formData.feedbackLinkEnabled ? "Active" : "Disabled"}
                </button>
              </div>
            </div>

            {formData.feedbackCode ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${typeof window !== "undefined" ? window.location.origin : ""}/trip-feedback/${formData.feedbackCode}`}
                    className="h-10 flex-grow rounded-lg border border-white/10 bg-black/40 px-3 text-xs text-soloz-ash/80 select-all focus:outline-none"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      const link = `${window.location.origin}/trip-feedback/${formData.feedbackCode}`;
                      navigator.clipboard.writeText(link);
                      alert("Feedback Link Copied!");
                    }}
                    className="h-10 px-4 text-xs"
                  >
                    <Copy size={12} className="mr-1.5" /> Copy Link
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      const newCode = Math.random().toString(36).substring(2, 9).toUpperCase();
                      setFormData(prev => ({ ...prev, feedbackCode: newCode }));
                    }}
                    className="h-10 px-4 text-xs text-red-400 hover:text-red-300 border border-red-500/10"
                  >
                    <RefreshCw size={12} className="mr-1.5 animate-spin-hover" /> Regenerate
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex justify-start">
                <Button
                  type="button"
                  onClick={() => {
                    const newCode = Math.random().toString(36).substring(2, 9).toUpperCase();
                    setFormData(prev => ({ ...prev, feedbackCode: newCode, feedbackLinkEnabled: true }));
                  }}
                  className="text-xs"
                >
                  <Plus size={12} className="mr-1.5" /> Generate Feedback Link
                </Button>
              </div>
            )}
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
                    rows={4}
                    placeholder="Describe what activities and trails are scheduled for this day..."
                    value={day.description}
                    onChange={(e) => updateItineraryDay(index, "description", e.target.value)}
                    className="w-full rounded border border-white/10 bg-white/5 p-3 text-xs text-white focus:border-soloz-ember/50 focus:outline-none resize-y"
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

      {view === "confirmations" && selectedTripForWaivers && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Header Card */}
          <div className="rounded-xl border border-white/10 bg-[#14110d] p-6 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="bg-orange-500/10 text-[#ea580c] px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-orange-500/20">
                  Liability Waivers & Confirmations
                </span>
                <h2 className="font-display text-2xl font-bold text-white mt-2">
                  {selectedTripForWaivers.destination}
                </h2>
                <div className="flex flex-wrap gap-4 text-xs text-soloz-ash/60 mt-1">
                  <span>Date: {new Date(selectedTripForWaivers.date).toLocaleDateString()}</span>
                  <span>|</span>
                  <span>Pickup: {selectedTripForWaivers.pickupLocation || "N/A"}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button 
                  onClick={() => {
                    const rowsHTML = waiverSubmissions.map(w => `
                      <tr>
                        <td>${w.submissionId}</td>
                        <td>${w.fullName} (Age: ${w.age}, ${w.gender})</td>
                        <td>${w.mobile}<br/>${w.email || ""}</td>
                        <td>${w.idType}: ${w.idNumber}</td>
                        <td>${w.emergencyContactName} (${w.emergencyContactRelationship})<br/>${w.emergencyContactMobile}</td>
                        <td>${w.medicalConditions || "None"}</td>
                        <td>${w.signedName}</td>
                      </tr>
                    `).join("");

                    const printWindow = window.open("", "_blank");
                    if (!printWindow) return;
                    printWindow.document.write(`
                      <html>
                        <head>
                          <title>Participant Waiver List - ${selectedTripForWaivers.destination}</title>
                          <style>
                            body { font-family: sans-serif; padding: 20px; }
                            h1 { font-size: 20px; margin-bottom: 5px; }
                            h2 { font-size: 14px; color: #555; margin-top: 0; }
                            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 11px; }
                            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
                            th { background-color: #f4f4f4; }
                          </style>
                        </head>
                        <body onload="window.print(); window.close();">
                          <h1>WeAreSoloZ - Waiver Confirmations List</h1>
                          <h2>Trip: ${selectedTripForWaivers.destination} | Date: ${new Date(selectedTripForWaivers.date).toLocaleDateString()} | Pickup: ${selectedTripForWaivers.pickupLocation || "N/A"}</h2>
                          <p>Total Submissions: ${waiverSubmissions.length}</p>
                          <table>
                            <thead>
                              <tr>
                                <th>Sub ID</th>
                                <th>Participant</th>
                                <th>Contact</th>
                                <th>Identity</th>
                                <th>Emergency Contact</th>
                                <th>Medical Notes</th>
                                <th>Signature</th>
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
                  }}
                  variant="secondary" 
                  className="h-9 text-xs border-white/10 text-white hover:bg-white/5"
                >
                  <Printer size={14} className="mr-1.5 text-blue-400" /> Print Waiver List
                </Button>
                <Button 
                  onClick={() => {
                    const headers = [
                      "Submission ID",
                      "Full Name",
                      "Age",
                      "Gender",
                      "Mobile",
                      "Email",
                      "Address",
                      "Blood Group",
                      "Medical Conditions",
                      "Allergies",
                      "Medications",
                      "Emergency Notes",
                      "Emergency Contact Name",
                      "Emergency Contact Mobile",
                      "Emergency Contact Relationship",
                      "ID Type",
                      "ID Number",
                      "ID Upload URL",
                      "Digital Signature",
                      "Signed Date"
                    ];

                    const rows = waiverSubmissions.map(w => [
                      w.submissionId,
                      w.fullName,
                      w.age,
                      w.gender,
                      w.mobile,
                      w.email || "N/A",
                      w.address || "N/A",
                      w.bloodGroup || "N/A",
                      w.medicalConditions || "None",
                      w.allergies || "None",
                      w.medications || "None",
                      w.emergencyNotes || "None",
                      w.emergencyContactName,
                      w.emergencyContactMobile,
                      w.emergencyContactRelationship,
                      w.idType,
                      w.idNumber,
                      w.idUpload || "N/A",
                      w.signedName,
                      new Date(w.signedDate).toLocaleDateString()
                    ]);

                    const csvContent = "data:text/csv;charset=utf-8," 
                      + [headers.join(","), ...rows.map(e => e.map(val => `"${val.toString().replace(/"/g, '""')}"`).join(","))].join("\n");
                      
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement("a");
                    link.setAttribute("href", encodedUri);
                    link.setAttribute("download", `Waivers_${selectedTripForWaivers.destination.replace(/\s+/g, "_")}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  variant="secondary" 
                  className="h-9 text-xs border-white/10 text-white hover:bg-white/5"
                >
                  <Download size={14} className="mr-1.5 text-emerald-400" /> Export CSV
                </Button>
                <Button
                  onClick={() => fetchWaivers(selectedTripForWaivers._id!)}
                  variant="secondary"
                  className="h-9 text-xs border-white/10 text-white hover:bg-white/5"
                >
                  <RefreshCw size={14} className="mr-1.5" /> Refresh
                </Button>
              </div>
            </div>
          </div>

          {/* Metrics summary cards */}
          {(() => {
            const registeredParticipants = selectedTripForWaivers.participants || [];
            const submissionMobiles = new Set(waiverSubmissions.map(w => w.mobile?.trim().replace(/\s+/g, "")));
            const submissionNames = new Set(waiverSubmissions.map(w => w.fullName?.trim().toLowerCase()));

            const confirmedCount = waiverSubmissions.length;
            const pendingParticipants = registeredParticipants.filter(p => {
              const normalizedPhone = p.phone?.trim().replace(/\s+/g, "");
              const normalizedName = p.name?.trim().toLowerCase();
              return !submissionMobiles.has(normalizedPhone) && !submissionNames.has(normalizedName);
            });
            const pendingCount = pendingParticipants.length;

            return (
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-white/10 bg-[#14110d] p-5 space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-soloz-ash/60 font-bold">Forms Submitted</span>
                  <div className="text-3xl font-bold text-soloz-amber">{waiverSubmissions.length}</div>
                  <p className="text-[10px] text-soloz-ash/40">Real-time waivers submitted by paid travelers</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-[#14110d] p-5 space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-soloz-ash/60 font-bold">Confirmed Travelers</span>
                  <div className="text-3xl font-bold text-emerald-400">{confirmedCount}</div>
                  <p className="text-[10px] text-soloz-ash/40">Participants who completed verification</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-[#14110d] p-5 space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-soloz-ash/60 font-bold">Pending Waivers</span>
                  <div className="text-3xl font-bold text-orange-400">{pendingCount}</div>
                  <p className="text-[10px] text-soloz-ash/40">Travelers in settings who haven't completed forms</p>
                </div>
              </div>
            );
          })()}

          {/* Submissions Table with search */}
          <div className="rounded-xl border border-white/10 bg-[#14110d] p-6 space-y-4">
            <div className="flex items-center gap-2 max-w-sm">
              <Search className="text-soloz-ash/40" size={16} />
              <input
                type="text"
                placeholder="Search participant name, phone, or email..."
                value={waiversSearch}
                onChange={(e) => setWaiversSearch(e.target.value)}
                className="h-9 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-white focus:border-soloz-ember/50 focus:outline-none"
              />
            </div>

            {loadingWaivers ? (
              <div className="flex flex-col items-center justify-center py-10 text-soloz-ash/60">
                <Loader2 className="animate-spin text-soloz-ember mb-2" size={24} />
                <p className="text-[10px]">Retrieving waivers list...</p>
              </div>
            ) : waiverSubmissions.length === 0 ? (
              <div className="text-center py-10 text-xs text-soloz-ash/40 italic">
                No waivers submitted for this trip yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-white border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-[10px] uppercase tracking-wider text-soloz-ash/60">
                      <th className="py-3 px-4 font-bold">Sub ID</th>
                      <th className="py-3 px-4 font-bold">Full Name</th>
                      <th className="py-3 px-4 font-bold">Contact</th>
                      <th className="py-3 px-4 font-bold">Identity Doc</th>
                      <th className="py-3 px-4 font-bold">Emergency Contact</th>
                      <th className="py-3 px-4 font-bold">Date Submitted</th>
                      <th className="py-3 px-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {waiverSubmissions
                      .filter(w => {
                        const term = waiversSearch.toLowerCase();
                        return (
                          w.fullName?.toLowerCase().includes(term) ||
                          w.mobile?.includes(term) ||
                          w.email?.toLowerCase().includes(term) ||
                          w.submissionId?.toLowerCase().includes(term)
                        );
                      })
                      .map((w) => (
                        <tr key={w._id} className="border-b border-white/5 hover:bg-white/[0.02]">
                          <td className="py-3 px-4 font-mono font-bold text-soloz-amber">{w.submissionId}</td>
                          <td className="py-3 px-4">
                            <div className="font-bold">{w.fullName}</div>
                            <div className="text-[10px] text-soloz-ash/50">Age: {w.age} | {w.gender}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div>{w.mobile}</div>
                            <div className="text-[10px] text-soloz-ash/50">{w.email || "No Email"}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div>{w.idType}</div>
                            <div className="text-[10px] text-soloz-ash/50">{w.idNumber || "N/A"}</div>
                            {w.idUpload && (
                              <a
                                href={w.idUpload}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] text-soloz-ember font-bold hover:underline inline-flex items-center gap-1 mt-0.5"
                              >
                                View Upload <ExternalLink size={10} />
                              </a>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold">{w.emergencyContactName} ({w.emergencyContactRelationship})</div>
                            <div className="text-[10px] text-soloz-ash/50">{w.emergencyContactMobile}</div>
                          </td>
                          <td className="py-3 px-4 text-soloz-ash/60">
                            {new Date(w.createdAt || w.signedDate).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => setSelectedWaiverDetail(w)}
                              className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-white hover:bg-white/10 text-[10px] font-semibold"
                            >
                              View Details
                            </button>
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

      {/* Details View Modal */}
      {selectedWaiverDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-xl border border-white/10 bg-[#14110d] p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedWaiverDetail(null)}
              className="absolute right-4 top-4 text-soloz-ash/60 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>

            <div className="space-y-1 border-b border-white/5 pb-3">
              <span className="text-[9px] uppercase tracking-wider text-soloz-amber font-mono font-bold">
                Submission ID: {selectedWaiverDetail.submissionId}
              </span>
              <h3 className="font-display text-lg font-bold text-white">
                Liability Waiver Disclosure
              </h3>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 text-xs">
              
              {/* Personal */}
              <div className="space-y-2 bg-white/[0.02] p-4 rounded-lg border border-white/5">
                <h4 className="font-bold text-soloz-amber uppercase tracking-wider text-[10px]">Personal Details</h4>
                <div className="space-y-1 text-soloz-ash/80">
                  <p><span className="text-white/60">Full Name:</span> {selectedWaiverDetail.fullName}</p>
                  <p><span className="text-white/60">Age / Gender:</span> {selectedWaiverDetail.age} / {selectedWaiverDetail.gender}</p>
                  <p><span className="text-white/60">Mobile:</span> {selectedWaiverDetail.mobile}</p>
                  <p><span className="text-white/60">Email:</span> {selectedWaiverDetail.email || "N/A"}</p>
                  <p><span className="text-white/60">Address:</span> {selectedWaiverDetail.address || "N/A"}</p>
                </div>
              </div>

              {/* Emergency */}
              <div className="space-y-2 bg-white/[0.02] p-4 rounded-lg border border-white/5">
                <h4 className="font-bold text-soloz-amber uppercase tracking-wider text-[10px]">Emergency Contact</h4>
                <div className="space-y-1 text-soloz-ash/80">
                  <p><span className="text-white/60">Contact Name:</span> {selectedWaiverDetail.emergencyContactName}</p>
                  <p><span className="text-white/60">Relationship:</span> {selectedWaiverDetail.emergencyContactRelationship}</p>
                  <p><span className="text-white/60">Mobile:</span> {selectedWaiverDetail.emergencyContactMobile}</p>
                </div>
              </div>

              {/* Identity */}
              <div className="space-y-2 bg-white/[0.02] p-4 rounded-lg border border-white/5">
                <h4 className="font-bold text-soloz-amber uppercase tracking-wider text-[10px]">Identity Proof</h4>
                <div className="space-y-1 text-soloz-ash/80">
                  <p><span className="text-white/60">ID Type:</span> {selectedWaiverDetail.idType}</p>
                  <p><span className="text-white/60">ID Number:</span> {selectedWaiverDetail.idNumber || "N/A"}</p>
                  {selectedWaiverDetail.idUpload && (
                    <div className="mt-2">
                      <a
                        href={selectedWaiverDetail.idUpload}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 bg-white/5 border border-white/10 hover:bg-white/10 px-3 py-1 rounded text-white font-semibold text-[10px]"
                      >
                        Open ID Proof Attachment <ExternalLink size={10} />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Medical */}
              <div className="space-y-2 bg-white/[0.02] p-4 rounded-lg border border-white/5">
                <h4 className="font-bold text-soloz-amber uppercase tracking-wider text-[10px]">Medical Profile</h4>
                <div className="space-y-1 text-soloz-ash/80">
                  <p><span className="text-white/60">Blood Group:</span> {selectedWaiverDetail.bloodGroup || "N/A"}</p>
                  <p><span className="text-white/60">Chronic Conditions:</span> {selectedWaiverDetail.medicalConditions || "None declared"}</p>
                  <p><span className="text-white/60">Allergies:</span> {selectedWaiverDetail.allergies || "None declared"}</p>
                  <p><span className="text-white/60">Medications:</span> {selectedWaiverDetail.medications || "None declared"}</p>
                  <p><span className="text-white/60">Emergency Notes:</span> {selectedWaiverDetail.emergencyNotes || "None declared"}</p>
                </div>
              </div>

            </div>

            {/* Signature Block */}
            <div className="border-t border-white/5 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs text-soloz-ash/70">
              <div>
                <span className="text-[10px] text-soloz-ash/40 uppercase block mb-1">Participant Digital Signature</span>
                <span className="font-serif italic text-sm text-white">{selectedWaiverDetail.signedName}</span>
              </div>
              <div>
                <span className="text-[10px] text-soloz-ash/40 uppercase block mb-1">Date Signed</span>
                <span className="text-white font-bold">{new Date(selectedWaiverDetail.signedDate || selectedWaiverDetail.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={() => setSelectedWaiverDetail(null)} className="text-xs">
                Close Details
              </Button>
            </div>

          </div>
        </div>
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
