import mongoose from "mongoose";

const VisitorSchema = new mongoose.Schema({
  ip: String,
  userAgent: String,
  page: String,
  referrer: String,
  company: String,
  country: String,
  city: String,
  duration: Number,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Visitor", VisitorSchema);
