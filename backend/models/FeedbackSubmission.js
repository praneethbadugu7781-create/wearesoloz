const mongoose = require("mongoose");

const feedbackSubmissionSchema = new mongoose.Schema(
  {
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: "Trip", required: true },
    submissionId: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    mobile: { type: String, required: true },
    email: { type: String, default: "" },
    ratings: {
      overallExperience: { type: Number, required: true, min: 1, max: 5 },
      accommodation: { type: Number, required: true, min: 1, max: 5 },
      transport: { type: Number, required: true, min: 1, max: 5 },
      captain: { type: Number, required: true, min: 1, max: 5 }
    },
    commentsLoved: { type: String, default: "" },
    commentsImprovements: { type: String, default: "" },
    travelAgain: { type: String, enum: ["Yes", "No", "Maybe"], default: "Yes" },
    recommendFriends: { type: String, enum: ["Yes", "No", "Maybe"], default: "Yes" },
    allowTestimonial: { type: Boolean, default: false },
    photos: { type: [String], default: [] }
  },
  { timestamps: true }
);

module.exports = mongoose.models.FeedbackSubmission || mongoose.model("FeedbackSubmission", feedbackSubmissionSchema);
