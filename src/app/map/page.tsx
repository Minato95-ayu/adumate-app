"use client";

/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { collection, getDocs, query, where } from "firebase/firestore";
import {
  Clock,
  ExternalLink,
  Globe2,
  IndianRupee,
  Loader2,
  MapPin,
  Navigation,
  Phone,
  Route,
  Star,
} from "lucide-react";
import { db } from "@/lib/firebase";

const CATEGORIES = [
  { id: "library", label: "Libraries", short: "LB", color: "#ff6b00" },
  { id: "hostel", label: "Hostels/PG", short: "PG", color: "#2563eb" },
  { id: "mess", label: "Mess", short: "MS", color: "#16a34a" },
  { id: "tutor", label: "Tutors", short: "TR", color: "#7c3aed" },
  { id: "job", label: "Jobs", short: "JB", color: "#db2777" },
] as const;

const CITIES = ["Delhi", "Mumbai", "Bangalore", "Pune", "Hyderabad", "Chennai", "Kolkata", "Jaipur", "Lucknow", "Indore"];

type Category = (typeof CATEGORIES)[number];
type MapPlace = {
  id: string;
  source: "partner" | "provider";
  type?: string;
  name: string;
  address?: string;
  description?: string;
  phone?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  youtube?: string;
  whatsapp?: string;
  image?: string;
  price?: number;
  seats?: number | null;
  lat: number;
  lon: number;
  km: number;
  rating?: number;
  totalRatings?: number;
};

function km(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function distanceText(value: number) {
  return value < 1 ? `${Math.round(value * 1000)}m` : `${value.toFixed(1)}km`;
}

function normalizeUrl(value = "") {
  const raw = value.trim();
  if (!raw) return "";
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
}

function whatsappUrl(value = "") {
  const raw = value.trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  const digits = raw.replace(/[^\d]/g, "");
  return digits ? `https://wa.me/${digits}` : "";
}

function stripHtml(value = "") {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function categoryMatches(type: string | undefined, category: string) {
  if (!type) return false;
  if (category === "hostel") return ["hostel", "room", "pg"].includes(type);
  return type === category;
}

function MapPage() {
  const params = useSearchParams();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInst = useRef<any>(null);
  const markers = useRef<any[]>([]);
  const userMarker = useRef<any>(null);
  const routeLayer = useRef<any>(null);

  const [cat, setCat] = useState(params.get("category") || "library");
  const [city, setCity] = useState("");
  const [destination, setDestination] = useState("");
  const [cityLabel, setCityLabel] = useState("");
  const [center, setCenter] = useState<{ lat: number; lon: number } | null>(null);
  const [places, setPlaces] = useState<MapPlace[]>([]);
  const [selected, setSelected] = useState<MapPlace | null>(null);
  const [route, setRoute] = useState<{ dist: string; time: string; steps: string[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [routeLoading, setRouteLoading] = useState(false);
  const [error, setError] = useState("");
  const [mapReady, setMapReady] = useState(false);
  const [resultRadiusKm, setResultRadiusKm] = useState(10);

  const activeCat = CATEGORIES.find((c) => c.id === cat) || CATEGORIES[0];
  const partnerCount = places.filter((p) => p.source === "partner").length;

  const clearMarkers = () => {
    markers.current.forEach((m) => m?.remove?.());
    markers.current = [];
  };

  const clearRoute = () => {
    routeLayer.current?.remove?.();
    routeLayer.current = null;
    setRoute(null);
  };

  const geocodeLocation = async (value: string) => {
    if (!value.trim()) return null;
    try {
      const res = await fetch(`/api/geocode?city=${encodeURIComponent(value)}`);
      const data = await res.json();
      if (!data.lat || !data.lon) return null;
      return { lat: Number(data.lat), lon: Number(data.lon) };
    } catch {
      return null;
    }
  };

  const fetchPartnerPlaces = async (lat: number, lon: number, category: string) => {
    try {
      const qServices = query(collection(db, "services"), where("approved", "==", true));
      const snap = await getDocs(qServices);
      const services = snap.docs
        .map((d) => ({ id: d.id, ...d.data() as any }))
        .filter((service) => categoryMatches(service.type, category));

      const normalized = await Promise.all(services.map(async (service) => {
        let serviceLat = Number(service.lat ?? service.latitude);
        let serviceLon = Number(service.lon ?? service.lng ?? service.longitude);

        if ((!serviceLat || !serviceLon) && service.location) {
          const geo = await geocodeLocation(service.location);
          if (geo) {
            serviceLat = geo.lat;
            serviceLon = geo.lon;
          }
        }

        if (!serviceLat || !serviceLon) return null;

        const social = service.social || {};
        return {
          id: `partner-${service.id}`,
          source: "partner" as const,
          type: service.type,
          name: service.name || "Adumate Partner",
          description: service.description || "",
          address: service.location || "",
          phone: service.phone || service.contactPhone || "",
          website: service.website || social.website || "",
          instagram: service.instagram || social.instagram || "",
          facebook: service.facebook || social.facebook || "",
          youtube: service.youtube || social.youtube || "",
          whatsapp: service.whatsapp || social.whatsapp || "",
          image: service.images?.[0] || service.imageUrl || "",
          price: Number(service.price || 0),
          seats: service.seats ?? null,
          lat: serviceLat,
          lon: serviceLon,
          km: km(lat, lon, serviceLat, serviceLon),
        } as MapPlace;
      }));

      return normalized.filter(Boolean) as MapPlace[];
    } catch {
      return [];
    }
  };

  const fetchProviderPlaces = async (lat: number, lon: number, category: string, radiusMeters: number) => {
    try {
      const res = await fetch(`/api/places?lat=${lat}&lon=${lon}&category=${category}&radius=${radiusMeters}`);
      const data = await res.json();
      return (data.places || []).map((p: any) => ({
        id: `provider-${p.id}`,
        source: "provider" as const,
        name: p.name || "",
        address: p.address || "",
        phone: p.phone || "",
        website: p.website || "",
        lat: Number(p.lat),
        lon: Number(p.lon),
        km: km(lat, lon, Number(p.lat), Number(p.lon)),
        rating: p.rating ? Number(p.rating) : undefined,
        totalRatings: p.userRatingsTotal ? Number(p.userRatingsTotal) : undefined,
      })) as MapPlace[];
    } catch {
      return [];
    }
  };

  const addUserPin = (lat: number, lon: number) => {
    const L = (window as any).L;
    if (!L || !mapInst.current) return;
    userMarker.current?.remove?.();

    const icon = L.divIcon({
      className: "",
      iconSize: [18, 18],
      html: `<div style="width:18px;height:18px;background:#ff6b00;border:3px solid #ffffff;border-radius:999px;box-shadow:0 0 0 7px rgba(255,107,0,.25);"></div>`,
    });

    userMarker.current = L.marker([lat, lon], { icon }).addTo(mapInst.current);
  };

  const addMapMarkers = (items: MapPlace[], c: Category) => {
    const L = (window as any).L;
    if (!L || !mapInst.current) return;

    clearMarkers();

    items.slice(0, 50).forEach((p) => {
      const isPartner = p.source === "partner";
      const icon = L.divIcon({
        className: "",
        iconSize: isPartner ? [26, 26] : [20, 20],
        iconAnchor: isPartner ? [13, 13] : [10, 10],
        html: `<div style="width:${isPartner ? 26 : 20}px;height:${isPartner ? 26 : 20}px;border-radius:999px;background:${isPartner ? c.color : "#ef4444"};border:3px solid #fff;box-shadow:0 4px 16px rgba(0,0,0,.35);"></div>`,
      });

      const marker = L.marker([p.lat, p.lon], { icon }).addTo(mapInst.current);
      marker.on("click", () => setSelected(p));
      markers.current.push(marker);
    });
  };

  const doFetch = async (lat: number, lon: number, category: string) => {
    setLoading(true);
    setError("");
    setSelected(null);
    clearRoute();

    try {
      const partnerPlaces = await fetchPartnerPlaces(lat, lon, category);
      let merged: MapPlace[] = [];
      let appliedRadius = 10000;
      const radiusSteps = [10000, 20000, 35000];

      for (const radius of radiusSteps) {
        appliedRadius = radius;
        const providerPlaces = await fetchProviderPlaces(lat, lon, category, radius);
        const radiusKm = radius / 1000;
        const combined = [...partnerPlaces, ...providerPlaces]
          .filter((p) => p.lat && p.lon && p.km <= radiusKm)
          .sort((a, b) => {
            if (a.source !== b.source) return a.source === "partner" ? -1 : 1;
            return a.km - b.km;
          });

        const deduped = new Map<string, MapPlace>();
        for (const place of combined) {
          const key = `${place.name.toLowerCase()}|${place.lat.toFixed(5)}|${place.lon.toFixed(5)}`;
          if (!deduped.has(key)) deduped.set(key, place);
        }
        merged = Array.from(deduped.values());
        if (merged.length >= 4) break;
      }

      setPlaces(merged);
      setResultRadiusKm(Math.round(appliedRadius / 1000));
      addMapMarkers(merged, CATEGORIES.find((x) => x.id === category) || CATEGORIES[0]);

      if (!merged.length) setError(`No ${CATEGORIES.find((x) => x.id === category)?.label} found within ${Math.round(appliedRadius / 1000)}km.`);
    } catch {
      setError("Data fetch failed. Retry karo.");
    } finally {
      setLoading(false);
    }
  };

  const searchCity = async (name: string) => {
    if (!name.trim()) return;
    setLoading(true);
    setError("");
    try {
      const loc = await geocodeLocation(name);
      if (!loc) throw new Error("not found");
      setCenter(loc);
      setCityLabel(name.trim());
      mapInst.current?.setView([loc.lat, loc.lon], 13, { animate: true });
      addUserPin(loc.lat, loc.lon);
      doFetch(loc.lat, loc.lon, cat);
    } catch {
      setError(`"${name}" not found.`);
      setLoading(false);
    }
  };

  const useGPS = () => {
    setLoading(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        setCenter(loc);
        setCityLabel("My Location");
        mapInst.current?.setView([loc.lat, loc.lon], 15, { animate: true });
        addUserPin(loc.lat, loc.lon);
        doFetch(loc.lat, loc.lon, cat);
      },
      () => {
        setError("Location denied. Search by city name.");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const buildRouteTo = async (targetLat: number, targetLon: number) => {
    const L = (window as any).L;
    if (!L || !mapInst.current || !center) return;

    setRouteLoading(true);
    clearRoute();

    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${center.lon},${center.lat};${targetLon},${targetLat}?overview=full&geometries=geojson&steps=true`;
      const res = await fetch(url);
      const data = await res.json();
      const routeData = data?.routes?.[0];
      if (!routeData) throw new Error("No route");

      const latlngs = routeData.geometry.coordinates.map(([ln, la]: number[]) => [la, ln]);
      routeLayer.current = L.polyline(latlngs, {
        color: activeCat.color,
        weight: 6,
        opacity: 0.85,
      }).addTo(mapInst.current);
      mapInst.current.fitBounds(routeLayer.current.getBounds(), { padding: [40, 40] });

      const leg = routeData.legs?.[0];
      const steps = (leg?.steps || []).slice(0, 5).map((s: any) => stripHtml(s.maneuver?.instruction || s.name || "")).filter(Boolean);
      const distMeters = Number(routeData.distance || 0);
      const durSeconds = Number(routeData.duration || 0);
      setRoute({
        dist: distMeters < 1000 ? `${Math.round(distMeters)}m` : `${(distMeters / 1000).toFixed(1)}km`,
        time: durSeconds < 60 ? `${Math.round(durSeconds)}s` : `${Math.round(durSeconds / 60)} min`,
        steps,
      });
    } catch {
      setRoute(null);
    } finally {
      setRouteLoading(false);
    }
  };

  const selectPlace = async (p: MapPlace) => {
    setSelected(p);
    mapInst.current?.setView([p.lat, p.lon], 16, { animate: true });
    await buildRouteTo(p.lat, p.lon);
  };

  const routeToDestination = async () => {
    if (!center) {
      setError("First select city or use GPS.");
      return;
    }
    if (!destination.trim()) {
      setError("Enter destination for route.");
      return;
    }

    setError("");
    const loc = await geocodeLocation(destination);
    if (!loc) {
      setError(`Destination "${destination}" not found.`);
      return;
    }

    const manualTarget: MapPlace = {
      id: `manual-${destination.trim().toLowerCase().replace(/\s+/g, "-")}-${loc.lat.toFixed(4)}-${loc.lon.toFixed(4)}`,
      source: "provider",
      name: destination.trim(),
      address: destination.trim(),
      lat: loc.lat,
      lon: loc.lon,
      km: km(center.lat, center.lon, loc.lat, loc.lon),
    };

    setSelected(manualTarget);
    mapInst.current?.setView([loc.lat, loc.lon], 16, { animate: true });
    await buildRouteTo(loc.lat, loc.lon);
  };

  useEffect(() => {
    if ((window as any).L) {
      setMapReady(true);
      return;
    }

    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(css);

    const js = document.createElement("script");
    js.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    js.async = true;
    js.defer = true;
    js.onload = () => setMapReady(true);
    document.head.appendChild(js);
  }, []);

  useEffect(() => {
    if (!mapReady || !mapRef.current || mapInst.current) return;

    const L = (window as any).L;
    const map = L.map(mapRef.current, { zoomControl: false }).setView([20.5937, 78.9629], 5);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);
    L.control.zoom({ position: "bottomright" }).addTo(map);
    mapInst.current = map;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        setCenter(loc);
        setCityLabel("My Location");
        map.setView([loc.lat, loc.lon], 15, { animate: true });
        addUserPin(loc.lat, loc.lon);
        doFetch(loc.lat, loc.lon, cat);
      },
      () => {
        const fallback = { lat: 28.6139, lon: 77.2090 };
        setCenter(fallback);
        setCityLabel("Delhi");
        map.setView([fallback.lat, fallback.lon], 12, { animate: true });
        doFetch(fallback.lat, fallback.lon, cat);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, [mapReady]);

  useEffect(() => {
    if (!center) return;
    doFetch(center.lat, center.lon, cat);
  }, [cat]);

  return (
    <div className="h-[calc(100vh-73px)] flex bg-[#0b1020] overflow-hidden">
      <div className="w-72 flex flex-col border-r border-white/5 bg-[#0d1220] shrink-0 overflow-hidden">
        <div className="p-3 border-b border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <MapPin size={14} className="text-primary" />
            <p className="text-xs font-black text-white uppercase tracking-wider">Service Finder</p>
          </div>

          <div className="flex gap-2 mb-2">
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchCity(city)}
              placeholder="City or area"
              className="flex-1 bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-primary outline-none"
            />
            <button onClick={() => searchCity(city)} disabled={!city.trim() || loading} className="bg-primary hover:bg-orange-600 disabled:opacity-40 text-white font-black px-3 rounded-xl text-xs">
              Go
            </button>
          </div>

          <button onClick={useGPS} disabled={loading} className="w-full flex items-center justify-center gap-2 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-300 rounded-xl text-xs font-bold transition-all">
            <Navigation size={12} /> Use GPS Location
          </button>

          <div className="mt-2 p-2 rounded-xl border border-white/10 bg-white/5">
            <p className="text-[10px] text-muted-foreground mb-1">No data? Route by destination</p>
            <div className="flex gap-1.5">
              <input
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && routeToDestination()}
                placeholder="e.g. Mukherjee Nagar Delhi"
                className="flex-1 bg-[#0b1020] border border-white/10 text-white rounded-lg px-2 py-1.5 text-[10px] focus:ring-2 focus:ring-primary outline-none"
              />
              <button
                onClick={routeToDestination}
                disabled={routeLoading || !destination.trim()}
                className="px-2 py-1.5 text-[10px] font-bold rounded-lg bg-primary/20 text-primary border border-primary/30 disabled:opacity-40"
              >
                Route
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-1 mt-2">
            {CITIES.slice(0, 6).map((c) => (
              <button key={c} onClick={() => { setCity(c); searchCity(c); }} className="text-[10px] px-2 py-1 bg-white/5 hover:bg-primary/10 border border-white/10 hover:border-primary/30 text-muted-foreground hover:text-white rounded-lg transition-all">
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-1 px-2 py-2 border-b border-white/5 overflow-x-auto">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              style={cat === c.id ? { background: `${c.color}22`, borderColor: `${c.color}55`, color: "#fff" } : {}}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl whitespace-nowrap font-bold text-[10px] border transition-all ${cat === c.id ? "border-opacity-50 shadow-md" : "bg-white/5 border-white/10 text-muted-foreground"}`}
            >
              <span style={{ color: c.color }}>{c.short}</span> {c.label}
            </button>
          ))}
        </div>

        {error ? <p className="mx-2 mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded-xl text-[10px] text-red-400">{error}</p> : null}

        <AnimatePresence>
          {(route || routeLoading) && selected ? (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mx-2 mt-2 p-3 rounded-2xl border border-white/10 bg-white/5">
              {routeLoading ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 size={12} className="animate-spin text-primary" />
                  <span>Calculating route...</span>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-1.5 text-white font-black text-sm"><Route size={14} style={{ color: activeCat.color }} />{route?.dist}</div>
                    <div className="flex items-center gap-1.5 text-muted-foreground text-xs"><Clock size={11} />{route?.time}</div>
                  </div>
                  {route?.steps?.length ? <div className="space-y-1">{route.steps.slice(0, 3).map((s, i) => <p key={i} className="text-[10px] text-slate-400">{s}</p>)}</div> : null}
                </>
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2">
            <div className="relative">
              <div className="w-10 h-10 border-2 border-t-primary border-white/10 rounded-full animate-spin" />
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black" style={{ color: activeCat.color }}>{activeCat.short}</span>
            </div>
            <p className="text-xs text-muted-foreground">Finding {activeCat.label}...</p>
          </div>
        ) : null}

        <div className="flex-1 overflow-y-auto p-2 space-y-1.5 custom-scrollbar">
          {places.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.02 }}
              onClick={() => selectPlace(p)}
              className={`p-3 rounded-2xl border cursor-pointer transition-all ${selected?.id === p.id ? "border-white/20 shadow-lg" : "bg-white/5 border-white/5 hover:bg-white/10"}`}
              style={selected?.id === p.id ? { background: `${activeCat.color}18`, borderColor: `${activeCat.color}44` } : {}}
            >
              <div className="flex gap-2.5 items-start">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black shrink-0 text-white" style={{ background: `${activeCat.color}88` }}>{activeCat.short}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-xs truncate">{p.name}</p>
                  {p.address ? <p className="text-[10px] text-muted-foreground truncate mt-0.5">{p.address}</p> : null}
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    {p.source === "partner" ? <span className="inline-flex items-center gap-0.5 text-[8px] font-black px-1.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/25"><Star size={8} /> VERIFIED</span> : null}
                    <span className="text-[10px] font-bold" style={{ color: activeCat.color }}>{distanceText(p.km)}</span>
                    {p.price ? <span className="inline-flex items-center text-[10px] font-bold text-white/80"><IndianRupee size={9} />{p.price}</span> : null}
                    {p.rating ? <span className="text-[10px] text-amber-300">Rating {p.rating.toFixed(1)}</span> : null}
                  </div>
                  <div className="flex gap-1 mt-1.5 flex-wrap" onClick={(e) => e.stopPropagation()}>
                    <a href={`https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lon}`} target="_blank" rel="noopener noreferrer" className="text-[9px] px-1.5 py-0.5 bg-primary/20 text-primary rounded-md hover:bg-primary/30 flex items-center gap-0.5"><Navigation size={8} />Navigate</a>
                    {p.phone ? <a href={`tel:${p.phone}`} className="text-[9px] px-1.5 py-0.5 bg-green-500/10 text-green-400 rounded-md flex items-center gap-0.5"><Phone size={8} />Call</a> : null}
                    {p.website ? <a href={normalizeUrl(p.website)} target="_blank" rel="noopener noreferrer" className="text-[9px] px-1.5 py-0.5 bg-blue-500/10 text-blue-300 rounded-md flex items-center gap-0.5"><Globe2 size={8} />Web</a> : null}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="p-2 border-t border-white/5 text-center">
          <p className="text-[9px] text-muted-foreground">{partnerCount} verified Adumate providers | search radius {resultRadiusKm}km</p>
        </div>
      </div>

      <div className="flex-1 relative">
        <div ref={mapRef} className="w-full h-full" />
        {!mapReady ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0b1020]">
            <Loader2 size={32} className="animate-spin text-primary" />
          </div>
        ) : null}

        {selected ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-5 left-1/2 -translate-x-1/2 w-[22rem] max-w-[calc(100vw-2rem)] bg-[#0d1220]/96 backdrop-blur-2xl border border-white/10 rounded-3xl p-4 shadow-2xl z-[1000]"
          >
            <button onClick={() => { setSelected(null); clearRoute(); }} className="absolute top-3 right-3 text-muted-foreground hover:text-white text-lg">x</button>
            <div className="flex gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[11px] font-black text-white shrink-0" style={{ background: activeCat.color }}>{activeCat.short}</div>
              <div className="min-w-0 pr-5">
                <div className="flex items-center gap-2">
                  {selected.source === "partner" ? <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/25">VERIFIED</span> : null}
                  <p className="font-black text-white text-sm truncate">{selected.name}</p>
                </div>
                {selected.address ? <p className="text-[10px] text-muted-foreground line-clamp-2">{selected.address}</p> : null}
                {selected.description ? <p className="text-[10px] text-slate-400 line-clamp-2 mt-1">{selected.description}</p> : null}
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {route ? <p className="text-xs font-bold" style={{ color: activeCat.color }}>{route.dist} | {route.time}</p> : null}
                  {selected.price ? <p className="text-xs font-bold text-white inline-flex items-center"><IndianRupee size={11} />{selected.price}</p> : null}
                  {selected.rating ? <p className="text-xs text-amber-300">Rating {selected.rating.toFixed(1)}</p> : null}
                </div>
              </div>
            </div>
            <div className="flex gap-1.5 mb-3 flex-wrap">
              {selected.phone ? <a href={`tel:${selected.phone}`} className="text-[10px] px-2 py-1 bg-green-500/10 text-green-400 rounded-md flex items-center gap-1"><Phone size={10} />Call</a> : null}
              {selected.website ? <a href={normalizeUrl(selected.website)} target="_blank" rel="noopener noreferrer" className="text-[10px] px-2 py-1 bg-blue-500/10 text-blue-300 rounded-md flex items-center gap-1"><Globe2 size={10} />Website</a> : null}
              {selected.instagram ? <a href={normalizeUrl(selected.instagram)} target="_blank" rel="noopener noreferrer" className="text-[10px] px-2 py-1 bg-pink-500/10 text-pink-300 rounded-md flex items-center gap-1"><ExternalLink size={10} />Instagram</a> : null}
              {selected.whatsapp ? <a href={whatsappUrl(selected.whatsapp)} target="_blank" rel="noopener noreferrer" className="text-[10px] px-2 py-1 bg-green-500/10 text-green-300 rounded-md flex items-center gap-1"><ExternalLink size={10} />WhatsApp</a> : null}
            </div>
            <div className="flex gap-2">
              <a href={`https://www.google.com/maps/dir/?api=1&destination=${selected.lat},${selected.lon}`} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-1.5 text-xs font-black py-2.5 text-white rounded-xl transition-all" style={{ background: activeCat.color }}>
                <Navigation size={12} /> Get Directions
              </a>
              <a href={`https://www.google.com/maps/search/?api=1&query=${selected.lat},${selected.lon}`} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all">
                <ExternalLink size={12} /> Maps
              </a>
            </div>
          </motion.div>
        ) : null}

        <div className="absolute top-3 right-3 bg-[#0d1220]/90 backdrop-blur border border-white/10 rounded-2xl p-2.5 z-[999] text-[10px]">
          <p className="font-black text-white"><span style={{ color: activeCat.color }}>{activeCat.short}</span> {activeCat.label}</p>
          {cityLabel ? <p style={{ color: activeCat.color }}>{cityLabel}</p> : null}
          <p className="text-muted-foreground">{places.length} found | {partnerCount} verified | {resultRadiusKm}km</p>
          {route ? <p className="text-green-400 mt-1">Route: {route.dist}</p> : null}
        </div>
      </div>
    </div>
  );
}

export default function MapWrapper() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader2 size={36} className="animate-spin text-primary" /></div>}>
      <MapPage />
    </Suspense>
  );
}
