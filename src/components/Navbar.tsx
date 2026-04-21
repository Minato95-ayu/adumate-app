"use client";
import Link from "next/link";
import Image from "next/image";
import { User, LayoutDashboard, Brain, LogIn } from "lucide-react";
import UserAvatar from "./UserAvatar";
import BrandIcon from "./BrandIcon";
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
          <BrandIcon text="P" size={40} className="sm:w-10 sm:h-10" />
          <span className="text-xl sm:text-2xl font-black text-white tracking-tighter">
            Adu<span className="text-primary">mate</span>
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-8 ml-10">
          <Link href="/services" className="text-sm font-bold text-slate-300 hover:text-primary transition-colors">Services</Link>
          <Link href="/map" className="text-sm font-bold text-slate-300 hover:text-primary transition-colors">Finder Map</Link>
          <Link href="/blog" className="text-sm font-bold text-slate-300 hover:text-primary transition-colors">Blog</Link>
        </div>

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
              <Link href="/profile" className="hover:scale-110 transition-all duration-300">
                <UserAvatar name={user.displayName || user.email || "User"} size="md" />
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
