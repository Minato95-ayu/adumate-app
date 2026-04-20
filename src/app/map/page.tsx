"use client";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { providers } from "@/data/providers";
import { Search, MapPin, Filter, Layers, Navigation, Star, X, List, Map as MapIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("library");
  const [places, setPlaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [userLoc, setUserLoc] = useState({ lat: 28.6139, lng: 77.2090 });
  const [showFilters, setShowFilters] = useState(false);
  const [showMobileList, setShowMobileList] = useState(false);

  // Fetch real-world data from Google Places / OSM proxy
  const fetchRealPlaces = async (lat: number, lon: number, cat: string) => {
    setLoading(true);
    try {
      const resp = await fetch(`/api/places?lat=${lat}&lon=${lon}&category=${cat}&radius=5000`);
      const data = await resp.json();
      if (data.places) {
        // Transform API data to match Map component's Provider type
        const transformed = data.places.map((p: any) => ({
          id: p.id,
          name: p.name,
          subject: cat.toUpperCase(),
          fees: p.rating ? `⭐ ${p.rating}` : "Premium Service",
          rating: p.rating || 4.0,
          lat: p.lat,
          lng: p.lon,
          photo: `https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=100&auto=format&fit=crop`,
          address: p.address,
          social: { whatsapp: "9100000000" }
        }));
        setPlaces(transformed);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const newLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLoc(newLoc);
        fetchRealPlaces(newLoc.lat, newLoc.lng, selectedCategory);
      });
    } else {
      fetchRealPlaces(userLoc.lat, userLoc.lng, selectedCategory);
    }
  }, [selectedCategory]);

  const filteredProviders = useMemo(() => {
    return places.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  }, [search, places]);

  const categories = [
    { id: "library", label: "Libraries", icon: "📚" },
    { id: "mess", label: "Mess/Tiffin", icon: "🍱" },
    { id: "hostel", label: "Hostels/PG", icon: "🏠" },
    { id: "tutor", label: "Tutors", icon: "👨‍🏫" },
  ];

  return (
    <div className="relative flex flex-col h-[calc(100vh-72px)] overflow-hidden bg-[#0a0f1a]">
      
      {/* Mobile Top Controls (Floating) */}
      <div className="absolute top-4 left-4 right-4 z-[40] md:hidden flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input 
            type="text" 
            placeholder="Search tutors..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white shadow-2xl focus:ring-2 focus:ring-primary outline-none"
          />
        </div>
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={`p-3.5 rounded-2xl border backdrop-blur-xl transition-all shadow-2xl ${showFilters ? "bg-primary border-primary text-white" : "bg-slate-900/90 border-white/10 text-white"}`}
        >
          <Filter size={20} />
        </button>
      </div>

      <div className="flex h-full overflow-hidden">
        {/* Desktop Sidebar (Hidden on mobile) */}
        <div className="hidden md:flex flex-col w-96 p-6 overflow-y-auto custom-scrollbar border-r border-white/5 bg-slate-900/30 backdrop-blur-xl z-20 shrink-0">
          <div className="mb-8">
            <h1 className="text-3xl font-black text-white mb-1 flex items-center gap-3">
              <MapPin className="text-primary" size={24} /> Finder
            </h1>
            <p className="text-muted-foreground text-xs">Nearby tutors aur services dekho</p>
          </div>

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

          <div className="space-y-6 mb-8">
            <div>
              <label className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-3 block">Categories</label>
              <div className="flex flex-wrap gap-2">
                {categories.map(c => (
                  <button key={c.id} onClick={() => setSelectedCategory(c.id)}
                    className={`px-3 py-2.5 rounded-xl text-[10px] font-bold transition-all border ${selectedCategory === c.id ? "bg-primary text-white border-primary" : "bg-white/5 text-muted-foreground border-white/10 hover:bg-white/10"}`}>
                    {c.icon} {c.label}
                  </button>
                ))}
              </div>
            </div>
            {loading && (
              <div className="py-4 text-center">
                <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-[10px] text-muted-foreground">Searching internet data...</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
             <div className="flex justify-between items-center mb-4">
              <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">{filteredProviders.length} Results</label>
            </div>
            {filteredProviders.map(p => (
              <motion.div key={p.id}
                whileHover={{ scale: 1.02 }}
                className="group p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl cursor-pointer transition-all"
                onClick={() => router.push(`/provider/${p.id}`)}
              >
                <div className="flex items-center gap-4">
                  <img src={p.photo} alt={p.name} className="w-12 h-12 rounded-xl object-cover" />
                  <div className="flex-1">
                    <h3 className="text-sm font-black text-white group-hover:text-primary transition-colors">{p.name}</h3>
                    <p className="text-[10px] text-muted-foreground">{p.subject} • <span className="text-primary font-bold">{p.fees}</span></p>
                  </div>
                  <div className="flex items-center text-yellow-400 text-xs font-bold">
                    <Star size={10} fill="currentColor" className="mr-1" />
                    <span>{p.rating}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Map View (Full screen on mobile) */}
        <div className="flex-1 relative w-full h-full">
          <Map providers={filteredProviders} center={userLoc} />
          
          {/* Map UI Buttons */}
          <div className="absolute bottom-24 md:bottom-6 right-4 md:right-6 z-30 flex flex-col gap-3">
            <button className="w-12 h-12 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center text-white shadow-2xl">
              <Layers size={20} />
            </button>
            <button className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/30">
              <Navigation size={20} />
            </button>
          </div>

          {/* Mobile Bottom Toggle Button */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 md:hidden">
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowMobileList(true)}
              className="bg-slate-900/90 backdrop-blur-2xl border border-white/10 text-white px-6 py-3.5 rounded-full font-bold flex items-center gap-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
            >
              <List size={18} /> View List ({filteredProviders.length})
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Filters Overlay */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowFilters(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[50] md:hidden" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-white/10 rounded-t-[2.5rem] p-8 z-[60] md:hidden shadow-[0_-20px_60px_rgba(0,0,0,0.5)]">
              <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8" />
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black text-white">Filters</h2>
                <button onClick={() => setShowFilters(false)} className="text-muted-foreground"><X size={24}/></button>
              </div>
              <div className="space-y-8 max-h-[60vh] overflow-y-auto pr-2">
                <div>
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-4 block">Categories</label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(c => (
                      <button key={c.id} onClick={() => { setSelectedCategory(c.id); setShowFilters(false); }}
                        className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all border ${selectedCategory === c.id ? "bg-primary text-white border-primary" : "bg-white/5 text-muted-foreground border-white/10"}`}>
                        {c.icon} {c.label}
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={() => setShowFilters(false)} className="w-full bg-primary text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-primary/20">Show Results</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Results Sheet */}
      <AnimatePresence>
        {showMobileList && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowMobileList(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[50] md:hidden" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-white/10 rounded-t-[2.5rem] z-[60] md:hidden shadow-[0_-20px_60px_rgba(0,0,0,0.5)]">
              <div className="p-4 border-b border-white/5 flex flex-col items-center">
                <div className="w-12 h-1.5 bg-white/10 rounded-full mb-4" />
                <div className="w-full flex justify-between items-center px-4">
                  <h2 className="text-xl font-black text-white">Providers ({filteredProviders.length})</h2>
                  <button onClick={() => setShowMobileList(false)} className="text-muted-foreground bg-white/5 p-2 rounded-xl"><X size={20}/></button>
                </div>
              </div>
              <div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto custom-scrollbar">
                {filteredProviders.map(p => (
                  <div key={p.id} onClick={() => router.push(`/provider/${p.id}`)}
                    className="p-4 bg-white/5 border border-white/10 rounded-3xl flex items-center gap-4">
                    <img src={p.photo} alt={p.name} className="w-14 h-14 rounded-2xl object-cover border border-white/10" />
                    <div className="flex-1">
                      <h3 className="text-base font-black text-white">{p.name}</h3>
                      <p className="text-xs text-muted-foreground">{p.subject} • <span className="text-primary font-bold">{p.fees}</span></p>
                    </div>
                    <div className="flex items-center text-yellow-400 font-bold bg-yellow-500/10 px-3 py-1.5 rounded-xl border border-yellow-500/20">
                      <Star size={12} fill="currentColor" className="mr-1" />
                      <span className="text-sm">{p.rating}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
