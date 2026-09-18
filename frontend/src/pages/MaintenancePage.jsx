import { useState, useEffect } from "react";

/* ── Contenu SVG de l'hologramme (réutilisé pour le calque fantôme) ── */
const HoloSign = () => (
  <svg viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="hSweep" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#00E0FF" stopOpacity="0"/>
        <stop offset="50%" stopColor="#00E0FF" stopOpacity=".85"/>
        <stop offset="100%" stopColor="#00E0FF" stopOpacity="0"/>
      </linearGradient>
      <linearGradient id="hFace" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#00D4FF" stopOpacity=".13"/>
        <stop offset="100%" stopColor="#00BEE6" stopOpacity=".02"/>
      </linearGradient>
      <clipPath id="hClip"><rect x="24" y="20" width="192" height="170"/></clipPath>
    </defs>

    {/* ── anneaux orbitaux ── */}
    <g className="h-orbit-a" opacity=".4">
      <ellipse cx="120" cy="104" rx="98" ry="30" fill="none"
               stroke="#00BEE6" strokeWidth="1.1" strokeDasharray="6 10"/>
    </g>
    <g className="h-orbit-b" opacity=".3">
      <ellipse cx="120" cy="104" rx="80" ry="52" fill="none"
               stroke="#00D4FF" strokeWidth=".9" strokeDasharray="3 12"/>
    </g>
    <g className="h-orbit-c" opacity=".22">
      <ellipse cx="120" cy="104" rx="104" ry="66" fill="none"
               stroke="#00BEE6" strokeWidth=".8" strokeDasharray="2 16"/>
    </g>

    {/* ── graduations circulaires ── */}
    <g className="h-ticks" opacity=".35" stroke="#00D4FF" strokeWidth="1.2" strokeLinecap="round">
      {Array.from({ length: 24 }).map((_, i) => {
        const a = (i * 15 * Math.PI) / 180;
        const r1 = i % 6 === 0 ? 66 : 71;
        const r2 = 75;
        return (
          <line key={i}
            x1={120 + Math.cos(a) * r1} y1={104 + Math.sin(a) * r1 * .42}
            x2={120 + Math.cos(a) * r2} y2={104 + Math.sin(a) * r2 * .42}/>
        );
      })}
    </g>

    {/* ── panneau de maintenance ── */}
    <g className="h-sign">
      {/* mât + pieds */}
      <g stroke="#00BEE6" strokeWidth="2" strokeLinecap="round" opacity=".5">
        <line x1="120" y1="146" x2="120" y2="172"/>
        <line x1="100" y1="184" x2="120" y2="172"/>
        <line x1="140" y1="184" x2="120" y2="172"/>
        <line x1="104" y1="177" x2="136" y2="177" opacity=".45"/>
      </g>

      {/* triangle */}
      <path d="M120 38 L190 146 L50 146 Z" fill="url(#hFace)"
            stroke="#00D4FF" strokeWidth="2.8" strokeLinejoin="round"/>
      <path d="M120 52 L176 139 L64 139 Z" fill="none"
            stroke="#00BEE6" strokeWidth="1" opacity=".3"/>

      {/* engrenage */}
      <g className="h-gear">
        <g fill="none" stroke="#00E0FF" strokeWidth="2.3" strokeLinecap="round">
          <circle cx="120" cy="100" r="21"/>
          <circle cx="120" cy="100" r="8"/>
          {Array.from({ length: 8 }).map((_, i) => {
            const a = (i * 45 * Math.PI) / 180;
            return (
              <line key={i}
                x1={120 + Math.cos(a) * 25} y1={100 + Math.sin(a) * 25}
                x2={120 + Math.cos(a) * 34} y2={100 + Math.sin(a) * 34}/>
            );
          })}
        </g>
      </g>

      {/* voyants */}
      <circle className="h-blink" cx="120" cy="44" r="2.8" fill="#00E0FF"/>
      <circle className="h-blink" cx="57"  cy="142" r="2.3" fill="#00E0FF" style={{ animationDelay:".55s" }}/>
      <circle className="h-blink" cx="183" cy="142" r="2.3" fill="#00E0FF" style={{ animationDelay:"1.1s" }}/>
    </g>

    {/* ── balayage ── */}
    <g clipPath="url(#hClip)">
      <rect className="h-sweep" x="24" y="20" width="192" height="26" fill="url(#hSweep)"/>
    </g>

    {/* ── socle de projection ── */}
    <g className="h-plate">
      <polygon points="120,182 158,196 120,210 82,196" fill="none"
               stroke="#00BEE6" strokeWidth="1.5" opacity=".55"/>
      <ellipse className="h-plate-ring" cx="120" cy="196" rx="68" ry="11"
               fill="none" stroke="#00D4FF" strokeWidth="1.2"
               strokeDasharray="10 8" opacity=".5"/>
      <ellipse className="h-plate-ring-2" cx="120" cy="196" rx="46" ry="7.5"
               fill="none" stroke="#00BEE6" strokeWidth="1"
               strokeDasharray="4 9" opacity=".38"/>
    </g>

    {/* ── particules ── */}
    <g fill="#00E0FF">
      {[[64,168,1.8,0],[176,160,1.5,.7],[92,186,1.3,1.4],[152,180,1.6,2.1],[120,192,1.2,2.8]]
        .map(([x,y,r,d],i)=>(
          <circle key={i} className="h-particle" cx={x} cy={y} r={r}
                  style={{ animationDelay:`${d}s` }}/>
      ))}
    </g>
  </svg>
);

export default function MaintenancePage() {
  const [line, setLine] = useState(0);
  const [dots, setDots] = useState("");

  const logs = [
    { t: "SYSTEM", m: "Infrastructure backend hors ligne" },
    { t: "STATUS", m: "Maintenance technique planifiée" },
    { t: "FRONT",  m: "Interface opérationnelle" },
    { t: "INFO",   m: "Retour prévu très prochainement" },
  ];

  useEffect(() => {
    const i = setInterval(() => setLine(l => (l < logs.length ? l + 1 : l)), 700);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    const i = setInterval(() => setDots(d => (d.length >= 3 ? "" : d + ".")), 450);
    return () => clearInterval(i);
  }, []);

  return (
    <div className="maintenance-root">
      <style>{`
        .maintenance-root {
          min-height:100vh; position:relative; overflow:hidden;
          background:#04070d; display:flex; align-items:center;
          justify-content:center; padding:2rem 1.5rem;
        }

        .m-glow { position:absolute; border-radius:50%; filter:blur(110px);
          pointer-events:none; background:rgba(0,180,220,.08); }
        .m-glow-1 { width:480px; height:480px; top:-160px; right:-100px; }
        .m-glow-2 { width:400px; height:400px; bottom:-150px; left:-120px; opacity:.7; }

        .m-grid {
          position:absolute; inset:0; pointer-events:none;
          background-image:
            linear-gradient(rgba(0,180,220,.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,180,220,.035) 1px, transparent 1px);
          background-size:58px 58px;
          mask-image: radial-gradient(ellipse 78% 58% at 50% 45%, #000 18%, transparent 76%);
          -webkit-mask-image: radial-gradient(ellipse 78% 58% at 50% 45%, #000 18%, transparent 76%);
        }
        .m-scan { position:absolute; left:0; right:0; height:150px; pointer-events:none;
          background:linear-gradient(180deg, transparent, rgba(0,180,220,.035), transparent);
          animation:scan 8s linear infinite; }
        @keyframes scan { 0%{top:-150px} 100%{top:100%} }

        .m-inner {
          position:relative; z-index:2; max-width:1000px; width:100%;
          display:grid; grid-template-columns:280px 1fr; gap:3.5rem; align-items:center;
        }
        .m-content { min-width:0; }
        @media (max-width:860px) {
          .m-inner { grid-template-columns:1fr; gap:2rem; max-width:620px; }
          .m-holo-col { justify-self:center; }
        }

        /* ══ HOLOGRAMME ══ */
        .m-holo-col { display:flex; align-items:center; justify-content:center; }
        .m-holo { position:relative; width:270px; height:270px; }

        .h-stage { position:absolute; inset:0; animation:hFloat 6s ease-in-out infinite; }
        @keyframes hFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }

        .h-layer { position:absolute; inset:0; }
        .h-layer svg { width:100%; height:100%; overflow:visible; }

        .h-main { filter:drop-shadow(0 0 14px rgba(0,200,240,.4)); animation:hFlicker 6s ease-in-out infinite; }
        @keyframes hFlicker {
          0%,100%{opacity:.95} 41%{opacity:.95} 43%{opacity:.62}
          45%{opacity:.95} 76%{opacity:.95} 78%{opacity:.75} 80%{opacity:.95}
        }

        .h-ghost { mix-blend-mode:screen; opacity:0; animation:hGlitch 7s steps(1) infinite; }
        .h-ghost svg { filter:hue-rotate(-25deg) saturate(1.5); }
        @keyframes hGlitch {
          0%,100%   { opacity:0; transform:translate(0,0) }
          49.5%     { opacity:0; transform:translate(0,0) }
          50%       { opacity:.55; transform:translate(-3px,1px) }
          51%       { opacity:.35; transform:translate(2px,-1px) }
          52%       { opacity:0; transform:translate(0,0) }
          85%       { opacity:0 }
          85.6%     { opacity:.4; transform:translate(2px,0) }
          86.2%     { opacity:0; transform:translate(0,0) }
        }

        .h-orbit-a { transform-origin:120px 104px; animation:hRot 16s linear infinite; }
        .h-orbit-b { transform-origin:120px 104px; animation:hRot 11s linear infinite reverse; }
        .h-orbit-c { transform-origin:120px 104px; animation:hRot 24s linear infinite; }
        .h-ticks   { transform-origin:120px 104px; animation:hRot 40s linear infinite reverse; }
        @keyframes hRot { to { transform:rotate(360deg) } }

        .h-gear { transform-origin:120px 100px; animation:hRot 10s linear infinite; }
        .h-sign { transform-origin:120px 160px; animation:hSway 6.5s ease-in-out infinite; }
        @keyframes hSway { 0%,100%{transform:rotate(-1.2deg)} 50%{transform:rotate(1.2deg)} }

        .h-blink { animation:hBlink 1.8s ease-in-out infinite; }
        @keyframes hBlink { 0%,100%{opacity:1} 50%{opacity:.2} }

        .h-sweep { animation:hSweepAnim 3.6s cubic-bezier(.4,0,.6,1) infinite; }
        @keyframes hSweepAnim { 0%{transform:translateY(0);opacity:0} 8%{opacity:1} 92%{opacity:1} 100%{transform:translateY(164px);opacity:0} }

        .h-plate-ring   { transform-origin:120px 196px; animation:hRot 13s linear infinite; }
        .h-plate-ring-2 { transform-origin:120px 196px; animation:hRot 8s linear infinite reverse; }
        .h-plate { animation:hPlate 3.5s ease-in-out infinite; }
        @keyframes hPlate { 0%,100%{opacity:.75} 50%{opacity:1} }

        .h-particle { animation:hPart 4s ease-in-out infinite; }
        @keyframes hPart {
          0%   { opacity:0; transform:translateY(6px) }
          30%  { opacity:.85 }
          100% { opacity:0; transform:translateY(-26px) }
        }

        /* faisceau volumétrique */
        .h-beam {
          position:absolute; left:50%; bottom:8px; transform:translateX(-50%);
          width:210px; height:150px; pointer-events:none;
          background:conic-gradient(from 180deg at 50% 100%, transparent 62deg,
                     rgba(0,190,230,.13) 90deg, transparent 118deg);
          filter:blur(11px); animation:hBeam 4.5s ease-in-out infinite;
        }
        @keyframes hBeam { 0%,100%{opacity:.45} 50%{opacity:.9} }

        .h-pool {
          position:absolute; left:50%; bottom:14px; transform:translateX(-50%);
          width:160px; height:24px; border-radius:50%; pointer-events:none;
          background:radial-gradient(ellipse at center, rgba(0,200,240,.34), rgba(0,200,240,0) 70%);
          animation:hPool 3.5s ease-in-out infinite;
        }
        @keyframes hPool { 0%,100%{opacity:.6;transform:translateX(-50%) scale(1)} 50%{opacity:1;transform:translateX(-50%) scale(1.07)} }

        /* lignes d'interférence */
        .h-lines {
          position:absolute; inset:0; pointer-events:none; opacity:.28;
          background:repeating-linear-gradient(180deg,
            rgba(0,220,255,.11) 0px, rgba(0,220,255,.11) 1px, transparent 1px, transparent 4px);
          mask-image:radial-gradient(ellipse 60% 55% at 50% 42%, #000 30%, transparent 78%);
          -webkit-mask-image:radial-gradient(ellipse 60% 55% at 50% 42%, #000 30%, transparent 78%);
          animation:hLines 9s linear infinite;
        }
        @keyframes hLines { to { background-position:0 -80px } }

        /* cadre HUD */
        .h-frame { position:absolute; inset:0; pointer-events:none; animation:hFrame 4s ease-in-out infinite; }
        @keyframes hFrame { 0%,100%{opacity:.35} 50%{opacity:.7} }
        .h-corner { position:absolute; width:24px; height:24px;
          border-color:#00BEE6; border-style:solid; border-width:0; }
        .h-c-tl { top:0; left:0; border-top-width:1.5px; border-left-width:1.5px; }
        .h-c-tr { top:0; right:0; border-top-width:1.5px; border-right-width:1.5px; }
        .h-c-bl { bottom:0; left:0; border-bottom-width:1.5px; border-left-width:1.5px; }
        .h-c-br { bottom:0; right:0; border-bottom-width:1.5px; border-right-width:1.5px; }

        .h-label {
          position:absolute; left:50%; bottom:-22px; transform:translateX(-50%);
          font-family:ui-monospace,monospace; font-size:.58rem; letter-spacing:.24em;
          color:#3f5670; white-space:nowrap; animation:hFrame 4s ease-in-out infinite;
        }

        /* ══ CONTENU ══ */
        .m-badge {
          display:inline-flex; align-items:center; gap:.6rem;
          padding:.5rem 1.1rem; border-radius:100px; margin-bottom:1.8rem;
          background:rgba(0,190,230,.05); border:1px solid rgba(0,190,230,.22);
        }
        .m-pulse { width:7px; height:7px; border-radius:50%; background:#00BEE6;
          box-shadow:0 0 0 0 rgba(0,190,230,.5); animation:pulse 2.2s infinite; }
        @keyframes pulse {
          0%{box-shadow:0 0 0 0 rgba(0,190,230,.45)}
          70%{box-shadow:0 0 0 11px rgba(0,190,230,0)}
          100%{box-shadow:0 0 0 0 rgba(0,190,230,0)}
        }

        .m-title { font-size:clamp(1.9rem,4vw,2.7rem); font-weight:900; line-height:1.12;
          letter-spacing:-.02em; color:#dbe6f5; margin-bottom:1.3rem; }
        .m-accent { color:#00BEE6; }
        .m-sub { color:#7b8aa8; font-size:.95rem; line-height:1.75; margin-bottom:1.9rem; }

        .m-term { border-radius:14px; overflow:hidden; margin-bottom:1.9rem; text-align:left;
          background:rgba(7,11,18,.8); border:1px solid rgba(255,255,255,.06); }
        .m-term-bar { display:flex; align-items:center; gap:.45rem; padding:.7rem 1rem;
          border-bottom:1px solid rgba(255,255,255,.05); background:rgba(255,255,255,.015); }
        .m-dot { width:9px; height:9px; border-radius:50%; background:rgba(255,255,255,.14); }
        .m-term-title { margin-left:.6rem; font-family:ui-monospace,monospace; font-size:.67rem;
          letter-spacing:.14em; color:#4d5b76; }
        .m-term-body { padding:1.05rem 1.2rem; font-family:ui-monospace,monospace; font-size:.77rem; }
        .m-log { display:flex; gap:.7rem; padding:.32rem 0; animation:fadeUp .45s ease both; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }
        .m-tag { min-width:64px; font-weight:700; letter-spacing:.06em; color:#00BEE6; opacity:.85; }
        .m-msg { color:#75849f; }
        .m-caret { display:inline-block; width:7px; height:13px; background:#00BEE6;
          vertical-align:-2px; animation:blink 1.1s steps(1) infinite; }
        @keyframes blink { 50%{opacity:0} }

        .m-links { display:flex; flex-wrap:wrap; gap:.7rem; margin-bottom:2.2rem; }
        .m-link { flex:1 1 200px; padding:.9rem 1.15rem; border-radius:12px; text-decoration:none;
          font-size:.86rem; display:flex; align-items:center; gap:.6rem;
          background:rgba(0,190,230,.045); border:1px solid rgba(0,190,230,.18); color:#8fb8c9;
          transition:transform .25s ease, background .25s ease, border-color .25s ease; }
        .m-link:hover { transform:translateY(-2px); background:rgba(0,190,230,.09);
          border-color:rgba(0,190,230,.35); color:#00BEE6; }

        .m-foot { padding-top:1.5rem; border-top:1px solid rgba(255,255,255,.05); }
        .m-name { font-size:1.02rem; font-weight:800; color:#dbe6f5; letter-spacing:-.01em; }
        .m-role { font-family:ui-monospace,monospace; font-size:.68rem; color:#4d5b76;
          margin-top:.35rem; letter-spacing:.05em; }
      `}</style>

      <div className="m-glow m-glow-1"/>
      <div className="m-glow m-glow-2"/>
      <div className="m-grid"/>
      <div className="m-scan"/>

      <div className="m-inner">

        <div className="m-holo-col">
          <div className="m-holo">
            <div className="h-beam"/>
            <div className="h-stage">
              <div className="h-layer h-main"><HoloSign/></div>
              <div className="h-layer h-ghost"><HoloSign/></div>
            </div>
            <div className="h-lines"/>
            <div className="h-frame">
              <span className="h-corner h-c-tl"/>
              <span className="h-corner h-c-tr"/>
              <span className="h-corner h-c-bl"/>
              <span className="h-corner h-c-br"/>
            </div>
            <div className="h-pool"/>
            <div className="h-label">SYS · MAINTENANCE MODE</div>
          </div>
        </div>

        <div className="m-content">

          <div className="m-badge">
            <span className="m-pulse"/>
            <span style={{ fontFamily:"ui-monospace,monospace", fontSize:".67rem", letterSpacing:".18em", color:"#00BEE6" }}>
              MAINTENANCE EN COURS
            </span>
          </div>

          <h1 className="m-title">
            Le site est<br/>
            <span className="m-accent">temporairement indisponible</span>
          </h1>

          <p className="m-sub">
            Une opération de maintenance est en cours sur l'infrastructure backend.
            L'ensemble des fonctionnalités sera rétabli très prochainement.
            Merci de votre compréhension.
          </p>

          <div className="m-term">
            <div className="m-term-bar">
              <span className="m-dot"/><span className="m-dot"/><span className="m-dot"/>
              <span className="m-term-title">ademsassi.com — system status</span>
            </div>
            <div className="m-term-body">
              {logs.slice(0, line).map((l, i) => (
                <div className="m-log" key={i}>
                  <span className="m-tag">[{l.t}]</span>
                  <span className="m-msg">{l.m}</span>
                </div>
              ))}
              {line >= logs.length && (
                <div className="m-log">
                  <span className="m-tag">[WAIT]</span>
                  <span className="m-msg">Rétablissement en attente{dots}<span className="m-caret"/></span>
                </div>
              )}
            </div>
          </div>

          <div className="m-links">
            <a className="m-link" href="mailto:contact@ademsassi.com">
              <span>✉</span> contact@ademsassi.com
            </a>
            <a className="m-link" href="https://www.linkedin.com/in/sassi-adem/" target="_blank" rel="noopener noreferrer">
              <span>in</span> LinkedIn
            </a>
          </div>

          <div className="m-foot">
            <p className="m-name">Adem SASSI</p>
            <p className="m-role">MASTER 2 INGÉNIERIE DATA &amp; IA · INGÉNIEUR IA CHEZ ACENSI</p>
          </div>

        </div>
      </div>
    </div>
  );
}
