"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);
  
  if (pathname === "/login") return null;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Logout error", error);
    }
  };

  return (
    <nav className="w-full bg-card/80 backdrop-blur-md border-b border-white/5 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
      <Link href="/" className="text-primary font-bold text-2xl tracking-tight">
        Adumate
      </Link>
      {user && (
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors">
            <User size={18} />
            <span className="hidden sm:inline">Profile</span>
          </button>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-foreground hover:text-red-400 transition-colors bg-white/5 px-3 py-2 rounded-lg"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      )}
    </nav>
  );
}
