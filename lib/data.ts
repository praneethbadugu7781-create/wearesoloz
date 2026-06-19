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
  instagram: "https://www.instagram.com/wearesolozindia?igsh=MWZjNjN0MXhidWJ2Yw==",
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
    image: "/images/trips/arakuimage.png"
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
    image: "/images/trips/ooty.png"
  },
  {
    title: "Coorg",
    location: "Karnataka",
    description: "The Scotland of India, rich in coffee plantations, spice gardens, and waterfalls.",
    image: "https://images.unsplash.com/photo-1542856391-010fb87dcfed?auto=format&fit=crop&w=1200&q=80"
  }
];

export const trips = [
  { destination: "Ananthagiri Hills Trek", state: "Telangana", category: "Treks", date: "2026-07-04", duration: "1 Day", price: "₹1,499", seats: 15, image: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80", slug: "ananthagiri-hills-trek" },
  { destination: "Srisailam & Nallamala Forest", state: "Andhra Pradesh", category: "Temples", date: "2026-07-11", duration: "2 Days", price: "₹4,999", seats: 12, image: "/images/trips/srisailamimage.png", slug: "srisailam-nallamala-forest" },
  { destination: "Hampi Heritage Trip", state: "Karnataka", category: "Adventure", date: "2026-07-24", duration: "4 Days", price: "₹7,999", seats: 12, image: "https://images.unsplash.com/photo-1600100397608-f010e45fa674?auto=format&fit=crop&w=1200&q=80", slug: "hampi-heritage-trip" },
  { destination: "Kochin - Sabarimala - Guruvayur", state: "Kerala", category: "Temples", date: "2026-07-15", duration: "3 Days", price: "₹4,999", seats: 15, image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80", slug: "kochin-sabarimala-guruvayur" },
  { destination: "Kochin to Sabarimala", state: "Kerala", category: "Temples", date: "2026-07-18", duration: "2 Days", price: "₹2,999", seats: 12, image: "https://images.unsplash.com/photo-1608958415714-d02f50b2c1ef?auto=format&fit=crop&w=1200&q=80", slug: "kochin-to-sabarimala" },
  { destination: "Thiruvananthapuram to Sabarimala", state: "Kerala", category: "Temples", date: "2026-07-22", duration: "2 Days", price: "₹3,499", seats: 12, image: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80", slug: "thiruvananthapuram-to-sabarimala" }
];

export const whyUs = [
  { title: "Travel Together", description: "Meet verified solo travellers and move as a supportive crew.", icon: UsersRound },
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
  { name: "Praneeth", role: "Solo Traveller", quote: "Fantastic experience with WeAreSoloz! Well-organized trip, great coordination, friendly group, and unforgettable memories. Highly recommended for solo travelers." }
];


export const gallery = [
  { src: "/images/gallery/IMG-20260611-WA0046.jpg", category: "Treks", title: "Soloz Adventure 1" },
  { src: "/images/gallery/IMG-20260611-WA0049.jpg", category: "Spiritual Tours", title: "Soloz Adventure 2" },
  { src: "/images/gallery/IMG-20260611-WA0052.jpg", category: "Road Trips", title: "Soloz Adventure 3" },
  { src: "/images/gallery/IMG-20260611-WA0054.jpg", category: "Community Events", title: "Soloz Adventure 4" },
  { src: "/images/gallery/IMG-20260611-WA0056.jpg", category: "Hidden Destinations", title: "Soloz Adventure 5" },
  { src: "/images/gallery/IMG-20260611-WA0060.jpg", category: "Treks", title: "Soloz Adventure 6" },
  { src: "/images/gallery/IMG-20260611-WA0062.jpg", category: "Spiritual Tours", title: "Soloz Adventure 7" },
  { src: "/images/gallery/IMG-20260611-WA0064.jpg", category: "Road Trips", title: "Soloz Adventure 8" },
  { src: "/images/gallery/IMG-20260611-WA0066.jpg", category: "Community Events", title: "Soloz Adventure 9" },
  { src: "/images/gallery/IMG-20260611-WA0068.jpg", category: "Hidden Destinations", title: "Soloz Adventure 10" }
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
  "Farmer Applications",
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
  { title: "Meetups", description: "Offline circles for travellers to connect before and after journeys.", icon: UsersRound },
  { title: "Travel Buddies", description: "Find people who match your pace, interests, and destination dreams.", icon: Camera }
];
