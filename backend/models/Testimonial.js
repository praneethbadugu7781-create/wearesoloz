const mongoose = require("mongoose");

const testimonialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    quote: { type: String, default: "" },
    message: { type: String, default: "" },
    avatar: { type: String, default: "" },
    location: { type: String, default: "" },
    role: { type: String, default: "" },
    rating: { type: Number, default: 5 },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Testimonial || mongoose.model("Testimonial", testimonialSchema);
