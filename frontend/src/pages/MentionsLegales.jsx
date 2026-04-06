export default function MentionsLegales() {
  return (
    <div className="min-h-screen py-32 px-6 max-w-3xl mx-auto">
      <h1 className="font-display text-3xl font-black text-star-white mb-8">
        Mentions Légales
      </h1>

      <div className="space-y-8 text-dim-star leading-relaxed">

        <section>
          <h2 className="text-neural-blue font-bold text-lg mb-3">Éditeur du site</h2>
          <p>Nom : Adem SASSI</p>
          <p>Statut : Particulier — Étudiant Master 1 IA</p>
          <p>Email : sassiadem7@gmail.com</p>
          <p>Site : ademsassi.com</p>
        </section>

        <section>
          <h2 className="text-neural-blue font-bold text-lg mb-3">Hébergement</h2>
          <p>Frontend : Vercel Inc. — 340 Pine Street, San Francisco, CA 94104, USA</p>
          <p>Backend : Railway Corp. — San Francisco, CA, USA</p>
          <p>Base de données : MongoDB Atlas — AWS</p>
        </section>

        <section>
          <h2 className="text-neural-blue font-bold text-lg mb-3">Propriété intellectuelle</h2>
          <p>L'ensemble du contenu de ce site (textes, images, code, design) est la propriété exclusive d'Adem SASSI et est protégé par les lois françaises et internationales relatives à la propriété intellectuelle.</p>
          <p className="mt-2">Toute reproduction totale ou partielle est strictement interdite sans autorisation écrite préalable.</p>
        </section>

        <section>
          <h2 className="text-neural-blue font-bold text-lg mb-3">Données personnelles (RGPD)</h2>
          <p>Ce site collecte uniquement les données que vous soumettez via le formulaire de contact (nom, email, message).</p>
          <p className="mt-2">Ces données sont utilisées uniquement pour répondre à vos messages et ne sont jamais transmises à des tiers.</p>
          <p className="mt-2">Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données en contactant : sassiadem7@gmail.com</p>
        </section>

        <section>
          <h2 className="text-neural-blue font-bold text-lg mb-3">Cookies</h2>
          <p>Ce site n'utilise pas de cookies publicitaires ou de tracking tiers. Seuls des cookies techniques essentiels au fonctionnement du site peuvent être utilisés.</p>
        </section>

        <section>
          <h2 className="text-neural-blue font-bold text-lg mb-3">Responsabilité</h2>
          <p>Adem SASSI s'efforce d'assurer l'exactitude des informations publiées sur ce site mais ne peut garantir leur exhaustivité. Il ne saurait être tenu responsable des erreurs ou omissions.</p>
        </section>

        <p className="text-xs text-dim-star/50 mt-8">
          Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
        </p>
      </div>

      <a href="/" className="inline-block mt-8 text-neural-blue hover:underline font-mono text-sm">
        ← Retour au portfolio
      </a>
    </div>
  );
}
