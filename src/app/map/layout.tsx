import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Finder Map - Find Libraries, Hostels, PGs & Tutors",
  description: "Interactive map to find the best libraries, hostels, PGs, mess, and tutors near you. Get routes, contact details, and student reviews.",
  openGraph: {
    title: "Adumate Finder Map - Locate Student Services",
    description: "Search for student essentials on our interactive map. Find verified libraries, hostels, and more in real-time.",
  },
};

export default function MapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
