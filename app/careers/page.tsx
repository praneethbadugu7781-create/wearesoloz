import CareersClient from "@/components/CareersClient";
import { fetchPublic } from "@/lib/api";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Careers | Travel & Co-Host",
  description: "Join WeAreSoloz. Travel with Akhil and co-host solo traveler group trips across India."
};

async function getData() {
  try {
    const settings = await fetchPublic("/settings/contact", {});
    return { settings };
  } catch (error) {
    console.error("Careers Page API Error:", error);
    return { settings: {} };
  }
}

export default async function CareersPage() {
  const { settings } = await getData();
  return <CareersClient settings={settings} />;
}
