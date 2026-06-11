import AboutClient from "@/components/AboutClient";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function getAboutData() {
  try {
    const [homepageValues, contactValues] = await Promise.all([
      fetch(`${API_URL}/settings/homepage`, { cache: "no-store" }).then(r => r.ok ? r.json() : {}) as Promise<any>,
      fetch(`${API_URL}/settings/contact`, { cache: "no-store" }).then(r => r.ok ? r.json() : {}) as Promise<any>,
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
