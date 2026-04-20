import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Partner With Us - List Your Services on Adumate",
  description: "Join India's largest student ecosystem. List your library, hostel, PG, mess, or coaching center and reach thousands of students effortlessly.",
  openGraph: {
    title: "Grow Your Business with Adumate Partner Program",
    description: "Connect with students directly. List your services and manage your business with our powerful partner dashboard.",
  },
};

export default function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
