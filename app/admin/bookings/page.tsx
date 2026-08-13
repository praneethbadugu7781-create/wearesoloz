"use client";

import React, { useEffect, useState } from "react";
import { getAuthHeaders } from "@/lib/api";
import {
  CreditCard,
  Search,
  RefreshCw,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Mail,
  Phone,
  Calendar,
  Filter,
  Eye,
  Trash2,
  Check,
  Ban,
  Sparkles,
  Zap,
  Building2,
  Smartphone
} from "lucide-react";
import { Button } from "@/components/ui/button";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface BookingRecord {
  _id: string;
  bookingId: string;
  payuTxnId?: string;
  payuMihpayid?: string;
  payuStatus?: string;
  payuUnmappedStatus?: string;
  paymentMode?: string;
  bankRefNum?: string;
  payuErrorMsg?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  tripTitle: string;
  tripSlug?: string;
  destination?: string;
  customerName: string;
  customerEmail: string;
  customerMobile: string;
  age?: number;
  bloodGroup?: string;
  travelers: number;
  selectedBatch?: any;
  amount: number;
  currency: string;
  status: "PAID" | "PENDING" | "FAILED" | "CANCELLED";
  paymentMethod: string;
  paidAt?: string;
  createdAt: string;
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingPayU, setSyncingPayU] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedBooking, setSelectedBooking] = useState<BookingRecord | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/bookings`, {
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error("Failed to fetch bookings");
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Error loading bookings");
    } finally {
      setLoading(false);
    }
  };

  // Sync Pending / Specific Booking directly with PayU Production API
  const handleSyncPayUStatus = async (bookingId?: string) => {
    setSyncingPayU(true);
    try {
      const res = await fetch(`${API_URL}/payment/sync-payu-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ bookingId: bookingId || "" })
      });

      const responseText = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(responseText);
      } catch (parseErr) {
        throw new Error(`Server returned HTML response (${res.status} ${res.statusText}). The backend server may be restarting or updating. Please try again in a few seconds.`);
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || data.message || "Failed to sync status with PayU");
      }
      alert(data.message || "PayU status synchronization complete!");
      fetchBookings();
    } catch (err: any) {
      alert(err.message || "PayU Sync Error");
    } finally {
      setSyncingPayU(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    if (!confirm(`Are you sure you want to update status to ${newStatus}?`)) return;
    try {
      const res = await fetch(`${API_URL}/admin/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({
          status: newStatus,
          ...(newStatus === "PAID" ? { paidAt: new Date().toISOString() } : {})
        })
      });
      if (!res.ok) throw new Error("Failed to update status");
      fetchBookings();
      if (selectedBooking && selectedBooking._id === id) {
        setSelectedBooking((prev) => (prev ? { ...prev, status: newStatus as any } : null));
      }
    } catch (err: any) {
      alert(err.message || "Error updating booking status");
    }
  };

  const handleDeleteBooking = async (id: string) => {
    if (!confirm("Are you sure you want to delete this booking record? This action cannot be undone.")) return;
    try {
      const res = await fetch(`${API_URL}/admin/bookings/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error("Failed to delete booking");
      setBookings((prev) => prev.filter((b) => b._id !== id));
      if (selectedBooking && selectedBooking._id === id) {
        setSelectedBooking(null);
      }
    } catch (err: any) {
      alert(err.message || "Error deleting booking");
    }
  };

  const exportCSV = () => {
    if (bookings.length === 0) return;

    const headers = [
      "Booking ID",
      "PayU Txn ID",
      "PayU MIHPAYID",
      "Customer Name",
      "Email",
      "Mobile",
      "Age",
      "Blood Group",
      "Trip Expedition",
      "Batch Date",
      "Travelers",
      "Amount Paid",
      "Status",
      "Payment Mode",
      "Bank Ref / UTR",
      "Booking Date"
    ];

    const rows = filteredBookings.map((b) => [
      `"${b.bookingId || ""}"`,
      `"${b.payuTxnId || b.razorpayOrderId || ""}"`,
      `"${b.payuMihpayid || b.razorpayPaymentId || ""}"`,
      `"${b.customerName || ""}"`,
      `"${b.customerEmail || ""}"`,
      `"${b.customerMobile || ""}"`,
      `"${b.age || ""}"`,
      `"${b.bloodGroup || ""}"`,
      `"${b.tripTitle || ""}"`,
      `"${b.selectedBatch ? (typeof b.selectedBatch === "string" ? b.selectedBatch : b.selectedBatch.label || b.selectedBatch.startDate) : ""}"`,
      `"${b.travelers || 1}"`,
      `"${b.amount || 0}"`,
      `"${b.status || ""}"`,
      `"${b.paymentMode || b.paymentMethod || "PAYU"}"`,
      `"${b.bankRefNum || ""}"`,
      `"${new Date(b.createdAt).toLocaleString()}"`
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `WeAreSoloz_Bookings_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = statusFilter === "ALL" || b.status === statusFilter;
    const term = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !term ||
      (b.bookingId && b.bookingId.toLowerCase().includes(term)) ||
      (b.customerName && b.customerName.toLowerCase().includes(term)) ||
      (b.customerEmail && b.customerEmail.toLowerCase().includes(term)) ||
      (b.customerMobile && b.customerMobile.includes(term)) ||
      (b.tripTitle && b.tripTitle.toLowerCase().includes(term)) ||
      (b.payuMihpayid && b.payuMihpayid.toLowerCase().includes(term)) ||
      (b.payuTxnId && b.payuTxnId.toLowerCase().includes(term)) ||
      (b.bankRefNum && b.bankRefNum.toLowerCase().includes(term));

    return matchesStatus && matchesSearch;
  });

  const totalPaidRevenue = bookings
    .filter((b) => b.status === "PAID")
    .reduce((sum, b) => sum + (Number(b.amount) || 0), 0);

  const paidCount = bookings.filter((b) => b.status === "PAID").length;
  const pendingCount = bookings.filter((b) => b.status === "PENDING").length;
  const cancelledCount = bookings.filter((b) => b.status === "CANCELLED").length;
  const failedCount = bookings.filter((b) => b.status === "FAILED").length;

  return (
    <main className="space-y-8 font-sans">
      {/* Title & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-stone-900 flex items-center gap-2">
            <CreditCard className="text-[#ea580c]" size={28} />
            Bookings & Payments
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Real-time traveler bookings, PayU live status verification, and payment breakdown.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => handleSyncPayUStatus()}
            disabled={syncingPayU}
            className="bg-emerald-600 hover:bg-emerald-700 text-white h-10 px-3.5 rounded-xl text-xs font-bold shadow-sm"
          >
            <Zap className={`w-3.5 h-3.5 mr-1.5 ${syncingPayU ? "animate-spin" : ""}`} />
            {syncingPayU ? "Syncing PayU..." : "⚡ Sync PayU Live Status"}
          </Button>

          <Button
            variant="ghost"
            onClick={fetchBookings}
            className="border border-stone-200 text-stone-700 hover:bg-stone-100 h-10 px-3 rounded-xl text-xs font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>

          <Button
            onClick={exportCSV}
            disabled={bookings.length === 0}
            className="gradient-orange text-white hover:opacity-95 h-10 px-4 rounded-xl text-xs font-bold shadow-sm"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-extrabold tracking-wider text-stone-400">Total Verified Revenue</span>
          <div className="text-2xl font-extrabold text-emerald-600 font-display">₹{totalPaidRevenue.toLocaleString("en-IN")}</div>
          <p className="text-[11px] text-stone-500 font-medium">Verified PayU online payments</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-extrabold tracking-wider text-stone-400">Confirmed Paid Bookings</span>
          <div className="text-2xl font-extrabold text-stone-900 font-display">{paidCount}</div>
          <p className="text-[11px] text-emerald-600 font-medium">Slots secured & confirmed</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-extrabold tracking-wider text-stone-400">Pending Checkout</span>
          <div className="text-2xl font-extrabold text-amber-600 font-display">{pendingCount}</div>
          <p className="text-[11px] text-stone-500 font-medium">Form submitted / awaiting payment</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-extrabold tracking-wider text-stone-400">Cancelled / Failed</span>
          <div className="text-2xl font-extrabold text-rose-600 font-display">{cancelledCount + failedCount}</div>
          <p className="text-[11px] text-stone-500 font-medium">{cancelledCount} User Cancelled | {failedCount} Failed</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Name, Email, Mobile, Booking ID, PayU Txn, UTR..."
            className="w-full pl-9 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#ea580c]"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {["ALL", "PAID", "PENDING", "CANCELLED", "FAILED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === st
                  ? "bg-stone-900 text-white shadow-sm"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              {st === "ALL" ? "All Bookings" : st}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-stone-500 text-xs font-semibold">
            <RefreshCw className="w-6 h-6 animate-spin text-[#ea580c] mx-auto mb-2" />
            Loading customer bookings...
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-12 text-center text-stone-500 space-y-2">
            <CreditCard className="w-10 h-10 text-stone-300 mx-auto" />
            <p className="text-sm font-bold text-stone-700">No bookings match your filter criteria.</p>
            <p className="text-xs text-stone-400">When visitors book trips on the website, their details will automatically appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200/80 text-[10.5px] uppercase tracking-wider text-stone-500 font-extrabold">
                  <th className="py-3.5 px-4">Booking ID / Date</th>
                  <th className="py-3.5 px-4">Customer Details</th>
                  <th className="py-3.5 px-4">Trip Expedition</th>
                  <th className="py-3.5 px-4">Travelers & Amount</th>
                  <th className="py-3.5 px-4">Payment Status</th>
                  <th className="py-3.5 px-4">PayU Txn / Mode</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-150">
                {filteredBookings.map((b) => (
                  <tr key={b._id} className="hover:bg-stone-50/70 transition-colors">
                    {/* Booking ID & Date */}
                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-bold text-stone-900 text-xs">{b.bookingId}</div>
                      <div className="text-[10px] text-stone-400 font-sans mt-0.5">
                        {new Date(b.createdAt).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </div>
                    </td>

                    {/* Customer Info */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-stone-900">{b.customerName}</div>
                      <div className="text-[11px] text-stone-500 flex items-center gap-2 mt-0.5">
                        <span>{b.customerMobile}</span>
                        <span>•</span>
                        <span className="truncate max-w-[150px]">{b.customerEmail}</span>
                      </div>
                      {(b.age || b.bloodGroup) && (
                        <div className="text-[10px] text-stone-400 mt-0.5">
                          {b.age ? `Age: ${b.age}` : ""} {b.bloodGroup ? `| Blood: ${b.bloodGroup}` : ""}
                        </div>
                      )}
                    </td>

                    {/* Trip Info */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-stone-800 line-clamp-1">{b.tripTitle}</div>
                      {b.selectedBatch && (
                        <div className="text-[10px] text-[#ea580c] font-semibold mt-0.5">
                          Batch: {typeof b.selectedBatch === "string" ? b.selectedBatch : b.selectedBatch.label || `${b.selectedBatch.startDate}`}
                        </div>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 font-display">
                      <div className="font-extrabold text-stone-900 text-sm">₹{b.amount?.toLocaleString("en-IN")}</div>
                      <div className="text-[10px] text-stone-400 font-sans">{b.travelers} Traveler{b.travelers > 1 ? "s" : ""}</div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      {b.status === "PAID" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wider">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> PAID
                        </span>
                      ) : b.status === "PENDING" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold uppercase tracking-wider">
                          <Clock className="w-3 h-3 text-amber-600" /> PENDING
                        </span>
                      ) : b.status === "CANCELLED" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 text-[10px] font-extrabold uppercase tracking-wider">
                          <Ban className="w-3 h-3 text-purple-600" /> USER CANCELLED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-[10px] font-extrabold uppercase tracking-wider">
                          <XCircle className="w-3 h-3 text-rose-600" /> FAILED
                        </span>
                      )}
                    </td>

                    {/* PayU Txn & Mode */}
                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      <div className="text-stone-700 truncate max-w-[130px]" title={b.payuMihpayid || b.payuTxnId || "-"}>
                        {b.payuMihpayid || b.payuTxnId || b.razorpayPaymentId || "-"}
                      </div>
                      <div className="text-[9.5px] uppercase font-extrabold text-[#ea580c] font-sans mt-0.5 flex items-center gap-1">
                        <span className="px-1.5 py-0.5 rounded bg-orange-50 border border-orange-200">
                          {b.paymentMode || b.paymentMethod || "PAYU"}
                        </span>
                        {b.bankRefNum && <span className="text-[9px] text-stone-400 font-mono">UTR: {b.bankRefNum.slice(-6)}</span>}
                      </div>
                    </td>

                    {/* Actions Column */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedBooking(b)}
                          className="px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-[11px] inline-flex items-center gap-1 transition-all border border-stone-200/80 shadow-2xs"
                        >
                          <Eye size={13} className="text-stone-600" />
                          View Details
                        </button>

                        <button
                          onClick={() => handleSyncPayUStatus(b.bookingId)}
                          title="Verify live status directly with PayU servers"
                          className="px-2 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-[11px] inline-flex items-center gap-1 transition-all"
                        >
                          <Zap size={13} className="text-emerald-600" />
                          Sync
                        </button>

                        {b.status !== "PAID" ? (
                          <button
                            onClick={() => handleUpdateStatus(b._id, "PAID")}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] inline-flex items-center gap-1 transition-all shadow-xs"
                          >
                            <Check size={13} />
                            Mark Paid
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpdateStatus(b._id, "PENDING")}
                            className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80 font-bold text-[11px] inline-flex items-center gap-1 transition-all"
                          >
                            <Clock size={13} className="text-amber-600" />
                            Mark Pending
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteBooking(b._id)}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] inline-flex items-center gap-1 transition-all border border-rose-200/60"
                        >
                          <Trash2 size={13} />
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

      {/* Details View Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-xl rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl border border-stone-200 font-sans">
            <div className="flex items-center justify-between border-b border-stone-150 pb-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#ea580c]">PayU Detailed Booking Receipt</span>
                <h3 className="font-mono text-lg font-bold text-stone-900">{selectedBooking.bookingId}</h3>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-500"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-stone-400 font-semibold block">Customer Name</span>
                <span className="font-bold text-stone-900 block">{selectedBooking.customerName}</span>
              </div>
              <div className="space-y-1">
                <span className="text-stone-400 font-semibold block">Trip Expedition</span>
                <span className="font-bold text-stone-900 block">{selectedBooking.tripTitle}</span>
              </div>
              <div className="space-y-1">
                <span className="text-stone-400 font-semibold block">Mobile Number</span>
                <span className="font-semibold text-stone-900 block">{selectedBooking.customerMobile}</span>
              </div>
              <div className="space-y-1">
                <span className="text-stone-400 font-semibold block">Email Address</span>
                <span className="font-semibold text-stone-900 block truncate">{selectedBooking.customerEmail}</span>
              </div>
              <div className="space-y-1">
                <span className="text-stone-400 font-semibold block">Age & Blood Group</span>
                <span className="font-semibold text-stone-900 block">
                  {selectedBooking.age ? `Age: ${selectedBooking.age}` : "N/A"} {selectedBooking.bloodGroup ? `| ${selectedBooking.bloodGroup}` : ""}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-stone-400 font-semibold block">Travelers & Amount</span>
                <span className="font-bold text-emerald-700 block text-sm">
                  ₹{selectedBooking.amount?.toLocaleString("en-IN")} ({selectedBooking.travelers} Traveler{selectedBooking.travelers > 1 ? "s" : ""})
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-stone-400 font-semibold block">PayU MIHPAYID / Txn</span>
                <span className="font-mono text-stone-800 block truncate">
                  {selectedBooking.payuMihpayid || selectedBooking.payuTxnId || selectedBooking.razorpayPaymentId || "Pending"}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-stone-400 font-semibold block">Payment Mode</span>
                <span className="font-bold text-stone-900 block uppercase">
                  {selectedBooking.paymentMode || selectedBooking.paymentMethod || "PAYU"}
                </span>
              </div>

              {selectedBooking.bankRefNum && (
                <div className="space-y-1 col-span-2 bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                  <span className="text-stone-400 font-semibold block text-[11px]">Bank Ref / UTR Number</span>
                  <span className="font-mono font-bold text-stone-900 text-xs">{selectedBooking.bankRefNum}</span>
                </div>
              )}

              {selectedBooking.payuErrorMsg && (
                <div className="space-y-1 col-span-2 bg-rose-50 p-2.5 rounded-xl border border-rose-200/80 text-rose-900">
                  <span className="text-rose-600 font-bold block text-[11px]">PayU Gateway Error / Reason:</span>
                  <span className="text-xs font-semibold">{selectedBooking.payuErrorMsg}</span>
                </div>
              )}

              <div className="space-y-1 col-span-2">
                <span className="text-stone-400 font-semibold block">Overall Status</span>
                <span className={`font-bold text-xs ${selectedBooking.status === "PAID" ? "text-emerald-600 font-extrabold" : selectedBooking.status === "CANCELLED" ? "text-purple-600 font-extrabold" : "text-amber-600 font-extrabold"}`}>
                  {selectedBooking.status} {selectedBooking.payuStatus ? `(${selectedBooking.payuStatus})` : ""}
                </span>
              </div>
            </div>

            {selectedBooking.selectedBatch && (
              <div className="p-3.5 bg-orange-50 border border-orange-200/80 rounded-xl text-xs space-y-1">
                <span className="text-stone-500 font-bold block">Selected Batch Date:</span>
                <span className="font-bold text-[#ea580c] text-sm">
                  {typeof selectedBooking.selectedBatch === "string"
                    ? selectedBooking.selectedBatch
                    : selectedBooking.selectedBatch.label || `${selectedBooking.selectedBatch.startDate} to ${selectedBooking.selectedBatch.endDate || ""}`}
                </span>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-stone-150">
              <a
                href={`https://wa.me/91${selectedBooking.customerMobile.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                  `Hi ${selectedBooking.customerName}, regarding your WeAreSoloz booking (${selectedBooking.bookingId}) for ${selectedBooking.tripTitle}:`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-all shadow-xs"
              >
                💬 Chat on WhatsApp
              </a>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handleSyncPayUStatus(selectedBooking.bookingId)}
                  disabled={syncingPayU}
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold h-9 px-3 rounded-xl border border-emerald-200"
                >
                  <Zap size={13} /> Sync PayU Live
                </Button>

                {selectedBooking.status !== "PAID" && (
                  <Button
                    onClick={() => handleUpdateStatus(selectedBooking._id, "PAID")}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold h-9 px-3.5 rounded-xl"
                  >
                    Mark Paid
                  </Button>
                )}

                <Button
                  variant="ghost"
                  onClick={() => handleDeleteBooking(selectedBooking._id)}
                  className="text-rose-600 hover:bg-rose-50 text-xs font-bold h-9 px-3 rounded-xl"
                >
                  Delete
                </Button>

                <Button variant="ghost" onClick={() => setSelectedBooking(null)} className="h-9 px-4 rounded-xl text-xs font-semibold border border-stone-200">
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
