import { useEffect, useRef, useState } from "react";
import { useContent } from "../hooks/useContent";

export default function Skills() {
  const { content } = useContent();
  const ref = useRef(null);
  const [animate, setAnimate] = useState(false);

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
    "neural-blue":   { var: "var(--neural-blue)",   hex: "#00D4FF" },
    "neural-violet": { var: "var(--neural-violet)", hex: "#7B2FFF" },
    "neural-pink":   { var: "var(--neural-pink)",   hex: "#FF2FBB" },
    "neural-green":  { var: "var(--neural-green)",  hex: "#00FF88" },
  };

  const icons = {
    "langages": "⟨/⟩", "frameworks": "◈", "iot": "⬡",
    "ia": "◎", "devops": "∿", "default": "◆",
  };

  const getCatIcon = (cat) => {
    const key = cat.toLowerCase();
    if (key.includes("lang")) return icons.langages;
    if (key.includes("frame") || key.includes("web")) return icons.frameworks;
    if (key.includes("iot") || key.includes("syst")) return icons.iot;
    if (key.includes("ia") || key.includes("ml") || key.includes("data")) return icons.ia;
    if (key.includes("dev") || key.includes("ops")) return icons.devops;
    return icons.default;
  };

  return (
    <section id="skills" className="relative py-32 px-6" ref={ref}>
      <div className="blob absolute w-[500px] h-[500px] opacity-5 pointer-events-none"
        style={{ background: "var(--neural-violet)", top: "10%", right: "-15%" }} />

      <div className="max-w-6xl mx-auto">
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

        {/* Skill Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-24">
          {skills.map((cat, ci) => {
            const c = colorMap[cat.color] || colorMap["neural-blue"];
            const icon = getCatIcon(cat.category);
            return (
              <div
                key={ci}
                className="relative rounded-2xl overflow-hidden group"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: `1px solid ${c.hex}25`,
                  opacity: animate ? 1 : 0,
                  transform: animate ? "none" : "translateY(40px)",
                  transition: `opacity 0.7s ease ${ci * 0.15}s, transform 0.7s ease ${ci * 0.15}s`,
                }}
              >
                <div className="absolute top-0 left-0 right-0 h-[2px]"
                  style={{ background: `linear-gradient(90deg, transparent, ${c.hex}, transparent)` }} />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none"
                  style={{
                    background: `radial-gradient(ellipse at 50% 0%, ${c.hex}12 0%, transparent 65%)`,
                    transition: "opacity 0.5s ease"
                  }} />

                {/* Header */}
                <div className="relative px-6 pt-6 pb-4"
                  style={{ borderBottom: `1px solid ${c.hex}15` }}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0"
                      style={{
                        background: `${c.hex}15`,
                        border: `1px solid ${c.hex}35`,
                        color: c.hex,
                        textShadow: `0 0 12px ${c.hex}`,
                        fontFamily: "monospace"
                      }}>
                      {icon}
                    </div>
                    <div>
                      <h3 className="font-mono text-xs tracking-widest uppercase font-bold"
                        style={{ color: c.hex }}>{cat.category}</h3>
                      <p className="text-xs mt-0.5" style={{ color: "#a8b8dc80" }}>
                        {(cat.items || []).length} technologies
                      </p>
                    </div>
                  </div>
                </div>

                {/* Skills — grille 2 colonnes */}
                <div className="relative px-6 py-5 grid grid-cols-2 gap-x-4 gap-y-2">
                  {(cat.items || []).map((skill, si) => (
                    <div
                      key={skill.name}
                      className="flex items-center gap-2"
                      style={{
                        opacity: animate ? 1 : 0,
                        transition: `opacity 0.4s ease ${ci * 0.15 + si * 0.05}s`,
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: c.hex, boxShadow: `0 0 5px ${c.hex}` }} />
                      <span className="text-sm text-star-white font-medium truncate">{skill.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Tech Badges */}
        <div>
          <div className="flex items-center gap-4 justify-center mb-10">
            <div className="h-px flex-1 max-w-[80px]"
              style={{ background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.4))" }} />
            <span className="font-mono text-xs tracking-widest" style={{ color: "#a8b8dc" }}>
              TECHNOLOGIES UTILISÉES
            </span>
            <div className="h-px flex-1 max-w-[80px]"
              style={{ background: "linear-gradient(90deg, rgba(0,212,255,0.4), transparent)" }} />
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
