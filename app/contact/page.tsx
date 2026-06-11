import ContactClient from "@/components/ContactClient";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function getContactSettings() {
  try {
    const res = await fetch(`${API_URL}/settings/contact`, { cache: "no-store" });
    return res.ok ? await res.json() : {};
  } catch (error) {
    console.error("Contact Page API Error:", error);
    return {};
  }
}

export default async function ContactPage() {
  const settings = await getContactSettings();
  return <ContactClient settings={settings} />;
}
