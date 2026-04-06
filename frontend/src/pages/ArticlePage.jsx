import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Calendar, Tag, ArrowLeft } from "lucide-react";

const API_URL = "https://web-production-cba0c.up.railway.app";

export default function ArticlePage() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/blog/${slug}`)
      .then(r => r.json())
      .then(data => { setArticle(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-neural-blue border-t-transparent rounded-full animate-spin"/>
    </div>
  );

  if (!article || article.error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-dim-star font-mono mb-4">Article introuvable</p>
        <a href="/blog" className="text-neural-blue hover:underline text-sm font-mono">← Retour au blog</a>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen py-32 px-6" style={{ background: "var(--void)" }}>
      <div className="max-w-3xl mx-auto">
        <a href="/blog" className="flex items-center gap-2 text-dim-star hover:text-neural-blue transition-colors text-sm font-mono mb-8">
          <ArrowLeft size={14}/> Retour au blog
        </a>

        <div className="flex flex-wrap items-center gap-3 mb-6">
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

        <h1 className="font-display text-3xl md:text-4xl font-black text-star-white mb-6 leading-tight">
          {article.title}
        </h1>

        <p className="text-neural-blue font-mono text-sm border-l-2 border-neural-blue pl-4 mb-10 leading-relaxed">
          {article.excerpt}
        </p>

        <div className="prose prose-invert max-w-none text-dim-star leading-relaxed"
          dangerouslySetInnerHTML={{ __html: article.content.replace(/\n/g, '<br/>') }}/>

        <div className="border-t border-white/5 mt-16 pt-8 flex items-center justify-between">
          <a href="/blog" className="flex items-center gap-2 text-dim-star hover:text-neural-blue transition-colors text-sm font-mono">
            <ArrowLeft size={14}/> Tous les articles
          </a>
          <a href="/" className="text-dim-star hover:text-neural-blue transition-colors text-sm font-mono">
            Portfolio →
          </a>
        </div>
      </div>
    </div>
  );
}
