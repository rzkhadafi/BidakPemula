"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GraduationCap,
  Swords,
  Sparkles,
  Archive,
  Settings,
  Menu,
  X,
  Compass,
} from "lucide-react";

const PRIMARY_NAV = [
  { href: "/academy", label: "Belajar", icon: GraduationCap },
  { href: "/play", label: "Main Catur", icon: Swords },
  { href: "/puzzles", label: "Latihan", icon: Sparkles },
];

const SECONDARY_NAV = [
  { href: "/archive", label: "Arsip", icon: Archive },
  { href: "/settings", label: "Pengaturan", icon: Settings },
];

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (href: string) => {
    if (!pathname) return href === "/";
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#353B42] bg-[#141619]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-[#F2F0E8] hover:text-[#C7A66A] transition-colors focus-visible:outline-2 focus-visible:outline-[#C7A66A] rounded-md px-1"
          >
            <div className="w-8 h-8 rounded-lg bg-[#24292E] border border-[#353B42] flex items-center justify-center font-bold text-[#C7A66A]">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M19 22H5v-2h14v2M17.5 13c-.3 0-.5-.1-.7-.3l-2.8-2.8v-1.4l1.4-1.4c.4-.4.4-1 0-1.4-.4-.4-1-.4-1.4 0L12.5 7.1l-1-1 1.4-1.4c.4-.4.4-1 0-1.4-.4-.4-1-.4-1.4 0L9 5.8C8.6 6.2 8.4 6.7 8.4 7.2v2.1l-2.1 2.1c-.2.2-.3.5-.3.7v3.9h11.5v-3z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold tracking-wider text-sm sm:text-base uppercase text-[#F2F0E8]">
                CHESS ARCHIVE
              </span>
              <span className="text-[10px] text-[#8A9299] tracking-normal -mt-0.5 hidden sm:block">
                Belajar & Bermain Catur
              </span>
            </div>
          </Link>
        </div>

        {/* Primary Desktop Navigation: Belajar, Main Catur, Latihan */}
        <nav
          aria-label="Navigasi Utama"
          className="hidden md:flex items-center gap-1.5"
        >
          {PRIMARY_NAV.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all focus-visible:outline-2 focus-visible:outline-[#C7A66A] ${
                  active
                    ? "bg-[#24292E] text-[#F2F0E8] border border-[#353B42] shadow-xs"
                    : "text-[#B0B5B9] hover:text-[#F2F0E8] hover:bg-[#1C2024]"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <Icon
                  className={`w-4 h-4 ${
                    active ? "text-[#C7A66A]" : "text-[#8A9299]"
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Secondary Desktop Navigation: Arsip & Pengaturan */}
        <div className="hidden md:flex items-center gap-1.5 border-l border-[#353B42] pl-3">
          {SECONDARY_NAV.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                aria-label={item.label}
                className={`p-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-[#C7A66A] flex items-center gap-1.5 ${
                  active
                    ? "bg-[#24292E] text-[#C7A66A] border border-[#353B42]"
                    : "text-[#8A9299] hover:text-[#F2F0E8] hover:bg-[#1C2024]"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu utama"}
            aria-expanded={mobileMenuOpen}
            className="p-2 rounded-lg text-[#B0B5B9] hover:text-[#F2F0E8] hover:bg-[#1C2024] focus-visible:outline-2 focus-visible:outline-[#C7A66A]"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#353B42] bg-[#141619] px-4 pt-2 pb-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#8A9299] px-3 mb-1">
              Menu Utama
            </div>
            <div className="space-y-1">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === "/"
                    ? "bg-[#24292E] text-[#F2F0E8] border border-[#353B42]"
                    : "text-[#B0B5B9] hover:text-[#F2F0E8] hover:bg-[#1C2024]"
                }`}
              >
                <Compass className="w-4 h-4 text-[#C7A66A]" />
                <span>Beranda</span>
              </Link>
              {PRIMARY_NAV.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? "bg-[#24292E] text-[#F2F0E8] border border-[#353B42]"
                        : "text-[#B0B5B9] hover:text-[#F2F0E8] hover:bg-[#1C2024]"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 ${
                        active ? "text-[#C7A66A]" : "text-[#8A9299]"
                      }`}
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="pt-2 border-t border-[#353B42]">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#8A9299] px-3 mb-1">
              Menu Lainnya
            </div>
            <div className="grid grid-cols-2 gap-2">
              {SECONDARY_NAV.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      active
                        ? "bg-[#24292E] text-[#F2F0E8] border border-[#353B42]"
                        : "text-[#8A9299] hover:text-[#F2F0E8] hover:bg-[#1C2024]"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
