"use client";
import { getAuthHeaders } from "@/lib/api";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

import { useEffect, useState } from "react";
import { MailQuestion, Trash2, CheckCircle, Clock, Loader2, Check, ExternalLink, Search, FileSpreadsheet, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportToCSV, exportToPDF } from "@/lib/export";

interface EnquiryData {
  _id: string;
  fullName: string;
  mobile: string;
  email: string;
  age?: number;
  bloodGroup?: string;
  destination?: string;
  message: string;
  status: "new" | "contacted" | "closed" | "approved";
  pricePoints?: string;
  travelerNames?: string;
  approvalNotes?: string;
  createdAt: string;
}

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<EnquiryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedEnquiry, setSelectedEnquiry] = useState<EnquiryData | null>(null);

  // Approval modal states
  const [approvingEnquiry, setApprovingEnquiry] = useState<EnquiryData | null>(null);
  const [pricePoints, setPricePoints] = useState("");
  const [travelerNames, setTravelerNames] = useState("");
  const [approvalNotes, setApprovalNotes] = useState("");
  const [submittingApproval, setSubmittingApproval] = useState(false);

  const handleExportCSV = () => {
    if (filtered.length === 0) return alert("No data to export.");
    const headersMap = {
      fullName: "Full Name",
      mobile: "Mobile",
      email: "Email",
      age: "Age",
      bloodGroup: "Blood Group",
      destination: "Destination",
      message: "Message",
      status: "Status",
      createdAt: "Submitted Date"
    };

    const dataToExport = filtered.map(e => ({
      ...e,
      createdAt: new Date(e.createdAt).toLocaleString()
    }));

    exportToCSV(dataToExport, headersMap, `enquiries_export_${new Date().toISOString().split("T")[0]}.csv`);
  };

  const handleExportPDF = async () => {
    if (filtered.length === 0) return alert("No data to export.");
    const headers = ["Full Name", "Mobile", "Email", "Age/Blood", "Destination", "Status", "Date"];
    const rows = filtered.map(e => [
      e.fullName,
      e.mobile,
      e.email,
      `${e.age || "N/A"} / ${e.bloodGroup || "N/A"}`,
      e.destination || "General Enquiry",
      e.status,
      new Date(e.createdAt).toLocaleDateString()
    ]);

    await exportToPDF(
      "WeAreSoloz - Contact & Booking Enquiries",
      headers,
      rows,
      `enquiries_report_${new Date().toISOString().split("T")[0]}.pdf`
    );
  };

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

  const handleStatusChange = async (id: string, newStatus: "new" | "contacted" | "closed" | "approved") => {
    try {
      const res = await fetch(`${API_URL}/admin/contacts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error("Failed to update status");

      const data = await res.json();

      setEnquiries(
        enquiries.map((e) => (e._id === id ? data : e))
      );
    } catch (err: any) {
      alert(err.message || "Error updating status.");
    }
  };

  const handleOpenApprovalModal = (enq: EnquiryData) => {
    setApprovingEnquiry(enq);
    setPricePoints(enq.pricePoints || "");
    setTravelerNames(enq.travelerNames || enq.fullName);
    setApprovalNotes(
      enq.approvalNotes ||
      `Trip Date: ${enq.destination ? "As scheduled for package" : "TBA"}\nMeeting Point: Assembly location communicated prior to departure.\nAC or Non-AC transfers & shared accommodation included.`
    );
  };

  const handleApproveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!approvingEnquiry) return;
    
    setSubmittingApproval(true);
    try {
      const res = await fetch(`${API_URL}/admin/contacts/${approvingEnquiry._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({
          status: "approved",
          pricePoints,
          travelerNames,
          approvalNotes
        })
      });

      if (!res.ok) throw new Error("Failed to approve enquiry");
      const updatedRecord = await res.json();

      setEnquiries(
        enquiries.map((e) => (e._id === approvingEnquiry._id ? updatedRecord : e))
      );
      
      // Update selected/viewing modal enquiry if it's the same
      if (selectedEnquiry && selectedEnquiry._id === approvingEnquiry._id) {
        setSelectedEnquiry(updatedRecord);
      }

      setApprovingEnquiry(null);
      alert("Enquiry successfully approved! Booking details and price points have been emailed to the customer.");
    } catch (err: any) {
      alert(err.message || "Error approving enquiry.");
    } finally {
      setSubmittingApproval(false);
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-white flex items-center gap-2">
            <MailQuestion className="text-soloz-ember" size={28} />
            Contact & Booking Enquiries
          </h1>
          <p className="text-xs text-soloz-ash/75 mt-1">Review lead capture submissions and manage customer follow-ups.</p>
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

      {/* Visual Pipeline Guide */}
      <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
        <h4 className="text-xs font-bold uppercase tracking-wider text-soloz-ember mb-4">Enquiry & Booking Flow Pipeline</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs">
          <div className="relative p-4 rounded-lg bg-stone-50 border border-stone-200/65 space-y-1">
            <span className="absolute -top-2 -left-2 flex h-5 w-5 items-center justify-center rounded-full bg-soloz-ember text-[10px] font-bold text-white shadow-md">1</span>
            <div className="font-bold text-stone-900 mt-1">Lead Capture</div>
            <p className="text-stone-600 text-[11px] leading-normal">Customer submits form on site. Customer receives automated receipt email.</p>
          </div>
          <div className="relative p-4 rounded-lg bg-stone-50 border border-stone-200/65 space-y-1">
            <span className="absolute -top-2 -left-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white shadow-md">2</span>
            <div className="font-bold text-stone-900 mt-1">Review & Contact</div>
            <p className="text-stone-600 text-[11px] leading-normal">Admin reviews info, changes status to **Contacted**, and/or chats via WhatsApp.</p>
          </div>
          <div className="relative p-4 rounded-lg bg-stone-50 border border-stone-200/65 space-y-1">
            <span className="absolute -top-2 -left-2 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white shadow-md">3</span>
            <div className="font-bold text-stone-900 mt-1">Approve & Price</div>
            <p className="text-stone-600 text-[11px] leading-normal">Admin clicks **Approve** to enter pricing and traveler list. Customer and Admin receive detailed invoice receipts.</p>
          </div>
          <div className="relative p-4 rounded-lg bg-stone-50 border border-stone-200/65 space-y-1">
            <span className="absolute -top-2 -left-2 flex h-5 w-5 items-center justify-center rounded-full bg-stone-500 text-[10px] font-bold text-white shadow-md">4</span>
            <div className="font-bold text-stone-900 mt-1">Archive / Close</div>
            <p className="text-stone-600 text-[11px] leading-normal">Once trip bookings are completed or finalized, admin sets status to **Closed**.</p>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={15} />
          <input
            type="text"
            placeholder="Search leads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-lg border border-stone-200 bg-stone-50 pl-9 pr-4 text-xs text-stone-900 placeholder-stone-400 focus:border-soloz-ember/50 focus:outline-none"
          />
        </div>

        {/* Status filters */}
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          {["All", "New", "Contacted", "Approved", "Closed"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-full px-4 py-1.5 transition ${
                statusFilter === s
                  ? "bg-soloz-ember text-white shadow-sm font-bold"
                  : "border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-600"
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
                        : enq.status === "approved"
                        ? "bg-emerald-500/15 border border-emerald-500/25 text-emerald-400"
                        : "bg-stone-500/15 border border-stone-500/25 text-stone-400"
                    }`}
                  >
                    {enq.status}
                  </span>
                  <h3 className="font-bold text-white text-base mt-2 flex items-center gap-2">
                    {enq.fullName}
                    {enq.age && (
                      <span className="text-xs font-normal text-soloz-ash/60">({enq.age} yrs • Blood: {enq.bloodGroup})</span>
                    )}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-2 text-xs text-soloz-ash/80 mt-3 bg-black/20 p-3 rounded-lg border border-white/5">
                    <div>
                      <span className="text-white/40 block mb-0.5 uppercase tracking-wider text-[9px]">Interested Destination</span>
                      <span className="text-soloz-amber font-semibold text-sm">{enq.destination || "General Enquiry"}</span>
                    </div>
                    <div>
                      <span className="text-white/40 block mb-0.5 uppercase tracking-wider text-[9px]">Email Address</span>
                      <span className="text-white font-medium text-sm select-all">{enq.email}</span>
                    </div>
                    <div>
                      <span className="text-white/40 block mb-0.5 uppercase tracking-wider text-[9px]">Mobile Number</span>
                      <span className="text-white font-medium text-sm select-all">{enq.mobile}</span>
                    </div>
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

              {/* Approved Details Block */}
              {enq.status === "approved" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mt-1 bg-emerald-950/15 p-4 rounded-lg border border-emerald-500/25">
                  <div>
                    <span className="text-emerald-400/60 block mb-0.5 uppercase tracking-wider text-[9px] font-bold">Approved Travelers</span>
                    <span className="text-white font-semibold text-sm">{enq.travelerNames || enq.fullName}</span>
                  </div>
                  <div>
                    <span className="text-emerald-400/60 block mb-0.5 uppercase tracking-wider text-[9px] font-bold">Price Points / Package Cost</span>
                    <span className="text-emerald-400 font-bold text-sm">{enq.pricePoints || "Contact for price"}</span>
                  </div>
                  {enq.approvalNotes && (
                    <div className="sm:col-span-2 pt-2 border-t border-white/5">
                      <span className="text-white/40 block mb-0.5 uppercase tracking-wider text-[9px]">Approval Notes</span>
                      <p className="text-white/80 italic text-[11px] leading-normal whitespace-pre-wrap">{enq.approvalNotes}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Bottom Row: Actions */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-white/5">
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="text-white/40 flex items-center mr-2">Change Status:</span>
                  <button
                    onClick={() => handleStatusChange(enq._id, "new")}
                    title="Mark lead as new/unread"
                    className={`px-3 py-1 rounded transition border ${
                      enq.status === "new" ? "bg-soloz-ember/20 border-soloz-ember text-soloz-amber font-bold" : "border-white/10 text-white/65 hover:bg-white/5"
                    }`}
                  >
                    New
                  </button>
                  <button
                    onClick={() => handleStatusChange(enq._id, "contacted")}
                    title="Mark as contacted (emails acknowledgement update to customer)"
                    className={`px-3 py-1 rounded transition border ${
                      enq.status === "contacted" ? "bg-blue-500/20 border-blue-500 text-blue-400 font-bold" : "border-white/10 text-white/65 hover:bg-white/5"
                    }`}
                  >
                    Contacted
                  </button>
                  <button
                    onClick={() => handleOpenApprovalModal(enq)}
                    title="Open form to approve booking, enter pricing and email receipt invoice"
                    className={`px-3 py-1 rounded transition border ${
                      enq.status === "approved" ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold" : "border-white/10 text-white/65 hover:bg-white/5"
                    }`}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleStatusChange(enq._id, "closed")}
                    title="Mark as closed (emails final closure notice to customer)"
                    className={`px-3 py-1 rounded transition border ${
                      enq.status === "closed" ? "bg-stone-500/20 border-stone-500 text-stone-400 font-bold" : "border-white/10 text-white/65 hover:bg-white/5"
                    }`}
                  >
                    Closed
                  </button>
                </div>

                <div className="flex gap-2 w-full sm:w-auto justify-end items-center">
                  <button
                    onClick={() => setSelectedEnquiry(enq)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#ea580c] px-4 py-2 hover:bg-[#ff7a1a] transition text-xs font-bold text-white shadow-sm"
                  >
                    View Details
                  </button>

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
      {/* Approval Form Modal */}
      {approvingEnquiry && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#14110d] p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setApprovingEnquiry(null)}
              className="absolute right-4 top-4 text-soloz-ash/60 hover:text-white transition-colors"
            >
              ✕
            </button>

            <div className="space-y-1">
              <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                <CheckCircle className="text-emerald-500" size={20} />
                Approve Enquiry & Send Details
              </h3>
              <p className="text-xs text-soloz-ash/60">
                Confirm travel parameters to approve {approvingEnquiry.fullName}'s booking for <strong>{approvingEnquiry.destination || "General Enquiry"}</strong>. Submitting this will automatically email the traveler pricing and inclusions.
              </p>
            </div>

            <form onSubmit={handleApproveSubmit} className="space-y-4 pt-2">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-soloz-ash/60 block font-semibold">
                  Approved Traveler Name(s)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul, Praneeth"
                  value={travelerNames}
                  onChange={(e) => setTravelerNames(e.target.value)}
                  className="h-10 w-full rounded-lg border border-white/10 bg-[#1a1712] px-3 text-sm text-white focus:border-emerald-500/50 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-soloz-ash/60 block font-semibold">
                  Price Points / Package Cost
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ₹4,999/- per head or Contact for pricing details"
                  value={pricePoints}
                  onChange={(e) => setPricePoints(e.target.value)}
                  className="h-10 w-full rounded-lg border border-white/10 bg-[#1a1712] px-3 text-sm text-white focus:border-emerald-500/50 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-soloz-ash/60 block font-semibold">
                  Additional Notes, Inclusions & Guidelines
                </label>
                <textarea
                  rows={4}
                  placeholder="e.g. Inclusions: transfers, guides, accommodations. Meeting details, checklist..."
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-[#1a1712] p-3 text-xs text-white focus:border-emerald-500/50 focus:outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setApprovingEnquiry(null)}
                  className="h-10 px-4 rounded-lg border border-white/10 text-xs font-semibold text-white hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingApproval}
                  className="h-10 px-5 rounded-lg bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-500 transition-colors inline-flex items-center gap-1.5"
                >
                  {submittingApproval ? (
                    <>
                      <Loader2 className="animate-spin" size={13} />
                      Approving & Emailing...
                    </>
                  ) : (
                    <>
                      <Check size={13} />
                      Approve & Email Details
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Enquiry Detail Modal */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#14110d] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl p-6 md:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-white/5 pb-4">
              <div>
                <span
                  className={`inline-block rounded px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                    selectedEnquiry.status === "new"
                      ? "bg-soloz-ember/15 border border-soloz-ember/25 text-soloz-amber"
                      : selectedEnquiry.status === "contacted"
                      ? "bg-blue-500/15 border border-blue-500/25 text-blue-400"
                      : selectedEnquiry.status === "approved"
                      ? "bg-emerald-500/15 border border-emerald-500/25 text-emerald-400"
                      : "bg-stone-500/15 border border-stone-500/25 text-stone-400"
                  }`}
                >
                  {selectedEnquiry.status}
                </span>
                <h2 className="font-display text-2xl font-bold text-white mt-2">Enquiry Details</h2>
              </div>
              <button
                onClick={() => setSelectedEnquiry(null)}
                className="text-stone-400 hover:text-white text-xl p-1 bg-white/5 hover:bg-white/10 rounded-lg transition"
              >
                ✕
              </button>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="space-y-1">
                <span className="text-white/40 block uppercase tracking-wider text-[9px]">Customer Name</span>
                <p className="text-white font-bold text-base">{selectedEnquiry.fullName}</p>
              </div>

              <div className="space-y-1">
                <span className="text-white/40 block uppercase tracking-wider text-[9px]">Age & Blood Group</span>
                <p className="text-white font-bold text-sm">
                  {selectedEnquiry.age ? `${selectedEnquiry.age} yrs` : "N/A"} • Blood: {selectedEnquiry.bloodGroup || "N/A"}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-white/40 block uppercase tracking-wider text-[9px]">Interested Destination</span>
                <p className="text-soloz-amber font-bold text-base">{selectedEnquiry.destination || "General Enquiry"}</p>
              </div>

              <div className="space-y-1">
                <span className="text-white/40 block uppercase tracking-wider text-[9px]">Email Address</span>
                <p className="text-white font-medium text-sm select-all">{selectedEnquiry.email}</p>
              </div>

              <div className="space-y-1">
                <span className="text-white/40 block uppercase tracking-wider text-[9px]">Mobile / WhatsApp</span>
                <p className="text-white font-medium text-sm select-all">{selectedEnquiry.mobile}</p>
              </div>

              <div className="space-y-1 md:col-span-2">
                <span className="text-white/40 block uppercase tracking-wider text-[9px]">Submitted On</span>
                <p className="text-white/70">{new Date(selectedEnquiry.createdAt).toLocaleString()}</p>
              </div>
            </div>

            {/* Approved details if status is approved */}
            {selectedEnquiry.status === "approved" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-emerald-950/15 p-4 rounded-xl border border-emerald-500/25">
                <div className="space-y-1">
                  <span className="text-emerald-400/60 block uppercase tracking-wider text-[9px] font-bold">Approved Travelers</span>
                  <p className="text-white font-bold text-sm">{selectedEnquiry.travelerNames || selectedEnquiry.fullName}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-emerald-400/60 block uppercase tracking-wider text-[9px] font-bold">Price Points / Package Cost</span>
                  <p className="text-emerald-400 font-bold text-sm">{selectedEnquiry.pricePoints || "Contact for price"}</p>
                </div>
                {selectedEnquiry.approvalNotes && (
                  <div className="space-y-1 md:col-span-2 pt-2 border-t border-white/5">
                    <span className="text-white/40 block uppercase tracking-wider text-[9px]">Approval Notes</span>
                    <p className="text-white/80 italic text-xs leading-relaxed whitespace-pre-wrap">{selectedEnquiry.approvalNotes}</p>
                  </div>
                )}
              </div>
            )}

            {/* Message Block */}
            <div className="space-y-2">
              <span className="text-white/40 block uppercase tracking-wider text-[9px]">Enquiry Message:</span>
              <div className="rounded-lg bg-black/40 p-4 border border-white/5 text-xs text-white/95 leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto">
                {selectedEnquiry.message}
              </div>
            </div>

            {/* Actions Panel */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-6 border-t border-white/5">
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="text-white/40 flex items-center mr-2">Change Status:</span>
                <button
                  onClick={async () => {
                    await handleStatusChange(selectedEnquiry._id, "new");
                    setSelectedEnquiry({ ...selectedEnquiry, status: "new" });
                  }}
                  title="Mark lead as new/unread"
                  className={`px-3 py-1 rounded transition border ${
                    selectedEnquiry.status === "new"
                      ? "bg-soloz-ember/20 border-soloz-ember text-soloz-amber font-bold"
                      : "border-white/10 text-white/65 hover:bg-white/5"
                  }`}
                >
                  New
                </button>
                <button
                  onClick={async () => {
                    await handleStatusChange(selectedEnquiry._id, "contacted");
                    setSelectedEnquiry({ ...selectedEnquiry, status: "contacted" });
                  }}
                  title="Mark as contacted (emails acknowledgement update to customer)"
                  className={`px-3 py-1 rounded transition border ${
                    selectedEnquiry.status === "contacted"
                      ? "bg-blue-500/20 border-blue-500 text-blue-400 font-bold"
                      : "border-white/10 text-white/65 hover:bg-white/5"
                  }`}
                >
                  Contacted
                </button>
                <button
                  onClick={() => {
                    handleOpenApprovalModal(selectedEnquiry);
                  }}
                  title="Open form to approve booking, enter pricing and email receipt invoice"
                  className={`px-3 py-1 rounded transition border ${
                    selectedEnquiry.status === "approved"
                      ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold"
                      : "border-white/10 text-white/65 hover:bg-white/5"
                  }`}
                >
                  Approve
                </button>
                <button
                  onClick={async () => {
                    await handleStatusChange(selectedEnquiry._id, "closed");
                    setSelectedEnquiry({ ...selectedEnquiry, status: "closed" });
                  }}
                  title="Mark as closed (emails final closure notice to customer)"
                  className={`px-3 py-1 rounded transition border ${
                    selectedEnquiry.status === "closed"
                      ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold"
                      : "border-white/10 text-white/65 hover:bg-white/5"
                  }`}
                >
                  Closed
                </button>
              </div>

              <div className="flex gap-2 w-full sm:w-auto justify-end">
                <a
                  href={`https://wa.me/${selectedEnquiry.mobile.replace(/[^\d]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-4 py-2 hover:bg-white/10 transition text-xs font-bold text-white"
                >
                  Chat WhatsApp <ExternalLink size={13} />
                </a>

                <button
                  onClick={async () => {
                    if (confirm("Are you sure you want to delete this enquiry? This action is permanent.")) {
                      await handleDelete(selectedEnquiry._id);
                      setSelectedEnquiry(null);
                    }
                  }}
                  className="grid size-9 place-items-center rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                  title="Delete lead"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
