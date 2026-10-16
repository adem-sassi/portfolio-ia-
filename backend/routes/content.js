import express from "express";
import Content from "../models/Content.js";
import Article from "../models/Article.js";
import crypto from "crypto";
import Groq from "groq-sdk";

const router = express.Router();

const cache = new Map();
const TTL = 30 * 1000; // 30 secondes
export function clearCache(key) { if(key) { cache.delete(key); cache.delete(key + "_en"); } else cache.clear(); }

function getCache(key) {
  const c = cache.get(key);
  if (c && Date.now() - c.time < TTL) return c.data;
  return null;
}

function setCache(key, data) {
  cache.set(key, { data, time: Date.now() });
}

// Sections jamais exposées publiquement
const PRIVATE_SECTIONS = ["backup_meta", "photo", "cv", "reset_token", "admin_auth", "i18n_en"];

// ── Version anglaise : les textes de l'admin sont traduits une fois par l'IA, puis gardés en base ──
export const TR_SECTIONS = ["hero", "about", "projects", "skills", "contact", "testimonials", "cvpage"];
const TR_KEYS = new Set(["title", "description", "desc", "text", "role", "label", "availabilityText", "category", "year", "quote", "school"]);
const worthIt = (v) => typeof v === "string" && /[a-zà-ÿ]{3,}/i.test(v) && !/^(https?:|mailto:|#|\/)/.test(v) && !/@/.test(v);
export const hashOf = (t) => crypto.createHash("sha1").update(t).digest("hex");

export function collectTexts(node, out, key = "", parent = "") {
  if (Array.isArray(node)) { node.forEach((v) => (typeof v === "string" ? (key === "paragraphs" && worthIt(v) && out.add(v)) : collectTexts(v, out, key, parent))); return; }
  if (!node || typeof node !== "object") return;
  for (const [k, v] of Object.entries(node)) {
    if (typeof v === "string") { if ((TR_KEYS.has(k) || parent === "stats") && worthIt(v)) out.add(v); }
    else collectTexts(v, out, k, k);
  }
}
function applyTexts(node, map, key = "", parent = "") {
  if (Array.isArray(node)) return node.map((v) => (typeof v === "string" ? (key === "paragraphs" ? map.get(v) || v : v) : applyTexts(v, map, key, parent)));
  if (!node || typeof node !== "object") return node;
  const o = {};
  for (const [k, v] of Object.entries(node)) {
    if (typeof v === "string") o[k] = (TR_KEYS.has(k) || parent === "stats") ? map.get(v) || v : v;
    else o[k] = applyTexts(v, map, k, k);
  }
  return o;
}
async function translateBatch(list) {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const r = await groq.chat.completions.create({
    model: "openai/gpt-oss-120b", reasoning_effort: "low", temperature: 0.2, max_tokens: 6000,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: "You translate French portfolio content into natural, professional English for recruiters. Keep proper nouns, company and school names (ACENSI, École Hexagone, NetData Innovation, Dynamix), technology names, numbers, dates and emojis unchanged. 'Actuellement' means 'Present'. 'Alternance' means 'work-study'. Reply ONLY with JSON: {\"t\": [translations]} with exactly the same number of items, in the same order." },
      { role: "user", content: JSON.stringify(list) },
    ],
  });
  const txt = r.choices[0].message.content || "";
  const json = JSON.parse(txt.slice(txt.indexOf("{"), txt.lastIndexOf("}") + 1));
  if (!Array.isArray(json.t) || json.t.length !== list.length) throw new Error("traduction incomplète");
  return json.t.map(String);
}
async function translateContent(result) {
  const texts = new Set();
  TR_SECTIONS.forEach((k) => result[k] && collectTexts(result[k], texts));
  const doc = await Content.findOne({ section: "i18n_en" });
  const memo = { ...(doc?.data || {}) };
  const missing = [...texts].filter((t) => !memo[hashOf(t)]);
  let added = 0;
  const chunks = [];
  for (let i = 0; i < missing.length; i += 15) chunks.push(missing.slice(i, i + 15));
  await Promise.all(chunks.map(async (chunk) => {
    try { const out = await translateBatch(chunk); chunk.forEach((t, j) => { memo[hashOf(t)] = out[j]; added++; }); }
    catch (e) { console.error("translate:", e.message); }
  }));
  if (added) await Content.findOneAndUpdate({ section: "i18n_en" }, { section: "i18n_en", data: memo }, { upsert: true });
  const map = new Map([...texts].map((t) => [t, memo[hashOf(t)] || t]));
  const en = { ...result };
  TR_SECTIONS.forEach((k) => { if (en[k]) en[k] = applyTexts(en[k], map); });
  return en;
}

// GET /api/content
router.get("/", async (req, res) => {
  try {
    const en = req.query.lang === "en";
    const cached = getCache(en ? "content_en" : "content");
    if (cached) return res.json(cached);

    let result = getCache("content");
    if (!result) {
      const sections = await Content.find({});
      result = {};
      sections.forEach(s => {
        if (!PRIVATE_SECTIONS.includes(s.section)) result[s.section] = s.data;
      });
      setCache("content", result);
    }
    if (!en) return res.json(result);

    let translated = result;
    try { translated = await translateContent(result); } catch (e) { console.error("content en:", e.message); }
    setCache("content_en", translated);
    res.json(translated);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/content/cv
router.get("/cv", async (req, res) => {
  try {
    const doc = await Content.findOne({ section: "cv" });
    if (!doc || !doc.data) return res.status(404).json({ error: "CV non trouvé" });

    if (doc.data.url) return res.redirect(doc.data.url);

    if (doc.data.file) {
      const base64 = doc.data.file.includes(",") ? doc.data.file.split(",")[1] : doc.data.file;
      const buffer = Buffer.from(base64, "base64");
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "inline; filename=\"cv.pdf\"");
      res.setHeader("Content-Length", buffer.length);
      return res.end(buffer);
    }

    res.status(404).json({ error: "CV non trouvé" });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/content/sitemap
router.get("/sitemap", async (req, res) => {
  try {
    const articles = await Article.find({ published: true }).select("slug updatedAt createdAt");
    const pages = [
      { url: "https://ademsassi.com", priority: "1.0", freq: "weekly" },
      { url: "https://ademsassi.com/blog", priority: "0.9", freq: "daily" },
    ];
    articles.forEach(function(a) {
      pages.push({
        url: "https://ademsassi.com/blog/" + a.slug,
        priority: "0.8",
        freq: "monthly",
        lastmod: new Date(a.updatedAt || a.createdAt).toISOString().split("T")[0]
      });
    });
    var xml = '<?xml version="1.0" encoding="UTF-8"?>';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
    pages.forEach(function(p) {
      xml += "<url>";
      xml += "<loc>" + p.url + "</loc>";
      xml += "<changefreq>" + p.freq + "</changefreq>";
      xml += "<priority>" + p.priority + "</priority>";
      if (p.lastmod) { xml += "<lastmod>" + p.lastmod + "</lastmod>"; }
      xml += "</url>";
    });
    xml += "</urlset>";
    res.setHeader("Content-Type", "application/xml");
    res.send(xml);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/content/:section
router.get("/:section", async (req, res) => {
  try {
    if (PRIVATE_SECTIONS.includes(req.params.section)) return res.status(404).json({ error: "Section non trouvée" });
    const doc = await Content.findOne({ section: req.params.section });
    if (!doc) return res.status(404).json({ error: "Section non trouvée" });
    res.json(doc.data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;
