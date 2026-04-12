import { marked } from "marked";
import { useState, useEffect } from "react";
import { Plus, Trash2, Save, Eye, EyeOff, Edit, BarChart2, Check, X, Clock, MessageCircle, Heart, Flame } from "lucide-react";

const API_URL = "https://web-production-cba0c.up.railway.app";

function ArticleStats({ article, token }) {
  const [comments, setComments] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/api/blog/${article.slug}/comments`)
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setComments(d); })
      .catch(() => {});
  }, [article.slug]);

  const totalReactions = Object.values(article.reactions || {}).reduce((a, b) => a + b, 0);

  const deleteComment = async (id) => {
    try {
      await fetch(`${API_URL}/api/blog/comments/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      setComments(prev => prev.filter(c => c._id !== id));
    } catch {}
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card rounded-xl p-3 border border-white/5 text-center">
          <p className="font-display text-2xl font-black text-neural-blue">{article.views || 0}</p>
          <p className="text-dim-star text-xs font-mono">Vues</p>
        </div>
        <div className="glass-card rounded-xl p-3 border border-white/5 text-center">
          <p className="font-display text-2xl font-black text-neural-pink">{totalReactions}</p>
          <p className="text-dim-star text-xs font-mono">Réactions</p>
        </div>
        <div className="glass-card rounded-xl p-3 border border-white/5 text-center">
          <p className="font-display text-2xl font-black text-neural-violet">{comments.length}</p>
          <p className="text-dim-star text-xs font-mono">Commentaires</p>
        </div>
      </div>

      {/* Réactions détail */}
      {totalReactions > 0 && (
        <div className="flex gap-3">
          {[["🔥", article.reactions?.fire], ["❤️", article.reactions?.heart], ["👏", article.reactions?.clap], ["🤔", article.reactions?.think]].map(([e, v], i) => (
            <div key={i} className="glass-card rounded-lg px-3 py-2 border border-white/5 flex items-center gap-2">
              <span style={{ fontSize: "16px" }}>{e}</span>
              <span className="text-star-white text-sm font-bold">{v || 0}</span>
            </div>
          ))}
        </div>
      )}

      {/* Commentaires */}
      {comments.length > 0 && (
        <div className="space-y-2">
          <p className="text-dim-star text-xs font-mono tracking-widest">COMMENTAIRES À MODÉRER</p>
          {comments.map((c, i) => (
            <div key={i} className="glass-card rounded-xl p-4 border border-white/5 flex items-start gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-star-white text-sm font-bold">{c.name}</p>
                  <p className="text-dim-star text-xs font-mono">{new Date(c.createdAt).toLocaleDateString("fr-FR")}</p>
                </div>
                <p className="text-dim-star text-xs">{c.content}</p>
              </div>
              <button onClick={() => deleteComment(c._id)}
                className="text-neural-pink hover:opacity-70 flex-shrink-0">
                <Trash2 size={14}/>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function BlogEditor({ token }) {
  const [articles, setArticles] = useState([]);
  const [editing, setEditing] = useState(null);
  const [preview, setPreview] = useState(false);
  const [activeTab, setActiveTab] = useState("edit");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: "", slug: "", excerpt: "", content: "", tags: [], published: false, scheduledAt: ""
  });
  const [newTag, setNewTag] = useState("");
  const [suggestingTags, setSuggestingTags] = useState(false);

  const load = () => {
    fetch(`${API_URL}/api/blog/all`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setArticles(d); setLoading(false); })
      .catch(() => {
        fetch(`${API_URL}/api/blog`)
          .then(r => r.json())
          .then(d => { if (Array.isArray(d)) setArticles(d); setLoading(false); })
          .catch(() => setLoading(false));
      });
  };

  useEffect(() => { load(); }, []);

  const edit = (a) => {
    setEditing(a._id);
    setForm({
      title: a.title || "",
      slug: a.slug || "",
      excerpt: a.excerpt || "",
      content: a.content || "",
      tags: a.tags || [],
      published: a.published || false,
      scheduledAt: a.scheduledAt ? new Date(a.scheduledAt).toISOString().slice(0, 16) : ""
    });
    setActiveTab("edit");
    setPreview(false);
  };

  const newArticle = () => {
    setEditing("new");
    setForm({ title: "", slug: "", excerpt: "", content: "", tags: [], published: false, scheduledAt: "" });
    setActiveTab("edit");
  };

  const generateSlug = (title) => title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const suggestTags = async () => {
    if (!form.title) return;
    setSuggestingTags(true);
    try {
      const res = await fetch(`${API_URL}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: `Suggère 5 tags courts pour un article intitulé "${form.title}". Réponds UNIQUEMENT avec les tags séparés par des virgules.` }]
        })
      });
      const data = await res.json();
      if (data.reply) {
        const tags = data.reply.split(",").map(t => t.trim()).filter(Boolean).slice(0, 5);
        setForm(prev => ({ ...prev, tags: [...new Set([...prev.tags, ...tags])] }));
      }
    } catch {}
    setSuggestingTags(false);
  };

  const save = async () => {
    setSaving(true);
    try {
      const url = editing === "new"
        ? `${API_URL}/api/blog`
        : `${API_URL}/api/blog/${editing}`;
      const method = editing === "new" ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data._id || data.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        load();
        if (editing === "new") setEditing(data._id);
      }
    } catch {}
    setSaving(false);
  };

  const deleteArticle = async (id) => {
    if (!confirm("Supprimer cet article ?")) return;
    try {
      await fetch(`${API_URL}/api/blog/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      load();
      if (editing === id) setEditing(null);
    } catch {}
  };

  if (loading) return <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-neural-blue border-t-transparent rounded-full animate-spin"/></div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Liste articles */}
      <div className="space-y-3">
        <button onClick={newArticle}
          className="w-full ai-btn py-3 rounded-xl flex items-center justify-center gap-2 text-sm">
          <Plus size={14}/> Nouvel article
        </button>

        {articles.map((a, i) => (
          <div key={i} onClick={() => edit(a)}
            className="glass-card rounded-xl p-4 border cursor-pointer transition-all"
            style={{ borderColor: editing === a._id ? "rgba(0,212,255,0.4)" : "rgba(255,255,255,0.05)" }}>
            <div className="flex items-start justify-between gap-2 mb-2">
              <p className="text-star-white text-sm font-bold line-clamp-2 flex-1">{a.title}</p>
              <button onClick={e => { e.stopPropagation(); deleteArticle(a._id); }}
                className="text-neural-pink hover:opacity-70 flex-shrink-0">
                <Trash2 size={12}/>
              </button>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono px-2 py-0.5 rounded-full"
                style={{
                  background: a.published ? "rgba(0,255,136,0.1)" : "rgba(255,255,255,0.05)",
                  border: `1px solid ${a.published ? "rgba(0,255,136,0.3)" : "rgba(255,255,255,0.1)"}`,
                  color: a.published ? "#00FF88" : "var(--dim-star)"
                }}>
                {a.published ? "Publié" : "Brouillon"}
              </span>
              <span className="text-dim-star text-xs font-mono flex items-center gap-1">
                <Eye size={10}/> {a.views || 0}
              </span>
              <span className="text-dim-star text-xs font-mono">
                🔥 {Object.values(a.reactions || {}).reduce((s, v) => s + v, 0)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Éditeur */}
      {editing ? (
        <div className="lg:col-span-2 space-y-4">
          {/* Tabs */}
          <div className="flex gap-2">
            {["edit", "preview", "stats"].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className="px-4 py-2 rounded-lg text-xs font-mono transition-all"
                style={{
                  background: activeTab === tab ? "rgba(0,212,255,0.15)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${activeTab === tab ? "rgba(0,212,255,0.3)" : "rgba(255,255,255,0.07)"}`,
                  color: activeTab === tab ? "var(--neural-blue)" : "var(--dim-star)"
                }}>
                {tab === "edit" ? "✏️ Éditer" : tab === "preview" ? "👁️ Aperçu" : "📊 Stats"}
              </button>
            ))}
          </div>

          {activeTab === "edit" && (
            <div className="space-y-4">
              <div>
                <label className="text-dim-star text-xs font-mono mb-1 block">TITRE</label>
                <input value={form.title} onChange={e => {
                  setForm(prev => ({ ...prev, title: e.target.value, slug: generateSlug(e.target.value) }));
                }} className="ai-input w-full px-4 py-3 rounded-xl text-sm" placeholder="Titre de l'article"/>
              </div>

              <div>
                <label className="text-dim-star text-xs font-mono mb-1 block">SLUG</label>
                <input value={form.slug} onChange={e => setForm(prev => ({ ...prev, slug: e.target.value }))}
                  className="ai-input w-full px-4 py-3 rounded-xl text-sm font-mono"/>
              </div>

              <div>
                <label className="text-dim-star text-xs font-mono mb-1 block">EXTRAIT</label>
                <textarea value={form.excerpt} onChange={e => setForm(prev => ({ ...prev, excerpt: e.target.value }))}
                  className="ai-input w-full px-4 py-3 rounded-xl text-sm resize-none h-16"/>
              </div>

              <div>
                <label className="text-dim-star text-xs font-mono mb-1 block">CONTENU (MARKDOWN)</label>
                <textarea value={form.content} onChange={e => setForm(prev => ({ ...prev, content: e.target.value }))}
                  className="ai-input w-full px-4 py-3 rounded-xl text-sm resize-none font-mono"
                  style={{ minHeight: "250px" }}
                  placeholder="# Titre&#10;&#10;Votre contenu en **Markdown**..."/>
              </div>

              {/* Tags */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-dim-star text-xs font-mono">TAGS</label>
                  <button onClick={suggestTags} disabled={suggestingTags || !form.title}
                    className="text-xs font-mono text-neural-violet hover:opacity-80 flex items-center gap-1">
                    {suggestingTags ? "⏳ Suggestion..." : "🤖 Suggérer avec IA"}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {form.tags.map((tag, i) => (
                    <span key={i} className="flex items-center gap-1 text-xs font-mono px-2 py-1 rounded-full"
                      style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.2)", color: "var(--neural-blue)" }}>
                      {tag}
                      <button onClick={() => setForm(prev => ({ ...prev, tags: prev.tags.filter((_, j) => j !== i) }))}>
                        <X size={10}/>
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input value={newTag} onChange={e => setNewTag(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && newTag.trim()) { setForm(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] })); setNewTag(""); }}}
                    placeholder="Ajouter un tag (Enter)..."
                    className="ai-input flex-1 px-3 py-2 rounded-lg text-xs"/>
                </div>
              </div>

              {/* Publication */}
              <div className="glass-card rounded-xl p-4 border border-white/5 space-y-3">
                <p className="text-dim-star text-xs font-mono tracking-widest">PUBLICATION</p>
                <div className="flex items-center gap-3">
                  <label className="text-dim-star text-xs font-mono">Statut</label>
                  <button onClick={() => setForm(prev => ({ ...prev, published: !prev.published }))}
                    className="relative w-12 h-6 rounded-full transition-all"
                    style={{ background: form.published ? "var(--neural-blue)" : "rgba(255,255,255,0.1)" }}>
                    <div className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all"
                      style={{ left: form.published ? "26px" : "4px" }}/>
                  </button>
                  <span className="text-xs font-mono" style={{ color: form.published ? "var(--neural-blue)" : "var(--dim-star)" }}>
                    {form.published ? "Publié" : "Brouillon"}
                  </span>
                </div>
                <div>
                  <label className="text-dim-star text-xs font-mono mb-1 block flex items-center gap-1">
                    <Clock size={10}/> PLANIFIER LA PUBLICATION
                  </label>
                  <input type="datetime-local" value={form.scheduledAt}
                    onChange={e => setForm(prev => ({ ...prev, scheduledAt: e.target.value }))}
                    className="ai-input w-full px-3 py-2 rounded-lg text-xs font-mono"/>
                  {form.scheduledAt && <p className="text-dim-star text-xs mt-1 font-mono">📅 Publié le {new Date(form.scheduledAt).toLocaleString("fr-FR")}</p>}
                </div>
              </div>

              <button onClick={save}
                className="ai-btn w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm">
                {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> : saved ? <Check size={14}/> : <Save size={14}/>}
                {saving ? "Sauvegarde..." : saved ? "✅ Sauvegardé !" : "Sauvegarder l'article"}
              </button>
            </div>
          )}

          {activeTab === "preview" && (
            <div className="glass-card rounded-2xl p-6 border border-white/5">
              <p className="font-mono text-xs text-neural-blue tracking-widest mb-4">APERÇU MARKDOWN</p>
              {form.content ? (
                <div className="prose prose-invert max-w-none text-dim-star"
                  dangerouslySetInnerHTML={{ __html: marked(form.content) }}/>
              ) : (
                <p className="text-dim-star text-sm font-mono">Écris du contenu pour voir l'aperçu...</p>
              )}
            </div>
          )}

          {activeTab === "stats" && editing !== "new" && (
            <ArticleStats article={articles.find(a => a._id === editing) || {}} token={token}/>
          )}
        </div>
      ) : (
        <div className="lg:col-span-2 flex items-center justify-center">
          <p className="text-dim-star font-mono text-sm">Sélectionne un article ou crée-en un nouveau</p>
        </div>
      )}
    </div>
  );
}
