import { useState } from "react";
import { Layers, Loader2, Plus, X } from "lucide-react";

const API_URL = "https://web-production-cba0c.up.railway.app";

const EXAMPLE_TEXTS = [
  "J'adore la programmation Python",
  "Le machine learning est fascinant",
  "Le football est mon sport préféré",
  "React est un excellent framework",
  "Messi est le meilleur joueur",
  "Les réseaux de neurones sont puissants",
  "Le tennis est un sport élégant",
  "JavaScript est partout sur le web",
];

const CLUSTER_COLORS = ["#00D4FF", "#7B2FFF", "#FF2FBB", "#00FF88", "#FFB800"];

export default function TextCluster() {
  const [texts, setTexts] = useState(EXAMPLE_TEXTS);
  const [newText, setNewText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const cluster = async () => {
    if (texts.length < 2) { setError("Entrez au moins 2 textes"); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch(`${API_URL}/api/ai/ml/cluster`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texts }),
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else setResult(data);
    } catch { setError("Erreur de connexion"); }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {texts.map((t, i) => (
          <div key={i} className="flex items-center gap-2 p-2 glass-card rounded-lg border border-white/5">
            <p className="flex-1 text-sm text-dim-star truncate">{t}</p>
            <button onClick={() => setTexts(texts.filter((_, j) => j !== i))}
              className="text-neural-pink hover:opacity-80">
              <X size={12}/>
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input value={newText} onChange={e => setNewText(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && newText.trim()) { setTexts([...texts, newText.trim()]); setNewText(""); }}}
          placeholder="Ajouter un texte..."
          className="ai-input flex-1 px-3 py-2 rounded-lg text-sm"/>
        <button onClick={() => { if (newText.trim()) { setTexts([...texts, newText.trim()]); setNewText(""); }}}
          className="glass-card border border-neural-blue/30 px-3 py-2 rounded-lg text-neural-blue hover:border-neural-blue/60 transition-colors">
          <Plus size={16}/>
        </button>
      </div>

      <button onClick={cluster} disabled={loading || texts.length < 2}
        className="ai-btn w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm">
        {loading ? <Loader2 size={14} className="animate-spin"/> : <Layers size={14}/>}
        {loading ? "Clustering en cours..." : `Regrouper ${texts.length} textes`}
      </button>

      {error && <p className="text-neural-pink text-xs font-mono">⚠ {error}</p>}

      {result && (
        <div className="space-y-3">
          <p className="text-dim-star text-xs font-mono">{result.nb_clusters} GROUPES IDENTIFIÉS</p>
          {result.clusters?.map((cluster, i) => (
            <div key={i} className="p-4 glass-card rounded-xl border border-white/5"
              style={{ borderLeft: `3px solid ${CLUSTER_COLORS[i % CLUSTER_COLORS.length]}` }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full" style={{ background: CLUSTER_COLORS[i % CLUSTER_COLORS.length] }}/>
                <p className="font-display font-bold text-star-white text-sm">{cluster.theme}</p>
              </div>
              <div className="space-y-1 mb-2">
                {cluster.textes?.map(idx => (
                  <p key={idx} className="text-dim-star text-xs pl-4">• {texts[idx]}</p>
                ))}
              </div>
              <div className="flex flex-wrap gap-1">
                {cluster.mots_cles?.map((m, j) => (
                  <span key={j} className="text-xs font-mono px-2 py-0.5 rounded-full"
                    style={{ background: `${CLUSTER_COLORS[i % CLUSTER_COLORS.length]}15`, border: `1px solid ${CLUSTER_COLORS[i % CLUSTER_COLORS.length]}40`, color: CLUSTER_COLORS[i % CLUSTER_COLORS.length] }}>
                    {m}
                  </span>
                ))}
              </div>
            </div>
          ))}
          {result.analyse && (
            <p className="text-dim-star text-sm leading-relaxed p-3 glass-card rounded-xl border border-white/5">
              {result.analyse}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
