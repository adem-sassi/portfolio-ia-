import mongoose from "mongoose";

// Événements anonymes du portfolio (aucune IP stockée), effacés automatiquement après 180 jours
const EventSchema = new mongoose.Schema({
  type: { type: String, index: true },
  value: { type: String, default: "" },
  lang: { type: String, default: "fr" },
  createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 180 },
});

export default mongoose.models.Event || mongoose.model("Event", EventSchema);
