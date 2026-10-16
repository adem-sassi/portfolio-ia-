import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import { connectDB } from "./db/connect.js";
import Article from "./models/Article.js";
import Content from "./models/Content.js";
import aiRoutes from "./routes/ai.js";
import adminRoutes from "./routes/admin.js";
import contentRoutes from "./routes/content.js";
import blogRoutes from "./routes/blog.js";
import securityRoutes from "./routes/security.js";
import statsRoutes from "./routes/stats.js";
import recosRoutes from "./routes/recos.js";
import backupRoutes from "./routes/backup.js";
import { blogList, blogArticle } from "./routes/seo.js";

const app = express();
app.set("trust proxy", 1);
app.use(helmet({ contentSecurityPolicy: false }));

// Front et API sont sur le même domaine : CORS limité au dev local
app.use(cors({
  origin: ["https://ademsassi.com", "https://www.ademsassi.com", "http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use("/api/", rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));
app.use(express.json({ limit: "4mb" }));
app.use(mongoSanitize());

// Connexion DB avant chaque requête (instantané si déjà connecté)
app.use(async (req, res, next) => {
  try { await connectDB(); next(); }
  catch { res.status(503).json({ error: "Base de données indisponible" }); }
});

// Remplace le setInterval : publie les articles planifiés à chaque lecture du blog
app.use("/api/blog", async (req, res, next) => {
  try {
    await Article.updateMany(
      { published: false, scheduledAt: { $ne: null, $lte: new Date() } },
      { $set: { published: true } }
    );
  } catch {}
  next();
});

app.use("/api/ai", aiRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/blog", blogRoutes);
app.use("/api/security", securityRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/pulse", statsRoutes);
app.use("/api/recos", recosRoutes);
app.use("/api/backup", backupRoutes);

// Sitemap dynamique : pages fixes + articles publiés
app.get("/sitemap.xml", async (req, res) => {
  const esc = (x) => String(x).replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c]));
  const day = (d) => new Date(d || Date.now()).toISOString().slice(0, 10);
  let arts = [];
  try { arts = await Article.find({ published: true }, "slug updatedAt createdAt").sort({ createdAt: -1 }).lean(); } catch {}
  const last = arts[0] ? day(arts[0].updatedAt || arts[0].createdAt) : day();
  const urls = [
    ["https://ademsassi.com/", day(), "1.0"],
    ["https://ademsassi.com/blog", last, "0.8"],
    ["https://ademsassi.com/cv", day(), "0.6"],
    ...arts.map((x) => ["https://ademsassi.com/blog/" + encodeURIComponent(x.slug), day(x.updatedAt || x.createdAt), "0.7"]),
    ["https://ademsassi.com/mentions-legales", "2026-04-06", "0.3"],
  ];
  res.set("Content-Type", "application/xml; charset=utf-8").set("Cache-Control", "public, max-age=3600");
  res.send('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.map(([u, d, p]) => `  <url><loc>${esc(u)}</loc><lastmod>${d}</lastmod><priority>${p}</priority></url>`).join("\n") + "\n</urlset>\n");
});

// Photo de profil : celle uploadée depuis l'admin, sinon la photo par défaut
app.get("/photo.jpg", async (req, res) => {
  try {
    const doc = await Content.findOne({ section: "photo" }).lean();
    if (doc?.data?.file) {
      return res.set("Content-Type", "image/jpeg").set("Cache-Control", "no-cache").send(Buffer.from(doc.data.file, "base64"));
    }
  } catch {}
  res.set("Cache-Control", "no-store").redirect(302, "/photo-default.jpg");
});

app.get("/blog", blogList);
app.get("/blog/:slug", blogArticle);

app.get("/api/health", (req, res) => res.json({ status: "OK", host: "vercel" }));

app.use((req, res) => res.status(404).json({ error: "Route introuvable" }));
app.use((err, req, res, next) => res.status(500).json({ error: "Erreur interne" }));

export default app;
