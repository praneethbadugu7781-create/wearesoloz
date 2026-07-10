const express = require("express");
const cloudinary = require("cloudinary").v2;
const { connectDB } = require("../lib/db");
const { requireAuth } = require("../middleware/auth");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const https = require("https");

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
const MemoryPost = require("../models/MemoryPost");

const { sendFarmerApprovalEmail, sendFarmerRejectionEmail, sendCareerReviewedEmail, sendCareerRejectionEmail, sendContactStatusEmail, sendContactApprovalEmail } = require("../lib/mailer");

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
  memories: MemoryPost,
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

// GET /api/admin/trips/:tripId/memories
router.get("/trips/:tripId/memories", async (req, res) => {
  try {
    await connectDB();
    const records = await MemoryPost.find({ tripId: req.params.tripId }).sort({ createdAt: -1 }).lean();
    res.json(records);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- AI Itinerary Extractor ---
function fetchImageAsBase64(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to get image, status code: ${res.statusCode}`));
      }
      const mimeType = res.headers["content-type"] || "image/jpeg";
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => {
        const buffer = Buffer.concat(chunks);
        resolve({
          base64: buffer.toString("base64"),
          mimeType
        });
      });
    }).on("error", reject);
  });
}

router.post("/extract-itinerary", async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(400).json({
        error: "Missing GEMINI_API_KEY in environment. Please add it to your server configuration on Render."
      });
    }

    const { text, imageUrl } = req.body;
    if (!text && !imageUrl) {
      return res.status(400).json({ error: "Please provide either text or an imageUrl to extract itinerary details." });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
You are an expert travel assistant. Analyze the provided image or text of a travel itinerary/trip poster and extract the trip details in the following JSON format. Do not return any other text, markdown formatting, or HTML wrappers. Return ONLY raw JSON.

JSON Schema:
{
  "destination": "Name of the destination/trip",
  "state": "State in India (or country if international)",
  "category": "One of: Temples, Treks, Adventure",
  "duration": "Duration description, e.g., '2 Days / 1 Night' or '6D / 5N'",
  "price": "Price value, e.g., '18,999' or 'Contact for Price'",
  "seats": 10,
  "description": "Short summary description of the trip highlights",
  "itinerary": [
    {
      "day": "Day 1",
      "title": "Title of the day's activity",
      "description": "Description of what travelers will do on this day"
    }
  ],
  "inclusions": [
    "Inclusion item 1",
    "Inclusion item 2"
  ]
}
`;

    let contentParts = [prompt];

    if (imageUrl) {
      const { base64, mimeType } = await fetchImageAsBase64(imageUrl);
      contentParts.push({
        inlineData: {
          data: base64,
          mimeType: mimeType
        }
      });
    }

    if (text) {
      contentParts.push(text);
    }

    const result = await model.generateContent(contentParts);
    const responseText = await result.response.text();

    const cleanJsonString = responseText
      .replace(/^```json\s*/i, "")
      .replace(/```\s*$/, "")
      .trim();

    const parsedData = JSON.parse(cleanJsonString);
    res.json(parsedData);
  } catch (error) {
    console.error("AI Extractor error:", error);
    res.status(500).json({ error: error.message || "Failed to extract itinerary" });
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
    if (req.params.resource === "careers" && prevRecord.status !== "Rejected" && record.status === "Rejected") {
      sendCareerRejectionEmail(record, req.body.rejectionReason || "Profile criteria mismatch / incomplete details").catch(console.error);
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
