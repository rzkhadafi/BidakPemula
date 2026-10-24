import { Chess, Square } from "chess.js";
import { ChessPuzzle } from "./types";

export interface PuzzleValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates a single chess puzzle against chess.js rules and metadata criteria.
 */
export function validatePuzzle(puzzle: ChessPuzzle): PuzzleValidationResult {
  const errors: string[] = [];

  if (!puzzle.id || puzzle.id.trim() === "") {
    errors.push("ID puzzle tidak boleh kosong.");
  }
  if (!puzzle.title || puzzle.title.trim() === "") {
    errors.push("Judul puzzle tidak boleh kosong.");
  }
  if (!puzzle.goal || puzzle.goal.trim() === "") {
    errors.push("Tujuan puzzle tidak boleh kosong.");
  }

  // Validate hints
  if (!Array.isArray(puzzle.hints) || puzzle.hints.length !== 3) {
    errors.push("Puzzle harus memiliki tepat 3 tingkatan petunjuk.");
  } else {
    puzzle.hints.forEach((hint, idx) => {
      if (!hint || hint.trim() === "") {
        errors.push(`Petunjuk level ${idx + 1} tidak boleh kosong.`);
      }
    });
  }

  // Validate explanation
  if (!puzzle.explanation) {
    errors.push("Penjelasan solusi puzzle tidak ditemukan.");
  } else {
    const { motif, threat, keyMove, opponentResponse, takeaway } = puzzle.explanation;
    if (!motif || motif.trim() === "") errors.push("Motif taktik pada penjelasan tidak boleh kosong.");
    if (!threat || threat.trim() === "") errors.push("Ancaman taktis pada penjelasan tidak boleh kosong.");
    if (!keyMove || keyMove.trim() === "") errors.push("Langkah kunci pada penjelasan tidak boleh kosong.");
    if (!opponentResponse || opponentResponse.trim() === "") errors.push("Balasan lawan pada penjelasan tidak boleh kosong.");
    if (!takeaway || takeaway.trim() === "") errors.push("Pelajaran taktis pada penjelasan tidak boleh kosong.");
  }

  // Validate starting FEN
  let chess: Chess;
  try {
    chess = new Chess(puzzle.startingFen);
  } catch (err) {
    errors.push(`Posisi FEN awal tidak valid: ${(err as Error).message}`);
    return { valid: false, errors };
  }

  if (chess.turn() !== puzzle.sideToMove) {
    errors.push(
      `Giliran FEN (${chess.turn()}) tidak sesuai dengan sideToMove puzzle (${puzzle.sideToMove}).`
    );
  }

  // Validate solution lines
  if (!Array.isArray(puzzle.solutionLinesUci) || puzzle.solutionLinesUci.length === 0) {
    errors.push("Puzzle harus memiliki setidaknya satu jalur solusi UCI.");
    return { valid: false, errors };
  }

  puzzle.solutionLinesUci.forEach((line, lineIdx) => {
    if (!Array.isArray(line) || line.length === 0) {
      errors.push(`Jalur solusi #${lineIdx + 1} kosong.`);
      return;
    }

    // A puzzle solution must conclude on player's move (odd number of plies)
    if (line.length % 2 === 0) {
      errors.push(`Jalur solusi #${lineIdx + 1} harus diakhiri oleh langkah pemain (panjang langkah harus ganjil).`);
    }

    // Step through the moves
    const simChess = new Chess(puzzle.startingFen);
    line.forEach((uci, moveIdx) => {
      if (typeof uci !== "string" || uci.length < 4) {
        errors.push(`Jalur #${lineIdx + 1}, langkah #${moveIdx + 1}: format UCI '${uci}' tidak valid.`);
        return;
      }

      const from = uci.slice(0, 2) as Square;
      const to = uci.slice(2, 4) as Square;
      const promotion = uci.length > 4 ? uci[4].toLowerCase() : undefined;

      try {
        const result = simChess.move({ from, to, promotion });
        if (!result) {
          errors.push(`Jalur #${lineIdx + 1}, langkah #${moveIdx + 1}: langkah '${uci}' tidak legal.`);
        }
      } catch (moveErr) {
        errors.push(
          `Jalur #${lineIdx + 1}, langkah #${moveIdx + 1}: langkah '${uci}' ilegal: ${(moveErr as Error).message}`
        );
      }
    });
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates an entire catalog of puzzles and returns aggregate results.
 */
export function validatePuzzleCatalog(catalog: ChessPuzzle[]): {
  valid: boolean;
  totalPuzzles: number;
  invalidPuzzles: number;
  report: Record<string, string[]>;
} {
  const report: Record<string, string[]> = {};
  let invalidCount = 0;

  for (const puzzle of catalog) {
    const res = validatePuzzle(puzzle);
    if (!res.valid) {
      invalidCount++;
      report[puzzle.id] = res.errors;
    }
  }

  return {
    valid: invalidCount === 0,
    totalPuzzles: catalog.length,
    invalidPuzzles: invalidCount,
    report,
  };
}
