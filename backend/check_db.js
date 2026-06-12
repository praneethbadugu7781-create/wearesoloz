require("dotenv").config();
const { connectDB } = require("./lib/db");
const User = require("./models/User");
const SiteSetting = require("./models/SiteSetting");

async function check() {
  try {
    await connectDB();
    console.log("Connected to database.");

    const userCount = await User.countDocuments();
    console.log("Total users in DB:", userCount);

    const users = await User.find().select("+password");
    console.log("Users:", users.map(u => ({ email: u.email, name: u.name, role: u.role })));

    const settingsCount = await SiteSetting.countDocuments();
    console.log("Total settings in DB:", settingsCount);

    process.exit(0);
  } catch (error) {
    console.error("Check failed:", error);
    process.exit(1);
  }
}

check();
