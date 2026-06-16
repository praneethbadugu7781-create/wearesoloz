const mongoose = require("mongoose");
const Trip = require("./models/Trip");
const { connectDB } = require("./lib/db");
require("dotenv").config();

async function run() {
  await connectDB();
  console.log("Connected to database.");

  // Delete existing to avoid duplicates
  await Trip.deleteOne({ slug: "ananthagiri-hills-trek" });
  await Trip.deleteOne({ slug: "srisailam-nallamala-forest" });
  await Trip.deleteOne({ slug: "hampi-heritage-trip" });

  const trips = [
    new Trip({
      destination: "Ananthagiri Hills Trek",
      state: "Telangana",
      category: "Treks",
      slug: "ananthagiri-hills-trek",
      date: new Date("2026-07-04"),
      duration: "1 Day",
      price: "₹1,499",
      seats: 15,
      description: "Escape the city for a day of trekking and nature exploration at Ananthagiri Hills. Walk through dense forest trails, enjoy spectacular viewpoints, and visit the ancient Anantha Padmanabha Swamy Temple.",
      image: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80",
      featured: true,
      status: "published",
      inclusions: [
        "To and fro transportation from Hyderabad in AC coach",
        "Guided trek through forest areas",
        "Forest department entry charges",
        "Basic first aid support",
        "Akhil's curation and leadership"
      ],
      itinerary: [
        {
          day: "Saturday",
          title: "Hyderabad to Ananthagiri Trek & Explore",
          description: "Depart Hyderabad at 5:30 AM. Arrive at Ananthagiri Hills by 7:00 AM. Trek through forest viewpoints, visit Anantha Padmanabha Swamy Temple at 11:30 AM, lunch at Vikarabad, and explore forest areas before returning to Hyderabad by 7:00 PM."
        }
      ]
    }),
    new Trip({
      destination: "Srisailam & Nallamala Forest",
      state: "Andhra Pradesh",
      category: "Temples",
      slug: "srisailam-nallamala-forest",
      date: new Date("2026-07-11"),
      duration: "2 Days",
      price: "₹4,999",
      seats: 12,
      description: "A perfect weekend getaway covering a scenic drive through Nallamala Forest, check-in at Haritha Jungle Bells Farahabad, viewpoint sunset, overnight jungle stay, and visit to Mallikarjuna Temple in Srisailam.",
      image: "/images/trips/srisailamimage.png",
      featured: true,
      status: "published",
      inclusions: [
        "AC Transport from Hyderabad to Hyderabad",
        "Jungle resort stay at Haritha Jungle Bells, Farahabad (sharing basis)",
        "Breakfast, Lunch, Dinner on Day 1 & Day 2",
        "Farahabad forest entry and safari permissions",
        "Akhil's curation and guiding"
      ],
      itinerary: [
        {
          day: "Day 1",
          title: "Nallamala Forest Drive & Farahabad Jungle Stay",
          description: "Depart from Hyderabad at 6:00 AM. Breakfast at Kalwakurthy. Drive through Nallamala Forest, visit Mallela Theertham. Check-in at Jungle Bells Farahabad. Explore viewpoint sunset. Overnight stay."
        },
        {
          day: "Day 2",
          title: "Mallikarjuna Temple & Srisailam Dam View",
          description: "Visit Sri Bhramaramba Mallikarjuna Temple (Jyotirlinga), Sakshi Ganapati, Paladhara Panchadhara, and the Srisailam Dam Viewpoint. Return to Hyderabad by evening."
        }
      ]
    }),
    new Trip({
      destination: "Hampi Heritage Trip",
      state: "Karnataka",
      category: "Adventure",
      slug: "hampi-heritage-trip",
      date: new Date("2026-07-24"),
      duration: "4 Days",
      price: "₹7,999",
      seats: 12,
      description: "Step back in time to explore the stone ruins, ancient monuments, and boulder-strewn landscape of Hampi. Witness a gorgeous sunset from Matanga Hill, enjoy a coracle ride on the river, and catch the sunrise at Anjanadri Hill.",
      image: "https://images.unsplash.com/photo-1600100397608-f010e45fa674?auto=format&fit=crop&w=1200&q=80",
      featured: true,
      status: "published",
      inclusions: [
        "Hyderabad to Hampi to Hyderabad sleeper transport",
        "Cozy accommodation in Hampi heritage home/stay",
        "Daily breakfast and dinner",
        "Monument entry fees and local guide charges",
        "Coracle boat ride charges",
        "Akhil's photography support and curation"
      ],
      itinerary: [
        {
          day: "Day 1",
          title: "Overnight Journey to Hampi",
          description: "Depart from Hyderabad on Friday night. Enjoy an overnight sleeper journey to Hampi."
        },
        {
          day: "Day 2",
          title: "Explore Virupaksha Temple & Matanga Hill Sunset",
          description: "Arrive in Hampi. Visit Virupaksha Temple, Hampi Bazaar, Hemakuta Hill, Lakshmi Narasimha, and Badavilinga. Watch the sunset from Matanga Hill."
        },
        {
          day: "Day 3",
          title: "Vittala Temple, Stone Chariot & Coracle Ride",
          description: "Visit the iconic Vittala Temple, Stone Chariot, Lotus Mahal, and Elephant Stables. Enjoy a traditional coracle ride along the Tungabhadra river."
        },
        {
          day: "Day 4",
          title: "Anjanadri Hill Sunrise & Return",
          description: "Hike up Anjanadri Hill (birthplace of Lord Hanuman) for sunrise. Travel back to Hyderabad to reach by night."
        }
      ]
    })
  ];

  for (const trip of trips) {
    await trip.save();
    console.log(`Trip ${trip.destination} seeded successfully!`);
  }

  mongoose.connection.close();
}

run().catch(err => {
  console.error(err);
  mongoose.connection.close();
});
