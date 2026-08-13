"use client";

import { getAuthHeaders } from "@/lib/api";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

import { useEffect, useState } from "react";
import { 
  Compass, 
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
  ClipboardCheck, 
  CheckCircle,
  HelpCircle,
  FileSpreadsheet,
  Mail,
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  Ban
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Participant {
  name: string;
  phone: string;
}

interface BatchData {
  startDate?: string;
  endDate?: string;
  label?: string;
  seats?: number;
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
  participants?: Participant[];
  recap?: string;
  confirmationCode?: string;
  confirmationLinkEnabled?: boolean;
  pickupLocation?: string;
  batches?: BatchData[];
}

interface ExpandedWaiverItem {
  id: string;
  trip: TripData;
  batch?: BatchData;
  batchLabel?: string;
  date: string;
  isCompleted: boolean;
  isLinkEnabled: boolean;
}

export default function AdminWaiversPage() {
  const [trips, setTrips] = useState<TripData[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [tripsSearch, setTripsSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"active" | "completed" | "all">("active");

  const [selectedTrip, setSelectedTrip] = useState<TripData | null>(null);
  const [selectedItem, setSelectedItem] = useState<ExpandedWaiverItem | null>(null);
  const [waiverSubmissions, setWaiverSubmissions] = useState<any[]>([]);
  const [loadingWaivers, setLoadingWaivers] = useState(false);
  const [waiversSearch, setWaiversSearch] = useState("");
  const [selectedWaiverDetail, setSelectedWaiverDetail] = useState<any | null>(null);

  // Fetch all trips on mount
  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    setLoadingTrips(true);
    try {
      const res = await fetch(`${API_URL}/admin/trips`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error("Failed to load trips");
      const data = await res.json();
      setTrips(data.filter((t: TripData) => t.status === "published" || t.confirmationCode));
    } catch (err) {
      console.error(err);
      alert("Error loading trips. Please make sure you are signed in.");
    } finally {
      setLoadingTrips(false);
    }
  };

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

  const handleOpenWaivers = (item: ExpandedWaiverItem) => {
    setSelectedTrip(item.trip);
    setSelectedItem(item);
    if (item.trip._id) {
      fetchWaivers(item.trip._id);
    }
  };

  const handleToggleWaiverLink = async (trip: TripData, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newStatus = trip.confirmationLinkEnabled === false ? true : false;
    try {
      const res = await fetch(`${API_URL}/admin/trips/${trip._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ ...trip, confirmationLinkEnabled: newStatus })
      });
      if (!res.ok) throw new Error("Failed to toggle link status");
      
      setTrips(prev => prev.map(t => t._id === trip._id ? { ...t, confirmationLinkEnabled: newStatus } : t));
      if (selectedTrip && selectedTrip._id === trip._id) {
        setSelectedTrip(prev => prev ? { ...prev, confirmationLinkEnabled: newStatus } : null);
      }
    } catch (err: any) {
      alert(err.message || "Failed to update link status");
    }
  };

  const handleCopyLink = (trip: TripData, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const link = `${window.location.origin}/trip-confirmation/${trip.slug}`;
    navigator.clipboard.writeText(link);
    alert("Waiver & Confirmation link copied to clipboard!");
  };

  const handleToggleCertificate = async (submissionId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`${API_URL}/admin/waivers/${submissionId}/certificate`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ isCertificateIssued: !currentStatus })
      });
      if (!res.ok) throw new Error("Failed to update certificate status");
      const updated = await res.json();
      
      setWaiverSubmissions(prev => prev.map(w => w._id === submissionId ? updated : w));
      if (selectedWaiverDetail && selectedWaiverDetail._id === submissionId) {
        setSelectedWaiverDetail(updated);
      }
    } catch (err: any) {
      alert(err.message || "Failed to update certificate");
    }
  };

  const handleSendCertificateEmail = async (submissionId: string) => {
    try {
      const res = await fetch(`${API_URL}/admin/waivers/${submissionId}/send-certificate`, {
        method: "POST",
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error("Failed to send certificate email");
      const updated = await res.json();
      
      setWaiverSubmissions(prev => prev.map(w => w._id === submissionId ? updated : w));
      if (selectedWaiverDetail && selectedWaiverDetail._id === submissionId) {
        setSelectedWaiverDetail(updated);
      }
      alert("Certificate email sent successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to send certificate email");
    }
  };

  const exportCSV = () => {
    if (!selectedTrip || waiverSubmissions.length === 0) return;

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
    link.setAttribute("download", `Waivers_${selectedTrip.destination.replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    if (!selectedTrip) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

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

    printWindow.document.write(`
      <html>
        <head>
          <title>Participant Waiver List - ${selectedTrip.destination}</title>
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
          <h2>Trip: ${selectedTrip.destination} | Date: ${new Date(selectedTrip.date).toLocaleDateString()} | Pickup: ${selectedTrip.pickupLocation || "N/A"}</h2>
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
  };

  // Expand trips into batch items
  const expandedItems: ExpandedWaiverItem[] = [];
  const todayMidnight = new Date().setHours(0, 0, 0, 0);

  trips.forEach((trip) => {
    const batches = (trip.batches || []).filter((b: any) => b && (b.startDate || b.endDate));

    if (batches.length > 0) {
      batches.forEach((b: any, index: number) => {
        const startDateStr = b.startDate || b.endDate || trip.date;
        const endDateStr = b.endDate || b.startDate || trip.date;

        const startDateObj = new Date(startDateStr);
        const endDateObj = new Date(endDateStr);

        const isCompleted = !isNaN(endDateObj.getTime())
          ? endDateObj.getTime() < todayMidnight
          : startDateObj.getTime() < todayMidnight;

        let batchLabelText = "";
        if (b.label) {
          batchLabelText = b.label;
        } else if (b.startDate && b.endDate) {
          const s = new Date(b.startDate);
          const e = new Date(b.endDate);
          if (!isNaN(s.getTime()) && !isNaN(e.getTime())) {
            batchLabelText = `${s.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${e.getDate()}`;
          } else {
            batchLabelText = `${b.startDate} to ${b.endDate}`;
          }
        } else {
          batchLabelText = new Date(startDateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
        }

        expandedItems.push({
          id: `${trip._id}_batch_${index}`,
          trip,
          batch: b,
          batchLabel: batchLabelText,
          date: startDateStr,
          isCompleted,
          isLinkEnabled: trip.confirmationLinkEnabled !== false
        });
      });
    } else {
      const tripDateStr = trip.date;
      const tripDateObj = new Date(tripDateStr);
      const isCompleted = !isNaN(tripDateObj.getTime()) ? tripDateObj.getTime() < todayMidnight : false;

      expandedItems.push({
        id: `${trip._id}_main`,
        trip,
        date: tripDateStr,
        isCompleted,
        isLinkEnabled: trip.confirmationLinkEnabled !== false
      });
    }
  });

  // Filter items based on search query
  const searchFilteredItems = expandedItems.filter(item => {
    const query = tripsSearch.toLowerCase().trim();
    if (!query) return true;
    return (
      item.trip.destination.toLowerCase().includes(query) ||
      (item.batchLabel && item.batchLabel.toLowerCase().includes(query)) ||
      (item.trip.state && item.trip.state.toLowerCase().includes(query))
    );
  });

  // Partition searchFilteredItems into Month groups & Tab filter
  const partitionByMonth = (tab: "active" | "completed" | "all") => {
    const items = searchFilteredItems.filter(item => {
      if (tab === "active") return !item.isCompleted;
      if (tab === "completed") return item.isCompleted;
      return true;
    });

    const groups: Record<string, ExpandedWaiverItem[]> = {};

    items.forEach(item => {
      const itemDate = new Date(item.date);
      const monthLabel = !isNaN(itemDate.getTime())
        ? itemDate.toLocaleString("en-US", { month: "long", year: "numeric" })
        : "Unscheduled";

      if (!groups[monthLabel]) groups[monthLabel] = [];
      groups[monthLabel].push(item);
    });

    return Object.entries(groups).sort(([mA, itemsA], [mB, itemsB]) => {
      const timeA = itemsA[0] ? new Date(itemsA[0].date).getTime() : 0;
      const timeB = itemsB[0] ? new Date(itemsB[0].date).getTime() : 0;
      return tab === "completed" ? timeB - timeA : timeA - timeB;
    });
  };

  const activeCount = expandedItems.filter(i => !i.isCompleted).length;
  const completedCount = expandedItems.filter(i => i.isCompleted).length;

  return (
    <main className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-white flex items-center gap-2">
            <ClipboardCheck className="text-soloz-ember" size={28} />
            Waivers & Confirmations
          </h1>
          <p className="text-xs text-soloz-ash/75 mt-1">
            Manage passenger liability disclosures, emergency contacts, and identity documents batch-by-batch.
          </p>
        </div>

        {selectedTrip && (
          <Button onClick={() => { setSelectedTrip(null); setSelectedItem(null); }} variant="secondary" className="pt-0.5">
            <ChevronLeft size={16} className="mr-1.5" /> Back to Trip Selector
          </Button>
        )}
      </div>

      {/* TRIP SELECTOR GRID */}
      {!selectedTrip && (
        <div className="space-y-8">
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-soloz-ash/40" size={15} />
              <input
                type="text"
                placeholder="Search trip destination, batch date, state..."
                value={tripsSearch}
                onChange={(e) => setTripsSearch(e.target.value)}
                className="h-10 w-full rounded-xl border border-white/10 bg-black/40 pl-10 pr-4 text-xs text-white focus:border-soloz-ember focus:outline-none placeholder:text-stone-500"
              />
            </div>

            {/* Tab Filter Switches */}
            <div className="flex bg-stone-900/80 p-1 rounded-xl border border-white/10 w-full md:w-auto">
              <button
                onClick={() => setActiveTab("active")}
                className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  activeTab === "active"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-stone-400 hover:text-white"
                }`}
              >
                <span>🟢 Active & Upcoming</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === "active" ? "bg-white/20 text-white" : "bg-white/10 text-stone-300"}`}>
                  {activeCount}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("completed")}
                className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  activeTab === "completed"
                    ? "bg-rose-600 text-white shadow-sm"
                    : "text-stone-400 hover:text-white"
                }`}
              >
                <span>🏁 Completed & Past</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === "completed" ? "bg-white/20 text-white" : "bg-white/10 text-stone-300"}`}>
                  {completedCount}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("all")}
                className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  activeTab === "all"
                    ? "bg-stone-800 text-white shadow-sm"
                    : "text-stone-400 hover:text-white"
                }`}
              >
                <span>All Batches</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === "all" ? "bg-white/20 text-white" : "bg-white/10 text-stone-300"}`}>
                  {expandedItems.length}
                </span>
              </button>
            </div>
          </div>

          {loadingTrips ? (
            <div className="flex flex-col items-center justify-center py-20 text-soloz-ash/60">
              <Loader2 className="animate-spin text-soloz-ember mb-3" size={32} />
              <p className="text-xs">Loading passenger waiver lists...</p>
            </div>
          ) : searchFilteredItems.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center text-soloz-ash/60">
              No matching trip waivers found.
            </div>
          ) : (
            <div className="space-y-12">
              {partitionByMonth(activeTab).map(([monthLabel, monthItems]) => (
                <div key={monthLabel} className="space-y-4">
                  {/* Month Header */}
                  <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                    <h2 className="font-display text-xl font-bold text-white tracking-wide uppercase">
                      {monthLabel}
                    </h2>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-soloz-ember/20 text-soloz-ember font-bold">
                      {monthItems.length} {monthItems.length === 1 ? "Batch Waiver" : "Batch Waivers"}
                    </span>
                    <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
                  </div>

                  {/* Month Grid Cards */}
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {monthItems.map((item) => (
                      <div
                        key={item.id}
                        className={`rounded-2xl border bg-[#14110d] p-5 flex flex-col justify-between transition-all space-y-4 ${
                          item.isCompleted
                            ? "border-red-900/30 opacity-80 hover:opacity-100"
                            : "border-white/10 hover:border-white/20"
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-display text-lg font-bold text-white leading-tight">
                              {item.trip.destination}
                            </h3>
                            {item.isCompleted && (
                              <span className="text-[9px] uppercase tracking-widest font-extrabold px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800/50 shrink-0">
                                COMPLETED
                              </span>
                            )}
                          </div>

                          {item.batchLabel && (
                            <div className="text-xs font-bold text-[#ea580c] flex items-center gap-1.5">
                              <span>📅</span> Batch: {item.batchLabel}
                            </div>
                          )}

                          <div className="flex flex-col gap-1 text-xs text-soloz-ash/70 pt-1">
                            <span className="flex items-center gap-1.5">
                              <Calendar size={13} className="text-soloz-ember" />
                              Date: {new Date(item.date).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Users size={13} className="text-soloz-ember" />
                              Expected: {item.trip.participants?.length || 0} Travelers
                            </span>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-3">
                          {item.isCompleted ? (
                            <span className="text-[10px] px-2.5 py-1 rounded font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20 select-none">
                              Expired (Disabled)
                            </span>
                          ) : (
                            <button
                              onClick={(e) => handleToggleWaiverLink(item.trip, e)}
                              title="Click to toggle waiver link status"
                              className={`text-[10px] px-2.5 py-1 rounded font-bold uppercase tracking-wider border transition-all ${
                                item.isLinkEnabled
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                                  : "bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20"
                              }`}
                            >
                              Link: {item.isLinkEnabled ? "Active" : "Disabled"}
                            </button>
                          )}

                          <Button
                            onClick={() => handleOpenWaivers(item)}
                            className="gradient-orange text-white hover:opacity-90 h-8 px-3 text-xs font-bold rounded-lg shadow-sm"
                          >
                            Manage Waivers
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* DETAIL MODAL FOR SELECTED TRIP & BATCH */}
      {selectedTrip && (
        <div className="space-y-6">
          <div className="bg-[#14110d] rounded-2xl border border-white/10 p-6 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#ea580c]">Selected Batch Waiver List</span>
                <h2 className="font-display text-2xl font-bold text-white mt-0.5">
                  {selectedTrip.destination} {selectedItem?.batchLabel ? `(${selectedItem.batchLabel})` : ""}
                </h2>
                <p className="text-xs text-stone-400 mt-1">
                  Scheduled Departure: {new Date(selectedItem?.date || selectedTrip.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  onClick={(e) => handleCopyLink(selectedTrip, e)}
                  variant="secondary"
                  className="border-white/10 text-white hover:bg-white/5 h-9 px-3 text-xs rounded-xl"
                >
                  <Copy size={13} className="mr-1.5" /> Copy Waiver Link
                </Button>

                <Button
                  onClick={exportCSV}
                  disabled={waiverSubmissions.length === 0}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white h-9 px-3 text-xs font-bold rounded-xl"
                >
                  <FileSpreadsheet size={13} className="mr-1.5" /> Export CSV
                </Button>

                <Button
                  onClick={handlePrint}
                  disabled={waiverSubmissions.length === 0}
                  variant="secondary"
                  className="h-9 px-3 text-xs font-bold rounded-xl"
                >
                  <Printer size={13} className="mr-1.5" /> Print Waiver List
                </Button>
              </div>
            </div>
          </div>

          {/* Submissions Search & Filter */}
          <div className="flex items-center justify-between gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-soloz-ash/40" size={15} />
              <input
                type="text"
                placeholder="Search participant name, phone, email..."
                value={waiversSearch}
                onChange={(e) => setWaiversSearch(e.target.value)}
                className="h-9 w-full rounded-xl border border-white/10 bg-black/40 pl-10 pr-4 text-xs text-white focus:border-soloz-ember focus:outline-none placeholder:text-stone-500"
              />
            </div>

            <span className="text-xs text-stone-400 font-medium">
              Total Submissions: <strong className="text-white">{waiverSubmissions.length}</strong>
            </span>
          </div>

          {/* Waiver Submissions Table */}
          <div className="bg-[#14110d] rounded-2xl border border-white/10 overflow-hidden">
            {loadingWaivers ? (
              <div className="p-12 text-center text-stone-400 text-xs font-semibold">
                <Loader2 className="w-6 h-6 animate-spin text-[#ea580c] mx-auto mb-2" />
                Loading waiver submissions...
              </div>
            ) : waiverSubmissions.length === 0 ? (
              <div className="p-12 text-center text-stone-400 space-y-2">
                <ClipboardCheck className="w-10 h-10 text-stone-600 mx-auto" />
                <p className="text-sm font-bold text-stone-300">No passenger waivers submitted for this trip batch yet.</p>
                <p className="text-xs text-stone-500">Share the waiver link with travelers before departure.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10 text-[10.5px] uppercase tracking-wider text-stone-400 font-extrabold">
                      <th className="py-3 px-4">Sub ID</th>
                      <th className="py-3 px-4">Participant Name</th>
                      <th className="py-3 px-4">Contact Info</th>
                      <th className="py-3 px-4">Identity Doc</th>
                      <th className="py-3 px-4">Emergency Contact</th>
                      <th className="py-3 px-4">Certificate</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {waiverSubmissions
                      .filter(w => !waiversSearch || w.fullName.toLowerCase().includes(waiversSearch.toLowerCase()) || w.mobile.includes(waiversSearch))
                      .map((w) => (
                        <tr key={w._id} className="hover:bg-white/5 transition-colors">
                          <td className="py-3.5 px-4 font-mono text-stone-300">{w.submissionId}</td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-white">{w.fullName}</div>
                            <div className="text-[10px] text-stone-400">
                              Age: {w.age} | {w.gender} {w.bloodGroup ? `| ${w.bloodGroup}` : ""}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="text-stone-300">{w.mobile}</div>
                            <div className="text-[10px] text-stone-500 truncate max-w-[140px]">{w.email || "-"}</div>
                          </td>
                          <td className="py-3.5 px-4 font-mono">
                            <div className="text-stone-300">{w.idType}: {w.idNumber}</div>
                            {w.idUpload && (
                              <a href={w.idUpload} target="_blank" rel="noreferrer" className="text-[10px] text-[#ea580c] hover:underline flex items-center gap-1 mt-0.5">
                                <ExternalLink size={10} /> View Document
                              </a>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="text-stone-300">{w.emergencyContactName} ({w.emergencyContactRelationship})</div>
                            <div className="text-[10px] text-stone-400">{w.emergencyContactMobile}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            {w.isCertificateIssued ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 text-[10px] font-bold">
                                <Award size={11} /> Issued
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-stone-900 text-stone-400 border border-white/10 text-[10px] font-semibold">
                                Pending
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setSelectedWaiverDetail(w)}
                                className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white font-bold text-[11px]"
                              >
                                View Details
                              </button>
                              <button
                                onClick={() => handleToggleCertificate(w._id, w.isCertificateIssued)}
                                className={`px-2 py-1 rounded font-bold text-[11px] border transition-all ${
                                  w.isCertificateIssued
                                    ? "bg-emerald-950 text-emerald-400 border-emerald-800/60"
                                    : "bg-orange-950 text-orange-400 border-orange-800/60 hover:bg-orange-900/60"
                                }`}
                              >
                                {w.isCertificateIssued ? "Revoke Cert" : "Issue Cert"}
                              </button>
                              {w.isCertificateIssued && (
                                <button
                                  onClick={() => handleSendCertificateEmail(w._id)}
                                  title="Send Certificate Email"
                                  className="px-2 py-1 rounded bg-blue-950 text-blue-300 border border-blue-800/60 hover:bg-blue-900/60 font-bold text-[11px]"
                                >
                                  <Mail size={12} />
                                </button>
                              )}
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

      {/* SINGLE WAIVER DETAILS MODAL */}
      {selectedWaiverDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#14110d] w-full max-w-xl rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl border border-white/10 font-sans text-stone-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#ea580c]">Participant Waiver Submission</span>
                <h3 className="font-display text-xl font-bold text-white">{selectedWaiverDetail.fullName}</h3>
              </div>
              <button onClick={() => setSelectedWaiverDetail(null)} className="p-1.5 rounded-full hover:bg-white/10 text-stone-400">
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-stone-500 block">Submission ID</span>
                <span className="font-mono text-white font-bold">{selectedWaiverDetail.submissionId}</span>
              </div>
              <div>
                <span className="text-stone-500 block">Age / Gender / Blood</span>
                <span className="font-semibold text-white">
                  {selectedWaiverDetail.age} yrs | {selectedWaiverDetail.gender} | {selectedWaiverDetail.bloodGroup || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-stone-500 block">Mobile</span>
                <span className="font-semibold text-white">{selectedWaiverDetail.mobile}</span>
              </div>
              <div>
                <span className="text-stone-500 block">Email</span>
                <span className="font-semibold text-white truncate block">{selectedWaiverDetail.email || "N/A"}</span>
              </div>
              <div className="col-span-2">
                <span className="text-stone-500 block">Address</span>
                <span className="font-semibold text-white">{selectedWaiverDetail.address || "N/A"}</span>
              </div>
              <div>
                <span className="text-stone-500 block">ID Document</span>
                <span className="font-semibold text-white">{selectedWaiverDetail.idType}: {selectedWaiverDetail.idNumber}</span>
              </div>
              <div>
                <span className="text-stone-500 block">Signed Digital Name</span>
                <span className="font-semibold text-emerald-400 font-mono">{selectedWaiverDetail.signedName}</span>
              </div>
              <div className="col-span-2 bg-white/5 p-3 rounded-xl border border-white/10 space-y-1">
                <span className="text-soloz-amber font-bold block text-[11px]">Emergency Contact Info</span>
                <span className="text-white font-semibold block">
                  {selectedWaiverDetail.emergencyContactName} ({selectedWaiverDetail.emergencyContactRelationship}) - {selectedWaiverDetail.emergencyContactMobile}
                </span>
              </div>
              <div className="col-span-2 space-y-1">
                <span className="text-stone-500 block">Medical Conditions / Allergies</span>
                <span className="text-white block font-medium">
                  {selectedWaiverDetail.medicalConditions || "None reported"}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <Button
                onClick={() => handleToggleCertificate(selectedWaiverDetail._id, selectedWaiverDetail.isCertificateIssued)}
                className={`text-xs font-bold ${selectedWaiverDetail.isCertificateIssued ? "bg-rose-950 text-rose-300 border border-rose-800" : "bg-emerald-600 hover:bg-emerald-700 text-white"}`}
              >
                {selectedWaiverDetail.isCertificateIssued ? "Revoke Certificate" : "Issue Certificate"}
              </Button>

              <Button onClick={() => setSelectedWaiverDetail(null)} variant="secondary" className="h-9 text-xs">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
