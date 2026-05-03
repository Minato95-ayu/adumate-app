"use client";
import { useState } from "react";
import PartnerBase from "./PartnerBase";
import { GraduationCap, Plus, CheckCircle, XCircle } from "lucide-react";
export default function TutorDashboard() {
  const [online, setOnline] = useState(true);
  return (
    <PartnerBase serviceLabel="Tutor" serviceColor="#ec4899" serviceBg="from-pink-500/20 to-pink-500/5"
      serviceBorder="border-pink-500/30" serviceIcon={<GraduationCap size={20}/>} partnerName="Prof. Sharma Coaching"
      tabs={[
        { id:"subjects",  label:"Subjects",  icon:<GraduationCap size={16}/> },
        { id:"requests",  label:"Requests",  icon:<CheckCircle size={16}/> },
      ]}>
      {(tab) => (
        <>
          {tab === "subjects" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <button onClick={() => setOnline(v => !v)} className={`px-4 py-2 rounded-xl text-xs font-black border transition-all ${online ? "bg-green-500/20 text-green-300 border-green-500/30" : "bg-slate-700 text-slate-400 border-slate-600"}`}>
                  {online ? "🟢 Online Mode" : "🔴 Offline Mode"}
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-pink-500 text-white text-xs font-black"><Plus size={14}/>Add Subject</button>
              </div>
              {[
                { sub:"Mathematics", class:"Class 11-12", fee:1500, students:8, slots:"Mon Wed Fri 5-7pm" },
                { sub:"Physics",     class:"Class 11-12", fee:1500, students:6, slots:"Tue Thu 4-6pm" },
                { sub:"Coding (Python)", class:"Beginner", fee:2000, students:4, slots:"Sat Sun 10am-12pm" },
              ].map((s,i) => (
                <div key={i} className="p-5 rounded-2xl border border-pink-500/20 bg-pink-500/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-black">{s.sub}</p>
                      <p className="text-xs text-slate-400">{s.class} • ₹{s.fee}/mo • {s.slots}</p>
                    </div>
                    <span className="text-sm font-black text-pink-400">{s.students} students</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 rounded-lg bg-pink-500/20 border border-pink-500/30 text-pink-300 text-xs font-bold">Set Fees</button>
                    <button className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 text-xs font-bold">Edit Timing</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {tab === "requests" && (
            <div className="space-y-3">
              <p className="text-slate-400 text-sm">Student join requests</p>
              {[
                { name:"Ananya Verma", sub:"Mathematics", msg:"Class 12 boards preparation chahiye", status:"pending" },
                { name:"Rohan Das",    sub:"Coding (Python)", msg:"Beginner hoon, start karna hai",   status:"pending" },
                { name:"Nisha Patel",  sub:"Physics",    msg:"JEE preparation ke liye",              status:"accepted" },
              ].map((r,i) => (
                <div key={i} className="p-4 rounded-2xl border border-white/10 bg-white/5">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-pink-500/20 flex items-center justify-center font-black text-pink-400">{r.name[0]}</div>
                      <div>
                        <p className="font-bold text-sm">{r.name}</p>
                        <p className="text-xs text-slate-400">{r.sub}</p>
                      </div>
                    </div>
                    {r.status === "accepted"
                      ? <span className="px-3 py-1 rounded-full text-[10px] font-black bg-green-500/20 text-green-300 border border-green-500/30">Accepted</span>
                      : <div className="flex gap-2">
                          <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-500/20 border border-green-500/30 text-green-300 text-xs font-bold"><CheckCircle size={12}/>Accept</button>
                          <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-bold"><XCircle size={12}/>Decline</button>
                        </div>}
                  </div>
                  <p className="text-xs text-slate-500 italic">"{r.msg}"</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </PartnerBase>
  );
}
