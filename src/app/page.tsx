"use client";
import Link from "next/link";
import { BookOpen, Home, Utensils, GraduationCap, Building } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

// A 3D rotating cube component
const RotatingCube = () => {
  return (
    <div className="perspective-1000 w-64 h-64 md:w-96 md:h-96 absolute right-0 top-1/4 -z-10 opacity-30 md:opacity-60 hidden sm:block">
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
        {/* Front */}
        <div className="absolute w-full h-full border-2 border-primary/50 bg-primary/10 rounded-2xl flex items-center justify-center transform translate-z-32 md:translate-z-48 backdrop-blur-sm">
          <BookOpen size={60} className="text-primary" />
        </div>
        {/* Back */}
        <div className="absolute w-full h-full border-2 border-blue-500/50 bg-blue-500/10 rounded-2xl flex items-center justify-center transform -translate-z-32 md:-translate-z-48 rotate-y-180 backdrop-blur-sm">
          <Home size={60} className="text-blue-500" />
        </div>
        {/* Left */}
        <div className="absolute w-full h-full border-2 border-green-500/50 bg-green-500/10 rounded-2xl flex items-center justify-center transform -translate-x-32 md:-translate-x-48 -rotate-y-90 backdrop-blur-sm">
          <Utensils size={60} className="text-green-500" />
        </div>
        {/* Right */}
        <div className="absolute w-full h-full border-2 border-purple-500/50 bg-purple-500/10 rounded-2xl flex items-center justify-center transform translate-x-32 md:translate-x-48 rotate-y-90 backdrop-blur-sm">
          <GraduationCap size={60} className="text-purple-500" />
        </div>
        {/* Top */}
        <div className="absolute w-full h-full border-2 border-orange-400/50 bg-orange-400/10 rounded-2xl flex items-center justify-center transform -translate-y-32 md:-translate-y-48 rotate-x-90 backdrop-blur-sm">
          <Building size={60} className="text-orange-400" />
        </div>
        {/* Bottom */}
        <div className="absolute w-full h-full border-2 border-pink-500/50 bg-pink-500/10 rounded-2xl flex items-center justify-center transform translate-y-32 md:translate-y-48 -rotate-x-90 backdrop-blur-sm">
          <span className="text-3xl font-bold text-pink-500">Adumate</span>
        </div>
      </motion.div>
    </div>
  );
};

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-73px)] relative overflow-hidden bg-[#0a0f1a]">
      {/* 3D Space Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[150px] pointer-events-none" />

      {/* CSS needed for 3D Transforms */}
      <style dangerouslySetInnerHTML={{__html: `
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .translate-z-32 { transform: translateZ(8rem); }
        .translate-z-48 { transform: translateZ(12rem); }
        .-translate-z-32 { transform: translateZ(-8rem); }
        .-translate-z-48 { transform: translateZ(-12rem); }
        .-rotate-y-90 { transform: rotateY(-90deg) translateZ(8rem); }
        @media (min-width: 768px) { .-rotate-y-90 { transform: rotateY(-90deg) translateZ(12rem); } }
        .rotate-y-90 { transform: rotateY(90deg) translateZ(8rem); }
        @media (min-width: 768px) { .rotate-y-90 { transform: rotateY(90deg) translateZ(12rem); } }
        .rotate-x-90 { transform: rotateX(90deg) translateZ(8rem); }
        @media (min-width: 768px) { .rotate-x-90 { transform: rotateX(90deg) translateZ(12rem); } }
        .-rotate-x-90 { transform: rotateX(-90deg) translateZ(8rem); }
        @media (min-width: 768px) { .-rotate-x-90 { transform: rotateX(-90deg) translateZ(12rem); } }
        .rotate-y-180 { transform: rotateY(180deg) translateZ(8rem); }
        @media (min-width: 768px) { .rotate-y-180 { transform: rotateY(180deg) translateZ(12rem); } }
        
        .btn-3d {
          transform-style: preserve-3d;
          transition: transform 0.15s ease-out;
        }
        .btn-3d:active {
          transform: translateY(4px) translateZ(-10px);
        }
      `}} />

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
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6 leading-[1.1] drop-shadow-2xl">
            Experience the <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary via-orange-400 to-yellow-500 filter drop-shadow-[0_0_20px_rgba(255,107,0,0.5)]">Next-Gen</span> Student Life.
          </h1>
          
          <p className="text-lg md:text-2xl text-slate-300 mb-12 max-w-2xl leading-relaxed">
            Libraries, Hostels, PGs, and Tutors mapped in a seamless ecosystem. Step into the future of student living.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto perspective-1000">
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

            <Link 
              href="/login?role=partner" 
              className="btn-3d group relative w-full sm:w-auto flex items-center justify-center gap-3 bg-gradient-to-b from-slate-700 to-slate-900 border-2 border-slate-600 hover:border-primary/50 text-white px-10 py-5 rounded-2xl font-black text-xl shadow-[0_10px_0_#0f172a,0_15px_20px_rgba(0,0,0,0.5)] hover:shadow-[0_8px_0_#0f172a,0_15px_20px_rgba(255,107,0,0.2)]"
            >
              <span>Partner With Us</span>
              <Building size={24} className="text-primary group-hover:animate-bounce drop-shadow-lg" />
            </Link>
          </div>
        </motion.div>

        {/* 3D Floating Feature Grid */}
        <div className="mt-32 grid grid-cols-2 md:grid-cols-4 gap-6 w-full relative z-10 perspective-1000">
          {[
            { title: "Libraries", icon: <BookOpen size={32}/>, color: "text-primary", bg: "bg-primary/20", border: "border-primary/50" },
            { title: "Hostels", icon: <Home size={32}/>, color: "text-blue-400", bg: "bg-blue-400/20", border: "border-blue-400/50" },
            { title: "Mess", icon: <Utensils size={32}/>, color: "text-green-400", bg: "bg-green-400/20", border: "border-green-400/50" },
            { title: "Tutors", icon: <GraduationCap size={32}/>, color: "text-purple-400", bg: "bg-purple-400/20", border: "border-purple-400/50" },
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 50, rotateX: 45 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ delay: i * 0.2 + 0.5, duration: 0.6 }}
              whileHover={{ scale: 1.05, rotateY: 10, rotateX: -10, translateZ: 20 }}
              className={`transform-style-preserve-3d cursor-pointer bg-slate-900/60 backdrop-blur-xl border-t border-l border-white/10 border-b-4 border-r-4 ${item.border} p-8 rounded-3xl flex flex-col items-center text-center shadow-2xl transition-all`}
            >
              <div className={`w-20 h-20 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center mb-6 shadow-inner transform translate-z-10`}>
                {item.icon}
              </div>
              <h3 className="font-extrabold text-xl text-white transform translate-z-5 tracking-wide">{item.title}</h3>
            </motion.div>
          ))}
        </div>

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
                  <img 
                    src="/founder.jpg" 
                    alt="Founder & CEO" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&q=80"; // Fallback placeholder
                    }}
                  />
                  
                  <div className="absolute bottom-6 left-6 z-20 transform translate-z-10">
                    <h3 className="text-3xl font-black text-white drop-shadow-md">Ayush</h3>
                    <p className="text-primary font-bold text-lg">Founder & CEO</p>
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
