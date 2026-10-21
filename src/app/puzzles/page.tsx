"use client";

import React, { useState } from "react";
import {
  HelpCircle,
  RotateCcw,
  SkipForward,
  Lightbulb,
} from "lucide-react";
import { ChessboardPlaceholder } from "@/components/chessboard/ChessboardPlaceholder";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const CATEGORIES = [
  "Semua Kategori",
  "Dasar",
  "Taktik",
  "Bertahan",
  "Skakmat",
  "Endgame",
];

export default function PuzzlesPage() {
  const [selectedCategory, setSelectedCategory] = useState("Semua Kategori");
  const [showHint, setShowHint] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#353B42]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-semibold text-[#F2F0E8]">
              Puzzle Taktik Catur
            </h1>
            <Badge variant="warning">Latihan Mandiri</Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#B0B5B9] mt-0.5">
            Latih intuisi dan kalkulasi taktis dengan posisi nyata yang tervalidasi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="accent" size="md">
            Puzzle #01: Garpu Kuda Dasar
          </Badge>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-[#C7A66A] ${
              selectedCategory === cat
                ? "bg-[#24292E] text-[#F2F0E8] border border-[#353B42]"
                : "text-[#8A9299] hover:text-[#F2F0E8] hover:bg-[#1C2024]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Puzzle Grid: Board & Side Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Chessboard */}
        <div className="lg:col-span-8 flex flex-col items-center">
          <ChessboardPlaceholder
            caption="Tampilan posisi awal taktik puzzle. Validasi langkah solusi aktif di Fase 2."
          />
        </div>

        {/* Right: Instructions & Controls */}
        <div className="lg:col-span-4 space-y-4 w-full">
          {/* Mission Objective Card */}
          <Card variant="surface" className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#C7A66A]">
                Tujuan Puzzle
              </span>
              <Badge variant="muted" size="sm">
                Tingkat: Pemula
              </Badge>
            </div>
            <div>
              <h2 className="text-base font-medium text-[#F2F0E8]">
                Temukan langkah taktis terbaik
              </h2>
              <p className="text-xs text-[#B0B5B9] mt-1">
                Putih melangkah. Terdapat ancaman garpu (fork) terhadap raja dan menteri hitam.
              </p>
            </div>
          </Card>

          {/* Hint & Helper Section */}
          <Card variant="surface" className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#353B42]">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#B0B5B9]">
                Bantuan & Petunjuk
              </span>
              <Lightbulb className="w-4 h-4 text-[#E3B66F]" />
            </div>

            {showHint ? (
              <div className="p-3 rounded-lg bg-[#24292E] border border-[#353B42] text-xs text-[#F2F0E8] space-y-1">
                <span className="font-medium text-[#C7A66A] block">
                  Petunjuk 1:
                </span>
                <p className="text-[#B0B5B9]">
                  Perhatikan kemampuan lompatan kuda ke petak c7 yang tidak terlindungi oleh bidak lawan.
                </p>
              </div>
            ) : (
              <p className="text-xs text-[#8A9299]">
                Petunjuk bertingkat tersedia jika Anda membutuhkan arahan tanpa langsung membuka solusi.
              </p>
            )}

            <div className="flex items-center gap-2 pt-1">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowHint(!showHint)}
                className="w-full text-xs"
              >
                <HelpCircle className="w-3.5 h-3.5 mr-1 text-[#C7A66A]" />
                {showHint ? "Sembunyikan Petunjuk" : "Lihat Petunjuk"}
              </Button>
            </div>
          </Card>

          {/* Puzzle Action Buttons */}
          <Card variant="surface" className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#8A9299] mb-2">
              Aksi Latihan
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled
                title="Aktif saat validasi puzzle selesai di Fase 2"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1 text-[#8A9299]" />
                Ulangi Posisi
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled
                title="Aktif saat koleksi puzzle terhubung di Fase 2"
              >
                <SkipForward className="w-3.5 h-3.5 mr-1 text-[#8A9299]" />
                Lewati Puzzle
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
