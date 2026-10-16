import { useEffect, useMemo, useRef, useState } from "react";
import {
  LogOut, Save, User, BookOpen, Code2, FolderOpen, Mail, Loader2, CheckCircle, Plus, Trash2, RefreshCw, History,
  Home, Upload, Cpu, Shield, Languages, Search, ChevronUp, ChevronDown, Copy, Star, ExternalLink, MessageSquare,
  Menu, X, AlertTriangle, LayoutDashboard, Quote, BarChart2, ArrowUpRight, Clock, Globe, FileText, Inbox, HardDrive, Download, Send, Ban,
} from "lucide-react";
import CVUpload from "./CVUpload";
import TechEditor from "./TechEditor";
import BlogEditor from "./BlogEditor";
import SecurityDashboard from "./SecurityDashboard";
import { StatsPanel, TranslationsPanel } from "./InsightsPanels";
import "../../styles/admin.css";

/* ─────────────────────────── Navigation ─────────────────────────── */

const NAV = [
  { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard, group: "Aperçu" },
  { id: "stats", label: "Statistiques", icon: BarChart2, group: "Aperçu" },
  { id: "hero", label: "Accueil", icon: Home, group: "Contenu", save: true, anchor: "home", desc: "Nom, titre, description et chiffres clés" },
  { id: "about", label: "À propos & parcours", icon: User, group: "Contenu", save: true, anchor: "about", desc: "Présentation, tags et timeline" },
  { id: "skills", label: "Compétences", icon: Cpu, group: "Contenu", save: true, anchor: "skills", desc: "Catégories de l'arsenal technique" },
  { id: "techs", label: "Technologies", icon: Code2, group: "Contenu", save: true, anchor: "skills", desc: "Logos « technologies utilisées »" },
  { id: "projects", label: "Projets", icon: FolderOpen, group: "Contenu", save: true, anchor: "projects", desc: "Cartes projets et projet phare" },
  { id: "testimonials", label: "Recommandations", icon: Quote, group: "Contenu", save: true, anchor: "recommandations", desc: "Avis, stages et liens LinkedIn" },
  { id: "contact", label: "Contact & dispo", icon: Mail, group: "Contenu", save: true, anchor: "contact", desc: "Email, réseaux et disponibilité" },
  { id: "cvpage", label: "CV web", icon: FileText, group: "Contenu", save: true, anchor: "/cv", desc: "Le CV en ligne sur /cv, rempli automatiquement" },
  { id: "recos", label: "Recos reçues", icon: Inbox, group: "Outils", desc: "Recommandations envoyées depuis le site, à valider" },
  { id: "blog", label: "Blog", icon: BookOpen, group: "Outils", desc: "Articles, brouillons et commentaires" },
  { id: "cv", label: "CV PDF", icon: Upload, group: "Outils", desc: "Le CV téléchargé depuis le site" },
  { id: "i18n", label: "Traductions EN", icon: Languages, group: "Outils", desc: "Corriger la version anglaise" },
  { id: "security", label: "Sécurité & visiteurs", icon: Shield, group: "Outils", desc: "Connexions, IP bloquées, visiteurs" },
  { id: "backup", label: "Sauvegardes", icon: HardDrive, group: "Outils", desc: "Sauvegarde de la base chaque lundi par email" },
  { id: "changelog", label: "Historique", icon: History, group: "Outils", desc: "Toutes les modifications" },
];
const SECTIONS = NAV.filter((n) => n.save).map((n) => n.id);
const COLORS = [
  ["neural-blue", "#00D4FF"], ["neural-violet", "#7B2FFF"], ["neural-pink", "#FF2FBB"], ["neural-green", "#00FF88"],
  ["neural-orange", "#FF8C00"], ["neural-red", "#FF3B3B"], ["neural-yellow", "#FFD700"], ["neural-cyan", "#00FFFF"],
  ["neural-white", "#F0F4FF"], ["neural-teal", "#00B4D8"], ["neural-indigo", "#4B0082"], ["neural-lime", "#39FF14"],
];
const hexOf = (c) => (c && c.startsWith("#") ? c : (COLORS.find(([n]) => n === c) || [, "#00D4FF"])[1]);
const H = (token) => ({ Authorization: `Bearer ${token}`, "Content-Type": "application/json" });
const clone = (x) => JSON.parse(JSON.stringify(x ?? null));
const fmtDate = (d) => new Date(d).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
const isNow = (y) => {
  const t = String(y || "");
  if (/actuel|pr[ée]sent|aujourd|en cours/i.test(t)) return true;
  const m = [...t.matchAll(/(?:(\d{1,2})\/)?(\d{4})/g)];
  if (!m.length) return false;
  const l = m[m.length - 1], ey = +l[2], em = l[1] ? +l[1] : 8, n = new Date();
  return ey > n.getFullYear() || (ey === n.getFullYear() && n.getMonth() + 1 <= em);
};
const move = (arr, i, d) => { const a = [...arr]; const j = i + d; if (j < 0 || j >= a.length) return a; [a[i], a[j]] = [a[j], a[i]]; return a; };

/* ─────────────────────────── Petits composants ─────────────────────────── */

function Field({ label, hint, value, onChange, area, rows = 3, placeholder, max, mono }) {
  const v = value ?? "";
  return (
    <label className="af">
      <span className="af-l">{label}{max && <em className={v.length > max ? "over" : ""}>{v.length}/{max}</em>}</span>
      {area
        ? <textarea rows={rows} value={v} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={mono ? "mono" : ""} />
        : <input value={v} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={mono ? "mono" : ""} />}
      {hint && <span className="af-h">{hint}</span>}
    </label>
  );
}

function Toggle({ on, onChange, label }) {
  return (
    <button type="button" className={"atg" + (on ? " on" : "")} onClick={() => onChange(!on)} aria-pressed={on}>
      <i /><span>{label}</span>
    </button>
  );
}

function Chips({ value = [], onChange, placeholder = "Ajouter… (Entrée)" }) {
  const [t, setT] = useState("");
  const add = () => { const v = t.trim(); if (v && !value.includes(v)) onChange([...value, v]); setT(""); };
  return (
    <div className="achips">
      {value.map((x, i) => (
        <span key={x + i} className="achip">{x}<button type="button" aria-label={"Retirer " + x} onClick={() => onChange(value.filter((_, j) => j !== i))}><X size={11} /></button></span>
      ))}
      <input value={t} placeholder={placeholder} onChange={(e) => setT(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); } if (e.key === "Backspace" && !t && value.length) onChange(value.slice(0, -1)); }}
        onBlur={add} />
    </div>
  );
}

function Swatches({ value, onChange }) {
  return (
    <div className="asw">
      {COLORS.map(([n, h]) => (
        <button key={n} type="button" title={n} aria-label={n} className={value === n ? "on" : ""} style={{ "--c": h }} onClick={() => onChange(n)} />
      ))}
    </div>
  );
}

function RowTools({ i, n, onMove, onDup, onDel }) {
  const [ask, setAsk] = useState(false);
  useEffect(() => { if (!ask) return; const t = setTimeout(() => setAsk(false), 3000); return () => clearTimeout(t); }, [ask]);
  return (
    <div className="arow-t">
      {onMove && <><button type="button" disabled={i === 0} onClick={() => onMove(i, -1)} aria-label="Monter"><ChevronUp size={14} /></button>
        <button type="button" disabled={i === n - 1} onClick={() => onMove(i, 1)} aria-label="Descendre"><ChevronDown size={14} /></button></>}
      {onDup && <button type="button" onClick={() => onDup(i)} aria-label="Dupliquer"><Copy size={13} /></button>}
      {onDel && (ask
        ? <button type="button" className="del sure" onClick={() => { setAsk(false); onDel(i); }}>Supprimer ?</button>
        : <button type="button" className="del" onClick={() => setAsk(true)} aria-label="Supprimer"><Trash2 size={13} /></button>)}
    </div>
  );
}

function Card({ title, sub, right, children }) {
  return (
    <section className="acard">
      {(title || right) && <header><div><h3>{title}</h3>{sub && <p>{sub}</p>}</div>{right}</header>}
      <div className="acard-b">{children}</div>
    </section>
  );
}

function Empty({ icon: I = Sparkle, text, action }) {
  return <div className="aempty"><I size={18} /><p>{text}</p>{action}</div>;
}
function Sparkle(p) { return <Star {...p} />; }

/* ─────────────────────────── Tableau de bord ─────────────────────────── */

function Dashboard({ token, data, go, addProject }) {
  const [sum, setSum] = useState(null);
  const [vis, setVis] = useState(null);
  const [logs, setLogs] = useState([]);
  useEffect(() => {
    fetch("/api/stats/summary?days=7", { headers: H(token) }).then((r) => r.json()).then(setSum).catch(() => {});
    fetch("/api/security/visitors", { headers: H(token) }).then((r) => r.json()).then(setVis).catch(() => {});
    fetch("/api/admin/changelog", { headers: H(token) }).then((r) => r.json()).then((d) => Array.isArray(d) && setLogs(d.slice(0, 6))).catch(() => {});
  }, []);
  const c = sum?.counts || {};
  const projects = data.projects || [], tms = data.testimonials || [];
  const todo = [
    ...projects.filter((p) => !p.demo || p.demo === "#").length ? [{ t: `${projects.filter((p) => !p.demo || p.demo === "#").length} projet(s) sans lien de démo`, go: "projects" }] : [],
    ...projects.filter((p) => !p.image).length ? [{ t: `${projects.filter((p) => !p.image).length} projet(s) sans image (une illustration auto est affichée)`, go: "projects", soft: true }] : [],
    ...tms.filter((x) => !x.linkedin).length ? [{ t: `${tms.filter((x) => !x.linkedin).length} recommandation(s) sans lien LinkedIn`, go: "testimonials" }] : [],
    ...!(data.contact?.available) ? [{ t: "Ta disponibilité est masquée sur le site", go: "contact" }] : [],
    ...!(data.about?.timeline || []).some((x) => isNow(x.year)) ? [{ t: "Aucune étape « en cours » dans ton parcours", go: "about" }] : [],
  ];
  const h = new Date().getHours();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 864e5), key = d.toLocaleDateString("sv-SE", { timeZone: "Europe/Paris" });
    return { label: d.toLocaleDateString("fr-FR", { weekday: "short" }), n: sum?.perDay?.find((x) => x.day === key)?.n || 0 };
  });
  const maxD = Math.max(1, ...days.map((d) => d.n));
  return (
    <div className="adash">
      <div className="ahello">
        <div>
          <p className="akicker">{new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</p>
          <h1>{h < 6 ? "Bonne nuit" : h < 18 ? "Bonjour" : "Bonsoir"}, {String(data.hero?.name || "Adem").split(" ")[0]} 👋</h1>
          <p className="asub">Voici ce qui se passe sur ademsassi.com cette semaine.</p>
        </div>
        <div className="ahello-a">
          <button className="abtn" onClick={() => go("blog")}><BookOpen size={14} />Nouvel article</button>
          <button className="abtn" onClick={addProject}><Plus size={14} />Ajouter un projet</button>
          <a className="abtn ghost" href="/" target="_blank" rel="noreferrer"><ArrowUpRight size={14} />Voir le site</a>
        </div>
      </div>

      <div className="akpis">
        {[
          ["Visites (7 j)", c.view ?? "–", "#00D4FF", sum?.langs?.en ? `dont ${sum.langs.en} en anglais` : "anonymes"],
          ["Questions au chatbot", c.chat ?? "–", "#7B2FFF", "7 derniers jours"],
          ["Projets ouverts", c.project ?? "–", "#FF2FBB", "7 derniers jours"],
          ["CV téléchargés", c.cv ?? "–", "#00FF88", `${c.contact || 0} message(s) reçu(s)`],
        ].map(([l, v, col, s]) => (
          <div className="akpi" key={l} style={{ "--c": col }}><b>{v}</b><span>{l}</span><small>{s}</small></div>
        ))}
      </div>

      <div className="agrid2">
        <Card title="Visites de la semaine" sub={vis ? `${vis.total ?? 0} visites au total · ${vis.today ?? 0} aujourd'hui` : " "} right={<button className="alink" onClick={() => go("stats")}>Détails →</button>}>
          <div className="abars">
            {days.map((d, i) => (
              <div key={i}><span style={{ height: `${Math.max(4, (d.n / maxD) * 100)}%` }} className={d.n ? "" : "z"} /><em>{d.n || ""}</em><small>{d.label}</small></div>
            ))}
          </div>
        </Card>
        <Card title="À faire" sub={todo.length ? `${todo.length} point(s) à regarder` : "Tout est en ordre"}>
          {todo.length ? (
            <ul className="atodo">
              {todo.map((x, i) => <li key={i} className={x.soft ? "soft" : ""}><AlertTriangle size={13} /><span>{x.t}</span><button className="alink" onClick={() => go(x.go)}>Corriger →</button></li>)}
            </ul>
          ) : <Empty icon={CheckCircle} text="Ton portfolio est complet 👌" />}
        </Card>
      </div>

      <div className="agrid2">
        <Card title="Dernières questions au chatbot" right={<button className="alink" onClick={() => go("stats")}>Tout voir →</button>}>
          {sum?.lastQuestions?.length ? (
            <ul className="alist">
              {sum.lastQuestions.slice(0, 5).map((q, i) => <li key={i}><MessageSquare size={13} /><span>{q.value}</span><small>{q.lang === "en" ? "EN · " : ""}{fmtDate(q.createdAt)}</small></li>)}
            </ul>
          ) : <Empty icon={MessageSquare} text="Pas encore de question cette semaine." />}
        </Card>
        <Card title="Dernières modifications" right={<button className="alink" onClick={() => go("changelog")}>Historique →</button>}>
          {logs.length ? (
            <ul className="alist">
              {logs.map((l, i) => <li key={i}><Clock size={13} /><span>{l.details}</span><small>{fmtDate(l.createdAt)}</small></li>)}
            </ul>
          ) : <Empty icon={History} text="Aucune modification récente." />}
        </Card>
      </div>

      <Card title="Raccourcis">
        <div className="aquick">
          {NAV.filter((n) => n.group !== "Aperçu").map((n) => { const I = n.icon; return (
            <button key={n.id} onClick={() => go(n.id)}><I size={16} /><b>{n.label}</b><small>{n.desc}</small></button>
          ); })}
        </div>
      </Card>
    </div>
  );
}

/* ─────────────────────────── Éditeurs de contenu ─────────────────────────── */

function PhotoCard({ token }) {
  const ref = useRef(null);
  const [v, setV] = useState(Date.now());
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const [drag, setDrag] = useState(false);

  // recadrage carré centré + compression JPEG 720 px dans le navigateur
  const toJpeg = (file) => new Promise((ok, ko) => {
    const url = URL.createObjectURL(file), img = new Image();
    img.onload = () => {
      const side = Math.min(img.naturalWidth, img.naturalHeight), S = Math.min(720, side);
      const c = document.createElement("canvas"); c.width = c.height = S;
      const g = c.getContext("2d"); g.imageSmoothingQuality = "high";
      g.drawImage(img, (img.naturalWidth - side) / 2, (img.naturalHeight - side) / 2, side, side, 0, 0, S, S);
      URL.revokeObjectURL(url);
      ok(c.toDataURL("image/jpeg", 0.86).split(",")[1]);
    };
    img.onerror = () => { URL.revokeObjectURL(url); ko(new Error("Image illisible (essaie un JPG ou PNG)")); };
    img.src = url;
  });

  const upload = async (f) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) return setMsg({ k: "err", t: "Choisis une image (JPG, PNG, WebP)." });
    setBusy(true); setMsg(null);
    try {
      const file = await toJpeg(f);
      const r = await fetch("/api/admin/upload-photo", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ file }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || "Erreur d'envoi");
      setV(Date.now()); setMsg({ k: "ok", t: "Photo mise à jour. Visible sur le site d'ici une minute." });
    } catch (e) { setMsg({ k: "err", t: e.message }); }
    setBusy(false);
  };

  const reset = async () => {
    setBusy(true); setMsg(null);
    try {
      await fetch("/api/admin/delete-photo", { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      setV(Date.now()); setMsg({ k: "ok", t: "Photo par défaut remise." });
    } catch { setMsg({ k: "err", t: "Erreur." }); }
    setBusy(false);
  };

  return (
    <Card title="Photo de profil" sub="Recadrée en carré automatiquement. Utilisée en haut de page, dans la carte contact et sur le blog.">
      <div className={"aphoto" + (drag ? " drag" : "")}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); upload(e.dataTransfer.files[0]); }}>
        <img src={`/photo.jpg?v=${v}`} alt="Photo actuelle" width="96" height="96" onError={(e) => { e.currentTarget.src = "/photo-default.jpg"; }} />
        <div className="aphoto-r">
          <div className="aphoto-b">
            <button className="abtn" disabled={busy} onClick={() => ref.current?.click()}>{busy ? <Loader2 size={14} className="spin" /> : <Upload size={14} />}Changer la photo</button>
            <button className="abtn ghost" disabled={busy} onClick={reset}><RefreshCw size={14} />Photo par défaut</button>
          </div>
          <small>Ou glisse une image ici · JPG, PNG, WebP</small>
          {msg && <p className={"aphoto-m " + msg.k}>{msg.t}</p>}
        </div>
        <input ref={ref} type="file" accept="image/*" hidden onChange={(e) => { upload(e.target.files[0]); e.target.value = ""; }} />
      </div>
    </Card>
  );
}

/* ─────────────────────────── CV web, recos reçues, sauvegardes ─────────────────────────── */

const CV_SEED = {
  title: "Ingénieur IA · Full-Stack",
  description: "Étudiant en **M2 Ingénierie Data & IA** à l'École Hexagone (Versailles), en alternance chez **ACENSI**. Je combine un profil rare : **IA et développement web full-stack**. Rythme : 3 semaines en entreprise / 1 semaine en formation.",
  text: "Objectif : concevoir des agents IA et des plateformes LLM fiables en production (LangGraph, RAG, React).",
  location: "Île-de-France",
  experiences: [
    { title: "Consultant IA Junior (alternance)", place: "ACENSI", year: "09/2026 – Aujourd'hui", bullets: [{ text: "Développement d'**agents IA** et de workflows multi-agents avec **LangGraph**." }, { text: "Pipelines **RAG** : embeddings, base vectorielle Qdrant, modèles servis avec vLLM." }, { text: "Front **React** de la plateforme d'agents." }] },
    { title: "Développeur Mobile", place: "NetData Innovation (stage)", year: "05/2025 – 07/2025", bullets: [{ text: "Application Android de monitoring temps réel (Java, Android Studio)." }, { text: "Intégration des services système : **TelephonyManager, WifiManager, BatteryManager, GPS**." }, { text: "Suivi batterie, connectivité, capteurs et réseau mobile." }] },
    { title: "Stage IoT — Train Intelligent", place: "École Hexagone", year: "07/2024 – 09/2024", bullets: [{ text: "Conception d'un train automatisé (Arduino, ESP32) avec capteurs couleur et ultrason." }, { text: "Programmation embarquée en **C++** et conception 3D (SolidWorks)." }] },
    { title: "Développeur Web", place: "Dynamix Services (stage)", year: "07/2023 – 09/2023", bullets: [{ text: "Application de shopping avec Power Apps, intégration SharePoint et Excel." }] },
    { title: "Shift Manager", place: "McDonald's, Sèvres", year: "07/2023 – 07/2026", bullets: [{ text: "Management d'équipe en autonomie et prise de décision sous pression." }, { text: "Formation des nouveaux collaborateurs, gestion des priorités." }] },
  ],
  featured: { title: "Portfolio avec Chatbot IA", link: "ademsassi.com", bullets: [{ text: "**Stack :** React, Node.js, MongoDB, JWT, déployé sur Vercel." }, { text: "**Chatbot IA** bilingue (Groq) qui répond sur mon parcours et mes articles." }, { text: "**Sécurité :** double authentification admin, anti-spam, sauvegardes automatiques." }, { text: "**Admin complet :** contenu, blog, stats, traductions, CV en ligne." }] },
  projects: [
    { title: "JobMatch AI — Agent IA", desc: "Agent qui compare un CV à une offre : extraction des compétences, score TF-IDF + cosinus, conseils générés par LLaMA 3.3." },
    { title: "Projet KNN — Machine Learning", desc: "Pipeline ML complet sur Adult Census Income (Python, Scikit-learn). Accuracy 83,3 %, ROC-AUC 0,877." },
    { title: "Station Météo Full-Stack", desc: "ESP32 + BME280 → serveur Python → MongoDB → site web temps réel via MQTT." },
    { title: "Site Web Freelance", desc: "Front HTML (Twig) / Bootstrap, back React.js, base de données MongoDB." },
  ],
  education: [
    { title: "Master 2 — Ingénierie Data & IA", place: "École Hexagone", year: "2026 – 2027", desc: "Bac+5 · RNCP 37178 · en alternance chez ACENSI." },
    { title: "Master 1 — Intelligence Artificielle", place: "École Hexagone", year: "2025 – 2026", desc: "Machine learning, NLP, deep learning." },
    { title: "Bachelor — Informatique", place: "École Hexagone", year: "2022 – 2025", desc: "Modélisation et bases de données, développement Python, programmation C/C++, technologies web." },
    { title: "Baccalauréat Technologique", place: "Lycée Hammem Sousse", year: "2019 – 2022", desc: "" },
  ],
  stack: [
    { label: "IA & Données", items: ["LangGraph", "LangChain", "RAG", "Machine Learning", "MongoDB", "SQL", "PostgreSQL"] },
    { label: "Front-end", items: ["React.js", "HTML", "CSS", "Tailwind", "React Native"] },
    { label: "Back-end", items: ["Python", "Node.js", "Express", "PHP", "Symfony"] },
    { label: "Sécurité & DevOps", items: ["JWT / 2FA", "Git", "CI/CD", "Docker", "Linux"] },
  ],
  languages: [{ label: "Arabe", percent: 100, desc: "Natif" }, { label: "Français", percent: 88, desc: "Courant" }, { label: "Anglais", percent: 60, desc: "B2" }],
  qualities: [{ label: "Curieux & autonome" }, { label: "Apprentissage rapide" }, { label: "Ponctuel & adaptable" }, { label: "Prise de décision" }],
};

const SYNC_DEF = { experiences: false, featured: false, education: false, projects: true, stack: true, languages: true };

function CvPageEditor({ v, set }) {
  const s = (k, val) => set({ ...v, [k]: val });
  const list = (k) => (Array.isArray(v[k]) ? v[k] : []);
  const upd = (k, i, f, val) => s(k, list(k).map((x, j) => (j === i ? { ...x, [f]: val } : x)));
  const del = (k) => (a) => s(k, list(k).filter((_, j) => j !== a));
  const mv = (k) => (a, d) => s(k, move(list(k), a, d));
  const lines = (b) => (Array.isArray(b) ? b.map((x) => (typeof x === "string" ? x : x.text)).join("\n") : "");
  const toBullets = (t) => t.split("\n").map((x) => x.replace(/^\s*[-•▹]\s*/, "")).filter((x) => x.trim()).map((text) => ({ text }));
  const empty = !Object.keys(v || {}).length;
  const [ask, setAsk] = useState(false);
  const feat = v.featured || {};
  const KEYS = ["experiences", "featured", "projects", "education", "stack", "languages"];
  const sync = (k) => { const x = (v.sync || {})[k]; return x === undefined ? SYNC_DEF[k] !== false : x !== false; };
  const setSync = (k, x) => s("sync", { ...(v.sync || {}), [k]: x });
  const setAll = (x) => s("sync", Object.fromEntries(KEYS.map((k) => [k, x])));
  const nSync = KEYS.filter(sync).length;
  const SyncT = ({ k }) => <Toggle on={sync(k)} onChange={(x) => setSync(k, x)} label={sync(k) ? "Synchro portfolio" : "Version CV"} />;
  const Note = ({ src }) => <p className="acv-sync"><RefreshCw size={13} />Synchronisé avec <b>{src}</b> : tout changement sur le portfolio apparaît sur le CV. Désactive la synchro pour écrire une version propre au CV.</p>;
  return (
    <div className="aeditor">
      <Card title="CV en ligne" sub="Même design que ton CV PDF. Chaque modification ici met à jour ademsassi.com/cv (FR + EN). Mets du texte entre **deux étoiles** pour le mettre en gras."
        right={<a className="abtn sm" href="/cv" target="_blank" rel="noreferrer"><ArrowUpRight size={13} />Ouvrir le CV</a>}>
        {empty
          ? <div className="aseed"><p>Le CV est vide : importe le contenu de ton CV PDF pour démarrer, puis modifie ce que tu veux.</p><button className="abtn" onClick={() => set(clone(CV_SEED))}><Download size={14} />Importer le contenu de mon CV</button></div>
          : <div className="aseed s"><button className="abtn sm ghost" onClick={() => (ask ? (set(clone(CV_SEED)), setAsk(false)) : setAsk(true))}>{ask ? "Sûr ? Tout remplacer" : "Réinitialiser depuis le CV de base"}</button></div>}
        <div className="af2">
          <Field label="Titre sous ton nom" value={v.title} onChange={(x) => s("title", x)} placeholder="Ingénieur IA · Full-Stack" />
          <Field label="Localisation" value={v.location} onChange={(x) => s("location", x)} placeholder="Île-de-France" />
        </div>
        <Field label="Présentation" area rows={3} max={420} value={v.description} onChange={(x) => s("description", x)} />
        <Field label="Objectif (en cyan)" area rows={2} max={220} value={v.text} onChange={(x) => s("text", x)} />
        <div className="af2">
          <Field label="Téléphone (optionnel)" value={v.phone} onChange={(x) => s("phone", x)} placeholder="Laisse vide pour le cacher" hint="Le CV est public : à toi de voir" />
          <Field label="Email (optionnel)" value={v.email} onChange={(x) => s("email", x)} placeholder="Vide = email du site" />
        </div>
        <div className="aphoto-b">
          <Toggle on={v.showAge !== false} onChange={(x) => s("showAge", x)} label="Afficher l'âge" />
          <Toggle on={v.showProjects !== false} onChange={(x) => s("showProjects", x)} label="Afficher les projets" />
        </div>
      </Card>

      <Card title="Synchronisation" sub={`${nSync}/${KEYS.length} parties suivent ton portfolio automatiquement`}
        right={<div className="acv-r"><button className="abtn sm" onClick={() => setAll(true)}><RefreshCw size={13} />Tout synchroniser</button><button className="abtn sm ghost" onClick={() => setAll(false)}>Tout en version CV</button></div>}>
        <p className="acv-help">Synchro activée : la partie reprend ce que tu as mis dans Accueil, À propos, Projets et Compétences. Ajoute un projet ou une expérience sur le site, il apparaît sur le CV. Version CV : tu écris un texte propre au CV (missions en puces, projets choisis…).</p>
      </Card>

      <Card title="Expériences" sub={sync("experiences") ? "Timeline de la section À propos (hors diplômes)" : "Une ligne = une puce"} right={<div className="acv-r"><SyncT k="experiences" />{!sync("experiences") && <button className="abtn sm" onClick={() => s("experiences", [{ title: "", place: "", year: "", bullets: [] }, ...list("experiences")])}><Plus size={13} />Ajouter</button>}</div>}>
        {sync("experiences") ? <Note src="À propos & parcours" /> : list("experiences").length ? list("experiences").map((x, i) => (
          <div className="arow top acv-b" key={i}>
            <div className="grow">
              <div className="af3b"><Field label="Poste" value={x.title} onChange={(val) => upd("experiences", i, "title", val)} /><Field label="Entreprise" value={x.place} onChange={(val) => upd("experiences", i, "place", val)} /><Field label="Dates" value={x.year} onChange={(val) => upd("experiences", i, "year", val)} mono /></div>
              <Field label="Missions" area rows={3} value={lines(x.bullets)} onChange={(val) => upd("experiences", i, "bullets", toBullets(val))} />
            </div>
            <RowTools i={i} n={list("experiences").length} onMove={mv("experiences")} onDel={del("experiences")} />
          </div>
        )) : <Empty text="Vide : le parcours de la section À propos est utilisé." />}
      </Card>

      <Card title="Projet phare" right={<SyncT k="featured" />}>
        {sync("featured") ? <Note src="Projets (projet marqué « phare »)" /> : <>
        <div className="af2">
          <Field label="Nom" value={feat.title} onChange={(x) => s("featured", { ...feat, title: x })} />
          <Field label="Lien" value={feat.link} onChange={(x) => s("featured", { ...feat, link: x })} placeholder="ademsassi.com" />
        </div>
        <Field label="Points clés" area rows={4} value={lines(feat.bullets)} onChange={(x) => s("featured", { ...feat, bullets: toBullets(x) })} hint="Une ligne = une puce" />
        </>}
      </Card>

      <Card title="Autres projets" sub={sync("projects") ? "Les 4 premiers projets du site (hors projet phare)" : "Affichés en grille de 2"} right={<div className="acv-r"><SyncT k="projects" />{!sync("projects") && <button className="abtn sm" onClick={() => s("projects", [...list("projects"), { title: "", desc: "" }])}><Plus size={13} />Ajouter</button>}</div>}>
        {sync("projects") ? <Note src="Projets" /> : list("projects").length ? list("projects").map((x, i) => (
          <div className="arow top" key={i}>
            <div className="grow"><Field label="Nom" value={x.title} onChange={(val) => upd("projects", i, "title", val)} /><Field label="Description" area rows={2} max={170} value={x.desc} onChange={(val) => upd("projects", i, "desc", val)} /></div>
            <RowTools i={i} n={list("projects").length} onMove={mv("projects")} onDel={del("projects")} />
          </div>
        )) : <Empty text="Vide : tes projets du site sont utilisés." />}
      </Card>

      <Card title="Formation" right={<div className="acv-r"><SyncT k="education" />{!sync("education") && <button className="abtn sm" onClick={() => s("education", [{ title: "", place: "", year: "", desc: "" }, ...list("education")])}><Plus size={13} />Ajouter</button>}</div>}>
        {sync("education") ? <Note src="À propos & parcours (diplômes)" /> : list("education").length ? list("education").map((x, i) => (
          <div className="arow top acv-b" key={i}>
            <div className="grow">
              <div className="af3b"><Field label="Diplôme" value={x.title} onChange={(val) => upd("education", i, "title", val)} /><Field label="École" value={x.place} onChange={(val) => upd("education", i, "place", val)} /><Field label="Dates" value={x.year} onChange={(val) => upd("education", i, "year", val)} mono /></div>
              <Field label="Détail" value={x.desc} onChange={(val) => upd("education", i, "desc", val)} />
            </div>
            <RowTools i={i} n={list("education").length} onMove={mv("education")} onDel={del("education")} />
          </div>
        )) : <Empty text="Vide : les diplômes de ton parcours sont utilisés." />}
      </Card>

      <Card title="Stack tech" sub="Colonne de gauche" right={<div className="acv-r"><SyncT k="stack" />{!sync("stack") && <button className="abtn sm" onClick={() => s("stack", [...list("stack"), { label: "", items: [] }])}><Plus size={13} />Ajouter</button>}</div>}>
        {sync("stack") ? <Note src="Compétences" /> : list("stack").map((g, i) => (
          <div className="arow top" key={i}>
            <div className="grow"><Field label="Catégorie" value={g.label} onChange={(val) => upd("stack", i, "label", val)} /><Chips value={Array.isArray(g.items) ? g.items : []} onChange={(val) => upd("stack", i, "items", val)} /></div>
            <RowTools i={i} n={list("stack").length} onMove={mv("stack")} onDel={del("stack")} />
          </div>
        ))}
        {!sync("stack") && !list("stack").length && <Empty text="Vide : tes compétences du site sont utilisées." />}
      </Card>

      <div className="acv-2">
        <Card title="Langues" sub="Version CV utilisée si le site n'a pas de langues" right={<div className="acv-r"><SyncT k="languages" />{!sync("languages") && <button className="abtn sm" onClick={() => s("languages", [...list("languages"), { label: "", percent: 50, desc: "" }])}><Plus size={13} /></button>}</div>}>
          {sync("languages") ? <Note src="À propos (langues)" /> : list("languages").map((x, i) => (
            <div className="arow" key={i}>
              <div className="af3b grow"><Field label="Langue" value={x.label} onChange={(val) => upd("languages", i, "label", val)} /><Field label="Niveau" value={x.desc} onChange={(val) => upd("languages", i, "desc", val)} /><Field label="Barre %" value={String(x.percent ?? "")} onChange={(val) => upd("languages", i, "percent", Math.max(0, Math.min(100, parseInt(val) || 0)))} mono /></div>
              <RowTools i={i} n={list("languages").length} onDel={del("languages")} />
            </div>
          ))}
        </Card>
        <Card title="Qualités">
          <Chips value={list("qualities").map((x) => (typeof x === "string" ? x : x.label))} onChange={(a) => s("qualities", a.map((label) => ({ label })))} placeholder="Ajouter… (Entrée)" />
        </Card>
      </div>
    </div>
  );
}

const REL = { prof: "Professeur", manager: "Manager", collegue: "Collègue", camarade: "Camarade", client: "Client", autre: "Autre" };

function RecoInbox({ token, onApproved }) {
  const [list, setList] = useState(null);
  const [tab, setTab] = useState("pending");
  const [busy, setBusy] = useState("");
  const load = () => fetch("/api/recos/admin", { headers: H(token) }).then((r) => r.json()).then((d) => setList(Array.isArray(d) ? d : [])).catch(() => setList([]));
  useEffect(() => { load(); }, []);
  const act = async (id, what) => {
    setBusy(id + what);
    try {
      const r = await fetch(`/api/recos/admin/${id}${what === "delete" ? "" : "/" + what}`, { method: what === "delete" ? "DELETE" : "POST", headers: H(token) });
      const d = await r.json().catch(() => ({}));
      if (what === "approve" && d.testimonials) onApproved(d.testimonials);
      await load();
    } finally { setBusy(""); }
  };
  const shown = (list || []).filter((x) => x.status === tab);
  const count = (s) => (list || []).filter((x) => x.status === s).length;
  return (
    <div className="aeditor">
      <Card title="Recommandations reçues" sub="Envoyées depuis le formulaire du site. Rien n'est publié sans ta validation. Tu reçois un email à chaque dépôt. Les envois douteux (trop courts, avec un lien, en double…) arrivent dans « Spam ».">
        <div className="atabs">
          {[["pending", "À valider"], ["approved", "Publiées"], ["rejected", "Refusées"], ["spam", "Spam"]].map(([k, l]) => (
            <button key={k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>{l}<em>{count(k)}</em></button>
          ))}
        </div>
        {!list ? <div className="aload"><Loader2 size={18} className="spin" /></div>
          : !shown.length ? <Empty icon={Inbox} text={tab === "pending" ? "Aucune recommandation en attente." : "Rien ici."} />
          : shown.map((x) => (
            <div className="areco" key={x._id}>
              <div className="areco-h">
                <div><b>{x.name}</b><span>{[x.role, x.company].filter(Boolean).join(", ")} · {REL[x.relation] || x.relation}</span></div>
                <small>{fmtDate(x.createdAt)}{x.reason && <em className="areco-r">{x.reason}</em>}</small>
              </div>
              <blockquote>{x.text}</blockquote>
              <div className="areco-m"><span>{x.email}</span>{x.linkedin && <a href={x.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a>}</div>
              <div className="areco-a">
                {x.status !== "approved" && <button className="abtn sm" disabled={!!busy} onClick={() => act(x._id, "approve")}>{busy === x._id + "approve" ? <Loader2 size={13} className="spin" /> : <CheckCircle size={13} />}Publier sur le site</button>}
                {(x.status === "pending" || x.status === "spam") && <button className="abtn sm ghost" disabled={!!busy} onClick={() => act(x._id, "reject")}><Ban size={13} />Refuser</button>}
                <button className="abtn sm ghost" disabled={!!busy} onClick={() => act(x._id, "delete")}><Trash2 size={13} />Supprimer</button>
              </div>
            </div>
          ))}
      </Card>
    </div>
  );
}

function BackupPanel({ token }) {
  const [st, setSt] = useState(null);
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState(null);
  const load = () => fetch("/api/backup/status", { headers: H(token) }).then((r) => r.json()).then(setSt).catch(() => setSt({}));
  useEffect(() => { load(); }, []);
  const download = async () => {
    setBusy("dl"); setMsg(null);
    try {
      const r = await fetch("/api/backup/download", { headers: H(token) });
      if (!r.ok) throw new Error();
      const b = await r.blob(), a = document.createElement("a");
      a.href = URL.createObjectURL(b); a.download = `ademsassi-backup-${new Date().toISOString().slice(0, 10)}.json.gz`; a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    } catch { setMsg({ k: "err", t: "Échec du téléchargement." }); }
    setBusy("");
  };
  const sendNow = async () => {
    setBusy("mail"); setMsg(null);
    try {
      const r = await fetch("/api/backup/send-now", { method: "POST", headers: H(token) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setMsg({ k: "ok", t: `Envoyée par email (${Math.round(d.size / 1024)} Ko).` }); load();
    } catch (e) { setMsg({ k: "err", t: "Échec de l'envoi : " + (e.message || "erreur") }); }
    setBusy("");
  };
  return (
    <div className="aeditor">
      <Card title="Sauvegarde automatique" sub="Chaque lundi à 6 h, toute la base (contenu, articles, commentaires, recommandations, photo, CV) est compressée et envoyée sur ton email.">
        <div className="abk">
          <div><small>Dernière sauvegarde</small><b>{st?.last ? fmtDate(st.last) : "aucune"}</b>{st?.last && <span className={"abadge " + (st.ok ? "green" : "")}>{st.ok ? "réussie" : "échec"} · {st.via}</span>}</div>
          <div><small>Taille</small><b>{st?.size ? Math.round(st.size / 1024) + " Ko" : "–"}</b></div>
          <div><small>Envoi automatique</small><b>{st == null ? "…" : st.cronReady ? "activé" : "à activer"}</b></div>
        </div>
        {st && !st.cronReady && <p className="awarn"><AlertTriangle size={14} />Ajoute la variable <code>CRON_SECRET</code> dans Vercel pour activer l'envoi automatique.</p>}
        {st?.counts && <p className="abk-c">{Object.entries(st.counts).map(([k, n]) => `${k} : ${n}`).join(" · ")}</p>}
        <div className="aphoto-b">
          <button className="abtn" disabled={!!busy} onClick={download}>{busy === "dl" ? <Loader2 size={14} className="spin" /> : <Download size={14} />}Télécharger maintenant</button>
          <button className="abtn ghost" disabled={!!busy} onClick={sendNow}>{busy === "mail" ? <Loader2 size={14} className="spin" /> : <Send size={14} />}M'envoyer par email</button>
        </div>
        {msg && <p className={"aphoto-m " + msg.k}>{msg.t}</p>}
      </Card>
    </div>
  );
}

function HeroEditor({ v, set, token }) {
  const stats = v.stats || [];
  const s = (k, val) => set({ ...v, [k]: val });
  return (
    <div className="aeditor">
      <PhotoCard token={token} />
      <Card title="Identité" sub="Le haut de la page d'accueil">
        <div className="af2">
          <Field label="Nom complet" value={v.name} onChange={(x) => s("name", x)} />
          <Field label="Titre" value={v.title} onChange={(x) => s("title", x)} hint="Aussi utilisé dans le footer et la carte contact" />
        </div>
        <Field label="Description" area rows={3} max={260} value={v.description} onChange={(x) => s("description", x)} />
      </Card>
      <Card title="Chiffres clés" sub="La petite ligne sous les boutons (ex : 3 stages · 5+ projets)"
        right={<button className="abtn sm" onClick={() => s("stats", [...stats, { value: "", label: "" }])}><Plus size={13} />Ajouter</button>}>
        {stats.length ? stats.map((x, i) => (
          <div className="arow" key={i}>
            <div className="af2 grow">
              <Field label="Valeur" value={x.value} onChange={(val) => s("stats", stats.map((y, j) => (j === i ? { ...y, value: val } : y)))} placeholder="5+" mono />
              <Field label="Libellé" value={x.label} onChange={(val) => s("stats", stats.map((y, j) => (j === i ? { ...y, label: val } : y)))} placeholder="Projets" />
            </div>
            <RowTools i={i} n={stats.length} onMove={(a, d) => s("stats", move(stats, a, d))} onDel={(a) => s("stats", stats.filter((_, j) => j !== a))} />
          </div>
        )) : <Empty text="Aucun chiffre clé." />}
      </Card>
      <Card title="Aperçu">
        <div className="aprev-hero">
          <span className="b">INGÉNIEUR IA · AGENTS LLM & RAG</span>
          <small>Bonjour, je suis</small>
          <h2>{v.name || "Ton nom"}</h2>
          <p className="t">&gt; {v.title}</p>
          <p>{v.description}</p>
          <div className="st">{stats.map((x, i) => <span key={i}><b>{x.value}</b> {x.label}</span>)}</div>
        </div>
      </Card>
    </div>
  );
}

function AboutEditor({ v, set }) {
  const ps = v.paragraphs || [], tl = v.timeline || [];
  const s = (k, val) => set({ ...v, [k]: val });
  const setTl = (i, k, val) => s("timeline", tl.map((x, j) => (j === i ? { ...x, [k]: val } : x)));
  return (
    <div className="aeditor">
      <Card title="Présentation">
        <Field label="Titre de la section" value={v.title} onChange={(x) => s("title", x)} hint="Les 2 derniers mots s'affichent en dégradé" />
        {ps.map((p, i) => (
          <div className="arow top" key={i}>
            <div className="grow"><Field label={`Paragraphe ${i + 1}`} area rows={3} value={p} onChange={(x) => s("paragraphs", ps.map((y, j) => (j === i ? x : y)))} /></div>
            <RowTools i={i} n={ps.length} onMove={(a, d) => s("paragraphs", move(ps, a, d))} onDel={(a) => s("paragraphs", ps.filter((_, j) => j !== a))} />
          </div>
        ))}
        <button className="abtn sm ghost" onClick={() => s("paragraphs", [...ps, ""])}><Plus size={13} />Ajouter un paragraphe</button>
        <div className="af"><span className="af-l">Tags</span><Chips value={v.tags || []} onChange={(x) => s("tags", x)} /></div>
      </Card>
      <Card title="Parcours" sub="La timeline à droite. Une étape dont la date de fin n'est pas passée s'affiche « en cours » (en vert)."
        right={<button className="abtn sm" onClick={() => s("timeline", [{ year: "", title: "Nouvelle étape", place: "", desc: "" }, ...tl])}><Plus size={13} />Ajouter</button>}>
        <div className="atl">
          {tl.map((x, i) => (
            <div className={"atl-i" + (isNow(x.year) ? " now" : "")} key={i}>
              <span className="dot" />
              <div className="grow">
                <div className="af3">
                  <Field label="Période" value={x.year} onChange={(val) => setTl(i, "year", val)} placeholder="2025 — 2026" mono />
                  <Field label="Titre" value={x.title} onChange={(val) => setTl(i, "title", val)} />
                  <Field label="Lieu" value={x.place} onChange={(val) => setTl(i, "place", val)} />
                </div>
                <Field label="Description" value={x.desc} onChange={(val) => setTl(i, "desc", val)} />
                {isNow(x.year) && <span className="abadge green">en cours</span>}
              </div>
              <RowTools i={i} n={tl.length} onMove={(a, d) => s("timeline", move(tl, a, d))} onDup={(a) => s("timeline", [...tl.slice(0, a + 1), clone(tl[a]), ...tl.slice(a + 1)])} onDel={(a) => s("timeline", tl.filter((_, j) => j !== a))} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function SkillsEditor2({ v, set }) {
  const cats = Array.isArray(v) ? v : [];
  const up = (i, patch) => set(cats.map((c, j) => (j === i ? { ...c, ...patch } : c)));
  return (
    <div className="aeditor">
      {cats.map((c, i) => {
        const names = (c.items || []).map((it) => it.name || it);
        return (
          <Card key={i} title={<span className="acat"><i style={{ background: hexOf(c.color) }} />{c.category || "Sans nom"}</span>} sub={`${names.length} technologie(s)`}
            right={<RowTools i={i} n={cats.length} onMove={(a, d) => set(move(cats, a, d))} onDel={(a) => set(cats.filter((_, j) => j !== a))} />}>
            <Field label="Nom de la catégorie" value={c.category} onChange={(x) => up(i, { category: x })} />
            <div className="af"><span className="af-l">Compétences</span>
              <Chips value={names} onChange={(list) => up(i, { items: list.map((nm) => (c.items || []).find((it) => (it.name || it) === nm) || { name: nm }) })} />
            </div>
            <div className="af"><span className="af-l">Couleur</span><Swatches value={c.color} onChange={(x) => up(i, { color: x })} /></div>
          </Card>
        );
      })}
      <button className="abtn ghost" onClick={() => set([...cats, { category: "Nouvelle catégorie", color: "neural-blue", items: [] }])}><Plus size={14} />Ajouter une catégorie</button>
    </div>
  );
}

function MasterDetail({ items, sel, setSel, render, label, onAdd, addLabel, onMove, onDup, onDel, side }) {
  const cur = items[sel];
  return (
    <div className="amd">
      <aside className="amd-l">
        <button className="abtn sm full" onClick={onAdd}><Plus size={13} />{addLabel}</button>
        <div className="amd-list">
          {items.map((it, i) => (
            <button key={i} className={"amd-i" + (i === sel ? " on" : "")} onClick={() => setSel(i)}>
              {side(it, i)}
            </button>
          ))}
          {!items.length && <Empty text="Rien pour l'instant." />}
        </div>
      </aside>
      <div className="amd-r">
        {cur ? (
          <>
            <div className="amd-h">
              <span className="akicker">{label} {sel + 1}/{items.length}</span>
              <RowTools i={sel} n={items.length} onMove={(a, d) => { onMove(a, d); setSel(Math.max(0, Math.min(items.length - 1, a + d))); }} onDup={(a) => { onDup(a); setSel(a + 1); }} onDel={(a) => { onDel(a); setSel(Math.max(0, a - 1)); }} />
            </div>
            {render(cur, sel)}
          </>
        ) : <Empty text="Sélectionne un élément à gauche." />}
      </div>
    </div>
  );
}

function ProjectsEditor({ v, set, sel, setSel }) {
  const list = Array.isArray(v) ? v : [];
  const up = (i, patch) => set(list.map((p, j) => (j === i ? { ...p, ...patch } : p)));
  return (
    <MasterDetail items={list} sel={sel} setSel={setSel} label="PROJET" addLabel="Nouveau projet"
      onAdd={() => { set([{ id: Date.now(), title: "Nouveau projet", desc: "", tags: [], color: "neural-blue", github: "", demo: "", featured: false, stats: {} }, ...list]); setSel(0); }}
      onMove={(a, d) => set(move(list, a, d))}
      onDup={(a) => set([...list.slice(0, a + 1), { ...clone(list[a]), id: Date.now(), title: list[a].title + " (copie)" }, ...list.slice(a + 1)])}
      onDel={(a) => set(list.filter((_, j) => j !== a))}
      side={(p) => (<><i className="sw" style={{ background: hexOf(p.color) }} /><span>{p.title || "Sans titre"}</span>{p.featured && <Star size={12} className="st" />}</>)}
      render={(p, i) => {
        const stats = Object.entries(p.stats || {});
        return (
          <div className="aeditor">
            <Card title="Informations">
              <Field label="Titre" value={p.title} onChange={(x) => up(i, { title: x })} />
              <Field label="Description" area rows={4} max={300} value={p.desc} onChange={(x) => up(i, { desc: x })} hint="Les cartes affichent 3 lignes, la fiche détail affiche tout" />
              <div className="af2">
                <Field label="Lien GitHub" value={p.github} onChange={(x) => up(i, { github: x })} placeholder="https://github.com/…" mono />
                <Field label="Lien démo" value={p.demo === "#" ? "" : p.demo} onChange={(x) => up(i, { demo: x })} placeholder="https://… (vide = pas de démo)" mono />
              </div>
              <Field label="Image (optionnel)" value={p.image} onChange={(x) => up(i, { image: x })} placeholder="https://… (sinon une illustration animée est générée)" mono />
              <div className="af"><span className="af-l">Technologies</span><Chips value={p.tags || []} onChange={(x) => up(i, { tags: x })} /></div>
            </Card>
            <Card title="Infos clés" sub="Petites pastilles colorées (ex : 3 capteurs, MQTT)"
              right={<button className="abtn sm" onClick={() => up(i, { stats: { ...(p.stats || {}), ["info" + (stats.length + 1) + "_" + Date.now() % 1000]: "" } })}><Plus size={13} />Ajouter</button>}>
              {stats.length ? stats.map(([k, val], si) => (
                <div className="arow" key={k}>
                  <div className="grow"><Field label={`Info ${si + 1}`} value={val} onChange={(x) => up(i, { stats: { ...p.stats, [k]: x } })} /></div>
                  <RowTools i={si} n={stats.length} onDel={() => { const ns = { ...p.stats }; delete ns[k]; up(i, { stats: ns }); }} />
                </div>
              )) : <Empty text="Aucune info clé." />}
            </Card>
            <Card title="Apparence">
              <div className="af"><span className="af-l">Couleur</span><Swatches value={p.color} onChange={(x) => up(i, { color: x })} /></div>
              <Toggle on={!!p.featured} onChange={(x) => up(i, { featured: x })} label="Mis en avant (★). Le 1er projet mis en avant avec une démo devient le « projet phare »" />
            </Card>
          </div>
        );
      }} />
  );
}

function TestimonialsEditor({ v, set, sel, setSel }) {
  const list = Array.isArray(v) ? v : [];
  const up = (i, patch) => set(list.map((p, j) => (j === i ? { ...p, ...patch } : p)));
  return (
    <MasterDetail items={list} sel={sel} setSel={setSel} label="RECOMMANDATION" addLabel="Nouvelle recommandation"
      onAdd={() => { set([{ id: Date.now(), name: "Nouveau", role: "", text: "", avatar: "", color: "neural-blue", linkedin: "", logo: "" }, ...list]); setSel(0); }}
      onMove={(a, d) => set(move(list, a, d))}
      onDup={(a) => set([...list.slice(0, a + 1), { ...clone(list[a]), id: Date.now() }, ...list.slice(a + 1)])}
      onDel={(a) => set(list.filter((_, j) => j !== a))}
      side={(t) => (<><i className="sw" style={{ background: hexOf(t.color) }} /><span>{t.name || "Sans nom"}<small>{t.role}</small></span></>)}
      render={(t, i) => (
        <div className="aeditor">
          <Card title="Qui ?">
            <div className="af2">
              <Field label="Nom (personne ou entreprise)" value={t.name} onChange={(x) => up(i, { name: x })} />
              <Field label="Rôle · année" value={t.role} onChange={(x) => up(i, { role: x })} placeholder="Stage 2025" hint="« Stage » ou « alternance » → badge stage, sinon recommandation" />
            </div>
            <div className="af2">
              <Field label="Lien LinkedIn" value={t.linkedin} onChange={(x) => up(i, { linkedin: x })} placeholder="https://linkedin.com/in/…" mono />
              <Field label="Logo (URL d'image)" value={t.logo} onChange={(x) => up(i, { logo: x })} placeholder="https://…" mono />
            </div>
            <div className="af2">
              <Field label="Initiales (si pas de logo)" value={t.avatar} onChange={(x) => up(i, { avatar: x.slice(0, 3) })} placeholder="NI" mono />
              <div className="af"><span className="af-l">Couleur</span><Swatches value={t.color} onChange={(x) => up(i, { color: x })} /></div>
            </div>
          </Card>
          <Card title="Le texte">
            <Field label="Recommandation" area rows={5} max={400} value={t.text} onChange={(x) => up(i, { text: x })} hint="La plus longue s'affiche en grand sur le site" />
          </Card>
        </div>
      )} />
  );
}

function ContactEditor({ v, set }) {
  const s = (k, val) => set({ ...v, [k]: val });
  return (
    <div className="aeditor">
      <Card title="Disponibilité">
        <Toggle on={!!v.available} onChange={(x) => s("available", x)} label={v.available ? "Affiché « Disponible pour échanger »" : "Affiché « Indisponible pour le moment »"} />
        <Field label="Texte de disponibilité" value={v.availabilityText} onChange={(x) => s("availabilityText", x)} max={90} hint="Affiché dans le footer et la section contact" />
      </Card>
      <Card title="Coordonnées">
        <div className="af2">
          <Field label="Email" value={v.email} onChange={(x) => s("email", x)} mono />
          <Field label="École" value={v.school} onChange={(x) => s("school", x)} />
        </div>
        <div className="af2">
          <Field label="GitHub" value={v.github} onChange={(x) => s("github", x)} mono />
          <Field label="LinkedIn" value={v.linkedin} onChange={(x) => s("linkedin", x)} mono />
        </div>
        <Field label="Twitter / X (optionnel)" value={v.twitter} onChange={(x) => s("twitter", x)} mono />
      </Card>
    </div>
  );
}

function ChangeLog({ token }) {
  const [logs, setLogs] = useState(null);
  const load = () => fetch("/api/admin/changelog", { headers: H(token) }).then((r) => r.json()).then((d) => setLogs(Array.isArray(d) ? d : [])).catch(() => setLogs([]));
  useEffect(() => { load(); }, []);
  if (!logs) return <div className="aload"><Loader2 size={18} className="spin" /></div>;
  return (
    <Card title={`${logs.length} modification(s)`} right={<button className="abtn sm ghost" onClick={load}><RefreshCw size={13} />Rafraîchir</button>}>
      {logs.length ? <ul className="alist">{logs.map((l, i) => <li key={i}><Clock size={13} /><span>{l.details}<small className="ip">{l.ip}</small></span><small>{fmtDate(l.createdAt)}</small></li>)}</ul>
        : <Empty icon={History} text="Aucune modification." />}
    </Card>
  );
}

/* ─────────────────────────── Palette de commandes ─────────────────────────── */

function Palette({ onClose, go, actions }) {
  const [q, setQ] = useState(""); const [k, setK] = useState(0);
  const items = [...NAV.map((n) => ({ label: n.label, sub: n.desc || n.group, icon: n.icon, run: () => go(n.id) })), ...actions]
    .filter((x) => !q || (x.label + " " + x.sub).toLowerCase().includes(q.toLowerCase()));
  useEffect(() => setK(0), [q]);
  return (
    <div className="apal-bg" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="apal" role="dialog" aria-label="Aller à">
        <div className="apal-s"><Search size={15} /><input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Aller à une section, une action…"
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setK((x) => Math.min(items.length - 1, x + 1)); }
            if (e.key === "ArrowUp") { e.preventDefault(); setK((x) => Math.max(0, x - 1)); }
            if (e.key === "Enter" && items[k]) { items[k].run(); onClose(); }
            if (e.key === "Escape") onClose();
          }} /><kbd>esc</kbd></div>
        <div className="apal-l">
          {items.map((x, i) => { const I = x.icon; return (
            <button key={x.label} className={i === k ? "on" : ""} onMouseEnter={() => setK(i)} onClick={() => { x.run(); onClose(); }}><I size={15} /><b>{x.label}</b><small>{x.sub}</small></button>
          ); })}
          {!items.length && <p className="apal-e">Rien trouvé.</p>}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── Shell ─────────────────────────── */

export default function AdminDashboard({ token, onLogout }) {
  const [active, setActive] = useState(() => { try { return sessionStorage.getItem("adm_tab") || "dashboard"; } catch { return "dashboard"; } });
  const [data, setData] = useState(null);
  const [orig, setOrig] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [menu, setMenu] = useState(false);
  const [pal, setPal] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [sel, setSel] = useState({ projects: 0, testimonials: 0 });
  const mainRef = useRef(null);

  const toast = (text, kind = "ok") => { const id = Math.random(); setToasts((t) => [...t, { id, text, kind }]); setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200); };

  useEffect(() => {
    fetch("/api/admin/content", { headers: H(token) })
      .then((r) => { if (r.status === 401) { localStorage.removeItem("admin_token"); onLogout(); throw new Error(); } return r.json(); })
      .then((d) => { setData(d); setOrig(Object.fromEntries(SECTIONS.map((s) => [s, JSON.stringify(d[s] ?? null)]))); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const dirty = useMemo(() => (data ? SECTIONS.filter((s) => JSON.stringify(data[s] ?? null) !== orig[s]) : []), [data, orig]);
  const nav = NAV.find((n) => n.id === active) || NAV[0];

  const go = (id) => { setActive(id); setMenu(false); try { sessionStorage.setItem("adm_tab", id); } catch { /* */ } mainRef.current?.scrollTo({ top: 0 }); };
  const set = (section) => (val) => setData((d) => ({ ...d, [section]: val }));

  const save = async (section = active) => {
    if (!SECTIONS.includes(section) || saving) return;
    setSaving(true);
    try {
      const r = await fetch(`/api/admin/content/${section}`, { method: "PUT", headers: H(token), body: JSON.stringify(data[section]) });
      if (r.status === 401) { toast("Session expirée, reconnecte-toi", "err"); setTimeout(onLogout, 1200); return; }
      if (!r.ok) throw new Error();
      setOrig((o) => ({ ...o, [section]: JSON.stringify(data[section] ?? null) }));
      toast(`Enregistré : ${NAV.find((n) => n.id === section).label} · en ligne dans ~30 s`);
    } catch { toast("Échec de l'enregistrement, réessaie", "err"); }
    finally { setSaving(false); }
  };
  const revert = () => { if (!dirty.includes(active)) return; setData((d) => ({ ...d, [active]: JSON.parse(orig[active]) })); toast("Modifications annulées", "info"); };

  useEffect(() => {
    const k = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") { e.preventDefault(); save(); }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPal((p) => !p); }
    };
    const bu = (e) => { if (dirty.length) { e.preventDefault(); e.returnValue = ""; } };
    addEventListener("keydown", k); addEventListener("beforeunload", bu);
    return () => { removeEventListener("keydown", k); removeEventListener("beforeunload", bu); };
  });

  const addProject = () => { setData((d) => ({ ...d, projects: [{ id: Date.now(), title: "Nouveau projet", desc: "", tags: [], color: "neural-blue", github: "", demo: "", featured: false, stats: {} }, ...(d.projects || [])] })); setSel((s) => ({ ...s, projects: 0 })); go("projects"); };
  const logout = () => { if (dirty.length && !window.confirm("Des modifications ne sont pas enregistrées. Se déconnecter quand même ?")) return; localStorage.removeItem("admin_token"); onLogout(); };

  if (loading) return <div className="adm"><div className="aload full"><Loader2 size={26} className="spin" /></div></div>;
  if (!data) return <div className="adm"><div className="aload full"><p>Impossible de charger le contenu.</p><button className="abtn" onClick={() => location.reload()}>Réessayer</button></div></div>;

  const groups = [...new Set(NAV.map((n) => n.group))];
  const body = () => {
    switch (active) {
      case "dashboard": return <Dashboard token={token} data={data} go={go} addProject={addProject} />;
      case "stats": return <div className="legacy"><StatsPanel token={token} /></div>;
      case "hero": return <HeroEditor v={data.hero || {}} set={set("hero")} token={token} />;
      case "about": return <AboutEditor v={data.about || {}} set={set("about")} />;
      case "skills": return <SkillsEditor2 v={data.skills} set={set("skills")} />;
      case "techs": return <Card title="Technologies utilisées" sub="Les pastilles sous l'arsenal technique"><div className="legacy">{data.techs && <TechEditor techs={data.techs} onChange={set("techs")} />}</div></Card>;
      case "projects": return <ProjectsEditor v={data.projects} set={set("projects")} sel={Math.min(sel.projects, Math.max(0, (data.projects || []).length - 1))} setSel={(n) => setSel((s) => ({ ...s, projects: n }))} />;
      case "testimonials": return <TestimonialsEditor v={data.testimonials} set={set("testimonials")} sel={Math.min(sel.testimonials, Math.max(0, (data.testimonials || []).length - 1))} setSel={(n) => setSel((s) => ({ ...s, testimonials: n }))} />;
      case "contact": return <ContactEditor v={data.contact || {}} set={set("contact")} />;
      case "cvpage": return <CvPageEditor v={data.cvpage || {}} set={set("cvpage")} />;
      case "recos": return <RecoInbox token={token} onApproved={(list) => { setData((d) => ({ ...d, testimonials: list })); setOrig((o) => ({ ...o, testimonials: JSON.stringify(list) })); toast("Recommandation publiée sur le site"); }} />;
      case "backup": return <BackupPanel token={token} />;
      case "blog": return <div className="legacy"><BlogEditor token={token} /></div>;
      case "cv": return <div className="legacy"><CVUpload token={token} /></div>;
      case "i18n": return <div className="legacy"><TranslationsPanel token={token} /></div>;
      case "security": return <div className="legacy"><SecurityDashboard token={token} /></div>;
      case "changelog": return <ChangeLog token={token} />;
      default: return null;
    }
  };

  return (
    <div className="adm">
      <aside className={"aside" + (menu ? " open" : "")}>
        <div className="abrand"><span className="amark">AS</span><div><b>ADEM<i>.</i>SASSI</b><small>admin · ademsassi.com</small></div></div>
        <button className="asearch" onClick={() => setPal(true)}><Search size={14} /><span>Rechercher…</span><kbd>⌘K</kbd></button>
        <nav className="anav">
          {groups.map((g) => (
            <div key={g}>
              <p className="ag">{g}</p>
              {NAV.filter((n) => n.group === g).map((n) => { const I = n.icon; return (
                <button key={n.id} className={"ai" + (active === n.id ? " on" : "")} onClick={() => go(n.id)}>
                  <I size={15} /><span>{n.label}</span>{dirty.includes(n.id) && <i className="adot" title="Non enregistré" />}
                </button>
              ); })}
            </div>
          ))}
        </nav>
        <div className="afoot">
          <a className="ai" href="/" target="_blank" rel="noreferrer"><Globe size={15} /><span>Voir le site</span><ExternalLink size={12} className="ext" /></a>
          <a className="ai" href="/blog" target="_blank" rel="noreferrer"><BookOpen size={15} /><span>Voir le blog</span><ExternalLink size={12} className="ext" /></a>
          <button className="ai out" onClick={logout}><LogOut size={15} /><span>Déconnexion</span></button>
        </div>
      </aside>
      {menu && <div className="ascrim" onClick={() => setMenu(false)} />}

      <main className="amain" ref={mainRef}>
        <header className="atop">
          <button className="aburger" onClick={() => setMenu(true)} aria-label="Menu"><Menu size={18} /></button>
          <div className="acrumb"><span>{nav.group}</span><b>{nav.label}</b></div>
          <div className="atop-r">
            {nav.anchor && <a className="abtn sm ghost hide-s" href={nav.anchor.startsWith("/") ? nav.anchor : `/#${nav.anchor}`} target="_blank" rel="noreferrer"><ArrowUpRight size={13} />Voir sur le site</a>}
            {nav.save && (dirty.includes(active)
              ? <><button className="abtn sm ghost hide-s" onClick={revert}>Annuler</button>
                <button className="abtn sm primary" onClick={() => save()} disabled={saving}>{saving ? <Loader2 size={13} className="spin" /> : <Save size={13} />}Enregistrer<kbd>⌘S</kbd></button></>
              : <span className="asaved"><CheckCircle size={13} />À jour</span>)}
          </div>
        </header>
        {dirty.length > 0 && !dirty.includes(active) && (
          <div className="awarn"><AlertTriangle size={13} />Modifications non enregistrées dans : {dirty.map((s) => <button key={s} onClick={() => go(s)}>{NAV.find((n) => n.id === s).label}</button>)}</div>
        )}
        <div className="apage">
          {active !== "dashboard" && <div className="ahead"><h1>{nav.label}</h1>{nav.desc && <p>{nav.desc}</p>}</div>}
          {body()}
        </div>
      </main>

      {pal && <Palette onClose={() => setPal(false)} go={go} actions={[
        { label: "Ajouter un projet", sub: "Action", icon: Plus, run: addProject },
        { label: "Enregistrer", sub: "Action · ⌘S", icon: Save, run: () => save() },
        { label: "Voir le site", sub: "Ouvre ademsassi.com", icon: Globe, run: () => window.open("/", "_blank") },
        { label: "Déconnexion", sub: "Action", icon: LogOut, run: logout },
      ]} />}

      <div className="atoasts">{toasts.map((t) => <div key={t.id} className={"atoast " + t.kind}>{t.kind === "err" ? <AlertTriangle size={14} /> : <CheckCircle size={14} />}{t.text}</div>)}</div>
    </div>
  );
}
