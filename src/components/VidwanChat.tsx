"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, User, Sparkles, Trash2, Loader2, Bot, Plus, X, Maximize2 } from "lucide-react";
import Image from "next/image";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function VidwanChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Namaste! Main Vidwan hoon. Aaj aapko kya naya sikhna hai?",
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
      const { auth } = await import("@/lib/firebase");
      const token = await auth.currentUser?.getIdToken();
      
      const response = await fetch("/api/vidwan", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ prompt: input }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setMessages((prev) => [...prev, { role: "assistant", content: data.text }]);
    } catch (error: any) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Main abhi connect nahi ho pa raha hoon. Ek baar phir try karein?" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        content: "Naya session start ho gaya hai. Puchiye jo aap chahien!",
      },
    ]);
  };

  return (
    <div className="flex flex-col fixed inset-0 z-[100] bg-[#0a0f1a] overflow-hidden">
      
      {/* Full Screen Header */}
      <div className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-white/5 bg-slate-950/80 backdrop-blur-2xl z-20">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full"></div>
            <div className="w-12 h-12 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center p-2 relative z-10">
               <Image
                 src="/vidwan-logo-simple.svg"
                 alt="Vidwan"
                 width={32}
                 height={32}
                 className="object-contain"
               />
            </div>
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">Vidwan AI</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
               <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
               <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Active Mentor</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={clearChat}
            className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-400 hover:text-white transition-all group"
            title="Clear Chat"
          >
            <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
          <button 
            onClick={() => window.history.back()}
            className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-400 hover:text-white transition-all"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Full Screen Scrollable Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 md:px-24 py-10 md:py-20 space-y-12 custom-scrollbar bg-gradient-to-b from-transparent to-primary/5"
      >
        <div className="max-w-5xl mx-auto space-y-12">
          <AnimatePresence initial={false}>
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex gap-6 max-w-[90%] md:max-w-[80%] ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center shrink-0 mt-1 shadow-2xl ${
                    m.role === "user" ? "bg-gradient-to-br from-primary to-orange-600" : "bg-slate-800 border border-white/10 p-2"
                  }`}>
                    {m.role === "user" ? (
                      <User size={24} className="text-white" />
                    ) : (
                      <Image src="/vidwan-logo-simple.svg" alt="V" width={32} height={32} className="object-contain" />
                    )}
                  </div>
                  <div className={`p-6 md:p-8 rounded-[2rem] text-base md:text-xl leading-relaxed shadow-2xl ${
                    m.role === "user" 
                      ? "bg-primary/10 text-white rounded-tr-none border border-primary/20" 
                      : "bg-white/5 text-slate-100 rounded-tl-none border border-white/10 backdrop-blur-3xl"
                  }`}>
                    {m.content}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isLoading && (
            <div className="flex gap-6 justify-start">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-slate-800 border border-white/10 flex items-center justify-center animate-pulse">
                 <Loader2 size={24} className="animate-spin text-slate-500" />
              </div>
              <div className="flex flex-col gap-3">
                 <div className="h-8 w-64 bg-white/5 rounded-2xl animate-pulse" />
                 <div className="h-8 w-40 bg-white/5 rounded-2xl animate-pulse opacity-50" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Input Area (Gemini Style) */}
      <div className="px-6 md:px-24 pb-10 md:pb-16 pt-5 bg-gradient-to-t from-[#0a0f1a] to-transparent">
        <div className="max-w-4xl mx-auto relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-blue-500/30 rounded-[2.5rem] blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-700"></div>
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Kuch puchiye Vidwan se..."
              className="w-full bg-slate-900/90 border border-white/10 rounded-[2rem] px-10 py-6 md:py-8 text-xl md:text-2xl text-white focus:outline-none focus:border-primary/50 transition-all pr-24 shadow-2xl backdrop-blur-xl"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-primary hover:bg-orange-500 disabled:opacity-30 disabled:grayscale text-white p-4 md:p-5 rounded-2xl transition-all shadow-xl shadow-primary/20"
            >
              <Send className="w-8 h-8" />
            </button>
          </div>
        </div>
        <p className="text-center text-[10px] text-slate-600 mt-6 uppercase tracking-[0.3em] font-bold">
          Adumate Neural Network • Verified Scholarly Intelligence
        </p>
      </div>
    </div>
  );
}
