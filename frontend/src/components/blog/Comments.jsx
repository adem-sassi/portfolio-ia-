import { useState, useEffect } from "react";
import { Send, MessageCircle } from "lucide-react";

const API_URL = "https://web-production-cba0c.up.railway.app";
const AVATARS_COLORS = ["#00D4FF", "#7B2FFF", "#FF2FBB", "#00FF88", "#FFD700"];

export default function Comments({ slug }) {
  const [comments, setComments] = useState([]);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/api/blog/${slug}/comments`)
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setComments(d); })
      .catch(() => {});
  }, [slug]);

  const submit = async () => {
    if (!name.trim() || !text.trim() || loading) return;
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API_URL}/api/blog/${slug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), content: text.trim() }),
      });
      const data = await res.json();
      if (data._id) {
        setComments(prev => [data, ...prev]);
        setName(""); setText("");
        setSent(true);
        setTimeout(() => setSent(false), 3000);
      } else { setError(data.error || "Erreur"); }
    } catch { setError("Erreur de connexion"); }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <MessageCircle size={20} className="text-neural-violet"/>
        <h3 className="font-display text-xl font-black text-star-white">
          Commentaires
          <span className="ml-2 text-sm font-mono text-dim-star font-normal">({comments.length})</span>
        </h3>
      </div>

      <div className="glass-card rounded-2xl border border-neural-violet/20 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5" style={{ background: "rgba(123,47,255,0.05)" }}>
          <p className="font-mono text-xs text-neural-violet tracking-widest">LAISSER UN COMMENTAIRE</p>
        </div>
        <div className="p-6 space-y-4">
          <input value={name} onChange={e => setName(e.target.value)}
            placeholder="Votre nom *" className="ai-input w-full px-4 py-3 rounded-xl text-sm"/>
          <div className="relative">
            <textarea value={text} onChange={e => setText(e.target.value.slice(0, 500))}
              placeholder="Partagez votre avis, une question, ou une remarque..."
              className="ai-input w-full px-4 py-3 rounded-xl text-sm resize-none" style={{ minHeight: "100px" }}/>
            <p className="absolute bottom-3 right-3 text-dim-star text-xs font-mono">{text.length}/500</p>
          </div>
          {error && <p className="text-neural-pink text-xs font-mono">⚠ {error}</p>}
          {sent && (
            <div className="px-4 py-3 rounded-xl" style={{ background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.3)" }}>
              <p className="text-neural-green text-sm">✅ Commentaire publié !</p>
            </div>
          )}
          <button onClick={submit} disabled={!name.trim() || !text.trim() || loading}
            className="ai-btn px-6 py-3 rounded-xl flex items-center gap-2 text-sm">
            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> : <Send size={14}/>}
            {loading ? "Publication..." : "Publier le commentaire"}
          </button>
        </div>
      </div>

      {comments.length === 0 ? (
        <div className="text-center py-12 glass-card rounded-2xl border border-white/5">
          <MessageCircle size={32} className="text-dim-star mx-auto mb-3 opacity-30"/>
          <p className="text-dim-star text-sm font-mono">Soyez le premier à commenter !</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((c, i) => {
            const color = AVATARS_COLORS[c.name.charCodeAt(0) % AVATARS_COLORS.length];
            return (
              <div key={i} className="glass-card rounded-2xl p-5 border border-white/5 hover:border-white/10 transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center font-display font-black text-sm flex-shrink-0"
                    style={{ background: `${color}15`, border: `1px solid ${color}40`, color }}>
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-star-white font-bold text-sm">{c.name}</p>
                      <p className="text-dim-star text-xs font-mono">
                        {new Date(c.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <p className="text-dim-star text-sm leading-relaxed">{c.content}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
