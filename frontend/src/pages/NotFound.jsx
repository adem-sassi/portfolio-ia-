import "../styles/notfound.css";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useLang } from "../context/LangContext";

const TX = {
  fr: { t: "Cette page s'est perdue dans le réseau", p: "L'adresse n'existe pas ou a été déplacée. En attendant, attrape un max de neurones en 20 secondes.", home: "Retour à l'accueil", blog: "Lire le blog", bot: "Demander au chatbot", play: "Jouer", again: "Rejouer", score: "score", best: "record", time: "temps", end: (n) => `${n} neurone${n > 1 ? "s" : ""} attrapé${n > 1 ? "s" : ""} !`, hint: "Clique ou tape sur les neurones" },
  en: { t: "This page got lost in the network", p: "This address doesn't exist or has moved. Meanwhile, catch as many neurons as you can in 20 seconds.", home: "Back to home", blog: "Read the blog", bot: "Ask the chatbot", play: "Play", again: "Play again", score: "score", best: "best", time: "time", end: (n) => `${n} neuron${n > 1 ? "s" : ""} caught!`, hint: "Click or tap the neurons" },
};
const DUR = 20;

function Game({ tx }) {
  const ref = useRef(null);
  const [state, setState] = useState("idle"); // idle | play | end
  const [score, setScore] = useState(0);
  const [left, setLeft] = useState(DUR);
  const [best, setBest] = useState(() => { try { return +localStorage.getItem("nf_best") || 0; } catch { return 0; } });
  const G = useRef({ dots: [], bursts: [], score: 0, playing: false });

  useEffect(() => {
    const cv = ref.current, ctx = cv.getContext("2d");
    let W = 0, H = 0, raf = 0;
    const size = () => { const d = Math.min(devicePixelRatio || 1, 2), b = cv.getBoundingClientRect(); W = b.width; H = b.height; cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0); };
    size(); const ro = new ResizeObserver(size); ro.observe(cv);
    const spawn = () => { const r = 9 + Math.random() * 9, a = Math.random() * 6.28, sp = 0.4 + Math.random() * 0.9 + G.current.score * 0.03; return { x: r + Math.random() * (W - 2 * r), y: r + Math.random() * (H - 2 * r), r, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, h: Math.random() < 0.5 ? 190 : 265, t: 0 }; };
    G.current.spawn = spawn;
    for (let i = 0; i < 7; i++) G.current.dots.push(spawn());
    const frame = () => {
      const g = G.current; ctx.clearRect(0, 0, W, H);
      ctx.lineWidth = 1;
      for (let i = 0; i < g.dots.length; i++) for (let j = i + 1; j < g.dots.length; j++) {
        const a = g.dots[i], b = g.dots[j], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 150) { ctx.strokeStyle = `rgba(0,212,255,${0.18 * (1 - d / 150)})`; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
      }
      for (const d of g.dots) {
        d.t += 0.05; d.x += d.vx; d.y += d.vy;
        if (d.x < d.r || d.x > W - d.r) d.vx *= -1; if (d.y < d.r || d.y > H - d.r) d.vy *= -1;
        d.x = Math.max(d.r, Math.min(W - d.r, d.x)); d.y = Math.max(d.r, Math.min(H - d.r, d.y));
        const pr = d.r * (1 + Math.sin(d.t) * 0.08);
        ctx.shadowColor = `hsl(${d.h},100%,60%)`; ctx.shadowBlur = g.playing ? 18 : 10;
        ctx.fillStyle = `hsla(${d.h},100%,62%,.9)`; ctx.beginPath(); ctx.arc(d.x, d.y, pr, 0, 7); ctx.fill();
        ctx.shadowBlur = 0; ctx.fillStyle = "rgba(255,255,255,.85)"; ctx.beginPath(); ctx.arc(d.x - pr * 0.3, d.y - pr * 0.3, pr * 0.28, 0, 7); ctx.fill();
      }
      g.bursts = g.bursts.filter((b) => (b.t += 0.05) < 1);
      for (const b of g.bursts) {
        ctx.strokeStyle = `hsla(${b.h},100%,65%,${1 - b.t})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(b.x, b.y, b.r + b.t * 30, 0, 7); ctx.stroke();
        ctx.fillStyle = `rgba(232,240,255,${1 - b.t})`; ctx.font = "600 14px JetBrains Mono, monospace"; ctx.fillText("+1", b.x - 9, b.y - b.r - b.t * 26);
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    const hit = (e) => {
      const g = G.current; if (!g.playing) return;
      const b = cv.getBoundingClientRect(), x = e.clientX - b.left, y = e.clientY - b.top;
      const i = g.dots.findIndex((d) => Math.hypot(d.x - x, d.y - y) < d.r + 10);
      if (i < 0) return;
      const d = g.dots[i]; g.bursts.push({ x: d.x, y: d.y, r: d.r, h: d.h, t: 0 });
      g.dots[i] = spawn(); g.score++; setScore(g.score);
    };
    cv.addEventListener("pointerdown", hit);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); cv.removeEventListener("pointerdown", hit); };
  }, []);

  useEffect(() => {
    if (state !== "play") return;
    const t0 = Date.now();
    const it = setInterval(() => {
      const l = Math.max(0, DUR - (Date.now() - t0) / 1000); setLeft(l);
      if (l <= 0) {
        clearInterval(it); G.current.playing = false; setState("end");
        const s = G.current.score; setBest((b) => { const nb = Math.max(b, s); try { localStorage.setItem("nf_best", nb); } catch { /* */ } return nb; });
      }
    }, 100);
    return () => clearInterval(it);
  }, [state]);

  const start = () => { G.current.score = 0; G.current.playing = true; G.current.dots = Array.from({ length: 7 }, () => G.current.spawn()); setScore(0); setLeft(DUR); setState("play"); };

  return (
    <div className="nf-game">
      <div className="nf-hud">
        <span>{tx.score} <b>{score}</b></span>
        <span className="nf-bar"><i style={{ transform: `scaleX(${left / DUR})` }} /></span>
        <span>{tx.best} <b>{best}</b></span>
      </div>
      <div className="nf-stage">
        <canvas ref={ref} aria-label={tx.hint} />
        {state !== "play" && (
          <div className="nf-over">
            {state === "end" && <p className="nf-res">{tx.end(score)}</p>}
            <button className="nf-btn primary" onClick={start}>{state === "end" ? tx.again : tx.play} ▸</button>
            <small>{tx.hint}</small>
          </div>
        )}
      </div>
    </div>
  );
}

export default function NotFound() {
  const { lang } = useLang();
  const tx = TX[lang] || TX.fr;
  useEffect(() => {
    document.title = "404 · Adem SASSI";
    const m = document.createElement("meta"); m.name = "robots"; m.content = "noindex"; document.head.appendChild(m);
    return () => m.remove();
  }, []);
  const path = typeof location !== "undefined" ? location.pathname : "/";
  return (
    <main className="nf">
      <div className="nf-glow" />
      <div className="nf-in">
        <Link to="/" className="nf-logo"><span>AS</span>ADEM<b>.</b>SASSI</Link>
        <div className="nf-code" aria-hidden="true">404</div>
        <p className="nf-term"><span>$</span> GET {path.length > 40 ? path.slice(0, 40) + "…" : path}<br /><em>→ route_not_found</em></p>
        <h1>{tx.t}</h1>
        <p className="nf-p">{tx.p}</p>
        <Game tx={tx} />
        <div className="nf-ctas">
          <Link className="nf-btn primary" to="/">{tx.home} →</Link>
          <a className="nf-btn" href="/#ai-features">{tx.bot}</a>
          <Link className="nf-btn" to="/blog">{tx.blog}</Link>
        </div>
      </div>
    </main>
  );
}
