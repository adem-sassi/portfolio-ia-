import { marked } from "marked";
import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Shell, Cover, readingTime, slugify, fmtDate, totalReactions } from "./BlogPage";

marked.setOptions({ breaks: true, gfm: true });

/* Markdown → HTML avec des ancres sur les titres (pour la table des matières) */
function renderMd(md) {
  const seen = {};
  return marked(md || "").replace(/<h([1-3])([^>]*)>([\s\S]*?)<\/h\1>/g, (_, n, attrs, inner) => {
    let id = slugify(inner) || "section";
    seen[id] = (seen[id] || 0) + 1;
    if (seen[id] > 1) id += "-" + seen[id];
    return `<h${n} id="${id}"${attrs.replace(/\sid="[^"]*"/, "")}><a class="anc" href="#${id}" aria-hidden="true">#</a>${inner}</h${n}>`;
  });
}
function headingsOf(md) {
  const seen = {}; const out = [];
  (md || "").split("\n").forEach((l) => {
    const m = l.match(/^(#{1,3})\s+(.+)/);
    if (!m) return;
    const text = m[2].replace(/[*_`]/g, "").trim();
    let id = slugify(marked.parseInline(m[2])) || "section";
    seen[id] = (seen[id] || 0) + 1;
    if (seen[id] > 1) id += "-" + seen[id];
    out.push({ level: m[1].length, text, id });
  });
  return out;
}

/* ─────────── Réactions ─────────── */

const EMO = [["fire", "🔥", "Super"], ["heart", "❤️", "J'aime"], ["clap", "👏", "Bravo"], ["think", "🤔", "Intéressant"]];

function Reactions({ slug, initial }) {
  const [r, setR] = useState(initial || { fire: 0, heart: 0, clap: 0, think: 0 });
  const [voted, setVoted] = useState(() => { try { return JSON.parse(localStorage.getItem(`voted_${slug}`) || "{}"); } catch { return {}; } });
  const [pop, setPop] = useState("");
  useEffect(() => { if (initial) setR(initial); }, [initial]);
  const react = async (type) => {
    if (voted[type]) return;
    setPop(type); setTimeout(() => setPop(""), 600);
    try {
      const res = await fetch(`/api/blog/${slug}/like`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reaction: type }) });
      const data = await res.json();
      if (data.reactions) {
        setR(data.reactions);
        const nv = { ...voted, [type]: true }; setVoted(nv);
        try { localStorage.setItem(`voted_${slug}`, JSON.stringify(nv)); } catch { /* */ }
      }
    } catch { /* */ }
  };
  return (
    <div className="areact">
      <div className="path-l">cet article vous a plu ?</div>
      <div className="rbtns">
        {EMO.map(([t, e, l]) => (
          <button key={t} className={(voted[t] ? "on " : "") + (pop === t ? "pop" : "")} onClick={() => react(t)} aria-label={l} title={l}>
            <span className="e">{e}</span><b>{r[t] || 0}</b><small>{l}</small>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─────────── Commentaires ─────────── */

function Comments({ slug }) {
  const [list, setList] = useState([]);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState("");
  useEffect(() => {
    fetch(`/api/blog/${slug}/comments`).then((r) => r.json()).then((d) => { if (Array.isArray(d)) setList(d); }).catch(() => {});
  }, [slug]);
  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !content.trim() || loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/blog/${slug}/comments`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, content }) });
      const data = await res.json();
      if (data._id) {
        if (data.approved !== false) setList((p) => [data, ...p]);
        setName(""); setContent(""); setSent(data.approved === false ? "✓ Merci ! Votre commentaire sera visible après validation." : "✓ Commentaire publié, merci !"); setTimeout(() => setSent(""), 5000);
      }
    } catch { /* */ }
    setLoading(false);
  };
  return (
    <div className="acomm" id="commentaires">
      <h3>Commentaires <span>{list.length}</span></h3>
      <form className="cbox2" onSubmit={submit}>
        <div className="trace-h"><span className="lights"><i /><i /><i /></span><span className="ttl">~/commentaires/nouveau</span></div>
        <div className="cb">
          <label className={"fl" + (name ? " has" : "")}><input value={name} onChange={(e) => setName(e.target.value)} placeholder=" " maxLength={60} required /><span>Votre nom</span></label>
          <label className={"fl" + (content ? " has" : "")}><textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder=" " rows={4} maxLength={1500} required /><span>Votre commentaire</span><em>{content.length}/1500</em></label>
          {sent && <div className="note ok">{sent}</div>}
          <button className="btn primary" type="submit" disabled={!name.trim() || !content.trim() || loading}>{loading ? "Envoi…" : "Publier le commentaire →"}</button>
        </div>
      </form>
      {list.length === 0 ? (
        <p className="cempty">Aucun commentaire pour l'instant. Soyez le premier à réagir.</p>
      ) : (
        <div className="clist">
          {list.map((c, i) => (
            <div className="citem" key={c._id || i}>
              <span className="cav" style={{ "--pc": ["#00D4FF", "#7B2FFF", "#FF2FBB", "#00FF88"][(c.name || "?").charCodeAt(0) % 4] }}>{(c.name || "?").charAt(0).toUpperCase()}</span>
              <div>
                <div className="ch"><b>{c.name}</b><small>{fmtDate(c.createdAt, true)}</small></div>
                <p>{c.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────── Page article ─────────── */

export default function ArticlePage() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pct, setPct] = useState(0);
  const [activeH, setActiveH] = useState("");
  const [copied, setCopied] = useState(false);
  const progress = useRef(null);
  const body = useRef(null);

  useEffect(() => {
    setLoading(true); setArticle(null);
    fetch(`/api/blog/${slug}`).then((r) => (r.ok ? r.json() : null)).then((d) => { setArticle(d && !d.error ? d : null); setLoading(false); }).catch(() => setLoading(false));
    fetch("/api/blog").then((r) => r.json()).then((d) => setAll(Array.isArray(d) ? d : [])).catch(() => {});
  }, [slug]);

  const html = useMemo(() => renderMd(article?.content), [article]);
  const heads = useMemo(() => headingsOf(article?.content), [article]);
  const mins = readingTime(article?.content);
  const url = `https://ademsassi.com/blog/${slug}`;

  /* SEO : canonical, OG, JSON-LD */
  useEffect(() => {
    if (!article) return;
    document.title = `${article.title} · Adem SASSI`;
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.appendChild(canonical); }
    canonical.href = url;
    const setMeta = (prop, content, attr = "property") => {
      let el = document.querySelector(`meta[${attr}="${prop}"]`);
      if (!el) { el = document.createElement("meta"); el.setAttribute(attr, prop); document.head.appendChild(el); }
      el.setAttribute("content", content);
    };
    setMeta("og:title", article.title); setMeta("og:description", article.excerpt);
    setMeta("og:url", url); setMeta("og:type", "article");
    setMeta("twitter:title", article.title, "name"); setMeta("twitter:description", article.excerpt, "name");
    document.getElementById("article-jsonld")?.remove();
    const script = document.createElement("script");
    script.id = "article-jsonld"; script.type = "application/ld+json";
    script.textContent = JSON.stringify({
      "@context": "https://schema.org", "@type": "BlogPosting", headline: article.title, description: article.excerpt, url,
      datePublished: article.createdAt, dateModified: article.updatedAt || article.createdAt,
      author: { "@type": "Person", name: "Adem SASSI", url: "https://ademsassi.com" },
      publisher: { "@type": "Person", name: "Adem SASSI", url: "https://ademsassi.com" },
      keywords: (article.tags || []).join(", "), wordCount: article.content?.split(/\s+/).length || 0,
    });
    document.head.appendChild(script);
    return () => { script.remove(); if (canonical) canonical.href = "https://ademsassi.com"; };
  }, [article, url]);

  /* progression de lecture + titre actif */
  useEffect(() => {
    let tk = false;
    const on = () => {
      if (tk) return; tk = true;
      requestAnimationFrame(() => {
        tk = false;
        const el = body.current; if (!el) return;
        const r = el.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, (innerHeight * 0.35 - r.top) / Math.max(1, r.height - innerHeight * 0.3)));
        setPct(Math.round(p * 100));
        if (progress.current) progress.current.style.transform = `scaleX(${p})`;
        let cur = "";
        el.querySelectorAll("h1[id],h2[id],h3[id]").forEach((h) => { if (h.getBoundingClientRect().top < 140) cur = h.id; });
        setActiveH(cur);
      });
    };
    addEventListener("scroll", on, { passive: true }); on();
    return () => removeEventListener("scroll", on);
  }, [html]);

  /* bouton copier sur les blocs de code */
  useEffect(() => {
    const el = body.current; if (!el) return;
    el.querySelectorAll("pre").forEach((pre) => {
      if (pre.querySelector(".cpy")) return;
      const lang = (pre.querySelector("code")?.className.match(/language-(\w+)/) || [])[1];
      if (lang) pre.setAttribute("data-lang", lang);
      const b = document.createElement("button");
      b.className = "cpy"; b.type = "button"; b.textContent = "copier";
      b.onclick = () => { try { navigator.clipboard.writeText(pre.querySelector("code")?.innerText || pre.innerText); } catch { /* */ } b.textContent = "copié ✓"; setTimeout(() => (b.textContent = "copier"), 1500); };
      pre.appendChild(b);
    });
  }, [html]);

  const similar = useMemo(() => {
    if (!article) return [];
    return all.filter((a) => a.slug !== slug)
      .map((a) => ({ ...a, score: (a.tags || []).filter((t) => (article.tags || []).includes(t)).length }))
      .sort((a, b) => b.score - a.score || new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3);
  }, [all, article, slug]);
  const idx = all.findIndex((a) => a.slug === slug);
  const newer = idx > 0 ? all[idx - 1] : null;
  const older = idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null;

  const copyLink = () => { try { navigator.clipboard.writeText(url); } catch { /* */ } setCopied(true); setTimeout(() => setCopied(false), 1600); };

  if (loading) return (
    <Shell progressRef={progress}>
      <div className="wrap aload"><span className="spin" /><span>chargement de l'article…</span></div>
    </Shell>
  );
  if (!article) return (
    <Shell progressRef={progress}>
      <div className="wrap bempty a404">
        <pre>{`> GET /blog/${slug}\n  404 · article introuvable`}</pre>
        <Link className="btn" to="/blog">← Retour au blog</Link>
      </div>
    </Shell>
  );

  return (
    <Shell progressRef={progress}>
      <header className="ahead"><div className="wrap">
        <div className="crumbs"><Link to="/blog">~/blog</Link><span>/</span><b>{slug}</b></div>
        <div className="tags">{(article.tags || []).map((t) => <Link to="/blog" className="tag" key={t}>#{t}</Link>)}</div>
        <h1>{article.title}</h1>
        <p className="aexc">{article.excerpt}</p>
        <div className="aauthor">
          <img src="/photo.jpg" alt="Adem SASSI" width="44" height="44" />
          <div><b>Adem SASSI</b><small>Ingénieur IA en alternance · ACENSI</small></div>
          <div className="ameta">
            <span>{fmtDate(article.createdAt, true)}</span>
            <span>{mins} min de lecture</span>
            <span>{article.views || 0} vues</span>
            <a href="#commentaires">💬 commentaires</a>
          </div>
        </div>
        <Cover a={article} big />
      </div></header>

      <div className="wrap alayout">
        <article className="md" ref={body} dangerouslySetInnerHTML={{ __html: html }} />
        <aside className="aside">
          <div className="asticky">
            <div className="aprog"><svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="15.5" /><circle className="v" cx="18" cy="18" r="15.5" style={{ strokeDashoffset: 97.4 - (97.4 * pct) / 100 }} /></svg><b>{pct}%</b><small>lu</small></div>
            {heads.length > 1 && (
              <nav className="toc">
                <div className="path-l">sommaire</div>
                {heads.map((h) => (
                  <a key={h.id} href={"#" + h.id} className={(activeH === h.id ? "on " : "") + "l" + h.level}>{h.text}</a>
                ))}
              </nav>
            )}
            <div className="share">
              <div className="path-l">partager</div>
              <button onClick={copyLink}>{copied ? "lien copié ✓" : "Copier le lien"}</button>
              <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>
              <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(article.title)}`} target="_blank" rel="noopener noreferrer">X / Twitter ↗</a>
            </div>
          </div>
        </aside>
      </div>

      <div className="wrap anarrow">
        <Reactions slug={slug} initial={article.reactions} />

        <div className="acard">
          <img src="/photo.jpg" alt="" width="72" height="72" loading="lazy" />
          <div>
            <div className="path-l">à propos de l'auteur</div>
            <b>Adem SASSI</b>
            <p>Ingénieur IA en alternance chez ACENSI et étudiant en Master 2 Data & IA. J'écris sur les agents LLM, le RAG et le développement full-stack.</p>
            <div className="cta"><Link className="btn sm" to="/">Voir le portfolio</Link><a className="btn sm primary" href="/#contact">Me contacter</a></div>
          </div>
        </div>

        {(newer || older) && (
          <div className="anav">
            {older ? <Link to={`/blog/${older.slug}`}><small>← Article précédent</small><b>{older.title}</b></Link> : <span />}
            {newer ? <Link to={`/blog/${newer.slug}`} className="r"><small>Article suivant →</small><b>{newer.title}</b></Link> : <span />}
          </div>
        )}

        {similar.length > 0 && (
          <div className="asim">
            <h3>Articles similaires</h3>
            <div className="simg">
              {similar.map((a) => (
                <Link key={a.slug} to={`/blog/${a.slug}`} className="bcard sm">
                  <Cover a={a} />
                  <div className="bbody">
                    <h4>{a.title}</h4>
                    <div className="bmeta"><span>{readingTime(a.content)} min</span><span>🔥 {totalReactions(a.reactions)}</span></div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <Comments slug={slug} />
        <div className="center"><Link className="btn" to="/blog">← Tous les articles</Link></div>
      </div>
    </Shell>
  );
}
