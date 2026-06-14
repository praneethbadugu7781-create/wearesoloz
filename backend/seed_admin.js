require("dotenv").config();
const { connectDB } = require("./lib/db");
const User = require("./models/User");
const bcrypt = require("bcryptjs");

async function seed() {
  try {
    await connectDB();
    console.log("Connected to database.");

    const email = process.env.ADMIN_EMAIL || "praneethbadugu7781@gmail.com";
    const password = "change-me";
    const hashedPassword = await bcrypt.hash(password, 10);

    const userObj = {
      name: "Akhil",
      email: email,
      password: hashedPassword,
      role: "admin"
    };

    await User.findOneAndUpdate(
      { email: email },
      userObj,
      { upsert: true, new: true }
    );
    console.log("Admin user seeded successfully!");

    process.exit(0);
  } catch (error) {
    console.error("Seeding admin failed:", error);
    process.exit(1);
  }
}

seed();
