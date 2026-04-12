import { useState, useEffect } from "react";

const API_URL = "https://web-production-cba0c.up.railway.app";

const REACTIONS = [
  { type: "fire", emoji: "🔥", label: "Excellent" },
  { type: "heart", emoji: "❤️", label: "J'adore" },
  { type: "clap", emoji: "👏", label: "Bravo" },
  { type: "think", emoji: "🤔", label: "Instructif" },
];

export default function Reactions({ slug }) {
  const [reactions, setReactions] = useState({ fire: 0, heart: 0, clap: 0, think: 0 });
  const [voted, setVoted] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`voted_${slug}`) || "{}"); } catch { return {}; }
  });
  const [animate, setAnimate] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/blog/${slug}`)
      .then(r => r.json())
      .then(d => { if (d.reactions) setReactions(d.reactions); })
      .catch(() => {});
  }, [slug]);

  const total = Object.values(reactions).reduce((a, b) => a + b, 0);

  const react = async (type) => {
    if (voted[type]) return;
    setAnimate(type);
    setTimeout(() => setAnimate(null), 600);
    const newReactions = { ...reactions, [type]: (reactions[type] || 0) + 1 };
    setReactions(newReactions);
    const newVoted = { ...voted, [type]: true };
    setVoted(newVoted);
    localStorage.setItem(`voted_${slug}`, JSON.stringify(newVoted));
    try {
      await fetch(`${API_URL}/api/blog/${slug}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reaction: type }),
      });
    } catch {}
  };

  return (
    <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
        <p className="font-mono text-xs text-dim-star tracking-widest">RÉACTIONS</p>
        <p className="font-mono text-xs text-neural-blue">{total} réaction{total !== 1 ? "s" : ""}</p>
      </div>
      <div className="p-6">
        <p className="text-dim-star text-xs text-center font-mono mb-5">Cet article vous a plu ?</p>
        <div className="grid grid-cols-4 gap-3">
          {REACTIONS.map(({ type, emoji, label }) => {
            const count = reactions[type] || 0;
            const isVoted = voted[type];
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <button key={type} onClick={() => react(type)} disabled={isVoted}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl transition-all duration-300 group"
                style={{
                  background: isVoted ? "rgba(0,212,255,0.08)" : "rgba(255,255,255,0.02)",
                  border: `1px solid ${isVoted ? "rgba(0,212,255,0.3)" : "rgba(255,255,255,0.07)"}`,
                  transform: animate === type ? "scale(1.15)" : "scale(1)",
                  cursor: isVoted ? "default" : "pointer"
                }}>
                <span style={{ fontSize: "28px" }} className="transition-all duration-200 group-hover:scale-110">
                  {emoji}
                </span>
                <span className="font-display font-black text-lg" style={{ color: isVoted ? "#00D4FF" : "#F0F4FF" }}>
                  {count}
                </span>
                <span className="font-mono text-xs text-dim-star text-center leading-tight">{label}</span>
                {total > 0 && (
                  <div className="w-full rounded-full h-1" style={{ background: "rgba(255,255,255,0.05)" }}>
                    <div className="h-1 rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: isVoted ? "#00D4FF" : "rgba(255,255,255,0.2)" }}/>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
