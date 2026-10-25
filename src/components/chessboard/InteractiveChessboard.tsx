"use client";

import React, { useState, useMemo, useCallback, useSyncExternalStore } from "react";
import { Chess, Square } from "chess.js";
import { Glasses, AlertTriangle, Shield, Target, HelpCircle, Navigation } from "lucide-react";
import { PlayerColor } from "@/types/chess";
import { Modal } from "@/components/ui/Modal";
import { ChessPiece } from "./ChessPieces";
import { RadarArrowsOverlay } from "./RadarArrowsOverlay";
import {
  computeBoardThreats,
  computePieceScope,
  SquareThreatReport,
  getVisionGlassesSetting,
  setVisionGlassesSetting,
  subscribeVisionGlasses,
} from "@/features/chessboard/square-threats";
import {
  getRadarArrowsSetting,
  setRadarArrowsSetting,
  subscribeRadarArrows,
  computeRadarArrows,
} from "@/features/chessboard/radar-arrows";

interface InteractiveChessboardProps {
  chess: Chess;
  orientation?: PlayerColor;
  selectedSquare: string | null;
  legalDestinations: string[];
  lastMove: { from: string; to: string } | null;
  isCheck: boolean;
  disabled?: boolean;
  pendingPromotion: { from: string; to: string } | null;
  onSquareClick: (square: string) => void;
  onConfirmPromotion: (piece: "q" | "r" | "b" | "n") => void;
  onCancelPromotion: () => void;
  /** Tampilkan tombol toggle Kacamata Catur di atas papan (default true) */
  showVisionToggle?: boolean;
  /** Pengaturan awal Kacamata Catur aktif/tidak jika belum ada di localStorage */
  defaultVisionEnabled?: boolean;
  /** Tampilkan tombol toggle Mode Garis Radar Panah Bidak di atas papan (default true) */
  showRadarToggle?: boolean;
  /** Pengaturan awal Radar Panah Bidak aktif/tidak jika belum ada di localStorage */
  defaultRadarEnabled?: boolean;
  /** Petak yang disorot oleh petunjuk Sokrates (misal perwira kunci) */
  highlightedSquare?: string | null;
  /** Slot di sisi kanan atas (berseberangan dengan tombol Kacamata Catur, misal pill bot & jam) */
  topRightSlot?: React.ReactNode;
  /** Slot di bagian bawah papan catur (misal bilah informasi pemain & jam catur) */
  bottomSlot?: React.ReactNode;
  /** Kelas CSS tambahan untuk kontainer pembungkus papan catur */
  className?: string;
}

export const InteractiveChessboard: React.FC<InteractiveChessboardProps> = ({
  chess,
  orientation = "white",
  selectedSquare,
  legalDestinations,
  lastMove,
  isCheck,
  disabled = false,
  pendingPromotion,
  onSquareClick,
  onConfirmPromotion,
  onCancelPromotion,
  showVisionToggle = true,
  defaultVisionEnabled = false,
  showRadarToggle = true,
  defaultRadarEnabled = true,
  highlightedSquare = null,
  topRightSlot,
  bottomSlot,
  className = "",
}) => {
  // State Kacamata Catur (Vision Glasses) tersinkronisasi aman SSR & multi-komponen
  const storedVision = useSyncExternalStore(
    subscribeVisionGlasses,
    getVisionGlassesSetting,
    () => defaultVisionEnabled
  );
  const [visionOverride, setVisionOverride] = useState<boolean | null>(null);
  const visionEnabled = visionOverride !== null ? visionOverride : storedVision;

  // State Mode Garis Radar Panah Bidak (Ghost Aim Arrows)
  const storedRadar = useSyncExternalStore(
    subscribeRadarArrows,
    getRadarArrowsSetting,
    () => defaultRadarEnabled
  );
  const [radarOverride, setRadarOverride] = useState<boolean | null>(null);
  const radarArrowsEnabled = radarOverride !== null ? radarOverride : storedRadar;

  const [showLegend, setShowLegend] = useState<boolean>(false);
  const [hoveredSquare, setHoveredSquare] = useState<Square | null>(null);

  const handleToggleVision = useCallback(() => {
    const next = !visionEnabled;
    setVisionGlassesSetting(next);
    setVisionOverride(next);
  }, [visionEnabled]);

  const handleToggleRadarArrows = useCallback(() => {
    const next = !radarArrowsEnabled;
    setRadarArrowsSetting(next);
    setRadarOverride(next);
  }, [radarArrowsEnabled]);

  const playerColorCode = orientation === "white" ? "w" : "b";

  // Hitung peta ancaman & peluang jika Kacamata Catur aktif
  const threats = useMemo(() => {
    if (!visionEnabled) return null;
    return computeBoardThreats(chess, playerColorCode);
  }, [chess, playerColorCode, visionEnabled]);

  // Hitung garis pandang (scope) bidak yang sedang dipilih
  const pieceScope = useMemo(() => {
    if (!visionEnabled || !selectedSquare) return null;
    return computePieceScope(chess, selectedSquare as Square);
  }, [chess, selectedSquare, visionEnabled]);

  // Hitung garis radar panah lintasan & sasaran bidak yang dipilih
  const radarArrows = useMemo(() => {
    if (!radarArrowsEnabled) return [];
    return computeRadarArrows(
      chess,
      selectedSquare as Square | null,
      legalDestinations
    );
  }, [chess, legalDestinations, radarArrowsEnabled, selectedSquare]);

  // Ringkasan bahaya & peluang papan untuk indikator status
  const { urgentHangingCount, opponentOpportunityCount } = useMemo(() => {
    if (!threats) return { urgentHangingCount: 0, opponentOpportunityCount: 0 };
    let hanging = 0;
    let opportunity = 0;
    for (const [, report] of threats) {
      if (report.status === "hanging_friendly" || report.status === "overpowered_friendly") {
        hanging++;
      } else if (report.status === "hanging_opponent" || report.status === "vulnerable_opponent") {
        opportunity++;
      }
    }
    return { urgentHangingCount: hanging, opponentOpportunityCount: opportunity };
  }, [threats]);

  // Petak yang sedang diinspeksi (hover diutamakan, atau petak yang dipilih)
  const inspectedSquare = hoveredSquare || (selectedSquare as Square | null);
  const inspectedReport: SquareThreatReport | undefined =
    threats && inspectedSquare ? threats.get(inspectedSquare) : undefined;

  const files =
    orientation === "white"
      ? ["a", "b", "c", "d", "e", "f", "g", "h"]
      : ["h", "g", "f", "e", "d", "c", "b", "a"];
  const ranks =
    orientation === "white"
      ? [8, 7, 6, 5, 4, 3, 2, 1]
      : [1, 2, 3, 4, 5, 6, 7, 8];

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, square: string) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    const piece = chess.get(square as Square);
    if (!piece || piece.color !== chess.turn()) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData("text/plain", square);
    onSquareClick(square);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetSquare: string) => {
    e.preventDefault();
    if (disabled) return;
    const fromSquare = e.dataTransfer.getData("text/plain");
    if (fromSquare && fromSquare !== targetSquare) {
      // If target square is legal destination, click it
      if (legalDestinations.includes(targetSquare)) {
        onSquareClick(targetSquare);
      }
    }
  };

  return (
    <div
      className={`w-full max-w-[min(100%,480px)] lg:max-w-[min(540px,calc(100dvh-210px))] xl:max-w-[min(600px,calc(100dvh-190px))] mx-auto select-none flex flex-col items-center ${className}`}
    >
      {/* Utility Bar: Kacamata Catur Toggle, Radar Panah & Right Slot (Bot Pill & Jam) */}
      {(showVisionToggle || showRadarToggle || topRightSlot) && (
        <div className="w-full relative flex items-center justify-between gap-1.5 sm:gap-2 mb-1.5 px-0.5 min-h-[32px] shrink-0">
          {/* Left: Button Kacamata Catur & Radar Panah Toggle */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 flex-wrap">
            {showVisionToggle && (
              <>
                <button
                  type="button"
                  onClick={handleToggleVision}
                  className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                    visionEnabled
                      ? "bg-[#C7A66A]/20 border-[#C7A66A] text-[#F2F0E8] shadow-xs"
                      : "bg-[#1C2024] border-[#353B42] text-[#8A9299] hover:text-[#F2F0E8] hover:border-[#8A9299]"
                  }`}
                  title="Nyalakan/matikan Kacamata Catur (melihat bidak terancam & peluang secara visual)"
                  aria-label={`Kacamata Catur ${visionEnabled ? "Aktif" : "Nonaktif"}`}
                  aria-pressed={visionEnabled}
                >
                  <Glasses className={`w-3.5 h-3.5 ${visionEnabled ? "text-[#C7A66A]" : "text-[#8A9299]"}`} />
                  <span className="font-semibold">
                    <span className="hidden sm:inline">Kacamata </span>Catur
                  </span>
                  <span
                    className={`text-[10px] px-1 sm:px-1.5 py-0.2 rounded font-semibold ${
                      visionEnabled ? "bg-[#C7A66A] text-[#141619]" : "bg-[#24292E] text-[#8A9299]"
                    }`}
                  >
                    {visionEnabled ? "ON" : "OFF"}
                  </span>
                </button>

                {visionEnabled && (
                  <button
                    type="button"
                    onClick={() => setShowLegend((prev) => !prev)}
                    className="flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-lg bg-[#1C2024] border border-[#353B42] text-[#8A9299] hover:text-[#F2F0E8] text-[11px] cursor-pointer"
                    title="Panduan simbol visual"
                  >
                    <HelpCircle className="w-3 h-3" />
                    <span className="hidden sm:inline">Panduan</span>
                  </button>
                )}
              </>
            )}

            {showRadarToggle && (
              <button
                type="button"
                onClick={handleToggleRadarArrows}
                className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                  radarArrowsEnabled
                    ? "bg-[#73B894]/20 border-[#73B894] text-[#F2F0E8] shadow-xs"
                    : "bg-[#1C2024] border-[#353B42] text-[#8A9299] hover:text-[#F2F0E8] hover:border-[#8A9299]"
                }`}
                title="Nyalakan/matikan Garis Radar Panah Bidak (melihat lintasan langkah & sasaran saat perwira diklik)"
                aria-label={`Radar Panah ${radarArrowsEnabled ? "Aktif" : "Nonaktif"}`}
                aria-pressed={radarArrowsEnabled}
              >
                <Navigation className={`w-3.5 h-3.5 ${radarArrowsEnabled ? "text-[#73B894]" : "text-[#8A9299]"}`} />
                <span className="font-semibold">
                  <span className="hidden sm:inline">Radar </span>Panah
                </span>
                <span
                  className={`text-[10px] px-1 sm:px-1.5 py-0.2 rounded font-semibold ${
                    radarArrowsEnabled ? "bg-[#73B894] text-[#141619]" : "bg-[#24292E] text-[#8A9299]"
                  }`}
                >
                  {radarArrowsEnabled ? "ON" : "OFF"}
                </span>
              </button>
            )}
          </div>

          {/* Right: Injected Right Slot (Bot Pill Box) or Live Radar Alert */}
          <div className="flex items-center gap-2 justify-end shrink-0 min-w-0">
            {visionEnabled && !topRightSlot && (
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs border truncate max-w-full transition-all ${
                  inspectedReport?.status === "hanging_friendly" || (!inspectedReport && urgentHangingCount > 0)
                    ? "bg-[#E17C78]/15 border-[#E17C78]/40 text-[#E17C78]"
                    : inspectedReport?.status === "overpowered_friendly"
                    ? "bg-[#E3B66F]/15 border-[#E3B66F]/40 text-[#E3B66F]"
                    : inspectedReport?.status === "hanging_opponent" || (!inspectedReport && opponentOpportunityCount > 0)
                    ? "bg-[#73B894]/15 border-[#73B894]/40 text-[#73B894]"
                    : "bg-[#1C2024] border-[#353B42] text-[#B0B5B9]"
                }`}
                title={inspectedReport?.summary}
              >
                {inspectedReport?.status === "hanging_friendly" || (!inspectedReport && urgentHangingCount > 0) ? (
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 animate-pulse text-[#E17C78]" />
                ) : inspectedReport?.status === "overpowered_friendly" ? (
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-[#E3B66F]" />
                ) : inspectedReport?.status === "hanging_opponent" || (!inspectedReport && opponentOpportunityCount > 0) ? (
                  <Target className="w-3.5 h-3.5 shrink-0 text-[#73B894]" />
                ) : (
                  <Shield className="w-3.5 h-3.5 shrink-0 text-[#73B894]" />
                )}

                <span className="truncate text-[11px] font-medium">
                  {inspectedReport
                    ? `${inspectedReport.square.toUpperCase()}: ${inspectedReport.summary}`
                    : urgentHangingCount > 0
                    ? `Waspada: ${urgentHangingCount} bidak terancam tanpa penjaga (merah)!`
                    : opponentOpportunityCount > 0
                    ? `Peluang: ${opponentOpportunityCount} bidak lawan bisa dimakan gratis (hijau)!`
                    : "Posisi aman. Arahkan mouse ke petak mana pun untuk melihat penjaganya."}
                </span>
              </div>
            )}

            {/* Injected Right Slot (Bot Pill Box) */}
            {topRightSlot}
          </div>

          {/* Floating Popover Legend (Zero layout shift, absolute overlay di atas papan) */}
          {visionEnabled && showLegend && (
            <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-1.5 w-72 max-w-[calc(100vw-32px)] p-3 rounded-xl bg-[#1C2024] border border-[#353B42] shadow-2xl z-40 text-xs space-y-2 animate-in fade-in slide-in-from-top-1">
              <div className="flex items-center justify-between pb-1.5 border-b border-[#353B42]">
                <span className="font-semibold text-[#F2F0E8] text-xs">Panduan Simbol Kacamata</span>
                <button
                  type="button"
                  onClick={() => setShowLegend(false)}
                  className="text-[11px] text-[#8A9299] hover:text-[#F2F0E8] cursor-pointer"
                >
                  ✕ Tutup
                </button>
              </div>
              <div className="space-y-1.5 text-[11px] text-[#B0B5B9]">
                <div className="flex items-start gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#E17C78] text-white flex items-center justify-center text-[9px] font-black shrink-0 mt-0.5">!</span>
                  <span><strong className="text-[#E17C78]">Merah (!)</strong>: Bidakmu diserang dan tidak ada yang menjaga (bahaya).</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#E3B66F] shrink-0 mt-0.5" />
                  <span><strong className="text-[#E3B66F]">Oranye</strong>: Bidakmu kalah jumlah pengawal atau diserang bidak lebih murah.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#73B894] text-[#141619] flex items-center justify-center text-[8px] font-black shrink-0 mt-0.5">★</span>
                  <span><strong className="text-[#73B894]">Hijau (★)</strong>: Bidak lawan tidak dijaga, bisa kamu tangkap gratis!</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[11px] shrink-0">🛡️ / 🎯</span>
                  <span><strong>Perisai/Sasaran</strong>: Garis jangkauan bidak yang sedang kamu klik.</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Chessboard Viewport */}
      <div
        className="relative aspect-square w-full rounded-2xl overflow-hidden border-[5px] sm:border-[7px] border-[#382414] shadow-[0_18px_45px_rgba(0,0,0,0.75)] bg-[#24170D] ring-1 ring-white/10"
        role="region"
        aria-label="Papan catur interaktif"
      >
        <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
          {ranks.map((rank, rankIdx) =>
            files.map((file, fileIdx) => {
              const squareCoord = `${file}${rank}` as Square;
              const isLight = (rankIdx + fileIdx) % 2 === 0;

              const piece = chess.get(squareCoord);
              const isSelected = selectedSquare === squareCoord;
              const isLegal = legalDestinations.includes(squareCoord);
              const isLastMoveSquare =
                lastMove &&
                (lastMove.from === squareCoord || lastMove.to === squareCoord);

              const isHighlighted = highlightedSquare === squareCoord;

              // Check if king is in check on this square
              const isKingInCheck =
                isCheck &&
                piece &&
                piece.type === "k" &&
                piece.color === chess.turn();

              const isWhitePiece = piece?.color === "w";

              // Kacamata Catur threat report for this square
              const squareThreat = threats?.get(squareCoord);
              const isDefendedInScope = pieceScope?.defendedPieces.includes(squareCoord);
              const isTargetedInScope = pieceScope?.targetedEnemyPieces.includes(squareCoord);

              return (
                <div
                  key={squareCoord}
                  data-square={squareCoord}
                  onClick={() => !disabled && onSquareClick(squareCoord)}
                  onMouseEnter={() => setHoveredSquare(squareCoord)}
                  onMouseLeave={() => setHoveredSquare(null)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, squareCoord)}
                  title={visionEnabled && squareThreat ? squareThreat.summary : undefined}
                  className={`relative flex items-center justify-center cursor-pointer transition-colors duration-150 ${
                    isLight ? "board-square-light" : "board-square-dark"
                  } ${
                    isSelected ? "!bg-[rgba(235,195,60,0.65)] ring-2 ring-inset ring-[#F5C342]" : ""
                  } ${
                    isHighlighted && !isSelected
                      ? "ring-4 ring-inset ring-[#C7A66A] !bg-[#C7A66A]/25 animate-pulse z-20"
                      : ""
                  } ${
                    isKingInCheck
                      ? "!bg-[#DC4C44]/80 ring-2 ring-inset ring-[#FF6B6B]"
                      : ""
                  }`}
                  role="button"
                  aria-label={`Petak ${squareCoord}${
                    piece
                      ? `, ${isWhitePiece ? "Putih" : "Hitam"} ${piece.type.toUpperCase()}`
                      : ""
                  }`}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      if (!disabled) onSquareClick(squareCoord);
                    }
                  }}
                >
                  {/* Indikator langkah terakhir (Last move highlight: Soft warm amber) */}
                  {isLastMoveSquare && !isSelected && (
                    <div className="absolute inset-0 bg-[rgba(220,175,50,0.40)] pointer-events-none z-5" />
                  )}
                  {/* Rank coordinate on first column (top-left inside square) */}
                  {fileIdx === 0 && (
                    <span
                      className={`absolute top-0.5 left-0.5 sm:left-1 text-[9px] sm:text-[11px] font-sans font-semibold pointer-events-none select-none z-10 ${
                        isLight ? "text-[#73471F]" : "text-[#E8D4B8]"
                      }`}
                    >
                      {rank}
                    </span>
                  )}

                  {/* File coordinate on bottom row (bottom-right inside square) */}
                  {rankIdx === 7 && (
                    <span
                      className={`absolute bottom-0.5 right-0.5 sm:right-1 text-[9px] sm:text-[11px] font-sans font-semibold pointer-events-none select-none z-10 ${
                        isLight ? "text-[#73471F]" : "text-[#E8D4B8]"
                      }`}
                    >
                      {file}
                    </span>
                  )}

                  {/* Piece */}
                  {piece && (
                    <div
                      draggable={!disabled && piece.color === chess.turn()}
                      onDragStart={(e) => handleDragStart(e, squareCoord)}
                      className="w-[88%] h-[88%] flex items-center justify-center select-none z-10 drop-shadow-md transition-transform duration-150 active:scale-95"
                    >
                      <ChessPiece type={piece.type} color={piece.color} />
                    </div>
                  )}

                  {/* Legal move indicator (Empty square = Central Dot, Capture = Refined Ring) */}
                  {isLegal && !piece && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                      <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[#1E140B]/40 border border-[#FFF0D0]/30 shadow-xs" />
                    </div>
                  )}

                  {isLegal && piece && (
                    <div className="absolute inset-1 border-[3px] sm:border-4 border-[#E2B13C]/80 rounded-full pointer-events-none z-20 animate-pulse" />
                  )}

                  {/* Overlays Kacamata Catur (Pointer-events-none agar tidak mengganggu klik/drag) */}
                  {visionEnabled && squareThreat && (
                    <>
                      {/* 1. Bidak Sendiri Gantung (Hanging Friendly): Bahaya Fatal! */}
                      {squareThreat.status === "hanging_friendly" && (
                        <div className="absolute inset-0 ring-[3px] ring-inset ring-[#E17C78] bg-[#E17C78]/25 pointer-events-none z-15 animate-pulse rounded-xs">
                          <span
                            className="absolute top-0.5 right-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-[#E17C78] text-white flex items-center justify-center text-[9px] font-black shadow-md"
                            title="Bidak terancam tanpa penjaga!"
                          >
                            !
                          </span>
                        </div>
                      )}

                      {/* 2. Bidak Sendiri Kalah Pengawal / Diserang Bidak Lebih Murah */}
                      {squareThreat.status === "overpowered_friendly" && (
                        <div className="absolute inset-0 ring-2 ring-inset ring-[#E3B66F]/80 bg-[#E3B66F]/15 pointer-events-none z-15 rounded-xs">
                          <span
                            className="absolute top-0.5 right-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#E3B66F] shadow-xs"
                            title="Waspada: Kalah nilai / jumlah pengawal"
                          />
                        </div>
                      )}

                      {/* 3. Bidak Lawan Gantung (Hanging Opponent): Peluang Emas! */}
                      {squareThreat.status === "hanging_opponent" && (
                        <div className="absolute inset-0 ring-[3px] ring-inset ring-[#73B894] bg-[#73B894]/25 pointer-events-none z-15 animate-pulse rounded-xs">
                          <span
                            className="absolute top-0.5 right-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-[#73B894] text-[#141619] flex items-center justify-center text-[8px] font-black shadow-md"
                            title="Bidak lawan bebas ditangkap gratis!"
                          >
                            ★
                          </span>
                        </div>
                      )}

                      {/* 4. Bidak Lawan Rentan (Vulnerable Opponent) */}
                      {squareThreat.status === "vulnerable_opponent" && (
                        <div className="absolute inset-0 ring-2 ring-inset ring-[#73B894]/60 bg-[#73B894]/10 pointer-events-none z-15 rounded-xs" />
                      )}

                      {/* 5. Bidak Kawan yang Dilindungi oleh Bidak Terpilih (Piece Scope) */}
                      {isDefendedInScope && (
                        <div
                          className="absolute bottom-0.5 left-0.5 px-1 py-0.2 rounded bg-[#73B894]/90 text-[#141619] text-[8px] sm:text-[9px] font-bold pointer-events-none z-25 shadow-xs flex items-center gap-0.5"
                          title="Perwira kawan ini dilindungi oleh bidak yang Anda pilih"
                        >
                          <Shield className="w-2.5 h-2.5" />
                        </div>
                      )}

                      {/* 6. Bidak Lawan yang Diincar oleh Bidak Terpilih (Target In Scope) */}
                      {isTargetedInScope && (
                        <div
                          className="absolute bottom-0.5 left-0.5 px-1 py-0.2 rounded bg-[#E17C78]/90 text-white text-[8px] sm:text-[9px] font-bold pointer-events-none z-25 shadow-xs flex items-center gap-0.5"
                          title="Bidak lawan ini berada dalam jangkauan serangan bidak Anda"
                        >
                          <Target className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Ghost Aim Radar Arrows Overlay */}
        {radarArrowsEnabled && radarArrows.length > 0 && (
          <RadarArrowsOverlay
            arrows={radarArrows}
            files={files}
            ranks={ranks}
          />
        )}
      </div>

      {/* Bottom Slot (Bilah Informasi & Jam Pemain) */}
      {bottomSlot && (
        <div className="w-full mt-1.5 shrink-0">
          {bottomSlot}
        </div>
      )}

      {/* Pawn Promotion Modal */}
      <Modal
        isOpen={Boolean(pendingPromotion)}
        onClose={onCancelPromotion}
        title="Promosi Pion"
        description="Pilih perwira pengganti untuk pion yang mencapai petak ujung lawan."
      >
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-4 gap-3">
            {[
              { id: "q", label: "Menteri" },
              { id: "r", label: "Benteng" },
              { id: "b", label: "Gajah" },
              { id: "n", label: "Kuda" },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onConfirmPromotion(p.id as "q" | "r" | "b" | "n")}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#1C2024] border border-[#382414] hover:border-[#D4A017] hover:bg-[#2A1F16] transition-all group focus-visible:outline-2 focus-visible:outline-[#D4A017] cursor-pointer"
              >
                <div className="w-12 h-12 mb-1 group-hover:scale-105 transition-transform">
                  <ChessPiece
                    type={p.id as "q" | "r" | "b" | "n"}
                    color={chess.turn()}
                  />
                </div>
                <span className="text-xs font-medium text-[#B0B5B9] group-hover:text-[#F2F0E8]">
                  {p.label}
                </span>
              </button>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={onCancelPromotion}
              className="text-xs text-[#8A9299] hover:text-[#F2F0E8] underline cursor-pointer"
            >
              Batalkan
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
