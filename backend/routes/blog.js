import express from "express";
import Article from "../models/Article.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// GET tous les articles publiés
router.get("/", async (req, res) => {
  try {
    const articles = await Article.find({ published: true }).sort({ createdAt: -1 });
    res.json(articles);
  } catch { res.status(500).json({ error: "Erreur serveur" }); }
});

// GET un article par slug
router.get("/:slug", async (req, res) => {
  try {
    const article = await Article.findOneAndUpdate(
      { slug: req.params.slug, published: true },
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!article) return res.status(404).json({ error: "Article introuvable" });
    res.json(article);
  } catch { res.status(500).json({ error: "Erreur serveur" }); }
});

// POST créer un article (admin)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, excerpt, content, tags, published } = req.body;
    const slug = title.toLowerCase()
      .replace(/[àáâäã]/g, 'a').replace(/[èéêë]/g, 'e')
      .replace(/[ìíîï]/g, 'i').replace(/[òóôö]/g, 'o')
      .replace(/[ùúûü]/g, 'u').replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    
    const article = await Article.create({ title, slug, excerpt, content, tags, published });
    res.json({ success: true, article });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PUT modifier un article (admin)
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const article = await Article.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    res.json({ success: true, article });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE supprimer un article (admin)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await Article.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;
