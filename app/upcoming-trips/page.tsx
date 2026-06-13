import TripsClient from "@/components/TripsClient";
import { trips as defaultTrips } from "@/lib/data";
import { fetchPublic } from "@/lib/api";

async function getTrips() {
  try {
    const dbTrips = await fetchPublic("/trips", []);
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
