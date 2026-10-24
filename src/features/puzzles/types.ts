export type PuzzleTheme =
  | "fork"
  | "pin"
  | "skewer"
  | "discovered_attack"
  | "removing_defender"
  | "checkmate_pattern";

export type PuzzleDifficulty = "beginner" | "intermediate" | "advanced";

export interface PuzzleExplanation {
  motif: string;
  threat: string;
  keyMove: string;
  opponentResponse: string;
  takeaway: string;
}

export interface ChessPuzzle {
  id: string;
  title: string;
  description: string;
  theme: PuzzleTheme;
  difficulty: PuzzleDifficulty;
  startingFen: string;
  sideToMove: "w" | "b";
  goal: string;
  // Alternating UCI plies: [playerMove, opponentReply, playerMove, ...]
  // Supports multiple branching solution lines
  solutionLinesUci: string[][];
  hints: [string, string, string];
  explanation: PuzzleExplanation;
  metadata: {
    source?: string;
    verified: boolean;
    verdictNote?: string;
  };
}

export interface PuzzleProgress {
  schemaVersion: number;
  puzzleId: string;
  attempts: number;
  mistakes: number;
  hintsUsed: number;
  solved: boolean;
  solutionRevealed: boolean;
  lastPlayedAt: string;
  solvedAt?: string;
}

export interface PuzzleProgressSummary {
  totalPuzzles: number;
  solvedCount: number;
  attemptedCount: number;
  solutionRevealedCount: number;
  accuracyPercent: number;
}

export type PuzzleGameStatus =
  | "idle"
  | "waiting_player"
  | "evaluating_move"
  | "correct_step"
  | "wrong_step"
  | "opponent_turn"
  | "completed"
  | "solution_revealed";

export const THEME_LABELS: Record<PuzzleTheme, string> = {
  fork: "Garpu (Fork)",
  pin: "Ikatan (Pin)",
  skewer: "Serangan Tusuk (Skewer)",
  discovered_attack: "Serangan Terbuka",
  removing_defender: "Singkirkan Penjaga",
  checkmate_pattern: "Pola Skakmat",
};

export const DIFFICULTY_LABELS: Record<PuzzleDifficulty, string> = {
  beginner: "Pemula",
  intermediate: "Menengah",
  advanced: "Lanjutan",
};
