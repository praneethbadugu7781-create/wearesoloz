import { connectDB } from "@/lib/db";
import SiteSetting from "@/models/SiteSetting";
import CommunityClient from "@/components/CommunityClient";

async function getCommunitySettings() {
  try {
    await connectDB();
    const contactSetting = (await SiteSetting.findOne({ key: "contact" }).lean()) as any;
    return contactSetting ? contactSetting.value : {};
  } catch (error) {
    console.error("Community Page DB Error:", error);
    return {};
  }
}

export default async function SolozCommunityPage() {
  const settings = await getCommunitySettings();
  return <CommunityClient settings={settings} />;
}

