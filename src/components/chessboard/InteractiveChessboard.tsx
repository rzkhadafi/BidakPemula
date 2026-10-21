"use client";

import React from "react";
import { Chess, Square } from "chess.js";
import { PlayerColor } from "@/types/chess";
import { Modal } from "@/components/ui/Modal";

// Unicode piece mapping
const PIECE_SYMBOLS: Record<string, string> = {
  p: "♟",
  r: "♜",
  n: "♞",
  b: "♝",
  q: "♛",
  k: "♚",
};

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
    <div className="w-full max-w-[560px] mx-auto select-none">
      <div
        className="relative aspect-square w-full rounded-lg overflow-hidden border border-[#353B42] shadow-2xl bg-[#141619]"
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

              // Piece symbol & color
              const pieceGlyph = piece ? PIECE_SYMBOLS[piece.type] : null;
              const isWhitePiece = piece?.color === "w";

              return (
                <div
                  key={squareCoord}
                  data-square={squareCoord}
                  onClick={() => !disabled && onSquareClick(squareCoord)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, squareCoord)}
                  className={`relative flex items-center justify-center cursor-pointer transition-colors ${
                    isLight ? "bg-[#E8E3D8]" : "bg-[#68716F]"
                  } ${
                    isSelected ? "!bg-[#C7A66A]/60 ring-2 ring-inset ring-[#C7A66A]" : ""
                  } ${
                    isLastMoveSquare && !isSelected
                      ? "after:absolute after:inset-0 after:bg-[rgba(199,166,106,0.38)]"
                      : ""
                  } ${
                    isKingInCheck
                      ? "!bg-[#E17C78]/70 ring-2 ring-inset ring-[#E17C78]"
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
                  {/* Rank coordinate on first column */}
                  {fileIdx === 0 && (
                    <span
                      className={`absolute top-0.5 left-1 text-[10px] font-mono font-medium pointer-events-none select-none z-10 ${
                        isLight ? "text-[#68716F]" : "text-[#E8E3D8]"
                      }`}
                    >
                      {rank}
                    </span>
                  )}

                  {/* File coordinate on bottom row */}
                  {rankIdx === 7 && (
                    <span
                      className={`absolute bottom-0.5 right-1 text-[10px] font-mono font-medium pointer-events-none select-none z-10 ${
                        isLight ? "text-[#68716F]" : "text-[#E8E3D8]"
                      }`}
                    >
                      {file}
                    </span>
                  )}

                  {/* Piece */}
                  {pieceGlyph && (
                    <span
                      draggable={!disabled && piece?.color === chess.turn()}
                      onDragStart={(e) => handleDragStart(e, squareCoord)}
                      className={`font-serif text-3xl sm:text-4xl md:text-5xl leading-none select-none transition-transform z-10 drop-shadow-xs active:scale-95 ${
                        isWhitePiece
                          ? "text-[#FFFFFF] [text-shadow:0_1px_2px_rgba(0,0,0,0.7)]"
                          : "text-[#141619] [text-shadow:0_1px_1px_rgba(255,255,255,0.4)]"
                      }`}
                    >
                      {pieceGlyph}
                    </span>
                  )}

                  {/* Legal move indicator (Empty square = Dot, Capture = Ring) */}
                  {isLegal && !piece && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                      <div className="w-3.5 h-3.5 rounded-full bg-[#141619]/45 border border-white/20 shadow-xs" />
                    </div>
                  )}

                  {isLegal && piece && (
                    <div className="absolute inset-0 border-4 border-[#C7A66A]/80 rounded-sm pointer-events-none z-20" />
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
          <div className="grid grid-cols-4 gap-2.5">
            {[
              { id: "q", label: "Menteri (Q)", symbol: "♛" },
              { id: "r", label: "Benteng (R)", symbol: "♜" },
              { id: "b", label: "Gajah (B)", symbol: "♝" },
              { id: "n", label: "Kuda (N)", symbol: "♞" },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onConfirmPromotion(p.id as "q" | "r" | "b" | "n")}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#24292E] border border-[#353B42] hover:border-[#C7A66A] hover:bg-[#2C3238] transition-all group focus-visible:outline-2 focus-visible:outline-[#C7A66A]"
              >
                <span className="text-4xl text-[#F2F0E8] group-hover:text-[#C7A66A] transition-colors mb-1">
                  {p.symbol}
                </span>
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
              Batal
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
