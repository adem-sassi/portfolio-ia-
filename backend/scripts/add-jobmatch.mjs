import dotenv from "dotenv";
dotenv.config({ path: new URL("../.env", import.meta.url).pathname });
import mongoose from "mongoose";
import Content from "../models/Content.js";

await mongoose.connect(process.env.MONGODB_URI);
const doc = await Content.findOne({ section: "projects" });
if (!doc) { console.log("❌ section projects introuvable"); process.exit(1); }
const list = Array.isArray(doc.data) ? doc.data : [];
if (list.some((p) => /jobmatch/i.test(p.title || ""))) {
  console.log("ℹ️  JobMatch est déjà dans tes projets, rien à faire");
} else {
  const id = Math.max(0, ...list.map((p) => Number(p.id) || 0)) + 1;
  list.unshift({
    id,
    title: "JobMatch AI, agent CV / offre",
    desc: "Agent IA qui compare un CV à une offre d'emploi en 4 étapes : extraction des compétences, score de correspondance (TF-IDF + similarité cosinus), décision selon le score, puis conseils personnalisés générés par LLaMA 3.3 via Groq.",
    tags: ["Python", "scikit-learn", "TF-IDF", "Groq", "LLaMA", "Agent IA"],
    stats: { score: "TF-IDF + cosinus", modele: "LLaMA 3.3 70B", etapes: "4 étapes" },
    github: "https://github.com/ADEM-SASSI",
    demo: "#",
    featured: true,
    color: "neural-violet",
  });
  doc.data = list; doc.markModified("data"); await doc.save();
  console.log("✅ JobMatch ajouté à tes projets");
}
await mongoose.disconnect();
