import StoriesClient from "@/components/StoriesClient";
import { stories as defaultStories } from "@/lib/data";
import { fetchPublic } from "@/lib/api";

async function getStories() {
  try {
    const dbBlogs = await fetchPublic("/blogs", []);
    if (dbBlogs && dbBlogs.length > 0) return dbBlogs;
  } catch (error) {
    console.error("API error fetching travel stories:", error);
  }

  return defaultStories.map((s) => ({
    ...s,
    id: s.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    slug: s.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    excerpt: `A guide about our adventure to ${s.title.replace("Journey", "").replace("Trek", "")}. Packing lists, trails details and cultural highlights.`,
    createdAt: new Date().toISOString(),
  }));
}

export default async function TravelStoriesPage() {
  const storiesList = await getStories();
  return <StoriesClient initialStories={storiesList} />;
}
