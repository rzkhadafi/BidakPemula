import { BotDifficultyConfig, BotDifficultyLevel } from "@/types/chess";

export const BOT_DIFFICULTIES: Record<BotDifficultyLevel, BotDifficultyConfig> = {
  beginner: {
    id: "beginner",
    label: "Santai",
    targetElo: 600,
    skillLevel: 0,
    depth: 2,
    moveTimeMs: 400,
    blunderProbability: 0.35,
    description: "Langkah santai dan ramah bagi yang baru pertama kali bermain catur.",
  },
  casual: {
    id: "casual",
    label: "Pemula",
    targetElo: 1000,
    skillLevel: 4,
    depth: 4,
    moveTimeMs: 500,
    blunderProbability: 0.18,
    description: "Memahami pertahanan dasar, sesekali melewatkan ancaman tersembunyi.",
  },
  intermediate: {
    id: "intermediate",
    label: "Berkembang",
    targetElo: 1400,
    skillLevel: 9,
    depth: 6,
    moveTimeMs: 700,
    blunderProbability: 0.05,
    description: "Bermain solid dan mulai mengembangkan serangan terencana.",
  },
  advanced: {
    id: "advanced",
    label: "Menantang",
    targetElo: 1700,
    skillLevel: 15,
    depth: 9,
    moveTimeMs: 900,
    blunderProbability: 0.0,
    description: "Kalkulasi taktis rapi dan permainan posisi yang disiplin.",
  },
  master: {
    id: "master",
    label: "Kuat",
    targetElo: 2000,
    skillLevel: 20,
    depth: 12,
    moveTimeMs: 1200,
    blunderProbability: 0.0,
    description: "Kekuatan penuh Stockfish untuk pemain yang mencari tantangan sejati.",
  },
};

export function getDifficultyConfig(level: BotDifficultyLevel): BotDifficultyConfig {
  return BOT_DIFFICULTIES[level] || BOT_DIFFICULTIES.beginner;
}

export function getAllDifficulties(): BotDifficultyConfig[] {
  return Object.values(BOT_DIFFICULTIES);
}

/**
 * Applies controlled difficulty selection.
 * If the difficulty config calls for intentional suboptimal play and multiple legal moves exist,
 * picks an alternative legal move to simulate beginner play.
 * All candidate moves are guaranteed to be 100% legal according to chess rules.
 */
export function applyControlledDifficultyMove(
  legalUciMoves: string[],
  engineBestMoveUci: string,
  level: BotDifficultyLevel
): string {
  if (!legalUciMoves || legalUciMoves.length === 0) {
    return engineBestMoveUci;
  }

  // Ensure engine best move is in legal moves
  const isBestMoveLegal = legalUciMoves.includes(engineBestMoveUci);
  const fallbackMove = isBestMoveLegal ? engineBestMoveUci : legalUciMoves[0];

  const config = getDifficultyConfig(level);

  // If no blunder probability or only 1 move available, use engine best move
  if (config.blunderProbability <= 0 || legalUciMoves.length === 1) {
    return fallbackMove;
  }

  // Probabilistic decision to pick an alternative move
  const shouldBlunder = Math.random() < config.blunderProbability;
  if (!shouldBlunder) {
    return fallbackMove;
  }

  // Choose a random alternative legal move
  const alternativeMoves = legalUciMoves.filter((m) => m !== engineBestMoveUci);
  if (alternativeMoves.length === 0) {
    return fallbackMove;
  }

  const randomIndex = Math.floor(Math.random() * alternativeMoves.length);
  return alternativeMoves[randomIndex];
}
