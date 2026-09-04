// Deployment Trigger: Build Fix for Footer
"use client";
// Deployment Trigger: Syncing local fixes to Vercel
import Link from "next/link";
import { BookOpen, Home, Utensils, GraduationCap, Building, Search, Brain, Zap, Target, ChevronRight, Sparkles, MessageSquare, Globe } from "lucide-react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

// A 3D rotating cube component - Visible on Mobile too now!
const RotatingCube = () => {
  return (
    <div className="perspective-1000 w-48 h-48 md:w-96 md:h-96 absolute right-[-20px] md:right-0 top-1/4 -z-10 opacity-20 md:opacity-60 block overflow-visible">
      <motion.div
        animate={{
          rotateX: [0, 360],
          rotateY: [0, 360],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
        className="w-full h-full relative preserve-3d"
      >
        <div className="absolute w-full h-full border-2 border-primary/50 bg-primary/10 rounded-2xl flex items-center justify-center transform translate-z-24 md:translate-z-48 backdrop-blur-sm">
          <BookOpen size={40} className="text-primary md:hidden" />
          <BookOpen size={60} className="text-primary hidden md:block" />
        </div>
        <div className="absolute w-full h-full border-2 border-blue-500/50 bg-blue-500/10 rounded-2xl flex items-center justify-center transform -translate-z-24 md:-translate-z-48 rotate-y-180 backdrop-blur-sm">
          <Home size={40} className="text-blue-500 md:hidden" />
          <Home size={60} className="text-blue-500 hidden md:block" />
        </div>
        <div className="absolute w-full h-full border-2 border-green-500/50 bg-green-500/10 rounded-2xl flex items-center justify-center transform -translate-x-24 md:-translate-x-48 -rotate-y-90 backdrop-blur-sm">
          <Utensils size={40} className="text-green-500 md:hidden" />
          <Utensils size={60} className="text-green-500 hidden md:block" />
        </div>
        <div className="absolute w-full h-full border-2 border-purple-500/50 bg-purple-500/10 rounded-2xl flex items-center justify-center transform translate-x-24 md:translate-x-48 rotate-y-90 backdrop-blur-sm">
          <GraduationCap size={40} className="text-purple-500 md:hidden" />
          <GraduationCap size={60} className="text-purple-500 hidden md:block" />
        </div>
        <div className="absolute w-full h-full border-2 border-orange-400/50 bg-orange-400/10 rounded-2xl flex items-center justify-center transform -translate-y-24 md:-translate-y-48 rotate-x-90 backdrop-blur-sm">
          <Building size={40} className="text-orange-400 md:hidden" />
          <Building size={60} className="text-orange-400 hidden md:block" />
        </div>
        <div className="absolute w-full h-full border-2 border-pink-500/50 bg-pink-500/10 rounded-2xl flex items-center justify-center transform translate-y-24 md:translate-y-48 -rotate-x-90 backdrop-blur-sm">
          <span className="text-xl md:text-3xl font-bold text-pink-500">Adumate</span>
        </div>
      </motion.div>
    </div>
  );
};

export default function HomeClient() {
  const router = useRouter();
  const [kfQuery, setKfQuery] = useState("");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (!auth) {
      setUser(null);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);
  return (
    <div className="flex flex-col min-h-[calc(100vh-73px)] relative overflow-x-hidden bg-[#0a0f1a]">
      {/* 3D Space Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[150px] pointer-events-none" />

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center md:items-start justify-center text-center md:text-left px-6 lg:px-16 z-10 py-16 md:py-32 w-full max-w-7xl mx-auto relative">
        
        <RotatingCube />

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl relative z-10"
        >
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-primary mb-8 text-sm font-medium shadow-[0_0_15px_rgba(255,107,0,0.3)] backdrop-blur-md">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
            Entering the Adumate 3D Ecosystem
          </div>
          
          <h1 className="text-4xl md:text-7xl font-extrabold text-white tracking-tight mb-6 leading-tight drop-shadow-2xl">
            Experience the <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary via-orange-400 to-yellow-500 filter drop-shadow-[0_0_20px_rgba(255,107,0,0.5)]">Next-Gen</span> Student Life.
          </h1>
          
          <p className="text-lg md:text-2xl text-slate-300 mb-12 max-w-2xl leading-relaxed">
            Libraries, Hostels, PGs, and Tutors mapped in a seamless ecosystem. Step into the future of student living.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto perspective-1000">
            {user ? (
              <Link 
                href="/dashboard" 
                className="btn-3d group relative w-full sm:w-auto flex items-center justify-center gap-3 bg-gradient-to-b from-[#FF8533] to-[#CC5500] hover:from-[#FF9955] hover:to-[#E66000] text-white px-10 py-5 rounded-2xl font-black text-xl shadow-[0_10px_0_#994000,0_15px_20px_rgba(255,107,0,0.4)] hover:shadow-[0_8px_0_#994000,0_15px_20px_rgba(255,107,0,0.6)]"
              >
                <span>Go to Dashboard</span>
                <ChevronRight size={24} />
              </Link>
            ) : (
              <Link 
                href="/login?role=student" 
                className="btn-3d group relative w-full sm:w-auto flex items-center justify-center gap-3 bg-gradient-to-b from-[#FF8533] to-[#CC5500] hover:from-[#FF9955] hover:to-[#E66000] text-white px-10 py-5 rounded-2xl font-black text-xl shadow-[0_10px_0_#994000,0_15px_20px_rgba(255,107,0,0.4)] hover:shadow-[0_8px_0_#994000,0_15px_20px_rgba(255,107,0,0.6)]"
              >
                <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span>I'm a Student</span>
                <motion.div 
                  animate={{ rotate: 360 }} 
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                >
                  <BookOpen size={24} className="drop-shadow-lg" />
                </motion.div>
              </Link>
            )}

            <Link
              href="/partner/register"
              className="btn-3d group relative w-full sm:w-auto flex items-center justify-center gap-3 bg-gradient-to-b from-slate-700 to-slate-900 border-2 border-slate-600 hover:border-primary/50 text-white px-8 py-4 md:px-10 md:py-5 rounded-2xl font-black text-lg md:text-xl shadow-[0_10px_0_#0f172a,0_15px_20px_rgba(0,0,0,0.5)]"
            >
              <span>Partner Area</span>
              <Building size={20} className="text-primary group-hover:animate-bounce drop-shadow-lg" />
            </Link>

            {/* Vidwan AI Quick Access */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative hidden xl:block"
            >
              <Link 
                href="/vidwan"
                className="flex items-center gap-4 bg-white/5 backdrop-blur-2xl border border-white/10 p-2 pr-6 rounded-[2rem] hover:bg-white/10 transition-all shadow-2xl"
              >
                <div className="w-12 h-12 rounded-full overflow-hidden border border-primary/30 p-2 bg-primary/5">
                  <Image src="/vidwan-logo-simple.svg" alt="Vidwan" width={32} height={32} className="object-contain" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest">Live AI</span>
                  <span className="text-sm font-bold text-white">Ask Vidwan</span>
                </div>
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* ====== CORE SERVICES SECTION ====== */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, type: "spring" }}
          className="mt-20 w-full relative z-10"
        >
          {/* Section Header */}
          <div className="text-center mb-10">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary mb-5 text-sm font-bold"
            >
              <Building size={16} /> Essential Services
            </motion.div>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-4">
              Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">Adumate</span>
            </h2>
            <p className="text-slate-400 text-sm md:text-lg max-w-xl mx-auto px-4">
              Find the best places to study, live, and eat around you
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 perspective-1000">
            {[
              {
                icon: "📚",
                title: "Libraries",
                desc: "Find the best quiet spots with AC and WiFi nearby for focused study.",
                gradient: "from-orange-600/25 to-red-600/25",
                border: "border-orange-500/40",
                glow: "shadow-orange-500/20",
                badge: "Study Zone",
                badgeColor: "text-orange-400 bg-orange-500/10 border-orange-500/20",
                action: () => router.push("/map?category=library"),
                cta: "Find nearby →",
                ctaColor: "bg-orange-500 hover:bg-orange-400",
              },
              {
                icon: "🏠",
                title: "Hostels & PGs",
                desc: "Discover comfortable and affordable living spaces tailored for students.",
                gradient: "from-blue-600/25 to-indigo-600/25",
                border: "border-blue-500/40",
                glow: "shadow-blue-500/20",
                badge: "Living",
                badgeColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
                action: () => router.push("/map?category=hostel"),
                cta: "Find nearby →",
                ctaColor: "bg-blue-500 hover:bg-blue-400",
              },
              {
                icon: "🍱",
                title: "Mess & Tiffin",
                desc: "Get hygienic, home-like food options and monthly meal subscriptions.",
                gradient: "from-green-600/25 to-emerald-600/25",
                border: "border-green-500/40",
                glow: "shadow-green-500/20",
                badge: "Food",
                badgeColor: "text-green-400 bg-green-500/10 border-green-500/20",
                action: () => router.push("/map?category=mess"),
                cta: "Find nearby →",
                ctaColor: "bg-green-500 hover:bg-green-400",
              },
              {
                icon: "👨‍🏫",
                title: "Tutors",
                desc: "Connect with verified local tutors for personalized academic guidance.",
                gradient: "from-purple-600/25 to-fuchsia-600/25",
                border: "border-purple-500/40",
                glow: "shadow-purple-500/20",
                badge: "Learning",
                badgeColor: "text-purple-400 bg-purple-500/10 border-purple-500/20",
                action: () => router.push("/map?category=tutor"),
                cta: "Find nearby →",
                ctaColor: "bg-purple-500 hover:bg-purple-400",
              },
            ].map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50, rotateX: 30 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.7, type: "spring" }}
                whileHover={{ y: -12, rotateY: 6, rotateX: -4, scale: 1.02 }}
                onClick={card.action}
                className={`relative bg-gradient-to-br ${card.gradient} border ${card.border} rounded-[2rem] p-6 md:p-8 cursor-pointer group overflow-hidden shadow-2xl ${card.glow} transform-style-preserve-3d transition-all`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`} />
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
                  className="text-5xl mb-5 relative z-10"
                >
                  {card.icon}
                </motion.div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border mb-4 ${card.badgeColor}`}>
                  {card.badge}
                </span>
                <h3 className="text-2xl font-black text-white mb-3 relative z-10">{card.title}</h3>
                <p className="text-slate-300 text-sm leading-relaxed mb-6 relative z-10">{card.desc}</p>
                <button className={`${card.ctaColor} text-white font-black px-5 py-3 rounded-2xl text-sm transition-all shadow-lg relative z-10 group-hover:scale-105`}>
                  {card.cta}
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ====== KNOWLEDGE FINDER SECTION ====== */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, type: "spring" }}
          className="mt-20 w-full relative z-10"
        >
          {/* Section Header */}
          <div className="text-center mb-10">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 mb-5 text-sm font-bold"
            >
              <motion.span animate={{ rotate: [0, 360] }} transition={{ duration: 6, repeat: Infinity, ease: "linear" }}>🔍</motion.span>
              Powered by AI
            </motion.div>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-4">
              Knowledge{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-primary">
                Finder
              </span>
            </h2>
            <p className="text-slate-400 text-sm md:text-lg max-w-xl mx-auto px-4">
              Koi bhi topic search karo — Videos, Notes, Telegram channels, aur AI Test ek jagah
            </p>
          </div>

          {/* 3D Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 30, rotateX: 20 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.7, type: "spring" }}
            className="relative mb-8 perspective-1000 max-w-3xl mx-auto"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/10 to-primary/20 rounded-3xl blur-xl" />
            <div className="relative flex flex-col md:flex-row gap-3 bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-3 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
              <div className="flex-1 flex items-center gap-3 bg-white/5 rounded-2xl px-4 min-h-[56px]">
                <Search className="text-blue-400 shrink-0" size={18} />
                <input
                  value={kfQuery}
                  onChange={e => setKfQuery(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && kfQuery.trim() && router.push(`/search?q=${encodeURIComponent(kfQuery.trim())}`)}
                  placeholder="e.g. Newton's Laws..."
                  className="flex-1 bg-transparent text-white py-3 text-sm md:text-base outline-none placeholder:text-slate-500 w-full"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => kfQuery.trim() && router.push(`/search?q=${encodeURIComponent(kfQuery.trim())}`)}
                className="bg-primary text-white font-black px-6 py-4 rounded-2xl transition-all shadow-lg text-sm whitespace-nowrap w-full md:w-auto shrink-0"
              >
                Find Now ✨
              </motion.button>
            </div>
          </motion.div>

          {/* Quick topic chips */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {["Newton's Laws", "JEE Maths", "Python Basics", "NEET Biology", "English Grammar", "Indian History"].map((chip, i) => (
              <motion.button
                key={chip}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ scale: 1.08, y: -2 }}
                onClick={() => router.push(`/search?q=${encodeURIComponent(chip)}`)}
                className="text-sm px-4 py-2 bg-white/5 hover:bg-blue-500/20 border border-white/10 hover:border-blue-500/40 text-slate-300 hover:text-blue-300 rounded-full transition-all font-medium"
              >
                {chip}
              </motion.button>
            ))}
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 perspective-1000">
            {[
              {
                icon: "🎯",
                title: "AI Test Generator",
                desc: "Koi bhi topic likho — AI 5 se 15 questions banayega, answer karo, result dekho",
                gradient: "from-blue-600/25 to-indigo-600/25",
                border: "border-blue-500/40",
                glow: "shadow-blue-500/20",
                badge: "AI Powered",
                badgeColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
                action: () => router.push("/test"),
                cta: "Start Test →",
                ctaColor: "bg-blue-500 hover:bg-blue-400",
              },
              {
                icon: "🔍",
                title: "Resource Search",
                desc: "YouTube videos, Telegram channels, PDF notes — sab ek jagah mil jaata hai",
                gradient: "from-purple-600/25 to-pink-600/25",
                border: "border-purple-500/40",
                glow: "shadow-purple-500/20",
                badge: "Multi-Source",
                badgeColor: "text-purple-400 bg-purple-500/10 border-purple-500/20",
                action: () => router.push("/search?q=newton's laws"),
                cta: "Search Now →",
                ctaColor: "bg-purple-500 hover:bg-purple-400",
              },
              {
                icon: "⚔️",
                title: "1v1 Challenge",
                desc: "Dost ko challenge karo — koi bhi topic pe compete karo, WhatsApp pe share karo",
                gradient: "from-orange-500/25 to-red-500/25",
                border: "border-orange-500/40",
                glow: "shadow-orange-500/20",
                badge: "Viral Feature",
                badgeColor: "text-orange-400 bg-orange-500/10 border-orange-500/20",
                action: () => router.push("/dashboard"),
                cta: "Challenge Karo →",
                ctaColor: "bg-orange-500 hover:bg-orange-400",
              },
              {
                icon: "🤖",
                title: "Vidwan AI Chat",
                desc: "Chat with Vidwan AI — your personal scholar for learning anything new or getting app help",
                gradient: "from-green-600/25 to-teal-600/25",
                border: "border-green-500/40",
                glow: "shadow-green-500/20",
                badge: "New Feature",
                badgeColor: "text-green-400 bg-green-500/10 border-green-500/20",
                action: () => router.push("/vidwan"),
                cta: "Chat Now →",
                ctaColor: "bg-green-600 hover:bg-green-500",
              },
            ].map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50, rotateX: 30 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.7, type: "spring" }}
                whileHover={{ y: -12, rotateY: 6, rotateX: -4, scale: 1.02 }}
                onClick={card.action}
                className={`relative bg-gradient-to-br ${card.gradient} border ${card.border} rounded-[2rem] p-6 md:p-8 cursor-pointer group overflow-hidden shadow-2xl ${card.glow} transform-style-preserve-3d transition-all`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`} />
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
                  className="text-5xl mb-5 relative z-10"
                >
                  {card.icon}
                </motion.div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border mb-4 ${card.badgeColor}`}>
                  {card.badge}
                </span>
                <h3 className="text-2xl font-black text-white mb-3 relative z-10">{card.title}</h3>
                <p className="text-slate-300 text-sm leading-relaxed mb-6 relative z-10">{card.desc}</p>
                <button className={`${card.ctaColor} text-white font-black px-5 py-3 rounded-2xl text-sm transition-all shadow-lg relative z-10 group-hover:scale-105`}>
                  {card.cta}
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>
        {/* ====== VIDWAN AI HERO SECTION ====== */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-32 w-full max-w-6xl mx-auto relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-blue-500/10 to-primary/10 blur-[100px] rounded-full opacity-50 group-hover:opacity-80 transition-opacity" />
          
          <div className="relative bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-[3rem] p-8 md:p-16 overflow-hidden flex flex-col lg:flex-row items-center gap-12 shadow-2xl">
            
            <div className="w-full lg:w-1/2 relative z-10">
              <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-primary/5 border border-primary/10 text-primary mb-6 text-xs font-bold uppercase tracking-widest">
                <Sparkles size={14} /> Scholarly AI Assistant
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
                Vidwan <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">AI</span>
              </h2>
              <p className="text-lg md:text-xl text-slate-400 mb-8 leading-relaxed">
                Adumate's digital scholar is here to help you understand topics, find resources, and prepare for exams. Direct and simple explanations in your language.
              </p>
              
              <Link 
                href="/vidwan"
                className="bg-primary hover:bg-orange-500 text-white font-bold px-10 py-5 rounded-2xl transition-all shadow-xl shadow-primary/10 inline-flex items-center gap-3 text-lg"
              >
                Start Chatting →
              </Link>
            </div>

            <div className="w-full lg:w-1/2 flex justify-center">
              <div className="relative w-64 h-64 md:w-80 md:h-80 bg-primary/5 rounded-full flex items-center justify-center border border-primary/10">
                <Image 
                  src="/vidwan-logo-simple.svg" 
                  alt="Vidwan AI" 
                  width={180} 
                  height={180} 
                  className="opacity-80"
                />
              </div>
            </div>
          </div>
        </motion.div>
        {/* ====== END VIDWAN AI HERO ====== */}



        {/* About Adumate & Founder Section */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mt-40 mb-20 w-full relative z-10"
        >
          <div className="bg-gradient-to-br from-card/80 to-background/90 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-8 md:p-16 shadow-[0_20px_60px_rgba(0,0,0,0.6)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="flex flex-col lg:flex-row gap-16 items-center relative z-10">
              
              <div className="flex-1 space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold uppercase tracking-wider">
                  Our Mission
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">
                  Simplifying Student Life, <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">One Click at a Time.</span>
                </h2>
                <div className="space-y-4 text-slate-300 leading-relaxed md:text-lg">
                  <p>
                    <strong className="text-white">Adumate</strong> is a student-focused digital platform designed to simplify access to essential services such as libraries, hostels/PGs, mess facilities, tutors, and part-time job opportunities.
                  </p>
                  <p>
                    The platform connects students with verified local service providers through a single, easy-to-use interface. Instead of searching across multiple apps or offline sources, students can discover, compare, and access services in one place.
                  </p>
                  <p>
                    Adumate also empowers service providers (partners) to list their offerings, manage student requests, and grow their business digitally.
                  </p>
                </div>
              </div>

              <div className="w-full lg:w-1/3 flex flex-col items-center">
                <motion.div 
                  whileHover={{ scale: 1.05, rotateY: 10, rotateX: 5 }}
                  className="relative w-72 h-72 md:w-80 md:h-80 rounded-3xl overflow-hidden border-4 border-white/10 shadow-[0_20px_50px_rgba(255,107,0,0.3)] group perspective-1000 transform-style-preserve-3d"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10"></div>
                  
                  {/* Founder Image */}
                  <Image 
                    src="/founder.jpg" 
                    alt="Ayush Kaushik - Founder & CEO" 
                    fill
                    className="object-cover object-top transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  
                  <div className="absolute bottom-6 left-6 z-20 transform translate-z-10">
                    <h3 className="text-3xl font-black text-white drop-shadow-md">Ayush Kaushik</h3>
                    <p className="text-primary font-bold text-lg">Founder & CEO</p>
                    <a
                      href="https://www.instagram.com/aa.yu_s/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 hover:scale-105 transition-transform shadow-lg"
                      onClick={e => e.stopPropagation()}
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                      @aa.yu_s
                    </a>
                  </div>
                </motion.div>
              </div>

            </div>
          </div>
        </motion.div>

      </main>
    </div>
  );
}
