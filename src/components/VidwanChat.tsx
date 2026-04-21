"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, User, Sparkles, Brain, Search, Info, Loader2, Bot, Trash2, Cpu, Globe, Zap, MessageSquare } from "lucide-react";
import Image from "next/image";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function VidwanChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Namaste! I am Vidwan AI, your scholarly digital mentor. Main Adumate ka ek advanced intelligence system hoon, Tony Stark ke Jarvis ki tarah. How can I assist you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // 1. Get Firebase ID Token
      const { auth } = await import("@/lib/firebase");
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        throw new Error("Please login to chat with Vidwan.");
      }

      // 2. Format Chat Context for a Jarvis-like persona
      const chatHistory = messages
        .map(m => `${m.role === "user" ? "Student" : "Vidwan"}: ${m.content}`)
        .join("\n");
      
      const fullPrompt = `
You are "Vidwan AI", the advanced scholarly intelligence of Adumate. 
Think of yourself as "Tony Stark's JARVIS" but for Indian students.
You are extremely smart, helpful, and you use a mix of Hindi and English (Hinglish).

Adumate Context:
- Founder: Ayush Kaushik.
- Features: Knowledge Finder (videos, notes, telegram), AI Test Generator, Service Map (Hostels, Libraries, Mess, Tutors), 1v1 Challenge.
- Mission: To simplify student life in India.

Your Character:
- You are a digital mentor. 
- You provide deep scholarly insights.
- You are witty, futuristic, and encouraging.
- You can understand and explain complex topics in simple Hinglish.

Conversation History:
${chatHistory}
Student: ${input}

Vidwan AI (JARVIS-mode) Response:`;

      // 3. Call dedicated Vidwan API for smart tool usage
      const response = await fetch("/api/vidwan", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ prompt: fullPrompt }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setMessages((prev) => [...prev, { role: "assistant", content: data.text }]);
    } catch (error: any) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: error.message || "I apologize, but I encountered a temporal glitch in the mainframe. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        content: "Memory cache cleared. Initializing new session. Main taiyar hoon aapke agle sawaal ke liye!",
      },
    ]);
  };

  return (
    <div className="flex flex-col h-[75vh] w-full max-w-5xl mx-auto bg-slate-950/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(255,107,0,0.15)] relative">
      {/* Futuristic Background Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 blur-[100px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 blur-[100px] pointer-events-none rounded-full" />
      
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-white/[0.02] relative z-10">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-orange-500 blur-xl opacity-20 animate-pulse rounded-full"></div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 p-1 relative z-10 overflow-hidden">
               <Image
                 src="/vidwan-char.png"
                 alt="Vidwan AI"
                 width={56}
                 height={56}
                 className="object-cover rounded-xl"
               />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-slate-950 rounded-full z-20 shadow-lg shadow-green-500/50"></div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-white tracking-tight">Vidwan AI</h2>
              <span className="px-2 py-0.5 bg-orange-500/10 border border-orange-500/20 rounded-md text-[10px] font-black text-orange-400 uppercase tracking-widest">
                v2.0 Flash
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
              <Cpu className="w-3 h-3 text-blue-400" /> JARVIS Protocol Active
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-6 px-4 py-2 bg-white/5 rounded-2xl border border-white/5 mr-2">
             <div className="flex flex-col items-center">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Latency</span>
                <span className="text-xs text-green-400 font-mono">14ms</span>
             </div>
             <div className="w-px h-6 bg-white/10" />
             <div className="flex flex-col items-center">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Safety</span>
                <span className="text-xs text-blue-400 font-mono">99.9%</span>
             </div>
          </div>
          <button 
            onClick={clearChat}
            className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-all group"
            title="Clear Chat Memory"
          >
            <Trash2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar relative z-10"
      >
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] flex gap-4 ${
                  m.role === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                  m.role === "user" 
                    ? "bg-primary/20 border-primary/30 shadow-lg shadow-primary/20" 
                    : "bg-slate-800/50 border-white/10 shadow-lg shadow-black/40"
                }`}>
                  {m.role === "user" ? (
                    <User className="w-6 h-6 text-white" />
                  ) : (
                    <div className="relative w-8 h-8 rounded-lg overflow-hidden p-0.5">
                       <Image src="/vidwan-char.png" alt="V" fill className="object-cover rounded-md" />
                    </div>
                  )}
                </div>
                <div
                  className={`relative p-5 rounded-3xl ${
                    m.role === "user"
                      ? "bg-gradient-to-br from-primary to-orange-600 text-white rounded-tr-none shadow-xl shadow-primary/10"
                      : "bg-white/5 backdrop-blur-xl text-slate-100 rounded-tl-none border border-white/10 shadow-xl"
                  }`}
                >
                  {m.role === "assistant" && (
                    <div className="absolute -top-3 -left-3 bg-slate-900 border border-white/10 p-1 rounded-lg">
                       <Sparkles className="w-3 h-3 text-orange-400" />
                    </div>
                  )}
                  <div className="text-sm md:text-base leading-relaxed whitespace-pre-wrap font-medium">
                    {m.content}
                  </div>
                  <div className={`text-[9px] mt-2 font-bold uppercase tracking-widest opacity-40 ${m.role === "user" ? "text-right" : "text-left"}`}>
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex justify-start"
          >
            <div className="flex gap-4 items-center bg-white/5 backdrop-blur-xl p-5 rounded-3xl rounded-tl-none border border-white/10 shadow-xl">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 blur-md opacity-30 animate-pulse"></div>
                <Loader2 className="w-6 h-6 text-blue-400 animate-spin relative z-10" />
              </div>
              <div className="flex flex-col gap-1">
                 <span className="text-sm font-black text-blue-400 tracking-wider">VIDWAN ANALYZING</span>
                 <span className="text-[10px] text-slate-500 font-mono animate-pulse">Accessing mainframe...</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Futuristic Input Area */}
      <div className="p-8 border-t border-white/5 bg-white/[0.02] relative z-10">
        <div className="flex gap-4 mb-4 overflow-x-auto pb-2 scrollbar-none">
           {[
             { label: "App Help", icon: <Info size={12}/>, color: "text-blue-400", bg: "bg-blue-400/10" },
             { label: "Search Web", icon: <Globe size={12}/>, color: "text-green-400", bg: "bg-green-400/10" },
             { label: "Study Mode", icon: <Brain size={12}/>, color: "text-purple-400", bg: "bg-purple-400/10" },
             { label: "Summarize", icon: <Zap size={12}/>, color: "text-orange-400", bg: "bg-orange-400/10" },
           ].map((chip) => (
             <button 
               key={chip.label}
               onClick={() => setInput(prev => `${prev} ${chip.label}: `)}
               className={`flex items-center gap-2 px-4 py-2 rounded-xl ${chip.bg} border border-white/5 hover:border-white/20 transition-all whitespace-nowrap`}
             >
               <span className={chip.color}>{chip.icon}</span>
               <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{chip.label}</span>
             </button>
           ))}
        </div>

        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-[2rem] blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
          <div className="relative flex items-center gap-3">
            <div className="flex-1 relative">
               <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask Vidwan something scholarly (e.g. Newton's 3rd Law samjha do)..."
                className="w-full bg-slate-900/90 border border-white/10 rounded-[1.5rem] px-6 py-5 text-white focus:outline-none focus:border-primary/50 transition-all pr-16 shadow-inner"
              />
              <div className="absolute left-0 bottom-0 h-1 bg-gradient-to-r from-primary via-blue-500 to-primary w-0 group-focus-within:w-full transition-all duration-700 rounded-full opacity-50"></div>
            </div>
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="bg-primary hover:bg-orange-500 disabled:opacity-30 disabled:grayscale text-white p-5 rounded-2xl transition-all shadow-xl shadow-primary/20 group/btn relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"></div>
              <Send className="w-6 h-6 relative z-10" />
            </button>
          </div>
        </div>
        
        <p className="text-center text-[10px] text-slate-600 mt-4 font-bold uppercase tracking-[0.2em]">
          Adumate Neural Network • Vidwan Intelligence v2.0
        </p>
      </div>
    </div>
  );
}
