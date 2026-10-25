import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BadgeToastNotification } from "@/features/badges";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bidak Pemula — Belajar & Bermain Catur Ramah Pemula",
  description:
    "Platform belajar, bermain catur melawan bot komputer, dan mengasah taktik catur dengan analisis terstruktur dalam Bahasa Indonesia.",
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
      <body className="min-h-full flex flex-col bg-[#141619] text-[#F2F0E8] overflow-x-hidden">
        <BadgeToastNotification />
        <Suspense
          fallback={
            <div className="h-16 w-full border-b border-[#353B42] bg-[#141619]" />
          }
        >
          <Navbar />
        </Suspense>
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col">
          <Suspense fallback={<div className="p-8 text-center text-[#8A9299]">Memuat tampilan...</div>}>
            {children}
          </Suspense>
        </main>
        <Footer />
      </body>
    </html>
  );
}
