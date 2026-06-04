import { useEffect, useRef, useState } from "react";
import { useContent } from "../hooks/useContent";

export default function Skills() {
  const { content } = useContent();
  const ref = useRef(null);
  const [animate, setAnimate] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setAnimate(true); obs.disconnect(); }
    }, { threshold: 0.2 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const skills = content?.skills || [];
  const techs = content?.techs || [];

  const colorMap = {
    "neural-blue":   "#00D4FF",
    "neural-violet": "#7B2FFF",
    "neural-pink":   "#FF2FBB",
    "neural-green":  "#00FF88",
  };

  const activeColor = skills[activeTab] ? (colorMap[skills[activeTab].color] || "#00D4FF") : "#00D4FF";

  return (
    <section id="skills" className="relative py-32 px-6" ref={ref}>
      <div className="blob absolute w-[600px] h-[600px] opacity-4 pointer-events-none"
        style={{ background: "var(--neural-violet)", top: "0%", right: "-20%" }} />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <div className="h-px flex-1 max-w-[60px] bg-neural-blue/40" />
          <span className="font-mono text-xs text-neural-blue tracking-widest">02 / COMPÉTENCES</span>
        </div>
        <h2 className="font-display text-4xl md:text-5xl font-black text-star-white mb-4 leading-tight">
          Mon <span className="gradient-text">arsenal technique</span>
        </h2>
        <p className="text-dim-star mb-16 max-w-xl leading-relaxed">
          Des outils maîtrisés à travers des projets académiques, des stages et une veille constante.
        </p>

        {/* Tab selector */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {skills.map((cat, ci) => {
            const c = colorMap[cat.color] || "#00D4FF";
            const isActive = activeTab === ci;
            return (
              <button
                key={ci}
                onClick={() => setActiveTab(ci)}
                className="relative px-5 py-2.5 rounded-full font-mono text-xs tracking-wider transition-all duration-300"
                style={{
                  background: isActive ? `${c}20` : "rgba(255,255,255,0.03)",
                  border: `1px solid ${isActive ? c : "rgba(255,255,255,0.08)"}`,
                  color: isActive ? c : "#a8b8dc",
                  boxShadow: isActive ? `0 0 20px ${c}30` : "none",
                }}
              >
                {cat.category}
              </button>
            );
          })}
        </div>

        {/* Active category panel */}
        {skills[activeTab] && (
          <div
            className="relative rounded-3xl p-8 mb-24 overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: `1px solid ${activeColor}20`,
              opacity: animate ? 1 : 0,
              transition: "opacity 0.6s ease",
            }}
          >
            {/* Corner glow */}
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full pointer-events-none"
              style={{ background: `radial-gradient(circle, ${activeColor}15, transparent 70%)` }} />
            <div className="absolute top-0 left-0 right-0 h-px"
              style={{ background: `linear-gradient(90deg, transparent, ${activeColor}80, transparent)` }} />

            {/* Grid of skill items */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 relative z-10">
              {(skills[activeTab].items || []).map((skill, si) => (
                <div
                  key={skill.name}
                  className="group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 cursor-default"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    opacity: animate ? 1 : 0,
                    transform: animate ? "none" : "translateY(10px)",
                    transition: `opacity 0.4s ease ${si * 0.05}s, transform 0.4s ease ${si * 0.05}s, background 0.3s, border-color 0.3s`,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = `${activeColor}12`;
                    e.currentTarget.style.borderColor = `${activeColor}40`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                  }}
                >
                  <div className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: activeColor, boxShadow: `0 0 6px ${activeColor}` }} />
                  <span className="text-sm font-medium text-star-white">{skill.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tech Badges */}
        <div>
          <div className="flex items-center gap-4 justify-center mb-10">
            <div className="h-px flex-1 max-w-[100px]"
              style={{ background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.3))" }} />
            <span className="font-mono text-xs tracking-widest text-dim-star">TECHNOLOGIES UTILISÉES</span>
            <div className="h-px flex-1 max-w-[100px]"
              style={{ background: "linear-gradient(90deg, rgba(0,212,255,0.3), transparent)" }} />
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {techs.map((t, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl cursor-default"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  opacity: animate ? 1 : 0,
                  transition: `opacity 0.4s ease ${i * 0.03}s, background 0.3s, border-color 0.3s, transform 0.3s, box-shadow 0.3s`,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = `${t.bg}22`;
                  e.currentTarget.style.borderColor = `${t.bg}60`;
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow = `0 8px 24px ${t.bg}35`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {t.icon
                  ? <img src={t.icon} alt={t.label} className="w-4 h-4 object-contain rounded" />
                  : <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ background: t.bg, boxShadow: `0 0 8px ${t.bg}` }} />
                }
                <span className="font-mono text-xs font-semibold text-star-white">{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
