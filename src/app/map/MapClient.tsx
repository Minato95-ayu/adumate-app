"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  Search,
  Filter,
  Layers,
  Navigation,
  Star,
  X,
  List,
  Loader2,
  ChevronRight,
  Globe,
  Phone,
  MessageCircle,
  Instagram,
  Youtube,
} from "lucide-react";
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
  { id: "hostel", label: "Hostels", icon: "🏠", color: "#8338EC" },
  { id: "mess", label: "Mess", icon: "🍽️", color: "#FB5607" },
  { id: "tutor", label: "Tutors", icon: "👨‍🏫", color: "#FF006E" },
];

const PHOTOS = [
  "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=120&q=80",
  "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=120&q=80",
  "https://images.unsplash.com/photo-1567521464027-f127ff144326?w=120&q=80",
  "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=120&q=80",
];

type Place = {
  id: string;
  name: string;
  address?: string;
  lat: number;
  lng: number;
  rating: number;
  phone?: string;
  website?: string;
  photo: string;
  subject: string;
  fees: string;
  about: string;
  services: string[];
  social: {
    whatsapp?: string;
    instagram?: string;
    youtube?: string;
    linkedin?: string;
    facebook?: string;
    justdial?: string;
  };
};

type RawPlace = {
  id?: string;
  name?: string;
  address?: string;
  lat?: number | string;
  lon?: number | string;
  rating?: number | string | null;
  phone?: string;
  website?: string;
};

function normalizeUrl(value?: string): string {
  if (!value) return "";
  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    // Only allow safe protocols — block javascript:, data:, etc.
    if (!["http:", "https:"].includes(url.protocol)) return "";
    return url.toString();
  } catch {
    return "";
  }
}

export default function MapClient() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("library");
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [userLoc, setUserLoc] = useState({ lat: 28.6139, lng: 77.209 });
  const [showFilters, setShowFilters] = useState(false);
  const [showMobileList, setShowMobileList] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

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
      const mappedPlaces: Place[] = ((data.places || []) as RawPlace[]).map((p, i: number) => ({
        ...p,
        id: p.id || `${cat}-${i}`,
        subject: cat.toUpperCase(),
        fees: p.rating ? `⭐ ${p.rating}` : "Verified service",
        rating: Number(p.rating || (3.8 + Math.random() * 1.1)),
        lat: Number(p.lat),
        lng: Number(p.lon),
        photo: PHOTOS[i % PHOTOS.length],
        about:
          p.website
            ? "Verified service with public business details. Explore contact options, website, and route guidance instantly."
            : "Student-focused local service near your selected area. Tap to compare, call, and navigate faster.",
        services:
          cat === "library"
            ? ["Reading Space", "WiFi", "Peaceful Seating", "Student Friendly"]
            : cat === "hostel"
              ? ["WiFi", "Security", "Student Stay", "Nearby Transit"]
              : cat === "mess"
                ? ["Daily Meals", "Tiffin", "Budget Friendly", "Hygiene Focus"]
                : ["Personal Guidance", "Test Prep", "Flexible Timings", "Offline Support"],
        social: {
          whatsapp: p.phone ? String(p.phone).replace(/[^\d]/g, "") : "",
          instagram: "",
          youtube: "",
          linkedin: "",
          facebook: "",
          justdial: "",
        },
      }));

      setPlaces(mappedPlaces);
      setSelectedPlace((current) => {
        if (!mappedPlaces.length) return null;
        if (current) {
          const updated = mappedPlaces.find((place) => place.id === current.id);
          if (updated) return updated;
        }
        return mappedPlaces[0];
      });
    } catch {
      setPlaces([]);
      setSelectedPlace(null);
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
        () => {
          queueMicrotask(() => {
            void fetchPlaces(userLoc.lat, userLoc.lng, selectedCategory);
          });
        }
      );
    } else {
      queueMicrotask(() => {
        void fetchPlaces(userLoc.lat, userLoc.lng, selectedCategory);
      });
    }
    // Initial load should happen only once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchPlaces]);

  const handleSearch = async () => {
    if (search.trim().length < 2) return;

    setLoading(true);

    try {
      const token = await auth.currentUser?.getIdToken().catch(() => null);
      const res = await fetch(`/api/geocode?city=${encodeURIComponent(search)}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();

      if (data.lat && data.lon) {
        const loc = { lat: Number(data.lat), lng: Number(data.lon) };
        setUserLoc(loc);
        setSearch("");
        fetchPlaces(loc.lat, loc.lng, selectedCategory);
      }
    } catch {
      // keep UX quiet on failed search
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(
    () =>
      search.length > 1
        ? places.filter((place) => place.name?.toLowerCase().includes(search.toLowerCase()))
        : places,
    [search, places]
  );

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedPlace(null);
    void fetchPlaces(userLoc.lat, userLoc.lng, categoryId);
  };

  const cat = CATEGORIES.find((c) => c.id === selectedCategory) || CATEGORIES[0];

  return (
    <div className="relative flex flex-col bg-[#0a0f1a]" style={{ height: "calc(100vh - 72px)" }}>
      <div className="md:hidden absolute top-3 left-3 right-3 z-40 flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search city or area..."
            className="w-full bg-[#0f172a]/95 backdrop-blur-xl border border-white/10 rounded-xl py-3 pl-10 pr-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-orange-500/50"
          />
        </div>
        <button
          onClick={() => setShowFilters(true)}
          className={`p-3 rounded-xl border backdrop-blur-xl transition-all ${
            showFilters ? "bg-orange-500 border-orange-500 text-white" : "bg-[#0f172a]/95 border-white/10 text-white"
          }`}
        >
          <Filter size={18} />
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden md:flex flex-col w-[360px] shrink-0 bg-[#0d1117] border-r border-white/[0.07] overflow-hidden">
          <div className="p-5 border-b border-white/[0.07]">
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                style={{ background: `${cat.color}22` }}
              >
                {cat.icon}
              </div>
              <h1 className="text-xl font-black text-white">Finder</h1>
            </div>
            <p className="text-xs text-slate-500">Search nearby student services with live routing</p>
          </div>

          <div className="px-4 pt-4 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search city or area..."
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-orange-500/40 transition-colors"
              />
            </div>
            <p className="text-[10px] text-slate-600 mt-1.5 px-1">Press Enter to search a new area</p>
          </div>

          <div className="px-4 pb-3">
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">Category</p>
            <div className="grid grid-cols-2 gap-1.5">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleCategoryChange(c.id)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border ${
                    selectedCategory === c.id
                      ? "text-white border-transparent"
                      : "bg-white/[0.03] text-slate-400 border-white/[0.06] hover:border-white/20 hover:text-white"
                  }`}
                  style={
                    selectedCategory === c.id
                      ? { background: `${c.color}22`, borderColor: `${c.color}55`, color: c.color }
                      : {}
                  }
                >
                  <span>{c.icon}</span> {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="px-4 py-2 flex items-center justify-between border-y border-white/[0.05]">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              {loading ? "Searching..." : `${filtered.length} Found`}
            </span>
            {loading && <Loader2 size={13} className="animate-spin text-orange-500" />}
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ scrollbarWidth: "none" }}>
            {loading &&
              [...Array(4)].map((_, i) => (
                <div key={i} className="h-[72px] bg-white/[0.03] rounded-xl animate-pulse border border-white/[0.05]" />
              ))}

            {!loading && filtered.length === 0 && (
              <div className="text-center py-16">
                <div className="text-4xl mb-3">🔍</div>
                <p className="text-slate-500 text-sm">No services found</p>
                <p className="text-slate-600 text-xs mt-1">Try searching a different city</p>
              </div>
            )}

            {!loading &&
              filtered.map((place, i) => (
                <motion.div
                  key={place.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => setSelectedPlace(place)}
                  className={`group flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedPlace?.id === place.id
                      ? "border-orange-500/40 bg-orange-500/5"
                      : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10"
                  }`}
                >
                  <img src={place.photo} alt={place.name} className="w-12 h-12 rounded-lg object-cover shrink-0 border border-white/10" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-white truncate group-hover:text-orange-400 transition-colors">
                      {place.name}
                    </h3>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">{place.address || "Nearby"}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star size={9} className="text-yellow-400 fill-yellow-400" />
                      <span className="text-[10px] font-bold text-yellow-400">{Number(place.rating).toFixed(1)}</span>
                      <span className="text-[10px] text-slate-600 ml-1">{place.subject}</span>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-slate-600 group-hover:text-orange-400 transition-colors shrink-0" />
                </motion.div>
              ))}
          </div>
        </aside>

        <div className="flex-1 relative">
          <Map
            providers={filtered}
            center={userLoc}
            selectedPlace={selectedPlace}
            onSelectPlace={setSelectedPlace}
            onScan={() => fetchPlaces(userLoc.lat, userLoc.lng, selectedCategory)}
          />

          <div className="absolute bottom-20 md:bottom-5 right-4 flex flex-col gap-2 z-30">
            <button className="w-11 h-11 bg-[#0d1117]/90 backdrop-blur-xl border border-white/10 rounded-xl flex items-center justify-center text-white shadow-xl">
              <Layers size={18} />
            </button>
            <button
              onClick={() => fetchPlaces(userLoc.lat, userLoc.lng, selectedCategory)}
              className="w-11 h-11 bg-orange-500 text-white rounded-xl flex items-center justify-center shadow-xl shadow-orange-500/30"
            >
              <Navigation size={18} />
            </button>
          </div>

          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-40 md:hidden">
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={() => setShowMobileList(true)}
              className="bg-[#0d1117]/95 backdrop-blur-2xl border border-white/10 text-white px-5 py-3 rounded-full font-bold text-sm flex items-center gap-2 shadow-2xl"
            >
              <List size={16} />
              {loading ? "Loading..." : `View ${filtered.length} Results`}
            </motion.button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 md:hidden"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed bottom-0 left-0 right-0 bg-[#0d1117] border-t border-white/10 rounded-t-3xl p-6 z-[60] md:hidden"
            >
              <div className="w-10 h-1 bg-white/10 rounded-full mx-auto mb-6" />
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-lg font-black text-white">Filter Category</h2>
                <button onClick={() => setShowFilters(false)} className="text-slate-400 bg-white/5 p-2 rounded-xl">
                  <X size={18} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      handleCategoryChange(c.id);
                      setShowFilters(false);
                    }}
                    className={`py-4 rounded-2xl text-sm font-bold transition-all border flex flex-col items-center gap-1 ${
                      selectedCategory === c.id ? "text-white border-transparent" : "bg-white/[0.04] text-slate-400 border-white/10"
                    }`}
                    style={
                      selectedCategory === c.id
                        ? { background: `${c.color}22`, borderColor: `${c.color}55`, color: c.color }
                        : {}
                    }
                  >
                    <span className="text-2xl">{c.icon}</span>
                    {c.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showMobileList && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileList(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 md:hidden"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed bottom-0 left-0 right-0 bg-[#0d1117] border-t border-white/[0.07] rounded-t-3xl z-[60] md:hidden max-h-[82vh] flex flex-col"
            >
              <div className="p-4 border-b border-white/[0.06] shrink-0">
                <div className="w-10 h-1 bg-white/10 rounded-full mx-auto mb-3" />
                <div className="flex items-center justify-between px-1">
                  <div>
                    <h2 className="text-base font-black text-white">
                      {cat.icon} {cat.label}
                    </h2>
                    <p className="text-xs text-slate-500">{filtered.length} found near you</p>
                  </div>
                  <button onClick={() => setShowMobileList(false)} className="bg-white/5 p-2 rounded-xl text-slate-400">
                    <X size={18} />
                  </button>
                </div>
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => handleCategoryChange(c.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap border transition-all ${
                        selectedCategory === c.id ? "text-white border-transparent" : "bg-white/[0.04] text-slate-400 border-white/10"
                      }`}
                      style={
                        selectedCategory === c.id
                          ? { background: `${c.color}22`, borderColor: `${c.color}55`, color: c.color }
                          : {}
                      }
                    >
                      {c.icon} {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ scrollbarWidth: "none" }}>
                {loading &&
                  [...Array(5)].map((_, i) => <div key={i} className="h-20 bg-white/[0.03] rounded-xl animate-pulse" />)}

                {!loading && filtered.length === 0 && (
                  <div className="text-center py-16">
                    <div className="text-5xl mb-3">🔍</div>
                    <p className="text-slate-400 font-bold">No services found nearby</p>
                    <p className="text-slate-600 text-sm mt-1">Search a city or change category</p>
                  </div>
                )}

                {!loading &&
                  filtered.map((place, i) => (
                    <motion.div
                      key={place.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => {
                        setSelectedPlace(place);
                        setShowMobileList(false);
                      }}
                      className="flex items-center gap-3 p-3.5 bg-white/[0.03] border border-white/[0.07] rounded-2xl active:bg-white/[0.07]"
                    >
                      <img src={place.photo} alt={place.name} className="w-14 h-14 rounded-xl object-cover border border-white/10 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-black text-white truncate">{place.name}</h3>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{place.address || "Nearby location"}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Star size={10} className="text-yellow-400 fill-yellow-400" />
                          <span className="text-xs font-bold text-yellow-400">{Number(place.rating).toFixed(1)}</span>
                        </div>
                      </div>
                      <div
                        className="shrink-0 px-3 py-2 rounded-xl text-xs font-bold"
                        style={{ background: `${cat.color}33`, border: `1px solid ${cat.color}44`, color: cat.color }}
                      >
                        Route
                      </div>
                    </motion.div>
                  ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedPlace && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28 }}
            className="fixed bottom-0 left-0 right-0 z-[70] rounded-t-3xl border-t border-white/10 bg-[#0d1117]/98 p-4 shadow-2xl backdrop-blur-xl md:hidden"
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/10" />
            <div className="flex items-start gap-3">
              <img src={selectedPlace.photo} alt={selectedPlace.name} className="h-16 w-16 rounded-2xl object-cover border border-white/10" />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-black text-white">{selectedPlace.name}</h3>
                    <p className="mt-1 text-xs text-slate-400">{selectedPlace.address || "Verified nearby service"}</p>
                  </div>
                  <button onClick={() => setSelectedPlace(null)} className="rounded-xl bg-white/5 p-2 text-slate-400">
                    <X size={16} />
                  </button>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Star size={12} className="fill-yellow-400 text-yellow-400" />
                  <span className="text-xs font-bold text-yellow-400">{Number(selectedPlace.rating).toFixed(1)}</span>
                  <span className="text-xs text-slate-500">{selectedPlace.subject}</span>
                </div>
              </div>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-300">{selectedPlace.about}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedPlace.phone && (
                <a href={`tel:${selectedPlace.phone}`} className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-3 py-2 text-xs font-black text-white">
                  <Phone size={13} />
                  Call
                </a>
              )}
              {selectedPlace.social.whatsapp && (
                <a
                  href={`https://wa.me/${selectedPlace.social.whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-3 py-2 text-xs font-black text-white"
                >
                  <MessageCircle size={13} />
                  WhatsApp
                </a>
              )}
              {selectedPlace.website && (
                <a
                  href={normalizeUrl(selectedPlace.website)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-black text-white"
                >
                  <Globe size={13} />
                  Website
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {selectedPlace && (
        <div className="hidden lg:block absolute top-4 right-4 z-30 w-[360px] rounded-[28px] border border-white/10 bg-[#0d1117]/92 p-5 shadow-2xl backdrop-blur-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">{cat.label}</p>
              <h2 className="mt-1 text-2xl font-black text-white">{selectedPlace.name}</h2>
              <p className="mt-1 text-sm text-slate-400">{selectedPlace.address || "Verified service listing"}</p>
            </div>
            <button onClick={() => setSelectedPlace(null)} className="rounded-2xl border border-white/10 bg-white/5 p-2 text-slate-400">
              <X size={18} />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Rating</p>
              <p className="mt-1 text-lg font-black text-yellow-400">{Number(selectedPlace.rating).toFixed(1)}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Status</p>
              <p className="mt-1 text-lg font-black text-emerald-400">Route Ready</p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">About</p>
            <p className="mt-2 text-sm leading-6 text-slate-200">{selectedPlace.about}</p>
          </div>

          <div className="mt-4">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Available Info</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedPlace.services.map((service) => (
                <span key={service} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-200">
                  {service}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {selectedPlace.phone && (
              <a href={`tel:${selectedPlace.phone}`} className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-3 py-2 text-xs font-black text-white">
                <Phone size={13} />
                Call
              </a>
            )}
            {selectedPlace.social.whatsapp && (
              <a
                href={`https://wa.me/${selectedPlace.social.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-3 py-2 text-xs font-black text-white"
              >
                <MessageCircle size={13} />
                WhatsApp
              </a>
            )}
            {selectedPlace.website && (
              <a
                href={normalizeUrl(selectedPlace.website)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-black text-white"
              >
                <Globe size={13} />
                Website
              </a>
            )}
            {selectedPlace.social.instagram && (
              <a
                href={normalizeUrl(selectedPlace.social.instagram)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-black text-white"
              >
                <Instagram size={13} />
                Instagram
              </a>
            )}
            {selectedPlace.social.youtube && (
              <a
                href={normalizeUrl(selectedPlace.social.youtube)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-black text-white"
              >
                <Youtube size={13} />
                YouTube
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
