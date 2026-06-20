"use client";
import { getAuthHeaders } from "@/lib/api";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

import { useEffect, useState, useRef } from "react";
import { Video as VideoIcon, Plus, Edit2, Trash2, Check, Loader2, UploadCloud, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReelData {
  _id?: string;
  title: string;
  video: string;
  caption?: string;
  category?: string;
}

const emptyForm: ReelData = {
  title: "",
  video: "",
  caption: "",
  category: ""
};

const cleanFilenameToTitle = (filename: string) => {
  const nameWithoutExtension = filename.substring(0, filename.lastIndexOf(".")) || filename;
  return nameWithoutExtension
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
};

export default function AdminReelsPage() {
  const [reels, setReels] = useState<ReelData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [view, setView] = useState<"list" | "form">("list");
  const [formData, setFormData] = useState<ReelData>(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchReels();
  }, []);

  const fetchReels = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/reels`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error("Failed to load reels");
      const data = await res.json();
      setReels(data);
    } catch (err) {
      console.error(err);
      alert("Error loading reels. Please make sure you are signed in.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: ReelData) => {
    setFormData(item);
    setEditId(item._id || null);
    setView("form");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this reel? This action is permanent.")) return;

    try {
      const res = await fetch(`${API_URL}/admin/reels/${id}`, { method: "DELETE", headers: getAuthHeaders() });
      if (!res.ok) throw new Error("Failed to delete reel");
      setReels(reels.filter((r) => r._id !== id));
    } catch (err: any) {
      alert(err.message || "Error deleting reel.");
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      // 1. Get signed configuration from our backend API
      const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
      const sigRes = await fetch(`${API_URL}/admin/upload/signature`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!sigRes.ok) {
        throw new Error("Failed to get upload signature. Make sure you are logged in.");
      }
      const { signature, timestamp, apiKey, cloudName, folder } = await sigRes.json();

      // 2. Build FormData
      const formDataPayload = new FormData();
      formDataPayload.append("file", file);
      formDataPayload.append("signature", signature);
      formDataPayload.append("timestamp", timestamp.toString());
      formDataPayload.append("api_key", apiKey);
      formDataPayload.append("folder", folder);

      // 3. Upload to Cloudinary with progress
      const xhr = new XMLHttpRequest();
      // Note the endpoint is for videos: /video/upload
      xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percent);
        }
      };

      const uploadPromise = new Promise<string>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const response = JSON.parse(xhr.responseText);
            resolve(response.secure_url);
          } else {
            reject(new Error("Cloudinary video upload failed"));
          }
        };
        xhr.onerror = () => reject(new Error("XHR Network error during video upload"));
      });

      xhr.send(formDataPayload);

      const uploadedUrl = await uploadPromise;
      setFormData((prev) => ({
        ...prev,
        video: uploadedUrl,
        title: prev.title || cleanFilenameToTitle(file.name)
      }));
    } catch (error: any) {
      alert(error.message || "Failed to upload video. Please try again.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.video) {
      alert("Please upload a video first.");
      return;
    }

    setSaving(true);
    try {
      const url = editId ? `${API_URL}/admin/reels/${editId}` : `${API_URL}/admin/reels`;
      const method = editId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error("Failed to save reel");

      setView("list");
      setFormData(emptyForm);
      setEditId(null);
      fetchReels();
    } catch (err: any) {
      alert(err.message || "Error saving reel.");
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
            <VideoIcon className="text-soloz-ember" size={28} />
            Manage Travel Reels
          </h1>
          <p className="text-xs text-soloz-ash/75 mt-1">Upload 9:16 portrait video files that loop continuously on the homepage.</p>
        </div>

        {view === "list" ? (
          <Button onClick={() => { setFormData(emptyForm); setEditId(null); setView("form"); }} className="pt-0.5">
            <Plus size={16} className="mr-2" /> Add Reel Video
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
            <p className="text-xs">Fetching reels...</p>
          </div>
        ) : reels.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 p-12 text-center text-soloz-ash/60">
            No reels configured. Click "Add Reel Video" to upload your first clip.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {reels.map((item) => (
              <div
                key={item._id}
                className="rounded-xl border border-white/10 bg-[#14110d] overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-[9/16] w-full bg-black/40">
                    <video src={item.video} className="h-full w-full object-cover" muted loop playsInline autoPlay />
                    {item.category && (
                      <span className="absolute left-3 top-3 rounded bg-black/60 px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
                        {item.category}
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-base font-bold text-white leading-tight">{item.title}</h3>
                    {item.caption && <p className="text-[10px] text-soloz-ash/60 mt-1">{item.caption}</p>}
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
            {editId ? "Edit Reel Details" : "Upload Reel Video"}
          </h3>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-soloz-ash/60 block mb-1">Reel Title</label>
              <input
                type="text"
                required
                placeholder="Kedarnath Sunrise"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-soloz-ember/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-soloz-ash/60 block mb-1">Category (Optional)</label>
              <input
                type="text"
                placeholder="Treks, Road Trips, etc."
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-soloz-ember/50 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider text-soloz-ash/60 block mb-1">Caption (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Sunrise view above the clouds"
              value={formData.caption}
              onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
              className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-soloz-ember/50 focus:outline-none"
            />
          </div>

          <div className="max-w-md space-y-2">
            <label className="text-sm font-semibold uppercase tracking-wider text-soloz-ash block">Video File (9:16 portrait recommended)</label>
            {formData.video ? (
              <div className="relative aspect-[9/16] w-64 overflow-hidden rounded-xl border border-white/10 bg-black/45">
                <video src={formData.video} className="h-full w-full object-cover" controls loop playsInline muted />
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, video: "" }))}
                  className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 hover:text-soloz-ember transition"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex aspect-video w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/20 bg-white/5 p-6 hover:border-soloz-ember/50 hover:bg-white/10 transition"
              >
                {uploading ? (
                  <div className="flex flex-col items-center gap-2 text-center text-soloz-ash">
                    <Loader2 className="animate-spin text-soloz-ember" size={36} />
                    <p className="text-sm font-medium">Uploading video... {uploadProgress}%</p>
                    <div className="h-1.5 w-48 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full bg-soloz-ember transition-all duration-150" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-center text-soloz-ash">
                    <UploadCloud className="text-soloz-ember" size={36} />
                    <p className="text-sm font-medium">Click to select MP4 or WebM video file</p>
                    <p className="text-xs text-white/40">Direct upload to Cloudinary</p>
                  </div>
                )}
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleVideoUpload}
              accept="video/*"
              className="hidden"
              disabled={uploading}
            />
          </div>

          <div className="pt-6 border-t border-white/5 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setView("list")} disabled={saving || uploading}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || uploading || !formData.video}>
              {saving ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={15} /> Saving...
                </>
              ) : (
                <>
                  <Check className="mr-2" size={15} /> Save Reel
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </main>
  );
}
