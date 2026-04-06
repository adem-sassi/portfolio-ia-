import { useEffect, useState } from "react";
import { Server, RefreshCw, Home } from "lucide-react";

export default function ServerError() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setTimeout(() => setMounted(true), 100), []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
      style={{ background: "var(--void)" }}>
      <div className="blob absolute w-96 h-96 opacity-10 pointer-events-none"
        style={{ background: "var(--neural-pink)", top: "-10%", left: "-10%" }}/>
      <div className="blob absolute w-80 h-80 opacity-10 pointer-events-none"
        style={{ background: "var(--neural-violet)", bottom: "-10%", right: "-10%", animationDelay: "-4s" }}/>

      <div className="relative z-10 text-center"
        style={{ opacity: mounted ? 1 : 0, transform: mounted ? "none" : "translateY(30px)", transition: "all 0.8s ease" }}>

        <div className="font-display text-[120px] md:text-[180px] font-black leading-none mb-4"
          style={{ color: "var(--neural-pink)" }}>
          500
        </div>

        <div className="font-mono text-neural-pink text-sm tracking-widest mb-4">
          SERVER_ERROR
        </div>

        <h1 className="font-display text-2xl md:text-3xl font-black text-star-white mb-4">
          Erreur serveur
        </h1>

        <p className="text-dim-star mb-10 max-w-md mx-auto leading-relaxed">
          Le serveur rencontre un problème temporaire. Ce n'est pas de votre faute — nos équipes travaillent à résoudre le problème.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button onClick={() => window.location.reload()}
            className="ai-btn px-8 py-4 rounded-full flex items-center gap-2 text-sm">
            <RefreshCw size={16}/> Réessayer
          </button>
          <a href="/"
            className="glass-card border border-neural-blue/30 px-8 py-4 rounded-full flex items-center gap-2 text-sm font-display text-neural-blue hover:text-star-white transition-colors">
            <Home size={16}/> Retour à l'accueil
          </a>
        </div>

        <p className="text-dim-star/50 text-xs font-mono mt-12">
          ademsassi.com — Portfolio IA
        </p>
      </div>
    </div>
  );
}
