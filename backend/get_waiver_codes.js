require("dotenv").config();
const { connectDB } = require("./lib/db");
const Trip = require("./models/Trip");

async function check() {
  try {
    await connectDB();
    const trips = await Trip.find({ confirmationCode: { $exists: true, $ne: "" } });
    console.log("Trips with confirmation codes:");
    trips.forEach(t => {
      console.log(`Trip: ${t.title || t.destination}, Code: ${t.confirmationCode}`);
    });
    process.exit(0);
  } catch (error) {
    console.error("Check failed:", error);
    process.exit(1);
  }
}

check();
