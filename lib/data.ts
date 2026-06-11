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
    title: "Munnar",
    location: "Kerala",
    description: "Lush tea gardens, misty hills, and cool mountain air in the Western Ghats.",
    image: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1200&q=80"
  },
  {
    title: "Hampi",
    location: "Karnataka",
    description: "An open-air museum of ruins, boulder hills, and ancient monuments along the river.",
    image: "https://images.unsplash.com/photo-1600100397608-f010e45fa674?auto=format&fit=crop&w=1200&q=80"
  },
  {
    title: "Gandikota",
    location: "Andhra Pradesh",
    description: "The Grand Canyon of India, featuring spectacular red stone gorges and a historic fort.",
    image: "https://images.unsplash.com/photo-1616038242814-a6eac7845d88?auto=format&fit=crop&w=1200&q=80"
  },
  {
    title: "Araku Valley",
    location: "Andhra Pradesh",
    description: "Scenic hill station with coffee plantations, tribal culture, and cascading waterfalls.",
    image: "https://drive.google.com/uc?export=view&id=1MlRxGUkxC-ulrFHYYBCUaF95sxSsiqqA"
  },
  {
    title: "Gokarna",
    location: "Karnataka",
    description: "Pristine beaches, beach treks, cliff sunsets, and a relaxed, laid-back vibe.",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
  },
  {
    title: "Ooty",
    location: "Tamil Nadu",
    description: "Queen of Hill Stations, known for its tea gardens, lakes, and heritage train rides.",
    image: "https://drive.google.com/uc?export=view&id=1mNhwkzJgU6B9eWyXpaaT-o-aRONhmSsJ"
  },
  {
    title: "Coorg",
    location: "Karnataka",
    description: "The Scotland of India, rich in coffee plantations, spice gardens, and waterfalls.",
    image: "https://images.unsplash.com/photo-1542856391-010fb87dcfed?auto=format&fit=crop&w=1200&q=80"
  }
];

export const trips = [
  { destination: "Munnar & Kodaikanal", state: "Kerala", category: "Treks", date: "2026-09-18", duration: "4 Days", price: "₹12,499", seats: 12, image: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1200&q=80" },
  { destination: "Hampi Weekend", state: "Karnataka", category: "Adventure", date: "2026-10-03", duration: "2 Days", price: "₹6,499", seats: 15, image: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80" },
  { destination: "Araku Valley", state: "Andhra Pradesh", category: "Adventure", date: "2026-10-17", duration: "2 Days", price: "₹5,999", seats: 14, image: "https://drive.google.com/uc?export=view&id=1MlRxGUkxC-ulrFHYYBCUaF95sxSsiqqA" },
  { destination: "Srisailam Spiritual Trail", state: "Andhra Pradesh", category: "Temples", date: "2026-11-07", duration: "2 Days", price: "₹4,999", seats: 18, image: "https://drive.google.com/uc?export=view&id=1HsRTd9a4jczhuBAEAyI2nvOWJ4XBGGty" },
  { destination: "Gokarna Beach Trek", state: "Karnataka", category: "Treks", date: "2026-11-20", duration: "3 Days", price: "₹8,999", seats: 12, image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80" },
  { destination: "Coorg & Chikmagalur", state: "Karnataka", category: "Adventure", date: "2026-12-05", duration: "3 Days", price: "₹9,499", seats: 15, image: "https://images.unsplash.com/photo-1542856391-010fb87dcfed?auto=format&fit=crop&w=1200&q=80" }
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
  { title: "Exploring Hampi Ruins", category: "Hidden Destinations", readTime: "6 min", image: "https://images.unsplash.com/photo-1600100397608-f010e45fa674?auto=format&fit=crop&w=1200&q=80" },
  { title: "Munnar Tea Hills Hike", category: "Treks", readTime: "4 min", image: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1200&q=80" },
  { title: "Gandikota Camping Adventure", category: "Adventure", readTime: "7 min", image: "https://images.unsplash.com/photo-1616038242814-a6eac7845d88?auto=format&fit=crop&w=1200&q=80" },
  { title: "Solo Travel Lessons", category: "Community", readTime: "5 min", image: "https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=1200&q=80" }
];

export const testimonials = [
  { name: "Priya S.", role: "Solo trekker", quote: "I joined alone and felt included from the first call. The trip had the right mix of freedom and care." },
  { name: "Rahul K.", role: "Photographer", quote: "The group energy was premium, warm, and genuinely adventurous. Every day had a story worth keeping." },
  { name: "Meghana R.", role: "Spiritual explorer", quote: "WeAreSoloz made Kedarnath feel safe, soulful, and deeply human. I came back with friends." }
];

export const gallery = [
  { src: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1200&q=80", category: "Nature", title: "Munnar Morning" },
  { src: "https://images.unsplash.com/photo-1600100397608-f010e45fa674?auto=format&fit=crop&w=1200&q=80", category: "Heritage", title: "Hampi Sunset" },
  { src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80", category: "Adventure", title: "Gokarna Cliffs" },
  { src: "https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=1200&q=80", category: "Community Events", title: "Campfire Circle" },
  { src: "https://images.unsplash.com/photo-1616038242814-a6eac7845d88?auto=format&fit=crop&w=1200&q=80", category: "Adventure", title: "Gandikota Gorge" },
  { src: "https://images.unsplash.com/photo-1542856391-010fb87dcfed?auto=format&fit=crop&w=1200&q=80", category: "Nature", title: "Coorg Trails" }
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
