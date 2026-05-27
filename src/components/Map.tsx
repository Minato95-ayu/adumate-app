"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  MapContainer, Marker, Popup, TileLayer,
  useMap, Polyline, CircleMarker,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  MapPin, Phone, Globe, Navigation, Layers, Car, PersonStanding,
  Bike, Volume2, VolumeX, ChevronRight, X, Locate, Clock, Info,
  ExternalLink, Search, Zap, BookOpen, Home, Utensils, GraduationCap,
  Briefcase, Star, Radio,
} from "lucide-react";

// ── Inline social icons ────────────────────────────────────────────────────
const Instagram = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <circle cx="12" cy="12" r="4"/>
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
  </svg>
);
const Facebook = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);
const Youtube = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.54 6.42A2.78 2.78 0 0 0 20.6 4.46C18.88 4 12 4 12 4s-6.88 0-8.6.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.4 19.54C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" stroke="none"/>
  </svg>
);
const Twitter = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53A4.48 4.48 0 0 0 22.43.36a9 9 0 0 1-2.85 1.09A4.52 4.52 0 0 0 11.5 8a12.8 12.8 0 0 1-9.29-4.71 4.52 4.52 0 0 0 1.4 6.04A4.48 4.48 0 0 1 1.64 9v.06a4.52 4.52 0 0 0 3.62 4.43 4.52 4.52 0 0 1-2.04.08 4.52 4.52 0 0 0 4.22 3.14A9.07 9.07 0 0 1 1 19.54 12.78 12.78 0 0 0 7.88 21.5c8.26 0 12.78-6.84 12.78-12.78 0-.2 0-.39-.01-.58A9.11 9.11 0 0 0 23 3z"/>
  </svg>
);
const WhatsApp = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
  </svg>
);

import { Provider } from "@/data/providers";
import type { PlaceInfo } from "@/app/api/place-info/route";
import type { RoutePlace } from "@/app/api/route-discover/route";

type Place = Provider & {
  phone?: string; website?: string; about?: string;
  services?: string[];
  social?: Provider["social"] & { linkedin?: string; facebook?: string; justdial?: string };
  distanceKm?: number | null;
};

// Category metadata
const CAT_META: Record<string, { icon: React.ReactNode; color: string; label: string; bg: string }> = {
  library:  { icon: <BookOpen size={12}/>,     color: "#00D4FF", label: "Library",  bg: "#00D4FF22" },
  hostel:   { icon: <Home size={12}/>,          color: "#8338EC", label: "Hostel",   bg: "#8338EC22" },
  mess:     { icon: <Utensils size={12}/>,      color: "#FB5607", label: "Mess",     bg: "#FB560722" },
  tutor:    { icon: <GraduationCap size={12}/>, color: "#FF006E", label: "Tutor",    bg: "#FF006E22" },
  job:      { icon: <Briefcase size={12}/>,     color: "#FFBE0B", label: "Job",      bg: "#FFBE0B22" },
  service:  { icon: <Zap size={12}/>,           color: "#06D6A0", label: "Service",  bg: "#06D6A022" },
};

function getCatMeta(cat: string) {
  return CAT_META[cat] || CAT_META.service;
}

// Haversine
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDist(km: number): string {
  return km < 1 ? `${(km * 1000).toFixed(0)} m` : `${km.toFixed(1)} km`;
}

interface NavStep { instruction: string; distance: number; duration: number; type: number; }
interface RouteSummary { distanceKm: number; durationMin: number; steps: NavStep[]; }
interface MapProps {
  providers: Place[];
  center?: { lat: number; lng: number };
  onScan?: () => void;
  selectedPlace?: Place | null;
  onSelectPlace?: (place: Place | null) => void;
}

type TravelMode = "driving" | "walking" | "cycling";
type MapLayer = "street" | "satellite" | "dark";

// ── CSS Animations injected once ──────────────────────────────────────────
const PULSE_STYLE = `
@keyframes adm-ping { 0%{transform:scale(1);opacity:.8} 70%{transform:scale(2.2);opacity:0} 100%{transform:scale(2.2);opacity:0} }
@keyframes adm-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
@keyframes adm-ripple { 0%{transform:scale(0.8);opacity:1} 100%{transform:scale(2.5);opacity:0} }
@keyframes adm-slide-up { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
@keyframes adm-pop { 0%{transform:scale(0)} 60%{transform:scale(1.15)} 100%{transform:scale(1)} }
@keyframes adm-glow { 0%,100%{box-shadow:0 0 8px 2px var(--glow-color)} 50%{box-shadow:0 0 18px 6px var(--glow-color)} }
.adm-ping::after { content:''; position:absolute; inset:0; border-radius:50%; animation:adm-ping 1.6s cubic-bezier(0,0,.2,1) infinite; background:var(--ping-color,#f97316); }
.adm-float { animation:adm-float 2.4s ease-in-out infinite; }
.adm-pop { animation:adm-pop .35s cubic-bezier(.34,1.56,.64,1) forwards; }
.adm-slide-up { animation:adm-slide-up .3s ease forwards; }
.adm-ripple::before { content:''; position:absolute; inset:-6px; border-radius:50%; border:2px solid var(--ripple-color,#f97316); animation:adm-ripple 2s ease-out infinite; }
`;

// ── Icons ──────────────────────────────────────────────────────────────────
const makeUserIcon = (heading?: number) => L.divIcon({
  html: `<div style="position:relative;width:26px;height:26px;">
    <div style="position:absolute;inset:0;border-radius:50%;background:rgba(59,130,246,0.25);animation:adm-ping 1.6s cubic-bezier(0,0,.2,1) infinite;"></div>
    <div style="position:relative;width:26px;height:26px;border-radius:999px;background:#3b82f6;border:3px solid #fff;box-shadow:0 0 0 4px rgba(59,130,246,0.3);display:flex;align-items:center;justify-content:center;z-index:1;">
      ${heading !== undefined ? `<div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-bottom:9px solid white;transform:rotate(${heading}deg);"></div>` : ""}
    </div>
  </div>`,
  className: "", iconSize: [26, 26], iconAnchor: [13, 13],
});

const placeIcon = (letter = "P", color = "#f97316", isActive = false) => L.divIcon({
  html: `<div style="position:relative;animation:adm-float 2.4s ease-in-out infinite;animation-delay:${Math.random()*1.2}s">
    ${isActive ? `<div style="position:absolute;inset:-4px;border-radius:50%;border:2px solid ${color};animation:adm-ripple 2s ease-out infinite;"></div>` : ""}
    <div style="display:flex;align-items:center;justify-content:center;width:${isActive?42:36}px;height:${isActive?42:36}px;border-radius:50%;background:${color};border:3px solid rgba(255,255,255,0.95);box-shadow:0 8px 24px ${color}66;color:white;font-weight:900;font-size:${isActive?15:13}px;transition:all .3s;">${letter}</div>
    <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:8px solid ${color};margin:0 auto;margin-top:-1px;"></div>
  </div>`,
  className: "", iconSize: [isActive?42:36, isActive?50:44], iconAnchor: [isActive?21:18, isActive?50:44], popupAnchor: [0, -46],
});

// Route discovery place icon — glowing animated pin
const routeDiscoverIcon = (color: string, progress: number) => L.divIcon({
  html: `<div style="position:relative;animation:adm-float 2s ease-in-out infinite;animation-delay:${progress*2}s">
    <div style="position:absolute;inset:-5px;border-radius:50%;border:2px solid ${color};opacity:0.7;animation:adm-ripple 2.5s ease-out infinite;animation-delay:${progress}s;"></div>
    <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,${color},${color}bb);border:2.5px solid rgba(255,255,255,0.9);box-shadow:0 4px 16px ${color}88;display:flex;align-items:center;justify-content:center;">
      <div style="width:10px;height:10px;background:white;border-radius:50%;box-shadow:0 0 6px white;"></div>
    </div>
    <div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:7px solid ${color};margin:0 auto;"></div>
  </div>`,
  className: "", iconSize: [32, 39], iconAnchor: [16, 39], popupAnchor: [0, -41],
});

// ── Tile Layers ────────────────────────────────────────────────────────────
const TILES: Record<MapLayer, { url: string; attribution: string }> = {
  street: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a>",
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "&copy; Esri",
  },
  dark: {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: "&copy; OSM &copy; CARTO",
  },
};

// ── Nav step icon ──────────────────────────────────────────────────────────
const stepIcon = (type: number) => {
  if (type === 1 || type === 2) return "↰";
  if (type === 3 || type === 4) return "↱";
  if (type === 5) return "↑";
  if (type === 10) return "🏁";
  return "→";
};

function speak(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = "en-IN";
  utt.rate = 0.9;
  window.speechSynthesis.speak(utt);
}

function ensureUrl(value?: string): string {
  if (!value) return "";
  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    if (!["http:", "https:"].includes(url.protocol)) return "";
    return url.toString();
  } catch { return ""; }
}

// ── MapController ─────────────────────────────────────────────────────────
function MapController({ center, selectedPlace, routePoints, livePos, navMode }: {
  center: { lat: number; lng: number };
  selectedPlace: Place | RoutePlace | null | undefined;
  routePoints: [number, number][];
  livePos: { lat: number; lng: number } | null;
  navMode: boolean;
}) {
  const map = useMap();
  useEffect(() => {
    if (navMode && livePos) { map.setView([livePos.lat, livePos.lng], 17, { animate: true, duration: 0.5 }); return; }
    if (routePoints.length > 1) { map.fitBounds(routePoints as L.LatLngBoundsLiteral, { padding: [60, 60] }); return; }
    if (selectedPlace) { map.flyTo([selectedPlace.lat, selectedPlace.lng], 15, { duration: 0.8 }); return; }
    map.flyTo([center.lat, center.lng], 13, { duration: 0.8 });
  }, [center, map, routePoints, selectedPlace, livePos, navMode]);
  return null;
}

function DynamicTileLayer({ layer }: { layer: MapLayer }) {
  const map = useMap();
  const tileRef = useRef<L.TileLayer | null>(null);
  useEffect(() => {
    if (tileRef.current) map.removeLayer(tileRef.current);
    const t = L.tileLayer(TILES[layer].url, { attribution: TILES[layer].attribution, maxZoom: 19 });
    t.addTo(map);
    tileRef.current = t;
    return () => { if (tileRef.current) map.removeLayer(tileRef.current); };
  }, [layer, map]);
  return null;
}

// ── Rich Detail Card (Zomato-style slide-in panel) ─────────────────────────
function RichDetailPanel({
  place,
  placeInfo,
  loading,
  onClose,
  onGetRoute,
  distKm,
}: {
  place: Place | RoutePlace;
  placeInfo: PlaceInfo | null;
  loading: boolean;
  onClose: () => void;
  onGetRoute: () => void;
  distKm?: number;
}) {
  const isRoutePlace = "routeProgress" in place;
  const catMeta = isRoutePlace ? getCatMeta((place as RoutePlace).category) : null;
  const phone = "routeProgress" in place ? (place as unknown as RoutePlace).phone || placeInfo?.phone : (place as unknown as Place).phone || placeInfo?.phone;
  const website = "routeProgress" in place ? (place as unknown as RoutePlace).website || placeInfo?.website : (place as unknown as Place).website || placeInfo?.website;
  const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(place.name + " India")}`;

  return (
    <div className="absolute right-0 top-0 h-full w-[min(100%,360px)] z-[600] flex flex-col border-l border-white/10 shadow-2xl"
      style={{ background: "linear-gradient(180deg, #060e1a 0%, #0a1628 100%)", backdropFilter: "blur(24px)" }}>

      {/* ── Header ── */}
      <div className="relative shrink-0">
        {placeInfo?.image
          ? <img src={placeInfo.image} alt={place.name} className="w-full h-40 object-cover" />
          : <div className="w-full h-28 relative overflow-hidden">
              <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${catMeta?.color || "#f97316"}33, #8b5cf633)` }} />
              <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-20">
                {catMeta?.icon || "📍"}
              </div>
            </div>}
        <div className="absolute inset-0 bg-gradient-to-t from-[#060e1a] via-transparent to-transparent" />
        <button onClick={onClose}
          className="absolute top-3 right-3 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/90 backdrop-blur-xl transition-all">
          <X size={14} />
        </button>
        <div className="absolute bottom-3 left-4 right-14">
          <div className="flex items-center gap-2 mb-1">
            {catMeta && (
              <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-widest"
                style={{ background: catMeta.bg, color: catMeta.color }}>
                {catMeta.icon} {catMeta.label}
              </span>
            )}
            {isRoutePlace && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-emerald-400">
                <Radio size={8} /> On Route
              </span>
            )}
          </div>
          <p className="text-base font-black text-white leading-tight">{place.name}</p>
          {"address" in place && place.address && (
            <p className="text-[10px] text-slate-400 mt-0.5 truncate">{(place as { address: string }).address}</p>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ scrollbarWidth: "none" }}>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          {"rating" in place && (place as { rating: number }).rating && (
            <div className="rounded-2xl bg-white/5 border border-white/10 p-3 text-center">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Rating</p>
              <p className="text-lg font-black text-amber-400 mt-0.5">⭐ {Number((place as { rating: number }).rating).toFixed(1)}</p>
            </div>
          )}
          {distKm !== undefined && (
            <div className="rounded-2xl bg-white/5 border border-white/10 p-3 text-center">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Distance</p>
              <p className="text-sm font-black text-blue-400 mt-0.5">📍 {formatDist(distKm)}</p>
            </div>
          )}
          {isRoutePlace && (
            <div className="rounded-2xl bg-white/5 border border-white/10 p-3 text-center">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">On Route</p>
              <p className="text-sm font-black text-emerald-400 mt-0.5">{Math.round((place as RoutePlace).routeProgress * 100)}%</p>
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-2">
            {[80, 60, 70, 50].map((w, i) => (
              <div key={i} className="h-10 rounded-xl bg-white/5 animate-pulse" style={{ width: `${w}%` }} />
            ))}
            <p className="text-[10px] text-slate-600 italic">Fetching social media & info...</p>
          </div>
        )}

        {/* Social Media */}
        {!loading && (
          <div className="space-y-2">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Social Media</p>
            <div className="space-y-1.5">
              {placeInfo?.youtube && (
                <a href={placeInfo.youtube} target="_blank" rel="noreferrer"
                  className="flex items-center gap-3 rounded-xl border border-red-500/20 px-3 py-2.5 transition-all hover:border-red-500/40 hover:bg-red-500/5"
                  style={{ background: "rgba(239,68,68,0.05)" }}>
                  <Youtube size={16} className="text-red-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-red-300">YouTube Channel</p>
                    <p className="text-[10px] text-slate-500 truncate">{placeInfo.youtube.replace("https://youtube.com/", "")}</p>
                  </div>
                  <ExternalLink size={10} className="text-slate-600 shrink-0" />
                </a>
              )}
              {placeInfo?.instagram && (
                <a href={placeInfo.instagram} target="_blank" rel="noreferrer"
                  className="flex items-center gap-3 rounded-xl border border-pink-500/20 px-3 py-2.5 transition-all hover:border-pink-500/40 hover:bg-pink-500/5"
                  style={{ background: "linear-gradient(135deg, rgba(236,72,153,0.05), rgba(168,85,247,0.05))" }}>
                  <Instagram size={16} className="text-pink-400 shrink-0" />
                  <span className="text-xs font-bold text-pink-300 truncate flex-1">{placeInfo.instagram.replace("https://instagram.com/", "@")}</span>
                  <ExternalLink size={10} className="text-slate-600 shrink-0" />
                </a>
              )}
              {placeInfo?.facebook && (
                <a href={placeInfo.facebook} target="_blank" rel="noreferrer"
                  className="flex items-center gap-3 rounded-xl bg-blue-500/5 border border-blue-500/20 px-3 py-2.5 transition-all hover:border-blue-500/40">
                  <Facebook size={16} className="text-blue-400 shrink-0" />
                  <span className="text-xs font-bold text-blue-300 truncate flex-1">{placeInfo.facebook.replace("https://facebook.com/", "")}</span>
                  <ExternalLink size={10} className="text-slate-600 shrink-0" />
                </a>
              )}
              {placeInfo?.twitter && (
                <a href={placeInfo.twitter} target="_blank" rel="noreferrer"
                  className="flex items-center gap-3 rounded-xl bg-sky-500/5 border border-sky-500/20 px-3 py-2.5 transition-all hover:border-sky-500/40">
                  <Twitter size={16} className="text-sky-400 shrink-0" />
                  <span className="text-xs font-bold text-sky-300 truncate flex-1">{placeInfo.twitter.replace("https://twitter.com/", "@")}</span>
                  <ExternalLink size={10} className="text-slate-600 shrink-0" />
                </a>
              )}
              {!placeInfo?.youtube && !placeInfo?.instagram && !placeInfo?.facebook && !placeInfo?.twitter && !loading && (
                <p className="text-xs text-slate-600 italic px-1">No social accounts found. Try Google search below.</p>
              )}
            </div>
          </div>
        )}

        {/* Google Search */}
        <div className="space-y-1.5">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Find Online</p>
          <a href={googleSearchUrl} target="_blank" rel="noreferrer"
            className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 transition-all hover:bg-white/10 hover:border-white/20">
            <Search size={14} className="text-slate-300 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-200">Google Search</p>
              <p className="text-[10px] text-slate-500 truncate">Search "{place.name}" online</p>
            </div>
            <ExternalLink size={10} className="text-slate-600 shrink-0" />
          </a>
        </div>

        {/* Contact */}
        <div className="space-y-1.5">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Contact</p>
          {phone && (
            <div className="flex gap-2">
              <a href={`tel:${phone}`}
                className="flex-1 flex items-center gap-2 rounded-xl bg-orange-500/10 border border-orange-500/20 px-3 py-2.5 hover:bg-orange-500/20 transition-all">
                <Phone size={13} className="text-orange-400 shrink-0" />
                <span className="text-xs font-bold text-orange-300 truncate">{phone}</span>
              </a>
              <a href={`https://wa.me/${String(phone).replace(/[^\d]/g, "")}`} target="_blank" rel="noreferrer"
                className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3 py-2.5 hover:bg-emerald-500/20 transition-all">
                <WhatsApp size={13} className="text-emerald-400" />
              </a>
            </div>
          )}
          {website && (
            <a href={ensureUrl(website)} target="_blank" rel="noreferrer"
              className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 hover:bg-white/10 transition-all">
              <Globe size={13} className="text-slate-400 shrink-0" />
              <span className="text-xs font-bold text-slate-300 truncate flex-1">{website.replace(/^https?:\/\//, "")}</span>
              <ExternalLink size={10} className="text-slate-600 shrink-0" />
            </a>
          )}
          {placeInfo?.opening_hours && (
            <div className="flex items-start gap-3 rounded-xl bg-white/5 border border-white/10 px-3 py-2.5">
              <Clock size={13} className="text-slate-400 shrink-0 mt-0.5" />
              <span className="text-xs text-slate-300 leading-relaxed">{placeInfo.opening_hours}</span>
            </div>
          )}
        </div>

        {/* Wikipedia / About */}
        {placeInfo?.wikipedia && (
          <div className="space-y-2">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-1.5">
              <Info size={10} /> About
            </p>
            <div className="rounded-xl bg-white/5 border border-white/10 p-3">
              <p className="text-xs text-slate-300 leading-relaxed line-clamp-4">{placeInfo.wikipedia}</p>
              {placeInfo.wikipediaUrl && (
                <a href={placeInfo.wikipediaUrl} target="_blank" rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-[10px] text-blue-400 hover:underline">
                  Read more on Wikipedia <ExternalLink size={8} />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Services tags from OSM */}
        {isRoutePlace && (place as RoutePlace).tags && (
          <div className="space-y-2">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Details</p>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries((place as RoutePlace).tags || {})
                .filter(([k]) => ["amenity", "shop", "tourism", "leisure", "cuisine"].includes(k))
                .map(([k, v]) => (
                  <span key={k} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold text-slate-300 capitalize">
                    {v}
                  </span>
                ))}
            </div>
          </div>
        )}

        {/* Get Route CTA */}
        <button onClick={onGetRoute}
          className="w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-black text-white shadow-xl transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ background: "linear-gradient(135deg, #f97316, #f59e0b)", boxShadow: "0 8px 24px rgba(249,115,22,0.3)" }}>
          <Navigation size={16} /> Get Route
        </button>
      </div>
    </div>
  );
}

// ── Live Discovery Toast ───────────────────────────────────────────────────
function DiscoveryToast({ place, onView, onDismiss }: {
  place: RoutePlace;
  onView: () => void;
  onDismiss: () => void;
}) {
  const meta = getCatMeta(place.category);
  useEffect(() => {
    const t = setTimeout(onDismiss, 6000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div className="adm-slide-up pointer-events-auto flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-2xl"
      style={{
        background: "linear-gradient(135deg, #0d1a2e, #0a1628)",
        borderColor: `${meta.color}44`,
        boxShadow: `0 8px 32px ${meta.color}22`,
        minWidth: "280px", maxWidth: "340px",
      }}>
      {/* Animated dot */}
      <div className="relative shrink-0 w-10 h-10 flex items-center justify-center rounded-full"
        style={{ background: meta.bg }}>
        <div className="absolute inset-0 rounded-full" style={{ animation: "adm-ping 1.6s infinite", background: meta.color, opacity: 0.3 }} />
        <span style={{ color: meta.color }}>{meta.icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: meta.color }}>{meta.label}</span>
          <span className="text-[9px] text-slate-500">• On your route</span>
        </div>
        <p className="text-xs font-black text-white truncate">{place.name}</p>
        {place.address && <p className="text-[10px] text-slate-500 truncate">{place.address}</p>}
        <p className="text-[10px] text-slate-400 mt-0.5">
          {formatDist(place.distanceFromRoute)} from route
        </p>
      </div>
      <div className="flex flex-col gap-1.5 shrink-0">
        <button onClick={onView}
          className="rounded-xl px-3 py-1.5 text-[10px] font-black text-white transition-all"
          style={{ background: meta.color }}>
          View
        </button>
        <button onClick={onDismiss}
          className="rounded-xl bg-white/5 px-3 py-1.5 text-[10px] font-bold text-slate-400 hover:bg-white/10">
          Skip
        </button>
      </div>
    </div>
  );
}

// ── Route Discovery Sidebar ────────────────────────────────────────────────
function RouteDiscoverySidebar({
  places,
  loading,
  onSelect,
  selectedId,
  onClose,
}: {
  places: RoutePlace[];
  loading: boolean;
  onSelect: (p: RoutePlace) => void;
  selectedId?: string;
  onClose: () => void;
}) {
  return (
    <div className="absolute left-4 top-4 bottom-4 z-[500] flex flex-col w-72 rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
      style={{ background: "linear-gradient(180deg, #060e1a 0%, #0a1628 100%)" }}>
      {/* Header */}
      <div className="shrink-0 px-4 pt-4 pb-3 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <Zap size={14} className="text-orange-400" />
              </div>
              <p className="text-sm font-black text-white">Route Discovery</p>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5 ml-9">
              {loading ? "Scanning route..." : `${places.length} services found`}
            </p>
          </div>
          <button onClick={onClose} className="rounded-xl bg-white/5 p-2 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
            <X size={14} />
          </button>
        </div>
        {loading && (
          <div className="mt-3 h-1 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full rounded-full bg-orange-500" style={{ width: "60%", animation: "adm-ping 1s ease infinite", opacity: 0.8 }} />
          </div>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5" style={{ scrollbarWidth: "none" }}>
        {loading && [...Array(5)].map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse border border-white/5" style={{ animationDelay: `${i*0.1}s` }} />
        ))}
        {!loading && places.length === 0 && (
          <div className="text-center py-12">
            <p className="text-3xl mb-2">🗺️</p>
            <p className="text-slate-500 text-xs font-bold">No services found along this route</p>
          </div>
        )}
        {!loading && places.map((p, i) => {
          const meta = getCatMeta(p.category);
          const isSelected = selectedId === p.id;
          return (
            <button key={p.id} onClick={() => onSelect(p)}
              className="w-full text-left flex items-center gap-3 p-3 rounded-xl border transition-all"
              style={{
                background: isSelected ? `${meta.color}15` : "rgba(255,255,255,0.03)",
                borderColor: isSelected ? `${meta.color}44` : "rgba(255,255,255,0.06)",
                animationDelay: `${i * 0.05}s`,
              }}>
              {/* Progress indicator */}
              <div className="relative shrink-0 w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: meta.bg }}>
                <span style={{ color: meta.color }}>{meta.icon}</span>
                {/* Progress ring */}
                <svg className="absolute inset-0 w-9 h-9 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
                  <circle cx="18" cy="18" r="16" fill="none" stroke={meta.color} strokeWidth="2"
                    strokeDasharray={`${p.routeProgress * 100} 100`} strokeLinecap="round" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-white truncate">{p.name}</p>
                {p.address && <p className="text-[10px] text-slate-500 truncate mt-0.5">{p.address}</p>}
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[9px] font-bold" style={{ color: meta.color }}>{meta.label}</span>
                  <span className="text-[9px] text-slate-600">•</span>
                  <span className="text-[9px] text-slate-500">{formatDist(p.distanceFromRoute)} from route</span>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[9px] text-slate-500">{Math.round(p.routeProgress * 100)}%</p>
                <ChevronRight size={12} className="text-slate-600 mt-0.5 ml-auto" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer legend */}
      {!loading && places.length > 0 && (
        <div className="shrink-0 px-4 py-3 border-t border-white/10">
          <p className="text-[9px] text-slate-600 text-center">Tap any service to see details & route</p>
          <div className="flex justify-center gap-3 mt-2">
            {Object.entries(CAT_META).slice(0, 4).map(([k, v]) => (
              places.some(p => p.category === k) ? (
                <div key={k} className="flex items-center gap-1">
                  <span style={{ color: v.color }}>{v.icon}</span>
                  <span className="text-[9px] text-slate-500">{places.filter(p => p.category === k).length}</span>
                </div>
              ) : null
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
export default function Map({ providers, center = { lat: 28.6139, lng: 77.209 }, onScan, selectedPlace, onSelectPlace }: MapProps) {

  // Inject CSS animations once
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.getElementById("adm-map-styles")) return;
    const s = document.createElement("style");
    s.id = "adm-map-styles";
    s.textContent = PULSE_STYLE;
    document.head.appendChild(s);
  }, []);

  // ── Core map state ──────────────────────────────────────────────────
  const [routePoints, setRoutePoints] = useState<[number, number][]>([]);
  const [routeSummary, setRouteSummary] = useState<RouteSummary | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState("");
  const [travelMode, setTravelMode] = useState<TravelMode>("driving");
  const [mapLayer, setMapLayer] = useState<MapLayer>("street");
  const [showLayerPicker, setShowLayerPicker] = useState(false);
  const [showSteps, setShowSteps] = useState(false);

  // ── Live location ───────────────────────────────────────────────────
  const [livePos, setLivePos] = useState<{ lat: number; lng: number } | null>(null);
  const [liveHeading, setLiveHeading] = useState<number | undefined>(undefined);
  const [trackingLive, setTrackingLive] = useState(false);
  const watchIdRef = useRef<number | null>(null);

  // ── Navigation mode ─────────────────────────────────────────────────
  const [navMode, setNavMode] = useState(false);
  const [voiceOn, setVoiceOn] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);

  // ── Place info panel ────────────────────────────────────────────────
  const [placeInfo, setPlaceInfo] = useState<PlaceInfo | null>(null);
  const [placeInfoLoading, setPlaceInfoLoading] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [panelPlace, setPanelPlace] = useState<Place | RoutePlace | null>(null);

  // ── Route Discovery ─────────────────────────────────────────────────
  const [routePlaces, setRoutePlaces] = useState<RoutePlace[]>([]);
  const [routeDiscoveryLoading, setRouteDiscoveryLoading] = useState(false);
  const [showRouteDiscovery, setShowRouteDiscovery] = useState(false);
  const [selectedRoutePlace, setSelectedRoutePlace] = useState<RoutePlace | null>(null);
  const routeDiscoveryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Live Discovery (toast notifications while navigating) ───────────
  const [discoveryToasts, setDiscoveryToasts] = useState<RoutePlace[]>([]);
  const [shownToastIds, setShownToastIds] = useState<Set<string>>(new Set());
  const [liveDiscoveryActive, setLiveDiscoveryActive] = useState(false);

  // ── Fetch place info ────────────────────────────────────────────────
  const fetchPlaceInfo = useCallback(async (place: Place | RoutePlace) => {
    setPlaceInfo(null);
    setPlaceInfoLoading(true);
    setShowPanel(true);
    setPanelPlace(place);
    try {
      const phone = "routeProgress" in place ? (place as unknown as RoutePlace).phone : (place as unknown as Place).phone;
      const website = "routeProgress" in place ? (place as unknown as RoutePlace).website : (place as unknown as Place).website;
      const params = new URLSearchParams({
        name: place.name,
        lat: String(place.lat),
        lon: String(place.lng),
        ...(website ? { website } : {}),
        ...(phone ? { phone } : {}),
        city: "India",
      });
      const res = await fetch(`/api/place-info?${params}`);
      const data: PlaceInfo = await res.json();
      setPlaceInfo(data);
    } catch {
      setPlaceInfo({ name: place.name });
    } finally {
      setPlaceInfoLoading(false);
    }
  }, []);

  // ── Route Discovery: fetch services along route ─────────────────────
  const discoverAlongRoute = useCallback(async (coords: [number, number][]) => {
    if (coords.length < 2) return;
    setRouteDiscoveryLoading(true);
    setRoutePlaces([]);
    try {
      const res = await fetch("/api/route-discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coords, category: "all", corridorM: 500 }),
      });
      const data = await res.json();
      setRoutePlaces(data.places || []);
      if (data.places?.length > 0) {
        setShowRouteDiscovery(true);
      }
    } catch {
      setRoutePlaces([]);
    } finally {
      setRouteDiscoveryLoading(false);
    }
  }, []);

  // ── Live GPS tracking ───────────────────────────────────────────────
  const startTracking = useCallback(() => {
    if (!navigator.geolocation) return;
    setTrackingLive(true);
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setLivePos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        if (pos.coords.heading != null) setLiveHeading(pos.coords.heading);
      },
      () => setTrackingLive(false),
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
    );
  }, []);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current);
    setTrackingLive(false);
    setNavMode(false);
    setLiveDiscoveryActive(false);
  }, []);

  useEffect(() => () => { if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current); }, []);

  // ── Live Discovery: show toasts as user approaches services on route ─
  useEffect(() => {
    if (!navMode || !liveDiscoveryActive || !livePos || routePlaces.length === 0) return;

    // Find nearby route-places the user hasn't been notified about
    const newToasts = routePlaces.filter(p => {
      if (shownToastIds.has(p.id)) return false;
      const dist = haversineKm(livePos.lat, livePos.lng, p.lat, p.lng);
      return dist < 0.4; // within 400m
    });

    if (newToasts.length > 0) {
      const [first] = newToasts;
      setDiscoveryToasts(prev => [...prev, first]);
      setShownToastIds(prev => new Set([...prev, first.id]));
      if (voiceOn) speak(`Nearby ${first.category}: ${first.name}, ${formatDist(first.distanceFromRoute)} from your route.`);
    }
  }, [livePos, navMode, liveDiscoveryActive, routePlaces, shownToastIds, voiceOn]);

  // ── Route loading ───────────────────────────────────────────────────
  const origin = livePos || center;

  const loadRoute = useCallback(async () => {
    if (!selectedPlace) { setRoutePoints([]); setRouteSummary(null); return; }
    setRouteLoading(true); setRouteError("");
    try {
      const url = `/api/route?start=${origin.lng},${origin.lat}&end=${selectedPlace.lng},${selectedPlace.lat}&mode=${travelMode}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Route error");
      const feature = data?.features?.[0];
      const coords = feature?.geometry?.coordinates;
      const summary = feature?.properties?.summary;
      const segments = feature?.properties?.segments?.[0]?.steps || [];
      if (!Array.isArray(coords) || coords.length < 2) throw new Error("Route not available");
      const points: [number, number][] = coords.map((p: [number, number]) => [p[1], p[0]]);
      setRoutePoints(points);
      setRouteSummary({
        distanceKm: Number(summary?.distance || 0),
        durationMin: Number(summary?.duration || 0) / 60,
        steps: segments.map((s: { instruction: string; distance: number; duration: number; type: number }) => ({
          instruction: s.instruction,
          distance: s.distance,
          duration: s.duration,
          type: s.type,
        })),
      });
      setCurrentStep(0);
      // Trigger route discovery after a short delay
      if (routeDiscoveryTimer.current) clearTimeout(routeDiscoveryTimer.current);
      routeDiscoveryTimer.current = setTimeout(() => {
        void discoverAlongRoute(coords as [number, number][]);
      }, 800);
    } catch (e) {
      setRouteError(e instanceof Error ? e.message : "Route error");
      setRoutePoints([]);
    } finally { setRouteLoading(false); }
  }, [selectedPlace, origin.lat, origin.lng, travelMode, discoverAlongRoute]);

  useEffect(() => { void loadRoute(); }, [loadRoute]);

  // ── Navigation mode ─────────────────────────────────────────────────
  useEffect(() => {
    if (!navMode || !routeSummary?.steps.length) return;
    const step = routeSummary.steps[currentStep];
    if (!step) return;
    if (voiceOn) speak(step.instruction);
  }, [currentStep, navMode]);  // eslint-disable-line

  const startNav = () => {
    if (!routeSummary?.steps.length) return;
    setNavMode(true);
    setShowSteps(true);
    setLiveDiscoveryActive(true);
    setDiscoveryToasts([]);
    setShownToastIds(new Set());
    if (!trackingLive) startTracking();
    if (voiceOn && routeSummary.steps[0]) speak(routeSummary.steps[0].instruction);
  };

  // ── Handle route place selection ────────────────────────────────────
  const handleRoutePlace = useCallback((p: RoutePlace) => {
    setSelectedRoutePlace(p);
    fetchPlaceInfo(p);
    setShowRouteDiscovery(false);
  }, [fetchPlaceInfo]);

  const modeIcon = { driving: <Car size={14} />, walking: <PersonStanding size={14} />, cycling: <Bike size={14} /> };
  const userIcon = makeUserIcon(navMode ? liveHeading : undefined);
  const displayPos = livePos || center;

  return (
    <div className="relative h-full w-full overflow-hidden" style={{ borderRadius: "2rem", border: "1px solid rgba(255,255,255,0.08)", background: "#08101c", boxShadow: "0 32px 80px rgba(0,0,0,0.6)" }}>

      <MapContainer center={[center.lat, center.lng]} zoom={13} scrollWheelZoom className="h-full w-full" zoomControl={false}>
        <DynamicTileLayer layer={mapLayer} />
        <MapController center={center}
          selectedPlace={selectedRoutePlace || (selectedPlace as unknown as Place | RoutePlace | null)}
          routePoints={routePoints}
          livePos={livePos}
          navMode={navMode}
        />

        {/* User marker */}
        <Marker position={[displayPos.lat, displayPos.lng]} icon={userIcon}>
          <Popup>
            <p className="text-sm font-bold">{trackingLive ? "📍 Live Location" : "Your Location"}</p>
            {onScan && <button onClick={onScan} className="mt-2 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white">Scan Again</button>}
          </Popup>
        </Marker>
        <CircleMarker center={[displayPos.lat, displayPos.lng]} radius={52}
          pathOptions={{ color: "#3b82f6", fillColor: "#3b82f6", fillOpacity: 0.06 }} />

        {/* Provider markers */}
        {providers.map((p, i) => {
          const distKm = (p.distanceKm != null) ? p.distanceKm : haversineKm(displayPos.lat, displayPos.lng, p.lat, p.lng);
          const isActive = selectedPlace?.id === p.id;
          return (
            <Marker key={p.id} position={[p.lat, p.lng]}
              icon={placeIcon(String.fromCharCode(65 + (i % 26)), "#f97316", isActive)}
              eventHandlers={{ click: () => { onSelectPlace?.(p); fetchPlaceInfo(p); } }}>
              <Popup>
                <div className="min-w-[220px]">
                  <p className="text-sm font-bold text-slate-900">{p.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{p.address || "Student service"}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="text-[11px] font-bold text-amber-600">⭐ {Number(p.rating || 0).toFixed(1)}</span>
                    <span className="text-[10px] text-slate-400">•</span>
                    <span className="text-[11px] font-bold text-blue-600">📍 {formatDist(distKm)}</span>
                  </div>
                  <button onClick={() => { onSelectPlace?.(p); fetchPlaceInfo(p); }}
                    className="mt-2 w-full rounded-lg bg-orange-500 px-2 py-1.5 text-xs font-bold text-white">
                    🧭 Get Route ({formatDist(distKm)})
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Route Discovery markers */}
        {routePlaces.map((p) => {
          const meta = getCatMeta(p.category);
          const isSelected = selectedRoutePlace?.id === p.id;
          return (
            <Marker key={`rd-${p.id}`} position={[p.lat, p.lng]}
              icon={routeDiscoverIcon(meta.color, p.routeProgress)}
              eventHandlers={{ click: () => handleRoutePlace(p) }}>
              <Popup>
                <div className="min-w-[200px]">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-black uppercase" style={{ color: meta.color }}>{meta.label}</span>
                    <span className="text-[10px] text-slate-400">• On Route</span>
                  </div>
                  <p className="text-sm font-bold text-slate-900">{p.name}</p>
                  {p.address && <p className="mt-0.5 text-xs text-slate-500">{p.address}</p>}
                  <div className="mt-1.5 flex items-center gap-2 text-[10px]">
                    <span className="text-blue-600 font-bold">{formatDist(p.distanceFromRoute)} from route</span>
                    <span className="text-slate-400">• {Math.round(p.routeProgress * 100)}% along route</span>
                  </div>
                  {p.phone && (
                    <a href={`tel:${p.phone}`} className="mt-2 flex items-center gap-1.5 rounded-lg bg-slate-900 px-2 py-1.5 text-xs font-bold text-white w-full justify-center">
                      <Phone size={10} /> Call
                    </a>
                  )}
                  <button onClick={() => handleRoutePlace(p)}
                    className="mt-1.5 w-full rounded-lg px-2 py-1.5 text-xs font-bold text-white"
                    style={{ background: meta.color }}>
                    View Details
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Route line */}
        {routePoints.length > 1 && (
          <>
            <Polyline positions={routePoints} pathOptions={{ color: "#f97316", weight: 7, opacity: 0.9, lineCap: "round", lineJoin: "round" }} />
            <Polyline positions={routePoints} pathOptions={{ color: "#fff7ed", weight: 2, opacity: 0.35, lineCap: "round" }} />
          </>
        )}
      </MapContainer>

      {/* ── Route Discovery Sidebar ──────────────────────────────────── */}
      {showRouteDiscovery && (
        <RouteDiscoverySidebar
          places={routePlaces}
          loading={routeDiscoveryLoading}
          onSelect={handleRoutePlace}
          selectedId={selectedRoutePlace?.id}
          onClose={() => setShowRouteDiscovery(false)}
        />
      )}

      {/* ── Route Summary HUD ────────────────────────────────────────── */}
      {(routeSummary || routeLoading || routeError) && (
        <div className="absolute left-1/2 top-4 z-[500] w-[min(92vw,480px)] -translate-x-1/2 rounded-2xl border border-white/10 px-4 py-3 text-white shadow-2xl"
          style={{ background: "rgba(6,14,26,0.97)", backdropFilter: "blur(20px)" }}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Smart Route</p>
              {routeLoading && <p className="text-sm font-semibold text-slate-300 animate-pulse">Finding best route...</p>}
              {!routeLoading && routeError && <p className="text-sm text-rose-400">{routeError}</p>}
              {!routeLoading && routeSummary && (
                <p className="text-sm font-bold text-white">
                  {routeSummary.distanceKm < 1
                    ? `${(routeSummary.distanceKm * 1000).toFixed(0)} m`
                    : `${routeSummary.distanceKm.toFixed(2)} km`}
                  &nbsp;•&nbsp;
                  {routeSummary.durationMin < 60
                    ? `${routeSummary.durationMin.toFixed(0)} min`
                    : `${Math.floor(routeSummary.durationMin / 60)}h ${(routeSummary.durationMin % 60).toFixed(0)}m`}
                  <span className="ml-2 text-slate-400 text-xs font-normal">({travelMode})</span>
                </p>
              )}
            </div>
            <div className="flex gap-2">
              {routeSummary && !navMode && (
                <button onClick={startNav}
                  className="flex items-center gap-1 rounded-xl bg-orange-500 px-3 py-2 text-xs font-black text-white hover:bg-orange-400 transition-all shadow-lg">
                  <Navigation size={12} /> Start
                </button>
              )}
              {/* Route Discovery toggle button */}
              {routeSummary && (
                <button onClick={() => setShowRouteDiscovery(s => !s)}
                  className={`flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-black transition-all border ${showRouteDiscovery ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300" : "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"}`}>
                  <Zap size={12} />
                  {routeDiscoveryLoading ? "Scanning..." : `${routePlaces.length} Found`}
                </button>
              )}
              {routeSummary && (
                <button onClick={() => setShowSteps(s => !s)}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-white/10">
                  Steps
                </button>
              )}
              <button onClick={loadRoute}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-white/10">↻</button>
            </div>
          </div>

          {/* Travel mode selector */}
          <div className="mt-3 flex gap-2">
            {(["driving", "walking", "cycling"] as TravelMode[]).map(m => (
              <button key={m} onClick={() => setTravelMode(m)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${travelMode === m ? "bg-orange-500 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10"}`}>
                {modeIcon[m]} {m}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Steps Panel ─────────────────────────────────────────────── */}
      {showSteps && routeSummary?.steps.length && (
        <div className="absolute right-4 top-4 z-[500] w-[min(90vw,320px)] max-h-[60vh] overflow-y-auto rounded-2xl border border-white/10 text-white shadow-2xl"
          style={{ background: "rgba(6,14,26,0.97)", backdropFilter: "blur(20px)" }}>
          <div className="sticky top-0 flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#060e1a]">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Turn-by-Turn</p>
            <div className="flex gap-2">
              <button onClick={() => setVoiceOn(v => !v)} className={`rounded-lg p-1.5 ${voiceOn ? "text-orange-400" : "text-slate-600"}`}>
                {voiceOn ? <Volume2 size={14} /> : <VolumeX size={14} />}
              </button>
              {/* Live Discovery toggle */}
              <button onClick={() => setLiveDiscoveryActive(v => !v)}
                className={`rounded-lg p-1.5 transition-all ${liveDiscoveryActive ? "text-emerald-400" : "text-slate-600"}`}
                title="Live Discovery">
                <Radio size={14} />
              </button>
              <button onClick={() => setShowSteps(false)} className="rounded-lg p-1.5 text-slate-500 hover:text-white"><X size={14} /></button>
            </div>
          </div>
          <div className="p-2 space-y-1">
            {routeSummary.steps.map((step, i) => (
              <div key={i} onClick={() => { setCurrentStep(i); if (voiceOn) speak(step.instruction); }}
                className={`flex items-start gap-3 rounded-xl p-3 cursor-pointer transition-all ${i === currentStep && navMode ? "border border-orange-500/30" : "hover:bg-white/5"}`}
                style={i === currentStep && navMode ? { background: "rgba(249,115,22,0.12)" } : {}}>
                <span className="mt-0.5 text-lg shrink-0">{stepIcon(step.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-200 leading-snug">{step.instruction}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {step.distance < 1 ? `${(step.distance * 1000).toFixed(0)} m` : `${step.distance.toFixed(1)} km`}
                    &nbsp;•&nbsp;{Math.ceil(step.duration / 60)} min
                  </p>
                </div>
                {i === currentStep && navMode && <ChevronRight size={14} className="text-orange-400 shrink-0 mt-0.5" />}
              </div>
            ))}
          </div>
          {navMode && (
            <div className="sticky bottom-0 border-t border-white/10 p-3 bg-[#060e1a] flex gap-2">
              <button onClick={() => setCurrentStep(s => Math.max(0, s - 1))}
                className="flex-1 rounded-xl bg-white/5 py-2 text-xs font-bold text-slate-300">← Prev</button>
              <button onClick={() => setCurrentStep(s => Math.min((routeSummary.steps.length || 1) - 1, s + 1))}
                className="flex-1 rounded-xl bg-orange-500 py-2 text-xs font-bold text-white">Next →</button>
            </div>
          )}
        </div>
      )}

      {/* ── Live Discovery Toasts ─────────────────────────────────── */}
      {navMode && liveDiscoveryActive && discoveryToasts.length > 0 && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-[700] flex flex-col gap-2 items-center pointer-events-none"
          style={{ maxWidth: "360px", width: "100%" }}>
          {discoveryToasts.slice(-2).map(toast => (
            <DiscoveryToast
              key={toast.id}
              place={toast}
              onView={() => { handleRoutePlace(toast); setDiscoveryToasts(prev => prev.filter(t => t.id !== toast.id)); }}
              onDismiss={() => setDiscoveryToasts(prev => prev.filter(t => t.id !== toast.id))}
            />
          ))}
        </div>
      )}

      {/* ── Bottom-left controls ──────────────────────────────────── */}
      <div className="absolute bottom-6 left-4 z-[500] flex flex-col gap-2">
        {/* Live location button */}
        <button onClick={trackingLive ? stopTracking : startTracking}
          className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-bold shadow-lg transition-all ${trackingLive ? "border-blue-500/50 text-blue-300" : "border-white/10 text-slate-300 hover:bg-white/10"}`}
          style={trackingLive ? { background: "rgba(59,130,246,0.15)", backdropFilter: "blur(20px)" } : { background: "rgba(6,14,26,0.90)", backdropFilter: "blur(20px)" }}>
          <Locate size={14} className={trackingLive ? "animate-pulse" : ""} />
          {trackingLive ? "Live GPS" : "Track Me"}
        </button>

        {/* Route discovery shortcut */}
        {routePlaces.length > 0 && (
          <button onClick={() => setShowRouteDiscovery(s => !s)}
            className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-bold shadow-lg transition-all ${showRouteDiscovery ? "border-emerald-500/50 text-emerald-300" : "border-white/10 text-slate-300 hover:bg-white/10"}`}
            style={showRouteDiscovery ? { background: "rgba(16,185,129,0.15)", backdropFilter: "blur(20px)" } : { background: "rgba(6,14,26,0.90)", backdropFilter: "blur(20px)" }}>
            <Zap size={14} />
            {routePlaces.length} On Route
          </button>
        )}

        {/* Layer toggle */}
        <div className="relative">
          <button onClick={() => setShowLayerPicker(s => !s)}
            className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 text-xs font-bold text-slate-300 shadow-lg hover:bg-white/10 transition-all"
            style={{ background: "rgba(6,14,26,0.90)", backdropFilter: "blur(20px)" }}>
            <Layers size={14} /> {mapLayer}
          </button>
          {showLayerPicker && (
            <div className="absolute bottom-12 left-0 w-36 rounded-xl border border-white/10 shadow-2xl overflow-hidden"
              style={{ background: "rgba(6,14,26,0.98)", backdropFilter: "blur(20px)" }}>
              {(["street", "satellite", "dark"] as MapLayer[]).map(l => (
                <button key={l} onClick={() => { setMapLayer(l); setShowLayerPicker(false); }}
                  className={`w-full px-4 py-2.5 text-xs font-bold text-left transition-all ${mapLayer === l ? "text-orange-300" : "text-slate-300 hover:bg-white/5"}`}
                  style={mapLayer === l ? { background: "rgba(249,115,22,0.15)" } : {}}>
                  {l === "street" ? "🗺️ Street" : l === "satellite" ? "🛰️ Satellite" : "🌑 Dark"}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Nav mode END button ───────────────────────────────────── */}
      {navMode && (
        <div className="absolute bottom-6 right-4 z-[500]">
          <button onClick={() => { setNavMode(false); stopTracking(); setLiveDiscoveryActive(false); window.speechSynthesis?.cancel(); }}
            className="flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-black text-white shadow-xl hover:opacity-90 transition-all"
            style={{ background: "rgba(239,68,68,0.9)", backdropFilter: "blur(20px)" }}>
            <X size={14} /> End Nav
          </button>
        </div>
      )}

      {/* ── Attribution ───────────────────────────────────────────── */}
      <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 z-[500] hidden md:block">
        <div className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-white shadow-xl"
          style={{ background: "rgba(6,14,26,0.80)", backdropFilter: "blur(20px)" }}>
          <MapPin size={14} className="text-orange-400" />
          <p className="text-[10px] font-bold text-slate-400">OSM + ORS + Route Discovery</p>
          <Star size={10} className="text-amber-400" />
        </div>
      </div>

      {/* ── Rich Detail Panel ─────────────────────────────────────── */}
      {showPanel && panelPlace && (
        <RichDetailPanel
          place={panelPlace}
          placeInfo={placeInfo}
          loading={placeInfoLoading}
          distKm={
            "distanceFromRoute" in panelPlace
              ? (panelPlace as RoutePlace).distanceFromRoute
              : haversineKm(displayPos.lat, displayPos.lng, panelPlace.lat, panelPlace.lng)
          }
          onClose={() => {
            setShowPanel(false);
            setSelectedRoutePlace(null);
            onSelectPlace?.(null);
          }}
          onGetRoute={() => {
            if ("routeProgress" in panelPlace) {
              // For route places, set as selected provider
              const asProvider: Place = {
                id: (panelPlace as RoutePlace).id,
                name: (panelPlace as RoutePlace).name,
                subject: (panelPlace as RoutePlace).category,
                lat: (panelPlace as RoutePlace).lat,
                lng: (panelPlace as RoutePlace).lng,
                photo: "",
                rating: (panelPlace as RoutePlace).rating || 0,
                social: { whatsapp: "" },
                fees: "",
                address: (panelPlace as RoutePlace).address,
                phone: (panelPlace as RoutePlace).phone,
                website: (panelPlace as RoutePlace).website,
              };
              onSelectPlace?.(asProvider);
            }
            setShowPanel(false);
            setShowSteps(true);
          }}
        />
      )}
    </div>
  );
}
