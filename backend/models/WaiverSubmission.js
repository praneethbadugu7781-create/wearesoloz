const mongoose = require("mongoose");

const waiverSubmissionSchema = new mongoose.Schema(
  {
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: "Trip", required: true },
    fullName: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    mobile: { type: String, required: true },
    email: { type: String, default: "" },
    address: { type: String, default: "" },
    emergencyContactName: { type: String, required: true },
    emergencyContactMobile: { type: String, required: true },
    emergencyContactRelationship: { type: String, required: true },
    bloodGroup: { type: String, default: "" },
    medicalConditions: { type: String, default: "" },
    allergies: { type: String, default: "" },
    medications: { type: String, default: "" },
    emergencyNotes: { type: String, default: "" },
    idType: { type: String, required: true },
    idNumber: { type: String, default: "" },
    idUpload: { type: String, default: "" },
    signedName: { type: String, required: true },
    signedDate: { type: Date, default: Date.now },
    submissionId: { type: String, required: true, unique: true }
  },
  { timestamps: true }
);

module.exports = mongoose.models.WaiverSubmission || mongoose.model("WaiverSubmission", waiverSubmissionSchema);
