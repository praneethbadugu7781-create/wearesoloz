"use client";

import { useEffect, useState } from "react";
import { MessageSquareQuote, Plus, Edit2, Trash2, Check, Loader2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CloudinaryUpload } from "@/components/cloudinary-upload";

interface TestimonialData {
  _id?: string;
  name: string;
  role: string;
  quote: string;
  image?: string;
  rating: number;
}

const emptyForm: TestimonialData = {
  name: "",
  role: "Traveler",
  quote: "",
  image: "",
  rating: 5
};

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<TestimonialData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState<"list" | "form">("list");
  const [formData, setFormData] = useState<TestimonialData>(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/testimonials");
      if (!res.ok) throw new Error("Failed to load reviews");
      const data = await res.json();
      setTestimonials(data);
    } catch (err) {
      console.error(err);
      alert("Error loading testimonials. Please make sure you are signed in.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: TestimonialData) => {
    setFormData(item);
    setEditId(item._id || null);
    setView("form");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this testimonial? This action is permanent.")) return;

    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete review");
      setTestimonials(testimonials.filter((t) => t._id !== id));
    } catch (err: any) {
      alert(err.message || "Error deleting review.");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = editId ? `/api/admin/testimonials/${editId}` : "/api/admin/testimonials";
      const method = editId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error("Failed to save testimonial");

      setView("list");
      setFormData(emptyForm);
      setEditId(null);
      fetchTestimonials();
    } catch (err: any) {
      alert(err.message || "Error saving review.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-white flex items-center gap-2">
            <MessageSquareQuote className="text-soloz-ember" size={28} />
            Manage Testimonials
          </h1>
          <p className="text-xs text-soloz-ash/75 mt-1">Configure traveler reviews appearing on the homepage.</p>
        </div>

        {view === "list" ? (
          <Button onClick={() => { setFormData(emptyForm); setEditId(null); setView("form"); }} className="pt-0.5">
            <Plus size={16} className="mr-2" /> Add Testimonial
          </Button>
        ) : (
          <Button onClick={() => setView("list")} variant="secondary" className="pt-0.5">
            Cancel Edit
          </Button>
        )}
      </div>

      {view === "list" ? (
        loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-soloz-ash/60">
            <Loader2 className="animate-spin text-soloz-ember mb-3" size={32} />
            <p className="text-xs">Fetching reviews...</p>
          </div>
        ) : testimonials.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 p-12 text-center text-soloz-ash/60">
            No testimonials configured. Click "Add Testimonial" or seed the database.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((item) => (
              <div
                key={item._id}
                className="rounded-xl border border-white/10 bg-[#14110d] p-6 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Rating */}
                  <div className="flex gap-1 text-soloz-amber">
                    {Array.from({ length: item.rating }).map((_, i) => (
                      <Star key={i} size={13} fill="currentColor" />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-xs italic leading-relaxed text-soloz-ash/90">"{item.quote}"</p>

                  {/* Profile */}
                  <div className="flex items-center gap-3 pt-2">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="size-9 rounded-full object-cover" />
                    ) : (
                      <div className="grid size-9 place-items-center rounded-full bg-soloz-ember/15 text-[10px] font-bold text-soloz-ember border border-soloz-ember/25">
                        {item.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                    )}
                    <div>
                      <h4 className="text-xs font-bold text-white leading-none">{item.name}</h4>
                      <span className="text-[10px] text-white/40 block mt-1">{item.role}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-4 mt-6 flex justify-end gap-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="grid size-8 place-items-center rounded bg-white/5 border border-white/10 text-white hover:bg-white/10"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(item._id!)}
                    className="grid size-8 place-items-center rounded bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* EDIT / CREATE FORM */
        <form onSubmit={handleSave} className="rounded-xl border border-white/10 bg-[#14110d] p-6 sm:p-8 space-y-6 max-w-2xl">
          <h3 className="font-display text-xl font-bold text-white border-b border-white/5 pb-3">
            {editId ? "Edit Review Details" : "Add Testimonial"}
          </h3>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-soloz-ash/60 block mb-1">Traveler Name</label>
              <input
                type="text"
                required
                placeholder="Priya Sharma"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-soloz-ember/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-soloz-ash/60 block mb-1">Role / Subtitle</label>
              <input
                type="text"
                required
                placeholder="Solo trekker"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-soloz-ember/50 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-soloz-ash/60 block mb-1">Rating Stars</label>
              <select
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) || 5 })}
                className="h-10 w-full rounded-lg border border-white/10 bg-[#14110d] px-3 text-sm text-white focus:border-soloz-ember/50 focus:outline-none"
              >
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider text-soloz-ash/60 block mb-1">Traveler Quote / Feedback</label>
            <textarea
              required
              rows={4}
              placeholder="I joined alone and felt included from the first call. The trip had the right mix of freedom and care..."
              value={formData.quote}
              onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white focus:border-soloz-ember/50 focus:outline-none resize-none"
            />
          </div>

          <div className="max-w-md">
            <CloudinaryUpload
              value={formData.image || ""}
              onChange={(url) => setFormData({ ...formData, image: url })}
              label="Traveler Photo (Optional)"
            />
          </div>

          <div className="pt-6 border-t border-white/5 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setView("list")} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={15} /> Saving...
                </>
              ) : (
                <>
                  <Check className="mr-2" size={15} /> Save Testimonial
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </main>
  );
}
