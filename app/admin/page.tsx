import { connectDB } from "@/lib/db";
import Trip from "@/models/Trip";
import Destination from "@/models/Destination";
import Blog from "@/models/Blog";
import Gallery from "@/models/Gallery";
import Testimonial from "@/models/Testimonial";
import Contact from "@/models/Contact";
import Link from "next/link";
import { Compass, MapPin, BookOpen, Image as ImageIcon, MessageSquareQuote, MailQuestion, Check, AlertCircle } from "lucide-react";
import { SeedButton } from "@/components/seed-button";

async function getAnalytics() {
  try {
    await connectDB();
    const tripsCount = await Trip.countDocuments();
    const destsCount = await Destination.countDocuments();
    const blogsCount = await Blog.countDocuments();
    const galleryCount = await Gallery.countDocuments();
    const testimonialsCount = await Testimonial.countDocuments();
    const enquiriesCount = await Contact.countDocuments();

    const recentEnquiries = await Contact.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    return {
      stats: [
        { label: "Trips", value: tripsCount, icon: Compass, color: "text-soloz-ember bg-soloz-ember/15 border-soloz-ember/20" },
        { label: "Destinations", value: destsCount, icon: MapPin, color: "text-soloz-amber bg-soloz-amber/15 border-soloz-amber/20" },
        { label: "Stories (Blogs)", value: blogsCount, icon: BookOpen, color: "text-soloz-gold bg-soloz-gold/15 border-soloz-gold/20" },
        { label: "Gallery", value: galleryCount, icon: ImageIcon, color: "text-emerald-400 bg-emerald-500/15 border-emerald-500/20" },
        { label: "Testimonials", value: testimonialsCount, icon: MessageSquareQuote, color: "text-sky-400 bg-sky-500/15 border-sky-500/20" },
        { label: "Enquiries", value: enquiriesCount, icon: MailQuestion, color: "text-violet-400 bg-violet-500/15 border-violet-500/20" }
      ],
      recentEnquiries: JSON.parse(JSON.stringify(recentEnquiries)),
      isEmpty: tripsCount === 0 && destsCount === 0 && blogsCount === 0
    };
  } catch (error) {
    console.error("Failed to gather analytics:", error);
    return {
      stats: [],
      recentEnquiries: [],
      isEmpty: true
    };
  }
}

export default async function AdminDashboardPage() {
  const { stats, recentEnquiries, isEmpty } = await getAnalytics();

  return (
    <main className="space-y-10">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Dashboard Overview</h1>
          <p className="text-xs text-soloz-ash/70 mt-1">Real-time statistics and administrative health.</p>
        </div>

        <div className="flex items-center gap-3">
          {isEmpty && (
            <div className="flex items-center gap-2 rounded-lg bg-orange-500/10 border border-orange-500/20 px-3.5 py-1.5 text-xs text-soloz-amber">
              <AlertCircle size={14} /> Database is empty. Use Seeder:
            </div>
          )}
          <SeedButton />
        </div>
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
