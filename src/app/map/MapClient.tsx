"use client";
import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Search, MapPin, Filter, Layers, Navigation, Star, X, List, Loader2, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { auth } from "@/lib/firebase";

const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-[#0a0f1a] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-400 text-sm font-semibold">Loading Map...</p>
      </div>
    </div>
  ),
});

const CATEGORIES = [
  { id: "library", label: "Libraries", icon: "📚", color: "#00D4FF" },
  { id: "hostel",  label: "Hostels",   icon: "🏠", color: "#8338EC" },
  { id: "mess",    label: "Mess",      icon: "🍽️", color: "#FB5607" },
  { id: "tutor",   label: "Tutors",    icon: "👨‍🏫", color: "#FF006E" },
];

const PHOTOS = [
  "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=120&q=80",
  "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=120&q=80",
  "https://images.unsplash.com/photo-1567521464027-f127ff144326?w=120&q=80",
  "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=120&q=80",
];

export default function MapClient() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("library");
  const [places, setPlaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [userLoc, setUserLoc] = useState({ lat: 28.6139, lng: 77.2090 });
  const [showFilters, setShowFilters] = useState(false);
  const [showMobileList, setShowMobileList] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);

  const fetchPlaces = useCallback(async (lat: number, lng: number, cat: string) => {
    setLoading(true);
    setPlaces([]);
    try {
      const token = await auth.currentUser?.getIdToken().catch(() => null);
      const res = await fetch(`/api/places?lat=${lat}&lon=${lng}&category=${cat}&radius=8000`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      if (data.places?.length) {
        setPlaces(data.places.map((p: any, i: number) => ({
          ...p,
          id: p.id || `${i}`,
          subject: cat.toUpperCase(),
          fees: p.rating ? `⭐ ${p.rating}` : "Service",
          rating: p.rating || (3.8 + Math.random() * 1.1),
          lat: p.lat,
          lng: p.lon,
          photo: PHOTOS[i % PHOTOS.length],
          social: { whatsapp: p.phone || "9100000000" },
        })));
      }
    } catch {
      setPlaces([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof navigator !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLoc(loc);
          fetchPlaces(loc.lat, loc.lng, selectedCategory);
        },
        () => fetchPlaces(userLoc.lat, userLoc.lng, selectedCategory)
      );
    } else {
      fetchPlaces(userLoc.lat, userLoc.lng, selectedCategory);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  const handleSearch = async () => {
    if (search.length < 2) return;
    setLoading(true);
    try {
      const token = await auth.currentUser?.getIdToken().catch(() => null);
      const res = await fetch(`/api/geocode?city=${encodeURIComponent(search)}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.lat && data.lon) {
        const loc = { lat: data.lat, lng: data.lon };
        setUserLoc(loc);
        setSearch("");
        fetchPlaces(loc.lat, loc.lng, selectedCategory);
      }
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  const filtered = useMemo(() =>
    search.length > 1
      ? places.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()))
      : places,
    [search, places]
  );

  const cat = CATEGORIES.find(c => c.id === selectedCategory)!;

  return (
    <div className="relative flex flex-col bg-[#0a0f1a]" style={{ height: "calc(100vh - 72px)" }}>

      {/* ── MOBILE TOP BAR ── */}
      <div className="md:hidden absolute top-3 left-3 right-3 z-40 flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            placeholder="Search city or area..."
            className="w-full bg-[#0f172a]/95 backdrop-blur-xl border border-white/10 rounded-xl py-3 pl-10 pr-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-orange-500/50"
          />
        </div>
        <button onClick={() => setShowFilters(true)}
          className={`p-3 rounded-xl border backdrop-blur-xl transition-all ${showFilters ? "bg-orange-500 border-orange-500 text-white" : "bg-[#0f172a]/95 border-white/10 text-white"}`}>
          <Filter size={18} />
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* ── DESKTOP SIDEBAR ── */}
        <aside className="hidden md:flex flex-col w-[340px] shrink-0 bg-[#0d1117] border-r border-white/[0.07] overflow-hidden">

          {/* Header */}
          <div className="p-5 border-b border-white/[0.07]">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg" style={{ background: `${cat.color}22` }}>
                {cat.icon}
              </div>
              <h1 className="text-xl font-black text-white">Finder</h1>
            </div>
            <p className="text-xs text-slate-500">Nearby student services</p>
          </div>

          {/* Search */}
          <div className="px-4 pt-4 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
                placeholder="Search city or area..."
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-orange-500/40 transition-colors"
              />
            </div>
            <p className="text-[10px] text-slate-600 mt-1.5 px-1">Press Enter to search new area</p>
          </div>

          {/* Categories */}
          <div className="px-4 pb-3">
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">Category</p>
            <div className="grid grid-cols-2 gap-1.5">
              {CATEGORIES.map(c => (
                <button key={c.id} onClick={() => setSelectedCategory(c.id)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border ${
                    selectedCategory === c.id
                      ? "text-white border-transparent"
                      : "bg-white/[0.03] text-slate-400 border-white/[0.06] hover:border-white/20 hover:text-white"
                  }`}
                  style={selectedCategory === c.id ? { background: `${c.color}22`, borderColor: `${c.color}55`, color: c.color } : {}}>
                  <span>{c.icon}</span> {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Results count */}
          <div className="px-4 py-2 flex items-center justify-between border-y border-white/[0.05]">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              {loading ? "Searching..." : `${filtered.length} Found`}
            </span>
            {loading && <Loader2 size={13} className="animate-spin text-orange-500" />}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ scrollbarWidth: "none" }}>
            {loading && [...Array(4)].map((_, i) => (
              <div key={i} className="h-[72px] bg-white/[0.03] rounded-xl animate-pulse border border-white/[0.05]" />
            ))}
            {!loading && filtered.length === 0 && (
              <div className="text-center py-16">
                <div className="text-4xl mb-3">🔍</div>
                <p className="text-slate-500 text-sm">No services found</p>
                <p className="text-slate-600 text-xs mt-1">Try searching a different city</p>
              </div>
            )}
            {!loading && filtered.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                onClick={() => setSelectedPlace(p)}
                className={`group flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedPlace?.id === p.id
                    ? "border-orange-500/40 bg-orange-500/5"
                    : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10"
                }`}>
                <img src={p.photo} alt={p.name} className="w-12 h-12 rounded-lg object-cover shrink-0 border border-white/10" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-white truncate group-hover:text-orange-400 transition-colors">{p.name}</h3>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5">{p.address || "Nearby"}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star size={9} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-[10px] font-bold text-yellow-400">{Number(p.rating).toFixed(1)}</span>
                    <span className="text-[10px] text-slate-600 ml-1">{p.subject}</span>
                  </div>
                </div>
                <ChevronRight size={14} className="text-slate-600 group-hover:text-orange-400 transition-colors shrink-0" />
              </motion.div>
            ))}
          </div>
        </aside>

        {/* ── MAP ── */}
        <div className="flex-1 relative">
          <Map providers={filtered} center={userLoc} onScan={() => fetchPlaces(userLoc.lat, userLoc.lng, selectedCategory)} />

          {/* Map FABs */}
          <div className="absolute bottom-20 md:bottom-5 right-4 flex flex-col gap-2 z-30">
            <button className="w-11 h-11 bg-[#0d1117]/90 backdrop-blur-xl border border-white/10 rounded-xl flex items-center justify-center text-white shadow-xl">
              <Layers size={18} />
            </button>
            <button onClick={() => fetchPlaces(userLoc.lat, userLoc.lng, selectedCategory)}
              className="w-11 h-11 bg-orange-500 text-white rounded-xl flex items-center justify-center shadow-xl shadow-orange-500/30">
              <Navigation size={18} />
            </button>
          </div>

          {/* Mobile List Toggle */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-40 md:hidden">
            <motion.button whileTap={{ scale: 0.93 }} onClick={() => setShowMobileList(true)}
              className="bg-[#0d1117]/95 backdrop-blur-2xl border border-white/10 text-white px-5 py-3 rounded-full font-bold text-sm flex items-center gap-2 shadow-2xl">
              <List size={16} />
              {loading ? "Loading..." : `View ${filtered.length} Results`}
            </motion.button>
          </div>
        </div>
      </div>

      {/* ── MOBILE CATEGORY FILTER SHEET ── */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 md:hidden" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25 }}
              className="fixed bottom-0 left-0 right-0 bg-[#0d1117] border-t border-white/10 rounded-t-3xl p-6 z-[60] md:hidden">
              <div className="w-10 h-1 bg-white/10 rounded-full mx-auto mb-6" />
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-lg font-black text-white">Filter Category</h2>
                <button onClick={() => setShowFilters(false)} className="text-slate-400 bg-white/5 p-2 rounded-xl"><X size={18} /></button>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {CATEGORIES.map(c => (
                  <button key={c.id} onClick={() => { setSelectedCategory(c.id); setShowFilters(false); }}
                    className={`py-4 rounded-2xl text-sm font-bold transition-all border flex flex-col items-center gap-1 ${
                      selectedCategory === c.id ? "text-white border-transparent" : "bg-white/[0.04] text-slate-400 border-white/10"
                    }`}
                    style={selectedCategory === c.id ? { background: `${c.color}22`, borderColor: `${c.color}55`, color: c.color } : {}}>
                    <span className="text-2xl">{c.icon}</span>
                    {c.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── MOBILE RESULTS SHEET ── */}
      <AnimatePresence>
        {showMobileList && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowMobileList(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 md:hidden" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25 }}
              className="fixed bottom-0 left-0 right-0 bg-[#0d1117] border-t border-white/[0.07] rounded-t-3xl z-[60] md:hidden max-h-[80vh] flex flex-col">

              {/* Sheet Header */}
              <div className="p-4 border-b border-white/[0.06] shrink-0">
                <div className="w-10 h-1 bg-white/10 rounded-full mx-auto mb-3" />
                <div className="flex items-center justify-between px-1">
                  <div>
                    <h2 className="text-base font-black text-white">{cat.icon} {cat.label}</h2>
                    <p className="text-xs text-slate-500">{filtered.length} found near you</p>
                  </div>
                  <button onClick={() => setShowMobileList(false)} className="bg-white/5 p-2 rounded-xl text-slate-400"><X size={18} /></button>
                </div>
                {/* Inline category tabs */}
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                  {CATEGORIES.map(c => (
                    <button key={c.id} onClick={() => setSelectedCategory(c.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap border transition-all ${
                        selectedCategory === c.id ? "text-white border-transparent" : "bg-white/[0.04] text-slate-400 border-white/10"
                      }`}
                      style={selectedCategory === c.id ? { background: `${c.color}22`, borderColor: `${c.color}55`, color: c.color } : {}}>
                      {c.icon} {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sheet List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ scrollbarWidth: "none" }}>
                {loading && [...Array(5)].map((_, i) => (
                  <div key={i} className="h-20 bg-white/[0.03] rounded-xl animate-pulse" />
                ))}
                {!loading && filtered.length === 0 && (
                  <div className="text-center py-16">
                    <div className="text-5xl mb-3">🔍</div>
                    <p className="text-slate-400 font-bold">No services found nearby</p>
                    <p className="text-slate-600 text-sm mt-1">Search a city or change category</p>
                  </div>
                )}
                {!loading && filtered.map((p, i) => (
                  <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    onClick={() => { setShowMobileList(false); setSelectedPlace(p); }}
                    className="flex items-center gap-3 p-3.5 bg-white/[0.03] border border-white/[0.07] rounded-2xl active:bg-white/[0.07]">
                    <img src={p.photo} alt={p.name} className="w-14 h-14 rounded-xl object-cover border border-white/10 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-black text-white truncate">{p.name}</h3>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{p.address || "Nearby location"}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star size={10} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-xs font-bold text-yellow-400">{Number(p.rating).toFixed(1)}</span>
                      </div>
                    </div>
                    <button onClick={e => { e.stopPropagation(); router.push(`/provider/${p.id}`); }}
                      className="shrink-0 px-3 py-2 rounded-xl text-xs font-bold text-white"
                      style={{ background: `${cat.color}33`, border: `1px solid ${cat.color}44`, color: cat.color }}>
                      View
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── PLACE DETAIL MODAL (Desktop) ── */}
      <AnimatePresence>
        {selectedPlace && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedPlace(null)}
              className="hidden md:block fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              className="hidden md:block fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] w-[420px] bg-[#0d1117] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
              <img src={selectedPlace.photo} alt={selectedPlace.name} className="w-full h-44 object-cover" />
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h2 className="text-xl font-black text-white">{selectedPlace.name}</h2>
                    <p className="text-sm text-slate-400 mt-0.5">{selectedPlace.address || "Nearby"}</p>
                  </div>
                  <button onClick={() => setSelectedPlace(null)} className="bg-white/5 p-2 rounded-xl text-slate-400 shrink-0"><X size={16} /></button>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-white/[0.04] rounded-xl p-3 border border-white/[0.06]">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Rating</p>
                    <p className="text-sm font-black text-yellow-400">⭐ {Number(selectedPlace.rating).toFixed(1)}</p>
                  </div>
                  <div className="bg-white/[0.04] rounded-xl p-3 border border-white/[0.06]">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Category</p>
                    <p className="text-sm font-black text-white">{cat.icon} {cat.label}</p>
                  </div>
                </div>
                {selectedPlace.phone && (
                  <a href={`tel:${selectedPlace.phone}`}
                    className="block w-full py-3 rounded-xl text-center text-sm font-black text-white mb-2 transition-opacity hover:opacity-80"
                    style={{ background: "linear-gradient(135deg,#FB5607,#FF006E)" }}>
                    📞 Call Now
                  </a>
                )}
                <a href={`https://wa.me/${selectedPlace.social?.whatsapp || "9100000000"}`} target="_blank"
                  className="block w-full py-3 rounded-xl text-center text-sm font-black text-white transition-opacity hover:opacity-80"
                  style={{ background: "linear-gradient(135deg,#25D366,#128C7E)" }}>
                  💬 WhatsApp
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
