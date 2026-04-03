import { Plus, Trash2 } from "lucide-react";

export default function SkillsEditor({ skills, onChange }) {
  const updateSkillName = (ci, si, value) => {
    const s = JSON.parse(JSON.stringify(skills));
    s[ci].items[si].name = value;
    onChange(s);
  };

  const updateSkillLevel = (ci, si, value) => {
    const s = JSON.parse(JSON.stringify(skills));
    s[ci].items[si].level = Number(value);
    onChange(s);
  };

  const deleteSkill = (ci, si) => {
    const s = JSON.parse(JSON.stringify(skills));
    s[ci].items = s[ci].items.filter((_, idx) => idx !== si);
    onChange(s);
  };

  const addSkill = (ci) => {
    const s = JSON.parse(JSON.stringify(skills));
    s[ci].items.push({ name: "Nouvelle compétence", level: 70 });
    onChange(s);
  };

  const updateCategoryName = (ci, value) => {
    const s = JSON.parse(JSON.stringify(skills));
    s[ci].category = value;
    onChange(s);
  };

  const deleteCategory = (ci) => {
    onChange(skills.filter((_, idx) => idx !== ci));
  };

  const addCategory = () => {
    onChange([...skills, {
      category: "Nouvelle catégorie",
      color: "neural-blue",
      items: [{ name: "Compétence", level: 70 }]
    }]);
  };

  return (
    <div className="space-y-6">
      {(skills || []).map((cat, ci) => (
        <div key={ci} className="glass-card rounded-xl border border-white/5 p-4">
          {/* Category Header */}
          <div className="flex items-center gap-3 mb-4">
            <input
              type="text"
              value={cat.category || ""}
              onChange={e => updateCategoryName(ci, e.target.value)}
              className="ai-input flex-1 px-3 py-2 rounded-lg text-sm font-bold text-neural-blue"
              placeholder="Nom de la catégorie"
            />
            <button
              onClick={() => deleteCategory(ci)}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-neural-pink/10 border border-neural-pink/30 text-neural-pink hover:bg-neural-pink/20 transition-colors"
            >
              <Trash2 size={13}/>
            </button>
          </div>

          {/* Skills List */}
          <div className="space-y-3 ml-2">
            {(cat.items || []).map((skill, si) => (
              <div key={si} className="flex items-center gap-3">
                {/* Skill Name */}
                <input
                  type="text"
                  value={skill.name || ""}
                  onChange={e => updateSkillName(ci, si, e.target.value)}
                  className="ai-input flex-1 px-3 py-2 rounded-lg text-sm"
                  placeholder="Nom de la compétence"
                />

                {/* Level Slider */}
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={skill.level || 0}
                    onChange={e => updateSkillLevel(ci, si, e.target.value)}
                    className="w-20"
                  />
                  <span className="font-mono text-xs text-neural-blue w-8 text-right">
                    {skill.level}%
                  </span>
                </div>

                {/* Delete Skill */}
                <button
                  onClick={() => deleteSkill(ci, si)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-neural-pink/50 hover:text-neural-pink hover:bg-neural-pink/10 transition-colors"
                >
                  <Trash2 size={12}/>
                </button>
              </div>
            ))}
          </div>

          {/* Add Skill Button */}
          <button
            onClick={() => addSkill(ci)}
            className="flex items-center gap-2 mt-3 ml-2 text-xs font-mono text-neural-blue hover:opacity-80 transition-opacity"
          >
            <Plus size={12}/>
            Ajouter une compétence
          </button>
        </div>
      ))}

      {/* Add Category Button */}
      <button
        onClick={addCategory}
        className="w-full flex items-center justify-center gap-2 py-3 glass-card border border-dashed border-neural-blue/30 rounded-xl text-sm font-mono text-neural-blue hover:border-neural-blue/60 hover:bg-neural-blue/5 transition-all"
      >
        <Plus size={14}/>
        Ajouter une catégorie
      </button>
    </div>
  );
}
