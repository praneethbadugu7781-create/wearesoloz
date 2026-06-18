const express = require("express");
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
    const trip = await Trip.findOne({ slug: req.params.slug }).lean();
    if (!trip) return res.status(404).json({ error: "Trip not found" });
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
    const { fullName, mobile, email, destination, message } = req.body;
    if (!fullName || fullName.length < 2) return res.status(400).json({ error: "Full name must be at least 2 characters" });
    if (!mobile || mobile.length < 7) return res.status(400).json({ error: "Invalid mobile number" });
    if (!email) return res.status(400).json({ error: "Email is required" });
    if (!message || message.length < 5) return res.status(400).json({ error: "Message must be at least 5 characters" });

    await connectDB();
    const contact = await Contact.create({ fullName, mobile, email, destination, message });

    // Send email notifications asynchronously
    sendContactEmail({ fullName, mobile, email, destination, message }).catch(console.error);
    sendContactReceiptEmail({ fullName, email, destination }).catch(console.error);

    res.status(201).json(contact);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- Careers (public submit) ---
router.post("/careers", async (req, res) => {
  try {
    const { fullName, gender, age, email, mobile, instagram, experience, whyJoin } = req.body;
    if (!fullName || fullName.length < 2) return res.status(400).json({ error: "Full name must be at least 2 characters" });
    if (!gender || !["Male", "Female", "Other"].includes(gender)) return res.status(400).json({ error: "Please select a valid gender" });
    if (!age || isNaN(Number(age)) || Number(age) < 18 || Number(age) > 100) return res.status(400).json({ error: "Please enter a valid age (18 or older)" });
    if (!email) return res.status(400).json({ error: "Email is required" });
    if (!mobile || mobile.length < 7) return res.status(400).json({ error: "Please enter a valid mobile number" });
    if (!experience || experience.length < 10) return res.status(400).json({ error: "Travel experience must be at least 10 characters" });
    if (!whyJoin || whyJoin.length < 10) return res.status(400).json({ error: "Statement must be at least 10 characters" });

    await connectDB();
    const career = await Career.create({
      fullName,
      gender,
      age: Number(age),
      email,
      mobile,
      instagram: instagram || "",
      experience,
      whyJoin,
    });

    // Send email notifications asynchronously
    sendCareerEmail({
      fullName,
      gender,
      age: Number(age),
      email,
      mobile,
      instagram: instagram || "",
      experience,
      whyJoin,
    }).catch(console.error);
    sendCareerReceiptEmail({ fullName, email }).catch(console.error);

    res.status(201).json(career);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- Farmers (public submit) ---
router.post("/farmers", async (req, res) => {
  try {
    const { fullName, gender, bloodGroup, age, email, mobile, state, district, farmingType, cropType, landSize, whyJoin } = req.body;
    if (!fullName || fullName.length < 2) return res.status(400).json({ error: "Full name must be at least 2 characters" });
    if (!gender || !["Male", "Female", "Other"].includes(gender)) return res.status(400).json({ error: "Please select a valid gender" });
    if (!bloodGroup) return res.status(400).json({ error: "Blood group is required" });
    if (!age || isNaN(Number(age)) || Number(age) < 18 || Number(age) > 100) return res.status(400).json({ error: "Please enter a valid age (18 or older)" });
    if (!email) return res.status(400).json({ error: "Email is required" });
    if (!mobile || mobile.length < 7) return res.status(400).json({ error: "Please enter a valid mobile number" });
    if (!state) return res.status(400).json({ error: "State is required" });
    if (!district) return res.status(400).json({ error: "District is required" });
    if (!farmingType) return res.status(400).json({ error: "Farming type is required" });
    if (!cropType) return res.status(400).json({ error: "Crop type is required" });
    if (!landSize) return res.status(400).json({ error: "Land size is required" });
    if (!whyJoin || whyJoin.length < 10) return res.status(400).json({ error: "Explanation must be at least 10 characters" });

    await connectDB();
    const farmer = await Farmer.create({
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

module.exports = router;
