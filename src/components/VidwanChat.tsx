"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, User, Sparkles, Trash2, Loader2, Bot, Plus, X, Paperclip, FileText, ImageIcon, Menu, Search, Clock, MessageSquare, ChevronLeft } from "lucide-react";
import Image from "next/image";
import UserAvatar from "./UserAvatar";
import BrandIcon from "./BrandIcon";

interface Message {
  role: "user" | "assistant";
  content: string;
  filePreview?: string;
  fileType?: string;
  provider?: string;
}

const formatMessage = (text: string) => {
  if (!text) return "";
  
  // Split by code blocks first to preserve them
  const parts = text.split(/(```[\s\S]*?```)/g);
  
  return parts.map((part, index) => {
    if (part.startsWith("```")) {
      const code = part.replace(/```[a-z]*\n?|```/g, "").trim();
      const lang = part.match(/```([a-z]*)/)?.[1] || "code";
      return (
        <div key={index} className="my-6 relative group">
          <div className="absolute right-4 top-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">{lang}</div>
          <pre className="bg-[#050505] p-5 rounded-2xl overflow-x-auto text-sm font-mono text-blue-400 border border-white/5 shadow-inner">
            <code>{code}</code>
          </pre>
        </div>
      );
    }

    // Process non-code text
    const lines = part.split("\n");
    return (
      <div key={index} className="space-y-3">
        {lines.map((line, lineIdx) => {
          // Horizontal Rule
          if (line.trim() === "---") {
            return <hr key={lineIdx} className="my-6 border-white/10" />;
          }

          // Bullet points
          if (line.trim().startsWith("- ") || line.trim().startsWith("• ")) {
            return (
              <div key={lineIdx} className="flex gap-3 pl-4 text-slate-300">
                <span className="text-primary">•</span>
                <span>{processLine(line.trim().substring(2))}</span>
              </div>
            );
          }

          // Numbered lists
          if (/^\d+\.\s/.test(line.trim())) {
            return (
              <div key={lineIdx} className="flex gap-3 pl-4 text-slate-300">
                <span className="text-primary font-bold">{line.trim().match(/^\d+\./)?.[0]}</span>
                <span>{processLine(line.trim().replace(/^\d+\.\s/, ""))}</span>
              </div>
            );
          }

          // Regular paragraph
          return (
            <p key={lineIdx} className="text-slate-300 leading-relaxed">
              {processLine(line)}
            </p>
          );
        })}
      </div>
    );
  });
};

// Helper to handle bold text and links within a line
const processLine = (line: string) => {
  // First handle Markdown links: [text](url)
  const linkParts = line.split(/(\[.*?\]\(.*?\))/g);
  
  return linkParts.map((part, i) => {
    if (part.startsWith("[") && part.includes("](")) {
      const text = part.match(/\[(.*?)\]/)?.[1] || "";
      const url = part.match(/\((.*?)\)/)?.[1] || "#";
      return (
        <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold">
          {text}
        </a>
      );
    }
    
    // Then handle bold text within the remaining parts
    const boldParts = part.split(/(\*\*.*?\*\*)/g);
    return boldParts.map((bp, j) => {
      if (bp.startsWith("**") && bp.endsWith("**")) {
        return <strong key={j} className="text-white font-black">{bp.slice(2, -2)}</strong>;
      }
      return bp;
    });
  });
};

export default function VidwanChat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Namaste! Main Vidwan AI hoon. Aaj hum kis topic par multitasking karein?" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{data: string, type: string, name: string} | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
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
  const handleSend = async () => {
    if ((!input.trim() && !selectedFile) || isLoading) return;
    
    const userMessage: Message = { 
      role: "user", 
      content: input,
      filePreview: selectedFile?.type.startsWith("image/") ? selectedFile.data : undefined,
      fileType: selectedFile?.type
    };

    // Store current state for API call
    const currentHistory = [...messages];
    const currentInput = input;
    const currentFile = selectedFile;

    // Update UI immediately
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSelectedFile(null);
    setIsLoading(true);

    try {
      const { auth } = await import("@/lib/firebase");
      const token = await auth.currentUser?.getIdToken();
      
      const response = await fetch("/api/vidwan", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { "Authorization": `Bearer ${token}` } : {}) },
        body: JSON.stringify({ 
          prompt: currentInput || "Analyze this file.", 
          fileData: currentFile?.data, 
          fileType: currentFile?.type,
          history: currentHistory // Pass history for session memory
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);
      
      setMessages((prev) => [...prev, { 
        role: "assistant", 
        content: data.text, 
        provider: data.provider 
      }]);
    } catch (error: any) {
      setMessages((prev) => [...prev, { 
        role: "assistant", 
        content: `Connection Error: ${error.message || "Something went wrong."}` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#0a0f1a] overflow-hidden">
      {/* Sidebar */}
      <motion.div 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 0, opacity: isSidebarOpen ? 1 : 0 }}
        className="h-full bg-slate-950 border-r border-white/5 flex flex-col overflow-hidden hidden md:flex shrink-0"
      >
        <div className="p-4 flex flex-col h-full">
           <button onClick={() => setMessages([{role: "assistant", content: "Naya session start ho gaya hai."}])} className="flex items-center gap-3 w-full p-3 rounded-xl border border-white/10 hover:bg-white/5 text-white transition-all mb-8">
              <Plus size={18} />
              <span className="text-sm font-bold">New chat</span>
           </button>
           <div className="flex-1 overflow-y-auto space-y-6 custom-scrollbar">
              <div>
                 <p className="px-3 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Recents</p>
                 <div className="space-y-1">
                    {["Academic Help", "Python Project", "Hostel Query"].map((chat, i) => (
                      <button key={i} className="flex items-center gap-3 w-full p-2.5 px-3 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white text-sm transition-all text-left truncate">
                        <MessageSquare size={14} />
                        <span className="truncate">{chat}</span>
                      </button>
                    ))}
                 </div>
              </div>
           </div>
           <div className="mt-auto pt-4 border-t border-white/5">
              <div className="p-3 rounded-xl bg-white/5 text-slate-400 flex items-center gap-3">
                 <UserAvatar name="Ayush Kaushik" size="sm" />
                 <span className="text-xs font-bold truncate">Ayush Kaushik</span>
              </div>
           </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative h-full">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-slate-900/20 backdrop-blur-3xl z-20">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-white/5 rounded-lg text-slate-400 md:block hidden"><Menu size={20} /></button>
            <div className="flex items-center gap-2">
               <h2 className="text-lg font-bold text-white tracking-tight">Vidwan AI</h2>
               <div className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-tighter">Unified</div>
            </div>
          </div>
          <button onClick={() => window.history.back()} className="p-2 hover:bg-white/5 rounded-lg text-slate-500"><X size={20} /></button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 md:px-0 py-10 md:py-16 custom-scrollbar scroll-smooth">
          <div className="max-w-3xl mx-auto space-y-8">
            <AnimatePresence initial={false}>
              {messages.map((m, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`flex gap-4 w-full ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    <div className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center shrink-0 mt-2`}>
                    {m.role === "user" ? <UserAvatar name="Ayush Kaushik" /> : <BrandIcon text="V" size={48} />}
                  </div>
                    <div className="flex-1">
                      {m.filePreview && (
                        <div className="mb-4 relative w-64 aspect-video rounded-xl overflow-hidden border border-white/10 shadow-xl">
                          <Image src={m.filePreview} alt="Attached" fill className="object-cover" />
                        </div>
                      )}
                      <div className={`text-base md:text-lg leading-relaxed ${m.role === "user" ? "text-slate-300 text-right bg-white/5 p-4 rounded-2xl rounded-tr-none inline-block ml-auto float-right shadow-xl" : "text-slate-200"}`}>
                        {m.role === "assistant" ? formatMessage(m.content) : m.content}
                      </div>
                      <div className="clear-both"></div>
                      {m.provider && <div className="text-[9px] text-slate-600 font-bold uppercase tracking-[0.2em] mt-2 italic">Brain: {m.provider}</div>}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {isLoading && (
              <div className="flex gap-4 justify-start animate-pulse">
                <div className="w-8 h-8 rounded-lg bg-slate-900 border border-white/10 flex items-center justify-center"><Loader2 size={16} className="animate-spin text-slate-700" /></div>
                <div className="space-y-2 flex-1"><div className="h-4 w-1/2 bg-white/5 rounded-full" /><div className="h-4 w-1/3 bg-white/5 rounded-full opacity-50" /></div>
              </div>
            )}
          </div>
        </div>

        {/* Input */}
        <div className="px-6 md:px-0 pb-8 pt-4">
          <div className="max-w-3xl mx-auto">
            {selectedFile && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 inline-flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl shadow-xl">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center overflow-hidden">
                  {selectedFile.type.startsWith("image/") ? <img src={selectedFile.data} className="w-full h-full object-cover" /> : <FileText size={14} className="text-primary" />}
                </div>
                <span className="text-[10px] font-bold text-white truncate max-w-[150px]">{selectedFile.name}</span>
                <button onClick={() => setSelectedFile(null)} className="p-1 hover:bg-red-500/20 text-red-400 rounded-lg"><X size={14} /></button>
              </motion.div>
            )}
            <div className="relative bg-slate-900/50 border border-white/10 rounded-2xl p-2 flex items-center gap-2 shadow-2xl focus-within:border-primary/30 transition-all backdrop-blur-xl">
              <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*,application/pdf" />
              <button onClick={() => fileInputRef.current?.click()} className="p-3 hover:bg-white/5 text-slate-500 hover:text-white rounded-xl transition-all shrink-0"><Paperclip size={20} /></button>
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} placeholder="Ask anything..." className="flex-1 bg-transparent border-none px-2 py-3 text-base md:text-lg text-white focus:outline-none placeholder:text-slate-600" />
              <button onClick={handleSend} disabled={isLoading || (!input.trim() && !selectedFile)} className="bg-white text-black hover:bg-slate-200 disabled:opacity-20 p-2.5 rounded-xl transition-all shrink-0 shadow-lg shadow-white/5"><Send size={20} /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
