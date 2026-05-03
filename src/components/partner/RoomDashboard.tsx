"use client";
import PartnerBase from "./PartnerBase";
import { BedDouble, Plus, MapPin } from "lucide-react";
export default function RoomDashboard() {
  return (
    <PartnerBase serviceLabel="Room Rent" serviceColor="#f97316" serviceBg="from-orange-500/20 to-orange-500/5"
      serviceBorder="border-orange-500/30" serviceIcon={<BedDouble size={20}/>} partnerName="Comfort Rooms"
      tabs={[{ id:"rooms", label:"My Rooms", icon:<BedDouble size={16}/> }]}>
      {(tab) => (
        <>
          {tab === "rooms" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-slate-400 text-sm">Upload & manage room listings</p>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 text-white text-xs font-black"><Plus size={14}/>Upload Room</button>
              </div>
              {[
                { type:"1BHK Furnished", price:8000, loc:"Near Delhi University", available:true, features:["AC","Furnished","WiFi","2 Wheeler Parking"] },
                { type:"Single Room", price:4500, loc:"Mukherjee Nagar", available:false, features:["Fan","Attached Bath","24x7 Water"] },
              ].map((r,i) => (
                <div key={i} className={`p-5 rounded-2xl border ${r.available ? "border-green-500/20 bg-green-500/5" : "border-orange-500/20 bg-orange-500/5"}`}>
                  <div className="aspect-video rounded-xl bg-gradient-to-br from-orange-500/10 to-purple-500/10 border border-white/10 mb-4 flex items-center justify-center">
                    <p className="text-slate-600 text-xs">📷 Add Photos</p>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-black">{r.type}</p>
                      <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5"><MapPin size={10}/>{r.loc}</div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-orange-400">₹{r.price}/mo</p>
                      <span className={`text-[10px] font-black ${r.available ? "text-green-400" : "text-red-400"}`}>{r.available ? "Available" : "Occupied"}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {r.features.map(f => <span key={f} className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-[10px] text-slate-400">{f}</span>)}
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 rounded-lg bg-orange-500/20 border border-orange-500/30 text-orange-300 text-xs font-bold">Edit Price</button>
                    <button className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 text-xs font-bold">Mark {r.available ? "Occupied" : "Available"}</button>
                    <button className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 text-xs font-bold">📷 Photos</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </PartnerBase>
  );
}
