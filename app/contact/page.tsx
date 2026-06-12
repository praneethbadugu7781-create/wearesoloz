import ContactClient from "@/components/ContactClient";
import { trips as defaultTrips } from "@/lib/data";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function getData() {
  try {
    const [settingsRes, tripsRes] = await Promise.all([
      fetch(`${API_URL}/settings/contact`, { cache: "no-store" }),
      fetch(`${API_URL}/trips`, { cache: "no-store" })
    ]);

    const settings = settingsRes.ok ? await settingsRes.json() : {};
    const dbTrips = tripsRes.ok ? await tripsRes.json() : [];

    const trips = dbTrips.length > 0 ? dbTrips : defaultTrips;
    return { settings, trips };
  } catch (error) {
    console.error("Contact Page API Error:", error);
    return { settings: {}, trips: defaultTrips };
  }
}

export default async function ContactPage() {
  const { settings, trips } = await getData();
  return <ContactClient settings={settings} trips={trips} />;
}
