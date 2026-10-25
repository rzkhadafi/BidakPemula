import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { BadgeToastNotification } from "@/features/badges";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bidak-pemula.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Bidak Pemula — Belajar Catur Interaktif dari Nol",
    template: "%s | Bidak Pemula",
  },
  description:
    "Platform belajar catur interaktif berbahasa Indonesia untuk pemula. Pahami gerakan bidak, taktik dasar, bermain melawan bot komputer, dan bimbingan guru catur langkah demi langkah.",
  keywords: [
    "bidak pemula",
    "catur pemula",
    "belajar catur",
    "belajar catur dari nol",
    "tutorial catur indonesia",
    "main catur gratis",
    "taktik catur pemula",
    "guru catur indonesia",
    "panduan catur dasar",
    "catur online indonesia",
  ],
  authors: [{ name: "Bidak Pemula" }],
  creator: "Bidak Pemula",
  publisher: "Bidak Pemula",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Bidak Pemula — Belajar Catur Interaktif dari Nol",
    description:
      "Platform belajar catur interaktif berbahasa Indonesia untuk pemula. Pelajari gerakan bidak, taktik dasar, dan bermain catur dengan percaya diri.",
    url: siteUrl,
    siteName: "Bidak Pemula",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "Logo Bidak Pemula",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Bidak Pemula — Belajar Catur Interaktif dari Nol",
    description:
      "Platform belajar catur interaktif berbahasa Indonesia untuk pemula.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Bidak Pemula",
  url: siteUrl,
  description:
    "Platform belajar catur interaktif berbahasa Indonesia untuk pemula.",
  applicationCategory: "EducationalApplication",
  inLanguage: "id",
  operatingSystem: "All",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#141619] text-[#F2F0E8] overflow-x-hidden">
        <BadgeToastNotification />
        <Suspense
          fallback={
            <div className="h-16 w-full border-b border-[#353B42] bg-[#141619]" />
          }
        >
          <Navbar />
        </Suspense>
        <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-2.5 flex flex-col min-h-0">
          <Suspense fallback={<div className="p-8 text-center text-[#8A9299]">Memuat tampilan...</div>}>
            {children}
          </Suspense>
        </main>
      </body>
    </html>
  );
}
