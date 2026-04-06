import { useState, useEffect } from "react";
import { Shield, Eye, AlertTriangle, Users, Globe, Clock, Ban, RefreshCw } from "lucide-react";

const API_URL = "https://web-production-cba0c.up.railway.app";

export default function SecurityDashboard({ token }) {
  const [data, setData] = useState(null);
  const [logs, setLogs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("visitors");

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [v, l] = await Promise.all([
        fetch(`${API_URL}/api/security/visitors`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        fetch(`${API_URL}/api/security/logs`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      ]);
      setData(v);
      setLogs(l);
    } catch {}
    setLoading(false);
  };

  const unblock = async (ip) => {
    await fetch(`${API_URL}/api/security/unblock`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ip })
    });
    load();
  };

  if (loading) return <div className="text-center py-8"><RefreshCw size={20} className="animate-spin text-neural-blue mx-auto"/></div>;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Users, label: "Total visiteurs", value: data?.total || 0, color: "#00D4FF" },
          { icon: Eye, label: "Aujourd'hui", value: data?.today || 0, color: "#00FF88" },
          { icon: AlertTriangle, label: "IPs bloquées", value: logs?.blocked?.length || 0, color: "#FF2FBB" },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="glass-card rounded-xl p-3 border border-white/5 text-center">
              <Icon size={14} style={{ color: stat.color }} className="mx-auto mb-1"/>
              <p className="font-display text-xl font-black" style={{ color: stat.color }}>{stat.value}</p>
              <p className="text-dim-star text-xs font-mono">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {["visitors", "companies", "logs"].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-3 py-1.5 rounded-lg text-xs font-mono transition-all"
            style={{
              background: tab === t ? "rgba(0,212,255,0.2)" : "rgba(0,212,255,0.05)",
              border: "1px solid rgba(0,212,255,0.3)",
              color: "var(--neural-blue)"
            }}>
            {t === "visitors" ? "Visiteurs" : t === "companies" ? "Entreprises" : "Connexions"}
          </button>
        ))}
        <button onClick={load} className="ml-auto p-1.5 glass-card border border-white/10 rounded-lg">
          <RefreshCw size={12} className="text-dim-star"/>
        </button>
      </div>

      {/* Visiteurs */}
      {tab === "visitors" && (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {data?.visitors?.map((v, i) => (
            <div key={i} className="flex items-center gap-3 p-3 glass-card rounded-xl border border-white/5">
              <Globe size={14} className="text-neural-blue flex-shrink-0"/>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-star-white font-mono truncate">{v.page}</p>
                <p className="text-xs text-dim-star">{v.city}, {v.country} — {v.ip}</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-dim-star font-mono flex-shrink-0">
                <Clock size={10}/>
                {new Date(v.createdAt).toLocaleDateString('fr-FR')}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Entreprises */}
      {tab === "companies" && (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {data?.companies?.length === 0 && (
            <p className="text-dim-star text-xs font-mono text-center py-4">Pas encore de données entreprises</p>
          )}
          {data?.companies?.map((c, i) => (
            <div key={i} className="flex items-center gap-3 p-3 glass-card rounded-xl border border-white/5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.2)" }}>
                <span className="text-xs font-bold text-neural-blue">{c._id?.charAt(0)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-star-white font-mono truncate">{c._id}</p>
                <p className="text-xs text-dim-star">{c.count} visite{c.count > 1 ? "s" : ""}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Logs connexions */}
      {tab === "logs" && (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {logs?.blocked?.length > 0 && (
            <div className="p-3 rounded-xl mb-3" style={{ background: "rgba(255,47,187,0.08)", border: "1px solid rgba(255,47,187,0.3)" }}>
              <p className="text-neural-pink text-xs font-mono font-bold mb-2">IPs bloquées</p>
              {logs.blocked.map((b, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-xs text-dim-star font-mono">{b.ip}</span>
                  <button onClick={() => unblock(b.ip)}
                    className="flex items-center gap-1 text-xs text-neural-blue hover:opacity-80">
                    <Ban size={10}/> Débloquer
                  </button>
                </div>
              ))}
            </div>
          )}
          {logs?.logs?.map((l, i) => (
            <div key={i} className="flex items-center gap-3 p-3 glass-card rounded-xl border border-white/5">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${l.success ? "bg-neural-green" : "bg-neural-pink"}`}/>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-mono" style={{ color: l.success ? "var(--neural-green)" : "var(--neural-pink)" }}>
                  {l.success ? "✅ Connexion réussie" : "❌ Tentative échouée"}
                </p>
                <p className="text-xs text-dim-star">{l.ip}</p>
              </div>
              <p className="text-xs text-dim-star font-mono flex-shrink-0">
                {new Date(l.createdAt).toLocaleDateString('fr-FR')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
