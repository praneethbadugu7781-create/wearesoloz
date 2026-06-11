import { connectDB } from "@/lib/db";
import Blog from "@/models/Blog";
import StoriesClient from "@/components/StoriesClient";
import { stories as defaultStories } from "@/lib/data";

async function getStories() {
  try {
    await connectDB();
    const dbBlogs = await Blog.find({ status: "published" }).sort({ createdAt: -1 }).lean();
    if (dbBlogs.length > 0) {
      return JSON.parse(JSON.stringify(dbBlogs));
    }
  } catch (error) {
    console.error("DB error fetching travel stories:", error);
  }

  // Fallback
  return defaultStories.map((s) => ({
    ...s,
    id: s.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    slug: s.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    excerpt: `A guide about our adventure to ${s.title.replace("Journey", "").replace("Trek", "")}. Packing lists, trails details and cultural highlights.`,
    createdAt: new Date().toISOString()
  }));
}

export default async function TravelStoriesPage() {
  const storiesList = await getStories();
  return <StoriesClient initialStories={storiesList} />;
}

