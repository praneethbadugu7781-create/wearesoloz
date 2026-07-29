require("dotenv").config({ path: "c:/wearesoloz/backend/.env" });
const { connectDB } = require("c:/wearesoloz/backend/lib/db");
const Trip = require("c:/wearesoloz/backend/models/Trip");

async function check() {
  try {
    await connectDB();
    const trips = await Trip.find().sort({ date: 1 });
    console.log("Current Trips in DB:");
    for (const trip of trips) {
      console.log(`- Slug: ${trip.slug}`);
      console.log(`  Destination: ${trip.destination}`);
      console.log(`  Date: ${trip.date ? trip.date.toISOString().split('T')[0] : 'N/A'}`);
      console.log(`  Duration: ${trip.duration}`);
      console.log(`  Price: ${trip.price}`);
      console.log(`  Status: ${trip.status}`);
      console.log(`  Category: ${trip.category}`);
      console.log(`-----------------------------------`);
    }
    process.exit(0);
  } catch (error) {
    console.error("Failed to read trips:", error);
    process.exit(1);
  }
}

check();
