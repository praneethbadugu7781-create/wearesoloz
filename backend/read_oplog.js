require("dotenv").config();
const mongoose = require("mongoose");

async function run() {
  const uri = process.env.MONGODB_URI;
  console.log("Connecting to Atlas...");
  const conn = await mongoose.connect(uri);
  console.log("Connected.");
  
  try {
    const localDb = conn.connection.client.db("local");
    const oplog = localDb.collection("oplog.rs");
    console.log("Querying oplog...");
    
    const deletes = await oplog.find({ 
      ns: "wearesoloz.trips",
      op: "d"
    }).sort({ ts: -1 }).limit(100).toArray();
    
    console.log(`Found ${deletes.length} delete operations in oplog.`);
    for (const d of deletes) {
      console.log("Delete Event:", JSON.stringify(d, null, 2));
    }
  } catch (e) {
    console.error("Failed to query oplog:", e.message || e);
  }
  
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
