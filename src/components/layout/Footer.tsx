import React from "react";
import Link from "next/link";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-[#353B42] bg-[#141619] text-[#8A9299] text-xs py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[#F2F0E8] tracking-wider uppercase text-xs">
            Bidak Pemula
          </span>
          <span>•</span>
          <span>Ruang Belajar & Bermain Catur Ramah Pemula</span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span>Penyimpanan lokal di peramban</span>
          <span>•</span>
          <Link
            href="/settings"
            className="hover:text-[#F2F0E8] transition-colors focus-visible:outline-2 focus-visible:outline-[#C7A66A]"
          >
            Pengaturan
          </Link>
          <span>•</span>
          <span className="text-[#B0B5B9]">Fase 0 MVP</span>
        </div>
      </div>
    </footer>
  );
};
