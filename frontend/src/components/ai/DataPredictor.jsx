import { useState } from "react";
import { TrendingUp, TrendingDown, Minus, Loader2 } from "lucide-react";

const API_URL = "https://web-production-cba0c.up.railway.app";

const EXAMPLES = [
  { label: "Températures", data: [12, 14, 13, 16, 18, 17, 20, 22, 21, 24], context: "températures journalières en °C" },
  { label: "Ventes", data: [100, 120, 115, 130, 145, 140, 160, 175, 170, 190], context: "ventes mensuelles en unités" },
  { label: "Visites web", data: [500, 620, 580, 700, 750, 720, 800, 850, 900, 880], context: "visites quotidiennes sur un site web" },
];

export default function DataPredictor() {
  const [dataStr, setDataStr] = useState("12, 14, 13, 16, 18, 17, 20, 22, 21, 24");
  const [context, setContext] = useState("températures journalières en °C");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const predict = async () => {
    const data = dataStr.split(",").map(n => parseFloat(n.trim())).filter(n => !isNaN(n));
    if (data.length < 3) { setError("Entrez au moins 3 valeurs"); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch(`${API_URL}/api/ai/ml/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data, context }),
      });
      const d = await res.json();
      if (d.error) setError(d.error);
      else setResult({ ...d, originalData: data });
    } catch { setError("Erreur de connexion"); }
    setLoading(false);
  };

  const TrendIcon = result?.tendance === "hausse" ? TrendingUp : result?.tendance === "baisse" ? TrendingDown : Minus;
  const trendColor = result?.tendance === "hausse" ? "#00FF88" : result?.tendance === "baisse" ? "#FF2FBB" : "#00D4FF";

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {EXAMPLES.map((ex, i) => (
          <button key={i} onClick={() => { setDataStr(ex.data.join(", ")); setContext(ex.context); }}
            className="text-xs font-mono px-3 py-1.5 rounded-full transition-all"
            style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.3)", color: "var(--neural-blue)" }}>
            {ex.label}
          </button>
        ))}
      </div>

      <input value={dataStr} onChange={e => setDataStr(e.target.value)}
        placeholder="10, 15, 12, 18, 20..."
        className="ai-input w-full px-4 py-3 rounded-xl text-sm"/>

      <input value={context} onChange={e => setContext(e.target.value)}
        placeholder="Contexte des données..."
        className="ai-input w-full px-4 py-3 rounded-xl text-sm"/>

      <button onClick={predict} disabled={loading}
        className="ai-btn w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm">
        {loading ? <Loader2 size={14} className="animate-spin"/> : <TrendingUp size={14}/>}
        {loading ? "Prédiction en cours..." : "Prédire"}
      </button>

      {error && <p className="text-neural-pink text-xs font-mono">⚠ {error}</p>}

      {result && (
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-4 glass-card rounded-xl border border-white/5">
            <TrendIcon size={32} style={{ color: trendColor }}/>
            <div>
              <p className="font-display font-bold text-star-white capitalize">Tendance: {result.tendance}</p>
              <p className="text-dim-star text-xs font-mono">Confiance: {result.confiance}%</p>
            </div>
          </div>

          {result.predictions?.length > 0 && (
            <div className="p-4 glass-card rounded-xl border border-white/5">
              <p className="text-dim-star text-xs font-mono mb-3">PROCHAINES VALEURS PRÉDITES</p>
              <div className="flex gap-3">
                {result.predictions.map((v, i) => (
                  <div key={i} className="flex-1 text-center p-2 rounded-lg"
                    style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.2)" }}>
                    <p className="text-neural-blue font-display font-bold text-lg">{v}</p>
                    <p className="text-dim-star text-xs font-mono">+{i + 1}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

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
