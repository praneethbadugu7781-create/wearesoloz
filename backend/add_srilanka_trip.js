const mongoose = require("mongoose");
const Trip = require("./models/Trip");
const { connectDB } = require("./lib/db");
require("dotenv").config();

async function run() {
  await connectDB();
  console.log("Connected to database.");

  // Delete existing if any to avoid duplicate key error
  await Trip.deleteOne({ slug: "sri-lanka-expedition" });

  const sriLankaTrip = new Trip({
    destination: "Sri Lanka Expedition",
    state: "Sri Lanka",
    category: "Adventure",
    slug: "sri-lanka-expedition",
    date: new Date("2026-12-19"),
    duration: "7 Days",
    price: "₹39,999",
    seats: 10,
    description: "Explore the pearl of the Indian Ocean. From ancient cave temples in Dambulla, sacred temples in Kandy, tea estates in Nuwara Eliya, scenic Ella, down to the beaches of Mirissa & Bentota, and historic Colombo.",
    image: "https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=1200&q=80",
    featured: true, // Make it featured so it is included in the homepage & hero slider!
    status: "published",
    inclusions: [
      "01 night at Hotel Sigiriya – Dambulla",
      "01 night at Earls regent – Kandy",
      "01 night at Golden Ridge–Nuwara Eliya",
      "01 night at Mandara Resort – Mirissa",
      "01 night at the palms –Bentota",
      "01 night at Hotel Sofia-Colombo",
      "Accommodation at the hotels mentioned or similar on HB (Half Board - Breakfast & Dinner) basis",
      "Transportation in a private air-conditioned vehicle",
      "Service of an English-speaking driver",
      "Airport transfers, Government Tax, and Toll charges",
      "Value Added: Wheel Chair for physically challenged citizens (on request)",
      "Value Added: One bottle of Mineral Water per person on arrival",
      "Rates valid only for Indian Passport Holders",
      "Program Note: All entrance direct by the guest"
    ],
    itinerary: [
      {
        day: "Day 1",
        title: "Airport to Dambulla",
        description: "Upon arrival, you will be warmly welcomed to Sri Lanka and proceed to Dambulla. Visit the Dambulla Cave Temple. Overnight stay at hotel – Dambulla (Hotel Sigiriya or similar)."
      },
      {
        day: "Day 2",
        title: "Dambulla to Kandy via Pinnawala",
        description: "After breakfast, proceed to Kandy. Enroute, visit the Pinnawala Elephant Orphanage. Do a city tour of Kandy including the Temple of the Sacred Tooth Relic, Kandy Bazaar, Kandy Lake, batik printings, and the Gem Museum. In the evening, witness a cultural dance show (if time permits). Overnight stay at hotel – Kandy (Earls Regent or similar). Kandy was the last capital of the Sri Lankan kings and is a world heritage site filled with legends and traditions. Drive around Kandy Lake built by the last Sinhala king in 1806, visit the arts & crafts center and gem lapidary."
      },
      {
        day: "Day 3",
        title: "Kandy to Nuwara Eliya",
        description: "After breakfast, proceed to Nuwara Eliya. Enroute, visit the Ramboda Hanuman Temple (featuring an 18-foot tall Hanuman statue, believed to be the place where Hanuman landed in search of Sita) and the Ramboda Waterfall. Perform a city tour of Nuwara Eliya (Little England) including tea plantations & tea factory. Enjoy the picturesque landscape and temperate climate, Victoria Park, Gregory's Lake, Seetha Eliya (witness the legendary Seetha Amman Temple in Asoke Vathika), and Gayatri Amman Temple. Overnight stay at hotel – Nuwara Eliya (Golden Ridge or similar)."
      },
      {
        day: "Day 4",
        title: "Nuwara Eliya to Ella & Mirissa",
        description: "After breakfast, proceed to Ella. Visit Ella Waterfall and Ravana Cave. Then proceed to Mirissa and relax at the hotel. Overnight stay at hotel – Mirissa (Mandara Resort or similar). Mirissa's beautiful beach and nightlife make it a popular tourist destination, fishing port, and whale watching location."
      },
      {
        day: "Day 5",
        title: "Mirissa to Galle & Bentota",
        description: "Visit Mirissa Whale Watching early in the morning (should leave from the hotel at 6 AM). Proceed to Galle for a city tour of the historic Dutch Galle Fort (spanning 90 acres, originally built by the Portuguese and extended by the Dutch in 1663). Experience a Madu River boat ride. Proceed to Bentota for water sports (boating, water skiing, jet skiing, snorkelling, wind surfing) and relax. Overnight stay at hotel – Bentota (The Palms or similar)."
      },
      {
        day: "Day 6",
        title: "Bentota to Colombo",
        description: "After breakfast, proceed to Colombo. Do a city and shopping tour of Colombo. Explore Pettah Bazaar, the 100-year-old clock tower, British colonial buildings, affluent residential areas, Colombo Museum, BMICH, and the new parliament in Sri Jayawardenapura. Overnight stay at hotel – Colombo (Hotel Sofia or similar)."
      },
      {
        day: "Day 7",
        title: "Colombo to Departure",
        description: "After breakfast, proceed to the airport for your departure flight. End of Tour."
      }
    ]
  });

  await sriLankaTrip.save();
  console.log("Sri Lanka trip seeded successfully!");
  mongoose.connection.close();
}

run().catch(err => {
  console.error(err);
  mongoose.connection.close();
});
