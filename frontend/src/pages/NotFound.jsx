import { useEffect, useState } from "react";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setTimeout(() => setMounted(true), 100), []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
      style={{ background: "var(--void)" }}>
      
      <div className="blob absolute w-96 h-96 opacity-10 pointer-events-none"
        style={{ background: "var(--neural-blue)", top: "-10%", left: "-10%" }}/>
      <div className="blob absolute w-80 h-80 opacity-10 pointer-events-none"
        style={{ background: "var(--neural-violet)", bottom: "-10%", right: "-10%", animationDelay: "-4s" }}/>

      <div className="relative z-10 text-center"
        style={{ opacity: mounted ? 1 : 0, transform: mounted ? "none" : "translateY(30px)", transition: "all 0.8s ease" }}>
        
        <div className="font-display text-[120px] md:text-[180px] font-black leading-none gradient-text mb-4">
          404
        </div>
        
        <div className="font-mono text-neural-blue text-sm tracking-widest mb-4">
          PAGE_NOT_FOUND
        </div>

        <h1 className="font-display text-2xl md:text-3xl font-black text-star-white mb-4">
          Cette page n'existe pas
        </h1>

        <p className="text-dim-star mb-10 max-w-md mx-auto leading-relaxed">
          La page que vous cherchez a peut-être été déplacée, supprimée ou n'a jamais existé.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="/"
            className="ai-btn px-8 py-4 rounded-full flex items-center gap-2 text-sm">
            <Home size={16}/> Retour à l'accueil
          </a>
          <button onClick={() => window.history.back()}
            className="glass-card border border-neural-blue/30 px-8 py-4 rounded-full flex items-center gap-2 text-sm font-display text-neural-blue hover:text-star-white transition-colors">
            <ArrowLeft size={16}/> Page précédente
          </button>
        </div>

        <p className="text-dim-star/50 text-xs font-mono mt-12">
          ademsassi.com — Portfolio IA
        </p>
      </div>
    </div>
  );
}
