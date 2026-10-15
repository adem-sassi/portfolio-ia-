import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import { connectDB } from "./db/connect.js";
import Article from "./models/Article.js";
import aiRoutes from "./routes/ai.js";
import adminRoutes from "./routes/admin.js";
import contentRoutes from "./routes/content.js";
import blogRoutes from "./routes/blog.js";
import securityRoutes from "./routes/security.js";
import statsRoutes from "./routes/stats.js";

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

app.get("/api/health", (req, res) => res.json({ status: "OK", host: "vercel" }));

app.use((req, res) => res.status(404).json({ error: "Route introuvable" }));
app.use((err, req, res, next) => res.status(500).json({ error: "Erreur interne" }));

export default app;
