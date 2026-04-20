import { MapPin } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center p-6 text-center">
      <div className="flex flex-col items-center">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
          <MapPin size={60} className="text-primary animate-bounce relative z-10" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Finding Locations...</h2>
        <p className="text-slate-400 text-sm">Mapping the best services near you.</p>
      </div>
    </div>
  );
}
