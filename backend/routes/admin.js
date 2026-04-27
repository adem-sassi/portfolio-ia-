import express from "express";
import { Resend } from "resend";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { writeFileSync, unlinkSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import Content from "../models/Content.js";
import LoginLog from "../models/LoginLog.js";
import ChangeLog from "../models/ChangeLog.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();
const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = join(__dirname, "../../frontend/public");
const CV_PATH = join(PUBLIC_DIR, "cv.pdf");

// ── POST /api/admin/login ─────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { password } = req.body;
    const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;
    const userAgent = req.headers["user-agent"] || "";

    // Vérifier si IP bloquée
    const blocked = await LoginLog.findOne({ ip, blockedUntil: { $gt: new Date() } });
    if (blocked) {
      const remaining = Math.ceil((blocked.blockedUntil - new Date()) / 60000);
      return res.status(429).json({ error: `IP bloquée pour ${remaining} minutes` });
    }

    if (!password) return res.status(400).json({ error: "Mot de passe requis" });
    
    if (password !== process.env.ADMIN_PASSWORD) {
      await new Promise(r => setTimeout(r, 1000));
      
      // Compter les tentatives échouées
      const recentFails = await LoginLog.countDocuments({
        ip, success: false,
        createdAt: { $gte: new Date(Date.now() - 15 * 60 * 1000) }
      });

      const log = new LoginLog({ ip, success: false, userAgent });
      
      // Bloquer après 5 tentatives échouées
      if (recentFails >= 4) {
        log.blockedUntil = new Date(Date.now() + 30 * 60 * 1000);
        await log.save();
        return res.status(429).json({ error: "Trop de tentatives — IP bloquée 30 minutes" });
      }
      
      await log.save();
      return res.status(401).json({ error: `Mot de passe incorrect (${recentFails + 1}/5)` });
    }

    // Mot de passe correct → envoyer OTP 2FA
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpToken = jwt.sign({ otp, role: "admin" }, process.env.JWT_SECRET, { expiresIn: "10m" });
    
    // Envoyer OTP via Resend
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "Portfolio Admin <onboarding@resend.dev>",
        to: process.env.EMAIL_USER,
        subject: "🔐 Code 2FA — Portfolio Admin",
        html: `<div style="font-family:sans-serif;padding:20px;background:#020408;color:#F0F4FF;">
          <h2 style="color:#00D4FF;">Code de vérification</h2>
          <p>Votre code 2FA pour accéder au panneau admin :</p>
          <div style="font-size:48px;font-weight:bold;color:#00D4FF;letter-spacing:8px;margin:20px 0;">${otp}</div>
          <p style="color:#888;font-size:12px;">Ce code expire dans 10 minutes. IP: ${ip}</p>
        </div>`,
      });
    } catch(e) { console.error("Email 2FA error:", e.message); }
    
    await LoginLog.create({ ip, success: true, userAgent });
    res.json({ success: true, requires2FA: true, otpToken });
  } catch (e) { res.status(500).json({ error: "Erreur serveur" }); }
});

// ── GET /api/admin/verify ─────────────────────────────────────────────────────
router.get("/verify", authMiddleware, (req, res) => {
  res.json({ valid: true });
});

// ── GET /api/admin/content ────────────────────────────────────────────────────
router.get("/content", authMiddleware, async (req, res) => {
  try {
    const sections = await Content.find({});
    const content = {};
    sections.forEach(s => { content[s.section] = s.data; });
    res.json(content);
  } catch { res.status(500).json({ error: "Erreur lecture" }); }
});

// ── PUT /api/admin/content/:section ──────────────────────────────────────────
router.put("/content/:section", authMiddleware, async (req, res) => {
  try {
    const { section } = req.params;
    await Content.findOneAndUpdate(
      { section },
      { section, data: req.body },
      { upsert: true, new: true }
    );
    const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;
    await ChangeLog.create({ section, action: "update", details: `Section "${section}" modifiée`, ip }).catch(() => {});
    res.json({ success: true, message: `Section "${section}" mise à jour ✅` });
  } catch { res.status(500).json({ error: "Erreur mise à jour" }); }
});

// ── POST /api/admin/upload-cv ─────────────────────────────────────────────────
router.post("/upload-cv", authMiddleware, async (req, res) => {
  try {
    const { file, name } = req.body;
    if (!file) return res.status(400).json({ error: "Aucun fichier reçu" });
    const buffer = Buffer.from(file, "base64");
    if (buffer.length > 5 * 1024 * 1024) {
      return res.status(400).json({ error: "Fichier trop lourd — max 5MB" });
    }
    // Stocker dans MongoDB
    await Content.findOneAndUpdate(
      { section: "cv" },
      { section: "cv", data: { file: file, name: name || "cv.pdf", updatedAt: new Date() } },
      { upsert: true }
    );
    res.json({ success: true, message: "CV uploadé!" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete("/delete-cv", authMiddleware, async (req, res) => {
  try {
    await Content.deleteOne({ section: "cv" });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});


// Tokens reset en mémoire
// Tokens stockés dans MongoDB
async function saveResetToken(token) {
  await Content.findOneAndUpdate(
    { section: "reset_token" },
    { section: "reset_token", data: { token, expires: Date.now() + 15 * 60 * 1000 } },
    { upsert: true }
  );
}
async function getResetToken() {
  const doc = await Content.findOne({ section: "reset_token" });
  return doc ? doc.data : null;
}
async function deleteResetToken() {
  await Content.deleteOne({ section: "reset_token" });
}

// POST /api/admin/forgot-password
router.post("/forgot-password", async (req, res) => {
  try {
    const token = jwt.sign({ reset: true }, process.env.JWT_SECRET, { expiresIn: "15m" });
    const resetLink = `${process.env.FRONTEND_URL}/admin/reset-password?token=${token}`;

    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "Portfolio Admin <onboarding@resend.dev>",
      to: process.env.EMAIL_USER,
      subject: "Reset mot de passe - ademsassi.com",
      html: `<div style="font-family:sans-serif;padding:20px;">
        <h2 style="color:#00D4FF;">Reset mot de passe admin</h2>
        <p>Clique sur ce lien pour réinitialiser ton mot de passe :</p>
        <a href="${resetLink}" style="background:#7B2FFF;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin:16px 0;">
          Réinitialiser le mot de passe
        </a>
        <p style="color:#888;font-size:12px;">Ce lien expire dans 15 minutes.</p>
      </div>`,
    });

    res.json({ success: true, message: "Email envoyé!" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/admin/reset-password
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    jwt.verify(token, process.env.JWT_SECRET);
    process.env.ADMIN_PASSWORD = newPassword;
    res.json({ success: true, message: "Mot de passe changé!" });
  } catch (e) {
    res.status(400).json({ error: "Token invalide ou expiré" });
  }
});



// GET /api/admin/changelog
router.get("/changelog", authMiddleware, async (req, res) => {
  try {
    const logs = await ChangeLog.find().sort({ createdAt: -1 }).limit(50);
    res.json(logs);
  } catch (e) { res.status(500).json({ error: e.message }); }
});


// POST /api/admin/verify-2fa
router.post("/verify-2fa", async (req, res) => {
  try {
    const { otpToken, otp } = req.body;
    const decoded = jwt.verify(otpToken, process.env.JWT_SECRET);
    
    if (decoded.otp !== otp) {
      return res.status(401).json({ error: "Code incorrect" });
    }
    
    const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET, { expiresIn: "8h" });
    res.json({ success: true, token, expiresIn: "8h" });
  } catch(e) {
    res.status(401).json({ error: "Code expiré ou invalide" });
  }
});


// POST /api/admin/contact — formulaire contact public
router.post("/contact", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) return res.status(400).json({ error: "Champs manquants" });

    // Vérification format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return res.status(400).json({ error: "Email invalide" });

    // Vérification existence email via API gratuite
    try {
      const domain = email.split("@")[1];
      const dnsRes = await fetch(`https://dns.google/resolve?name=${domain}&type=MX`);
      const dnsData = await dnsRes.json();
      if (!dnsData.Answer || dnsData.Answer.length === 0) {
        return res.status(400).json({ error: "Email invalide — domaine inexistant" });
      }
    } catch {}

    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Email à Adem
    await resend.emails.send({
      from: "Portfolio <contact@ademsassi.com>",
      to: ["sassiadem7@gmail.com"],
      subject: `📬 ${subject || "Nouveau message"} — de ${name}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#0a0a1a;color:#f0f4ff;border-radius:12px">
          <h2 style="color:#00D4FF;margin-bottom:16px">📬 Nouveau message portfolio</h2>
          <p><strong style="color:#7B2FFF">Nom:</strong> ${name}</p>
          <p><strong style="color:#7B2FFF">Email:</strong> <a href="mailto:${email}" style="color:#00D4FF">${email}</a></p>
          <p><strong style="color:#7B2FFF">Sujet:</strong> ${subject || "—"}</p>
          <div style="background:#1a1a2e;padding:16px;border-radius:8px;margin-top:16px;border-left:3px solid #00D4FF">
            <p style="margin:0">${message.split("\n").join("<br>")}</p>
          </div>
        </div>
      `,
      reply_to: email,
    });

    // Accusé de réception au visiteur
    await resend.emails.send({
      from: "Adem SASSI <contact@ademsassi.com>",
      to: [email],
      subject: "✅ Message reçu — Adem SASSI",
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#0a0a1a;color:#f0f4ff;border-radius:12px">
          <h2 style="color:#00D4FF">Merci ${name} ! 👋</h2>
          <p style="color:#a0a8c0">J'ai bien reçu votre message et je vous répondrai dans les plus brefs délais.</p>
          <div style="background:#1a1a2e;padding:16px;border-radius:8px;margin:20px 0;border-left:3px solid #7B2FFF">
            <p style="margin:0;color:#a0a8c0;font-size:14px"><strong style="color:#f0f4ff">Votre message :</strong><br><br>${message.split("\n").join("<br>")}</p>
          </div>
          <hr style="border-color:#1a1a2e;margin:24px 0">
          <div style="text-align:center">
            <p style="color:#7B2FFF;font-weight:bold;font-size:18px">Adem SASSI</p>
            <p style="color:#a0a8c0;font-size:13px">Master 1 IA — École Hexagone, Versailles</p>
            <a href="https://ademsassi.com" style="color:#00D4FF;font-size:13px">ademsassi.com</a>
          </div>
        </div>
      `,
    });

    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;
