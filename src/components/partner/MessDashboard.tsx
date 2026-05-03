"use client";
import { useState } from "react";
import PartnerBase from "./PartnerBase";
import { UtensilsCrossed, Plus, CheckCircle } from "lucide-react";
const MENU = { breakfast:["Poha","Chai","Bread Butter"], lunch:["Dal","Rice","Sabzi","Roti","Salad"], dinner:["Dal Fry","Rice","2 Roti","Sabzi","Sweet"] };
export default function MessDashboard() {
  const [vegOnly, setVegOnly] = useState(true);
  return (
    <PartnerBase serviceLabel="Mess" serviceColor="#10b981" serviceBg="from-emerald-500/20 to-emerald-500/5"
      serviceBorder="border-emerald-500/30" serviceIcon={<UtensilsCrossed size={20}/>} partnerName="Annapurna Mess"
      tabs={[
        { id:"menu",     label:"Menu",      icon:<UtensilsCrossed size={16}/> },
        { id:"plans",    label:"Plans",     icon:<Plus size={16}/> },
        { id:"tracking", label:"Today",     icon:<CheckCircle size={16}/> },
      ]}>
      {(tab) => (
        <>
          {tab === "menu" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-slate-400 text-sm">Today's menu</p>
                <button onClick={() => setVegOnly(v => !v)} className={`px-4 py-2 rounded-xl text-xs font-black border transition-all ${vegOnly ? "bg-green-500/20 text-green-300 border-green-500/30" : "bg-orange-500/20 text-orange-300 border-orange-500/30"}`}>
                  {vegOnly ? "🥦 Veg Only" : "🍗 Veg + Non-Veg"}
                </button>
              </div>
              {Object.entries(MENU).map(([meal, items]) => (
                <div key={meal} className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-black capitalize">{meal}</p>
                    <button className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">Update Menu</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {items.map(item => <span key={item} className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-300">{item}</span>)}
                  </div>
                </div>
              ))}
            </div>
          )}
          {tab === "plans" && (
            <div className="space-y-4">
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-white text-xs font-black"><Plus size={14}/>Add Plan</button>
              {[{name:"Monthly Full",price:2800,meals:"All 3 meals",students:28},{name:"Monthly Lunch Only",price:1800,meals:"Lunch only",students:12},{name:"Weekly Trial",price:800,meals:"All 3 meals",students:5}].map((p,i)=>(
                <div key={i} className="p-5 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <p className="font-black">{p.name}</p>
                    <p className="text-xs text-slate-400">₹{p.price}/period • {p.meals}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-emerald-400">{p.students} students</span>
                    <button className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 text-xs font-bold">Edit</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {tab === "tracking" && (
            <div className="space-y-4">
              <p className="text-slate-400 text-sm">Mark meal served for today</p>
              {["Breakfast","Lunch","Dinner"].map(meal => (
                <div key={meal} className="p-4 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-between">
                  <p className="font-bold">{meal}</p>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/20 border border-green-500/30 text-green-300 text-xs font-black hover:bg-green-500/30 transition-all">
                    <CheckCircle size={12}/> Mark Served
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </PartnerBase>
  );
}
