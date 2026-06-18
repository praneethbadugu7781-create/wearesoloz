import TripsClient from "@/components/TripsClient";
import { trips as defaultTrips } from "@/lib/data";
import { fetchPublic } from "@/lib/api";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Upcoming Solo Trips & Best Tour Packages at Lowest Prices",
  description: "Explore the best upcoming solo trips, treks, and spiritual tours at low prices. Book budget-friendly travel packages for Hampi, Munnar, Kerala, Coorg, Araku, and more.",
  keywords: [
    "best trips at low prices",
    "lowest price trips",
    "upcoming budget trips",
    "cheap solo trips India",
    "upcoming tours",
    "budget friendly travel packages"
  ]
};

async function getTrips() {
  try {
    const dbTrips = await fetchPublic("/trips?all=true", []);
    if (dbTrips && dbTrips.length > 0) return dbTrips;
  } catch (error) {
    console.error("Failed to fetch trips from API:", error);
  }

  return defaultTrips.map((t) => ({
    ...t,
    id: t.destination.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    slug: t.destination.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    state: t.state || "Andhra Pradesh",
    category: t.category || "Adventure",
    description: `Join us for an unforgettable solo travel journey to ${t.destination}. Explore scenic locations, local food, and enjoy travel with a curated community.`,
    inclusions: [],
    itinerary: [],
  }));
}

export default async function UpcomingTripsPage() {
  const tripsList = await getTrips();
  return <TripsClient initialTrips={tripsList} />;
}
