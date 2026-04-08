import { useState, useEffect, useRef } from "react";

const API_URL = "https://web-production-cba0c.up.railway.app";

export default function TimelineD3() {
  const [timeline, setTimeline] = useState([]);
  const [visible, setVisible] = useState([]);
  const ref = useRef(null);

  useEffect(() => {
    fetch(`${API_URL}/api/content`)
      .then(r => r.json())
      .then(d => setTimeline(d.about?.timeline || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!timeline.length) return;
    timeline.forEach((_, i) => {
      setTimeout(() => setVisible(prev => [...prev, i]), i * 200);
    });
  }, [timeline]);

  const colors = ["#00D4FF", "#7B2FFF", "#FF2FBB", "#00FF88", "#FFD700", "#FF8C00"];

  return (
    <div ref={ref} className="glass-card rounded-2xl p-6 border border-white/5">
      <p className="font-mono text-xs text-neural-green tracking-widest mb-6">TIMELINE — PARCOURS</p>
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-neural-blue via-neural-violet to-neural-pink"/>
        <div className="space-y-6 ml-10">
          {timeline.map((item, i) => (
            <div key={i} className="relative transition-all duration-500"
              style={{ opacity: visible.includes(i) ? 1 : 0, transform: visible.includes(i) ? "none" : "translateX(-20px)" }}>
              <div className="absolute -left-10 top-1.5 w-4 h-4 rounded-full border-2 border-void flex items-center justify-center"
                style={{ background: colors[i % colors.length] }}>
                <div className="w-1.5 h-1.5 rounded-full bg-void"/>
              </div>
              <div className="glass-card rounded-xl p-4 border border-white/5 hover:border-neural-blue/20 transition-colors">
                <p className="font-mono text-xs mb-1" style={{ color: colors[i % colors.length] }}>{item.year}</p>
                <p className="font-display font-bold text-star-white text-sm">{item.title}</p>
                <p className="text-neural-blue text-xs font-mono">{item.place}</p>
                {item.desc && <p className="text-dim-star text-xs mt-2 leading-relaxed">{item.desc}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
