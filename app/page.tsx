import { connectDB } from "@/lib/db";
import Destination from "@/models/Destination";
import Trip from "@/models/Trip";
import Blog from "@/models/Blog";
import Gallery from "@/models/Gallery";
import Testimonial from "@/models/Testimonial";
import SiteSetting from "@/models/SiteSetting";
import HomeClient from "@/components/HomeClient";
import { brand, destinations as defaultDests, trips as defaultTrips, stories as defaultStories, testimonials as defaultTestimonials, gallery as defaultGallery } from "@/lib/data";

async function getData() {
  try {
    await connectDB();

    // Settings
    const homeSetting = (await SiteSetting.findOne({ key: "homepage" }).lean()) as any;
    const homepageSettings = homeSetting
      ? homeSetting.value
      : {
          heroTitle: "Start Solo. Travel Together.",
          heroSubheading: "Join solo travelers, explore new destinations, meet incredible people and create unforgettable memories together.",
          aboutText: "WeAreSoloz is more than a travel community. It is a family of explorers who believe in adventure, friendship, self-discovery and unforgettable experiences.",
          founderHeading: "Meet Akhil",
          founderText: "Hi, I'm Akhil, creator of Akhill Rockstar Travel Stories and founder of WeAreSoloz."
        };

    // Destinations
    let dests = await Destination.find({ featured: true }).lean();
    if (dests.length === 0) {
      dests = defaultDests.map((d) => ({
        ...d,
        _id: d.title,
        id: d.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        slug: d.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")
      })) as any;
    }

    // Trips
    let dbTrips = await Trip.find({ status: "published" }).limit(3).lean();
    if (dbTrips.length === 0) {
      dbTrips = defaultTrips.map((t) => ({
        ...t,
        _id: t.destination,
        id: t.destination.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        slug: t.destination.toLowerCase().replace(/[^a-z0-9]+/g, "-")
      })) as any;
    }

    // Blogs
    let dbBlogs = await Blog.find({ status: "published" }).limit(4).lean();
    if (dbBlogs.length === 0) {
      dbBlogs = defaultStories.map((s) => ({
        ...s,
        _id: s.title,
        id: s.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        slug: s.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")
      })) as any;
    }

    // Testimonials
    let dbTestimonials = await Testimonial.find().lean();
    if (dbTestimonials.length === 0) {
      dbTestimonials = defaultTestimonials as any;
    }

    // Gallery
    const dbGallery = await Gallery.find().limit(8).lean();
    let galleryItems: any[] = [];
    if (dbGallery.length === 0) {
      galleryItems = defaultGallery.map((g) => ({
        image: g.src,
        caption: g.title,
        title: g.title
      }));
    } else {
      galleryItems = dbGallery.map((g: any) => ({
        image: g.image,
        caption: g.caption || g.title,
        title: g.title
      }));
    }

    return {
      homepageSettings,
      destinations: JSON.parse(JSON.stringify(dests)),
      trips: JSON.parse(JSON.stringify(dbTrips)),
      blogs: JSON.parse(JSON.stringify(dbBlogs)),
      testimonials: JSON.parse(JSON.stringify(dbTestimonials)),
      gallery: JSON.parse(JSON.stringify(galleryItems))
    };
  } catch (error) {
    console.error("Home Page DB Error:", error);
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
