import { connectDB } from "@/lib/db";
import SiteSetting from "@/models/SiteSetting";
import ContactClient from "@/components/ContactClient";

async function getContactSettings() {
  try {
    await connectDB();
    const contactSetting = (await SiteSetting.findOne({ key: "contact" }).lean()) as any;
    return contactSetting ? contactSetting.value : {};
  } catch (error) {
    console.error("Contact Page DB Error:", error);
    return {};
  }
}

export default async function ContactPage() {
  const settings = await getContactSettings();
  return <ContactClient settings={settings} />;
}

