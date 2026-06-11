const express = require("express");
const { connectDB } = require("../lib/db");
const Trip = require("../models/Trip");
const Destination = require("../models/Destination");
const Blog = require("../models/Blog");
const Gallery = require("../models/Gallery");
const Testimonial = require("../models/Testimonial");
const Contact = require("../models/Contact");
const SiteSetting = require("../models/SiteSetting");

const router = express.Router();

// --- Trips ---
router.get("/trips", async (req, res) => {
  try {
    await connectDB();
    const trips = await Trip.find({ status: "published" }).sort({ date: -1 }).lean();
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
router.post("/contacts", async (req, res) => {
  try {
    const { fullName, mobile, email, destination, message } = req.body;
    if (!fullName || fullName.length < 2) return res.status(400).json({ error: "Full name must be at least 2 characters" });
    if (!mobile || mobile.length < 7) return res.status(400).json({ error: "Invalid mobile number" });
    if (!email) return res.status(400).json({ error: "Email is required" });
    if (!message || message.length < 5) return res.status(400).json({ error: "Message must be at least 5 characters" });

    await connectDB();
    const contact = await Contact.create({ fullName, mobile, email, destination, message });
    res.status(201).json(contact);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
