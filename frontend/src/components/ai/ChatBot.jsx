import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Briefcase, Code2, Mail, GraduationCap, FolderOpen, Star, ExternalLink, Github, Cpu, Eye, Shield, TrendingUp, MessageSquare } from "lucide-react";

const SUGGESTIONS = [
  { text: "Quels sont ses projets ?", icon: FolderOpen },
  { text: "Quelles sont ses compétences ?", icon: Code2 },
  { text: "Comment le contacter ?", icon: Mail },
  { text: "Quels stages a-t-il effectués ?", icon: Briefcase },
  { text: "Sa formation ?", icon: GraduationCap },
  { text: "Est-il disponible ?", icon: Star },
];

const PROJECT_ICONS = [FolderOpen, Cpu, Eye, Shield, TrendingUp, MessageSquare];
const PROJECT_COLORS = ["#00D4FF", "#7B2FFF", "#FF2FBB", "#00FF88", "#FFD700", "#FF6B35"];

// ── Détecte si la réponse parle de projets ───────────────────────────────────
function detectProjects(content) {
  const lines = content.split("\n");
  const projects = [];
  let currentProject = null;

  for (const line of lines) {
    const numbered = line.match(/^(\d+)\.\s+\*?\*?([^:]+)\*?\*?\s*:\s*(.+)/);
    const bulleted = line.match(/^[-•]\s+\*?\*?([^:]+)\*?\*?\s*:\s*(.+)/);

    if (numbered) {
      if (currentProject) projects.push(currentProject);
      currentProject = { title: numbered[2].trim(), desc: numbered[3].trim(), tags: [] };
    } else if (bulleted) {
      if (currentProject) projects.push(currentProject);
      currentProject = { title: bulleted[1].trim(), desc: bulleted[2].trim(), tags: [] };
    } else if (currentProject && line.toLowerCase().includes("technolog")) {
      const tags = line.match(/\b(Python|React|MongoDB|Arduino|ESP32|Java|C\+\+|IoT|MQTT|HTML|CSS|Android|JavaScript|Symfony|PHP|Bootstrap)\b/gi);
      if (tags) currentProject.tags = [...new Set(tags)];
    }
  }
  if (currentProject) projects.push(currentProject);
  return projects.length >= 2 ? projects : null;
}

// ── Détecte si la réponse parle de compétences ───────────────────────────────
function detectSkills(content) {
  const categories = [];
  const lines = content.split("\n");
  let current = null;

  for (const line of lines) {
    const isCategory = line.endsWith(":") && line.length < 50 && !line.startsWith("-");
    const isBullet = line.startsWith("- ") || line.startsWith("• ");

    if (isCategory) {
      if (current) categories.push(current);
      current = { name: line.replace(":", "").trim(), items: [] };
    } else if (isBullet && current) {
      current.items.push(line.replace(/^[-•]\s*/, "").trim());
    }
  }
  if (current) categories.push(current);
  return categories.length >= 2 ? categories : null;
}

// ── Détecte stages/expériences ───────────────────────────────────────────────
function detectExperiences(content) {
  const exps = [];
  const lines = content.split("\n");
  let current = null;

  for (const line of lines) {
    const numbered = line.match(/^(\d+)\.\s+(.+)/);
    const dateMatch = line.match(/(\d{2}\/\d{4}|\d{4})\s*[-–]\s*(\d{2}\/\d{4}|\d{4}|Actuellement)/i);

    if (numbered && !line.includes(":")) {
      if (current) exps.push(current);
      current = { title: numbered[2].trim(), desc: "", date: "" };
    } else if (line.includes(" — ") || line.includes(" chez ")) {
      const parts = line.split(/\s*[—-]\s*/);
      if (parts.length >= 2 && !current) {
        current = { title: parts[0].trim(), company: parts[1].trim(), desc: "", date: "" };
      }
    } else if (dateMatch && current) {
      current.date = line.trim();
    } else if (current && line.trim() && !line.startsWith("-")) {
      current.desc += (current.desc ? " " : "") + line.trim();
    }
  }
  if (current) exps.push(current);
  return exps.length >= 2 ? exps : null;
}

// ── Cartes Projets ────────────────────────────────────────────────────────────
function ProjectCards({ projects }) {
  return (
    <div className="grid grid-cols-1 gap-3 mt-2">
      {projects.map((p, i) => {
        const Icon = PROJECT_ICONS[i % PROJECT_ICONS.length];
        const color = PROJECT_COLORS[i % PROJECT_COLORS.length];
        return (
          <div key={i}
            className="rounded-xl overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${color}08, ${color}03)`,
              border: `1px solid ${color}25`,
              animation: `fadeSlideIn 0.4s ease ${i * 0.08}s both`,
            }}>
            <div className="flex items-start gap-3 p-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                <Icon size={16} style={{ color }}/>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-display text-sm font-bold text-star-white mb-1">{p.title}</h4>
                <p className="text-xs text-dim-star leading-relaxed mb-2">{p.desc}</p>
                {p.tags && p.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {p.tags.slice(0, 4).map(t => (
                      <span key={t} className="text-xs px-2 py-0.5 rounded-full font-mono"
                        style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}>
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Cartes Compétences ────────────────────────────────────────────────────────
function SkillCards({ categories }) {
  const colors = ["#00D4FF", "#7B2FFF", "#FF2FBB", "#00FF88"];
  return (
    <div className="grid grid-cols-1 gap-3 mt-2">
      {categories.map((cat, i) => {
        const color = colors[i % colors.length];
        return (
          <div key={i} className="rounded-xl p-3"
            style={{
              background: `${color}06`,
              border: `1px solid ${color}20`,
              animation: `fadeSlideIn 0.4s ease ${i * 0.08}s both`,
            }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: color, boxShadow: `0 0 6px ${color}` }}/>
              <span className="font-display text-xs font-bold tracking-widest uppercase" style={{ color }}>
                {cat.name}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {cat.items.map((item, j) => (
                <span key={j} className="text-xs px-2 py-1 rounded-lg font-mono text-star-white"
                  style={{ background: `${color}12`, border: `1px solid ${color}20` }}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Cartes Expériences ────────────────────────────────────────────────────────
function ExperienceCards({ experiences }) {
  const colors = ["#7B2FFF", "#00D4FF", "#FF2FBB", "#00FF88"];
  return (
    <div className="space-y-3 mt-2">
      {experiences.map((exp, i) => {
        const color = colors[i % colors.length];
        return (
          <div key={i} className="rounded-xl p-3 flex gap-3"
            style={{
              background: `${color}06`,
              border: `1px solid ${color}20`,
              animation: `fadeSlideIn 0.4s ease ${i * 0.08}s both`,
            }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
              <Briefcase size={14} style={{ color }}/>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display text-sm font-bold text-star-white">{exp.title}</p>
              {exp.company && <p className="text-xs font-mono mb-1" style={{ color }}>{exp.company}</p>}
              {exp.date && <p className="text-xs text-dim-star font-mono mb-1">{exp.date}</p>}
              {exp.desc && <p className="text-xs text-dim-star leading-relaxed">{exp.desc.slice(0, 120)}{exp.desc.length > 120 ? "..." : ""}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Texte simple formaté ──────────────────────────────────────────────────────
function SimpleText({ content }) {
  const lines = content.split("\n").filter(l => l.trim());
  return (
    <div className="space-y-1.5">
      {lines.map((line, i) => {
        const clean = line.replace(/\*\*/g, "").trim();
        const isBullet = line.match(/^[-•▸]\s/);
        const isTitle = clean.endsWith(":") && clean.length < 50 && !isBullet;

        if (isTitle) return (
          <p key={i} className="font-display text-xs font-bold tracking-widest text-neural-blue uppercase pt-1"
            style={{ animation: `fadeSlideIn 0.3s ease ${i * 0.04}s both` }}>
            {clean.replace(":", "")}
          </p>
        );

        if (isBullet) return (
          <div key={i} className="flex items-start gap-2"
            style={{ animation: `fadeSlideIn 0.3s ease ${i * 0.04}s both` }}>
            <span className="text-neural-blue mt-0.5 flex-shrink-0 text-xs">▸</span>
            <span className="text-sm text-star-white leading-relaxed">{clean.replace(/^[-•▸]\s*/, "")}</span>
          </div>
        );

        return (
          <p key={i} className="text-sm text-dim-star leading-relaxed"
            style={{ animation: `fadeSlideIn 0.3s ease ${i * 0.04}s both` }}>
            {clean}
          </p>
        );
      })}
    </div>
  );
}

// ── Rendu intelligent ─────────────────────────────────────────────────────────
function SmartMessage({ content }) {
  const projects = detectProjects(content);
  const skills = detectSkills(content);
  const experiences = detectExperiences(content);

  const intro = content.split("\n")[0];

  if (projects) return (
    <div>
      <p className="text-sm text-dim-star mb-3 leading-relaxed">{intro}</p>
      <ProjectCards projects={projects}/>
    </div>
  );

  if (skills && content.toLowerCase().includes("compétence")) return (
    <div>
      <p className="text-sm text-dim-star mb-3">{intro}</p>
      <SkillCards categories={skills}/>
    </div>
  );

  if (experiences) return (
    <div>
      <p className="text-sm text-dim-star mb-3">{intro}</p>
      <ExperienceCards experiences={experiences}/>
    </div>
  );

  return <SimpleText content={content}/>;
}

// ── Typing Dots ───────────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 px-1 py-1">
      {[0, 1, 2].map(i => (
        <div key={i} className="w-2 h-2 rounded-full bg-neural-blue"
          style={{ animation: `dotBounce 1.2s ease-in-out infinite`, animationDelay: `${i * 0.2}s`, boxShadow: "0 0 6px var(--neural-blue)" }}/>
      ))}
    </div>
  );
}

// ── Composant Principal ───────────────────────────────────────────────────────
export default function ChatBot() {
  const [messages, setMessages] = useState([{
    role: "assistant",
    content: "Bonjour ! Je suis l'assistant IA d'Adem SASSI.\n\nJe peux vous renseigner sur :\n- Ses projets réalisés\n- Ses compétences techniques\n- Ses stages et expériences\n- Sa disponibilité pour un contrat",
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const speak = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const clean = text.replace(/[#*`]/g, "").slice(0, 300);
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = "fr-FR";
    utterance.rate = 1.1;
    utterance.pitch = 1;
    const voices = window.speechSynthesis.getVoices();
    const frVoice = voices.find(v => v.lang.startsWith("fr"));
    if (frVoice) utterance.voice = frVoice;
    window.speechSynthesis.speak(utterance);
  };

  const [ttsEnabled, setTtsEnabled] = useState(false);

  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput("");
    const newMessages = [...messages, { role: "user", content: msg }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const res = await fetch("https://web-production-cba0c.up.railway.app/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages.map(m => ({ role: m.role, content: m.content })) }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.reply || "Désolé, une erreur s'est produite." }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "❌ Erreur de connexion au serveur." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px]">
      <style>{`
        @keyframes fadeSlideIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:none; } }
        @keyframes dotBounce { 0%,80%,100% { transform:translateY(0); } 40% { transform:translateY(-6px); } }
        .msg-in { animation: fadeSlideIn 0.35s ease both; }
      `}</style>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 msg-in ${m.role === "user" ? "justify-end" : ""}`}>
            {m.role === "assistant" && (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-neural-blue/30 to-neural-violet/30 border border-neural-blue/30 flex items-center justify-center flex-shrink-0 mt-1"
                style={{ boxShadow: "0 0 12px rgba(0,212,255,0.15)" }}>
                <Bot size={14} className="text-neural-blue"/>
              </div>
            )}

            <div className={`max-w-[85%] ${m.role === "user" ? "ml-auto" : ""}`}>
              {m.role === "assistant" ? (
                <div className="rounded-2xl rounded-tl-sm overflow-hidden"
                  style={{ background: "linear-gradient(135deg,rgba(0,212,255,0.05),rgba(123,47,255,0.03))", border: "1px solid rgba(0,212,255,0.12)" }}>
                  <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5">
                    <div className="w-1.5 h-1.5 rounded-full bg-neural-blue" style={{ boxShadow: "0 0 4px var(--neural-blue)" }}/>
                    <span className="font-mono text-xs text-dim-star">Assistant IA · Adem SASSI</span>
                  </div>
                  <div className="px-3 py-3">
                    <SmartMessage content={m.content}/>
                  </div>
                </div>
              ) : (
                <div className="px-4 py-3 rounded-2xl rounded-tr-sm text-sm text-star-white"
                  style={{ background: "linear-gradient(135deg,rgba(123,47,255,0.35),rgba(0,212,255,0.2))", border: "1px solid rgba(123,47,255,0.3)" }}>
                  {m.content}
                </div>
              )}
            </div>

            {m.role === "user" && (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-neural-violet/30 to-neural-pink/30 border border-neural-violet/30 flex items-center justify-center flex-shrink-0 mt-1">
                <User size={14} className="text-neural-violet"/>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 msg-in">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-neural-blue/30 to-neural-violet/30 border border-neural-blue/30 flex items-center justify-center flex-shrink-0">
              <Bot size={14} className="text-neural-blue"/>
            </div>
            <div className="rounded-2xl rounded-tl-sm px-3 py-3"
              style={{ background: "linear-gradient(135deg,rgba(0,212,255,0.05),rgba(123,47,255,0.03))", border: "1px solid rgba(0,212,255,0.12)" }}>
              <p className="font-mono text-xs text-dim-star mb-2">Recherche dans le portfolio...</p>
              <TypingDots/>
            </div>
          </div>
        )}
        
      </div>

      {/* Suggestions */}
      {messages.length === 1 && (
        <div className="grid grid-cols-2 gap-2 mb-3">
          {SUGGESTIONS.map(s => {
            const Icon = s.icon;
            return (
              <button key={s.text} onClick={() => send(s.text)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: "rgba(0,212,255,0.04)", border: "1px solid rgba(0,212,255,0.15)" }}>
                <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(0,212,255,0.1)" }}>
                  <Icon size={12} className="text-neural-blue"/>
                </div>
                <span className="text-xs font-mono text-dim-star leading-tight">{s.text}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2">
        <input type="text" value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Posez une question sur Adem SASSI..."
          className="ai-input flex-1 px-4 py-3 rounded-xl text-sm"/>
        <button onClick={() => send()} disabled={!input.trim() || loading}
          className="ai-btn px-4 py-3 rounded-xl">
          {loading ? <Loader2 size={16} className="animate-spin"/> : <Send size={16}/>}
        </button>
      </div>
    </div>
  );
}
