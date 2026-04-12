import express from "express";
import Comment from "../models/Comment.js";
import Article from "../models/Article.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// GET tous les articles publiés
router.get("/", async (req, res) => {
  try {
    const articles = await Article.find({ published: true }).sort({ createdAt: -1 });
    const articlesWithCounts = await Promise.all(articles.map(async (a) => {
      const commentsCount = await Comment.countDocuments({ articleSlug: a.slug, approved: true });
      return { ...a.toObject(), commentsCount };
    }));
    res.json(articlesWithCounts);
  } catch { res.status(500).json({ error: "Erreur serveur" }); }
});

// GET un article par slug
// GET /api/blog/all — admin (tous les articles, publiés ou non)
router.get("/all", async (req, res) => {
  try {
    const articles = await Article.find({}).sort({ createdAt: -1 });
    res.json(articles);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

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


// GET /api/blog/:slug/comments
router.get("/:slug/comments", async (req, res) => {
  try {
    const comments = await Comment.find({ articleSlug: req.params.slug, approved: true }).sort({ createdAt: -1 });
    res.json(comments);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/blog/:slug/comments
router.post("/:slug/comments", async (req, res) => {
  try {
    const { name, email, content } = req.body;
    if (!name || !content) return res.status(400).json({ error: "Nom et commentaire requis" });
    const comment = await Comment.create({ articleSlug: req.params.slug, name, email, content });
    res.json(comment);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/blog/:slug/like
router.post("/:slug/like", async (req, res) => {
  try {
    const { reaction } = req.body;
    const article = await Article.findOneAndUpdate(
      { slug: req.params.slug },
      { $inc: { [`reactions.${reaction}`]: 1 } },
      { new: true }
    );
    res.json({ reactions: article.reactions });
  } catch (e) { res.status(500).json({ error: e.message }); }
});


// DELETE /api/blog/comments/:id
router.delete("/comments/:id", authMiddleware, async (req, res) => {
  try {
    await Comment.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});


// Publier les articles planifiés automatiquement
setInterval(async () => {
  try {
    const now = new Date();
    await Article.updateMany(
      { published: false, scheduledAt: { $lte: now }, scheduledAt: { $exists: true, $ne: null } },
      { $set: { published: true } }
    );
  } catch {}
}, 60 * 1000); // Vérifier chaque minute

export default router;
