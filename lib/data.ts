import {
  Camera,
  Compass,
  HeartHandshake,
  MapPinned,
  Mountain,
  ShieldCheck,
  Sparkles,
  UsersRound
} from "lucide-react";

export const brand = {
  name: "WeAreSoloz",
  tagline: "Start Solo. Travel Together.",
  secondaryTagline: "Travel Solo. You're Not Alone.",
  founder: "Akhil",
  instagram: "https://www.instagram.com/akhillrockstar",
  phone: "+91 9966085310"
};

export const navItems = [
  { href: "/", label: "Home" },
  { href: "/upcoming-trips", label: "Upcoming Trips" },
  { href: "/travel-stories", label: "Travel Stories" },
  { href: "/soloz-community", label: "Soloz Community" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about-akhil", label: "About Akhil" },
  { href: "/contact", label: "Contact" }
];

export const heroImage =
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2400&q=90";

export const destinations = [
  {
    title: "Kedarnath",
    location: "Uttarakhand",
    description: "A soul-stirring Himalayan pilgrimage wrapped in snow peaks, stories, and sunrise trails.",
    image: "https://images.unsplash.com/photo-1626621331169-5f34be280ed9?auto=format&fit=crop&w=1200&q=80"
  },
  {
    title: "Badrinath",
    location: "Uttarakhand",
    description: "Sacred valleys, ancient temples, warm community energy, and the calm of the Alaknanda.",
    image: "https://images.unsplash.com/photo-1609947017136-9daf32a5eb16?auto=format&fit=crop&w=1200&q=80"
  },
  {
    title: "Mana Village",
    location: "India's First Village",
    description: "Stone lanes, mythic routes, mountain tea, and the quiet thrill of the last road north.",
    image: "https://images.unsplash.com/photo-1626621331295-7ba5937f212e?auto=format&fit=crop&w=1200&q=80"
  },
  {
    title: "Valley of Flowers",
    location: "Uttarakhand",
    description: "A monsoon wonderland of alpine blooms, glacial streams, and camera-ready trekking days.",
    image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80"
  },
  {
    title: "Hampta Pass",
    location: "Himachal Pradesh",
    description: "High-altitude drama from green Kullu valleys to the stark beauty of Lahaul.",
    image: "https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?auto=format&fit=crop&w=1200&q=80"
  },
  {
    title: "Goa",
    location: "Western Coast",
    description: "Slow mornings, music-filled evenings, road trips, beaches, and easy community energy.",
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80"
  },
  {
    title: "Kerala",
    location: "God's Own Country",
    description: "Backwaters, forest roads, spice gardens, beaches, and gentle southern hospitality.",
    image: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1200&q=80"
  }
];

export const trips = [
  { destination: "Kedarnath Community Yatra", state: "Uttarakhand", date: "2026-09-18", duration: "6D / 5N", price: "₹18,999", seats: 14, image: destinations[0].image },
  { destination: "Valley of Flowers Trek", state: "Uttarakhand", date: "2026-08-09", duration: "7D / 6N", price: "₹21,499", seats: 10, image: destinations[3].image },
  { destination: "Goa Soloz Escape", state: "Goa", date: "2026-11-21", duration: "4D / 3N", price: "₹13,999", seats: 18, image: destinations[5].image },
  { destination: "Hampta Pass Expedition", state: "Himachal Pradesh", date: "2026-07-26", duration: "5D / 4N", price: "₹16,999", seats: 8, image: destinations[4].image }
];

export const whyUs = [
  { title: "Travel Together", description: "Meet verified solo travelers and move as a supportive crew.", icon: UsersRound },
  { title: "Safe Community", description: "Curated groups, clear communication, and practical ground support.", icon: ShieldCheck },
  { title: "Trusted Experiences", description: "Trips shaped by years of road, trek, and spiritual travel insight.", icon: HeartHandshake },
  { title: "Unique Destinations", description: "Iconic routes plus hidden local stops that make a journey feel personal.", icon: MapPinned },
  { title: "Adventure First", description: "Treks, road trips, temples, forests, and moments that stretch your comfort zone.", icon: Mountain },
  { title: "Lifelong Memories", description: "Come for the destination; leave with stories and people you remember.", icon: Sparkles }
];

export const stories = [
  { title: "My Kedarnath Journey", category: "Spiritual Travel", readTime: "6 min", image: destinations[0].image },
  { title: "Exploring Mana Village", category: "Hidden Destinations", readTime: "4 min", image: destinations[2].image },
  { title: "Valley of Flowers Trek", category: "Treks", readTime: "7 min", image: destinations[3].image },
  { title: "Solo Travel Lessons", category: "Community", readTime: "5 min", image: "https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=1200&q=80" }
];

export const testimonials = [
  { name: "Priya S.", role: "Solo trekker", quote: "I joined alone and felt included from the first call. The trip had the right mix of freedom and care." },
  { name: "Rahul K.", role: "Photographer", quote: "The group energy was premium, warm, and genuinely adventurous. Every day had a story worth keeping." },
  { name: "Meghana R.", role: "Spiritual explorer", quote: "WeAreSoloz made Kedarnath feel safe, soulful, and deeply human. I came back with friends." }
];

export const gallery = [
  { src: destinations[0].image, category: "Spiritual Tours", title: "Kedarnath Dawn" },
  { src: destinations[3].image, category: "Treks", title: "Valley Bloom Trail" },
  { src: destinations[5].image, category: "Road Trips", title: "Goa Coast Drive" },
  { src: "https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=1200&q=80", category: "Community Events", title: "Campfire Circle" },
  { src: destinations[6].image, category: "Hidden Destinations", title: "Kerala Slow Roads" },
  { src: destinations[4].image, category: "Treks", title: "Hampta Ridge" }
];

export const adminModules = [
  "Trips",
  "Destinations",
  "Travel Stories",
  "Gallery",
  "Testimonials",
  "Community Links",
  "Homepage Content",
  "Contact Enquiries",
  "Analytics"
];

export const quickStats = [
  { label: "Years Traveling", value: "7+" },
  { label: "Destinations Explored", value: "100+" },
  { label: "Travel Memories", value: "Thousands" },
  { label: "Community", value: "Growing" }
];

export const communityFeatures = [
  { title: "WhatsApp Community", description: "Join trip drops, travel discussions, safety updates, and destination plans.", icon: Compass },
  { title: "Meetups", description: "Offline circles for travelers to connect before and after journeys.", icon: UsersRound },
  { title: "Travel Buddies", description: "Find people who match your pace, interests, and destination dreams.", icon: Camera }
];
