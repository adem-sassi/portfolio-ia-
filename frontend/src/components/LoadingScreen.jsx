import { useEffect, useState } from "react";

export default function LoadingScreen({ onDone }) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(0);

  const phases = [
    "Initialisation IA...",
    "Chargement des modèles...",
    "Connexion neurale...",
    "Bienvenue !",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        const next = p + Math.random() * 18 + 5;
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(onDone, 600);
          return 100;
        }
        setPhase(Math.floor((next / 100) * phases.length));
        return next;
      });
    }, 120);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{ background: "var(--void)" }}
    >
      {/* Neural Brain Animation */}
      <div className="relative mb-12">
        <div
          className="w-24 h-24 rounded-full border-2 border-neural-blue/30 flex items-center justify-center"
          style={{ animation: "spin 3s linear infinite" }}
        >
          <div
            className="w-16 h-16 rounded-full border-2 border-neural-violet/50 flex items-center justify-center"
            style={{ animation: "spin 2s linear infinite reverse" }}
          >
            <div
              className="w-8 h-8 rounded-full bg-neural-blue"
              style={{
                boxShadow: "0 0 30px var(--neural-blue), 0 0 60px var(--neural-blue)",
                animation: "pulse 1s ease-in-out infinite",
              }}
            />
          </div>
        </div>
        {/* Orbiting dots */}
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-neural-blue"
            style={{
              top: "50%",
              left: "50%",
              transform: `rotate(${i * 120}deg) translateX(48px)`,
              animation: `spin ${2 + i * 0.5}s linear infinite`,
              boxShadow: "0 0 8px var(--neural-blue)",
            }}
          />
        ))}
      </div>

      {/* Logo */}
      <div className="font-display text-3xl font-black mb-2">
        <span className="gradient-text">AI</span>
        <span className="text-star-white">.</span>
        <span className="gradient-text">PORTFOLIO</span>
      </div>

      {/* Phase text */}
      <p className="font-mono text-sm text-dim-star tracking-widest mb-8 h-5">
        {phases[phase] || phases[phases.length - 1]}
      </p>

      {/* Progress bar */}
      <div className="w-64 h-0.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-150"
          style={{
            width: `${progress}%`,
            background: "linear-gradient(90deg, var(--neural-blue), var(--neural-violet))",
            boxShadow: "0 0 10px var(--neural-blue)",
          }}
        />
      </div>
      <p className="font-mono text-xs text-dim-star mt-3">
        {Math.round(progress)}%
      </p>
    </div>
  );
}
