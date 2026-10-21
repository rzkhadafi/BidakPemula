import React from "react";

interface ChessboardPlaceholderProps {
  orientation?: "white" | "black";
  caption?: string;
  interactive?: boolean;
}

const INITIAL_PIECES_WHITE: { [square: string]: string } = {
  a8: "♜", b8: "♞", c8: "♝", d8: "♛", e8: "♚", f8: "♝", g8: "♞", h8: "♜",
  a7: "♟", b7: "♟", c7: "♟", d7: "♟", e7: "♟", f7: "♟", g7: "♟", h7: "♟",
  a2: "♙", b2: "♙", c2: "♙", d2: "♙", e2: "♙", f2: "♙", g2: "♙", h2: "♙",
  a1: "♖", b1: "♘", c1: "♗", d1: "♕", e1: "♔", f1: "♗", g1: "♘", h1: "♖",
};

export const ChessboardPlaceholder: React.FC<ChessboardPlaceholderProps> = ({
  orientation = "white",
  caption,
  interactive = false,
}) => {
  const files = orientation === "white" ? ["a", "b", "c", "d", "e", "f", "g", "h"] : ["h", "g", "f", "e", "d", "c", "b", "a"];
  const ranks = orientation === "white" ? [8, 7, 6, 5, 4, 3, 2, 1] : [1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <div className="w-full max-w-[560px] mx-auto select-none">
      <div className="relative aspect-square w-full rounded-lg overflow-hidden border border-[#353B42] shadow-lg bg-[#141619]">
        <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
          {ranks.map((rank, rankIdx) =>
            files.map((file, fileIdx) => {
              const isLight = (rankIdx + fileIdx) % 2 === 0;
              const squareCoord = `${file}${rank}`;
              const piece = INITIAL_PIECES_WHITE[squareCoord];
              const isWhitePiece = piece && ["♙", "♖", "♘", "♗", "♕", "♔"].includes(piece);

              return (
                <div
                  key={squareCoord}
                  className={`relative flex items-center justify-center font-serif text-3xl sm:text-4xl transition-colors ${
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
                    <span
                      className={`drop-shadow-xs transition-transform ${
                        isWhitePiece ? "text-[#FFFFFF]" : "text-[#141619]"
                      }`}
                    >
                      {piece}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Phase 0 Prototype Overlay */}
        {!interactive && (
          <div className="absolute inset-x-0 bottom-0 py-1.5 px-3 bg-[#141619]/85 border-t border-[#353B42] flex items-center justify-between text-xs text-[#B0B5B9]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#C7A66A]" />
              Visual Shell Papan Catur 2D (Fase 0)
            </span>
            <span className="text-[#8A9299]">Aturan catur aktif di Fase 1</span>
          </div>
        )}
      </div>

      {caption && (
        <p className="text-center text-xs text-[#8A9299] mt-2">{caption}</p>
      )}
    </div>
  );
};
