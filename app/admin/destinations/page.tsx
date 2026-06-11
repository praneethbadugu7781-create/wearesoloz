"use client";

import { useEffect, useState } from "react";
import { MapPin, Plus, Edit2, Trash2, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CloudinaryUpload } from "@/components/cloudinary-upload";

interface DestinationData {
  _id?: string;
  title: string;
  slug: string;
  location: string;
  description: string;
  image: string;
  featured: boolean;
}

const emptyForm: DestinationData = {
  title: "",
  slug: "",
  location: "",
  description: "",
  image: "",
  featured: true
};

export default function AdminDestinationsPage() {
  const [destinations, setDestinations] = useState<DestinationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState<"list" | "form">("list");
  const [formData, setFormData] = useState<DestinationData>(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    fetchDestinations();
  }, []);

  const fetchDestinations = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/destinations");
      if (!res.ok) throw new Error("Failed to load destinations");
      const data = await res.json();
      setDestinations(data);
    } catch (err) {
      console.error(err);
      alert("Error loading destinations. Please make sure you are signed in.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (dest: DestinationData) => {
    setFormData(dest);
    setEditId(dest._id || null);
    setView("form");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this destination? This action is permanent.")) return;

    try {
      const res = await fetch(`/api/admin/destinations/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete destination");
      setDestinations(destinations.filter((d) => d._id !== id));
    } catch (err: any) {
      alert(err.message || "Error deleting destination.");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image) {
      alert("Please upload a cover image first.");
      return;
    }

    setSaving(true);
    try {
      const url = editId ? `/api/admin/destinations/${editId}` : "/api/admin/destinations";
      const method = editId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error("Failed to save destination settings");

      setView("list");
      setFormData(emptyForm);
      setEditId(null);
      fetchDestinations();
    } catch (err: any) {
      alert(err.message || "Error saving destination.");
    } finally {
      setSaving(false);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const generatedSlug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    setFormData({
      ...formData,
      title,
      slug: generatedSlug
    });
  };

  return (
    <main className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-white flex items-center gap-2">
            <MapPin className="text-soloz-ember" size={28} />
            Manage Destinations
          </h1>
          <p className="text-xs text-soloz-ash/75 mt-1">Configure the main destinations that appear on the homepage.</p>
        </div>

        {view === "list" ? (
          <Button onClick={() => { setFormData(emptyForm); setEditId(null); setView("form"); }} className="pt-0.5">
            <Plus size={16} className="mr-2" /> Add Destination
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
            <p className="text-xs">Fetching destinations...</p>
          </div>
        ) : destinations.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 p-12 text-center text-soloz-ash/60">
            No destinations configured. Click "Add Destination" or seed the database.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {destinations.map((dest) => (
              <div
                key={dest._id}
                className="rounded-xl border border-white/10 bg-[#14110d] overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-video w-full">
                    <img src={dest.image} alt={dest.title} className="h-full w-full object-cover" />
                  </div>
                  <div className="p-5 space-y-2">
                    <div className="flex items-center gap-1 text-xs text-soloz-amber font-semibold uppercase tracking-wider">
                      <MapPin size={11} className="text-soloz-ember" />
                      {dest.location}
                    </div>
                    <h3 className="font-display text-lg font-bold text-white leading-tight">{dest.title}</h3>
                    <p className="text-xs text-soloz-ash/75 line-clamp-2 leading-relaxed">{dest.description}</p>
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-white/5 mt-4 flex items-center justify-between">
                  <span className="text-[10px] text-soloz-ash/50 font-bold uppercase tracking-wider">
                    {dest.featured ? "★ Featured" : "Standard"}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(dest)}
                      className="grid size-8 place-items-center rounded bg-white/5 border border-white/10 text-white hover:bg-white/10"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(dest._id!)}
                      className="grid size-8 place-items-center rounded bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* EDIT / CREATE FORM */
        <form onSubmit={handleSave} className="rounded-xl border border-white/10 bg-[#14110d] p-6 sm:p-8 space-y-6 max-w-2xl">
          <h3 className="font-display text-xl font-bold text-white border-b border-white/5 pb-3">
            {editId ? "Edit Destination Details" : "Add New Destination"}
          </h3>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-soloz-ash/60 block mb-1">Destination Name</label>
              <input
                type="text"
                required
                placeholder="Kedarnath"
                value={formData.title}
                onChange={handleTitleChange}
                className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-soloz-ember/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-soloz-ash/60 block mb-1">URL Slug</label>
              <input
                type="text"
                required
                disabled
                placeholder="kedarnath"
                value={formData.slug}
                className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white/40 focus:outline-none cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider text-soloz-ash/60 block mb-1">Location / Region</label>
            <input
              type="text"
              required
              placeholder="Uttarakhand"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-soloz-ember/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider text-soloz-ash/60 block mb-1">Short Description</label>
            <textarea
              required
              rows={3}
              placeholder="A soul-stirring Himalayan pilgrimage wrapped in snow peaks, stories, and sunrise trails..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white focus:border-soloz-ember/50 focus:outline-none resize-none"
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <CloudinaryUpload
              value={formData.image}
              onChange={(url) => setFormData({ ...formData, image: url })}
              label="Cover Image"
            />

            <div className="space-y-4">
              <label className="text-[10px] uppercase tracking-wider text-soloz-ash/60 block">Publish Settings</label>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="size-4 accent-soloz-ember"
                />
                Show on homepage (Featured)
              </label>
            </div>
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
                  <Check className="mr-2" size={15} /> Save Destination
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </main>
  );
}
