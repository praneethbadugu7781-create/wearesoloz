const express = require("express");
const crypto = require("crypto");
const Razorpay = require("razorpay");
const Booking = require("../models/Booking");
const { connectDB } = require("../lib/db");

const router = express.Router();

// Get Razorpay Key ID for frontend initialization
router.get("/config", (req, res) => {
  res.json({
    keyId: process.env.RAZORPAY_KEY_ID || ""
  });
});

// Helper to initialize Razorpay instance
function getRazorpayInstance() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret || key_id.includes("YourKeyIdHere")) {
    console.warn("⚠️ Razorpay Key ID or Secret is not configured in backend environment variables.");
  }

  return new Razorpay({
    key_id: key_id || "rzp_test_placeholder",
    key_secret: key_secret || "secret_placeholder"
  });
}

// 1. CREATE RAZORPAY ORDER
router.post("/create-order", async (req, res) => {
  try {
    await connectDB();
    const {
      tripId,
      tripTitle,
      tripSlug,
      destination,
      customerName,
      customerEmail,
      customerMobile,
      age,
      bloodGroup,
      travelers = 1,
      selectedBatch,
      amount
    } = req.body;

    // Validate required fields
    if (!customerName || customerName.trim().length < 2) {
      return res.status(400).json({ error: "Customer name is required" });
    }
    if (!customerEmail || !customerEmail.includes("@")) {
      return res.status(400).json({ error: "Valid email address is required" });
    }
    if (!customerMobile || customerMobile.trim().length < 7) {
      return res.status(400).json({ error: "Valid mobile number is required" });
    }
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({ error: "Valid payment amount is required" });
    }

    const numTravelers = Math.max(1, parseInt(travelers) || 1);
    const unitPrice = Number(amount);
    const totalAmount = unitPrice * numTravelers;
    const amountInPaise = Math.round(totalAmount * 100);

    const bookingId = `WS-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const razorpay = getRazorpayInstance();

    const orderOptions = {
      amount: amountInPaise,
      currency: "INR",
      receipt: bookingId,
      notes: {
        bookingId,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerMobile: customerMobile.trim(),
        tripTitle: tripTitle || destination || "WeAreSoloz Expedition",
        travelers: numTravelers
      }
    };

    const razorpayOrder = await razorpay.orders.create(orderOptions);

    // Save pending booking in MongoDB
    const booking = new Booking({
      bookingId,
      razorpayOrderId: razorpayOrder.id,
      tripId: tripId || null,
      tripTitle: tripTitle || destination || "WeAreSoloz Expedition",
      tripSlug: tripSlug || "",
      destination: destination || "",
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim(),
      customerMobile: customerMobile.trim(),
      age: Number(age) || undefined,
      bloodGroup: bloodGroup || "",
      travelers: numTravelers,
      selectedBatch: selectedBatch || null,
      amount: totalAmount,
      currency: "INR",
      status: "PENDING",
      notes: orderOptions.notes
    });

    await booking.save();

    res.json({
      success: true,
      keyId: process.env.RAZORPAY_KEY_ID || "",
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      bookingId: booking.bookingId
    });
  } catch (error) {
    console.error("Error creating Razorpay Order:", error);
    res.status(500).json({ error: error.message || "Failed to generate payment order" });
  }
});

// 2. VERIFY RAZORPAY PAYMENT SIGNATURE
router.post("/verify", async (req, res) => {
  try {
    await connectDB();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: "Missing required payment verification parameters" });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return res.status(500).json({ error: "Razorpay secret key not configured on server" });
    }

    // Generate HMAC SHA256 signature
    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const isSignatureValid = generatedSignature === razorpay_signature;

    if (!isSignatureValid) {
      // Mark booking as FAILED
      await Booking.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { status: "FAILED", razorpayPaymentId: razorpay_payment_id }
      );
      return res.status(400).json({ success: false, error: "Invalid payment signature verification failed" });
    }

    // Signature verified — Update booking to PAID
    let query = { razorpayOrderId: razorpay_order_id };
    if (bookingId) query = { $or: [{ bookingId }, { razorpayOrderId: razorpay_order_id }] };

    const booking = await Booking.findOneAndUpdate(
      query,
      {
        status: "PAID",
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        paidAt: new Date()
      },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ error: "Booking record not found for this order" });
    }

    res.json({
      success: true,
      message: "Payment verified successfully",
      booking
    });
  } catch (error) {
    console.error("Error verifying payment signature:", error);
    res.status(500).json({ error: error.message || "Payment verification failed" });
  }
});

// 3. RAZORPAY WEBHOOK HANDLER
router.post("/webhook", async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];

    if (webhookSecret && signature) {
      // Verify webhook signature using rawBody Buffer
      const rawBody = req.rawBody ? req.rawBody.toString() : JSON.stringify(req.body);
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex");

      if (expectedSignature !== signature) {
        console.warn("⚠️ Razorpay Webhook signature mismatch");
        return res.status(400).json({ error: "Invalid webhook signature" });
      }
    }

    await connectDB();
    const event = req.body;

    if (event.event === "payment.captured" || event.event === "order.paid") {
      const paymentEntity = event.payload.payment ? event.payload.payment.entity : null;
      const orderEntity = event.payload.order ? event.payload.order.entity : null;

      const orderId = (paymentEntity && paymentEntity.order_id) || (orderEntity && orderEntity.id);
      const paymentId = paymentEntity ? paymentEntity.id : "";

      if (orderId) {
        const booking = await Booking.findOne({ razorpayOrderId: orderId });
        if (booking && booking.status !== "PAID") {
          booking.status = "PAID";
          booking.razorpayPaymentId = paymentId || booking.razorpayPaymentId;
          booking.paidAt = new Date();
          await booking.save();
          console.log(`✅ Webhook updated Booking ${booking.bookingId} to PAID`);
        }
      }
    }

    res.json({ status: "ok" });
  } catch (error) {
    console.error("Error processing Razorpay Webhook:", error);
    res.status(500).json({ error: "Webhook processing error" });
  }
});

// 4. FETCH BOOKING DETAILS FOR CONFIRMATION PAGE
router.get("/booking/:id", async (req, res) => {
  try {
    await connectDB();
    const id = req.params.id;
    const booking = await Booking.findOne({
      $or: [{ bookingId: id }, { razorpayOrderId: id }, { razorpayPaymentId: id }]
    }).lean();

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
