import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import slowDown from "express-slow-down";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import { connectDB } from "./db/connect.js";
import aiRoutes from "./routes/ai.js";
import adminRoutes from "./routes/admin.js";
import contentRoutes from "./routes/content.js";
import { sanitizeBody } from "./middleware/sanitize.js";
import { logger, securityLog } from "./utils/logger.js";
import { mkdirSync } from "fs";

// Créer le dossier logs si inexistant
try { mkdirSync("logs", { recursive: true }); } catch {}

const app = express();
const PORT = process.env.PORT || 8000;
const isProduction = process.env.NODE_ENV === "production";

// ── Trust Proxy (pour Railway/Render) ────────────────────────────────────────
app.set("trust proxy", 1);

// ── Security Headers avec Helmet ─────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:", "https:"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
}));

// ── CORS strict ───────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
  "http://localhost:5173",
  "http://localhost:4173",
];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    securityLog("CORS_BLOCKED", { origin });
    cb(new Error("CORS non autorisé"));
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  maxAge: 86400,
}));

// ── Prévention Pollution des Paramètres ──────────────────────────────────────
app.use(hpp());

// ── MongoDB Injection Prevention ──────────────────────────────────────────────
app.use((req, res, next) => {
  if (req.headers["content-type"]?.includes("multipart/form-data")) return next();
  mongoSanitize({ replaceWith: "_" })(req, res, next);
});

// ── Body Parser avec limite stricte ──────────────────────────────────────────
app.use((req, res, next) => {
  if (req.path === "/api/admin/upload-cv") return next();
  next();
});
app.use(express.json({ limit: "10mb" }));
app.use(express.raw({ type: "multipart/form-data", limit: "10mb" }));
app.use(express.urlencoded({ extended: false, limit: "50kb" }));

// ── Sanitize toutes les entrées ───────────────────────────────────────────────
app.use(sanitizeBody);

// ── Rate Limiting Global ──────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Trop de requêtes. Réessayez dans 15 minutes." },
  handler: (req, res, next, options) => {
    securityLog("RATE_LIMIT_HIT", { ip: req.ip, path: req.path });
    res.status(429).json(options.message);
  },
});

// ── Rate Limiting strict pour Login ──────────────────────────────────────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  skipSuccessfulRequests: true,
  message: { error: "Trop de tentatives. Compte bloqué 15 minutes." },
  handler: (req, res, next, options) => {
    securityLog("LOGIN_RATE_LIMIT", { ip: req.ip });
    res.status(429).json(options.message);
  },
});

// ── Slow Down pour l'IA (éviter abus) ────────────────────────────────────────
const aiSlowDown = slowDown({
  windowMs: 60 * 1000,
  delayAfter: 10,
  delayMs: (used) => (used - 10) * 200,
  maxDelayMs: 3000,
});

// ── Rate Limiting pour l'IA ───────────────────────────────────────────────────
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: "Limite IA atteinte. Attendez 1 minute." },
});

app.use("/api/", globalLimiter);
app.use("/api/admin/login", loginLimiter);
app.use("/api/ai/", aiSlowDown, aiLimiter);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/ai", aiRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/content", contentRoutes);

// ── Health Check ──────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    version: "2.0.0",
    ai: "Groq — LLaMA 3.3 70B",
    db: "MongoDB Atlas",
    security: "Enhanced",
    timestamp: new Date().toISOString(),
  });
});

// ── Bloquer les routes inconnues ──────────────────────────────────────────────
app.use((req, res) => {
  securityLog("UNKNOWN_ROUTE", { ip: req.ip, path: req.path, method: req.method });
  res.status(404).json({ error: "Route introuvable" });
});

// ── Error Handler Global ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  logger.error("Unhandled error", { error: err.message, path: req.path });
  res.status(500).json({ error: "Erreur interne du serveur" });
});

// ── Démarrage ────────────────────────────────────────────────────────────────
connectDB().then(() => {
  app.listen(PORT, () => {
    logger.info(`🚀 Serveur démarré sur http://localhost:${PORT}`);
    logger.info(`🤖 IA: Groq — llama-3.3-70b-versatile`);
    logger.info(`🍃 MongoDB Atlas connecté`);
    logger.info(`🔐 Admin: http://localhost:5173/admin`);
    logger.info(`🛡️  Sécurité: Helmet + Rate Limit + Sanitize + HPP + MongoSanitize`);
  });
});
