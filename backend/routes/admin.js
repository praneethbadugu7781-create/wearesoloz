const express = require("express");
const ImageKit = require("imagekit");
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});
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
const Booking = require("../models/Booking");

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
  bookings: Booking,
};

const router = express.Router();

// All admin routes require authentication
router.use(requireAuth);

// --- ImageKit upload signature ---
router.post("/upload/signature", (req, res) => {
  try {
    const authParams = imagekit.getAuthenticationParameters();
    res.json({
      ...authParams,
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
    });
  } catch (error) {
    console.error("Upload signature error:", error);
    res.status(500).json({ error: "Failed to generate signature" });
  }
});

// --- Authenticated ImageKit Upload ---
router.post("/upload/file", async (req, res) => {
  try {
    const { file, fileName, folder } = req.body;
    if (!file || !fileName) {
      return res.status(400).json({ error: "Missing file or fileName in request body" });
    }
    const response = await imagekit.upload({
      file,
      fileName,
      folder: folder || "/wearesoloz"
    });
    res.json({ url: response.url });
  } catch (error) {
    console.error("Admin file upload error:", error);
    res.status(500).json({ error: error.message || "Failed to upload file to ImageKit" });
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

function callGroqApi(apiKey, payload) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(payload);
    const req = https.request({
      hostname: 'api.groq.com',
      path: '/openai/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode !== 200) {
          return reject(new Error(`Groq returned status ${res.statusCode}: ${data}`));
        }
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

router.post("/extract-itinerary", async (req, res) => {
  try {
    const { text, imageUrl } = req.body;
    if (!text && !imageUrl) {
      return res.status(400).json({ error: "Please provide either text or an imageUrl to extract itinerary details." });
    }

    const groqKey = process.env.GROQ_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    if (!groqKey && !geminiKey) {
      return res.status(400).json({
        error: "Missing API Key. Please configure either GROQ_API_KEY or GEMINI_API_KEY in your server environment variables on Render."
      });
    }

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
  "description": "Detailed, engaging summary description of the trip highlights and overall experience.",
  "itinerary": [
    {
      "day": "Day 1",
      "title": "Title of the day's activity",
      "description": "EXTREMELY DETAILED day-by-day description. DO NOT SUMMARIZE. Extract all events, specific spots, timings, activities, transportation, sightseeing locations, and schedules for this day. Be as comprehensive as possible. Keep all information."
    }
  ],
  "inclusions": [
    "Inclusion item 1",
    "Inclusion item 2"
  ]
}
`;

    // 1. Fetch image if URL is provided
    let base64 = "";
    let mimeType = "image/jpeg";
    if (imageUrl) {
      const imgData = await fetchImageAsBase64(imageUrl);
      base64 = imgData.base64;
      mimeType = imgData.mimeType;
    }

    let parsedData = null;

    // 2. Try Groq AI (Vision model if image uploaded, versatile model for text)
    if (groqKey) {
      try {
        const groqModel = imageUrl ? "llama-3.2-11b-vision-preview" : "llama-3.3-70b-versatile";
        const content = [{ type: "text", text: prompt }];
        if (imageUrl) {
          content.push({
            type: "image_url",
            image_url: {
              url: `data:${mimeType};base64,${base64}`
            }
          });
        }
        if (text) {
          content.push({
            type: "text",
            text: `Raw text reference:\n${text}`
          });
        }

        const payload = {
          model: groqModel,
          messages: [{ role: "user", content }],
          temperature: 0.1,
          response_format: { type: "json_object" }
        };

        const groqRes = await callGroqApi(groqKey, payload);
        const choiceText = groqRes.choices[0].message.content;
        parsedData = JSON.parse(choiceText.trim());
      } catch (groqErr) {
        console.error("Groq AI extraction failed, falling back to Gemini:", groqErr.message);
      }
    }

    // 3. Fallback to Gemini if Groq was not used or failed
    if (!parsedData && geminiKey) {
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      let contentParts = [prompt];
      if (imageUrl) {
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

      parsedData = JSON.parse(cleanJsonString);
    }

    res.json(parsedData);
  } catch (error) {
    console.error("AI Extractor error:", error);
    res.status(500).json({ error: error.message || "Failed to extract itinerary" });
  }
});

// --- GET Waiver Submissions for a Trip ---
router.get("/trips/:id/waivers", async (req, res) => {
  try {
    const WaiverSubmission = require("../models/WaiverSubmission");
    await connectDB();
    const waivers = await WaiverSubmission.find({ tripId: req.params.id }).sort({ createdAt: -1 }).lean();
    res.json(waivers);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- GET Feedback Submissions for a Trip ---
router.get("/trips/:id/feedbacks", async (req, res) => {
  try {
    const FeedbackSubmission = require("../models/FeedbackSubmission");
    await connectDB();
    const feedbacks = await FeedbackSubmission.find({ tripId: req.params.id }).sort({ createdAt: -1 }).lean();
    res.json(feedbacks);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- DELETE Waiver Submission ---
router.delete("/waivers/:submissionId", async (req, res) => {
  try {
    const WaiverSubmission = require("../models/WaiverSubmission");
    await connectDB();
    const result = await WaiverSubmission.findByIdAndDelete(req.params.submissionId);
    if (!result) {
      return res.status(404).json({ error: "Waiver submission not found" });
    }
    res.json({ success: true, message: "Waiver submission deleted successfully" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- RESEND Waiver Invoice Email ---
router.post("/waivers/:submissionId/resend-invoice", async (req, res) => {
  try {
    const WaiverSubmission = require("../models/WaiverSubmission");
    const Trip = require("../models/Trip");
    const { sendWaiverInvoiceEmail } = require("../lib/mailer");

    await connectDB();
    const waiver = await WaiverSubmission.findById(req.params.submissionId).lean();
    if (!waiver) {
      return res.status(404).json({ error: "Waiver submission not found" });
    }

    if (!waiver.email) {
      return res.status(400).json({ error: "Passenger has no email registered on file." });
    }

    const trip = await Trip.findById(waiver.tripId).lean();
    const sent = await sendWaiverInvoiceEmail(waiver, trip);

    if (!sent) {
      return res.status(500).json({ error: "Failed to send invoice email." });
    }

    res.json({ success: true, message: `Invoice email resent successfully to ${waiver.email}` });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- ISSUE SINGLE E-CERTIFICATE ---
router.post("/waivers/:submissionId/issue-certificate", async (req, res) => {
  try {
    const WaiverSubmission = require("../models/WaiverSubmission");
    const Trip = require("../models/Trip");
    const { sendCertificateIssuedEmail } = require("../lib/mailer");

    await connectDB();
    const waiver = await WaiverSubmission.findById(req.params.submissionId);
    if (!waiver) {
      return res.status(404).json({ error: "Waiver submission not found" });
    }

    if (!waiver.certificateId) {
      waiver.certificateId = `SLZ-CERT-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    }
    waiver.isCertificateIssued = true;
    waiver.certificateIssuedAt = new Date();
    await waiver.save();

    const trip = await Trip.findById(waiver.tripId).lean();
    const origin = req.headers.origin || "https://wearesoloz.com";
    const certUrl = `${origin}/certificate/${waiver.certificateId}`;

    let emailSent = false;
    if (waiver.email) {
      emailSent = await sendCertificateIssuedEmail(waiver, trip, certUrl);
    }

    res.json({
      success: true,
      message: `E-Certificate issued successfully for ${waiver.fullName}!`,
      certificateId: waiver.certificateId,
      certUrl,
      emailSent
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- ISSUE ALL E-CERTIFICATES FOR A TRIP ---
router.post("/trips/:tripId/issue-all-certificates", async (req, res) => {
  try {
    const WaiverSubmission = require("../models/WaiverSubmission");
    const Trip = require("../models/Trip");
    const { sendCertificateIssuedEmail } = require("../lib/mailer");

    await connectDB();
    const trip = await Trip.findById(req.params.tripId).lean();
    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    const waivers = await WaiverSubmission.find({ tripId: req.params.tripId });
    if (waivers.length === 0) {
      return res.status(400).json({ error: "No waiver submissions found for this trip." });
    }

    const origin = req.headers.origin || "https://wearesoloz.com";
    let count = 0;

    for (const waiver of waivers) {
      if (!waiver.certificateId) {
        waiver.certificateId = `SLZ-CERT-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      }
      waiver.isCertificateIssued = true;
      waiver.certificateIssuedAt = new Date();
      await waiver.save();

      const certUrl = `${origin}/certificate/${waiver.certificateId}`;
      if (waiver.email) {
        sendCertificateIssuedEmail(waiver, trip, certUrl).catch(console.error);
      }
      count++;
    }

    res.json({
      success: true,
      message: `Successfully issued ${count} E-Certificates for ${trip.title || trip.destination}!`
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- DELETE Feedback Submission ---
router.delete("/feedbacks/:submissionId", async (req, res) => {
  try {
    const FeedbackSubmission = require("../models/FeedbackSubmission");
    await connectDB();
    const result = await FeedbackSubmission.findByIdAndDelete(req.params.submissionId);
    if (!result) {
      return res.status(404).json({ error: "Feedback submission not found" });
    }
    res.json({ success: true, message: "Feedback submission deleted successfully" });
  } catch (e) {
    res.status(500).json({ error: e.message });
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

    if (req.params.resource === "trips" && record && record.destination) {
      const updateData = {};
      if (req.body.price !== undefined) updateData.price = record.price;
      if (req.body.batches !== undefined) updateData.batches = record.batches;
      if (Object.keys(updateData).length > 0) {
        await Trip.updateMany({ destination: record.destination }, { $set: updateData }).catch(console.error);
      }
    }

    res.json(record);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PayU Live Status Sync Endpoint for Admin Bookings Panel
router.post("/bookings/sync-payu", async (req, res) => {
  try {
    await connectDB();
    const { txnid, bookingId } = req.body || {};
    const key = process.env.PAYU_MERCHANT_KEY || "";
    const salt = process.env.PAYU_SALT || "";

    if (!key || !salt) {
      return res.status(500).json({ error: "PayU Merchant Key and Salt must be configured on server." });
    }

    let query = {};
    if (txnid || bookingId) {
      query = { $or: [{ payuTxnId: txnid || bookingId }, { bookingId: bookingId || txnid }] };
    } else {
      query = { status: "PENDING" };
    }

    const bookingsToSync = await Booking.find(query).limit(50);
    if (bookingsToSync.length === 0) {
      return res.json({ success: true, message: "No bookings available to sync.", updatedCount: 0 });
    }

    const txnIdsArray = bookingsToSync.map((b) => b.payuTxnId).filter(Boolean);
    if (txnIdsArray.length === 0) {
      return res.json({ success: true, message: "No valid PayU transaction IDs found.", updatedCount: 0 });
    }

    const var1Str = txnIdsArray.join("|");
    const command = "verify_payment";
    const crypto = require("crypto");
    const hashSeq = `${key}|${command}|${var1Str}|${salt}`;
    const hash = crypto.createHash("sha512").update(hashSeq).digest("hex");

    const params = new URLSearchParams();
    params.append("key", key);
    params.append("command", command);
    params.append("var1", var1Str);
    params.append("hash", hash);

    const payuRes = await fetch("https://info.payu.in/merchant/postfinalpage.php?form=2", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString()
    });

    const payuData = await payuRes.json();
    let updatedCount = 0;
    const results = [];

    if (payuData && payuData.transaction_details) {
      for (const b of bookingsToSync) {
        const details = payuData.transaction_details[b.payuTxnId];
        if (details) {
          const statusStr = (details.status || "").toLowerCase();
          const unmapped = (details.unmappedstatus || "").toLowerCase();

          let newStatus = b.status;
          if (statusStr === "success" || unmapped === "captured") {
            newStatus = "PAID";
          } else if (statusStr === "usercancelled" || unmapped === "usercancelled" || statusStr === "cancelled") {
            newStatus = "CANCELLED";
          } else if (statusStr === "failure" || statusStr === "failed" || unmapped === "failed") {
            newStatus = "FAILED";
          }

          b.payuStatus = details.status || b.payuStatus;
          b.payuUnmappedStatus = details.unmappedstatus || b.payuUnmappedStatus;
          b.paymentMode = details.mode || details.card_type || details.bankcode || b.paymentMode;
          b.bankRefNum = details.bank_ref_num || b.bankRefNum;
          b.payuErrorMsg = details.error_Message || details.field9 || b.payuErrorMsg;
          if (details.mihpayid) b.payuMihpayid = details.mihpayid;

          if (newStatus !== b.status) {
            b.status = newStatus;
            if (newStatus === "PAID" && !b.paidAt) b.paidAt = new Date();
            updatedCount++;
          }

          await b.save();
          results.push({ bookingId: b.bookingId, status: b.status, mode: b.paymentMode, bankRefNum: b.bankRefNum });
        }
      }
    }

    res.json({
      success: true,
      message: `Checked ${bookingsToSync.length} booking(s) with PayU servers. Updated ${updatedCount} status(es).`,
      updatedCount,
      results
    });
  } catch (error) {
    console.error("Error syncing PayU status in admin:", error);
    res.status(500).json({ error: error.message || "Failed to sync status with PayU" });
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
