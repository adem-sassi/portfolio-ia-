import { useState, useEffect } from "react";
import { Calendar, Tag, ArrowRight, BookOpen } from "lucide-react";

const API_URL = "https://web-production-cba0c.up.railway.app";

export default function BlogPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/blog`)
      .then(r => r.json())
      .then(data => { setArticles(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen py-32 px-6" style={{ background: "var(--void)" }}>
      <div className="blob absolute w-96 h-96 opacity-8 pointer-events-none"
        style={{ background: "var(--neural-blue)", top: "-5%", right: "-5%" }}/>

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-px flex-1 max-w-[60px] bg-neural-blue/40"/>
          <span className="font-mono text-xs text-neural-blue tracking-widest">BLOG & ARTICLES</span>
        </div>

        <h1 className="font-display text-4xl md:text-5xl font-black text-star-white mb-4">
          Mes <span className="gradient-text">articles</span>
        </h1>
        <p className="text-dim-star mb-12 max-w-xl leading-relaxed">
          Notes et réflexions sur l'IA, le Machine Learning et le développement.
        </p>

        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="glass-card rounded-2xl p-6 border border-white/5 animate-pulse">
                <div className="h-4 bg-white/5 rounded w-3/4 mb-3"/>
                <div className="h-3 bg-white/5 rounded w-1/2"/>
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen size={48} className="text-dim-star mx-auto mb-4 opacity-30"/>
            <p className="text-dim-star font-mono">Aucun article publié pour l'instant.</p>
            <p className="text-dim-star/50 text-sm mt-2">Revenez bientôt !</p>
          </div>
        ) : (
          <div className="space-y-6">
            {articles.map(article => (
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
