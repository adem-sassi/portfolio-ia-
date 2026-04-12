const cache = new Map();
const TTL = 5 * 60 * 1000;

function getCache(key) {
  const c = cache.get(key);
  if (c && Date.now() - c.time < TTL) return c.data;
  return null;
}

function setCache(key, data) {
  cache.set(key, { data, time: Date.now() });
}

import express from "express";
import Content from "../models/Content.js";
import Article from "../models/Article.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const cached = getCache("content");
    if (cached) return res.json(cached);
    const sections = await Content.find({});
    const content = {};
    sections.forEach((s) => { content[s.section] = s.data; });
    res.json(content);
  } catch (err) {
    res.status(500).json({ error: "Erreur lecture du contenu" });
  }
});

// GET /api/content/cv — Télécharger le CV
router.get("/cv", async (req, res) => {
  try {
    const doc = await Content.findOne({ section: "cv" });
    if (!doc || !doc.data) return res.status(404).json({ error: "CV non trouvé" });
    
    // Si URL Cloudinary
    if (doc.data.url) return res.redirect(doc.data.url);
    
    // Si base64
    if (doc.data.file) {
      const base64 = doc.data.file.includes(",") ? doc.data.file.split(",")[1] : doc.data.file;
      const buffer = Buffer.from(base64, "base64");
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `inline; filename="${doc.data.name || "cv.pdf"}"`);
      res.setHeader("Content-Length", buffer.length);
      return res.end(buffer);
    }
    
    res.status(404).json({ error: "CV non trouvé" });
  } catch (e) { res.status(500).json({ error: e.message }); }
});



// GET /api/sitemap.xml — Sitemap dynamique
router.get("/sitemap", async (req, res) => {
  try {
    const articles = await Article.find({ published: true }).select("slug updatedAt");
    
    const staticPages = [
      { url: "https://ademsassi.com", priority: "1.0", freq: "weekly" },
      { url: "https://ademsassi.com/blog", priority: "0.9", freq: "daily" },
    ];

    const articlePages = articles.map(a => ({
      url: `https://ademsassi.com/blog/${a.slug}`,
      priority: "0.8",
      freq: "monthly",
      lastmod: new Date(a.updatedAt || a.createdAt).toISOString().split("T")[0]
    }));

    const allPages = [...staticPages, ...articlePages];
    
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(p => `  <url>
    <loc>${p.url}</loc>
    <changefreq>${p.freq}</changefreq>
    <priority>${p.priority}</priority>
    ${p.lastmod ? `<lastmod>${p.lastmod}</lastmod>` : ""}
  </url>`).join("
")}
</urlset>`;

    res.setHeader("Content-Type", "application/xml");
    res.send(xml);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;

// GET /api/content/theme
router.get("/:section", async (req, res) => {
  try {
    const doc = await Content.findOne({ section: req.params.section });
    if (!doc) return res.status(404).json({ error: "Section introuvable" });
    res.json(doc.data);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});



router.get("/theme", async (req, res) => {
  try {
    const doc = await Content.findOne({ section: "theme" });
    res.json(doc ? doc.data : {});
  } catch { res.status(500).json({ error: "Erreur" }); }
});// GET /api/content/sitemap
router.get("/sitemap", async (req, res) => {
  try {
    const articles = await Article.find({ published: true }).select("slug updatedAt createdAt");
    
    const pages = [
      { url: "https://ademsassi.com", priority: "1.0", freq: "weekly" },
      { url: "https://ademsassi.com/blog", priority: "0.9", freq: "daily" },
      ...articles.map(a => ({
        url: "https://ademsassi.com/blog/" + a.slug,
        priority: "0.8",
        freq: "monthly",
        lastmod: new Date(a.updatedAt || a.createdAt).toISOString().split("T")[0]
      }))
    ];

    let xml = '<?xml version="1.0" encoding="UTF-8"?>';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
    pages.forEach(p => {
      xml += "<url>";
      xml += "<loc>" + p.url + "</loc>";
      xml += "<changefreq>" + p.freq + "</changefreq>";
      xml += "<priority>" + p.priority + "</priority>";
      if (p.lastmod) xml += "<lastmod>" + p.lastmod + "</lastmod>";
      xml += "</url>";
    });
    xml += "</urlset>";

    res.setHeader("Content-Type", "application/xml");
    res.send(xml);
  } catch (e) { res.status(500).json({ error: e.message }); }
});


