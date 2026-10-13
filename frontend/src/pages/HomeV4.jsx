import { useEffect, useRef, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import "../styles/home-v4.css";
import TextAnalyzer from "../components/ai/TextAnalyzer";
import CodeReviewer from "../components/ai/CodeReviewer";
import BioGenerator from "../components/ai/BioGenerator";
import AIQuiz from "../components/ai/AIQuiz";

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
  if (/actuel|pr[ée]sent|aujourd|en cours/i.test(txt)) return true;
  const m = [...txt.matchAll(/(?:(\d{1,2})\/)?(\d{4})/g)];
  if (!m.length) return false;
  const last = m[m.length - 1];
  const endYear = +last[2], endMonth = last[1] ? +last[1] : 8;
  const now = new Date(), cy = now.getFullYear(), cm = now.getMonth() + 1;
  return endYear > cy || (endYear === cy && cm <= endMonth);
};
const statsList = (s) => (!s ? [] : Array.isArray(s) ? s.map((x) => (typeof x === "object" ? [x.label || "", x.value ?? ""] : ["", x])) : Object.entries(s));

function useContent() {
  const [c, setC] = useState(null);
  useEffect(() => {
    fetch("/api/content?t=" + Date.now()).then((r) => (r.ok ? r.json() : Promise.reject())).then(setC).catch(() => setC({}));
  }, []);
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
      const target = TYPING[i];
      if (!del) { j++; setTxt(target.slice(0, j)); if (j === target.length) { del = true; t = setTimeout(tick, 1800); return; } }
      else { j--; setTxt(target.slice(0, j)); if (j === 0) { del = false; i = (i + 1) % TYPING.length; } }
      t = setTimeout(tick, del ? 40 : 75);
    };
    tick();
    return () => clearTimeout(t);
  }, []);
  return <div className="typing"><span>&gt;</span> {txt}<i className="tcur" /></div>;
}

function Head({ n, path, title, accent, sub }) {
  return (
    <div className="sh">
      <div className="path-l"><span className="num">{n}</span> ~/<b>{path}</b></div>
      <h2>{title} {accent && <span className="grad">{accent}</span>}</h2>
      {sub && <p>{sub}</p>}
    </div>
  );
}

/* ─────────────────────────── Chatbot (IA Lab) ─────────────────────────── */

const SUGG = ["Quels sont ses projets ?", "Quelles sont ses compétences ?", "Comment le contacter ?", "Quels stages a-t-il effectués ?", "Sa formation ?", "Est-il disponible ?"];
const STEPS = ["router", "retrieve", "generate", "eval"];

function Rich({ text }) {
  const lines = String(text || "").split("\n").filter((l) => l.trim());
  const fmt = (s) => s.split(/(\*\*[^*]+\*\*)/g).map((p, i) => (p.startsWith("**") ? <b key={i}>{p.slice(2, -2)}</b> : p));
  return (
    <div className="rich">
      {lines.map((l, i) => {
        const clean = l.replace(/^#+\s*/, "");
        if (/^[-•▸*]\s/.test(l)) return <div className="li" key={i}><span>▸</span><p>{fmt(clean.replace(/^[-•▸*]\s*/, ""))}</p></div>;
        if (/^\d+\.\s/.test(l)) return <div className="li" key={i}><span>{l.match(/^\d+/)[0]}</span><p>{fmt(clean.replace(/^\d+\.\s*/, ""))}</p></div>;
        if (/:$/.test(clean.replace(/\*\*/g, "")) && clean.length < 60) return <div className="rh" key={i}>{clean.replace(/\*\*/g, "").replace(/:$/, "")}</div>;
        return <p key={i}>{fmt(clean)}</p>;
      })}
    </div>
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
    setMsgs(next); setLoading(true); setMeta(null);
    const t0 = performance.now();
    let k = 0; setStep(0);
    const iv = setInterval(() => { k = Math.min(k + 1, 2); setStep(k); }, 450);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.map((m) => ({ role: m.role, content: m.content })) }),
      });
      const data = await res.json();
      clearInterval(iv); setStep(3);
      await new Promise((r) => setTimeout(r, 250));
      const reply = data.reply || "Désolé, une erreur s'est produite.";
      setMsgs((p) => [...p, { role: "assistant", content: reply }]);
      setMeta({ ms: Math.round(performance.now() - t0), tok: Math.round(reply.length / 4) });
    } catch {
      clearInterval(iv);
      setMsgs((p) => [...p, { role: "assistant", content: "Erreur de connexion au serveur." }]);
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
            {m.role === "assistant" ? <span className="av">AI</span> : null}
            <div className="bubble">{m.role === "assistant" ? <Rich text={m.content} /> : m.content}</div>
          </div>
        ))}
        {loading && (
          <div className="msg assistant">
            <span className="av">AI</span>
            <div className="bubble think">{STEPS[Math.max(0, step)]}…<i className="tcur" /></div>
          </div>
        )}
      </div>
      {msgs.length <= 1 && (
        <div className="ask">
          {SUGG.map((s) => <button key={s} className="chip" onClick={() => send(s)}>{s}</button>)}
        </div>
      )}
      <form className="qbar" onSubmit={(e) => { e.preventDefault(); send(); }}>
        <span>&gt;</span>
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Pose une question sur Adem…" maxLength={500} aria-label="Message" disabled={loading} />
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
          <button key={id} role="tab" aria-selected={tab === id} className={"chip" + (tab === id ? " sel" : "")} onClick={() => setTab(id)}>{l}</button>
        ))}
      </div>
      <p className="tabdesc">▸ {t[2]}</p>
      <div className="trace lab">
        <div className="trace-h"><span className="lights"><i /><i /><i /></span><span className="ttl">ai-lab / {tab}</span><span className="live"><i /> live</span></div>
        <div className={tab === "chat" ? "" : "lab-body legacy"}>
          {tab === "chat" && <ChatBot />}
          {tab === "text" && <TextAnalyzer />}
          {tab === "code" && <CodeReviewer />}
          {tab === "bio" && <BioGenerator />}
          {tab === "quiz" && <AIQuiz />}
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

function Cover({ p, big }) {
  const cat = catsOf(p)[0];
  if (p.image) return <img className={"pimg" + (big ? " big" : "")} src={p.image} alt={p.title} loading="lazy" decoding="async" />;
  return (
    <div className={"cover" + (big ? " big" : "")} style={{ "--pc": hex(p.color) }} aria-hidden="true">
      <span className="g">{GLYPH[cat]}</span>
      <span className="cl">{cat.toLowerCase()}/{String(p.title || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 24)}</span>
      {p.featured && <span className="feat">★ FEATURED</span>}
    </div>
  );
}

function Projects({ projects, github }) {
  const [f, setF] = useState("Tous");
  const [open, setOpen] = useState(null);
  const counts = useMemo(() => {
    const m = {}; projects.forEach((p) => catsOf(p).forEach((c) => (m[c] = (m[c] || 0) + 1))); return m;
  }, [projects]);
  const filters = ["Tous", ...CATS.map(([n]) => n).filter((n) => counts[n]), ...(counts.Autre ? ["Autre"] : [])];
  const shown = f === "Tous" ? projects : projects.filter((p) => catsOf(p).includes(f));
  useEffect(() => {
    if (!open) return;
    const k = (e) => e.key === "Escape" && setOpen(null);
    addEventListener("keydown", k); document.body.style.overflow = "hidden";
    return () => { removeEventListener("keydown", k); document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {filters.length > 2 && (
        <div className="tabs">
          {filters.map((n) => (
            <button key={n} className={"chip" + (f === n ? " sel" : "")} onClick={() => setF(n)}>{n}<em>{n === "Tous" ? projects.length : counts[n]}</em></button>
          ))}
        </div>
      )}
      <div className="projects">
        {shown.map((p, i) => {
          const c = hex(p.color);
          const st = statsList(p.stats);
          return (
            <Spot as="article" key={(p.id ?? p.title) + f} className="proj" style={{ "--pc": c, animationDelay: i * 0.06 + "s" }}>
              <button className="proj-open" onClick={() => setOpen(p)} aria-label={"Détail du projet " + p.title}>
                <Cover p={p} />
                <div className="pbody">
                  <div className="top"><span className="num">{catsOf(p).join(" · ").toUpperCase()}</span><span className="arrow">↗</span></div>
                  <h3>{p.title}</h3>
                  <p>{p.desc}</p>
                  {st.length > 0 && (
                    <div className="pstats">{st.map(([k, v]) => <div key={k + v}><b>{String(v)}</b>{k && <small>{k}</small>}</div>)}</div>
                  )}
                  <div className="tags">{(p.tags || []).map((t) => <span className="tag" key={t}>{t}</span>)}</div>
                </div>
              </button>
              <div className="plinks">
                <a href={link(p.github) || github} target="_blank" rel="noopener noreferrer">GitHub ↗</a>
                {link(p.demo) && <a className="demo" href={link(p.demo)} target="_blank" rel="noopener noreferrer">Démo Live ↗</a>}
              </div>
            </Spot>
          );
        })}
      </div>
      <div className="center"><a className="btn" href={github} target="_blank" rel="noopener noreferrer">Voir tous mes projets sur GitHub ↗</a></div>
      {open && (
        <div className="modal-bg" onClick={(e) => e.target === e.currentTarget && setOpen(null)}>
          <div className="modal" role="dialog" aria-modal="true" aria-label={open.title}>
            <button className="x" onClick={() => setOpen(null)} aria-label="Fermer">✕</button>
            <Cover p={open} big />
            <div className="mb">
              <div className="num">{catsOf(open).join(" · ").toUpperCase()}</div>
              <h3>{open.title}</h3>
              <p>{open.desc}</p>
              {statsList(open.stats).length > 0 && <div className="pstats">{statsList(open.stats).map(([k, v]) => <div key={k + v}><b>{String(v)}</b>{k && <small>{k}</small>}</div>)}</div>}
              <div className="tags">{(open.tags || []).map((t) => <span className="tag" key={t}>{t}</span>)}</div>
              <div className="cta">
                {link(open.demo) && <a className="btn primary" href={link(open.demo)} target="_blank" rel="noopener noreferrer">Démo Live ↗</a>}
                <a className="btn" href={link(open.github) || github} target="_blank" rel="noopener noreferrer">GitHub ↗</a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ─────────────────────────── Recommandations ─────────────────────────── */

function Testimonials({ list }) {
  const [i, setI] = useState(0);
  const [pause, setPause] = useState(false);
  useEffect(() => {
    if (list.length < 2 || pause) return;
    const t = setInterval(() => setI((x) => (x + 1) % list.length), 6000);
    return () => clearInterval(t);
  }, [list.length, pause]);
  const t = list[i]; const c = hex(t.color);
  return (
    <div className="testi" onMouseEnter={() => setPause(true)} onMouseLeave={() => setPause(false)}>
      <Spot className="tcard" style={{ "--pc": c }} key={i}>
        <span className="qm">“</span>
        <blockquote>{t.text}</blockquote>
        <div className="who-t">
          <span className="av">{t.avatar && t.avatar.length >= 2 && t.avatar.length <= 3 ? t.avatar : initials(t.name)}</span>
          <span><b>{t.name}</b><small>{t.role}</small></span>
        </div>
      </Spot>
      {list.length > 1 && (
        <div className="tnav">
          <button aria-label="Précédent" onClick={() => setI((i - 1 + list.length) % list.length)}>←</button>
          <div className="dots">{list.map((_, k) => <button key={k} aria-label={"Avis " + (k + 1)} className={k === i ? "on" : ""} onClick={() => setI(k)} />)}</div>
          <button aria-label="Suivant" onClick={() => setI((i + 1) % list.length)}>→</button>
        </div>
      )}
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
      setStatus("success");
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
      setStatus("error"); setErr(e2.message || "Erreur d'envoi. Réessayez ou écrivez directement par email.");
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
      <div className="trace-h"><span className="lights"><i /><i /><i /></span><span className="ttl">~/contact/nouveau_message</span><span className="c2-prog">{filled}/4</span></div>
      <div className="c2-bar"><i style={{ width: filled * 25 + "%" }} /></div>
      <div className="c2-body">
        {status === "success" ? (
          <div className="c2-done">
            <div className="c2-check">✓</div>
            <h3>Message envoyé</h3>
            <pre>{`> POST /api/admin/contact\n  200 OK · livré à ${email || "contact@ademsassi.com"}\n  accusé de réception envoyé ✓`}</pre>
            <p>Je vous réponds sous 24 h.</p>
          </div>
        ) : (
          <>
            <div className="c2-topics">
              <span className="path-l">sujet rapide</span>
              <div>{TOPICS.map((t) => <button type="button" key={t} className={"chip" + (form.subject === t ? " sel" : "")} onClick={() => setForm((f) => ({ ...f, subject: t }))}>{t}</button>)}</div>
            </div>
            <div className="row2">{Field({ name: "name", label: "Nom" })}{Field({ name: "email", label: "Email", type: "email" })}</div>
            {Field({ name: "subject", label: "Sujet" })}
            {Field({ name: "message", label: "Votre message", area: true })}
            <input type="text" name="website" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} style={{ display: "none" }} tabIndex={-1} autoComplete="off" />
            {status === "error" && <div className="note ko">✕ {err}</div>}
            <button className={"c2-send" + (status === "loading" ? " busy" : "")} type="submit" disabled={status === "loading"}>
              <span>{status === "loading" ? "Envoi en cours" : "Envoyer le message"}</span><b>{status === "loading" ? "…" : "→"}</b>
            </button>
            <p className="fine">Tous les champs sont obligatoires · réponse sous 24 h</p>
          </>
        )}
      </div>
    </form>
  );
}

/* ─────────────────────────── Page ─────────────────────────── */

export default function HomeV4() {
  const C = useContent() || {};
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
  const aboutTitle = about.title || "Construire l'IA de demain";
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
          {NAV.map(([id, l]) => <a key={id} href={"#" + id} className={active === id ? "act" : ""}>{l}</a>)}
          <Link to="/blog" className="blog">Blog ↗</Link>
        </div>
        <div className="nr">
          <a className="btn primary sm" href="#contact">Me contacter</a>
          <button className="burger" aria-label="Menu" onClick={() => setMenu((m) => !m)}><i /></button>
        </div>
      </div></nav>
      {menu && (
        <div className="mnav" onClick={() => setMenu(false)}>
          {NAV.map(([id, l], i) => <a key={id} href={"#" + id}><span>0{i + 1}</span> {l}</a>)}
          <Link to="/blog"><span>→</span> Blog</Link>
        </div>
      )}

      <main id="top">
        <section id="home" className="hero wrap">
          <div className="hc enter">
            <div className="badge"><span className="dot" />INGÉNIEUR IA · AGENTS LLM &amp; RAG</div>
            <div className="avatar">
              {photoOk ? <img src={PHOTO} alt={name} width="150" height="150" fetchpriority="high" onError={() => setPhotoOk(false)} /> : <div className="ini">{initials(name)}</div>}
              <span className="on" />
            </div>
            <h1><span className="hi">Bonjour, je suis</span><span className="grad">{name}</span></h1>
            <Typing />
            <p className="lede">{hero.description || "Ingénieur IA en alternance chez ACENSI. Je conçois des agents LLM, des architectures RAG et les plateformes qui les font tourner. Étudiant en Master 2 à l'École Hexagone."}</p>
            <div className="cta">
              <a className="btn primary" href="#projects">Voir mes projets →</a>
              <a className="btn" href="#ai-features">IA Lab →</a>
              <a className="btn ghost" href="/api/content/cv" download>CV ↓</a>
            </div>
            <div className="hstats">
              {stats.map((s, i) => <span key={i}><Counter value={s.value} /> {s.label}</span>)}
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
              {(about.languages || []).length > 0 && (
                <div className="langs">
                  <div className="path-l">🌍 langues</div>
                  {about.languages.map((l) => (
                    <div className="lang" key={l.name}>
                      <span>{l.flag} {l.name}</span><small>{l.level}</small>
                      <span className="lv"><i style={{ width: (+l.percent || 0) + "%" }} /></span>
                    </div>
                  ))}
                </div>
              )}
              <a className="btn" href="/api/content/cv" download>Télécharger mon CV ↓</a>
            </div>
            <div>
              <div className="path-l">parcours</div>
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
          <Head n="02" path="competences" title="Mon" accent="arsenal technique" sub="Des outils maîtrisés à travers des projets académiques, des stages et une veille constante." />
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
              <div className="divider"><span>TECHNOLOGIES UTILISÉES</span></div>
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
          <Head n="03" path="ia-lab" title="Fonctionnalités" accent="propulsées par l'IA" sub="Ces outils interactifs démontrent mes compétences en IA appliquée. Chaque fonctionnalité appelle un LLM en temps réel." />
          <AILab />
        </div></section>

        {projects.length > 0 && (
          <section id="projects" className="reveal"><div className="wrap">
            <Head n="04" path="projets" title="Ce que j'ai" accent="construit" sub="Des projets allant de la recherche fondamentale aux applications déployées en production. Clique sur un projet pour le détail." />
            <Projects projects={projects} github={GITHUB} />
          </div></section>
        )}

        <section id="courses" className="reveal"><div className="wrap">
          <Head n="05" path="formation" title="Master" accent="Intelligence Artificielle" sub="École Hexagone · Versailles · 2025-2026" />
          <div className="courses">
            {COURSES.map((s) => (
              <Spot className="sem" key={s.semester} style={{ "--pc": s.color }}>
                <div className="semh"><i />{s.semester}<small>{s.subjects.length} matières</small></div>
                <div className="subs">
                  {s.subjects.map((x) => (
                    <div className="sub" key={x.name}><span className="ic">{x.icon}</span><div><b>{x.name}</b><small>{x.desc}</small></div></div>
                  ))}
                </div>
              </Spot>
            ))}
          </div>
        </div></section>

        {testimonials.length > 0 && (
          <section id="recommandations" className="reveal"><div className="wrap narrow">
            <Head n="06" path="recommandations" title="Ce qu'ils disent" accent="de moi" />
            <Testimonials list={testimonials} />
          </div></section>
        )}

        <section id="contact" className="reveal"><div className="wrap">
          <Head n="07" path="contact" title="Travaillons" accent="ensemble" sub="Un projet IA, une collaboration ou simplement envie d'échanger ? Écrivez-moi, je réponds personnellement." />
          <div className="c2">
            <aside className="c2-side">
              <Spot className="c2-card">
                <div className="c2-me">
                  <div className="c2-av">{photoOk ? <img src={PHOTO} alt={name} width="64" height="64" loading="lazy" /> : <span>{initials(name)}</span>}<i className={contact.available ? "" : "off"} /></div>
                  <div><b>{name}</b><small>{hero.title || "Ingénieur IA en alternance"}</small></div>
                </div>
                <div className={"c2-status" + (contact.available ? "" : " off")}><span className="dot" />{contact.available ? "Disponible pour échanger" : "Indisponible pour le moment"}</div>
                {contact.availabilityText && <p className="c2-av-t">{contact.availabilityText}</p>}
                <div className="c2-meta">
                  <div><small>Réponse</small><b>&lt; 24 h</b></div>
                  <div><small>Basé à</small><b>Île-de-France</b></div>
                  <div><small>Langues</small><b>FR · EN · AR</b></div>
                </div>
              </Spot>
              {contact.email && (
                <div className="c2-mail">
                  <small>email direct</small>
                  <a href={"mailto:" + contact.email}>{contact.email}</a>
                  <button type="button" onClick={() => { try { navigator.clipboard.writeText(contact.email); } catch { /* */ } setCopied(true); setTimeout(() => setCopied(false), 1600); }}>{copied ? "copié ✓" : "copier"}</button>
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
        <a className="logo" href="#top"><span className="mark">AS</span>ADEM<b>.</b>SASSI</a>
        <div className="flinks">
          {[["Terms", "/terms"], ["Privacy", "/privacy"], ["Security", "/security"], ["Status", "/status"], ["Community", "/community"], ["Docs", "/docs"], ["Contact", "#contact"], ["Manage cookies", "/cookies"], ["Do not share my personal information", "/do-not-share"]].map(([l, h]) => <a key={l} href={h}>{l}</a>)}
        </div>
        <p>© {new Date().getFullYear()} {name}, tous droits réservés · <Link to="/mentions-legales">Mentions légales</Link></p>
        <p>Ingénieur IA en alternance · ACENSI · Master 2 École Hexagone</p>
        <p className="live-l"><span className="dot" />En alternance chez <b>ACENSI</b> sur le développement d'agents IA</p>
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
      <a href="/api/content/cv" download title="Télécharger CV" className="fcv">↓<span>Mon CV</span></a>
      <button onClick={() => scrollTo({ top: 0, behavior: "smooth" })} title="Retour en haut" aria-label="Retour en haut">↑</button>
    </div>
  );
}
