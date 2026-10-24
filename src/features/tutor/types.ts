/**
 * Types for the Indonesian AI Chess Tutor & Speech System.
 */

export type LearnerLevel = "pemula" | "santai" | "berkembang" | "mahir";

export type TutorMode = "lesson" | "play" | "puzzle";

export interface SuggestedMove {
  uci: string;
  san: string;
  description: string;
}

export interface TutorAnalysisContext {
  bestMoveUci?: string;
  bestMoveSan?: string;
  evaluationCp?: number; // Centipawns from White's perspective, or normalized
  mateIn?: number | null; // e.g. +2 for White mate in 2, -1 for Black mate in 1
  principalVariationSan?: string[];
  depth?: number;
  isBlunder?: boolean;
}

export interface TutorExplainRequest {
  fen: string;
  sideToMove: "w" | "b";
  learnerLevel: LearnerLevel;
  mode: TutorMode;
  question?: string; // Max 500 chars
  lastMoveUci?: string;
  lastMoveSan?: string;
  recentMovesSan?: string[]; // Max 16 items
  analysis?: TutorAnalysisContext;
  lessonTitle?: string;
  lessonStepInstruction?: string;
}

export interface TutorExplainResponse {
  title: string;
  summary: string;
  explanation: string;
  spokenText: string;
  concept: string;
  suggestedMoves: SuggestedMove[];
  hint?: string;
  followUpQuestion?: string;
  analysisStatus: "available" | "unavailable" | "partial";
  source: "gemini" | "local-curated";
}

export interface TutorSpeechRequest {
  text: string; // Max 1000 chars
  voice?: string;
  speed?: number; // 0.85, 1.0, 1.25
}

export type TutorErrorCode =
  | "TUTOR_DISABLED"
  | "INVALID_REQUEST"
  | "RATE_LIMITED"
  | "QUOTA_EXHAUSTED"
  | "PROVIDER_UNAVAILABLE"
  | "INVALID_MODEL_OUTPUT"
  | "INTERNAL_ERROR";

export interface TutorApiError {
  code: TutorErrorCode;
  message: string;
  retryable: boolean;
}

export interface TutorPreferences {
  autoplay: boolean;
  speed: 0.85 | 1.0 | 1.25;
  voice: string;
}
