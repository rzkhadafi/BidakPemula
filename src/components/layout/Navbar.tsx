"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Swords,
  GraduationCap,
  Sparkles,
  Archive,
  Settings,
  Menu,
  X,
  Compass,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Beranda", icon: Compass },
  { href: "/play", label: "Main Catur", icon: Swords },
  { href: "/academy", label: "Akademi", icon: GraduationCap },
  { href: "/puzzles", label: "Puzzle", icon: Sparkles },
  { href: "/archive", label: "Arsip Saya", icon: Archive },
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
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-[#F2F0E8] hover:text-[#C7A66A] transition-colors focus-visible:outline-2 focus-visible:outline-[#C7A66A] rounded-md px-1"
          >
            <div className="w-8 h-8 rounded-lg bg-[#24292E] border border-[#353B42] flex items-center justify-center font-serif text-lg font-bold text-[#C7A66A]">
              ♟
            </div>
            <div className="flex flex-col">
              <span className="font-semibold tracking-wider text-sm sm:text-base uppercase text-[#F2F0E8]">
                CHESS ARCHIVE
              </span>
              <span className="text-[10px] text-[#8A9299] tracking-normal -mt-0.5 hidden sm:block">
                Ruang Arsip Strategi
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav
          aria-label="Navigasi Utama"
          className="hidden md:flex items-center gap-1 lg:gap-2"
        >
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all focus-visible:outline-2 focus-visible:outline-[#C7A66A] ${
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

        {/* Right Action: Settings and Mobile Menu Toggle */}
        <div className="flex items-center gap-2">
          <Link
            href="/settings"
            aria-label="Pengaturan"
            className={`p-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-[#C7A66A] ${
              isActive("/settings")
                ? "bg-[#24292E] text-[#C7A66A] border border-[#353B42]"
                : "text-[#B0B5B9] hover:text-[#F2F0E8] hover:bg-[#1C2024]"
            }`}
          >
            <Settings className="w-5 h-5" />
          </Link>

          {/* Mobile hamburger button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu utama"}
            aria-expanded={mobileMenuOpen}
            className="md:hidden p-2 rounded-lg text-[#B0B5B9] hover:text-[#F2F0E8] hover:bg-[#1C2024] focus-visible:outline-2 focus-visible:outline-[#C7A66A]"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer / Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#353B42] bg-[#141619] px-4 pt-2 pb-4 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150">
          {NAV_ITEMS.map((item) => {
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
        </div>
      )}
    </header>
  );
};
