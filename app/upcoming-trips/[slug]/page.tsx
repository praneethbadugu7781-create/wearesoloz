import TripDetailClient from "@/components/TripDetailClient";
import { trips as defaultTrips } from "@/lib/data";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { fetchPublic } from "@/lib/api";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getTrip(slug: string) {
  try {
    const dbTrip = await fetchPublic(`/trips/${slug}`, null);
    if (dbTrip) {
      return dbTrip;
    }
  } catch (error) {
    console.error("API error fetching single trip:", error);
  }

  // Fallback check in static data
  const staticTrip = defaultTrips.find(
    (t) => t.destination.toLowerCase().replace(/[^a-z0-9]+/g, "-") === slug
  );

  if (staticTrip) {
    return {
      destination: staticTrip.destination,
      slug: slug,
      date: new Date(staticTrip.date),
      duration: staticTrip.duration,
      price: staticTrip.price,
      seats: staticTrip.seats,
      description: `Join WeAreSoloz on a spectacular group trip to ${staticTrip.destination}. Meet awesome solo travelers, explore pristine peaks, valleys, beaches, and local cultures.`,
      image: staticTrip.image,
      inclusions: [
        "Double/Triple sharing premium accommodation",
        "AC transfers from assembly point",
        "All breakfasts & dinners on trip",
        "Certified tour guide & local support team",
        "Medical safety kit & support",
        "WeAreSoloz customized goodies bag"
      ],
      itinerary: [
        { day: "Day 1", title: "Arrival at Base Camp", description: "Reach the pickup point, meet fellow explorers, and transfer to your luxury tents/hotel. Evening bonfire and trip briefing." },
        { day: "Day 2", title: "Scenic Exploration", description: "Hike through trails, capture gorgeous sunset photos, and sample authentic local recipes." },
        { day: "Day 3", title: "Peak Adventure Day", description: "A thrilling day visiting the main attraction. Walk across mountain rivers, explore local temples, and stargaze." },
        { day: "Day 4", title: "Return Trails & Farewell", description: "Descent to base camp. Enjoy a grand final dinner with songs, laughter, and group memories." },
        { day: "Day 5", title: "Departure", description: "Bid farewell to your travel group. Leave with friendships and stories for a lifetime!" }
      ]
    };
  }

  return null;
}

export default async function TripDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const trip = await getTrip(slug);

  if (!trip) {
    return (
      <main className="min-h-screen bg-white text-[#1c1917] flex flex-col items-center justify-center gap-6 p-4">
        <h1 className="font-display text-4xl font-light text-stone-900">Trip Not Found</h1>
        <p className="text-soloz-textSecondary">The trip you are looking for does not exist or has been removed.</p>
        <Button asChild className="gradient-orange text-white rounded-full">
          <Link href="/upcoming-trips">Go Back to Trips</Link>
        </Button>
      </main>
    );
  }

  return <TripDetailClient trip={trip} />;
}
