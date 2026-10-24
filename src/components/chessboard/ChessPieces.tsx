import React from "react";

interface ChessPieceProps {
  type: "p" | "r" | "n" | "b" | "q" | "k";
  color: "w" | "b";
  className?: string;
  size?: number | string;
}

/**
 * Neo-Wood 3D Chess Pieces.
 * Faithfully recreates the warm, tactile Staunton Wood set from the reference image.
 * Uses high-precision vector SVG with linear & radial gradients, specular highlights,
 * and ambient drop shadows.
 */
export const ChessPiece: React.FC<ChessPieceProps> = ({
  type,
  color,
  className = "w-full h-full p-0.5",
}) => {
  const isWhite = color === "w";
  const idPrefix = isWhite ? "w" : "b";

  // Gradient & color definitions
  const bodyGradId = `${idPrefix}-wood-body`;
  const headGradId = `${idPrefix}-wood-head`;
  const highlightGradId = `${idPrefix}-wood-highlight`;
  const baseGradId = `${idPrefix}-wood-base`;
  const shadowFilterId = `${idPrefix}-piece-shadow`;

  const strokeColor = isWhite ? "#261E16" : "#0D0B0A";
  const innerLineColor = isWhite ? "rgba(90, 65, 35, 0.45)" : "rgba(255, 255, 255, 0.18)";
  const specularDotColor = isWhite ? "#FFFFFF" : "rgba(255, 255, 255, 0.75)";

  const renderDefs = () => (
    <defs>
      {/* Ambient shadow filter */}
      <filter id={shadowFilterId} x="-20%" y="-20%" width="140%" height="145%">
        <feDropShadow dx="0" dy="1.8" stdDeviation="1.2" floodColor="#000000" floodOpacity={isWhite ? "0.45" : "0.6"} />
      </filter>

      {/* Body Gradient: Light from top-left to bottom-right */}
      {isWhite ? (
        <>
          <linearGradient id={bodyGradId} x1="20%" y1="10%" x2="85%" y2="95%">
            <stop offset="0%" stopColor="#FFFDF7" />
            <stop offset="25%" stopColor="#F7EEDD" />
            <stop offset="65%" stopColor="#E5D2B4" />
            <stop offset="100%" stopColor="#CDB48E" />
          </linearGradient>

          <radialGradient id={headGradId} cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="35%" stopColor="#F9F2E4" />
            <stop offset="75%" stopColor="#E6D3B6" />
            <stop offset="100%" stopColor="#C9AF87" />
          </radialGradient>

          <linearGradient id={baseGradId} x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#FAF2E3" />
            <stop offset="50%" stopColor="#E2CFAe" />
            <stop offset="100%" stopColor="#BD9F74" />
          </linearGradient>

          <linearGradient id={highlightGradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
        </>
      ) : (
        <>
          <linearGradient id={bodyGradId} x1="20%" y1="10%" x2="85%" y2="95%">
            <stop offset="0%" stopColor="#554F49" />
            <stop offset="30%" stopColor="#3A3530" />
            <stop offset="70%" stopColor="#24201D" />
            <stop offset="100%" stopColor="#141110" />
          </linearGradient>

          <radialGradient id={headGradId} cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#6C655F" />
            <stop offset="35%" stopColor="#453F3A" />
            <stop offset="75%" stopColor="#282320" />
            <stop offset="100%" stopColor="#131110" />
          </radialGradient>

          <linearGradient id={baseGradId} x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#46403A" />
            <stop offset="50%" stopColor="#2A2522" />
            <stop offset="100%" stopColor="#110F0E" />
          </linearGradient>

          <linearGradient id={highlightGradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
        </>
      )}
    </defs>
  );

  switch (type) {
    // ==========================================
    // PAWN (Pion)
    // ==========================================
    case "p":
      return (
        <svg viewBox="0 0 45 45" className={className} aria-label={isWhite ? "Pion Putih" : "Pion Hitam"}>
          {renderDefs()}
          <g filter={`url(#${shadowFilterId})`}>
            {/* Base */}
            <path
              d="M 11 39.5 L 34 39.5 C 34 38 33 36.5 31.5 35.5 C 29 34 27.5 32 26.5 29 C 25.5 26 25 24 25.5 22.5 L 19.5 22.5 C 20 24 19.5 26 18.5 29 C 17.5 32 16 34 13.5 35.5 C 12 36.5 11 38 11 39.5 Z"
              fill={`url(#${bodyGradId})`}
              stroke={strokeColor}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            {/* Stepped Base Lip */}
            <path
              d="M 9.5 39.5 C 9.5 37.5 13 36.5 22.5 36.5 C 32 36.5 35.5 37.5 35.5 39.5 Z"
              fill={`url(#${baseGradId})`}
              stroke={strokeColor}
              strokeWidth="1.4"
            />
            {/* Waist Ring */}
            <ellipse cx="22.5" cy="22.5" rx="5" ry="1.6" fill={`url(#${baseGradId})`} stroke={strokeColor} strokeWidth="1.3" />
            {/* Spherical Head */}
            <circle cx="22.5" cy="14" r="6.8" fill={`url(#${headGradId})`} stroke={strokeColor} strokeWidth="1.5" />
            {/* Specular Highlight on Head */}
            <ellipse cx="20.5" cy="11.5" rx="2.5" ry="1.8" fill={specularDotColor} opacity={isWhite ? "0.8" : "0.35"} />
          </g>
        </svg>
      );

    // ==========================================
    // ROOK (Benteng)
    // ==========================================
    case "r":
      return (
        <svg viewBox="0 0 45 45" className={className} aria-label={isWhite ? "Benteng Putih" : "Benteng Hitam"}>
          {renderDefs()}
          <g filter={`url(#${shadowFilterId})`}>
            {/* Main Castle Body & Parapets */}
            <path
              d="M 10 39.5 L 35 39.5 C 35 37.5 33.5 35.5 32 34 L 30 18 L 34 14.5 L 34 8.5 L 30 8.5 L 30 11.5 L 25 11.5 L 25 8.5 L 20 8.5 L 20 11.5 L 15 11.5 L 15 8.5 L 11 8.5 L 11 14.5 L 15 18 L 13 34 C 11.5 35.5 10 37.5 10 39.5 Z"
              fill={`url(#${bodyGradId})`}
              stroke={strokeColor}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            {/* Cornice Line below parapet */}
            <path d="M 11 14.5 L 34 14.5" stroke={strokeColor} strokeWidth="1.4" />
            <path d="M 13 18 L 32 18" stroke={strokeColor} strokeWidth="1.4" />
            {/* Middle Shading Bands */}
            <path d="M 14.5 33 L 30.5 33" stroke={innerLineColor} strokeWidth="1.2" />
            {/* Base Platform */}
            <path
              d="M 9 39.5 C 9 37.5 13 36 22.5 36 C 32 36 36 37.5 36 39.5 Z"
              fill={`url(#${baseGradId})`}
              stroke={strokeColor}
              strokeWidth="1.4"
            />
            {/* Top Lip Highlight */}
            <path d="M 12 10 L 14 10" stroke={specularDotColor} strokeWidth="1" strokeLinecap="round" />
            <path d="M 21 10 L 24 10" stroke={specularDotColor} strokeWidth="1" strokeLinecap="round" />
            <path d="M 31 10 L 33 10" stroke={specularDotColor} strokeWidth="1" strokeLinecap="round" />
          </g>
        </svg>
      );

    // ==========================================
    // KNIGHT (Kuda)
    // ==========================================
    case "n":
      return (
        <svg viewBox="0 0 45 45" className={className} aria-label={isWhite ? "Kuda Putih" : "Kuda Hitam"}>
          {renderDefs()}
          <g filter={`url(#${shadowFilterId})`}>
            {/* Sculpted Horse Head with Mane Crests */}
            <path
              d="M 11.5 39.5 L 34.5 39.5 C 34 35 34.5 28 36 23 C 35.5 22 34 21 34 19.5 C 35.5 18 36 15 35 13 C 34 12 32.5 12 32 10 C 31 7.5 28 6.5 26 6 C 25.5 6 24.5 7 24 8.5 C 23 8.5 20.5 8 18 10 C 15.5 12 13 13 9 14.5 C 7 15.5 6 17.5 6.5 20 C 7 21.5 8.5 22 11 22.5 C 13.5 23 15 24 14.5 26 C 14 27.5 12 28.5 11 30.5 C 10 32.5 10 36 11.5 39.5 Z"
              fill={`url(#${bodyGradId})`}
              stroke={strokeColor}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            {/* Stepped Pedestal Base */}
            <path
              d="M 10 39.5 C 10 37.5 14 36 23 36 C 32 36 36 37.5 36 39.5 Z"
              fill={`url(#${baseGradId})`}
              stroke={strokeColor}
              strokeWidth="1.4"
            />
            {/* Mane Tufts / Notches */}
            <path d="M 28 6 C 26 10 28 14 31 16" stroke={innerLineColor} strokeWidth="1.2" strokeLinecap="round" />
            <path d="M 31 16 C 30 19 31 22 34 24" stroke={innerLineColor} strokeWidth="1.2" strokeLinecap="round" />
            {/* Cheek & Jaw Muscle Curve */}
            <path
              d="M 14.5 26 C 16.5 23.5 21 21 24.5 21 C 27 21 28 22.5 28 24 C 28 27.5 22 32 16 33.5"
              fill="none"
              stroke={innerLineColor}
              strokeWidth="1.3"
              strokeLinecap="round"
            />
            {/* Almond Eye with Catchlight */}
            <ellipse cx="14" cy="14.5" rx="1.8" ry="2.2" fill={strokeColor} transform="rotate(-15 14 14.5)" />
            <circle cx="13.5" cy="13.8" r="0.7" fill={specularDotColor} />
            {/* Nostril Slit */}
            <path d="M 8.5 18 C 9 19 10 19.2 10.5 18.5" fill="none" stroke={strokeColor} strokeWidth="1.2" strokeLinecap="round" />
            {/* Mouth Indent */}
            <path d="M 8 21.5 C 9.5 21.8 11.5 21.8 12.5 21" fill="none" stroke={strokeColor} strokeWidth="1.2" strokeLinecap="round" />
            {/* Crest Light Highlight */}
            <path d="M 24 9 C 26 9 29 11 31 14" fill="none" stroke={specularDotColor} strokeWidth="1" strokeLinecap="round" opacity="0.6" />
          </g>
        </svg>
      );

    // ==========================================
    // BISHOP (Gajah)
    // ==========================================
    case "b":
      return (
        <svg viewBox="0 0 45 45" className={className} aria-label={isWhite ? "Gajah Putih" : "Gajah Hitam"}>
          {renderDefs()}
          <g filter={`url(#${shadowFilterId})`}>
            {/* Main Tapered Body & Rounded Hood */}
            <path
              d="M 12 39.5 L 33 39.5 C 33 37.5 31.5 36 30 35 C 28.5 34 27 32 26 29 C 25 26 25 23.5 27 21 C 30 17.5 30 11.5 22.5 8 C 15 11.5 15 17.5 18 21 C 20 23.5 20 26 19 29 C 18 32 16.5 34 15 35 C 13.5 36 12 37.5 12 39.5 Z"
              fill={`url(#${bodyGradId})`}
              stroke={strokeColor}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            {/* Stepped Pedestal Base */}
            <path
              d="M 10 39.5 C 10 37.5 14 36 22.5 36 C 31 36 35 37.5 35 39.5 Z"
              fill={`url(#${baseGradId})`}
              stroke={strokeColor}
              strokeWidth="1.4"
            />
            {/* Distinctive Curved Ribbon Collar (like a mustache ribbon at base of neck) */}
            <path
              d="M 14 26 C 18 28.5 27 28.5 31 26 C 29 24.5 26 24 22.5 24 C 19 24 16 24.5 14 26 Z"
              fill={`url(#${baseGradId})`}
              stroke={strokeColor}
              strokeWidth="1.3"
            />
            {/* Finial Ball & Cross at Top */}
            <circle cx="22.5" cy="6.5" r="2.2" fill={`url(#${headGradId})`} stroke={strokeColor} strokeWidth="1.2" />
            <path d="M 22.5 5.5 L 22.5 7.5 M 21.5 6.5 L 23.5 6.5" stroke={strokeColor} strokeWidth="0.8" />
            {/* Miter Slash Cut */}
            <path d="M 22.5 10 L 28 15.5" stroke={strokeColor} strokeWidth="1.6" strokeLinecap="round" />
            <circle cx="22.5" cy="17" r="1.2" fill={strokeColor} />
            {/* Light Highlight on Left Dome */}
            <ellipse cx="19" cy="13" rx="2" ry="3.5" fill={specularDotColor} opacity={isWhite ? "0.6" : "0.25"} transform="rotate(-15 19 13)" />
          </g>
        </svg>
      );

    // ==========================================
    // QUEEN (Menteri)
    // ==========================================
    case "q":
      return (
        <svg viewBox="0 0 45 45" className={className} aria-label={isWhite ? "Menteri Putih" : "Menteri Hitam"}>
          {renderDefs()}
          <g filter={`url(#${shadowFilterId})`}>
            {/* Main Regal Gown & Body */}
            <path
              d="M 11.5 39.5 L 33.5 39.5 C 33.5 37 32 35 30.5 33.5 C 29 32 27.5 29 27 26 C 26.5 24 27.5 23 28.5 22 L 34.5 15 L 28 20 L 22.5 12 L 17 20 L 10.5 15 L 16.5 22 C 17.5 23 18.5 24 18 26 C 17.5 29 16 32 14.5 33.5 C 13 35 11.5 37 11.5 39.5 Z"
              fill={`url(#${bodyGradId})`}
              stroke={strokeColor}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            {/* Stepped Pedestal Base */}
            <path
              d="M 10 39.5 C 10 37.5 14 36 22.5 36 C 31 36 35 37.5 35 39.5 Z"
              fill={`url(#${baseGradId})`}
              stroke={strokeColor}
              strokeWidth="1.4"
            />
            {/* Waist Ribbed Ring */}
            <path d="M 17 25 C 20.5 26.5 24.5 26.5 28 25" stroke={strokeColor} strokeWidth="1.3" fill="none" />
            <path d="M 15 31 C 20 33 25 33 30 31" stroke={innerLineColor} strokeWidth="1.2" fill="none" />
            {/* 5 Crown Pearls */}
            <circle cx="10.5" cy="14" r="1.8" fill={`url(#${headGradId})`} stroke={strokeColor} strokeWidth="1.2" />
            <circle cx="16.5" cy="11" r="1.8" fill={`url(#${headGradId})`} stroke={strokeColor} strokeWidth="1.2" />
            <circle cx="22.5" cy="9.5" r="2.1" fill={`url(#${headGradId})`} stroke={strokeColor} strokeWidth="1.3" />
            <circle cx="28.5" cy="11" r="1.8" fill={`url(#${headGradId})`} stroke={strokeColor} strokeWidth="1.2" />
            <circle cx="34.5" cy="14" r="1.8" fill={`url(#${headGradId})`} stroke={strokeColor} strokeWidth="1.2" />
            {/* Crown Base Band */}
            <ellipse cx="22.5" cy="22" rx="7.5" ry="1.8" fill={`url(#${baseGradId})`} stroke={strokeColor} strokeWidth="1.2" />
          </g>
        </svg>
      );

    // ==========================================
    // KING (Raja)
    // ==========================================
    case "k":
      return (
        <svg viewBox="0 0 45 45" className={className} aria-label={isWhite ? "Raja Putih" : "Raja Hitam"}>
          {renderDefs()}
          <g filter={`url(#${shadowFilterId})`}>
            {/* Main Imperial Robe Body & Crown Dome */}
            <path
              d="M 11.5 39.5 L 33.5 39.5 C 33.5 37 32 35 30.5 33.5 C 29 32 27.5 29 27 26 C 26.5 24 28 22 30 20.5 C 32 19 33 16 32 13.5 C 31 11 28 10 26 10 L 26 9 C 26 9 24.5 9 22.5 9 C 20.5 9 19 9 19 9 L 19 10 C 17 10 14 11 13 13.5 C 12 16 13 19 15 20.5 C 17 22 18.5 24 18 26 C 17.5 29 16 32 14.5 33.5 C 13 35 11.5 37 11.5 39.5 Z"
              fill={`url(#${bodyGradId})`}
              stroke={strokeColor}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            {/* Stepped Pedestal Base */}
            <path
              d="M 9.5 39.5 C 9.5 37.5 13.5 36 22.5 36 C 31.5 36 35.5 37.5 35.5 39.5 Z"
              fill={`url(#${baseGradId})`}
              stroke={strokeColor}
              strokeWidth="1.4"
            />
            {/* Crown Gem Band */}
            <path
              d="M 15 17.5 C 19 19 26 19 30 17.5 C 29 16 26.5 15.5 22.5 15.5 C 18.5 15.5 16 16 15 17.5 Z"
              fill={`url(#${baseGradId})`}
              stroke={strokeColor}
              strokeWidth="1.2"
            />
            {/* Body Collar Rings */}
            <path d="M 17 24 C 20.5 25.5 24.5 25.5 28 24" stroke={innerLineColor} strokeWidth="1.2" fill="none" />
            <path d="M 14.5 31 C 19.5 33 25.5 33 30.5 31" stroke={innerLineColor} strokeWidth="1.2" fill="none" />
            {/* Regal Imperial Latin Cross Finial on Top */}
            <path
              d="M 21.5 3.5 L 23.5 3.5 L 23.5 5.5 L 25.5 5.5 L 25.5 7 L 23.5 7 L 23.5 10 L 21.5 10 L 21.5 7 L 19.5 7 L 19.5 5.5 L 21.5 5.5 Z"
              fill={isWhite ? "#F7EEDD" : "#3A3530"}
              stroke={strokeColor}
              strokeWidth="1.1"
              strokeLinejoin="miter"
            />
            {/* Crown Specular Highlights */}
            <ellipse cx="18" cy="13.5" rx="2.5" ry="1.5" fill={specularDotColor} opacity={isWhite ? "0.6" : "0.25"} transform="rotate(-15 18 13.5)" />
          </g>
        </svg>
      );

    default:
      return null;
  }
};
