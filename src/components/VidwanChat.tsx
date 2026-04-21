"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, User, Sparkles, Trash2, Loader2, Bot, Plus, X, Paperclip, FileText, ImageIcon } from "lucide-react";
import Image from "next/image";

interface Message {
  role: "user" | "assistant";
  content: string;
  filePreview?: string;
  fileType?: string;
  provider?: string;
}

const formatMessage = (text: string) => {
  if (!text) return "";
  const parts = text.split(/(```[\s\S]*?```)/g);
  return parts.map((part, index) => {
    if (part.startsWith("```")) {
      const code = part.replace(/```[a-z]*\n?|```/g, "").trim();
      const lang = part.match(/```([a-z]*)/)?.[1] || "code";
      return (
        <div key={index} className="my-6 relative group">
          <div className="absolute right-4 top-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">{lang}</div>
          <pre className="bg-[#050505] p-6 md:p-8 rounded-3xl overflow-x-auto text-sm md:text-base font-mono text-blue-400 border border-white/5 shadow-2xl">
            <code>{code}</code>
          </pre>
        </div>
      );
    }
    const boldParts = part.split(/(\*\*.*?\*\*)/g);
    return (
      <span key={index}>
        {boldParts.map((bp, i) => {
          if (bp.startsWith("**") && bp.endsWith("**")) {
            return <strong key={i} className="text-white font-black">{bp.slice(2, -2)}</strong>;
          }
          return bp;
        })}
      </span>
    );
  });
};

export default function VidwanChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Namaste! Main Vidwan AI hoon. Aaj hum kis topic par multitasking karein?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{data: string, type: string, name: string} | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setSelectedFile({ data: reader.result as string, type: file.type, name: file.name });
    reader.readAsDataURL(file);
  };

  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        content: "Naya session start ho gaya hai. Aaj kya multitasking karein?",
      },
    ]);
  };

  const handleSend = async () => {
    if ((!input.trim() && !selectedFile) || isLoading) return;
    const userMessage: Message = { 
      role: "user", content: input,
      filePreview: selectedFile?.type.startsWith("image/") ? selectedFile.data : undefined,
      fileType: selectedFile?.type
    };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    const currentFile = selectedFile;
    setInput("");
    setSelectedFile(null);
    setIsLoading(true);

    try {
      const { auth } = await import("@/lib/firebase");
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch("/api/vidwan", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { "Authorization": `Bearer ${token}` } : {}) },
        body: JSON.stringify({ prompt: currentInput || "Analyze this file.", fileData: currentFile?.data, fileType: currentFile?.type }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setMessages((prev) => [...prev, { role: "assistant", content: data.text, provider: data.provider }]);
    } catch (error: any) {
      setMessages((prev) => [...prev, { role: "assistant", content: "Main abhi connect nahi ho pa raha hoon." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#0a0f1a] overflow-hidden relative">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-30">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[150px] rounded-full" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-6 md:px-16 py-6 border-b border-white/5 bg-slate-950/80 backdrop-blur-3xl z-20">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center p-2 shadow-2xl">
            <Image src="/vidwan-logo-simple.svg" alt="Vidwan" width={32} height={32} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">Vidwan AI</h2>
            <div className="flex items-center gap-2 mt-0.5">
               <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]"></div>
               <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Ultra-Premium Protocol</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setMessages([{ role: "assistant", content: "Naya session start ho gaya hai." }])} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 hover:text-white transition-all"><Trash2 size={22} /></button>
          <button onClick={() => window.history.back()} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 hover:text-white transition-all"><X size={22} /></button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 md:px-32 py-12 md:py-24 custom-scrollbar z-10">
        <div className="max-w-4xl mx-auto space-y-16">
          <AnimatePresence initial={false}>
            {messages.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, type: "spring" }} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`flex gap-8 w-full ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 mt-2 shadow-2xl ${m.role === "user" ? "bg-primary/20 border border-primary/40" : "bg-slate-900 border border-white/10 p-2"}`}>
                    {m.role === "user" ? <User size={24} className="text-primary" /> : <Image src="/vidwan-logo-simple.svg" alt="V" width={32} height={32} />}
                  </div>
                  <div className="flex-1 space-y-4">
                    {m.filePreview && (
                      <div className="relative w-full max-w-lg aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                        <Image src={m.filePreview} alt="Attached" fill className="object-cover" />
                      </div>
                    )}
                    <div className={`text-lg md:text-2xl leading-relaxed font-medium ${m.role === "user" ? "text-slate-100 text-right" : "text-slate-100"}`}>
                      {m.role === "assistant" ? formatMessage(m.content) : m.content}
                    </div>
                    {m.provider && (
                      <div className="text-[10px] text-primary/40 font-black uppercase tracking-[0.3em]">
                        Intelligence: {m.provider}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <div className="flex gap-8 justify-start animate-pulse">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center"><Loader2 size={24} className="animate-spin text-slate-700" /></div>
              <div className="space-y-3"><div className="h-6 w-72 bg-white/5 rounded-full" /><div className="h-6 w-48 bg-white/5 rounded-full opacity-50" /></div>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Bottom Input Bar (Clean GPT Style) */}
      <div className="px-6 md:px-32 pb-12 pt-6 bg-gradient-to-t from-[#0a0f1a] to-transparent z-20">
        <div className="max-w-4xl mx-auto">
          {selectedFile && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 inline-flex items-center gap-4 p-4 bg-primary/10 border border-primary/20 rounded-3xl shadow-2xl">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center overflow-hidden">
                {selectedFile.type.startsWith("image/") ? <img src={selectedFile.data} className="w-full h-full object-cover" /> : <FileText className="text-primary" />}
              </div>
              <span className="text-sm font-bold text-white truncate max-w-[200px]">{selectedFile.name}</span>
              <button onClick={() => setSelectedFile(null)} className="p-2 hover:bg-red-500/20 text-red-400 rounded-xl transition-all"><X size={18} /></button>
            </motion.div>
          )}

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-blue-500/20 to-primary/20 rounded-[2.5rem] blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-1000"></div>
            <div className="relative flex items-center gap-4 bg-slate-900/50 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-3 shadow-2xl pr-6">
              <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*,application/pdf" />
              <button onClick={() => fileInputRef.current?.click()} className="p-5 hover:bg-white/5 text-slate-500 hover:text-primary rounded-full transition-all shrink-0"><Paperclip size={28} /></button>
              
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} placeholder="Ask Vidwan something..." className="flex-1 bg-transparent border-none px-4 py-5 text-xl md:text-2xl text-white focus:outline-none placeholder:text-slate-600" />
              
              <button onClick={handleSend} disabled={isLoading || (!input.trim() && !selectedFile)} className="bg-primary hover:bg-orange-500 disabled:opacity-30 text-white p-5 rounded-3xl transition-all shadow-xl shadow-primary/20 shrink-0">
                <Send size={28} />
              </button>
            </div>
          </div>
          <p className="text-center text-[10px] text-slate-700 mt-6 font-black uppercase tracking-[0.4em]">Adumate Global Intelligence</p>
        </div>
      </div>
    </div>
  );
}
