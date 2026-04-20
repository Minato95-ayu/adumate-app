"use client";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, CircleMarker, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Provider } from "@/data/providers";
import { Star, Video, Camera, MessageCircle, MapPin, Navigation, Clock, Ruler, Radar, Scan, Crosshair } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Premium Dark Markers Fix
const createCustomIcon = (color: string) => {
  return L.divIcon({
    html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>`,
    className: 'custom-div-icon',
    iconSize: [12, 12],
    iconAnchor: [6, 6]
  });
};

interface MapProps {
  providers: Provider[];
  center?: { lat: number; lng: number };
  onScan?: () => void;
}

// Centering Helper
function ChangeView({ center }: { center: { lat: number; lng: number } }) {
  const map = useMap();
  useEffect(() => {
    map.setView([center.lat, center.lng], 14);
  }, [center, map]);
  return null;
}

export default function Map({ providers, center = { lat: 28.6139, lng: 77.2090 }, onScan }: MapProps) {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [route, setRoute] = useState<[number, number][] | null>(null);
  const [routeInfo, setRouteInfo] = useState<{ distance: string, duration: string } | null>(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [followUser, setFollowUser] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [heading, setHeading] = useState(0);

  useEffect(() => {
    // Fix Leaflet Default Icon path issues in Next.js
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition((pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        if (pos.coords.heading) setHeading(pos.coords.heading);
      });
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  const handleScan = async () => {
    setIsScanning(true);
    if (onScan) onScan();
    // Simulate radar scan time
    setTimeout(() => setIsScanning(false), 3000);
  };

  const getRoute = async (endLat: number, endLng: number) => {
    if (!userLocation) {
      alert("Pehle apni location allow karein!");
      return;
    }
    
    setLoadingRoute(true);
    const start = `${userLocation[1]},${userLocation[0]}`;
    const end = `${endLng},${endLat}`;
    
    try {
      const resp = await fetch(`/api/route?start=${start}&end=${end}`);
      const data = await resp.json();
      
      if (data.features && data.features.length > 0) {
        const coords = data.features[0].geometry.coordinates.map((c: any) => [c[1], c[0]]);
        const dist = (data.features[0].properties.summary.distance / 1000).toFixed(1);
        const dur = Math.round(data.features[0].properties.summary.duration / 60);
        
        setRoute(coords);
        setRouteInfo({ distance: `${dist} km`, duration: `${dur} mins` });
      }
    } catch (err) {
      console.error("Routing Error:", err);
    } finally {
      setLoadingRoute(false);
    }
  };

  return (
    <div className="h-full w-full relative overflow-hidden rounded-[2.5rem] border border-white/5 shadow-2xl">
      <MapContainer 
        center={[center.lat, center.lng]} 
        zoom={14} 
        scrollWheelZoom={true} 
        className="h-full w-full z-10 bg-[#0a0f1a]"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ChangeView center={followUser && userLocation ? { lat: userLocation[0], lng: userLocation[1] } : center} />

        {/* Radar Pulse Effect */}
        <AnimatePresence>
          {isScanning && userLocation && (
            <CircleMarker 
              center={userLocation} 
              radius={200} 
              pathOptions={{ fillColor: "#FF6B00", color: "#FF6B00", fillOpacity: 0.1, weight: 1, className: "radar-pulse" }} 
            />
          )}
        </AnimatePresence>

        {userLocation && (
          <CircleMarker center={userLocation} radius={12} pathOptions={{ fillColor: "#3b82f6", color: "white", fillOpacity: 0.9, weight: 3, className: "user-marker" }}>
            <Popup>Aap yahan hain</Popup>
          </CircleMarker>
        )}

        {route && (
          <>
            <Polyline positions={route} pathOptions={{ color: "rgba(255, 255, 255, 0.2)", weight: 8, lineJoin: 'round' }} />
            <Polyline positions={route} pathOptions={{ color: "#FF6B00", weight: 6, lineJoin: 'round', className: "route-line-animated" }} />
          </>
        )}

        {providers.map((p) => (
          <Marker key={p.id} position={[p.lat, p.lng]} icon={createCustomIcon("#FF6B00")}>
            {/* ... popup content same as before ... */}
            <Popup className="custom-popup" maxWidth={280}>
              <div className="w-full min-w-[240px] p-2 bg-[#0f172a] text-white rounded-xl overflow-hidden">
                <div className="flex items-center gap-3 mb-3">
                  <img src={p.photo} alt={p.name} className="w-12 h-12 rounded-full border-2 border-primary object-cover" />
                  <div>
                    <h3 className="font-bold text-sm m-0 leading-tight">{p.name}</h3>
                    <p className="text-[10px] text-muted-foreground m-0">{p.subject}</p>
                    <div className="flex items-center text-yellow-400 mt-1">
                      <Star size={10} fill="currentColor" />
                      <span className="text-[10px] ml-1 font-bold">{p.rating}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-4 px-1">
                  <span className="text-xs font-black text-primary">{p.fees}</span>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <MapPin size={10} /> {p.address?.split(',')[0]}
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <a href={`https://wa.me/${p.social.whatsapp}`} target="_blank" className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-xl text-xs font-black transition-all shadow-lg shadow-green-500/20">
                    <MessageCircle size={14} /> WhatsApp
                  </a>
                  <button onClick={() => getRoute(p.lat, p.lng)} disabled={loadingRoute} className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white py-2.5 rounded-xl text-xs font-black transition-all shadow-lg shadow-primary/20 disabled:opacity-50">
                    {loadingRoute ? "Calculating..." : <><Navigation size={14} /> Get Route</>}
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Zomato-style Overlays */}
      <div className="absolute bottom-6 left-6 z-[1000] flex flex-col gap-3">
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={() => setFollowUser(!followUser)}
          className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all border ${followUser ? "bg-blue-500 border-blue-400 text-white" : "bg-slate-900/90 border-white/10 text-slate-400"}`}
        >
          <Crosshair size={24} className={followUser ? "animate-pulse" : ""} />
        </motion.button>
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={handleScan}
          className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/30 border border-primary/50"
        >
          {isScanning ? <Radar size={24} className="animate-spin" /> : <Scan size={24} />}
        </motion.button>
      </div>

      {routeInfo && (
        <div className="absolute top-20 md:top-6 left-4 right-4 md:left-1/2 md:-translate-x-1/2 z-[1000] bg-slate-900/90 backdrop-blur-2xl border border-primary/30 rounded-[1.5rem] p-4 flex items-center justify-between md:justify-center md:gap-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
          <div className="flex items-center gap-3">
            <Ruler size={20} className="text-primary" />
            <div className="text-left">
              <p className="text-[9px] text-muted-foreground font-black uppercase tracking-tighter">Distance</p>
              <p className="text-sm font-black text-white">{routeInfo.distance}</p>
            </div>
          </div>
          <div className="hidden md:block w-px h-8 bg-white/10" />
          <div className="flex items-center gap-3">
            <Clock size={20} className="text-primary" />
            <div className="text-left">
              <p className="text-[9px] text-muted-foreground font-black uppercase tracking-tighter">Time</p>
              <p className="text-sm font-black text-white">{routeInfo.duration}</p>
            </div>
          </div>
          <button onClick={() => { setRoute(null); setRouteInfo(null); }} className="w-9 h-9 rounded-xl bg-white/5 hover:bg-red-500/20 flex items-center justify-center text-white transition-all border border-white/10">✕</button>
        </div>
      )}

      <style>{`
        .leaflet-popup-content-wrapper {
          background: #0f172a !important;
          color: white !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 1.5rem !important;
          padding: 0 !important;
          box-shadow: 0 20px 50px rgba(0,0,0,0.5) !important;
        }
        .leaflet-popup-content { margin: 0 !important; width: auto !important; }
        .leaflet-popup-tip { background: #0f172a !important; }
        .leaflet-container { background: #f8fafc !important; }
        
        .route-line-animated {
          stroke-dasharray: 10, 10;
          animation: dash 20s linear infinite;
        }
        @keyframes dash {
          to { stroke-dashoffset: -1000; }
        }

        .radar-pulse {
          animation: pulse-radar 3s ease-out infinite;
        }
        @keyframes pulse-radar {
          0% { r: 0; opacity: 0.5; }
          100% { r: 200; opacity: 0; }
        }

        .user-marker {
          filter: drop-shadow(0 0 10px rgba(59, 130, 246, 0.5));
        }

        /* Google Style Popup */
        .custom-popup .leaflet-popup-content-wrapper {
          background: white !important;
          color: #1e293b !important;
          border-radius: 1rem !important;
          padding: 0 !important;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1) !important;
        }
        .custom-popup .leaflet-popup-tip { background: white !important; }
      `}</style>
    </div>
  );
}
