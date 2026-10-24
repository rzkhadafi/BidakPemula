import React from "react";
import { ChessPiece } from "./ChessPieces";

interface ChessboardPlaceholderProps {
  orientation?: "white" | "black";
  caption?: string;
  interactive?: boolean;
}

type PieceDef = { type: "p" | "r" | "n" | "b" | "q" | "k"; color: "w" | "b" };

const INITIAL_PIECES_WHITE: { [square: string]: PieceDef } = {
  a8: { type: "r", color: "b" }, b8: { type: "n", color: "b" }, c8: { type: "b", color: "b" }, d8: { type: "q", color: "b" }, e8: { type: "k", color: "b" }, f8: { type: "b", color: "b" }, g8: { type: "n", color: "b" }, h8: { type: "r", color: "b" },
  a7: { type: "p", color: "b" }, b7: { type: "p", color: "b" }, c7: { type: "p", color: "b" }, d7: { type: "p", color: "b" }, e7: { type: "p", color: "b" }, f7: { type: "p", color: "b" }, g7: { type: "p", color: "b" }, h7: { type: "p", color: "b" },
  a2: { type: "p", color: "w" }, b2: { type: "p", color: "w" }, c2: { type: "p", color: "w" }, d2: { type: "p", color: "w" }, e2: { type: "p", color: "w" }, f2: { type: "p", color: "w" }, g2: { type: "p", color: "w" }, h2: { type: "p", color: "w" },
  a1: { type: "r", color: "w" }, b1: { type: "n", color: "w" }, c1: { type: "b", color: "w" }, d1: { type: "q", color: "w" }, e1: { type: "k", color: "w" }, f1: { type: "b", color: "w" }, g1: { type: "n", color: "w" }, h1: { type: "r", color: "w" },
};

export const ChessboardPlaceholder: React.FC<ChessboardPlaceholderProps> = ({
  orientation = "white",
  caption,
  interactive = false,
}) => {
  const files = orientation === "white" ? ["a", "b", "c", "d", "e", "f", "g", "h"] : ["h", "g", "f", "e", "d", "c", "b", "a"];
  const ranks = orientation === "white" ? [8, 7, 6, 5, 4, 3, 2, 1] : [1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <div className="w-full max-w-[640px] mx-auto select-none">
      <div className="relative aspect-square w-full rounded-xl overflow-hidden border border-[#353B42] shadow-xl bg-[#141619]">
        <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
          {ranks.map((rank, rankIdx) =>
            files.map((file, fileIdx) => {
              const isLight = (rankIdx + fileIdx) % 2 === 0;
              const squareCoord = `${file}${rank}`;
              const piece = INITIAL_PIECES_WHITE[squareCoord];

              return (
                <div
                  key={squareCoord}
                  className={`relative flex items-center justify-center transition-colors ${
                    isLight ? "bg-[#E8E3D8]" : "bg-[#68716F]"
                  }`}
                  data-square={squareCoord}
                >
                  {/* File label on bottom row */}
                  {rankIdx === 7 && (
                    <span
                      className={`absolute bottom-0.5 right-1 text-[10px] font-mono font-medium ${
                        isLight ? "text-[#68716F]" : "text-[#E8E3D8]"
                      }`}
                    >
                      {file}
                    </span>
                  )}

                  {/* Rank label on leftmost column */}
                  {fileIdx === 0 && (
                    <span
                      className={`absolute top-0.5 left-1 text-[10px] font-mono font-medium ${
                        isLight ? "text-[#68716F]" : "text-[#E8E3D8]"
                      }`}
                    >
                      {rank}
                    </span>
                  )}

                  {/* Piece */}
                  {piece && (
                    <div className="w-[82%] h-[82%] flex items-center justify-center select-none drop-shadow-md">
                      <ChessPiece type={piece.type} color={piece.color} />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {!interactive && (
          <div className="absolute inset-x-0 bottom-0 py-1.5 px-3 bg-[#141619]/85 border-t border-[#353B42] flex items-center justify-between text-xs text-[#B0B5B9]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#C7A66A]" />
              Visual Papan Catur 2D Chess Archive
            </span>
            <span className="text-[#8A9299]">Posisi Standar Catur</span>
          </div>
        )}
      </div>

      {caption && (
        <p className="text-center text-xs text-[#8A9299] mt-2">{caption}</p>
      )}
    </div>
  );
};
