import { useEffect, useRef, useState } from "react";
import { useContent } from "../hooks/useContent";

function SkillBar({ name, level, color, animate }) {
  const colorMap = {
    "neural-blue": "var(--neural-blue)",
    "neural-violet": "var(--neural-violet)",
    "neural-pink": "var(--neural-pink)",
    "neural-green": "var(--neural-green)"
  };
  const c = colorMap[color] || "var(--neural-blue)";
  return (
    <div className="mb-5">
      <div className="flex justify-between mb-2">
        <span className="text-sm text-star-white font-medium">{name}</span>
        <span className="text-xs font-mono" style={{ color: c }}>{level}%</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div className="skill-bar-fill" style={{
          width: animate ? `${level}%` : "0%",
          background: `linear-gradient(90deg, ${c}, rgba(255,255,255,0.3))`
        }}/>
      </div>
    </div>
  );
}

export default function Skills() {
  const { content } = useContent();
  const ref = useRef(null);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setAnimate(true); obs.disconnect(); }
    }, { threshold: 0.2 });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const skills = content?.skills || [];
  // Utilise les techs depuis MongoDB, ou fallback
  const techs = content?.techs || [
    { label: "Python", bg: "#3776AB" }, { label: "PyTorch", bg: "#EE4C2C" },
    { label: "React", bg: "#61DAFB" }, { label: "Docker", bg: "#2496ED" },
    { label: "AWS", bg: "#FF9900" }, { label: "Git", bg: "#F05032" },
  ];

  return (
    <section id="skills" className="relative py-32 px-6" ref={ref}>
      <div className="blob absolute w-[400px] h-[400px] opacity-5 pointer-events-none"
        style={{ background: "var(--neural-violet)", top: "20%", right: "-10%" }}/>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-px flex-1 max-w-[60px] bg-neural-blue/40"/>
          <span className="font-mono text-xs text-neural-blue tracking-widest">02 / COMPÉTENCES</span>
        </div>
        <h2 className="font-display text-4xl md:text-5xl font-black text-star-white mb-4 leading-tight">
          Mon <span className="gradient-text">arsenal technique</span>
        </h2>
        <p className="text-dim-star mb-16 max-w-xl leading-relaxed">
          Des outils maîtrisés à travers des projets académiques, des stages et une veille constante.
        </p>

        {/* Skill Categories */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {skills.map((cat, ci) => (
            <div key={ci} className="glass-card rounded-2xl p-6 neural-glow-hover"
              style={{ opacity: animate?1:0, transform: animate?"none":"translateY(30px)", transition: `all 0.6s ease ${ci*0.15}s` }}>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-2 rounded-full" style={{ background: `var(--${cat.color})`, boxShadow: `0 0 8px var(--${cat.color})` }}/>
                <h3 className="font-display text-xs tracking-widest text-dim-star uppercase">{cat.category}</h3>
              </div>
              {(cat.items || []).map(skill => (
                <SkillBar key={skill.name} {...skill} color={cat.color} animate={animate}/>
              ))}
            </div>
          ))}
        </div>

        {/* Tech Badges — depuis MongoDB */}
        <div className="text-center">
          <p className="font-mono text-xs text-dim-star tracking-widest mb-6">TECHNOLOGIES UTILISÉES</p>
          <div className="flex flex-wrap justify-center gap-3">
            {techs.map((t, i) => (
              <div key={i} className="glass-card border border-white/5 rounded-xl px-4 py-3 flex items-center gap-2 neural-glow-hover cursor-default">
                {/* Icône image si disponible, sinon point coloré */}
                {t.icon ? (
                  <img src={t.icon} alt={t.label} className="w-5 h-5 object-contain rounded"/>
                ) : (
                  <div className="w-2 h-2 rounded-full" style={{ background: t.bg, boxShadow: `0 0 6px ${t.bg}` }}/>
                )}
                <span className="font-mono text-xs text-star-white">{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-6 mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
    </div>
  </section>
  );
}
