import { useEffect, useState } from "react";
import { ArrowUp, Download } from "lucide-react";

export default function FloatingActions() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <div
      className="fixed bottom-8 right-8 flex flex-col gap-3 z-50 transition-all duration-500"
      style={{ opacity: show ? 1 : 0, transform: show ? "none" : "translateY(20px)", pointerEvents: show ? "all" : "none" }}
    >
      {/* Download CV */}
      <a
        href="https://web-production-cba0c.up.railway.app/api/content/cv"
        download
        className="group w-12 h-12 glass-card border border-neural-violet/40 rounded-full flex items-center justify-center neural-glow-hover transition-all hover:w-36"
        title="Télécharger CV"
      >
        <Download size={16} className="text-neural-violet flex-shrink-0"/>
        <span className="overflow-hidden max-w-0 group-hover:max-w-xs transition-all duration-300 font-mono text-xs text-neural-violet ml-2 whitespace-nowrap">
          Mon CV
        </span>
      </a>

      {/* Back to top */}
      <button
        onClick={scrollTop}
        className="w-12 h-12 glass-card border border-neural-blue/40 rounded-full flex items-center justify-center neural-glow-hover transition-all hover:border-neural-blue/80"
        title="Retour en haut"
      >
        <ArrowUp size={16} className="text-neural-blue"/>
      </button>
    </div>
  );
}
