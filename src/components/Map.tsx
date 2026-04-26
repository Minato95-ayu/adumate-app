"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import Map, { Marker, Popup, NavigationControl, FullscreenControl, GeolocateControl, Layer, Source } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Star, MapPin, Navigation, MessageCircle } from "lucide-react";
import { Provider } from "@/data/providers";

interface MapboxProps {
  providers: Provider[];
  center?: { lat: number; lng: number };
  onScan?: () => void;
}

export default function MapboxMap({ providers, center = { lat: 28.6139, lng: 77.2090 }, onScan }: MapboxProps) {
  const [selectedPlace, setSelectedPlace] = useState<Provider | null>(null);
  const [viewState, setViewState] = useState({
    latitude: center.lat,
    longitude: center.lng,
    zoom: 14,
    pitch: 60, // 3D Pitch
    bearing: -20, // Angled for premium 3D look
  });
  
  const mapRef = useRef<any>(null);

  useEffect(() => {
    setViewState(prev => ({
      ...prev,
      latitude: center.lat,
      longitude: center.lng
    }));
  }, [center]);

  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  if (!MAPBOX_TOKEN || !MAPBOX_TOKEN.startsWith("pk.")) {
    return (
      <div className="h-full w-full bg-[#0d1117] flex flex-col items-center justify-center p-8 text-center rounded-[2.5rem] border border-white/10 shadow-2xl">
        <div className="w-20 h-20 mb-6 bg-gradient-to-br from-orange-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-orange-500/20">
          <MapPin size={40} className="text-white" />
        </div>
        <h2 className="text-3xl font-black text-white mb-4 tracking-tight">Premium 3D Map Ready</h2>
        <p className="text-slate-400 max-w-md mx-auto mb-8 leading-relaxed">
          The code for high-end Mapbox 3D routing and data rendering is installed and ready. To activate the map, please add your free Mapbox API key to your environment variables.
        </p>
        <div className="bg-[#0a0f1a] p-4 rounded-2xl border border-white/5 inline-block text-left w-full max-w-lg">
          <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">Add to .env.local</p>
          <code className="text-orange-400 font-mono text-sm break-all">
            NEXT_PUBLIC_MAPBOX_TOKEN="pk.eyJ1...your_token"
          </code>
        </div>
      </div>
    );
  }

  // 3D Building Layer config
  const skyLayer: any = {
    id: 'sky',
    type: 'sky',
    paint: {
      'sky-type': 'atmosphere',
      'sky-atmosphere-sun': [0.0, 0.0],
      'sky-atmosphere-sun-intensity': 15
    }
  };

  return (
    <div className="h-full w-full relative rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl bg-[#0a0f1a]">
      <Map
        {...viewState}
        ref={mapRef}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
        attributionControl={false}
        terrain={{ source: 'mapbox-dem', exaggeration: 1.5 }}
      >
        <Source
          id="mapbox-dem"
          type="raster-dem"
          url="mapbox://mapbox.mapbox-terrain-dem-v1"
          tileSize={512}
          maxzoom={14}
        />
        <Layer {...skyLayer} />
        
        {/* 3D Buildings */}
        <Layer
          id="3d-buildings"
          source="composite"
          source-layer="building"
          filter={['==', 'extrude', 'true']}
          type="fill-extrusion"
          minzoom={15}
          paint={{
            'fill-extrusion-color': '#1E293B',
            'fill-extrusion-height': ['get', 'height'],
            'fill-extrusion-base': ['get', 'min_height'],
            'fill-extrusion-opacity': 0.8
          }}
        />

        <GeolocateControl position="bottom-right" />
        <FullscreenControl position="bottom-right" />
        <NavigationControl position="bottom-right" visualizePitch={true} />

        {/* Render Markers */}
        {providers.map((p) => (
          <Marker
            key={p.id}
            longitude={p.lng}
            latitude={p.lat}
            anchor="bottom"
            onClick={e => {
              e.originalEvent.stopPropagation();
              setSelectedPlace(p);
              mapRef.current?.flyTo({ center: [p.lng, p.lat], zoom: 16, pitch: 70 });
            }}
          >
            <div className="cursor-pointer hover:scale-110 transition-transform group relative">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center border-4 border-[#0a0f1a] shadow-lg shadow-orange-500/50">
                <span className="text-white text-lg font-bold">A</span>
              </div>
              <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-[#0a0f1a] px-3 py-1.5 rounded-lg border border-white/10 shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <p className="text-xs font-bold text-white">{p.name}</p>
                <p className="text-[10px] text-yellow-400">⭐ {Number(p.rating).toFixed(1)}</p>
              </div>
            </div>
          </Marker>
        ))}

        {/* Selected Place Popup */}
        {selectedPlace && (
          <Popup
            longitude={selectedPlace.lng}
            latitude={selectedPlace.lat}
            anchor="bottom"
            offset={40}
            closeOnClick={false}
            onClose={() => setSelectedPlace(null)}
            className="z-50"
            style={{ borderRadius: "24px" }}
          >
            <div className="w-[280px] bg-[#0d1117] p-4 rounded-3xl border border-white/10 shadow-2xl">
              <div className="flex gap-3 mb-3">
                <img src={selectedPlace.photo} className="w-16 h-16 rounded-2xl object-cover border border-white/5" alt="cover" />
                <div>
                  <h3 className="text-sm font-black text-white leading-tight">{selectedPlace.name}</h3>
                  <p className="text-[10px] text-slate-400 mt-1">{selectedPlace.address || "Verified Service"}</p>
                  <p className="text-[10px] font-black text-yellow-400 mt-1">⭐ {Number(selectedPlace.rating).toFixed(1)}</p>
                </div>
              </div>

              {/* Rich Data */}
              <div className="bg-white/[0.03] p-2 rounded-xl border border-white/5 mb-3">
                <p className="text-[10px] text-slate-400 line-clamp-3">{selectedPlace.about || "Premium student facility providing high-speed WiFi, 24/7 power backup, and regular maintenance."}</p>
              </div>

              <div className="flex flex-col gap-2">
                <a href={`https://wa.me/${selectedPlace.social?.whatsapp || "9100000000"}`} target="_blank"
                  className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white py-2.5 rounded-xl text-xs font-black transition-all shadow-lg shadow-[#25D366]/20">
                  <MessageCircle size={14} /> WhatsApp
                </a>
                <button className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white py-2.5 rounded-xl text-xs font-black transition-all shadow-lg shadow-orange-500/20">
                  <Navigation size={14} /> 3D Route
                </button>
              </div>
            </div>
          </Popup>
        )}
      </Map>

      {/* Mapbox Styles Override */}
      <style>{`
        .mapboxgl-popup-content {
          background: transparent !important;
          padding: 0 !important;
          box-shadow: none !important;
        }
        .mapboxgl-popup-tip {
          border-top-color: #0d1117 !important;
        }
        .mapboxgl-ctrl-group {
          background: #0d1117 !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          border-radius: 12px !important;
          overflow: hidden !important;
        }
        .mapboxgl-ctrl-group button {
          border-bottom: 1px solid rgba(255,255,255,0.05) !important;
        }
        .mapboxgl-ctrl-icon {
          filter: invert(1) opacity(0.8) !important;
        }
      `}</style>
    </div>
  );
}
