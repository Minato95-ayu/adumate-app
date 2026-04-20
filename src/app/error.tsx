"use client";
import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0f1a] px-6 text-center">
      <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
        <AlertTriangle size={40} />
      </div>
      <h2 className="text-3xl font-black text-white mb-4">Oops! Kuch galat ho gaya.</h2>
      <p className="text-slate-400 mb-8 max-w-md">
        Humne error record kar liya hai. Kripya page refresh karein ya neeche diye button pe click karein.
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => window.location.reload()}
          className="bg-white/5 hover:bg-white/10 text-white font-bold px-8 py-4 rounded-2xl border border-white/10 transition-all"
        >
          Refresh Page
        </button>
        <button
          onClick={() => reset()}
          className="bg-primary hover:bg-primary-hover text-white font-black px-8 py-4 rounded-2xl shadow-xl shadow-primary/20 transition-all flex items-center gap-2"
        >
          <RotateCcw size={20} /> Try Again
        </button>
      </div>
    </div>
  );
}
