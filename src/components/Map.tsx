"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  MapContainer, Marker, Popup, TileLayer,
  useMap, Polyline, CircleMarker,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Phone, Globe, Navigation, Layers, Car, PersonStanding, Bike, Volume2, VolumeX, ChevronRight, X, Locate, Instagram, Youtube, Facebook, Twitter, Clock, Info, ExternalLink } from "lucide-react";
import { Provider } from "@/data/providers";
import type { PlaceInfo } from "@/app/api/place-info/route";

type Place = Provider & {
  phone?: string; website?: string; about?: string;
  services?: string[];
  social?: Provider["social"] & { linkedin?: string; facebook?: string; justdial?: string };
};

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

// ── Icons ──────────────────────────────────────────────────────────────────
const makeUserIcon = (heading?: number) => L.divIcon({
  html: `<div style="width:22px;height:22px;border-radius:999px;background:#3b82f6;border:3px solid #fff;box-shadow:0 0 0 6px rgba(59,130,246,0.25);display:flex;align-items:center;justify-content:center;">
    ${heading !== undefined ? `<div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-bottom:9px solid white;transform:rotate(${heading}deg);"></div>` : ""}
  </div>`,
  className: "", iconSize: [22, 22], iconAnchor: [11, 11],
});

const placeIcon = (letter = "P", color = "#f97316") => L.divIcon({
  html: `<div style="display:flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:18px;background:${color};border:3px solid rgba(255,255,255,0.95);box-shadow:0 8px 20px rgba(0,0,0,0.3);color:white;font-weight:800;font-size:14px;">${letter}</div>`,
  className: "", iconSize: [36, 36], iconAnchor: [18, 36], popupAnchor: [0, -30],
});

// ── Tile Layers ────────────────────────────────────────────────────────────
const TILES: Record<MapLayer, { url: string; attribution: string }> = {
  street: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "&copy; Esri &mdash; Esri, i-cubed, USDA, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP",
  },
  dark: {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
  },
};

// ── Nav step type → icon ──────────────────────────────────────────────────
const stepIcon = (type: number) => {
  if (type === 1 || type === 2) return "↰";
  if (type === 3 || type === 4) return "↱";
  if (type === 5) return "↑";
  if (type === 10) return "🏁";
  return "→";
};

// ── Voice Navigation ───────────────────────────────────────────────────────
function speak(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = "en-IN";
  utt.rate = 0.9;
  window.speechSynthesis.speak(utt);
}

// ── Map auto-recenter ──────────────────────────────────────────────────────
function MapController({ center, selectedPlace, routePoints, livePos, navMode }: {
  center: { lat: number; lng: number };
  selectedPlace: Place | null | undefined;
  routePoints: [number, number][];
  livePos: { lat: number; lng: number } | null;
  navMode: boolean;
}) {
  const map = useMap();
  useEffect(() => {
    if (navMode && livePos) {
      map.setView([livePos.lat, livePos.lng], 17, { animate: true, duration: 0.5 });
      return;
    }
    if (routePoints.length > 1) { map.fitBounds(routePoints as L.LatLngBoundsLiteral, { padding: [60, 60] }); return; }
    if (selectedPlace) { map.flyTo([selectedPlace.lat, selectedPlace.lng], 15, { duration: 0.8 }); return; }
    map.flyTo([center.lat, center.lng], 13, { duration: 0.8 });
  }, [center, map, routePoints, selectedPlace, livePos, navMode]);
  return null;
}

// ── Dynamic tile layer ─────────────────────────────────────────────────────
function DynamicTileLayer({ layer }: { layer: MapLayer }) {
  const map = useMap();
  const tileRef = useRef<L.TileLayer | null>(null);
  useEffect(() => {
    if (tileRef.current) { map.removeLayer(tileRef.current); }
    const t = L.tileLayer(TILES[layer].url, { attribution: TILES[layer].attribution, maxZoom: 19 });
    t.addTo(map);
    tileRef.current = t;
    return () => { if (tileRef.current) map.removeLayer(tileRef.current); };
  }, [layer, map]);
  return null;
}

// ── Ensure safe URL ────────────────────────────────────────────────────────
function ensureUrl(value?: string): string {
  if (!value) return "";
  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    if (!["http:", "https:"].includes(url.protocol)) return "";
    return url.toString();
  } catch { return ""; }
}

// ══════════════════════════════════════════════════════════════════════════
export default function Map({ providers, center = { lat: 28.6139, lng: 77.209 }, onScan, selectedPlace, onSelectPlace }: MapProps) {

  const [routePoints, setRoutePoints] = useState<[number, number][]>([]);
  const [routeSummary, setRouteSummary] = useState<RouteSummary | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState("");
  const [travelMode, setTravelMode] = useState<TravelMode>("driving");
  const [mapLayer, setMapLayer] = useState<MapLayer>("street");
  const [showLayerPicker, setShowLayerPicker] = useState(false);

  // Place info side panel
  const [placeInfo, setPlaceInfo] = useState<PlaceInfo | null>(null);
  const [placeInfoLoading, setPlaceInfoLoading] = useState(false);
  const [showPanel, setShowPanel] = useState(false);

  // Live location
  const [livePos, setLivePos] = useState<{ lat: number; lng: number } | null>(null);
  const [liveHeading, setLiveHeading] = useState<number | undefined>(undefined);
  const [trackingLive, setTrackingLive] = useState(false);
  const watchIdRef = useRef<number | null>(null);

  // Navigation mode
  const [navMode, setNavMode] = useState(false);
  const [voiceOn, setVoiceOn] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [showSteps, setShowSteps] = useState(false);

  // ── Fetch place info (social + wiki) ─────────────────────────────────
  const fetchPlaceInfo = useCallback(async (place: Place) => {
    setPlaceInfo(null);
    setPlaceInfoLoading(true);
    setShowPanel(true);
    try {
      const params = new URLSearchParams({
        name: place.name,
        lat: String(place.lat),
        lon: String(place.lng),
        ...(place.website ? { website: place.website } : {}),
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

  // ── Live GPS ──────────────────────────────────────────────────────────
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
  }, []);

  useEffect(() => () => { if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current); }, []);

  // ── Route loading ─────────────────────────────────────────────────────
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
      setRoutePoints(coords.map((p: [number, number]) => [p[1], p[0]]));
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
    } catch (e) {
      setRouteError(e instanceof Error ? e.message : "Route error");
      setRoutePoints([]);
    } finally { setRouteLoading(false); }
  }, [selectedPlace, origin.lat, origin.lng, travelMode]);

  useEffect(() => { void loadRoute(); }, [loadRoute]);

  // ── Navigation mode step tracking ─────────────────────────────────────
  useEffect(() => {
    if (!navMode || !livePos || !routeSummary?.steps.length) return;
    const step = routeSummary.steps[currentStep];
    if (!step) return;
    if (voiceOn) speak(step.instruction);
  }, [currentStep, navMode]);

  const startNav = () => {
    if (!routeSummary?.steps.length) return;
    setNavMode(true);
    setShowSteps(true);
    if (!trackingLive) startTracking();
    if (voiceOn && routeSummary.steps[0]) speak(routeSummary.steps[0].instruction);
  };

  const modeIcon = { driving: <Car size={14} />, walking: <PersonStanding size={14} />, cycling: <Bike size={14} /> };
  const userIcon = makeUserIcon(navMode ? liveHeading : undefined);
  const displayPos = livePos || center;

  return (
    <div className="relative h-full w-full overflow-hidden rounded-[2rem] border border-white/10 bg-[#08101c] shadow-2xl">

      <MapContainer center={[center.lat, center.lng]} zoom={13} scrollWheelZoom className="h-full w-full" zoomControl={false}>
        <DynamicTileLayer layer={mapLayer} />
        <MapController center={center} selectedPlace={selectedPlace} routePoints={routePoints} livePos={livePos} navMode={navMode} />

        {/* User / Live position */}
        <Marker position={[displayPos.lat, displayPos.lng]} icon={userIcon}>
          <Popup>
            <p className="text-sm font-bold">{trackingLive ? "📍 Live Location" : "Your Location"}</p>
            {onScan && <button onClick={onScan} className="mt-2 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white">Scan Again</button>}
          </Popup>
        </Marker>
        <CircleMarker center={[displayPos.lat, displayPos.lng]} radius={52} pathOptions={{ color: "#3b82f6", fillColor: "#3b82f6", fillOpacity: 0.07 }} />

        {/* Place markers */}
        {providers.map((p, i) => (
          <Marker key={p.id} position={[p.lat, p.lng]}
            icon={placeIcon(String.fromCharCode(65 + (i % 26)))}
            eventHandlers={{ click: () => { onSelectPlace?.(p); fetchPlaceInfo(p); } }}>
            <Popup>
              <div className="min-w-[200px]">
                <p className="text-sm font-bold text-slate-900">{p.name}</p>
                <p className="mt-1 text-xs text-slate-500">{p.address || "Student service"}</p>
                <p className="mt-1 text-[11px] font-bold text-amber-600">⭐ {Number(p.rating || 0).toFixed(1)}</p>
                <div className="mt-2 flex gap-2">
                  {p.phone && <a href={`tel:${p.phone}`} className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-2 py-1.5 text-xs font-bold text-white"><Phone size={10} />Call</a>}
                  {p.website && <a href={ensureUrl(p.website)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg border px-2 py-1.5 text-xs font-bold"><Globe size={10} />Web</a>}
                </div>
                <button onClick={() => { onSelectPlace?.(p); fetchPlaceInfo(p); }} className="mt-2 w-full rounded-lg bg-orange-500 px-2 py-1.5 text-xs font-bold text-white">
                  🧭 Get Route
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Route line */}
        {routePoints.length > 1 && (
          <>
            <Polyline positions={routePoints} pathOptions={{ color: "#f97316", weight: 7, opacity: 0.9, lineCap: "round", lineJoin: "round" }} />
            <Polyline positions={routePoints} pathOptions={{ color: "#fff7ed", weight: 2, opacity: 0.4, lineCap: "round" }} />
          </>
        )}
      </MapContainer>

      {/* ── Top HUD: Route summary ───────────────────────────────────── */}
      {(routeSummary || routeLoading || routeError) && (
        <div className="absolute left-1/2 top-4 z-[500] w-[min(92vw,460px)] -translate-x-1/2 rounded-2xl border border-white/10 bg-[#060e1a]/95 px-4 py-3 text-white shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Smart Route</p>
              {routeLoading && <p className="text-sm font-semibold text-slate-300 animate-pulse">Finding best route...</p>}
              {!routeLoading && routeError && <p className="text-sm text-rose-400">{routeError}</p>}
              {!routeLoading && routeSummary && (
                <p className="text-sm font-bold text-white">
                  {routeSummary.distanceKm.toFixed(1)} km &nbsp;•&nbsp; {routeSummary.durationMin.toFixed(0)} min
                  <span className="ml-2 text-slate-400 text-xs font-normal">({travelMode})</span>
                </p>
              )}
            </div>
            <div className="flex gap-2">
              {routeSummary && !navMode && (
                <button onClick={startNav} className="flex items-center gap-1 rounded-xl bg-orange-500 px-3 py-2 text-xs font-black text-white hover:bg-orange-400 transition-all shadow-lg">
                  <Navigation size={12} /> Start
                </button>
              )}
              {routeSummary && (
                <button onClick={() => setShowSteps(s => !s)} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-white/10">
                  Steps
                </button>
              )}
              <button onClick={loadRoute} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-white/10">↻</button>
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

      {/* ── Steps Panel ──────────────────────────────────────────────── */}
      {showSteps && routeSummary?.steps.length && (
        <div className="absolute right-4 top-4 z-[500] w-[min(90vw,320px)] max-h-[60vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#060e1a]/97 text-white shadow-2xl backdrop-blur-xl">
          <div className="sticky top-0 flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#060e1a]">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Turn-by-Turn</p>
            <div className="flex gap-2">
              <button onClick={() => setVoiceOn(v => !v)} className={`rounded-lg p-1.5 ${voiceOn ? "text-orange-400" : "text-slate-600"}`}>
                {voiceOn ? <Volume2 size={14} /> : <VolumeX size={14} />}
              </button>
              <button onClick={() => setShowSteps(false)} className="rounded-lg p-1.5 text-slate-500 hover:text-white"><X size={14} /></button>
            </div>
          </div>
          <div className="p-2 space-y-1">
            {routeSummary.steps.map((step, i) => (
              <div key={i} onClick={() => { setCurrentStep(i); if (voiceOn) speak(step.instruction); }}
                className={`flex items-start gap-3 rounded-xl p-3 cursor-pointer transition-all ${i === currentStep && navMode ? "bg-orange-500/20 border border-orange-500/30" : "hover:bg-white/5"}`}>
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
              <button onClick={() => setCurrentStep(s => Math.max(0, s - 1))} className="flex-1 rounded-xl bg-white/5 py-2 text-xs font-bold text-slate-300">← Prev</button>
              <button onClick={() => setCurrentStep(s => Math.min((routeSummary.steps.length || 1) - 1, s + 1))} className="flex-1 rounded-xl bg-orange-500 py-2 text-xs font-bold text-white">Next →</button>
            </div>
          )}
        </div>
      )}

      {/* ── Bottom-left controls ─────────────────────────────────────── */}
      <div className="absolute bottom-6 left-4 z-[500] flex flex-col gap-2">
        {/* Live location button */}
        <button onClick={trackingLive ? stopTracking : startTracking}
          className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-bold shadow-lg backdrop-blur-xl transition-all ${trackingLive ? "border-blue-500/50 bg-blue-500/20 text-blue-300" : "border-white/10 bg-[#060e1a]/90 text-slate-300 hover:bg-white/10"}`}>
          <Locate size={14} className={trackingLive ? "animate-pulse" : ""} />
          {trackingLive ? "Live GPS" : "Track Me"}
        </button>

        {/* Layer toggle */}
        <div className="relative">
          <button onClick={() => setShowLayerPicker(s => !s)}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#060e1a]/90 px-3 py-2.5 text-xs font-bold text-slate-300 shadow-lg backdrop-blur-xl hover:bg-white/10 transition-all">
            <Layers size={14} /> {mapLayer}
          </button>
          {showLayerPicker && (
            <div className="absolute bottom-12 left-0 w-36 rounded-xl border border-white/10 bg-[#060e1a]/98 shadow-2xl backdrop-blur-xl overflow-hidden">
              {(["street", "satellite", "dark"] as MapLayer[]).map(l => (
                <button key={l} onClick={() => { setMapLayer(l); setShowLayerPicker(false); }}
                  className={`w-full px-4 py-2.5 text-xs font-bold text-left transition-all ${mapLayer === l ? "bg-orange-500/20 text-orange-300" : "text-slate-300 hover:bg-white/5"}`}>
                  {l === "street" ? "🗺️ Street" : l === "satellite" ? "🛰️ Satellite" : "🌑 Dark"}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Nav mode END button ──────────────────────────────────────── */}
      {navMode && (
        <div className="absolute bottom-6 right-4 z-[500]">
          <button onClick={() => { setNavMode(false); stopTracking(); window.speechSynthesis?.cancel(); }}
            className="flex items-center gap-2 rounded-xl bg-rose-500/90 px-4 py-3 text-xs font-black text-white shadow-xl backdrop-blur-xl hover:bg-rose-400 transition-all">
            <X size={14} /> End Nav
          </button>
        </div>
      )}

      {/* ── Attribution badge ────────────────────────────────────────── */}
      <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 z-[500] hidden md:block">
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#060e1a]/80 px-3 py-2 text-white shadow-xl backdrop-blur-xl">
          <MapPin size={14} className="text-orange-400" />
          <p className="text-[10px] font-bold text-slate-400">OSM + ORS Navigation</p>
        </div>
      </div>

      {/* ── PLACE INFO SIDE PANEL ────────────────────────────────────── */}
      {showPanel && selectedPlace && (
        <div className="absolute right-0 top-0 h-full w-[min(100%,340px)] z-[600] flex flex-col bg-[#060e1a]/97 border-l border-white/10 backdrop-blur-2xl shadow-2xl overflow-y-auto">
          {/* Header with image */}
          <div className="relative shrink-0">
            {placeInfo?.image
              ? <img src={placeInfo.image} alt={selectedPlace.name} className="w-full h-36 object-cover" />
              : <div className="w-full h-24 bg-gradient-to-br from-orange-500/20 to-purple-500/10" />}
            <div className="absolute inset-0 bg-gradient-to-t from-[#060e1a] via-transparent to-transparent" />
            <button onClick={() => { setShowPanel(false); onSelectPlace?.(null); }}
              className="absolute top-3 right-3 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80 backdrop-blur-xl">
              <X size={14} />
            </button>
            <div className="absolute bottom-3 left-4 right-12">
              <p className="text-base font-black text-white leading-tight">{selectedPlace.name}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{selectedPlace.address || "Student service"}</p>
            </div>
          </div>

          <div className="flex-1 p-4 space-y-4">
            {/* Rating */}
            <div className="flex items-center gap-2">
              <span className="text-lg">⭐</span>
              <span className="text-sm font-bold text-amber-400">{Number(selectedPlace.rating || 0).toFixed(1)}</span>
              <span className="text-xs text-slate-500">rating</span>
            </div>

            {/* Loading skeleton */}
            {placeInfoLoading && (
              <div className="space-y-2 animate-pulse">
                {[80, 60, 70, 50].map((w, i) => (
                  <div key={i} className="h-8 rounded-xl bg-white/5" style={{ width: `${w}%` }} />
                ))}
                <p className="text-[10px] text-slate-600 italic">Fetching social media & info...</p>
              </div>
            )}

            {/* Social Media */}
            {!placeInfoLoading && (
              <div className="space-y-2">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Social Media</p>
                <div className="space-y-1.5">
                  {placeInfo?.instagram && (
                    <a href={placeInfo.instagram} target="_blank" rel="noreferrer"
                      className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 px-3 py-2.5 transition-all hover:border-pink-500/40">
                      <Instagram size={16} className="text-pink-400 shrink-0" />
                      <span className="text-xs font-bold text-pink-300 truncate">{placeInfo.instagram.replace("https://instagram.com/", "@")}</span>
                      <ExternalLink size={10} className="text-slate-600 ml-auto shrink-0" />
                    </a>
                  )}
                  {placeInfo?.facebook && (
                    <a href={placeInfo.facebook} target="_blank" rel="noreferrer"
                      className="flex items-center gap-3 rounded-xl bg-blue-500/10 border border-blue-500/20 px-3 py-2.5 transition-all hover:border-blue-500/40">
                      <Facebook size={16} className="text-blue-400 shrink-0" />
                      <span className="text-xs font-bold text-blue-300 truncate">{placeInfo.facebook.replace("https://facebook.com/", "")}</span>
                      <ExternalLink size={10} className="text-slate-600 ml-auto shrink-0" />
                    </a>
                  )}
                  {placeInfo?.youtube && (
                    <a href={placeInfo.youtube} target="_blank" rel="noreferrer"
                      className="flex items-center gap-3 rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-2.5 transition-all hover:border-red-500/40">
                      <Youtube size={16} className="text-red-400 shrink-0" />
                      <span className="text-xs font-bold text-red-300">YouTube Channel</span>
                      <ExternalLink size={10} className="text-slate-600 ml-auto shrink-0" />
                    </a>
                  )}
                  {placeInfo?.twitter && (
                    <a href={placeInfo.twitter} target="_blank" rel="noreferrer"
                      className="flex items-center gap-3 rounded-xl bg-sky-500/10 border border-sky-500/20 px-3 py-2.5 transition-all hover:border-sky-500/40">
                      <Twitter size={16} className="text-sky-400 shrink-0" />
                      <span className="text-xs font-bold text-sky-300">{placeInfo.twitter.replace("https://twitter.com/", "@")}</span>
                      <ExternalLink size={10} className="text-slate-600 ml-auto shrink-0" />
                    </a>
                  )}
                  {!placeInfoLoading && !placeInfo?.instagram && !placeInfo?.facebook && !placeInfo?.youtube && (
                    <p className="text-xs text-slate-600 italic px-1">No social accounts found for this place</p>
                  )}
                </div>
              </div>
            )}

            {/* Contact */}
            <div className="space-y-1.5">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Contact</p>
              {(selectedPlace.phone || placeInfo?.phone) && (
                <a href={`tel:${selectedPlace.phone || placeInfo?.phone}`}
                  className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 hover:bg-white/10 transition-all">
                  <Phone size={14} className="text-slate-400 shrink-0" />
                  <span className="text-xs font-bold text-slate-300">{selectedPlace.phone || placeInfo?.phone}</span>
                </a>
              )}
              {(selectedPlace.website || placeInfo?.website) && (
                <a href={ensureUrl(selectedPlace.website || placeInfo?.website || "")} target="_blank" rel="noreferrer"
                  className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 hover:bg-white/10 transition-all">
                  <Globe size={14} className="text-slate-400 shrink-0" />
                  <span className="text-xs font-bold text-slate-300 truncate">{(selectedPlace.website || placeInfo?.website || "").replace(/^https?:\/\//, "")}</span>
                  <ExternalLink size={10} className="text-slate-600 ml-auto shrink-0" />
                </a>
              )}
              {placeInfo?.opening_hours && (
                <div className="flex items-start gap-3 rounded-xl bg-white/5 border border-white/10 px-3 py-2.5">
                  <Clock size={14} className="text-slate-400 shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-300 leading-relaxed">{placeInfo.opening_hours}</span>
                </div>
              )}
            </div>

            {/* Wikipedia */}
            {placeInfo?.wikipedia && (
              <div className="space-y-2">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-1.5">
                  <Info size={10} /> About
                </p>
                <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-5">{placeInfo.wikipedia}</p>
                  {placeInfo.wikipediaUrl && (
                    <a href={placeInfo.wikipediaUrl} target="_blank" rel="noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-[10px] text-blue-400 hover:underline">
                      Read more on Wikipedia <ExternalLink size={8} />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Get Route CTA */}
            <button onClick={() => { onSelectPlace?.(selectedPlace); setShowPanel(false); setShowSteps(true); }}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 py-3.5 text-sm font-black text-white shadow-xl shadow-orange-500/25 hover:opacity-90 transition-all">
              <Navigation size={16} /> Get Route
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
