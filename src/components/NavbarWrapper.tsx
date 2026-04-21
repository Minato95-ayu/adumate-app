"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

export default function NavbarWrapper() {
  const pathname = usePathname();
  
  // Hide Navbar on Vidwan page
  if (pathname === "/vidwan") return null;
  
  return <Navbar />;
}
