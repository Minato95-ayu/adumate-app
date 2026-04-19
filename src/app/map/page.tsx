"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Navigation, ExternalLink, Phone, Loader2, MapPin, Clock, Route } from "lucide-react";

const CATEGORIES = [
  { id: "library", label: "Libraries",  icon: "📚", color: "#FF6B00" },
  { id: "hostel",  label: "Hostels/PG", icon: "🏠", color: "#3B82F6" },
  { id: "mess",    label: "Mess",        icon: "🍽️",color: "#22C55E" },
  { id: "tutor",   label: "Tutors",      icon: "🎓", color: "#A855F7" },
  { id: "job",     label: "Jobs",        icon: "💼", color: "#EC4899" },
];

const CITIES = ["Delhi","Mumbai","Bangalore","Pune","Hyderabad","Chennai","Kolkata","Jaipur","Lucknow","Indore"];

function km(lat1:number,lon1:number,lat2:number,lon2:number){
  const R=6371,dL=(lat2-lat1)*Math.PI/180,dl=(lon2-lon1)*Math.PI/180;
  const a=Math.sin(dL/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dl/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}

function MapPage() {
  const params = useSearchParams();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInst = useRef<any>(null);
  const markers = useRef<any[]>([]);
  const routeLayer = useRef<any>(null);
  const userMarker = useRef<any>(null);

  const [cat, setCat] = useState(params.get("category") || "library");
  const [city, setCity] = useState("");
  const [cityLabel, setCityLabel] = useState("");
  const [center, setCenter] = useState<{lat:number;lon:number}|null>(null);
  const [places, setPlaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [routeLoading, setRouteLoading] = useState(false);
  const [error, setError] = useState("");
  const [mapReady, setMapReady] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [route, setRoute] = useState<{dist:string;time:string;steps:string[]}|null>(null);

  const activeCat = CATEGORIES.find(c=>c.id===cat)||CATEGORIES[0];

  useEffect(()=>{
    if((window as any).L){setMapReady(true);return;}
    const css=document.createElement("link");
    css.rel="stylesheet";css.href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(css);
    const js=document.createElement("script");
    js.src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    js.onload=()=>setMapReady(true);
    document.head.appendChild(js);
  },[]);

  useEffect(()=>{
    if(!mapReady||!mapRef.current||mapInst.current)return;
    const L=(window as any).L;
    const map=L.map(mapRef.current,{zoomControl:false}).setView([20.5937,78.9629],5);
    // Dark Carto tiles — Uber/Zomato style
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",{
      attribution:'© OpenStreetMap © CARTO',maxZoom:19,subdomains:"abcd"
    }).addTo(map);
    L.control.zoom({position:"bottomright"}).addTo(map);
    mapInst.current=map;
  },[mapReady]);

  useEffect(()=>{if(center)doFetch(center.lat,center.lon,cat);},[cat]);

  const searchCity=async(name:string)=>{
    if(!name.trim())return;
    setLoading(true);setError("");
    try{
      const r=await fetch(`/api/geocode?city=${encodeURIComponent(name)}`);
      const d=await r.json();
      if(!d.lat)throw new Error("City not found");
      const loc={lat:d.lat,lon:d.lon};
      setCenter(loc);setCityLabel(name.trim());
      mapInst.current?.flyTo([d.lat,d.lon],13,{animate:true,duration:1.2});
      doFetch(d.lat,d.lon,cat);
    }catch{setError(`"${name}" nahi mila.`);setLoading(false);}
  };

  const useGPS=()=>{
    setLoading(true);setError("");
    navigator.geolocation.getCurrentPosition(pos=>{
      const loc={lat:pos.coords.latitude,lon:pos.coords.longitude};
      setCenter(loc);setCityLabel("My Location");
      mapInst.current?.flyTo([loc.lat,loc.lon],14,{animate:true});
      addUserPin(loc.lat,loc.lon);
      setLoading(false);
      doFetch(loc.lat,loc.lon,cat);
    },()=>{setError("Location denied. City name se search karo.");setLoading(false);},{enableHighAccuracy:true,timeout:10000});
  };

  const addUserPin=(lat:number,lon:number)=>{
    const L=(window as any).L;
    userMarker.current?.remove();
    const icon=L.divIcon({
      html:`<div style="width:22px;height:22px;background:#FF6B00;border-radius:50%;border:3px solid white;box-shadow:0 0 0 8px rgba(255,107,0,0.25),0 0 0 16px rgba(255,107,0,0.1);animation:pulse2s 2s infinite;"></div>
            <style>@keyframes pulse2s{0%{box-shadow:0 0 0 0 rgba(255,107,0,0.4)}70%{box-shadow:0 0 0 16px transparent}100%{box-shadow:0 0 0 0 transparent}}</style>`,
      iconSize:[22,22],className:""
    });
    userMarker.current=L.marker([lat,lon],{icon}).addTo(mapInst.current).bindPopup("<b>📍 You are here</b>");
  };

  const doFetch=async(lat:number,lon:number,category:string)=>{
    setLoading(true);setError("");setPlaces([]);setSelected(null);setRoute(null);
    clearMarkers();clearRoute();
    try{
      const r=await fetch(`/api/places?lat=${lat}&lon=${lon}&category=${category}&radius=5000`);
      const d=await r.json();
      const sorted=(d.places||[]).map((p:any)=>({...p,km:km(lat,lon,p.lat,p.lon)})).sort((a:any,b:any)=>a.km-b.km);
      setPlaces(sorted);
      addMapMarkers(sorted,CATEGORIES.find(c=>c.id===category)||CATEGORIES[0]);
      if(!sorted.length)setError(`No ${CATEGORIES.find(c=>c.id===category)?.label} found within 5km.`);
    }catch(e:any){setError("Data fetch failed. Retry karo.");}
    finally{setLoading(false);}
  };

  const clearMarkers=()=>{markers.current.forEach(m=>m.remove());markers.current=[];};
  const clearRoute=()=>{routeLayer.current?.remove();routeLayer.current=null;};

  const addMapMarkers=(items:any[],c:typeof activeCat)=>{
    if(!mapInst.current)return;
    const L=(window as any).L;
    items.slice(0,30).forEach(p=>{
      if(!p.lat||!p.lon)return;
      const icon=L.divIcon({
        html:`<div style="background:${c.color};width:34px;height:34px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2.5px solid white;box-shadow:0 4px 14px ${c.color}77;display:flex;align-items:center;justify-content:center;"><span style="transform:rotate(45deg);font-size:15px;">${c.icon}</span></div>`,
        iconSize:[34,34],iconAnchor:[17,34],popupAnchor:[0,-34],className:""
      });
      const m=L.marker([p.lat,p.lon],{icon}).addTo(mapInst.current)
        .bindPopup(`<b>${p.name}</b><br/><small style="color:#888">${p.address||""}</small>`);
      markers.current.push(m);
    });
  };

  const selectPlace=async(p:any)=>{
    setSelected(p);setRoute(null);
    mapInst.current?.flyTo([p.lat,p.lon],16,{animate:true,duration:0.8});
    if(!center)return;
    // Draw OSRM route
    setRouteLoading(true);
    clearRoute();
    try{
      const url=`https://router.project-osrm.org/route/v1/driving/${center.lon},${center.lat};${p.lon},${p.lat}?overview=full&geometries=geojson&steps=true`;
      const r=await fetch(url);
      const d=await r.json();
      if(!d.routes?.[0])throw new Error("No route");
      const routeData=d.routes[0];
      const distM=routeData.distance;
      const durS=routeData.duration;
      const distStr=distM<1000?`${Math.round(distM)}m`:`${(distM/1000).toFixed(1)}km`;
      const timeStr=durS<60?`${Math.round(durS)}s`:`${Math.round(durS/60)} min`;
      const steps=routeData.legs?.[0]?.steps?.slice(0,5).map((s:any)=>s.maneuver?.instruction||s.name).filter(Boolean)||[];
      setRoute({dist:distStr,time:timeStr,steps});
      // Draw route on map
      const L=(window as any).L;
      const latlngs=routeData.geometry.coordinates.map(([ln,la]:number[])=>[la,ln]);
      routeLayer.current=L.polyline(latlngs,{
        color:activeCat.color,weight:5,opacity:0.85,
        dashArray:"",lineCap:"round",lineJoin:"round"
      }).addTo(mapInst.current);
      mapInst.current.fitBounds(routeLayer.current.getBounds(),{padding:[40,40]});
      // Add user pin if not already there
      if(cityLabel!=="My Location"){
        const uicon=L.divIcon({html:`<div style="width:18px;height:18px;background:#fff;border-radius:50%;border:3px solid ${activeCat.color};box-shadow:0 0 0 6px ${activeCat.color}33;"></div>`,iconSize:[18,18],className:""});
        L.marker([center.lat,center.lon],{icon:uicon}).addTo(mapInst.current).bindPopup("<b>📍 Start</b>");
      }
    }catch{setRoute(null);}
    finally{setRouteLoading(false);}
  };

  const filtered=places;

  return(
    <div className="h-[calc(100vh-73px)] flex bg-[#0a0f1a] overflow-hidden">

      {/* Sidebar */}
      <div className="w-72 flex flex-col border-r border-white/5 bg-[#0d1220] overflow-hidden shrink-0">

        {/* Header */}
        <div className="p-3 border-b border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <MapPin size={14} className="text-primary"/>
            <p className="text-xs font-black text-white uppercase tracking-wider">Service Finder</p>
          </div>
          <div className="flex gap-2 mb-2">
            <input value={city} onChange={e=>setCity(e.target.value)} onKeyDown={e=>e.key==="Enter"&&searchCity(city)}
              placeholder="City name (e.g. Delhi)"
              className="flex-1 bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-primary outline-none"/>
            <button onClick={()=>searchCity(city)} disabled={!city.trim()||loading}
              className="bg-primary hover:bg-orange-600 disabled:opacity-40 text-white font-black px-3 rounded-xl text-xs">Go</button>
          </div>
          <button onClick={useGPS} disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-300 rounded-xl text-xs font-bold transition-all">
            <Navigation size={12}/> Use GPS Location
          </button>
          <div className="flex flex-wrap gap-1 mt-2">
            {CITIES.slice(0,6).map(c=>(
              <button key={c} onClick={()=>{setCity(c);searchCity(c);}}
                className="text-[10px] px-2 py-1 bg-white/5 hover:bg-primary/10 border border-white/10 hover:border-primary/30 text-muted-foreground hover:text-white rounded-lg transition-all">{c}</button>
            ))}
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-1 px-2 py-2 border-b border-white/5 overflow-x-auto">
          {CATEGORIES.map(c=>(
            <button key={c.id} onClick={()=>setCat(c.id)}
              style={cat===c.id?{background:c.color+"22",borderColor:c.color+"55",color:"#fff"}:{}}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl whitespace-nowrap font-bold text-[10px] border transition-all ${cat===c.id?"border-opacity-50 shadow-md":"bg-white/5 border-white/10 text-muted-foreground"}`}>
              {c.icon} {c.label}
            </button>
          ))}
        </div>

        {/* Route info */}
        <AnimatePresence>
          {(route||routeLoading)&&selected&&(
            <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} exit={{opacity:0}}
              className="mx-2 mt-2 p-3 rounded-2xl border border-white/10 bg-white/5">
              {routeLoading?(
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 size={12} className="animate-spin text-primary"/><span>Calculating route...</span>
                </div>
              ):(
                <>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-1.5 text-white font-black text-sm"><Route size={14} style={{color:activeCat.color}}/>{route?.dist}</div>
                    <div className="flex items-center gap-1.5 text-muted-foreground text-xs"><Clock size={11}/>{route?.time}</div>
                  </div>
                  {route?.steps?.length?(<div className="space-y-1">{route.steps.slice(0,3).map((s,i)=>(
                    <p key={i} className="text-[10px] text-slate-400 flex gap-1.5"><span style={{color:activeCat.color}}>→</span>{s}</p>
                  ))}</div>):null}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        {error&&<p className="mx-2 mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded-xl text-[10px] text-red-400">{error}</p>}

        {/* States */}
        {!center&&!loading&&<div className="flex-1 flex flex-col items-center justify-center gap-2 p-4 text-center">
          <span className="text-4xl">🗺️</span>
          <p className="text-sm font-black text-white">Apna sheher chuniye</p>
          <p className="text-xs text-muted-foreground">City search karo ya GPS use karo</p>
        </div>}
        {loading&&<div className="flex-1 flex flex-col items-center justify-center gap-2">
          <div className="relative"><div className="w-10 h-10 border-2 border-t-primary border-white/10 rounded-full animate-spin"/>
          <span className="absolute inset-0 flex items-center justify-center text-lg">{activeCat.icon}</span></div>
          <p className="text-xs text-muted-foreground">Finding {activeCat.label}...</p>
        </div>}

        {/* Place list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5 custom-scrollbar">
          {filtered.map((p,i)=>(
            <motion.div key={p.id} initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} transition={{delay:i*0.02}}
              onClick={()=>selectPlace(p)}
              className={`p-3 rounded-2xl border cursor-pointer transition-all ${selected?.id===p.id?`border-white/20 shadow-lg`:"bg-white/5 border-white/5 hover:bg-white/10"}`}
              style={selected?.id===p.id?{background:activeCat.color+"18",borderColor:activeCat.color+"44"}:{}}>
              <div className="flex gap-2.5 items-start">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base shrink-0" style={{background:activeCat.color+"22"}}>{activeCat.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-xs truncate">{p.name}</p>
                  {p.address&&<p className="text-[10px] text-muted-foreground truncate mt-0.5">{p.address}</p>}
                  <p className="text-[10px] font-bold mt-1" style={{color:activeCat.color}}>
                    📍 {p.km<1?`${Math.round(p.km*1000)}m`:`${p.km.toFixed(1)}km`}
                  </p>
                  <div className="flex gap-1 mt-1.5 flex-wrap" onClick={e=>e.stopPropagation()}>
                    <a href={`https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lon}`}
                      target="_blank" rel="noopener noreferrer"
                      className="text-[9px] px-1.5 py-0.5 bg-primary/20 text-primary rounded-md hover:bg-primary/30 flex items-center gap-0.5"><Navigation size={8}/>Navigate</a>
                    {p.phone&&<a href={`tel:${p.phone}`} className="text-[9px] px-1.5 py-0.5 bg-green-500/10 text-green-400 rounded-md flex items-center gap-0.5"><Phone size={8}/>Call</a>}
                    <a href={`https://www.justdial.com/search?what=${encodeURIComponent(p.name)}`}
                      target="_blank" rel="noopener noreferrer"
                      className="text-[9px] px-1.5 py-0.5 bg-white/10 text-slate-300 rounded-md hover:bg-white/20 flex items-center gap-0.5"><ExternalLink size={8}/>JustDial</a>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="p-2 border-t border-white/5 text-center">
          <p className="text-[9px] text-muted-foreground">🤝 Adumate Partners joining soon · OpenStreetMap</p>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <div ref={mapRef} className="w-full h-full"/>

        {!mapReady&&<div className="absolute inset-0 flex items-center justify-center bg-[#0a0f1a]">
          <Loader2 size={32} className="animate-spin text-primary"/>
        </div>}

        {mapReady&&!center&&!loading&&(
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <motion.div initial={{scale:0.9,opacity:0}} animate={{scale:1,opacity:1}}
              className="bg-[#0d1220]/95 border border-white/10 rounded-3xl p-8 text-center max-w-xs shadow-2xl">
              <MapPin size={40} className="text-primary mx-auto mb-4 animate-bounce"/>
              <h3 className="text-xl font-black text-white mb-1">Find {activeCat.icon} {activeCat.label}</h3>
              <p className="text-xs text-muted-foreground mb-5">Select a city to find nearby services</p>
              <div className="grid grid-cols-2 gap-2">
                {CITIES.slice(0,6).map(c=>(
                  <button key={c} onClick={()=>searchCity(c)}
                    className="py-2.5 bg-white/5 hover:bg-primary/10 border border-white/10 hover:border-primary/30 text-white text-xs font-bold rounded-xl transition-all">
                    📍 {c}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {/* Selected overlay */}
        <AnimatePresence>
          {selected&&(
            <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:20}}
              className="absolute bottom-5 left-1/2 -translate-x-1/2 w-80 bg-[#0d1220]/96 backdrop-blur-2xl border border-white/10 rounded-3xl p-4 shadow-2xl z-[1000]">
              <button onClick={()=>{setSelected(null);setRoute(null);clearRoute();}} className="absolute top-3 right-3 text-muted-foreground hover:text-white text-lg">✕</button>
              <div className="flex gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{background:activeCat.color+"22"}}>{activeCat.icon}</div>
                <div><p className="font-black text-white text-sm">{selected.name}</p>
                  {selected.address&&<p className="text-[10px] text-muted-foreground">{selected.address}</p>}
                  {route&&<p className="text-xs font-bold mt-0.5" style={{color:activeCat.color}}>🛣️ {route.dist} · ⏱️ {route.time}</p>}
                </div>
              </div>
              <div className="flex gap-2">
                <a href={`https://www.google.com/maps/dir/?api=1&destination=${selected.lat},${selected.lon}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 text-xs font-black py-2.5 text-white rounded-xl transition-all"
                  style={{background:activeCat.color}}>
                  <Navigation size={12}/> Get Directions
                </a>
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selected.name)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all">
                  <ExternalLink size={12}/> View on Maps
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Legend */}
        <div className="absolute top-3 right-3 bg-[#0d1220]/90 backdrop-blur border border-white/10 rounded-2xl p-2.5 z-[999] text-[10px]">
          <p className="font-black text-white">{activeCat.icon} {activeCat.label}</p>
          {cityLabel&&<p style={{color:activeCat.color}}>📍 {cityLabel}</p>}
          <p className="text-muted-foreground">{places.length} found</p>
          {route&&<p className="text-green-400 mt-1">🛣️ Route: {route.dist}</p>}
        </div>
      </div>
    </div>
  );
}

export default function MapWrapper(){
  return(
    <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader2 size={36} className="animate-spin text-primary"/></div>}>
      <MapPage/>
    </Suspense>
  );
}
