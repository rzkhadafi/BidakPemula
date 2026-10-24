"use client";

import React, { useState, useEffect, useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Chess } from "chess.js";
import {
  ChevronLeft,
  ChevronRight,
  SkipBack,
  SkipForward,
  Copy,
  Check,
  Archive,
} from "lucide-react";
import { InteractiveChessboard } from "@/components/chessboard/InteractiveChessboard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  findGameTurningPoint,
  TurningPointCard,
  saveTurningPointReplay,
} from "@/features/autopsy";
import {
  getArchivedGames,
  getArchivedGamesServerSnapshot,
  subscribeToArchivedGames,
} from "@/lib/storage/game-archive";

export default function GameDetailPage() {
  const router = useRouter();
  const params = useParams();
  const gameId = typeof params?.gameId === "string" ? params.gameId : "";

  const games = useSyncExternalStore(
    subscribeToArchivedGames,
    getArchivedGames,
    getArchivedGamesServerSnapshot
  );

  const game = useMemo(() => {
    if (!gameId) return null;
    return games.find((g) => g.id === gameId) || null;
  }, [games, gameId]);

  const [selectedPly, setSelectedPly] = useState<number | null>(null);
  const [copiedPgn, setCopiedPgn] = useState(false);

  const isVictory = game
    ? game.result === (game.playerColor === "white" ? "white_win" : "black_win")
    : false;

  const turningPoint = useMemo(() => {
    if (!game || game.moves.length === 0) return null;
    return findGameTurningPoint(
      game.moves,
      game.playerColor,
      game.initialFen || undefined,
      isVictory
    );
  }, [game, isVictory]);

  const handlePlayFromTurningPoint = () => {
    if (!turningPoint || !game) return;
    saveTurningPointReplay({
      fen: turningPoint.fenBefore,
      plyIndex: turningPoint.plyIndex,
      moveNumber: turningPoint.moveNumber,
      history: turningPoint.historyBefore,
      playerColor: turningPoint.playerColor,
      sourceGameId: game.id,
      createdAt: Date.now(),
    });
    router.push("/play");
  };

  // If user hasn't explicitly navigated ply, default to final position
  const currentPly =
    selectedPly !== null
      ? selectedPly
      : game
      ? game.moves.length
      : 0;

  // Pre-calculate FENs for all plies using chess.js
  const fensPerPly = useMemo(() => {
    if (!game) return [];
    try {
      const c = new Chess(game.initialFen || undefined);
      const list = [c.fen()];
      for (const m of game.moves) {
        c.move({
          from: m.from,
          to: m.to,
          promotion: m.promotion as "q" | "r" | "b" | "n" | undefined,
        });
        list.push(c.fen());
      }
      return list;
    } catch (err) {
      console.error("Error computing replay FENs:", err);
      return [game.finalFen];
    }
  }, [game]);

  // Current chess instance for the displayed ply
  const currentChess = useMemo(() => {
    const fen = fensPerPly[currentPly] || game?.finalFen || new Chess().fen();
    try {
      return new Chess(fen);
    } catch {
      return new Chess();
    }
  }, [currentPly, fensPerPly, game?.finalFen]);

  const activeMove = currentPly > 0 && game ? game.moves[currentPly - 1] : null;

  const handleCopyPgn = () => {
    if (game?.pgn) {
      navigator.clipboard.writeText(game.pgn);
      setCopiedPgn(true);
      setTimeout(() => setCopiedPgn(false), 2000);
    }
  };

  // Keyboard navigation for replay
  useEffect(() => {
    if (!game) return;
    const maxMoves = game.moves.length;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setSelectedPly((prev) => {
          const base = prev !== null ? prev : maxMoves;
          return Math.max(0, base - 1);
        });
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setSelectedPly((prev) => {
          const base = prev !== null ? prev : maxMoves;
          return Math.min(maxMoves, base + 1);
        });
      } else if (e.key === "Home") {
        e.preventDefault();
        setSelectedPly(0);
      } else if (e.key === "End") {
        e.preventDefault();
        setSelectedPly(maxMoves);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [game]);

  if (!game) {
    return (
      <div className="space-y-6 max-w-lg mx-auto py-12 text-center">
        <Card variant="surface" className="p-8 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-[#24292E] border border-[#353B42] mx-auto flex items-center justify-center text-[#8A9299]">
            <Archive className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-[#F2F0E8]">
              Pertandingan Tidak Ditemukan
            </h1>
            <p className="text-xs text-[#8A9299] mt-1">
              Data pertandingan dengan ID ini tidak tersedia di penyimpanan peramban lokal Anda.
            </p>
          </div>
          <Link href="/archive" className="inline-block pt-2">
            <Button variant="primary" size="sm">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Kembali ke Daftar Arsip
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Group moves into pairs (White move, Black move)
  const movePairs: Array<{
    number: number;
    white?: { san: string; ply: number };
    black?: { san: string; ply: number };
  }> = [];

  for (let i = 0; i < game.moves.length; i += 2) {
    movePairs.push({
      number: Math.floor(i / 2) + 1,
      white: game.moves[i] ? { san: game.moves[i].san, ply: i + 1 } : undefined,
      black: game.moves[i + 1] ? { san: game.moves[i + 1].san, ply: i + 2 } : undefined,
    });
  }

  const isWin =
    (game.playerColor === "white" && game.result === "white_win") ||
    (game.playerColor === "black" && game.result === "black_win");
  const isDraw = game.result === "draw";

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
          <Badge variant={isWin ? "success" : isDraw ? "warning" : "danger"}>
            {isWin ? "Kemenangan Anda" : isDraw ? "Remis" : "Kekalahan"} •{" "}
            {game.termination}
          </Badge>
          <Badge variant="muted">ID: {game.id.slice(0, 14)}...</Badge>
        </div>
      </div>

      {/* Replay Screen Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Replay Chessboard */}
        <div className="lg:col-span-8 flex flex-col items-center space-y-3">
          <InteractiveChessboard
            chess={currentChess}
            orientation={game.playerColor}
            selectedSquare={null}
            legalDestinations={[]}
            lastMove={activeMove ? { from: activeMove.from, to: activeMove.to } : null}
            isCheck={currentChess.inCheck()}
            disabled={true}
            pendingPromotion={null}
            onSquareClick={() => {}}
            onConfirmPromotion={() => {}}
            onCancelPromotion={() => {}}
          />

          {/* Replay Playback Navigation Controls */}
          <div className="w-full max-w-[560px] flex items-center justify-between p-2.5 rounded-lg bg-[#1C2024] border border-[#353B42]">
            <div className="flex items-center gap-1.5">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedPly(0)}
                disabled={currentPly === 0}
                title="Awal pertandingan (Home)"
                aria-label="Posisi Awal"
              >
                <SkipBack className="w-4 h-4" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedPly(Math.max(0, currentPly - 1))}
                disabled={currentPly === 0}
                title="Langkah sebelumnya (Panah Kiri)"
                aria-label="Langkah Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </div>

            <div className="text-center font-mono text-xs text-[#F2F0E8] tabular-nums">
              <span>Langkah {currentPly}</span>
              <span className="text-[#8A9299]"> / {game.moves.length}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedPly(Math.min(game.moves.length, currentPly + 1))}
                disabled={currentPly >= game.moves.length}
                title="Langkah berikutnya (Panah Kanan)"
                aria-label="Langkah Berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedPly(game.moves.length)}
                disabled={currentPly >= game.moves.length}
                title="Akhir pertandingan (End)"
                aria-label="Posisi Akhir"
              >
                <SkipForward className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column: Move Table & Match Metadata */}
        <div className="lg:col-span-4 space-y-4 w-full">
          {/* Kartu Titik Balik Kesalahan / Kemenangan (Play from Turning Point) */}
          {turningPoint && (
            <TurningPointCard
              turningPoint={turningPoint}
              onPlayFromHere={handlePlayFromTurningPoint}
              onInspectPly={(ply) => setSelectedPly(ply)}
              isArchiveView={true}
            />
          )}

          {/* Game Info Card */}
          <Card variant="surface" className="space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-[#353B42]">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#B0B5B9]">
                Ringkasan Pertandingan
              </h2>
              {game.pgn && (
                <button
                  type="button"
                  onClick={handleCopyPgn}
                  className="flex items-center gap-1 text-[11px] text-[#C7A66A] hover:underline"
                >
                  {copiedPgn ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#73B894]" />
                      <span>Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin PGN</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="space-y-1.5 text-xs text-[#B0B5B9]">
              <div className="flex items-center justify-between">
                <span className="text-[#8A9299]">Pemain Anda:</span>
                <span className="text-[#F2F0E8] font-medium capitalize">
                  {game.playerColor === "white" ? "Putih" : "Hitam"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8A9299]">Lawan:</span>
                <span className="text-[#F2F0E8]">Bot ({game.botLevel})</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8A9299]">Kontrol Jam:</span>
                <span>{game.timeControlLabel}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8A9299]">Tanggal:</span>
                <span>
                  {new Date(game.createdAt).toLocaleDateString("id-ID", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8A9299]">Total Langkah:</span>
                <span>{game.moves.length} ply</span>
              </div>
            </div>
          </Card>

          {/* Move History Table */}
          <Card variant="surface" className="space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-[#353B42]">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#B0B5B9]">
                Daftar Langkah
              </h3>
              <span className="text-[11px] text-[#8A9299]">
                Klik langkah untuk melompat
              </span>
            </div>

            <div className="max-h-56 overflow-y-auto space-y-1 pr-1 font-mono text-xs">
              {movePairs.map((pair) => {
                const isWhiteActive = pair.white && pair.white.ply === currentPly;
                const isBlackActive = pair.black && pair.black.ply === currentPly;

                return (
                  <div
                    key={pair.number}
                    className="grid grid-cols-12 gap-1 py-1 px-1.5 rounded hover:bg-[#24292E] text-[#F2F0E8] transition-colors"
                  >
                    <span className="col-span-2 text-[#8A9299]">
                      {pair.number}.
                    </span>

                    {pair.white ? (
                      <button
                        type="button"
                        onClick={() => setSelectedPly(pair.white!.ply)}
                        className={`col-span-5 text-left px-1 rounded transition-colors ${
                          isWhiteActive
                            ? "bg-[#C7A66A] text-[#141619] font-bold"
                            : "text-[#C7A66A] hover:bg-[#2C3238]"
                        }`}
                      >
                        {pair.white.san}
                      </button>
                    ) : (
                      <span className="col-span-5" />
                    )}

                    {pair.black ? (
                      <button
                        type="button"
                        onClick={() => setSelectedPly(pair.black!.ply)}
                        className={`col-span-5 text-left px-1 rounded transition-colors ${
                          isBlackActive
                            ? "bg-[#C7A66A] text-[#141619] font-bold"
                            : "text-[#B0B5B9] hover:bg-[#2C3238]"
                        }`}
                      >
                        {pair.black.san}
                      </button>
                    ) : (
                      <span className="col-span-5" />
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Autopsy & Variation Notice */}
          <div className="p-3.5 rounded-xl bg-[#1C2024] border border-[#353B42] text-xs text-[#8A9299] space-y-1">
            <span className="font-medium text-[#C7A66A] block">
              Fitur Analisis Lanjutan
            </span>
            <p>
              Bedah variasi cabang (Echo Room) dan penentuan titik balik kesalahan langkah (Match Autopsy) dijadwalkan pada <strong>Fase 4</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
