import { useRef, useState } from "react";
import { Upload, X, Image } from "lucide-react";

export default function ImageUpload({ value, onChange, label = "Image", maxSizeKB = 400 }) {
  const inputRef = useRef(null);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);

  const processFile = (file) => {
    setError("");
    if (!file.type.startsWith("image/")) {
      setError("Fichier non valide — choisissez une image.");
      return;
    }
    if (file.size > maxSizeKB * 1024) {
      setError(`Image trop grande (max ${maxSizeKB}KB). Compresse sur squoosh.app`);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => onChange(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleFile = (e) => { const f = e.target.files[0]; if (f) processFile(f); };
  const handleDrop = (e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) processFile(f); };
  const handleRemove = () => { onChange(""); if (inputRef.current) inputRef.current.value = ""; };

  return (
    <div className="space-y-2">
      <label className="font-mono text-xs text-dim-star tracking-widest block uppercase">{label}</label>

      {value ? (
        <div className="relative group">
          <img src={value} alt="preview" className="w-full h-40 object-cover rounded-xl border border-white/10"/>
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-3">
            <button onClick={() => inputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2 bg-neural-blue/80 rounded-lg text-xs font-mono text-white">
              <Upload size={12}/> Changer
            </button>
            <button onClick={handleRemove}
              className="flex items-center gap-1.5 px-3 py-2 bg-neural-pink/80 rounded-lg text-xs font-mono text-white">
              <X size={12}/> Supprimer
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`w-full h-32 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
            dragging ? "border-neural-blue bg-neural-blue/10" : "border-white/20 hover:border-neural-blue/50 hover:bg-neural-blue/5"
          }`}
        >
          <Image size={22} className="text-dim-star"/>
          <p className="text-dim-star text-xs font-mono">Clique ou glisse une image ici</p>
          <p className="text-white/30 text-xs">JPG, PNG, WebP — max {maxSizeKB}KB</p>
        </div>
      )}

      {error && <p className="text-neural-pink text-xs font-mono">⚠ {error}</p>}
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden"/>
    </div>
  );
}
