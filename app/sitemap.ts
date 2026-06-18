import { MetadataRoute } from "next";
import { fetchPublic } from "@/lib/api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://wearesoloz.com";

  // Static routes
  const staticRoutes = [
    "",
    "/about-akhil",
    "/upcoming-trips",
    "/travel-stories",
    "/careers",
    "/contact",
    "/soloz-community",
    "/gallery",
    "/farmer-registration"
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : 0.8
  }));

  // Dynamic trip routes
  let tripRoutes: any[] = [];
  try {
    const trips = await fetchPublic("/trips?all=true", []);
    if (trips && trips.length > 0) {
      tripRoutes = trips.map((trip: any) => {
        const slug = trip.slug || trip.destination?.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        return {
          url: `${baseUrl}/upcoming-trips/${slug}`,
          lastModified: new Date(trip.updatedAt || new Date()),
          changeFrequency: "weekly" as const,
          priority: 0.7
        };
      });
    }
  } catch (error) {
    console.error("Sitemap dynamic trips generation error:", error);
  }

  // Dynamic blog routes
  let blogRoutes: any[] = [];
  try {
    const blogs = await fetchPublic("/blogs", []);
    if (blogs && blogs.length > 0) {
      blogRoutes = blogs.map((blog: any) => {
        const slug = blog.slug || blog.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        return {
          url: `${baseUrl}/travel-stories/${slug}`,
          lastModified: new Date(blog.updatedAt || new Date()),
          changeFrequency: "monthly" as const,
          priority: 0.6
        };
      });
    }
  } catch (error) {
    console.error("Sitemap dynamic blogs generation error:", error);
  }

  return [...staticRoutes, ...tripRoutes, ...blogRoutes];
}
