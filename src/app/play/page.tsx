"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  RotateCcw,
  Undo2,
  Flag,
  Settings2,
  Clock,
  Bot,
  User,
  ShieldCheck,
  Play,
  Trophy,
  Archive,
  Volume2,
  VolumeX,
  Sparkles,
  Lightbulb,
  ShieldAlert,
} from "lucide-react";
import { InteractiveChessboard } from "@/components/chessboard/InteractiveChessboard";
import { useChessGame } from "@/features/game/use-chess-game";
import {
  PlayerColor,
  BotDifficultyLevel,
  TimeControlId,
} from "@/types/chess";
import { getAllDifficulties } from "@/features/engine/difficulty";
import { PlayTutorModal } from "@/features/tutor/components/PlayTutorModal";
import { TutorExplainRequest } from "@/features/tutor/types";
import {
  BlunderInterceptModal,
  SocraticHintModal,
  setCoPilotPreferences,
} from "@/features/copilot";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { chessAudio } from "@/lib/audio/chess-audio";

function formatClock(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function PlayPage() {
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState<PlayerColor>("white");
  const [selectedDifficulty, setSelectedDifficulty] = useState<BotDifficultyLevel>("beginner");
  const [selectedTimeControl, setSelectedTimeControl] = useState<TimeControlId>("5m");
  const [isPracticeMode, setIsPracticeMode] = useState<boolean>(true);
  const [soundOn, setSoundOn] = useState<boolean>(() => chessAudio.isEnabled());
  const [highlightedSquare, setHighlightedSquare] = useState<string | null>(null);

  const moveListContainerRef = useRef<HTMLDivElement>(null);

  const toggleSound = () => {
    const next = chessAudio.toggleSound();
    setSoundOn(next);
  };

  const {
    chess,
    turn,
    isCheck,
    gameStatus,
    gameResult,
    terminationReason,
    history,
    lastMove,
    selectedSquare,
    legalDestinations,
    pendingPromotion,
    whiteClockMs,
    blackClockMs,
    botThinking,
    engineStatus,
    config,
    coPilotPreferences,
    pendingBlunder,
    cancelBlunderMove,
    proceedBlunderMove,
    requestSocraticHint,
    currentHint,
    clearHint,
    hintLoading,
    undoFeedback,
    setUndoFeedback,
    handleSquareClick,
    confirmPromotion,
    cancelPromotion,
    undoMove,
    resignGame,
    startNewGame,
    resetGame,
  } = useChessGame({
    playerColor: selectedColor,
    botDifficulty: selectedDifficulty,
    timeControl: selectedTimeControl,
    isPracticeMode: isPracticeMode,
  });

  // Auto-scroll move list to latest move
  useEffect(() => {
    if (moveListContainerRef.current) {
      moveListContainerRef.current.scrollTop =
        moveListContainerRef.current.scrollHeight;
    }
  }, [history.length]);

  const difficulties = getAllDifficulties();
  const currentDiff = difficulties.find((d) => d.id === config.botDifficulty);

  // Group moves into pairs (White move, Black move)
  const movePairs: Array<{ number: number; white?: string; black?: string }> = [];
  for (let i = 0; i < history.length; i += 2) {
    movePairs.push({
      number: Math.floor(i / 2) + 1,
      white: history[i]?.san,
      black: history[i + 1]?.san,
    });
  }

  const isPlayerWhite = config.playerColor === "white";
  const isPlayerTurn =
    (isPlayerWhite && turn === "w") || (!isPlayerWhite && turn === "b");

  const [tutorModalOpen, setTutorModalOpen] = useState(false);
  const [tutorRequestContext, setTutorRequestContext] = useState<TutorExplainRequest | null>(null);

  // Turunan petak sorot: utamakan petak bahaya saat blunder terdeteksi tanpa efek cascading
  const effectiveHighlightedSquare = pendingBlunder
    ? (pendingBlunder.report.hangingSquare || pendingBlunder.to || highlightedSquare)
    : highlightedSquare;

  const handleOpenTutor = () => {
    const lastMoveItem = history[history.length - 1];
    const req: TutorExplainRequest = {
      fen: chess.fen(),
      sideToMove: chess.turn(),
      learnerLevel: config.botDifficulty === "casual" ? "santai" : "pemula",
      mode: "play",
      lastMoveUci: lastMoveItem?.uci,
      lastMoveSan: lastMoveItem?.san,
      recentMovesSan: history.slice(-8).map((h) => h.san),
    };
    setTutorRequestContext(req);
    setTutorModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#353B42]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-semibold text-[#F2F0E8]">
              Main Catur vs Bot
            </h1>
            <Badge variant="accent">Stockfish 19 Web Worker</Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#B0B5B9] mt-0.5">
            Latihan mandiri dengan validasi aturan catur standar penuh dan penyimpanan lokal.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={toggleSound}
            aria-label={soundOn ? "Matikan Efek Suara" : "Nyalakan Efek Suara"}
            title={soundOn ? "Suara Aktif (Klik untuk Mematikan)" : "Suara Nonaktif (Klik untuk Menyalakan)"}
          >
            {soundOn ? (
              <Volume2 className="w-4 h-4 text-[#73B894]" />
            ) : (
              <VolumeX className="w-4 h-4 text-[#8A9299]" />
            )}
            <span className="hidden sm:inline ml-1 text-xs">{soundOn ? "Suara" : "Mute"}</span>
          </Button>

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

      {/* Main Playing Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Chessboard Column (Tetap terpancang di layar desktop agar selalu terlihat) */}
        <div className="lg:col-span-8 flex flex-col items-center lg:sticky lg:top-4">
          {/* Opponent Info Bar */}
          <div className="w-full max-w-[640px] lg:max-w-[660px] flex items-center justify-between py-2.5 px-3 mb-2 rounded-lg bg-[#1C2024] border border-[#353B42]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-[#24292E] border border-[#353B42] flex items-center justify-center text-[#B0B5B9]">
                <Bot className="w-4 h-4 text-[#73B894]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium text-[#F2F0E8]">
                    Bot ({currentDiff?.label || "Pemula"})
                  </span>
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      engineStatus === "error"
                        ? "bg-[#E17C78]"
                        : botThinking
                        ? "bg-[#E3B66F] animate-pulse"
                        : "bg-[#73B894]"
                    }`}
                  />
                </div>
                <span className="text-[11px] text-[#8A9299]">
                  {botThinking
                    ? "Bot sedang berpikir..."
                    : !isPlayerTurn && gameStatus === "ongoing"
                    ? "Giliran bot melangkah"
                    : "Menunggu giliran"}
                </span>
              </div>
            </div>

            {config.timeControl !== "unlimited" && (
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded border font-mono text-xs tabular-nums ${
                  !isPlayerTurn && gameStatus === "ongoing"
                    ? "bg-[#C7A66A]/20 border-[#C7A66A] text-[#F2F0E8]"
                    : "bg-[#141619] border-[#353B42] text-[#8A9299]"
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-[#8A9299]" />
                <span>
                  {formatClock(isPlayerWhite ? blackClockMs : whiteClockMs)}
                </span>
              </div>
            )}
          </div>

          {/* Interactive Chessboard */}
          <InteractiveChessboard
            chess={chess}
            orientation={config.playerColor}
            selectedSquare={selectedSquare}
            legalDestinations={legalDestinations}
            lastMove={lastMove}
            isCheck={isCheck}
            disabled={gameStatus !== "ongoing" && gameStatus !== "not_started"}
            pendingPromotion={pendingPromotion}
            onSquareClick={handleSquareClick}
            onConfirmPromotion={confirmPromotion}
            onCancelPromotion={cancelPromotion}
            highlightedSquare={effectiveHighlightedSquare}
          />

          {/* Player Info Bar */}
          <div className="w-full max-w-[640px] lg:max-w-[660px] flex items-center justify-between py-2.5 px-3 mt-2 rounded-lg bg-[#1C2024] border border-[#353B42]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-[#24292E] border border-[#353B42] flex items-center justify-center text-[#B0B5B9]">
                <User className="w-4 h-4 text-[#C7A66A]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium text-[#F2F0E8]">
                    Anda ({isPlayerWhite ? "Bidak Putih" : "Bidak Hitam"})
                  </span>
                  {config.isPracticeMode && (
                    <Badge variant="muted" size="sm">
                      Mode Latihan
                    </Badge>
                  )}
                </div>
                <span className="text-[11px] text-[#C7A66A]">
                  {gameStatus !== "ongoing" && gameStatus !== "not_started"
                    ? "Permainan Selesai"
                    : isPlayerTurn
                    ? "Giliran Anda melangkah"
                    : "Menunggu langkah bot..."}
                </span>
              </div>
            </div>

            {config.timeControl !== "unlimited" && (
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded border font-mono text-xs tabular-nums ${
                  isPlayerTurn && gameStatus === "ongoing"
                    ? "bg-[#C7A66A]/20 border-[#C7A66A] text-[#F2F0E8]"
                    : "bg-[#141619] border-[#353B42] text-[#8A9299]"
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-[#8A9299]" />
                <span>
                  {formatClock(isPlayerWhite ? whiteClockMs : blackClockMs)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Side Panel: Controls & Move History */}
        <div className="lg:col-span-4 space-y-4 w-full">
          {/* Game Over Banner */}
          {gameStatus !== "ongoing" && gameStatus !== "not_started" && (
            <Card
              variant="raised"
              className={`space-y-3 border-2 ${
                gameResult === (isPlayerWhite ? "white_win" : "black_win")
                  ? "border-[#73B894] bg-[#73B894]/10"
                  : gameResult === "draw"
                  ? "border-[#E3B66F] bg-[#E3B66F]/10"
                  : "border-[#E17C78] bg-[#E17C78]/10"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-[#C7A66A]" />
                  <h2 className="text-sm font-semibold text-[#F2F0E8]">
                    {gameResult === (isPlayerWhite ? "white_win" : "black_win")
                      ? "Kemenangan Untuk Anda!"
                      : gameResult === "draw"
                      ? "Pertandingan Remis"
                      : "Bot Memenangkan Pertandingan"}
                  </h2>
                </div>
                <Badge
                  variant={
                    gameResult === (isPlayerWhite ? "white_win" : "black_win")
                      ? "success"
                      : gameResult === "draw"
                      ? "warning"
                      : "danger"
                  }
                  size="sm"
                >
                  {terminationReason}
                </Badge>
              </div>

              <p className="text-xs text-[#B0B5B9] leading-relaxed">
                Pertandingan ini telah otomatis disimpan ke dalam arsip lokal Anda ({history.length} langkah).
              </p>

              <div className="flex items-center gap-2 pt-1">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={resetGame}
                  className="flex-1"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1" />
                  Main Lagi
                </Button>
                <Link href="/archive" className="flex-1">
                  <Button variant="secondary" size="sm" className="w-full">
                    <Archive className="w-3.5 h-3.5 mr-1 text-[#C7A66A]" />
                    Buka Arsip
                  </Button>
                </Link>
              </div>
            </Card>
          )}

          {/* 1. Bantalan Blunder (Peringatan Bahaya Fatal Non-Modal di Panel Samping) */}
          <BlunderInterceptModal
            isOpen={Boolean(pendingBlunder)}
            report={pendingBlunder ? pendingBlunder.report : null}
            onReconsider={() => {
              cancelBlunderMove();
              setHighlightedSquare(null);
            }}
            onProceedAnyway={() => {
              proceedBlunderMove();
              setHighlightedSquare(null);
            }}
          />

          {/* 2. Petunjuk Sokrates Bertingkat (Non-Modal di Panel Samping) */}
          <SocraticHintModal
            isOpen={Boolean(currentHint)}
            hint={currentHint}
            onClose={() => {
              clearHint();
              setHighlightedSquare(null);
            }}
            onHighlightSquare={setHighlightedSquare}
          />

          {/* 3. Bimbingan Guru Catur AI (Penjelasan Langkah Suara Non-Modal di Panel Samping) */}
          <PlayTutorModal
            isOpen={tutorModalOpen}
            onClose={() => {
              setTutorModalOpen(false);
              setHighlightedSquare(null);
            }}
            requestContext={tutorRequestContext}
            onHighlightMove={(uci) => {
              const targetSq = uci.slice(2, 4);
              setHighlightedSquare(targetSq);
            }}
          />

          {/* 4. AI Co-Pilot Companion Card (Ditampilkan saat tidak ada sesi bimbingan khusus di atas) */}
          {!pendingBlunder && !currentHint && !tutorModalOpen && (
            <Card variant="surface" className="p-3.5 sm:p-4 space-y-3 border-[#C7A66A]/40 bg-gradient-to-b from-[#1C2024] to-[#141619] shadow-lg">
              {/* Header with Co-Pilot Persona */}
              <div className="flex items-center justify-between pb-2.5 border-b border-[#353B42]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#C7A66A]/20 border border-[#C7A66A]/60 flex items-center justify-center text-[#C7A66A]">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-[#F2F0E8] flex items-center gap-1.5">
                      <span>Guru Catur AI Co-Pilot</span>
                      <span className="w-2 h-2 rounded-full bg-[#73B894] animate-pulse" />
                    </h2>
                    <span className="text-[10px] text-[#C7A66A]">Pendamping Aktif Ramah Pemula</span>
                  </div>
                </div>

                {/* Co-Pilot Toggle Switch */}
                <button
                  type="button"
                  onClick={() =>
                    setCoPilotPreferences({
                      blunderSafetyNet: !coPilotPreferences.blunderSafetyNet,
                    })
                  }
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${
                    coPilotPreferences.blunderSafetyNet
                      ? "bg-[#73B894]/20 border-[#73B894]/60 text-[#73B894]"
                      : "bg-[#24292E] border-[#353B42] text-[#8A9299]"
                  }`}
                  title="Nyalakan/matikan perlindungan Bantalan Blunder"
                >
                  <ShieldAlert className="w-3 h-3" />
                  <span>{coPilotPreferences.blunderSafetyNet ? "Proteksi Aktif" : "Proteksi Mati"}</span>
                </button>
              </div>

              {/* Live Companion Advice Bubble */}
              <div className="p-2.5 rounded-xl bg-[#24292E]/80 border border-[#353B42] text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-medium text-[#C7A66A] text-[11px]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Saran Pendamping:</span>
                </div>
                <p className="text-[#B0B5B9] text-xs leading-relaxed">
                  {history.length === 0
                    ? "Selamat datang! Saya mendampingi setiap langkahmu. Jika bingung memilih langkah awal, tekan tombol Petunjuk Sokrates di bawah."
                    : botThinking
                    ? "Bot sedang berpikir... Perhatikan susunan bidakmu sementara menunggu."
                    : isPlayerTurn
                    ? "Giliranmu melangkah. Bantalan Blunder aktif melindungimu dari perwira gantung dan skakmat tak terduga."
                    : "Menunggu langkah bot..."}
                </p>
              </div>

              {/* Guided Undo Message Banner (if player just undid a move) */}
              {undoFeedback && (
                <div className="p-2.5 rounded-xl bg-[#C7A66A]/15 border border-[#C7A66A]/50 text-xs text-[#F2F0E8] flex items-start gap-2 animate-in fade-in">
                  <RotateCcw className="w-4 h-4 text-[#C7A66A] shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="font-semibold text-[11px] text-[#C7A66A] block">Langkah Telah Dibatalkan</span>
                    <p className="leading-relaxed text-[11px] text-[#F2F0E8] mt-0.5">{undoFeedback}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUndoFeedback(null)}
                    className="text-[#8A9299] hover:text-[#F2F0E8] text-xs cursor-pointer px-1"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Primary Action: Socratic Hint Button (ACTIVE IMMEDIATELY on player turn!) */}
              <Button
                variant="primary"
                size="sm"
                onClick={requestSocraticHint}
                disabled={chess.isGameOver() || botThinking || hintLoading || !isPlayerTurn}
                className="w-full py-2.5 bg-gradient-to-r from-[#C7A66A] to-[#D8BB83] text-[#141619] hover:brightness-110 font-bold text-xs shadow-md transition-all justify-center cursor-pointer disabled:opacity-50"
                title="Minta bimbingan berpikir bertahap langkah demi langkah"
              >
                <Lightbulb className="w-4 h-4 mr-1.5" />
                {hintLoading
                  ? "Menganalisis Posisi Papan..."
                  : "Minta Petunjuk Guru AI (Sokrates)"}
              </Button>

              {/* Secondary Controls: Undo, Mulai Ulang, Menyerah, Jelaskan Langkah */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={undoMove}
                  disabled={
                    !config.isPracticeMode ||
                    history.length === 0 ||
                    botThinking ||
                    chess.isGameOver()
                  }
                  className="justify-center text-xs"
                  title="Batalkan langkah terakhir dan dapatkan tips mentor"
                >
                  <Undo2 className="w-3.5 h-3.5 mr-1 text-[#C7A66A]" />
                  Undo
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={resetGame}
                  disabled={history.length === 0 && gameStatus === "not_started"}
                  className="justify-center text-xs"
                  title="Mulai ulang pertandingan"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1 text-[#8A9299]" />
                  Mulai Ulang
                </Button>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={resignGame}
                  disabled={history.length === 0 || chess.isGameOver()}
                  className="justify-center text-xs"
                  title="Menyerah pada pertandingan ini"
                >
                  <Flag className="w-3.5 h-3.5 mr-1" />
                  Menyerah
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleOpenTutor}
                  disabled={history.length === 0}
                  className="justify-center text-xs border-[#C7A66A]/40 text-[#C7A66A] hover:bg-[#C7A66A]/10"
                  title="Dengarkan penjelasan suara mendalam mengenai langkah terakhir"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1 text-[#C7A66A]" />
                  Jelaskan Langkah (Suara)
                </Button>
              </div>
            </Card>
          )}

          {/* Move History Table */}
          <Card variant="surface" className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#353B42]">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#B0B5B9]">
                Catatan Langkah (SAN)
              </h2>
              <span className="text-[11px] text-[#8A9299]">
                {history.length} langkah
              </span>
            </div>

            <div
              ref={moveListContainerRef}
              className="h-52 overflow-y-auto space-y-1 pr-1 font-mono text-xs"
            >
              {movePairs.length > 0 ? (
                movePairs.map((pair) => (
                  <div
                    key={pair.number}
                    className="grid grid-cols-12 gap-1 py-1 px-1.5 rounded hover:bg-[#24292E] text-[#F2F0E8] transition-colors"
                  >
                    <span className="col-span-2 text-[#8A9299]">
                      {pair.number}.
                    </span>
                    <span className="col-span-5 text-[#C7A66A] font-medium">
                      {pair.white}
                    </span>
                    <span className="col-span-5 text-[#B0B5B9]">
                      {pair.black || ""}
                    </span>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-[#8A9299] text-xs space-y-1">
                  <span>♟</span>
                  <p>Belum ada langkah yang dibuat.</p>
                  <p className="text-[11px]">
                    Klik bidak untuk melihat langkah legal.
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Verification Badge */}
          <div className="p-3.5 rounded-xl bg-[#1C2024] border border-[#353B42] text-xs text-[#8A9299] space-y-1">
            <div className="flex items-center gap-1.5 text-[#73B894] font-medium">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Validasi Catur Standar Aktif</span>
            </div>
            <p className="text-[11px] text-[#8A9299] leading-relaxed">
              Aturan diuji dengan <code className="text-[#F2F0E8]">chess.js</code>. Bot ditenagai engine Stockfish 19 Web Worker tanpa memblokir thread antarmuka.
            </p>
          </div>
        </div>
      </div>

      {/* Game Configuration Modal */}
      <Modal
        isOpen={configModalOpen}
        onClose={() => setConfigModalOpen(false)}
        title="Pengaturan Pertandingan Baru"
        description="Atur warna bidak, tingkat kecerdasan bot, kontrol jam, dan mode latihan."
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
                onClick={() => setSelectedColor("white")}
                className={`py-2 px-3 rounded-lg text-xs font-medium border transition-colors ${
                  selectedColor === "white"
                    ? "bg-[#24292E] border-[#C7A66A] text-[#F2F0E8]"
                    : "border-[#353B42] text-[#8A9299] hover:bg-[#24292E]"
                }`}
              >
                Putih (Melangkah Pertama)
              </button>
              <button
                type="button"
                onClick={() => setSelectedColor("black")}
                className={`py-2 px-3 rounded-lg text-xs font-medium border transition-colors ${
                  selectedColor === "black"
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
              Tingkat Kemampuan Bot
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {difficulties.map((diff) => (
                <button
                  key={diff.id}
                  type="button"
                  onClick={() => setSelectedDifficulty(diff.id)}
                  className={`p-2.5 rounded-lg text-left border transition-all ${
                    selectedDifficulty === diff.id
                      ? "bg-[#24292E] border-[#C7A66A] ring-1 ring-[#C7A66A]"
                      : "border-[#353B42] hover:bg-[#24292E] hover:border-[#8A9299]"
                  }`}
                >
                  <div className="font-medium text-xs text-[#F2F0E8]">{diff.label}</div>
                  <div className="text-[10px] text-[#8A9299] mt-0.5 leading-snug line-clamp-2">
                    {diff.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Time Control */}
          <div>
            <label className="text-xs font-medium text-[#B0B5B9] block mb-1.5">
              Kontrol Jam Catur
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {(
                [
                  { id: "unlimited", label: "Tanpa Jam" },
                  { id: "3m", label: "3 Menit" },
                  { id: "5m", label: "5 Menit" },
                  { id: "10m", label: "10 Menit" },
                ] as const
              ).map((tc) => (
                <button
                  key={tc.id}
                  type="button"
                  onClick={() => setSelectedTimeControl(tc.id)}
                  className={`py-1.5 px-2 rounded-md text-xs font-medium border transition-colors ${
                    selectedTimeControl === tc.id
                      ? "bg-[#24292E] border-[#C7A66A] text-[#F2F0E8]"
                      : "border-[#353B42] text-[#8A9299] hover:bg-[#24292E]"
                  }`}
                >
                  {tc.label}
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
                Boleh membatalkan langkah saat bermain santai
              </span>
            </div>
            <input
              type="checkbox"
              checked={isPracticeMode}
              onChange={(e) => setIsPracticeMode(e.target.checked)}
              className="accent-[#C7A66A] w-4 h-4 cursor-pointer"
            />
          </div>

          {/* Modal Buttons */}
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
              onClick={() => {
                setConfigModalOpen(false);
                startNewGame({
                  playerColor: selectedColor,
                  botDifficulty: selectedDifficulty,
                  timeControl: selectedTimeControl,
                  isPracticeMode: isPracticeMode,
                });
              }}
            >
              <Play className="w-3.5 h-3.5 mr-1" />
              Mulai Permainan Baru
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
