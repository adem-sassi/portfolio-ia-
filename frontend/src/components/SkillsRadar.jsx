import { useState, useEffect } from "react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from "recharts";

const API_URL = "https://web-production-cba0c.up.railway.app";

export default function SkillsRadar() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/api/content`)
      .then(r => r.json())
      .then(d => {
        const skills = d.skills || [];
        const flat = skills.flatMap(cat => cat.items || []);
        const top8 = flat.sort((a, b) => b.level - a.level).slice(0, 8);
        setData(top8.map(s => ({ subject: s.name, level: s.level })));
      }).catch(() => {});
  }, []);

  if (!data.length) return null;

  return (
    <div className="glass-card rounded-2xl p-6 border border-white/5">
      <p className="font-mono text-xs text-neural-blue tracking-widest mb-4">RADAR — TOP 8 COMPÉTENCES</p>
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={data}>
          <PolarGrid stroke="rgba(255,255,255,0.1)"/>
          <PolarAngleAxis dataKey="subject" tick={{ fill: "#888", fontSize: 11, fontFamily: "monospace" }}/>
          <Radar name="Niveau" dataKey="level" stroke="#00D4FF" fill="#00D4FF" fillOpacity={0.15} strokeWidth={2}/>
          <Tooltip contentStyle={{ background: "#020408", border: "1px solid rgba(0,212,255,0.2)", borderRadius: "8px", fontFamily: "monospace", fontSize: "12px" }} formatter={v => [`${v}%`, "Niveau"]}/>
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
