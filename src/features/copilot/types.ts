import { Square, PieceSymbol } from "chess.js";

export type BlunderSeverity = "safe" | "questionable" | "blunder" | "fatal";

export interface BlunderReport {
  isBlunder: boolean;
  severity: BlunderSeverity;
  reason: string;
  from: Square;
  to: Square;
  pieceType: PieceSymbol;
  hangingSquare?: Square;
  hangingPieceType?: PieceSymbol;
  attackerSquare?: Square;
  attackerPieceType?: PieceSymbol;
  mateInOneThreat?: boolean;
}

export type SocraticHintTier = 1 | 2 | 3;

export interface SocraticHint {
  fen: string;
  bestMoveUci: string;
  from: Square;
  to: Square;
  pieceType: PieceSymbol;
  san: string;
  // Tingkat 1: Panduan Observasi & Arah Pandang (tanpa menyebut bidak/petak)
  tier1Observation: {
    clue: string;
    targetSector: "kingside" | "queenside" | "center" | "backrank" | "general";
    spokenText: string;
  };
  // Tingkat 2: Identifikasi Perwira Kunci (menyebut bidak tapi bukan petak tujuan)
  tier2Piece: {
    clue: string;
    pieceSquare: Square;
    pieceName: string;
    spokenText: string;
  };
  // Tingkat 3: Langkah Konkret & Alasan Strategis Penuh
  tier3Concrete: {
    clue: string;
    moveSan: string;
    from: Square;
    to: Square;
    rationale: string;
    spokenText: string;
  };
}

export interface CoPilotPreferences {
  enabled: boolean;
  blunderSafetyNet: boolean; // Peringatan langkah blunder sebelum dijalankan
  socraticHintsEnabled: boolean; // Petunjuk 3 tingkat
  autoAudioHint: boolean; // Putar suara Aoede otomatis saat hint dibuka
}
