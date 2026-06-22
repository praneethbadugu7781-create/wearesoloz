"use client";
import { getAuthHeaders } from "@/lib/api";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

import { useEffect, useState } from "react";
import { HeartHandshake, Trash2, Loader2, ExternalLink, Search, User, MapPin, Sprout, Calendar, FileSpreadsheet, FileText, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportToCSV, exportToPDF } from "@/lib/export";
import { motion, AnimatePresence } from "framer-motion";

interface FarmerData {
  _id: string;
  fullName: string;
  gender: string;
  bloodGroup: string;
  age: number;
  email: string;
  mobile: string;
  state: string;
  district: string;
  farmingType: string;
  cropType: string;
  landSize: string;
  whyJoin: string;
  status: "Pending" | "Approved" | "Rejected" | "Archived";
  createdAt: string;
  farmingImages?: string[];
  rejectionReason?: string;
}

export default function AdminFarmersPage() {
  const [farmers, setFarmers] = useState<FarmerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [selectedFarmerId, setSelectedFarmerId] = useState<string | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState("");

  const handleExportCSV = () => {
    if (filtered.length === 0) return alert("No data to export.");
    const headersMap = {
      fullName: "Full Name",
      gender: "Gender",
      age: "Age",
      bloodGroup: "Blood Group",
      mobile: "Mobile",
      email: "Email",
      state: "State",
      district: "District",
      farmingType: "Farming Type",
      cropType: "Crops Cultivated",
      landSize: "Land Size (Acres)",
      whyJoin: "Motivation Statement",
      status: "Status",
      createdAt: "Submitted Date"
    };

    const dataToExport = filtered.map(f => ({
      ...f,
      createdAt: new Date(f.createdAt).toLocaleString()
    }));

    exportToCSV(dataToExport, headersMap, `farmers_export_${new Date().toISOString().split("T")[0]}.csv`);
  };

  const handleExportPDF = async () => {
    if (filtered.length === 0) return alert("No data to export.");
    const headers = ["Full Name", "Location", "Farming Info", "Crops", "Mobile", "Land", "Status"];
    const rows = filtered.map(f => [
      f.fullName,
      `${f.district}, ${f.state}`,
      `${f.farmingType} Farming`,
      f.cropType,
      f.mobile,
      `${f.landSize} Acres`,
      f.status
    ]);

    await exportToPDF(
      "WeAreSoloz - Farmers Free Trip Applications",
      headers,
      rows,
      `farmers_report_${new Date().toISOString().split("T")[0]}.pdf`
    );
  };

  useEffect(() => {
    fetchFarmers();
  }, []);

  const fetchFarmers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/farmers`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error("Failed to load farmer applications");
      const data = await res.json();
      setFarmers(data);
    } catch (err) {
      console.error(err);
      alert("Error loading farmer applications. Make sure you are signed in.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: "Pending" | "Approved" | "Rejected" | "Archived") => {
    if (newStatus === "Rejected") {
      setSelectedFarmerId(id);
      setRejectionReasonInput("");
      setRejectionModalOpen(true);
      return;
    }

    await updateStatus(id, newStatus, "");
  };

  const updateStatus = async (id: string, newStatus: "Pending" | "Approved" | "Rejected" | "Archived", reason: string) => {
    try {
      const res = await fetch(`${API_URL}/admin/farmers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ status: newStatus, rejectionReason: reason })
      });
      if (!res.ok) throw new Error("Failed to update application status");

      setFarmers(
        farmers.map((f) => (f._id === id ? { ...f, status: newStatus, rejectionReason: reason } : f))
      );
    } catch (err: any) {
      alert(err.message || "Error updating application status.");
    }
  };

  const submitRejection = async () => {
    if (!selectedFarmerId) return;
    if (!rejectionReasonInput.trim()) {
      alert("Please enter a reason for rejection.");
      return;
    }
    await updateStatus(selectedFarmerId, "Rejected", rejectionReasonInput.trim());
    setRejectionModalOpen(false);
    setSelectedFarmerId(null);
    setRejectionReasonInput("");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this farmer application? This action is permanent.")) return;

    try {
      const res = await fetch(`${API_URL}/admin/farmers/${id}`, { method: "DELETE", headers: getAuthHeaders() });
      if (!res.ok) throw new Error("Failed to delete application");

      setFarmers(farmers.filter((f) => f._id !== id));
    } catch (err: any) {
      alert(err.message || "Error deleting application.");
    }
  };

  const filtered = farmers.filter((f) => {
    const query = search.toLowerCase();
    const matchesSearch =
      f.fullName.toLowerCase().includes(query) ||
      f.mobile.includes(query) ||
      f.state.toLowerCase().includes(query) ||
      f.district.toLowerCase().includes(query) ||
      f.cropType.toLowerCase().includes(query) ||
      f.farmingType.toLowerCase().includes(query);

    const matchesStatus =
      statusFilter === "All" ||
      f.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const selectedFarmer = farmers.find((f) => f._id === selectedFarmerId);

  return (
    <main className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-white flex items-center gap-2">
            <HeartHandshake className="text-soloz-ember" size={28} />
            Farmer Free Trip Console
          </h1>
          <p className="text-xs text-soloz-ash/75 mt-1">Review and manage community initiative free trip applications submitted by farmers.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleExportCSV} variant="secondary" className="pt-0.5 border-white/10 hover:bg-white/5 text-white">
            <FileSpreadsheet size={16} className="mr-2 text-emerald-500" /> Export Excel
          </Button>
          <Button onClick={handleExportPDF} variant="secondary" className="pt-0.5 border-white/10 hover:bg-white/5 text-white">
            <FileText size={16} className="mr-2 text-red-500" /> Export PDF
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-white/10 bg-black/40 p-4 backdrop-blur">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-soloz-ash/60" size={15} />
          <input
            type="text"
            placeholder="Search farmers, locations, crops..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-lg border border-white/10 bg-white/5 pl-9 pr-4 text-xs text-white placeholder-white/30 focus:border-soloz-ember/50 focus:outline-none"
          />
        </div>

        {/* Status filters */}
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          {["All", "Pending", "Approved", "Rejected", "Archived"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-full px-4 py-1.5 transition ${
                statusFilter === s
                  ? "bg-soloz-ember text-white"
                  : "border border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-soloz-ash/60">
          <Loader2 className="animate-spin text-soloz-ember mb-3" size={32} />
          <p className="text-xs">Fetching farmer applications...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 p-12 text-center text-soloz-ash/60">
          No matching farmer applications found.
        </div>
      ) : (
        <div className="grid gap-6">
          {filtered.map((farmer) => {
            const waMessage = encodeURIComponent(
              `Hello ${farmer.fullName},\n\nWe have reviewed your application for the WeAreSoloz Farmer Free Trip Initiative. We would love to discuss this further with you!`
            );
            return (
              <div
                key={farmer._id}
                className="rounded-xl border border-white/10 bg-[#14110d] p-6 space-y-4 hover:border-white/20 transition duration-300 shadow-md"
              >
                {/* Header Info */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div>
                    <span
                      className={`inline-block rounded px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                        farmer.status === "Pending"
                          ? "bg-amber-500/15 border border-amber-500/25 text-amber-400"
                          : farmer.status === "Approved"
                          ? "bg-emerald-500/15 border border-emerald-500/25 text-emerald-400"
                          : farmer.status === "Rejected"
                          ? "bg-rose-500/15 border border-rose-500/25 text-rose-400"
                          : "bg-stone-500/15 border border-stone-500/25 text-stone-400"
                      }`}
                    >
                      {farmer.status}
                    </span>
                    <h3 className="font-bold text-white text-base mt-2 flex items-center gap-2">
                      {farmer.fullName}
                      <span className="text-xs font-normal text-soloz-ash/60">({farmer.age} yrs • {farmer.gender} • Blood: {farmer.bloodGroup})</span>
                    </h3>
                  </div>

                  <div className="text-right text-[10px] text-white/40 flex items-center gap-1">
                    <Calendar size={12} />
                    Received: {new Date(farmer.createdAt).toLocaleString()}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-soloz-ash/80 bg-black/25 p-4 rounded-lg border border-white/5">
                  <div className="space-y-1">
                    <span className="text-white/40 block uppercase tracking-wider text-[9px] flex items-center gap-1">
                      <MapPin size={10} /> Location Details
                    </span>
                    <p className="text-white font-medium text-sm">
                      {farmer.district}, {farmer.state}
                    </p>
                    <p className="text-[10px] text-white/50">Mobile: {farmer.mobile}</p>
                    <p className="text-[10px] text-white/50 select-all">Email: {farmer.email}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-white/40 block uppercase tracking-wider text-[9px] flex items-center gap-1">
                      <Sprout size={10} /> Agriculture Profile
                    </span>
                    <p className="text-white font-medium text-sm">
                      {farmer.farmingType} Farming
                    </p>
                    <p className="text-[10px] text-white/50">Crops: {farmer.cropType}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-white/40 block uppercase tracking-wider text-[9px] flex items-center gap-1">
                      <User size={10} /> Land Holding
                    </span>
                    <p className="text-white font-medium text-sm">
                      {farmer.landSize} Acres
                    </p>
                  </div>
                </div>

                {/* Motivation Statement */}
                <div className="space-y-1.5">
                  <span className="text-white/40 block uppercase tracking-wider text-[9px]">Statement / Why Join:</span>
                  <div className="rounded-lg bg-black/35 p-4 border border-white/5 text-xs text-white/90 leading-relaxed whitespace-pre-wrap">
                    {farmer.whyJoin}
                  </div>
                </div>

                {/* Rejection Reason (if rejected) */}
                {farmer.status === "Rejected" && farmer.rejectionReason && (
                  <div className="space-y-1.5">
                    <span className="text-rose-600 block uppercase tracking-wider text-[9px] font-bold">Rejection Reason:</span>
                    <div className="rounded-lg bg-rose-500/15 border border-rose-500/25 p-4 text-xs font-medium italic leading-relaxed">
                      {farmer.rejectionReason}
                    </div>
                  </div>
                )}

                {/* Farming Images */}
                {farmer.farmingImages && farmer.farmingImages.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-white/40 block uppercase tracking-wider text-[9px]">Farming / Farm Images:</span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {farmer.farmingImages.map((img, idx) => (
                        <a
                          key={idx}
                          href={img}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="relative aspect-video rounded-lg overflow-hidden border border-white/10 hover:border-soloz-ember transition block bg-black/40 group"
                        >
                          <img src={img} alt={`Farming Upload ${idx + 1}`} className="object-cover w-full h-full group-hover:scale-105 transition-transform" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-[10px] text-white">
                            View Fullscreen
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bottom Row Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-white/5">
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="text-white/40 flex items-center mr-2">Change Status:</span>
                    {["Pending", "Approved", "Rejected", "Archived"].map((st) => (
                      <button
                        key={st}
                        onClick={() => handleStatusChange(farmer._id, st as any)}
                        className={`px-3 py-1 rounded transition border ${
                          farmer.status === st
                            ? st === "Pending"
                              ? "bg-amber-500/20 border-amber-500 text-amber-400 font-bold"
                              : st === "Approved"
                              ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold"
                              : st === "Rejected"
                              ? "bg-rose-500/20 border-rose-500 text-rose-400 font-bold"
                              : "bg-stone-500/20 border-stone-500 text-stone-400 font-bold"
                            : "border-white/10 text-white/65 hover:bg-white/5"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-2 w-full sm:w-auto justify-end">
                    <a
                      href={`https://wa.me/${farmer.mobile.replace(/[^\d]/g, "")}?text=${waMessage}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-4 py-2 hover:bg-white/10 transition text-xs font-bold text-white"
                    >
                      Chat WhatsApp <ExternalLink size={13} />
                    </a>

                    <button
                      onClick={() => handleDelete(farmer._id)}
                      className="grid size-9 place-items-center rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                      title="Delete Application"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Rejection Reason Modal */}
      <AnimatePresence>
        {rejectionModalOpen && selectedFarmer && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setRejectionModalOpen(false);
                setSelectedFarmerId(null);
                setRejectionReasonInput("");
              }}
              className="fixed inset-0 bg-stone-900/60 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 shadow-2xl border border-stone-200/80 z-10 text-stone-950"
            >
              {/* Close button */}
              <button
                onClick={() => {
                  setRejectionModalOpen(false);
                  setSelectedFarmerId(null);
                  setRejectionReasonInput("");
                }}
                className="absolute right-4 top-4 rounded-full p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Header Icon & Title */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-50 border border-rose-100 text-rose-600">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900 leading-tight">
                    Reject Application
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Submit a rejection reason for this application
                  </p>
                </div>
              </div>

              {/* Message */}
              <p className="text-xs text-stone-600 mb-4 leading-relaxed text-left">
                Please enter a reason for rejecting the application of{" "}
                <strong className="text-stone-900 font-semibold">
                  {selectedFarmer.fullName}
                </strong>
                . A notification email with this reason will be sent to the farmer.
              </p>

              {/* Input field */}
              <div className="mb-6 text-left">
                <label className="block text-[10px] uppercase tracking-wider font-semibold text-stone-500 mb-1.5">
                  Reason for Rejection
                </label>
                <textarea
                  autoFocus
                  placeholder="e.g. Invalid document upload, incorrect profile details..."
                  value={rejectionReasonInput}
                  onChange={(e) => setRejectionReasonInput(e.target.value)}
                  className="w-full h-28 rounded-lg border border-stone-200 bg-stone-50/50 p-3 text-xs text-stone-900 placeholder-stone-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none transition resize-none"
                />
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-2.5">
                <button
                  onClick={() => {
                    setRejectionModalOpen(false);
                    setSelectedFarmerId(null);
                    setRejectionReasonInput("");
                  }}
                  className="rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 px-4 py-2 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={submitRejection}
                  className="rounded-lg bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 text-xs font-semibold transition shadow-md shadow-rose-600/10 flex items-center gap-1.5"
                >
                  Confirm Reject
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
