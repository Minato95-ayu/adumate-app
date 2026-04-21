"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, User, Sparkles, Brain, Search, Info, Loader2, Bot, Trash2 } from "lucide-react";
import Image from "next/image";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function VidwanChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Namaste! I am Vidwan AI, your scholarly companion on Adumate. How can I help you learn something new today?",
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
      const response = await fetch("/api/vidwan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setMessages((prev) => [...prev, data]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "I apologize, but I encountered an error. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        content: "Chat cleared. I am ready for your next question!",
      },
    ]);
  };

  return (
    <div className="flex flex-col h-[80vh] w-full max-w-4xl mx-auto bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-orange-500 blur-md opacity-30 animate-pulse rounded-full"></div>
            <Image
              src="/vidwan-logo.png"
              alt="Vidwan AI"
              width={40}
              height={40}
              className="rounded-full border border-white/20 relative z-10"
            />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Vidwan AI <Sparkles className="w-4 h-4 text-orange-400" />
            </h2>
            <p className="text-xs text-slate-400">The Scholarly Mind of Adumate</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={clearChat}
            className="p-2 hover:bg-white/10 rounded-full text-slate-400 transition-colors"
            title="Clear Chat"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-medium text-green-400 uppercase tracking-wider">Online</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar"
      >
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] flex gap-3 ${
                  m.role === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  m.role === "user" ? "bg-orange-500" : "bg-slate-700"
                }`}>
                  {m.role === "user" ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-orange-400" />}
                </div>
                <div
                  className={`p-4 rounded-2xl ${
                    m.role === "user"
                      ? "bg-orange-600 text-white rounded-tr-none"
                      : "bg-white/10 text-slate-100 rounded-tl-none border border-white/5"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="flex gap-3 items-center bg-white/5 p-4 rounded-2xl rounded-tl-none border border-white/5">
              <Loader2 className="w-5 h-5 text-orange-400 animate-spin" />
              <span className="text-sm text-slate-400">Vidwan is thinking...</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="p-6 border-t border-white/10 bg-white/5">
        <div className="relative flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask Vidwan something scholarly..."
            className="flex-1 bg-slate-900 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all pr-12"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 p-3 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 disabled:hover:bg-orange-600 text-white rounded-xl transition-all shadow-lg shadow-orange-900/20"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <div className="flex gap-4 mt-4 px-2">
          <button className="flex items-center gap-2 text-[10px] text-slate-500 hover:text-orange-400 transition-colors uppercase tracking-widest font-bold">
            <Search className="w-3 h-3" /> Search Web
          </button>
          <button className="flex items-center gap-2 text-[10px] text-slate-500 hover:text-orange-400 transition-colors uppercase tracking-widest font-bold">
            <Brain className="w-3 h-3" /> Study Mode
          </button>
          <button className="flex items-center gap-2 text-[10px] text-slate-500 hover:text-orange-400 transition-colors uppercase tracking-widest font-bold">
            <Info className="w-3 h-3" /> App Help
          </button>
        </div>
      </div>
    </div>
  );
}
