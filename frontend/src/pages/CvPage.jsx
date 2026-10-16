import "../styles/cv.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useLang } from "../context/LangContext";

// CV web : même design que le CV PDF, contenu lu depuis l'admin (section « CV web »), donc toujours à jour.
const BIRTH = "2003-06-01";
const ageOf = () => { const b = new Date(BIRTH), n = new Date(); let a = n.getFullYear() - b.getFullYear(); if (n.getMonth() < b.getMonth() || (n.getMonth() === b.getMonth() && n.getDate() < b.getDate())) a--; return a; };
// par défaut : expériences, projet phare et formation en version CV ; projets, stack et langues synchronisés
const SYNC_DEF = { experiences: false, featured: false, education: false, projects: true, stack: true, languages: true };
const EDU = /master|bachelor|licence|bac\b|baccalaur|bts|but\b|dut|école|ecole|school|université|university|formation|degree/i;
const L = {
  fr: { back: "Retour au site", pdf: "Télécharger en PDF", gen: "Création du PDF…", hint: "PDF d'une page, toujours à jour.", locale: "fr-FR", contact: "Contact", stack: "Stack", tech: "tech", langs: "Langues", quals: "Qualités", exp: "Expériences", expS: "parcours pro", proj: "Projets", projS: "réalisations", edu: "Formation", eduS: "diplômes", feat: "Projet phare", age: "ans", updated: "Mis à jour le" },
  en: { back: "Back to site", pdf: "Download as PDF", gen: "Building PDF…", hint: "One-page PDF, always up to date.", locale: "en-GB", contact: "Contact", stack: "Tech", tech: "stack", langs: "Languages", quals: "Qualities", exp: "Experience", expS: "career", proj: "Projects", projS: "work", edu: "Education", eduS: "degrees", feat: "Flagship project", age: "years old", updated: "Updated on" },
};
const arr = (x) => (Array.isArray(x) ? x : []);
const txt = (x) => (typeof x === "string" ? x : x?.text || x?.label || "");
const link = (u) => { u = String(u || "").trim(); if (!u || !/[a-z0-9-]\.[a-z]{2,}/i.test(u)) return ""; return /^https?:\/\//.test(u) ? u : "https://" + u.replace(/^\/+/, ""); };
const short = (u) => String(u || "").replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
// **gras** dans les textes
const B = ({ s }) => String(s || "").split(/(\*\*[^*]+\*\*)/g).map((p, i) => (p.startsWith("**") && p.endsWith("**") ? <b key={i}>{p.slice(2, -2)}</b> : p));
const Ico = {
  phone: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
  pin: <><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></>,
  web: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></>,
  in: <><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7" /></>,
  cake: <><path d="M4 20h16v-7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2z" /><path d="M4 15c2 1.5 4 1.5 5.3 0 1.4 1.5 4 1.5 5.4 0 1.3 1.5 3.3 1.5 5.3 0M12 11V7" /></>,
};
const I = ({ n }) => <svg viewBox="0 0 24 24" aria-hidden="true">{Ico[n]}</svg>;
const H = ({ a, b }) => <h2 className="cv-h"><span>{a}</span>{b && <em>// {b}</em>}</h2>;

export default function CvPage() {
  const { lang, setLang } = useLang();
  const t = L[lang] || L.fr;
  const [C, setC] = useState(null);
  const [err, setErr] = useState(false);
  const [busy, setBusy] = useState(false);
  const sheet = useRef(null);

  useEffect(() => {
    setErr(false);
    fetch("/api/content?t=" + Date.now() + (lang === "en" ? "&lang=en" : ""))
      .then((r) => (r.ok ? r.json() : Promise.reject())).then(setC).catch(() => setErr(true));
  }, [lang]);
  useEffect(() => { document.title = (C?.hero?.name || "Adem SASSI") + " · CV"; }, [C]);

  // impression : la feuille est mise à l'échelle pour tenir sur une seule page A4
  const fit = () => { const el = sheet.current; if (!el) return; el.style.width = "820px"; const z = Math.min(0.968, 1120 / el.scrollHeight); el.style.width = ""; el.style.setProperty("--pz", z.toFixed(3)); };
  useEffect(() => { addEventListener("beforeprint", fit); return () => removeEventListener("beforeprint", fit); }, []);

  const d = useMemo(() => {
    if (!C) return null;
    const hero = C.hero || {}, about = C.about || {}, contact = C.contact || {}, cv = C.cvpage || {};
    const tl = arr(about.timeline);
    const projects = arr(C.projects);
    // « synchronisé » (par défaut) = la partie suit le portfolio ; sinon on garde la version écrite dans Admin → CV web
    const sync = (k) => { const v = (cv.sync || {})[k]; return v === undefined ? SYNC_DEF[k] !== false : v !== false; };
    const own = (k) => (!sync(k) && arr(cv[k]).length ? arr(cv[k]) : null);
    const sentences = (t) => String(t || "").split(/(?<=[.!?])\s+(?=[A-ZÀ-Ý0-9])/).map((x) => x.trim()).filter(Boolean).map((text) => ({ text }));
    const cut = (t, n) => { t = String(t || ""); return t.length > n ? t.slice(0, n).replace(/\s+\S*$/, "") + "…" : t; };
    const exp = own("experiences") || tl.filter((x) => !EDU.test(x.title || "")).map((x) => ({ ...x, bullets: sentences(x.desc) }));
    const edu = own("education") || tl.filter((x) => EDU.test(x.title || ""));
    const pf = projects.find((x) => x.featured) || projects[0];
    const feat = !sync("featured") && cv.featured?.title ? cv.featured : pf ? { title: pf.title, link: pf.demo, bullets: sentences(pf.desc).slice(0, 4) } : null;
    const others = own("projects") || projects.filter((p) => !feat || p.title !== feat.title).slice(0, 4).map((p) => ({ title: p.title, desc: cut(p.desc, 170) }));
    const stack = own("stack") ? own("stack").map((g) => ({ label: g.label, items: arr(g.items).map(txt) }))
      : arr(C.skills).map((s) => ({ label: s.category, items: arr(s.items).map((i) => (typeof i === "string" ? i : i.name)) }));
    const pfLangs = arr(about.languages).map((x) => ({ name: x.name, pct: +x.percent || 0, lvl: x.level }));
    const cvLangs = arr(cv.languages).map((x) => ({ name: x.label, pct: +x.percent || 0, lvl: x.desc }));
    const langs = (sync("languages") && pfLangs.length) || !cvLangs.length ? pfLangs : cvLangs;
    return {
      name: hero.name || "Adem SASSI", title: cv.title || hero.title || "",
      intro: cv.description || arr(about.paragraphs).join(" "), objective: cv.text || "",
      phone: cv.phone, email: cv.email || contact.email, location: cv.location || (lang === "en" ? "Paris area, France" : "Île-de-France"),
      linkedin: link(contact.linkedin), showAge: cv.showAge !== false,
      exp, edu, feat: cv.showProjects === false ? null : feat, others: cv.showProjects === false ? [] : others,
      stack: stack.filter((g) => g.items.length), langs, quals: arr(cv.qualities).map(txt).filter(Boolean),
    };
  }, [C, lang]);

  const makePdf = async () => {
    if (!d || busy) return;
    setBusy(true);
    try {
      const { downloadCvPdf } = await import("./cvPdf.jsx");
      const name = (d.name || "CV").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/gi, "_");
      await downloadCvPdf({ d: { ...d, feat: d.feat ? { ...d.feat, linkUrl: link(d.feat.link) } : null }, t, age: ageOf(), short, filename: `CV_${name}${lang === "en" ? "_EN" : ""}.pdf` });
      try { fetch("/api/pulse/e", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "cv" }), keepalive: true }); } catch { /* */ }
    } catch (e) { console.error(e); fit(); window.print(); }
    setBusy(false);
  };

  return (
    <div className="cvw">
      <div className="cv-bar">
        <Link to="/" className="cv-b ghost">← {t.back}</Link>
        <div className="cv-bar-r">
          <div className="cv-lang" role="group" aria-label="Langue">
            <button className={lang === "fr" ? "on" : ""} onClick={() => setLang("fr")}>FR</button>
            <button className={lang === "en" ? "on" : ""} onClick={() => setLang("en")}>EN</button>
          </div>
          <button className="cv-b primary" onClick={makePdf} disabled={!d || busy}>
            {busy ? <span className="cv-spin sm" /> : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11m-4-4 4 4 4-4M5 20h14" /></svg>}{busy ? t.gen : t.pdf}
          </button>
        </div>
      </div>
      <p className="cv-hint">{t.hint}</p>

      {!d ? (
        <div className="cv-sheet cv-load">{err ? "Impossible de charger le CV." : <span className="cv-spin" />}</div>
      ) : (
        <article className="cv-sheet" ref={sheet}>
          <aside className="cv-side">
            <div className="cv-ph"><img src="/photo.jpg" alt="" width="150" height="150" onError={(e) => { e.currentTarget.parentNode.style.display = "none"; }} /></div>
            <h1>{d.name}</h1>
            <p className="cv-role">{d.title}</p>
            <i className="cv-bar2" />

            <h2 className="cv-sh"><span>{t.contact}</span></h2>
            <ul className="cv-ct">
              {d.phone && <li><I n="phone" />{d.phone}</li>}
              {d.email && <li><I n="mail" /><a href={"mailto:" + d.email}>{d.email}</a></li>}
              <li><I n="pin" />{d.location}</li>
              {d.showAge && <li><I n="cake" />{ageOf()} {t.age}</li>}
              <li><I n="web" /><a href="https://ademsassi.com">ademsassi.com</a></li>
              {d.linkedin && <li><I n="in" /><a href={d.linkedin}>{short(d.linkedin)}</a></li>}
            </ul>

            {d.stack.length > 0 && <>
              <h2 className="cv-sh"><span>{t.stack} <em>{t.tech}</em></span></h2>
              {d.stack.map((g) => (
                <div className="cv-st" key={g.label}>
                  <h3>{g.label}</h3>
                  <div>{g.items.map((x) => <span key={x}>{x}</span>)}</div>
                </div>
              ))}
            </>}

            {d.langs.length > 0 && <>
              <h2 className="cv-sh"><span>{t.langs}</span></h2>
              <ul className="cv-lg">
                {d.langs.map((x) => (
                  <li key={x.name}><span>{x.name}</span>{x.pct > 0 ? <i><b style={{ width: Math.min(100, x.pct) + "%" }} /></i> : <em>{x.lvl}</em>}</li>
                ))}
              </ul>
            </>}

            {d.quals.length > 0 && <>
              <h2 className="cv-sh"><span>{t.quals}</span></h2>
              <ul className="cv-q">{d.quals.map((x) => <li key={x}>{x}</li>)}</ul>
            </>}
          </aside>

          <div className="cv-main">
            {(d.intro || d.objective) && (
              <div className="cv-intro">
                {d.intro && <p><B s={d.intro} /></p>}
                {d.objective && <p className="obj"><B s={d.objective} /></p>}
              </div>
            )}

            {d.exp.length > 0 && <section>
              <H a={t.exp} b={t.expS} />
              {d.exp.map((x, i) => (
                <div className="cv-it" key={i}>
                  <div className="cv-ith"><h3>{x.title}{x.place && <span> — {x.place}</span>}</h3><time>{x.year}</time></div>
                  {arr(x.bullets).map(txt).filter(Boolean).length > 0 && <ul>{arr(x.bullets).map(txt).filter(Boolean).map((b, j) => <li key={j}><B s={b} /></li>)}</ul>}
                </div>
              ))}
            </section>}

            {(d.feat || d.others.length > 0) && <section>
              <H a={t.proj} b={t.projS} />
              {d.feat && (
                <div className="cv-feat">
                  <div className="cv-feat-h"><h3>{d.feat.title}</h3><span className="tag">{t.feat}</span>{link(d.feat.link) && <a href={link(d.feat.link)}>{short(d.feat.link)}</a>}</div>
                  <ul>{arr(d.feat.bullets).map(txt).filter(Boolean).map((b, j) => <li key={j}><B s={b} /></li>)}</ul>
                </div>
              )}
              {d.others.length > 0 && <div className="cv-pg">{d.others.map((p, i) => <div key={i}><h3>{p.title}</h3><p><B s={p.desc} /></p></div>)}</div>}
            </section>}

            {d.edu.length > 0 && <section>
              <H a={t.edu} b={t.eduS} />
              {d.edu.map((x, i) => (
                <div className="cv-it" key={i}>
                  <div className="cv-ith"><h3>{x.title}{x.place && <span> — {x.place}</span>}</h3><time>{x.year}</time></div>
                  {x.desc && <p><B s={x.desc} /></p>}
                </div>
              ))}
            </section>}
            <p className="cv-foot">{t.updated} {new Date().toLocaleDateString(lang === "en" ? "en-GB" : "fr-FR")} · ademsassi.com/cv</p>
          </div>
        </article>
      )}
    </div>
  );
}
