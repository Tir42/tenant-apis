const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log("MONGO_URI loaded:", !!process.env.MONGO_URI);

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log("✅ MongoDB connected successfully");
    console.log("Host:", conn.connection.host);
  } catch (error) {
    console.error("❌ MongoDB connection failed FULL ERROR:");
    console.error(error);
    process.exit(1);
  }
};

module.exports = connectDB;