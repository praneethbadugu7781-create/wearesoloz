const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { connectDB } = require("../lib/db");
const User = require("../models/User");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    await connectDB();

    // Check env fallback credentials first
    const fallbackEmail = process.env.ADMIN_EMAIL;
    const fallbackPassword = process.env.ADMIN_PASSWORD;

    if (fallbackEmail && fallbackPassword && email === fallbackEmail) {
      const isPlainMatch = password === fallbackPassword;
      const isHashMatch = fallbackPassword.startsWith("$2")
        ? await bcrypt.compare(password, fallbackPassword)
        : false;

      if (isPlainMatch || isHashMatch) {
        const token = jwt.sign(
          { id: "admin", email: fallbackEmail, name: "Akhil", role: "admin" },
          process.env.JWT_SECRET,
          { expiresIn: "7d" }
        );
        return res.json({ token, user: { email: fallbackEmail, name: "Akhil", role: "admin" } });
      }
    }

    // Check database user
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, user: { email: user.email, name: user.name, role: user.role } });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/auth/change-password
router.post("/change-password", requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Missing fields" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters" });
    }

    await connectDB();

    const email = req.user.email.toLowerCase();
    const user = await User.findOne({ email }).select("+password");

    let isCurrentPasswordCorrect = false;

    if (user) {
      isCurrentPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
    } else {
      const fallbackPassword = process.env.ADMIN_PASSWORD;
      if (fallbackPassword) {
        if (fallbackPassword.startsWith("$2")) {
          isCurrentPasswordCorrect = await bcrypt.compare(currentPassword, fallbackPassword);
        } else {
          isCurrentPasswordCorrect = currentPassword === fallbackPassword;
        }
      }
    }

    if (!isCurrentPasswordCorrect) {
      return res.status(400).json({ error: "Incorrect current password" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.findOneAndUpdate(
      { email },
      { name: req.user.name || "Akhil", email, password: hashedPassword, role: "admin" },
      { upsert: true, new: true }
    );

    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

module.exports = router;
