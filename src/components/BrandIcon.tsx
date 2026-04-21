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
      className={`relative flex items-center justify-center overflow-hidden rounded-xl border border-white/10 shadow-[0_0_20px_rgba(255,107,0,0.15)] group transition-all duration-300 ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Dark Gradient Background matching logo-mark.svg */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#101B3A] to-[#0A1024]" />
      
      {/* Glossy Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent opacity-40" />

      {/* Content Container */}
      <div className="relative flex items-center gap-[4%] h-full w-full px-[12%]">
        <span 
          className="font-black text-white tracking-tighter leading-none select-none"
          style={{ fontSize: size * 0.45 }}
        >
          {displayChars}
        </span>
        
        {/* The Orange Accent Bar from the logo (brand signature) */}
        {showBar && (
          <div 
            className="w-[12%] h-[55%] bg-gradient-to-b from-[#FF9A1F] to-[#FF6B00] rounded-sm shadow-[0_0_10px_rgba(255,154,31,0.5)]" 
          />
        )}
      </div>
      
      {/* Hover Effect */}
      <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
}
