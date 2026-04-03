import dotenv from "dotenv";
dotenv.config();
import { connectDB } from "./connect.js";
import Content from "../models/Content.js";

const DEFAULT_CONTENT = {
  hero: {
    name: "Votre Nom",
    title: "Étudiant Master 1 IA",
    description: "Passionné par l'IA et le Machine Learning, je construis des solutions intelligentes à l'intersection de la recherche et de l'ingénierie.",
    stats: [
      { value: "5+", label: "Projets IA" },
      { value: "15+", label: "Algorithmes" },
      { value: "M1", label: "Niveau" },
    ],
  },
  about: {
    title: "Construire l'IA de demain",
    paragraphs: [
      "Je suis un étudiant en Master 1 d'Intelligence Artificielle, passionné par la création de systèmes intelligents.",
      "Mon parcours combine une solide base mathématique avec une expertise pratique en Deep Learning, NLP et Computer Vision.",
      "Quand je ne code pas des modèles, je lis des papiers de recherche et explore les frontières de l'IA générative.",
    ],
    tags: ["Deep Learning", "NLP", "Computer Vision", "MLOps", "PyTorch", "Recherche"],
    timeline: [
      { year: "2024–2025", title: "Master 1 — Intelligence Artificielle", place: "Université / École", desc: "Deep Learning, NLP, Computer Vision, Reinforcement Learning, MLOps" },
      { year: "2023–2024", title: "Licence 3 — Informatique", place: "Université", desc: "Algorithmique, Bases de données, POO" },
      { year: "2023", title: "Stage — Data Analyst", place: "Entreprise Tech", desc: "Analyse de données, visualisation, modèles prédictifs" },
    ],
  },
  skills: [
    {
      category: "IA & Machine Learning",
      color: "neural-blue",
      items: [
        { name: "PyTorch / TensorFlow", level: 85 },
        { name: "Scikit-learn", level: 90 },
        { name: "Hugging Face", level: 78 },
        { name: "OpenCV", level: 72 },
      ],
    },
    {
      category: "Langages & Frameworks",
      color: "neural-violet",
      items: [
        { name: "Python", level: 92 },
        { name: "JavaScript / React", level: 80 },
        { name: "Node.js", level: 75 },
        { name: "SQL / NoSQL", level: 70 },
      ],
    },
    {
      category: "MLOps & Cloud",
      color: "neural-pink",
      items: [
        { name: "Docker / Kubernetes", level: 65 },
        { name: "AWS / GCP", level: 60 },
        { name: "MLflow / DVC", level: 68 },
        { name: "FastAPI", level: 78 },
      ],
    },
  ],
  techs: [
    { label: "Python", bg: "#3776AB" },
    { label: "PyTorch", bg: "#EE4C2C" },
    { label: "TensorFlow", bg: "#FF6F00" },
    { label: "React", bg: "#61DAFB" },
    { label: "Docker", bg: "#2496ED" },
    { label: "AWS", bg: "#FF9900" },
    { label: "Git", bg: "#F05032" },
    { label: "Linux", bg: "#FCC624" },
  ],
  testimonials: [
    {
      id: 1,
      name: "Prof. Marie Dupont",
      role: "Directrice Master IA",
      text: "Un étudiant exceptionnel avec une capacité rare à combiner rigueur mathématique et créativité technique. Ses projets en Deep Learning dépassent largement le niveau attendu.",
      avatar: "MD",
      color: "neural-blue",
    },
    {
      id: 2,
      name: "Thomas Laurent",
      role: "CTO — DataVision",
      text: "Stage remarquable. A su prendre en main des problématiques complexes de NLP en quelques jours et livrer un modèle de qualité production. Je le recommande sans réserve.",
      avatar: "TL",
      color: "neural-violet",
    },
    {
      id: 3,
      name: "Sarah Chen",
      role: "Lead ML Engineer",
      text: "Passionné, autonome et toujours à la pointe des dernières avancées en IA. Sa maîtrise de PyTorch et des Transformers est impressionnante pour un étudiant en M1.",
      avatar: "SC",
      color: "neural-pink",
    },
  ],
  projects: [
    { id: 1, title: "Système de Détection d'Émotions", desc: "Modèle de vision par ordinateur pour détecter les émotions faciales en temps réel avec ResNet50.", tags: ["Computer Vision", "PyTorch", "OpenCV"], color: "neural-blue", stats: { accuracy: "89%", dataset: "35k images", fps: "30fps" }, github: "#", demo: "#", featured: true, image: "" },
    { id: 2, title: "Chatbot NLP Multilingue", desc: "Assistant conversationnel basé sur un Transformer fine-tuné avec RAG.", tags: ["NLP", "Transformers", "RAG", "FastAPI"], color: "neural-violet", stats: { langs: "2 langues", params: "125M", latency: "<200ms" }, github: "#", demo: "#", featured: true, image: "" },
    { id: 3, title: "Prédiction de Séries Temporelles", desc: "Modèle LSTM + attention pour prédire des séries temporelles financières.", tags: ["LSTM", "Time Series", "Pandas"], color: "neural-green", stats: { rmse: "2.4%", horizon: "30 jours", data: "5 ans" }, github: "#", demo: "#", featured: false, image: "" },
  ],
  contact: {
    email: "votre@email.com",
    github: "https://github.com/votre-username",
    linkedin: "https://linkedin.com/in/votre-profil",
    twitter: "https://twitter.com/votre-username",
    available: true,
    availabilityText: "Stage / Alternance / Freelance en IA",
  },
};

async function seed() {
  await connectDB();
  for (const [section, data] of Object.entries(DEFAULT_CONTENT)) {
    await Content.findOneAndUpdate({ section }, { section, data }, { upsert: true, new: true });
    console.log(`✅ Section "${section}" initialisée`);
  }
  console.log("🎉 Base de données initialisée avec succès !");
  process.exit(0);
}

seed().catch(err => { console.error("❌ Erreur:", err); process.exit(1); });
