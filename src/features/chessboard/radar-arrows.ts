import { Chess, Square, PieceSymbol } from "chess.js";

export interface RadarArrow {
  fromSquare: Square;
  toSquare: Square;
  isCapture: boolean;
  isKnight: boolean;
  pieceType: PieceSymbol;
  pieceColor: "w" | "b";
}

const RADAR_STORAGE_KEY = "chess_archive_radar_arrows_v1";

type RadarListener = (enabled: boolean) => void;
const radarListeners = new Set<RadarListener>();

/**
 * Membaca preferensi Mode Garis Radar Panah Bidak dari localStorage.
 * Default bernilai true (aktif) untuk keramahan pemula catur.
 */
export function getRadarArrowsSetting(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const val = localStorage.getItem(RADAR_STORAGE_KEY);
    if (val === null) return true; // Default aktif
    return val === "true";
  } catch {
    return true;
  }
}

/**
 * Menyimpan preferensi Mode Garis Radar Panah Bidak ke localStorage
 * dan menyiarkan perubahan ke seluruh listener.
 */
export function setRadarArrowsSetting(enabled: boolean): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(RADAR_STORAGE_KEY, String(enabled));
  } catch {
    // Abaikan kegagalan localStorage
  }
  radarListeners.forEach((listener) => {
    try {
      listener(enabled);
    } catch {}
  });
}

/**
 * Berlangganan perubahan status Radar Panah Bidak.
 */
export function subscribeRadarArrows(listener: RadarListener): () => void {
  radarListeners.add(listener);
  return () => {
    radarListeners.delete(listener);
  };
}

/**
 * Menghitung panah-panah radar lintasan dan sasaran untuk bidak yang sedang dipilih.
 */
export function computeRadarArrows(
  chess: Chess,
  selectedSquare: Square | null,
  legalDestinations: string[]
): RadarArrow[] {
  if (!selectedSquare || legalDestinations.length === 0) {
    return [];
  }

  const piece = chess.get(selectedSquare);
  if (!piece) {
    return [];
  }

  const isKnight = piece.type === "n";
  const arrows: RadarArrow[] = [];

  for (const dest of legalDestinations) {
    const targetSquare = dest as Square;
    const targetPiece = chess.get(targetSquare);

    // Periksa apakah langkah ini adalah penangkapan (capture).
    // Termasuk en passant: pion melangkah diagonal ke petak kosong.
    let isCapture = Boolean(targetPiece && targetPiece.color !== piece.color);
    if (
      !isCapture &&
      piece.type === "p" &&
      selectedSquare[0] !== targetSquare[0] &&
      !targetPiece
    ) {
      // Gerakan diagonal pion ke petak kosong adalah en passant capture
      isCapture = true;
    }

    arrows.push({
      fromSquare: selectedSquare,
      toSquare: targetSquare,
      isCapture,
      isKnight,
      pieceType: piece.type,
      pieceColor: piece.color,
    });
  }

  return arrows;
}
