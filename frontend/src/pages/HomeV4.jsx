import { useEffect, useRef, useState, useMemo, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import "../styles/home-v4.css";
import { useLang } from "../context/LangContext";

/* ── Traduction FR → EN des textes fixes (le contenu de l'admin est traduit par le serveur) ── */
let LANG = "fr";
const EN = {
 "À propos": "About",
 "Arsenal": "Skills",
 "IA Lab": "AI Lab",
 "Projets": "Projects",
 "Formation": "Education",
 "Contact": "Contact",
 "Me contacter": "Contact me",
 "Me contacter →": "Contact me →",
 "INGÉNIEUR IA · AGENTS LLM & RAG": "AI ENGINEER · LLM AGENTS & RAG",
 "Bonjour, je suis": "Hi, I'm",
 "Ingénieur IA en alternance": "AI Engineer, work-study",
 "Développeur d'agents LLM": "LLM agent developer",
 "Étudiant Master 2 IA": "Master's student in AI",
 "Ingénieur IA en alternance chez ACENSI. Je conçois des agents LLM, des architectures RAG et les plateformes qui les font tourner. Étudiant en Master 2 à l'École Hexagone.": "AI engineer (work-study) at ACENSI. I design LLM agents, RAG architectures and the platforms that run them. Master's student at École Hexagone.",
 "Voir mes projets →": "See my projects →",
 "IA Lab →": "AI Lab →",
 "Stages": "Internships",
 "Ingénierie Data & IA": "Data & AI Engineering",
 "Construire l'IA de demain": "Building tomorrow's AI",
 "Télécharger mon CV ↓": "Download my CV ↓",
 "parcours": "journey",
 "glisse pour tourner": "drag to rotate",
 "Réseau neuronal 3D animé": "Animated 3D neural network",
 "Mon": "My",
 "arsenal technique": "tech stack",
 "Des outils maîtrisés à travers des projets académiques, des stages et une veille constante.": "Tools mastered through academic projects, internships and constant tech watch.",
 "TECHNOLOGIES UTILISÉES": "TECHNOLOGIES USED",
 "Fonctionnalités": "Features",
 "propulsées par l'IA": "powered by AI",
 "Ces outils interactifs démontrent mes compétences en IA appliquée. Chaque fonctionnalité appelle un LLM en temps réel.": "These interactive tools showcase my applied AI skills. Each one calls an LLM in real time.",
 "Chatbot IA": "AI Chatbot",
 "Discutez avec mon assistant IA": "Chat with my AI assistant",
 "Analyseur": "Analyzer",
 "Analyse de sentiment & ton": "Sentiment & tone analysis",
 "Review automatique de code": "Automated code review",
 "Bio IA": "AI Bio",
 "Générateur de bio IA": "AI bio generator",
 "Quiz IA": "AI Quiz",
 "Testez vos connaissances IA": "Test your AI knowledge",
 "chargement…": "loading…",
 "Bonjour ! Je suis l'assistant IA d'Adem SASSI.\n\nJe peux vous renseigner sur :\n- Ses projets réalisés\n- Ses compétences techniques\n- Ses stages et expériences\n- Sa disponibilité\n- Ses informations de contact": "Hi! I'm Adem SASSI's AI assistant.\n\nI can tell you about:\n- His projects\n- His technical skills\n- His internships and experience\n- His availability\n- How to contact him",
 "Quels sont ses projets ?": "What are his projects?",
 "Quelles sont ses compétences ?": "What are his skills?",
 "Comment le contacter ?": "How can I contact him?",
 "Quels stages a-t-il effectués ?": "What internships has he done?",
 "Sa formation ?": "What's his education?",
 "Est-il disponible ?": "Is he available?",
 "Désolé, une erreur s'est produite.": "Sorry, something went wrong.",
 "Erreur de connexion au serveur.": "Server connection error.",
 "prêt": "ready",
 "copié ✓": "copied ✓",
 "copier": "copy",
 "Copier la réponse": "Copy reply",
 "Pose une question sur Adem…": "Ask a question about Adem…",
 "Voir les projets": "See projects",
 "Voir l'arsenal": "See skills",
 "Voir le parcours": "See journey",
 "Écrire à Adem": "Write to Adem",
 "Télécharger le CV": "Download CV",
 "Ce que j'ai": "What I've",
 "construit": "built",
 "Des projets allant de la recherche fondamentale aux applications déployées en production. Clique sur un projet pour le détail.": "From fundamental research to apps deployed in production. Click a project for details.",
 "Tous": "All",
 "IA": "AI",
 "Autre": "Other",
 "projet": "project",
 "★ projet phare · ": "★ featured project · ",
 "en ligne": "live",
 "Voir en live ↗": "View live ↗",
 "Code source ↗": "Source code ↗",
 "Détails →": "Details →",
 "Détails": "Details",
 "Démo ↗": "Demo ↗",
 "Voir tous mes projets sur GitHub ↗": "See all my projects on GitHub ↗",
 "Détail du projet ": "Project details: ",
 "Fermer": "Close",
 "offre": "job",
 "École Hexagone · Versailles · 2026-2027, en alternance chez ACENSI.": "École Hexagone · Versailles · 2026-2027, work-study at ACENSI.",
 "en cours": "in progress",
 "validé": "completed",
 "de cours": "of classes",
 "matières": "subjects",
 "séances": "sessions",
 "de l'année effectuée": "of the year completed",
 "Tout": "All",
 "aujourd'hui": "today",
 "terminé": "done",
 "à venir": "upcoming",
 "IA & ML": "AI & ML",
 "Data & calcul": "Data & computing",
 "IA appliquée": "Applied AI",
 "Pro & transverse": "Professional skills",
 "Projet de certification": "Certification project",
 "Traitement et création de sons": "Sound processing & creation",
 "Apprentissage par renforcement": "Reinforcement learning",
 "Rapport professionnel": "Professional report",
 "Traitement du langage naturel": "Natural language processing",
 "Big Data avancé, Airflow": "Advanced Big Data, Airflow",
 "Reconnaissance émotionnelle": "Emotion recognition",
 "ML quantique": "Quantum ML",
 "IA et cybersécurité": "AI & cybersecurity",
 "IA et jeu vidéo": "AI & video games",
 "LLM, IA générative, LangChain": "LLMs, generative AI, LangChain",
 "Gouvernance stratégique": "Strategic governance",
 "Les grands témoins": "Guest speakers",
 "Méthodes de simulation": "Simulation methods",
 "Anglais": "English",
 "Semestre 1": "Semester 1",
 "Semestre 2": "Semester 2",
 "Algèbre linéaire": "Linear algebra",
 "Matrices, vecteurs, transformations linéaires pour l'IA": "Matrices, vectors, linear transformations for AI",
 "Algorithmique numérique": "Numerical algorithms",
 "Méthodes numériques et optimisation": "Numerical methods and optimization",
 "Electronique": "Electronics",
 "Circuits électroniques et systèmes embarqués": "Electronic circuits and embedded systems",
 "Langages C & C++": "C & C++",
 "Programmation système et bas niveau": "Systems and low-level programming",
 "Probabilités et statistiques": "Probability & statistics",
 "Inférence statistique, distributions, tests d'hypothèses": "Statistical inference, distributions, hypothesis testing",
 "Programmation avancée": "Advanced programming",
 "Algorithmes avancés et structures de données": "Advanced algorithms and data structures",
 "Programmation Logique": "Logic programming",
 "Logique formelle et programmation déclarative": "Formal logic and declarative programming",
 "Python avancé pour la data science et l'IA": "Advanced Python for data science and AI",
 "Algorithmes supervisés et non-supervisés, modèles prédictifs": "Supervised and unsupervised algorithms, predictive models",
 "Analyse des données": "Data analysis",
 "Exploration, visualisation et traitement de données": "Data exploration, visualization and processing",
 "Big Data, traitement distribué, PySpark": "Big Data, distributed processing, PySpark",
 "Déploiement et monitoring de modèles ML en production": "Deploying and monitoring ML models in production",
 "Systèmes automatiques": "Control systems",
 "Automatisation et systèmes de contrôle": "Automation and control systems",
 "Architecture cloud, services AWS/Azure/GCP": "Cloud architecture, AWS/Azure/GCP services",
 "SQL et NoSQL": "SQL & NoSQL",
 "Bases de données relationnelles et non-relationnelles": "Relational and non-relational databases",
 "Projet individuel": "Individual project",
 "Projet de développement personnel en IA": "Personal AI development project",
 "Ce qu'ils disent": "What they say",
 "de moi": "about me",
 "stage": "internship",
 "recommandation": "recommendation",
 "Voir sur LinkedIn ↗": "View on LinkedIn ↗",
 "Travaillons": "Let's work",
 "ensemble": "together",
 "Un projet IA, une collaboration ou simplement envie d'échanger ? Écrivez-moi, je réponds personnellement.": "An AI project, a collaboration or just want to chat? Write to me, I reply personally.",
 "Disponible pour échanger": "Available to chat",
 "Indisponible pour le moment": "Unavailable for now",
 "Réponse": "Reply",
 "Basé à": "Based in",
 "Île-de-France": "Paris area",
 "Langues": "Languages",
 "email direct": "direct email",
 "Projet IA": "AI project",
 "Question technique": "Technical question",
 "Nom": "Name",
 "Sujet": "Subject",
 "Votre message": "Your message",
 "Message envoyé": "Message sent",
 "Je vous réponds sous 24 h.": "I'll get back to you within 24 h.",
 "sujet rapide": "quick topic",
 "Envoi en cours": "Sending",
 "Envoyer le message": "Send message",
 "Tous les champs sont obligatoires · réponse sous 24 h": "All fields are required · reply within 24 h",
 "Erreur d'envoi. Réessayez ou écrivez directement par email.": "Sending failed. Try again or email me directly.",
 "~/contact/nouveau_message": "~/contact/new_message",
 "livré à": "delivered to",
 "accusé de réception envoyé ✓": "confirmation sent ✓",
 "a-propos": "about",
 "competences": "skills",
 "ia-lab": "ai-lab",
 "projets": "projects",
 "formation": "education",
 "recommandations": "testimonials",
 "Agents LLM, RAG et les plateformes full-stack qui les font tourner.": "LLM agents, RAG and the full-stack platforms that run them.",
 "En alternance chez ACENSI, ouvert aux échanges": "Work-study at ACENSI, open to chat",
 "Liens": "Links",
 "Mon CV ↓": "My CV ↓",
 "Légal": "Legal",
 "Mentions légales": "Legal notice",
 "Confidentialité": "Privacy",
 "Conditions": "Terms",
 "Sécurité": "Security",
 "Statut": "Status",
 "Communauté": "Community",
 "Ne pas partager mes données": "Do not share my data",
 "tous droits réservés": "all rights reserved",
 "mis à jour le": "updated on",
 "Navigation du pied de page": "Footer navigation",
 "Télécharger CV": "Download CV",
 "Mon CV": "My CV",
 "Retour en haut": "Back to top"
};
const T = (x) => (LANG === "en" && typeof x === "string" && EN[x]) || x;
const LOC = () => (LANG === "en" ? "en-GB" : "fr-FR");

/* suivi anonyme (aucune donnée perso) → statistiques de l'admin */
function track(type, value = "") {
  try {
    fetch("/api/pulse/e", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type, value: String(value).slice(0, 200), lang: LANG }), keepalive: true }).catch(() => {});
  } catch { /* */ }
}

function LangSwitch() {
  const { lang, setLang } = useLang();
  return (
    <div className="lsw" role="group" aria-label="Langue / Language">
      {["fr", "en"].map((l) => <button key={l} className={lang === l ? "on" : ""} aria-pressed={lang === l} onClick={() => { if (l !== lang) track("lang", l); setLang(l); }}>{l.toUpperCase()}</button>)}
    </div>
  );
}
const TextAnalyzer = lazy(() => import("../components/ai/TextAnalyzer"));
const CodeReviewer = lazy(() => import("../components/ai/CodeReviewer"));
const BioGenerator = lazy(() => import("../components/ai/BioGenerator"));
const AIQuiz = lazy(() => import("../components/ai/AIQuiz"));

/* Tous les textes viennent de /api/content (modifiables depuis l'admin). */

const PHOTO = "/photo.jpg";
const TYPING = ["Ingénieur IA en alternance", "Développeur d'agents LLM", "Full-Stack Python & React", "RAG & LangGraph", "Étudiant Master 2 IA"];

const NAV = [
  ["about", "À propos"], ["skills", "Arsenal"], ["ai-features", "IA Lab"], ["projects", "Projets"],
  ["courses", "Formation"], ["contact", "Contact"],
];

const COLORS = {
  "neural-blue": "#00D4FF", "neural-violet": "#7B2FFF", "neural-pink": "#FF2FBB", "neural-green": "#00FF88",
  "neural-orange": "#FF8C00", "neural-red": "#FF3B3B", "neural-yellow": "#FFD700", "neural-cyan": "#00FFFF",
  "neural-white": "#F0F4FF", "neural-teal": "#00B4D8", "neural-indigo": "#4B0082", "neural-lime": "#39FF14",
};
const hex = (c, d = "#00D4FF") => (c && c.startsWith("#") ? c : COLORS[c] || d);

const COURSES = [
  { semester: "Semestre 1", color: "#00D4FF", subjects: [
    { name: "Algèbre linéaire", desc: "Matrices, vecteurs, transformations linéaires pour l'IA", icon: "🔢" },
    { name: "Algorithmique numérique", desc: "Méthodes numériques et optimisation", icon: "🧮" },
    { name: "Electronique", desc: "Circuits électroniques et systèmes embarqués", icon: "⚡" },
    { name: "Langages C & C++", desc: "Programmation système et bas niveau", icon: "🖥️" },
    { name: "Probabilités et statistiques", desc: "Inférence statistique, distributions, tests d'hypothèses", icon: "📊" },
    { name: "Programmation avancée", desc: "Algorithmes avancés et structures de données", icon: "💻" },
    { name: "Programmation Logique", desc: "Logique formelle et programmation déclarative", icon: "🧩" },
    { name: "Python", desc: "Python avancé pour la data science et l'IA", icon: "🐍" },
  ] },
  { semester: "Semestre 2", color: "#7B2FFF", subjects: [
    { name: "Machine Learning", desc: "Algorithmes supervisés et non-supervisés, modèles prédictifs", icon: "🤖" },
    { name: "Analyse des données", desc: "Exploration, visualisation et traitement de données", icon: "📈" },
    { name: "Hadoop Spark", desc: "Big Data, traitement distribué, PySpark", icon: "💾" },
    { name: "MLOps, Docker & Kubernetes", desc: "Déploiement et monitoring de modèles ML en production", icon: "⚙️" },
    { name: "Systèmes automatiques", desc: "Automatisation et systèmes de contrôle", icon: "🔧" },
    { name: "Cloud", desc: "Architecture cloud, services AWS/Azure/GCP", icon: "☁️" },
    { name: "SQL et NoSQL", desc: "Bases de données relationnelles et non-relationnelles", icon: "🗄️" },
    { name: "Projet individuel", desc: "Projet de développement personnel en IA", icon: "🚀" },
  ] },
];

/* ─────────────────────────── Utilitaires ─────────────────────────── */

const link = (u) => (!u || u === "#" ? "" : /^(https?:|mailto:)/.test(u) ? u : "https://" + u);
const initials = (n) => String(n || "?").split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
/* En cours = "actuellement"/"présent", ou date de fin pas encore passée (année scolaire finie fin août) */
const isNow = (y) => {
  const txt = String(y || "");
  if (/actuel|pr[ée]sent|aujourd|en cours|current|ongoing|now/i.test(txt)) return true;
  const m = [...txt.matchAll(/(?:(\d{1,2})\/)?(\d{4})/g)];
  if (!m.length) return false;
  const last = m[m.length - 1];
  const endYear = +last[2], endMonth = last[1] ? +last[1] : 8;
  const now = new Date(), cy = now.getFullYear(), cm = now.getMonth() + 1;
  return endYear > cy || (endYear === cy && cm <= endMonth);
};
const statsList = (s) => (!s ? [] : Array.isArray(s) ? s.map((x) => (typeof x === "object" ? [x.label || "", x.value ?? ""] : ["", x])) : Object.entries(s));

function useContent(lang) {
  const [c, setC] = useState(null);
  useEffect(() => {
    let off = false;
    fetch("/api/content?t=" + Date.now() + (lang === "en" ? "&lang=en" : "")).then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => { if (!off) setC(d); }).catch(() => { if (!off) setC((p) => p || {}); });
    return () => { off = true; };
  }, [lang]);
  return c;
}

function useStars(ref) {
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const x = c.getContext("2d");
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let s = [], w, h, raf, last = -1000;
    const r = () => {
      const d = devicePixelRatio || 1;
      w = c.width = innerWidth * d; h = c.height = innerHeight * d;
      s = Array.from({ length: innerWidth < 700 ? 45 : Math.min(140, innerWidth / 9) }, () => ({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.1 + 0.2, a: Math.random() * 6, v: Math.random() * 0.008 + 0.002 }));
    };
    const draw = (now = 0) => {
      if (!reduce) raf = requestAnimationFrame(draw);
      if (document.hidden || now - last < 33) return;
      last = now;
      const d = devicePixelRatio || 1;
      x.clearRect(0, 0, w, h);
      for (const p of s) {
        p.a += p.v;
        x.fillStyle = `rgba(232,240,255,${0.25 + Math.abs(Math.sin(p.a)) * 0.6})`;
        x.beginPath(); x.arc(p.x, p.y, p.r * d, 0, 7); x.fill();
      }
    };
    r(); draw(); addEventListener("resize", r);
    return () => { cancelAnimationFrame(raf); removeEventListener("resize", r); };
  }, [ref]);
}

function Spot({ as: Tag = "div", className = "", children, ...rest }) {
  const onMove = (e) => {
    const el = e.currentTarget, r = el.getBoundingClientRect();
    el.style.setProperty("--mx", e.clientX - r.left + "px");
    el.style.setProperty("--my", e.clientY - r.top + "px");
  };
  return <Tag className={"sp " + className} onPointerMove={onMove} {...rest}>{children}</Tag>;
}

function Counter({ value }) {
  const raw = String(value ?? "");
  const m = raw.match(/^(\d+)(.*)$/);
  const ref = useRef(null); const [v, setV] = useState(m ? 0 : raw);
  useEffect(() => {
    if (!m) { setV(raw); return; }
    const to = +m[1];
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return; io.disconnect();
      let cur = 0; const st = Math.max(1, Math.ceil(to / 25));
      const it = setInterval(() => { cur = Math.min(to, cur + st); setV(cur); if (cur >= to) clearInterval(it); }, 35);
    }, { threshold: 0.5 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, [raw]);
  return <b ref={ref}>{v}{m && m[2] && <em>{m[2]}</em>}</b>;
}

function Typing() {
  const [txt, setTxt] = useState("");
  useEffect(() => {
    let i = 0, j = 0, del = false, t;
    const tick = () => {
      const target = T(TYPING[i]);
      if (!del) { j++; setTxt(target.slice(0, j)); if (j === target.length) { del = true; t = setTimeout(tick, 1800); return; } }
      else { j--; setTxt(target.slice(0, j)); if (j === 0) { del = false; i = (i + 1) % TYPING.length; } }
      t = setTimeout(tick, del ? 40 : 75);
    };
    tick();
    return () => clearTimeout(t);
  }, []);
  return <div className="typing"><span>&gt;</span> {txt}<i className="tcur" /></div>;
}


/* ── modèle 3D : réseau neuronal en sphère (canvas, sans librairie) ── */
function Neural3D() {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d");
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const N = 110, pts = [], edges = [];
    const ga = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), t = ga * i;
      const j = 1 + (Math.sin(i * 12.9898) * 0.5) * 0.12;
      pts.push([Math.cos(t) * r * j, y * j, Math.sin(t) * r * j]);
    }
    for (let i = 0; i < N; i++) {
      const d = pts.map((q, k) => [k, (q[0] - pts[i][0]) ** 2 + (q[1] - pts[i][1]) ** 2 + (q[2] - pts[i][2]) ** 2]).sort((a, b) => a[1] - b[1]);
      for (let n = 1; n <= 3; n++) { const k = d[n][0]; if (k > i || !edges.some((e) => e[0] === k && e[1] === i)) edges.push([i, k]); }
    }
    const core = [];
    for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; core.push([Math.cos(a) * 0.38, Math.sin(a * 2) * 0.12, Math.sin(a) * 0.38]); }
    let W = 0, H = 0, raf = 0, vis = true, rx = -0.35, ry = 0, vy = reduce ? 0.0008 : 0.004, drag = null, tx = 0, ty = 0;
    let pulses = [];
    const size = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2), b = cv.getBoundingClientRect();
      W = b.width; H = b.height; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();
    const ro = new ResizeObserver(size); ro.observe(cv);
    const io = new IntersectionObserver(([e]) => { vis = e.isIntersecting; if (vis && !raf) raf = requestAnimationFrame(frame); }); io.observe(cv);
    const proj = (q) => {
      let [x, y, z] = q;
      const cy = Math.cos(ry), sy = Math.sin(ry); [x, z] = [x * cy - z * sy, x * sy + z * cy];
      const cx = Math.cos(rx), sx = Math.sin(rx); [y, z] = [y * cx - z * sx, y * sx + z * cx];
      const R = Math.min(W, H) * 0.38, f = 3 / (3 + z);
      return [W / 2 + x * R * f, H / 2 + y * R * f, z, f];
    };
    const mix = (z) => { const t = (z + 1) / 2; return [Math.round(t * 123), Math.round(212 - t * 165), 255]; };
    function frame() {
      raf = 0; if (!vis) return;
      if (!drag) { ry += vy + tx * 0.002; rx += (ty * 0.4 - 0.35 - rx) * 0.03; }
      ctx.clearRect(0, 0, W, H);
      const P = pts.map(proj), C = core.map(proj);
      const g = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.min(W, H) * 0.45);
      g.addColorStop(0, "rgba(0,212,255,.10)"); g.addColorStop(1, "rgba(123,47,255,0)");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.lineWidth = 1;
      for (const [a, b] of edges) {
        const A = P[a], B = P[b], z = (A[2] + B[2]) / 2, [r, gg, bb] = mix(z);
        ctx.strokeStyle = `rgba(${r},${gg},${bb},${0.08 + (1 - (z + 1) / 2) * 0.32})`;
        ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); ctx.stroke();
      }
      ctx.strokeStyle = "rgba(0,255,136,.35)"; ctx.beginPath();
      C.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]))); ctx.closePath(); ctx.stroke();
      for (const q of C) { ctx.fillStyle = "rgba(0,255,136,.8)"; ctx.beginPath(); ctx.arc(q[0], q[1], 1.6 * q[3], 0, 7); ctx.fill(); }
      const order = P.map((q, i) => i).sort((a, b) => P[b][2] - P[a][2]);
      for (const i of order) {
        const [x, y, z, f] = P[i], [r, gg, bb] = mix(z), a = 0.35 + (1 - (z + 1) / 2) * 0.65;
        ctx.fillStyle = `rgba(${r},${gg},${bb},${a})`; ctx.beginPath(); ctx.arc(x, y, 2.2 * f, 0, 7); ctx.fill();
      }
      if (!reduce && Math.random() < 0.12 && pulses.length < 14) pulses.push({ e: edges[(Math.random() * edges.length) | 0], t: 0 });
      pulses = pulses.filter((u) => (u.t += 0.025) < 1);
      for (const u of pulses) {
        const A = P[u.e[0]], B = P[u.e[1]], x = A[0] + (B[0] - A[0]) * u.t, y = A[1] + (B[1] - A[1]) * u.t;
        ctx.shadowColor = "#00D4FF"; ctx.shadowBlur = 12; ctx.fillStyle = "#bff4ff";
        ctx.beginPath(); ctx.arc(x, y, 2.4, 0, 7); ctx.fill(); ctx.shadowBlur = 0;
      }
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    const down = (e) => { drag = [e.clientX, e.clientY, rx, ry]; cv.setPointerCapture(e.pointerId); };
    const move = (e) => {
      const b = cv.getBoundingClientRect();
      tx = ((e.clientX - b.left) / b.width - 0.5) * 2; ty = ((e.clientY - b.top) / b.height - 0.5) * 2;
      if (drag) { ry = drag[3] + (e.clientX - drag[0]) * 0.008; rx = drag[2] + (e.clientY - drag[1]) * 0.008; }
    };
    const up = () => { drag = null; };
    const leave = () => { tx = 0; ty = 0; };
    cv.addEventListener("pointerdown", down); cv.addEventListener("pointermove", move);
    cv.addEventListener("pointerup", up); cv.addEventListener("pointerleave", leave);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); cv.removeEventListener("pointerdown", down); cv.removeEventListener("pointermove", move); cv.removeEventListener("pointerup", up); cv.removeEventListener("pointerleave", leave); };
  }, []);
  return (
    <div className="n3d">
      <canvas ref={ref} aria-label={T("Réseau neuronal 3D animé")} />
      <div className="n3d-l"><span>neural.net</span><span>{T("glisse pour tourner")}</span></div>
    </div>
  );
}


/* ── M2 2026-2027 (Pronote) ── */
const M2_THEMES = [
  ["IA & ML", "#00D4FF"],
  ["Data & calcul", "#7B2FFF"],
  ["IA appliquée", "#FF2FBB"],
  ["Pro & transverse", "#FFB547"],
];
const M2 = [
  ["AR/VR, Metaverse", 2, "2026-09-14", "2026-09-16", 21, 6],
  ["Business Intelligence", 1, "2026-09-17", "2026-12-11", 28, 8],
  ["Projet de certification", 3, "2026-09-18", "2027-05-20", 14, 4],
  ["Deep Learning", 0, "2026-09-21", "2026-10-16", 42, 12],
  ["Traitement et création de sons", 2, "2026-10-12", "2026-10-14", 21, 6],
  ["Apprentissage par renforcement", 0, "2026-11-09", "2026-12-09", 28, 8],
  ["MPI / OpenMP", 1, "2026-11-12", "2026-12-07", 21, 6],
  ["Rapport professionnel", 3, "2026-11-16", "2027-02-22", 14, 4],
  ["Traitement du langage naturel", 0, "2027-01-18", "2027-02-15", 21, 6],
  ["Big Data avancé, Airflow", 1, "2027-01-20", "2027-01-22", 21, 6],
  ["Reconnaissance émotionnelle", 0, "2027-02-16", "2027-02-22", 21, 6],
  ["ML quantique", 0, "2027-02-19", "2027-03-23", 28, 8],
  ["Cloud", 1, "2027-02-24", "2027-03-22", 21, 6],
  ["IA et cybersécurité", 2, "2027-03-24", "2027-04-21", 21, 6],
  ["IA et jeu vidéo", 2, "2027-03-26", "2027-04-23", 21, 6],
  ["LLM, IA générative, LangChain", 0, "2027-04-20", "2027-05-21", 28, 8],
  ["Gouvernance stratégique", 3, "2027-05-10", "2027-05-12", 21, 6],
  ["Les grands témoins", 3, "2027-05-13", "2027-05-14", 14, 4],
  ["Méthodes de simulation", 1, "2027-05-18", "2027-06-15", 21, 6],
  ["Anglais", 3, "2027-06-11", "2027-06-17", 21, 6],
].map(([name, t, a, b, h, n]) => ({ name, t, a: new Date(a + "T09:00"), b: new Date(b + "T17:00"), h, n }));
const Y0 = new Date("2026-09-01"), Y1 = new Date("2027-07-01");
const MONTHS = ["sept", "oct", "nov", "déc", "janv", "févr", "mars", "avr", "mai", "juin"];
const fmtD = (d) => d.toLocaleDateString(LOC(), { day: "numeric", month: "short" });

function Formation() {
  const [year, setYear] = useState("m2");
  const [theme, setTheme] = useState(-1);
  const [hover, setHover] = useState(null);
  const now = new Date();
  const pos = (d) => Math.max(0, Math.min(100, ((d - Y0) / (Y1 - Y0)) * 100));
  const state = (x) => (now > x.b ? "done" : now >= x.a ? "now" : "next");
  const total = M2.reduce((t, x) => t + x.h, 0);
  const seances = M2.reduce((t, x) => t + x.n, 0);
  const doneH = M2.reduce((t, x) => t + x.h * Math.max(0, Math.min(1, (now - x.a) / (x.b - x.a))), 0);
  const pct = Math.round((doneH / total) * 100);
  const current = M2.filter((x) => state(x) === "now");
  const nextOne = M2.filter((x) => state(x) === "next").sort((a, b) => a.a - b.a)[0];
  const info = hover || current[0] || nextOne;
  const todayX = pos(now);
  const rows = theme < 0 ? M2 : M2.filter((x) => x.t === theme);

  return (
    <>
      <div className="ytabs" role="tablist">
        <button role="tab" aria-selected={year === "m2"} className={"chip" + (year === "m2" ? " sel" : "")} onClick={() => setYear("m2")}>M2 · 2026-2027<em>{T("en cours")}</em></button>
        <button role="tab" aria-selected={year === "m1"} className={"chip" + (year === "m1" ? " sel" : "")} onClick={() => setYear("m1")}>M1 · 2025-2026<em>{T("validé")}</em></button>
      </div>

      {year === "m2" ? (
        <div className="m2">
          <div className="m2stats">
            <div><b>{total} h</b><small>{T("de cours")}</small></div>
            <div><b>{M2.length}</b><small>{T("matières")}</small></div>
            <div><b>{seances}</b><small>{T("séances")}</small></div>
            <div className="m2prog">
              <div className="m2bar"><i style={{ width: pct + "%" }} /></div>
              <b>{pct} %</b><small>{T("de l'année effectuée")}</small>
            </div>
          </div>

          <div className="m2filters">
            <button className={"chip" + (theme < 0 ? " sel" : "")} onClick={() => setTheme(-1)}>{T("Tout")}<em>{M2.length}</em></button>
            {M2_THEMES.map(([n, col], i) => (
              <button key={n} className={"chip" + (theme === i ? " sel" : "")} style={{ "--tc": col }} onClick={() => setTheme(theme === i ? -1 : i)}>
                <span className="tdot" />{T(n)}<em>{M2.filter((x) => x.t === i).reduce((t, x) => t + x.h, 0)} h</em>
              </button>
            ))}
          </div>

          <div className="gantt-wrap">
            <div className="gantt" onMouseLeave={() => setHover(null)}>
              <div className="g-head">
                <span />
                <div className="g-months">{MONTHS.map((m, k) => <span key={m}>{LANG === "en" ? ["sep", "oct", "nov", "dec", "jan", "feb", "mar", "apr", "may", "jun"][k] : m}</span>)}</div>
              </div>
              <div className="g-body">
                <div className="g-grid" aria-hidden="true">{MONTHS.map((m) => <i key={m} />)}</div>
                <div className="g-today" style={{ left: `calc(var(--gname) + (100% - var(--gname)) * ${todayX / 100})` }}><span>{T("aujourd'hui")}</span></div>
                {rows.map((x) => {
                  const st = state(x), col = M2_THEMES[x.t][1];
                  return (
                    <div key={x.name} className={"g-row " + st + (info === x ? " on" : "")} style={{ "--tc": col }} onMouseEnter={() => setHover(x)} onFocus={() => setHover(x)} tabIndex={0}>
                      <div className="g-name"><span>{T(x.name)}</span><small>{x.h} h</small></div>
                      <div className="g-track">
                        <i className="g-bar" style={{ left: pos(x.a) + "%", width: `max(8px, ${pos(x.b) - pos(x.a)}%)` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {info && (
            <div className="g-info" style={{ "--tc": M2_THEMES[info.t][1] }}>
              <span className={"g-st " + state(info)}>{T({ done: "terminé", now: "en cours", next: "à venir" }[state(info)])}</span>
              <b>{T(info.name)}</b>
              <small>{fmtD(info.a)} → {fmtD(info.b)} · {info.n} {T("séances")} · {info.h} h · {T(M2_THEMES[info.t][0])}</small>
            </div>
          )}
        </div>
      ) : (
        <div className="courses">
          {COURSES.map((s) => (
            <Spot className="sem" key={s.semester} style={{ "--pc": s.color }}>
              <div className="semh"><i />{T(s.semester)}<small>{s.subjects.length} {T("matières")}</small></div>
              <div className="subs">
                {s.subjects.map((x) => (
                  <div className="sub" key={x.name}><span className="ic">{x.icon}</span><div><b>{T(x.name)}</b><small>{T(x.desc)}</small></div></div>
                ))}
              </div>
            </Spot>
          ))}
        </div>
      )}
    </>
  );
}

function Head({ n, path, title, accent, sub }) {
  return (
    <div className="sh">
      <div className="path-l"><span className="num">{n}</span> ~/<b>{T(path)}</b></div>
      <h2>{title} {accent && <span className="grad">{accent}</span>}</h2>
      {sub && <p>{sub}</p>}
    </div>
  );
}

/* ─────────────────────────── Chatbot (IA Lab) ─────────────────────────── */

const SUGG = ["Quels sont ses projets ?", "Quelles sont ses compétences ?", "Comment le contacter ?", "Quels stages a-t-il effectués ?", "Sa formation ?", "Est-il disponible ?"];
const STEPS = ["router", "retrieve", "generate", "eval"];

function inlineMd(str, key = "") {
  const re = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)\s]+\)|`[^`]+`|https?:\/\/[^\s)]+|[\w.+-]+@[\w-]+(?:\.[\w-]+)+)/g;
  return String(str).split(re).map((p, i) => {
    const k = key + i;
    if (!p) return null;
    if (/^\*\*[^*]+\*\*$/.test(p)) return <b key={k}>{p.slice(2, -2)}</b>;
    const md = p.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
    if (md) return <a key={k} className="rlink" href={md[2]} target="_blank" rel="noopener noreferrer">{md[1]} ↗</a>;
    if (/^`[^`]+`$/.test(p)) return <code key={k}>{p.slice(1, -1)}</code>;
    if (/^https?:\/\//.test(p)) return <a key={k} className="rlink" href={p} target="_blank" rel="noopener noreferrer">{p.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")} ↗</a>;
    if (/^[\w.+-]+@[\w-]+(?:\.[\w-]+)+$/.test(p)) return <a key={k} className="rlink mail" href={"mailto:" + p}>✉ {p}</a>;
    return p;
  });
}

function Rich({ text, anim }) {
  const lines = String(text || "").split("\n").map((l) => l.trim()).filter(Boolean);
  let n = 0;
  return (
    <div className={"rich" + (anim ? " anim" : "")}>
      {lines.map((l, i) => {
        const st = { "--d": i * 70 + "ms" };
        const clean = l.replace(/^#+\s*/, "");
        const isLi = /^[-•▸*]\s/.test(clean), isNum = /^\d+[.)]\s/.test(clean);
        if (isLi || isNum) {
          const body = clean.replace(/^([-•▸*]|\d+[.)])\s*/, "");
          const m = body.match(/^\*\*([^*]+)\*\*\s*[:–-]\s*(.+)$/);
          n += 1;
          if (m) return (
            <div className="rcard" key={i} style={st}>
              <span className="rnum">{String(n).padStart(2, "0")}</span>
              <div><b>{m[1]}</b><p>{inlineMd(m[2], i + "-")}</p></div>
            </div>
          );
          return <div className="li" key={i} style={st}><span className="rdot" /><p>{inlineMd(body, i + "-")}</p></div>;
        }
        n = 0;
        const plain = clean.replace(/\*\*/g, "");
        if (/:$/.test(plain) && plain.length < 60) return <div className="rh" key={i} style={st}>{plain.replace(/:$/, "")}</div>;
        return <p key={i} style={st}>{inlineMd(clean, i + "-")}</p>;
      })}
    </div>
  );
}

const ACTIONS = [
  [/proje[ct]|github|r[ée]alis|built/i, "Voir les projets", "#projects"],
  [/comp[ée]tence|skill|techno|stack|python|react/i, "Voir l'arsenal", "#skills"],
  [/stage|internship|parcours|formation|education|master|bachelor|alternance|work-study/i, "Voir le parcours", "#about"],
  [/contact|e-?mail|[ée]crire|write|linkedin|opportunit/i, "Écrire à Adem", "#contact"],
  [/\bcv\b|curriculum/i, "Télécharger le CV", "/api/content/cv"],
];

function ReplyActions({ reply, asked, onAsk }) {
  const acts = ACTIONS.filter(([re]) => re.test(reply)).slice(0, 2);
  const next = SUGG.map(T).filter((q) => !asked.includes(q)).slice(0, 2);
  if (!acts.length && !next.length) return null;
  return (
    <div className="ractions">
      {acts.map(([, label, href]) => (
        <a key={href} className="ract" href={href} {...(href.startsWith("/api") ? { download: true } : {})}>{T(label)} {href.startsWith("/api") ? "↓" : "→"}</a>
      ))}
      {next.map((q) => <button key={q} className="rnext" onClick={() => onAsk(q)}>{q}</button>)}
    </div>
  );
}

function CopyBtn({ text }) {
  const [ok, setOk] = useState(false);
  return (
    <button className="rcopy" onClick={() => { navigator.clipboard?.writeText(text.replace(/\*\*/g, "")).then(() => { setOk(true); setTimeout(() => setOk(false), 1400); }).catch(() => {}); }} aria-label={T("Copier la réponse")}>
      {ok ? T("copié ✓") : T("copier")}
    </button>
  );
}

function ChatBot() {
  const [msgs, setMsgs] = useState([{ role: "assistant", content: "Bonjour ! Je suis l'assistant IA d'Adem SASSI.\n\nJe peux vous renseigner sur :\n- Ses projets réalisés\n- Ses compétences techniques\n- Ses stages et expériences\n- Sa disponibilité\n- Ses informations de contact" }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(-1);
  const [meta, setMeta] = useState(null);
  const box = useRef(null);

  useEffect(() => { if (box.current) box.current.scrollTop = box.current.scrollHeight; }, [msgs, loading]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");
    const next = [...msgs, { role: "user", content: msg }];
    setMsgs(next); setLoading(true); setMeta(null); track("chat", msg);
    const t0 = performance.now();
    let k = 0; setStep(0);
    const iv = setInterval(() => { k = Math.min(k + 1, 2); setStep(k); }, 450);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lang: LANG, messages: next.slice(1).map((m) => ({ role: m.role, content: m.content })) }),
      });
      const data = await res.json();
      clearInterval(iv); setStep(3);
      await new Promise((r) => setTimeout(r, 250));
      const reply = data.reply || T("Désolé, une erreur s'est produite.");
      setMsgs((p) => [...p, { role: "assistant", content: reply, ms: Math.round(performance.now() - t0), fresh: true }]);
      setMeta({ ms: Math.round(performance.now() - t0), tok: Math.round(reply.length / 4) });
    } catch {
      clearInterval(iv);
      setMsgs((p) => [...p, { role: "assistant", content: T("Erreur de connexion au serveur.") }]);
    } finally {
      setLoading(false); setStep(-1);
    }
  };

  return (
    <div className="chat">
      <div className="chat-graph">
        {STEPS.map((s, i) => (
          <span key={s} style={{ display: "contents" }}>
            {i > 0 && <span className={"edge" + (loading && step >= i ? " lit" : "")} />}
            <span className={"node" + (loading ? (i < step ? " done" : i === step ? " on" : "") : meta ? " done" : "")}>{s}</span>
          </span>
        ))}
      </div>
      <div className="chat-box" ref={box}>
        {msgs.map((m, i) => (
          <div key={i} className={"msg " + m.role}>
            {m.role === "assistant" ? <span className="av"><i /></span> : null}
            {m.role === "assistant" ? (
              <div className="bubble">
                <div className="rtop"><span>assistant</span>{m.ms ? <span>{(m.ms / 1000).toFixed(1)} s</span> : <span>{T("prêt")}</span>}{i > 0 && <CopyBtn text={m.content} />}</div>
                <Rich text={i === 0 ? T(m.content) : m.content} anim={m.fresh} />
                {i === msgs.length - 1 && i > 0 && !loading && (
                  <ReplyActions reply={m.content} asked={msgs.filter((x) => x.role === "user").map((x) => x.content)} onAsk={send} />
                )}
              </div>
            ) : <div className="bubble">{m.content}</div>}
          </div>
        ))}
        {loading && (
          <div className="msg assistant">
            <span className="av on"><i /></span>
            <div className="bubble think"><span className="tdots"><i /><i /><i /></span>{STEPS[Math.max(0, step)]}…</div>
          </div>
        )}
      </div>
      {msgs.length <= 1 && (
        <div className="ask">
          {SUGG.map((s) => <button key={s} className="chip" onClick={() => send(T(s))}>{T(s)}</button>)}
        </div>
      )}
      <form className="qbar" onSubmit={(e) => { e.preventDefault(); send(); }}>
        <span>&gt;</span>
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={T("Pose une question sur Adem…")} maxLength={500} aria-label="Message" disabled={loading} />
        <button type="submit" disabled={loading || !input.trim()}>{loading ? "…" : "run ↵"}</button>
      </form>
      <div className="trace-f">
        <span>model <b>gpt-oss-120b</b></span>
        <span>messages <b>{msgs.length}</b></span>
        <span>latency <b>{meta ? meta.ms + " ms" : "–"}</b></span>
        <span>tokens <b>{meta ? "~" + meta.tok : "–"}</b></span>
      </div>
    </div>
  );
}

const TABS = [
  ["chat", "Chatbot IA", "Discutez avec mon assistant IA"],
  ["text", "Analyseur", "Analyse de sentiment & ton"],
  ["code", "Code Review", "Review automatique de code"],
  ["bio", "Bio IA", "Générateur de bio IA"],
  ["quiz", "Quiz IA", "Testez vos connaissances IA"],
];

function AILab() {
  const [tab, setTab] = useState("chat");
  const t = TABS.find((x) => x[0] === tab);
  return (
    <>
      <div className="tabs" role="tablist">
        {TABS.map(([id, l]) => (
          <button key={id} role="tab" aria-selected={tab === id} className={"chip" + (tab === id ? " sel" : "")} onClick={() => setTab(id)}>{T(l)}</button>
        ))}
      </div>
      <p className="tabdesc">▸ {T(t[2])}</p>
      <div className="trace lab">
        <div className="trace-h"><span className="lights"><i /><i /><i /></span><span className="ttl">ai-lab / {tab}</span><span className="live"><i /> live</span></div>
        <div className={tab === "chat" ? "" : "lab-body legacy"}>
          {tab === "chat" && <ChatBot />}
          <Suspense fallback={<div className="lab-wait"><span className="tdots"><i /><i /><i /></span>{T("chargement…")}</div>}>
            {tab === "text" && <TextAnalyzer />}
            {tab === "code" && <CodeReviewer />}
            {tab === "bio" && <BioGenerator />}
            {tab === "quiz" && <AIQuiz />}
          </Suspense>
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────── Projets ─────────────────────────── */

const CATS = [
  ["IA", /\b(ia|ai|llm|groq|ml|machine|langchain|langgraph|rag|nlp|deep|gpt|agent)/i],
  ["Web", /\b(react|symfony|node|web|bootstrap|php|vercel|express|html|next|full)/i],
  ["IoT", /\b(iot|arduino|esp32|mqtt|bme|capteur|solidworks|c\+\+)/i],
  ["Mobile", /\b(android|mobile|react native|kotlin|swift)/i],
  ["Cloud", /\b(kubernetes|k8s|docker|terraform|helm|argo|ci\/cd|devops|cloud)/i],
];
const catsOf = (p) => {
  const hay = [p.title, ...(p.tags || [])].join(" ");
  const c = CATS.filter(([, r]) => r.test(hay)).map(([n]) => n);
  return c.length ? c : ["Autre"];
};
const GLYPH = { IA: "◈", Web: "</>", IoT: "◎", Mobile: "▣", Cloud: "☁", Autre: "✦" };

const slug = (t) => String(t || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 26);
const specsOf = (p) => statsList(p.stats).map(([, v]) => String(v)).filter((v) => v && v !== "#");

/* illustration générée selon la catégorie du projet */
function Art({ cat, v = 0 }) {
  const common = (
    <>
      <defs>
        <pattern id="pgrid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" className="a-grid" /></pattern>
      </defs>
      <rect width="400" height="220" fill="url(#pgrid)" />
    </>
  );
  const draw = {
    IoT: [(
      <g>
        {["M0 60H120V100H170", "M0 170H90V130H170", "M400 50H300V95H230", "M400 180H320V130H230", "M200 0V80", "M200 220V140"].map((d, i) => (
          <path key={i} d={d} className="a-s a-flow" style={{ animationDelay: i * 0.3 + "s" }} />
        ))}
        {[[120, 60], [90, 170], [300, 50], [320, 180]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="4" className="a-f" />)}
        <rect x="165" y="80" width="70" height="60" rx="8" className="a-chip" />
        {[0, 1, 2, 3].map((i) => <line key={i} x1={175 + i * 17} y1="80" x2={175 + i * 17} y2="72" className="a-s" />)}
        <circle cx="200" cy="110" r="10" className="a-f a-pulse" />
      </g>
    ), (
      <g>
        {[60, 110, 160].map((y) => <line key={y} x1="20" y1={y} x2="380" y2={y} className="a-s a-syn" />)}
        <path d={"M20 110" + Array.from({ length: 36 }, (_, i) => ` L${30 + i * 10} ${110 - Math.sin(i / 2.2) * 38 * Math.sin(i / 11 + 0.4)}`).join("")} className="a-s a-sig" />
        <rect x="292" y="26" width="84" height="28" rx="6" className="a-chip" />
        <text x="334" y="45" className="a-txt" textAnchor="middle">23.4 °C</text>
        <circle cx="30" cy="110" r="5" className="a-f a-pulse" style={{ transformOrigin: "30px 110px" }} />
      </g>
    ), (
      <g>
        {[30, 60, 90].map((r) => <circle key={r} cx="200" cy="110" r={r} className="a-s a-syn" />)}
        <line x1="110" y1="110" x2="290" y2="110" className="a-s a-syn" /><line x1="200" y1="20" x2="200" y2="200" className="a-s a-syn" />
        <g className="a-sweep"><path d="M200 110 L290 110 A90 90 0 0 0 263.6 46.4 Z" className="a-cone" /></g>
        {[[240, 80], [160, 140], [225, 160]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="5" className="a-f a-pulse" style={{ transformOrigin: `${x}px ${y}px`, animationDelay: i * 0.5 + "s" }} />)}
        <circle cx="200" cy="110" r="6" className="a-chip" />
      </g>
    ), (
      <g>
        <path d="M110 160 A90 90 0 0 1 290 160" className="a-s a-syn" style={{ strokeWidth: 10 }} />
        <path d="M110 160 A90 90 0 0 1 262 96" className="a-s" style={{ strokeWidth: 10 }} />
        <line x1="200" y1="160" x2="252" y2="112" className="a-s a-needle" style={{ strokeWidth: 3 }} />
        <circle cx="200" cy="160" r="9" className="a-chip" />
        <text x="200" y="198" className="a-txt" textAnchor="middle">68 %</text>
      </g>
    )],
    Mobile: (
      <g>
        <rect x="160" y="22" width="80" height="176" rx="14" className="a-chip" />
        <rect x="170" y="40" width="60" height="120" rx="4" className="a-s" />
        {[30, 55, 40, 70, 48].map((h, i) => <rect key={i} x={176 + i * 10} y={150 - h} width="6" height={h} rx="2" className="a-f a-bar" style={{ animationDelay: i * 0.12 + "s" }} />)}
        <circle cx="200" cy="180" r="5" className="a-s" />
        {[30, 50, 70].map((r, i) => <path key={i} d={`M${270} ${110 - r} A${r} ${r} 0 0 1 ${270} ${110 + r}`} className="a-s a-wave" style={{ animationDelay: i * 0.25 + "s" }} />)}
        {[30, 50, 70].map((r, i) => <path key={"l" + i} d={`M${130} ${110 - r} A${r} ${r} 0 0 0 ${130} ${110 + r}`} className="a-s a-wave" style={{ animationDelay: i * 0.25 + "s" }} />)}
      </g>
    ),
    Web: (
      <g>
        <rect x="70" y="30" width="260" height="160" rx="10" className="a-chip" />
        <line x1="70" y1="54" x2="330" y2="54" className="a-s" />
        {[0, 1, 2].map((i) => <circle key={i} cx={86 + i * 12} cy="42" r="3.5" className="a-f" />)}
        {[[90, 120], [110, 160], [110, 90], [90, 60], [110, 140], [130, 70]].map(([x, w], i) => (
          <rect key={i} x={x} y={70 + i * 18} width={w} height="7" rx="3.5" className={"a-f a-code" + (i % 3 === 1 ? " hi" : "")} style={{ animationDelay: i * 0.1 + "s" }} />
        ))}
        <rect x="250" y="70" width="64" height="100" rx="6" className="a-s" />
      </g>
    ),
    IA: [(
      <g>
        {(() => {
          const L = [[110, [60, 110, 160]], [200, [40, 85, 135, 180]], [290, [75, 145]]];
          const lines = [];
          L.slice(0, -1).forEach(([x, ys], li) => ys.forEach((y) => L[li + 1][1].forEach((y2) => lines.push(<line key={`${x}${y}${y2}`} x1={x} y1={y} x2={L[li + 1][0]} y2={y2} className="a-s a-syn" />))));
          return [...lines, ...L.flatMap(([x, ys]) => ys.map((y) => <circle key={`n${x}${y}`} cx={x} cy={y} r="7" className="a-node" />))];
        })()}
      </g>
    ), (
      <g>
        {[70, 270].map((x, k) => (
          <g key={x}>
            <rect x={x} y="40" width="60" height="78" rx="6" className="a-chip" />
            {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={x + 10} y={54 + i * 12} width={[40, 30, 36, 24, 34][(i + k) % 5]} height="5" rx="2.5" className="a-f a-code" />)}
          </g>
        ))}
        <path d="M130 80 C170 80 170 100 200 100 C230 100 230 80 270 80" className="a-s a-flow" />
        <circle cx="200" cy="100" r="26" className="a-node" />
        <text x="200" y="105" className="a-txt" textAnchor="middle">87%</text>
        <text x="100" y="140" className="a-txt dim" textAnchor="middle">CV</text>
        <text x="300" y="140" className="a-txt dim" textAnchor="middle">{T("offre")}</text>
        {["extract", "score", "decide", "generate"].map((t, i) => (
          <g key={t}><rect x={40 + i * 84} y="150" width="74" height="22" rx="11" className="a-s a-step" style={{ animationDelay: i * 0.35 + "s" }} /><text x={77 + i * 84} y="165" className="a-txt sm" textAnchor="middle">{t}</text></g>
        ))}
      </g>
    )],
    Cloud: (
      <g>
        <path d="M130 110a40 40 0 0 1 60-50a50 50 0 0 1 90 20a32 32 0 0 1 0 64H140a34 34 0 0 1-10-34z" className="a-chip" />
        {[0, 1, 2].map((i) => <rect key={i} x={160 + i * 30} y="160" width="22" height="22" rx="4" className="a-s" />)}
      </g>
    ),
  };
  return (
    <svg className="art" viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {common}
      {(Array.isArray(draw[cat]) ? draw[cat][v % draw[cat].length] : draw[cat]) || <g>{[30, 55, 80].map((r) => <circle key={r} cx="200" cy="110" r={r} className="a-s" />)}</g>}
    </svg>
  );
}

const ART_ORDER = ["Mobile", "IA", "Cloud", "IoT", "Web"];
const artCat = (p) => { const c = catsOf(p); return ART_ORDER.find((x) => c.includes(x)) || c[0]; };

function Cover({ p, big, v = 0 }) {
  const cat = artCat(p);
  if (p.image) return <div className={"cover img" + (big ? " big" : "")}><img src={p.image} alt={p.title} loading="lazy" decoding="async" /></div>;
  return (
    <div className={"cover" + (big ? " big" : "")} aria-hidden="true">
      <Art cat={cat} v={v} />
      <span className="cl">~/{cat.toLowerCase()}/{slug(p.title)}</span>
    </div>
  );
}

const tilt = (e) => {
  if (matchMedia("(hover: none)").matches) return;
  const el = e.currentTarget, r = el.getBoundingClientRect();
  el.style.setProperty("--ry", ((e.clientX - r.left) / r.width - 0.5) * 6 + "deg");
  el.style.setProperty("--rx", (0.5 - (e.clientY - r.top) / r.height) * 6 + "deg");
};
const untilt = (e) => { e.currentTarget.style.setProperty("--rx", "0deg"); e.currentTarget.style.setProperty("--ry", "0deg"); };

function Projects({ projects, github }) {
  const [f, setF] = useState("Tous");
  const [open, setOpen] = useState(-1);
  const counts = useMemo(() => {
    const m = {}; projects.forEach((p) => catsOf(p).forEach((c) => (m[c] = (m[c] || 0) + 1))); return m;
  }, [projects]);
  const filters = ["Tous", ...CATS.map(([n]) => n).filter((n) => counts[n]), ...(counts.Autre ? ["Autre"] : [])];
  const heroP = useMemo(() => projects.find((p) => p.featured && link(p.demo)) || projects.find((p) => p.featured) || null, [projects]);
  const shown = f === "Tous" ? projects.filter((p) => p !== heroP) : projects.filter((p) => catsOf(p).includes(f));
  const list = f === "Tous" && heroP ? [heroP, ...shown] : shown;
  const cur = open >= 0 ? list[open] : null;
  const vOf = useMemo(() => {
    const seen = {}, m = new Map();
    projects.forEach((p) => {
      const c = artCat(p);
      if (c === "IA") return m.set(p, /match|recrut/i.test(p.title) ? 1 : 0);
      m.set(p, (seen[c] = (seen[c] ?? -1) + 1));
    });
    return (p) => m.get(p) || 0;
  }, [projects]);
  const span = (i, n) => ((n % 3 === 2 && i >= n - 2) || (n % 3 === 1 && n > 3 && i >= n - 4) ? " wide" : "");

  useEffect(() => { if (cur) track("project", cur.title); }, [cur]);
  useEffect(() => {
    if (!cur) return;
    const k = (e) => {
      if (e.key === "Escape") setOpen(-1);
      if (e.key === "ArrowRight") setOpen((o) => (o + 1) % list.length);
      if (e.key === "ArrowLeft") setOpen((o) => (o - 1 + list.length) % list.length);
    };
    const root = document.querySelector(".v4");
    addEventListener("keydown", k); document.body.style.overflow = "hidden"; root?.classList.add("mopen");
    return () => { removeEventListener("keydown", k); document.body.style.overflow = ""; root?.classList.remove("mopen"); };
  }, [cur, list.length]);

  const Tags = ({ p, max = 4 }) => {
    const t = p.tags || [];
    return <div className="tags">{t.slice(0, max).map((x) => <span className="tag" key={x}>{x}</span>)}{t.length > max && <span className="tag more">+{t.length - max}</span>}</div>;
  };

  return (
    <>
      <div className="pbar">
        {filters.length > 2 && (
          <div className="tabs">
            {filters.map((n) => (
              <button key={n} className={"chip" + (f === n ? " sel" : "")} onClick={() => setF(n)}>{T(n)}<em>{n === "Tous" ? projects.length : counts[n]}</em></button>
            ))}
          </div>
        )}
        <span className="pcount">{String(list.length).padStart(2, "0")} {T("projet")}{list.length > 1 ? "s" : ""}</span>
      </div>

      {f === "Tous" && heroP && (
        <article className="pfeat" style={{ "--pc": hex(heroP.color) }} onPointerMove={tilt} onPointerLeave={untilt}>
          <button className="pf-art" onClick={() => setOpen(0)} aria-label={T("Détail du projet ") + heroP.title}>
            <Cover p={heroP} big v={vOf(heroP)} />
            {link(heroP.demo) && <span className="plive"><i />{T("en ligne")}</span>}
          </button>
          <div className="pf-body">
            <div className="num">{T("★ projet phare · ")}{catsOf(heroP).map(T).join(" · ")}</div>
            <h3>{heroP.title}</h3>
            <p>{heroP.desc}</p>
            {specsOf(heroP).length > 0 && <div className="specs">{specsOf(heroP).map((v) => <span key={v}>{v}</span>)}</div>}
            <Tags p={heroP} max={6} />
            <div className="cta">
              {link(heroP.demo) && <a className="btn primary" href={link(heroP.demo)} target="_blank" rel="noopener noreferrer">{T("Voir en live ↗")}</a>}
              <a className="btn" href={link(heroP.github) || github} target="_blank" rel="noopener noreferrer">{T("Code source ↗")}</a>
              <button className="pf-more" onClick={() => setOpen(0)}>{T("Détails →")}</button>
            </div>
          </div>
        </article>
      )}

      <div className="projects">
        {shown.map((p, i) => {
          const idx = list.indexOf(p);
          return (
            <article key={(p.id ?? p.title) + f} className={"proj" + span(i, shown.length)} style={{ "--pc": hex(p.color), animationDelay: i * 0.06 + "s" }} onPointerMove={tilt} onPointerLeave={untilt}>
              <button className="proj-open" onClick={() => setOpen(idx)} aria-label={T("Détail du projet ") + p.title}>
                <Cover p={p} v={vOf(p)} />
                <div className="pbody">
                  <div className="top"><span className="num">{catsOf(p).map(T).join(" · ")}</span><span className="arrow">↗</span></div>
                  <h3>{p.title}</h3>
                  <p>{p.desc}</p>
                  {specsOf(p).length > 0 && <div className="specs">{specsOf(p).map((v) => <span key={v}>{v}</span>)}</div>}
                  <Tags p={p} />
                </div>
              </button>
              <div className="plinks">
                <a href={link(p.github) || github} target="_blank" rel="noopener noreferrer">GitHub ↗</a>
                {link(p.demo) && <a className="demo" href={link(p.demo)} target="_blank" rel="noopener noreferrer">{T("Démo ↗")}</a>}
                <button onClick={() => setOpen(idx)}>{T("Détails")}</button>
              </div>
            </article>
          );
        })}
      </div>
      <div className="center"><a className="btn" href={github} target="_blank" rel="noopener noreferrer">{T("Voir tous mes projets sur GitHub ↗")}</a></div>

      {cur && (
        <div className="modal-bg" onClick={(e) => e.target === e.currentTarget && setOpen(-1)}>
          <div className="modal pm" role="dialog" aria-modal="true" aria-label={cur.title} style={{ "--pc": hex(cur.color) }} key={open}>
            <button className="x" onClick={() => setOpen(-1)} aria-label={T("Fermer")}>✕</button>
            <Cover p={cur} big v={vOf(cur)} />
            <div className="mb">
              <div className="num">{catsOf(cur).map(T).join(" · ")} · {String(open + 1).padStart(2, "0")}/{String(list.length).padStart(2, "0")}</div>
              <h3>{cur.title}</h3>
              <p>{cur.desc}</p>
              {specsOf(cur).length > 0 && <div className="specs">{specsOf(cur).map((v) => <span key={v}>{v}</span>)}</div>}
              <div className="mstack"><small>stack</small><div className="tags">{(cur.tags || []).map((t) => <span className="tag" key={t}>{t}</span>)}</div></div>
              <div className="cta">
                {link(cur.demo) && <a className="btn primary" href={link(cur.demo)} target="_blank" rel="noopener noreferrer">{T("Voir en live ↗")}</a>}
                <a className="btn" href={link(cur.github) || github} target="_blank" rel="noopener noreferrer">{T("Code source ↗")}</a>
              </div>
              {list.length > 1 && (
                <div className="pnav">
                  <button onClick={() => setOpen((open - 1 + list.length) % list.length)}>← {list[(open - 1 + list.length) % list.length].title}</button>
                  <button onClick={() => setOpen((open + 1) % list.length)}>{list[(open + 1) % list.length].title} →</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ─────────────────────────── Recommandations ─────────────────────────── */

function Testimonials({ list }) {
  const sorted = [...list].sort((a, b) => String(b.text || "").length - String(a.text || "").length);
  const [lead, ...rest] = sorted;
  const year = (t) => (String(t.role || "").match(/\b(20\d\d)\b/) || [])[1];
  const kind = (t) => (/stage|alternance/i.test(t.role || "") ? "stage" : "recommandation");
  const role = (t) => String(t.role || "").replace(/\s*[-–·,]?\s*\b20\d\d\b\s*$/, "").trim();
  const Badge = ({ t }) => (
    t.logo ? <img className="rlogo img" src={t.logo} alt="" loading="lazy" />
      : <span className="rlogo">{t.avatar && t.avatar.length >= 2 && t.avatar.length <= 3 ? t.avatar : initials(t.name)}</span>
  );
  const Card = ({ t, big, i }) => (
    <Spot as="article" className={"rec" + (big ? " lead" : "")} style={{ "--pc": hex(t.color, ["#00D4FF", "#7B2FFF", "#FF2FBB", "#00FF88"][i % 4]), animationDelay: i * 0.08 + "s" }}>
      <div className="rtop2">
        <Badge t={t} />
        <div className="rwho"><b>{t.name}</b><small>{role(t)}</small></div>
        <div className="rmeta">{year(t) && <span>{year(t)}</span>}<span className={"rk " + kind(t)}>{T(kind(t))}</span></div>
      </div>
      {big && <span className="qm">“</span>}
      <blockquote>{t.text}</blockquote>
      {link(t.linkedin) && <a className="rli" href={link(t.linkedin)} target="_blank" rel="noopener noreferrer">{T("Voir sur LinkedIn ↗")}</a>}
    </Spot>
  );
  if (!lead) return null;
  return (
    <div className={"recs" + (rest.length ? "" : " solo")}>
      <Card t={lead} big i={0} />
      {rest.length > 0 && <div className="rec-side">{rest.map((t, i) => <Card t={t} i={i + 1} key={t.id ?? t.name} />)}</div>}
    </div>
  );
}

/* ─────────────────────────── Contact ─────────────────────────── */

const TOPICS = ["Projet IA", "Collaboration", "Question technique", "Autre"];

function ContactForm({ email }) {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState("idle");
  const [err, setErr] = useState("");
  const on = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const filled = ["name", "email", "subject", "message"].filter((k) => form[k].trim()).length;
  const submit = async (e) => {
    e.preventDefault();
    if (honeypot) return;
    setStatus("loading"); setErr("");
    try {
      const res = await fetch("/api/admin/contact", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, honeypot, website: "" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur serveur");
      setStatus("success"); track("contact");
      const sent = form;
      setForm({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setStatus("idle"), 6000);
      try {
        await fetch("https://ntfy.sh/ademsassi-portfolio-contact", {
          method: "POST", body: `Nouveau message de ${sent.name} : ${sent.subject}`,
          headers: { Title: "Nouveau message portfolio", Priority: "high", Tags: "email" },
        });
      } catch { /* notification facultative */ }
    } catch (e2) {
      setStatus("error"); setErr(e2.message || T("Erreur d'envoi. Réessayez ou écrivez directement par email."));
      setTimeout(() => setStatus("idle"), 5000);
    }
  };
  const Field = ({ name, label, type = "text", area }) => (
    <label className={"fl" + (form[name] ? " has" : "")}>
      {area
        ? <textarea name={name} value={form[name]} onChange={on} required rows={6} maxLength={2000} placeholder=" " />
        : <input type={type} name={name} value={form[name]} onChange={on} required placeholder=" " autoComplete={name === "email" ? "email" : name === "name" ? "name" : "off"} />}
      <span>{label}</span>
      {area && <em>{form.message.length}/2000</em>}
    </label>
  );
  return (
    <form className="c2-form" onSubmit={submit}>
      <div className="trace-h"><span className="lights"><i /><i /><i /></span><span className="ttl">{T("~/contact/nouveau_message")}</span><span className="c2-prog">{filled}/4</span></div>
      <div className="c2-bar"><i style={{ width: filled * 25 + "%" }} /></div>
      <div className="c2-body">
        {status === "success" ? (
          <div className="c2-done">
            <div className="c2-check">✓</div>
            <h3>{T("Message envoyé")}</h3>
            <pre>{`> POST /api/admin/contact\n  200 OK · ${T("livré à")} ${email || "contact@ademsassi.com"}\n  ${T("accusé de réception envoyé ✓")}`}</pre>
            <p>{T("Je vous réponds sous 24 h.")}</p>
          </div>
        ) : (
          <>
            <div className="c2-topics">
              <span className="path-l">{T("sujet rapide")}</span>
              <div>{TOPICS.map((t) => <button type="button" key={t} className={"chip" + (form.subject === T(t) ? " sel" : "")} onClick={() => setForm((f) => ({ ...f, subject: T(t) }))}>{T(t)}</button>)}</div>
            </div>
            <div className="row2">{Field({ name: "name", label: T("Nom") })}{Field({ name: "email", label: "Email", type: "email" })}</div>
            {Field({ name: "subject", label: T("Sujet") })}
            {Field({ name: "message", label: T("Votre message"), area: true })}
            <input type="text" name="website" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} style={{ display: "none" }} tabIndex={-1} autoComplete="off" />
            {status === "error" && <div className="note ko">✕ {err}</div>}
            <button className={"c2-send" + (status === "loading" ? " busy" : "")} type="submit" disabled={status === "loading"}>
              <span>{status === "loading" ? T("Envoi en cours") : T("Envoyer le message")}</span><b>{status === "loading" ? "…" : "→"}</b>
            </button>
            <p className="fine">{T("Tous les champs sont obligatoires · réponse sous 24 h")}</p>
          </>
        )}
      </div>
    </form>
  );
}

/* ─────────────────────────── Page ─────────────────────────── */

export default function HomeV4() {
  const { lang } = useLang();
  LANG = lang;
  const C = useContent(lang) || {};
  useEffect(() => {
    try { if (!sessionStorage.getItem("v4seen")) { sessionStorage.setItem("v4seen", "1"); track("view", location.pathname); } } catch { /* */ }
    const onClick = (e) => {
      const a = e.target.closest && e.target.closest("a"); if (!a) return;
      const h = a.getAttribute("href") || "";
      if (h.includes("/api/content/cv")) track("cv");
      else if (h.startsWith("mailto:")) track("email");
      else if (/^https?:/.test(h) && !h.includes("ademsassi.com")) track("link", h.replace(/^https?:\/\/(www\.)?/, "").slice(0, 80));
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = lang === "en" ? "Adem SASSI - AI Engineer, LLM Agents & RAG | Full-Stack" : "Adem SASSI - Ingénieur IA, Agents LLM & RAG | Full-Stack";
  }, [lang]);
  const stars = useRef(null), spot = useRef(null), progress = useRef(null);
  const [active, setActive] = useState("");
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [photoOk, setPhotoOk] = useState(true);
  const [copied, setCopied] = useState(false);
  useStars(stars);

  const hero = C.hero || {};
  const about = C.about || {};
  const contact = C.contact || {};
  const skills = Array.isArray(C.skills) ? C.skills : [];
  const techs = Array.isArray(C.techs) ? C.techs : [];
  const projects = Array.isArray(C.projects) ? C.projects : [];
  const testimonials = Array.isArray(C.testimonials) ? C.testimonials : [];
  const stats = hero.stats || [{ value: "3", label: "Stages" }, { value: "5+", label: "Projets" }, { value: "M2", label: "Ingénierie Data & IA" }];
  const name = hero.name || "Adem SASSI";
  const GITHUB = link(contact.github) || "https://github.com/ADEM-SASSI";
  const aboutTitle = about.title || T("Construire l'IA de demain");
  const aw = aboutTitle.split(" ");

  useEffect(() => {
    const mv = (e) => { if (e.pointerType === "mouse" && spot.current) { spot.current.style.left = e.clientX + "px"; spot.current.style.top = e.clientY + "px"; } };
    let tk = false;
    const sc = () => {
      if (tk) return; tk = true;
      requestAnimationFrame(() => {
        tk = false; const h = document.documentElement;
        setScrolled(h.scrollTop > 40);
        if (progress.current) progress.current.style.transform = `scaleX(${h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight)})`;
      });
    };
    addEventListener("pointermove", mv); addEventListener("scroll", sc, { passive: true });
    return () => { removeEventListener("pointermove", mv); removeEventListener("scroll", sc); };
  }, []);

  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.06 });
    document.querySelectorAll(".v4 .reveal:not(.in)").forEach((el) => io.observe(el));
    const so = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)), { rootMargin: "-45% 0px -50% 0px" });
    document.querySelectorAll(".v4 section[id]").forEach((s) => so.observe(s));
    return () => { io.disconnect(); so.disconnect(); };
  }, [C.hero, C.projects, testimonials.length]);

  const socials = [
    ["GitHub", GITHUB], ["LinkedIn", link(contact.linkedin)], ["Twitter / X", link(contact.twitter)],
  ].filter(([, h]) => h);

  return (
    <div className="v4">
      <div className="progress" ref={progress} />
      <div className="sky"><canvas ref={stars} /></div>
      <div className="glow" />
      <div className="spot" ref={spot} />

      <nav className={scrolled ? "scrolled" : ""}><div className="wrap">
        <a className="logo" href="#top"><span className="mark">AS</span>ADEM<b>.</b>SASSI</a>
        <div className="links">
          {NAV.map(([id, l]) => <a key={id} href={"#" + id} className={active === id ? "act" : ""}>{T(l)}</a>)}
          <Link to="/blog" className="blog">Blog ↗</Link>
        </div>
        <div className="nr">
          <LangSwitch />
          <a className="btn primary sm" href="#contact">{T("Me contacter")}</a>
          <button className="burger" aria-label="Menu" onClick={() => setMenu((m) => !m)}><i /></button>
        </div>
      </div></nav>
      {menu && (
        <div className="mnav" onClick={() => setMenu(false)}>
          {NAV.map(([id, l], i) => <a key={id} href={"#" + id}><span>0{i + 1}</span> {T(l)}</a>)}
          <Link to="/blog"><span>→</span> Blog</Link>
        </div>
      )}

      <main id="top">
        <section id="home" className="hero wrap">
          <div className="hc enter">
            <div className="badge"><span className="dot" />{T("INGÉNIEUR IA · AGENTS LLM & RAG")}</div>
            <div className="avatar">
              {photoOk ? <img src={PHOTO} alt={name} width="150" height="150" fetchpriority="high" onError={() => setPhotoOk(false)} /> : <div className="ini">{initials(name)}</div>}
              <span className="on" />
            </div>
            <h1><span className="hi">{T("Bonjour, je suis")}</span><span className="grad">{name}</span></h1>
            <Typing />
            <p className="lede">{hero.description || T("Ingénieur IA en alternance chez ACENSI. Je conçois des agents LLM, des architectures RAG et les plateformes qui les font tourner. Étudiant en Master 2 à l'École Hexagone.")}</p>
            <div className="cta">
              <a className="btn primary" href="#projects">{T("Voir mes projets →")}</a>
              <a className="btn" href="#ai-features">{T("IA Lab →")}</a>
              <a className="btn ghost" href="/api/content/cv" download>CV ↓</a>
            </div>
            <div className="hstats">
              {stats.map((s, i) => <span key={i}><Counter value={s.value} /> {T(s.label)}</span>)}
            </div>
          </div>
          <a className="scroll" href="#about">SCROLL ↓</a>
        </section>

        <section id="about" className="reveal"><div className="wrap">
          <Head n="01" path="a-propos" title={aw.slice(0, -2).join(" ")} accent={aw.slice(-2).join(" ")} />
          <div className="agrid">
            <div className="aboutc">
              {(about.paragraphs || []).map((p, i) => <p key={i}>{p}</p>)}
              {(about.tags || []).length > 0 && <div className="tags">{about.tags.map((t) => <span className="tag" key={t}>{t}</span>)}</div>}
              <Neural3D />
              <a className="btn" href="/api/content/cv" download>{T("Télécharger mon CV ↓")}</a>
            </div>
            <div>
              <div className="path-l">{T("parcours")}</div>
              <div className="path">
                {(about.timeline || []).map((t, i) => (
                  <div className={"step" + (isNow(t.year) ? " now" : "")} key={i}>
                    <div className="d">{t.year}</div>
                    <div><h3>{t.title}</h3><div className="place">{t.place}</div>{t.desc && <p>{t.desc}</p>}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div></section>

        <section id="skills" className="reveal"><div className="wrap">
          <Head n="02" path="competences" title={T("Mon")} accent={T("arsenal technique")} sub={T("Des outils maîtrisés à travers des projets académiques, des stages et une veille constante.")} />
          <div className="skills">
            {skills.map((cat) => {
              const c = hex(cat.color);
              return (
                <Spot className="scard" key={cat.category} style={{ "--pc": c }}>
                  <div className="shead">
                    <span className="sic">{/lang/i.test(cat.category) ? "⟨/⟩" : /frame|web/i.test(cat.category) ? "◈" : /iot|syst/i.test(cat.category) ? "⬡" : /ia|ml|data/i.test(cat.category) ? "◎" : /dev|ops/i.test(cat.category) ? "∿" : "◆"}</span>
                    <div><h3>{cat.category}</h3><small>{(cat.items || []).length} technologies</small></div>
                  </div>
                  <ul>{(cat.items || []).map((it) => <li key={it.name || it}><i />{it.name || it}</li>)}</ul>
                </Spot>
              );
            })}
          </div>
          {techs.length > 0 && (
            <>
              <div className="divider"><span>{T("TECHNOLOGIES UTILISÉES")}</span></div>
              <div className="techs">
                {techs.map((t, i) => (
                  <span className="tech" key={i} style={{ "--tc": t.bg || "#00D4FF" }}>
                    {t.icon ? <img src={t.icon} alt="" width="16" height="16" loading="lazy" /> : <i />}{t.label}
                  </span>
                ))}
              </div>
            </>
          )}
        </div></section>

        <section id="ai-features" className="reveal"><div className="wrap">
          <Head n="03" path="ia-lab" title={T("Fonctionnalités")} accent={T("propulsées par l'IA")} sub={T("Ces outils interactifs démontrent mes compétences en IA appliquée. Chaque fonctionnalité appelle un LLM en temps réel.")} />
          <AILab />
        </div></section>

        {projects.length > 0 && (
          <section id="projects" className="reveal"><div className="wrap">
            <Head n="04" path="projets" title={T("Ce que j'ai")} accent={T("construit")} sub={T("Des projets allant de la recherche fondamentale aux applications déployées en production. Clique sur un projet pour le détail.")} />
            <Projects projects={projects} github={GITHUB} />
          </div></section>
        )}

        <section id="courses" className="reveal"><div className="wrap">
          <Head n="05" path="formation" title="Master 2" accent={T("Ingénierie Data & IA")} sub={T("École Hexagone · Versailles · 2026-2027, en alternance chez ACENSI.")} />
          <Formation />
        </div></section>

        {testimonials.length > 0 && (
          <section id="recommandations" className="reveal"><div className="wrap">
            <Head n="06" path="recommandations" title={T("Ce qu'ils disent")} accent={T("de moi")} />
            <Testimonials list={testimonials} />
          </div></section>
        )}

        <section id="contact" className="reveal"><div className="wrap">
          <Head n="07" path="contact" title={T("Travaillons")} accent={T("ensemble")} sub={T("Un projet IA, une collaboration ou simplement envie d'échanger ? Écrivez-moi, je réponds personnellement.")} />
          <div className="c2">
            <aside className="c2-side">
              <Spot className="c2-card">
                <div className="c2-me">
                  <div className="c2-av">{photoOk ? <img src={PHOTO} alt={name} width="64" height="64" loading="lazy" /> : <span>{initials(name)}</span>}<i className={contact.available ? "" : "off"} /></div>
                  <div><b>{name}</b><small>{hero.title || T("Ingénieur IA en alternance")}</small></div>
                </div>
                <div className={"c2-status" + (contact.available ? "" : " off")}><span className="dot" />{contact.available ? T("Disponible pour échanger") : T("Indisponible pour le moment")}</div>
                {contact.availabilityText && <p className="c2-av-t">{contact.availabilityText}</p>}
                <div className="c2-meta">
                  <div><small>{T("Réponse")}</small><b>&lt; 24 h</b></div>
                  <div><small>{T("Basé à")}</small><b>{T("Île-de-France")}</b></div>
                  <div><small>{T("Langues")}</small><b>FR · EN · AR</b></div>
                </div>
              </Spot>
              {contact.email && (
                <div className="c2-mail">
                  <small>{T("email direct")}</small>
                  <a href={"mailto:" + contact.email}>{contact.email}</a>
                  <button type="button" onClick={() => { try { navigator.clipboard.writeText(contact.email); } catch { /* */ } setCopied(true); setTimeout(() => setCopied(false), 1600); }}>{copied ? T("copié ✓") : T("copier")}</button>
                </div>
              )}
              <div className="c2-soc">
                {socials.map(([l, h]) => (
                  <a key={l} href={h} target="_blank" rel="noopener noreferrer"><span>{l === "GitHub" ? "GH" : l === "LinkedIn" ? "in" : "X"}</span>{l}<em>↗</em></a>
                ))}
              </div>
            </aside>
            <ContactForm email={contact.email} />
          </div>
        </div></section>
      </main>

      <footer><div className="wrap">
        <div className="ftop">
          <div className="fbrand">
            <a className="logo" href="#top"><span className="mark">AS</span>ADEM<b>.</b>SASSI</a>
            <p>{hero.title || T("Ingénieur IA en alternance")}. {T("Agents LLM, RAG et les plateformes full-stack qui les font tourner.")}</p>
            <div className="fstatus"><span className="dot" />{contact.availabilityText || T("En alternance chez ACENSI, ouvert aux échanges")}</div>
            <a className="btn primary sm" href="#contact">{T("Me contacter →")}</a>
          </div>
          <nav className="fcol" aria-label={T("Navigation du pied de page")}>
            <h3 className="fh">Navigation</h3>
            {NAV.map(([id, l]) => <a key={id} href={"#" + id}>{T(l)}</a>)}
            <Link to="/blog">Blog</Link>
          </nav>
          <div className="fcol">
            <h3 className="fh">{T("Liens")}</h3>
            {socials.map(([l, h]) => <a key={l} href={h} target="_blank" rel="noopener noreferrer">{l} ↗</a>)}
            {contact.email && <a href={"mailto:" + contact.email}>{contact.email}</a>}
            <a href="/api/content/cv" download>{T("Mon CV ↓")}</a>
          </div>
          <div className="fcol">
            <h3 className="fh">{T("Légal")}</h3>
            <Link to="/mentions-legales">{T("Mentions légales")}</Link>
            {[["Confidentialité", "/privacy"], ["Cookies", "/cookies"], ["Conditions", "/terms"], ["Sécurité", "/security"], ["Statut", "/status"], ["Docs", "/docs"], ["Communauté", "/community"], ["Ne pas partager mes données", "/do-not-share"]].map(([l, h]) => <Link key={h} to={h}>{T(l)}</Link>)}
          </div>
        </div>
        <div className="fbig" aria-hidden="true">ADEM SASSI</div>
        <div className="fbot">
          <span>© {new Date().getFullYear()} {name}, {T("tous droits réservés")}</span>
          <span>{T("mis à jour le")} {new Date(typeof __BUILD_DATE__ !== "undefined" ? __BUILD_DATE__ : Date.now()).toLocaleDateString(LOC(), { day: "numeric", month: "long", year: "numeric" })}</span>
          <span>React · Node.js · MongoDB · Groq · Vercel</span>
        </div>
      </div></footer>

      <Floating />
    </div>
  );
}

function Floating() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const on = () => setShow(scrollY > 400);
    addEventListener("scroll", on, { passive: true });
    return () => removeEventListener("scroll", on);
  }, []);
  return (
    <div className={"floating" + (show ? " show" : "")}>
      <a href="/api/content/cv" download title={T("Télécharger CV")} className="fcv">↓<span>{T("Mon CV")}</span></a>
      <button onClick={() => scrollTo({ top: 0, behavior: "smooth" })} title={T("Retour en haut")} aria-label={T("Retour en haut")}>↑</button>
    </div>
  );
}
