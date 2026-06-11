import { connectDB } from "@/lib/db";
import Trip from "@/models/Trip";
import TripsClient from "@/components/TripsClient";
import { trips as defaultTrips } from "@/lib/data";

async function getTrips() {
  try {
    await connectDB();
    const dbTrips = await Trip.find({ status: "published" }).sort({ date: 1 }).lean();
    if (dbTrips.length > 0) {
      return JSON.parse(JSON.stringify(dbTrips));
    }
  } catch (error) {
    console.error("Failed to fetch trips from DB:", error);
  }

  // Fallback to static mock data if DB empty or error
  return defaultTrips.map((t) => ({
    ...t,
    id: t.destination.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    slug: t.destination.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    description: `Join us for an unforgettable group trip to ${t.destination}. Explore scenic locations, local food, and enjoy travel with a curated group.`,
    inclusions: [],
    itinerary: []
  }));
}

export default async function UpcomingTripsPage() {
  const tripsList = await getTrips();
  return <TripsClient initialTrips={tripsList} />;
}

