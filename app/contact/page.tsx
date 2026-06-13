import ContactClient from "@/components/ContactClient";
import { trips as defaultTrips } from "@/lib/data";
import { fetchPublic } from "@/lib/api";

async function getData() {
  try {
    const [settings, dbTrips] = await Promise.all([
      fetchPublic("/settings/contact", {}),
      fetchPublic("/trips", [])
    ]);

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
