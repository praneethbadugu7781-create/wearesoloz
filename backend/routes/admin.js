const express = require("express");
const cloudinary = require("cloudinary").v2;
const { connectDB } = require("../lib/db");
const { requireAuth } = require("../middleware/auth");

const Trip = require("../models/Trip");
const Destination = require("../models/Destination");
const Blog = require("../models/Blog");
const Gallery = require("../models/Gallery");
const Testimonial = require("../models/Testimonial");
const Contact = require("../models/Contact");
const SiteSetting = require("../models/SiteSetting");
const Career = require("../models/Career");
const Farmer = require("../models/Farmer");
const Reel = require("../models/Reel");

const { sendFarmerApprovalEmail, sendFarmerRejectionEmail, sendCareerReviewedEmail, sendContactStatusEmail, sendContactApprovalEmail } = require("../lib/mailer");

const models = {
  trips: Trip,
  destinations: Destination,
  blogs: Blog,
  gallery: Gallery,
  testimonials: Testimonial,
  contacts: Contact,
  site_settings: SiteSetting,
  careers: Career,
  farmers: Farmer,
  reels: Reel,
};

const router = express.Router();

// All admin routes require authentication
router.use(requireAuth);

// --- Cloudinary upload signature ---
router.post("/upload/signature", (req, res) => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const timestamp = Math.round(Date.now() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder: "wearesoloz" },
      process.env.CLOUDINARY_API_SECRET
    );

    res.json({
      timestamp,
      signature,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      folder: "wearesoloz",
    });
  } catch (error) {
    console.error("Upload signature error:", error);
    res.status(500).json({ error: "Failed to generate signature" });
  }
});

// --- Generic CRUD ---

// GET /api/admin/:resource
router.get("/:resource", async (req, res) => {
  try {
    const Model = models[req.params.resource];
    if (!Model) return res.status(404).json({ error: "Unknown resource" });
    await connectDB();
    const records = await Model.find().sort({ createdAt: -1 }).lean();
    res.json(records);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/admin/:resource
router.post("/:resource", async (req, res) => {
  try {
    const Model = models[req.params.resource];
    if (!Model) return res.status(404).json({ error: "Unknown resource" });
    await connectDB();
    const record = await Model.create(req.body);
    res.status(201).json(record);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PATCH /api/admin/:resource/:id
router.patch("/:resource/:id", async (req, res) => {
  try {
    const Model = models[req.params.resource];
    if (!Model) return res.status(404).json({ error: "Unknown resource" });
    await connectDB();

    const prevRecord = await Model.findById(req.params.id).lean();
    if (!prevRecord) return res.status(404).json({ error: "Not found" });

    const record = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!record) return res.status(404).json({ error: "Not found" });

    // Send emails on status change to Approved/Reviewed/Contacted/Closed/Rejected
    if (req.params.resource === "farmers" && prevRecord.status !== "Approved" && record.status === "Approved") {
      sendFarmerApprovalEmail(record).catch(console.error);
    }
    if (req.params.resource === "farmers" && prevRecord.status !== "Rejected" && record.status === "Rejected") {
      sendFarmerRejectionEmail(record, req.body.rejectionReason || "Criteria mismatch / incomplete details").catch(console.error);
    }
    if (req.params.resource === "careers" && prevRecord.status !== "Reviewed" && record.status === "Reviewed") {
      sendCareerReviewedEmail(record).catch(console.error);
    }
    if (req.params.resource === "contacts" && prevRecord.status !== record.status) {
      if (record.status === "contacted" || record.status === "closed") {
        sendContactStatusEmail(record, record.status).catch(console.error);
      } else if (record.status === "approved") {
        sendContactApprovalEmail(record).catch(console.error);
      }
    }

    res.json(record);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/admin/:resource/:id
router.delete("/:resource/:id", async (req, res) => {
  try {
    const Model = models[req.params.resource];
    if (!Model) return res.status(404).json({ error: "Unknown resource" });
    await connectDB();
    await Model.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
