import React from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { ChessboardPlaceholder } from "@/components/chessboard/ChessboardPlaceholder";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

// Sample moves for Phase 0 replay visualization
const SAMPLE_MOVES = [
  { ply: 1, white: "e4", black: "e5" },
  { ply: 2, white: "Nf3", black: "Nc6" },
  { ply: 3, white: "Bb5", black: "a6" },
  { ply: 4, white: "Ba4", black: "Nf6" },
];

export function generateStaticParams() {
  return [
    { gameId: "game-demo-01" },
    { gameId: "game-demo-02" },
  ];
}

export default async function GameDetailPage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = await params;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Breadcrumb & Metadata */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#353B42]">
        <Link
          href="/archive"
          className="inline-flex items-center gap-1.5 text-xs text-[#B0B5B9] hover:text-[#F2F0E8] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Kembali ke Arsip Pertandingan</span>
        </Link>
        <div className="flex items-center gap-2">
          <Badge variant="success">Kemenangan Putih</Badge>
          <Badge variant="muted">ID: {gameId}</Badge>
        </div>
      </div>

      {/* Replay Screen Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Replay Chessboard */}
        <div className="lg:col-span-8 flex flex-col items-center space-y-3">
          <ChessboardPlaceholder
            caption="Tinjauan papan catur interaktif untuk tayang ulang langkah (Fase 0 Visual Shell)."
          />

          {/* Replay Playback Navigation Controls */}
          <div className="w-full max-w-[560px] flex items-center justify-center gap-2 p-2 rounded-lg bg-[#1C2024] border border-[#353B42]">
            <Button
              variant="secondary"
              size="sm"
              disabled
              title="Navigasi ke posisi awal"
            >
              <SkipBack className="w-4 h-4" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled
              title="Langkah sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="font-mono text-xs text-[#B0B5B9] px-3">
              Langkah 8 / 24
            </span>
            <Button
              variant="secondary"
              size="sm"
              disabled
              title="Langkah berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled
              title="Navigasi ke posisi akhir"
            >
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Right Column: Move Table & Analysis Placeholder */}
        <div className="lg:col-span-4 space-y-4 w-full">
          {/* Game Info Card */}
          <Card variant="surface" className="space-y-2.5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#B0B5B9]">
              Ringkasan Pertandingan
            </h2>
            <div className="space-y-1.5 text-xs text-[#B0B5B9]">
              <div className="flex items-center justify-between">
                <span className="text-[#8A9299]">Pemain:</span>
                <span className="text-[#F2F0E8] font-medium">Putih</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8A9299]">Lawan:</span>
                <span className="text-[#F2F0E8]">Bot Stockfish (Pemula)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8A9299]">Tanggal:</span>
                <span>21 Oktober 2026</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8A9299]">Durasi:</span>
                <span>4 menit 12 detik</span>
              </div>
            </div>
          </Card>

          {/* Move History Table */}
          <Card variant="surface" className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#B0B5B9]">
              Daftar Langkah
            </h3>
            <div className="max-h-48 overflow-y-auto space-y-1 pr-1 font-mono text-xs">
              {SAMPLE_MOVES.map((m) => (
                <div
                  key={m.ply}
                  className="grid grid-cols-12 gap-1 py-1 px-1.5 rounded hover:bg-[#24292E] text-[#F2F0E8]"
                >
                  <span className="col-span-2 text-[#8A9299]">{m.ply}.</span>
                  <span className="col-span-5 text-[#C7A66A]">{m.white}</span>
                  <span className="col-span-5 text-[#B0B5B9]">{m.black}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Engine & AI Autopsy Note */}
          <div className="p-3.5 rounded-xl bg-[#1C2024] border border-[#353B42] text-xs text-[#8A9299] space-y-1">
            <span className="font-medium text-[#C7A66A] block">
              Fitur Analisis & Replay Mendalam
            </span>
            <p>
              Sinkronisasi langkah dinamis, evaluasi Stockfish, dan bedah posisi kritis (Match Autopsy) dijadwalkan pada <strong>Fase 2 & Fase 4</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
