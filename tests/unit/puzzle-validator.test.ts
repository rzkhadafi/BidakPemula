import { describe, it, expect } from "vitest";
import { PUZZLE_CATALOG, getPuzzleById } from "@/features/puzzles/puzzle-catalog";
import { validatePuzzle, validatePuzzleCatalog } from "@/features/puzzles/puzzle-validator";
import { ChessPuzzle } from "@/features/puzzles/types";

describe("Puzzle Catalog & Validator", () => {
  it("contains at least 16 curated puzzles", () => {
    expect(PUZZLE_CATALOG.length).toBeGreaterThanOrEqual(16);
  });

  it("ensures all puzzle IDs are unique", () => {
    const ids = PUZZLE_CATALOG.map((p) => p.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("validates that all 18 puzzles in the catalog are 100% legal and well-formed", () => {
    const catalogResult = validatePuzzleCatalog(PUZZLE_CATALOG);
    if (!catalogResult.valid) {
      console.error("Catalog validation errors:", JSON.stringify(catalogResult.report, null, 2));
    }
    expect(catalogResult.valid).toBe(true);
    expect(catalogResult.invalidPuzzles).toBe(0);
  });

  it("validates individual puzzles with exact metadata and 3 hints", () => {
    for (const puzzle of PUZZLE_CATALOG) {
      const res = validatePuzzle(puzzle);
      expect(res.valid).toBe(true);
      expect(res.errors).toHaveLength(0);
      expect(puzzle.hints).toHaveLength(3);
      expect(puzzle.explanation.motif).toBeTruthy();
      expect(puzzle.explanation.takeaway).toBeTruthy();
    }
  });

  it("rejects an invalid puzzle with corrupted FEN", () => {
    const invalidPuzzle: ChessPuzzle = {
      ...PUZZLE_CATALOG[0],
      id: "invalid-fen-puz",
      startingFen: "invalid-fen-string-not-chess",
    };

    const res = validatePuzzle(invalidPuzzle);
    expect(res.valid).toBe(false);
    expect(res.errors.some((e) => e.includes("Posisi FEN awal tidak valid"))).toBe(true);
  });

  it("rejects an invalid puzzle with illegal solution move", () => {
    const illegalMovePuzzle: ChessPuzzle = {
      ...PUZZLE_CATALOG[0],
      id: "illegal-move-puz",
      solutionLinesUci: [["e1e8"]], // Illegal move from initial position
    };

    const res = validatePuzzle(illegalMovePuzzle);
    expect(res.valid).toBe(false);
    expect(res.errors.some((e) => e.includes("ilegal"))).toBe(true);
  });

  it("finds a puzzle by its ID", () => {
    const puzzle = getPuzzleById("puz-fork-01");
    expect(puzzle).toBeDefined();
    expect(puzzle?.title).toBe("Garpu Kuda Kerajaan");
    expect(getPuzzleById("non-existent-id")).toBeUndefined();
  });
});
