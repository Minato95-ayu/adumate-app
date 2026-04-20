"use client";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, CircleMarker, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Provider } from "@/data/providers";
import { Star, Youtube, Instagram, MessageCircle, MapPin, Navigation, Clock, Ruler } from "lucide-react";

// Fix for default marker icons in Leaflet + Next.js
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

interface MapProps {
  providers: Provider[];
  center?: [number, number];
}

// Component to handle map centering
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  return null;
}

export default function Map({ providers, center = [28.6139, 77.2090] }: MapProps) {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [route, setRoute] = useState<[number, number][] | null>(null);
  const [routeInfo, setRouteInfo] = useState<{ distance: string, duration: string } | null>(null);
  const [loadingRoute, setLoadingRoute] = useState(false);

  useEffect(() => {
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
    const apiKey = process.env.NEXT_PUBLIC_ORS_API_KEY;
    const start = `${userLocation[1]},${userLocation[0]}`;
    const end = `${endLng},${endLat}`;
    
    try {
      const resp = await fetch(`https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${start}&end=${end}`);
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
    <div className="h-full w-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative">
      <MapContainer 
        center={center} 
        zoom={13} 
        scrollWheelZoom={true} 
        className="h-full w-full z-10"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" // Dark theme TileLayer
        />
        
        <ChangeView center={center} />

        {/* User Location */}
        {userLocation && (
          <CircleMarker 
            center={userLocation} 
            radius={8} 
            pathOptions={{ fillColor: "#3b82f6", color: "white", fillOpacity: 1, weight: 2 }}
          >
            <Popup>Aap yahan hain</Popup>
          </CircleMarker>
        )}

        {/* Route Line */}
        {route && (
          <Polyline 
            positions={route} 
            pathOptions={{ color: "#FF6B00", weight: 5, opacity: 0.8, lineJoin: 'round' }} 
          />
        )}

        {/* Provider Markers */}
        {providers.map((p) => (
          <Marker key={p.id} position={[p.lat, p.lng]}>
            <Popup className="custom-popup">
              <div className="w-64 p-2 bg-[#0f172a] text-white rounded-xl overflow-hidden">
                <div className="flex items-center gap-3 mb-3">
                  <img src={p.photo} alt={p.name} className="w-12 h-12 rounded-full border-2 border-primary object-cover" />
                  <div>
                    <h3 className="font-bold text-sm m-0">{p.name}</h3>
                    <p className="text-xs text-muted-foreground m-0">{p.subject}</p>
                    <div className="flex items-center text-yellow-400 mt-1">
                      <Star size={12} fill="currentColor" />
                      <span className="text-[10px] ml-1 font-bold">{p.rating}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-black text-primary">{p.fees}</span>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <MapPin size={10} /> {p.address?.split(',')[0]}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  {p.social.youtube && (
                    <a href={p.social.youtube} target="_blank" className="flex items-center justify-center gap-1 bg-red-600/20 hover:bg-red-600/40 text-red-500 py-1.5 rounded-lg text-[10px] font-bold transition-all border border-red-500/20">
                      <Youtube size={12} /> YouTube
                    </a>
                  )}
                  {p.social.instagram && (
                    <a href={`https://instagram.com/${p.social.instagram}`} target="_blank" className="flex items-center justify-center gap-1 bg-pink-600/20 hover:bg-pink-600/40 text-pink-500 py-1.5 rounded-lg text-[10px] font-bold transition-all border border-pink-500/20">
                      <Instagram size={12} /> Insta
                    </a>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <a 
                    href={`https://wa.me/${p.social.whatsapp}`} 
                    target="_blank"
                    className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-2 rounded-xl text-xs font-black transition-all shadow-lg shadow-green-500/20"
                  >
                    <MessageCircle size={14} /> WhatsApp Connect
                  </a>
                  <button 
                    onClick={() => getRoute(p.lat, p.lng)}
                    disabled={loadingRoute}
                    className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white py-2 rounded-xl text-xs font-black transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                  >
                    {loadingRoute ? "Finding..." : <><Navigation size={14} /> Get Route</>}
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Route Info Overlay */}
      {routeInfo && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[1000] bg-slate-900/90 backdrop-blur-xl border border-primary/30 rounded-2xl p-4 flex items-center gap-6 shadow-2xl">
          <div className="flex items-center gap-2">
            <Ruler size={18} className="text-primary" />
            <div className="text-left">
              <p className="text-[10px] text-muted-foreground font-bold uppercase">Distance</p>
              <p className="text-sm font-black text-white">{routeInfo.distance}</p>
            </div>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-primary" />
            <div className="text-left">
              <p className="text-[10px] text-muted-foreground font-bold uppercase">Duration</p>
              <p className="text-sm font-black text-white">{routeInfo.duration}</p>
            </div>
          </div>
          <button 
            onClick={() => { setRoute(null); setRouteInfo(null); }}
            className="ml-2 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all"
          >
            ✕
          </button>
        </div>
      )}

      {/* Custom Styles for Popup */}
      <style>{`
        .leaflet-popup-content-wrapper {
          background: #0f172a !important;
          color: white !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 1.5rem !important;
          padding: 0 !important;
        }
        .leaflet-popup-content {
          margin: 0 !important;
          width: auto !important;
        }
        .leaflet-popup-tip {
          background: #0f172a !important;
        }
      `}</style>
    </div>
  );
}
