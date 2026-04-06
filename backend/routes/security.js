import express from "express";
import LoginLog from "../models/LoginLog.js";
import Visitor from "../models/Visitor.js";
import { authMiddleware } from "../middleware/auth.js";
import crypto from "crypto";

const router = express.Router();

// Codes 2FA en mémoire (expire après 10 minutes)
const tfaCodes = new Map();

// ── POST /api/security/track ─────────────────────────────────────────────────
router.post("/track", async (req, res) => {
  try {
    const { page, referrer, duration } = req.body;
    const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;
    const userAgent = req.headers["user-agent"] || "";

    // Géolocalisation via ip-api (gratuit)
    let country = "Unknown", city = "Unknown", company = "Unknown";
    try {
      const geo = await fetch(`http://ip-api.com/json/${ip}?fields=country,city,org`);
      const geoData = await geo.json();
      country = geoData.country || "Unknown";
      city = geoData.city || "Unknown";
      company = geoData.org || "Unknown";
    } catch {}

    await Visitor.create({ ip, userAgent, page, referrer, duration, country, city, company });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── GET /api/security/visitors ───────────────────────────────────────────────
router.get("/visitors", authMiddleware, async (req, res) => {
  try {
    const visitors = await Visitor.find().sort({ createdAt: -1 }).limit(100);
    const total = await Visitor.countDocuments();
    const today = await Visitor.countDocuments({
      createdAt: { $gte: new Date(new Date().setHours(0,0,0,0)) }
    });
    const companies = await Visitor.aggregate([
      { $match: { company: { $ne: "Unknown" } } },
      { $group: { _id: "$company", count: { $sum: 1 }, lastVisit: { $max: "$createdAt" } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);
    res.json({ visitors, total, today, companies });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── GET /api/security/logs ───────────────────────────────────────────────────
router.get("/logs", authMiddleware, async (req, res) => {
  try {
    const logs = await LoginLog.find().sort({ createdAt: -1 }).limit(50);
    const blocked = await LoginLog.find({ blockedUntil: { $gt: new Date() } });
    res.json({ logs, blocked });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── POST /api/security/unblock ───────────────────────────────────────────────
router.post("/unblock", authMiddleware, async (req, res) => {
  try {
    await LoginLog.updateMany({ ip: req.body.ip }, { $unset: { blockedUntil: "" } });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── POST /api/security/2fa/send ──────────────────────────────────────────────
router.post("/2fa/send", async (req, res) => {
  try {
    const code = crypto.randomInt(100000, 999999).toString();
    tfaCodes.set("admin", { code, expires: Date.now() + 10 * 60 * 1000 });

    // Envoyer via ntfy.sh (gratuit, pas besoin de config)
    await fetch("https://ntfy.sh/ademsassi-admin-2fa", {
      method: "POST",
      body: `Code 2FA: ${code} (valide 10 minutes)`,
      headers: {
        "Title": "🔐 Code Admin Portfolio",
        "Priority": "urgent",
        "Tags": "lock"
      }
    });

    console.log(`2FA Code: ${code}`);
    res.json({ success: true, message: "Code envoyé via ntfy.sh" });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── POST /api/security/2fa/verify ────────────────────────────────────────────
router.post("/2fa/verify", async (req, res) => {
  try {
    const { code } = req.body;
    const stored = tfaCodes.get("admin");
    
    if (!stored) return res.status(400).json({ error: "Aucun code demandé" });
    if (Date.now() > stored.expires) {
      tfaCodes.delete("admin");
      return res.status(400).json({ error: "Code expiré" });
    }
    if (stored.code !== code) return res.status(400).json({ error: "Code incorrect" });
    
    tfaCodes.delete("admin");
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;
