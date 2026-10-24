"use client";

import React from "react";
import { Chess, Square } from "chess.js";
import { PlayerColor } from "@/types/chess";
import { Modal } from "@/components/ui/Modal";
import { ChessPiece } from "./ChessPieces";

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
}) => {
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
    <div className="w-full max-w-[640px] lg:max-w-[660px] mx-auto select-none">
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

              // Check if king is in check on this square
              const isKingInCheck =
                isCheck &&
                piece &&
                piece.type === "k" &&
                piece.color === chess.turn();

              const isWhitePiece = piece?.color === "w";

              return (
                <div
                  key={squareCoord}
                  data-square={squareCoord}
                  onClick={() => !disabled && onSquareClick(squareCoord)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, squareCoord)}
                  className={`relative flex items-center justify-center cursor-pointer transition-colors duration-150 ${
                    isLight ? "board-square-light" : "board-square-dark"
                  } ${
                    isSelected ? "!bg-[rgba(235,195,60,0.65)] ring-2 ring-inset ring-[#F5C342]" : ""
                  } ${
                    isLastMoveSquare && !isSelected
                      ? "after:absolute after:inset-0 after:bg-[rgba(220,175,50,0.42)] pointer-events-none"
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
                  {/* Rank coordinate on first column (top-left inside square) */}
                  {fileIdx === 0 && (
                    <span
                      className={`absolute top-0.5 left-1 text-[11px] sm:text-[12px] font-sans font-semibold pointer-events-none select-none z-10 ${
                        isLight ? "text-[#73471F]" : "text-[#E8D4B8]"
                      }`}
                    >
                      {rank}
                    </span>
                  )}

                  {/* File coordinate on bottom row (bottom-right inside square) */}
                  {rankIdx === 7 && (
                    <span
                      className={`absolute bottom-0.5 right-1 text-[11px] sm:text-[12px] font-sans font-semibold pointer-events-none select-none z-10 ${
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
                </div>
              );
            })
          )}
        </div>
      </div>

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
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#1C2024] border border-[#382414] hover:border-[#D4A017] hover:bg-[#2A1F16] transition-all group focus-visible:outline-2 focus-visible:outline-[#D4A017]"
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
              className="text-xs text-[#8A9299] hover:text-[#F2F0E8] underline"
            >
              Batalkan
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
