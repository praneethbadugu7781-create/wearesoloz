const mongoose = require("mongoose");

const reelSchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },
    video: { type: String, required: true },
    caption: { type: String, default: "" },
    category: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Reel || mongoose.model("Reel", reelSchema);
