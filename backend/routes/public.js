const express = require("express");
const ImageKit = require("imagekit");
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});
const { connectDB } = require("../lib/db");
const Trip = require("../models/Trip");
const Destination = require("../models/Destination");
const Blog = require("../models/Blog");
const Gallery = require("../models/Gallery");
const Testimonial = require("../models/Testimonial");
const Contact = require("../models/Contact");
const SiteSetting = require("../models/SiteSetting");
const Career = require("../models/Career");
const Farmer = require("../models/Farmer");
const jwt = require("jsonwebtoken");
const MemoryPost = require("../models/MemoryPost");
const { sendTripMemoryOtpEmail } = require("../lib/mailer");

const router = express.Router();

// --- Trips ---
router.get("/trips", async (req, res) => {
  try {
    await connectDB();
    const filter = req.query.all === "true" ? {} : { status: "published" };
    const trips = await Trip.find(filter).sort({ date: 1 }).lean();
    res.json(trips);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get("/trips/:slug", async (req, res) => {
  try {
    await connectDB();
    let trip = await Trip.findOne({ slug: req.params.slug }).lean();

    if (!trip) {
      const rawName = req.params.slug.replace(/-\d{4}-\d{2}-\d{2}.*$/, "").replace(/-/g, " ");
      trip = await Trip.findOne({ destination: { $regex: new RegExp(rawName, "i") } }).sort({ updatedAt: -1 }).lean();
    }

    if (!trip) return res.status(404).json({ error: "Trip not found" });

    // Sync latest price and batches from destination's most recently updated record
    const latestTrip = await Trip.findOne({ destination: trip.destination }).sort({ updatedAt: -1 }).lean();
    if (latestTrip && latestTrip.price) {
      trip.price = latestTrip.price;
      if (latestTrip.batches && latestTrip.batches.length > 0) {
        trip.batches = latestTrip.batches;
      }
    }

    res.json(trip);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- Destinations ---
router.get("/destinations", async (req, res) => {
  try {
    await connectDB();
    const destinations = await Destination.find({ featured: true }).sort({ createdAt: -1 }).lean();
    res.json(destinations);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- Blogs ---
router.get("/blogs", async (req, res) => {
  try {
    await connectDB();
    const blogs = await Blog.find({ status: "published" }).sort({ createdAt: -1 }).lean();
    res.json(blogs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get("/blogs/:slug", async (req, res) => {
  try {
    await connectDB();
    const blog = await Blog.findOne({ slug: req.params.slug }).lean();
    if (!blog) return res.status(404).json({ error: "Blog not found" });
    res.json(blog);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- Testimonials ---
router.get("/testimonials", async (req, res) => {
  try {
    await connectDB();
    const testimonials = await Testimonial.find().sort({ createdAt: -1 }).lean();
    res.json(testimonials);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/testimonials", async (req, res) => {
  try {
    const { name, quote, rating, location, role } = req.body;
    if (!name || name.length < 2) return res.status(400).json({ error: "Name must be at least 2 characters" });
    if (!quote || quote.length < 5) return res.status(400).json({ error: "Feedback must be at least 5 characters" });

    await connectDB();
    const newTestimonial = await Testimonial.create({
      name,
      quote,
      rating: Number(rating) || 5,
      location: location || "",
      role: role || "Solo Traveller",
      avatar: ""
    });

    res.status(201).json(newTestimonial);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- Gallery ---
router.get("/gallery", async (req, res) => {
  try {
    await connectDB();
    const gallery = await Gallery.find().sort({ createdAt: -1 }).lean();
    res.json(gallery);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- Reels ---
router.get("/reels", async (req, res) => {
  try {
    await connectDB();
    const Reel = require("../models/Reel");
    const reels = await Reel.find().sort({ createdAt: -1 }).lean();
    res.json(reels);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- Site Settings ---
router.get("/settings/:key", async (req, res) => {
  try {
    await connectDB();
    const setting = await SiteSetting.findOne({ key: req.params.key }).lean();
    res.json(setting ? setting.value : {});
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- Contacts (public submit) ---
const { 
  sendContactEmail, 
  sendCareerEmail, 
  sendFarmerApplicationEmail,
  sendContactReceiptEmail,
  sendCareerReceiptEmail,
  sendFarmerReceiptEmail
} = require("../lib/mailer");

router.post("/contacts", async (req, res) => {
  try {
    const { fullName, mobile, email, age, bloodGroup, destination, message } = req.body;
    if (!fullName || fullName.length < 2) return res.status(400).json({ error: "Full name must be at least 2 characters" });
    if (!mobile || mobile.length < 7) return res.status(400).json({ error: "Invalid mobile number" });
    if (!email) return res.status(400).json({ error: "Email is required" });
    if (!age || isNaN(Number(age)) || Number(age) < 18 || Number(age) > 100) return res.status(400).json({ error: "Please enter a valid age (18 or older)" });
    if (!bloodGroup) return res.status(400).json({ error: "Blood group is required" });
    if (!message || message.length < 5) return res.status(400).json({ error: "Message must be at least 5 characters" });

    await connectDB();
    const contact = await Contact.create({ fullName, mobile, email, age: Number(age), bloodGroup, destination, message });

    // Send email notifications asynchronously
    sendContactEmail({ fullName, mobile, email, age: Number(age), bloodGroup, destination, message }).catch(console.error);
    sendContactReceiptEmail({ fullName, email, destination }).catch(console.error);

    res.status(201).json(contact);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- Careers (public submit) ---
router.post("/careers", async (req, res) => {
  try {
    const { fullName, gender, age, bloodGroup, email, mobile, instagram, resume, experience, whyJoin } = req.body;
    if (!fullName || fullName.length < 2) return res.status(400).json({ error: "Full name must be at least 2 characters" });
    if (!gender || !["Male", "Female", "Other"].includes(gender)) return res.status(400).json({ error: "Please select a valid gender" });
    if (!age || isNaN(Number(age)) || Number(age) < 18 || Number(age) > 100) return res.status(400).json({ error: "Please enter a valid age (18 or older)" });
    if (!bloodGroup) return res.status(400).json({ error: "Blood group is required" });
    if (!email) return res.status(400).json({ error: "Email is required" });
    if (!mobile || mobile.length < 7) return res.status(400).json({ error: "Please enter a valid mobile number" });
    if (!experience || experience.length < 10) return res.status(400).json({ error: "Travel experience must be at least 10 characters" });
    if (!whyJoin || whyJoin.length < 10) return res.status(400).json({ error: "Statement must be at least 10 characters" });

    await connectDB();
    const career = await Career.create({
      fullName,
      gender,
      age: Number(age),
      bloodGroup,
      email,
      mobile,
      instagram: instagram || "",
      resume: resume || "",
      experience,
      whyJoin,
    });

    // Send email notifications asynchronously
    sendCareerEmail({
      fullName,
      gender,
      age: Number(age),
      bloodGroup,
      email,
      mobile,
      instagram: instagram || "",
      resume: resume || "",
      experience,
      whyJoin,
    }).catch(console.error);
    sendCareerReceiptEmail({ fullName, email }).catch(console.error);

    res.status(201).json(career);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Telangana",
  "Karnataka",
  "Kerala",
  "Tamil Nadu",
  "Maharashtra",
  "Goa",
  "Gujarat",
  "Rajasthan",
  "Madhya Pradesh",
  "Uttar Pradesh",
  "Delhi",
  "Punjab",
  "Haryana",
  "Bihar",
  "West Bengal",
  "Odisha",
  "Assam",
  "Himachal Pradesh",
  "Uttarakhand",
  "Jammu & Kashmir",
  "Jharkhand",
  "Chhattisgarh",
  "Tripura",
  "Manipur",
  "Meghalaya",
  "Nagaland",
  "Mizoram",
  "Arunachal Pradesh",
  "Sikkim",
  "Puducherry"
];

function isGibberish(str) {
  if (!str) return false;
  // Check if any character repeats 4 or more times consecutively
  if (/(.)\1{3,}/.test(str.toLowerCase())) return true;
  // Check if unique characters are too low
  if (str.length >= 10) {
    const uniqueChars = new Set(str.toLowerCase().replace(/[^a-z]/g, "")).size;
    if (uniqueChars < 3) return true;
  }
  return false;
}

// --- Farmers (public submit) ---
router.post("/farmers", async (req, res) => {
  try {
    const { fullName, gender, bloodGroup, age, email, mobile, state, district, farmingType, cropType, landSize, whyJoin, farmingImages } = req.body;

    // Full name validation
    const cleanName = (fullName || "").trim();
    if (!cleanName || cleanName.length < 3) return res.status(400).json({ error: "Full name must be at least 3 characters" });
    if (!/^[a-zA-Z\s]+$/.test(cleanName)) return res.status(400).json({ error: "Full name must contain only letters and spaces" });
    if (!cleanName.includes(" ")) return res.status(400).json({ error: "Please enter both your first name and last name" });
    if (isGibberish(cleanName)) return res.status(400).json({ error: "Please enter a valid name (repeated letters or random symbols are not allowed)" });

    // Gender validation
    if (!gender || !["Male", "Female", "Other"].includes(gender)) return res.status(400).json({ error: "Please select a valid gender" });

    // Blood Group validation
    if (!bloodGroup) return res.status(400).json({ error: "Blood group is required" });

    // Age validation
    const ageNum = Number(age);
    if (!age || isNaN(ageNum) || ageNum < 18 || ageNum > 100) return res.status(400).json({ error: "Please enter a valid age (18 or older)" });

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test((email || "").trim())) return res.status(400).json({ error: "Please enter a valid email address" });

    // Mobile validation
    const phoneRegex = /^[+]?[0-9\s\-]{7,15}$/;
    if (!mobile || !phoneRegex.test((mobile || "").trim())) return res.status(400).json({ error: "Please enter a valid mobile number" });

    // State validation
    if (!state || !INDIAN_STATES.includes(state)) return res.status(400).json({ error: "Please select a valid Indian state" });

    // District validation
    const cleanDistrict = (district || "").trim();
    if (!cleanDistrict || cleanDistrict.length < 3) return res.status(400).json({ error: "District name must be at least 3 characters" });
    if (!/^[a-zA-Z\s]+$/.test(cleanDistrict)) return res.status(400).json({ error: "District name must contain only letters and spaces" });
    if (isGibberish(cleanDistrict)) return res.status(400).json({ error: "Please enter a valid district name" });

    // Farming category validation
    const farmingTypes = ["Crop Farming", "Organic Farming", "Dairy Farming", "Horticulture", "Poultry Farming", "Mixed Farming", "Other"];
    if (!farmingType || !farmingTypes.includes(farmingType)) return res.status(400).json({ error: "Please select a valid farming category" });

    // Crops Grown validation
    const cleanCropType = (cropType || "").trim();
    if (!cleanCropType || cleanCropType.length < 3) return res.status(400).json({ error: "Crops grown must be at least 3 characters" });
    if (!/^[a-zA-Z0-9\s,]+$/.test(cleanCropType)) return res.status(400).json({ error: "Crops field must contain only letters, numbers, spaces, and commas" });
    if (isGibberish(cleanCropType)) return res.status(400).json({ error: "Please enter valid crops names" });

    // Land holding size validation
    const landSizes = ["Less than 2 acres", "2 to 5 acres", "More than 5 acres"];
    if (!landSize || !landSizes.includes(landSize)) return res.status(400).json({ error: "Please select a valid land holding size" });

    // Motivation (whyJoin) validation
    const cleanWhyJoin = (whyJoin || "").trim();
    if (!cleanWhyJoin || cleanWhyJoin.length < 20) return res.status(400).json({ error: "Motivation explanation must be at least 20 characters" });
    if (isGibberish(cleanWhyJoin)) return res.status(400).json({ error: "Please enter a valid explanation (no repeated text/gibberish)" });

    // Farming images validation
    if (!farmingImages || !Array.isArray(farmingImages) || farmingImages.length === 0) {
      return res.status(400).json({ error: "Please upload at least one farming image" });
    }

    await connectDB();
    const farmer = await Farmer.create({
      fullName: cleanName,
      gender,
      bloodGroup,
      age: Number(age),
      email: email.trim(),
      mobile: mobile.trim(),
      state,
      district: cleanDistrict,
      farmingType,
      cropType: cleanCropType,
      landSize,
      whyJoin: cleanWhyJoin,
      farmingImages: farmingImages
    });

    // Send email notifications asynchronously
    sendFarmerApplicationEmail({
      fullName,
      gender,
      bloodGroup,
      age: Number(age),
      email,
      mobile,
      state,
      district,
      farmingType,
      cropType,
      landSize,
      whyJoin
    }).catch(console.error);
    sendFarmerReceiptEmail({ fullName, email, mobile }).catch(console.error);

    res.status(201).json(farmer);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- Public ImageKit Upload Signature ---
router.post("/upload/signature-public", (req, res) => {
  try {
    const authParams = imagekit.getAuthenticationParameters();
    res.json({
      ...authParams,
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
    });
  } catch (error) {
    console.error("Public upload signature error:", error);
    res.status(500).json({ error: "Failed to generate signature" });
  }
});

// --- Public ImageKit Upload ---
router.post("/upload/file-public", async (req, res) => {
  try {
    const { file, fileName } = req.body;
    if (!file || !fileName) {
      return res.status(400).json({ error: "Missing file or fileName in request body" });
    }
    const response = await imagekit.upload({
      file,
      fileName,
      folder: "/wearesoloz"
    });
    res.json({ url: response.url });
  } catch (error) {
    console.error("Public file upload error:", error);
    res.status(500).json({ error: error.message || "Failed to upload file to ImageKit" });
  }
});

// --- Trip Memories scrapbook APIs ---

const otps = new Map();

// OTP Request
router.post("/memories/otp/request", async (req, res) => {
  try {
    const { tripId, email } = req.body;
    if (!tripId || !email) {
      return res.status(400).json({ error: "Trip ID and email address are required" });
    }

    await connectDB();
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    const cleanedEmail = email.trim().toLowerCase();

    const participant = trip.participants.find(p => {
      return p.email && p.email.trim().toLowerCase() === cleanedEmail;
    });

    if (!participant) {
      return res.status(400).json({ error: "This email address is not registered as a participant for this trip." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000;
    otps.set(`${cleanedEmail}_${tripId}`, { otp, expiresAt, name: participant.name });

    console.log(`\n[OTP VERIFICATION CODE] For participant: ${participant.name} (${email}) on trip "${trip.destination}" -> code is: ${otp}\n`);

    // Trigger actual email via Resend
    await sendTripMemoryOtpEmail(cleanedEmail, participant.name, trip.destination, otp);

    res.json({
      success: true,
      message: "OTP sent successfully."
    });
  } catch (err) {
    console.error("OTP request error:", err);
    res.status(500).json({ error: err.message });
  }
});

// OTP Verify
router.post("/memories/otp/verify", async (req, res) => {
  try {
    const { tripId, email, otp } = req.body;
    if (!tripId || !email || !otp) {
      return res.status(400).json({ error: "Trip ID, email, and OTP are required" });
    }

    const cleanedEmail = email.trim().toLowerCase();
    const otpRecord = otps.get(`${cleanedEmail}_${tripId}`);

    if (!otpRecord) {
      return res.status(400).json({ error: "No verification request found for this email address" });
    }

    if (Date.now() > otpRecord.expiresAt) {
      otps.delete(`${cleanedEmail}_${tripId}`);
      return res.status(400).json({ error: "OTP has expired. Please request a new one." });
    }

    if (otpRecord.otp !== otp.trim()) {
      return res.status(400).json({ error: "Invalid verification code. Please try again." });
    }

    const token = jwt.sign(
      { tripId, email: cleanedEmail, name: otpRecord.name, role: "participant" },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    otps.delete(`${cleanedEmail}_${tripId}`);

    res.json({
      success: true,
      token,
      name: otpRecord.name,
      email: cleanedEmail
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Completed Trips
router.get("/memories/completed-trips", async (req, res) => {
  try {
    await connectDB();
    const trips = await Trip.find({
      date: { $lt: new Date() },
      status: "published"
    }).sort({ date: -1 }).lean();

    const tripsWithCounts = await Promise.all(trips.map(async (trip) => {
      const posts = await MemoryPost.find({ tripId: trip._id }).lean();
      const memoriesCount = posts.length;
      const photosCount = posts.reduce((sum, p) => sum + (p.photos?.length || 0), 0);
      return {
        ...trip,
        memoriesCount,
        photosCount
      };
    }));

    res.json(tripsWithCounts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Traveler Memory Posts for a Trip
router.get("/memories/trips/:tripId/posts", async (req, res) => {
  try {
    await connectDB();
    const posts = await MemoryPost.find({ tripId: req.params.tripId })
      .sort({ createdAt: -1 })
      .lean();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Helper Middleware for checking Participant JWT
const verifyParticipantToken = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access denied. Verification token required" });
  }
  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "participant") {
      return res.status(403).json({ error: "Invalid role inside session token" });
    }
    req.participant = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Session expired, please re-verify" });
  }
};

// Create traveler memory post
router.post("/memories/posts", verifyParticipantToken, async (req, res) => {
  try {
    const { tripId, title, text, photos } = req.body;
    if (!tripId || !text) {
      return res.status(400).json({ error: "Trip ID and memory text are required" });
    }

    if (req.participant.tripId !== tripId) {
      return res.status(403).json({ error: "Forbidden. Verified trip mismatch" });
    }

    await connectDB();
    const post = await MemoryPost.create({
      tripId,
      title: title || "",
      text,
      photos: photos || [],
      authorName: req.participant.name,
      authorEmail: req.participant.email,
      likes: [],
      comments: []
    });

    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle Like on Post
router.post("/memories/posts/:postId/like", verifyParticipantToken, async (req, res) => {
  try {
    const { tripId } = req.body;
    if (req.participant.tripId !== tripId) {
      return res.status(403).json({ error: "Forbidden. Verified trip mismatch" });
    }

    await connectDB();
    const post = await MemoryPost.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const email = req.participant.email;
    const index = post.likes.indexOf(email);

    if (index === -1) {
      post.likes.push(email);
    } else {
      post.likes.splice(index, 1);
    }

    await post.save();
    res.json({ success: true, likes: post.likes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add Comment on Post
router.post("/memories/posts/:postId/comment", verifyParticipantToken, async (req, res) => {
  try {
    const { tripId, text } = req.body;
    if (!text || text.trim() === "") {
      return res.status(400).json({ error: "Comment text is required" });
    }
    if (req.participant.tripId !== tripId) {
      return res.status(403).json({ error: "Forbidden. Verified trip mismatch" });
    }

    await connectDB();
    const post = await MemoryPost.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const newComment = {
      authorName: req.participant.name,
      authorEmail: req.participant.email,
      text: text.trim(),
      createdAt: new Date()
    };

    post.comments.push(newComment);
    await post.save();

    res.status(201).json(newComment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle Like on Trip
router.post("/memories/trips/:tripId/like", verifyParticipantToken, async (req, res) => {
  try {
    if (req.participant.tripId !== req.params.tripId) {
      return res.status(403).json({ error: "Forbidden. Verified trip mismatch" });
    }

    await connectDB();
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) return res.status(404).json({ error: "Trip not found" });

    const email = req.participant.email;
    const index = trip.likes.indexOf(email);

    if (index === -1) {
      trip.likes.push(email);
    } else {
      trip.likes.splice(index, 1);
    }

    await trip.save();
    res.json({ success: true, likes: trip.likes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add Comment on Trip
router.post("/memories/trips/:tripId/comment", verifyParticipantToken, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.trim() === "") {
      return res.status(400).json({ error: "Comment text is required" });
    }
    if (req.participant.tripId !== req.params.tripId) {
      return res.status(403).json({ error: "Forbidden. Verified trip mismatch" });
    }

    await connectDB();
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) return res.status(404).json({ error: "Trip not found" });

    const newComment = {
      authorName: req.participant.name,
      authorEmail: req.participant.email,
      text: text.trim(),
      createdAt: new Date()
    };

    trip.comments.push(newComment);
    await trip.save();

    res.status(201).json(newComment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Public AI Chat ---
router.post("/ai/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Please provide a valid messages array." });
    }

    const groqKey = process.env.GROQ_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    if (!groqKey && !geminiKey) {
      return res.status(500).json({ error: "AI services are not configured on this server." });
    }

    await connectDB();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const trips = await Trip.find({
      status: "published",
      date: { $gte: today }
    }).lean();
    
    const tripsContext = trips.map(t => {
      return `- Trip Title: ${t.title || `${t.destination} Expedition`}
  Destination: ${t.destination}
  State: ${t.state || "India"}
  Category: ${t.category}
  Duration: ${t.duration}
  Price: INR ${t.price}
  Seats Left: ${t.seats}
  Date: ${t.date ? new Date(t.date).toDateString() : "N/A"}
  Highlights: ${t.description}
  Inclusions: ${t.inclusions ? t.inclusions.slice(0, 10).join(", ") : "Standard group travel logistics stays"}`;
    }).join("\n\n");

    const systemPrompt = `You are "SoloZ AI", the friendly, highly enthusiastic travel assistant for the WeAreSoloz solo travel community founded by Akhil Pasupuleti.
Your job is to match travelers with their perfect trips, answer questions about itineraries, pricing, community policies, and support inquiries.

Available Upcoming Trips:
${tripsContext}

General Rules & Details:
1. Contact / Registration: To book a trip, ask questions, or register for the farmer program, travelers should contact Akhil Pasupuleti on WhatsApp (+91 99660 85310) or fill out the booking form on the trip pages.
2. Inclusions/Exclusions: Train/flight tickets are not included. Travelers must reach the designated meeting point in the starting city by themselves.
3. YouTube Channel: Akhil runs "Akhill Rockstar Travel Stories" on YouTube.
4. Farmer Program: WeAreSoloz sponsors one free trip every month for a deserving farmer.
5. Be warm and friendly. Keep answers relatively concise and format with bullet points for easy reading.
6. Speak in the user's language (English, Telugu, Hindi, etc.).`;

    const fullMessages = [
      { role: "system", content: systemPrompt },
      ...messages.slice(-8)
    ];

    let aiText = "";

    if (groqKey) {
      try {
        const payload = {
          model: "llama-3.3-70b-versatile",
          messages: fullMessages,
          temperature: 0.7,
          max_tokens: 800
        };
        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${groqKey}`
          },
          body: JSON.stringify(payload)
        });
        if (groqRes.ok) {
          const data = await groqRes.json();
          aiText = data.choices[0].message.content;
        } else {
          const errorMsg = await groqRes.text();
          console.error("Groq API error response:", errorMsg);
        }
      } catch (err) {
        console.error("Groq chat failed, falling back to Gemini:", err);
      }
    }

    if (!aiText && geminiKey) {
      try {
        const contents = fullMessages
          .filter(m => m.role !== "system")
          .map(m => ({
            role: m.role === "user" ? "user" : "model",
            parts: [{ text: m.content }]
          }));

        const payload = {
          contents,
          systemInstruction: {
            parts: [{ text: systemPrompt }]
          },
          generationConfig: {
            maxOutputTokens: 800,
            temperature: 0.7
          }
        };

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
          }
        );

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          aiText = data.candidates[0].content.parts[0].text;
        } else {
          const errorMsg = await geminiRes.text();
          console.error("Gemini API error response:", errorMsg);
        }
      } catch (err) {
        console.error("Gemini chat failed:", err);
      }
    }

    if (!aiText) {
      return res.status(500).json({ error: "AI services failed to respond." });
    }

    res.json({ reply: aiText });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- Public Trip Confirmation & Liability Waiver ---
router.get("/trip-confirmation/:code", async (req, res) => {
  try {
    await connectDB();
    const trip = await Trip.findOne({ confirmationCode: req.params.code }).lean();
    if (!trip) {
      return res.status(404).json({ error: "Trip confirmation link not found or expired." });
    }
    
    // Auto-disable if the trip date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (trip.date && new Date(trip.date) < today) {
      return res.status(400).json({ error: "This trip is already completed. The confirmation link has expired." });
    }

    if (trip.confirmationLinkEnabled === false) {
      return res.status(400).json({ error: "This confirmation link has been disabled by the administrator." });
    }
    res.json({
      _id: trip._id,
      destination: trip.destination,
      title: trip.title,
      date: trip.date,
      price: trip.price,
      pickupLocation: trip.pickupLocation || "Default Meeting Point"
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/trip-confirmation/:code", async (req, res) => {
  try {
    const WaiverSubmission = require("../models/WaiverSubmission");
    await connectDB();
    const trip = await Trip.findOne({ confirmationCode: req.params.code });
    if (!trip) {
      return res.status(404).json({ error: "Trip not found." });
    }

    // Auto-disable if the trip date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (trip.date && new Date(trip.date) < today) {
      return res.status(400).json({ error: "This trip is already completed. The confirmation link has expired." });
    }

    if (trip.confirmationLinkEnabled === false) {
      return res.status(400).json({ error: "This confirmation link has been disabled." });
    }

    const submissionId = `SOL-WAV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    await WaiverSubmission.create({
      tripId: trip._id,
      ...req.body,
      submissionId
    });

    res.status(201).json({ success: true, submissionId });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- Public Trip Feedback ---
router.get("/trip-feedback/:code", async (req, res) => {
  try {
    await connectDB();
    const trip = await Trip.findOne({ feedbackCode: req.params.code }).lean();
    if (!trip) {
      return res.status(404).json({ error: "Trip feedback link not found or expired." });
    }
    
    if (trip.feedbackLinkEnabled === false) {
      return res.status(400).json({ error: "This feedback link has been disabled by the administrator." });
    }

    res.json({
      _id: trip._id,
      destination: trip.destination,
      title: trip.title,
      date: trip.date
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/trip-feedback/:code", async (req, res) => {
  try {
    const FeedbackSubmission = require("../models/FeedbackSubmission");
    await connectDB();
    const trip = await Trip.findOne({ feedbackCode: req.params.code });
    if (!trip) {
      return res.status(404).json({ error: "Trip not found." });
    }

    if (trip.feedbackLinkEnabled === false) {
      return res.status(400).json({ error: "This feedback link has been disabled." });
    }

    const submissionId = `SOL-FDB-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    await FeedbackSubmission.create({
      tripId: trip._id,
      ...req.body,
      submissionId
    });

    res.status(201).json({ success: true, submissionId });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- GET Public Certificate Details for Verification & Rendering ---
router.get(["/certificates/:certId", "/public/certificates/:certId"], async (req, res) => {
  try {
    const WaiverSubmission = require("../models/WaiverSubmission");
    await connectDB();
    const waiver = await WaiverSubmission.findOne({ certificateId: req.params.certId }).lean();
    if (!waiver) {
      return res.status(404).json({ error: "Certificate not found or invalid Certificate ID." });
    }

    const trip = await Trip.findById(waiver.tripId).lean();
    res.json({
      certificateId: waiver.certificateId,
      fullName: waiver.fullName,
      signedDate: waiver.signedDate,
      certificateIssuedAt: waiver.certificateIssuedAt || waiver.createdAt,
      trip: {
        title: trip ? (trip.title || trip.destination) : "Solo Expedition",
        destination: trip ? trip.destination : "India",
        date: trip ? trip.date : waiver.createdAt,
        duration: trip ? trip.duration : "3 Days"
      }
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
