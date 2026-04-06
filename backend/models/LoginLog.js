import mongoose from "mongoose";

const LoginLogSchema = new mongoose.Schema({
  ip: String,
  success: Boolean,
  attempts: { type: Number, default: 1 },
  userAgent: String,
  country: String,
  blockedUntil: Date,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("LoginLog", LoginLogSchema);
