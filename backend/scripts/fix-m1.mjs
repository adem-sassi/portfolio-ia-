import dotenv from "dotenv";
dotenv.config({ path: new URL("../.env", import.meta.url).pathname });
import mongoose from "mongoose";
import Content from "../models/Content.js";

await mongoose.connect(process.env.MONGODB_URI);
const about = await Content.findOne({ section: "about" });
const seen = new Set();
about.data.timeline = (about.data.timeline || [])
  .map((t) => (/master\s*1/i.test(t.title || "") ? { ...t, year: "2025 — 2026" } : t))
  .filter((t) => { const k = [t.title, t.place, t.year].join("|"); if (seen.has(k)) return false; seen.add(k); return true; });
about.markModified("data");
await about.save();
console.log("✅ Parcours mis à jour :");
about.data.timeline.forEach((t) => console.log("  •", t.year, "|", t.title, "|", t.place));
await mongoose.disconnect();
