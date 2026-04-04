const API_URL = "https://web-production-cba0c.up.railway.app";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

const COLOR_MAP = {
  "neural-blue": "var(--neural-blue)",
  "neural-violet": "var(--neural-violet)",
  "neural-pink": "var(--neural-pink)",
  "neural-green": "var(--neural-green)",
};

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  // Fetch direct — indépendant du cache
  useEffect(() => {
    fetch(`${API_URL}/api/content/testimonials`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setTestimonials(data);
      })
      .catch(e => console.error("Testimonials fetch error:", e));
  }, []);

  // Auto-slide
  useEffect(() => {
    if (testimonials.length === 0) return;
    const timer = setInterval(() => go(1), 5000);
    return () => clearInterval(timer);
  }, [current, testimonials.length]);

  const go = (dir) => {
    if (animating || testimonials.length === 0) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrent(c => (c + dir + testimonials.length) % testimonials.length);
      setAnimating(false);
    }, 200);
  };

  if (testimonials.length === 0) return null;

  const t = testimonials[current];
  const c = COLOR_MAP[t?.color] || "var(--neural-blue)";

  return (
    <section className="relative py-24 px-6 overflow-hidden">
      <div className="blob absolute w-80 h-80 opacity-5 pointer-events-none"
        style={{ background: "var(--neural-violet)", top: "0%", left: "50%", transform: "translateX(-50%)" }}/>

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-px flex-1 max-w-[60px] bg-neural-blue/40"/>
          <span className="font-mono text-xs text-neural-blue tracking-widest">RECOMMANDATIONS</span>
        </div>

        <h2 className="font-display text-4xl font-black text-star-white mb-12">
          Ce qu'ils disent <span className="gradient-text">de moi</span>
        </h2>

        {/* Card */}
        <div className="glass-card rounded-3xl p-8 md:p-12 border neural-glow relative"
          style={{
            borderColor: `${c}30`,
            opacity: animating ? 0 : 1,
            transform: animating ? "translateY(10px)" : "none",
            transition: "all 0.2s ease",
          }}>
          <Quote size={40} className="absolute top-8 right-8 opacity-10" style={{ color: c }}/>
          <p className="text-star-white text-lg md:text-xl leading-relaxed mb-8">
            "{t?.text}"
          </p>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-display font-bold text-sm flex-shrink-0"
              style={{ background: `${c}20`, border: `1px solid ${c}40`, color: c }}>
              {t?.avatar || t?.name?.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="font-display font-bold text-star-white text-sm">{t?.name}</p>
              <p className="text-dim-star text-xs font-mono">{t?.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-6 mt-8">
          <button onClick={() => go(-1)}
            className="w-10 h-10 glass-card rounded-full flex items-center justify-center text-dim-star hover:text-neural-blue border border-white/10 transition-all">
            <ChevronLeft size={16}/>
          </button>
          <div className="flex gap-2">
            {testimonials.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                className="transition-all duration-300 rounded-full"
                style={{ width: i===current?"24px":"8px", height:"8px", background: i===current?c:"rgba(255,255,255,0.2)" }}/>
            ))}
          </div>
          <button onClick={() => go(1)}
            className="w-10 h-10 glass-card rounded-full flex items-center justify-center text-dim-star hover:text-neural-blue border border-white/10 transition-all">
            <ChevronRight size={16}/>
          </button>
        </div>
      </div>
    </section>
  );
}
