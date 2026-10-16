import Article from "../models/Article.js";

// Pages blog rendues côté serveur pour Google : titre, description, canonical et JSON-LD propres à chaque page
const SITE = "https://ademsassi.com";
let shell = null, shellAt = 0;

async function getShell(req) {
  if (shell && Date.now() - shellAt < 10 * 60 * 1000) return shell;
  const r = await fetch(`${SITE}/index.html`, { headers: { "x-seo-shell": "1" } });
  if (!r.ok) throw new Error("shell");
  shell = await r.text(); shellAt = Date.now();
  return shell;
}

const esc = (x = "") => String(x).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const plain = (md = "") => md.replace(/```[\s\S]*?```/g, " ").replace(/!\[[^\]]*\]\([^)]*\)/g, " ").replace(/\[([^\]]*)\]\([^)]*\)/g, "$1").replace(/[#>*_`~|-]+/g, " ").replace(/\s+/g, " ").trim();

export function render(html, { title, desc, url, type = "website", ld, body = "" }) {
  const t = esc(title), d = esc(desc), u = esc(url);
  let h = html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${t}</title>`)
    .replace(/(<meta name="description" content=")[^"]*/, `$1${d}`)
    .replace(/(<link rel="canonical" href=")[^"]*/, `$1${u}`)
    .replace(/(<meta property="og:title" content=")[^"]*/, `$1${t}`)
    .replace(/(<meta property="og:description" content=")[^"]*/, `$1${d}`)
    .replace(/(<meta property="og:url" content=")[^"]*/, `$1${u}`)
    .replace(/(<meta property="og:type" content=")[^"]*/, `$1${type}`)
    .replace(/(<meta name="twitter:title" content=")[^"]*/, `$1${t}`)
    .replace(/(<meta name="twitter:description" content=")[^"]*/, `$1${d}`);
  if (ld) h = h.replace("</head>", `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, "\\u003c")}</script>\n</head>`);
  // contenu lisible sans JavaScript, remplacé par React au chargement
  if (body) h = h.replace(/<div id="root"><\/div>/, `<div id="root"><noscript>${body}</noscript></div>`);
  return h;
}

function fail(res) {
  if (shell) return res.set("Content-Type", "text/html; charset=utf-8").send(shell);
  res.status(503).send("Page momentanément indisponible, recharge dans un instant.");
}

export async function blogList(req, res, next) {
  try {
    const html = await getShell(req);
    const arts = await Article.find({ published: true }, "title slug excerpt").sort({ createdAt: -1 }).lean();
    const body = `<h1>Blog d'Adem SASSI</h1><ul>${arts.map((a) => `<li><a href="/blog/${encodeURIComponent(a.slug)}">${esc(a.title)}</a> : ${esc(a.excerpt)}</li>`).join("")}</ul>`;
    res.set("Content-Type", "text/html; charset=utf-8").set("Cache-Control", "public, max-age=0, s-maxage=600");
    res.send(render(html, {
      title: "Blog · Adem SASSI, ingénieur IA",
      desc: "Articles d'Adem SASSI sur l'IA, les agents LLM, le RAG, le développement full-stack et son parcours en alternance.",
      url: `${SITE}/blog`,
      ld: { "@context": "https://schema.org", "@type": "Blog", name: "Blog d'Adem SASSI", url: `${SITE}/blog`, author: { "@id": `${SITE}/#adem` },
        blogPost: arts.map((a) => ({ "@type": "BlogPosting", headline: a.title, url: `${SITE}/blog/${encodeURIComponent(a.slug)}` })) },
      body,
    }));
  } catch { fail(res); }
}

export async function blogArticle(req, res, next) {
  try {
    const html = await getShell(req);
    const a = await Article.findOne({ slug: req.params.slug, published: true }).lean();
    res.set("Content-Type", "text/html; charset=utf-8");
    if (!a) {
      res.status(404).set("Cache-Control", "no-store");
      return res.send(render(html, { title: "Article introuvable · Adem SASSI", desc: "Cet article n'existe pas ou n'est plus publié.", url: `${SITE}/blog` }).replace('content="index, follow"', 'content="noindex"'));
    }
    const url = `${SITE}/blog/${encodeURIComponent(a.slug)}`;
    const text = plain(a.content);
    res.set("Cache-Control", "public, max-age=0, s-maxage=600");
    res.send(render(html, {
      title: `${a.title} · Adem SASSI`,
      desc: a.excerpt || text.slice(0, 160),
      url, type: "article",
      ld: { "@context": "https://schema.org", "@type": "BlogPosting", headline: a.title, description: a.excerpt, url, mainEntityOfPage: url,
        datePublished: new Date(a.createdAt).toISOString(), dateModified: new Date(a.updatedAt || a.createdAt).toISOString(),
        inLanguage: "fr", keywords: (a.tags || []).join(", "), image: `${SITE}/og.jpg`,
        author: { "@type": "Person", "@id": `${SITE}/#adem`, name: "Adem SASSI", url: SITE },
        publisher: { "@type": "Person", "@id": `${SITE}/#adem`, name: "Adem SASSI" } },
      body: `<article><h1>${esc(a.title)}</h1><p>${esc(a.excerpt)}</p><p>${esc(text.slice(0, 4000))}</p></article>`,
    }));
  } catch { fail(res); }
}
