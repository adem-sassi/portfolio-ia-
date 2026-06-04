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
  const techs = content?.techs || [
    { label: "Python", bg: "#3776AB" }, { label: "PyTorch", bg: "#EE4C2C" },
    { label: "React", bg: "#61DAFB" }, { label: "Docker", bg: "#2496ED" },
    { label: "AWS", bg: "#FF9900" }, { label: "Git", bg: "#F05032" },
  ];

  const colorMap = {
    "neural-blue":   { var: "var(--neural-blue)",   hex: "#00D4FF" },
    "neural-violet": { var: "var(--neural-violet)", hex: "#7B2FFF" },
    "neural-pink":   { var: "var(--neural-pink)",   hex: "#FF2FBB" },
    "neural-green":  { var: "var(--neural-green)",  hex: "#00FF88" },
  };

  return (
    <section id="skills" className="relative py-32 px-6" ref={ref}>
      {/* Blobs */}
      <div className="blob absolute w-[500px] h-[500px] opacity-5 pointer-events-none"
        style={{ background: "var(--neural-violet)", top: "10%", right: "-15%" }} />
      <div className="blob absolute w-[300px] h-[300px] opacity-4 pointer-events-none"
        style={{ background: "var(--neural-blue)", bottom: "20%", left: "-8%" }} />

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

        {/* Skill Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-24">
          {skills.map((cat, ci) => {
            const c = colorMap[cat.color] || colorMap["neural-blue"];
            return (
              <div
                key={ci}
                className="relative rounded-2xl p-6 overflow-hidden group cursor-default"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: `1px solid rgba(255,255,255,0.06)`,
                  backdropFilter: "blur(12px)",
                  opacity: animate ? 1 : 0,
                  transform: animate ? "none" : "translateY(40px)",
                  transition: `opacity 0.7s ease ${ci * 0.15}s, transform 0.7s ease ${ci * 0.15}s`,
                  boxShadow: `0 0 0 1px rgba(255,255,255,0.03) inset`,
                }}
              >
                {/* Glow top border */}
                <div className="absolute top-0 left-6 right-6 h-px rounded-full"
                  style={{ background: `linear-gradient(90deg, transparent, ${c.hex}80, transparent)` }} />

                {/* Glow corner */}
                <div className="absolute top-0 right-0 w-32 h-32 opacity-0 group-hover:opacity-100 pointer-events-none rounded-2xl"
                  style={{
                    background: `radial-gradient(circle at top right, ${c.hex}18, transparent 70%)`,
                    transition: "opacity 0.4s ease"
                  }} />

                {/* Category header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: `${c.hex}18`, border: `1px solid ${c.hex}40` }}>
                    <div className="w-2 h-2 rounded-full"
                      style={{ background: c.var, boxShadow: `0 0 8px ${c.hex}` }} />
                  </div>
                  <h3 className="font-mono text-xs tracking-widest uppercase"
                    style={{ color: c.var }}>{cat.category}</h3>
                </div>

                {/* Skills list */}
                <div className="space-y-1">
                  {(cat.items || []).map((skill, si) => (
                    <div
                      key={skill.name}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl group/item"
                      style={{
                        opacity: animate ? 1 : 0,
                        transition: `opacity 0.5s ease ${ci * 0.15 + si * 0.06}s`,
                      }}
                    >
                      <div className="w-1 h-1 rounded-full flex-shrink-0"
                        style={{ background: c.hex, boxShadow: `0 0 4px ${c.hex}` }} />
                      <span className="text-sm font-medium"
                        style={{ color: "#E8F0FF" }}>{skill.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Tech Badges */}
        <div className="text-center">
          <div className="flex items-center gap-4 justify-center mb-8">
            <div className="h-px w-16" style={{ background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.3))" }} />
            <p className="font-mono text-xs tracking-widest" style={{ color: "#a8b8dc" }}>TECHNOLOGIES UTILISÉES</p>
            <div className="h-px w-16" style={{ background: "linear-gradient(90deg, rgba(0,212,255,0.3), transparent)" }} />
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {techs.map((t, i) => (
              <div
                key={i}
                className="group relative flex items-center gap-2 px-4 py-2.5 rounded-xl cursor-default"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  backdropFilter: "blur(8px)",
                  transition: "all 0.3s ease",
                  opacity: animate ? 1 : 0,
                  animationDelay: `${i * 0.04}s`,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = `${t.bg}18`;
                  e.currentTarget.style.borderColor = `${t.bg}60`;
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = `0 4px 20px ${t.bg}25`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {t.icon ? (
                  <img src={t.icon} alt={t.label} className="w-4 h-4 object-contain rounded" />
                ) : (
                  <div className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: t.bg, boxShadow: `0 0 6px ${t.bg}` }} />
                )}
                <span className="font-mono text-xs font-medium" style={{ color: "#E8F0FF" }}>{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
