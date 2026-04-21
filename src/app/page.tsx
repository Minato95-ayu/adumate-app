import { Metadata } from "next";
import HomeClient from "./HomeClient";

export const metadata: Metadata = {
  title: "Adumate – India's #1 Student Ecosystem | Hostels, Libraries & AI Hub",
  description: "Adumate is India's premier student platform. Discover verified libraries, hostels, PGs, and mess facilities. Boost your studies with AI Knowledge Finder and 1v1 challenges.",
  keywords: [
    "adumate",
    "adumate app",
    "adumate india",
    "student ecosystem",
    "hostel finder india",
    "library finder",
    "student mess app",
    "AI study tools",
    "student services platform"
  ],
  openGraph: {
    title: "Adumate – India's #1 Student Ecosystem",
    description: "Find Libraries, Hostels, PGs, Mess, Tutors & AI Study Tools. Built for Indian students by Ayush Kaushik.",
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
