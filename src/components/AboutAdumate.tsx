"use client";
import { useEffect, useRef, useState } from "react";

const features = [
  { icon: "🗺️", title: "Service Map", desc: "Nearby library, hostel, mess, coaching — live GPS navigation", color: "#f97316", delay: 0 },
  { icon: "🧠", title: "Vidwan AI", desc: "Hinglish mein scholar AI — image, PDF, math sab samjhe", color: "#8b5cf6", delay: 100 },
  { icon: "📝", title: "AI Test", desc: "Subject-wise MCQs, performance analytics, weak areas identify", color: "#06b6d4", delay: 200 },
  { icon: "⚔️", title: "1v1 Challenge", desc: "Real-time knowledge battle with other students", color: "#ef4444", delay: 300 },
  { icon: "🏢", title: "Partner Dashboard", desc: "Library/Hostel owners ke liye smart management panel", color: "#10b981", delay: 400 },
  { icon: "🔍", title: "Knowledge Finder", desc: "Koi bhi topic — instant structured explanation", color: "#f59e0b", delay: 500 },
];

const stats = [
  { value: "7+", label: "AI Engines", icon: "🤖" },
  { value: "FREE", label: "For Students", icon: "🎓" },
  { value: "India", label: "First Platform", icon: "🇮🇳" },
  { value: "24/7", label: "Always On", icon: "⚡" },
];

const journey = [
  { step: "01", title: "Problem Dekha", desc: "Students ko library, hostel, mess sab alag jagah se dhundna padta tha", icon: "😤" },
  { step: "02", title: "Vision Bana", desc: "Ek hi platform pe sab kuch — trusted, verified, local", icon: "💡" },
  { step: "03", title: "Build Kiya", desc: "Next.js + AI + Maps + Firebase se poora ecosystem", icon: "🔨" },
  { step: "04", title: "Launch", desc: "adumate.in — India ka pehla student ecosystem", icon: "🚀" },
];

export default function AboutAdumate() {
  const [visible, setVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState<number | null>(null);
  const [orbitAngle, setOrbitAngle] = useState(0);
  const animRef = useRef<number>(0);

  useEffect(() => {
    setVisible(true);
    const animate = () => {
      setOrbitAngle(a => (a + 0.3) % 360);
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  // 3D orbit positions for feature icons
  const getOrbitPos = (index: number, total: number, angle: number, rx = 160, ry = 60) => {
    const a = ((index / total) * 360 + angle) * (Math.PI / 180);
    const x = Math.cos(a) * rx;
    const y = Math.sin(a) * ry;
    const z = Math.sin(a); // depth
    return { x, y, z, scale: 0.7 + (z + 1) * 0.2 };
  };

  return (
    <div className="min-h-screen bg-[#050a14] text-white overflow-hidden">

      {/* ── Hero Section ─────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-6 text-center">
        {/* Animated background grid */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "linear-gradient(rgba(249,115,22,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,0.3) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }} />

        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-orange-500/5 blur-[120px]" />

        <div className={`relative z-10 transition-all duration-1000 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-300 text-xs font-black uppercase tracking-widest mb-8">
            🇮🇳 Made in India • By Students • For Students
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-none tracking-tight">
            <span className="text-white">Adu</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">mate</span>
          </h1>

          <p className="text-xl md:text-2xl font-bold text-slate-300 mb-4">
            Student Ecosystem India
          </p>
          <p className="text-base text-slate-500 max-w-xl mx-auto mb-12">
            Library dhundna ho, hostel chahiye ho, ya AI se padhna ho —<br/>
            <strong className="text-slate-300">sab kuch ek hi jagah.</strong>
          </p>

          {/* Stats row */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {stats.map((s, i) => (
              <div key={i} className="flex flex-col items-center px-6 py-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
                <span className="text-2xl mb-1">{s.icon}</span>
                <span className="text-2xl font-black text-white">{s.value}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3D Orbit Animation */}
        <div className="relative w-full max-w-md mx-auto" style={{ height: "200px", perspective: "600px" }}>
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Center logo */}
            <div className="relative z-10 w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center shadow-2xl shadow-orange-500/40 border-4 border-white/20">
              <span className="text-3xl font-black text-white">A</span>
            </div>

            {/* Orbiting feature icons */}
            {features.map((f, i) => {
              const pos = getOrbitPos(i, features.length, orbitAngle);
              const isActive = activeFeature === i;
              return (
                <div key={i}
                  className="absolute cursor-pointer transition-all duration-200"
                  style={{
                    transform: `translate(${pos.x}px, ${pos.y}px) scale(${pos.scale})`,
                    zIndex: Math.round(pos.z * 10 + 10),
                    opacity: 0.6 + pos.z * 0.4,
                  }}
                  onMouseEnter={() => setActiveFeature(i)}
                  onMouseLeave={() => setActiveFeature(null)}>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl border transition-all duration-200 ${isActive ? "scale-125 border-white/40 bg-white/20" : "border-white/10 bg-white/5"}`}
                    style={{ backgroundColor: isActive ? `${f.color}30` : undefined, borderColor: isActive ? f.color : undefined }}>
                    {f.icon}
                  </div>
                  {isActive && (
                    <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-black text-white bg-[#060e1a]/90 px-2 py-1 rounded-lg border border-white/10">
                      {f.title}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Orbit ellipse */}
            <div className="absolute border border-white/5 rounded-full" style={{
              width: "340px", height: "130px",
              transform: "rotateX(70deg)",
            }} />
          </div>
        </div>
      </section>

      {/* ── Problem Section ───────────────────────────────────────────── */}
      <section className="py-24 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-[10px] font-black uppercase tracking-widest text-orange-400 mb-4">The Problem</p>
          <h2 className="text-3xl md:text-5xl font-black mb-6">Ek Student Ko Kya Kya Chahiye?</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-16">
          {[
            { icon: "📚", need: "Library", pain: "Kon si trusted hai?" },
            { icon: "🏠", need: "Hostel / PG", pain: "Safe hai ya nahi?" },
            { icon: "🍱", need: "Mess", pain: "Khana kaisa hai?" },
            { icon: "🛏", need: "Room", pain: "Price sahi hai?" },
            { icon: "👨‍🏫", need: "Tutors", pain: "Experienced hain?" },
            { icon: "💼", need: "Part-time Jobs", pain: "Legit opportunity?" },
          ].map((item, i) => (
            <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-5 hover:border-orange-500/30 hover:bg-orange-500/5 transition-all group">
              <div className="text-3xl mb-3">{item.icon}</div>
              <p className="font-black text-white">{item.need}</p>
              <p className="text-xs text-slate-500 mt-1 group-hover:text-slate-400 transition-colors">{item.pain}</p>
            </div>
          ))}
        </div>

        {/* Pain points */}
        <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-8">
          <p className="text-center font-black text-red-400 text-lg mb-6">❌ Problems Without Adumate</p>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              "Sab alag-alag jagah pe milta tha",
              "Trust issue — fake listings bhi hoti thein",
              "Time waste — Google, WhatsApp, dost sab se puchna",
              "Proper verified information nahi milti",
            ].map((p, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-slate-300">
                <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-xs shrink-0">✕</span>
                {p}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Solution — Features ───────────────────────────────────────── */}
      <section className="py-24 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-[10px] font-black uppercase tracking-widest text-orange-400 mb-4">The Solution</p>
          <h2 className="text-3xl md:text-5xl font-black">Adumate Kya Karta Hai?</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <div key={i} className="group relative rounded-3xl border border-white/10 bg-white/3 p-6 hover:border-white/20 hover:bg-white/5 transition-all duration-300 cursor-pointer overflow-hidden"
              style={{ transitionDelay: `${f.delay}ms` }}>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `radial-gradient(circle at top left, ${f.color}10, transparent 60%)` }} />
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="font-black text-lg text-white mb-2">{f.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              <div className="mt-4 w-8 h-1 rounded-full transition-all duration-300 group-hover:w-16" style={{ backgroundColor: f.color }} />
            </div>
          ))}
        </div>
      </section>

      {/* ── Partner Side ─────────────────────────────────────────────── */}
      <section className="py-24 px-6 max-w-5xl mx-auto">
        <div className="rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent p-8 md:p-12">
          <div className="text-center mb-12">
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-4">For Partners</p>
            <h2 className="text-3xl md:text-4xl font-black">Library / Hostel Owners ke Liye</h2>
            <p className="text-slate-400 mt-4">Aapka business grow karega — customers khud aayenge</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: "📢", title: "Free Marketing", desc: "App par listed hote hi thousands students ko dikhega. Zero cost." },
              { icon: "📊", title: "Smart Dashboard", desc: "Seats update karo, student list dekho, earnings track karo." },
              { icon: "💬", title: "Direct Inquiries", desc: "Students directly contact karenge — no middleman." },
              { icon: "💳", title: "Digital Payments", desc: "Online payments, invoices, payment tracking — sab ek jagah." },
            ].map((p, i) => (
              <div key={i} className="flex gap-4 p-5 rounded-2xl border border-white/10 bg-white/5 hover:border-emerald-500/30 transition-all">
                <span className="text-3xl shrink-0">{p.icon}</span>
                <div>
                  <p className="font-black text-white mb-1">{p.title}</p>
                  <p className="text-sm text-slate-400">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Journey Timeline ─────────────────────────────────────────── */}
      <section className="py-24 px-6 max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black">Adumate Ka Safar</h2>
        </div>
        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-orange-500/50 via-orange-500/20 to-transparent" />
          <div className="space-y-12">
            {journey.map((j, i) => (
              <div key={i} className="flex gap-6 items-start">
                <div className="relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-500/5 border border-orange-500/30 flex flex-col items-center justify-center shrink-0">
                  <span className="text-xl">{j.icon}</span>
                  <span className="text-[9px] font-black text-orange-400">{j.step}</span>
                </div>
                <div className="pt-3">
                  <h3 className="font-black text-white text-lg">{j.title}</h3>
                  <p className="text-slate-400 text-sm mt-1 leading-relaxed">{j.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 text-center">
        <div className="relative inline-block">
          <div className="absolute -inset-4 rounded-3xl bg-orange-500/10 blur-2xl" />
          <div className="relative rounded-3xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-transparent p-12">
            <p className="text-5xl mb-6">🚀</p>
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              Ayush Kaushik ka Vision
            </h2>
            <p className="text-slate-400 max-w-lg mx-auto mb-8 leading-relaxed">
              Har Indian student ke paas ek powerful ecosystem ho — jahan AI, Map, Community sab mile.<br/>
              <strong className="text-white">Free. Trusted. Desi.</strong>
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a href="/map" className="px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 text-black font-black text-sm hover:opacity-90 transition-all shadow-xl shadow-orange-500/25">
                🗺️ Explore Map
              </a>
              <a href="/vidwan" className="px-8 py-4 rounded-2xl border border-white/20 bg-white/5 text-white font-black text-sm hover:bg-white/10 transition-all">
                🧠 Talk to Vidwan
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
