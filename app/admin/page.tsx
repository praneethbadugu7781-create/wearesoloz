"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Compass, MapPin, BookOpen, Image as ImageIcon, MessageSquareQuote, MailQuestion, AlertCircle, Loader2, Briefcase } from "lucide-react";
import { getAuthHeaders } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any[]>([]);
  const [recentEnquiries, setRecentEnquiries] = useState<any[]>([]);
  const [isEmpty, setIsEmpty] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const headers = { ...getAuthHeaders(), "Content-Type": "application/json" };

        const [trips, dests, blogs, gallery, testimonials, contacts, careers] = await Promise.all([
          fetch(`${API_URL}/admin/trips`, { headers }).then(r => r.ok ? r.json() : []),
          fetch(`${API_URL}/admin/destinations`, { headers }).then(r => r.ok ? r.json() : []),
          fetch(`${API_URL}/admin/blogs`, { headers }).then(r => r.ok ? r.json() : []),
          fetch(`${API_URL}/admin/gallery`, { headers }).then(r => r.ok ? r.json() : []),
          fetch(`${API_URL}/admin/testimonials`, { headers }).then(r => r.ok ? r.json() : []),
          fetch(`${API_URL}/admin/contacts`, { headers }).then(r => r.ok ? r.json() : []),
          fetch(`${API_URL}/admin/careers`, { headers }).then(r => r.ok ? r.json() : []),
        ]);

        setStats([
          { label: "Trips", value: trips.length, icon: Compass, color: "text-soloz-ember bg-soloz-ember/15 border-soloz-ember/20" },
          { label: "Destinations", value: dests.length, icon: MapPin, color: "text-soloz-amber bg-soloz-amber/15 border-soloz-amber/20" },
          { label: "Stories (Blogs)", value: blogs.length, icon: BookOpen, color: "text-soloz-gold bg-soloz-gold/15 border-soloz-gold/20" },
          { label: "Gallery", value: gallery.length, icon: ImageIcon, color: "text-emerald-400 bg-emerald-500/15 border-emerald-500/20" },
          { label: "Testimonials", value: testimonials.length, icon: MessageSquareQuote, color: "text-sky-400 bg-sky-500/15 border-sky-500/20" },
          { label: "Enquiries", value: contacts.length, icon: MailQuestion, color: "text-violet-400 bg-violet-500/15 border-violet-500/20" },
          { label: "Careers", value: careers.length, icon: Briefcase, color: "text-orange-400 bg-orange-500/15 border-orange-500/20" },
        ]);

        setRecentEnquiries(contacts.slice(0, 5));
        setIsEmpty(trips.length === 0 && dests.length === 0 && blogs.length === 0);
      } catch (error) {
        console.error("Failed to load dashboard:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <main className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-stone-400" size={32} />
      </main>
    );
  }

  return (
    <main className="space-y-10">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Dashboard Overview</h1>
          <p className="text-xs text-soloz-ash/70 mt-1">Real-time statistics and administrative health.</p>
        </div>

        {isEmpty && (
          <div className="flex items-center gap-2 rounded-lg bg-orange-500/10 border border-orange-500/20 px-3.5 py-1.5 text-xs text-soloz-amber">
            <AlertCircle size={14} /> Database is empty.
          </div>
        )}
      </div>

      {/* Cards Grid */}
      <div className="grid gap-6 grid-cols-2 lg:grid-cols-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="rounded-xl border border-white/10 bg-[#14110d] p-5 space-y-3 shadow-md"
            >
              <div className={`inline-flex size-10 items-center justify-center rounded-lg border ${stat.color}`}>
                <Icon size={18} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-soloz-ash/60">{stat.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Enquiries Box */}
      <div className="rounded-xl border border-white/10 bg-[#14110d] overflow-hidden shadow-lg">
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-white">Recent Enquiries</h3>
          <Link href="/admin/enquiries" className="text-xs text-soloz-amber hover:text-soloz-ember transition font-semibold">
            View All Enquiries →
          </Link>
        </div>

        {recentEnquiries.length === 0 ? (
          <div className="p-8 text-center text-soloz-ash/60 text-sm">
            No inquiries recorded. The database is empty or awaiting submissions.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[10px] uppercase tracking-wider text-soloz-ash/50 bg-black/20">
                  <th className="px-6 py-3 font-semibold">Lead Info</th>
                  <th className="px-6 py-3 font-semibold">Interested In</th>
                  <th className="px-6 py-3 font-semibold">Message preview</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold text-right">Received</th>
                </tr>
              </thead>
              <tbody>
                {recentEnquiries.map((enq: any) => (
                  <tr key={enq._id} className="border-b border-white/5 text-xs text-soloz-ash hover:bg-white/2">
                    <td className="px-6 py-4 space-y-1">
                      <p className="font-bold text-white">{enq.fullName}</p>
                      <p className="text-[10px] text-white/45">{enq.email} • {enq.mobile}</p>
                    </td>
                    <td className="px-6 py-4 font-semibold text-white/95">
                      {enq.destination || "General Query"}
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate text-white/70">
                      {enq.message}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block rounded px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          enq.status === "new"
                            ? "bg-soloz-ember/15 border border-soloz-ember/25 text-soloz-amber"
                            : enq.status === "contacted"
                            ? "bg-blue-500/15 border border-blue-500/25 text-blue-400"
                            : "bg-emerald-500/15 border border-emerald-500/25 text-emerald-400"
                        }`}
                      >
                        {enq.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-white/45">
                      {new Date(enq.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
