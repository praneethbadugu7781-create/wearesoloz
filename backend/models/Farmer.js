const mongoose = require("mongoose");

const farmerSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    gender: { type: String, required: true, enum: ["Male", "Female", "Other"] },
    bloodGroup: { type: String, required: true },
    age: { type: Number, required: true },
    email: { type: String, required: true },
    mobile: { type: String, required: true },
    state: { type: String, required: true },
    district: { type: String, required: true },
    farmingType: { type: String, required: true },
    cropType: { type: String, required: true },
    landSize: { type: String, required: true },
    whyJoin: { type: String, required: true },
    farmingImages: { type: [String], default: [] },
    status: { type: String, default: "Pending", enum: ["Pending", "Approved", "Rejected", "Archived"] },
    rejectionReason: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Farmer || mongoose.model("Farmer", farmerSchema);
