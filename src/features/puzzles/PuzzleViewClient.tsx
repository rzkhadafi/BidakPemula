"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Eye,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { ChessPuzzle, THEME_LABELS, DIFFICULTY_LABELS } from "./types";
import { usePuzzleGame } from "./use-puzzle-game";
import { InteractiveChessboard } from "@/components/chessboard/InteractiveChessboard";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

interface PuzzleViewClientProps {
  puzzle: ChessPuzzle;
  prevPuzzle: ChessPuzzle | null;
  nextPuzzle: ChessPuzzle | null;
}

export const PuzzleViewClient: React.FC<PuzzleViewClientProps> = ({
  puzzle,
  prevPuzzle,
  nextPuzzle,
}) => {
  const router = useRouter();
  const [confirmRevealModal, setConfirmRevealModal] = useState(false);

  const {
    chess,
    selectedSquare,
    legalDestinations,
    lastMove,
    pendingPromotion,
    status,
    feedback,
    hintsUnlocked,
    handleSquareClick,
    confirmPromotion,
    cancelPromotion,
    resetPuzzle,
    requestHint,
    revealSolution,
  } = usePuzzleGame(puzzle);

  const isWhiteToMove = puzzle.sideToMove === "w";

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#353B42] shrink-0">
        <Link
          href="/puzzles"
          className="inline-flex items-center gap-1.5 text-xs text-[#B0B5B9] hover:text-[#F2F0E8] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Kembali ke Katalog Latihan</span>
        </Link>
        <div className="flex items-center gap-2">
          <Badge variant="accent" size="sm">
            {THEME_LABELS[puzzle.theme]}
          </Badge>
          <Badge variant="muted" size="sm">
            {DIFFICULTY_LABELS[puzzle.difficulty]}
          </Badge>
        </div>
      </div>

      {/* Main Grid: Board & Side Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start flex-1 min-h-0">
        {/* Left Column: Interactive Chessboard */}
        <div className="lg:col-span-8 flex flex-col items-center w-full shrink-0">
          {/* Turn Banner */}
          <div className="w-full max-w-[min(100%,480px)] lg:max-w-[min(540px,calc(100dvh-200px))] flex items-center justify-between py-1.5 px-3 mb-2 rounded-lg bg-[#1C2024] border border-[#353B42]">
            <div className="flex items-center gap-2">
              <span
                className={`w-3 h-3 rounded-full border ${
                  isWhiteToMove ? "bg-[#FFFFFF] border-[#353B42]" : "bg-[#141619] border-[#8A9299]"
                }`}
              />
              <span className="text-xs font-medium text-[#F2F0E8]">
                Giliran: {isWhiteToMove ? "Putih Melangkah" : "Hitam Melangkah"}
              </span>
            </div>
            <span className="text-xs text-[#C7A66A] font-medium">
              {status === "completed"
                ? "Selesai"
                : status === "opponent_turn"
                ? "Balasan lawan..."
                : "Temukan langkah terbaik"}
            </span>
          </div>

          <InteractiveChessboard
            chess={chess}
            orientation={isWhiteToMove ? "white" : "black"}
            selectedSquare={selectedSquare}
            legalDestinations={legalDestinations}
            lastMove={lastMove}
            isCheck={chess.inCheck()}
            disabled={status === "completed" || status === "opponent_turn" || status === "solution_revealed"}
            pendingPromotion={pendingPromotion}
            onSquareClick={handleSquareClick}
            onConfirmPromotion={confirmPromotion}
            onCancelPromotion={cancelPromotion}
          />
        </div>

        {/* Right Column: Mission Objective, Hints, and Feedback */}
        <div className="lg:col-span-4 space-y-3.5 w-full lg:max-h-[calc(100dvh-115px)] lg:overflow-y-auto pr-1">
          {/* Objective Card */}
          <Card variant="surface" className="space-y-2.5">
            <div className="flex items-center justify-between pb-1 border-b border-[#353B42]">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#C7A66A]">
                Sasaran Taktis
              </span>
              <span className="text-[11px] text-[#8A9299]">
                {puzzle.title}
              </span>
            </div>
            <h2 className="text-sm font-semibold text-[#F2F0E8] leading-snug">
              {puzzle.goal}
            </h2>
            <p className="text-xs text-[#B0B5B9] leading-relaxed">
              {puzzle.description}
            </p>
          </Card>

          {/* Dynamic Feedback Banner */}
          {feedback && (
            <div
              className={`p-3 rounded-lg border text-xs space-y-1 animate-in fade-in duration-150 ${
                status === "completed"
                  ? "bg-[#73B894]/15 border-[#73B894]/40 text-[#73B894]"
                  : status === "wrong_step"
                  ? "bg-[#E3B66F]/15 border-[#E3B66F]/40 text-[#E3B66F]"
                  : status === "solution_revealed"
                  ? "bg-[#24292E] border-[#353B42] text-[#B0B5B9]"
                  : "bg-[#24292E] border-[#353B42] text-[#F2F0E8]"
              }`}
            >
              <div className="flex items-center gap-1.5 font-medium">
                {status === "completed" ? (
                  <CheckCircle2 className="w-4 h-4 text-[#73B894] shrink-0" />
                ) : status === "wrong_step" ? (
                  <AlertTriangle className="w-4 h-4 text-[#E3B66F] shrink-0" />
                ) : (
                  <BookOpen className="w-4 h-4 text-[#C7A66A] shrink-0" />
                )}
                <span>
                  {status === "completed"
                    ? "Berhasil Dipecahkan!"
                    : status === "wrong_step"
                    ? "Langkah Belum Tepat"
                    : "Info Posisi"}
                </span>
              </div>
              <p className="text-[#F2F0E8] leading-relaxed">{feedback}</p>
            </div>
          )}

          {/* Stepped Hints Card */}
          <Card variant="surface" className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-[#353B42]">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#B0B5B9] flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-[#E3B66F]" />
                Petunjuk Bertahap
              </span>
              <span className="text-[11px] text-[#8A9299]">
                {hintsUnlocked} / 3 Digunakan
              </span>
            </div>

            {hintsUnlocked === 0 ? (
              <p className="text-xs text-[#8A9299] leading-relaxed">
                Anda dapat meminta petunjuk bertingkat jika memerlukan arahan tanpa langsung membuka jawaban.
              </p>
            ) : (
              <div className="space-y-2">
                {puzzle.hints.slice(0, hintsUnlocked).map((hintText, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-[#24292E] border border-[#353B42] text-xs space-y-0.5 animate-in fade-in"
                  >
                    <span className="font-semibold text-[#C7A66A] block text-[11px]">
                      Petunjuk {idx + 1}:
                    </span>
                    <p className="text-[#B0B5B9] leading-relaxed">{hintText}</p>
                  </div>
                ))}
              </div>
            )}

            {status !== "completed" && status !== "solution_revealed" && (
              <Button
                variant="secondary"
                size="sm"
                onClick={requestHint}
                disabled={hintsUnlocked >= 3}
                className="w-full text-xs"
              >
                <Lightbulb className="w-3.5 h-3.5 mr-1 text-[#E3B66F]" />
                {hintsUnlocked === 0
                  ? "Buka Petunjuk 1 (Tema)"
                  : hintsUnlocked === 1
                  ? "Buka Petunjuk 2 (Sasaran)"
                  : hintsUnlocked === 2
                  ? "Buka Petunjuk 3 (Langkah)"
                  : "Semua Petunjuk Terbuka"}
              </Button>
            )}
          </Card>

          {/* Solution & Takeaway Card (When Completed or Revealed) */}
          {(status === "completed" || status === "solution_revealed") && (
            <Card variant="surface" className="space-y-3 border-[#C7A66A]/40 bg-[#1C2024]">
              <div className="flex items-center gap-2 pb-1 border-b border-[#353B42] text-xs font-semibold uppercase tracking-wider text-[#C7A66A]">
                <BookOpen className="w-4 h-4" />
                <span>Ulasan & Penjelasan Taktis</span>
              </div>

              <div className="space-y-2 text-xs text-[#B0B5B9] leading-relaxed">
                <div>
                  <strong className="text-[#F2F0E8] block">Motif:</strong>
                  <span>{puzzle.explanation.motif}</span>
                </div>
                <div>
                  <strong className="text-[#F2F0E8] block">Langkah Kunci:</strong>
                  <span>{puzzle.explanation.keyMove}</span>
                </div>
                <div>
                  <strong className="text-[#F2F0E8] block">Pelajaran:</strong>
                  <span>{puzzle.explanation.takeaway}</span>
                </div>
              </div>

              {nextPuzzle && (
                <div className="pt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => router.push(`/puzzles/${nextPuzzle.id}`)}
                    className="w-full text-xs"
                  >
                    <span>Lanjut ke Puzzle Berikutnya</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </div>
              )}
            </Card>
          )}

          {/* Action Controls */}
          <Card variant="surface" className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={resetPuzzle}
                className="text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1 text-[#8A9299]" />
                Ulangi Posisi
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setConfirmRevealModal(true)}
                disabled={status === "solution_revealed"}
                className="text-xs"
              >
                <Eye className="w-3.5 h-3.5 mr-1 text-[#C7A66A]" />
                Lihat Solusi
              </Button>
            </div>

            {/* Prev / Next Puzzle navigation */}
            <div className="flex items-center justify-between pt-2 border-t border-[#353B42]">
              {prevPuzzle ? (
                <Link href={`/puzzles/${prevPuzzle.id}`} className="text-xs text-[#8A9299] hover:text-[#F2F0E8] flex items-center gap-1">
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Sebelumnya
                </Link>
              ) : (
                <div />
              )}

              {nextPuzzle ? (
                <Link href={`/puzzles/${nextPuzzle.id}`} className="text-xs text-[#C7A66A] hover:underline flex items-center gap-1 font-medium">
                  Berikutnya
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              ) : (
                <div />
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Confirmation Modal to Reveal Solution */}
      <Modal
        isOpen={confirmRevealModal}
        onClose={() => setConfirmRevealModal(false)}
        title="Lihat Solusi Lengkap?"
        description="Membuka solusi akan menampilkan seluruh langkah kunci, namun latihan ini tidak akan dicatat sebagai penyelesaian mandiri."
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-[#B0B5B9] leading-relaxed">
            Apakah Anda yakin ingin melihat solusinya sekarang, atau ingin mencoba meminta petunjuk tambahan terlebih dahulu?
          </p>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setConfirmRevealModal(false)}
            >
              Coba Sendiri Lagi
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setConfirmRevealModal(false);
                revealSolution();
              }}
            >
              Buka Solusi
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
