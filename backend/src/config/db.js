const mongoose = require("mongoose");

/**
 * Opens a single persistent connection to MongoDB Atlas. Called once when the server boots (see src/index.js).
 * It uses the key set in the variables and then connects
 */

async function connectDB() {
  const uri = process.env.MONGODB_URI; //it acccess from the env variable

  if (!uri) {
    throw new Error(
      "There is some problem in the MONGODB_URI"
    );
  }

  mongoose.connection.on("connected", () => {
    console.log("[db] MongoDB connected-Sanay Topper!"); //this is logged on the termina;
  });

  mongoose.connection.on("error", (err) => {
    console.error("[db] MongoDB connection error:", err.message);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("[db] MongoDB disconnected"); 
  });

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 8000,
  });
}

module.exports = connectDB; // this function is exported and can be used 
//somewhere else it becomes public
