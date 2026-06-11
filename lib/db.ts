import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/wearesoloz";

type CachedConnection = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalForMongoose = globalThis as typeof globalThis & {
  mongooseCache?: CachedConnection;
  mongooseErrorListenerAttached?: boolean;
};

const cached = globalForMongoose.mongooseCache || { conn: null, promise: null };

// Attach error listener only once to prevent MaxListeners warning
if (typeof window === "undefined" && !globalForMongoose.mongooseErrorListenerAttached) {
  mongoose.connection.on("error", (err) => {
    console.error("Mongoose connection error:", err.message || err);
  });
  globalForMongoose.mongooseErrorListenerAttached = true;
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000
    }).then((conn) => {
      cached.conn = conn;
      return conn;
    }).catch((err) => {
      cached.promise = null;
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
    globalForMongoose.mongooseCache = cached;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    throw error;
  }
}
