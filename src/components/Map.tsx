"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, Polyline } from "@react-google-maps/api";
import { Provider } from "@/data/providers";
import { Star, Video, Camera, MessageCircle, MapPin, Navigation, Clock, Ruler } from "lucide-react";

// Map Styles (Dark Mode)
const mapStyles = [
  { "elementType": "geometry", "stylers": [{ "color": "#1d2c4d" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#8ec3b9" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#1a3646" }] },
  { "featureType": "administrative.country", "elementType": "geometry.stroke", "stylers": [{ "color": "#4b6878" }] },
  { "featureType": "landscape.man_made", "elementType": "geometry.stroke", "stylers": [{ "color": "#334e87" }] },
  { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#304a7d" }] },
  { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#98a5be" }] },
  { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#2c6675" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#0e1626" }] }
];

const containerStyle = {
  width: '100%',
  height: '100%'
};

interface MapProps {
  providers: Provider[];
  center?: { lat: number; lng: number };
}

export default function Map({ providers, center = { lat: 28.6139, lng: 77.2090 } }: MapProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || ""
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [route, setRoute] = useState<{ lat: number; lng: number }[] | null>(null);
  const [routeInfo, setRouteInfo] = useState<{ distance: string, duration: string } | null>(null);
  const [loadingRoute, setLoadingRoute] = useState(false);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      });
    }
  }, []);

  const onUnmount = useCallback(function callback(map: google.maps.Map) {
    setMap(null);
  }, []);

  const getRoute = async (endLat: number, endLng: number) => {
    if (!userLocation) {
      alert("Pehle apni location allow karein!");
      return;
    }
    
    setLoadingRoute(true);
    const start = `${userLocation.lng},${userLocation.lat}`;
    const end = `${endLng},${endLat}`;
    
    try {
      const resp = await fetch(`/api/route?start=${start}&end=${end}`);
      const data = await resp.json();
      
      if (data.features && data.features.length > 0) {
        const coords = data.features[0].geometry.coordinates.map((c: any) => ({ lat: c[1], lng: c[0] }));
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

  if (!isLoaded) return <div className="h-full w-full bg-[#0a0f1a] flex items-center justify-center text-white font-bold">Loading Google Maps...</div>;

  return (
    <div className="h-full w-full relative">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={13}
        onLoad={m => setMap(m)}
        onUnmount={onUnmount}
        options={{
          styles: mapStyles,
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false
        }}
      >
        {/* User Marker */}
        {userLocation && (
          <Marker
            position={userLocation}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: "#3b82f6",
              fillOpacity: 0.8,
              strokeWeight: 2,
              strokeColor: "white",
            }}
          />
        )}

        {/* Provider Markers */}
        {providers.map((p) => (
          <Marker 
            key={p.id} 
            position={{ lat: p.lat, lng: p.lng }}
            onClick={() => setSelectedProvider(p)}
            icon={{
              url: "https://maps.google.com/mapfiles/ms/icons/orange-dot.png"
            }}
          />
        ))}

        {/* Route Line */}
        {route && (
          <Polyline
            path={route}
            options={{
              strokeColor: "#FF6B00",
              strokeOpacity: 0.9,
              strokeWeight: 6,
            }}
          />
        )}

        {/* Info Window */}
        {selectedProvider && (
          <InfoWindow
            position={{ lat: selectedProvider.lat, lng: selectedProvider.lng }}
            onCloseClick={() => setSelectedProvider(null)}
          >
            <div className="w-[260px] p-2 bg-[#0f172a] text-white rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <img src={selectedProvider.photo} alt={selectedProvider.name} className="w-12 h-12 rounded-full border-2 border-[#FF6B00] object-cover" />
                <div>
                  <h3 className="font-bold text-sm m-0 leading-tight text-white">{selectedProvider.name}</h3>
                  <p className="text-[10px] text-slate-400 m-0">{selectedProvider.subject}</p>
                  <div className="flex items-center text-yellow-400 mt-1">
                    <Star size={10} fill="currentColor" />
                    <span className="text-[10px] ml-1 font-bold">{selectedProvider.rating}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-black text-[#FF6B00]">{selectedProvider.fees}</span>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <MapPin size={10} /> {selectedProvider.address?.split(',')[0]}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                {selectedProvider.social.youtube && (
                  <a href={selectedProvider.social.youtube} target="_blank" className="flex items-center justify-center gap-1 bg-red-600/10 hover:bg-red-600/30 text-red-500 py-2 rounded-xl text-[10px] font-bold transition-all border border-red-500/20">
                    <Video size={12} /> YouTube
                  </a>
                )}
                {selectedProvider.social.instagram && (
                  <a href={`https://instagram.com/${selectedProvider.social.instagram}`} target="_blank" className="flex items-center justify-center gap-1 bg-pink-600/10 hover:bg-pink-600/30 text-pink-500 py-2 rounded-xl text-[10px] font-bold transition-all border border-pink-500/20">
                    <Camera size={12} /> Insta
                  </a>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <a href={`https://wa.me/${selectedProvider.social.whatsapp}`} target="_blank" className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-xl text-xs font-black transition-all shadow-lg shadow-green-500/20">
                  <MessageCircle size={14} /> WhatsApp
                </a>
                <button onClick={() => getRoute(selectedProvider.lat, selectedProvider.lng)} disabled={loadingRoute} className="flex items-center justify-center gap-2 bg-[#FF6B00] hover:bg-[#E66000] text-white py-2.5 rounded-xl text-xs font-black transition-all shadow-lg shadow-primary/20 disabled:opacity-50">
                  {loadingRoute ? "Calculating..." : <><Navigation size={14} /> Get Route</>}
                </button>
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {routeInfo && (
        <div className="absolute top-20 md:top-6 left-4 right-4 md:left-1/2 md:-translate-x-1/2 z-[1000] bg-slate-900/90 backdrop-blur-2xl border border-primary/30 rounded-[1.5rem] p-4 flex items-center justify-between md:justify-center md:gap-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
          <div className="flex items-center gap-3">
            <Ruler size={20} className="text-[#FF6B00]" />
            <div className="text-left">
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-tighter">Distance</p>
              <p className="text-sm font-black text-white">{routeInfo.distance}</p>
            </div>
          </div>
          <div className="hidden md:block w-px h-8 bg-white/10" />
          <div className="flex items-center gap-3">
            <Clock size={20} className="text-[#FF6B00]" />
            <div className="text-left">
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-tighter">Time</p>
              <p className="text-sm font-black text-white">{routeInfo.duration}</p>
            </div>
          </div>
          <button onClick={() => { setRoute(null); setRouteInfo(null); }} className="w-9 h-9 rounded-xl bg-white/5 hover:bg-red-500/20 flex items-center justify-center text-white transition-all border border-white/10">✕</button>
        </div>
      )}

      <style>{`
        .gm-style-iw {
          background: #0f172a !important;
          color: white !important;
          border-radius: 1.5rem !important;
          padding: 0 !important;
          box-shadow: 0 20px 50px rgba(0,0,0,0.5) !important;
        }
        .gm-style-iw-d { overflow: hidden !important; }
        .gm-ui-hover-effect { display: none !important; }
        .gm-style-iw-tc::after { background: #0f172a !important; }
      `}</style>
    </div>
  );
}
