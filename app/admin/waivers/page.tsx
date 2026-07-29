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
  Award
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
}

export default function AdminWaiversPage() {
  const [trips, setTrips] = useState<TripData[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [tripsSearch, setTripsSearch] = useState("");

  const [selectedTrip, setSelectedTrip] = useState<TripData | null>(null);
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
      // Only show published trips or trips with a confirmation code
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

  const handleDeleteWaiver = async (submissionId: string) => {
    if (!confirm("Are you sure you want to delete this waiver submission? This action cannot be undone.")) return;
    try {
      const res = await fetch(`${API_URL}/admin/waivers/${submissionId}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error("Failed to delete waiver submission");
      alert("Waiver submission deleted successfully.");
      setWaiverSubmissions(prev => prev.filter(w => w._id !== submissionId));
    } catch (err: any) {
      alert(err.message || "Failed to delete waiver submission.");
    }
  };

  const handleSelectTrip = (trip: TripData) => {
    setSelectedTrip(trip);
    setWaiverSubmissions([]);
    setWaiversSearch("");
    fetchWaivers(trip._id!);
  };

  const handleToggleWaiverLink = async (trip: TripData) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isPast = trip.date ? new Date(trip.date) < today : false;
    if (isPast) {
      alert("This trip has already completed. Past trip waiver links are automatically disabled and expired.");
      return;
    }

    const currentStatus = trip.confirmationLinkEnabled !== false;
    const newStatus = !currentStatus;

    try {
      const res = await fetch(`${API_URL}/admin/trips/${trip._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ confirmationLinkEnabled: newStatus })
      });

      if (!res.ok) throw new Error("Failed to update status");

      setTrips(prev => prev.map(t => t._id === trip._id ? { ...t, confirmationLinkEnabled: newStatus } : t));
    } catch (err: any) {
      alert(err.message || "Failed to toggle waiver link status.");
    }
  };

  const handleResendInvoice = async (w: any) => {
    if (!w.email) {
      alert(`Passenger ${w.fullName} has no email registered on file.\n\nMobile: ${w.mobile}`);
      return;
    }

    if (!confirm(`Resend tax invoice & receipt to ${w.fullName} (${w.email})?`)) return;

    try {
      const res = await fetch(`${API_URL}/admin/waivers/${w._id}/resend-invoice`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() }
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to resend invoice.");

      alert(data.message || `Invoice resent successfully to ${w.email}!`);
    } catch (err: any) {
      alert(err.message || "Failed to resend invoice.");
    }
  };

  const handleIssueCertificate = async (w: any) => {
    try {
      const res = await fetch(`${API_URL}/admin/waivers/${w._id}/issue-certificate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to issue certificate.");

      alert(data.message || `E-Certificate issued successfully for ${w.fullName}!`);
      if (selectedTrip) fetchWaivers(selectedTrip._id!);
    } catch (err: any) {
      alert(err.message || "Failed to issue certificate.");
    }
  };

  const handleIssueAllCertificates = async () => {
    if (!selectedTrip) return;
    if (!confirm(`Issue E-Certificates for ALL travelers on ${selectedTrip.destination}?`)) return;

    try {
      const res = await fetch(`${API_URL}/admin/trips/${selectedTrip._id}/issue-all-certificates`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to issue certificates.");

      alert(data.message || "E-Certificates issued successfully for all travelers!");
      fetchWaivers(selectedTrip._id!);
    } catch (err: any) {
      alert(err.message || "Failed to issue certificates.");
    }
  };


  const handleUpdateWaiverInDetail = async (updatedFields: Partial<TripData>) => {
    if (!selectedTrip) return;
    try {
      const res = await fetch(`${API_URL}/admin/trips/${selectedTrip._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(updatedFields)
      });

      if (!res.ok) throw new Error("Failed to update confirmation link settings.");

      const newTrip = { ...selectedTrip, ...updatedFields };
      setSelectedTrip(newTrip);
      setTrips(prev => prev.map(t => t._id === selectedTrip._id ? newTrip : t));
    } catch (err: any) {
      alert(err.message || "Failed to update confirmation settings.");
    }
  };

  // CSV download helper
  const downloadWaiversCSV = () => {
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

  // Print helper
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

  // Filtered trips
  const filteredTrips = trips.filter(t => 
    t.destination.toLowerCase().includes(tripsSearch.toLowerCase())
  );

  return (
    <main className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-white flex items-center gap-2">
            <ClipboardCheck className="text-soloz-ember" size={28} />
            Waivers & Confirmations
          </h1>
          <p className="text-xs text-soloz-ash/75 mt-1">
            Manage passenger liability disclosures, emergency contacts, and identity documents.
          </p>
        </div>

        {selectedTrip && (
          <Button onClick={() => setSelectedTrip(null)} variant="secondary" className="pt-0.5">
            <ChevronLeft size={16} className="mr-1.5" /> Back to Trip Selector
          </Button>
        )}
      </div>

      {/* TRIP SELECTOR GRID */}
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
              <p className="text-xs">Loading passenger waiver lists...</p>
            </div>
          ) : filteredTrips.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 p-12 text-center text-soloz-ash/60">
              No matching published trips found.
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTrips.map((trip) => (
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
                        Date: {new Date(trip.date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users size={13} className="text-soloz-ember" />
                        Expected: {trip.participants?.length || 0} Travelers
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-4">
                    {(() => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const isPast = trip.date ? new Date(trip.date) < today : false;
                      const isLinkEnabled = trip.confirmationLinkEnabled !== false;

                      if (isPast) {
                        return (
                          <span className="text-[10px] px-2.5 py-1 rounded font-bold uppercase tracking-wider bg-red-500/10 text-red-450 border border-red-500/15 select-none" title="This trip is in the past. Waivers are closed.">
                            Expired (Disabled)
                          </span>
                        );
                      }

                      return (
                        <button
                          onClick={() => handleToggleWaiverLink(trip)}
                          title="Click to toggle waiver link status"
                          className={`text-[10px] px-2.5 py-1 rounded font-bold uppercase tracking-wider border transition-all ${
                            isLinkEnabled
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                              : "bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20"
                          }`}
                        >
                          Link: {isLinkEnabled ? "Active" : "Disabled"}
                        </button>
                      );
                    })()}

                    <button
                      onClick={() => handleSelectTrip(trip)}
                      className="px-3 py-1.5 rounded bg-soloz-ember/10 border border-soloz-ember/25 text-soloz-ember hover:bg-soloz-ember/20 text-xs font-bold transition-all"
                    >
                      Manage Waivers
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* DETAILED WAIVERS LIST VIEW */}
      {selectedTrip && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Header Summary Card */}
          <div className="rounded-xl border border-white/10 bg-[#14110d] p-6 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="bg-orange-500/10 text-[#ea580c] px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-orange-500/20">
                  Passenger Confirmations Ledger
                </span>
                <h2 className="font-display text-2xl font-bold text-white mt-2">
                  {selectedTrip.destination}
                </h2>
                <div className="flex flex-wrap gap-4 text-xs text-soloz-ash/60 mt-1">
                  <span>Departure Date: {new Date(selectedTrip.date).toLocaleDateString()}</span>
                  <span>|</span>
                  <span>Meeting/Pickup Point: {selectedTrip.pickupLocation || "N/A"}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button 
                  onClick={handleIssueAllCertificates}
                  className="h-9 text-xs bg-[#ea580c] hover:bg-[#ea580c]/90 text-white font-bold shadow-md"
                >
                  <Award size={14} className="mr-1.5 text-amber-300" /> Issue All E-Certificates
                </Button>
                <Button 
                  onClick={handlePrint}
                  variant="secondary" 
                  className="h-9 text-xs border-white/10 text-white hover:bg-white/5"
                >
                  <Printer size={14} className="mr-1.5 text-blue-400" /> Print Passenger List
                </Button>
                <Button 
                  onClick={downloadWaiversCSV}
                  variant="secondary" 
                  className="h-9 text-xs border-white/10 text-white hover:bg-white/5"
                >
                  <Download size={14} className="mr-1.5 text-emerald-400" /> Export CSV
                </Button>
                <Button
                  onClick={() => fetchWaivers(selectedTrip._id!)}
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
                <div className="text-[10px] uppercase font-bold text-soloz-ash/60">Shareable Trip Confirmation Link</div>
                {selectedTrip.confirmationCode ? (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="font-mono text-xs text-soloz-amber break-all">
                      {`${typeof window !== "undefined" ? window.location.origin : ""}/trip-confirmation/${selectedTrip.confirmationCode}`}
                    </span>
                    <button
                      onClick={() => {
                        const link = `${window.location.origin}/trip-confirmation/${selectedTrip.confirmationCode}`;
                        navigator.clipboard.writeText(link);
                        alert("Confirmation Link Copied!");
                      }}
                      className="text-[10px] text-soloz-ember font-bold hover:underline flex items-center gap-1 shrink-0"
                    >
                      <Copy size={11} /> Copy URL
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("Are you sure you want to regenerate the link code? The old link will stop working.")) {
                          const newCode = Math.random().toString(36).substring(2, 9).toUpperCase();
                          handleUpdateWaiverInDetail({ confirmationCode: newCode });
                        }
                      }}
                      className="text-[10px] text-red-400 font-bold hover:underline flex items-center gap-1 shrink-0"
                    >
                      <RefreshCw size={11} /> Regenerate
                    </button>
                  </div>
                ) : (
                  <div className="text-xs text-soloz-ash/40 italic">No waiver link has been generated yet for this trip.</div>
                )}
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {selectedTrip.confirmationCode ? (
                  <>
                    <span className="text-xs text-soloz-ash/60">Waiver Access:</span>
                    <button
                      onClick={() => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const isPast = selectedTrip.date ? new Date(selectedTrip.date) < today : false;
                        if (isPast) {
                          alert("This trip is in the past and waivers are closed.");
                          return;
                        }
                        const isEnabled = selectedTrip.confirmationLinkEnabled !== false;
                        handleUpdateWaiverInDetail({ confirmationLinkEnabled: !isEnabled });
                      }}
                      className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider border transition-all ${
                        (selectedTrip.confirmationLinkEnabled !== false)
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                          : "bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20"
                      }`}
                    >
                      {selectedTrip.confirmationLinkEnabled !== false ? "Active" : "Disabled"}
                    </button>
                  </>
                ) : (
                  <Button
                    onClick={() => {
                      const newCode = Math.random().toString(36).substring(2, 9).toUpperCase();
                      handleUpdateWaiverInDetail({ confirmationCode: newCode, confirmationLinkEnabled: true });
                    }}
                    className="h-8 text-[10px] font-bold uppercase px-3"
                  >
                    Generate Waiver Link
                  </Button>
                )}
              </div>
            </div>

          </div>

          {/* Metrics summary cards */}
          {(() => {
            const registeredParticipants = selectedTrip.participants || [];
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
                  <span className="text-[10px] uppercase tracking-wider text-soloz-ash/60 font-bold">Confirmed Passengers</span>
                  <div className="text-3xl font-bold text-emerald-400">{confirmedCount}</div>
                  <p className="text-[10px] text-soloz-ash/40">Participants who completed verification</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-[#14110d] p-5 space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-soloz-ash/60 font-bold">Pending Passengers</span>
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
                placeholder="Search passenger name, phone, or ID number..."
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
                No waivers submitted for this trip yet. Send the trip confirmation link to confirmed buyers.
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
                          w.submissionId?.toLowerCase().includes(term) ||
                          w.idNumber?.toLowerCase().includes(term)
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
                            <div className="flex justify-end items-center gap-2">
                              {w.certificateId ? (
                                <a
                                  href={`/certificate/${w.certificateId}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 text-[10px] font-semibold transition-all inline-flex items-center gap-1"
                                  title="View Issued E-Certificate"
                                >
                                  <Award size={11} /> View Cert
                                </a>
                              ) : (
                                <button
                                  onClick={() => handleIssueCertificate(w)}
                                  className="px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 hover:bg-amber-500/20 text-[10px] font-semibold transition-all inline-flex items-center gap-1"
                                  title="Issue Travel E-Certificate"
                                >
                                  <Award size={11} /> Issue Cert
                                </button>
                              )}
                              <button
                                onClick={() => handleResendInvoice(w)}
                                className="px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 text-[10px] font-semibold transition-all inline-flex items-center gap-1"
                                title="Resend Tax Invoice Email"
                              >
                                <Mail size={11} /> Resend Invoice
                              </button>
                              <button
                                onClick={() => setSelectedWaiverDetail(w)}
                                className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-white hover:bg-white/10 text-[10px] font-semibold transition-all"
                              >
                                View Details
                              </button>
                              <button
                                onClick={() => handleDeleteWaiver(w._id)}
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

            <div className="flex justify-between items-center pt-2">
              <Button
                onClick={() => handleResendInvoice(selectedWaiverDetail)}
                className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5"
              >
                <Mail size={14} /> Resend Tax Invoice
              </Button>
              <Button onClick={() => setSelectedWaiverDetail(null)} className="text-xs" variant="secondary">
                Close Details
              </Button>
            </div>

          </div>
        </div>
      )}
    </main>
  );
}
