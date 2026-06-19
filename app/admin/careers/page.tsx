"use client";

import { getAuthHeaders } from "@/lib/api";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

import { useEffect, useState } from "react";
import { Briefcase, Trash2, CheckCircle, Clock, Loader2, Check, ExternalLink, Search, Archive, UserCheck, FileSpreadsheet, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportToCSV, exportToPDF } from "@/lib/export";

interface CareerData {
  _id: string;
  fullName: string;
  gender: string;
  age: number;
  bloodGroup?: string;
  mobile: string;
  email: string;
  instagram?: string;
  experience: string;
  whyJoin: string;
  status: "Pending" | "Reviewed" | "Archived";
  createdAt: string;
}

export default function AdminCareersPage() {
  const [applications, setApplications] = useState<CareerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

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
      `${app.mobile}\n${app.email}${app.instagram ? `\n@${app.instagram.replace('@', '')}` : ''}`,
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

  const handleStatusChange = async (id: string, newStatus: "Pending" | "Reviewed" | "Archived") => {
    try {
      const res = await fetch(`${API_URL}/admin/careers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error("Failed to update status");

      setApplications(
        applications.map((app) => (app._id === id ? { ...app, status: newStatus } : app))
      );
    } catch (err: any) {
      alert(err.message || "Error updating status.");
    }
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
          {["All", "Pending", "Reviewed", "Archived"].map((st) => (
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
                        </div>
                      </td>

                      {/* Travel Experience */}
                      <td className="px-6 py-4 max-w-xs whitespace-pre-wrap leading-relaxed text-white/80 font-body">
                        {app.experience}
                      </td>

                      {/* Why Join */}
                      <td className="px-6 py-4 max-w-xs whitespace-pre-wrap leading-relaxed text-white/80 font-body">
                        {app.whyJoin}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block rounded px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                            app.status === "Pending"
                              ? "bg-amber-500/15 border border-amber-500/25 text-amber-400"
                              : app.status === "Reviewed"
                              ? "bg-blue-500/15 border border-blue-500/25 text-blue-400"
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
    </main>
  );
}
