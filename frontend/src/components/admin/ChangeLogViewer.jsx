import { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";

const API_URL = "https://web-production-cba0c.up.railway.app";

export default function ChangeLogViewer({ token }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/changelog`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setLogs(data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <div>
      <button onClick={load} className="flex items-center gap-2 text-xs font-mono text-dim-star mb-3">
        <RefreshCw size={12} className={loading ? "animate-spin" : ""}/>
        Rafraîchir
      </button>
      {logs.length === 0 ? (
        <p className="text-dim-star text-xs font-mono">Aucune modification enregistrée</p>
      ) : (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {logs.map((log, i) => (
            <div key={i} className="p-3 glass-card rounded-xl border border-white/5 text-xs">
              <p className="text-star-white font-mono">{log.details}</p>
              <p className="text-dim-star mt-1">{new Date(log.createdAt).toLocaleString('fr-FR')}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
