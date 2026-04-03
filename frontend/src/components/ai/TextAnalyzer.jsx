import { useState } from "react";
import { Loader2, Zap, TrendingUp, TrendingDown, Minus } from "lucide-react";

const SENTIMENT_CONFIG = {
  positive: { icon: TrendingUp, color: "text-neural-green", bg: "bg-neural-green/10 border-neural-green/30", label: "Positif" },
  negative: { icon: TrendingDown, color: "text-neural-pink", bg: "bg-neural-pink/10 border-neural-pink/30", label: "Négatif" },
  neutral: { icon: Minus, color: "text-dim-star", bg: "bg-white/5 border-white/10", label: "Neutre" },
  mixed: { icon: Zap, color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/30", label: "Mixte" },
};

const EXAMPLES = [
  "Ce projet d'IA est absolument révolutionnaire ! Les résultats dépassent toutes mes attentes.",
  "Le modèle présente des biais préoccupants et des performances médiocres sur les données réelles.",
  "L'architecture Transformer a été proposée par Vaswani et al. en 2017 dans leur article fondateur.",
];

export default function TextAnalyzer() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analyze = async () => {
    if (!text.trim() || loading) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/ai/analyze-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (e) {
      setError("Erreur lors de l'analyse. Vérifiez la connexion au serveur.");
    } finally {
      setLoading(false);
    }
  };

  const sentConf = result ? SENTIMENT_CONFIG[result.sentiment] || SENTIMENT_CONFIG.neutral : null;
  const SentIcon = sentConf?.icon;
  const scorePercent = result ? Math.round(((result.score + 1) / 2) * 100) : 0;

  return (
    <div className="space-y-5">
      {/* Input */}
      <div>
        <label className="font-mono text-xs text-dim-star tracking-widest mb-2 block">
          TEXTE À ANALYSER
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Entrez un texte pour analyser son sentiment, ses émotions et son ton..."
          className="ai-input w-full px-4 py-3 rounded-xl text-sm resize-none h-28"
        />
      </div>

      {/* Examples */}
      <div>
        <p className="font-mono text-xs text-dim-star tracking-widest mb-2">EXEMPLES RAPIDES</p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex, i) => (
            <button
              key={i}
              onClick={() => setText(ex)}
              className="text-xs font-mono px-3 py-1.5 rounded-full border border-neural-blue/20 text-dim-star hover:text-neural-blue hover:border-neural-blue/50 transition-colors"
            >
              Exemple {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Analyze Button */}
      <button
        onClick={analyze}
        disabled={!text.trim() || loading}
        className="ai-btn px-6 py-3 rounded-xl flex items-center gap-2"
      >
        {loading ? <Loader2 size={15} className="animate-spin" /> : <Zap size={15} />}
        {loading ? "Analyse en cours..." : "Analyser"}
      </button>

      {/* Error */}
      {error && (
        <div className="text-neural-pink text-sm font-mono bg-neural-pink/10 border border-neural-pink/30 rounded-xl px-4 py-3">
          ⚠ {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="grid md:grid-cols-2 gap-4 animate-[fadeIn_0.4s_ease]">
          {/* Sentiment */}
          <div className={`border rounded-xl p-4 ${sentConf?.bg}`}>
            <div className="flex items-center gap-2 mb-2">
              <SentIcon size={14} className={sentConf?.color} />
              <span className={`font-display text-xs tracking-widest ${sentConf?.color}`}>
                SENTIMENT — {sentConf?.label}
              </span>
            </div>
            <div className="flex items-end gap-2">
              <span className={`font-display text-3xl font-black ${sentConf?.color}`}>
                {scorePercent}%
              </span>
              <span className="text-dim-star text-xs mb-1">score de positivité</span>
            </div>
            {/* Score bar */}
            <div className="h-1.5 bg-white/5 rounded-full mt-3 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${scorePercent}%`,
                  background: `linear-gradient(90deg, var(--neural-pink), var(--neural-green))`,
                }}
              />
            </div>
          </div>

          {/* Tone & Emotions */}
          <div className="glass-card rounded-xl p-4 border border-white/5">
            <p className="font-mono text-xs text-dim-star tracking-widest mb-3">TON & ÉMOTIONS</p>
            <div className="mb-3">
              <span className="tag-pill">{result.tone}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {result.emotions?.map((e) => (
                <span key={e} className="text-xs font-mono px-2 py-1 rounded-md bg-neural-violet/10 border border-neural-violet/20 text-neural-violet">
                  {e}
                </span>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="md:col-span-2 glass-card rounded-xl p-4 border border-white/5">
            <p className="font-mono text-xs text-dim-star tracking-widest mb-2">RÉSUMÉ IA</p>
            <p className="text-star-white text-sm leading-relaxed">{result.summary}</p>
          </div>
        </div>
      )}

      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }`}</style>
    </div>
  );
}
