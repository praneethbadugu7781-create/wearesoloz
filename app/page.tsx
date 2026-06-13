import HomeClient from "@/components/HomeClient";
import { brand, destinations as defaultDests, trips as defaultTrips, stories as defaultStories, testimonials as defaultTestimonials, gallery as defaultGallery } from "@/lib/data";
import { fetchPublic } from "@/lib/api";

async function getData() {
  try {
    const [homepageSettings, dests, dbTrips, dbBlogs, dbTestimonials, dbGallery] = await Promise.all([
      fetchPublic("/settings/homepage", null),
      fetchPublic("/destinations", []),
      fetchPublic("/trips", []),
      fetchPublic("/blogs", []),
      fetchPublic("/testimonials", []),
      fetchPublic("/gallery", []),
    ]);

    const settings = homepageSettings || {
      heroTitle: "Start Solo. Travel Together.",
      heroSubheading: "Join solo travelers, explore new destinations, meet incredible people and create unforgettable memories together.",
      aboutText: "WeAreSoloz is more than a travel community. It is a family of explorers who believe in adventure, friendship, self-discovery and unforgettable experiences.",
      founderHeading: "Meet Akhil",
      founderText: "Hi, I'm Akhil, creator of Akhill Rockstar Travel Stories and founder of WeAreSoloz."
    };

    const destinations = dests.length > 0
      ? dests
      : defaultDests.map((d) => ({ ...d, _id: d.title, id: d.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"), slug: d.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") }));

    const trips = dbTrips.length > 0
      ? dbTrips
      : defaultTrips.map((t) => ({ ...t, _id: t.destination, id: t.destination.toLowerCase().replace(/[^a-z0-9]+/g, "-"), slug: t.destination.toLowerCase().replace(/[^a-z0-9]+/g, "-") }));

    const blogs = dbBlogs.length > 0
      ? dbBlogs
      : defaultStories.map((s) => ({ ...s, _id: s.title, id: s.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"), slug: s.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") }));

    const testimonials = dbTestimonials.length > 0 ? dbTestimonials : defaultTestimonials;

    let galleryItems: any[] = [];
    if (dbGallery.length > 0) {
      galleryItems = dbGallery.map((g: any) => ({ image: g.image, caption: g.caption || g.title, title: g.title }));
    } else {
      galleryItems = defaultGallery.map((g) => ({ image: g.src, caption: g.title, title: g.title }));
    }

    return { homepageSettings: settings, destinations, trips, blogs, testimonials, gallery: galleryItems };
  } catch (error) {
    console.error("Home Page API Error:", error);
    return {
      homepageSettings: {
        heroTitle: "Start Solo. Travel Together.",
        heroSubheading: "Join solo travelers, explore new destinations, meet incredible people and create unforgettable memories together."
      },
      destinations: defaultDests.map((d) => ({ ...d, id: d.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"), slug: d.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") })),
      trips: defaultTrips.map((t) => ({ ...t, id: t.destination.toLowerCase().replace(/[^a-z0-9]+/g, "-"), slug: t.destination.toLowerCase().replace(/[^a-z0-9]+/g, "-") })),
      blogs: defaultStories.map((s) => ({ ...s, id: s.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"), slug: s.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") })),
      testimonials: defaultTestimonials,
      gallery: defaultGallery.map((g) => ({ image: g.src, caption: g.title, title: g.title }))
    };
  }
}

export default async function HomePage() {
  const data = await getData();

  return (
    <HomeClient
      settings={data.homepageSettings}
      destinations={data.destinations}
      trips={data.trips}
      blogs={data.blogs}
      testimonials={data.testimonials}
      gallery={data.gallery}
    />
  );
}
