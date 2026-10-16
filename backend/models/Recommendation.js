import mongoose from "mongoose";

// Recommandations déposées par les visiteurs, en attente de validation dans l'admin
const RecommendationSchema = new mongoose.Schema({
  name: { type: String, required: true, maxlength: 80 },
  role: { type: String, maxlength: 100, default: "" },
  company: { type: String, maxlength: 80, default: "" },
  relation: { type: String, maxlength: 30, default: "autre" },
  email: { type: String, required: true, maxlength: 120 },
  linkedin: { type: String, maxlength: 200, default: "" },
  text: { type: String, required: true, maxlength: 1200 },
  status: { type: String, enum: ["pending", "approved", "rejected", "spam"], default: "pending", index: true },
  ipHash: { type: String, default: "" },
  reason: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Recommendation", RecommendationSchema);
