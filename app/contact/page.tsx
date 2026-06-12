import ContactClient from "@/components/ContactClient";
import { destinations as defaultDests } from "@/lib/data";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function getData() {
  try {
    const [settingsRes, destsRes] = await Promise.all([
      fetch(`${API_URL}/settings/contact`, { cache: "no-store" }),
      fetch(`${API_URL}/destinations`, { cache: "no-store" })
    ]);

    const settings = settingsRes.ok ? await settingsRes.json() : {};
    const dests = destsRes.ok ? await destsRes.json() : [];

    const destinations = dests.length > 0 ? dests : defaultDests;
    return { settings, destinations };
  } catch (error) {
    console.error("Contact Page API Error:", error);
    return { settings: {}, destinations: defaultDests };
  }
}

export default async function ContactPage() {
  const { settings, destinations } = await getData();
  return <ContactClient settings={settings} destinations={destinations} />;
}
