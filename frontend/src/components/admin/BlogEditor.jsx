import { useState, useEffect } from "react";
import { Plus, Trash2, Edit, Eye, EyeOff, Loader2, Save } from "lucide-react";

const API_URL = "https://web-production-cba0c.up.railway.app";

export default function BlogEditor({ token }) {
  const [articles, setArticles] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: "", excerpt: "", content: "", tags: "", published: false });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadArticles(); }, []);

  const loadArticles = async () => {
    try {
      const res = await fetch(`${API_URL}/api/blog`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setArticles(Array.isArray(data) ? data : []);
    } catch {}
  };

  const save = async () => {
    setSaving(true);
    try {
      const body = { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) };
      const url = editing ? `${API_URL}/api/blog/${editing}` : `${API_URL}/api/blog`;
      const method = editing ? 'PUT' : 'POST';
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body)
      });
      setForm({ title: "", excerpt: "", content: "", tags: "", published: false });
      setEditing(null);
      await loadArticles();
    } catch {}
    setSaving(false);
  };

  const del = async (id) => {
    if (!confirm("Supprimer cet article ?")) return;
    await fetch(`${API_URL}/api/blog/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    await loadArticles();
  };

  const edit = (article) => {
    setEditing(article._id);
    setForm({ title: article.title, excerpt: article.excerpt, content: article.content, tags: article.tags?.join(', ') || '', published: article.published });
  };

  return (
    <div className="space-y-6">
      {/* Formulaire */}
      <div className="glass-card rounded-xl p-4 border border-neural-blue/20">
        <h3 className="font-mono text-xs text-neural-blue tracking-widest mb-4">
          {editing ? "✏️ MODIFIER L'ARTICLE" : "✨ NOUVEL ARTICLE"}
        </h3>
        <div className="space-y-3">
          <input type="text" placeholder="Titre de l'article" value={form.title}
            onChange={e => setForm({...form, title: e.target.value})}
            className="ai-input w-full px-3 py-2 rounded-lg text-sm"/>
          <textarea placeholder="Résumé court (excerpt)" value={form.excerpt}
            onChange={e => setForm({...form, excerpt: e.target.value})}
            className="ai-input w-full px-3 py-2 rounded-lg text-sm resize-none h-16"/>
          <textarea placeholder="Contenu de l'article..." value={form.content}
            onChange={e => setForm({...form, content: e.target.value})}
            className="ai-input w-full px-3 py-2 rounded-lg text-sm resize-none h-40"/>
          <input type="text" placeholder="Tags séparés par virgule: IA, Python, ML" value={form.tags}
            onChange={e => setForm({...form, tags: e.target.value})}
            className="ai-input w-full px-3 py-2 rounded-lg text-sm"/>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.published}
                onChange={e => setForm({...form, published: e.target.checked})}
                className="w-4 h-4"/>
              <span className="text-sm text-dim-star font-mono">Publier</span>
            </label>
            <button onClick={save} disabled={saving || !form.title}
              className="flex-1 ai-btn py-2 rounded-lg flex items-center justify-center gap-2 text-sm">
              {saving ? <Loader2 size={14} className="animate-spin"/> : <Save size={14}/>}
              {editing ? "Modifier" : "Publier"}
            </button>
            {editing && (
              <button onClick={() => { setEditing(null); setForm({ title: "", excerpt: "", content: "", tags: "", published: false }); }}
                className="px-4 py-2 glass-card border border-white/10 rounded-lg text-sm text-dim-star">
                Annuler
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Liste articles */}
      <div className="space-y-2">
        {articles.length === 0 && (
          <p className="text-dim-star text-xs font-mono text-center py-4">Aucun article publié</p>
        )}
        {articles.map(article => (
          <div key={article._id} className="flex items-center gap-3 p-3 glass-card rounded-xl border border-white/5">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-star-white font-mono truncate">{article.title}</p>
              <p className="text-xs text-dim-star font-mono">{new Date(article.createdAt).toLocaleDateString('fr-FR')}</p>
            </div>
            <div className="flex items-center gap-2">
              {article.published
                ? <Eye size={14} className="text-neural-green"/>
                : <EyeOff size={14} className="text-dim-star"/>}
              <button onClick={() => edit(article)} className="text-neural-blue hover:opacity-80">
                <Edit size={14}/>
              </button>
              <button onClick={() => del(article._id)} className="text-neural-pink hover:opacity-80">
                <Trash2 size={14}/>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
