import { Metadata } from "next";
import HomeClient from "./HomeClient";

export const metadata: Metadata = {
  title: "Adumate – India's #1 Student Ecosystem | Hostels, Libraries, Mess & AI Hub",
  description: "Adumate is India's premier student platform. Discover verified libraries, hostels, PGs, and mess facilities. Boost your studies with AI Knowledge Finder, Vidwan AI, and AI-powered tests.",
  keywords: [
    "adumate",
    "adumate app",
    "adumate india",
    "student ecosystem India",
    "hostel finder india",
    "library finder near me",
    "student mess app India",
    "AI study tools for students",
    "Vidwan AI scholar mentor",
    "JEE NEET preparation AI",
    "best student services platform India",
    "student accommodation and food finder",
  ],
  openGraph: {
    title: "Adumate – India's #1 Student Ecosystem",
    description: "Find verified Libraries, Hostels, PGs, Mess, Tutors & AI Study Tools. Built for Indian students by Ayush Kaushik.",
    url: "https://www.adumate.in",
    siteName: "Adumate",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Adumate - India's Student Ecosystem",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
};

export default function Page() {
  return <HomeClient />;
}
