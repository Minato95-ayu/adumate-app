"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, User, Sparkles, Trash2, Loader2, Bot, Plus } from "lucide-react";
import Image from "next/image";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function VidwanChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Namaste! I am Vidwan AI. How can I help you learn something new today?",
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
        { role: "assistant", content: "I encountered an error. Please try again later." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        content: "Memory cleared. How can I help you now?",
      },
    ]);
  };

  return (
    <div className="flex flex-col h-[80vh] w-full max-w-4xl mx-auto bg-[#0F172A] border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative">
      
      {/* Clean Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-slate-900/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center p-2">
            <Image
              src="/vidwan-logo-simple.svg"
              alt="Vidwan"
              width={32}
              height={32}
            />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Vidwan AI</h2>
        </div>
        <button 
          onClick={clearChat}
          className="p-2 hover:bg-white/5 rounded-xl text-slate-500 hover:text-white transition-all"
          title="Clear Chat"
        >
          <Plus className="w-5 h-5 rotate-45" />
        </button>
      </div>

      {/* Minimal Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 custom-scrollbar"
      >
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`flex gap-4 max-w-[85%] ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                  m.role === "user" ? "bg-primary/20" : "bg-slate-800"
                }`}>
                  {m.role === "user" ? <User size={16} className="text-primary" /> : <Bot size={16} className="text-slate-400" />}
                </div>
                <div className={`p-4 md:p-5 rounded-2xl text-sm md:text-base leading-relaxed ${
                  m.role === "user" 
                    ? "bg-primary/10 text-white rounded-tr-none border border-primary/20" 
                    : "bg-white/5 text-slate-200 rounded-tl-none border border-white/5"
                }`}>
                  {m.content}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <div className="flex gap-4 justify-start animate-pulse">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
              <Loader2 size={14} className="animate-spin text-slate-500" />
            </div>
            <div className="h-12 w-32 bg-white/5 rounded-2xl rounded-tl-none border border-white/5" />
          </div>
        )}
      </div>

      {/* Minimal Input */}
      <div className="p-6 md:p-8">
        <div className="relative max-w-3xl mx-auto group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask Vidwan..."
            className="w-full bg-slate-800/50 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all pr-14"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-3 text-slate-400 hover:text-primary disabled:opacity-30 transition-all"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-center text-[10px] text-slate-600 mt-4 uppercase tracking-[0.2em] font-medium">
          Powered by Adumate AI
        </p>
      </div>
    </div>
  );
}
