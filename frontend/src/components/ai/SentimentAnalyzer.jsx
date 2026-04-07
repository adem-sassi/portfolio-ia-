import { useState } from "react";
import { Brain, Loader2, Send } from "lucide-react";

const API_URL = "https://web-production-cba0c.up.railway.app";

const COLORS = { positif: "#00FF88", negatif: "#FF2FBB", neutre: "#00D4FF" };

export default function SentimentAnalyzer() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analyze = async () => {
    if (!text.trim() || loading) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch(`${API_URL}/api/ai/ml/sentiment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else setResult(data);
    } catch { setError("Erreur de connexion"); }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <textarea value={text} onChange={e => setText(e.target.value)}
          placeholder="Entrez un texte à analyser..."
          className="ai-input w-full px-4 py-3 rounded-xl text-sm resize-none h-28" />
        <button onClick={analyze} disabled={!text.trim() || loading}
          className="absolute bottom-3 right-3 ai-btn px-4 py-2 rounded-lg flex items-center gap-2 text-xs">
          {loading ? <Loader2 size={12} className="animate-spin"/> : <Send size={12}/>}
          {loading ? "Analyse..." : "Analyser"}
        </button>
      </div>

      {error && <p className="text-neural-pink text-xs font-mono">⚠ {error}</p>}

      {result && (
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-4 glass-card rounded-xl border border-white/5">
            <div className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: `${COLORS[result.sentiment]}20`, border: `2px solid ${COLORS[result.sentiment]}` }}>
              <span className="text-2xl">{result.sentiment === "positif" ? "😊" : result.sentiment === "negatif" ? "😞" : "😐"}</span>
            </div>
            <div>
              <p className="font-display font-bold text-star-white capitalize">{result.sentiment}</p>
              <p className="text-dim-star text-xs font-mono">Score: {Math.round(result.score * 100)}%</p>
            </div>
            <div className="flex-1 ml-4">
              <div className="w-full bg-white/5 rounded-full h-2">
                <div className="h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.round(result.score * 100)}%`, background: COLORS[result.sentiment] }}/>
              </div>
            </div>
          </div>

          {result.emotions?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {result.emotions.map((e, i) => (
                <span key={i} className="text-xs font-mono px-2 py-1 rounded-full"
                  style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.2)", color: "var(--neural-blue)" }}>
                  {e}
                </span>
              ))}
            </div>
          )}

          {result.mots_cles?.length > 0 && (
            <div>
              <p className="text-dim-star text-xs font-mono mb-2">MOTS CLÉS</p>
              <div className="flex flex-wrap gap-2">
                {result.mots_cles.map((m, i) => (
                  <span key={i} className="text-xs font-mono px-2 py-1 rounded-full"
                    style={{ background: "rgba(123,47,255,0.1)", border: "1px solid rgba(123,47,255,0.2)", color: "var(--neural-violet)" }}>
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}

          {result.explication && (
            <p className="text-dim-star text-sm leading-relaxed p-3 glass-card rounded-xl border border-white/5">
              {result.explication}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
