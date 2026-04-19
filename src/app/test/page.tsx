"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, CheckCircle, XCircle, Award, RefreshCcw, Sparkles, BookOpen, Loader2, Zap } from "lucide-react";

const QUICK_TOPICS = [
  { label: "Class 10 Science — Motion", icon: "🔬" },
  { label: "Class 12 Physics — Electricity", icon: "⚡" },
  { label: "JavaScript Basics", icon: "💻" },
  { label: "Class 9 Maths — Triangles", icon: "📐" },
  { label: "English Grammar — Tenses", icon: "📝" },
  { label: "GK — Indian History", icon: "🇮🇳" },
  { label: "Logical Reasoning", icon: "🧠" },
  { label: "Aptitude — Percentages", icon: "🔢" },
];

// ✅ Only models confirmed working on v1beta free tier
const GEMINI_MODELS = [
  "gemini-1.5-flash",
  "gemini-1.5-flash-8b",
  "gemini-2.0-flash-lite",
];

async function callGemini(prompt: string): Promise<string> {
  const key = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!key) throw new Error("__NOKEY__");

  let hitQuota = false;
  for (const model of GEMINI_MODELS) {
    try {
      const resp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.5,
              maxOutputTokens: 2048,
              responseMimeType: "application/json",
            },
          }),
        }
      );
      const data = await resp.json();
      if (data.error) {
        const code = data.error.code;
        if (code === 429) { hitQuota = true; continue; }  // quota — try next
        if (code === 404 || code === 400) continue;        // model not found — try next
        continue;
      }
      const text: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      if (text.trim()) return text;
    } catch { /* network error, try next */ }
  }
  // All models tried
  if (hitQuota) throw new Error("__QUOTA__");
  throw new Error("__FAILED__");
}

function parseQuestions(raw: string): any[] {
  // Try direct parse first
  try {
    const parsed = JSON.parse(raw.trim());
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch { }

  // Strip markdown fences and try again
  const stripped = raw.replace(/```json|```/gi, "").trim();
  try {
    const parsed = JSON.parse(stripped);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch { }

  // Extract array from string
  const match = stripped.match(/\[[\s\S]*\]/);
  if (match) {
    try {
      const parsed = JSON.parse(match[0]);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch { }
  }

  throw new Error("Questions parse nahi ho sake. Dobara try karo.");
}

function TestApp() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState<"select" | "loading" | "test" | "result">("select");
  const [topicInput, setTopicInput] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [error, setError] = useState("");
  const [loadingMsg, setLoadingMsg] = useState("Questions generate ho rahe hain...");

  // Read ?topic= param from URL (e.g. from dashboard banner)
  useEffect(() => {
    const urlTopic = searchParams.get("topic");
    if (urlTopic) setTopicInput(decodeURIComponent(urlTopic));
  }, [searchParams]);

  const startTest = async (topic?: string) => {
    const finalTopic = (topic || topicInput).trim();
    if (!finalTopic) return;
    setTopicInput(finalTopic);
    setStep("loading");
    setError("");
    setQuestions([]);
    setCurrentIndex(0);
    setAnswers([]);
    setSelectedOption(null);
    setScore(0);

    const msgs = [
      `"${finalTopic}" ke liye questions bana rahe hain...`,
      "AI soch raha hai... thoda wait karo ⏳",
      "Almost done! Questions ready ho rahe hain...",
    ];
    let i = 0;
    setLoadingMsg(msgs[0]);
    const msgTimer = setInterval(() => { i = Math.min(i + 1, msgs.length - 1); setLoadingMsg(msgs[i]); }, 2500);

    const prompt = `You are an expert Indian teacher creating a quiz for students.

Topic: "${finalTopic}"
Number of questions: ${numQuestions}
Difficulty: ${difficulty}

Generate EXACTLY ${numQuestions} multiple choice questions. Return ONLY a valid JSON array, no other text, no markdown.

Format:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Short explanation why this is correct."
  }
]

Rules:
- correctAnswer is 0-based index (0=first option, 1=second, etc.)
- Options should NOT have A) B) C) D) prefix
- Questions should be appropriate for the topic level
- Keep explanations short (1-2 sentences)
- Return ONLY the JSON array, nothing else`;

    try {
      const raw = await callGemini(prompt);
      clearInterval(msgTimer);
      const parsed = parseQuestions(raw);
      setQuestions(parsed.slice(0, numQuestions));
      setStep("test");
    } catch (e: any) {
      clearInterval(msgTimer);
      const msg: string = e.message || "";
      if (msg === "__QUOTA__") {
        setError("🕐 Free AI limit khatam ho gayi! Thodi der (15-30 min) baad try karo.\n\n⚡ Token limit jald update hogi. Tab tak Quick Topics try karo!");
      } else if (msg === "__NOKEY__") {
        setError("❌ API Key nahi mili. .env.local mein NEXT_PUBLIC_GEMINI_API_KEY add karo.");
      } else {
        setError("⚠️ Kuch problem aayi. Topic seedha likhke dobara try karo. Agar problem rahe toh 5 min baad try karo.");
      }
      setStep("select");
    }
  };

  const handleSelectOption = (i: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(i);
  };

  const handleNext = () => {
    if (selectedOption === null) return;
    const newAnswers = [...answers, selectedOption];
    setAnswers(newAnswers);
    setSelectedOption(null);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      let s = 0;
      newAnswers.forEach((ans, i) => { if (ans === questions[i]?.correctAnswer) s++; });
      setScore(s);
      setStep("result");
    }
  };

  const reset = () => {
    setStep("select");
    setCurrentIndex(0);
    setAnswers([]);
    setSelectedOption(null);
    setScore(0);
    setError("");
  };

  const q = questions[currentIndex];
  const pct = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <AnimatePresence mode="wait">

        {/* STEP 1: Topic Input */}
        {step === "select" && (
          <motion.div key="select" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-4 py-1.5 rounded-full text-sm font-bold mb-4">
                <Sparkles size={14} /> AI-Powered Test Generator
              </div>
              <h1 className="text-4xl font-black text-white mb-2">AI Test Hub 🎯</h1>
              <p className="text-muted-foreground">Koi bhi topic, kisi bhi class ka — AI test banayega</p>
            </div>

            <div className="bg-card/60 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 shadow-2xl">
              <label className="text-sm font-bold text-muted-foreground mb-2 block">
                Topic / Class / Subject likho ✍️
              </label>
              <textarea
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                placeholder={"e.g. Class 10 Science Chapter 3 - Atoms and Molecules\ne.g. JavaScript Arrays and Functions\ne.g. Class 12 History - Partition of India"}
                className="w-full bg-background/50 border border-white/10 text-white rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all resize-none"
                rows={3}
              />

              <div className="flex flex-wrap gap-6 mt-5">
                <div>
                  <label className="text-xs text-muted-foreground font-bold block mb-2">Questions</label>
                  <div className="flex gap-2">
                    {[5, 10, 15].map(n => (
                      <button key={n} onClick={() => setNumQuestions(n)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${numQuestions === n ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10"}`}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-bold block mb-2">Difficulty</label>
                  <div className="flex gap-2">
                    {(["easy", "medium", "hard"] as const).map(d => (
                      <button key={d} onClick={() => setDifficulty(d)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold capitalize border transition-all ${difficulty === d ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10"}`}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-2xl leading-relaxed whitespace-pre-line">
                  {error}
                  {error.includes("limit") && (
                    <div className="mt-3 pt-3 border-t border-red-500/20">
                      <p className="text-xs text-slate-400">💡 <strong className="text-white">Tip:</strong> Neeche Quick Topics try karo — ye bhi AI se generate hote hain ek click mein!</p>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={() => startTest()}
                disabled={!topicInput.trim()}
                className="mt-5 w-full bg-primary hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-primary/30 flex items-center justify-center gap-2 text-lg"
              >
                <Brain size={22} /> Test Generate Karo
              </button>
            </div>

            <div>
              <p className="text-sm font-bold text-muted-foreground mb-3 flex items-center gap-2">
                <BookOpen size={14} /> Quick Topics (ek click mein)
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {QUICK_TOPICS.map((t) => (
                  <button key={t.label} onClick={() => startTest(t.label)}
                    className="p-3 bg-card/50 border border-white/10 rounded-2xl hover:border-primary/50 hover:bg-primary/5 transition-all text-left group">
                    <span className="text-xl block mb-1">{t.icon}</span>
                    <span className="text-xs font-bold text-slate-300 group-hover:text-primary transition-colors leading-tight block">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 2: Loading */}
        {step === "loading" && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-32 text-center">
            <div className="relative mb-8">
              <div className="w-24 h-24 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <Brain size={40} className="absolute inset-0 m-auto text-primary animate-pulse" />
            </div>
            <motion.h2
              key={loadingMsg}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold text-white"
            >
              {loadingMsg}
            </motion.h2>
            <p className="text-muted-foreground mt-2 text-sm">Topic: "{topicInput}"</p>
            <p className="text-muted-foreground mt-1 text-xs">{numQuestions} questions • {difficulty} difficulty</p>
          </motion.div>
        )}

        {/* STEP 3: Test */}
        {step === "test" && q && (
          <motion.div key={`q-${currentIndex}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-muted-foreground">{currentIndex + 1} / {questions.length}</span>
              <span className="text-xs font-bold px-3 py-1 bg-primary/10 text-primary rounded-full border border-primary/20 capitalize">{difficulty}</span>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                className="h-full bg-primary rounded-full transition-all duration-500" />
            </div>

            <div className="bg-card/70 border border-white/10 rounded-[2rem] p-8 shadow-2xl">
              <p className="text-xs font-black text-primary uppercase tracking-widest mb-4">Question {currentIndex + 1}</p>
              <h2 className="text-xl font-bold text-white mb-8 leading-relaxed">{q.question}</h2>

              <div className="space-y-3">
                {q.options?.map((opt: string, i: number) => {
                  let cls = "bg-white/5 border-white/10 text-slate-200 hover:bg-primary/10 hover:border-primary/40 cursor-pointer";
                  if (selectedOption !== null) {
                    if (i === q.correctAnswer) cls = "bg-green-500/20 border-green-500/60 text-green-300";
                    else if (i === selectedOption) cls = "bg-red-500/20 border-red-500/60 text-red-300";
                    else cls = "bg-white/5 border-white/5 text-slate-500 cursor-not-allowed";
                  }
                  return (
                    <button key={i} onClick={() => handleSelectOption(i)}
                      className={`w-full text-left px-5 py-4 rounded-2xl border font-medium transition-all text-sm ${cls}`}>
                      <span className="font-black text-xs mr-2 opacity-60">{["A", "B", "C", "D"][i]}.</span>
                      {opt}
                    </button>
                  );
                })}
              </div>

              <AnimatePresence>
                {selectedOption !== null && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-2xl text-sm text-slate-200 leading-relaxed">
                    💡 <span className="font-bold text-primary">Explanation:</span> {q.explanation}
                  </motion.div>
                )}
              </AnimatePresence>

              <button onClick={handleNext} disabled={selectedOption === null}
                className="mt-6 w-full bg-primary hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2 text-base">
                {currentIndex === questions.length - 1 ? "Submit Test 🏁" : "Next Question →"}
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 4: Result */}
        {step === "result" && (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
            <div className="text-center p-10 bg-gradient-to-br from-primary/20 via-card to-card border border-primary/20 rounded-[2.5rem] shadow-2xl">
              <Award size={56} className="mx-auto text-primary mb-4" />
              <div className="text-7xl font-black text-white mb-2">{pct}%</div>
              <p className="text-xl text-slate-300">
                {score}/{questions.length} sahi —{" "}
                {pct === 100 ? "🎉 Perfect Score! Genius!" : pct >= 80 ? "🔥 Zabardast!" : pct >= 60 ? "👍 Accha kiya!" : "💪 Aur practice karo!"}
              </p>
              <p className="text-sm text-muted-foreground mt-2">Topic: {topicInput} • {difficulty}</p>
            </div>

            <div className="space-y-4">
              <h3 className="font-black text-white text-lg">📋 Detailed Review</h3>
              {questions.map((ques, i) => {
                const isCorrect = answers[i] === ques.correctAnswer;
                return (
                  <div key={i} className={`p-5 rounded-2xl border ${isCorrect ? "bg-green-500/10 border-green-500/20" : "bg-red-500/10 border-red-500/20"}`}>
                    <div className="flex items-start gap-3 mb-3">
                      {isCorrect ? <CheckCircle size={18} className="text-green-400 mt-0.5 shrink-0" /> : <XCircle size={18} className="text-red-400 mt-0.5 shrink-0" />}
                      <p className="font-bold text-white text-sm leading-relaxed">{ques.question}</p>
                    </div>
                    {!isCorrect && answers[i] !== undefined && (
                      <p className="text-xs text-red-400 mb-1 pl-7">❌ Tumhara: {ques.options?.[answers[i]]}</p>
                    )}
                    <p className="text-xs text-green-400 mb-2 pl-7">✅ Sahi: {ques.options?.[ques.correctAnswer]}</p>
                    <p className="text-xs text-primary/90 bg-primary/5 p-3 rounded-xl ml-7 leading-relaxed">💡 {ques.explanation}</p>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3">
              <button onClick={() => startTest(topicInput)}
                className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-4 rounded-2xl transition-all text-sm">
                🔄 Same Topic, Naye Questions
              </button>
              <button onClick={reset}
                className="flex-1 bg-primary hover:bg-primary-hover text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-primary/20 text-sm flex items-center justify-center gap-2">
                <RefreshCcw size={16} /> Naya Topic
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}

export default function TestPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    }>
      <TestApp />
    </Suspense>
  );
}
