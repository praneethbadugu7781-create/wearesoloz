const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    tagline: { type: String },
    category: { type: String, default: "Tournament" },
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed", "cancelled"],
      default: "upcoming"
    },
    featured: { type: Boolean, default: false },
    showInNavbar: { type: Boolean, default: true },
    date: { type: String, required: true },
    time: { type: String, default: "09:00 AM - 06:00 PM" },
    venue: { type: String, required: true },
    city: { type: String, default: "Hyderabad" },
    googleMapsUrl: { type: String },
    bannerImage: { type: String },
    description: { type: String },
    rules: [{ type: String }],
    prizePool: { type: String },
    entryFee: { type: Number, default: 0 },
    teamSize: { type: String, default: "Solo" },
    registrationOpen: { type: Boolean, default: true },
    maxRegistrations: { type: Number, default: 100 },
    contactPhone: { type: String, default: "+91 91000 00000" },
    contactEmail: { type: String, default: "events@wearesoloz.com" }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Event || mongoose.model("Event", eventSchema);
