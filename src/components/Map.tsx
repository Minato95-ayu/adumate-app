"use client";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, CircleMarker, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Provider } from "@/data/providers";
import { Star, Video, Camera, MessageCircle, MapPin, Navigation, Clock, Ruler } from "lucide-react";

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
}

// Centering Helper
function ChangeView({ center }: { center: { lat: number; lng: number } }) {
  const map = useMap();
  useEffect(() => {
    map.setView([center.lat, center.lng], 14);
  }, [center, map]);
  return null;
}

export default function Map({ providers, center = { lat: 28.6139, lng: 77.2090 } }: MapProps) {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [route, setRoute] = useState<[number, number][] | null>(null);
  const [routeInfo, setRouteInfo] = useState<{ distance: string, duration: string } | null>(null);
  const [loadingRoute, setLoadingRoute] = useState(false);

  useEffect(() => {
    // Fix Leaflet Default Icon path issues in Next.js
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
      });
    }
  }, []);

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
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <ChangeView center={center} />

        {userLocation && (
          <CircleMarker center={userLocation} radius={10} pathOptions={{ fillColor: "#3b82f6", color: "white", fillOpacity: 0.8, weight: 3 }}>
            <Popup>Aap yahan hain</Popup>
          </CircleMarker>
        )}

        {route && <Polyline positions={route} pathOptions={{ color: "#FF6B00", weight: 6, opacity: 0.9, lineJoin: 'round' }} />}

        {providers.map((p) => (
          <Marker key={p.id} position={[p.lat, p.lng]} icon={createCustomIcon("#FF6B00")}>
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
        .leaflet-container { background: #0a0f1a !important; }
      `}</style>
    </div>
  );
}
