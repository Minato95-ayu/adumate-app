import Link from "next/link";
import Image from "next/image";
import { User } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="border-b border-white/5 bg-background/50 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-[72px] flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 overflow-hidden rounded-xl shadow-[0_0_15px_rgba(255,107,0,0.3)] group-hover:scale-110 transition-transform duration-300">
            <Image 
              src="/logo-mark.svg" 
              alt="Adumate Logo" 
              fill 
              className="object-contain"
            />
          </div>
          <span className="text-2xl font-black text-white tracking-tighter">
            Adu<span className="text-primary">mate</span>
          </span>
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-muted hover:text-white transition-colors font-medium">
            Dashboard
          </Link>
          <Link href="/test" className="text-muted hover:text-white transition-colors font-medium">
            AI Tests
          </Link>
          <Link href="/profile" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-muted hover:bg-primary/20 hover:text-primary transition-all">
            <User size={20} />
          </Link>
        </div>
      </div>
    </nav>
  );
}
