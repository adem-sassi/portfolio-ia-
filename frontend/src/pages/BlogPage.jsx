import { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import "../styles/home-v4.css";
import "../styles/blog-v4.css";

/* ─────────── Outils partagés avec ArticlePage ─────────── */

export const readingTime = (content) => {
  if (!content) return 1;
  const words = content.trim().split(/\s+/).length;
  const code = (content.match(/```/g) || []).length / 2;
  return Math.max(1, Math.ceil(words / 200 + code * 0.5));
};
export const slugify = (t) => String(t || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/<[^>]+>/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const PALETTE = ["#00D4FF", "#7B2FFF", "#FF2FBB", "#00FF88", "#FFB547", "#4f9dff"];
export const colorFor = (s) => { let h = 0; for (const c of String(s || "")) h = (h * 31 + c.charCodeAt(0)) >>> 0; return PALETTE[h % PALETTE.length]; };
export const glyphFor = (tags = []) => {
  const t = tags.join(" ").toLowerCase();
  if (/ia|ai|llm|transformer|deep|ml|agent|rag|nlp/.test(t)) return "◈";
  if (/mlops|docker|kube|cloud|devops|ci/.test(t)) return "∿";
  if (/git|outil|tool/.test(t)) return "⎇";
  if (/web|react|full|front|back|js/.test(t)) return "</>";
  return "✦";
};
export const fmtDate = (d, long) => new Date(d).toLocaleDateString("fr-FR", long ? { day: "numeric", month: "long", year: "numeric" } : { day: "2-digit", month: "short", year: "numeric" });
export const totalReactions = (r = {}) => (r.fire || 0) + (r.heart || 0) + (r.clap || 0) + (r.think || 0);

export function useStarsBg(ref) {
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const x = c.getContext("2d");
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let s = [], w, h, raf, last = -1000;
    const r = () => {
      const d = devicePixelRatio || 1;
      w = c.width = innerWidth * d; h = c.height = innerHeight * d;
      s = Array.from({ length: innerWidth < 700 ? 40 : 110 }, () => ({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.1 + 0.2, a: Math.random() * 6, v: Math.random() * 0.008 + 0.002 }));
    };
    const draw = (now = 0) => {
      if (!reduce) raf = requestAnimationFrame(draw);
      if (document.hidden || now - last < 40) return;
      last = now;
      const d = devicePixelRatio || 1;
      x.clearRect(0, 0, w, h);
      for (const p of s) { p.a += p.v; x.fillStyle = `rgba(232,240,255,${0.2 + Math.abs(Math.sin(p.a)) * 0.55})`; x.beginPath(); x.arc(p.x, p.y, p.r * d, 0, 7); x.fill(); }
    };
    r(); draw(); addEventListener("resize", r);
    return () => { cancelAnimationFrame(raf); removeEventListener("resize", r); };
  }, [ref]);
}

export function Shell({ children, active = "blog", progressRef }) {
  const stars = useRef(null);
  const [menu, setMenu] = useState(false);
  useStarsBg(stars);
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <div className="v4 bv4">
      <div className="progress" ref={progressRef} />
      <div className="sky"><canvas ref={stars} /></div>
      <div className="glow" />
      <nav className="scrolled"><div className="wrap">
        <Link className="logo" to="/"><span className="mark">AS</span>ADEM<b>.</b>SASSI</Link>
        <div className="links">
          <Link to="/">Portfolio</Link>
          <a href="/#projects">Projets</a>
          <a href="/#ai-features">IA Lab</a>
          <Link to="/blog" className={active === "blog" ? "act" : ""}>Blog</Link>
        </div>
        <div className="nr">
          <a className="btn primary sm" href="/#contact">Me contacter</a>
          <button className="burger" aria-label="Menu" onClick={() => setMenu((m) => !m)}><i /></button>
        </div>
      </div></nav>
      {menu && (
        <div className="mnav" onClick={() => setMenu(false)}>
          <Link to="/"><span>01</span> Portfolio</Link>
          <a href="/#projects"><span>02</span> Projets</a>
          <a href="/#ai-features"><span>03</span> IA Lab</a>
          <Link to="/blog"><span>04</span> Blog</Link>
          <a href="/#contact"><span>05</span> Contact</a>
        </div>
      )}
      <main>{children}</main>
      <footer><div className="wrap">
        <Link className="logo" to="/"><span className="mark">AS</span>ADEM<b>.</b>SASSI</Link>
        <p>© {new Date().getFullYear()} Adem SASSI · <Link to="/mentions-legales">Mentions légales</Link> · <Link to="/">Retour au portfolio</Link></p>
      </div></footer>
    </div>
  );
}

export function Cover({ a, big }) {
  const c = colorFor((a.tags || [])[0] || a.title);
  return (
    <div className={"bcover" + (big ? " big" : "")} style={{ "--pc": c }} aria-hidden="true">
      <span className="g">{glyphFor(a.tags)}</span>
      <span className="cl">~/blog/{(a.slug || slugify(a.title)).slice(0, 34)}.md</span>
    </div>
  );
}

function Meta({ a }) {
  return (
    <div className="bmeta">
      <span>{fmtDate(a.createdAt)}</span>
      <span>{readingTime(a.content)} min</span>
      <span>{a.views || 0} vue{(a.views || 0) > 1 ? "s" : ""}</span>
      <span>🔥 {totalReactions(a.reactions)}</span>
      <span>💬 {a.commentsCount || 0}</span>
    </div>
  );
}

/* ─────────── Page liste ─────────── */

export default function BlogPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tag, setTag] = useState("");
  const [sort, setSort] = useState("recent");
  const input = useRef(null);

  useEffect(() => {
    document.title = "Blog · Adem SASSI";
    fetch("/api/blog").then((r) => r.json()).then((d) => { setArticles(Array.isArray(d) ? d : []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const k = (e) => {
      if ((e.key === "/" || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k")) && document.activeElement !== input.current) { e.preventDefault(); input.current?.focus(); }
      if (e.key === "Escape" && document.activeElement === input.current) { setSearch(""); input.current.blur(); }
    };
    addEventListener("keydown", k);
    return () => removeEventListener("keydown", k);
  }, []);

  const tags = useMemo(() => {
    const m = {}; articles.forEach((a) => (a.tags || []).forEach((t) => (m[t] = (m[t] || 0) + 1)));
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [articles]);
  const totalMin = articles.reduce((s, a) => s + readingTime(a.content), 0);
  const totalViews = articles.reduce((s, a) => s + (a.views || 0), 0);

  const list = useMemo(() => {
    const q = search.trim().toLowerCase();
    let r = articles.filter((a) => (!tag || (a.tags || []).includes(tag)) && (!q || [a.title, a.excerpt, ...(a.tags || [])].join(" ").toLowerCase().includes(q)));
    if (sort === "popular") r = [...r].sort((a, b) => (b.views || 0) + totalReactions(b.reactions) * 5 - ((a.views || 0) + totalReactions(a.reactions) * 5));
    if (sort === "short") r = [...r].sort((a, b) => readingTime(a.content) - readingTime(b.content));
    return r;
  }, [articles, search, tag, sort]);

  const filtering = search || tag || sort !== "recent";
  const [featured, ...rest] = list;

  return (
    <Shell>
      <section className="bhero"><div className="wrap">
        <div className="path-l"><span className="num">~/</span><b>blog</b></div>
        <h1>Mes <span className="grad">articles</span></h1>
        <p className="blede">Notes et réflexions sur l'IA, le Machine Learning et le développement. Ce que j'apprends, expliqué simplement.</p>
        <div className="hstats">
          <span><b>{articles.length}</b> articles</span>
          <span><b>{tags.length}</b> tags</span>
          <span><b>{totalMin}</b> min de lecture</span>
          <span><b>{totalViews}</b> lectures</span>
        </div>

        <div className="bsearch">
          <span className="pr">&gt;</span>
          <input ref={input} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un article, un sujet, un tag…" aria-label="Rechercher" />
          {search ? <button onClick={() => setSearch("")} aria-label="Effacer">✕</button> : <kbd>/</kbd>}
        </div>

        <div className="btools">
          <div className="tabs">
            <button className={"chip" + (!tag ? " sel" : "")} onClick={() => setTag("")}>Tous<em>{articles.length}</em></button>
            {tags.map(([t, n]) => (
              <button key={t} className={"chip" + (tag === t ? " sel" : "")} onClick={() => setTag(tag === t ? "" : t)}>#{t}<em>{n}</em></button>
            ))}
          </div>
          <div className="bsort">
            {[["recent", "Récents"], ["popular", "Populaires"], ["short", "Lecture rapide"]].map(([k, l]) => (
              <button key={k} className={sort === k ? "on" : ""} onClick={() => setSort(k)}>{l}</button>
            ))}
          </div>
        </div>
      </div></section>

      <section className="blist"><div className="wrap">
        {loading ? (
          <div className="bgrid">{[0, 1, 2, 3].map((i) => <div key={i} className="bcard skel"><div className="bcover" /><div className="bbody"><i /><i /><i /></div></div>)}</div>
        ) : list.length === 0 ? (
          <div className="bempty">
            <pre>{`> search "${search || tag}"\n  0 résultat`}</pre>
            <button className="btn" onClick={() => { setSearch(""); setTag(""); setSort("recent"); }}>Réinitialiser les filtres</button>
          </div>
        ) : (
          <>
            {featured && !filtering && (
              <Link to={`/blog/${featured.slug}`} className="bfeat">
                <Cover a={featured} big />
                <div className="bbody">
                  <span className="blabel">★ Dernier article</span>
                  <h2>{featured.title}</h2>
                  <p>{featured.excerpt}</p>
                  <div className="tags">{(featured.tags || []).map((t) => <span className="tag" key={t}>#{t}</span>)}</div>
                  <Meta a={featured} />
                  <span className="bread">Lire l'article →</span>
                </div>
              </Link>
            )}
            <div className="bgrid">
              {(filtering ? list : rest).map((a, i) => (
                <Link key={a._id || a.slug} to={`/blog/${a.slug}`} className="bcard" style={{ animationDelay: i * 0.05 + "s" }}>
                  <Cover a={a} />
                  <div className="bbody">
                    <div className="tags">{(a.tags || []).slice(0, 3).map((t) => <span className="tag" key={t}>#{t}</span>)}</div>
                    <h3>{a.title}</h3>
                    <p>{a.excerpt}</p>
                    <Meta a={a} />
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div></section>
    </Shell>
  );
}
