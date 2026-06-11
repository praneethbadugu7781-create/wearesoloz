import { connectDB } from "@/lib/db";
import SiteSetting from "@/models/SiteSetting";
import AboutClient from "@/components/AboutClient";

async function getAboutData() {
  try {
    await connectDB();
    const homeSetting = (await SiteSetting.findOne({ key: "homepage" }).lean()) as any;
    const contactSetting = (await SiteSetting.findOne({ key: "contact" }).lean()) as any;

    const homepageValues = homeSetting ? homeSetting.value : {};
    const contactValues = contactSetting ? contactSetting.value : {};

    // Combine settings needed for the founder bio page
    return {
      founder_image: homepageValues.founder_image || homepageValues.founderImage,
      founder_content: homepageValues.founderText || homepageValues.founder_content || homepageValues.founderContent,
      instagram_link: contactValues.instagram || contactValues.instagram_link,
      whatsapp_link: contactValues.whatsapp || contactValues.whatsapp_link,
    };
  } catch (error) {
    console.error("About Page DB Error:", error);
    return {};
  }
}

export default async function AboutAkhilPage() {
  const settings = await getAboutData();
  return <AboutClient settings={settings} />;
}

