"use client";
import { getAuthHeaders } from "@/lib/api";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

import { useEffect, useState } from "react";
import { Image as ImageIcon, Plus, Edit2, Trash2, Check, Loader2, UploadCloud, X, FileImage } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CloudinaryUpload } from "@/components/cloudinary-upload";

interface GalleryData {
  _id?: string;
  title: string;
  category: string;
  image: string;
  alt?: string;
}

interface BulkItem {
  id: string;
  file: File;
  title: string;
  url: string;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
}

const emptyForm: GalleryData = {
  title: "",
  category: "Treks",
  image: "",
  alt: ""
};

const categories = ["Treks", "Spiritual Tours", "Road Trips", "Community Events", "Hidden Destinations"];

const cleanFilenameToTitle = (filename: string) => {
  const nameWithoutExtension = filename.substring(0, filename.lastIndexOf(".")) || filename;
  return nameWithoutExtension
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
};

const uploadSingleFile = async (
  file: File,
  onProgress: (percent: number) => void
): Promise<string> => {
  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
  const sigRes = await fetch(`${API_URL}/admin/upload/signature`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!sigRes.ok) {
    throw new Error("Failed to get upload signature. Make sure you are logged in.");
  }
  const { signature, timestamp, apiKey, cloudName, folder } = await sigRes.json();

  const formData = new FormData();
  formData.append("file", file);
  formData.append("signature", signature);
  formData.append("timestamp", timestamp.toString());
  formData.append("api_key", apiKey);
  formData.append("folder", folder);

  const xhr = new XMLHttpRequest();
  xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);

  xhr.upload.onprogress = (event) => {
    if (event.lengthComputable) {
      const percent = Math.round((event.loaded / event.total) * 100);
      onProgress(percent);
    }
  };

  return new Promise<string>((resolve, reject) => {
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const response = JSON.parse(xhr.responseText);
        resolve(response.secure_url);
      } else {
        reject(new Error("Cloudinary upload failed"));
      }
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(formData);
  });
};

export default function AdminGalleryPage() {
  const [gallery, setGallery] = useState<GalleryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState<"list" | "form">("list");
  const [formData, setFormData] = useState<GalleryData>(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);

  // Bulk Upload States
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkCategory, setBulkCategory] = useState("Treks");
  const [bulkQueue, setBulkQueue] = useState<BulkItem[]>([]);

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
    setBulkMode(false); // Can only edit one at a time
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

  // Bulk Upload Handlers
  const handleBulkFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newItems: BulkItem[] = files.map((file, index) => {
      const id = `${file.name}-${Date.now()}-${index}`;
      const title = cleanFilenameToTitle(file.name);
      return {
        id,
        file,
        title,
        url: "",
        progress: 0,
        status: "pending",
      };
    });

    setBulkQueue((prev) => [...prev, ...newItems]);

    // Start upload trigger for each file in parallel
    newItems.forEach((item) => {
      uploadQueueItem(item);
    });
  };

  const uploadQueueItem = async (item: BulkItem) => {
    updateQueueItemStatus(item.id, { status: "uploading", progress: 0 });
    try {
      const url = await uploadSingleFile(item.file, (progress) => {
        updateQueueItemStatus(item.id, { progress });
      });
      updateQueueItemStatus(item.id, { status: "success", url, progress: 100 });
    } catch (err: any) {
      updateQueueItemStatus(item.id, { status: "error", error: err.message || "Upload failed" });
    }
  };

  const updateQueueItemStatus = (id: string, updates: Partial<BulkItem>) => {
    setBulkQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const handleRemoveQueueItem = (id: string) => {
    setBulkQueue((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateQueueItemTitle = (id: string, title: string) => {
    setBulkQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, title } : item))
    );
  };

  const handleBulkSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const successfulItems = bulkQueue.filter((item) => item.status === "success" && item.url);
    if (successfulItems.length === 0) {
      alert("No successfully uploaded images to save.");
      return;
    }

    setSaving(true);
    try {
      const payload = successfulItems.map((item) => ({
        title: item.title || "Untitled",
        category: bulkCategory,
        image: item.url,
        alt: "",
      }));

      const res = await fetch(`${API_URL}/admin/gallery`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save bulk gallery items");

      setView("list");
      setBulkQueue([]);
      fetchGallery();
    } catch (err: any) {
      alert(err.message || "Error saving items.");
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
          <Button onClick={() => { setFormData(emptyForm); setEditId(null); setBulkMode(false); setView("form"); }} className="pt-0.5">
            <Plus size={16} className="mr-2" /> Add Image
          </Button>
        ) : (
          <Button onClick={() => setView("list")} variant="secondary" className="pt-0.5">
            Cancel
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
      ) : bulkMode && !editId ? (
        /* BULK UPLOAD FORM */
        <form onSubmit={handleBulkSave} className="rounded-xl border border-white/10 bg-[#14110d] p-6 sm:p-8 space-y-6 max-w-2xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-3">
            <h3 className="font-display text-xl font-bold text-white">
              Bulk Add Gallery Images
            </h3>
            {/* Global Category for all files in this batch */}
            <div className="flex items-center gap-2">
              <label className="text-[10px] uppercase tracking-wider text-soloz-ash/60 whitespace-nowrap">Global Category:</label>
              <select
                value={bulkCategory}
                onChange={(e) => setBulkCategory(e.target.value)}
                className="h-8 rounded border border-white/10 bg-[#14110d] px-2 text-xs text-white focus:border-soloz-ember/50 focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex border-b border-white/5 pb-1 gap-4">
            <button
              type="button"
              onClick={() => setBulkMode(false)}
              className="text-xs uppercase tracking-wider pb-2 font-semibold transition text-soloz-ash/60 hover:text-white"
            >
              Single Upload
            </button>
            <button
              type="button"
              onClick={() => setBulkMode(true)}
              className="text-xs uppercase tracking-wider pb-2 font-semibold transition text-soloz-ember border-b-2 border-soloz-ember"
            >
              Bulk Upload
            </button>
          </div>

          {/* Bulk File Input / Dropzone */}
          <div
            onClick={() => document.getElementById("bulk-file-input")?.click()}
            className="flex aspect-[21/9] w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/20 bg-white/5 p-6 hover:border-soloz-ember/50 hover:bg-white/10 transition"
          >
            <UploadCloud className="text-soloz-ember mb-2" size={32} />
            <p className="text-sm font-medium text-soloz-ash">Click to select multiple images</p>
            <p className="text-xs text-white/40">PNG, JPG, WEBP, or GIF</p>
            <input
              type="file"
              id="bulk-file-input"
              onChange={handleBulkFileChange}
              multiple
              accept="image/*"
              className="hidden"
            />
          </div>

          {/* Queue List */}
          {bulkQueue.length > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase tracking-wider text-soloz-ash/60">
                  Upload Queue ({bulkQueue.filter(q => q.status === "success").length} / {bulkQueue.length} done)
                </span>
                <button
                  type="button"
                  onClick={() => setBulkQueue([])}
                  className="text-[10px] text-red-400 hover:underline"
                >
                  Clear Queue
                </button>
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {bulkQueue.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-lg bg-white/5 border border-white/5 flex gap-4 items-start relative group"
                  >
                    {/* Thumbnail or Icon */}
                    <div className="relative size-16 rounded overflow-hidden bg-black/40 shrink-0 border border-white/10">
                      {item.url ? (
                        <img src={item.url} alt={item.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-soloz-ash/40">
                          <FileImage size={24} />
                        </div>
                      )}
                    </div>

                    {/* Title & Progress */}
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => handleUpdateQueueItemTitle(item.id, e.target.value)}
                        placeholder="Enter image title"
                        className="h-8 w-full rounded border border-white/10 bg-white/5 px-2 text-xs text-white focus:border-soloz-ember/50 focus:outline-none"
                        required
                      />

                      {/* Progress bar / Status */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-white/10">
                          <div
                            className={`h-full transition-all duration-150 ${
                              item.status === "error"
                                ? "bg-red-500"
                                : item.status === "success"
                                ? "bg-emerald-500"
                                : "bg-soloz-ember"
                            }`}
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-soloz-ash/80">
                          {item.status === "uploading" && `${item.progress}%`}
                          {item.status === "success" && "Uploaded"}
                          {item.status === "error" && "Failed"}
                          {item.status === "pending" && "Queued"}
                        </span>
                      </div>
                    </div>

                    {/* Remove Action Button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveQueueItem(item.id)}
                      className="text-soloz-ash/40 hover:text-red-400 absolute top-2 right-2 p-1"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-6 border-t border-white/5 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setView("list")} disabled={saving}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving || bulkQueue.length === 0 || bulkQueue.some((q) => q.status === "uploading" || q.status === "pending")}
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={15} /> Saving...
                </>
              ) : (
                <>
                  <Check className="mr-2" size={15} /> Save All ({bulkQueue.filter(q => q.status === "success").length} Images)
                </>
              )}
            </Button>
          </div>
        </form>
      ) : (
        /* SINGLE IMAGE EDIT / CREATE FORM */
        <form onSubmit={handleSave} className="rounded-xl border border-white/10 bg-[#14110d] p-6 sm:p-8 space-y-6 max-w-2xl">
          <h3 className="font-display text-xl font-bold text-white border-b border-white/5 pb-3">
            {editId ? "Edit Image Details" : "Add Gallery Image"}
          </h3>

          {!editId && (
            <div className="flex border-b border-white/5 pb-1 gap-4">
              <button
                type="button"
                onClick={() => setBulkMode(false)}
                className="text-xs uppercase tracking-wider pb-2 font-semibold transition text-soloz-ember border-b-2 border-soloz-ember"
              >
                Single Upload
              </button>
              <button
                type="button"
                onClick={() => setBulkMode(true)}
                className="text-xs uppercase tracking-wider pb-2 font-semibold transition text-soloz-ash/60 hover:text-white"
              >
                Bulk Upload
              </button>
            </div>
          )}

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

