const API_URL = "https://web-production-cba0c.up.railway.app";
import { useState } from "react";
import { Lock, Eye, EyeOff, Loader2, ShieldCheck, Mail } from "lucide-react";

export default function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState("password"); // password | otp
  const [otpToken, setOtpToken] = useState("");
  const [otp, setOtp] = useState("");
  const [resetSent, setResetSent] = useState(false);

  const handleLogin = async () => {
    if (!password || loading) return;
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Mot de passe incorrect");
        setPassword("");
      } else if (data.requires2FA) {
        setOtpToken(data.otpToken);
        setStep("otp");
      } else {
        localStorage.setItem("admin_token", data.token);
        onLogin(data.token);
      }
    } catch { setError("Erreur de connexion"); }
    setLoading(false);
  };

  const handleOTP = async () => {
    if (!otp || loading) return;
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API_URL}/api/admin/verify-2fa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otpToken, otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Code incorrect");
        setOtp("");
      } else {
        localStorage.setItem("admin_token", data.token);
        onLogin(data.token);
      }
    } catch { setError("Erreur de connexion"); }
    setLoading(false);
  };

  const handleForgot = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/forgot-password`, { method: "POST" });
      const data = await res.json();
      if (data.success) setResetSent(true);
      else setError(data.error || "Erreur");
    } catch { setError("Erreur de connexion"); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "var(--void)" }}>
      <div className="blob fixed w-96 h-96 opacity-10 pointer-events-none" style={{ background: "var(--neural-blue)", top: "-5%", left: "-10%" }}/>
      <div className="blob fixed w-80 h-80 opacity-10 pointer-events-none" style={{ background: "var(--neural-violet)", bottom: "0%", right: "-5%", animationDelay: "-4s" }}/>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl glass-card border border-neural-blue/30 mb-4 neural-glow">
            {step === "otp" ? <Mail size={28} className="text-neural-blue"/> : <ShieldCheck size={28} className="text-neural-blue"/>}
          </div>
          <h1 className="font-display text-2xl font-black text-star-white mb-1">
            {step === "otp" ? "Vérification 2FA" : "ADMIN PANEL"}
          </h1>
          <p className="text-dim-star text-sm font-mono tracking-widest">
            {step === "otp" ? "Code envoyé par email" : "Accès restreint — Portfolio IA"}
          </p>
        </div>

        <div className="glass-card rounded-3xl p-8 border border-neural-blue/20">
          {resetSent ? (
            <div className="text-center py-4">
              <p className="text-neural-green font-mono text-sm">✅ Lien envoyé par email !</p>
              <button onClick={() => setResetSent(false)} className="mt-4 text-neural-blue text-xs font-mono hover:underline">← Retour</button>
            </div>
          ) : step === "password" ? (
            <>
              <div className="mb-6">
                <label className="font-mono text-xs text-dim-star tracking-widest mb-3 block">MOT DE PASSE ADMIN</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2"><Lock size={15} className="text-dim-star"/></div>
                  <input type={show ? "text" : "password"} value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleLogin()}
                    placeholder="Entrez votre mot de passe..."
                    className="ai-input w-full pl-10 pr-12 py-4 rounded-xl text-sm"/>
                  <button type="button" onClick={() => setShow(!show)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-dim-star hover:text-neural-blue transition-colors">
                    {show ? <EyeOff size={15}/> : <Eye size={15}/>}
                  </button>
                </div>
              </div>
              {error && <div className="mb-4 px-4 py-3 rounded-xl bg-neural-pink/10 border border-neural-pink/30 text-neural-pink text-sm font-mono">⚠ {error}</div>}
              <button type="button" onClick={handleLogin} disabled={!password || loading}
                className="ai-btn w-full py-4 rounded-xl flex items-center justify-center gap-2 mb-3">
                {loading ? <><Loader2 size={15} className="animate-spin"/>Vérification...</> : <><Lock size={15}/>Accéder au panneau admin</>}
              </button>
              <button type="button" onClick={handleForgot}
                className="w-full text-center text-dim-star hover:text-neural-blue text-xs font-mono py-2 transition-colors">
                Mot de passe oublié ?
              </button>
            </>
          ) : (
            <>
              <div className="mb-6">
                <label className="font-mono text-xs text-dim-star tracking-widest mb-3 block">CODE À 6 CHIFFRES</label>
                <input type="text" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  onKeyDown={e => e.key === "Enter" && handleOTP()}
                  placeholder="000000" maxLength={6}
                  className="ai-input w-full px-4 py-4 rounded-xl text-sm text-center font-mono text-2xl tracking-widest"/>
                <p className="text-dim-star text-xs font-mono text-center mt-2">Code envoyé à votre email</p>
              </div>
              {error && <div className="mb-4 px-4 py-3 rounded-xl bg-neural-pink/10 border border-neural-pink/30 text-neural-pink text-sm font-mono">⚠ {error}</div>}
              <button type="button" onClick={handleOTP} disabled={otp.length !== 6 || loading}
                className="ai-btn w-full py-4 rounded-xl flex items-center justify-center gap-2 mb-3">
                {loading ? <><Loader2 size={15} className="animate-spin"/>Vérification...</> : <><ShieldCheck size={15}/>Valider le code</>}
              </button>
              <button type="button" onClick={() => { setStep("password"); setOtp(""); setError(""); }}
                className="w-full text-center text-dim-star hover:text-neural-blue text-xs font-mono py-2 transition-colors">
                ← Retour
              </button>
            </>
          )}
        </div>
        <div className="text-center mt-6">
          <a href="/" className="text-dim-star hover:text-neural-blue transition-colors text-sm font-mono">← Retour au portfolio</a>
        </div>
      </div>
    </div>
  );
}
