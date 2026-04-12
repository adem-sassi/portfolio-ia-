const COURSES = [
  {
    semester: "Semestre 1",
    color: "#00D4FF",
    subjects: [
      { name: "Algèbre linéaire", desc: "Matrices, vecteurs, transformations linéaires pour l'IA", icon: "🔢" },
      { name: "Algorithmique numérique", desc: "Méthodes numériques et optimisation", icon: "🧮" },
      { name: "Electronique", desc: "Circuits électroniques et systèmes embarqués", icon: "⚡" },
      { name: "Langages C & C++", desc: "Programmation système et bas niveau", icon: "🖥️" },
      { name: "Probabilités et statistiques", desc: "Inférence statistique, distributions, tests d'hypothèses", icon: "📊" },
      { name: "Programmation avancée", desc: "Algorithmes avancés et structures de données", icon: "💻" },
      { name: "Programmation Logique", desc: "Logique formelle et programmation déclarative", icon: "🧩" },
      { name: "Python", desc: "Python avancé pour la data science et l'IA", icon: "🐍" },
    ]
  },
  {
    semester: "Semestre 2",
    color: "#7B2FFF",
    subjects: [
      { name: "Machine Learning", desc: "Algorithmes supervisés et non-supervisés, modèles prédictifs", icon: "🤖" },
      { name: "Analyse des données", desc: "Exploration, visualisation et traitement de données", icon: "📈" },
      { name: "Hadoop Spark", desc: "Big Data, traitement distribué, PySpark", icon: "💾" },
      { name: "MLOps — Docker & Kubernetes", desc: "Déploiement et monitoring de modèles ML en production", icon: "⚙️" },
      { name: "Systèmes automatiques", desc: "Automatisation et systèmes de contrôle", icon: "🔧" },
      { name: "Cloud", desc: "Architecture cloud, services AWS/Azure/GCP", icon: "☁️" },
      { name: "SQL et NoSQL", desc: "Bases de données relationnelles et non-relationnelles", icon: "🗄️" },
      { name: "Projet individuel", desc: "Projet de développement personnel en IA", icon: "🚀" },
    ]
  }
];

export default function Courses() {
  return (
    <section className="relative py-32 px-6" id="courses">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-16">
          <div className="h-px flex-1 max-w-[60px] bg-neural-violet/40"/>
          <span className="font-mono text-xs text-neural-violet tracking-widest">05 / FORMATION</span>
        </div>
        <div className="mb-12">
          <h2 className="font-display text-4xl md:text-5xl font-black text-star-white mb-4">
            Master 1 <span className="text-neural-violet">Intelligence</span>
            <br/>Artificielle
          </h2>
          <p className="text-dim-star font-mono text-sm">École Hexagone · Versailles · 2025—2026</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {COURSES.map((sem, si) => (
            <div key={si} className="glass-card rounded-2xl p-6 border border-white/5">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 rounded-full" style={{ background: sem.color }}/>
                <p className="font-display font-black text-star-white">{sem.semester}</p>
              </div>
              <div className="space-y-3">
                {sem.subjects.map((sub, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl transition-all hover:bg-white/3"
                    style={{ border: "1px solid rgba(255,255,255,0.03)" }}>
                    <span style={{ fontSize: "20px" }}>{sub.icon}</span>
                    <div>
                      <p className="text-star-white text-sm font-bold">{sub.name}</p>
                      <p className="text-dim-star text-xs mt-0.5">{sub.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
