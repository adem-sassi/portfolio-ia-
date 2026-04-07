import { useState, useEffect } from "react";
import { Calendar, Tag, ArrowRight, BookOpen, Search, Clock, FileText, Eye } from "lucide-react";

const API_URL = "https://web-production-cba0c.up.railway.app";

function readingTime(content) {
  const words = content?.split(/\s+/).length || 0;
  return Math.max(1, Math.ceil(words / 200));
}

function CountUp({ target, duration = 1500 }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    const step = target / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, 16);
    return () => clearInterval(timer);
  }, [target]);
  return <span>{count}</span>;
}

export default function BlogPage() {
  const [articles, setArticles] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/api/blog`)
      .then(r => r.json())
      .then(data => {
        const arr = Array.isArray(data) ? data : [];
        setArticles(arr);
        setFiltered(arr);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = articles;
    if (search) {
      result = result.filter(a =>
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.excerpt.toLowerCase().includes(search.toLowerCase()) ||
        a.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()))
      );
    }
    if (activeTag) {
      result = result.filter(a => a.tags?.includes(activeTag));
    }
    setFiltered(result);
  }, [search, activeTag, articles]);

  const allTags = [...new Set(articles.flatMap(a => a.tags || []))];
  const totalWords = articles.reduce((acc, a) => acc + (a.content?.split(/\s+/).length || 0), 0);

  return (
    <div className="min-h-screen py-32 px-6" style={{ background: "var(--void)" }}>
      

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-px flex-1 max-w-[60px] bg-neural-blue/40"/>
          <span className="font-mono text-xs text-neural-blue tracking-widest">BLOG & ARTICLES</span>
        </div>

        <h1 className="font-display text-4xl md:text-5xl font-black text-star-white mb-4">
          Mes <span className="gradient-text">articles</span>
        </h1>
        <p className="text-dim-star mb-8 max-w-xl leading-relaxed">
          Notes et réflexions sur l'IA, le Machine Learning et le développement.
        </p>

        {/* Stats compteurs */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { icon: FileText, label: "Articles", value: articles.length },
            { icon: Tag, label: "Tags", value: allTags.length },
            { icon: Clock, label: "Min de lecture", value: Math.ceil(totalWords / 200) },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="glass-card rounded-xl p-4 border border-white/5 text-center">
                <Icon size={16} className="text-neural-blue mx-auto mb-2"/>
                <div className="font-display text-2xl font-black gradient-text">
                  <CountUp target={stat.value}/>
                </div>
                <p className="text-dim-star text-xs font-mono mt-1">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Barre de recherche */}
        <div className="relative mb-6">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-dim-star"/>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un article, un tag..."
            className="ai-input w-full pl-10 pr-4 py-3 rounded-xl text-sm"
          />
        </div>

        {/* Filtres par tag */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button onClick={() => setActiveTag("")}
            className="text-xs font-mono px-3 py-1.5 rounded-full transition-all"
            style={{
              background: activeTag === "" ? "rgba(0,212,255,0.2)" : "rgba(0,212,255,0.05)",
              border: "1px solid rgba(0,212,255,0.3)",
              color: "var(--neural-blue)"
            }}>
            Tous
          </button>
          {allTags.map(tag => (
            <button key={tag} onClick={() => setActiveTag(activeTag === tag ? "" : tag)}
              className="text-xs font-mono px-3 py-1.5 rounded-full transition-all"
              style={{
                background: activeTag === tag ? "rgba(0,212,255,0.2)" : "rgba(0,212,255,0.05)",
                border: "1px solid rgba(0,212,255,0.3)",
                color: "var(--neural-blue)"
              }}>
              {tag}
            </button>
          ))}
        </div>

        {/* Articles */}
        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="glass-card rounded-2xl p-6 border border-white/5 animate-pulse">
                <div className="h-4 bg-white/5 rounded w-3/4 mb-3"/>
                <div className="h-3 bg-white/5 rounded w-1/2"/>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen size={48} className="text-dim-star mx-auto mb-4 opacity-30"/>
            <p className="text-dim-star font-mono">Aucun article trouvé.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filtered.map(article => (
              <a key={article._id} href={`/blog/${article.slug}`}
                className="block glass-card rounded-2xl p-6 border border-white/5 hover:border-neural-blue/30 transition-all group neural-glow-hover">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h2 className="font-display text-xl font-bold text-star-white mb-2 group-hover:text-neural-blue transition-colors">
                      {article.title}
                    </h2>
                    <p className="text-dim-star text-sm leading-relaxed mb-4">{article.excerpt}</p>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-1 text-dim-star text-xs font-mono">
                        <Calendar size={12}/>
                        {new Date(article.createdAt).toLocaleDateString('fr-FR')}
                      </div>
                      <div className="flex items-center gap-1 text-dim-star text-xs font-mono">
                        <Clock size={12}/>
                        {readingTime(article.content)} min de lecture
                      </div>
                      <div className="flex items-center gap-1 text-dim-star text-xs font-mono">
                        <Eye size={12}/>
                        {article.views || 0} vue{article.views !== 1 ? "s" : ""}
                      </div>
                      {article.tags?.map(tag => (
                        <span key={tag} className="flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded-full"
                          style={{ background: "rgba(0,212,255,0.1)", color: "var(--neural-blue)", border: "1px solid rgba(0,212,255,0.2)" }}>
                          <Tag size={10}/>{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <ArrowRight size={20} className="text-dim-star group-hover:text-neural-blue transition-colors flex-shrink-0 mt-1"/>
                </div>
              </a>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <a href="/" className="text-dim-star hover:text-neural-blue transition-colors text-sm font-mono">
            ← Retour au portfolio
          </a>
        </div>
      </div>
    </div>
  );
}
