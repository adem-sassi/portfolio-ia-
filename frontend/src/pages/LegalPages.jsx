import { ArrowLeft } from "lucide-react";

function LegalPage({ title, children }) {
  return (
    <div className="min-h-screen py-32 px-6" style={{ background: "var(--void)" }}>
      <div className="max-w-3xl mx-auto">
        <a href="/" className="flex items-center gap-2 text-dim-star hover:text-neural-blue transition-colors text-sm font-mono mb-8">
          <ArrowLeft size={14}/> Retour
        </a>
        <h1 className="font-display text-3xl font-black text-star-white mb-8">{title}</h1>
        <div className="space-y-6 text-dim-star leading-relaxed text-sm">
          {children}
        </div>
        <p className="text-dim-star/50 text-xs font-mono mt-12">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
      </div>
    </div>
  );
}

export function TermsPage() {
  return (
    <LegalPage title="Conditions d'utilisation">
      <section>
        <h2 className="text-neural-blue font-bold text-lg mb-3">Acceptation des conditions</h2>
        <p>En accédant à ademsassi.com, vous acceptez les présentes conditions d'utilisation. Ce site est un portfolio personnel présentant les projets et compétences d'Adem SASSI, étudiant en Master 1 Intelligence Artificielle à l'École Hexagone de Versailles.</p>
      </section>
      <section>
        <h2 className="text-neural-blue font-bold text-lg mb-3">Utilisation du site</h2>
        <p>Ce site est destiné à un usage informatif. Vous vous engagez à ne pas tenter de pirater, modifier ou endommager le site ou ses services associés. Toute reproduction du contenu sans autorisation écrite est interdite.</p>
      </section>
      <section>
        <h2 className="text-neural-blue font-bold text-lg mb-3">Propriété intellectuelle</h2>
        <p>Tous les contenus présents sur ce site (textes, code, design, images) sont la propriété exclusive d'Adem SASSI et sont protégés par les lois françaises sur la propriété intellectuelle.</p>
      </section>
      <section>
        <h2 className="text-neural-blue font-bold text-lg mb-3">Limitation de responsabilité</h2>
        <p>Adem SASSI ne saurait être tenu responsable des dommages directs ou indirects résultant de l'utilisation de ce site. Les informations sont fournies à titre indicatif et peuvent être modifiées sans préavis.</p>
      </section>
      <section>
        <h2 className="text-neural-blue font-bold text-lg mb-3">Contact</h2>
        <p>Pour toute question relative aux conditions d'utilisation : <a href="mailto:contact@ademsassi.com" className="text-neural-blue hover:underline">contact@ademsassi.com</a></p>
      </section>
    </LegalPage>
  );
}

export function PrivacyPage() {
  return (
    <LegalPage title="Politique de confidentialité">
      <section>
        <h2 className="text-neural-blue font-bold text-lg mb-3">Collecte des données</h2>
        <p>Ce site collecte uniquement les données que vous soumettez volontairement via le formulaire de contact (nom, email, message). Aucune donnée n'est collectée sans votre consentement explicite.</p>
      </section>
      <section>
        <h2 className="text-neural-blue font-bold text-lg mb-3">Utilisation des données</h2>
        <p>Les données collectées sont utilisées uniquement pour répondre à vos messages. Elles ne sont jamais vendues, partagées ou transmises à des tiers à des fins commerciales.</p>
      </section>
      <section>
        <h2 className="text-neural-blue font-bold text-lg mb-3">Durée de conservation</h2>
        <p>Vos données sont conservées le temps nécessaire pour traiter votre demande, puis supprimées. Vous pouvez à tout moment demander la suppression de vos données en contactant : <a href="mailto:contact@ademsassi.com" className="text-neural-blue hover:underline">contact@ademsassi.com</a></p>
      </section>
      <section>
        <h2 className="text-neural-blue font-bold text-lg mb-3">Vos droits (RGPD)</h2>
        <p>Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants : accès, rectification, suppression, portabilité et opposition au traitement de vos données personnelles.</p>
      </section>
      <section>
        <h2 className="text-neural-blue font-bold text-lg mb-3">Cookies</h2>
        <p>Ce site utilise uniquement des cookies techniques essentiels au fonctionnement. Aucun cookie publicitaire ou de tracking tiers n'est utilisé. Les analytics Vercel sont anonymisés.</p>
      </section>
    </LegalPage>
  );
}

export function SecurityPage() {
  return (
    <LegalPage title="Sécurité">
      <section>
        <h2 className="text-neural-blue font-bold text-lg mb-3">Architecture sécurisée</h2>
        <p>Ce site est construit avec une architecture moderne et sécurisée. Le frontend est déployé sur Vercel (CDN mondial) et le backend sur Railway, avec HTTPS forcé sur l'ensemble des communications.</p>
      </section>
      <section>
        <h2 className="text-neural-blue font-bold text-lg mb-3">Mesures de protection</h2>
        <p>Les mesures de sécurité implémentées incluent : chiffrement HTTPS/TLS, protection CORS, headers de sécurité Helmet, rate limiting (200 requêtes/15 min), sanitisation des données MongoDB, authentification JWT avec expiration automatique.</p>
      </section>
      <section>
        <h2 className="text-neural-blue font-bold text-lg mb-3">Protection de l'admin</h2>
        <p>L'accès au panneau d'administration est protégé par authentification JWT avec expiration de session de 8 heures. Les tentatives de connexion échouées sont limitées à 5 avant blocage temporaire de l'IP.</p>
      </section>
      <section>
        <h2 className="text-neural-blue font-bold text-lg mb-3">Signaler une vulnérabilité</h2>
        <p>Si vous découvrez une faille de sécurité, merci de me contacter directement et de manière confidentielle à : <a href="mailto:contact@ademsassi.com" className="text-neural-blue hover:underline">contact@ademsassi.com</a>. Je m'engage à traiter tout signalement sérieux dans les 48h.</p>
      </section>
    </LegalPage>
  );
}

export function StatusPage() {
  return (
    <LegalPage title="Status des services">
      <section>
        <h2 className="text-neural-blue font-bold text-lg mb-3">État actuel des services</h2>
        <div className="space-y-3">
          {[
            { name: "Portfolio (ademsassi.com)", status: "Opérationnel", color: "#00FF88" },
            { name: "API Backend (Railway)", status: "Opérationnel", color: "#00FF88" },
            { name: "Base de données (MongoDB Atlas)", status: "Opérationnel", color: "#00FF88" },
            { name: "Chatbot IA (Groq API)", status: "Opérationnel", color: "#00FF88" },
            { name: "Email (Resend)", status: "Opérationnel", color: "#00FF88" },
          ].map((s, i) => (
            <div key={i} className="flex items-center justify-between p-4 glass-card rounded-xl border border-white/5">
              <span className="font-mono text-sm text-star-white">{s.name}</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: s.color }}/>
                <span className="font-mono text-xs" style={{ color: s.color }}>{s.status}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h2 className="text-neural-blue font-bold text-lg mb-3">Hébergement</h2>
        <p>Frontend hébergé sur Vercel (SLA 99.99%). Backend hébergé sur Railway. Base de données sur MongoDB Atlas (AWS). Disponibilité cible : 99.9% annuel.</p>
      </section>
    </LegalPage>
  );
}

export function CommunityPage() {
  return (
    <LegalPage title="Communauté">
      <section>
        <h2 className="text-neural-blue font-bold text-lg mb-3">GitHub</h2>
        <p>Retrouvez mes projets open-source et contributions sur GitHub. N'hésitez pas à forker, contribuer ou ouvrir des issues sur mes repositories.</p>
        <a href="https://github.com/ADEM-SASSI" target="_blank" rel="noopener noreferrer" className="inline-block mt-3 text-neural-blue hover:underline font-mono text-sm">→ github.com/ADEM-SASSI</a>
      </section>
      <section>
        <h2 className="text-neural-blue font-bold text-lg mb-3">LinkedIn</h2>
        <p>Suivez mon parcours professionnel et connectons-nous sur LinkedIn. Je partage régulièrement mes apprentissages en IA et développement.</p>
        <a href="https://linkedin.com/in/adem-sassi" target="_blank" rel="noopener noreferrer" className="inline-block mt-3 text-neural-blue hover:underline font-mono text-sm">→ linkedin.com/in/adem-sassi</a>
      </section>
      <section>
        <h2 className="text-neural-blue font-bold text-lg mb-3">Blog</h2>
        <p>Je publie des articles techniques sur l'IA, le Machine Learning, le développement Full-Stack et mon parcours en Master 1 IA.</p>
        <a href="/blog" className="inline-block mt-3 text-neural-blue hover:underline font-mono text-sm">→ Lire le blog</a>
      </section>
      <section>
        <h2 className="text-neural-blue font-bold text-lg mb-3">Collaboration</h2>
        <p>Vous avez un projet IA ou Full-Stack ? Je suis ouvert aux collaborations, stages et contrats d'apprentissage. Contactez-moi via le formulaire de contact ou directement par email.</p>
      </section>
    </LegalPage>
  );
}

export function DocsPage() {
  return (
    <LegalPage title="Documentation technique">
      <section>
        <h2 className="text-neural-blue font-bold text-lg mb-3">Stack technique</h2>
        <div className="space-y-2 font-mono text-xs">
          {[
            { cat: "Frontend", tech: "React 18 + Vite + Tailwind CSS → Vercel" },
            { cat: "Backend", tech: "Node.js + Express.js → Railway" },
            { cat: "Base de données", tech: "MongoDB Atlas (AWS)" },
            { cat: "IA", tech: "Groq API — LLaMA 3.3 70B" },
            { cat: "Auth", tech: "JWT + bcryptjs" },
            { cat: "Email", tech: "Resend API" },
            { cat: "Notifications", tech: "ntfy.sh" },
            { cat: "Analytics", tech: "Vercel Analytics + Speed Insights" },
            { cat: "Sécurité", tech: "Helmet + CORS + Rate Limit + IP blocking" },
          ].map((item, i) => (
            <div key={i} className="flex gap-4 p-3 glass-card rounded-xl border border-white/5">
              <span className="text-neural-blue w-32 flex-shrink-0">{item.cat}</span>
              <span className="text-dim-star">{item.tech}</span>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h2 className="text-neural-blue font-bold text-lg mb-3">API publique</h2>
        <p>Ce portfolio expose une API REST pour accéder au contenu public. Les endpoints disponibles sont :</p>
        <div className="space-y-2 font-mono text-xs mt-3">
          {[
            "GET /api/content — Tout le contenu du portfolio",
            "GET /api/blog — Liste des articles publiés",
            "GET /api/blog/:slug — Un article par slug",
            "POST /api/ai/chat — Chatbot IA",
          ].map((ep, i) => (
            <div key={i} className="p-3 glass-card rounded-xl border border-white/5 text-neural-green">{ep}</div>
          ))}
        </div>
      </section>
      <section>
        <h2 className="text-neural-blue font-bold text-lg mb-3">Code source</h2>
        <p>Le code source de ce portfolio est disponible sur GitHub à titre éducatif.</p>
        <a href="https://github.com/ADEM-SASSI/portfolio-ia-" target="_blank" rel="noopener noreferrer" className="inline-block mt-3 text-neural-blue hover:underline font-mono text-sm">→ Voir le code source</a>
      </section>
    </LegalPage>
  );
}

export function CookiesPage() {
  return (
    <LegalPage title="Gestion des cookies">
      <section>
        <h2 className="text-neural-blue font-bold text-lg mb-3">Cookies utilisés</h2>
        <div className="space-y-3">
          {[
            { name: "admin_token", type: "Essentiel", desc: "Token d'authentification admin (localStorage)", duration: "8 heures" },
            { name: "Vercel Analytics", type: "Analytique", desc: "Statistiques de visite anonymisées", duration: "Session" },
            { name: "Vercel Speed Insights", type: "Performance", desc: "Mesure des performances du site", duration: "Session" },
          ].map((c, i) => (
            <div key={i} className="p-4 glass-card rounded-xl border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-sm text-star-white">{c.name}</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full" style={{ background: "rgba(0,212,255,0.1)", color: "var(--neural-blue)", border: "1px solid rgba(0,212,255,0.2)" }}>{c.type}</span>
              </div>
              <p className="text-xs text-dim-star">{c.desc}</p>
              <p className="text-xs text-dim-star/50 font-mono mt-1">Durée : {c.duration}</p>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h2 className="text-neural-blue font-bold text-lg mb-3">Cookies tiers</h2>
        <p>Ce site n'utilise aucun cookie publicitaire ou de tracking tiers. Aucune donnée n'est partagée avec des régies publicitaires.</p>
      </section>
      <section>
        <h2 className="text-neural-blue font-bold text-lg mb-3">Désactiver les cookies</h2>
        <p>Vous pouvez désactiver les cookies dans les paramètres de votre navigateur. Seuls les cookies essentiels (admin_token) sont nécessaires au fonctionnement du site.</p>
      </section>
    </LegalPage>
  );
}

export function DoNotSharePage() {
  return (
    <LegalPage title="Ne pas partager mes informations personnelles">
      <section>
        <h2 className="text-neural-blue font-bold text-lg mb-3">Engagement de confidentialité</h2>
        <p>Adem SASSI s'engage formellement à ne jamais vendre, louer ou partager vos informations personnelles avec des tiers à des fins commerciales ou publicitaires.</p>
      </section>
      <section>
        <h2 className="text-neural-blue font-bold text-lg mb-3">Données collectées</h2>
        <p>Les seules données collectées sont celles que vous fournissez volontairement via le formulaire de contact (nom, email, message). Ces données sont utilisées exclusivement pour répondre à votre message.</p>
      </section>
      <section>
        <h2 className="text-neural-blue font-bold text-lg mb-3">Droit d'opposition</h2>
        <p>Conformément au RGPD et à la loi "Informatique et Libertés", vous disposez d'un droit d'opposition au traitement de vos données. Pour exercer ce droit, contactez : <a href="mailto:contact@ademsassi.com" className="text-neural-blue hover:underline">contact@ademsassi.com</a></p>
      </section>
      <section>
        <h2 className="text-neural-blue font-bold text-lg mb-3">Suppression de vos données</h2>
        <p>Sur simple demande par email, toutes vos données personnelles seront supprimées dans un délai de 72 heures. Aucune justification n'est requise pour exercer ce droit.</p>
      </section>
      <section>
        <h2 className="text-neural-blue font-bold text-lg mb-3">Autorité de contrôle</h2>
        <p>En cas de litige, vous pouvez saisir la CNIL (Commission Nationale de l'Informatique et des Libertés) : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-neural-blue hover:underline">www.cnil.fr</a></p>
      </section>
    </LegalPage>
  );
}
