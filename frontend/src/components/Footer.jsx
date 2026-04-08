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
    <footer className="relative border-t border-white/5 py-10 px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Top row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
          
          {/* Logo AS */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-display font-black text-sm flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #00D4FF20, #7B2FFF20)", border: "1px solid #00D4FF40", color: "#00D4FF" }}>
              AS
            </div>
            <span className="font-display text-sm font-bold tracking-widest text-star-white">
              ADEM<span className="text-neural-blue">.</span>SASSI
            </span>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {links.map((link, i) => (
              <a key={i} href={link.href}
                className="text-dim-star text-xs font-mono hover:text-neural-blue transition-colors">
                {link.label}
              </a>
            ))}
          </div>
        </div>

        {/* Bottom row */}
        <div className="border-t border-white/5 pt-4 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-dim-star text-xs font-mono">
            © {new Date().getFullYear()} Adem SASSI — Tous droits réservés
          </p>
          <p className="text-dim-star text-xs font-mono text-center">
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
