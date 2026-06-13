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
    description: "Explore the pearl of the Indian Ocean. Ride through tea estates in Ella, climb the iconic Sigiriya Rock Fortress, visit ancient temples in Kandy, and relax on the sandy beaches of Mirissa.",
    image: "https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=1200&q=80",
    featured: true, // Make it featured so it is included in the homepage & hero slider!
    status: "published",
    inclusions: [
      "Comfortable hotel accommodation (double/triple sharing)",
      "Daily breakfast and dinner",
      "Private AC transport for the entire route",
      "Sigiriya & Kandy temple entry tickets",
      "English speaking local guide support",
      "Akhil's leadership and curation"
    ],
    itinerary: [
      { day: "Day 1", title: "Arrival in Colombo & Transfer to Sigiriya", description: "Arrive at Bandaranaike International Airport. Meet your guide and transfer to Sigiriya. Relax at the hotel in the evening." },
      { day: "Day 2", title: "Sigiriya Rock Fortress & Dambulla Cave Temple", description: "Climb the majestic Sigiriya Rock Fortress early in the morning. Later, visit the ancient Dambulla Cave Temple complex." },
      { day: "Day 3", title: "Kandy Sacred City Tour", description: "Drive to Kandy. Visit the sacred Temple of the Tooth Relic, stroll around Kandy Lake, and watch a traditional cultural dance performance." },
      { day: "Day 4", title: "Scenic Train to Ella", description: "Take one of the world's most beautiful train journeys from Kandy/Nanu Oya to Ella, winding through tea plantations and misty mountains." },
      { day: "Day 5", title: "Ella Sightseeing & Hiking", description: "Hike to Little Adam's Peak, visit the iconic Nine Arch Bridge, and enjoy the relaxed vibe of Ella town." },
      { day: "Day 6", title: "Transfer to Mirissa Coast", description: "Drive down to the southern coast. Check in to your beach resort in Mirissa. Enjoy a gorgeous sunset by the beach." },
      { day: "Day 7", title: "Departure", description: "After breakfast, transfer back to Colombo airport for your departure flight." }
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
