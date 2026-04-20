"use client";
import { useParams, useRouter } from "next/navigation";
import { providers } from "@/data/providers";
import { 
  Star, Video, Camera, Globe, MessageCircle, Send, 
  MapPin, Clock, Award, CheckCircle, ChevronLeft, Share2, Heart, Navigation 
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function ProviderProfile() {
  const { id } = useParams();
  const router = useRouter();
  const provider = providers.find(p => p.id === id);

  if (!provider) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0f1a] text-white">
        <div className="text-center">
          <h1 className="text-4xl font-black mb-4">404</h1>
          <p className="text-muted-foreground mb-6">Provider nahi mila!</p>
          <Link href="/map" className="bg-primary px-8 py-3 rounded-2xl font-bold">Back to Map</Link>
        </div>
      </div>
    );
  }

  const reviews = [
    { id: 1, user: "Ankit Jha", rating: 5, comment: "Best teacher for Physics! Concepts ekdum clear ho gaye.", date: "2 days ago" },
    { id: 2, user: "Sonal Singh", rating: 4, comment: "Bohot accha samjhate hain. Fees thoda high hai but worth it.", date: "1 week ago" }
  ];

  return (
    <div className="min-h-screen bg-[#0a0f1a] pb-20">
      {/* Header / Cover */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-[#0a0f1a]"></div>
        <div className="absolute inset-0 backdrop-blur-3xl opacity-30"></div>
        
        {/* Navigation */}
        <div className="absolute top-6 left-6 right-6 flex justify-between z-20">
          <button onClick={() => router.back()} className="w-12 h-12 rounded-2xl bg-black/40 backdrop-blur-xl flex items-center justify-center text-white border border-white/10">
            <ChevronLeft size={24} />
          </button>
          <div className="flex gap-3">
            <button className="w-12 h-12 rounded-2xl bg-black/40 backdrop-blur-xl flex items-center justify-center text-white border border-white/10">
              <Share2 size={20} />
            </button>
            <button className="w-12 h-12 rounded-2xl bg-black/40 backdrop-blur-xl flex items-center justify-center text-white border border-white/10">
              <Heart size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-4xl mx-auto px-6 -mt-32 relative z-10">
        <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
          
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center mb-10">
            <div className="relative">
              <img 
                src={provider.photo} 
                alt={provider.name} 
                className="w-32 h-32 md:w-40 md:h-40 rounded-[2rem] border-4 border-primary/30 object-cover shadow-2xl"
              />
              <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-1.5 rounded-full border-4 border-[#0f172a]">
                <CheckCircle size={16} fill="currentColor" />
              </div>
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-5xl font-black text-white">{provider.name}</h1>
                <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-black rounded-full border border-primary/20">VERIFIED</span>
              </div>
              <p className="text-xl text-slate-300 font-bold mb-4">{provider.subject} Specialist</p>
              
              <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Star size={18} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-white font-bold">{provider.rating}</span> (120+ reviews)
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={18} className="text-primary" />
                  <span>{provider.address || "New Delhi"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-green-400" />
                  <span>Available Now</span>
                </div>
              </div>
            </div>

            <div className="bg-primary/10 border border-primary/20 p-6 rounded-3xl text-center min-w-[160px]">
              <p className="text-xs text-muted-foreground font-bold uppercase mb-1">Fees</p>
              <p className="text-3xl font-black text-primary">{provider.fees}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="md:col-span-2 space-y-10">
              {/* About */}
              <section>
                <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2">
                  <Award size={20} className="text-primary" /> About Me
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  Hello! I'm {provider.name}, a passionate {provider.subject} tutor with over 5 years of experience in helping students achieve their academic goals. I specialize in competitive exams like JEE, NEET, and board exams. My teaching style is interactive and concept-focused.
                </p>
              </section>

              {/* Social Links */}
              <section>
                <h3 className="text-xl font-black text-white mb-6">Social Media & Connect</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <button className="flex items-center justify-center gap-2 bg-red-600/20 hover:bg-red-600 text-white py-4 rounded-2xl font-bold transition-all border border-red-600/30">
                    <Video size={20} /> YouTube
                  </button>
                  <button className="flex items-center justify-center gap-2 bg-gradient-to-tr from-purple-600/20 via-pink-600/20 to-orange-500/20 hover:from-purple-600 hover:to-orange-500 text-white py-4 rounded-2xl font-bold transition-all border border-pink-600/30">
                    <Camera size={20} /> Instagram
                  </button>
                  <button className="flex items-center justify-center gap-2 bg-blue-600/20 hover:bg-blue-600 text-white py-4 rounded-2xl font-bold transition-all border border-blue-600/30">
                    <Globe size={20} /> Facebook
                  </button>
                  <button className="flex items-center justify-center gap-2 bg-green-500/20 hover:bg-green-500 text-white py-4 rounded-2xl font-bold transition-all border border-green-500/30">
                    <MessageCircle size={20} /> WhatsApp
                  </button>
                  <button className="flex items-center justify-center gap-2 bg-blue-400/20 hover:bg-blue-400 text-white py-4 rounded-2xl font-bold transition-all border border-blue-400/30">
                    <Send size={20} /> Telegram
                  </button>
                </div>
              </section>

              {/* Reviews */}
              <section>
                <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                  <Star size={20} className="text-yellow-400" /> Student Reviews
                </h3>
                <div className="space-y-4">
                  {reviews.map(rev => (
                    <div key={rev.id} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                            {rev.user[0]}
                          </div>
                          <span className="font-bold text-white">{rev.user}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{rev.date}</span>
                      </div>
                      <div className="flex text-yellow-400 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={12} fill={i < rev.rating ? "currentColor" : "none"} />
                        ))}
                      </div>
                      <p className="text-slate-400 text-sm italic">"{rev.comment}"</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sticky top-24">
                <h4 className="font-black text-white mb-4">Actions</h4>
                <div className="space-y-4">
                  <button className="w-full bg-primary hover:bg-primary-hover text-white py-4 rounded-2xl font-black transition-all shadow-xl shadow-primary/30 flex items-center justify-center gap-3">
                    <MessageCircle size={20} /> Contact Now
                  </button>
                  <Link href="/map" className="w-full bg-white/5 hover:bg-white/10 text-white py-4 rounded-2xl font-bold transition-all border border-white/10 flex items-center justify-center gap-3">
                    <Navigation size={20} /> Get Directions
                  </Link>
                  <button className="w-full bg-white/5 hover:bg-white/10 text-white py-4 rounded-2xl font-bold transition-all border border-white/10">
                    📅 Book Trial Session
                  </button>
                </div>
                <p className="text-[10px] text-muted-foreground text-center mt-6">
                  By contacting, you agree to Adumate's Terms & Privacy.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
