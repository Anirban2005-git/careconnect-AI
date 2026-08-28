import mongoose from "mongoose";

let isConnected = false;

export async function connectDatabase(): Promise<boolean> {
  const uri = process.env.MONGODB_URI;
  if (!uri || uri === "MY_MONGODB_URI") {
    console.log("MongoDB not configured — using in-memory demo store");
    return false;
  }

  try {
    await mongoose.connect(uri);
    isConnected = true;
    console.log("MongoDB connected");
    return true;
  } catch (error) {
    console.warn("MongoDB connection failed — falling back to in-memory demo store:", error);
    return false;
  }
}

export function isDbConnected(): boolean {
  return isConnected && mongoose.connection.readyState === 1;
}
