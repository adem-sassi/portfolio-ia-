import mongoose from "mongoose";

const ChangeLogSchema = new mongoose.Schema({
  section: String,
  action: String,
  details: String,
  ip: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("ChangeLog", ChangeLogSchema);
