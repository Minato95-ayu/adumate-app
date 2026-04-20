"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { 
  User, Camera, Book, MapPin, DollarSign, Video, 
  Globe, MessageCircle, Send, CheckCircle, Loader2 
} from "lucide-react";

export default function RegisterProvider() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 2000);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0f1a] px-6">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-slate-900 border border-white/10 p-12 rounded-[3rem] text-center max-w-md shadow-2xl"
        >
          <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-3xl font-black text-white mb-4">Registration Successful!</h2>
          <p className="text-slate-400 mb-8">Aapki profile review ke liye bhej di gayi hai. Hum jald hi aapko Adumate Map par live kar denge.</p>
          <button 
            onClick={() => window.location.href = "/map"}
            className="w-full bg-primary py-4 rounded-2xl font-black text-white shadow-xl shadow-primary/20"
          >
            Go to Map 🚀
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1a] py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold mb-6">
            <User size={16} /> FOR SERVICE PROVIDERS
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4">Register as a <span className="text-primary">Partner</span></h1>
          <p className="text-slate-400">Join Adumate ecosystem aur reach thousands of students instantly.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <section className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 md:p-12">
            <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3">
              <div className="w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center text-sm">1</div>
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300 ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <input required type="text" placeholder="e.g. Rahul Sharma" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-primary outline-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300 ml-1">Subject / Service Type</label>
                <div className="relative">
                  <Book className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <select required className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-primary outline-none appearance-none">
                    <option value="">Select Category</option>
                    <option value="physics">Physics Tutor</option>
                    <option value="maths">Mathematics Tutor</option>
                    <option value="chemistry">Chemistry Tutor</option>
                    <option value="coding">Coding Coach</option>
                    <option value="music">Music Teacher</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold text-slate-300 ml-1">Profile Photo URL</label>
                <div className="relative">
                  <Camera className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <input required type="text" placeholder="https://..." className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-primary outline-none" />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold text-slate-300 ml-1">About / Experience</label>
                <textarea required rows={4} placeholder="Describe your experience, teaching style, etc..." className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-white focus:ring-2 focus:ring-primary outline-none resize-none"></textarea>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300 ml-1">Fees (e.g. ₹500/hour)</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <input required type="text" placeholder="₹500/hour" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-primary outline-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300 ml-1">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <input required type="text" placeholder="City or Area name" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-primary outline-none" />
                </div>
              </div>
            </div>
          </section>

          {/* Social Links */}
          <section className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 md:p-12">
            <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-lg flex items-center justify-center text-sm">2</div>
              Social Media Links
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300 ml-1">YouTube URL</label>
                <div className="relative">
                  <Video className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500" size={18} />
                  <input type="text" placeholder="https://youtube.com/..." className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-red-500 outline-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300 ml-1">Instagram Username</label>
                <div className="relative">
                  <Camera className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-500" size={18} />
                  <input type="text" placeholder="@username" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-pink-500 outline-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300 ml-1">WhatsApp Number</label>
                <div className="relative">
                  <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500" size={18} />
                  <input required type="text" placeholder="91..." className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-green-500 outline-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300 ml-1">Telegram Username</label>
                <div className="relative">
                  <Send className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" size={18} />
                  <input type="text" placeholder="@username" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-blue-400 outline-none" />
                </div>
              </div>
            </div>
          </section>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-hover disabled:opacity-50 text-white py-6 rounded-[2rem] font-black text-xl transition-all shadow-2xl shadow-primary/30 flex items-center justify-center gap-3"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Submit Application 🚀"}
          </button>
        </form>
      </div>
    </div>
  );
}
