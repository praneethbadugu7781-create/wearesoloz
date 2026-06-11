import GalleryClient from "@/components/GalleryClient";
import { gallery as defaultGallery } from "@/lib/data";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function getGalleryItems() {
  try {
    const res = await fetch(`${API_URL}/gallery`, { cache: "no-store" });
    if (res.ok) {
      const dbGallery = await res.json();
      if (dbGallery.length > 0) {
        return dbGallery.map((g: any) => ({
          ...g,
          _id: g._id?.toString(),
          image: g.image,
          caption: g.caption || g.title,
          title: g.title,
          category: g.category,
        }));
      }
    }
  } catch (error) {
    console.error("Gallery Page API Error:", error);
  }

  return defaultGallery.map((g, idx) => ({
    id: `static-${idx}`,
    image: g.src,
    caption: g.title,
    title: g.title,
    category: g.category,
  }));
}

export default async function GalleryPage() {
  const items = await getGalleryItems();
  return <GalleryClient initialItems={items} />;
}
