"use client";

import { getAuthHeaders } from "@/lib/api";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

import { useEffect, useState } from "react";
import { Briefcase, Trash2, CheckCircle, Clock, Loader2, Check, ExternalLink, Search, Archive, UserCheck, FileSpreadsheet, FileText, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportToCSV, exportToPDF } from "@/lib/export";
import { motion, AnimatePresence } from "framer-motion";

interface CareerData {
  _id: string;
  fullName: string;
  gender: string;
  age: number;
  bloodGroup?: string;
  mobile: string;
  email: string;
  instagram?: string;
  resume?: string;
  experience: string;
  whyJoin: string;
  status: "Pending" | "Reviewed" | "Rejected" | "Archived";
  createdAt: string;
  rejectionReason?: string;
}

export default function AdminCareersPage() {
  const [applications, setApplications] = useState<CareerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [selectedCareerId, setSelectedCareerId] = useState<string | null>(null);
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
      instagram: "Instagram",
      resume: "Resume Link",
      experience: "Travel Experience",
      whyJoin: "Why Travel/Co-Host?",
      status: "Status",
      createdAt: "Submitted Date"
    };

    const dataToExport = filtered.map(app => ({
      ...app,
      createdAt: new Date(app.createdAt).toLocaleString()
    }));

    exportToCSV(dataToExport, headersMap, `careers_export_${new Date().toISOString().split("T")[0]}.csv`);
  };

  const handleExportPDF = async () => {
    if (filtered.length === 0) return alert("No data to export.");
    const headers = ["Full Name", "Contact Details", "Experience", "Motivation", "Status", "Date"];
    const rows = filtered.map(app => [
      app.fullName,
      `${app.mobile}\n${app.email}${app.instagram ? `\n@${app.instagram.replace('@', '')}` : ''}${app.resume ? `\nResume: ${app.resume}` : ''}`,
      app.experience,
      app.whyJoin,
      app.status,
      new Date(app.createdAt).toLocaleDateString()
    ]);

    await exportToPDF(
      "WeAreSoloz - Careers & Hiring Applications",
      headers,
      rows,
      `careers_report_${new Date().toISOString().split("T")[0]}.pdf`
    );
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/careers`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error("Failed to load applications");
      const data = await res.json();
      setApplications(data);
    } catch (err) {
      console.error(err);
      alert("Error loading applications. Make sure you are signed in.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: "Pending" | "Reviewed" | "Rejected" | "Archived") => {
    if (newStatus === "Rejected") {
      setSelectedCareerId(id);
      setRejectionReasonInput("");
      setRejectionModalOpen(true);
      return;
    }

    await updateStatus(id, newStatus, "");
  };

  const updateStatus = async (id: string, newStatus: "Pending" | "Reviewed" | "Rejected" | "Archived", reason: string) => {
    try {
      const res = await fetch(`${API_URL}/admin/careers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ status: newStatus, rejectionReason: reason })
      });
      if (!res.ok) throw new Error("Failed to update status");

      setApplications(
        applications.map((app) => (app._id === id ? { ...app, status: newStatus, rejectionReason: reason } : app))
      );
    } catch (err: any) {
      alert(err.message || "Error updating status.");
    }
  };

  const submitRejection = async () => {
    if (!selectedCareerId) return;
    if (!rejectionReasonInput.trim()) {
      alert("Please enter a reason for rejection.");
      return;
    }
    await updateStatus(selectedCareerId, "Rejected", rejectionReasonInput.trim());
    setRejectionModalOpen(false);
    setSelectedCareerId(null);
    setRejectionReasonInput("");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this application? This action is permanent.")) return;

    try {
      const res = await fetch(`${API_URL}/admin/careers/${id}`, { method: "DELETE", headers: getAuthHeaders() });
      if (!res.ok) throw new Error("Failed to delete application");

      setApplications(applications.filter((app) => app._id !== id));
    } catch (err: any) {
      alert(err.message || "Error deleting application.");
    }
  };

  const filtered = applications.filter((app) => {
    const matchesSearch =
      app.fullName.toLowerCase().includes(search.toLowerCase()) ||
      app.email.toLowerCase().includes(search.toLowerCase()) ||
      app.mobile.includes(search) ||
      app.gender.toLowerCase().includes(search.toLowerCase()) ||
      (app.instagram || "").toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All" ||
      app.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <main className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-stone-400" size={32} />
      </main>
    );
  }

  const selectedApplication = applications.find((app) => app._id === selectedCareerId);

  return (
    <main className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-white flex items-center gap-2">
            <Briefcase className="text-soloz-ember" size={28} />
            Careers & Hiring Applications
          </h1>
          <p className="text-xs text-soloz-ash/75 mt-1">Review candidates who want to travel and co-host trips with Akhil.</p>
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
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-soloz-ash/50" size={16} />
          <input
            type="text"
            placeholder="Search by name, email, mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-white/10 bg-[#14110d] text-white focus:outline-none focus:border-soloz-amber"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 self-start">
          {["All", "Pending", "Reviewed", "Rejected", "Archived"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold border transition-all ${
                statusFilter === st
                  ? "bg-soloz-amber border-soloz-amber text-white shadow-sm"
                  : "border-white/10 bg-[#14110d] text-soloz-ash hover:text-white"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Applications Table Card */}
      <div className="rounded-xl border border-white/10 bg-[#14110d] overflow-hidden shadow-lg">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-soloz-ash/60 text-sm font-body">
            No applications match your selection.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[10px] uppercase tracking-wider text-soloz-ash/50 bg-black/20 font-semibold">
                  <th className="px-6 py-4">Applicant Info</th>
                  <th className="px-6 py-4">Contact Detail</th>
                  <th className="px-6 py-4">Travel Experience</th>
                  <th className="px-6 py-4">Why Travel/Co-Host?</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-soloz-ash">
                {filtered.map((app) => {
                  const cleanedMobile = app.mobile.replace(/[^\d+]/g, "");
                  const instagramHandle = app.instagram ? app.instagram.replace("@", "") : "";
                  
                  return (
                    <tr key={app._id} className="hover:bg-white/2 transition-colors">
                      {/* Name / Age / Gender */}
                      <td className="px-6 py-4 space-y-1 min-w-[150px]">
                        <p className="font-bold text-white text-sm">{app.fullName}</p>
                        <p className="text-[10px] text-white/50">{app.gender} • {app.age} yrs old • Blood: {app.bloodGroup || "N/A"}</p>
                        <p className="text-[9px] text-white/30">{new Date(app.createdAt).toLocaleDateString()}</p>
                      </td>

                      {/* Contact Info */}
                      <td className="px-6 py-4 space-y-2 min-w-[200px]">
                        <div>
                          <p className="text-[10px] text-white/40 uppercase">Email</p>
                          <a href={`mailto:${app.email}`} className="text-white hover:text-soloz-amber underline font-medium">{app.email}</a>
                        </div>
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="text-[10px] text-white/40 uppercase">WhatsApp</p>
                            <a
                              href={`https://wa.me/${cleanedMobile}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-white hover:text-emerald-400 font-semibold inline-flex items-center gap-1"
                            >
                              {app.mobile} <ExternalLink size={10} />
                            </a>
                          </div>
                          {instagramHandle && (
                            <div>
                              <p className="text-[10px] text-white/40 uppercase">Instagram</p>
                              <a
                                href={`https://instagram.com/${instagramHandle}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-white hover:text-pink-400 font-semibold inline-flex items-center gap-1"
                              >
                                @{instagramHandle} <ExternalLink size={10} />
                              </a>
                            </div>
                          )}
                          {app.resume && (
                            <div>
                              <p className="text-[10px] text-white/40 uppercase">Resume</p>
                              <a
                                href={app.resume}
                                target="_blank"
                                rel="noreferrer"
                                className="text-soloz-ember hover:text-soloz-ember/80 font-semibold inline-flex items-center gap-1 hover:underline"
                              >
                                View Resume <ExternalLink size={10} />
                              </a>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Travel Experience */}
                      <td className="px-6 py-4 max-w-xs whitespace-pre-wrap leading-relaxed text-white/80 font-body">
                        {app.experience}
                      </td>

                      {/* Why Join */}
                      <td className="px-6 py-4 max-w-xs whitespace-pre-wrap leading-relaxed text-white/80 font-body">
                        <div>
                          <p>{app.whyJoin}</p>
                          {app.status === "Rejected" && app.rejectionReason && (
                            <div className="mt-2 text-left">
                              <span className="text-rose-600 block uppercase tracking-wider text-[8px] font-bold">Rejection Reason:</span>
                              <div className="rounded-lg bg-rose-500/15 border border-rose-500/25 p-2.5 text-[11px] font-medium italic leading-normal">
                                {app.rejectionReason}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block rounded px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                            app.status === "Pending"
                              ? "bg-amber-500/15 border border-amber-500/25 text-amber-400"
                              : app.status === "Reviewed"
                              ? "bg-blue-500/15 border border-blue-500/25 text-blue-400"
                              : app.status === "Rejected"
                              ? "bg-rose-500/15 border border-rose-500/25 text-rose-400"
                              : "bg-stone-500/15 border border-stone-500/25 text-stone-400"
                          }`}
                        >
                          {app.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {app.status !== "Reviewed" && (
                            <Button
                              onClick={() => handleStatusChange(app._id, "Reviewed")}
                              size="sm"
                              variant="ghost"
                              title="Mark as Reviewed"
                              className="h-8 w-8 p-0 text-white/60 hover:text-blue-400 hover:bg-white/5"
                            >
                              <UserCheck size={14} />
                            </Button>
                          )}
                          {app.status !== "Archived" && (
                            <Button
                              onClick={() => handleStatusChange(app._id, "Archived")}
                              size="sm"
                              variant="ghost"
                              title="Archive Application"
                              className="h-8 w-8 p-0 text-white/60 hover:text-stone-400 hover:bg-white/5"
                            >
                              <Archive size={14} />
                            </Button>
                          )}
                          {app.status !== "Pending" && (
                            <Button
                              onClick={() => handleStatusChange(app._id, "Pending")}
                              size="sm"
                              variant="ghost"
                              title="Mark as Pending"
                              className="h-8 w-8 p-0 text-white/60 hover:text-amber-400 hover:bg-white/5"
                            >
                              <Clock size={14} />
                            </Button>
                          )}
                          {app.status !== "Rejected" && (
                            <Button
                              onClick={() => handleStatusChange(app._id, "Rejected")}
                              size="sm"
                              variant="ghost"
                              title="Reject Application"
                              className="h-8 w-8 p-0 text-white/60 hover:text-rose-500 hover:bg-white/5"
                            >
                              <X size={14} />
                            </Button>
                          )}
                          <Button
                            onClick={() => handleDelete(app._id)}
                            size="sm"
                            variant="ghost"
                            title="Delete permanently"
                            className="h-8 w-8 p-0 text-white/60 hover:text-red-400 hover:bg-white/5"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Rejection Reason Modal */}
      <AnimatePresence>
        {rejectionModalOpen && selectedApplication && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setRejectionModalOpen(false);
                setSelectedCareerId(null);
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
                  setSelectedCareerId(null);
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
                    Submit a rejection reason for this candidate
                  </p>
                </div>
              </div>

              {/* Message */}
              <p className="text-xs text-stone-600 mb-4 leading-relaxed text-left">
                Please enter a reason for rejecting the application of{" "}
                <strong className="text-stone-900 font-semibold">
                  {selectedApplication.fullName}
                </strong>
                . A notification email with this reason will be sent to the candidate.
              </p>

              {/* Input field */}
              <div className="mb-6 text-left">
                <label className="block text-[10px] uppercase tracking-wider font-semibold text-stone-500 mb-1.5">
                  Reason for Rejection
                </label>
                <textarea
                  autoFocus
                  placeholder="e.g. Profile criteria mismatch, insufficient travel experience..."
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
                    setSelectedCareerId(null);
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
// Trigger rebuild
