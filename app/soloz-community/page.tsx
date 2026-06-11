import CommunityClient from "@/components/CommunityClient";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function getCommunitySettings() {
  try {
    const res = await fetch(`${API_URL}/settings/contact`, { cache: "no-store" });
    return res.ok ? await res.json() : {};
  } catch (error) {
    console.error("Community Page API Error:", error);
    return {};
  }
}

export default async function SolozCommunityPage() {
  const settings = await getCommunitySettings();
  return <CommunityClient settings={settings} />;
}
