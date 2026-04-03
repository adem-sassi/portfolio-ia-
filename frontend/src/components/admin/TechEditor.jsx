import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

// Couleurs prédéfinies pour les technologies
const PRESET_COLORS = [
  "#3776AB", "#EE4C2C", "#FF6F00", "#61DAFB", "#2496ED",
  "#FF9900", "#F05032", "#FCC624", "#00D4FF", "#7B2FFF",
  "#FF2FBB", "#00FF88", "#4CAF50", "#9C27B0", "#FF5722",
  "#607D8B", "#795548", "#E91E63", "#3F51B5", "#009688",
];

// Technologies prédéfinies pour ajout rapide
const QUICK_ADD = [
  { label: "Python", bg: "#3776AB" },
  { label: "PyTorch", bg: "#EE4C2C" },
  { label: "TensorFlow", bg: "#FF6F00" },
  { label: "React", bg: "#61DAFB" },
  { label: "Node.js", bg: "#68A063" },
  { label: "Docker", bg: "#2496ED" },
  { label: "AWS", bg: "#FF9900" },
  { label: "Git", bg: "#F05032" },
  { label: "Linux", bg: "#FCC624" },
  { label: "MongoDB", bg: "#4CAF50" },
  { label: "FastAPI", bg: "#009688" },
  { label: "Scikit-learn", bg: "#F7931E" },
  { label: "OpenCV", bg: "#5C3EE8" },
  { label: "Hugging Face", bg: "#FFD21E" },
  { label: "Kubernetes", bg: "#326CE5" },
  { label: "PostgreSQL", bg: "#336791" },
  { label: "Redis", bg: "#DC382D" },
  { label: "TypeScript", bg: "#3178C6" },
];

export default function TechEditor({ techs, onChange }) {
  const [newLabel, setNewLabel] = useState("");
  const [newColor, setNewColor] = useState("#00D4FF");
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  const addTech = (label = newLabel, bg = newColor) => {
    if (!label.trim()) return;
    const already = (techs || []).find(t => t.label.toLowerCase() === label.toLowerCase());
    if (already) return;
    onChange([...(techs || []), { label: label.trim(), bg }]);
    setNewLabel("");
  };

  const deleteTech = (i) => {
    onChange((techs || []).filter((_, idx) => idx !== i));
  };

  const updateColor = (i, bg) => {
    const t = JSON.parse(JSON.stringify(techs));
    t[i].bg = bg;
    onChange(t);
  };

  const updateLabel = (i, label) => {
    const t = JSON.parse(JSON.stringify(techs));
    t[i].label = label;
    onChange(t);
  };

  return (
    <div className="space-y-4">
      {/* Current techs */}
      <div className="space-y-2">
        {(techs || []).map((tech, i) => (
          <div key={i} className="flex items-center gap-3">
            {/* Color picker */}
            <div className="relative">
              <div
                className="w-8 h-8 rounded-lg cursor-pointer border border-white/20 flex-shrink-0"
                style={{ background: tech.bg }}
              />
              <input
                type="color"
                value={tech.bg}
                onChange={e => updateColor(i, e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-8 h-8"
              />
            </div>

            {/* Label */}
            <input
              type="text"
              value={tech.label}
              onChange={e => updateLabel(i, e.target.value)}
              className="ai-input flex-1 px-3 py-2 rounded-lg text-sm"
            />

            {/* Preview */}
            <div
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-xs font-mono"
              style={{ background: `${tech.bg}15`, borderColor: `${tech.bg}30`, color: tech.bg }}
            >
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: tech.bg }} />
              {tech.label}
            </div>

            {/* Delete */}
            <button
              onClick={() => deleteTech(i)}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-neural-pink/50 hover:text-neural-pink hover:bg-neural-pink/10 transition-colors"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>

      {/* Add manually */}
      <div className="flex gap-2">
        <div className="relative flex-shrink-0">
          <div
            className="w-10 h-10 rounded-xl cursor-pointer border border-white/20"
            style={{ background: newColor }}
          />
          <input
            type="color"
            value={newColor}
            onChange={e => setNewColor(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </div>
        <input
          type="text"
          value={newLabel}
          onChange={e => setNewLabel(e.target.value)}
          onKeyDown={e => e.key === "Enter" && addTech()}
          className="ai-input flex-1 px-3 py-2 rounded-xl text-sm"
          placeholder="Nom de la technologie..."
        />
        <button
          onClick={() => addTech()}
          disabled={!newLabel.trim()}
          className="ai-btn px-4 py-2 rounded-xl flex items-center gap-1"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Preset colors */}
      <div>
        <p className="font-mono text-xs text-dim-star tracking-widest mb-2">COULEURS RAPIDES</p>
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map(c => (
            <div
              key={c}
              onClick={() => setNewColor(c)}
              className={`w-6 h-6 rounded-md cursor-pointer border-2 transition-all ${newColor === c ? "border-white scale-110" : "border-transparent"}`}
              style={{ background: c }}
            />
          ))}
        </div>
      </div>

      {/* Quick add presets */}
      <div>
        <button
          onClick={() => setShowQuickAdd(!showQuickAdd)}
          className="font-mono text-xs text-neural-blue tracking-widest hover:opacity-80 transition-opacity"
        >
          {showQuickAdd ? "▲ Masquer" : "▼ Ajout rapide — technologies populaires"}
        </button>
        {showQuickAdd && (
          <div className="flex flex-wrap gap-2 mt-3">
            {QUICK_ADD.filter(q => !(techs || []).find(t => t.label === q.label)).map(q => (
              <button
                key={q.label}
                onClick={() => addTech(q.label, q.bg)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-xs font-mono text-dim-star hover:text-star-white hover:border-white/30 transition-all"
              >
                <div className="w-2 h-2 rounded-full" style={{ background: q.bg }} />
                + {q.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
