import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NavbarWrapper from "@/components/NavbarWrapper";
import FooterWrapper from "@/components/FooterWrapper";

const inter = Inter({ subsets: ["latin"] });

const BASE_URL = "https://www.adumate.in";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Adumate – India's #1 Student Ecosystem | Hostels, Libraries, Mess & AI Tools",
    template: "%s | Adumate",
  },
  description:
    "Adumate is India's smarter student platform — find verified Libraries, Hostels, PGs, Mess, Tutors, and AI-powered study tools. Built specifically for Indian students to simplify their academic journey.",
  keywords: [
    "student ecosystem India",
    "hostel finder India",
    "best PG for students in Delhi",
    "library near me Kota",
    "student mess near me",
    "tutor finder India",
    "JEE NEET AI study app",
    "AI test generator for students",
    "adumate india",
    "student accommodation app",
    "student lifestyle platform",
    "AI study notes generator",
    "verified hostels for students",
    "student community India",
  ],
  authors: [{ name: "Ayush Kaushik", url: "https://www.instagram.com/aa.yu_s/" }],
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
    site: "@adumate_app",
  },
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon.png",    sizes: "192x192", type: "image/png" },
      { url: "/favicon.svg",    type: "image/svg+xml" },
    ],
    apple: [
      { url: "/favicon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon-32.png",
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

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0a0f1a",
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
      alternateName: "Adumate India",
      description: "Adumate is India's smartest student ecosystem platform connecting students with hostels, libraries, mess, and AI tools.",
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
      logo: { 
        "@type": "ImageObject", 
        "url": `${BASE_URL}/logo.png`,
        "width": "512",
        "height": "512"
      },
      image: { "@type": "ImageObject", "url": `${BASE_URL}/og-image.png` },
      sameAs: [
        "https://www.instagram.com/aa.yu_s/",
        "https://twitter.com/adumate_app"
      ],
      founder: {
        "@type": "Person",
        name: "Ayush Kaushik",
        sameAs: ["https://www.instagram.com/aa.yu_s/"],
      },
      description:
        "Adumate simplifies student life by connecting students with hostels, libraries, mess, tutors, and AI-powered study tools.",
      brand: {
        "@type": "Brand",
        "name": "Adumate",
        "alternateName": "Adumate App"
      }
    },
    {
      "@type": "SoftwareApplication",
      "name": "Adumate",
      "operatingSystem": "Web",
      "applicationCategory": "EducationalApplication",
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "INR" },
      "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.8", "ratingCount": "500" },
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
        {/* Favicon — SVG priority for modern browsers, PNG fallback for Google */}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png" />
        <link rel="icon" href="/favicon-48.png" sizes="48x48" type="image/png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.className} min-h-screen bg-background text-foreground flex flex-col`}>
        <NavbarWrapper />
        <main className="flex-1">{children}</main>
        <FooterWrapper />
      </body>
    </html>
  );
}
