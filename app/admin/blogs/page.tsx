"use client";

import { useEffect, useState } from "react";
import { BookOpen, Plus, Edit2, Trash2, Check, Loader2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CloudinaryUpload } from "@/components/cloudinary-upload";

interface BlogData {
  _id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  image: string;
  readTime: string;
  featured: boolean;
  status: "draft" | "published";
}

const emptyForm: BlogData = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  category: "Treks",
  image: "",
  readTime: "5 min read",
  featured: false,
  status: "published"
};

const categories = ["Spiritual Travel", "Hidden Destinations", "Treks", "Community"];

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<BlogData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState<"list" | "form">("list");
  const [formTab, setFormTab] = useState<"edit" | "preview">("edit");
  const [formData, setFormData] = useState<BlogData>(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/blogs");
      if (!res.ok) throw new Error("Failed to load travel stories");
      const data = await res.json();
      setBlogs(data);
    } catch (err) {
      console.error(err);
      alert("Error loading blogs. Please make sure you are signed in.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (blog: BlogData) => {
    setFormData(blog);
    setEditId(blog._id || null);
    setView("form");
    setFormTab("edit");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this story? This action is permanent.")) return;

    try {
      const res = await fetch(`/api/admin/blogs/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete story");
      setBlogs(blogs.filter((b) => b._id !== id));
    } catch (err: any) {
      alert(err.message || "Error deleting story.");
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
      const url = editId ? `/api/admin/blogs/${editId}` : "/api/admin/blogs";
      const method = editId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error("Failed to save story");

      setView("list");
      setFormData(emptyForm);
      setEditId(null);
      fetchBlogs();
    } catch (err: any) {
      alert(err.message || "Error saving story.");
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
            <BookOpen className="text-soloz-ember" size={28} />
            Manage Travel Stories
          </h1>
          <p className="text-xs text-soloz-ash/75 mt-1">Write mountain guides, spiritual reflections, and travel logs.</p>
        </div>

        {view === "list" ? (
          <Button onClick={() => { setFormData(emptyForm); setEditId(null); setView("form"); }} className="pt-0.5">
            <Plus size={16} className="mr-2" /> Write New Story
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
            <p className="text-xs">Fetching travel stories...</p>
          </div>
        ) : blogs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 p-12 text-center text-soloz-ash/60">
            No travel stories written. Click "Write New Story" or seed the database.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog) => (
              <div
                key={blog._id}
                className="rounded-xl border border-white/10 bg-[#14110d] overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-video w-full">
                    <img src={blog.image} alt={blog.title} className="h-full w-full object-cover" />
                    <span className="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-0.5 text-[10px] font-bold text-white backdrop-blur">
                      {blog.category}
                    </span>
                  </div>
                  <div className="p-5 space-y-3">
                    <h3 className="font-display text-lg font-bold text-white leading-tight line-clamp-2">{blog.title}</h3>
                    <p className="text-xs text-soloz-ash/75 line-clamp-2 leading-relaxed">{blog.excerpt}</p>
                    <div className="flex items-center gap-1.5 text-[10px] text-white/40">
                      <Clock size={11} /> {blog.readTime}
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-white/5 mt-4 flex items-center justify-between">
                  <span className="text-[10px] text-soloz-ash/50 font-bold uppercase tracking-wider">
                    {blog.status}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(blog)}
                      className="grid size-8 place-items-center rounded bg-white/5 border border-white/10 text-white hover:bg-white/10"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(blog._id!)}
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
        <form onSubmit={handleSave} className="rounded-xl border border-white/10 bg-[#14110d] p-6 sm:p-8 space-y-6 max-w-4xl">
          <h3 className="font-display text-xl font-bold text-white border-b border-white/5 pb-3">
            {editId ? "Edit Travel Log" : "Write New Story"}
          </h3>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-soloz-ash/60 block mb-1">Story Title</label>
              <input
                type="text"
                required
                placeholder="My Kedarnath Journey"
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
                placeholder="my-kedarnath-journey"
                value={formData.slug}
                className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white/40 focus:outline-none cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
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
            <div>
              <label className="text-[10px] uppercase tracking-wider text-soloz-ash/60 block mb-1">Est. Read Time</label>
              <input
                type="text"
                required
                placeholder="6 min read"
                value={formData.readTime}
                onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-soloz-ember/50 focus:outline-none"
              />
            </div>
            <div className="flex flex-col justify-end pb-3 space-y-2">
              <label className="text-[10px] uppercase tracking-wider text-soloz-ash/60 block">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="h-8 rounded bg-black border border-white/10 text-xs text-white"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider text-soloz-ash/60 block mb-1">Excerpt (Short summary)</label>
            <input
              type="text"
              required
              placeholder="Provide a quick 1-2 sentence hook to draw readers in..."
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-soloz-ember/50 focus:outline-none"
            />
          </div>

          {/* HTML editor with tabs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <label className="text-[10px] uppercase tracking-wider text-soloz-ash/60 block">Article Body (Supports HTML)</label>
              <div className="flex gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setFormTab("edit")}
                  className={`px-3 py-1 rounded transition ${formTab === "edit" ? "bg-soloz-ember text-white" : "bg-white/5 text-white/60"}`}
                >
                  Write Raw HTML
                </button>
                <button
                  type="button"
                  onClick={() => setFormTab("preview")}
                  className={`px-3 py-1 rounded transition ${formTab === "preview" ? "bg-soloz-ember text-white" : "bg-white/5 text-white/60"}`}
                >
                  Preview Layout
                </button>
              </div>
            </div>

            {formTab === "edit" ? (
              <div className="space-y-2">
                <textarea
                  required
                  rows={12}
                  placeholder="<p>Write your article here...</p><h3>Section Heading</h3><p>More details...</p><blockquote>'Quote details'</blockquote>"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-white/5 p-4 text-sm font-mono text-white focus:border-soloz-ember/50 focus:outline-none resize-none"
                />
                <div className="rounded border border-white/10 bg-white/5 p-3 text-[10px] text-soloz-ash/80 leading-relaxed">
                  <strong>HTML Quick Guide:</strong> Use <code>&lt;p&gt;text&lt;/p&gt;</code> for paragraphs. Use <code>&lt;h3&gt;Title&lt;/h3&gt;</code> for subheadings. Use <code>&lt;blockquote&gt;"your quote"&lt;/blockquote&gt;</code> for callout quotes.
                </div>
              </div>
            ) : (
              <div
                className="prose-custom min-h-[264px] max-h-[400px] overflow-y-auto rounded-lg border border-white/10 bg-black/40 p-4 text-sm text-soloz-ash/90 leading-relaxed space-y-4"
                dangerouslySetInnerHTML={{ __html: formData.content || "<p className='text-white/20 italic'>Nothing written yet...</p>" }}
              />
            )}
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <CloudinaryUpload
              value={formData.image}
              onChange={(url) => setFormData({ ...formData, image: url })}
              label="Featured Cover Image"
            />

            <div className="space-y-4">
              <label className="text-[10px] uppercase tracking-wider text-soloz-ash/60 block">Publish Options</label>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="size-4 accent-soloz-ember"
                />
                Highlight as Featured Article
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
                  <Check className="mr-2" size={15} /> Save Story
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </main>
  );
}
