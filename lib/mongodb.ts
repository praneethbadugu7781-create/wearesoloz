import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri && process.env.NODE_ENV === "production") {
  throw new Error("MONGODB_URI is required in production");
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

const globalForMongo = globalThis as typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
};

if (!uri) {
  client = new MongoClient("mongodb://127.0.0.1:27017/wearesoloz");
  clientPromise = client.connect();
} else if (process.env.NODE_ENV === "development") {
  if (!globalForMongo._mongoClientPromise) {
    client = new MongoClient(uri);
    globalForMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalForMongo._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default clientPromise;
