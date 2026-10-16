import express from "express";
import rateLimit from "express-rate-limit";
import crypto from "crypto";
import Recommendation from "../models/Recommendation.js";
import Content from "../models/Content.js";
import { authMiddleware } from "../middleware/auth.js";
import { clearCache } from "./content.js";

const router = express.Router();
const OWNER = process.env.EMAIL_USER || "sassiadem7@gmail.com";
const RELATIONS = ["prof", "manager", "collegue", "camarade", "client", "autre"];
const REL_LABEL = { prof: "Professeur", manager: "Manager", collegue: "Collègue", camarade: "Camarade de promo", client: "Client", autre: "Autre" };

// 3 envois max par heure et par IP
const postLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 3, standardHeaders: true, legacyHeaders: false, message: { error: "Trop d'envois, réessaie plus tard." } });

const clean = (s, n) => String(s ?? "").replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim().slice(0, n);
const cleanText = (s, n) => String(s ?? "").replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, " ").replace(/\n{3,}/g, "\n\n").trim().slice(0, n);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const initials = (n) => n.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("") || "?";
const SPAM = /\b(casino|viagra|crypto|bitcoin|forex|loan|seo services?|backlinks?|click here|buy now|free money|winner|porn|xxx|escort|telegram|whatsapp)\b/i;

function looksSpammy({ name, text }) {
  const urls = (text.match(/https?:\/\/|www\./gi) || []).length;
  if (urls > 0) return "lien";
  if (SPAM.test(text) || SPAM.test(name)) return "mots";
  if (/(.)\1{7,}/.test(text)) return "répétition";
  const letters = text.replace(/[^a-zà-ÿ]/gi, "");
  if (letters.length > 30 && letters === letters.toUpperCase()) return "majuscules";
  if (/[Ѐ-ӿ一-鿿]{6,}/.test(text)) return "alphabet";
  if (text.split(/\s+/).length < 8) return "court";
  return null;
}

async function mxOk(email) {
  try {
    const r = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(email.split("@")[1])}&type=MX`, { signal: AbortSignal.timeout(3000) });
    const d = await r.json();
    return Array.isArray(d.Answer) && d.Answer.length > 0;
  } catch { return true; } // en cas de panne DNS on ne bloque pas
}

// ── POST /api/recos : dépôt public ─────────────────────────────────────────────
router.post("/", postLimiter, async (req, res) => {
  const ok = () => res.json({ success: true });
  try {
    const b = req.body || {};
    // pièges anti-robots : champ caché rempli, ou formulaire envoyé trop vite / trop tard
    if (b.website) return ok();
    const t = Number(b.t);
    if (!t || Date.now() - t < 6000 || Date.now() - t > 3 * 60 * 60 * 1000) return ok();

    const name = clean(b.name, 80), role = clean(b.role, 100), company = clean(b.company, 80);
    const relation = RELATIONS.includes(b.relation) ? b.relation : "autre";
    const email = clean(b.email, 120).toLowerCase(), text = cleanText(b.text, 1200);
    let linkedin = clean(b.linkedin, 200);

    if (name.length < 2 || !/[a-zà-ÿ]/i.test(name)) return res.status(400).json({ error: "Indique ton nom." });
    if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email)) return res.status(400).json({ error: "Email invalide." });
    if (text.length < 60) return res.status(400).json({ error: "Ta recommandation doit faire au moins 60 caractères." });
    if (b.consent !== true) return res.status(400).json({ error: "Coche la case d'accord pour publier." });
    if (linkedin) {
      if (!/^https?:\/\//i.test(linkedin)) linkedin = "https://" + linkedin;
      if (!/^https:\/\/([a-z]{2,3}\.)?linkedin\.com\/in\/[\w\-%.]+\/?$/i.test(linkedin)) return res.status(400).json({ error: "Lien LinkedIn invalide (format linkedin.com/in/...)." });
    }
    if (!(await mxOk(email))) return res.status(400).json({ error: "Ce domaine email n'existe pas." });

    const ip = (req.headers["x-forwarded-for"] || "").split(",")[0] || req.socket.remoteAddress || "";
    const ipHash = crypto.createHash("sha256").update(ip + (process.env.JWT_SECRET || "salt")).digest("hex").slice(0, 24);

    // les envois douteux ne sont pas jetés : ils vont dans l'onglet « Spam » de l'admin, sans email
    let reason = looksSpammy({ name, text });
    if (!reason && (await Recommendation.findOne({ $or: [{ email }, { ipHash }], status: "pending" }))) reason = "doublon";
    if (!reason && (await Recommendation.countDocuments({ status: "pending" })) >= 30) reason = "file pleine";
    if (reason) {
      if ((await Recommendation.countDocuments({ status: "spam" })) < 100) await Recommendation.create({ name, role, company, relation, email, linkedin, text, ipHash, status: "spam", reason });
      return ok();
    }

    const doc = await Recommendation.create({ name, role, company, relation, email, linkedin, text, ipHash });

    try {
      const { Resend } = await import("resend");
      await new Resend(process.env.RESEND_API_KEY).emails.send({
        from: "Portfolio <contact@ademsassi.com>",
        to: [OWNER],
        subject: `Nouvelle recommandation de ${name} à valider`,
        html: `<div style="font-family:system-ui,sans-serif;max-width:560px">
          <h2 style="margin:0 0 8px">Nouvelle recommandation</h2>
          <p style="margin:0 0 4px"><b>${esc(name)}</b> · ${esc([role, company].filter(Boolean).join(", "))} · ${esc(REL_LABEL[relation])}</p>
          <p style="margin:0 0 12px;color:#666">${esc(email)}${linkedin ? ` · <a href="${esc(linkedin)}">LinkedIn</a>` : ""}</p>
          <blockquote style="margin:0;padding:12px 16px;border-left:3px solid #00D4FF;background:#f5f8fc;white-space:pre-wrap">${esc(text)}</blockquote>
          <p style="margin:16px 0 0"><a href="https://ademsassi.com/admin">Valider ou refuser dans l'admin →</a></p></div>`,
      });
    } catch (e) { console.error("reco mail:", e.message); }

    res.json({ success: true, id: doc._id });
  } catch (e) {
    console.error("reco:", e.message);
    res.status(500).json({ error: "Erreur, réessaie plus tard." });
  }
});

// ── Admin ──────────────────────────────────────────────────────────────────────
router.get("/admin", authMiddleware, async (req, res) => {
  try {
    const list = await Recommendation.find({}, "-ipHash").sort({ createdAt: -1 }).limit(300).lean();
    res.json(list);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post("/admin/:id/approve", authMiddleware, async (req, res) => {
  try {
    const r = await Recommendation.findById(req.params.id);
    if (!r) return res.status(404).json({ error: "Introuvable" });
    const doc = await Content.findOne({ section: "testimonials" });
    const list = Array.isArray(doc?.data) ? doc.data : [];
    const year = new Date(r.createdAt).getFullYear();
    const role = [r.role, r.company].filter(Boolean).join(", ") || REL_LABEL[r.relation] || "";
    const entry = { id: Date.now(), name: r.name, role: `${role} - ${year}`, text: r.text, avatar: initials(r.name), ...(r.linkedin ? { linkedin: r.linkedin } : {}), fromForm: String(r._id) };
    const next = [...list.filter((x) => x.fromForm !== String(r._id)), entry];
    await Content.findOneAndUpdate({ section: "testimonials" }, { section: "testimonials", data: next }, { upsert: true });
    r.status = "approved"; await r.save();
    clearCache();
    res.json({ success: true, testimonials: next });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post("/admin/:id/reject", authMiddleware, async (req, res) => {
  await Recommendation.updateOne({ _id: req.params.id }, { status: "rejected" });
  res.json({ success: true });
});

router.delete("/admin/:id", authMiddleware, async (req, res) => {
  await Recommendation.deleteOne({ _id: req.params.id });
  res.json({ success: true });
});

export default router;
