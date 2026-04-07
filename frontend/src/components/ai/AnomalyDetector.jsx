import { useState } from "react";
import { AlertTriangle, Loader2, CheckCircle } from "lucide-react";

const API_URL = "https://web-production-cba0c.up.railway.app";

const EXAMPLES = [
  { label: "Avec anomalies", data: [10, 12, 11, 13, 12, 95, 11, 13, 12, 10, 11, 200] },
  { label: "Normal", data: [20, 22, 21, 23, 22, 24, 21, 23, 22, 20, 23, 21] },
];

export default function AnomalyDetector() {
  const [dataStr, setDataStr] = useState("10, 12, 11, 13, 12, 95, 11, 13, 12, 10, 11, 200");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const detect = async () => {
    const data = dataStr.split(",").map(n => parseFloat(n.trim())).filter(n => !isNaN(n));
    if (data.length < 3) { setError("Entrez au moins 3 valeurs"); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch(`${API_URL}/api/ai/ml/anomalies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      });
      const d = await res.json();
      if (d.error) setError(d.error);
      else setResult({ ...d, originalData: data });
    } catch { setError("Erreur de connexion"); }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {EXAMPLES.map((ex, i) => (
          <button key={i} onClick={() => setDataStr(ex.data.join(", "))}
            className="text-xs font-mono px-3 py-1.5 rounded-full transition-all"
            style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.3)", color: "var(--neural-blue)" }}>
            {ex.label}
          </button>
        ))}
      </div>

      <input value={dataStr} onChange={e => setDataStr(e.target.value)}
        placeholder="10, 12, 95, 11, 200..."
        className="ai-input w-full px-4 py-3 rounded-xl text-sm"/>

      <button onClick={detect} disabled={loading}
        className="ai-btn w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm">
        {loading ? <Loader2 size={14} className="animate-spin"/> : <AlertTriangle size={14}/>}
        {loading ? "Détection en cours..." : "Détecter les anomalies"}
      </button>

      {error && <p className="text-neural-pink text-xs font-mono">⚠ {error}</p>}

      {result && (
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-4 glass-card rounded-xl border border-white/5">
            {result.anomalies?.length > 0
              ? <AlertTriangle size={28} className="text-neural-pink flex-shrink-0"/>
              : <CheckCircle size={28} className="text-neural-green flex-shrink-0"/>}
            <div>
              <p className="font-display font-bold text-star-white">
                {result.anomalies?.length > 0 ? `${result.anomalies.length} anomalie(s) détectée(s)` : "Aucune anomalie"}
              </p>
              <p className="text-dim-star text-xs font-mono">Score: {result.score_anomalie}%</p>
            </div>
          </div>

          {result.statistiques && (
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "Moyenne", val: Math.round(result.statistiques.moyenne * 10) / 10 },
                { label: "Écart-type", val: Math.round(result.statistiques.ecart_type * 10) / 10 },
                { label: "Min", val: result.statistiques.min },
                { label: "Max", val: result.statistiques.max },
              ].map((s, i) => (
                <div key={i} className="p-2 glass-card rounded-lg border border-white/5 text-center">
                  <p className="text-neural-blue font-bold text-sm">{s.val}</p>
                  <p className="text-dim-star text-xs font-mono">{s.label}</p>
                </div>
              ))}
            </div>
          )}

          {result.anomalies?.map((a, i) => (
            <div key={i} className="p-3 rounded-xl flex items-center gap-3"
              style={{ background: "rgba(255,47,187,0.08)", border: "1px solid rgba(255,47,187,0.3)" }}>
              <AlertTriangle size={14} className="text-neural-pink flex-shrink-0"/>
              <div>
                <p className="text-neural-pink text-xs font-mono font-bold">Index {a.index} — Valeur: {a.valeur}</p>
                <p className="text-dim-star text-xs">{a.raison}</p>
              </div>
            </div>
          ))}

          {result.recommandation && (
            <p className="text-dim-star text-sm leading-relaxed p-3 glass-card rounded-xl border border-white/5">
              💡 {result.recommandation}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
