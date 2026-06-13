import GalleryClient from "@/components/GalleryClient";
import { gallery as defaultGallery } from "@/lib/data";
import { fetchPublic } from "@/lib/api";

async function getGalleryItems() {
  try {
    const dbGallery = await fetchPublic("/gallery", []);
    if (dbGallery && dbGallery.length > 0) {
      return dbGallery.map((g: any) => ({
        ...g,
        _id: g._id?.toString(),
        image: g.image,
        caption: g.caption || g.title,
        title: g.title,
        category: g.category,
      }));
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
