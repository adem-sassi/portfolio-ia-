import { useEffect, useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";
import AnimatedCounter from "./AnimatedCounter";

const TYPING_STRINGS = ["Étudiant Master 1 IA","Développeur Full-Stack","Machine Learning Engineer","Développeur IoT","NLP Enthusiast"];

export default function Hero() {
  const [hero, setHero] = useState(null);
  const [currentText, setCurrentText] = useState("");
  const [stringIndex, setStringIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Fetch direct sans cache
  useEffect(() => {
    fetch("https://web-production-cba0c.up.railway.app/api/content/hero?t=" + Date.now())
      .then(r => r.json())
      .then(data => setHero(data))
      .catch(() => {});
    setTimeout(() => setMounted(true), 100);
  }, []);

  useEffect(() => {
    const target = TYPING_STRINGS[stringIndex];
    const timeout = deleting
      ? setTimeout(() => {
          setCurrentText(t => t.slice(0, -1));
          if (currentText.length === 1) {
            setDeleting(false);
            setStringIndex(i => (i + 1) % TYPING_STRINGS.length);
          }
        }, 50)
      : setTimeout(() => {
          setCurrentText(target.slice(0, charIndex + 1));
          setCharIndex(c => c + 1);
          if (charIndex + 1 === target.length) setTimeout(() => setDeleting(true), 2000);
        }, 80);
    return () => clearTimeout(timeout);
  }, [currentText, charIndex, deleting, stringIndex]);

  useEffect(() => { if (!deleting) setCharIndex(0); }, [stringIndex]);

  const stats = hero?.stats || [
    { value: "3", label: "Stages" },
    { value: "5+", label: "Projets" },
    { value: "M1", label: "Niveau IA" },
  ];

  const fadeIn = (delay) => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? "none" : "translateY(30px)",
    transition: `all 0.8s ease ${delay}s`
  });

  return (
    <section id="home" className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20 scanlines">
      
      
      

      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 glass-card border border-neural-blue/30 rounded-full px-4 py-2 mb-8 text-xs font-mono text-neural-blue tracking-widest"
          style={fadeIn(0.1)}>
          <Sparkles size={12} className="animate-pulse"/>
          MASTER 1 — INTELLIGENCE ARTIFICIELLE
          <Sparkles size={12} className="animate-pulse"/>
        </div>

        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-black leading-none mb-6"
          style={fadeIn(0.2)}>
          <span className="block text-star-white mb-2">Bonjour, je suis</span>
          <span className="block gradient-text">
            {hero?.name || "Adem SASSI"}
          </span>
        </h1>

        <div className="font-mono text-xl md:text-2xl text-dim-star mb-10 h-8"
          style={{ opacity: mounted ? 1 : 0, transition: "opacity 0.8s ease 0.4s" }}>
          <span className="text-neural-blue">{">"} </span>
          <span>{currentText}</span>
          <span className="inline-block w-0.5 h-5 bg-neural-blue ml-0.5 animate-pulse"/>
        </div>

        <p className="text-dim-star text-lg max-w-2xl mx-auto mb-12 leading-relaxed"
          style={fadeIn(0.5)}>
          {hero?.description || "Étudiant en Master 1 IA à l'École Hexagone, je recherche un contrat d'apprentissage."}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
          style={fadeIn(0.6)}>
          <a href="#projects" className="ai-btn px-8 py-4 rounded-full text-sm tracking-widest">
            Voir mes projets
          </a>
          <a href="#ai-features"
            className="glass-card border border-neural-blue/30 neural-glow-hover px-8 py-4 rounded-full text-sm font-display tracking-widest text-neural-blue hover:text-star-white transition-colors duration-300">
            IA Lab →
          </a>
        </div>

        {/* Stats — fetch direct depuis MongoDB */}
        <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto"
          style={{ opacity: mounted ? 1 : 0, transition: "opacity 0.8s ease 0.8s" }}>
          {stats.map((s, i) => (
            <div key={i} className="text-center group">
              <div className="font-display text-3xl font-black gradient-text">
                <AnimatedCounter target={s.value}/>
              </div>
              <div className="text-dim-star text-xs tracking-widest mt-1 uppercase group-hover:text-neural-blue transition-colors">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <a href="#about"
        className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden sm:flex flex-col items-center gap-2 text-dim-star hover:text-neural-blue transition-colors"
        style={{ opacity: mounted ? 1 : 0, transition: "opacity 0.8s ease 1s" }}>
        <span className="text-xs tracking-widest font-mono">SCROLL</span>
        <ChevronDown size={18} className="animate-bounce"/>
      </a>
    </section>
  );
}
