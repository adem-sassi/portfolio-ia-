import { useEffect, useRef, useState } from "react";
import { ExternalLink, Github, Brain, Eye, MessageSquare, TrendingUp, Shield, Cpu } from "lucide-react";
import { useContent } from "../hooks/useContent";
import { useTilt } from "../hooks/useTilt";

const ICON_LIST = [Eye, MessageSquare, TrendingUp, Shield, Brain, Cpu];

function ProjectCard({ project, index }) {
  const revealRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const { ref: tiltRef, onMouseMove, onMouseLeave } = useTilt(6);
  const Icon = ICON_LIST[index % ICON_LIST.length];
  const COLOR_MAP = {
    "neural-blue": "#00D4FF",
    "neural-violet": "#7B2FFF", 
    "neural-pink": "#FF2FBB",
    "neural-green": "#00FF88",
    "neural-orange": "#FF8C00",
    "neural-red": "#FF3B3B",
    "neural-yellow": "#FFD700",
    "neural-cyan": "#00FFFF",
    "neural-white": "#F0F4FF",
    "neural-teal": "#00B4D8",
    "neural-indigo": "#4B0082",
    "neural-lime": "#39FF14",
  };
  const colorName = project.color || "neural-blue";
  const colorHex = COLOR_MAP[colorName] || "#00D4FF";
  const color = colorName;

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => e.isIntersecting && setVisible(true), { threshold: 0.1 });
    obs.observe(revealRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={revealRef} className={project.featured ? "md:col-span-2" : ""}
      style={{ opacity: visible?1:0, transform: visible?"none":"translateY(40px)", transition: `all 0.7s ease ${index*0.1}s` }}>
      <div ref={tiltRef} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}
        className="glass-card rounded-2xl overflow-hidden border border-white/5 flex flex-col h-full"
        style={{ transformStyle: "preserve-3d", willChange: "transform" }}>

        {project.image ? (
          <div className="relative h-48 overflow-hidden">
            <img src={project.image} alt={project.title} className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"/>
            <div className="absolute inset-0 bg-gradient-to-t from-deep-space via-deep-space/20 to-transparent"/>
            {project.featured && <span className="absolute top-3 right-3 font-mono text-xs px-3 py-1 rounded-full border border-neural-blue/40 text-neural-blue bg-deep-space/80">★ FEATURED</span>}
          </div>
        ) : (
          <div className="h-36 flex items-center justify-center relative overflow-hidden" style={{background:`linear-gradient(135deg,${colorHex}15,transparent)`}}>
            <div className="absolute inset-0 opacity-10" style={{backgroundImage:`linear-gradient(${colorHex}20 1px,transparent 1px),linear-gradient(90deg,${colorHex}20 1px,transparent 1px)`,backgroundSize:"30px 30px"}}/>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center relative z-10" style={{background:`${colorHex}20`,border:`1px solid ${colorHex}50`}}>
              <Icon size={24} style={{color:`${colorHex}`}}/>
            </div>
            {project.featured && <span className="absolute top-3 right-3 font-mono text-xs px-2 py-0.5 rounded-full border border-neural-blue/40 text-neural-blue bg-neural-blue/10">★ FEATURED</span>}
          </div>
        )}

        <div className="p-6 flex flex-col flex-1">
          <h3 className="font-display text-lg font-bold text-star-white mb-2 hover:text-neural-blue transition-colors cursor-default">{project.title}</h3>
          <p className="text-dim-star text-sm leading-relaxed mb-4 flex-1">{project.desc}</p>

          {project.stats && Object.keys(project.stats).length > 0 && (
            <div className="flex gap-4 mb-4 pb-4 border-b border-white/5">
              {Object.entries(project.stats).map(([k,v]) => (
                <div key={k}>
                  <div className="font-display text-sm font-bold" style={{color:`${colorHex}`}}>{v}</div>
                  <div className="font-mono text-xs text-dim-star capitalize">{k}</div>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-1.5 mb-4">
            {(project.tags||[]).map(t=><span key={t} className="tag-pill">{t}</span>)}
          </div>

          <div className="flex gap-4 mt-auto">
            <a href={project.github||"#"} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-mono text-dim-star hover:text-star-white transition-colors">
              <Github size={13}/>GitHub
            </a>
            <a href={project.demo||"#"} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-mono hover:opacity-80" style={{color:`${colorHex}`}}>
              <ExternalLink size={13}/>Démo Live
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Projects() {
  const { content } = useContent();
  const projects = content?.projects || [];
  return (
    <section id="projects" className="relative py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-px flex-1 max-w-[60px] bg-neural-blue/40"/>
          <span className="font-mono text-xs text-neural-blue tracking-widest">04 / PROJETS</span>
        </div>
        <h2 className="font-display text-4xl md:text-5xl font-black text-star-white mb-4 leading-tight">
          Ce que j'ai <span className="gradient-text">construit</span>
        </h2>
        <p className="text-dim-star mb-16 max-w-xl leading-relaxed">Des projets allant de la recherche fondamentale aux applications déployées en production.</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p,i)=><ProjectCard key={p.id||i} project={p} index={i}/>)}
        </div>
        <div className="text-center mt-16">
          <a href={content?.contact?.github||"https://github.com"} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-neural-blue/30 text-neural-blue hover:bg-neural-blue/10 transition-colors px-8 py-4 rounded-full font-mono text-xs tracking-widest">
            <Github size={14}/>Voir tous mes projets sur GitHub
          </a>
        </div>
      </div>
    </section>
  );
}
