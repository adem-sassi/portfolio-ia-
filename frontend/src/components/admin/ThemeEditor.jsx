import { useState } from "react";
import { Palette, Save, Loader2, RotateCcw } from "lucide-react";

const API_URL = "https://web-production-cba0c.up.railway.app";

const DEFAULT_COLORS = {
  neuralBlue: "#00D4FF",
  neuralViolet: "#7B2FFF",
  neuralPink: "#FF2FBB",
  neuralGreen: "#00FF88",
  starWhite: "#F0F4FF",
  void: "#020408",
};

const LABELS = {
  neuralBlue: "Couleur Bleue (principal)",
  neuralViolet: "Couleur Violette",
  neuralPink: "Couleur Rose",
  neuralGreen: "Couleur Verte",
  starWhite: "Couleur du texte",
  void: "Couleur du fond",
};

export default function ThemeEditor({ token, initialTheme }) {
  const [colors, setColors] = useState(initialTheme || DEFAULT_COLORS);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await fetch(`${API_URL}/api/admin/content/theme`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(colors),
      });

      // Appliquer les couleurs en temps réel
      applyColors(colors);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const applyColors = (c) => {
    const root = document.documentElement;
    root.style.setProperty("--neural-blue", c.neuralBlue);
    root.style.setProperty("--neural-violet", c.neuralViolet);
    root.style.setProperty("--neural-pink", c.neuralPink);
    root.style.setProperty("--neural-green", c.neuralGreen);
    root.style.setProperty("--star-white", c.starWhite);
    root.style.setProperty("--void", c.void);
  };

  const reset = () => {
    setColors(DEFAULT_COLORS);
    applyColors(DEFAULT_COLORS);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3">
        {Object.entries(colors).map(([key, value]) => (
          <div key={key} className="flex items-center gap-4 p-3 glass-card rounded-xl border border-white/5">
            <input
              type="color"
              value={value}
              onChange={e => {
                const newColors = { ...colors, [key]: e.target.value };
                setColors(newColors);
                applyColors(newColors);
              }}
              className="w-12 h-12 rounded-lg cursor-pointer border-0 bg-transparent"
            />
            <div className="flex-1">
              <p className="text-sm text-star-white font-mono">{LABELS[key]}</p>
              <p className="text-xs text-dim-star font-mono">{value}</p>
            </div>
            <div className="w-8 h-8 rounded-lg border border-white/10"
              style={{ background: value }}/>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button onClick={reset}
          className="flex items-center gap-2 px-4 py-2 glass-card border border-white/10 rounded-xl text-sm text-dim-star hover:text-star-white transition-colors">
          <RotateCcw size={14}/> Reset
        </button>
        <button onClick={save} disabled={saving}
          className="flex-1 ai-btn py-3 rounded-xl flex items-center justify-center gap-2 text-sm">
          {saving ? <Loader2 size={14} className="animate-spin"/> : <Save size={14}/>}
          {saved ? "✅ Sauvegardé !" : "Sauvegarder le thème"}
        </button>
      </div>
    </div>
  );
}
