import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Destination from "@/models/Destination";
import Trip from "@/models/Trip";
import Blog from "@/models/Blog";
import Gallery from "@/models/Gallery";
import Testimonial from "@/models/Testimonial";
import SiteSetting from "@/models/SiteSetting";
import { destinations, trips, stories, testimonials, gallery } from "@/lib/data";

function toSlug(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET() {
  try {
    await connectDB();

    // 1. Seed Destinations
    const destCount = await Destination.countDocuments();
    if (destCount === 0) {
      const formattedDests = destinations.map((d) => ({
        title: d.title,
        slug: toSlug(d.title),
        location: d.location,
        description: d.description,
        image: d.image,
        featured: true
      }));
      await Destination.insertMany(formattedDests);
    }

    // 2. Seed Trips
    const tripCount = await Trip.countDocuments();
    if (tripCount === 0) {
      const formattedTrips = trips.map((t) => ({
        destination: t.destination,
        slug: toSlug(t.destination),
        date: new Date(t.date),
        duration: t.duration,
        price: t.price,
        seats: t.seats,
        description: `Join us for an incredible adventure to ${t.destination}. Experience the beautiful landscapes, local culture, and make lifelong friends along the way.`,
        image: t.image,
        featured: true,
        status: "published",
        inclusions: [
          "Double/Triple sharing premium accommodation",
          "AC transfers from assembly point",
          "All breakfasts & dinners on trip",
          "Certified tour guide & local support team",
          "Medical kits & oxygen cylinders (where needed)",
          "WeAreSoloz customized goodies bag"
        ],
        itinerary: [
          { day: "Day 1", title: "Arrival & Welcome", description: "Arrive at the assembly point. Meet your trip captain and fellow solo travelers. Transfer to premium hotel and enjoy a welcome dinner." },
          { day: "Day 2", title: "Local Insights & Exploration", description: "Discover hidden spots, local cafes, and enjoy cultural immersion walks with your group." },
          { day: "Day 3", title: "The Main Adventure Begins", description: "Depart for the major attraction. Hike, ride or explore scenic view points together." },
          { day: "Day 4", title: "Acclimatization & Peak Experience", description: "Reach the peak or focal point. Photography session, group discussions and stargazing." },
          { day: "Day 5", title: "Return Walk & Celebration", description: "Return to the base camp. Celebrate the successful journey with a bonfire and music night." },
          { day: "Day 6", title: "Farewell & Departure", description: "Bid goodbye to your new friends. Head home with bags full of memories and a phone full of contacts." }
        ]
      }));
      await Trip.insertMany(formattedTrips);
    }

    // 3. Seed Blogs
    const blogCount = await Blog.countDocuments();
    if (blogCount === 0) {
      const formattedBlogs = stories.map((s) => ({
        title: s.title,
        slug: toSlug(s.title),
        excerpt: `A deep dive into our experience exploring ${s.title.replace("Journey", "").replace("Trek", "")}. Discover maps, guidelines, safety tips, and personal stories.`,
        content: `<p>We started our journey with high spirits and clear skies. Exploring these gorgeous landscapes teaches you more than any book ever could.</p><h3>Why This Journey Matters</h3><p>Traveling solo makes you independent, but traveling in a community connects you with the heartbeat of the place. We shared stories by the bonfire, woke up at 4 AM to catch the sunrise behind the peaks, and walked miles together.</p><blockquote>"Travel is not about the destination, it is about the friendships you spark along the way."</blockquote><p>If you're thinking of planning this, make sure to pack warm layers, stay hydrated, and keep an open heart.</p>`,
        category: s.category,
        image: s.image,
        readTime: s.readTime,
        featured: true,
        status: "published"
      }));
      await Blog.insertMany(formattedBlogs);
    }

    // 4. Seed Testimonials
    const testCount = await Testimonial.countDocuments();
    if (testCount === 0) {
      await Testimonial.insertMany(testimonials);
    }

    // 5. Seed Gallery
    const galCount = await Gallery.countDocuments();
    if (galCount === 0) {
      await Gallery.insertMany(gallery);
    }

    // 6. Seed Site Settings
    const settingCount = await SiteSetting.countDocuments();
    if (settingCount === 0) {
      await SiteSetting.insertMany([
        {
          key: "homepage",
          value: {
            heroTitle: "START SOLO. TRAVEL TOGETHER.",
            heroSubheading: "Join solo travelers, explore new destinations, meet incredible people and create unforgettable memories together.",
            aboutHeading: "Travel Solo. You're Not Alone.",
            aboutText: "WeAreSoloz is more than a travel community.\n\nIt is a family of explorers who believe in adventure, friendship, self-discovery and unforgettable experiences.\n\nWhether you're a solo traveler, trekker, biker, photographer, spiritual explorer or someone seeking new experiences, you're welcome here.",
            founderHeading: "Meet Akhil",
            founderText: "Hi, I'm Akhil, creator of Akhill Rockstar Travel Stories and founder of WeAreSoloz.\n\nFor the past 7+ years, I've been exploring India through mountains, temples, villages, forests, trekking routes and hidden destinations.\n\nWhat started as a personal passion for travel slowly became a journey of collecting stories, meeting incredible people, understanding different cultures and creating unforgettable memories on the road.\n\nI've traveled solo across various parts of India, visited spiritual destinations like Kedarnath, Badrinath, Kottiyoor, Mana Village and many other remarkable places.\n\nThrough every journey, I've learned that travel is not just about destinations—it's about the people we meet, the experiences we share and the memories we create.\n\nThat's why I started WeAreSoloz."
          }
        },
        {
          key: "contact",
          value: {
            phone: "+91 9966085310",
            instagram: "https://www.instagram.com/akhillrockstar",
            whatsapp: "https://wa.me/919966085310"
          }
        }
      ]);
    }

    return NextResponse.json({ success: true, message: "Database seeded successfully" });
  } catch (error: any) {
    console.error("Seeding error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
