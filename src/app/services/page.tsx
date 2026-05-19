import { BookOpen, Home, Utensils, GraduationCap, Briefcase, MapPin, Search, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Services - Student Ecosystem Solutions",
  description: "Explore the wide range of services offered by Adumate, from finding libraries and hostels to AI-powered study tools and job search.",
};

export default function ServicesPage() {
  const services = [
    {
      icon: <BookOpen size={40} />,
      title: "Library Finder",
      desc: "Find the quietest and best-equipped libraries near your location. Filter by AC, WiFi, and seating capacity.",
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      border: "border-orange-500/20"
    },
    {
      icon: <Home size={40} />,
      title: "Hostels & PGs",
      desc: "Discover verified student accommodations. Compare prices, facilities, and proximity to your campus.",
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20"
    },
    {
      icon: <Utensils size={40} />,
      title: "Mess & Tiffin",
      desc: "Home-style food services for students. Find daily mess and tiffin providers with high hygiene ratings.",
      color: "text-green-500",
      bg: "bg-green-500/10",
      border: "border-green-500/20"
    },
    {
      icon: <GraduationCap size={40} />,
      title: "Personal Tutors",
      desc: "Connect with expert tutors for JEE, NEET, CUET, and other competitive exams. Home and online options available.",
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20"
    },
    {
      icon: <Briefcase size={40} />,
      title: "Part-time Jobs",
      desc: "Student-friendly job opportunities and internships to help you gain experience and earn while you learn.",
      color: "text-pink-500",
      bg: "bg-pink-500/10",
      border: "border-pink-500/20"
    },
    {
      icon: <ShieldCheck size={40} />,
      title: "Verified Partners",
      desc: "Every service on our platform is verified for quality and reliability. We ensure a safe environment for students.",
      color: "text-teal-500",
      bg: "bg-teal-500/10",
      border: "border-teal-500/20"
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0f1a] py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest mb-6">
            Ecosystem Features
          </div>
          <h1 className="text-4xl md:text-7xl font-black text-white mb-6 leading-tight">
            Comprehensive <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-400 to-yellow-500">Student Services</span>
          </h1>
          <p className="text-slate-400 max-w-3xl mx-auto text-lg leading-relaxed">
            Adumate is designed to be your single point of contact for everything you need as a student. From a place to stay to tools to excel in your exams.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {services.map((s, i) => (
            <div key={i} className={`p-8 rounded-[2.5rem] bg-slate-900/40 border ${s.border} hover:bg-slate-900/60 transition-all group`}>
              <div className={`w-16 h-16 ${s.bg} ${s.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-xl`}>
                {s.icon}
              </div>
              <h3 className="text-2xl font-black text-white mb-4">{s.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                {s.desc}
              </p>
              <Link href={s.title === "Library Finder" ? "/libraries" : "/map"} className={`${s.color} text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all`}>
                Explore Now <MapPin size={14}/>
              </Link>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-primary to-orange-500 rounded-[3rem] p-10 md:p-16 text-center text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <h2 className="text-3xl md:text-5xl font-black mb-6 relative z-10">Ready to transform your <br/> student experience?</h2>
          <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
            <Link href="/map" className="bg-white text-primary font-black px-10 py-5 rounded-2xl hover:scale-105 transition-all shadow-xl">
              Launch Finder Map
            </Link>
            <Link href="/register-provider" className="bg-black/20 backdrop-blur-md border border-white/20 text-white font-black px-10 py-5 rounded-2xl hover:bg-black/30 transition-all">
              List Your Service
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
