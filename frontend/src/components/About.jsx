import { useEffect, useRef, useState } from "react";
import { Brain, Code2, GraduationCap, BookOpen, Award } from "lucide-react";
import { useContent } from "../hooks/useContent";

const ICONS = [GraduationCap, BookOpen, Code2, Brain];
const COLORS = ["neural-blue","neural-violet","neural-pink","neural-green"];

function TimelineItem({ item, index }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const Icon = ICONS[index % ICONS.length];
  const color = COLORS[index % COLORS.length];

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => e.isIntersecting && setVisible(true), { threshold: 0.3 });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="relative flex gap-6 group"
      style={{ opacity: visible?1:0, transform: visible?"none":"translateX(-30px)", transition: `all 0.6s ease ${index*0.2}s` }}>
      <div className="flex flex-col items-center">
        <div className={`w-10 h-10 rounded-full glass-card border border-${color}/40 flex items-center justify-center flex-shrink-0`}>
          <Icon size={16} className={`text-${color}`} />
        </div>
        {index < 2 && <div className="w-px flex-1 bg-gradient-to-b from-neural-blue/20 to-transparent mt-2"/>}
      </div>
      <div className="pb-10">
        <div className="font-mono text-xs text-dim-star mb-1 tracking-widest">{item.year}</div>
        <h3 className="font-display text-base font-bold text-star-white mb-1">{item.title}</h3>
        <div className={`text-sm text-${color} mb-2`}>{item.place}</div>
        <p className="text-dim-star text-sm leading-relaxed">{item.desc}</p>
      </div>
    </div>
  );
}

export default function About() {
  const { content, loading } = useContent();
  const data = content?.about || {};
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => e.isIntersecting && setVisible(true), { threshold: 0.1 });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const about = content?.about;

  return (
    <section id="about" className="relative py-32 px-6">
      <div className="max-w-6xl mx-auto">

        <div className="flex items-center gap-4 mb-4">
          <div className="h-px flex-1 max-w-[60px] bg-neural-blue/40"/>
          <span className="font-mono text-xs text-neural-blue tracking-widest">01 / À PROPOS</span>
        </div>
        <div className="grid md:grid-cols-2 gap-16 items-start">
          <div ref={ref} style={{ opacity: visible?1:0, transform: visible?"none":"translateY(40px)", transition: "all 0.8s ease" }}>
            <h2 className="font-display text-4xl md:text-5xl font-black text-star-white mb-6 leading-tight">
              {about?.title?.split(" ").slice(0,-2).join(" ") || "Construire l'IA de"}{" "}
              <span className="gradient-text">{about?.title?.split(" ").slice(-2).join(" ") || "demain"}</span>
            </h2>
            <div className="space-y-4 text-dim-star leading-relaxed">
              {(about?.paragraphs || []).map((p, i) => <p key={i}>{p}</p>)}
            </div>
            <div className="flex flex-wrap gap-2 mt-8">
              {(about?.tags || []).map(t => <span key={t} className="tag-pill">{t}</span>)}
            </div>
            <a href="https://web-production-cba0c.up.railway.app/api/content/cv" download className="inline-flex items-center gap-2 mt-8 border border-neural-blue/40 text-neural-blue hover:bg-neural-blue/10 transition-colors px-6 py-3 rounded-full font-mono text-xs tracking-widest">
              <Award size={14}/>Télécharger mon CV
            </a>
          </div>
          <div>
            <h3 className="font-display text-sm tracking-widest text-dim-star mb-8 uppercase">Parcours</h3>
            {(about?.timeline || []).map((item, i) => <TimelineItem key={i} item={item} index={i}/>)}
          </div>
        </div>
      </div>
    
      {/* Langues */}
      {data.languages && (
        <div className="mt-12">
          <h3 className="font-display text-lg font-bold text-star-white mb-4">
            🌍 Langues
          </h3>
          <div className="flex flex-wrap gap-3">
            {data.languages.map((lang, i) => (
              <div key={i} className="flex items-center gap-2 px-4 py-2 glass-card rounded-full border border-white/10">
                <span>{lang.flag}</span>
                <span className="text-star-white font-mono text-sm">{lang.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
