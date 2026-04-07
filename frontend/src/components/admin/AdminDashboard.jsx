import { useState, useEffect } from "react";
import { LogOut, Save, User, BookOpen, Code2, FolderOpen, Mail, Loader2, CheckCircle, Plus, Trash2, Eye, RefreshCw, History, BarChart2, Home, Settings, Upload, Cpu, Shield } from "lucide-react";
import CVUpload from "./CVUpload";
import SkillsEditor from "./SkillsEditor";
import TechEditor from "./TechEditor";
import BlogEditor from "./BlogEditor";
import SecurityDashboard from "./SecurityDashboard";

const API_URL = "https://web-production-cba0c.up.railway.app";

function VisitChart({ token }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch(`${API_URL}/api/security/visitors`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => { setStats(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);
  if (loading) return <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-neural-blue"/></div>;
  if (!stats) return <p className="text-dim-star text-sm">Données non disponibles</p>;
  const visitors = stats.visitors || [];
  const last7 = Array.from({length:7},(_,i) => {
    const d = new Date(); d.setDate(d.getDate()-(6-i));
    const count = visitors.filter(v => new Date(v.createdAt).toDateString()===d.toDateString()).length;
    return { date: d.toLocaleDateString("fr-FR",{weekday:"short",day:"numeric"}), count };
  });
  const maxC = Math.max(...last7.map(d=>d.count),1);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {[{l:"Total",v:stats.total||0,c:"#00D4FF"},{l:"Aujourd'hui",v:stats.today||0,c:"#00FF88"},{l:"Entreprises",v:stats.companies?.length||0,c:"#7B2FFF"}].map((s,i)=>(
          <div key={i} className="glass-card rounded-2xl p-4 border border-white/5 text-center">
            <p className="font-display text-3xl font-black mb-1" style={{color:s.c}}>{s.v}</p>
            <p className="text-dim-star text-xs font-mono">{s.l}</p>
          </div>
        ))}
      </div>
      <p className="text-dim-star text-xs font-mono">7 DERNIERS JOURS</p>
      <div className="flex items-end gap-2 h-28">
        {last7.map((d,i)=>(
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <p style={{fontSize:"10px",minHeight:"14px",color:"#00D4FF"}}>{d.count>0?d.count:""}</p>
            <div className="w-full rounded-t-lg" style={{height:`${Math.max((d.count/maxC)*96,4)}px`,background:d.count>0?"linear-gradient(to top,#00D4FF,#7B2FFF)":"rgba(255,255,255,0.05)"}}/>
            <p className="text-dim-star font-mono" style={{fontSize:"9px"}}>{d.date}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChangeLog({ token }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const load = async () => {
    setLoading(true);
    try { const r = await fetch(`${API_URL}/api/admin/changelog`,{headers:{Authorization:`Bearer ${token}`}}); const d = await r.json(); if(Array.isArray(d)) setLogs(d); } catch {}
    setLoading(false);
  };
  useEffect(()=>{load();},[]);
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <p className="text-dim-star text-xs font-mono">{logs.length} ENTRÉES</p>
        <button onClick={load} className="flex items-center gap-2 text-xs text-dim-star hover:text-neural-blue font-mono">
          <RefreshCw size={12} className={loading?"animate-spin":""}/>Rafraîchir
        </button>
      </div>
      {logs.length===0 ? <p className="text-dim-star text-sm text-center py-8">Aucune modification</p> :
        <div className="space-y-2 max-h-96 overflow-y-auto">{logs.map((log,i)=>(
          <div key={i} className="flex items-center gap-4 p-3 glass-card rounded-xl border border-white/5">
            <div className="w-2 h-2 rounded-full bg-neural-blue flex-shrink-0"/>
            <div className="flex-1 min-w-0"><p className="text-star-white text-sm font-mono">{log.details}</p><p className="text-dim-star text-xs">{log.ip}</p></div>
            <p className="text-dim-star text-xs font-mono flex-shrink-0">{new Date(log.createdAt).toLocaleString("fr-FR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"})}</p>
          </div>
        ))}</div>
      }
    </div>
  );
}

const NAV = [
  {id:"dashboard",label:"Dashboard",icon:BarChart2,group:"Aperçu"},
  {id:"hero",label:"Hero",icon:Home,group:"Contenu"},
  {id:"about",label:"À Propos",icon:User,group:"Contenu"},
  {id:"skills",label:"Compétences",icon:Cpu,group:"Contenu"},
  {id:"techs",label:"Technologies",icon:Code2,group:"Contenu"},
  {id:"projects",label:"Projets",icon:FolderOpen,group:"Contenu"},
  {id:"testimonials",label:"Témoignages",icon:User,group:"Contenu"},
  {id:"contact",label:"Contact",icon:Mail,group:"Contenu"},
  {id:"blog",label:"Blog",icon:BookOpen,group:"Outils"},
  {id:"cv",label:"CV PDF",icon:Upload,group:"Outils"},
  {id:"security",label:"Sécurité",icon:Shield,group:"Outils"},
  {id:"changelog",label:"Historique",icon:History,group:"Outils"},
];

export default function AdminDashboard({ token, onLogout }) {
  const [active, setActive] = useState("dashboard");
  const [data, setData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/admin/content`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const save = async (section, body) => {
    setSaving(true);
    try {
      await fetch(`${API_URL}/api/admin/content/${section}`, {
        method:"PUT", headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`}, body:JSON.stringify(body)
      });
      setSaved(true); setTimeout(()=>setSaved(false),2000);
    } catch {} setSaving(false);
  };

  const upd = (section, field, value) => setData(prev => ({...prev,[section]:{...prev[section],[field]:value}}));

  const Field = ({section, field, label, multiline=false}) => (
    <div>
      <label className="text-dim-star text-xs font-mono tracking-widest mb-2 block">{label.toUpperCase()}</label>
      {multiline
        ? <textarea value={data?.[section]?.[field]||""} onChange={e=>upd(section,field,e.target.value)} className="ai-input w-full px-4 py-3 rounded-xl text-sm resize-none h-20"/>
        : <input value={data?.[section]?.[field]||""} onChange={e=>upd(section,field,e.target.value)} className="ai-input w-full px-4 py-3 rounded-xl text-sm"/>
      }
    </div>
  );

  const SaveBtn = ({section, body}) => (
    <button onClick={()=>save(section,body)} disabled={saving}
      className="ai-btn px-6 py-3 rounded-xl flex items-center gap-2 text-sm mt-2"
      style={{opacity: saving ? 0.7 : 1}}>
      {saving ? <Loader2 size={14} className="animate-spin"/> : saved ? <CheckCircle size={14} className="text-neural-green"/> : <Save size={14}/>}
      {saving ? "Sauvegarde..." : saved ? "✅ Sauvegardé !" : "Sauvegarder"}
    </button>
  );

  const groups = [...new Set(NAV.map(n=>n.group))];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{background:"var(--void)"}}>
      <Loader2 size={32} className="animate-spin text-neural-blue"/>
    </div>
  );

  const renderSection = () => {
    if (!data) return null;
    switch(active) {
      case "dashboard": return (
        <div className="space-y-6">
          <h2 className="font-display text-2xl font-black text-star-white">Tableau de bord</h2>
          <VisitChart token={token}/>
        </div>
      );

      case "hero": return (
        <div className="space-y-5">
          <h2 className="font-display text-2xl font-black text-star-white">Hero</h2>
          <Field section="hero" field="name" label="Nom complet"/>
          <Field section="hero" field="title" label="Titre"/>
          <Field section="hero" field="description" label="Description" multiline/>
          <SaveBtn section="hero" body={data.hero}/>
        </div>
      );

      case "about": return (
        <div className="space-y-5">
          <h2 className="font-display text-2xl font-black text-star-white">À Propos</h2>
          <Field section="about" field="title" label="Titre"/>
          {(data.about?.paragraphs||[]).map((p,i)=>(
            <div key={i}>
              <label className="text-dim-star text-xs font-mono mb-2 block">PARAGRAPHE {i+1}</label>
              <textarea value={p} onChange={e=>{const ps=[...(data.about?.paragraphs||[])];ps[i]=e.target.value;upd("about","paragraphs",ps);}}
                className="ai-input w-full px-4 py-3 rounded-xl text-sm resize-none h-20"/>
            </div>
          ))}
          <SaveBtn section="about" body={data.about}/>
        </div>
      );

      case "skills": return (
        <div className="space-y-5">
          <h2 className="font-display text-2xl font-black text-star-white">Compétences</h2>
          {(data.skills||[]).map((cat,ci)=>(
            <div key={ci} className="glass-card rounded-2xl p-5 border border-white/5 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-neural-blue"/>
                <input value={cat.category||""} onChange={e=>{const s=JSON.parse(JSON.stringify(data.skills||[]));s[ci].category=e.target.value;setData(prev => ({...prev, skills: s}));}}
                  className="ai-input flex-1 px-3 py-2 rounded-lg text-sm font-bold"/>
              </div>
              <div className="space-y-2">
                {(cat.items||[]).map((item,si)=>(
                  <div key={si} className="flex items-center gap-2">
                    <input value={item.name||""} onChange={e=>{const s=JSON.parse(JSON.stringify(data.skills||[]));s[ci].items[si].name=e.target.value;setData(prev => ({...prev, skills: s}));}}
                      className="ai-input flex-1 px-3 py-2 rounded-lg text-sm"/>
                    <input type="number" min="0" max="100" value={item.level||0} onChange={e=>{const s=JSON.parse(JSON.stringify(data.skills||[]));s[ci].items[si].level=Number(e.target.value);setData(prev => ({...prev, skills: s}));}}
                      className="ai-input w-16 px-2 py-2 rounded-lg text-sm text-center"/>
                    <span className="text-dim-star text-xs font-mono w-8">{item.level}%</span>
                    <button onClick={()=>{const s=JSON.parse(JSON.stringify(data.skills||[]));s[ci].items=s[ci].items.filter((_,j)=>j!==si);setData(prev => ({...prev, skills: s}));}}
                      className="text-neural-pink hover:opacity-70 flex-shrink-0"><Trash2 size={14}/></button>
                  </div>
                ))}
              </div>
              <button onClick={()=>{const s=JSON.parse(JSON.stringify(data.skills||[]));s[ci].items.push({name:"Nouvelle compétence",level:70});setData(prev => ({...prev, skills: s}));}}
                className="flex items-center gap-1 text-xs font-mono text-neural-blue hover:opacity-80">
                <Plus size={12}/>Ajouter une compétence
              </button>
            </div>
          ))}
          <button onClick={()=>save("skills",data.skills)} className="ai-btn px-6 py-3 rounded-xl flex items-center gap-2 text-sm"><Save size={14}/>Sauvegarder</button>
        </div>
      );

      case "techs": return (
        <div className="space-y-5">
          <h2 className="font-display text-2xl font-black text-star-white">Technologies</h2>
          {data.techs && <TechEditor techs={data.techs} onChange={t=>{setData(prev=>({...prev,techs:t}));}}/>}
          <button onClick={()=>save("techs",data.techs)} className="ai-btn px-6 py-3 rounded-xl flex items-center gap-2 text-sm"><Save size={14}/>Sauvegarder</button>
        </div>
      );

      case "projects": return (
        <div className="space-y-5">
          <h2 className="font-display text-2xl font-black text-star-white">Projets</h2>
          {(data.projects||[]).map((proj,i)=>(
            <div key={i} className="glass-card rounded-2xl p-5 border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-neural-blue text-xs font-mono">PROJET {i+1}</span>
                <button onClick={()=>{const ps=data.projects.filter((_,j)=>j!==i);setData(prev=>({...prev,projects:ps}));}} className="text-neural-pink hover:opacity-70"><Trash2 size={14}/></button>
              </div>
              {["title","desc","github","demo"].map(field=>(
                <div key={field}>
                  <label className="text-dim-star text-xs font-mono mb-1 block">{field.toUpperCase()}</label>
                  {field==="desc"
                    ?<textarea value={proj[field]||""} onChange={e=>{const ps=[...data.projects];ps[i]={...ps[i],[field]:e.target.value};setData(prev=>({...prev,projects:ps}));}} className="ai-input w-full px-3 py-2 rounded-lg text-sm resize-none h-16"/>
                    :<input value={proj[field]||""} onChange={e=>{const ps=[...data.projects];ps[i]={...ps[i],[field]:e.target.value};setData(prev=>({...prev,projects:ps}));}} className="ai-input w-full px-3 py-2 rounded-lg text-sm"/>
                  }
                </div>
              ))}

              {/* Tags */}
              <div>
                <label className="text-dim-star text-xs font-mono mb-2 block">TAGS</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(proj.tags||[]).map((tag,ti)=>(
                    <span key={ti} className="flex items-center gap-1 text-xs font-mono px-2 py-1 rounded-full"
                      style={{background:"rgba(0,212,255,0.1)",border:"1px solid rgba(0,212,255,0.2)",color:"var(--neural-blue)"}}>
                      {tag}
                      <button onClick={()=>{const ps=JSON.parse(JSON.stringify(data.projects||[]));ps[i].tags=ps[i].tags.filter((_,j)=>j!==ti);setData(prev=>({...prev,projects:ps}));}} className="ml-1 hover:opacity-70"><Trash2 size={10}/></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input id={`tag-${i}`} placeholder="Ajouter un tag (Enter)..." className="ai-input flex-1 px-3 py-1.5 rounded-lg text-xs"
                    onKeyDown={e=>{if(e.key==="Enter"&&e.target.value.trim()){const ps=JSON.parse(JSON.stringify(data.projects||[]));if(!ps[i].tags)ps[i].tags=[];ps[i].tags.push(e.target.value.trim());setData(prev=>({...prev,projects:ps}));e.target.value="";}}}/>
                </div>
              </div>

              {/* Stats */}
              <div>
                <label className="text-dim-star text-xs font-mono mb-2 block">STATS (valeur / label)</label>
                <div className="space-y-2">
                  {Object.entries(proj.stats||{}).map(([key,val],si)=>(
                    <div key={si} className="flex items-center gap-2">
                      <input value={val||""} onChange={e=>{const ps=JSON.parse(JSON.stringify(data.projects||[]));ps[i].stats={...ps[i].stats,[key]:e.target.value};setData(prev=>({...prev,projects:ps}));}}
                        className="ai-input flex-1 px-3 py-1.5 rounded-lg text-xs" placeholder="Valeur"/>
                      <input value={key||""} onChange={e=>{const ps=JSON.parse(JSON.stringify(data.projects||[]));const ns={};Object.entries(ps[i].stats||{}).forEach(([k,v])=>{ns[k===key?e.target.value:k]=v;});ps[i].stats=ns;setData(prev=>({...prev,projects:ps}));}}
                        className="ai-input w-24 px-3 py-1.5 rounded-lg text-xs" placeholder="Label"/>
                      <button onClick={()=>{const ps=JSON.parse(JSON.stringify(data.projects||[]));const ns={};Object.entries(ps[i].stats||{}).forEach(([k,v])=>{if(k!==key)ns[k]=v;});ps[i].stats=ns;setData(prev=>({...prev,projects:ps}));}}
                        className="text-neural-pink hover:opacity-70"><Trash2 size={12}/></button>
                    </div>
                  ))}
                  <button onClick={()=>{const ps=JSON.parse(JSON.stringify(data.projects||[]));if(!ps[i].stats)ps[i].stats={};ps[i].stats[`stat${Object.keys(ps[i].stats||{}).length+1}`]="";setData(prev=>({...prev,projects:ps}));}}
                    className="flex items-center gap-1 text-xs font-mono text-neural-blue hover:opacity-80"><Plus size={12}/>Ajouter stat</button>
                </div>
              </div>

              {/* Couleur + Featured */}
              <div className="flex items-center gap-6">
                <div>
                  <label className="text-dim-star text-xs font-mono mb-2 block">COULEUR</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      {name:"neural-blue",hex:"#00D4FF"},
                      {name:"neural-violet",hex:"#7B2FFF"},
                      {name:"neural-pink",hex:"#FF2FBB"},
                      {name:"neural-green",hex:"#00FF88"},
                      {name:"neural-orange",hex:"#FF8C00"},
                      {name:"neural-red",hex:"#FF3B3B"},
                      {name:"neural-yellow",hex:"#FFD700"},
                      {name:"neural-cyan",hex:"#00FFFF"},
                      {name:"neural-white",hex:"#F0F4FF"},
                      {name:"neural-teal",hex:"#00B4D8"},
                      {name:"neural-indigo",hex:"#4B0082"},
                      {name:"neural-lime",hex:"#39FF14"},
                    ].map(({name,hex})=>(
                      <button key={name} onClick={()=>{const ps=JSON.parse(JSON.stringify(data.projects||[]));ps[i].color=name;setData(prev=>({...prev,projects:ps}));}}
                        title={name}
                        className="w-7 h-7 rounded-lg border-2 transition-all hover:scale-110"
                        style={{background:hex,borderColor:proj.color===name?"white":"transparent",opacity:proj.color===name?1:0.5}}/>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-dim-star text-xs font-mono mb-2 block">FEATURED</label>
                  <button onClick={()=>{const ps=JSON.parse(JSON.stringify(data.projects||[]));ps[i].featured=!ps[i].featured;setData(prev=>({...prev,projects:ps}));}}
                    className="relative w-12 h-6 rounded-full transition-all"
                    style={{background:proj.featured?"var(--neural-blue)":"rgba(255,255,255,0.1)"}}>
                    <div className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all" style={{left:proj.featured?"26px":"4px"}}/>
                  </button>
                </div>
              </div>
            </div>
          ))}
          <button onClick={()=>{const ps=[...(data.projects||[]),{id:Date.now(),title:"Nouveau projet",desc:"",tags:[],color:"neural-blue",github:"",demo:"",featured:false}];setData(prev=>({...prev,projects:ps}));}}
            className="glass-card border border-neural-blue/30 px-4 py-2 rounded-xl text-xs font-mono text-neural-blue flex items-center gap-2 hover:border-neural-blue/60 transition-colors">
            <Plus size={14}/> Ajouter un projet
          </button>
          <SaveBtn section="projects" body={data.projects}/>
        </div>
      );

      case "testimonials": return (
        <div className="space-y-5">
          <h2 className="font-display text-2xl font-black text-star-white">Témoignages</h2>
          {(data.testimonials||[]).map((t,i)=>(
            <div key={i} className="glass-card rounded-2xl p-5 border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-neural-violet text-xs font-mono">TÉMOIGNAGE {i+1}</span>
                <button onClick={()=>{const ts=data.testimonials.filter((_,j)=>j!==i);setData(prev=>({...prev,testimonials:ts}));}} className="text-neural-pink hover:opacity-70"><Trash2 size={14}/></button>
              </div>
              {["name","role","text"].map(field=>(
                <div key={field}>
                  <label className="text-dim-star text-xs font-mono mb-1 block">{field.toUpperCase()}</label>
                  {field==="text"
                    ?<textarea value={t[field]||""} onChange={e=>{const ts=[...data.testimonials];ts[i]={...ts[i],[field]:e.target.value};setData(prev=>({...prev,testimonials:ts}));}} className="ai-input w-full px-3 py-2 rounded-lg text-sm resize-none h-16"/>
                    :<input value={t[field]||""} onChange={e=>{const ts=[...data.testimonials];ts[i]={...ts[i],[field]:e.target.value};setData(prev=>({...prev,testimonials:ts}));}} className="ai-input w-full px-3 py-2 rounded-lg text-sm"/>
                  }
                </div>
              ))}
            </div>
          ))}
          <button onClick={()=>{const ts=[...(data.testimonials||[]),{id:Date.now(),name:"Nouveau",role:"",text:"",avatar:"N",color:"neural-blue"}];setData(prev=>({...prev,testimonials:ts}));}}
            className="glass-card border border-neural-violet/30 px-4 py-2 rounded-xl text-xs font-mono text-neural-violet flex items-center gap-2 hover:border-neural-violet/60 transition-colors">
            <Plus size={14}/> Ajouter un témoignage
          </button>
          <SaveBtn section="testimonials" body={data.testimonials}/>
        </div>
      );

      case "contact": return (
        <div className="space-y-5">
          <h2 className="font-display text-2xl font-black text-star-white">Contact</h2>
          <Field section="contact" field="email" label="Email"/>
          <Field section="contact" field="github" label="GitHub URL"/>
          <Field section="contact" field="linkedin" label="LinkedIn URL"/>
          <Field section="contact" field="availabilityText" label="Texte disponibilité"/>
          <SaveBtn section="contact" body={data.contact}/>
        </div>
      );

      case "blog": return (
        <div className="space-y-5">
          <h2 className="font-display text-2xl font-black text-star-white">Blog & Articles</h2>
          <BlogEditor token={token}/>
        </div>
      );

      case "cv": return (
        <div className="space-y-5">
          <h2 className="font-display text-2xl font-black text-star-white">CV PDF</h2>
          <CVUpload token={token}/>
        </div>
      );

      case "security": return (
        <div className="space-y-5">
          <h2 className="font-display text-2xl font-black text-star-white">Sécurité & Visiteurs</h2>
          <SecurityDashboard token={token}/>
        </div>
      );

      case "changelog": return (
        <div className="space-y-5">
          <h2 className="font-display text-2xl font-black text-star-white">Historique des modifications</h2>
          <ChangeLog token={token}/>
        </div>
      );

      default: return <p className="text-dim-star">Section en développement</p>;
    }
  };

  return (
    <div className="min-h-screen flex" style={{background:"var(--void)"}}>
      {/* Sidebar */}
      <div className="w-60 flex-shrink-0 border-r border-white/5 flex flex-col" style={{background:"rgba(255,255,255,0.02)"}}>
        <div className="p-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-display font-black text-sm" style={{background:"linear-gradient(135deg,#00D4FF20,#7B2FFF20)",border:"1px solid #00D4FF40",color:"#00D4FF"}}>AS</div>
            <div>
              <p className="font-display font-black text-star-white text-sm">Admin</p>
              <p className="text-dim-star text-xs font-mono">ademsassi.com</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 overflow-y-auto space-y-4">
          {groups.map(group=>(
            <div key={group}>
              <p className="text-dim-star/40 text-xs font-mono tracking-widest mb-1 px-2">{group.toUpperCase()}</p>
              {NAV.filter(n=>n.group===group).map(item=>{
                const Icon=item.icon; const isActive=active===item.id;
                return (
                  <button key={item.id} onClick={()=>setActive(item.id)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-mono transition-all mb-0.5"
                    style={{background:isActive?"rgba(0,212,255,0.1)":"transparent",border:`1px solid ${isActive?"rgba(0,212,255,0.2)":"transparent"}`,color:isActive?"var(--neural-blue)":"var(--dim-star)"}}>
                    <Icon size={14}/>{item.label}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-white/5 space-y-1">
          <a href="/" target="_blank" className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-mono text-dim-star hover:text-neural-blue transition-colors">
            <Eye size={14}/>Voir le site
          </a>
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-mono text-dim-star hover:text-neural-pink transition-colors">
            <LogOut size={14}/>Déconnexion
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-8">
          {renderSection()}
        </div>
      </div>
    </div>
  );
}
