const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { connectDB } = require("../lib/db");
const User = require("../models/User");
const { requireAuth } = require("../middleware/auth");
const { sendOtpEmail, sendEmailChangeOtp } = require("../lib/mailer");

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
    const fallbackEmail = process.env.ADMIN_EMAIL || "praneethbadugu7781@gmail.com";
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

// POST /api/auth/change-email
router.post("/change-email", requireAuth, async (req, res) => {
  try {
    const { newEmail, password } = req.body;
    if (!newEmail || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const emailLower = newEmail.toLowerCase().trim();
    const currentEmail = req.user.email.toLowerCase();

    await connectDB();

    let user = await User.findOne({ email: currentEmail }).select("+password");

    let isPasswordCorrect = false;

    if (user) {
      isPasswordCorrect = await bcrypt.compare(password, user.password);
    } else {
      const fallbackPassword = process.env.ADMIN_PASSWORD;
      if (fallbackPassword) {
        if (fallbackPassword.startsWith("$2")) {
          isPasswordCorrect = await bcrypt.compare(password, fallbackPassword);
        } else {
          isPasswordCorrect = password === fallbackPassword;
        }
      }
    }

    if (!isPasswordCorrect) {
      return res.status(400).json({ error: "Incorrect passcode" });
    }

    // Check if new email is already taken by another user
    const existing = await User.findOne({ email: emailLower });
    if (existing && (!user || existing._id.toString() !== user._id.toString())) {
      return res.status(400).json({ error: "Email is already in use by another account" });
    }

    // Generate 6-digit OTP verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    if (user) {
      user.pendingEmail = emailLower;
      user.pendingOtpCode = verificationCode;
      user.pendingOtpExpiresAt = otpExpiresAt;
      await user.save();
    } else {
      // Create user record in DB with temporary credentials so we can save pending OTP details
      const fallbackPassword = process.env.ADMIN_PASSWORD || "change-me";
      const hashedPassword = fallbackPassword.startsWith("$2")
        ? fallbackPassword
        : await bcrypt.hash(fallbackPassword, 10);
        
      user = await User.create({
        name: "Akhil",
        email: currentEmail,
        password: hashedPassword,
        role: "admin",
        pendingEmail: emailLower,
        pendingOtpCode: verificationCode,
        pendingOtpExpiresAt: otpExpiresAt
      });
    }

    // Send verification code to the new email address
    await sendEmailChangeOtp(emailLower, verificationCode);

    res.json({ success: true, message: "A verification code has been sent to your new email address." });
  } catch (error) {
    console.error("Change email error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// POST /api/auth/verify-change-email
router.post("/verify-change-email", requireAuth, async (req, res) => {
  try {
    const { otp } = req.body;
    if (!otp) {
      return res.status(400).json({ error: "Verification code is required" });
    }

    const currentEmail = req.user.email.toLowerCase();

    await connectDB();

    const user = await User.findOne({ email: currentEmail });
    if (!user || !user.pendingEmail) {
      return res.status(400).json({ error: "No pending email change request found" });
    }

    if (!user.pendingOtpCode || user.pendingOtpCode !== otp.trim()) {
      return res.status(400).json({ error: "Invalid verification code" });
    }

    if (new Date() > user.pendingOtpExpiresAt) {
      return res.status(400).json({ error: "Verification code has expired. Please request a new code." });
    }

    const newEmail = user.pendingEmail;

    user.email = newEmail;
    user.pendingEmail = undefined;
    user.pendingOtpCode = undefined;
    user.pendingOtpExpiresAt = undefined;
    await user.save();

    res.json({ success: true, message: "Admin email verified and updated successfully. Please log in again." });
  } catch (error) {
    console.error("Verify change email error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// POST /api/auth/forgot-password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const emailLower = email.toLowerCase();
    const fallbackEmail = (process.env.ADMIN_EMAIL || "praneethbadugu7781@gmail.com").toLowerCase();

    await connectDB();

    // Check if user exists in DB or matches the fallback email
    let user = await User.findOne({ email: emailLower });
    if (!user) {
      if (emailLower === fallbackEmail) {
        // Create user in DB so we can assign OTP fields
        const tempPassword = await bcrypt.hash(Math.random().toString(36), 10);
        user = await User.create({
          name: "Akhil",
          email: emailLower,
          password: tempPassword,
          role: "admin",
        });
      } else {
        return res.status(400).json({ error: "Invalid admin email address" });
      }
    }

    // Generate 6-digit OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    user.otpCode = otpCode;
    user.otpExpiresAt = otpExpiresAt;
    await user.save();

    // Send the email
    await sendOtpEmail(user.email, otpCode);

    res.json({ success: true, message: "A 6-digit OTP code has been sent to your email." });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/auth/reset-password
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: "All fields are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: "New passcode must be at least 6 characters" });
    }

    const emailLower = email.toLowerCase();
    await connectDB();

    const user = await User.findOne({ email: emailLower });
    if (!user) {
      return res.status(400).json({ error: "Invalid request" });
    }

    if (!user.otpCode || user.otpCode !== otp.trim()) {
      return res.status(400).json({ error: "Invalid OTP code" });
    }

    if (new Date() > user.otpExpiresAt) {
      return res.status(400).json({ error: "OTP has expired. Please request a new one." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.otpCode = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    res.json({ success: true, message: "Passcode reset successfully. You can now log in." });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
