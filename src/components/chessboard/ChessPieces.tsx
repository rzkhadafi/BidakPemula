import React from "react";

interface ChessPieceProps {
  type: "p" | "r" | "n" | "b" | "q" | "k";
  color: "w" | "b";
  className?: string;
  size?: number | string;
}

/**
 * Standard crisp vector SVG chess pieces with high contrast on dark & light squares.
 * Designed to occupy ~80-85% of each square with strong outlines.
 */
export const ChessPiece: React.FC<ChessPieceProps> = ({
  type,
  color,
  className = "w-full h-full p-1",
}) => {
  const isWhite = color === "w";
  const fill = isWhite ? "#F7F5F0" : "#181B1F";
  const stroke = isWhite ? "#24292E" : "#E2DFD2";
  const accent = isWhite ? "#24292E" : "#E2DFD2";

  switch (type) {
    case "p": // Pawn
      return (
        <svg viewBox="0 0 45 45" className={className} aria-label={isWhite ? "Pion Putih" : "Pion Hitam"}>
          <path
            d="m 22.5,9 c -2.21,0 -4,1.79 -4,4 0,0.89 0.29,1.71 0.78,2.38 C 17.33,16.5 16,18.59 16,21 c 0,2.03 0.94,3.84 2.41,5.03 C 15.41,27.09 11,31.58 11,39.5 l 23,0 c 0,-7.92 -4.41,-12.41 -7.41,-13.47 C 28.06,24.84 29,23.03 29,21 29,18.59 27.67,16.5 25.72,15.38 26.21,14.71 26.5,13.89 26.5,13 c 0,-2.21 -1.79,-4 -4,-4 z"
            style={{
              fill,
              stroke,
              strokeWidth: 1.5,
              strokeLinecap: "round",
            }}
          />
        </svg>
      );

    case "r": // Rook
      return (
        <svg viewBox="0 0 45 45" className={className} aria-label={isWhite ? "Benteng Putih" : "Benteng Hitam"}>
          <g
            style={{
              fill,
              stroke,
              strokeWidth: 1.5,
              strokeLinecap: "round",
              strokeLinejoin: "round",
            }}
          >
            <path d="M 9,39 L 36,39 L 36,36 L 9,36 L 9,39 z" />
            <path d="M 12,36 L 12,32 L 33,32 L 33,36 L 12,36 z" />
            <path d="M 11,14 L 11,9 L 15,9 L 15,11 L 20,11 L 20,9 L 25,9 L 25,11 L 30,11 L 30,9 L 34,9 L 34,14" />
            <path d="M 34,14 L 31,17 L 14,17 L 11,14" />
            <path d="M 31,17 L 31,29.5 L 14,29.5 L 14,17" />
            <path d="M 31,29.5 L 32.5,32 L 12.5,32 L 14,29.5" />
            <path d="M 11,14 L 34,14" stroke={accent} strokeWidth={1} />
          </g>
        </svg>
      );

    case "n": // Knight
      return (
        <svg viewBox="0 0 45 45" className={className} aria-label={isWhite ? "Kuda Putih" : "Kuda Hitam"}>
          <path
            d="m 22,10 c 10.5,1 16.5,8 16,29 L 15,39 C 15,30 9.65,24.58 6,19 c 4,-1 8.5,1 12,1 0,-3.5 -4.5,-8 -4.5,-8 0,0 7,-4.5 8.5,-2 z"
            style={{
              fill,
              stroke,
              strokeWidth: 1.5,
              strokeLinecap: "round",
              strokeLinejoin: "round",
            }}
          />
          <path
            d="m 24,18 c 0.38,2.91 -5.55,7.37 -8,9 -3,2 -2.82,4.34 -5,4 -1.04,-0.94 -1.48,-1.74 -1,-3 1.5,-4 3,-4 3,-6 0,-2 2.5,-4.5 4,-6 1.5,-1.5 2,-2.5 3.5,-3 1.5,-0.5 3,0.5 3.5,5 z"
            style={{
              fill: isWhite ? "#ECE8DF" : "#2C3138",
              stroke,
              strokeWidth: 1.2,
            }}
          />
          {/* Eye */}
          <circle cx="9.5" cy="18" r="1.2" fill={accent} />
        </svg>
      );

    case "b": // Bishop
      return (
        <svg viewBox="0 0 45 45" className={className} aria-label={isWhite ? "Gajah Putih" : "Gajah Hitam"}>
          <g
            style={{
              fill,
              stroke,
              strokeWidth: 1.5,
              strokeLinecap: "round",
              strokeLinejoin: "round",
            }}
          >
            <path d="M 9,36 C 12.39,35.03 19.11,36.43 22.5,34 C 25.89,36.43 32.61,35.03 36,36 C 36,36 37.65,36.54 39,38 C 38.32,38.97 37.35,38.99 36,38.5 C 32.61,37.53 25.89,38.96 22.5,37.5 C 19.11,38.96 12.39,37.53 9,38.5 C 7.646,38.99 6.677,38.97 6,38 C 7.354,36.54 9,36 9,36 z" />
            <path d="M 15,32 C 17.5,34.5 27.5,34.5 30,32 C 30.5,30.5 30,30 30,30 C 30,27.5 27.5,26 27.5,26 C 33,24.5 33.5,14.5 22.5,10.5 C 11.5,14.5 12,24.5 17.5,26 C 17.5,26 15,27.5 15,30 C 15,30 14.5,30.5 15,32 z" />
            <path d="m 25 8 a 2.5 2.5 0 1 1 -5 0 a 2.5 2.5 0 1 1 5 0 z" />
            {/* Cross / Cut */}
            <path d="m 17.5,16 10,0 M 22.5,12 22.5,20" stroke={accent} strokeWidth={1.2} />
          </g>
        </svg>
      );

    case "q": // Queen
      return (
        <svg viewBox="0 0 45 45" className={className} aria-label={isWhite ? "Menteri Putih" : "Menteri Hitam"}>
          <g
            style={{
              fill,
              stroke,
              strokeWidth: 1.5,
              strokeLinecap: "round",
              strokeLinejoin: "round",
            }}
          >
            <path d="M 9 26 C 17.5 24.5 30 24.5 36 26 L 38 14 L 31 25 L 22.5 12 L 14 25 L 7 14 L 9 26 z" />
            <path d="M 9,26 C 9,28 10.5,28 11.5,30 C 12.5,31.5 12.5,31 12,33.5 C 10.5,34.5 10.5,36 10.5,36 C 9,37.5 11,38.5 11,38.5 C 17.5,39.5 27.5,39.5 34,38.5 C 34,38.5 35.5,37.5 34.5,36 C 34.5,36 34.5,34.5 33,33.5 C 32.5,31 32.5,31.5 33.5,30 C 34.5,28 36,28 36,26 C 27.5,24.5 17.5,24.5 9,26 z" />
            <circle cx="6" cy="12" r="2" />
            <circle cx="14" cy="9" r="2" />
            <circle cx="22.5" cy="8" r="2" />
            <circle cx="31" cy="9" r="2" />
            <circle cx="39" cy="12" r="2" />
          </g>
        </svg>
      );

    case "k": // King
      return (
        <svg viewBox="0 0 45 45" className={className} aria-label={isWhite ? "Raja Putih" : "Raja Hitam"}>
          <g
            style={{
              fill,
              stroke,
              strokeWidth: 1.5,
              strokeLinecap: "round",
              strokeLinejoin: "round",
            }}
          >
            <path d="M 22.5,11.63 L 22.5,6" />
            <path d="M 20,8 L 25,8" />
            <path d="M 22.5,25 C 22.5,25 27,17.5 25.5,14.5 C 24,11.5 21,11.5 19.5,14.5 C 18,17.5 22.5,25 22.5,25" />
            <path d="M 11.5,37 C 17,40.5 28,40.5 33.5,37 C 33.5,34.5 31,32.5 31,32.5 C 35.5,30 35,22 28.5,19 C 28.5,19 26.5,22 22.5,22 C 18.5,22 16.5,19 16.5,19 C 10,22 9.5,30 14,32.5 C 14,32.5 11.5,34.5 11.5,37 z" />
            <path d="M 11.5,30 C 17,27 28,27 33.5,30" stroke={accent} strokeWidth={1.2} />
            <path d="M 11.5,33.5 C 17,30.5 28,30.5 33.5,33.5" stroke={accent} strokeWidth={1.2} />
          </g>
        </svg>
      );

    default:
      return null;
  }
};
