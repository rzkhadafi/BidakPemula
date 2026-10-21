export type PlayerColor = "white" | "black";

export type BotDifficultyLevel =
  | "beginner"
  | "casual"
  | "intermediate"
  | "advanced"
  | "master";

export interface BotDifficultyConfig {
  id: BotDifficultyLevel;
  label: string; // e.g. "Pemula"
  targetElo: number; // e.g. 600 (estimated)
  skillLevel: number; // 0 - 20 in Stockfish
  depth: number; // search depth 1 - 15
  moveTimeMs: number; // max thinking time in ms
  blunderProbability: number; // 0.0 - 1.0 (suboptimal move chance for beginner levels)
  description: string;
}

export type TimeControlId = "unlimited" | "3m" | "5m" | "10m";

export interface TimeControlConfig {
  id: TimeControlId;
  label: string;
  minutes: number | null; // null for unlimited
  incrementSeconds: number;
}

export type GameStatus =
  | "not_started"
  | "ongoing"
  | "checkmate"
  | "stalemate"
  | "threefold_repetition"
  | "insufficient_material"
  | "fifty_move_rule"
  | "resigned"
  | "timeout"
  | "aborted";

export type GameResult = "white_win" | "black_win" | "draw" | "ongoing";

export interface ChessMoveRecord {
  ply: number;
  san: string;
  uci: string;
  from: string;
  to: string;
  piece: string;
  captured?: string;
  promotion?: string;
  fenAfter: string;
  clockWhiteMs?: number;
  clockBlackMs?: number;
}

export interface ArchivedGame {
  schemaVersion: number;
  id: string;
  createdAt: string; // ISO string
  updatedAt: string;
  playerColor: PlayerColor;
  botLevel: string;
  timeControlId: TimeControlId;
  timeControlLabel: string;
  result: "white_win" | "black_win" | "draw" | "aborted";
  termination: string; // e.g. "Skakmat", "Menyerah", "Remis"
  initialFen: string;
  finalFen: string;
  pgn: string;
  moves: ChessMoveRecord[];
  durationMs: number;
  engineVersion?: string;
}

export type EngineStatus =
  | "uninitialized"
  | "loading"
  | "ready"
  | "thinking"
  | "error";
