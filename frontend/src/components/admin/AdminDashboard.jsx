import { useState, useEffect } from "react";
import { LogOut, Save, User, BookOpen, Code2, FolderOpen, Mail, Loader2, CheckCircle, ChevronDown, ChevronUp, Plus, Trash2, Eye, RefreshCw } from "lucide-react";
import SkillsEditor from "./SkillsEditor";
import TechEditor from "./TechEditor";
import ImageUpload from "./ImageUpload";
import CVUpload from "./CVUpload";
import BlogEditor from "./BlogEditor";

function Section({ title, icon: Icon, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="glass-card rounded-2xl border border-white/5 overflow-hidden mb-4">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background:"rgba(0,212,255,0.1)",border:"1px solid rgba(0,212,255,0.3)"}}>
            <Icon size={15} className="text-neural-blue"/>
          </div>
          <span className="font-display text-sm font-bold text-star-white tracking-wide">{title}</span>
        </div>
        {open ? <ChevronUp size={16} className="text-dim-star"/> : <ChevronDown size={16} className="text-dim-star"/>}
      </button>
      {open && <div className="px-6 pb-6 border-t border-white/5 pt-4">{children}</div>}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="mb-4">
      <label className="font-mono text-xs text-dim-star tracking-widest mb-2 block uppercase">{label}</label>
      {children}
    </div>
  );
}

export default function AdminDashboard({ token, onLogout }) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const loadContent = () => {
    setLoading(true); setError("");
    fetch("https://web-production-cba0c.up.railway.app/api/admin/content", { headers })
      .then(r => r.json())
      .then(data => { setContent(data); setLoading(false); })
      .catch(e => { setError("Erreur: " + e.message); setLoading(false); });
  };

  useEffect(() => { loadContent(); }, []);

  const saveAll = async () => {
    setSaving(true); setError("");
    try {
      for (const [section, data] of Object.entries(content)) {
        const res = await fetch(`https://web-production-cba0c.up.railway.app/api/admin/content/${section}`, { method: "PUT", headers, body: JSON.stringify(data) });
        if (!res.ok) throw new Error(`Erreur section ${section}`);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const update = (path, value) => {
    try {
      const keys = path.split(".");
      setContent(prev => {
        if (!prev) return prev;
        const next = JSON.parse(JSON.stringify(prev));
        let obj = next;
        for (let i = 0; i < keys.length - 1; i++) { if (!obj[keys[i]]) obj[keys[i]] = {}; obj = obj[keys[i]]; }
        obj[keys[keys.length - 1]] = value;
        return next;
      });
    } catch (e) { console.error("Update error:", e); }
  };

  const logout = () => { localStorage.removeItem("admin_token"); onLogout(); };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center"><Loader2 size={32} className="text-neural-blue animate-spin mx-auto mb-4"/>
      <p className="text-dim-star font-mono text-sm">Chargement depuis MongoDB...</p></div>
    </div>
  );

  if (!content) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center"><p className="text-neural-pink mb-4">{error}</p>
      <button onClick={loadContent} className="ai-btn px-6 py-3 rounded-xl">Réessayer</button></div>
    </div>
  );

  return (
    <div className="min-h-screen px-4 py-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-black gradient-text">ADMIN PANEL</h1>
          <p className="text-dim-star text-xs font-mono mt-1">🍃 MongoDB — modifications en temps réel</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={loadContent} className="flex items-center gap-2 px-3 py-2 glass-card border border-white/10 rounded-full text-xs font-mono text-dim-star hover:text-neural-blue transition-colors">
            <RefreshCw size={12}/> Actualiser
          </button>
          <a href="/" target="_blank" className="flex items-center gap-2 px-4 py-2 glass-card border border-white/10 rounded-full text-xs font-mono text-dim-star hover:text-neural-blue transition-colors">
            <Eye size={13}/> Voir le site
          </a>
          <button onClick={logout} className="flex items-center gap-2 px-4 py-2 glass-card border border-neural-pink/30 rounded-full text-xs font-mono text-neural-pink hover:bg-neural-pink/10 transition-colors">
            <LogOut size={13}/> Déconnexion
          </button>
        </div>
      </div>

      {error && <div className="mb-4 px-4 py-3 rounded-xl bg-neural-pink/10 border border-neural-pink/30 text-neural-pink text-sm font-mono">⚠ {error}</div>}
      {saved && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-neural-green/10 border border-neural-green/30 text-neural-green text-sm font-mono flex items-center gap-2">
          <CheckCircle size={14}/> Sauvegardé ! Actualise le site pour voir les changements.
        </div>
      )}

      {/* HERO */}
      <Section title="Hero — Présentation principale" icon={User} defaultOpen={true}>
        <Field label="Ton nom complet">
          <input type="text" value={content.hero?.name||""} onChange={e=>update("hero.name",e.target.value)}
            className="ai-input w-full px-4 py-3 rounded-xl text-sm" placeholder="Prénom Nom"/>
        </Field>
        <Field label="Description courte">
          <textarea value={content.hero?.description||""} onChange={e=>update("hero.description",e.target.value)}
            className="ai-input w-full px-4 py-3 rounded-xl text-sm resize-none h-24"/>
        </Field>
        <Field label="Statistiques">
          <div className="space-y-2">
            {(content.hero?.stats||[]).map((stat,i)=>(
              <div key={i} className="flex gap-3 items-center">
                <input type="text" value={stat.value||""} onChange={e=>{const s=JSON.parse(JSON.stringify(content.hero.stats));s[i].value=e.target.value;update("hero.stats",s);}}
                  className="ai-input w-20 px-3 py-2 rounded-lg text-sm font-mono" placeholder="5+"/>
                <input type="text" value={stat.label||""} onChange={e=>{const s=JSON.parse(JSON.stringify(content.hero.stats));s[i].label=e.target.value;update("hero.stats",s);}}
                  className="ai-input flex-1 px-3 py-2 rounded-lg text-sm" placeholder="Label"/>
                <button onClick={()=>update("hero.stats",content.hero.stats.filter((_,idx)=>idx!==i))} className="text-neural-pink/50 hover:text-neural-pink"><Trash2 size={13}/></button>
              </div>
            ))}
            <button onClick={()=>update("hero.stats",[...(content.hero?.stats||[]),{value:"",label:""}])}
              className="flex items-center gap-1 text-xs font-mono text-neural-blue hover:opacity-80 mt-1"><Plus size={12}/> Ajouter</button>
          </div>
        </Field>
      </Section>

      {/* ABOUT */}
      <Section title="À propos — Parcours & Timeline" icon={BookOpen}>
        <Field label="Titre">
          <input type="text" value={content.about?.title||""} onChange={e=>update("about.title",e.target.value)}
            className="ai-input w-full px-4 py-3 rounded-xl text-sm"/>
        </Field>
        <Field label="Paragraphes">
          {(content.about?.paragraphs||[]).map((p,i)=>(
            <div key={i} className="flex gap-2 mb-2">
              <textarea value={p} onChange={e=>{const a=[...(content.about?.paragraphs||[])];a[i]=e.target.value;update("about.paragraphs",a);}}
                className="ai-input flex-1 px-3 py-2 rounded-xl text-sm resize-none h-20"/>
              <button onClick={()=>update("about.paragraphs",content.about.paragraphs.filter((_,idx)=>idx!==i))}
                className="text-neural-pink/50 hover:text-neural-pink self-start mt-2"><Trash2 size={13}/></button>
            </div>
          ))}
          <button onClick={()=>update("about.paragraphs",[...(content.about?.paragraphs||[]),""])}
            className="flex items-center gap-1 text-xs font-mono text-neural-blue hover:opacity-80"><Plus size={12}/> Ajouter un paragraphe</button>
        </Field>
        <Field label="Tags (séparés par virgule)">
          <input type="text" value={(content.about?.tags||[]).join(", ")}
            onChange={e=>update("about.tags",e.target.value.split(",").map(t=>t.trim()).filter(Boolean))}
            className="ai-input w-full px-4 py-3 rounded-xl text-sm" placeholder="Deep Learning, NLP..."/>
        </Field>
        <Field label="Timeline">
          <div className="space-y-3">
            {(content.about?.timeline||[]).map((item,i)=>(
              <div key={i} className="glass-card rounded-xl p-4 border border-white/5">
                <div className="flex justify-between mb-2">
                  <span className="font-mono text-xs text-neural-blue">Étape {i+1}</span>
                  <button onClick={()=>update("about.timeline",content.about.timeline.filter((_,idx)=>idx!==i))}
                    className="text-neural-pink/50 hover:text-neural-pink"><Trash2 size={12}/></button>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input type="text" value={item.year||""} placeholder="2024–2025"
                    onChange={e=>{const t=JSON.parse(JSON.stringify(content.about.timeline));t[i].year=e.target.value;update("about.timeline",t);}}
                    className="ai-input px-3 py-2 rounded-lg text-xs font-mono"/>
                  <input type="text" value={item.place||""} placeholder="École / Entreprise"
                    onChange={e=>{const t=JSON.parse(JSON.stringify(content.about.timeline));t[i].place=e.target.value;update("about.timeline",t);}}
                    className="ai-input px-3 py-2 rounded-lg text-xs"/>
                </div>
                <input type="text" value={item.title||""} placeholder="Titre"
                  onChange={e=>{const t=JSON.parse(JSON.stringify(content.about.timeline));t[i].title=e.target.value;update("about.timeline",t);}}
                  className="ai-input w-full px-3 py-2 rounded-lg text-sm mb-2"/>
                <input type="text" value={item.desc||""} placeholder="Description..."
                  onChange={e=>{const t=JSON.parse(JSON.stringify(content.about.timeline));t[i].desc=e.target.value;update("about.timeline",t);}}
                  className="ai-input w-full px-3 py-2 rounded-lg text-xs"/>
              </div>
            ))}
            <button onClick={()=>update("about.timeline",[...(content.about?.timeline||[]),{year:"",title:"",place:"",desc:""}])}
              className="flex items-center gap-1 text-xs font-mono text-neural-blue hover:opacity-80"><Plus size={12}/> Ajouter une étape</button>
          </div>
        </Field>
      </Section>

      {/* SKILLS */}
      <Section title="Compétences — Niveaux & Catégories" icon={Code2}>
        <SkillsEditor skills={content.skills||[]} onChange={value=>update("skills",value)}/>
      </Section>

      {/* TECHNOLOGIES */}
      <Section title="Technologies utilisées — Badges" icon={Code2}>
        <p className="text-dim-star text-xs mb-4">Gère les badges de technologies visibles sur le site. Tu peux ajouter une icône (image) pour chaque technologie.</p>
        <TechEditor
          techs={content.techs||[]}
          onChange={value=>update("techs",value)}
        />
      </Section>

      {/* PROJETS */}
      <Section title="Projets — Portfolio & Images" icon={FolderOpen}>
        <div className="space-y-6">
          {(content.projects||[]).map((project,i)=>(
            <div key={i} className="glass-card rounded-xl border border-white/5 overflow-hidden">
              {/* Project header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                <span className="font-mono text-xs text-neural-blue">Projet {i+1}</span>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 text-xs font-mono text-dim-star cursor-pointer">
                    <input type="checkbox" checked={project.featured||false}
                      onChange={e=>{const p=JSON.parse(JSON.stringify(content.projects));p[i].featured=e.target.checked;update("projects",p);}}/>
                    ★ Featured
                  </label>
                  <button onClick={()=>update("projects",content.projects.filter((_,idx)=>idx!==i))}
                    className="text-neural-pink/50 hover:text-neural-pink"><Trash2 size={13}/></button>
                </div>
              </div>

              <div className="p-4 space-y-3">
                {/* Image Upload */}
                <ImageUpload
                  label="Image du projet (optionnel)"
                  value={project.image||""}
                  onChange={val=>{const p=JSON.parse(JSON.stringify(content.projects));p[i].image=val;update("projects",p);}}
                  maxSizeKB={400}
                />

                <input type="text" value={project.title||""} placeholder="Titre du projet"
                  onChange={e=>{const p=JSON.parse(JSON.stringify(content.projects));p[i].title=e.target.value;update("projects",p);}}
                  className="ai-input w-full px-3 py-2 rounded-lg text-sm font-semibold"/>
                <textarea value={project.desc||""} placeholder="Description..."
                  onChange={e=>{const p=JSON.parse(JSON.stringify(content.projects));p[i].desc=e.target.value;update("projects",p);}}
                  className="ai-input w-full px-3 py-2 rounded-lg text-sm resize-none h-16"/>
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" value={project.github||""} placeholder="Lien GitHub"
                    onChange={e=>{const p=JSON.parse(JSON.stringify(content.projects));p[i].github=e.target.value;update("projects",p);}}
                    className="ai-input px-3 py-2 rounded-lg text-xs font-mono"/>
                  <input type="text" value={project.demo||""} placeholder="Lien Démo"
                    onChange={e=>{const p=JSON.parse(JSON.stringify(content.projects));p[i].demo=e.target.value;update("projects",p);}}
                    className="ai-input px-3 py-2 rounded-lg text-xs font-mono"/>
                </div>
                <input type="text" value={(project.tags||[]).join(", ")} placeholder="Tags: PyTorch, NLP..."
                  onChange={e=>{const p=JSON.parse(JSON.stringify(content.projects));p[i].tags=e.target.value.split(",").map(t=>t.trim()).filter(Boolean);update("projects",p);}}
                  className="ai-input w-full px-3 py-2 rounded-lg text-xs font-mono"/>
              </div>
            </div>
          ))}
          <button onClick={()=>update("projects",[...(content.projects||[]),{id:Date.now(),title:"Nouveau Projet",desc:"",tags:[],color:"neural-blue",stats:{},github:"#",demo:"#",featured:false,image:""}])}
            className="w-full flex items-center justify-center gap-2 py-3 glass-card border border-dashed border-neural-blue/30 rounded-xl text-sm font-mono text-neural-blue hover:border-neural-blue/60 hover:bg-neural-blue/5 transition-all">
            <Plus size={14}/> Ajouter un projet
          </button>
        </div>
      </Section>
      {/* RECOMMANDATIONS */}
<Section title="Recommandations — Témoignages" icon={User}>
  <div className="space-y-4">
    {(content.testimonials || []).map((t, i) => (
      <div key={i} className="glass-card rounded-xl p-4 border border-white/5">
        <div className="flex justify-between mb-3">
          <span className="font-mono text-xs text-neural-blue">Témoignage {i + 1}</span>
          <button onClick={() => update("testimonials", content.testimonials.filter((_, idx) => idx !== i))}
            className="text-neural-pink/50 hover:text-neural-pink"><Trash2 size={13}/></button>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <input type="text" value={t.name || ""} placeholder="Nom"
            onChange={e => { const arr = JSON.parse(JSON.stringify(content.testimonials)); arr[i].name = e.target.value; update("testimonials", arr); }}
            className="ai-input px-3 py-2 rounded-lg text-sm"/>
          <input type="text" value={t.role || ""} placeholder="Poste / Entreprise"
            onChange={e => { const arr = JSON.parse(JSON.stringify(content.testimonials)); arr[i].role = e.target.value; update("testimonials", arr); }}
            className="ai-input px-3 py-2 rounded-lg text-sm"/>
        </div>
        <input type="text" value={t.avatar || ""} placeholder="Initiales ex: MD"
          onChange={e => { const arr = JSON.parse(JSON.stringify(content.testimonials)); arr[i].avatar = e.target.value.slice(0,2).toUpperCase(); update("testimonials", arr); }}
          className="ai-input w-full px-3 py-2 rounded-lg text-sm mb-2"/>
        <textarea value={t.text || ""} placeholder="Témoignage..."
          onChange={e => { const arr = JSON.parse(JSON.stringify(content.testimonials)); arr[i].text = e.target.value; update("testimonials", arr); }}
          className="ai-input w-full px-3 py-2 rounded-lg text-sm resize-none h-20 mb-2"/>
        <select value={t.color || "neural-blue"}
          onChange={e => { const arr = JSON.parse(JSON.stringify(content.testimonials)); arr[i].color = e.target.value; update("testimonials", arr); }}
          className="ai-input px-3 py-2 rounded-lg text-xs font-mono w-full">
          <option value="neural-blue">Bleu</option>
          <option value="neural-violet">Violet</option>
          <option value="neural-pink">Rose</option>
          <option value="neural-green">Vert</option>
        </select>
      </div>
    ))}
    <button onClick={() => update("testimonials", [...(content.testimonials || []), { id: Date.now(), name: "", role: "", text: "", avatar: "", color: "neural-blue" }])}
      className="w-full flex items-center justify-center gap-2 py-3 glass-card border border-dashed border-neural-blue/30 rounded-xl text-sm font-mono text-neural-blue hover:border-neural-blue/60 transition-all">
      <Plus size={14}/> Ajouter un témoignage
    </button>
  </div>
</Section>

      {/* CONTACT */}
      <Section title="Contact — Coordonnées & Réseaux" icon={Mail}>
        <div className="grid grid-cols-2 gap-3">
          {[
            {key:"contact.email",label:"Email",placeholder:"ton@email.com"},
            {key:"contact.github",label:"GitHub URL",placeholder:"https://github.com/..."},
            {key:"contact.linkedin",label:"LinkedIn URL",placeholder:"https://linkedin.com/in/..."},
            {key:"contact.twitter",label:"Twitter/X URL",placeholder:"https://twitter.com/..."},
          ].map(({key,label,placeholder})=>(
            <Field key={key} label={label}>
              <input type="text" value={key.split(".").reduce((o,k)=>o?.[k]??"",content)||""}
                onChange={e=>update(key,e.target.value)}
                className="ai-input w-full px-3 py-2 rounded-lg text-sm" placeholder={placeholder}/>
            </Field>
          ))}
        </div>
        <Field label="Texte de disponibilité">
          <input type="text" value={content.contact?.availabilityText||""}
            onChange={e=>update("contact.availabilityText",e.target.value)}
            className="ai-input w-full px-4 py-3 rounded-xl text-sm"/>
        </Field>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-dim-star">DISPONIBLE :</span>
          <button onClick={()=>update("contact.available",!content.contact?.available)}
            className={`w-12 h-6 rounded-full transition-colors relative ${content.contact?.available?"bg-neural-green/60":"bg-white/10"}`}>
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${content.contact?.available?"translate-x-7":"translate-x-1"}`}/>
          </button>
          <span className={`text-xs font-mono ${content.contact?.available?"text-neural-green":"text-dim-star"}`}>
            {content.contact?.available?"🟢 Disponible":"🔴 Indisponible"}
          </span>
        </div>
      </Section>
      {/* BLOG */}
<Section title="Blog & Articles" icon={BookOpen}>
  <BlogEditor token={token}/>
</Section>

{/* CV */}
<Section title="Mon CV — Upload PDF" icon={User}>
  <p className="text-dim-star text-xs mb-4">
    Uploade ton CV PDF — il sera téléchargeable directement depuis le portfolio.
  </p>
  <CVUpload token={token}/>
</Section>

      {/* SAVE */}
      <div className="sticky bottom-6 flex justify-center mt-6">
        <button onClick={saveAll} disabled={saving}
          className="ai-btn px-10 py-4 rounded-full flex items-center gap-3 shadow-2xl">
          {saving?<><Loader2 size={16} className="animate-spin"/>Sauvegarde dans MongoDB...</>
          :saved?<><CheckCircle size={16}/>Sauvegardé ! Visible sur le site ✨</>
          :<><Save size={16}/>Sauvegarder dans MongoDB</>}
        </button>
      </div>
    </div>
  );
}
