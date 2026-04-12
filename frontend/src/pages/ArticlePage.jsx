import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock, Eye, Calendar, Tag, Send, Heart, Flame, ThumbsUp, Brain } from "lucide-react";

const API_URL = "https://web-production-cba0c.up.railway.app";

function readingTime(content) {
  if (!content) return 1;
  const words = content.trim().split(/\s+/).length;
  const images = (content.match(/!\[/g) || []).length;
  const code = (content.match(/```/g) || []).length / 2;
  const mins = Math.ceil(words / 200 + images * 0.3 + code * 0.5);
  return Math.max(1, mins);
}

function TableOfContents({ content }) {
  const headings = [];
  const lines = (content || "").split("\n");
  lines.forEach((line, i) => {
    const match = line.match(/^(#{1,3})\s+(.+)/);
    if (match) {
      const level = match[1].length;
      const text = match[2];
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      headings.push({ level, text, id });
    }
  });

  if (headings.length < 2) return null;

  return (
    <div className="glass-card rounded-2xl p-6 border border-neural-blue/20 mb-8">
      <p className="font-mono text-xs text-neural-blue tracking-widest mb-4">TABLE DES MATIÈRES</p>
      <nav className="space-y-2">
        {headings.map((h, i) => (
          <a key={i} href={`#${h.id}`}
            className="flex items-center gap-2 text-dim-star hover:text-neural-blue transition-colors text-sm"
            style={{ paddingLeft: `${(h.level - 1) * 16}px` }}>
            <div className="w-1 h-1 rounded-full bg-neural-blue flex-shrink-0"/>
            {h.text}
          </a>
        ))}
      </nav>
    </div>
  );
}

function Reactions({ slug }) {
  const [reactions, setReactions] = useState({ fire: 0, heart: 0, clap: 0, think: 0 });
  const [voted, setVoted] = useState(() => JSON.parse(localStorage.getItem(`voted_${slug}`) || "{}"));

  useEffect(() => {
    fetch(`${API_URL}/api/blog/${slug}`)
      .then(r => r.json())
      .then(d => { if (d.reactions) setReactions(d.reactions); })
      .catch(() => {});
  }, [slug]);

  const react = async (type) => {
    if (voted[type]) return;
    try {
      const res = await fetch(`${API_URL}/api/blog/${slug}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reaction: type }),
      });
      const data = await res.json();
      if (data.reactions) {
        setReactions(data.reactions);
        const newVoted = { ...voted, [type]: true };
        setVoted(newVoted);
        localStorage.setItem(`voted_${slug}`, JSON.stringify(newVoted));
      }
    } catch {}
  };

  const emojis = [
    { type: "fire", emoji: "🔥", label: "Super" },
    { type: "heart", emoji: "❤️", label: "J'aime" },
    { type: "clap", emoji: "👏", label: "Bravo" },
    { type: "think", emoji: "🤔", label: "Intéressant" },
  ];

  return (
    <div className="glass-card rounded-2xl p-6 border border-white/5 text-center">
      <p className="font-mono text-xs text-dim-star tracking-widest mb-4">RÉACTIONS</p>
      <div className="flex justify-center gap-4">
        {emojis.map(({ type, emoji, label }) => (
          <button key={type} onClick={() => react(type)}
            className="flex flex-col items-center gap-1 p-3 rounded-xl transition-all hover:scale-110"
            style={{
              background: voted[type] ? "rgba(0,212,255,0.15)" : "rgba(255,255,255,0.03)",
              border: `1px solid ${voted[type] ? "rgba(0,212,255,0.4)" : "rgba(255,255,255,0.1)"}`,
              opacity: voted[type] ? 1 : 0.7
            }}>
            <span style={{ fontSize: "24px" }}>{emoji}</span>
            <span className="font-bold text-star-white text-sm">{reactions[type] || 0}</span>
            <span className="text-dim-star text-xs font-mono">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Comments({ slug }) {
  const [comments, setComments] = useState([]);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/blog/${slug}/comments`)
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setComments(d); })
      .catch(() => {});
  }, [slug]);

  const submit = async () => {
    if (!name.trim() || !content.trim() || loading) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/blog/${slug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, content }),
      });
      const data = await res.json();
      if (data._id) {
        setComments(prev => [data, ...prev]);
        setName(""); setContent("");
        setSent(true);
        setTimeout(() => setSent(false), 3000);
      }
    } catch {}
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <h3 className="font-display text-xl font-black text-star-white">
        💬 Commentaires ({comments.length})
      </h3>

      <div className="glass-card rounded-2xl p-6 border border-neural-violet/20 space-y-4">
        <p className="font-mono text-xs text-neural-violet tracking-widest">LAISSER UN COMMENTAIRE</p>
        <input value={name} onChange={e => setName(e.target.value)}
          placeholder="Votre nom *"
          className="ai-input w-full px-4 py-3 rounded-xl text-sm"/>
        <textarea value={content} onChange={e => setContent(e.target.value)}
          placeholder="Votre commentaire *"
          className="ai-input w-full px-4 py-3 rounded-xl text-sm resize-none h-24"/>
        {sent && <p className="text-neural-green text-xs font-mono">✅ Commentaire publié !</p>}
        <button onClick={submit} disabled={!name.trim() || !content.trim() || loading}
          className="ai-btn px-6 py-3 rounded-xl flex items-center gap-2 text-sm">
          <Send size={14}/>
          {loading ? "Envoi..." : "Publier le commentaire"}
        </button>
      </div>

      {comments.length > 0 && (
        <div className="space-y-4">
          {comments.map((c, i) => (
            <div key={i} className="glass-card rounded-xl p-5 border border-white/5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center font-display font-black text-sm flex-shrink-0"
                  style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.2)", color: "#00D4FF" }}>
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-star-white font-bold text-sm">{c.name}</p>
                  <p className="text-dim-star text-xs font-mono">
                    {new Date(c.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
              </div>
              <p className="text-dim-star text-sm leading-relaxed">{c.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SimilarArticles({ currentSlug, tags }) {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/api/blog`)
      .then(r => r.json())
      .then(data => {
        const others = data.filter(a => a.slug !== currentSlug);
        const scored = others.map(a => ({
          ...a,
          score: (a.tags || []).filter(t => (tags || []).includes(t)).length
        }));
        const similar = scored.sort((a, b) => b.score - a.score).slice(0, 3);
        setArticles(similar);
      }).catch(() => {});
  }, [currentSlug, tags]);

  if (!articles.length) return null;

  return (
    <div className="space-y-4">
      <h3 className="font-display text-xl font-black text-star-white">📚 Articles similaires</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {articles.map((a, i) => (
          <Link key={i} to={`/blog/${a.slug}`}
            className="glass-card rounded-xl p-4 border border-white/5 hover:border-neural-blue/30 transition-all group">
            <p className="text-star-white font-bold text-sm mb-2 group-hover:text-neural-blue transition-colors line-clamp-2">
              {a.title}
            </p>
            <p className="text-dim-star text-xs line-clamp-2 mb-3">{a.excerpt}</p>
            <div className="flex items-center gap-2 text-dim-star text-xs font-mono">
              <Clock size={10}/>
              {readingTime(a.content)} min de lecture
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function ArticlePage() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    fetch(`${API_URL}/api/blog/${slug}`)
      .then(r => r.json())
      .then(d => { setArticle(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [slug]);


  // JSON-LD + Canonical pour SEO
  useEffect(() => {
    if (!article) return;
    
    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = `https://ademsassi.com/blog/${article.slug}`;

    // OG tags dynamiques
    const setMeta = (prop, content, attr = "property") => {
      let el = document.querySelector(`meta[${attr}="${prop}"]`);
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, prop); document.head.appendChild(el); }
      el.setAttribute('content', content);
    };
    setMeta("og:title", article.title);
    setMeta("og:description", article.excerpt);
    setMeta("og:url", `https://ademsassi.com/blog/${article.slug}`);
    setMeta("og:type", "article");
    setMeta("twitter:title", article.title, "name");
    setMeta("twitter:description", article.excerpt, "name");

    // JSON-LD Article
    const existing = document.getElementById('article-jsonld');
    if (existing) existing.remove();
    const script = document.createElement('script');
    script.id = 'article-jsonld';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": article.title,
      "description": article.excerpt,
      "url": `https://ademsassi.com/blog/${article.slug}`,
      "datePublished": article.createdAt,
      "dateModified": article.updatedAt || article.createdAt,
      "author": {
        "@type": "Person",
        "name": "Adem SASSI",
        "url": "https://ademsassi.com"
      },
      "publisher": {
        "@type": "Person",
        "name": "Adem SASSI",
        "url": "https://ademsassi.com"
      },
      "keywords": (article.tags || []).join(", "),
      "wordCount": article.content?.split(/\s+/).length || 0,
    });
    document.head.appendChild(script);

    return () => {
      script.remove();
      if (canonical) canonical.href = 'https://ademsassi.com';
    };
  }, [article]);

  useEffect(() => {
    const handleScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(total > 0 ? (window.scrollY / total) * 100 : 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--void)" }}>
      <div className="w-8 h-8 border-2 border-neural-blue border-t-transparent rounded-full animate-spin"/>
    </div>
  );

  if (!article) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--void)" }}>
      <p className="text-dim-star font-mono">Article non trouvé</p>
    </div>
  );

  const mins = readingTime(article.content);

  return (
    <div className="min-h-screen" style={{ background: "var(--void)" }}>
      {/* Scroll progress bar */}
      <div className="fixed top-0 left-0 right-0 h-0.5 z-50" style={{ background: "rgba(255,255,255,0.1)" }}>
        <div className="h-full transition-all duration-100"
          style={{ width: `${scrollProgress}%`, background: "linear-gradient(to right, #00D4FF, #7B2FFF)" }}/>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-24">
        <Link to="/blog" className="inline-flex items-center gap-2 text-dim-star hover:text-neural-blue transition-colors text-sm font-mono mb-8">
          <ArrowLeft size={14}/> Retour au blog
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            {(article.tags || []).map((tag, i) => (
              <span key={i} className="text-xs font-mono px-3 py-1 rounded-full"
                style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.2)", color: "var(--neural-blue)" }}>
                {tag}
              </span>
            ))}
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-black text-star-white mb-4 leading-tight">
            {article.title}
          </h1>
          <p className="text-dim-star text-lg leading-relaxed mb-6">{article.excerpt}</p>
          <div className="flex flex-wrap items-center gap-4 text-dim-star text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <Calendar size={12}/>
              {new Date(article.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={12}/>
              {mins} min de lecture · environ {mins * 200} mots
            </div>
            <div className="flex items-center gap-1.5">
              <Eye size={12}/>
              {article.views || 0} vue{article.views !== 1 ? "s" : ""}
            </div>
          </div>
        </div>

        {/* Table des matières */}
        <TableOfContents content={article.content}/>

        {/* Contenu */}
        <div className="prose prose-invert max-w-none mb-12"
          dangerouslySetInnerHTML={{ __html: article.content?.replace(/\n/g, "<br/>") || "" }}/>

        {/* Réactions */}
        <div className="mb-8">
          <Reactions slug={slug}/>
        </div>

        {/* Articles similaires */}
        <div className="mb-12">
          <SimilarArticles currentSlug={slug} tags={article.tags}/>
        </div>

        {/* Commentaires */}
        <Comments slug={slug}/>
      </div>
    </div>
  );
}
