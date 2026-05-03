"use client";
import { useState, ReactNode } from "react";
import { LayoutDashboard, Bell, Settings, LogOut, Star, CheckCircle, IndianRupee, TrendingUp } from "lucide-react";
import Link from "next/link";

export interface BaseTab { id: string; label: string; icon: ReactNode; }

interface Props {
  serviceLabel: string;
  serviceColor: string;
  serviceBg: string;
  serviceBorder: string;
  serviceIcon: ReactNode;
  partnerName?: string;
  rating?: number;
  tabs: BaseTab[];
  children: (activeTab: string) => ReactNode;
  stats?: { label: string; value: string; sub: string; color: string }[];
}

export default function PartnerBase({
  serviceLabel, serviceColor, serviceBg, serviceBorder, serviceIcon,
  partnerName = "My Business", rating = 4.5, tabs, children,
  stats = []
}: Props) {
  const allTabs: BaseTab[] = [
    { id: "overview",      label: "Overview",      icon: <LayoutDashboard size={16} /> },
    { id: "earnings",      label: "Earnings",      icon: <IndianRupee size={16} /> },
    { id: "reviews",       label: "Reviews",       icon: <Star size={16} /> },
    { id: "notifications", label: "Alerts",        icon: <Bell size={16} /> },
    ...tabs,
  ];
  const [active, setActive] = useState(tabs[0]?.id ?? "overview");

  const overviewStats = [
    { label: "Monthly Earn", value: "₹18,400", sub: "+8% this month", color: "text-green-400" },
    { label: "Active Students", value: "34",    sub: "Currently enrolled", color: "text-blue-400" },
    { label: "Rating", value: `${rating}⭐`,    sub: "128 reviews",        color: "text-amber-400" },
    { label: "Notifications", value: "3",       sub: "Unread alerts",      color: "text-orange-400" },
    ...stats,
  ];

  return (
    <div className="min-h-screen bg-[#050a14] text-white flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-60 border-r border-white/10 bg-[#060d1a] shrink-0">
        <div className="p-5 border-b border-white/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center font-black text-white">A</div>
          <div><p className="font-black text-sm">Adumate Partner</p><p className="text-[10px] text-slate-500">{serviceLabel} Dashboard</p></div>
        </div>

        <div className={`m-3 p-3 rounded-2xl bg-gradient-to-br ${serviceBg} border ${serviceBorder} flex items-center gap-3`}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ color: serviceColor, background: `${serviceColor}20` }}>{serviceIcon}</div>
          <div>
            <p className="text-sm font-bold truncate">{partnerName}</p>
            <div className="flex items-center gap-1 text-[10px] text-emerald-400"><CheckCircle size={10} /> Verified</div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {allTabs.map(t => (
            <button key={t.id} onClick={() => setActive(t.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${active === t.id ? "bg-orange-500/20 text-orange-300 border border-orange-500/30" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}>
              {t.icon} {t.label}
            </button>
          ))}
        </nav>

        <div className="p-3 space-y-0.5 border-t border-white/10">
          <Link href="/partner/register" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-slate-500 hover:text-white hover:bg-white/5 transition-all"><Settings size={16} /> Change Type</Link>
          <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-slate-500 hover:text-red-400 hover:bg-red-500/5 transition-all"><LogOut size={16} /> Logout</button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex border-t border-white/10 bg-[#060d1a]">
        {allTabs.slice(0, 5).map(t => (
          <button key={t.id} onClick={() => setActive(t.id)} className={`flex-1 flex flex-col items-center gap-1 py-3 text-[9px] font-black ${active === t.id ? "text-orange-400" : "text-slate-600"}`}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#060d1a]/50 shrink-0">
          <div>
            <h1 className="font-black text-lg">{allTabs.find(t => t.id === active)?.label}</h1>
            <p className="text-xs text-slate-500">{serviceLabel} Partner Dashboard</p>
          </div>
          <button className="p-2.5 rounded-xl border border-white/10 bg-white/5"><Bell size={16} className="text-slate-400" /></button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 pb-24 md:pb-6 space-y-6">
          {/* Common: Overview */}
          {active === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {overviewStats.map((s, i) => (
                  <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                    <p className="text-xs font-bold text-slate-400 mt-1">{s.label}</p>
                    <p className="text-[10px] text-slate-600 mt-0.5">{s.sub}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="font-black mb-4">Quick Analytics</p>
                <div className="flex items-end gap-2 h-24">
                  {[60,70,55,80,75,90,85].map((h,i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full rounded-t bg-gradient-to-t from-orange-500 to-amber-400" style={{height:`${h}%`}} />
                      <p className="text-[8px] text-slate-600">{["M","T","W","T","F","S","S"][i]}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Common: Earnings */}
          {active === "earnings" && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {[{l:"This Month",v:"₹18,400",c:"text-green-400"},{l:"Last Month",v:"₹16,200",c:"text-slate-400"},{l:"Total",v:"₹1,40,800",c:"text-orange-400"}].map((e,i)=>(
                  <div key={i} className="p-5 rounded-2xl border border-white/10 bg-white/5">
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-2">{e.l}</p>
                    <p className={`text-2xl font-black ${e.c}`}>{e.v}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="font-black mb-4">Monthly Trend</p>
                <div className="flex items-end gap-2 h-28">
                  {[14000,16000,13000,16200,18400].map((v,i)=>(
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full rounded-t bg-gradient-to-t from-orange-500 to-amber-400" style={{height:`${(v/18400)*100}%`}} />
                      <p className="text-[9px] text-slate-500">{["Jan","Feb","Mar","Apr","May"][i]}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Common: Reviews */}
          {active === "reviews" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 flex items-center gap-6">
                <div className="text-center"><p className="text-5xl font-black text-amber-400">4.7</p><div className="flex gap-0.5 mt-1">{"⭐⭐⭐⭐⭐".split("").map((s,i)=><span key={i}>{s}</span>)}</div><p className="text-xs text-slate-500 mt-1">128 reviews</p></div>
                <div className="flex-1 space-y-1">
                  {[{stars:5,pct:72},{stars:4,pct:18},{stars:3,pct:7},{stars:2,pct:2},{stars:1,pct:1}].map(r=>(
                    <div key={r.stars} className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 w-4">{r.stars}⭐</span>
                      <div className="flex-1 h-2 rounded-full bg-white/10"><div className="h-full rounded-full bg-amber-400" style={{width:`${r.pct}%`}} /></div>
                      <span className="text-xs text-slate-500 w-8">{r.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
              {[{name:"Rahul S.",text:"Bahut acchi library hai, peaceful environment.",stars:5},{name:"Priya K.",text:"Seats clean hain, AC bhi hai. Worth it!",stars:4},{name:"Amit V.",text:"Thoda mehenga hai but quality good.",stars:4}].map((r,i)=>(
                <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-700 flex items-center justify-center font-black text-sm">{r.name[0]}</div>
                      <p className="font-bold text-sm">{r.name}</p>
                    </div>
                    <span className="text-xs text-amber-400">{"⭐".repeat(r.stars)}</span>
                  </div>
                  <p className="text-sm text-slate-400">{r.text}</p>
                  <button className="mt-2 text-xs text-orange-400 hover:underline">Reply</button>
                </div>
              ))}
            </div>
          )}

          {/* Common: Notifications */}
          {active === "notifications" && (
            <div className="space-y-3">
              {[
                {icon:"👤",title:"New Inquiry",desc:"Rahul Sharma ne Library Seat A ke liye enquiry ki",time:"2 min ago",color:"border-orange-500/30 bg-orange-500/5"},
                {icon:"💰",title:"Payment Received",desc:"₹1,200 received from Priya Singh",time:"1 hr ago",color:"border-green-500/30 bg-green-500/5"},
                {icon:"🪑",title:"Seats Almost Full",desc:"Sirf 2 seats remaining — update karein",time:"3 hr ago",color:"border-blue-500/30 bg-blue-500/5"},
                {icon:"⭐",title:"New Review",desc:"Amit Kumar ne 4 star diya aur review likha",time:"Yesterday",color:"border-white/10 bg-white/5"},
              ].map((n,i)=>(
                <div key={i} className={`flex items-start gap-4 p-4 rounded-2xl border ${n.color}`}>
                  <span className="text-2xl">{n.icon}</span>
                  <div>
                    <p className="font-bold text-white text-sm">{n.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{n.desc}</p>
                    <p className="text-[10px] text-slate-600 mt-1">{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Service-specific modules */}
          {!["overview","earnings","reviews","notifications"].includes(active) && children(active)}
        </div>
      </main>
    </div>
  );
}
