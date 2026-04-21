import VidwanChat from "@/components/VidwanChat";
import { Sparkles, GraduationCap } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Vidwan AI | Adumate",
  description: "Chat with Vidwan AI, the scholarly mind of Adumate. Get instant help with your studies, search the web, and learn something new.",
};

export default function VidwanPage() {
  return (
    <div className="min-h-screen bg-[#0F172A] relative overflow-hidden flex flex-col items-center py-12 px-4">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full"></div>

      {/* Header Content */}
      <div className="text-center mb-10 relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full text-orange-400 text-sm font-medium mb-6">
          <GraduationCap className="w-4 h-4" />
          Powered by Advanced Intelligence
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">
          Meet <span className="text-orange-500">Vidwan AI</span>
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
          Your digital mentor designed to help you excel. Whether you're stuck on a question or want to explore new horizons, Vidwan is here for you.
        </p>
      </div>

      {/* Chat Component */}
      <div className="w-full max-w-5xl relative z-10">
        <VidwanChat />
      </div>

      {/* Back to Dashboard */}
      <div className="mt-8 relative z-10">
        <Link 
          href="/dashboard"
          className="text-slate-500 hover:text-white transition-colors text-sm font-medium flex items-center gap-2"
        >
          ← Return to Dashboard
        </Link>
      </div>

      {/* Footer Decoration */}
      <div className="mt-auto pt-12 text-center opacity-20">
        <div className="flex justify-center gap-8 items-center grayscale">
           <span className="text-white font-bold text-xl tracking-tighter">ADUMATE</span>
           <div className="w-1 h-1 bg-white rounded-full"></div>
           <span className="text-white font-medium italic">VIDWAN</span>
        </div>
      </div>
    </div>
  );
}
