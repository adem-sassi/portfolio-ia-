import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema({
  articleSlug: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String },
  content: { type: String, required: true },
  approved: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Comment", CommentSchema);
