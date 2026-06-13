import AboutClient from "@/components/AboutClient";
import { fetchPublic } from "@/lib/api";

async function getAboutData() {
  try {
    const [homepageValues, contactValues] = await Promise.all([
      fetchPublic("/settings/homepage", {}),
      fetchPublic("/settings/contact", {}),
    ]);

    return {
      founder_image: homepageValues?.founder_image || homepageValues?.founderImage,
      founder_content: homepageValues?.founderText || homepageValues?.founder_content || homepageValues?.founderContent,
      instagram_link: contactValues?.instagram || contactValues?.instagram_link,
      whatsapp_link: contactValues?.whatsapp || contactValues?.whatsapp_link,
    };
  } catch (error) {
    console.error("About Page API Error:", error);
    return {};
  }
}

export default async function AboutAkhilPage() {
  const settings = await getAboutData();
  return <AboutClient settings={settings} />;
}
