const mongoose = require("mongoose");

const eventRegistrationSchema = new mongoose.Schema(
  {
    bookingId: { type: String, required: true, unique: true },
    payuTxnId: { type: String },
    eventId: { type: String, default: "badminton-season-1" },
    eventName: { type: String, default: "WeAreSoloZ Badminton Championship Season 1" },
    teamName: { type: String, required: true },
    player1Name: { type: String, required: true },
    player1Phone: { type: String, required: true },
    player1Email: { type: String, required: true },
    player2Name: { type: String, required: true },
    player2Phone: { type: String, required: true },
    amount: { type: Number, default: 500 },
    paymentStatus: { type: String, enum: ["PENDING", "PAID", "FAILED", "CANCELLED"], default: "PENDING" },
    payuMoneyId: { type: String },
    payuDetails: { type: Object }
  },
  { timestamps: true }
);

module.exports = mongoose.models.EventRegistration || mongoose.model("EventRegistration", eventRegistrationSchema);
