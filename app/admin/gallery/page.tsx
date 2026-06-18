"use client";
import { getAuthHeaders } from "@/lib/api";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

import { useEffect, useState } from "react";
import { Image as ImageIcon, Plus, Edit2, Trash2, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CloudinaryUpload } from "@/components/cloudinary-upload";

interface GalleryData {
  _id?: string;
  title: string;
  category: string;
  image: string;
  alt?: string;
}

const emptyForm: GalleryData = {
  title: "",
  category: "Treks",
  image: "",
  alt: ""
};

const categories = ["Treks", "Spiritual Tours", "Road Trips", "Community Events", "Hidden Destinations"];

export default function AdminGalleryPage() {
  const [gallery, setGallery] = useState<GalleryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState<"list" | "form">("list");
  const [formData, setFormData] = useState<GalleryData>(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/gallery`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error("Failed to load gallery");
      const data = await res.json();
      setGallery(data);
    } catch (err) {
      console.error(err);
      alert("Error loading gallery. Please make sure you are signed in.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: GalleryData) => {
    setFormData(item);
    setEditId(item._id || null);
    setView("form");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this gallery item? This action is permanent.")) return;

    try {
      const res = await fetch(`${API_URL}/admin/gallery/${id}`, { method: "DELETE", headers: getAuthHeaders() });
      if (!res.ok) throw new Error("Failed to delete item");
      setGallery(gallery.filter((g) => g._id !== id));
    } catch (err: any) {
      alert(err.message || "Error deleting item.");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image) {
      alert("Please upload an image first.");
      return;
    }

    setSaving(true);
    try {
      const url = editId ? `${API_URL}/admin/gallery/${editId}` : `${API_URL}/admin/gallery`;
      const method = editId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error("Failed to save gallery item");

      setView("list");
      setFormData(emptyForm);
      setEditId(null);
      fetchGallery();
    } catch (err: any) {
      alert(err.message || "Error saving item.");
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
            <ImageIcon className="text-soloz-ember" size={28} />
            Manage Travel Gallery
          </h1>
          <p className="text-xs text-soloz-ash/75 mt-1">Configure images showing up in the filterable public archives.</p>
        </div>

        {view === "list" ? (
          <Button onClick={() => { setFormData(emptyForm); setEditId(null); setView("form"); }} className="pt-0.5">
            <Plus size={16} className="mr-2" /> Add Image
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
            <p className="text-xs">Fetching gallery...</p>
          </div>
        ) : gallery.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 p-12 text-center text-soloz-ash/60">
            No gallery items configured. Click "Add Image" or seed the database.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {gallery.map((item) => (
              <div
                key={item._id}
                className="rounded-xl border border-white/10 bg-[#14110d] overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-[4/3] w-full">
                    <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                    <span className="absolute left-3 top-3 rounded bg-black/60 px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
                      {item.category}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-base font-bold text-white leading-tight">{item.title}</h3>
                    {item.alt && <p className="text-[10px] text-soloz-ash/60 mt-1">Alt: {item.alt}</p>}
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-white/5 mt-4 flex justify-end gap-2">
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
            {editId ? "Edit Image Details" : "Add Gallery Image"}
          </h3>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-soloz-ash/60 block mb-1">Image Title</label>
              <input
                type="text"
                required
                placeholder="Kedarnath Ridge Trekking"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-soloz-ember/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-soloz-ash/60 block mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="h-10 w-full rounded-lg border border-white/10 bg-[#14110d] px-3 text-sm text-white focus:border-soloz-ember/50 focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider text-soloz-ash/60 block mb-1">Alt description (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Travellers hiking up snowy trail on sunrise"
              value={formData.alt}
              onChange={(e) => setFormData({ ...formData, alt: e.target.value })}
              className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-soloz-ember/50 focus:outline-none"
            />
          </div>

          <div className="max-w-md">
            <CloudinaryUpload
              value={formData.image}
              onChange={(url) => setFormData({ ...formData, image: url })}
              label="Select Image"
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
                  <Check className="mr-2" size={15} /> Save Gallery Item
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </main>
  );
}
