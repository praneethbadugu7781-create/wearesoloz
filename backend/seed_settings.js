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
      heroSubheading: "Join solo travellers, explore new destinations, meet incredible people and create unforgettable memories together.",
      aboutHeading: "Travel Solo. You're Not Alone.",
      aboutText: "WeAreSoloZ is a travel community founded by Akhil with a mission to bring solo travellers together in a safe and positive space. We believe travel heals, connects, and transforms lives. Through unforgettable adventures, meaningful friendships, and our commitment to sponsoring one free trip every month for a deserving farmer, we’re building more than a travel company—we’re building a family. 🌍❤️",
      founderHeading: "Meet Akhil Pasupuleti",
      founderText: "Hi, I'm Akhil Pasupuleti, creator of Akhill Rockstar Travel Stories and founder of WeAreSoloZ.",
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
      phone2: "+91 9281017746",
      instagram: "https://www.instagram.com/wearesolozindia?igsh=MWZjNjN0MXhidWJ2Yw==",
      whatsapp: "https://chat.whatsapp.com/E7aoVfUi66S4VDEBsdXoMW"
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
