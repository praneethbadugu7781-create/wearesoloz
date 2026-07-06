const mongoose = require("mongoose");

const memoryPostSchema = new mongoose.Schema(
  {
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: "Trip", required: true },
    title: { type: String, default: "" },
    text: { type: String, required: true },
    photos: { type: [String], default: [] },
    authorName: { type: String, required: true },
    authorPhone: { type: String },
    authorEmail: { type: String, required: true },
    likes: { type: [String], default: [] }, // Array of email strings
    comments: {
      type: [{
        authorName: { type: String, required: true },
        authorPhone: { type: String },
        authorEmail: { type: String, required: true },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
      }],
      default: []
    }
  },
  { timestamps: true }
);

module.exports = mongoose.models.MemoryPost || mongoose.model("MemoryPost", memoryPostSchema);
