export default function Footer() {
  return (
    <footer className="relative border-t border-white/5 py-10 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="relative w-6 h-6">
            <div className="absolute inset-0 bg-neural-blue/20 rounded rotate-45" />
            <div className="absolute inset-1 bg-neural-blue rounded-sm rotate-12" />
          </div>
          <span className="font-display text-sm font-bold tracking-widest text-star-white">
            ADEM<span className="text-neural-blue">.</span>SASSI
          </span>
        </div>

        
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-neural-green animate-pulse" />
        </div>
      </div>
      <div className="border-t border-white/5 mt-4 pt-4 flex flex-col md:flex-row items-center justify-between gap-2">
        <p className="text-dim-star text-xs font-mono">
          © {new Date().getFullYear()} Adem SASSI — Tous droits réservés
        </p>
        <p className="text-dim-star text-xs font-mono text-center">
          Étudiant Master 1 IA · École Hexagone · Puteaux
        </p>
        <p className="text-dim-star text-xs font-mono">
          Disponible pour un <span className="text-neural-blue">contrat d'apprentissage</span>
        </p>
      </div>
    </footer>
  );
}
