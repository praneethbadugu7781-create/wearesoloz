import { connectDB } from "@/lib/db";
import Gallery from "@/models/Gallery";
import GalleryClient from "@/components/GalleryClient";
import { gallery as defaultGallery } from "@/lib/data";

async function getGalleryItems() {
  try {
    await connectDB();
    const dbGallery = await Gallery.find().sort({ createdAt: -1 }).lean();
    if (dbGallery.length > 0) {
      return dbGallery.map((g: any) => ({
        ...g,
        _id: g._id.toString(),
        image: g.image,
        caption: g.caption || g.title,
        title: g.title,
        category: g.category
      }));
    }
  } catch (error) {
    console.error("Gallery Page DB Error:", error);
  }

  // Fallback
  return defaultGallery.map((g, idx) => ({
    id: `static-${idx}`,
    image: g.src,
    caption: g.title,
    title: g.title,
    category: g.category
  }));
}

export default async function GalleryPage() {
  const items = await getGalleryItems();
  return <GalleryClient initialItems={items} />;
}
