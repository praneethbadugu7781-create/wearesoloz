require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { connectDB } = require("./lib/db");

const authRoutes = require("./routes/auth");
const publicRoutes = require("./routes/public");
const adminRoutes = require("./routes/admin");
const paymentRoutes = require("./routes/payment");

const app = express();
const PORT = process.env.PORT || 5000;

// CORS — allow frontend origin
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:3000",
  "http://localhost:3001",
].filter(Boolean);

// Automatically support both www and apex versions of FRONTEND_URL
if (process.env.FRONTEND_URL) {
  try {
    const url = new URL(process.env.FRONTEND_URL);
    if (!url.hostname.startsWith("www.")) {
      allowedOrigins.push(`${url.protocol}//www.${url.hostname}`);
    } else {
      allowedOrigins.push(`${url.protocol}//${url.hostname.replace(/^www\./, "")}`);
    }
  } catch (err) {
    console.error("CORS config: Invalid FRONTEND_URL in env configuration:", err);
  }
}

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      if (allowedOrigins.some((allowed) => origin.startsWith(allowed))) {
        return callback(null, true);
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(
  express.json({
    limit: "10mb",
    verify: (req, res, buf) => {
      req.rawBody = buf;
    }
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api", publicRoutes);
app.use("/api/admin", adminRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "WeAreSoloz API is running" });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Start server
async function start() {
  try {
    await connectDB();
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("⚠️  MongoDB connection failed:", err.message);
    console.log("Server will start anyway and retry on first request...");
  }

  app.listen(PORT, () => {
    console.log(`🚀 WeAreSoloz API running on port ${PORT}`);
  });
}

start();
