require("dotenv").config();
const { connectDB } = require("./lib/db");
const SiteSetting = require("./models/SiteSetting");

async function seed() {
  try {
    await connectDB();
    console.log("Connected to database.");

    // Seed homepage settings
    const homepageSettings = {
      heroTitle: "Start Solo. Travel Together.",
      heroSubheading: "Join solo travelers, explore new destinations, meet incredible people and create unforgettable memories together.",
      aboutHeading: "Travel Solo. You're Not Alone.",
      aboutText: "WeAreSoloz is more than a travel community. It is a family of explorers who believe in adventure, friendship, self-discovery and unforgettable experiences.",
      founderHeading: "Meet Akhil",
      founderText: "Hi, I'm Akhil, creator of Akhill Rockstar Travel Stories and founder of WeAreSoloz.",
      founder_image: "/images/akhil.jpg"
    };

    await SiteSetting.findOneAndUpdate(
      { key: "homepage" },
      { key: "homepage", value: homepageSettings },
      { upsert: true, new: true }
    );
    console.log("Seeded/updated homepage settings.");

    // Seed contact settings
    const contactSettings = {
      phone: "+91 9966085310",
      instagram: "https://www.instagram.com/wearesolozindia?igsh=MWZjNjN0MXhidWJ2Yw==",
      whatsapp: "https://wa.me/919966085310"
    };

    await SiteSetting.findOneAndUpdate(
      { key: "contact" },
      { key: "contact", value: contactSettings },
      { upsert: true, new: true }
    );
    console.log("Seeded/updated contact settings.");

    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seed();
