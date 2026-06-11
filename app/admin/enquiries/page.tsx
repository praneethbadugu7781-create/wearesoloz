"use client";
import { getAuthHeaders } from "@/lib/api";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

import { useEffect, useState } from "react";
import { MailQuestion, Trash2, CheckCircle, Clock, Loader2, Check, ExternalLink, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EnquiryData {
  _id: string;
  fullName: string;
  mobile: string;
  email: string;
  destination?: string;
  message: string;
  status: "new" | "contacted" | "closed";
  createdAt: string;
}

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<EnquiryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/contacts`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error("Failed to load enquiries");
      const data = await res.json();
      setEnquiries(data);
    } catch (err) {
      console.error(err);
      alert("Error loading enquiries. Make sure you are signed in.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: "new" | "contacted" | "closed") => {
    try {
      const res = await fetch(`${API_URL}/admin/contacts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error("Failed to update status");

      setEnquiries(
        enquiries.map((e) => (e._id === id ? { ...e, status: newStatus } : e))
      );
    } catch (err: any) {
      alert(err.message || "Error updating status.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this enquiry? This action is permanent.")) return;

    try {
      const res = await fetch(`${API_URL}/admin/contacts/${id}`, { method: "DELETE", headers: getAuthHeaders() });
      if (!res.ok) throw new Error("Failed to delete enquiry");

      setEnquiries(enquiries.filter((e) => e._id !== id));
    } catch (err: any) {
      alert(err.message || "Error deleting enquiry.");
    }
  };

  const filtered = enquiries.filter((enq) => {
    const matchesSearch =
      enq.fullName.toLowerCase().includes(search.toLowerCase()) ||
      enq.email.toLowerCase().includes(search.toLowerCase()) ||
      enq.mobile.includes(search) ||
      (enq.destination || "").toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All" ||
      enq.status === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <main className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="font-display text-3xl font-bold text-white flex items-center gap-2">
          <MailQuestion className="text-soloz-ember" size={28} />
          Contact & Booking Enquiries
        </h1>
        <p className="text-xs text-soloz-ash/75 mt-1">Review lead capture submissions and manage customer follow-ups.</p>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-white/10 bg-black/40 p-4 backdrop-blur">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-soloz-ash/60" size={15} />
          <input
            type="text"
            placeholder="Search leads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-lg border border-white/10 bg-white/5 pl-9 pr-4 text-xs text-white placeholder-white/30 focus:border-soloz-ember/50 focus:outline-none"
          />
        </div>

        {/* Status filters */}
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          {["All", "New", "Contacted", "Closed"].map((s) => (
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
          <p className="text-xs">Fetching enquiries...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 p-12 text-center text-soloz-ash/60">
          No matching enquiries found.
        </div>
      ) : (
        <div className="grid gap-6">
          {filtered.map((enq) => (
            <div
              key={enq._id}
              className="rounded-xl border border-white/10 bg-[#14110d] p-6 space-y-4 hover:border-white/20 transition duration-300 shadow-md"
            >
              {/* Top Row: Info */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                  <span
                    className={`inline-block rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                      enq.status === "new"
                        ? "bg-soloz-ember/15 border border-soloz-ember/25 text-soloz-amber"
                        : enq.status === "contacted"
                        ? "bg-blue-500/15 border border-blue-500/25 text-blue-400"
                        : "bg-emerald-500/15 border border-emerald-500/25 text-emerald-400"
                    }`}
                  >
                    {enq.status}
                  </span>
                  <h3 className="font-bold text-white text-base mt-2">{enq.fullName}</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-soloz-ash/60 mt-1">
                    <span className="text-soloz-amber">{enq.destination || "General Enquiry"}</span>
                    <span>{enq.email}</span>
                    <span>{enq.mobile}</span>
                  </div>
                </div>

                <div className="text-right text-[10px] text-white/40">
                  Received: {new Date(enq.createdAt).toLocaleString()}
                </div>
              </div>

              {/* Message block */}
              <div className="rounded-lg bg-black/30 p-4 border border-white/5 text-xs text-white/90 leading-relaxed whitespace-pre-wrap">
                {enq.message}
              </div>

              {/* Bottom Row: Actions */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-white/5">
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="text-white/40 flex items-center mr-2">Change Status:</span>
                  <button
                    onClick={() => handleStatusChange(enq._id, "new")}
                    className={`px-3 py-1 rounded transition border ${
                      enq.status === "new" ? "bg-soloz-ember/20 border-soloz-ember text-soloz-amber font-bold" : "border-white/10 text-white/65 hover:bg-white/5"
                    }`}
                  >
                    New
                  </button>
                  <button
                    onClick={() => handleStatusChange(enq._id, "contacted")}
                    className={`px-3 py-1 rounded transition border ${
                      enq.status === "contacted" ? "bg-blue-500/20 border-blue-500 text-blue-400 font-bold" : "border-white/10 text-white/65 hover:bg-white/5"
                    }`}
                  >
                    Contacted
                  </button>
                  <button
                    onClick={() => handleStatusChange(enq._id, "closed")}
                    className={`px-3 py-1 rounded transition border ${
                      enq.status === "closed" ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold" : "border-white/10 text-white/65 hover:bg-white/5"
                    }`}
                  >
                    Closed
                  </button>
                </div>

                <div className="flex gap-2 w-full sm:w-auto justify-end">
                  {/* WhatsApp contact helper */}
                  <a
                    href={`https://wa.me/${enq.mobile.replace(/[^\d]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-4 py-2 hover:bg-white/10 transition text-xs font-bold text-white"
                  >
                    Chat WhatsApp <ExternalLink size={13} />
                  </a>

                  <button
                    onClick={() => handleDelete(enq._id)}
                    className="grid size-9 place-items-center rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                    title="Delete lead"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
