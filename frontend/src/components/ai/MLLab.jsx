import { useState } from "react";
import { Brain, TrendingUp, Image, AlertTriangle, Layers } from "lucide-react";
import SentimentAnalyzer from "./SentimentAnalyzer";
import DataPredictor from "./DataPredictor";
import ImageClassifier from "./ImageClassifier";
import AnomalyDetector from "./AnomalyDetector";
import TextCluster from "./TextCluster";

const TABS = [
  { id: "sentiment", label: "Sentiment", icon: Brain, component: SentimentAnalyzer },
  { id: "prediction", label: "Prédiction", icon: TrendingUp, component: DataPredictor },
  { id: "image", label: "Image", icon: Image, component: ImageClassifier },
  { id: "anomalie", label: "Anomalies", icon: AlertTriangle, component: AnomalyDetector },
  { id: "cluster", label: "Clustering", icon: Layers, component: TextCluster },
];

export default function MLLab() {
  const [active, setActive] = useState("sentiment");
  const ActiveComponent = TABS.find(t => t.id === active)?.component;

  return (
    <div className="glass-card rounded-2xl border border-neural-violet/20 overflow-hidden">
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center gap-2 mb-4">
          <Brain size={16} className="text-neural-violet"/>
          <span className="font-mono text-xs text-neural-violet tracking-widest">ML LAB</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActive(tab.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all"
                style={{
                  background: active === tab.id ? "rgba(123,47,255,0.2)" : "rgba(123,47,255,0.05)",
                  border: `1px solid ${active === tab.id ? "rgba(123,47,255,0.5)" : "rgba(123,47,255,0.2)"}`,
                  color: active === tab.id ? "var(--neural-violet)" : "var(--dim-star)"
                }}>
                <Icon size={11}/> {tab.label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="p-4">
        {ActiveComponent && <ActiveComponent/>}
      </div>
    </div>
  );
}
