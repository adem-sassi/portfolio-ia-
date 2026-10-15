import { useEffect, useState } from "react";
import { Loader2, RefreshCw, CheckCircle, Search } from "lucide-react";

const H = (token) => ({ Authorization: `Bearer ${token}`, "Content-Type": "application/json" });
const fmt = (d) => new Date(d).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

function Card({ label, value, color, sub }) {
  return (
    <div className="glass-card rounded-2xl p-4 border border-white/5">
      <p className="font-display text-3xl font-black" style={{ color }}>{value}</p>
      <p className="text-dim-star text-xs font-mono mt-1">{label}</p>
      {sub && <p className="text-dim-star/60 text-[10px] font-mono mt-1">{sub}</p>}
    </div>
  );
}

function Bars({ rows, labelKey, color }) {
  const max = Math.max(1, ...rows.map((r) => r.n));
  if (!rows.length) return <p className="text-dim-star text-sm py-4">Rien pour l'instant.</p>;
  return (
    <div className="space-y-2">
      {rows.map((r, i) => (
        <div key={i} className="grid grid-cols-[1fr_auto] gap-3 items-center">
          <div className="min-w-0">
            <p className="text-star-white text-sm truncate" title={r[labelKey]}>{r[labelKey]}</p>
            <div className="h-1.5 rounded-full bg-white/5 mt-1 overflow-hidden"><div className="h-full rounded-full" style={{ width: `${(r.n / max) * 100}%`, background: color }} /></div>
          </div>
          <span className="text-dim-star text-xs font-mono tabular-nums">{r.n}</span>
        </div>
      ))}
    </div>
  );
}

export function StatsPanel({ token }) {
  const [days, setDays] = useState(30);
  const [d, setD] = useState(null);
  const [loading, setLoading] = useState(true);
  const load = () => {
    setLoading(true);
    fetch(`/api/stats/summary?days=${days}`, { headers: H(token) }).then((r) => r.json()).then((x) => { setD(x); setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(load, [days]);
  if (loading && !d) return <div className="flex justify-center py-10"><Loader2 size={20} className="animate-spin text-neural-blue" /></div>;
  if (!d || d.error) return <p className="text-dim-star text-sm">Statistiques indisponibles pour le moment.</p>;
  const c = d.counts || {}, views = c.view || 0, en = d.langs?.en || 0;
  const series = Array.from({ length: Math.min(d.days, 30) }, (_, i) => {
    const day = new Date(Date.now() - (Math.min(d.days, 30) - 1 - i) * 864e5);
    const key = day.toLocaleDateString("sv-SE", { timeZone: "Europe/Paris" });
    return { key, label: day.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }), n: d.perDay.find((x) => x.day === key)?.n || 0 };
  });
  const maxS = Math.max(1, ...series.map((x) => x.n));
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        {[7, 30, 90].map((n) => (
          <button key={n} onClick={() => setDays(n)} className={`px-3 py-1.5 rounded-lg text-xs font-mono border ${days === n ? "border-neural-blue text-neural-blue bg-neural-blue/10" : "border-white/10 text-dim-star"}`}>{n} jours</button>
        ))}
        <button onClick={load} className="ml-auto flex items-center gap-2 text-xs text-dim-star hover:text-neural-blue font-mono"><RefreshCw size={12} className={loading ? "animate-spin" : ""} />Rafraîchir</button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card label="Visites" value={views} color="#00D4FF" />
        <Card label="Questions au chatbot" value={c.chat || 0} color="#7B2FFF" />
        <Card label="Projets ouverts" value={c.project || 0} color="#FF2FBB" />
        <Card label="CV téléchargés" value={c.cv || 0} color="#00FF88" sub={`${c.contact || 0} message(s) · ${c.email || 0} clic(s) email`} />
      </div>
      <div className="glass-card rounded-2xl p-5 border border-white/5">
        <div className="flex justify-between items-center mb-4">
          <p className="text-dim-star text-xs font-mono">VISITES PAR JOUR</p>
          <p className="text-dim-star text-xs font-mono">🇫🇷 {views - en} · 🇬🇧 {en} {views ? `(${Math.round((en / views) * 100)} % en anglais)` : ""}</p>
        </div>
        <div className="flex items-end gap-1 h-28">
          {series.map((x) => (
            <div key={x.key} className="flex-1 flex flex-col items-center justify-end h-full" title={`${x.label} : ${x.n}`}>
              <div className="w-full rounded-t" style={{ height: `${Math.max((x.n / maxS) * 100, 3)}%`, background: x.n ? "linear-gradient(to top,#00D4FF,#7B2FFF)" : "rgba(255,255,255,0.05)" }} />
            </div>
          ))}
        </div>
        <div className="flex justify-between text-dim-star/60 text-[10px] font-mono mt-2"><span>{series[0]?.label}</span><span>aujourd'hui</span></div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-white/5">
          <p className="text-dim-star text-xs font-mono mb-4">QUESTIONS LES PLUS POSÉES</p>
          <Bars rows={d.topQuestions} labelKey="q" color="#7B2FFF" />
        </div>
        <div className="glass-card rounded-2xl p-5 border border-white/5">
          <p className="text-dim-star text-xs font-mono mb-4">PROJETS LES PLUS OUVERTS</p>
          <Bars rows={d.topProjects} labelKey="p" color="#FF2FBB" />
        </div>
      </div>
      <div className="glass-card rounded-2xl p-5 border border-white/5">
        <p className="text-dim-star text-xs font-mono mb-3">DERNIÈRES QUESTIONS AU CHATBOT</p>
        {!d.lastQuestions.length ? <p className="text-dim-star text-sm">Aucune question pour l'instant.</p> : (
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {d.lastQuestions.map((q, i) => (
              <div key={i} className="flex gap-3 items-start p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-white/10 text-dim-star">{q.lang === "en" ? "EN" : "FR"}</span>
                <p className="text-star-white text-sm flex-1 min-w-0 break-words">{q.value}</p>
                <span className="text-dim-star text-[11px] font-mono whitespace-nowrap">{fmt(q.createdAt)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <p className="text-dim-star/60 text-[11px] font-mono">Statistiques anonymes : aucune adresse IP ni donnée personnelle enregistrée. Effacées automatiquement après 6 mois.</p>
    </div>
  );
}

function Row({ item, token, onSaved }) {
  const [en, setEn] = useState(item.en);
  const [state, setState] = useState("");
  const dirty = en !== item.en;
  const save = async () => {
    setState("saving");
    try {
      const r = await fetch("/api/stats/translations", { method: "PUT", headers: H(token), body: JSON.stringify({ hash: item.hash, en }) });
      if (!r.ok) throw new Error();
      setState("ok"); onSaved(item.hash, en); setTimeout(() => setState(""), 1500);
    } catch { setState("err"); }
  };
  return (
    <div className="glass-card rounded-xl p-4 border border-white/5 grid md:grid-cols-2 gap-3">
      <div>
        <p className="text-[10px] font-mono text-neural-violet mb-1">{item.section.toUpperCase()} · FRANÇAIS</p>
        <p className="text-dim-star text-sm whitespace-pre-wrap">{item.fr}</p>
      </div>
      <div>
        <p className="text-[10px] font-mono text-neural-blue mb-1">ANGLAIS {item.en ? "" : "· pas encore traduit (se fera à la prochaine visite EN)"}</p>
        <textarea value={en} onChange={(e) => setEn(e.target.value)} rows={Math.min(6, Math.max(2, Math.ceil((item.fr.length || 1) / 60)))} className="ai-input w-full px-3 py-2 rounded-lg text-sm resize-y" />
        <div className="flex items-center gap-3 mt-2">
          <button disabled={!dirty || state === "saving"} onClick={save} className="px-3 py-1.5 rounded-lg text-xs font-mono border border-neural-blue/40 text-neural-blue disabled:opacity-30">{state === "saving" ? "…" : "Enregistrer"}</button>
          {state === "ok" && <span className="text-neural-green text-xs flex items-center gap-1"><CheckCircle size={12} />enregistré</span>}
          {state === "err" && <span className="text-neural-pink text-xs">erreur</span>}
        </div>
      </div>
    </div>
  );
}

export function TranslationsPanel({ token }) {
  const [items, setItems] = useState(null);
  const [q, setQ] = useState("");
  const [onlyMissing, setOnlyMissing] = useState(false);
  useEffect(() => {
    fetch("/api/stats/translations", { headers: H(token) }).then((r) => r.json()).then((x) => setItems(Array.isArray(x) ? x : [])).catch(() => setItems([]));
  }, []);
  if (!items) return <div className="flex justify-center py-10"><Loader2 size={20} className="animate-spin text-neural-blue" /></div>;
  const shown = items.filter((x) => (!onlyMissing || !x.en) && (!q || (x.fr + " " + x.en).toLowerCase().includes(q.toLowerCase())));
  const onSaved = (hash, en) => setItems((l) => l.map((x) => (x.hash === hash ? { ...x, en } : x)));
  return (
    <div className="space-y-4">
      <p className="text-dim-star text-sm">Tes textes sont traduits automatiquement en anglais par l'IA. Si une traduction ne te plaît pas, corrige-la ici : elle est en ligne tout de suite (laisse vide pour la faire retraduire).</p>
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 ai-input px-3 py-2 rounded-lg flex-1 min-w-[200px]"><Search size={14} className="text-dim-star" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un texte…" className="bg-transparent outline-none text-sm flex-1" /></div>
        <label className="flex items-center gap-2 text-xs font-mono text-dim-star"><input type="checkbox" checked={onlyMissing} onChange={(e) => setOnlyMissing(e.target.checked)} />non traduits seulement</label>
        <span className="text-dim-star text-xs font-mono">{items.filter((x) => x.en).length}/{items.length} traduits</span>
      </div>
      <div className="space-y-3">{shown.map((x) => <Row key={x.hash} item={x} token={token} onSaved={onSaved} />)}</div>
    </div>
  );
}
