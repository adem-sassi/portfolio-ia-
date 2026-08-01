export default function MaintenancePage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "var(--void)" }}>
      <div className="max-w-2xl w-full text-center">

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
          style={{ background: "rgba(255,140,0,0.08)", border: "1px solid rgba(255,140,0,0.25)" }}>
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#FF8C00" }}/>
          <span className="font-mono text-xs tracking-widest" style={{ color: "#FF8C00" }}>MAINTENANCE EN COURS</span>
        </div>

        <h1 className="font-display text-4xl md:text-5xl font-black mb-6" style={{ color: "var(--star-white)" }}>
          Le site est temporairement<br/>
          <span style={{ color: "var(--neural-blue)" }}>indisponible</span>
        </h1>

        <p className="text-base leading-relaxed mb-4" style={{ color: "var(--dim-star)" }}>
          Une opération de maintenance technique est en cours sur l'infrastructure.
          Le portfolio sera de nouveau accessible très prochainement.
        </p>

        <p className="text-sm mb-10" style={{ color: "var(--dim-star)", opacity: 0.7 }}>
          Merci de votre compréhension.
        </p>

        <div className="glass-card rounded-2xl p-6 border border-white/5 mb-8">
          <p className="font-mono text-xs tracking-widest mb-4" style={{ color: "var(--neural-violet)" }}>
            ME CONTACTER ENTRE TEMPS
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="mailto:contact@ademsassi.com"
              className="px-5 py-3 rounded-xl text-sm transition-all"
              style={{ background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.25)", color: "var(--neural-blue)" }}>
              contact@ademsassi.com
            </a>
            <a href="https://linkedin.com/in/adem-sassi" target="_blank" rel="noopener noreferrer"
              className="px-5 py-3 rounded-xl text-sm transition-all"
              style={{ background: "rgba(123,47,255,0.08)", border: "1px solid rgba(123,47,255,0.25)", color: "var(--neural-violet)" }}>
              LinkedIn
            </a>
          </div>
        </div>

        <div>
          <p className="font-display font-black text-lg" style={{ color: "var(--star-white)" }}>Adem SASSI</p>
          <p className="text-xs font-mono mt-1" style={{ color: "var(--dim-star)" }}>
            Master 1 Intelligence Artificielle · Développeur Full Stack
          </p>
        </div>

      </div>
    </div>
  );
}
