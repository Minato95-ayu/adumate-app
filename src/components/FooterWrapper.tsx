"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function FooterWrapper() {
  const pathname = usePathname();
  
  // Hide Footer on Vidwan page
  if (pathname === "/vidwan") return null;
  
  return <Footer />;
}
