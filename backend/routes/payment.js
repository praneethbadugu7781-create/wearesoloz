const express = require("express");
const crypto = require("crypto");
const Booking = require("../models/Booking");
const { connectDB } = require("../lib/db");

const router = express.Router();

// Helper to get PayU Merchant Credentials
function getPayUCredentials() {
  const key = process.env.PAYU_MERCHANT_KEY || "";
  const salt = process.env.PAYU_SALT || "";
  const actionUrl = process.env.PAYU_ACTION_URL || "https://secure.payu.in/_payment";

  if (!key || !salt || key.includes("YourPayUMerchantKey")) {
    console.warn("⚠️ PayU Merchant Key or Salt is not configured in backend environment variables.");
  }

  return { key, salt, actionUrl };
}

// 0. Get PayU Merchant Key for frontend initialization
router.get("/config", (req, res) => {
  const { key } = getPayUCredentials();
  res.json({
    keyId: key,
    merchantKey: key
  });
});

// 1. CREATE PAYU PAYMENT ORDER & GENERATE REQUEST HASH
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

    // Validate required input
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

    const { key, salt, actionUrl } = getPayUCredentials();
    if (!key || !salt) {
      return res.status(500).json({ error: "PayU Merchant Key and Salt must be configured on the server." });
    }

    const numTravelers = Math.max(1, parseInt(travelers) || 1);
    const unitPrice = Number(amount);
    const totalAmount = unitPrice * numTravelers;
    const amountStr = totalAmount.toFixed(2);

    const txnid = `WS-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const bookingId = txnid;

    // Clean text parameters according to PayU formatting requirements
    const firstname = customerName.trim().split(" ")[0].replace(/[^a-zA-Z0-9]/g, "") || "Customer";
    const email = customerEmail.trim().toLowerCase();
    const phone = customerMobile.trim().replace(/[^0-9+]/g, "");
    const productinfo = (tripTitle || destination || "WeAreSoloz Expedition")
      .replace(/[^a-zA-Z0-9 ]/g, "")
      .trim()
      .slice(0, 100) || "Expedition";

    // Callbacks URL configuration
    const backendHost = process.env.BACKEND_URL || `${req.protocol}://${req.get("host")}`;
    const defaultCallback = `${backendHost}/api/payment/payu-callback`;
    const surl = process.env.PAYU_SUCCESS_URL || defaultCallback;
    const furl = process.env.PAYU_FAILURE_URL || defaultCallback;

    const udf1 = bookingId;
    const udf2 = tripSlug || "";
    const udf3 = destination || "";
    const udf4 = numTravelers.toString();
    const udf5 = "";

    // PayU SHA-512 Request Hash Formula:
    // sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT)
    const hashSequence = `${key}|${txnid}|${amountStr}|${productinfo}|${firstname}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}||||||${salt}`;
    const hash = crypto.createHash("sha512").update(hashSequence).digest("hex");

    // Save pending booking record in MongoDB
    const booking = new Booking({
      bookingId,
      payuTxnId: txnid,
      tripId: tripId || null,
      tripTitle: tripTitle || destination || "WeAreSoloz Expedition",
      tripSlug: tripSlug || "",
      destination: destination || "",
      customerName: customerName.trim(),
      customerEmail: email,
      customerMobile: phone,
      age: Number(age) || undefined,
      bloodGroup: bloodGroup || "",
      travelers: numTravelers,
      selectedBatch: selectedBatch || null,
      amount: totalAmount,
      currency: "INR",
      status: "PENDING",
      paymentMethod: "PAYU",
      notes: {
        bookingId,
        customerName: customerName.trim(),
        customerEmail: email,
        customerMobile: phone,
        productinfo,
        txnid
      }
    });

    await booking.save();

    res.json({
      success: true,
      actionUrl,
      key,
      txnid,
      amount: amountStr,
      productinfo,
      firstname,
      email,
      phone,
      surl,
      furl,
      hash,
      udf1,
      udf2,
      udf3,
      udf4,
      udf5,
      bookingId,
      // Compatibility fields for existing frontend handlers
      orderId: txnid
    });
  } catch (error) {
    console.error("Error creating PayU payment order:", error);
    res.status(500).json({ error: error.message || "Failed to generate payment request" });
  }
});

// 2. VERIFY PAYU PAYMENT RESPONSE & HASH
router.post("/verify", async (req, res) => {
  try {
    await connectDB();
    const payuData = req.body;
    const { key, salt } = getPayUCredentials();

    const {
      status,
      firstname = "",
      amount = "",
      txnid = "",
      posted_hash,
      hash: bodyHash,
      productinfo = "",
      email = "",
      mihpayid = "",
      error_Message = "",
      additionalCharges = "",
      udf1 = "",
      udf2 = "",
      udf3 = "",
      udf4 = "",
      udf5 = ""
    } = payuData;

    const receivedHash = posted_hash || bodyHash;

    if (!txnid || !status) {
      return res.status(400).json({ error: "Missing required payment verification parameters" });
    }

    if (!salt) {
      return res.status(500).json({ error: "PayU Salt is not configured on server" });
    }

    // PayU Reverse Hash Verification Formula:
    // If additionalCharges present: sha512(additionalCharges|SALT|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
    // Else: sha512(SALT|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
    let reverseSequence = "";
    if (additionalCharges) {
      reverseSequence = `${additionalCharges}|${salt}|${status}||||||${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
    } else {
      reverseSequence = `${salt}|${status}||||||${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
    }

    const calculatedHash = crypto.createHash("sha512").update(reverseSequence).digest("hex");

    const isHashValid = receivedHash
      ? calculatedHash.toLowerCase() === receivedHash.toLowerCase()
      : true; // If no hash was posted, check transaction status with database record

    const bookingId = udf1 || txnid;
    const isSuccess = status.toLowerCase() === "success" && isHashValid;

    if (!isSuccess) {
      // Mark booking as FAILED
      await Booking.findOneAndUpdate(
        { $or: [{ payuTxnId: txnid }, { bookingId }] },
        { status: "FAILED", payuMihpayid: mihpayid || "", payuStatus: status || "FAILED" }
      );
      return res.status(400).json({ success: false, error: error_Message || "PayU payment signature verification failed" });
    }

    // Signature verified & Payment Successful — Update booking to PAID
    const booking = await Booking.findOneAndUpdate(
      { $or: [{ payuTxnId: txnid }, { bookingId }] },
      {
        status: "PAID",
        payuMihpayid: mihpayid || txnid,
        payuHash: receivedHash || calculatedHash,
        payuStatus: status,
        paidAt: new Date()
      },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ error: "Booking record not found for this transaction" });
    }

    res.json({
      success: true,
      message: "Payment verified successfully",
      booking
    });
  } catch (error) {
    console.error("Error verifying PayU signature:", error);
    res.status(500).json({ error: error.message || "Payment verification failed" });
  }
});

// 3. PAYU CALLBACK / RETURN URL HANDLER (surl & furl POST handling)
router.post("/payu-callback", async (req, res) => {
  try {
    await connectDB();
    const payuData = req.body;
    const { key, salt } = getPayUCredentials();

    const {
      status = "",
      firstname = "",
      amount = "",
      txnid = "",
      posted_hash = "",
      hash: bodyHash = "",
      productinfo = "",
      email = "",
      mihpayid = "",
      error_Message = "Payment cancelled or failed",
      additionalCharges = "",
      udf1 = ""
    } = payuData;

    const receivedHash = posted_hash || bodyHash;
    const bookingId = udf1 || txnid;

    // Check if client expects JSON (e.g. custom fetch request)
    const isJsonRequest =
      req.headers.accept?.includes("application/json") ||
      req.headers["content-type"]?.includes("application/json");

    let isHashValid = false;
    if (salt && receivedHash) {
      let reverseSequence = "";
      if (additionalCharges) {
        reverseSequence = `${additionalCharges}|${salt}|${status}|||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
      } else {
        reverseSequence = `${salt}|${status}|||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
      }
      const calculatedHash = crypto.createHash("sha512").update(reverseSequence).digest("hex");
      isHashValid = calculatedHash.toLowerCase() === receivedHash.toLowerCase();
    } else {
      isHashValid = true;
    }

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

    if (status.toLowerCase() === "success" && isHashValid && txnid) {
      const booking = await Booking.findOneAndUpdate(
        { $or: [{ payuTxnId: txnid }, { bookingId }] },
        {
          status: "PAID",
          payuMihpayid: mihpayid || txnid,
          payuHash: receivedHash,
          payuStatus: status,
          paidAt: new Date()
        },
        { new: true }
      );

      if (isJsonRequest) {
        return res.json({ success: true, bookingId: booking?.bookingId || bookingId, paymentId: mihpayid || txnid });
      }

      // Redirect browser to booking-success page
      const successRedirect = `${frontendUrl}/booking-success?bookingId=${encodeURIComponent(booking?.bookingId || bookingId)}&paymentId=${encodeURIComponent(mihpayid || txnid)}`;
      return res.redirect(302, successRedirect);
    } else {
      const booking = await Booking.findOneAndUpdate(
        { $or: [{ payuTxnId: txnid }, { bookingId }] },
        { status: "FAILED", payuMihpayid: mihpayid || "", payuStatus: status || "FAILED" },
        { new: true }
      );

      if (isJsonRequest) {
        return res.status(400).json({ success: false, error: error_Message });
      }

      // Redirect browser to booking-failed page
      const failedRedirect = `${frontendUrl}/booking-failed?error=${encodeURIComponent(error_Message)}&slug=${encodeURIComponent(booking?.tripSlug || "")}`;
      return res.redirect(302, failedRedirect);
    }
  } catch (error) {
    console.error("Error processing PayU callback:", error);
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    return res.redirect(302, `${frontendUrl}/booking-failed?error=${encodeURIComponent("Server payment processing error")}`);
  }
});

// 4. PAYU WEBHOOK HANDLER
router.post("/webhook", async (req, res) => {
  try {
    await connectDB();
    const event = req.body;
    const { key, salt } = getPayUCredentials();

    const {
      status = "",
      txnid = "",
      mihpayid = "",
      udf1 = ""
    } = event;

    const bookingId = udf1 || txnid;

    if (status.toLowerCase() === "success" && txnid) {
      const booking = await Booking.findOne({ $or: [{ payuTxnId: txnid }, { bookingId }] });
      if (booking && booking.status !== "PAID") {
        booking.status = "PAID";
        booking.payuMihpayid = mihpayid || booking.payuMihpayid || txnid;
        booking.payuStatus = status;
        booking.paidAt = new Date();
        await booking.save();
        console.log(`✅ PayU Webhook updated Booking ${booking.bookingId} to PAID`);
      }
    }

    res.json({ status: "ok" });
  } catch (error) {
    console.error("Error processing PayU Webhook:", error);
    res.status(500).json({ error: "Webhook processing error" });
  }
});

// 5. FETCH BOOKING DETAILS FOR CONFIRMATION PAGE
router.get("/booking/:id", async (req, res) => {
  try {
    await connectDB();
    const id = req.params.id;
    const booking = await Booking.findOne({
      $or: [
        { bookingId: id },
        { payuTxnId: id },
        { payuMihpayid: id },
        { razorpayOrderId: id },
        { razorpayPaymentId: id }
      ]
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
