const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    payuTxnId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    payuMihpayid: {
      type: String,
      default: ""
    },
    payuHash: {
      type: String,
      default: ""
    },
    payuStatus: {
      type: String,
      default: ""
    },
    payuUnmappedStatus: {
      type: String,
      default: ""
    },
    paymentMode: {
      type: String,
      default: "PAYU"
    },
    bankRefNum: {
      type: String,
      default: ""
    },
    payuErrorMsg: {
      type: String,
      default: ""
    },
    // Backward compatibility aliases for existing legacy bookings
    razorpayOrderId: {
      type: String,
      default: undefined
    },
    razorpayPaymentId: {
      type: String,
      default: ""
    },
    razorpaySignature: {
      type: String,
      default: ""
    },
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip"
    },
    tripTitle: {
      type: String,
      required: true
    },
    tripSlug: {
      type: String,
      default: ""
    },
    destination: {
      type: String,
      default: ""
    },
    customerName: {
      type: String,
      required: true,
      trim: true
    },
    customerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    customerMobile: {
      type: String,
      required: true,
      trim: true
    },
    age: {
      type: Number
    },
    bloodGroup: {
      type: String,
      default: ""
    },
    travelers: {
      type: Number,
      default: 1
    },
    selectedBatch: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: "INR"
    },
    status: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED", "CANCELLED"],
      default: "PENDING",
      index: true
    },
    paymentMethod: {
      type: String,
      default: "PAYU"
    },
    notes: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    paidAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

const Booking = mongoose.model("Booking", BookingSchema);

// Auto-clean legacy Razorpay unique indexes from MongoDB collection if present
mongoose.connection.on("open", async () => {
  try {
    const collection = mongoose.connection.db.collection("bookings");
    await collection.dropIndex("razorpayOrderId_1").catch(() => {});
    await collection.dropIndex("razorpayPaymentId_1").catch(() => {});
  } catch (e) {
    // Ignore index drop error if not present
  }
});

module.exports = Booking;
