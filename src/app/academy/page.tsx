import React from "react";
import Link from "next/link";
import { BookOpen, Clock, ChevronRight, GraduationCap } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export const LESSONS = [
  {
    id: "mengenal-papan",
    order: 1,
    title: "Mengenal Papan dan Koordinat",
    summary: "Memahami 64 petak, petak terang dan gelap, lajur (file a-h), dan baris (rank 1-8).",
    duration: "5 menit",
    status: "Belum dimulai" as const,
  },
  {
    id: "gerak-bidak",
    order: 2,
    title: "Cara Gerak Setiap Bidak",
    summary: "Karakteristik langkah raja, menteri, benteng, gajah, kuda, dan pion.",
    duration: "10 menit",
    status: "Belum dimulai" as const,
  },
  {
    id: "langkah-legal",
    order: 3,
    title: "Langkah Legal dan Menangkap Bidak",
    summary: "Aturan giliran, penangkapan bidak lawan, dan larangan membiarkan raja dalam skak.",
    duration: "8 menit",
    status: "Belum dimulai" as const,
  },
  {
    id: "skak-dan-mat",
    order: 4,
    title: "Skak, Skakmat, dan Stalemate",
    summary: "Membedakan ancaman skak, akhir kemenangan skakmat, dan kondisi remis jalan buntu.",
    duration: "10 menit",
    status: "Belum dimulai" as const,
  },
  {
    id: "aturan-khusus",
    order: 5,
    title: "Rokade, Promosi Pion, dan En Passant",
    summary: "Tiga aturan khusus dalam catur standar serta syarat legalitas eksekusinya.",
    duration: "12 menit",
    status: "Belum dimulai" as const,
  },
  {
    id: "nilai-bidak",
    order: 6,
    title: "Nilai Relatif Bidak dan Keselamatan Raja",
    summary: "Perbandingan nilai poin bidak dalam pertukaran serta perlindungan posisi raja.",
    duration: "7 menit",
    status: "Belum dimulai" as const,
  },
  {
    id: "taktik-dasar",
    order: 7,
    title: "Fork, Pin, dan Serangan Ganda",
    summary: "Pola motif taktis fundamental untuk memenangkan materi dan posisi strategis.",
    duration: "12 menit",
    status: "Belum dimulai" as const,
  },
  {
    id: "prinsip-pembukaan",
    order: 8,
    title: "Prinsip Pembukaan Catur",
    summary: "Mengembangkan perwira, menguasai empat petak pusat, dan mengamankan raja lebih awal.",
    duration: "10 menit",
    status: "Belum dimulai" as const,
  },
];

export default function AcademyPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#353B42]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-semibold text-[#F2F0E8]">
              Akademi Catur
            </h1>
            <Badge variant="accent">Kurikulum Bahasa Indonesia</Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#B0B5B9] mt-0.5">
            Pelajari konsep catur secara berurutan atau pilih materi yang ingin Anda perdalam.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1C2024] border border-[#353B42] text-xs text-[#B0B5B9]">
          <GraduationCap className="w-4 h-4 text-[#C7A66A]" />
          <span>Progres: 0 / 8 Pelajaran Selesai</span>
        </div>
      </div>

      {/* Curriculum Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {LESSONS.map((lesson) => (
          <Link
            key={lesson.id}
            href={`/academy/${lesson.id}`}
            className="group block"
          >
            <Card
              variant="surface"
              className="h-full flex flex-col justify-between group-hover:border-[#C7A66A]/50 transition-all duration-150"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-[#24292E] border border-[#353B42] flex items-center justify-center text-xs font-mono font-medium text-[#C7A66A]">
                      {lesson.order}
                    </span>
                    <Badge variant="muted" size="sm">
                      {lesson.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-[#8A9299]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{lesson.duration}</span>
                  </div>
                </div>

                <div>
                  <h2 className="text-base font-medium text-[#F2F0E8] group-hover:text-[#C7A66A] transition-colors">
                    {lesson.title}
                  </h2>
                  <p className="text-xs text-[#B0B5B9] mt-1 line-clamp-2">
                    {lesson.summary}
                  </p>
                </div>
              </div>

              <div className="pt-3 mt-4 border-t border-[#353B42] flex items-center justify-between text-xs text-[#8A9299]">
                <span className="flex items-center gap-1 text-[11px]">
                  <BookOpen className="w-3.5 h-3.5" />
                  Materi Kurasi Lokal
                </span>
                <span className="text-[#C7A66A] font-medium flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                  Mulai Pelajaran <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
