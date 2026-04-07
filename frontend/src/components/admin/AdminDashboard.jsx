import { useState, useEffect } from "react";
import { LogOut, Save, User, BookOpen, Code2, FolderOpen, Mail, Loader2, CheckCircle, ChevronDown, ChevronUp, Plus, Trash2, Eye, RefreshCw, History, Clock, BarChart2, Home, Settings, FileText, Shield, Upload, Cpu } from "lucide-react";
import SkillsEditor from "./SkillsEditor";
import TechEditor from "./TechEditor";
import CVUpload from "./CVUpload";
import BlogEditor from "./BlogEditor";
import SecurityDashboard from "./SecurityDashboard";

const API_URL = "https://web-production-cba0c.up.railway.app";

function VisitChart({ token }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/security/visitors`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-neural-blue"/></div>;
  if (!stats) return <p className="text-dim-star text-sm">Données non disponibles</p>;

  const visitors = stats.visitors || [];
  const last7days = Array.from({length: 7}, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const count = visitors.filter(v => new Date(v.createdAt).toDateString() === d.toDateString()).length;
    return { date: d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" }), count };
  });
  const maxCount = Math.max(...last7days.map(d => d.count), 1);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total visites", value: stats.total || 0, color: "#00D4FF" },
          { label: "Aujourd'hui", value: stats.today || 0, color: "#00FF88" },
          { label: "Entreprises", value: stats.companies?.length || 0, color: "#7B2FFF" },
        ].map((s, i) => (
          <div key={i} className="glass-card rounded-2xl p-4 border border-white/5 text-center">
            <p className="font-display text-3xl font-black mb-1" style={{ color: s.color }}>{s.value}</p>
            <p className="text-dim-star text-xs font-mono">{s.label}</p>
          </div>
        ))}
      </div>

      <div>
        <p className="text-dim-star text-xs font-mono mb-4">VISITES — 7 DERNIERS JOURS</p>
        <div className="flex items-end gap-2 h-32">
          {last7days.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <p className="text-neural-blue text-xs font-bold" style={{ fontSize: "10px", minHeight: "14px" }}>{d.count > 0 ? d.count : ""}</p>
              <div className="w-full rounded-t-lg transition-all duration-700"
                style={{ height: `${Math.max((d.count / maxCount) * 96, 4)}px`, background: d.count > 0 ? "linear-gradient(to top, #00D4FF, #7B2FFF)" : "rgba(255,255,255,0.05)" }}/>
              <p className="text-dim-star font-mono text-center" style={{ fontSize: "9px" }}>{d.date}</p>
            </div>
          ))}
        </div>
      </div>

      {stats.companies?.length > 0 && (
        <div>
          <p className="text-dim-star text-xs font-mono mb-3">ENTREPRISES RÉCENTES</p>
          <div className="space-y-2">
            {stats.companies.slice(0, 5).map((c, i) => (
              <div key={i} className="flex items-center justify-between p-3 glass-card rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.2)" }}>
                    <span className="text-xs font-bold text-neural-blue">{c._id?.charAt(0)}</span>
                  </div>
                  <p className="text-star-white text-sm font-mono truncate max-w-48">{c._id}</p>
                </div>
                <span className="text-dim-star text-xs font-mono">{c.count} visite{c.count > 1 ? "s" : ""}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ChangeLog({ token }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/changelog`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (Array.isArray(data)) setLogs(data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-dim-star text-xs font-mono">{logs.length} ENTRÉES</p>
        <button onClick={load} className="flex items-center gap-2 text-xs font-mono text-dim-star hover:text-neural-blue transition-colors">
          <RefreshCw size={12} className={loading ? "animate-spin" : ""}/>
          Rafraîchir
        </button>
      </div>
      {logs.length === 0 ? (
        <div className="text-center py-8">
          <History size={32} className="text-dim-star mx-auto mb-2 opacity-30"/>
          <p className="text-dim-star text-sm font-mono">Aucune modification enregistrée</p>
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map((log, i) => (
            <div key={i} className="flex items-center gap-4 p-4 glass-card rounded-xl border border-white/5">
              <div className="w-2 h-2 rounded-full bg-neural-blue flex-shrink-0"/>
              <div className="flex-1 min-w-0">
                <p className="text-star-white text-sm font-mono">{log.details}</p>
                <p className="text-dim-star text-xs mt-1">{log.ip}</p>
              </div>
              <p className="text-dim-star text-xs font-mono flex-shrink-0">
                {new Date(log.createdAt).toLocaleDateString("fr-FR")} {new Date(log.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: BarChart2, group: "overview" },
  { id: "hero", label: "Hero", icon: Home, group: "content" },
  { id: "about", label: "À Propos", icon: User, group: "content" },
  { id: "skills", label: "Compétences", icon: Cpu, group: "content" },
  { id: "techs", label: "Technologies", icon: Code2, group: "content" },
  { id: "projects", label: "Projets", icon: FolderOpen, group: "content" },
  { id: "testimonials", label: "Témoignages", icon: User, group: "content" },
  { id: "contact", label: "Contact", icon: Mail, group: "content" },
  { id: "blog", label: "Blog", icon: BookOpen, group: "tools" },
  { id: "cv", label: "CV PDF", icon: Upload, group: "tools" },
  { id: "security", label: "Sécurité", icon: Shield, group: "tools" },
  { id: "changelog", label: "Historique", icon: History, group: "tools" },
];

export default function AdminDashboard({ token, onLogout }) {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [content, setContent] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/admin/content`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { setContent(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const save = async (section, data) => {
    setSaving(true);
    try {
      await fetch(`${API_URL}/api/admin/content/${section}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
    setSaving(false);
  };

  const update = (section, field, value) => {
    setContent(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
  };

  const groups = [
    { id: "overview", label: "VUE D'ENSEMBLE" },
    { id: "content", label: "CONTENU" },
    { id: "tools", label: "OUTILS" },
  ];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--void)" }}>
      <Loader2 size={32} className="animate-spin text-neural-blue"/>
    </div>
  );

  const renderContent = () => {
    if (!content) return null;

    switch (activeSection) {
      case "dashboard":
        return (
          <div className="space-y-8">
            <div>
              <h2 className="font-display text-2xl font-black text-star-white mb-2">Tableau de bord</h2>
              <p className="text-dim-star text-sm font-mono">Vue d'ensemble de votre portfolio</p>
            </div>
            <VisitChart token={token}/>
          </div>
        );

      case "hero":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl font-black text-star-white mb-2">Hero — Présentation</h2>
              <p className="text-dim-star text-sm font-mono">La première section visible sur le portfolio</p>
            </div>
            <div className="space-y-4">
              {[
                { field: "name", label: "Nom complet" },
                { field: "title", label: "Titre" },
                { field: "description", label: "Description", multiline: true },
              ].map(({ field, label, multiline }) => (
                <div key={field}>
                  <label className="text-dim-star text-xs font-mono tracking-widest mb-2 block">{label.toUpperCase()}</label>
                  {multiline ? (
                    <textarea value={content.hero?.[field] || ""} onChange={e => update("hero", field, e.target.value)}
                      className="ai-input w-full px-4 py-3 rounded-xl text-sm resize-none h-24"/>
                  ) : (
                    <input value={content.hero?.[field] || ""} onChange={e => update("hero", field, e.target.value)}
                      className="ai-input w-full px-4 py-3 rounded-xl text-sm"/>
                  )}
                </div>
              ))}
              <button onClick={() => save("hero", content.hero)}
                className="ai-btn px-6 py-3 rounded-xl flex items-center gap-2 text-sm">
                {saving ? <Loader2 size={14} className="animate-spin"/> : saved ? <CheckCircle size={14}/> : <Save size={14}/>}
                {saved ? "Sauvegardé !" : "Sauvegarder"}
              </button>
            </div>
          </div>
        );

      case "about":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl font-black text-star-white mb-2">À Propos</h2>
              <p className="text-dim-star text-sm font-mono">Votre parcours et présentation</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-dim-star text-xs font-mono tracking-widest mb-2 block">TITRE</label>
                <input value={content.about?.title || ""} onChange={e => update("about", "title", e.target.value)}
                  className="ai-input w-full px-4 py-3 rounded-xl text-sm"/>
              </div>
              {content.about?.paragraphs?.map((p, i) => (
                <div key={i}>
                  <label className="text-dim-star text-xs font-mono tracking-widest mb-2 block">PARAGRAPHE {i + 1}</label>
                  <textarea value={p} onChange={e => {
                    const paras = [...(content.about?.paragraphs || [])];
                    paras[i] = e.target.value;
                    update("about", "paragraphs", paras);
                  }} className="ai-input w-full px-4 py-3 rounded-xl text-sm resize-none h-20"/>
                </div>
              ))}
              <button onClick={() => save("about", content.about)}
                className="ai-btn px-6 py-3 rounded-xl flex items-center gap-2 text-sm">
                {saving ? <Loader2 size={14} className="animate-spin"/> : <Save size={14}/>}
                Sauvegarder
              </button>
            </div>
          </div>
        );

      case "skills":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl font-black text-star-white mb-2">Compétences</h2>
              <p className="text-dim-star text-sm font-mono">Gérez vos catégories et niveaux</p>
            </div>
            <SkillsEditor token={token} initialSkills={content.skills}/>
          </div>
        );

      case "techs":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl font-black text-star-white mb-2">Technologies</h2>
              <p className="text-dim-star text-sm font-mono">Badges de technologies affichés sur le portfolio</p>
            </div>
            <TechEditor token={token} initialTechs={content.techs}/>
          </div>
        );

      case "contact":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl font-black text-star-white mb-2">Contact</h2>
              <p className="text-dim-star text-sm font-mono">Coordonnées et réseaux sociaux</p>
            </div>
            <div className="space-y-4">
              {[
                { field: "email", label: "Email" },
                { field: "github", label: "GitHub URL" },
                { field: "linkedin", label: "LinkedIn URL" },
                { field: "availabilityText", label: "Texte de disponibilité" },
              ].map(({ field, label }) => (
                <div key={field}>
                  <label className="text-dim-star text-xs font-mono tracking-widest mb-2 block">{label.toUpperCase()}</label>
                  <input value={content.contact?.[field] || ""} onChange={e => update("contact", field, e.target.value)}
                    className="ai-input w-full px-4 py-3 rounded-xl text-sm"/>
                </div>
              ))}
              <button onClick={() => save("contact", content.contact)}
                className="ai-btn px-6 py-3 rounded-xl flex items-center gap-2 text-sm">
                {saving ? <Loader2 size={14} className="animate-spin"/> : <Save size={14}/>}
                Sauvegarder
              </button>
            </div>
          </div>
        );

      case "blog":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl font-black text-star-white mb-2">Blog & Articles</h2>
              <p className="text-dim-star text-sm font-mono">Gérez vos articles publiés</p>
            </div>
            <BlogEditor token={token}/>
          </div>
        );

      case "cv":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl font-black text-star-white mb-2">CV PDF</h2>
              <p className="text-dim-star text-sm font-mono">Uploadez votre CV en format PDF</p>
            </div>
            <CVUpload token={token}/>
          </div>
        );

      case "security":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl font-black text-star-white mb-2">Sécurité & Visiteurs</h2>
              <p className="text-dim-star text-sm font-mono">Surveillance et protection du site</p>
            </div>
            <SecurityDashboard token={token}/>
          </div>
        );

      case "changelog":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl font-black text-star-white mb-2">Historique</h2>
              <p className="text-dim-star text-sm font-mono">Toutes les modifications effectuées</p>
            </div>
            <ChangeLog token={token}/>
          </div>
        );

      default:
        return (
          <div className="text-center py-20">
            <p className="text-dim-star font-mono">Section en cours de développement</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "var(--void)" }}>

      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 border-r border-white/5 flex flex-col"
        style={{ background: "rgba(255,255,255,0.02)" }}>

        {/* Logo */}
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-display font-black text-sm"
              style={{ background: "linear-gradient(135deg, #00D4FF20, #7B2FFF20)", border: "1px solid #00D4FF40", color: "#00D4FF" }}>
              AS
            </div>
            <div>
              <p className="font-display font-black text-star-white text-sm">Admin Panel</p>
              <p className="text-dim-star text-xs font-mono">ademsassi.com</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
          {groups.map(group => (
            <div key={group.id}>
              <p className="text-dim-star/50 text-xs font-mono tracking-widest mb-2 px-2">{group.label}</p>
              <div className="space-y-1">
                {NAV_ITEMS.filter(item => item.group === group.id).map(item => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button key={item.id} onClick={() => setActiveSection(item.id)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-mono transition-all"
                      style={{
                        background: isActive ? "rgba(0,212,255,0.1)" : "transparent",
                        border: `1px solid ${isActive ? "rgba(0,212,255,0.2)" : "transparent"}`,
                        color: isActive ? "var(--neural-blue)" : "var(--dim-star)"
                      }}>
                      <Icon size={15}/>
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="p-4 border-t border-white/5 space-y-2">
          <a href="/" target="_blank"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-mono text-dim-star hover:text-neural-blue transition-colors">
            <Eye size={15}/> Voir le site
          </a>
          <button onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-mono text-dim-star hover:text-neural-pink transition-colors">
            <LogOut size={15}/> Déconnexion
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
