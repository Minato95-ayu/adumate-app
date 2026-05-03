"use client";
import PartnerBase from "./PartnerBase";
import { Home, Plus, BedDouble, IndianRupee } from "lucide-react";
const ROOMS = [
  { id:"1", type:"Single", rent:5500, deposit:5500, available:true, amenities:["AC","WiFi","Attached Bath"] },
  { id:"2", type:"Double Sharing", rent:3800, deposit:3000, available:false, amenities:["Fan","WiFi","Common Bath"] },
  { id:"3", type:"Triple Sharing", rent:2800, deposit:2000, available:true, amenities:["Fan","Common Bath"] },
];
export default function HostelDashboard() {
  return (
    <PartnerBase serviceLabel="Hostel/PG" serviceColor="#8b5cf6" serviceBg="from-purple-500/20 to-purple-500/5"
      serviceBorder="border-purple-500/30" serviceIcon={<Home size={20}/>} partnerName="Shree PG House"
      tabs={[
        { id:"rooms", label:"Rooms", icon:<BedDouble size={16}/> },
        { id:"bookings", label:"Bookings", icon:<IndianRupee size={16}/> },
      ]}>
      {(tab) => (
        <>
          {tab === "rooms" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-slate-400 text-sm">Manage rooms & beds</p>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500 text-white text-xs font-black"><Plus size={14}/>Add Room</button>
              </div>
              {ROOMS.map(r => (
                <div key={r.id} className={`p-5 rounded-2xl border ${r.available ? "border-green-500/20 bg-green-500/5" : "border-red-500/20 bg-red-500/5"}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-black">{r.type}</p>
                      <p className="text-xs text-slate-400">₹{r.rent}/mo • Deposit ₹{r.deposit}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-black border ${r.available ? "bg-green-500/20 text-green-300 border-green-500/30" : "bg-red-500/20 text-red-300 border-red-500/30"}`}>{r.available ? "Available" : "Occupied"}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {r.amenities.map(a => <span key={a} className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-[10px] text-slate-400">{a}</span>)}
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold">Update Availability</button>
                    <button className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 text-xs font-bold">Approve Booking</button>
                    <button className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 text-xs font-bold">Edit Price</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {tab === "bookings" && (
            <div className="space-y-3">
              {[{name:"Ravi Gupta",room:"Single",deposit:"✅ Paid",rent:"✅ Paid",since:"Apr 1"},{name:"Sunita Mehra",room:"Double",deposit:"✅ Paid",rent:"⏳ Pending",since:"Mar 10"}].map((b,i)=>(
                <div key={i} className="p-4 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center font-black text-purple-400">{b.name[0]}</div>
                    <div>
                      <p className="font-bold">{b.name} — {b.room}</p>
                      <p className="text-xs text-slate-500">Since {b.since} • Deposit {b.deposit}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-black border ${b.rent.includes("✅") ? "bg-green-500/20 text-green-300 border-green-500/30" : "bg-orange-500/20 text-orange-300 border-orange-500/30"}`}>Rent {b.rent}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </PartnerBase>
  );
}
