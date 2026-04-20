import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Globe, Mail, Phone, Download } from "lucide-react";

export default function Footer() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setDeferredPrompt(null);
    }
  };

  return (
    <footer className="bg-[#050810] border-t border-white/5 pt-16 pb-8 relative z-10 overflow-hidden mt-auto">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4 group">
              <div className="w-10 h-10 rounded-xl overflow-hidden relative border border-white/10">
                <Image src="/logo.png" alt="PI" fill className="object-cover" />
              </div>
              <span className="text-white font-black text-3xl tracking-tight drop-shadow-[0_0_15px_rgba(255,107,0,0.4)]">
                Adu<span className="text-primary">mate</span>
              </span>
            </Link>
            <p className="text-muted/80 max-w-sm mt-4 text-sm leading-relaxed">
              India's Ultimate Student Ecosystem. Simplifying student life by connecting you with the best libraries, hostels, mess facilities, tutors, and jobs.
            </p>
            <div className="flex gap-4 mt-6">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-muted hover:bg-primary hover:text-white transition-all hover:scale-110">
                <Globe size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-muted hover:bg-primary hover:text-white transition-all hover:scale-110">
                <Mail size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-muted hover:bg-primary hover:text-white transition-all hover:scale-110">
                <Phone size={18} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-bold text-white mb-6">Platform</h3>
            <ul className="space-y-3 text-sm text-muted/80">
              <li><Link href="/login?role=student" className="hover:text-primary transition-colors">Join as Student</Link></li>
              <li><Link href="/login?role=partner" className="hover:text-primary transition-colors">Partner with Us</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Browse Services</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-white mb-6">Support</h3>
            <ul className="space-y-3 text-sm text-muted/80">
              <li><Link href="#" className="hover:text-primary transition-colors">Help Center</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Contact Us</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <p className="text-muted/60 text-sm">
              &copy; {new Date().getFullYear()} Adumate. All rights reserved.
            </p>
            {deferredPrompt && (
              <button 
                onClick={handleInstall}
                className="bg-primary/20 hover:bg-primary text-primary hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border border-primary/30"
              >
                <Download size={14} /> Install Adumate App
              </button>
            )}
          </div>
          <p className="text-muted/60 text-sm flex items-center gap-1">
            Made with <span className="text-red-500">❤️</span> in India
          </p>
        </div>
      </div>
    </footer>
  );
}
