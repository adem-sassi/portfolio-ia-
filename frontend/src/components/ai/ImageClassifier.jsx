import { useState, useRef } from "react";
import { Upload, Loader2, Image as ImageIcon } from "lucide-react";

const API_URL = "https://web-production-cba0c.up.railway.app";

export default function ImageClassifier() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
      setImage({ base64: e.target.result.split(",")[1], mimeType: file.type });
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const classify = async () => {
    if (!image || loading) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch(`${API_URL}/api/ai/ml/classify-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(image),
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else setResult(data);
    } catch { setError("Erreur de connexion"); }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-neural-blue/30 rounded-xl p-6 text-center cursor-pointer hover:border-neural-blue/60 transition-colors"
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}>
        {preview ? (
          <img src={preview} alt="preview" className="max-h-40 mx-auto rounded-lg object-contain"/>
        ) : (
          <>
            <ImageIcon size={32} className="text-neural-blue mx-auto mb-2 opacity-50"/>
            <p className="text-dim-star text-sm font-mono">Glisse une image ou clique pour uploader</p>
          </>
        )}
        <input ref={inputRef} type="file" accept="image/*" className="hidden"
          onChange={e => handleFile(e.target.files[0])}/>
      </div>

      {image && (
        <button onClick={classify} disabled={loading}
          className="ai-btn w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm">
          {loading ? <Loader2 size={14} className="animate-spin"/> : <Upload size={14}/>}
          {loading ? "Classification en cours..." : "Classifier l'image"}
        </button>
      )}

      {error && <p className="text-neural-pink text-xs font-mono">⚠ {error}</p>}

      {result && (
        <div className="space-y-3">
          <div className="p-4 glass-card rounded-xl border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <p className="font-display font-bold text-star-white">{result.objet_principal}</p>
              <span className="text-xs font-mono px-2 py-1 rounded-full"
                style={{ background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.2)", color: "#00FF88" }}>
                {result.confiance}% confiance
              </span>
            </div>
            <p className="text-dim-star text-xs font-mono">{result.categorie}</p>
          </div>

          <p className="text-dim-star text-sm leading-relaxed p-3 glass-card rounded-xl border border-white/5">
            {result.description}
          </p>

          {result.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {result.tags.map((t, i) => (
                <span key={i} className="text-xs font-mono px-2 py-1 rounded-full"
                  style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.2)", color: "var(--neural-blue)" }}>
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
