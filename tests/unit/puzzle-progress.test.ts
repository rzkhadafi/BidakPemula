import { describe, it, expect, beforeEach } from "vitest";
import {
  getAllPuzzleProgress,
  getPuzzleProgress,
  recordPuzzleAttempt,
  recordHintUsed,
  recordPuzzleSolved,
  calculateProgressSummary,
  clearPuzzleProgress,
} from "@/features/puzzles/puzzle-progress";
import { PUZZLE_CATALOG } from "@/features/puzzles/puzzle-catalog";

describe("Puzzle Progress Persistence & Summary", () => {
  beforeEach(() => {
    clearPuzzleProgress();
    window.localStorage.clear();
  });

  it("initializes with empty puzzle progress", () => {
    const all = getAllPuzzleProgress();
    expect(Object.keys(all).length).toBe(0);

    const single = getPuzzleProgress("puz-fork-01");
    expect(single).toBeNull();
  });

  it("records attempts, mistakes, and hints used", () => {
    // Attempt with mistake = true
    recordPuzzleAttempt("puz-fork-01", true);
    // Attempt with mistake = false
    recordPuzzleAttempt("puz-fork-01", false);
    recordHintUsed("puz-fork-01", 1);
    recordHintUsed("puz-fork-01", 2);

    const p = getPuzzleProgress("puz-fork-01");
    expect(p).not.toBeNull();
    expect(p?.attempts).toBe(2);
    expect(p?.mistakes).toBe(1);
    expect(p?.hintsUsed).toBe(2);
    expect(p?.solved).toBe(false);
  });

  it("records puzzle solved and computes progress summary", () => {
    recordPuzzleSolved("puz-fork-01", false);
    recordPuzzleSolved("puz-pin-01", false);

    const all = getAllPuzzleProgress();
    const summary = calculateProgressSummary(PUZZLE_CATALOG, all);
    expect(summary.totalPuzzles).toBe(PUZZLE_CATALOG.length);
    expect(summary.solvedCount).toBe(2);
    expect(summary.attemptedCount).toBe(2);
    expect(summary.accuracyPercent).toBe(100);
  });

  it("records solution revealed", () => {
    recordPuzzleSolved("puz-fork-02", true);
    const p = getPuzzleProgress("puz-fork-02");
    expect(p?.solutionRevealed).toBe(true);
    expect(p?.solved).toBe(false);
  });

  it("clears puzzle progress", () => {
    recordPuzzleSolved("puz-fork-01", false);
    expect(Object.keys(getAllPuzzleProgress()).length).toBe(1);

    clearPuzzleProgress();
    expect(Object.keys(getAllPuzzleProgress()).length).toBe(0);
  });
});
