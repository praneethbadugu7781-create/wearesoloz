const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
  {
    destination: { type: String, required: true },
    state: { type: String, default: "Telangana" },
    category: { type: String, enum: ["Temples", "Treks", "Adventure"], default: "Adventure" },
    slug: { type: String, required: true, unique: true },
    date: { type: Date, required: true },
    duration: { type: String, required: true },
    price: { type: String, required: true },
    seats: { type: Number, required: true },
    description: { type: String, default: "" },
    itinerary: [{ day: String, title: String, description: String }],
    inclusions: [String],
    image: { type: String, required: true },
    images: { type: [String], default: [] },
    featured: { type: Boolean, default: false },
    status: { type: String, enum: ["draft", "published"], default: "published" },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Trip || mongoose.model("Trip", tripSchema);
