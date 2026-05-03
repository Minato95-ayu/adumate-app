"use client";
import { useState } from "react";
import PartnerBase from "./PartnerBase";
import { Briefcase, Plus, Eye, CheckCircle, Clock } from "lucide-react";
export default function JobsDashboard() {
  const [partTimeOnly, setPartTimeOnly] = useState(false);
  return (
    <PartnerBase serviceLabel="Job Provider" serviceColor="#f59e0b" serviceBg="from-amber-500/20 to-amber-500/5"
      serviceBorder="border-amber-500/30" serviceIcon={<Briefcase size={20}/>} partnerName="TechStart Hiring"
      tabs={[
        { id:"jobs",  label:"Job Posts",    icon:<Briefcase size={16}/> },
        { id:"applicants", label:"Applicants", icon:<Eye size={16}/> },
      ]}>
      {(tab) => (
        <>
          {tab === "jobs" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <button onClick={() => setPartTimeOnly(v => !v)} className={`px-4 py-2 rounded-xl text-xs font-black border transition-all ${partTimeOnly ? "bg-amber-500/20 text-amber-300 border-amber-500/30" : "bg-white/5 text-slate-400 border-white/10"}`}>
                  {partTimeOnly ? "⏰ Part-time Only" : "💼 All Jobs"}
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-white text-xs font-black"><Plus size={14}/>Post Job</button>
              </div>
              {[
                { title:"Content Writer Intern",   salary:"₹8,000/mo", type:"Part-time", applicants:14, skills:["Writing","SEO","Social Media"],  status:"active" },
                { title:"React Developer",         salary:"₹25,000/mo", type:"Full-time", applicants:7, skills:["React","TypeScript","Node.js"],  status:"active" },
                { title:"Social Media Manager",    salary:"₹12,000/mo", type:"Part-time", applicants:21, skills:["Instagram","Canva","Content"],  status:"closed" },
              ].filter(j => !partTimeOnly || j.type === "Part-time").map((j,i) => (
                <div key={i} className={`p-5 rounded-2xl border ${j.status === "active" ? "border-amber-500/20 bg-amber-500/5" : "border-white/10 bg-white/5 opacity-70"}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-black">{j.title}</p>
                      <p className="text-xs text-slate-400">{j.salary} • {j.type}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black border ${j.status === "active" ? "bg-green-500/20 text-green-300 border-green-500/30" : "bg-slate-700 text-slate-400 border-slate-600"}`}>{j.status}</span>
                      <span className="text-sm font-black text-amber-400">{j.applicants} applied</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {j.skills.map(s => <span key={s} className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-[10px] text-slate-400">{s}</span>)}
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold">View Applicants</button>
                    <button className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 text-xs font-bold">Edit Job</button>
                    <button className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 text-xs font-bold">{j.status === "active" ? "Close" : "Reopen"}</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {tab === "applicants" && (
            <div className="space-y-3">
              <p className="text-slate-400 text-sm">All applications across your job posts</p>
              {[
                { name:"Aakash Singh",  role:"Content Writer",    exp:"1yr", status:"shortlisted", college:"DU" },
                { name:"Meera Joshi",   role:"React Developer",   exp:"2yr", status:"new",         college:"IIT Delhi" },
                { name:"Vikram Nair",   role:"Content Writer",    exp:"Fresher", status:"new",      college:"IGNOU" },
                { name:"Divya Sharma",  role:"Social Media Mgr",  exp:"1yr", status:"rejected",    college:"DU" },
              ].map((a,i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-white/10 bg-white/5 flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center font-black text-amber-400">{a.name[0]}</div>
                    <div>
                      <p className="font-bold">{a.name} <span className="text-xs text-slate-500">({a.college})</span></p>
                      <p className="text-xs text-slate-400">{a.role} • {a.exp} exp</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black border ${a.status === "shortlisted" ? "bg-green-500/20 text-green-300 border-green-500/30" : a.status === "rejected" ? "bg-red-500/20 text-red-300 border-red-500/30" : "bg-amber-500/20 text-amber-300 border-amber-500/30"}`}>{a.status}</span>
                    {a.status === "new" && <>
                      <button className="px-3 py-1.5 rounded-lg bg-green-500/20 border border-green-500/30 text-green-300 text-xs font-bold">Shortlist</button>
                      <button className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 text-xs font-bold">View CV</button>
                    </>}
                    {a.status === "shortlisted" && <button className="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold">Select Candidate</button>}
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
