import mongoose from "mongoose";

export async function connectDB() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGODB_URI manquant dans le .env");

    await mongoose.connect(uri);
    console.log("✅ MongoDB connecté avec succès");
  } catch (err) {
    console.error("❌ Erreur MongoDB:", err.message);
    process.exit(1);
  }
}
