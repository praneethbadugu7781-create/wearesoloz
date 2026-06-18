"use client";
import { getAuthHeaders } from "@/lib/api";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

import { useEffect, useState } from "react";
import { HeartHandshake, Trash2, Loader2, ExternalLink, Search, User, MapPin, Sprout, Calendar } from "lucide-react";

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
}

export default function AdminFarmersPage() {
  const [farmers, setFarmers] = useState<FarmerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

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
    try {
      const res = await fetch(`${API_URL}/admin/farmers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error("Failed to update application status");

      setFarmers(
        farmers.map((f) => (f._id === id ? { ...f, status: newStatus } : f))
      );
    } catch (err: any) {
      alert(err.message || "Error updating application status.");
    }
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

  return (
    <main className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="font-display text-3xl font-bold text-white flex items-center gap-2">
          <HeartHandshake className="text-soloz-ember" size={28} />
          Farmer Free Trip Console
        </h1>
        <p className="text-xs text-soloz-ash/75 mt-1">Review and manage community initiative free trip applications submitted by farmers.</p>
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
    </main>
  );
}
