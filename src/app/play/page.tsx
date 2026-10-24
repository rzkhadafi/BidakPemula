"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
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
import {
  findGameTurningPoint,
  TurningPointCard,
  getPendingTurningPointReplay,
  clearPendingTurningPointReplay,
} from "@/features/autopsy";
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
    isSocraticActive,
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
    playFromPosition,
  } = useChessGame({
    playerColor: selectedColor,
    botDifficulty: selectedDifficulty,
    timeControl: selectedTimeControl,
    isPracticeMode: isPracticeMode,
  });

  // Preload authentic chess audio for zero-latency playback
  useEffect(() => {
    chessAudio.preloadSounds();
  }, []);

  // Consume any pending replay from turning point (e.g. redirected from archive)
  useEffect(() => {
    const pending = getPendingTurningPointReplay();
    if (pending) {
      clearPendingTurningPointReplay();
      playFromPosition(
        pending.fen,
        pending.history,
        pending.playerColor
      );
    }
  }, [playFromPosition]);

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
  const isPlayerVictory = gameResult === (isPlayerWhite ? "white_win" : "black_win");

  // Hitung Titik Balik (Turning Point) pertandingan saat permainan berakhir
  const turningPoint = useMemo(() => {
    if (gameStatus === "ongoing" || gameStatus === "not_started" || history.length === 0) {
      return null;
    }
    return findGameTurningPoint(
      history,
      config.playerColor,
      undefined,
      isPlayerVictory
    );
  }, [config.playerColor, gameStatus, history, isPlayerVictory]);

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

  // Pill Bot tipis berseberangan dengan Kacamata Catur di bilah atas papan
  const botPill = (
    <div
      className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs font-medium border bg-[#1C2024] border-[#353B42] text-[#F2F0E8] shadow-xs select-none"
      title={
        botThinking
          ? "Bot sedang berpikir..."
          : !isPlayerTurn && gameStatus === "ongoing"
          ? "Giliran bot melangkah"
          : "Menunggu giliran"
      }
    >
      <div className="flex items-center gap-1.5">
        <Bot className="w-3.5 h-3.5 text-[#73B894]" />
        <span className="font-semibold text-xs text-[#F2F0E8]">
          Bot ({currentDiff?.label || "Santai"})
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

      <div className="flex items-center gap-1.5 pl-2 border-l border-[#353B42] font-mono text-xs tabular-nums text-[#C7A66A]">
        <Clock className={`w-3.5 h-3.5 ${!isPlayerTurn && gameStatus === "ongoing" ? "text-[#C7A66A] animate-pulse" : "text-[#8A9299]"}`} />
        <span className="font-semibold">
          {config.timeControl === "unlimited"
            ? "∞"
            : formatClock(isPlayerWhite ? blackClockMs : whiteClockMs)}
        </span>
      </div>
    </div>
  );

  // Player Bar yang kompak dan selalu tampil persis di bawah papan
  const playerBar = (
    <div className="w-full flex items-center justify-between py-1.5 px-3 rounded-lg bg-[#1C2024] border border-[#353B42] shadow-xs select-none">
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-6 h-6 rounded-md bg-[#24292E] border border-[#353B42] flex items-center justify-center text-[#C7A66A] shrink-0">
          <User className="w-3.5 h-3.5 text-[#C7A66A]" />
        </div>
        <div className="flex items-center gap-1.5 truncate">
          <span className="text-xs font-semibold text-[#F2F0E8] truncate">
            Anda ({isPlayerWhite ? "Bidak Putih" : "Bidak Hitam"})
          </span>
          {config.isPracticeMode && (
            <Badge variant="muted" size="sm" className="hidden sm:inline-flex text-[10px] py-0 px-1.5">
              Latihan
            </Badge>
          )}
        </div>
        <span className="text-[11px] text-[#C7A66A] hidden sm:inline ml-1 truncate">
          {gameStatus !== "ongoing" && gameStatus !== "not_started"
            ? "• Permainan Selesai"
            : isPlayerTurn
            ? "• Giliran Anda"
            : "• Menunggu bot..."}
        </span>
      </div>

      {/* Jam Pemain: Jelas, Menonjol & Kontras Tinggi */}
      <div
        className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border font-mono text-xs tabular-nums shrink-0 transition-colors ${
          isPlayerTurn && gameStatus === "ongoing"
            ? "bg-[#C7A66A]/20 border-[#C7A66A] text-[#F2F0E8] font-bold shadow-xs"
            : "bg-[#141619] border-[#353B42] text-[#B0B5B9]"
        }`}
      >
        <Clock className={`w-3.5 h-3.5 ${isPlayerTurn && gameStatus === "ongoing" ? "text-[#C7A66A] animate-pulse" : "text-[#8A9299]"}`} />
        <span className="font-semibold text-xs sm:text-sm">
          {config.timeControl === "unlimited"
            ? "∞"
            : formatClock(isPlayerWhite ? whiteClockMs : blackClockMs)}
        </span>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col w-full -my-2 sm:-my-4">
      {/* Header: Ramping & Hemat Ruang Vertikal */}
      <div className="flex items-center justify-between gap-3 pb-2 mb-2 sm:mb-2.5 border-b border-[#353B42] shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <h1 className="text-base sm:text-lg font-semibold text-[#F2F0E8] truncate">
            Main Catur vs Bot
          </h1>
          <Badge variant="accent" size="sm" className="hidden sm:inline-flex">
            Stockfish 19
          </Badge>
          <span className="text-xs text-[#8A9299] hidden md:inline truncate">
            • Latihan mandiri lokal
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={toggleSound}
            aria-label={soundOn ? "Matikan Efek Suara" : "Nyalakan Efek Suara"}
            title={soundOn ? "Suara Aktif (Klik untuk Mematikan)" : "Suara Nonaktif (Klik untuk Menyalakan)"}
            className="h-8 px-2 sm:px-2.5 text-xs"
          >
            {soundOn ? (
              <Volume2 className="w-3.5 h-3.5 text-[#73B894]" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-[#8A9299]" />
            )}
            <span className="hidden sm:inline ml-1">{soundOn ? "Suara" : "Mute"}</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setConfigModalOpen(true)}
            aria-label="Atur Parameter Pertandingan"
            className="h-8 px-2 sm:px-2.5 text-xs"
          >
            <Settings2 className="w-3.5 h-3.5 mr-1 text-[#C7A66A]" />
            <span>Pengaturan Game</span>
          </Button>
        </div>
      </div>

      {/* Main Playing Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start flex-1 min-h-0">
        {/* Chessboard Column (Pusat perhatian catur, diam di tempat, muat 100% bersama kedua jam catur) */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col items-center justify-start shrink-0">
          {/* Interactive Chessboard dengan Pill Bot tipis di bilah atas & Bar Jam Pemain di bilah bawah */}
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
            topRightSlot={botPill}
            bottomSlot={playerBar}
          />
        </div>

        {/* Side Panel: Controls & Move History (Independently scrollable, papan catur tetap diam) */}
        <div className="lg:col-span-5 xl:col-span-4 w-full flex flex-col lg:max-h-[calc(100dvh-125px)] lg:overflow-y-auto pr-1 space-y-3.5 pt-0">
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

          {/* Kartu Titik Balik Kesalahan / Kemenangan (Play from Turning Point) */}
          {gameStatus !== "ongoing" && gameStatus !== "not_started" && turningPoint && (
            <TurningPointCard
              turningPoint={turningPoint}
              onPlayFromHere={() => {
                playFromPosition(
                  turningPoint.fenBefore,
                  turningPoint.historyBefore,
                  config.playerColor
                );
              }}
            />
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

          {/* 2. Petunjuk Sokrates Bertingkat (Real-Time Companion di Panel Samping) */}
          <SocraticHintModal
            isOpen={isSocraticActive || Boolean(currentHint)}
            hint={currentHint}
            isBotThinking={botThinking}
            isLoadingNewHint={hintLoading}
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
          {!pendingBlunder && !isSocraticActive && !currentHint && !tutorModalOpen && (
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
