const express = require("express");
const crypto = require("crypto");
const Booking = require("../models/Booking");
const { connectDB } = require("../lib/db");
const { sendBookingPaymentInvoiceEmail } = require("../lib/mailer");

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
      paymentMode: "PAYU",
      notes: {
        bookingId,
        customerName: customerName.trim(),
        customerEmail: email,
        customerMobile: phone,
        productinfo,
        txnid
      }
    });

    try {
      await booking.save();
    } catch (saveErr) {
      if (saveErr.code === 11000 && (saveErr.message.includes("razorpayOrderId") || saveErr.message.includes("razorpayPaymentId"))) {
        console.warn("⚠️ Auto-dropping legacy Razorpay unique index from MongoDB collection...");
        try {
          await Booking.collection.dropIndex("razorpayOrderId_1").catch(() => {});
          await Booking.collection.dropIndex("razorpayPaymentId_1").catch(() => {});
          await booking.save();
        } catch (retryErr) {
          throw saveErr;
        }
      } else {
        throw saveErr;
      }
    }

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
      status = "",
      unmappedstatus = "",
      firstname = "",
      amount = "",
      txnid = "",
      posted_hash,
      hash: bodyHash,
      productinfo = "",
      email = "",
      mihpayid = "",
      mode = "",
      bank_ref_num = "",
      error_Message = "",
      additionalCharges = "",
      udf1 = ""
    } = payuData;

    const receivedHash = posted_hash || bodyHash;
    const bookingId = udf1 || txnid;

    if (!txnid || !status) {
      return res.status(400).json({ error: "Missing required payment verification parameters" });
    }

    if (!salt) {
      return res.status(500).json({ error: "PayU Salt is not configured on server" });
    }

    let reverseSequence = "";
    if (additionalCharges) {
      reverseSequence = `${additionalCharges}|${salt}|${status}||||||${payuData.udf5 || ""}|${payuData.udf4 || ""}|${payuData.udf3 || ""}|${payuData.udf2 || ""}|${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
    } else {
      reverseSequence = `${salt}|${status}||||||${payuData.udf5 || ""}|${payuData.udf4 || ""}|${payuData.udf3 || ""}|${payuData.udf2 || ""}|${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
    }

    const calculatedHash = crypto.createHash("sha512").update(reverseSequence).digest("hex");
    const isHashValid = receivedHash
      ? calculatedHash.toLowerCase() === receivedHash.toLowerCase()
      : true;

    const statusLower = status.toLowerCase();
    const unmappedLower = unmappedstatus.toLowerCase();

    let targetStatus = "PENDING";
    if (statusLower === "success" && isHashValid) {
      targetStatus = "PAID";
    } else if (statusLower === "usercancelled" || unmappedLower === "usercancelled" || statusLower === "cancelled") {
      targetStatus = "CANCELLED";
    } else {
      targetStatus = "FAILED";
    }

    const booking = await Booking.findOneAndUpdate(
      { $or: [{ payuTxnId: txnid }, { bookingId }] },
      {
        status: targetStatus,
        payuMihpayid: mihpayid || txnid,
        payuHash: receivedHash || calculatedHash,
        payuStatus: status,
        payuUnmappedStatus: unmappedstatus,
        paymentMode: mode || "PAYU",
        bankRefNum: bank_ref_num,
        payuErrorMsg: error_Message,
        ...(targetStatus === "PAID" ? { paidAt: new Date() } : {})
      },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ error: "Booking record not found for this transaction" });
    }

    res.json({
      success: targetStatus === "PAID",
      message: `Payment status updated to ${targetStatus}`,
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
      unmappedstatus = "",
      firstname = "",
      amount = "",
      txnid = "",
      posted_hash = "",
      hash: bodyHash = "",
      productinfo = "",
      email = "",
      mihpayid = "",
      mode = "",
      bank_ref_num = "",
      error_Message = "Payment cancelled or failed",
      additionalCharges = "",
      udf1 = ""
    } = payuData;

    const receivedHash = posted_hash || bodyHash;
    const bookingId = udf1 || txnid;

    const isJsonRequest =
      req.headers.accept?.includes("application/json") ||
      req.headers["content-type"]?.includes("application/json");

    let isHashValid = false;
    if (salt && receivedHash) {
      let reverseSequence = "";
      if (additionalCharges) {
        reverseSequence = `${additionalCharges}|${salt}|${status}||||||${payuData.udf5 || ""}|${payuData.udf4 || ""}|${payuData.udf3 || ""}|${payuData.udf2 || ""}|${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
      } else {
        reverseSequence = `${salt}|${status}||||||${payuData.udf5 || ""}|${payuData.udf4 || ""}|${payuData.udf3 || ""}|${payuData.udf2 || ""}|${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
      }
      const calculatedHash = crypto.createHash("sha512").update(reverseSequence).digest("hex");
      isHashValid = calculatedHash.toLowerCase() === receivedHash.toLowerCase();
    } else {
      isHashValid = true;
    }

    const statusLower = status.toLowerCase();
    const unmappedLower = unmappedstatus.toLowerCase();

    let targetStatus = "PENDING";
    if (statusLower === "success" && isHashValid) {
      targetStatus = "PAID";
    } else if (statusLower === "usercancelled" || unmappedLower === "usercancelled" || statusLower === "cancelled") {
      targetStatus = "CANCELLED";
    } else {
      targetStatus = "FAILED";
    }

    const booking = await Booking.findOneAndUpdate(
      { $or: [{ payuTxnId: txnid }, { bookingId }] },
      {
        status: targetStatus,
        payuMihpayid: mihpayid || txnid,
        payuHash: receivedHash,
        payuStatus: status,
        payuUnmappedStatus: unmappedstatus,
        paymentMode: mode || "PAYU",
        bankRefNum: bank_ref_num,
        payuErrorMsg: error_Message,
        ...(targetStatus === "PAID" ? { paidAt: new Date() } : {})
      },
      { new: true }
    );

    if (booking && targetStatus === "PAID") {
      sendBookingPaymentInvoiceEmail(booking).catch(console.error);
    }

    const frontendUrl = process.env.FRONTEND_URL || "https://wearesoloz.com";

    if (targetStatus === "PAID") {
      if (isJsonRequest) {
        return res.json({ success: true, bookingId: booking?.bookingId || bookingId, paymentId: mihpayid || txnid });
      }
      return res.redirect(302, `${frontendUrl}/booking-success?bookingId=${encodeURIComponent(booking?.bookingId || bookingId)}&paymentId=${encodeURIComponent(mihpayid || txnid)}`);
    } else {
      if (isJsonRequest) {
        return res.status(400).json({ success: false, error: error_Message || `Payment ${targetStatus.toLowerCase()}` });
      }
      const cancelOrFailedMsg = targetStatus === "CANCELLED" ? "Payment was cancelled by user." : (error_Message || `Payment ${targetStatus.toLowerCase()}`);
      return res.redirect(302, `${frontendUrl}/booking-failed?bookingId=${encodeURIComponent(booking?.bookingId || bookingId)}&error=${encodeURIComponent(cancelOrFailedMsg)}&slug=${encodeURIComponent(booking?.tripSlug || "")}`);
    }
  } catch (error) {
    console.error("Error processing PayU callback:", error);
    const frontendUrl = process.env.FRONTEND_URL || "https://wearesoloz.com";
    return res.redirect(302, `${frontendUrl}/booking-failed?error=${encodeURIComponent("Server payment processing error")}`);
  }
});

// 4. PAYU REAL-TIME SERVER-TO-SERVER SYNC API (verify_payment)
router.all("/sync-payu-status", async (req, res) => {
  try {
    await connectDB();
    const { txnid, bookingId } = { ...req.query, ...(req.body || {}) };
    const { key, salt } = getPayUCredentials();

    if (!key || !salt) {
      return res.status(500).json({ error: "PayU Merchant Key and Salt must be configured on server." });
    }

    let query = {};
    if (txnid || bookingId) {
      query = { $or: [{ payuTxnId: txnid || bookingId }, { bookingId: bookingId || txnid }] };
    } else {
      // Default: Sync all PENDING bookings
      query = { status: "PENDING" };
    }

    const bookingsToSync = await Booking.find(query).limit(50);
    if (bookingsToSync.length === 0) {
      return res.json({ success: true, message: "No bookings available to sync.", updatedCount: 0 });
    }

    const txnIdsArray = bookingsToSync.map((b) => b.payuTxnId).filter(Boolean);
    if (txnIdsArray.length === 0) {
      return res.json({ success: true, message: "No valid PayU transaction IDs found.", updatedCount: 0 });
    }

    const var1Str = txnIdsArray.join("|");
    const command = "verify_payment";
    const hashSeq = `${key}|${command}|${var1Str}|${salt}`;
    const hash = crypto.createHash("sha512").update(hashSeq).digest("hex");

    const params = new URLSearchParams();
    params.append("key", key);
    params.append("command", command);
    params.append("var1", var1Str);
    params.append("hash", hash);

    const payuRes = await fetch("https://info.payu.in/merchant/postfinalpage.php?form=2", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString()
    });

    const payuData = await payuRes.json();
    let updatedCount = 0;
    const results = [];

    if (payuData && payuData.transaction_details) {
      for (const b of bookingsToSync) {
        const details = payuData.transaction_details[b.payuTxnId];
        if (details) {
          const statusStr = (details.status || "").toLowerCase();
          const unmapped = (details.unmappedstatus || "").toLowerCase();

          let newStatus = b.status;
          if (statusStr === "success" || unmapped === "captured") {
            newStatus = "PAID";
          } else if (statusStr === "usercancelled" || unmapped === "usercancelled" || statusStr === "cancelled") {
            newStatus = "CANCELLED";
          } else if (statusStr === "failure" || statusStr === "failed" || unmapped === "failed") {
            newStatus = "FAILED";
          }

          b.payuStatus = details.status || b.payuStatus;
          b.payuUnmappedStatus = details.unmappedstatus || b.payuUnmappedStatus;
          b.paymentMode = details.mode || details.card_type || details.bankcode || b.paymentMode;
          b.bankRefNum = details.bank_ref_num || b.bankRefNum;
          b.payuErrorMsg = details.error_Message || details.field9 || b.payuErrorMsg;
          if (details.mihpayid) b.payuMihpayid = details.mihpayid;

          if (newStatus !== b.status) {
            b.status = newStatus;
            if (newStatus === "PAID" && !b.paidAt) b.paidAt = new Date();
            updatedCount++;
          }

          await b.save();
          results.push({ bookingId: b.bookingId, status: b.status, mode: b.paymentMode, bankRefNum: b.bankRefNum });
        }
      }
    }

    res.json({
      success: true,
      message: `Checked ${bookingsToSync.length} booking(s) with PayU servers. Updated ${updatedCount} status(es).`,
      updatedCount,
      results
    });
  } catch (error) {
    console.error("Error syncing PayU status:", error);
    res.status(500).json({ error: error.message || "Failed to sync status with PayU" });
  }
});

// 5. PAYU WEBHOOK HANDLER
router.post("/webhook", async (req, res) => {
  try {
    await connectDB();
    const event = req.body;
    const {
      status = "",
      txnid = "",
      mihpayid = "",
      udf1 = "",
      mode = "",
      bank_ref_num = ""
    } = event;

    const bookingId = udf1 || txnid;

    if (txnid) {
      const statusLower = status.toLowerCase();
      let targetStatus = "PENDING";
      if (statusLower === "success") targetStatus = "PAID";
      else if (statusLower === "usercancelled" || statusLower === "cancelled") targetStatus = "CANCELLED";
      else if (statusLower === "failure" || statusLower === "failed") targetStatus = "FAILED";

      const booking = await Booking.findOne({ $or: [{ payuTxnId: txnid }, { bookingId }] });
      if (booking) {
        booking.status = targetStatus;
        booking.payuMihpayid = mihpayid || booking.payuMihpayid || txnid;
        booking.payuStatus = status;
        if (mode) booking.paymentMode = mode;
        if (bank_ref_num) booking.bankRefNum = bank_ref_num;
        if (targetStatus === "PAID" && !booking.paidAt) booking.paidAt = new Date();
        await booking.save();
        console.log(`✅ PayU Webhook updated Booking ${booking.bookingId} to ${targetStatus}`);
      }
    }

    res.json({ status: "ok" });
  } catch (error) {
    console.error("Error processing PayU Webhook:", error);
    res.status(500).json({ error: "Webhook processing error" });
  }
});

// 6. FETCH BOOKING DETAILS FOR CONFIRMATION PAGE
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
