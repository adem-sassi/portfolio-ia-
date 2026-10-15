import { useState } from "react";
import { Lock, Eye, EyeOff, Loader2, ShieldCheck, Mail, ArrowRight } from "lucide-react";
import "../../styles/admin.css";

export default function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState("password"); // password | otp
  const [otpToken, setOtpToken] = useState("");
  const [otp, setOtp] = useState("");
  const [resetSent, setResetSent] = useState(false);

  const handleLogin = async (e) => {
    e?.preventDefault();
    if (!password || loading) return;
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Mot de passe incorrect"); setPassword(""); }
      else if (data.requires2FA) { setOtpToken(data.otpToken); setStep("otp"); }
      else { localStorage.setItem("admin_token", data.token); onLogin(data.token); }
    } catch { setError("Erreur de connexion"); }
    setLoading(false);
  };

  const handleOTP = async (e) => {
    e?.preventDefault();
    if (otp.length !== 6 || loading) return;
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/admin/verify-2fa", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ otpToken, otp }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Code incorrect"); setOtp(""); }
      else { localStorage.setItem("admin_token", data.token); onLogin(data.token); }
    } catch { setError("Erreur de connexion"); }
    setLoading(false);
  };

  const handleForgot = async () => {
    setError("");
    try {
      const res = await fetch("/api/admin/forgot-password", { method: "POST" });
      const data = await res.json();
      if (data.success) setResetSent(true); else setError(data.error || "Erreur");
    } catch { setError("Erreur de connexion"); }
  };

  return (
    <div className="alog">
      <div className="alog-box">
        <div className="alog-h">
          <div className="alog-ic">{step === "otp" ? <Mail size={26} /> : <ShieldCheck size={26} />}</div>
          <h1>ADEM<i>.</i>SASSI</h1>
          <p>{step === "otp" ? "vérification en 2 étapes · code envoyé par email" : "espace admin · accès restreint"}</p>
        </div>

        <div className="alog-card">
          {resetSent ? (
            <>
              <div className="alog-ok">✓ Lien de réinitialisation envoyé par email. Il est valable 15 minutes.</div>
              <button className="alog-sub" onClick={() => setResetSent(false)}>← Retour</button>
            </>
          ) : step === "password" ? (
            <form onSubmit={handleLogin} style={{ display: "grid", gap: 14 }}>
              <label htmlFor="apw">Mot de passe</label>
              <div className="alog-in">
                <Lock size={15} />
                <input id="apw" type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••••" autoFocus autoComplete="current-password" />
                <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Masquer" : "Afficher"}>{show ? <EyeOff size={15} /> : <Eye size={15} />}</button>
              </div>
              {error && <div className="alog-err">⚠ {error}</div>}
              <button className="alog-go" type="submit" disabled={!password || loading}>
                {loading ? <><Loader2 size={15} className="spin" />Vérification…</> : <>Se connecter<ArrowRight size={15} /></>}
              </button>
              <button type="button" className="alog-sub" onClick={handleForgot}>Mot de passe oublié ?</button>
            </form>
          ) : (
            <form onSubmit={handleOTP} style={{ display: "grid", gap: 14 }}>
              <label htmlFor="aotp">Code à 6 chiffres</label>
              <div className="alog-in">
                <input id="aotp" className="otp" inputMode="numeric" autoComplete="one-time-code" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="000000" maxLength={6} autoFocus />
              </div>
              {error && <div className="alog-err">⚠ {error}</div>}
              <button className="alog-go" type="submit" disabled={otp.length !== 6 || loading}>
                {loading ? <><Loader2 size={15} className="spin" />Vérification…</> : <><ShieldCheck size={15} />Valider le code</>}
              </button>
              <button type="button" className="alog-sub" onClick={() => { setStep("password"); setOtp(""); setError(""); }}>← Retour</button>
            </form>
          )}
        </div>
        <a href="/" className="alog-back">← Retour au portfolio</a>
      </div>
    </div>
  );
}
