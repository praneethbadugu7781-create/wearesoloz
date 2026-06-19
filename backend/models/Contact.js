const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    mobile: { type: String, required: true },
    age: { type: Number, required: true },
    bloodGroup: { type: String, required: true },
    destination: { type: String, default: "" },
    message: { type: String, required: true },
    status: { type: String, enum: ["new", "contacted", "closed", "approved"], default: "new" },
    pricePoints: { type: String, default: "" },
    travelerNames: { type: String, default: "" },
    approvalNotes: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Contact || mongoose.model("Contact", contactSchema);
