import express from "express";
import nodemailer from "nodemailer";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { writeFileSync, unlinkSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import Content from "../models/Content.js";
import LoginLog from "../models/LoginLog.js";
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

    // Succès
    await LoginLog.create({ ip, success: true, userAgent });
    const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET, { expiresIn: "8h" });
    res.json({ success: true, token, expiresIn: "8h" });
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
    res.json({ success: true, message: `Section "${section}" mise à jour ✅` });
  } catch { res.status(500).json({ error: "Erreur mise à jour" }); }
});

// ── POST /api/admin/upload-cv ─────────────────────────────────────────────────
router.post("/upload-cv", authMiddleware, (req, res) => {
  try {
    const { file } = req.body;
    if (!file) return res.status(400).json({ error: "Aucun fichier reçu" });

    const buffer = Buffer.from(file, "base64");
    if (buffer.length > 5 * 1024 * 1024) {
      return res.status(400).json({ error: "Fichier trop lourd — max 5MB" });
    }

    if (!existsSync(PUBLIC_DIR)) mkdirSync(PUBLIC_DIR, { recursive: true });
    writeFileSync(CV_PATH, buffer);
    console.log(`✅ CV uploadé: ${buffer.length} bytes`);
    res.json({ success: true, message: "CV uploadé avec succès !" });
  } catch (e) {
    console.error("Upload error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// ── DELETE /api/admin/delete-cv ───────────────────────────────────────────────
router.delete("/delete-cv", authMiddleware, (req, res) => {
  try {
    if (existsSync(CV_PATH)) unlinkSync(CV_PATH);
    res.json({ success: true, message: "CV supprimé" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


// Tokens reset en mémoire
const resetTokens = new Map();

// POST /api/admin/forgot-password
router.post("/forgot-password", async (req, res) => {
  try {
    const token = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
    resetTokens.set(token, { expires: Date.now() + 15 * 60 * 1000 });
    const resetLink = `${process.env.FRONTEND_URL}/admin/reset-password?token=${token}`;

    const resend = new Resend(process.env.RESEND_API_KEY);
    
    await resend.emails.send({
      from: "Portfolio Admin <onboarding@resend.dev>",
      to: process.env.EMAIL_USER,
      subject: "Reset mot de passe - ademsassi.com",
      html: `<div>
        <h2>Reset mot de passe admin</h2>
        <a href="${resetLink}">Clique ici pour réinitialiser</a>
        <p>Ce lien expire dans 15 minutes.</p>
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
    const stored = resetTokens.get(token);

    if (!stored) return res.status(400).json({ error: "Token invalide" });
    if (Date.now() > stored.expires) {
      resetTokens.delete(token);
      return res.status(400).json({ error: "Token expiré" });
    }

    process.env.ADMIN_PASSWORD = newPassword;
    resetTokens.delete(token);

    res.json({ success: true, message: "Mot de passe changé !" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
