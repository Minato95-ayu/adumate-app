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
}

// Simple Markdown-like formatter for code blocks and bold text
const formatMessage = (text: string) => {
  if (!text) return "";
  
  // Replace code blocks
  const parts = text.split(/(```[\s\S]*?```)/g);
  
  return parts.map((part, index) => {
    if (part.startsWith("```")) {
      const code = part.replace(/```[a-z]*\n?|```/g, "").trim();
      const lang = part.match(/```([a-z]*)/)?.[1] || "code";
      return (
        <div key={index} className="my-4 relative">
          <div className="absolute right-4 top-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">{lang}</div>
          <pre className="bg-black/40 p-5 rounded-2xl overflow-x-auto text-sm font-mono text-green-400 border border-white/5 shadow-inner">
            <code>{code}</code>
          </pre>
        </div>
      );
    }
    
    // Simple bold text replacement
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
      content: "Namaste! Main Vidwan AI hoon. Aap ab mujhe **Images** ya **PDFs** bhej kar bhi sawaal puch sakte hain. Kaise madad karun?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{data: string, type: string, name: string} | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedFile({
        data: reader.result as string,
        type: file.type,
        name: file.name
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async () => {
    if ((!input.trim() && !selectedFile) || isLoading) return;

    const userMessage: Message = { 
      role: "user", 
      content: input,
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
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ 
          prompt: currentInput || "Analyze this file.",
          fileData: currentFile?.data,
          fileType: currentFile?.type
        }),
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

  return (
    <div className="flex flex-col fixed inset-0 z-[100] bg-[#0a0f1a] overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-white/5 bg-slate-950/80 backdrop-blur-2xl z-20">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full"></div>
            <div className="w-12 h-12 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center p-2 relative z-10">
               <Image src="/vidwan-logo-simple.svg" alt="Vidwan" width={32} height={32} className="object-contain" />
            </div>
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">Vidwan AI</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
               <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
               <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Vision Protocol Active</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button onClick={clearChat} className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-400 hover:text-white transition-all"><Trash2 className="w-5 h-5" /></button>
          <button onClick={() => window.history.back()} className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-400 hover:text-white transition-all"><X className="w-5 h-5" /></button>
        </div>
      </div>

      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 md:px-24 py-10 md:py-20 space-y-12 custom-scrollbar bg-gradient-to-b from-transparent to-primary/5">
        <div className="max-w-5xl mx-auto space-y-12">
          <AnimatePresence initial={false}>
            {messages.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`flex gap-6 max-w-[90%] md:max-w-[80%] ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center shrink-0 mt-1 shadow-2xl ${m.role === "user" ? "bg-gradient-to-br from-primary to-orange-600" : "bg-slate-800 border border-white/10 p-2"}`}>
                    {m.role === "user" ? <User size={24} className="text-white" /> : <Image src="/vidwan-logo-simple.svg" alt="V" width={32} height={32} className="object-contain" />}
                  </div>
                  <div className={`p-6 md:p-8 rounded-[2rem] text-base md:text-xl leading-relaxed shadow-2xl ${m.role === "user" ? "bg-primary/10 text-white rounded-tr-none border border-primary/20" : "bg-white/5 text-slate-100 rounded-tl-none border border-white/10 backdrop-blur-3xl"}`}>
                    {m.filePreview && (
                      <div className="mb-4 relative w-full aspect-video rounded-xl overflow-hidden border border-white/10">
                        <Image src={m.filePreview} alt="Attached" fill className="object-cover" />
                      </div>
                    )}
                    {m.fileType && !m.filePreview && (
                      <div className="mb-4 p-4 bg-white/5 rounded-xl border border-white/10 flex items-center gap-3">
                         <FileText className="text-primary" />
                         <span className="text-sm font-bold text-slate-300">Document Attached</span>
                      </div>
                    )}
                    <div className="whitespace-pre-wrap">{m.role === "assistant" ? formatMessage(m.content) : m.content}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <div className="flex gap-6 justify-start">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-slate-800 border border-white/10 flex items-center justify-center animate-pulse"><Loader2 size={24} className="animate-spin text-slate-500" /></div>
              <div className="flex flex-col gap-3"><div className="h-8 w-64 bg-white/5 rounded-2xl animate-pulse" /><div className="h-8 w-40 bg-white/5 rounded-2xl animate-pulse opacity-50" /></div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="px-6 md:px-24 pb-10 md:pb-16 pt-5 bg-gradient-to-t from-[#0a0f1a] to-transparent">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* File Preview Chip */}
          <AnimatePresence>
            {selectedFile && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="flex items-center gap-3 p-3 bg-primary/10 border border-primary/30 rounded-2xl max-w-xs relative group">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center overflow-hidden">
                  {selectedFile.type.startsWith("image/") ? (
                    <img src={selectedFile.data} className="w-full h-full object-cover" />
                  ) : (
                    <FileText className="text-primary" />
                  )}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-xs font-bold text-white truncate">{selectedFile.name}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">{selectedFile.type.split("/")[1]}</p>
                </div>
                <button onClick={() => setSelectedFile(null)} className="p-1 hover:bg-red-500/20 text-slate-500 hover:text-red-400 rounded-lg transition-all"><X size={16} /></button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative group flex gap-4">
            <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*,application/pdf" />
            <button onClick={() => fileInputRef.current?.click()} className="bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-primary p-6 md:p-8 rounded-[2rem] transition-all shadow-xl"><Paperclip className="w-8 h-8" /></button>
            
            <div className="flex-1 relative">
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} placeholder="Kuch puchiye ya File bhejeye..." className="w-full bg-slate-900/90 border border-white/10 rounded-[2rem] px-10 py-6 md:py-8 text-xl md:text-2xl text-white focus:outline-none focus:border-primary/50 transition-all pr-24 shadow-2xl backdrop-blur-xl" />
              <button onClick={handleSend} disabled={isLoading || (!input.trim() && !selectedFile)} className="absolute right-4 top-1/2 -translate-y-1/2 bg-primary hover:bg-orange-500 disabled:opacity-30 disabled:grayscale text-white p-4 md:p-5 rounded-2xl transition-all shadow-xl shadow-primary/20"><Send className="w-8 h-8" /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
