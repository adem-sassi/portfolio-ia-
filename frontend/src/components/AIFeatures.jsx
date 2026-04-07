import { useState } from "react";
import { MessageSquare, FileText, Code2, User, Trophy } from "lucide-react";
import ChatBot from "./ai/ChatBot";
import TextAnalyzer from "./ai/TextAnalyzer";
import CodeReviewer from "./ai/CodeReviewer";
import BioGenerator from "./ai/BioGenerator";
import MLLab from "./ai/MLLab";
import AIQuiz from "./ai/AIQuiz";

const TABS = [
  { id: "chat", label: "Chatbot IA", icon: MessageSquare, desc: "Discutez avec mon assistant IA" },
  { id: "text", label: "Analyseur", icon: FileText, desc: "Analyse de sentiment & ton" },
  { id: "code", label: "Code Review", icon: Code2, desc: "Review automatique de code" },
  { id: "bio", label: "Bio IA", icon: User, desc: "Générateur de bio IA" },
  { id: "quiz", label: "Quiz IA", icon: Trophy, desc: "Testez vos connaissances IA" },
];

export default function AIFeatures() {
  const [activeTab, setActiveTab] = useState("chat");
  const active = TABS.find((t) => t.id === activeTab);

  return (
    <section id="ai-features" className="relative py-32 px-6">
      {/* Blob */}
      <div
        className="blob absolute w-[500px] h-[500px] opacity-8 pointer-events-none"
        style={{ background: "var(--neural-pink)", bottom: "-10%", left: "-15%" }}
      />

      <div className="max-w-6xl mx-auto">
        {/* Label */}
        <div className="flex items-center gap-4 mb-4">
          <div className="h-px flex-1 max-w-[60px] bg-neural-blue/40" />
          <span className="font-mono text-xs text-neural-blue tracking-widest">03 / IA LAB</span>
        </div>

        <h2 className="font-display text-4xl md:text-5xl font-black text-star-white mb-4 leading-tight">
          Fonctionnalités <span className="gradient-text">propulsées par l'IA</span>
        </h2>
        <p className="text-dim-star mb-12 max-w-2xl leading-relaxed">
          Ces outils interactifs démontrent mes compétences en IA appliquée. Chaque
          fonctionnalité utilise l'API Claude (Anthropic) en temps réel.
        </p>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-mono tracking-wide transition-all duration-300 ${
                  isActive
                    ? "bg-neural-blue/20 border border-neural-blue text-neural-blue shadow-lg"
                    : "glass-card border border-white/5 text-dim-star hover:text-star-white hover:border-white/20"
                }`}
              >
                <Icon size={13} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Active Tab Description */}
        <p className="font-mono text-xs text-dim-star tracking-widest mb-6">
          ▸ {active.desc}
        </p>

        {/* Panel */}
        <div className="glass-card rounded-3xl p-1 neural-glow border border-neural-blue/20">
          <div className="rounded-[22px] overflow-hidden bg-deep-space/80">
            {/* Terminal Bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
              <div className="w-2.5 h-2.5 rounded-full bg-neural-pink/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-neural-green/70" />
              <span className="ml-4 font-mono text-xs text-dim-star tracking-widest">
                ai-lab / {activeTab}
              </span>
            </div>

            {/* Content */}
            <div className="p-6 min-h-[400px]">
              {activeTab === "chat" && <ChatBot />}
              {activeTab === "text" && <TextAnalyzer />}
              {activeTab === "code" && <CodeReviewer />}
              {activeTab === "bio" && <BioGenerator />}
              {activeTab === "quiz" && <AIQuiz />}
            </div>
          </div>
        </div>
      </div>
    <div className="max-w-6xl mx-auto px-6 mt-12">
        <MLLab/>
      </div>
    </section>
  );
}
