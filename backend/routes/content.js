const cache = new Map();
const TTL = 5 * 60 * 1000;

function getCache(key) {
  const c = cache.get(key);
  if (c && Date.now() - c.time < TTL) return c.data;
  return null;
}

function setCache(key, data) {
  cache.set(key, { data, time: Date.now() });
}

import express from "express";
import Content from "../models/Content.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const cached = getCache("content");
    if (cached) return res.json(cached);
    const sections = await Content.find({});
    const content = {};
    sections.forEach((s) => { content[s.section] = s.data; });
    res.json(content);
  } catch (err) {
    res.status(500).json({ error: "Erreur lecture du contenu" });
  }
});

router.get("/:section", async (req, res) => {
  try {
    const doc = await Content.findOne({ section: req.params.section });
    if (!doc) return res.status(404).json({ error: "Section introuvable" });
    res.json(doc.data);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;

// GET /api/content/theme
router.get("/theme", async (req, res) => {
  try {
    const doc = await Content.findOne({ section: "theme" });
    res.json(doc ? doc.data : {});
  } catch { res.status(500).json({ error: "Erreur" }); }
});
