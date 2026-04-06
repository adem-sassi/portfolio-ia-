import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import { connectDB } from "./db/connect.js";
import aiRoutes from "./routes/ai.js";
import adminRoutes from "./routes/admin.js";
import contentRoutes from "./routes/content.js";
import blogRoutes from "./routes/blog.js";
import securityRoutes from "./routes/security.js";

const app = express();
const PORT = process.env.PORT || 8000;

app.set("trust proxy", 1);

app.use(helmet({ contentSecurityPolicy: false }));

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use("/api/", limiter);

app.use(express.json({ limit: "10mb" }));
app.use(mongoSanitize());

app.use("/api/ai", aiRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/blog", blogRoutes);
app.use("/api/security", securityRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", ai: "Groq", db: "MongoDB", admin: "enabled" });
});

app.use((req, res) => res.status(404).json({ error: "Route introuvable" }));
app.use((err, req, res, next) => res.status(500).json({ error: "Erreur interne" }));

connectDB().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Serveur démarré sur port ${PORT}`);
    console.log(`🤖 IA: Groq`);
    console.log(`🍃 MongoDB connecté`);
  });
}).catch(err => {
  console.error("Erreur démarrage:", err);
  process.exit(1);
});
