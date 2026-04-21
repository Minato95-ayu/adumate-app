import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

const BASE_URL = "https://www.adumate.in";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Adumate – India's #1 Student Ecosystem",
    template: "%s | Adumate",
  },
  description:
    "Adumate is India's smartest student platform — find Libraries, Hostels, PGs, Mess, Tutors, Jobs, and AI-powered study tools in one place. Built for Indian students by Ayush Kaushik.",
  keywords: [
    "student ecosystem India",
    "hostel finder",
    "PG for students",
    "library near me",
    "mess near me",
    "tutor finder",
    "JEE NEET study app",
    "AI test generator",
    "knowledge finder",
    "adumate",
    "student app India",
    "student services platform",
    "student hostel mess library",
    "AI study notes",
    "1v1 quiz challenge",
  ],
  authors: [{ name: "Ayush Kaushik", url: "https://www.instagram.com/o_aa.yu_s/" }],
  creator: "Ayush Kaushik",
  publisher: "Adumate",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: BASE_URL,
    siteName: "Adumate",
    title: "Adumate – India's #1 Student Ecosystem",
    description:
      "Find Libraries, Hostels, PGs, Mess, Tutors & Jobs. AI-powered Study Hub with Knowledge Finder, AI Tests, 1v1 Challenge. Built for Indian students.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Adumate – Student Ecosystem",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Adumate – India's #1 Student Ecosystem",
    description: "Find Libraries, Hostels, Tutors & AI Study Tools. Built for Indian students.",
    images: ["/og-image.png"],
    creator: "@adumate_app",
  },
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon.png", sizes: "144x144", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/favicon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.png",
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: BASE_URL,
  },
  verification: {
    google: "7KdkTinv7m2bpowBQmGduhHxuAGEoHMQQmBdL-noHVI",
  },
  category: "education",
};

// JSON-LD Structured Data
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${BASE_URL}/#website`,
      url: BASE_URL,
      name: "Adumate",
      description: "India's #1 Student Ecosystem Platform",
      inLanguage: "en-IN",
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: `${BASE_URL}/search?q={search_term_string}` },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      "@id": `${BASE_URL}/#organization`,
      name: "Adumate",
      url: BASE_URL,
      logo: { "@type": "ImageObject", url: `${BASE_URL}/favicon.svg` },
      founder: {
        "@type": "Person",
        name: "Ayush Kaushik",
        sameAs: ["https://www.instagram.com/o_aa.yu_s/"],
      },
      sameAs: ["https://www.instagram.com/o_aa.yu_s/"],
      description:
        "Adumate simplifies student life by connecting students with hostels, libraries, mess, tutors, and AI-powered study tools.",
    },
    {
      "@type": "SoftwareApplication",
      name: "Adumate",
      operatingSystem: "Web",
      applicationCategory: "EducationalApplication",
      offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
      aggregateRating: { "@type": "AggregateRating", ratingValue: "4.8", ratingCount: "500" },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN" className="dark">
      <head>
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.className} min-h-screen bg-background text-foreground flex flex-col`}>
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
