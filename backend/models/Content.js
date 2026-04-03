import mongoose from "mongoose";

const contentSchema = new mongoose.Schema(
  {
    section: { type: String, required: true, unique: true },
    data: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Content", contentSchema);
