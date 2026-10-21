import { describe, it, expect } from "vitest";
import {
  getDifficultyConfig,
  getAllDifficulties,
  applyControlledDifficultyMove,
} from "@/features/engine/difficulty";
import { BotDifficultyLevel } from "@/types/chess";

describe("Bot Difficulty System", () => {
  it("provides configurations for all 5 difficulty levels", () => {
    const diffs = getAllDifficulties();
    expect(diffs.length).toBe(5);

    const levels: BotDifficultyLevel[] = [
      "beginner",
      "casual",
      "intermediate",
      "advanced",
      "master",
    ];

    for (const lvl of levels) {
      const cfg = getDifficultyConfig(lvl);
      expect(cfg.id).toBe(lvl);
      expect(cfg.label).toBeTruthy();
      expect(cfg.targetElo).toBeGreaterThan(0);
      expect(cfg.skillLevel).toBeGreaterThanOrEqual(0);
      expect(cfg.depth).toBeGreaterThan(0);
      expect(cfg.moveTimeMs).toBeGreaterThan(0);
    }
  });

  it("ensures beginner has higher blunder probability than master", () => {
    const beginner = getDifficultyConfig("beginner");
    const master = getDifficultyConfig("master");
    expect(beginner.blunderProbability).toBeGreaterThan(master.blunderProbability);
    expect(master.blunderProbability).toBe(0.0);
  });

  it("always returns a 100% legal move in applyControlledDifficultyMove", () => {
    const legalMoves = ["e2e4", "d2d4", "g1f3", "b1c3"];
    const engineBest = "e2e4";

    // Run 50 times across levels to ensure no illegal moves are ever chosen
    for (let i = 0; i < 50; i++) {
      const move = applyControlledDifficultyMove(legalMoves, engineBest, "beginner");
      expect(legalMoves).toContain(move);
    }

    for (let i = 0; i < 20; i++) {
      const move = applyControlledDifficultyMove(legalMoves, engineBest, "master");
      expect(move).toBe(engineBest); // Master always picks engine best move
    }
  });

  it("handles single legal move position gracefully", () => {
    const legalMoves = ["e7e8q"];
    const move = applyControlledDifficultyMove(legalMoves, "e7e8q", "beginner");
    expect(move).toBe("e7e8q");
  });
});
