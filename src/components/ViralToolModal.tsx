"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Camera, Send, Trophy, Link as LinkIcon, Flame, Brain, Share2, PlayCircle, Globe, MessageCircle } from "lucide-react";

interface ViralToolModalProps {
  toolId: string | null;
  onClose: () => void;
}

import { multiCallAI } from "@/lib/ai-service";

export default function ViralToolModal({ toolId, onClose }: ViralToolModalProps) {
  const [doubtImage, setDoubtImage] = useState<string | null>(null);
  const [isSolving, setIsSolving] = useState(false);
  const [solution, setSolution] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDoubtImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDoubtSolve = async () => {
    if (!doubtImage) {
      alert("Pehle photo upload karein!");
      return;
    }
    
    setIsSolving(true);
    try {
      const prompt = "You are a professional tutor. Solve the problem in this image step-by-step. Use simple language and explain the concepts clearly. If it's a question, give the answer. If it's a topic, explain it.";
      const res = await multiCallAI(prompt, { image: doubtImage });
      setSolution(res.text);
    } catch (err: any) {
      setSolution("⚠️ AI Connect nahi ho pa raha. Kripya dobara try karein ya internet check karein.");
    } finally {
      setIsSolving(false);
    }
  };

  const [challengeTopic, setChallengeTopic] = useState("General Knowledge");
  const [challengeLink, setChallengeLink] = useState("");
  const [copied, setCopied] = useState(false);

  const generateChallengeLink = () => {
    const id = Math.random().toString(36).substring(2, 9).toUpperCase();
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://adumate.app";
    const link = `${baseUrl}/test?challenge=${id}&topic=${encodeURIComponent(challengeTopic)}`;
    setChallengeLink(link);
    return link;
  };

  const handleShare = () => {
    const link = challengeLink || generateChallengeLink();
    const text = `⚔️ Mujhe 1v1 Challenge kiya hai!\n\n📚 Topic: ${challengeTopic}\n🔗 Click karo aur prove karo tum better ho:\n${link}\n\n🚀 Adumate pe milte hain!`;
    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(waUrl, "_blank");
  };

  const handleCopy = () => {
    const link = challengeLink || generateChallengeLink();
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!toolId) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-2xl bg-card border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-primary/10 to-transparent">
            <div className="flex items-center gap-3">
              <div className="text-3xl">
                {toolId === "doubt" && "📸"}
                {toolId === "1v1" && "⚔️"}
                {toolId === "streak" && "🔥"}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {toolId === "doubt" && "AI Doubt Solver"}
                  {toolId === "1v1" && "1v1 Challenge"}
                  {toolId === "streak" && "Your Study Streak"}
                </h2>
                <p className="text-xs text-muted-foreground">Powered by Adumate AI</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
              <X size={24} className="text-muted-foreground" />
            </button>
          </div>

          {/* Content */}
          <div className="p-8">
            {toolId === "doubt" && (
              <div className="space-y-6">
                {!solution ? (
                  <>
                    <input 
                      type="file" 
                      accept="image/*" 
                      id="doubt-upload" 
                      className="hidden" 
                      onChange={handleFileChange}
                    />
                    <label 
                      htmlFor="doubt-upload"
                      className="aspect-video rounded-3xl bg-white/5 border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-center p-6 hover:border-primary/50 transition-colors cursor-pointer group overflow-hidden"
                    >
                      {doubtImage ? (
                        <img src={doubtImage} alt="Doubt" className="w-full h-full object-contain" />
                      ) : (
                        <>
                          <Camera size={48} className="text-muted-foreground group-hover:text-primary transition-colors mb-4" />
                          <p className="font-bold text-lg text-white">Click to Upload or Take Photo</p>
                          <p className="text-sm text-muted">Supports Maths, Physics, Chemistry & Coding</p>
                        </>
                      )}
                    </label>
                    <button 
                      onClick={handleDoubtSolve}
                      disabled={isSolving || !doubtImage}
                      className="w-full bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-primary/20 flex justify-center items-center gap-2"
                    >
                      {isSolving ? (
                        <><Brain className="animate-bounce" size={20} /> AI is solving...</>
                      ) : (
                        <><Send size={20} /> {doubtImage ? "Solve Now" : "Upload Image to Solve"}</>
                      )}
                    </button>
                  </>
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <div className="p-6 bg-white/5 rounded-3xl border border-primary/20">
                      <h4 className="font-bold text-primary mb-2 flex items-center gap-2"><Brain size={18} /> Solution:</h4>
                      <p className="text-slate-200 leading-relaxed">{solution}</p>
                    </div>
                    <button onClick={() => setSolution(null)} className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-2xl transition-all border border-white/10">
                      Solve Another
                    </button>
                  </motion.div>
                )}
              </div>
            )}

            {toolId === "1v1" && (
              <div className="space-y-6 py-2">
                <div className="flex justify-center items-center gap-6">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center border-2 border-primary/30 mb-2">
                      <span className="text-2xl">🧑‍🎓</span>
                    </div>
                    <p className="font-bold text-sm">You</p>
                  </div>
                  <div className="text-3xl font-black text-primary italic animate-pulse">VS</div>
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center border-2 border-dashed border-white/20 mb-2">
                      <span className="text-2xl">❓</span>
                    </div>
                    <p className="font-bold text-sm text-muted-foreground">Opponent</p>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-2">Topic / Subject choose karo</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {["General Knowledge", "Coding", "Maths", "Physics", "English"].map(t => (
                      <button key={t} onClick={() => { setChallengeTopic(t); setChallengeLink(""); }}
                        className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${challengeTopic === t ? "bg-primary text-white border-primary" : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10"}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                  <input
                    value={challengeTopic}
                    onChange={e => { setChallengeTopic(e.target.value); setChallengeLink(""); }}
                    placeholder="Ya custom topic likho..."
                    className="w-full bg-background/50 border border-white/10 text-white rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>

                {challengeLink && (
                  <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                    <p className="text-xs text-muted-foreground mb-1">Challenge Link:</p>
                    <p className="text-xs text-primary font-mono break-all">{challengeLink}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button onClick={handleCopy}
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-3.5 rounded-xl transition-all border border-white/10 text-sm">
                    {copied ? "✅ Copied!" : "📋 Link Copy"}
                  </button>
                  <button onClick={handleShare}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white font-black py-3.5 rounded-xl transition-all shadow-lg shadow-green-500/20 flex justify-center items-center gap-2 text-sm">
                    <Share2 size={16} /> WhatsApp 🚀
                  </button>
                </div>
              </div>
            )}

            {toolId === "streak" && (
              <div className="text-center space-y-6">
                <div className="relative inline-block">
                  <Flame size={120} className="text-orange-500 animate-pulse drop-shadow-[0_0_30px_rgba(249,115,22,0.4)]" />
                  <span className="absolute inset-0 flex items-center justify-center text-4xl font-black text-white mt-4">5</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-1">5 Day Streak!</h3>
                  <p className="text-muted">You're on fire! Solve one more doubt to keep it alive.</p>
                </div>
                <div className="flex justify-between gap-2">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                    <div key={i} className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${i < 5 ? 'bg-primary text-white shadow-[0_0_10px_rgba(255,107,0,0.3)]' : 'bg-white/5 text-muted-foreground border border-white/10'}`}>
                      {day}
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl flex items-center gap-4 text-left">
                  <Trophy className="text-primary" size={32} />
                  <div>
                    <p className="font-bold text-sm">Next Reward</p>
                    <p className="text-xs text-muted">1 Month Adumate Plus (3 days left)</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
