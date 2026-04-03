import { useState, useRef } from "react";
import { Upload, FileText, Trash2, Loader2, Download, Eye } from "lucide-react";

export default function CVUpload({ token }) {
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [dragging, setDragging] = useState(false);
  const [cvName, setCvName] = useState(localStorage.getItem("cv_filename") || "");

  const upload = async (file) => {
    if (!file) return;
    if (file.type !== "application/pdf") {
      setStatus("error"); setMessage("❌ Seulement les PDF sont acceptés."); return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setStatus("error"); setMessage("❌ Fichier trop lourd — max 5MB."); return;
    }

    setLoading(true); setStatus("idle"); setMessage("");

    try {
      // Convertir en base64
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Envoyer en JSON
      const res = await fetch("/api/admin/upload-cv", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ file: base64, name: file.name }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur upload");

      setCvName(file.name);
      localStorage.setItem("cv_filename", file.name);
      setStatus("success");
      setMessage("✅ CV uploadé ! Téléchargeable sur le portfolio.");
    } catch (e) {
      setStatus("error"); setMessage(`❌ ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFile = (e) => { const f = e.target.files[0]; if (f) upload(f); e.target.value = ""; };
  const handleDrop = (e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) upload(f); };

  const deleteCV = async () => {
    try {
      await fetch("/api/admin/delete-cv", { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      setCvName(""); localStorage.removeItem("cv_filename");
      setStatus("idle"); setMessage("CV supprimé.");
    } catch { setMessage("Erreur suppression."); }
  };

  return (
    <div className="space-y-4">
      {cvName && (
        <div className="flex items-center gap-3 p-3 rounded-xl"
          style={{ background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.25)" }}>
          <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(0,255,136,0.15)", border: "1px solid rgba(0,255,136,0.3)" }}>
            <FileText size={16} className="text-neural-green"/>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-mono text-neural-green font-bold truncate">{cvName}</p>
            <p className="text-xs text-dim-star">CV actuel sur le portfolio</p>
          </div>
          <div className="flex gap-2">
            <a href="/cv.pdf" target="_blank"
              className="w-8 h-8 flex items-center justify-center rounded-lg"
              style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.2)" }}>
              <Eye size={13} className="text-neural-blue"/>
            </a>
            <a href="/cv.pdf" download
              className="w-8 h-8 flex items-center justify-center rounded-lg"
              style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.2)" }}>
              <Download size={13} className="text-neural-blue"/>
            </a>
            <button onClick={deleteCV}
              className="w-8 h-8 flex items-center justify-center rounded-lg"
              style={{ background: "rgba(255,47,187,0.1)", border: "1px solid rgba(255,47,187,0.2)" }}>
              <Trash2 size={13} className="text-neural-pink"/>
            </button>
          </div>
        </div>
      )}

      <div onClick={() => !loading && inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className="w-full rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all"
        style={{ height: "140px", border: `2px dashed ${dragging ? "rgba(0,212,255,0.7)" : "rgba(0,212,255,0.25)"}`, background: dragging ? "rgba(0,212,255,0.08)" : "rgba(0,212,255,0.02)" }}>
        {loading ? (
          <><Loader2 size={28} className="text-neural-blue animate-spin"/>
          <p className="font-mono text-xs text-neural-blue">Conversion et upload...</p></>
        ) : (
          <><div className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.2)" }}>
            <Upload size={20} className="text-neural-blue"/>
          </div>
          <div className="text-center">
            <p className="text-sm text-star-white font-mono">{cvName ? "Remplacer le CV" : "Déposer ton CV ici"}</p>
            <p className="text-xs text-dim-star mt-1">PDF uniquement — max 5MB</p>
          </div></>
        )}
      </div>

      {message && (
        <div className="px-4 py-3 rounded-xl text-sm font-mono"
          style={{
            background: status === "success" ? "rgba(0,255,136,0.08)" : "rgba(255,47,187,0.08)",
            border: `1px solid ${status === "success" ? "rgba(0,255,136,0.3)" : "rgba(255,47,187,0.3)"}`,
            color: status === "success" ? "var(--neural-green)" : "var(--neural-pink)",
          }}>
          {message}
        </div>
      )}
      <input ref={inputRef} type="file" accept=".pdf,application/pdf" onChange={handleFile} className="hidden"/>
    </div>
  );
}
