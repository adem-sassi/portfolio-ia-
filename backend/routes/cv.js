import express from "express";
import { writeFileSync, unlinkSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();
const __dirname = dirname(fileURLToPath(import.meta.url));

// Dossier public du frontend
const CV_PATH = join(__dirname, "../../frontend/public/cv.pdf");

// ── POST /api/admin/upload-cv ─────────────────────────────────────────────────
router.post("/upload-cv", authMiddleware, async (req, res) => {
  try {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      const body = Buffer.concat(chunks);
      const boundary = req.headers["content-type"].split("boundary=")[1];
      if (!boundary) return res.status(400).json({ error: "Format invalide" });

      // Parse multipart simple
      const boundaryBuffer = Buffer.from("--" + boundary);
      const parts = [];
      let start = body.indexOf(boundaryBuffer) + boundaryBuffer.length + 2;

      while (start < body.length) {
        const end = body.indexOf(boundaryBuffer, start);
        if (end === -1) break;
        const part = body.slice(start, end - 2);
        const headerEnd = part.indexOf("\r\n\r\n");
        if (headerEnd !== -1) {
          const header = part.slice(0, headerEnd).toString();
          const data = part.slice(headerEnd + 4);
          if (header.includes("filename=")) {
            parts.push(data);
          }
        }
        start = end + boundaryBuffer.length + 2;
      }

      if (parts.length === 0) return res.status(400).json({ error: "Aucun fichier reçu" });

      writeFileSync(CV_PATH, parts[0]);
      res.json({ success: true, message: "CV uploadé avec succès !" });
    });
    req.on("error", () => res.status(500).json({ error: "Erreur upload" }));
  } catch (err) {
    console.error("CV upload error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ── DELETE /api/admin/delete-cv ───────────────────────────────────────────────
router.delete("/delete-cv", authMiddleware, (req, res) => {
  try {
    if (existsSync(CV_PATH)) unlinkSync(CV_PATH);
    res.json({ success: true, message: "CV supprimé" });
  } catch {
    res.status(500).json({ error: "Erreur suppression" });
  }
});

export { router as cvRoutes };
