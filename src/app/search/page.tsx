"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, PlayCircle, MessageCircle, FileText, BookOpen, Zap, Share2, ChevronRight, ExternalLink, Globe, Loader2 } from "lucide-react";
import Link from "next/link";

const TELEGRAM_CHANNELS: Record<string, { name: string; handle: string; desc: string }[]> = {
  default: [
    { name: "Study IQ Education", handle: "studyiqeducation", desc: "Best notes for competitive exams" },
    { name: "PW Wallah", handle: "PhysicsWallah", desc: "Free IIT JEE & NEET prep" },
    { name: "NCERT Solutions", handle: "ncert_solutions_free", desc: "All class NCERT solutions" },
    { name: "Unacademy Free", handle: "unacademyfreelearning", desc: "Free video lectures" },
  ],
  physics: [
    { name: "Physics Wallah", handle: "PhysicsWallah", desc: "JEE/NEET Physics master" },
    { name: "Physics Notes", handle: "physicsnotes_free", desc: "Formula sheets & notes" },
  ],
  maths: [
    { name: "Vedantu Maths", handle: "vedantumaths", desc: "Class 6-12 Maths solutions" },
    { name: "PW Maths JEE", handle: "pwarjunmaths", desc: "JEE Maths by Arjun sir" },
  ],
  chemistry: [
    { name: "PW Chemistry", handle: "PhysicsWallah", desc: "JEE/NEET Chemistry" },
    { name: "Unacademy Chemistry", handle: "unacademy_chemistry", desc: "IIT JEE Chem notes" },
  ],
  coding: [
    { name: "CodeWithHarry", handle: "CodeWithHarryOfficial", desc: "Python, Web Dev in Hindi" },
    { name: "Programming Notes", handle: "programmingnotesbypw", desc: "DSA & Dev free notes" },
  ],
};

function getChannels(query: string) {
  const q = query.toLowerCase();
  if (q.includes("physic")) return TELEGRAM_CHANNELS.physics;
  if (q.includes("math") || q.includes("maths") || q.includes("algebra")) return TELEGRAM_CHANNELS.maths;
  if (q.includes("chem")) return TELEGRAM_CHANNELS.chemistry;
  if (q.includes("code") || q.includes("python") || q.includes("react") || q.includes("javascript") || q.includes("programming")) return TELEGRAM_CHANNELS.coding;
  return TELEGRAM_CHANNELS.default;
}

import { multiCallAI } from "@/lib/ai-service";

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";
  const [newQuery, setNewQuery] = useState(query);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSugg, setShowSugg] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "video" | "telegram" | "notes">("all");
  const [aiSummary, setAiSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);

  const channels = getChannels(query);

  // Suggestions
  useEffect(() => {
    if (newQuery.length < 2) { setSuggestions([]); return; }
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/suggestions?q=${encodeURIComponent(newQuery)}`);
        const d = await r.json();
        setSuggestions(d.suggestions || []);
        setShowSugg(true);
      } catch { setSuggestions([]); }
    }, 250);
    return () => clearTimeout(t);
  }, [newQuery]);

  const goSearch = (q: string) => {
    setShowSugg(false);
    setSuggestions([]);
    if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  useEffect(() => {
    if (!query) return;
    setAiSummary("");
    setSummaryLoading(true);

    const prompt = `In 3 sentences, explain what "${query}" is in simple Hindi-English mixed language for a student. Be direct, educational, and friendly. No markdown.`;

    (async () => {
      try {
        const res = await multiCallAI(prompt);
        if (res.text) setAiSummary(res.text);
      } catch (err: any) {
        console.error("Search Summary Error:", err);
      } finally {
        setSummaryLoading(false);
      }
    })();
  }, [query]);

  const ytSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query + " explained in hindi")}`;
  const ytEmbedUrl = `https://www.youtube-nocookie.com/embed?listType=search&list=${encodeURIComponent(query)}`;
  const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(query + " notes pdf site:drive.google.com OR site:slideshare.net")}`;

  const TABS = [
    { id: "all" as const, label: "All", icon: <Globe size={14} /> },
    { id: "video" as const, label: "Videos", icon: <PlayCircle size={14} /> },
    { id: "telegram" as const, label: "Telegram", icon: <MessageCircle size={14} /> },
    { id: "notes" as const, label: "Notes & PDFs", icon: <FileText size={14} /> },
  ];

  const shareText = `🎯 "${query}" ka best study material Adumate pe mil gaya!\n🔗 https://adumate.app/search?q=${encodeURIComponent(query)}\n\nTum bhi try karo! 📚`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Search Bar at top */}
      <div className="flex gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={20} />
          <input
            value={newQuery}
            onChange={e => { setNewQuery(e.target.value); }}
            onKeyDown={e => e.key === "Enter" && goSearch(newQuery)}
            onFocus={() => suggestions.length > 0 && setShowSugg(true)}
            onBlur={() => setTimeout(() => setShowSugg(false), 150)}
            className="w-full bg-card/80 border border-white/10 text-white rounded-2xl pl-12 pr-4 py-4 text-sm focus:ring-2 focus:ring-primary outline-none"
            placeholder="Search: Newton's Laws, JEE Maths, Python..."
            autoComplete="off"
          />
          {/* Suggestions dropdown */}
          <AnimatePresence>
            {showSugg && suggestions.length > 0 && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                className="absolute top-full left-0 right-0 mt-2 bg-card border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50">
                {suggestions.map((s, i) => (
                  <button key={i} onMouseDown={() => goSearch(s)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-left transition-all border-b border-white/5 last:border-0">
                    <Search size={14} className="text-muted-foreground shrink-0" />
                    <span className="text-sm text-white">{s}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button
          onClick={() => goSearch(newQuery)}
          className="bg-primary hover:bg-primary-hover text-white font-black px-6 rounded-2xl transition-all shadow-lg shadow-primary/20"
        >
          Go
        </button>
      </div>

      {/* Heading */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-white">Results for <span className="text-primary">"{query}"</span></h1>
          <p className="text-muted-foreground text-sm mt-1">Videos • Telegram • Notes • AI Summary</p>
        </div>
        <div className="flex gap-2">
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-green-500/20">
            <Share2 size={14} /> WhatsApp Share
          </a>
          <button
            onClick={() => router.push(`/test?topic=${encodeURIComponent(query)}`)}
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-primary/20">
            <Zap size={14} /> Quick Test
          </button>
        </div>
      </div>

      {/* AI Summary */}
      <div className="mb-6 p-5 bg-gradient-to-r from-primary/10 to-purple-500/5 border border-primary/20 rounded-2xl">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-black text-primary uppercase tracking-widest">🤖 AI Summary</span>
        </div>
        {summaryLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Loader2 size={14} className="animate-spin" /> Generating summary...
          </div>
        ) : aiSummary ? (
          <p className="text-slate-200 text-sm leading-relaxed">{aiSummary}</p>
        ) : (
          <p className="text-muted-foreground text-sm">AI summary unavailable (API quota).</p>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap font-bold text-sm border transition-all ${
              activeTab === tab.id ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10"
            }`}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {/* VIDEO SECTION */}
        {(activeTab === "all" || activeTab === "video") && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-lg font-black text-white mb-3 flex items-center gap-2"><PlayCircle className="text-red-500" size={20} /> Video Results</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { title: `${query} — Full Explanation (Hindi)`, channel: "Physics Wallah", type: "One Shot", duration: "~45 min", url: ytSearchUrl },
                { title: `${query} — Quick Revision`, channel: "Unacademy", type: "Short", duration: "~10 min", url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query + " short revision")}` },
                { title: `${query} — NCERT Solutions`, channel: "Vedantu", type: "NCERT", duration: "~30 min", url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query + " NCERT solution")}` },
                { title: `${query} — Previous Year Questions`, channel: "Khan Sir", type: "PYQ", duration: "~20 min", url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query + " previous year questions")}` },
              ].map((v, i) => (
                <a key={i} href={v.url} target="_blank" rel="noopener noreferrer"
                  className="group p-5 bg-card/60 border border-white/10 rounded-2xl hover:border-red-500/40 transition-all flex gap-4 items-start">
                  <div className="w-12 h-12 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center justify-center shrink-0">
                    <PlayCircle size={22} className="text-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-white group-hover:text-red-400 transition-colors leading-tight">{v.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{v.channel} • {v.duration}</p>
                    <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full">{v.type}</span>
                  </div>
                  <ExternalLink size={14} className="text-muted-foreground group-hover:text-red-400 transition-colors shrink-0 mt-1" />
                </a>
              ))}
            </div>
          </motion.div>
        )}

        {/* TELEGRAM SECTION */}
        {(activeTab === "all" || activeTab === "telegram") && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-lg font-black text-white mb-3 flex items-center gap-2"><MessageCircle className="text-blue-400" size={20} /> Telegram Channels</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {channels.map((ch, i) => (
                <a key={i} href={`https://t.me/${ch.handle}`} target="_blank" rel="noopener noreferrer"
                  className="group p-5 bg-card/60 border border-white/10 rounded-2xl hover:border-blue-500/40 transition-all flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500/20 border border-blue-500/30 rounded-xl flex items-center justify-center text-xl shrink-0">
                    📱
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-white group-hover:text-blue-400 transition-colors">{ch.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">@{ch.handle}</p>
                    <p className="text-xs text-slate-400 mt-1">{ch.desc}</p>
                  </div>
                  <ChevronRight size={18} className="text-muted-foreground group-hover:text-blue-400 transition-colors shrink-0" />
                </a>
              ))}
              <a href={`https://t.me/s/search?q=${encodeURIComponent(query)}`} target="_blank" rel="noopener noreferrer"
                className="group p-5 bg-blue-500/5 border border-blue-500/20 rounded-2xl hover:border-blue-500/50 transition-all flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-xl">🔍</div>
                <div>
                  <p className="font-bold text-sm text-blue-400">Search more on Telegram</p>
                  <p className="text-xs text-muted-foreground mt-1">"{query}" ke sab channels</p>
                </div>
                <ExternalLink size={14} className="ml-auto text-blue-400 shrink-0" />
              </a>
            </div>
          </motion.div>
        )}

        {/* NOTES SECTION */}
        {(activeTab === "all" || activeTab === "notes") && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-lg font-black text-white mb-3 flex items-center gap-2"><FileText className="text-green-400" size={20} /> Notes & PDFs</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { title: `${query} — PDF Notes`, src: "Google Drive", url: googleUrl, icon: "📄" },
                { title: `${query} — Handwritten Notes`, src: "Studocu", url: `https://www.studocu.com/search/en#q=${encodeURIComponent(query)}`, icon: "✍️" },
                { title: `${query} — NCERT Book`, src: "NCERT Official", url: `https://ncert.nic.in/textbook.php`, icon: "📚" },
                { title: `${query} — Revision Sheet`, src: "Khan Academy", url: `https://www.khanacademy.org/search?search_query=${encodeURIComponent(query)}`, icon: "📋" },
              ].map((n, i) => (
                <a key={i} href={n.url} target="_blank" rel="noopener noreferrer"
                  className="group p-5 bg-card/60 border border-white/10 rounded-2xl hover:border-green-500/40 transition-all flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-center text-xl shrink-0">{n.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-white group-hover:text-green-400 transition-colors leading-tight">{n.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{n.src}</p>
                  </div>
                  <ExternalLink size={14} className="text-muted-foreground group-hover:text-green-400 transition-colors shrink-0" />
                </a>
              ))}
            </div>
          </motion.div>
        )}

        {/* BOTTOM CTA */}
        <div className="flex gap-3 pt-4">
          <button onClick={() => router.push(`/test?topic=${encodeURIComponent(query)}`)}
            className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-primary/20">
            <Zap size={18} /> "{query}" ka AI Test Do
          </button>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-6 rounded-2xl transition-all shadow-lg shadow-green-500/20">
            <Share2 size={18} />
          </a>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin text-primary" size={40} /></div>}>
      <SearchResults />
    </Suspense>
  );
}
