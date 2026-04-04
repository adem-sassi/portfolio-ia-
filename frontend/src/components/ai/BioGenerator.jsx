import { useState } from "react";
import { Loader2, User, Copy, Check, Sparkles } from "lucide-react";

const STYLE_OPTIONS = ["professionnel et inspirant", "créatif et audacieux", "académique et rigoureux", "concis et percutant"];
const SKILLS_OPTIONS = ["Machine Learning", "Deep Learning", "NLP", "Computer Vision", "MLOps", "Reinforcement Learning", "PyTorch", "Transformers", "LLMs", "Data Science"];
const INTERESTS_OPTIONS = ["Recherche IA", "IA générative", "Robotique", "IA éthique", "Edge AI", "Open Source"];

export default function BioGenerator() {
  const [name, setName] = useState("");
  const [selectedSkills, setSelectedSkills] = useState(["Machine Learning", "Deep Learning", "NLP"]);
  const [selectedInterests, setSelectedInterests] = useState(["Recherche IA", "IA générative"]);
  const [style, setStyle] = useState(STYLE_OPTIONS[0]);
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const toggle = (arr, setArr, val) => {
    setArr(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);
  };

  const generate = async () => {
    setLoading(true);
    setBio("");
    try {
      const res = await fetch("https://web-production-cba0c.up.railway.app/api/ai/generate-bio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, skills: selectedSkills, interests: selectedInterests, style }),
      });
      const data = await res.json();
      setBio(data.bio || data.error);
    } catch {
      setBio("❌ Erreur de connexion au serveur.");
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(bio);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5">
      {/* Name */}
      <div>
        <label className="font-mono text-xs text-dim-star tracking-widest mb-2 block">VOTRE NOM</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Jean Dupont"
          className="ai-input w-full px-4 py-3 rounded-xl text-sm"
        />
      </div>

      {/* Skills */}
      <div>
        <label className="font-mono text-xs text-dim-star tracking-widest mb-2 block">
          COMPÉTENCES <span className="text-neural-blue">({selectedSkills.length} sélectionnées)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {SKILLS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => toggle(selectedSkills, setSelectedSkills, s)}
              className={`text-xs font-mono px-3 py-1.5 rounded-full border transition-all ${
                selectedSkills.includes(s)
                  ? "border-neural-blue bg-neural-blue/15 text-neural-blue"
                  : "border-white/10 text-dim-star hover:border-white/30"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Interests */}
      <div>
        <label className="font-mono text-xs text-dim-star tracking-widest mb-2 block">CENTRES D'INTÉRÊT</label>
        <div className="flex flex-wrap gap-2">
          {INTERESTS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => toggle(selectedInterests, setSelectedInterests, s)}
              className={`text-xs font-mono px-3 py-1.5 rounded-full border transition-all ${
                selectedInterests.includes(s)
                  ? "border-neural-violet bg-neural-violet/15 text-neural-violet"
                  : "border-white/10 text-dim-star hover:border-white/30"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Style */}
      <div>
        <label className="font-mono text-xs text-dim-star tracking-widest mb-2 block">STYLE D'ÉCRITURE</label>
        <div className="flex flex-wrap gap-2">
          {STYLE_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setStyle(s)}
              className={`text-xs font-mono px-3 py-1.5 rounded-full border transition-all ${
                style === s
                  ? "border-neural-pink bg-neural-pink/15 text-neural-pink"
                  : "border-white/10 text-dim-star hover:border-white/30"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={generate}
        disabled={loading}
        className="ai-btn px-6 py-3 rounded-xl flex items-center gap-2"
      >
        {loading ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
        {loading ? "Génération en cours..." : "Générer ma Bio IA"}
      </button>

      {/* Result */}
      {bio && (
        <div className="relative glass-card border border-neural-blue/20 rounded-xl p-5 animate-[fadeIn_0.4s_ease]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <User size={14} className="text-neural-blue" />
              <span className="font-mono text-xs text-dim-star tracking-widest">BIO GÉNÉRÉE PAR IA</span>
            </div>
            <button
              onClick={copy}
              className="flex items-center gap-1.5 text-xs font-mono text-dim-star hover:text-neural-blue transition-colors"
            >
              {copied ? <Check size={12} className="text-neural-green" /> : <Copy size={12} />}
              {copied ? "Copié !" : "Copier"}
            </button>
          </div>
          <p className="text-star-white text-sm leading-relaxed whitespace-pre-line">{bio}</p>
        </div>
      )}

      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }`}</style>
    </div>
  );
}
