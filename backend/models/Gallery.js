const mongoose = require("mongoose");

const gallerySchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },
    image: { type: String, required: true },
    caption: { type: String, default: "" },
    category: { type: String, default: "" },
    alt: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Gallery || mongoose.model("Gallery", gallerySchema);
