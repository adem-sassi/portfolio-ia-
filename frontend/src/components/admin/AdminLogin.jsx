const API_URL = "https://web-production-cba0c.up.railway.app";
import { useState } from "react";
import { Lock, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";

export default function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);

  const handleSubmit = async () => {
    if (!password || loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAttempts((a) => a + 1);
        setError(data.error || "Mot de passe incorrect");
        setPassword("");
      } else {
        localStorage.setItem("admin_token", data.token);
        onLogin(data.token);
      }
    } catch {
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "var(--void)" }}>
      <div className="blob fixed w-96 h-96 opacity-10 pointer-events-none"
        style={{ background: "var(--neural-blue)", top: "-5%", left: "-10%" }} />
      <div className="blob fixed w-80 h-80 opacity-10 pointer-events-none"
        style={{ background: "var(--neural-violet)", bottom: "0%", right: "-5%", animationDelay: "-4s" }} />
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl glass-card border border-neural-blue/30 mb-4 neural-glow">
            <ShieldCheck size={28} className="text-neural-blue" />
          </div>
          <h1 className="font-display text-2xl font-black text-star-white mb-1">ADMIN PANEL</h1>
          <p className="text-dim-star text-sm font-mono tracking-widest">Accès restreint — Portfolio IA</p>
        </div>
        <div className="glass-card rounded-3xl p-8 border border-neural-blue/20">
          <div className="mb-6">
            <label className="font-mono text-xs text-dim-star tracking-widest mb-3 block">MOT DE PASSE ADMIN</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <Lock size={15} className="text-dim-star" />
              </div>
              <input
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="Entrez votre mot de passe..."
                className="ai-input w-full pl-10 pr-12 py-4 rounded-xl text-sm"
              />
              <button type="button" onClick={() => setShow(!show)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-dim-star hover:text-neural-blue transition-colors">
                {show ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-neural-pink/10 border border-neural-pink/30 text-neural-pink text-sm font-mono">
              ⚠ {error}
              {attempts >= 3 && <p className="mt-1 text-xs text-dim-star">{attempts} tentatives échouées</p>}
            </div>
          )}
          <button type="button" onClick={handleSubmit} disabled={!password || loading}
            className="ai-btn w-full py-4 rounded-xl flex items-center justify-center gap-2">
            {loading ? <><Loader2 size={15} className="animate-spin" /> Vérification...</> : <><Lock size={15} /> Accéder au panneau admin</>}
          </button>
          <p className="text-center text-dim-star text-xs font-mono mt-4 tracking-wide">Session valide 8 heures</p>
        </div>
        <div className="text-center mt-6">
          <a href="/" className="text-dim-star hover:text-neural-blue transition-colors text-sm font-mono">← Retour au portfolio</a>
        </div>
      </div>
    </div>
  );
}
