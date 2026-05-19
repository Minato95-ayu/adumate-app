"use client";

import { useState } from "react";
import { ShieldCheck, MapPin, Search, Star, Wifi, Coffee, Clock, Navigation, SlidersHorizontal, BookOpen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const MOCK_LIBRARIES = [
  {
    id: "1",
    name: "The Scholar's Hub Library",
    location: "Rajiv Nagar, Patna",
    distance: "1.2 km away",
    price: 800,
    rating: 4.8,
    reviews: 124,
    verified: true,
    availableSeats: 12,
    totalSeats: 100,
    features: ["High-Speed WiFi", "Fully AC", "RO Water", "CCTV Security"],
    image: "https://images.unsplash.com/photo-1568667256549-094345857637?w=800&q=80",
    tags: ["24/7 Open", "Popular"]
  },
  {
    id: "2",
    name: "Focus Point Study Circle",
    location: "Boring Road, Patna",
    distance: "2.5 km away",
    price: 1200,
    rating: 4.9,
    reviews: 312,
    verified: true,
    availableSeats: 3,
    totalSeats: 150,
    features: ["Personal Desk", "Ergonomic Chairs", "Cafe", "Discussion Room"],
    image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&q=80",
    tags: ["Premium", "Almost Full"]
  },
  {
    id: "3",
    name: "Zenith Reading Room",
    location: "Kankarbagh, Patna",
    distance: "3.8 km away",
    price: 600,
    rating: 4.5,
    reviews: 89,
    verified: false,
    availableSeats: 45,
    totalSeats: 80,
    features: ["WiFi", "Non-AC", "Quiet Zone"],
    image: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800&q=80",
    tags: ["Budget Friendly"]
  },
  {
    id: "4",
    name: "Aarambh Library",
    location: "Kadamkuan, Patna",
    distance: "4.1 km away",
    price: 900,
    rating: 4.7,
    reviews: 156,
    verified: true,
    availableSeats: 0,
    totalSeats: 60,
    features: ["AC", "Locker Facility", "Newspapers", "Tea/Coffee"],
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80",
    tags: ["Waitlist Available"]
  }
];

export default function LibrariesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCity, setActiveCity] = useState("Patna");

  const CITIES = ["Patna", "Kota", "Delhi", "Prayagraj"];

  return (
    <div className="min-h-screen bg-[#050810] text-white selection:bg-primary/30">
      {/* Hero Section */}
      <div className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-widest mb-6">
            <ShieldCheck size={14} /> 100% Verified Listings
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
            Find the Perfect <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Reading Room</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed mb-10">
            Book a seat in top-rated, verified libraries. Filter by AC, WiFi speed, and live seat availability in your city.
          </p>

          {/* Search & Filter Bar */}
          <div className="max-w-4xl mx-auto bg-slate-900/60 backdrop-blur-2xl border border-white/10 p-3 rounded-3xl flex flex-col md:flex-row gap-3 shadow-2xl">
            <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-white/5 rounded-2xl border border-white/5">
              <Search size={20} className="text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by locality or library name..." 
                className="bg-transparent border-none outline-none text-white w-full placeholder:text-slate-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex gap-3 overflow-x-auto custom-scrollbar pb-2 md:pb-0">
              {CITIES.map(city => (
                <button 
                  key={city}
                  onClick={() => setActiveCity(city)}
                  className={`px-6 py-3 rounded-2xl font-bold transition-all whitespace-nowrap shrink-0 ${activeCity === city ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25" : "bg-white/5 text-slate-300 hover:bg-white/10"}`}
                >
                  {city}
                </button>
              ))}
            </div>
            
            <button className="px-5 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl border border-white/5 transition-all flex items-center justify-center gap-2 shrink-0 md:w-auto w-full">
              <SlidersHorizontal size={18} /> Filters
            </button>
          </div>
        </div>
      </div>

      {/* Library Listings */}
      <div className="max-w-7xl mx-auto px-6 pb-32">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black">Showing libraries in {activeCity}</h2>
          <p className="text-slate-400 text-sm font-medium">Found {MOCK_LIBRARIES.length} results</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_LIBRARIES.map((lib) => (
            <div key={lib.id} className="group relative bg-slate-900/40 border border-white/10 rounded-[2rem] overflow-hidden hover:border-blue-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/10 flex flex-col">
              
              {/* Image Container */}
              <div className="relative h-56 w-full overflow-hidden">
                <Image 
                  src={lib.image} 
                  alt={lib.name} 
                  fill 
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                
                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {lib.verified && (
                    <div className="bg-green-500/90 backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
                      <ShieldCheck size={12} /> Adumate Verified
                    </div>
                  )}
                  {lib.tags.map(tag => (
                    <div key={tag} className="bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full w-max border border-white/10">
                      {tag}
                    </div>
                  ))}
                </div>

                {/* Rating */}
                <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md border border-white/10 px-2 py-1 rounded-xl flex items-center gap-1 shadow-lg">
                  <Star size={12} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-sm font-black">{lib.rating}</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-black mb-1 line-clamp-1">{lib.name}</h3>
                
                <div className="flex items-center justify-between mb-4">
                  <p className="text-slate-400 text-sm flex items-center gap-1.5">
                    <MapPin size={14} className="text-blue-400" /> {lib.location}
                  </p>
                  <p className="text-xs text-slate-500 bg-white/5 px-2 py-1 rounded-md">{lib.distance}</p>
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {lib.features.slice(0,3).map(f => (
                    <span key={f} className="text-xs font-medium text-slate-300 bg-white/5 border border-white/5 px-2.5 py-1 rounded-lg flex items-center gap-1">
                      {f.includes("WiFi") && <Wifi size={10} className="text-blue-400"/>}
                      {f.includes("AC") && <span className="text-blue-400">❄️</span>}
                      {f.includes("Coffee") && <Coffee size={10} className="text-orange-400"/>}
                      {f}
                    </span>
                  ))}
                  {lib.features.length > 3 && (
                    <span className="text-xs font-medium text-slate-500 bg-white/5 px-2 py-1 rounded-lg">+{lib.features.length - 3}</span>
                  )}
                </div>

                {/* Footer/Action */}
                <div className="mt-auto pt-5 border-t border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-black text-white flex items-center">
                      ₹{lib.price} <span className="text-sm text-slate-500 font-medium ml-1">/mo</span>
                    </p>
                    <p className={`text-xs font-bold mt-1 ${lib.availableSeats === 0 ? "text-red-400" : lib.availableSeats < 10 ? "text-orange-400" : "text-green-400"}`}>
                      {lib.availableSeats === 0 ? "Seats Full" : `${lib.availableSeats} seats left`}
                    </p>
                  </div>
                  
                  <Link 
                    href={`/map?service=library&id=${lib.id}`} 
                    className={`px-6 py-3 rounded-xl font-black text-sm flex items-center gap-2 transition-all ${
                      lib.availableSeats === 0 
                      ? "bg-white/5 text-slate-400 cursor-not-allowed" 
                      : "bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                    }`}
                  >
                    {lib.availableSeats === 0 ? "Join Waitlist" : "Book Seat"}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to action for partners */}
        <div className="mt-20 bg-gradient-to-br from-blue-900/40 to-slate-900 border border-blue-500/20 rounded-[3rem] p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10 relative overflow-hidden shadow-2xl">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500/20 blur-[100px] rounded-full"></div>
          <div className="relative z-10 max-w-xl">
            <h2 className="text-3xl md:text-4xl font-black mb-4">Own a Library in {activeCity}?</h2>
            <p className="text-slate-400 text-lg leading-relaxed mb-8">
              Join Adumate's Trust Layer. Get verified, manage seats digitally, and reach thousands of students in your city. Zero listing fee.
            </p>
            <Link href="/register-provider" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-900 font-black rounded-2xl hover:scale-105 transition-all">
              <BookOpen size={20} /> List Your Library Free
            </Link>
          </div>
          <div className="relative z-10 hidden md:block">
            <div className="w-48 h-48 bg-blue-500/10 border-2 border-blue-500/30 rounded-3xl rotate-12 flex items-center justify-center backdrop-blur-xl">
               <ShieldCheck size={80} className="text-blue-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
