import TripsClient from "@/components/TripsClient";
import { trips as defaultTrips } from "@/lib/data";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function getTrips() {
  try {
    const res = await fetch(`${API_URL}/trips`, { cache: "no-store" });
    if (res.ok) {
      const dbTrips = await res.json();
      if (dbTrips.length > 0) return dbTrips;
    }
  } catch (error) {
    console.error("Failed to fetch trips from API:", error);
  }

  return defaultTrips.map((t) => ({
    ...t,
    id: t.destination.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    slug: t.destination.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    state: t.state || "Uttarakhand",
    description: `Join us for an unforgettable group trip to ${t.destination}. Explore scenic locations, local food, and enjoy travel with a curated group.`,
    inclusions: [],
    itinerary: [],
  }));
}

export default async function UpcomingTripsPage() {
  const tripsList = await getTrips();
  return <TripsClient initialTrips={tripsList} />;
}
