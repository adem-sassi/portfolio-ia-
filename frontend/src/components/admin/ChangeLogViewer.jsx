import { useState, useEffect } from "react";
import { History, RefreshCw, Clock, Edit } from "lucide-react";

const API_URL = "https://web-production-cba0c.up.railway.app";

export default function ChangeLogViewer({ token }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/changelog`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setLogs(Array.isArray(data) ? data : []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-dim-star text-xs font-mono">{logs.length} MODIFICATIONS</p>
        <button onClick={load} className="p-1.5 glass-card border border-white/10 rounded-lg">
          <RefreshCw size={12} className="text-dim-star"/>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-4">
          <RefreshCw size={16} className="animate-spin text-neural-blue mx-auto"/>
        </div>
      ) : logs.length === 0 ? (
        <p className="text-dim-star text-xs font-mono text-center py-4">Aucune modification enregistrée</p>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {logs.map((log, i) => (
            <div key={i} className="flex items-center gap-3 p-3 glass-card rounded-xl border border-white/5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.2)" }}>
                <Edit size={12} className="text-neural-blue"/>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-star-white font-mono truncate">{log.details}</p>
                <p className="text-xs text-dim-star">{log.ip}</p>
              </div>
              <div className="flex items-center gap-1 text-dim-star text-xs font-mono flex-shrink-0">
                <Clock size={10}/>
                {new Date(log.createdAt).toLocaleDateString('fr-FR')} {new Date(log.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
