import FarmerRegistrationClient from "@/components/FarmerRegistrationClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Farmer Free Trip Registration | WeAreSoloz",
  description: "Apply for our free travel program dedicated exclusively to farmers. Akhil sponsors one free trip to express our gratitude for your hard work.",
  keywords: [
    "farmer free trip",
    "free trip for farmers",
    "WeAreSoloz farmer initiative",
    "agriculture travel program",
    "farmers community travel"
  ]
};

export default function FarmerRegistrationPage() {
  return <FarmerRegistrationClient />;
}
