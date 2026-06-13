import CommunityClient from "@/components/CommunityClient";
import { fetchPublic } from "@/lib/api";

async function getCommunitySettings() {
  try {
    return await fetchPublic("/settings/contact", {});
  } catch (error) {
    console.error("Community Page API Error:", error);
    return {};
  }
}

export default async function SolozCommunityPage() {
  const settings = await getCommunitySettings();
  return <CommunityClient settings={settings} />;
}
