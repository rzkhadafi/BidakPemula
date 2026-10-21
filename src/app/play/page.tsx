"use client";

import React, { useState } from "react";
import {
  RotateCcw,
  Undo2,
  Flag,
  Settings2,
  Clock,
  Bot,
  User,
  ShieldAlert,
  Play,
} from "lucide-react";
import { ChessboardPlaceholder } from "@/components/chessboard/ChessboardPlaceholder";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";

export default function PlayPage() {
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [playerColor, setPlayerColor] = useState<"white" | "black">("white");
  const [botLevel, setBotLevel] = useState("Pemula");
  const [timeControl, setTimeControl] = useState("5 Menit");
  const [isPracticeMode, setIsPracticeMode] = useState(true);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#353B42]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-semibold text-[#F2F0E8]">
              Main Catur vs Bot
            </h1>
            <Badge variant="accent">Fase 0 Visual Shell</Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#B0B5B9] mt-0.5">
            Latihan mandiri melawan bot Stockfish lokal (diaktifkan di Fase 1).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setConfigModalOpen(true)}
            aria-label="Atur Parameter Pertandingan"
          >
            <Settings2 className="w-4 h-4 mr-1.5 text-[#C7A66A]" />
            Pengaturan Game
          </Button>
        </div>
      </div>

      {/* Main Playing Arena: Board & Side Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Chessboard Column */}
        <div className="lg:col-span-8 flex flex-col items-center">
          {/* Opponent Info Bar */}
          <div className="w-full max-w-[560px] flex items-center justify-between py-2.5 px-3 mb-2 rounded-lg bg-[#1C2024] border border-[#353B42]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-[#24292E] border border-[#353B42] flex items-center justify-center text-[#B0B5B9]">
                <Bot className="w-4 h-4 text-[#73B894]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium text-[#F2F0E8]">
                    Bot Komputer ({botLevel})
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#73B894]" />
                </div>
                <span className="text-[11px] text-[#8A9299]">
                  Menunggu langkah pertama
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#141619] border border-[#353B42] font-mono text-xs tabular-nums text-[#F2F0E8]">
              <Clock className="w-3.5 h-3.5 text-[#8A9299]" />
              <span>05:00</span>
            </div>
          </div>

          {/* Chessboard Presentation */}
          <ChessboardPlaceholder
            orientation={playerColor}
            caption="Papan catur interaktif dengan validasi chess.js & Stockfish aktif di Fase 1."
          />

          {/* Player Info Bar */}
          <div className="w-full max-w-[560px] flex items-center justify-between py-2.5 px-3 mt-2 rounded-lg bg-[#1C2024] border border-[#353B42]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-[#24292E] border border-[#353B42] flex items-center justify-center text-[#B0B5B9]">
                <User className="w-4 h-4 text-[#C7A66A]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium text-[#F2F0E8]">
                    Pemain ({playerColor === "white" ? "Bidak Putih" : "Bidak Hitam"})
                  </span>
                  {isPracticeMode && (
                    <Badge variant="muted" size="sm">
                      Mode Latihan
                    </Badge>
                  )}
                </div>
                <span className="text-[11px] text-[#C7A66A]">
                  Giliran Putih melangkah
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#141619] border border-[#353B42] font-mono text-xs tabular-nums text-[#F2F0E8]">
              <Clock className="w-3.5 h-3.5 text-[#8A9299]" />
              <span>05:00</span>
            </div>
          </div>
        </div>

        {/* Side Panel: Move List & Controls */}
        <div className="lg:col-span-4 space-y-4 w-full">
          {/* Action Controls */}
          <Card variant="surface" className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#B0B5B9]">
              Kontrol Pertandingan
            </h2>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled
                title="Aktif saat mesin catur terhubung di Fase 1"
              >
                <Undo2 className="w-4 h-4 mr-1 text-[#8A9299]" />
                Undo
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled
                title="Aktif saat permainan dimulai di Fase 1"
              >
                <RotateCcw className="w-4 h-4 mr-1 text-[#8A9299]" />
                Mulai Ulang
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled
                className="col-span-2"
                title="Aktif saat permainan dimulai di Fase 1"
              >
                <Flag className="w-4 h-4 mr-1" />
                Menyerah
              </Button>
            </div>
          </Card>

          {/* Move List */}
          <Card variant="surface" className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#353B42]">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#B0B5B9]">
                Catatan Langkah (Notasi SAN)
              </h2>
              <span className="text-[11px] text-[#8A9299]">0 langkah</span>
            </div>

            {/* Empty move list state */}
            <div className="h-44 flex flex-col items-center justify-center text-center p-4 text-[#8A9299] text-xs space-y-2">
              <span className="text-2xl">♟</span>
              <p>Belum ada langkah yang dicatat.</p>
              <p className="text-[11px] text-[#8A9299]">
                Langkah pemain dan bot akan tervalidasi di Fase 1.
              </p>
            </div>
          </Card>

          {/* Notice Box */}
          <div className="p-3.5 rounded-xl bg-[#24292E]/60 border border-[#353B42] text-xs text-[#B0B5B9] space-y-1.5">
            <div className="flex items-center gap-1.5 text-[#C7A66A] font-medium">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Status Pengembangan</span>
            </div>
            <p className="text-[11px] text-[#8A9299] leading-relaxed">
              Ini adalah tata letak visual Fase 0. Pustaka aturan <code className="text-[#F2F0E8]">chess.js</code>, Web Worker Stockfish, dan interaksi drag-and-drop akan diintegrasikan pada <strong>Fase 1</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Game Configuration Modal */}
      <Modal
        isOpen={configModalOpen}
        onClose={() => setConfigModalOpen(false)}
        title="Pengaturan Permainan Catur"
        description="Pilih preferensi warna bidak, tingkat bot, dan kontrol waktu untuk sesi baru."
      >
        <div className="space-y-4 pt-2">
          {/* Color Selection */}
          <div>
            <label className="text-xs font-medium text-[#B0B5B9] block mb-1.5">
              Warna Bidak Anda
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPlayerColor("white")}
                className={`py-2 px-3 rounded-lg text-xs font-medium border transition-colors ${
                  playerColor === "white"
                    ? "bg-[#24292E] border-[#C7A66A] text-[#F2F0E8]"
                    : "border-[#353B42] text-[#8A9299] hover:bg-[#24292E]"
                }`}
              >
                Putih (Melangkah Pertama)
              </button>
              <button
                type="button"
                onClick={() => setPlayerColor("black")}
                className={`py-2 px-3 rounded-lg text-xs font-medium border transition-colors ${
                  playerColor === "black"
                    ? "bg-[#24292E] border-[#C7A66A] text-[#F2F0E8]"
                    : "border-[#353B42] text-[#8A9299] hover:bg-[#24292E]"
                }`}
              >
                Hitam (Bot Melangkah Pertama)
              </button>
            </div>
          </div>

          {/* Bot Difficulty */}
          <div>
            <label className="text-xs font-medium text-[#B0B5B9] block mb-1.5">
              Tingkat Kesulitan Bot
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {["Pemula", "Santai", "Menengah", "Mahir", "Sangat Kuat"].map(
                (lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setBotLevel(lvl)}
                    className={`py-1.5 px-2 rounded-md text-xs font-medium border transition-colors ${
                      botLevel === lvl
                        ? "bg-[#24292E] border-[#C7A66A] text-[#F2F0E8]"
                        : "border-[#353B42] text-[#8A9299] hover:bg-[#24292E]"
                    }`}
                  >
                    {lvl}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Time Control */}
          <div>
            <label className="text-xs font-medium text-[#B0B5B9] block mb-1.5">
              Kontrol Jam Catur
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {["Tanpa Waktu", "3 Menit", "5 Menit", "10 Menit"].map((tc) => (
                <button
                  key={tc}
                  type="button"
                  onClick={() => setTimeControl(tc)}
                  className={`py-1.5 px-2 rounded-md text-xs font-medium border transition-colors ${
                    timeControl === tc
                      ? "bg-[#24292E] border-[#C7A66A] text-[#F2F0E8]"
                      : "border-[#353B42] text-[#8A9299] hover:bg-[#24292E]"
                  }`}
                >
                  {tc}
                </button>
              ))}
            </div>
          </div>

          {/* Practice Mode Toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-[#353B42]">
            <div>
              <span className="text-xs font-medium text-[#F2F0E8] block">
                Mode Latihan (Izinkan Undo)
              </span>
              <span className="text-[11px] text-[#8A9299]">
                Mengizinkan pembatalan langkah saat bermain santai
              </span>
            </div>
            <input
              type="checkbox"
              checked={isPracticeMode}
              onChange={(e) => setIsPracticeMode(e.target.checked)}
              className="accent-[#C7A66A] w-4 h-4 cursor-pointer"
            />
          </div>

          {/* Modal Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#353B42]">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setConfigModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setConfigModalOpen(false)}
            >
              <Play className="w-3.5 h-3.5 mr-1" />
              Terapkan Konfigurasi
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
