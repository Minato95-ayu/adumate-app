"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlayCircle, FileText, HelpCircle, Loader2, Search, CheckCircle, XCircle, Trophy } from "lucide-react";

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface StudyResult {
  notes: string | null;
  questions: Question[] | null;
}

export default function StudyHub() {
  const [topic, setTopic] = useState("");
  const [activeTab, setActiveTab] = useState<"video" | "notes" | "questions">("video");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StudyResult | null>(null);

  // Test state
  const [testStarted, setTestStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const callGemini = async (prompt: string): Promise<string> => {
    const key = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!key) return "";
    const body = {
      contents: [{ parts: [{ text: prompt }] }]
    };
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
    );
    const data = await resp.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  };

  const handleSearch = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setResult(null);
    resetTest();

    try {
      const [notesRaw, questionsRaw] = await Promise.all([
        callGemini(`Generate concise, well-structured study notes for: "${topic}". Use simple Hindi+English mix. Format with:
- 📌 3-4 key concepts with short explanations
- 🔑 Important formulas or definitions
- 💡 2-3 real examples
Keep it under 300 words, student-friendly.`),
        callGemini(`Generate 5 multiple choice questions for topic: "${topic}".
Return ONLY valid JSON array, no extra text or markdown:
[{"question":"...","options":["A) ...","B) ...","C) ...","D) ..."],"correctAnswer":0,"explanation":"..."}]`)
      ]);

      let questions: Question[] = [];
      try {
        const cleaned = questionsRaw.replace(/```json|```/g, "").trim();
        questions = JSON.parse(cleaned);
      } catch { questions = []; }

      setResult({ notes: notesRaw, questions });
      setActiveTab("video");
    } finally {
      setLoading(false);
    }
  };

  const resetTest = () => {
    setTestStarted(false);
    setCurrentQ(0);
    setSelectedAnswers([]);
    setTestSubmitted(false);
    setScore(0);
  };

  const handleAnswer = (optIdx: number) => {
    if (testSubmitted) return;
    const updated = [...selectedAnswers];
    updated[currentQ] = optIdx;
    setSelectedAnswers(updated);
  };

  const handleNext = () => {
    if (currentQ < (result?.questions?.length ?? 0) - 1) {
      setCurrentQ(currentQ + 1);
    }
  };

  const handleSubmit = () => {
    if (!result?.questions) return;
    let finalScore = 0;
    result.questions.forEach((q, i) => {
      if (selectedAnswers[i] === q.correctAnswer) finalScore++;
    });
    setScore(finalScore);
    setTestSubmitted(true);
  };

  const TABS = [
    { id: "video" as const, label: "Video", icon: <PlayCircle size={16} /> },
    { id: "notes" as const, label: "AI Notes", icon: <FileText size={16} /> },
    { id: "questions" as const, label: "Test Yourself", icon: <HelpCircle size={16} /> },
  ];

  const questions = result?.questions ?? [];
  const totalQ = questions.length;

  return (
    <div className="bg-card/60 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl">
      <h2 className="text-2xl font-black text-white mb-1 flex items-center gap-2">📚 Study Hub</h2>
      <p className="text-muted-foreground text-sm mb-6">Koi bhi topic likhो — Video, Notes aur AI Test ek jagah</p>

      {/* Search */}
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="e.g. Newton's Laws, Algebra, Photosynthesis, SQL Joins..."
          className="flex-1 bg-background/50 border border-white/10 text-white rounded-2xl p-4 focus:ring-2 focus:ring-primary outline-none transition-all text-sm"
        />
        <button
          onClick={handleSearch}
          disabled={loading || !topic.trim()}
          className="bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-bold px-6 rounded-2xl transition-all flex items-center gap-2 shadow-lg shadow-primary/20 whitespace-nowrap"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Loader2 size={48} className="text-primary animate-spin mb-4" />
          <p className="text-white font-bold text-lg">AI study material bana raha hai...</p>
          <p className="text-muted-foreground text-sm mt-1">"{topic}" ke liye notes + 5 questions</p>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {/* Tabs */}
          <div className="flex gap-2 mb-6 bg-background/30 p-1.5 rounded-2xl">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); resetTest(); }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
                  activeTab === tab.id
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "text-muted-foreground hover:text-white"
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* VIDEO */}
            {activeTab === "video" && (
              <motion.div key="video" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="rounded-2xl overflow-hidden bg-black aspect-video w-full">
                  <iframe
                    src={`https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(topic + " explained in hindi")}`}
                    className="w-full h-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-3 text-center">🎥 YouTube: "{topic} explained in hindi"</p>
              </motion.div>
            )}

            {/* NOTES */}
            {activeTab === "notes" && (
              <motion.div key="notes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="bg-background/40 border border-white/10 rounded-2xl p-6 max-h-96 overflow-y-auto custom-scrollbar">
                  <h3 className="text-lg font-black text-primary mb-4 flex items-center gap-2">
                    <FileText size={20} /> {topic} — AI Notes
                  </h3>
                  <div className="text-slate-200 text-sm leading-loose whitespace-pre-wrap">{result.notes}</div>
                </div>
              </motion.div>
            )}

            {/* TEST */}
            {activeTab === "questions" && (
              <motion.div key="questions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {/* Not started yet */}
                {!testStarted && !testSubmitted && (
                  <div className="text-center py-10 bg-background/30 rounded-2xl border border-white/10">
                    <div className="text-5xl mb-4">🎯</div>
                    <h3 className="text-2xl font-black text-white mb-2">{totalQ} Questions Ready!</h3>
                    <p className="text-muted-foreground mb-6">"{topic}" pe {totalQ} AI-generated questions hain. Kya tum ready ho?</p>
                    <button
                      onClick={() => setTestStarted(true)}
                      className="bg-primary hover:bg-primary-hover text-white font-black px-10 py-4 rounded-2xl transition-all shadow-xl shadow-primary/30"
                    >
                      Start Test 🚀
                    </button>
                  </div>
                )}

                {/* Test in progress */}
                {testStarted && !testSubmitted && questions.length > 0 && (
                  <div className="space-y-6">
                    {/* Progress */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-muted-foreground">Question {currentQ + 1} of {totalQ}</span>
                      <div className="h-2 flex-1 mx-4 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-500"
                          style={{ width: `${((currentQ + 1) / totalQ) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Question Card */}
                    <div className="bg-background/40 border border-white/10 rounded-2xl p-6">
                      <p className="text-lg font-bold text-white mb-6">{questions[currentQ]?.question}</p>
                      <div className="space-y-3">
                        {questions[currentQ]?.options?.map((opt, j) => (
                          <button
                            key={j}
                            onClick={() => handleAnswer(j)}
                            className={`w-full text-left px-5 py-4 rounded-xl text-sm font-medium transition-all border ${
                              selectedAnswers[currentQ] === j
                                ? "bg-primary/20 border-primary text-white shadow-[0_0_15px_rgba(255,107,0,0.2)]"
                                : "bg-white/5 border-white/10 text-slate-200 hover:bg-white/10 hover:border-white/20"
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex gap-3">
                      {currentQ < totalQ - 1 ? (
                        <button
                          onClick={handleNext}
                          disabled={selectedAnswers[currentQ] === undefined}
                          className="flex-1 bg-white/10 hover:bg-white/20 disabled:opacity-40 text-white font-bold py-4 rounded-2xl transition-all"
                        >
                          Next →
                        </button>
                      ) : (
                        <button
                          onClick={handleSubmit}
                          disabled={selectedAnswers[currentQ] === undefined}
                          className="flex-1 bg-primary hover:bg-primary-hover disabled:opacity-40 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-primary/30"
                        >
                          Submit Test 🏁
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Result */}
                {testSubmitted && (
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-6">
                    {/* Score Card */}
                    <div className="text-center p-8 bg-gradient-to-br from-primary/20 to-orange-500/10 border border-primary/30 rounded-2xl">
                      <Trophy size={48} className="mx-auto text-primary mb-4" />
                      <div className="text-6xl font-black text-white mb-2">
                        {Math.round((score / totalQ) * 100)}%
                      </div>
                      <p className="text-lg text-slate-300">
                        {score}/{totalQ} sahi — {score === totalQ ? "🎉 Perfect!" : score >= totalQ * 0.6 ? "👍 Accha kiya!" : "💪 Aur practice karo!"}
                      </p>
                    </div>

                    {/* Answer Review */}
                    <div className="space-y-4">
                      <h4 className="font-black text-white text-lg">📋 Review</h4>
                      {questions.map((q, i) => (
                        <div key={i} className={`p-5 rounded-2xl border ${selectedAnswers[i] === q.correctAnswer ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30"}`}>
                          <div className="flex items-center gap-2 mb-2">
                            {selectedAnswers[i] === q.correctAnswer
                              ? <CheckCircle size={18} className="text-green-500" />
                              : <XCircle size={18} className="text-red-500" />
                            }
                            <p className="font-bold text-white text-sm">Q{i + 1}. {q.question}</p>
                          </div>
                          {selectedAnswers[i] !== q.correctAnswer && (
                            <p className="text-xs text-red-400 mb-1">❌ Tumhara: {q.options[selectedAnswers[i]]}</p>
                          )}
                          <p className="text-xs text-green-400 mb-2">✅ Sahi: {q.options[q.correctAnswer]}</p>
                          <p className="text-xs text-primary bg-primary/10 p-2 rounded-lg">💡 {q.explanation}</p>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={resetTest}
                      className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-4 rounded-2xl transition-all"
                    >
                      🔄 Dobara Try Karo
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Empty State */}
      {!result && !loading && (
        <div className="text-center py-12 text-muted-foreground">
          <div className="text-5xl mb-4">🎓</div>
          <p className="font-bold text-white">Koi bhi topic likhо</p>
          <p className="text-sm mt-1">AI Video, Notes aur Test ek saath banayega</p>
        </div>
      )}
    </div>
  );
}
