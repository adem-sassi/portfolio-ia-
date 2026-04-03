import { useState } from "react";
import { Loader2, Trophy, RotateCcw, ChevronRight, CheckCircle, XCircle } from "lucide-react";

const TOPICS = ["Intelligence Artificielle", "Deep Learning", "NLP", "Computer Vision", "Reinforcement Learning", "MLOps", "Large Language Models"];
const DIFFICULTIES = ["débutant", "intermédiaire", "avancé"];

export default function AIQuiz() {
  const [topic, setTopic] = useState(TOPICS[0]);
  const [difficulty, setDifficulty] = useState(DIFFICULTIES[1]);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [showResult, setShowResult] = useState(false);

  const generate = async () => {
    setLoading(true);
    setQuiz(null);
    setAnswers([]);
    setCurrent(0);
    setSelected(null);
    setShowResult(false);
    try {
      const res = await fetch("/api/ai/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, difficulty }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setQuiz(data);
    } catch {
      alert("Erreur lors de la génération du quiz.");
    } finally {
      setLoading(false);
    }
  };

  const answer = (idx) => {
    if (selected !== null) return;
    setSelected(idx);
    const isCorrect = idx === quiz.questions[current].correct;
    setAnswers((prev) => [...prev, isCorrect]);
  };

  const next = () => {
    if (current + 1 >= quiz.questions.length) {
      setShowResult(true);
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
    }
  };

  const reset = () => {
    setQuiz(null);
    setAnswers([]);
    setCurrent(0);
    setSelected(null);
    setShowResult(false);
  };

  const score = answers.filter(Boolean).length;
  const q = quiz?.questions[current];

  if (showResult) {
    const pct = Math.round((score / quiz.questions.length) * 100);
    return (
      <div className="flex flex-col items-center text-center py-6 animate-[fadeIn_0.4s_ease]">
        <div className="w-24 h-24 rounded-full border-2 border-neural-blue/50 flex items-center justify-center mb-4 relative">
          <span className="font-display text-3xl font-black gradient-text">{pct}%</span>
          <div className="absolute inset-0 rounded-full" style={{ boxShadow: "0 0 30px rgba(0,212,255,0.2)" }} />
        </div>
        <h3 className="font-display text-xl font-bold text-star-white mb-2">
          {pct >= 80 ? "Excellent ! 🏆" : pct >= 60 ? "Bien joué ! 👍" : "Continuez à apprendre ! 📚"}
        </h3>
        <p className="text-dim-star mb-2">
          {score} / {quiz.questions.length} bonnes réponses
        </p>
        <p className="text-dim-star text-sm mb-8 max-w-sm">
          {pct >= 80
            ? "Vous maîtrisez très bien ce sujet !"
            : "Révisez les concepts clés et réessayez pour améliorer votre score."}
        </p>

        {/* Answer recap */}
        <div className="w-full space-y-2 mb-8">
          {quiz.questions.map((q, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 text-left px-4 py-3 rounded-xl border text-sm ${
                answers[i]
                  ? "border-neural-green/30 bg-neural-green/5"
                  : "border-neural-pink/30 bg-neural-pink/5"
              }`}
            >
              {answers[i] ? (
                <CheckCircle size={14} className="text-neural-green flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle size={14} className="text-neural-pink flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className="text-star-white">{q.question}</p>
                {!answers[i] && (
                  <p className="text-neural-green text-xs mt-1 font-mono">✓ {q.options[q.correct]}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <button onClick={reset} className="ai-btn px-6 py-3 rounded-xl flex items-center gap-2">
          <RotateCcw size={14} />
          Nouveau Quiz
        </button>
      </div>
    );
  }

  if (quiz && q) {
    const progress = ((current) / quiz.questions.length) * 100;
    return (
      <div className="animate-[fadeIn_0.3s_ease]">
        {/* Progress */}
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-xs text-dim-star">
            Question {current + 1} / {quiz.questions.length}
          </span>
          <span className="font-mono text-xs text-neural-blue">{quiz.topic}</span>
        </div>
        <div className="h-1 bg-white/5 rounded-full mb-6 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-neural-blue to-neural-violet transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Question */}
        <h3 className="font-body text-base font-semibold text-star-white mb-5 leading-relaxed">
          {q.question}
        </h3>

        {/* Options */}
        <div className="space-y-3 mb-5">
          {q.options.map((opt, i) => {
            const isSelected = selected === i;
            const isCorrect = i === q.correct;
            let style = "border-white/10 text-dim-star hover:border-white/30 hover:text-star-white";
            if (selected !== null) {
              if (isCorrect) style = "border-neural-green/50 bg-neural-green/10 text-neural-green";
              else if (isSelected && !isCorrect) style = "border-neural-pink/50 bg-neural-pink/10 text-neural-pink";
              else style = "border-white/5 text-white/30";
            }
            return (
              <button
                key={i}
                onClick={() => answer(i)}
                className={`w-full text-left px-4 py-3 rounded-xl border transition-all text-sm font-mono flex items-center gap-3 ${style}`}
              >
                <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-xs flex-shrink-0">
                  {String.fromCharCode(65 + i)}
                </span>
                {opt}
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {selected !== null && (
          <div className="glass-card border border-neural-blue/20 rounded-xl px-4 py-3 mb-4 text-sm text-dim-star leading-relaxed animate-[fadeIn_0.3s_ease]">
            💡 {q.explanation}
          </div>
        )}

        {/* Next */}
        {selected !== null && (
          <button onClick={next} className="ai-btn px-6 py-3 rounded-xl flex items-center gap-2 w-full justify-center">
            {current + 1 >= quiz.questions.length ? <Trophy size={14} /> : <ChevronRight size={14} />}
            {current + 1 >= quiz.questions.length ? "Voir les résultats" : "Question suivante"}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="font-mono text-xs text-dim-star tracking-widest mb-2 block">SUJET DU QUIZ</label>
        <div className="flex flex-wrap gap-2">
          {TOPICS.map((t) => (
            <button
              key={t}
              onClick={() => setTopic(t)}
              className={`text-xs font-mono px-3 py-1.5 rounded-full border transition-all ${
                topic === t ? "border-neural-blue text-neural-blue bg-neural-blue/10" : "border-white/10 text-dim-star hover:border-white/30"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="font-mono text-xs text-dim-star tracking-widest mb-2 block">DIFFICULTÉ</label>
        <div className="flex gap-2">
          {DIFFICULTIES.map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={`text-xs font-mono px-4 py-2 rounded-full border transition-all capitalize ${
                difficulty === d ? "border-neural-violet text-neural-violet bg-neural-violet/10" : "border-white/10 text-dim-star hover:border-white/30"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <button onClick={generate} disabled={loading} className="ai-btn px-6 py-3 rounded-xl flex items-center gap-2">
        {loading ? <Loader2 size={15} className="animate-spin" /> : <Trophy size={15} />}
        {loading ? "Génération du quiz..." : "Générer le Quiz IA"}
      </button>

      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }`}</style>
    </div>
  );
}
