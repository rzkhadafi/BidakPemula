import React from "react";
import Link from "next/link";
import { Swords, GraduationCap, Sparkles, BookOpen, Clock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function HomePage() {
  return (
    <div className="space-y-10 py-2 sm:py-4">
      {/* Header Statement */}
      <section className="space-y-3 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#24292E] border border-[#353B42] text-xs text-[#B0B5B9]">
          <span className="w-2 h-2 rounded-full bg-[#C7A66A]" />
          <span>Fase 0 — Fondasi & Kerangka Visual</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-[#F2F0E8]">
          Ruang arsip strategi dan latihan catur mandiri.
        </h1>
        <p className="text-sm sm:text-base text-[#B0B5B9] leading-relaxed">
          Mainkan catur melawan bot komputer, pelajari konsep taktis berbahasa Indonesia, dan tinjau setiap keputusan langkah tanpa tekanan akun atau rating kompetitif.
        </p>

        {/* Primary and Secondary Actions */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Link href="/play">
            <Button variant="primary" size="lg" className="w-full sm:w-auto">
              <Swords className="w-5 h-5 mr-2 text-[#141619]" />
              Mulai Permainan
            </Button>
          </Link>
          <Link href="/academy">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              <GraduationCap className="w-5 h-5 mr-2 text-[#C7A66A]" />
              Lanjutkan Belajar
            </Button>
          </Link>
          <Link href="/puzzles">
            <Button variant="ghost" size="lg" className="w-full sm:w-auto text-[#B0B5B9] hover:text-[#F2F0E8]">
              <Sparkles className="w-5 h-5 mr-2 text-[#E3B66F]" />
              Pecahkan Puzzle
            </Button>
          </Link>
        </div>
      </section>

      {/* Grid: Belajar Terarah, Puzzle Harian, dan Status Arsip */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Akademi Card */}
        <Card variant="surface" className="flex flex-col justify-between hover:border-[#C7A66A]/40 transition-colors">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="p-2 rounded-lg bg-[#24292E] border border-[#353B42] text-[#C7A66A]">
                <BookOpen className="w-5 h-5" />
              </span>
              <Badge variant="accent">Materi Dasar</Badge>
            </div>
            <div>
              <h2 className="text-base font-medium text-[#F2F0E8]">Kurikulum Akademi</h2>
              <p className="text-xs text-[#B0B5B9] mt-1">
                8 modul kurasi lokal mulai dari pengenalan papan, rokade, hingga taktik garpu (fork) dan pin.
              </p>
            </div>
          </div>
          <div className="pt-4 mt-4 border-t border-[#353B42] flex items-center justify-between text-xs">
            <span className="text-[#8A9299]">Modul 1: Mengenal Papan</span>
            <Link
              href="/academy"
              className="text-[#C7A66A] hover:underline flex items-center gap-1 font-medium"
            >
              Buka <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Card>

        {/* Puzzle Card */}
        <Card variant="surface" className="flex flex-col justify-between hover:border-[#C7A66A]/40 transition-colors">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="p-2 rounded-lg bg-[#24292E] border border-[#353B42] text-[#E3B66F]">
                <Sparkles className="w-5 h-5" />
              </span>
              <Badge variant="warning">Latihan Taktik</Badge>
            </div>
            <div>
              <h2 className="text-base font-medium text-[#F2F0E8]">Koleksi Puzzle</h2>
              <p className="text-xs text-[#B0B5B9] mt-1">
                Uji ketajaman taktis dengan petunjuk bertahap tanpa membongkar solusi secara langsung.
              </p>
            </div>
          </div>
          <div className="pt-4 mt-4 border-t border-[#353B42] flex items-center justify-between text-xs">
            <span className="text-[#8A9299]">Level: Pemula & Santai</span>
            <Link
              href="/puzzles"
              className="text-[#C7A66A] hover:underline flex items-center gap-1 font-medium"
            >
              Latihan <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Card>

        {/* Arsip Card (Empty State) */}
        <Card variant="surface" className="flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="p-2 rounded-lg bg-[#24292E] border border-[#353B42] text-[#B0B5B9]">
                <Clock className="w-5 h-5" />
              </span>
              <Badge variant="muted">Penyimpanan Lokal</Badge>
            </div>
            <div>
              <h2 className="text-base font-medium text-[#F2F0E8]">Catatan Pertandingan</h2>
              <p className="text-xs text-[#8A9299] mt-1">
                Belum ada riwayat permainan tersimpan di peramban ini. Selesaikan pertandingan pertama untuk meninjau kembali keputusan langkah Anda.
              </p>
            </div>
          </div>
          <div className="pt-4 mt-4 border-t border-[#353B42] flex items-center justify-between text-xs">
            <span className="text-[#8A9299]">0 pertandingan</span>
            <Link
              href="/archive"
              className="text-[#B0B5B9] hover:text-[#F2F0E8] flex items-center gap-1"
            >
              Lihat Arsip <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Card>
      </section>

      {/* Prinsip Belajar & Transparansi */}
      <section className="p-5 rounded-xl bg-[#1C2024]/60 border border-[#353B42] space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#C7A66A]">
          Filosofi Belajar Chess Archive
        </h3>
        <p className="text-xs text-[#B0B5B9] leading-relaxed">
          Semua aturan permainan divalidasi oleh pustaka catur standar. Mesin Stockfish (Web Worker) bertindak sebagai lawan tanding dan analisis taktis, sedangkan kecerdasan buatan Gemini hanya bertugas merangkum penjelasan dalam Bahasa Indonesia yang bersahabat.
        </p>
      </section>
    </div>
  );
}
