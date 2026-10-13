import dotenv from "dotenv";
dotenv.config({ path: new URL("../.env", import.meta.url).pathname });
import mongoose from "mongoose";
import Content from "../models/Content.js";

await mongoose.connect(process.env.MONGODB_URI);
const get = async s => await Content.findOne({ section: s });
const save = async doc => { doc.markModified("data"); await doc.save(); console.log("✅", doc.section); };

// HERO
const hero = await get("hero");
hero.data.title = "Ingénieur IA en alternance";
hero.data.description = "Ingénieur IA en alternance chez ACENSI, je conçois des agents LLM, des architectures RAG et les plateformes qui les font tourner. Étudiant en Master 2 Ingénierie Data & IA à l'École Hexagone.";
if (hero.data.stats?.[2]) hero.data.stats[2].value = "M2";
await save(hero);

// ABOUT
const about = await get("about");
about.data.title = "Ingénieur IA & Développeur Full-Stack";
about.data.paragraphs[0] = "Étudiant en Master 2 Ingénierie Data & IA à l'École Hexagone, je suis en alternance chez ACENSI comme développeur d'agents IA. J'y conçois des agents basés sur les LLM, des workflows multi-agents avec LangGraph et des architectures RAG, de l'API Python jusqu'à l'interface React.";

const tl = about.data.timeline || [];
if (tl.length && !tl.some(t => /ACENSI/i.test(JSON.stringify(t)))) {
  const make = (title, period, text, place) => {
    const o = { ...tl[0] };
    for (const k of Object.keys(o)) {
      if (/title|titre/i.test(k)) o[k] = title;
      else if (/date|year|annee|period|periode/i.test(k)) o[k] = period;
      else if (/desc|text|content/i.test(k)) o[k] = text;
      else if (/company|org|place|school|lieu|entreprise/i.test(k)) o[k] = place;
    }
    delete o._id;
    return o;
  };
  tl.unshift(
    make("Alternance Ingénieur IA", "2026 - 2027", "Développement d'agents IA basés sur les LLM, workflows multi-agents LangGraph, architectures RAG, APIs Python et interfaces React sur la plateforme GenAI.", "ACENSI"),
    make("Master 2 Ingénierie Data & IA", "2026 - 2027", "Deuxième année du cycle ingénieur Data & IA, suivie en alternance.", "École Hexagone, Versailles")
  );
  about.data.timeline = tl;
}
await save(about);

// CONTACT
const contact = await get("contact");
contact.data.availabilityText = "En alternance chez ACENSI, ouvert aux échanges autour de la GenAI et des agents IA";
await save(contact);

console.log("\nAPERÇU TIMELINE :");
(await get("about")).data.timeline.slice(0, 3).forEach(t => console.log(" ", JSON.stringify(t)));
await mongoose.disconnect();
