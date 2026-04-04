import { useState, useRef } from "react";
import { Send, Mail, Github, Linkedin, Twitter, CheckCircle, Loader2, MapPin, AlertCircle } from "lucide-react";
import { useContent } from "../hooks/useContent";
import emailjs from "@emailjs/browser";

// ── Remplace par tes vraies clés EmailJS ──────────────────────────────────────
const EMAILJS_SERVICE_ID = "service_z3ai43k";
const EMAILJS_TEMPLATE_ID = "template_urnc6kf";
const EMAILJS_PUBLIC_KEY = "-1SHFu-v9iLk08V-_";

export default function Contact() {
  const { content } = useContent();
  const contact = content?.contact || {};
  const formRef = useRef(null);

  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState("");

  const SOCIALS = [
    { icon: Github, label: "GitHub", href: contact.github || "#", color: "hover:text-star-white" },
    { icon: Linkedin, label: "LinkedIn", href: contact.linkedin || "#", color: "hover:text-neural-blue" },
    { icon: Twitter, label: "Twitter / X", href: contact.twitter || "#", color: "hover:text-neural-blue" },
    { icon: Mail, label: contact.email || "Email", href: `mailto:${contact.email || ""}`, color: "hover:text-neural-pink" },
  ];

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_name: form.name,
          from_email: form.email,
          subject: form.subject,
          message: form.message,
          to_email: contact.email || "sassiadem7@gmail.com",
        },
        EMAILJS_PUBLIC_KEY
      );

      setStatus("success");
      setForm({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setStatus("idle"), 5000);
    } catch (err) {
      console.error("EmailJS error:", err);
      setStatus("error");
      setErrorMsg("Erreur d'envoi. Réessayez ou contactez directement par email.");
      setTimeout(() => setStatus("idle"), 4000);
    }
  };

  return (
    <section id="contact" className="relative py-32 px-6">
      

      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-px flex-1 max-w-[60px] bg-neural-blue/40"/>
          <span className="font-mono text-xs text-neural-blue tracking-widest">05 / CONTACT</span>
        </div>

        <h2 className="font-display text-4xl md:text-5xl font-black text-star-white mb-4 leading-tight">
          Travaillons <span className="gradient-text">ensemble</span>
        </h2>
        <p className="text-dim-star mb-16 max-w-xl leading-relaxed">
          Vous avez un projet IA, une opportunité d'alternance ou simplement envie d'échanger ? Envoyez-moi un message directement !
        </p>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Left — Infos */}
          <div className="space-y-8">
            {/* Disponibilité */}
            <div className="glass-card rounded-2xl p-6 border border-white/5">
              <div className="flex items-center gap-3 mb-4">
                <MapPin size={16} className="text-neural-blue"/>
                <span className="font-display text-xs tracking-widest text-dim-star uppercase">Disponibilité</span>
              </div>
              <p className="text-star-white font-semibold mb-1">
                {contact.available ? "🟢 Disponible" : "🔴 Indisponible"}
              </p>
              <p className="text-dim-star text-sm">{contact.availabilityText || "Stage / Alternance en IA"}</p>
              <div className="mt-4 h-px bg-white/5"/>
              <div className="mt-4 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${contact.available ? "bg-neural-green animate-pulse" : "bg-dim-star"}`}/>
                <span className="text-dim-star text-sm font-mono">Répond sous 24h</span>
              </div>
            </div>

            {/* Réseaux */}
            <div>
              <p className="font-mono text-xs text-dim-star tracking-widest mb-4 uppercase">Retrouvez-moi sur</p>
              <div className="space-y-3">
                {SOCIALS.map(s => {
                  const Icon = s.icon;
                  return (
                    <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                      className={`flex items-center gap-3 text-dim-star ${s.color} transition-colors group`}>
                      <div className="w-9 h-9 glass-card border border-white/5 rounded-xl flex items-center justify-center group-hover:border-neural-blue/30 transition-colors">
                        <Icon size={15}/>
                      </div>
                      <span className="text-sm font-mono">{s.label}</span>
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Email direct */}
            <a href={`mailto:${contact.email}`}
              className="flex items-center gap-3 glass-card border border-neural-blue/20 rounded-xl p-4 hover:border-neural-blue/50 transition-all group neural-glow-hover">
              <div className="w-10 h-10 rounded-xl bg-neural-blue/10 border border-neural-blue/30 flex items-center justify-center">
                <Mail size={16} className="text-neural-blue"/>
              </div>
              <div>
                <p className="text-xs text-dim-star font-mono mb-0.5">Email direct</p>
                <p className="text-sm text-neural-blue font-mono group-hover:underline">{contact.email}</p>
              </div>
            </a>
          </div>

          {/* Right — Formulaire */}
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">

            {/* Success */}
            {status === "success" && (
              <div className="flex items-center gap-3 px-4 py-4 rounded-xl"
                style={{ background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.3)" }}>
                <CheckCircle size={18} className="text-neural-green flex-shrink-0"/>
                <div>
                  <p className="text-neural-green font-mono text-sm font-bold">Message envoyé ! ✨</p>
                  <p className="text-dim-star text-xs mt-0.5">Je vous répondrai dans les 24h.</p>
                </div>
              </div>
            )}

            {/* Error */}
            {status === "error" && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{ background: "rgba(255,47,187,0.08)", border: "1px solid rgba(255,47,187,0.3)" }}>
                <AlertCircle size={16} className="text-neural-pink flex-shrink-0"/>
                <p className="text-neural-pink text-sm font-mono">{errorMsg}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-mono text-xs text-dim-star tracking-widest mb-2 block">NOM *</label>
                <input type="text" name="name" value={form.name} onChange={handleChange} required
                  placeholder="Jean Dupont" className="ai-input w-full px-4 py-3 rounded-xl text-sm"/>
              </div>
              <div>
                <label className="font-mono text-xs text-dim-star tracking-widest mb-2 block">EMAIL *</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} required
                  placeholder="jean@email.com" className="ai-input w-full px-4 py-3 rounded-xl text-sm"/>
              </div>
            </div>

            <div>
              <label className="font-mono text-xs text-dim-star tracking-widest mb-2 block">SUJET *</label>
              <input type="text" name="subject" value={form.subject} onChange={handleChange} required
                placeholder="Proposition d'alternance / Collaboration IA..."
                className="ai-input w-full px-4 py-3 rounded-xl text-sm"/>
            </div>

            <div>
              <label className="font-mono text-xs text-dim-star tracking-widest mb-2 block">MESSAGE *</label>
              <textarea name="message" value={form.message} onChange={handleChange} required
                placeholder="Décrivez votre projet ou votre demande..."
                className="ai-input w-full px-4 py-3 rounded-xl text-sm resize-none h-36"/>
            </div>

            <button type="submit" disabled={status === "loading" || status === "success"}
              className="ai-btn w-full py-4 rounded-xl flex items-center justify-center gap-2 text-sm">
              {status === "loading" ? (
                <><Loader2 size={16} className="animate-spin"/>Envoi en cours...</>
              ) : status === "success" ? (
                <><CheckCircle size={16}/>Message envoyé !</>
              ) : (
                <><Send size={16}/>Envoyer le message</>
              )}
            </button>

            <p className="text-center text-dim-star text-xs font-mono">
              * Champs obligatoires — Réponse garantie sous 24h
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
