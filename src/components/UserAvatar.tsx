"use client";

import BrandIcon from "./BrandIcon";

interface UserAvatarProps {
  name?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function UserAvatar({ name = "User", size = "md", className = "" }: UserAvatarProps) {
  const sizeMap = {
    sm: 32,
    md: 40,
    lg: 64
  };

  return (
    <BrandIcon 
      text={name} 
      size={sizeMap[size]} 
      className={className} 
    />
  );
}
