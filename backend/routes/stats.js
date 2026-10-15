import express from "express";
import rateLimit from "express-rate-limit";
import Event from "../models/Event.js";
import Content from "../models/Content.js";
import { authMiddleware } from "../middleware/auth.js";
import { clearCache, TR_SECTIONS, collectTexts, hashOf } from "./content.js";

const router = express.Router();
const TYPES = ["view", "chat", "project", "lang", "cv", "email", "contact", "link"];
const eventLimiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 80, standardHeaders: true, legacyHeaders: false });

// POST /api/stats/event : enregistre un événement anonyme
router.post("/event", eventLimiter, async (req, res) => {
  try {
    const { type, value = "", lang = "fr" } = req.body || {};
    if (!TYPES.includes(type)) return res.status(400).json({ error: "type inconnu" });
    await Event.create({ type, value: String(value).slice(0, 200), lang: lang === "en" ? "en" : "fr" });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: "erreur" }); }
});

// GET /api/stats/summary?days=30 : résumé pour l'admin
router.get("/summary", authMiddleware, async (req, res) => {
  try {
    const days = Math.min(365, Math.max(1, parseInt(req.query.days) || 30));
    const since = new Date(Date.now() - days * 864e5);
    const m = { createdAt: { $gte: since } };
    const [counts, langs, perDay, topQuestions, lastQuestions, topProjects] = await Promise.all([
      Event.aggregate([{ $match: m }, { $group: { _id: "$type", n: { $sum: 1 } } }]),
      Event.aggregate([{ $match: { ...m, type: "view" } }, { $group: { _id: "$lang", n: { $sum: 1 } } }]),
      Event.aggregate([{ $match: { ...m, type: "view" } }, { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "Europe/Paris" } }, n: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
      Event.aggregate([{ $match: { ...m, type: "chat" } }, { $group: { _id: { $toLower: "$value" }, n: { $sum: 1 }, last: { $max: "$createdAt" } } }, { $sort: { n: -1, last: -1 } }, { $limit: 12 }]),
      Event.find({ ...m, type: "chat" }).sort({ createdAt: -1 }).limit(25).select("value lang createdAt -_id"),
      Event.aggregate([{ $match: { ...m, type: "project" } }, { $group: { _id: "$value", n: { $sum: 1 } } }, { $sort: { n: -1 } }, { $limit: 10 }]),
    ]);
    res.json({
      days,
      counts: Object.fromEntries(counts.map((x) => [x._id, x.n])),
      langs: Object.fromEntries(langs.map((x) => [x._id, x.n])),
      perDay: perDay.map((x) => ({ day: x._id, n: x.n })),
      topQuestions: topQuestions.map((x) => ({ q: x._id, n: x.n })),
      lastQuestions,
      topProjects: topProjects.map((x) => ({ p: x._id, n: x.n })),
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/stats/translations : textes de l'admin et leur version anglaise
router.get("/translations", authMiddleware, async (req, res) => {
  try {
    const docs = await Content.find({ section: { $in: [...TR_SECTIONS, "i18n_en"] } });
    const memo = docs.find((d) => d.section === "i18n_en")?.data || {};
    const order = [];
    for (const k of TR_SECTIONS) {
      const d = docs.find((x) => x.section === k);
      if (!d) continue;
      const set = new Set(); collectTexts(d.data, set);
      for (const fr of set) order.push({ section: k, hash: hashOf(fr), fr, en: memo[hashOf(fr)] || "" });
    }
    res.json(order);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PUT /api/stats/translations : corrige une traduction { hash, en }
router.put("/translations", authMiddleware, async (req, res) => {
  try {
    const { hash, en } = req.body || {};
    if (!/^[a-f0-9]{40}$/.test(String(hash || ""))) return res.status(400).json({ error: "hash invalide" });
    const doc = await Content.findOne({ section: "i18n_en" });
    const memo = { ...(doc?.data || {}) };
    if (String(en || "").trim()) memo[hash] = String(en).trim().slice(0, 4000); else delete memo[hash];
    await Content.findOneAndUpdate({ section: "i18n_en" }, { section: "i18n_en", data: memo }, { upsert: true });
    clearCache();
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;
