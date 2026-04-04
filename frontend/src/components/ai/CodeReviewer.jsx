import { useState } from "react";
import { Loader2, Code2, AlertTriangle, Info, XCircle, CheckCircle } from "lucide-react";

const LANGUAGES = ["python", "javascript", "typescript", "java", "c++", "go", "rust"];

const SAMPLE_CODE = `def train_model(data, labels, epochs=100):
    model = []
    for epoch in range(epochs):
        for x, y in zip(data, labels):
            pred = sum(model) * x
            error = y - pred
            model.append(error * 0.01)
    return model

result = train_model([1,2,3], [2,4,6])
print(result)`;

const SEVERITY_CONFIG = {
  critical: { icon: XCircle, color: "text-neural-pink", bg: "bg-neural-pink/10 border-neural-pink/30" },
  warning: { icon: AlertTriangle, color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/30" },
  info: { icon: Info, color: "text-neural-blue", bg: "bg-neural-blue/10 border-neural-blue/30" },
};

function ScoreMeter({ score }) {
  const color = score >= 75 ? "#00FF88" : score >= 50 ? "#FFD700" : "#FF2FBB";
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="flex flex-col items-center">
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
        <circle
          cx="50" cy="50" r="40" fill="none"
          stroke={color} strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.25,1,0.5,1)", filter: `drop-shadow(0 0 6px ${color})` }}
        />
        <text x="50" y="55" textAnchor="middle" fill={color} fontSize="18" fontFamily="Orbitron" fontWeight="bold">
          {score}
        </text>
      </svg>
      <span className="font-mono text-xs text-dim-star tracking-widest mt-1">QUALITÉ</span>
    </div>
  );
}

export default function CodeReviewer() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const review = async () => {
    if (!code.trim() || loading) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("https://web-production-cba0c.up.railway.app/api/ai/review-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch {
      setError("Erreur lors de la review. Vérifiez la connexion au serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Language Select */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="font-mono text-xs text-dim-star tracking-widest">LANGAGE :</span>
        {LANGUAGES.map((l) => (
          <button
            key={l}
            onClick={() => setLanguage(l)}
            className={`text-xs font-mono px-3 py-1.5 rounded-full border transition-all ${
              language === l
                ? "border-neural-blue text-neural-blue bg-neural-blue/10"
                : "border-white/10 text-dim-star hover:border-white/30"
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Code Textarea */}
      <div className="relative">
        <label className="font-mono text-xs text-dim-star tracking-widest mb-2 block">CODE À REVIEWER</label>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Collez votre code ici..."
          className="ai-input w-full px-4 py-3 rounded-xl text-sm font-mono resize-none h-36"
        />
        <button
          onClick={() => setCode(SAMPLE_CODE)}
          className="absolute top-8 right-3 text-xs font-mono text-dim-star hover:text-neural-blue transition-colors"
        >
          Exemple ↓
        </button>
      </div>

      {/* Button */}
      <button
        onClick={review}
        disabled={!code.trim() || loading}
        className="ai-btn px-6 py-3 rounded-xl flex items-center gap-2"
      >
        {loading ? <Loader2 size={15} className="animate-spin" /> : <Code2 size={15} />}
        {loading ? "Analyse du code..." : "Lancer la Review IA"}
      </button>

      {/* Error */}
      {error && (
        <div className="text-neural-pink text-sm font-mono bg-neural-pink/10 border border-neural-pink/30 rounded-xl px-4 py-3">
          ⚠ {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4 animate-[fadeIn_0.4s_ease]">
          {/* Score + Summary */}
          <div className="glass-card rounded-xl p-4 border border-white/5 flex gap-6 items-center">
            <ScoreMeter score={result.score} />
            <div className="flex-1">
              <div className="flex gap-3 mb-3">
                <span className="tag-pill">Complexité : {result.complexity}</span>
              </div>
              <p className="text-star-white text-sm leading-relaxed">{result.summary}</p>
            </div>
          </div>

          {/* Issues */}
          {result.issues?.length > 0 && (
            <div>
              <p className="font-mono text-xs text-dim-star tracking-widest mb-3">PROBLÈMES DÉTECTÉS</p>
              <div className="space-y-2">
                {result.issues.map((issue, i) => {
                  const conf = SEVERITY_CONFIG[issue.severity] || SEVERITY_CONFIG.info;
                  const Icon = conf.icon;
                  return (
                    <div key={i} className={`flex gap-3 border rounded-xl px-4 py-3 ${conf.bg}`}>
                      <Icon size={14} className={`${conf.color} flex-shrink-0 mt-0.5`} />
                      <div>
                        {issue.line && <span className="font-mono text-xs text-dim-star mr-2">L.{issue.line}</span>}
                        <span className="text-sm text-star-white">{issue.message}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {result.suggestions?.length > 0 && (
            <div>
              <p className="font-mono text-xs text-dim-star tracking-widest mb-3">SUGGESTIONS D'AMÉLIORATION</p>
              <div className="space-y-2">
                {result.suggestions.map((s, i) => (
                  <div key={i} className="flex gap-3 glass-card border border-neural-green/20 rounded-xl px-4 py-3">
                    <CheckCircle size={14} className="text-neural-green flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-star-white">{s}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }`}</style>
    </div>
  );
}
