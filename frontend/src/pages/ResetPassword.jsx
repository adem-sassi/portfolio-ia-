import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Lock, Loader2, CheckCircle } from "lucide-react";

const API_URL = "https://web-production-cba0c.up.railway.app";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleReset = async () => {
    if (!password || loading) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error);
      else setSuccess(true);
    } catch { setError("Erreur de connexion"); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "var(--void)" }}>
      <div className="w-full max-w-md glass-card rounded-3xl p-8 border border-neural-blue/20">
        <h1 className="font-display text-2xl font-black text-star-white mb-2 text-center">Nouveau mot de passe</h1>
        <p className="text-dim-star text-sm font-mono text-center mb-8">Portfolio Admin — ademsassi.com</p>

        {success ? (
          <div className="text-center">
            <CheckCircle size={48} className="text-neural-green mx-auto mb-4"/>
            <p className="text-neural-green font-mono">Mot de passe changé !</p>
            <a href="/admin" className="mt-4 inline-block text-neural-blue hover:underline text-sm font-mono">
              → Retour à l'admin
            </a>
          </div>
        ) : (
          <>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Nouveau mot de passe..."
              className="ai-input w-full px-4 py-3 rounded-xl text-sm mb-4"
            />
            {error && <p className="text-neural-pink text-xs font-mono mb-4">⚠ {error}</p>}
            <button onClick={handleReset} disabled={!password || loading}
              className="ai-btn w-full py-3 rounded-xl flex items-center justify-center gap-2">
              {loading ? <Loader2 size={15} className="animate-spin"/> : <Lock size={15}/>}
              Changer le mot de passe
            </button>
          </>
        )}
      </div>
    </div>
  );
}
