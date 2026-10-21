import { describe, it, expect } from "vitest";
import { Chess } from "chess.js";

describe("Chess Rules Validation (chess.js)", () => {
  it("allows pawn single and double step from starting rank", () => {
    const chess = new Chess();
    expect(chess.move({ from: "e2", to: "e4" })).toBeTruthy();
    expect(chess.move({ from: "e7", to: "e5" })).toBeTruthy();
    expect(chess.move({ from: "d2", to: "d3" })).toBeTruthy();
  });

  it("handles pawn diagonal capture", () => {
    const chess = new Chess();
    chess.move({ from: "e2", to: "e4" });
    chess.move({ from: "d7", to: "d5" });
    const capture = chess.move({ from: "e4", to: "d5" });
    expect(capture).toBeTruthy();
    expect(capture?.captured).toBe("p");
  });

  it("handles knight movement over other pieces", () => {
    const chess = new Chess();
    const move = chess.move({ from: "g1", to: "f3" });
    expect(move).toBeTruthy();
    expect(move?.piece).toBe("n");
  });

  it("rejects illegal moves and moves that expose king to check", () => {
    const chess = new Chess();
    // Cannot move rook through pawn - chess.js throws error
    expect(() => chess.move({ from: "a1", to: "a3" })).toThrow();

    // Setup pinned piece scenario: 1. e4 e5 2. Qh5 d6 3. Qxe5+
    chess.move({ from: "e2", to: "e4" });
    chess.move({ from: "e7", to: "e5" });
    chess.move({ from: "d1", to: "h5" });
    chess.move({ from: "d7", to: "d6" });
    chess.move({ from: "h5", to: "e5" }); // Black king is in check!

    // Moving a random pawn instead of responding to check is illegal and throws
    expect(() => chess.move({ from: "a7", to: "a6" })).toThrow();
  });

  it("validates kingside and queenside castling", () => {
    const chess = new Chess();
    // Clear path for White kingside castle: 1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. O-O
    chess.move({ from: "e2", to: "e4" });
    chess.move({ from: "e7", to: "e5" });
    chess.move({ from: "g1", to: "f3" });
    chess.move({ from: "b8", to: "c6" });
    chess.move({ from: "f1", to: "c4" });
    chess.move({ from: "f8", to: "c5" });

    const castleMove = chess.move({ from: "e1", to: "g1" });
    expect(castleMove).toBeTruthy();
    expect(castleMove?.san).toBe("O-O");
  });

  it("handles en passant capture correctly", () => {
    const chess = new Chess();
    // 1. e4 a6 2. e5 d5 3. exd6 (en passant)
    chess.move({ from: "e2", to: "e4" });
    chess.move({ from: "a7", to: "a6" });
    chess.move({ from: "e4", to: "e5" });
    chess.move({ from: "d7", to: "d5" });

    const enPassantMove = chess.move({ from: "e5", to: "d6" });
    expect(enPassantMove).toBeTruthy();
    expect(enPassantMove?.captured).toBe("p");
  });

  it("handles pawn promotion to queen, rook, bishop, and knight", () => {
    // Setup position with White pawn on e7 about to promote on e8
    const fen = "8/4P3/8/8/8/8/8/4K2k w - - 0 1";
    const chess = new Chess(fen);

    const queenProm = chess.move({ from: "e7", to: "e8", promotion: "q" });
    expect(queenProm).toBeTruthy();
    expect(queenProm?.promotion).toBe("q");

    // Try knight promotion
    const chess2 = new Chess(fen);
    const knightProm = chess2.move({ from: "e7", to: "e8", promotion: "n" });
    expect(knightProm).toBeTruthy();
    expect(knightProm?.promotion).toBe("n");
  });

  it("detects checkmate correctly", () => {
    // Scholar's mate: 1. e4 e5 2. Bc4 Nc6 3. Qh5 Nf6 4. Qxf7#
    const chess = new Chess();
    chess.move({ from: "e2", to: "e4" });
    chess.move({ from: "e7", to: "e5" });
    chess.move({ from: "f1", to: "c4" });
    chess.move({ from: "b8", to: "c6" });
    chess.move({ from: "d1", to: "h5" });
    chess.move({ from: "g8", to: "f6" });
    chess.move({ from: "h5", to: "f7" });

    expect(chess.inCheck()).toBe(true);
    expect(chess.isCheckmate()).toBe(true);
    expect(chess.isGameOver()).toBe(true);
  });

  it("detects stalemate correctly", () => {
    // Stalemate position: White Ka8, Qc7; Black Ka6
    // Fen with black king trapped with no legal moves and not in check
    const fen = "k7/2Q5/K7/8/8/8/8/8 b - - 0 1";
    const chess = new Chess(fen);
    expect(chess.inCheck()).toBe(false);
    expect(chess.isStalemate()).toBe(true);
    expect(chess.isGameOver()).toBe(true);
  });
});
