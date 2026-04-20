"use client";
import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { providers } from "@/data/providers";
import { Search, MapPin, Filter, Layers, Navigation } from "lucide-react";
import { motion } from "framer-motion";

// Dynamically import Map to prevent SSR errors
const Map = dynamic(() => import("@/components/Map"), { 
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-slate-900 animate-pulse flex items-center justify-center rounded-3xl border border-white/10">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground text-sm font-bold">Map load ho raha hai...</p>
      </div>
    </div>
  )
});

export default function MapPage() {
  const [search, setSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [minRating, setMinRating] = useState(0);
  const [maxFees, setMaxFees] = useState(2000);
  const [sortBy, setSortBy] = useState("rating"); // "rating", "fees"

  const filteredProviders = useMemo(() => {
    let filtered = providers.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                           p.subject.toLowerCase().includes(search.toLowerCase());
      const matchesSubject = selectedSubject === "All" || p.subject === selectedSubject;
      const matchesRating = p.rating >= minRating;
      const feesNum = parseInt(p.fees.replace(/[^0-9]/g, ""));
      const matchesFees = feesNum <= maxFees;
      
      return matchesSearch && matchesSubject && matchesRating && matchesFees;
    });

    if (sortBy === "rating") {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "fees") {
      filtered.sort((a, b) => {
        const feesA = parseInt(a.fees.replace(/[^0-9]/g, ""));
        const feesB = parseInt(b.fees.replace(/[^0-9]/g, ""));
        return feesA - feesB;
      });
    }

    return filtered;
  }, [search, selectedSubject, minRating, maxFees, sortBy]);

  const subjects = ["All", ...Array.from(new Set(providers.map(p => p.subject)))];

  return (
    <div className="flex flex-col h-screen md:h-[calc(100vh-73px)] overflow-hidden bg-[#0a0f1a]">
      {/* Sidebar / Controls */}
      <div className="flex flex-col md:flex-row h-full overflow-hidden">
        <div className="w-full md:w-96 p-4 md:p-6 overflow-y-auto custom-scrollbar border-b md:border-r border-white/5 bg-slate-900/30 backdrop-blur-xl z-20 shrink-0">
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-black text-white mb-1 flex items-center gap-3">
              <MapPin className="text-primary" size={24} /> Service Finder
            </h1>
            <p className="text-muted-foreground text-xs">Nearby tutors aur services dekho</p>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or subject..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:ring-2 focus:ring-primary outline-none transition-all"
            />
          </div>

          {/* Filters Grid */}
          <div className="space-y-6 mb-8">
            {/* Subject Filters */}
            <div>
              <label className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-3 block">Subjects</label>
              <div className="flex flex-wrap gap-2">
                {subjects.map(s => (
                  <button
                    key={s}
                    onClick={() => setSelectedSubject(s)}
                    className={`px-3 py-2 rounded-xl text-[10px] font-bold transition-all border ${
                      selectedSubject === s 
                      ? "bg-primary text-white border-primary" 
                      : "bg-white/5 text-muted-foreground border-white/10 hover:bg-white/10"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Rating Filter */}
            <div>
              <label className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-3 block">Minimum Rating</label>
              <div className="flex gap-2">
                {[0, 3, 4, 4.5].map(r => (
                  <button
                    key={r}
                    onClick={() => setMinRating(r)}
                    className={`flex-1 py-2 rounded-xl text-[10px] font-bold border transition-all ${
                      minRating === r ? "bg-yellow-500/20 text-yellow-500 border-yellow-500/50" : "bg-white/5 text-muted-foreground border-white/10"
                    }`}
                  >
                    {r === 0 ? "All" : `${r}+ ⭐`}
                  </button>
                ))}
              </div>
            </div>

            {/* Fees Range */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">Max Fees</label>
                <span className="text-xs font-bold text-primary">₹{maxFees}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="2000" 
                step="100"
                value={maxFees}
                onChange={(e) => setMaxFees(parseInt(e.target.value))}
                className="w-full accent-primary bg-white/10 h-2 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Sorting */}
            <div>
              <label className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-3 block">Sort By</label>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-xs text-white focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="rating">Highest Rated</option>
                <option value="fees">Lowest Fees</option>
              </select>
            </div>
          </div>

          {/* Results List */}
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">
                {filteredProviders.length} Results
              </label>
              <button 
                onClick={() => {
                  setSearch("");
                  setSelectedSubject("All");
                  setMinRating(0);
                  setMaxFees(2000);
                }}
                className="text-[10px] text-primary font-bold hover:underline"
              >
                Reset Filters
              </button>
            </div>
            
            {filteredProviders.map(p => (
              <motion.div 
                key={p.id}
                onClick={() => window.location.href = `/provider/${p.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="group p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl cursor-pointer transition-all"
              >
                <div className="flex items-center gap-4">
                  <img src={p.photo} alt={p.name} className="w-12 h-12 rounded-xl border border-white/10 object-cover" />
                  <div className="flex-1">
                    <h3 className="text-sm font-black text-white group-hover:text-primary transition-colors">{p.name}</h3>
                    <p className="text-[10px] text-muted-foreground">{p.subject} • <span className="text-primary font-bold">{p.fees}</span></p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-yellow-400 text-xs font-bold">
                      <Star size={10} fill="currentColor" className="mr-1" />
                      <span>{p.rating}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {filteredProviders.length === 0 && (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🕵️</div>
                <p className="text-white font-bold">Koi result nahi mila</p>
                <p className="text-muted-foreground text-xs mt-1">Try searching for something else</p>
              </div>
            )}
          </div>
        </div>

        {/* Map View */}
        <div className="flex-1 relative min-h-[40vh] md:h-full">
          <Map providers={filteredProviders} />
          
          {/* Floating Action Buttons */}
          <div className="absolute bottom-6 right-6 z-30 flex flex-col gap-3">
            <button className="w-12 h-12 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-2xl flex items-center justify-center text-white shadow-2xl hover:bg-slate-800 transition-all">
              <Layers size={20} />
            </button>
            <button className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/30 hover:bg-primary-hover transition-all">
              <Navigation size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
