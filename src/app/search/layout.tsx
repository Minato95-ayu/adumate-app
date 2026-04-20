import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search Knowledge & Resources",
  description: "Search for JEE/NEET notes, YouTube videos, Telegram channels, and AI-powered study resources on Adumate Knowledge Finder.",
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
