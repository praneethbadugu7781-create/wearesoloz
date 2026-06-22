const mongoose = require("mongoose");

const careerSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    gender: { type: String, required: true, enum: ["Male", "Female", "Other"] },
    age: { type: Number, required: true },
    bloodGroup: { type: String, required: true },
    email: { type: String, required: true },
    mobile: { type: String, required: true },
    instagram: { type: String, default: "" },
    experience: { type: String, required: true },
    whyJoin: { type: String, required: true },
    status: { type: String, default: "Pending", enum: ["Pending", "Reviewed", "Rejected", "Archived"] },
    rejectionReason: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Career || mongoose.model("Career", careerSchema);
