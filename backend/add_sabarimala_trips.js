const mongoose = require("mongoose");
const Trip = require("./models/Trip");
const { connectDB } = require("./lib/db");
require("dotenv").config();

async function run() {
  await connectDB();
  console.log("Connected to database.");

  // Delete existing to avoid duplicates
  await Trip.deleteOne({ slug: "kochin-sabarimala-guruvayur" });
  await Trip.deleteOne({ slug: "kochin-to-sabarimala" });
  await Trip.deleteOne({ slug: "thiruvananthapuram-to-sabarimala" });

  const trips = [
    new Trip({
      destination: "Kochin - Sabarimala - Guruvayur",
      state: "Kerala",
      category: "Temples",
      slug: "kochin-sabarimala-guruvayur",
      date: new Date("2026-07-15"),
      duration: "3 Days",
      price: "₹4,999",
      seats: 15,
      description: "A sacred spiritual pilgrimage connecting Kochin to the holy shrine of Sabarimala and the historical Guruvayur Sree Krishna Temple. Experience early morning prayers, divine rituals, and peaceful temple walks in God's Own Country.",
      image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
      featured: true,
      status: "published",
      inclusions: [
        "Transfers (AC/Non-AC) from Kochin Airport/Railway Station",
        "Shared accommodation (AC/Non-AC) in standard hotels/homestays",
        "Pure vegetarian breakfasts & dinners",
        "Trek support, entry charges, and coordinate assistance",
        "Basic first aid and guide support"
      ],
      itinerary: [
        {
          day: "Day 1",
          title: "Kochi to Pamba & Sabarimala Ascent",
          description: "Pickup from Kochin in the morning. Drive to Pamba (base station). Begin the holy trek of 5km to Sabarimala Sannidhanam. Attend evening pooja and overnight stay at Sannidhanam rooms."
        },
        {
          day: "Day 2",
          title: "Darshan & Drive to Guruvayur",
          description: "Early morning Neyyabhishekam and main Darshan. Descend to Pamba by noon. Drive to Guruvayur. Evening temple visit and overnight stay in Guruvayur."
        },
        {
          day: "Day 3",
          title: "Guruvayur Temple Visit & Return",
          description: "Early morning Nirmalya Darshan at Guruvayur Sree Krishna Temple. Explore Mammiyoor Temple and Anakotta (Elephant Sanctuary). Return drive to Kochin by evening."
        }
      ]
    }),
    new Trip({
      destination: "Kochin to Sabarimala",
      state: "Kerala",
      category: "Temples",
      slug: "kochin-to-sabarimala",
      date: new Date("2026-07-18"),
      duration: "2 Days",
      price: "₹2,999",
      seats: 12,
      description: "A direct weekend pilgrimage package from Kochin to Sabarimala. Complete the sacred trek and have peaceful darshan of Lord Ayyappa with specialized assistance from assembly to descent.",
      image: "https://images.unsplash.com/photo-1608958415714-d02f50b2c1ef?auto=format&fit=crop&w=1200&q=80",
      featured: true,
      status: "published",
      inclusions: [
        "Transfers (AC/Non-AC) from Kochin assembly points",
        "Shared accommodation (AC/Non-AC) at Pamba/Sannidhanam",
        "Traditional vegetarian meals",
        "Special queue guidelines and local coordination assistance"
      ],
      itinerary: [
        {
          day: "Day 1",
          title: "Kochin Departure & Pamba Trekking",
          description: "Depart Kochin at 6:00 AM. Arrive at Pamba. Take holy bath at Pamba river. Start the trek to Sannidhanam. Evening prayers, darshan, and night stay at Sannidhanam."
        },
        {
          day: "Day 2",
          title: "Morning Prayers & Return to Kochin",
          description: "Attend morning Ganapathi Homam. Descend back to Pamba. Scenic return drive to Kochin, arriving by late evening."
        }
      ]
    }),
    new Trip({
      destination: "Thiruvananthapuram to Sabarimala",
      state: "Kerala",
      category: "Temples",
      slug: "thiruvananthapuram-to-sabarimala",
      date: new Date("2026-07-22"),
      duration: "2 Days",
      price: "₹3,499",
      seats: 12,
      description: "A short, spiritual pilgrimage route starting from Thiruvananthapuram, passing through scenic paths of Pathanamthitta to Sabarimala. Perfectly organized for working professionals and families.",
      image: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80",
      featured: true,
      status: "published",
      inclusions: [
        "Transfers (AC/Non-AC) from Trivandrum Airport/Railway Station",
        "Accommodation (AC/Non-AC) on sharing basis",
        "Traditional organic vegetarian meals",
        "Trip leadership by Akhil and local guide assistants"
      ],
      itinerary: [
        {
          day: "Day 1",
          title: "Trivandrum Departure & Sabarimala Ascent",
          description: "Pick up from Trivandrum in the early morning. Drive through Pathanamthitta. Arrive at Pamba and climb the hills to Sannidhanam. Attend evening deeparadhana."
        },
        {
          day: "Day 2",
          title: "Holy Darshan & Trivandrum Return",
          description: "Complete morning darshan and climb down to Pamba. Drive back to Thiruvananthapuram, visiting Aranmula Parthasarathy Temple on the way."
        }
      ]
    })
  ];

  await Trip.insertMany(trips);
  console.log("Successfully seeded Sabarimala trips.");
  mongoose.connection.close();
}

run().catch(console.error);
