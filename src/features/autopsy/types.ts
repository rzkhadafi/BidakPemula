import { Square } from "chess.js";
import { PlayerColor, ChessMoveRecord } from "@/types/chess";

export type TurningPointSeverity = "fatal" | "blunder" | "inaccuracy" | "victory_turning_point";

export interface TurningPoint {
  plyIndex: number; // 0-indexed ply in moves array (where the turning point move was executed)
  moveNumber: number; // 1-indexed full-move number (e.g. 14 for Move 14)
  sideToMove: "w" | "b";
  isPlayerMove: boolean;
  fenBefore: string; // FEN board position right before the turning point move was executed
  fenAfter: string; // FEN board position right after the turning point move was executed
  movePlayedSan: string; // e.g. "Qe4"
  movePlayedUci: string; // e.g. "d4e4"
  fromSquare: Square;
  toSquare: Square;
  pieceType: string; // 'p' | 'n' | 'b' | 'r' | 'q' | 'k'
  severity: TurningPointSeverity;
  headline: string; // e.g. "Titik Balik Kritis: Langkah ke-14 Putih"
  description: string; // Friendly Indonesian explanation
  suggestedAlternativeSan?: string; // Safer alternative recommendation
  historyBefore: ChessMoveRecord[]; // All moves played before this turning point
  playerColor: PlayerColor;
}

export interface StoredTurningPointReplay {
  fen: string;
  plyIndex: number;
  moveNumber: number;
  history: ChessMoveRecord[];
  playerColor: PlayerColor;
  sourceGameId?: string;
  createdAt: number;
}
