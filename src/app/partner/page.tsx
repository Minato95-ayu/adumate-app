"use client";
import { useState, useEffect } from "react";
import { LayoutDashboard, Users, Bed, IndianRupee, TrendingUp, Bell, Settings, LogOut, Plus, Edit2, Eye, CheckCircle, XCircle, Clock, MapPin, Phone, Star } from "lucide-react";

interface Seat { id: string; type: string; price: number; available: boolean; }
interface Inquiry { id: string; name: string; phone: string; service: string; time: string; status: "new" | "contacted" | "joined"; }

const MOCK_SEATS: Seat[] = [
  { id: "1", type: "Library Seat A", price: 1200, available: true },
  { id: "2", type: "Library Seat B", price: 1000, available: false },
  { id: "3", type: "Study Room (4-seater)", price: 800, available: true },
  { id: "4", type: "PG Room Single", price: 5500, available: false },
  { id: "5", type: "PG Room Double", price: 3800, available: true },
];

const MOCK_INQUIRIES: Inquiry[] = [
  { id: "1", name: "Rahul Sharma", phone: "98765-43210", service: "Library Seat A", time: "2 min ago", status: "new" },
  { id: "2", name: "Priya Singh", phone: "87654-32109", service: "PG Room Single", time: "15 min ago", status: "new" },
  { id: "3", name: "Amit Kumar", phone: "76543-21098", service: "Study Room", time: "1 hr ago", status: "contacted" },
  { id: "4", name: "Sneha Patel", phone: "65432-10987", service: "Library Seat B", time: "3 hr ago", status: "joined" },
];

const STATUS_COLOR: Record<string, string> = {
  new: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  contacted: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  joined: "bg-green-500/20 text-green-300 border-green-500/30",
};

export default function PartnerDashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "seats" | "inquiries" | "earnings">("overview");
  const [seats, setSeats] = useState<Seat[]>(MOCK_SEATS);
  const [inquiries, setInquiries] = useState<Inquiry[]>(MOCK_INQUIRIES);
  const [notification, setNotification] = useState<string | null>(null);

  const totalSeats = seats.length;
  const availableSeats = seats.filter(s => s.available).length;
  const newInquiries = inquiries.filter(i => i.status === "new").length;

  const toggleSeat = (id: string) => {
    setSeats(prev => prev.map(s => s.id === id ? { ...s, available: !s.available } : s));
    setNotification("Seat status updated!");
    setTimeout(() => setNotification(null), 2500);
  };

  const updateInquiry = (id: string, status: Inquiry["status"]) => {
    setInquiries(prev => prev.map(i => i.id === id ? { ...i, status } : i));
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard size={16} /> },
    { id: "seats", label: "Seats", icon: <Bed size={16} /> },
    { id: "inquiries", label: "Inquiries", icon: <Users size={16} /> },
    { id: "earnings", label: "Earnings", icon: <IndianRupee size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-[#050a14] text-white flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-white/10 bg-[#060d1a] shrink-0">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center font-black text-lg text-white">A</div>
            <div>
              <p className="font-black text-white text-sm">Adumate Partner</p>
              <p className="text-[10px] text-slate-500">Smart Dashboard</p>
            </div>
          </div>
        </div>

        <div className="p-4 m-3 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black">S</div>
            <div>
              <p className="text-sm font-bold text-white">Sunrise Library</p>
              <div className="flex items-center gap-1 text-[10px] text-emerald-400">
                <CheckCircle size={10} /> Verified Partner
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 mt-3 text-[11px] text-slate-400">
            <Star size={10} className="text-amber-400 fill-amber-400" /> 4.7 rating • 128 reviews
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id as typeof activeTab)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === t.id ? "bg-orange-500/20 text-orange-300 border border-orange-500/30" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}>
              {t.icon} {t.label}
              {t.id === "inquiries" && newInquiries > 0 && (
                <span className="ml-auto w-5 h-5 rounded-full bg-orange-500 text-[10px] font-black text-white flex items-center justify-center">{newInquiries}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-3 space-y-1 border-t border-white/10">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-500 hover:text-white hover:bg-white/5 transition-all"><Settings size={16} /> Settings</button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-500 hover:text-red-400 hover:bg-red-500/5 transition-all"><LogOut size={16} /> Logout</button>
        </div>
      </aside>

      {/* Mobile tabs */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex border-t border-white/10 bg-[#060d1a]">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id as typeof activeTab)} className={`flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-black transition-all ${activeTab === t.id ? "text-orange-400" : "text-slate-600"}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#060d1a]/50 backdrop-blur-xl shrink-0">
          <div>
            <h1 className="font-black text-white text-lg">{tabs.find(t => t.id === activeTab)?.label}</h1>
            <p className="text-xs text-slate-500">Adumate Partner Dashboard</p>
          </div>
          <div className="flex items-center gap-3">
            {notification && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/20 border border-green-500/30 text-green-300 text-xs font-bold">
                <CheckCircle size={12} /> {notification}
              </div>
            )}
            <button className="relative p-2.5 rounded-xl border border-white/10 bg-white/5">
              <Bell size={16} className="text-slate-400" />
              {newInquiries > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-orange-500 text-[9px] font-black text-white flex items-center justify-center">{newInquiries}</span>}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 pb-20 md:pb-6">

          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { icon: <Bed size={20} />, label: "Total Seats", value: totalSeats, sub: `${availableSeats} available`, color: "bg-blue-500/20 text-blue-400" },
                  { icon: <Users size={20} />, label: "New Inquiries", value: newInquiries, sub: "Today", color: "bg-orange-500/20 text-orange-400" },
                  { icon: <IndianRupee size={20} />, label: "This Month", value: "₹24,800", sub: "+12% growth", color: "bg-green-500/20 text-green-400" },
                  { icon: <Star size={20} />, label: "Rating", value: "4.7", sub: "128 reviews", color: "bg-amber-500/20 text-amber-400" },
                ].map((card, i) => (
                  <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${card.color}`}>{card.icon}</div>
                    <p className="text-2xl font-black text-white">{card.value}</p>
                    <p className="text-xs font-bold text-slate-400 mt-1">{card.label}</p>
                    <p className="text-[10px] text-slate-600 mt-0.5">{card.sub}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="font-black text-white">Recent Inquiries</p>
                  <button onClick={() => setActiveTab("inquiries")} className="text-xs text-orange-400 hover:underline">View all</button>
                </div>
                <div className="space-y-3">
                  {inquiries.slice(0, 3).map(inq => (
                    <div key={inq.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-700 flex items-center justify-center text-sm font-black">{inq.name[0]}</div>
                        <div>
                          <p className="text-sm font-bold text-white">{inq.name}</p>
                          <p className="text-[10px] text-slate-500">{inq.service} • {inq.time}</p>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${STATUS_COLOR[inq.status]}`}>{inq.status}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-black text-white">Seat Availability</p>
                  <span className="text-sm font-black text-white">{availableSeats}/{totalSeats}</span>
                </div>
                <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full" style={{ width: `${(availableSeats / totalSeats) * 100}%` }} />
                </div>
                <p className="text-xs text-slate-500 mt-2">{availableSeats} seats available</p>
              </div>
            </div>
          )}

          {activeTab === "seats" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-slate-400 text-sm">Manage seat availability</p>
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 text-white text-xs font-black hover:bg-orange-400 transition-all">
                  <Plus size={14} /> Add Seat
                </button>
              </div>
              <div className="space-y-3">
                {seats.map(seat => (
                  <div key={seat.id} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${seat.available ? "border-green-500/20 bg-green-500/5" : "border-white/10 bg-white/5"}`}>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${seat.available ? "bg-green-500/20 text-green-400" : "bg-slate-700 text-slate-500"}`}><Bed size={20} /></div>
                    <div className="flex-1">
                      <p className="font-bold text-white">{seat.type}</p>
                      <p className="text-sm text-slate-400">₹{seat.price}/month</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-black border ${seat.available ? "bg-green-500/20 text-green-300 border-green-500/30" : "bg-slate-700 text-slate-400 border-slate-600"}`}>
                        {seat.available ? "Available" : "Occupied"}
                      </span>
                      <button onClick={() => toggleSeat(seat.id)} className="px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 transition-all">Toggle</button>
                      <button className="p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-400 transition-all"><Edit2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "inquiries" && (
            <div className="space-y-3">
              {inquiries.map(inq => (
                <div key={inq.id} className="p-5 rounded-2xl border border-white/10 bg-white/5 hover:border-white/20 transition-all">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center font-black text-lg">{inq.name[0]}</div>
                      <div>
                        <p className="font-black text-white">{inq.name}</p>
                        <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5"><Phone size={10} /> {inq.phone}</div>
                        <p className="text-xs text-slate-500 mt-1">{inq.service} • {inq.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-3 py-1.5 rounded-full text-[10px] font-black border ${STATUS_COLOR[inq.status]}`}>{inq.status}</span>
                      {inq.status === "new" && <button onClick={() => updateInquiry(inq.id, "contacted")} className="px-3 py-1.5 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-bold hover:bg-blue-500/30 transition-all">Contacted</button>}
                      {inq.status === "contacted" && <button onClick={() => updateInquiry(inq.id, "joined")} className="px-3 py-1.5 rounded-xl bg-green-500/20 border border-green-500/30 text-green-300 text-xs font-bold hover:bg-green-500/30 transition-all">Joined ✓</button>}
                      <a href={`tel:${inq.phone.replace(/-/g, "")}`} className="px-3 py-1.5 rounded-xl bg-orange-500/20 border border-orange-500/30 text-orange-300 text-xs font-bold hover:bg-orange-500/30 transition-all flex items-center gap-1"><Phone size={10} /> Call</a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "earnings" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: "This Month", value: "₹24,800", trend: "+12%", tcolor: "text-green-400" },
                  { label: "Last Month", value: "₹22,100", trend: "", tcolor: "" },
                  { label: "Total Earned", value: "₹1,84,200", trend: "All time", tcolor: "text-orange-400" },
                ].map((e, i) => (
                  <div key={i} className="p-6 rounded-2xl border border-white/10 bg-white/5">
                    <p className="text-xs text-slate-500 font-black uppercase tracking-widest mb-3">{e.label}</p>
                    <p className="text-3xl font-black text-white">{e.value}</p>
                    {e.trend && <p className={`text-xs font-bold mt-2 ${e.tcolor}`}>{e.trend}</p>}
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <p className="font-black text-white mb-6">Monthly Earnings</p>
                <div className="flex items-end gap-3 h-32">
                  {[18000, 21000, 19500, 22100, 24800].map((v, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full rounded-t-lg bg-gradient-to-t from-orange-500 to-amber-400" style={{ height: `${(v / 24800) * 100}%`, minHeight: "8px" }} />
                      <p className="text-[9px] text-slate-500 font-bold">{["Jan", "Feb", "Mar", "Apr", "May"][i]}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <p className="font-black text-white mb-4">Breakdown</p>
                <div className="space-y-3">
                  {[
                    { service: "Library Seats", amount: 14400, count: 12 },
                    { service: "PG Rooms", amount: 7600, count: 2 },
                    { service: "Study Rooms", amount: 2800, count: 3 },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                      <div>
                        <p className="text-sm font-bold text-white">{item.service}</p>
                        <p className="text-[10px] text-slate-500">{item.count} students</p>
                      </div>
                      <p className="font-black text-green-400">₹{item.amount.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
