"use client";
import { useState } from "react";
import PartnerBase from "./PartnerBase";
import { BookOpen, Plus, CheckCircle, XCircle, Clock, UserCheck } from "lucide-react";

const SEATS = [
  { id:"1", label:"Morning Shift A", capacity:20, filled:18, shift:"6am-2pm", price:1200 },
  { id:"2", label:"Evening Shift B", capacity:20, filled:12, shift:"2pm-10pm", price:1000 },
  { id:"3", label:"Study Room (4-seater)", capacity:4, filled:2, shift:"All Day", price:800 },
];
const STUDENTS = [
  { name:"Rahul Sharma", seat:"Morning A", paid:true, since:"Apr 1" },
  { name:"Priya Singh",  seat:"Evening B", paid:true, since:"Mar 15" },
  { name:"Amit Kumar",   seat:"Morning A", paid:false, since:"May 1" },
];

export default function LibraryDashboard() {
  const [seats, setSeats] = useState(SEATS);
  return (
    <PartnerBase serviceLabel="Library" serviceColor="#3b82f6" serviceBg="from-blue-500/20 to-blue-500/5"
      serviceBorder="border-blue-500/30" serviceIcon={<BookOpen size={20}/>} partnerName="Sunrise Library"
      tabs={[
        { id:"seats",     label:"Seat Mgmt",  icon:<BookOpen size={16}/> },
        { id:"students",  label:"Students",   icon:<UserCheck size={16}/> },
        { id:"attendance",label:"Attendance", icon:<CheckCircle size={16}/> },
      ]}>
      {(tab) => (
        <>
          {tab === "seats" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-slate-400 text-sm">Manage shifts & seat capacity</p>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 text-white text-xs font-black"><Plus size={14}/>Add Shift</button>
              </div>
              {seats.map(s => (
                <div key={s.id} className="p-5 rounded-2xl border border-blue-500/20 bg-blue-500/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-black">{s.label}</p>
                      <p className="text-xs text-slate-400"><Clock size={10} className="inline mr-1"/>{s.shift} • ₹{s.price}/mo</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-black border ${s.filled >= s.capacity ? "bg-red-500/20 text-red-300 border-red-500/30" : "bg-green-500/20 text-green-300 border-green-500/30"}`}>
                      {s.filled}/{s.capacity} {s.filled >= s.capacity ? "FULL" : "Available"}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" style={{width:`${(s.filled/s.capacity)*100}%`}} />
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30 hover:bg-blue-500/30 transition-all">Approve Student</button>
                    <button className="px-3 py-1.5 rounded-lg bg-white/5 text-slate-400 text-xs font-bold border border-white/10 hover:bg-white/10 transition-all">Edit Shift</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {tab === "students" && (
            <div className="space-y-3">
              {STUDENTS.map((s,i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-white/10 bg-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center font-black text-blue-400">{s.name[0]}</div>
                    <div>
                      <p className="font-bold">{s.name}</p>
                      <p className="text-xs text-slate-500">{s.seat} • Since {s.since}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black border ${s.paid ? "bg-green-500/20 text-green-300 border-green-500/30" : "bg-red-500/20 text-red-300 border-red-500/30"}`}>{s.paid ? "Paid" : "Pending"}</span>
                    <button className="px-3 py-1 rounded-lg bg-white/5 text-slate-400 text-xs border border-white/10">Mark Attendance</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {tab === "attendance" && (
            <div className="space-y-4">
              <p className="text-slate-400 text-sm">Today's attendance — {new Date().toLocaleDateString("en-IN")}</p>
              {STUDENTS.map((s,i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-white/10 bg-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-700 flex items-center justify-center font-black">{s.name[0]}</div>
                    <p className="font-bold text-sm">{s.name}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-500/20 border border-green-500/30 text-green-300 text-xs font-bold"><CheckCircle size={12}/>Present</button>
                    <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-bold"><XCircle size={12}/>Absent</button>
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
