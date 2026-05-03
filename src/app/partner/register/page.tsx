"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Home, UtensilsCrossed, BedDouble, GraduationCap, Briefcase, ChevronRight, ArrowLeft, CheckCircle, MapPin, Clock, IndianRupee, Upload, Phone, Globe, User } from "lucide-react";

const SERVICE_TYPES = [
  { id: "library",  icon: <BookOpen size={32} />,        label: "Library",       sub: "Seat management, shifts, attendance",         color: "#3b82f6", bg: "from-blue-500/20 to-blue-500/5",     border: "border-blue-500/30" },
  { id: "hostel",   icon: <Home size={32} />,            label: "Hostel / PG",   sub: "Room listing, beds, rent management",         color: "#8b5cf6", bg: "from-purple-500/20 to-purple-500/5", border: "border-purple-500/30" },
  { id: "mess",     icon: <UtensilsCrossed size={32} />, label: "Mess",          sub: "Meal plans, menu, daily tracking",            color: "#10b981", bg: "from-emerald-500/20 to-emerald-500/5", border: "border-emerald-500/30" },
  { id: "room",     icon: <BedDouble size={32} />,       label: "Room Rent",     sub: "Room photos, availability, pricing",          color: "#f97316", bg: "from-orange-500/20 to-orange-500/5", border: "border-orange-500/30" },
  { id: "tutor",    icon: <GraduationCap size={32} />,   label: "Tutor",         sub: "Subjects, class timings, student requests",   color: "#ec4899", bg: "from-pink-500/20 to-pink-500/5",   border: "border-pink-500/30" },
  { id: "jobs",     icon: <Briefcase size={32} />,       label: "Job Provider",  sub: "Job postings, applications, candidates",      color: "#f59e0b", bg: "from-amber-500/20 to-amber-500/5", border: "border-amber-500/30" },
];

type Step = 1 | 2 | 3;

export default function PartnerRegister() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [form, setForm] = useState({
    businessName: "", ownerName: "", phone: "", email: "",
    address: "", city: "", description: "", website: "",
    openTime: "", closeTime: "", pricing: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const service = SERVICE_TYPES.find(s => s.id === selectedType);

  const handleSubmit = async () => {
    setSubmitting(true);
    // Simulate API call — replace with Firebase write
    await new Promise(r => setTimeout(r, 1500));
    setDone(true);
    setTimeout(() => router.push(`/partner/dashboard?type=${selectedType}`), 1800);
  };

  if (done) return (
    <div className="min-h-screen bg-[#050a14] flex items-center justify-center text-white">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500/50 flex items-center justify-center mx-auto">
          <CheckCircle size={40} className="text-green-400" />
        </div>
        <h2 className="text-2xl font-black">Registration Complete!</h2>
        <p className="text-slate-400">Redirecting to your dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050a14] text-white px-4 py-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center font-black text-lg">A</div>
          <div>
            <p className="font-black text-white">Adumate Partner</p>
            <p className="text-xs text-slate-500">Register your business</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-10">
          {[1, 2, 3].map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all ${step >= s ? "bg-orange-500 border-orange-500 text-white" : "border-white/20 text-slate-500"}`}>{s}</div>
              <p className={`text-xs font-bold hidden sm:block transition-colors ${step >= s ? "text-white" : "text-slate-600"}`}>
                {["Choose Type", "Business Info", "Confirm"][i]}
              </p>
              {i < 2 && <div className={`flex-1 h-px transition-colors ${step > s ? "bg-orange-500" : "bg-white/10"}`} />}
            </div>
          ))}
        </div>

        {/* ── STEP 1: Service Type ──────────────────────────────── */}
        {step === 1 && (
          <div>
            <h1 className="text-3xl font-black mb-2">Aap kaunsi service dete hain?</h1>
            <p className="text-slate-400 mb-8">Apna service type chuniye — dashboard usi ke hisaab se customize hoga</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {SERVICE_TYPES.map(type => (
                <button key={type.id} onClick={() => setSelectedType(type.id)}
                  className={`group relative flex flex-col items-start p-6 rounded-3xl border-2 text-left transition-all duration-300 hover:scale-[1.02] ${selectedType === type.id ? `bg-gradient-to-br ${type.bg} ${type.border} scale-[1.02]` : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8"}`}>
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all bg-gradient-to-br ${type.bg} border ${type.border}`}
                    style={{ color: type.color }}>
                    {type.icon}
                  </div>
                  <h3 className="text-lg font-black text-white mb-1">{type.label}</h3>
                  <p className="text-xs text-slate-400">{type.sub}</p>
                  {selectedType === type.id && (
                    <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
                      <CheckCircle size={14} className="text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
            <div className="flex justify-end mt-8">
              <button onClick={() => setStep(2)} disabled={!selectedType}
                className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 text-white font-black text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-all shadow-xl shadow-orange-500/25">
                Next <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Business Info ─────────────────────────────── */}
        {step === 2 && (
          <div>
            <button onClick={() => setStep(1)} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
              <ArrowLeft size={16} /> Back
            </button>
            <div className="flex items-center gap-3 mb-8">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br ${service?.bg} border ${service?.border}`} style={{ color: service?.color }}>
                {service?.icon}
              </div>
              <div>
                <h1 className="text-2xl font-black">{service?.label} Details</h1>
                <p className="text-slate-400 text-sm">Apni business ki details fill karein</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              {[
                { key: "businessName", label: "Business Name *", placeholder: "e.g. Sunrise Library", icon: <BookOpen size={14} /> },
                { key: "ownerName", label: "Owner Name *", placeholder: "e.g. Ramesh Kumar", icon: <User size={14} /> },
                { key: "phone", label: "Phone Number *", placeholder: "+91 98765 43210", icon: <Phone size={14} /> },
                { key: "email", label: "Email Address", placeholder: "you@email.com", icon: <Globe size={14} /> },
                { key: "address", label: "Full Address *", placeholder: "Street, Area", icon: <MapPin size={14} /> },
                { key: "city", label: "City *", placeholder: "e.g. Delhi, Jaipur", icon: <MapPin size={14} /> },
                { key: "openTime", label: "Opening Time", placeholder: "e.g. 6:00 AM", icon: <Clock size={14} /> },
                { key: "closeTime", label: "Closing Time", placeholder: "e.g. 10:00 PM", icon: <Clock size={14} /> },
                { key: "pricing", label: "Starting Price (₹/month)", placeholder: "e.g. 1000", icon: <IndianRupee size={14} /> },
                { key: "website", label: "Website / Social Link", placeholder: "instagram.com/...", icon: <Globe size={14} /> },
              ].map(field => (
                <div key={field.key}>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">{field.label}</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">{field.icon}</span>
                    <input value={form[field.key as keyof typeof form]}
                      onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-orange-500/50 focus:bg-white/8 transition-all" />
                  </div>
                </div>
              ))}

              <div className="md:col-span-2">
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">About Your Service</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Apni service ke baare mein batayein — kya special hai, students ko kya milega..."
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-orange-500/50 transition-all resize-none" />
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button onClick={() => setStep(1)} className="flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 text-sm font-bold transition-all">
                <ArrowLeft size={16} /> Back
              </button>
              <button onClick={() => setStep(3)} disabled={!form.businessName || !form.phone || !form.city}
                className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 text-white font-black text-sm disabled:opacity-40 hover:opacity-90 transition-all shadow-xl shadow-orange-500/25">
                Review <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Confirm ──────────────────────────────────── */}
        {step === 3 && (
          <div>
            <button onClick={() => setStep(2)} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
              <ArrowLeft size={16} /> Back
            </button>
            <h1 className="text-2xl font-black mb-2">Confirm & Submit</h1>
            <p className="text-slate-400 mb-8">Sab kuch sahi hai? Submit karo — aapka dashboard ready ho jaayega</p>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-4 mb-8">
              <div className={`inline-flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gradient-to-r ${service?.bg} border ${service?.border}`} style={{ color: service?.color }}>
                {service?.icon && <span className="scale-75">{service.icon}</span>}
                <span className="font-black">{service?.label}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                {[
                  { label: "Business", value: form.businessName },
                  { label: "Owner", value: form.ownerName },
                  { label: "Phone", value: form.phone },
                  { label: "City", value: form.city },
                  { label: "Timing", value: `${form.openTime} – ${form.closeTime}` },
                  { label: "Starting Price", value: form.pricing ? `₹${form.pricing}/mo` : "-" },
                ].map((row, i) => (
                  <div key={i}>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{row.label}</p>
                    <p className="text-sm font-bold text-white mt-1">{row.value || "—"}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-5 mb-8">
              <p className="text-sm text-orange-300 font-bold">📢 Aapki listing free hai!</p>
              <p className="text-xs text-slate-400 mt-1">Adumate pe listing karke thousands students aapki service dekh paayenge. Koi charge nahi.</p>
            </div>

            <button onClick={handleSubmit} disabled={submitting}
              className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 text-white font-black text-base disabled:opacity-70 hover:opacity-90 transition-all shadow-2xl shadow-orange-500/30">
              {submitting ? (
                <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Setting up your dashboard...</>
              ) : (
                <><CheckCircle size={20} /> Register as {service?.label} Partner</>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
