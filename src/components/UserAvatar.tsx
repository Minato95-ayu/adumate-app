"use client";

import { useMemo } from "react";

interface UserAvatarProps {
  name?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function UserAvatar({ name = "User", size = "md", className = "" }: UserAvatarProps) {
  const { initials, bgColor } = useMemo(() => {
    const names = name.split(" ");
    const initials = names.length > 1 
      ? (names[0][0] + names[names.length - 1][0]).toUpperCase()
      : names[0][0].toUpperCase();

    // Generate a consistent color based on the name
    const colors = [
      "bg-orange-500", "bg-blue-500", "bg-purple-500", 
      "bg-emerald-500", "bg-rose-500", "bg-amber-500", 
      "bg-indigo-500", "bg-cyan-500"
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = colors[Math.abs(hash) % colors.length];

    return { initials, bgColor: color };
  }, [name]);

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-16 h-16 text-xl"
  };

  return (
    <div className={`${sizeClasses[size]} ${bgColor} rounded-xl flex items-center justify-center font-black text-white shadow-lg ${className}`}>
      {initials}
    </div>
  );
}
