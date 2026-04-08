export default function Footer() {
  const links = [
    { label: "Terms", href: "/terms" },
    { label: "Privacy", href: "/privacy" },
    { label: "Security", href: "/security" },
    { label: "Status", href: "/status" },
    { label: "Community", href: "/community" },
    { label: "Docs", href: "/docs" },
    { label: "Contact", href: "#contact" },
    { label: "Manage cookies", href: "/cookies" },
    { label: "Do not share my personal information", href: "/do-not-share" },
  ];

  return (
    <footer className="relative border-t border-white/5 py-12 px-6">
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-6">

        {/* Logo centré */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-display font-black text-sm"
            style={{ background: "linear-gradient(135deg, #00D4FF20, #7B2FFF20)", border: "1px solid #00D4FF40", color: "#00D4FF" }}>
            AS
          </div>
          <span className="font-display text-base font-bold tracking-widest text-star-white">
            ADEM<span className="text-neural-blue">.</span>SASSI
          </span>
        </div>

        {/* Links centrés */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          {links.map((link, i) => (
            <a key={i} href={link.href}
              className="text-dim-star text-xs font-mono hover:text-neural-blue transition-colors">
              {link.label}
            </a>
          ))}
        </div>

        {/* Séparateur */}
        <div className="w-full border-t border-white/5"/>

        {/* Copyright centré */}
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="text-dim-star text-xs font-mono">
            © {new Date().getFullYear()} Adem SASSI — Tous droits réservés · <a href="/mentions-legales" className="hover:text-neural-blue transition-colors">Mentions légales</a>
          </p>
          <p className="text-dim-star text-xs font-mono">
            Étudiant Master 1 IA · École Hexagone · Versailles
          </p>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-neural-green animate-pulse"/>
            <p className="text-dim-star text-xs font-mono">
              Disponible pour un <span className="text-neural-blue">contrat d'apprentissage</span>
            </p>
          </div>
        </div>

      </div>
    </footer>
  );
}
