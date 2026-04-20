"use client";
import Link from "next/link";
import Image from "next/image";
import { User, LayoutDashboard, Brain, LogIn } from "lucide-react";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  return (
    <nav className="border-b border-white/5 bg-background/50 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[64px] sm:h-[72px] flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
          <div className="relative w-8 h-8 sm:w-10 sm:h-10 overflow-hidden rounded-xl shadow-[0_0_15px_rgba(255,107,0,0.3)] group-hover:scale-110 transition-transform duration-300">
            <Image 
              src="/logo-mark.svg" 
              alt="Adumate Logo" 
              fill 
              className="object-contain"
            />
          </div>
          <span className="text-xl sm:text-2xl font-black text-white tracking-tighter">
            Adu<span className="text-primary">mate</span>
          </span>
        </Link>

        <div className="flex items-center gap-2 md:gap-6">
          {user ? (
            <>
              <Link href="/dashboard" className="p-2.5 rounded-xl hover:bg-white/5 text-muted hover:text-white transition-all flex items-center gap-2">
                <LayoutDashboard size={20} className="text-primary" />
                <span className="hidden md:inline font-medium">Dashboard</span>
              </Link>
              <Link href="/test" className="p-2.5 rounded-xl hover:bg-white/5 text-muted hover:text-white transition-all flex items-center gap-2">
                <Brain size={20} className="text-purple-400" />
                <span className="hidden md:inline font-medium">AI Tests</span>
              </Link>
              <Link href="/profile" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-muted hover:bg-primary/20 hover:text-primary transition-all">
                <User size={20} />
              </Link>
            </>
          ) : (
            <Link href="/login" className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 text-sm shadow-lg shadow-primary/20 transition-all">
              <LogIn size={18} />
              <span>Login</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
