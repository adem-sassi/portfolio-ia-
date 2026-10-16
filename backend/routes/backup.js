import express from "express";
import zlib from "zlib";
import mongoose from "mongoose";
import Content from "../models/Content.js";
import { authMiddleware } from "../middleware/auth.js";

// Sauvegarde de la base : toutes les collections de contenu, compressées en .json.gz
const router = express.Router();
const OWNER = process.env.EMAIL_USER || "sassiadem7@gmail.com";
const SKIP = new Set(["events", "visitors", "loginlogs"]); // statistiques volumineuses, pas du contenu

async function makeDump() {
  const db = mongoose.connection.db;
  const cols = (await db.listCollections().toArray()).map((c) => c.name).filter((n) => !SKIP.has(n) && !n.startsWith("system."));
  const out = { app: "ademsassi.com", createdAt: new Date().toISOString(), collections: {} };
  for (const n of cols) out.collections[n] = await db.collection(n).find({}).toArray();
  const json = JSON.stringify(out);
  const gz = zlib.gzipSync(Buffer.from(json), { level: 9 });
  const counts = Object.fromEntries(Object.entries(out.collections).map(([k, v]) => [k, v.length]));
  return { gz, counts, size: gz.length, name: `ademsassi-backup-${out.createdAt.slice(0, 10)}.json.gz` };
}

async function saveMeta(meta) {
  await Content.findOneAndUpdate({ section: "backup_meta" }, { section: "backup_meta", data: meta }, { upsert: true }).catch(() => {});
}

async function sendByMail(d) {
  const { Resend } = await import("resend");
  const r = await new Resend(process.env.RESEND_API_KEY).emails.send({
    from: "Portfolio <contact@ademsassi.com>",
    to: [OWNER],
    subject: `Sauvegarde hebdo du portfolio · ${new Date().toLocaleDateString("fr-FR")}`,
    html: `<div style="font-family:system-ui,sans-serif"><h2 style="margin:0 0 8px">Sauvegarde de ademsassi.com</h2>
      <p>Fichier joint : <b>${d.name}</b> (${(d.size / 1024).toFixed(0)} Ko).</p>
      <p style="color:#555">${Object.entries(d.counts).map(([k, v]) => `${k} : ${v}`).join(" · ")}</p>
      <p style="color:#888;font-size:13px">Garde ce mail : en cas de problème, ce fichier permet de tout restaurer.</p></div>`,
    attachments: [{ filename: d.name, content: d.gz.toString("base64") }],
  });
  if (r?.error) throw new Error(r.error.message || "Resend");
}

// ── Appelé chaque lundi par Vercel Cron ───────────────────────────────────────
router.get("/cron", async (req, res) => {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.authorization !== `Bearer ${secret}`) return res.status(401).json({ error: "Non autorisé" });
  try {
    const d = await makeDump();
    await sendByMail(d);
    await saveMeta({ last: new Date(), size: d.size, counts: d.counts, via: "cron", ok: true });
    res.json({ success: true, size: d.size, counts: d.counts });
  } catch (e) {
    await saveMeta({ last: new Date(), via: "cron", ok: false, error: e.message });
    res.status(500).json({ error: e.message });
  }
});

// ── Admin ──────────────────────────────────────────────────────────────────────
router.get("/status", authMiddleware, async (req, res) => {
  const m = await Content.findOne({ section: "backup_meta" }).lean();
  res.json({ ...(m?.data || {}), cronReady: !!process.env.CRON_SECRET });
});

router.get("/download", authMiddleware, async (req, res) => {
  try {
    const d = await makeDump();
    res.set("Content-Type", "application/gzip").set("Content-Disposition", `attachment; filename="${d.name}"`).set("Cache-Control", "no-store").send(d.gz);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post("/send-now", authMiddleware, async (req, res) => {
  try {
    const d = await makeDump();
    await sendByMail(d);
    await saveMeta({ last: new Date(), size: d.size, counts: d.counts, via: "manuel", ok: true });
    res.json({ success: true, size: d.size, counts: d.counts });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;
