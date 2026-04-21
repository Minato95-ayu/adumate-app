"use client";

import { useMemo } from "react";

interface BrandIconProps {
  text?: string;
  size?: number;
  className?: string;
  showBar?: boolean;
}

export default function BrandIcon({ 
  text = "P", 
  size = 40, 
  className = "",
  showBar = true 
}: BrandIconProps) {
  // Extract initials or use provided text
  const displayChars = useMemo(() => {
    if (!text) return "";
    if (text.length <= 2) return text.toUpperCase();
    const words = text.split(" ");
    if (words.length > 1) {
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
    return text.substring(0, 2).toUpperCase();
  }, [text]);

  return (
    <div 
      className={`relative flex items-center justify-center overflow-hidden rounded-2xl border border-white/10 shadow-2xl group transition-all duration-300 ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Dark Background matching original */}
      <div className="absolute inset-0 bg-[#0A1024]" />
      
      {/* Subtle Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#101B3A] to-transparent opacity-50" />

      {/* Content Container */}
      <div className="relative flex items-center justify-center gap-[2%] h-full w-full px-[5%]">
        <span 
          className="font-black text-white tracking-[-0.05em] leading-none select-none"
          style={{ fontSize: size * 0.55 }}
        >
          {displayChars}
        </span>
        
        {/* The Slim Orange Accent Bar matching original "I" style */}
        {showBar && (
          <div 
            className="w-[8%] h-[60%] bg-gradient-to-b from-[#FFB800] via-[#FF8A00] to-[#FF6B00] rounded-[1px] shadow-[0_0_15px_rgba(255,107,0,0.3)]" 
          />
        )}
      </div>
      
      {/* Inner Shadow for depth */}
      <div className="absolute inset-0 rounded-2xl shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]" />
    </div>
  );
}
