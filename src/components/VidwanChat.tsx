"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, User, Sparkles, Trash2, Loader2, Bot, Plus, X } from "lucide-react";
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
    <div className="flex flex-col h-[85vh] w-full max-w-5xl mx-auto bg-[#0a0f1a] border border-white/10 rounded-[2rem] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.6)] relative">
      
      {/* Premium Header */}
      <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-slate-950/50 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full group-hover:bg-primary/40 transition-all"></div>
            <div className="w-12 h-12 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center p-2 relative z-10 overflow-hidden">
               <Image
                 src="/vidwan-logo-simple.svg"
                 alt="Vidwan"
                 width={36}
                 height={36}
                 className="object-contain"
               />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">Vidwan AI</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
               <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
               <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Active Mentor</span>
            </div>
          </div>
        </div>
        <button 
          onClick={clearChat}
          className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-all group"
          title="Clear Chat"
        >
          <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 md:p-12 space-y-10 custom-scrollbar bg-gradient-to-b from-transparent to-slate-900/20"
      >
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`flex gap-5 max-w-[85%] ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-1 shadow-lg ${
                  m.role === "user" ? "bg-gradient-to-br from-primary to-orange-600" : "bg-slate-800 border border-white/10 p-1.5"
                }`}>
                  {m.role === "user" ? (
                    <User size={20} className="text-white" />
                  ) : (
                    <Image src="/vidwan-logo-simple.svg" alt="V" width={28} height={28} className="object-contain" />
                  )}
                </div>
                <div className={`p-5 md:p-6 rounded-[1.5rem] text-sm md:text-lg leading-relaxed shadow-xl ${
                  m.role === "user" 
                    ? "bg-primary/10 text-white rounded-tr-none border border-primary/20" 
                    : "bg-white/5 text-slate-100 rounded-tl-none border border-white/10 backdrop-blur-md"
                }`}>
                  {m.content}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <div className="flex gap-5 justify-start">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center animate-pulse">
               <Loader2 size={18} className="animate-spin text-slate-500" />
            </div>
            <div className="flex flex-col gap-2">
               <div className="h-6 w-48 bg-white/5 rounded-xl animate-pulse" />
               <div className="h-6 w-32 bg-white/5 rounded-xl animate-pulse opacity-50" />
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-8 md:p-12 border-t border-white/5 bg-slate-950/50">
        <div className="relative max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Kuch puchiye Vidwan se..."
            className="w-full bg-slate-900/80 border border-white/10 rounded-2xl px-8 py-5 text-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all pr-20 shadow-inner"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-primary hover:bg-orange-500 disabled:opacity-30 disabled:grayscale text-white p-3.5 rounded-xl transition-all shadow-lg shadow-primary/20"
          >
            <Send className="w-6 h-6" />
          </button>
        </div>
        <div className="mt-6 flex justify-center gap-8">
           <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-primary" />
              <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Scholarly Logic</span>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Verified Knowledge</span>
           </div>
        </div>
      </div>
    </div>
  );
}
