"use client";

import React, { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  Archive,
  Trash2,
  ChevronRight,
  Clock,
  Swords,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import {
  getArchivedGames,
  getArchivedGamesServerSnapshot,
  subscribeToArchivedGames,
  clearArchivedGames,
} from "@/lib/storage/game-archive";

function formatDuration(ms?: number): string {
  if (!ms || ms <= 0) return "1m 00s";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds < 10 ? "0" : ""}${seconds}s`;
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso.slice(0, 10);
  }
}

export default function ArchivePage() {
  const games = useSyncExternalStore(
    subscribeToArchivedGames,
    getArchivedGames,
    getArchivedGamesServerSnapshot
  );

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const handleClearArchive = () => {
    clearArchivedGames();
    setDeleteModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#353B42]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-semibold text-[#F2F0E8]">
              Arsip Pertandingan Lokal
            </h1>
            <Badge variant="muted">Penyimpanan Peramban</Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#B0B5B9] mt-0.5">
            Daftar seluruh pertandingan yang tersimpan di perangkat lokal Anda.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {games.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteModalOpen(true)}
              aria-label="Hapus Seluruh Arsip Pertandingan"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              Kosongkan Arsip
            </Button>
          )}
        </div>
      </div>

      {/* Game List or Empty State */}
      {games.length > 0 ? (
        <div className="space-y-3">
          <div className="text-xs text-[#8A9299] flex items-center justify-between px-1">
            <span>Daftar Pertandingan Terakhir</span>
            <span>{games.length} Pertandingan Tercatat</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {games.map((game) => {
              const isWin =
                (game.playerColor === "white" && game.result === "white_win") ||
                (game.playerColor === "black" && game.result === "black_win");
              const isDraw = game.result === "draw";

              return (
                <Card
                  key={game.id}
                  variant="surface"
                  className="hover:border-[#C7A66A]/40 transition-colors p-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#24292E] border border-[#353B42] flex items-center justify-center text-lg">
                        ♟
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-[#F2F0E8]">
                            vs Bot {game.botLevel}
                          </span>
                          <Badge
                            variant={isWin ? "success" : isDraw ? "warning" : "danger"}
                            size="sm"
                          >
                            {isWin ? "Menang" : isDraw ? "Remis" : "Kalah"} •{" "}
                            {game.termination}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-[#8A9299]">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(game.createdAt)}
                          </span>
                          <span>•</span>
                          <span>
                            {game.playerColor === "white" ? "Putih" : "Hitam"}
                          </span>
                          <span>•</span>
                          <span>{game.moves.length} langkah</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {formatDuration(game.durationMs)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Link href={`/archive/${game.id}`}>
                        <Button variant="secondary" size="sm">
                          Tinjau Permainan
                          <ChevronRight className="w-3.5 h-3.5 ml-1 text-[#C7A66A]" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      ) : (
        <Card variant="surface" className="py-16 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-[#24292E] border border-[#353B42] mx-auto flex items-center justify-center text-[#8A9299]">
            <Archive className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-medium text-[#F2F0E8]">
              Belum ada arsip permainan
            </h2>
            <p className="text-xs text-[#8A9299] max-w-sm mx-auto mt-1">
              Pertandingan yang Anda selesaikan di menu Main Catur akan otomatis tersimpan dan dapat ditinjau kembali di sini.
            </p>
          </div>
          <div className="pt-2">
            <Link href="/play">
              <Button variant="primary" size="sm">
                <Swords className="w-4 h-4 mr-1.5" />
                Mulai Permainan Pertama
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Kosongkan Semua Arsip Pertandingan?"
        description="Tindakan ini akan menghapus seluruh catatan permainan lokal di peramban Anda. Progres belajar di Akademi dan Puzzle tidak akan terpengaruh."
      >
        <div className="space-y-4 pt-2">
          <div className="p-3 rounded-lg bg-[#E17C78]/10 border border-[#E17C78]/30 flex items-start gap-2.5 text-xs text-[#E17C78]">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Data yang dihapus dari penyimpanan peramban tidak dapat dipulihkan kembali.
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setDeleteModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleClearArchive}
            >
              Ya, Hapus Semua Catatan
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
