import { describe, it, expect, beforeEach } from "vitest";
import {
  findGameTurningPoint,
  saveTurningPointReplay,
  getPendingTurningPointReplay,
  clearPendingTurningPointReplay,
} from "@/features/autopsy/turning-point";
import { ChessMoveRecord } from "@/types/chess";

describe("Turning Point Detection (Storytelling Game Review)", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it("returns null for games with empty move history", () => {
    expect(findGameTurningPoint([], "white")).toBeNull();
  });

  it("detects fatal blunder where player leaves king in checkmate or queen hanging", () => {
    // Scholar's mate against Black:
    // 1. e4 e5 2. Qh5 Nc6 3. Bc4 Nf6?? 4. Qxf7#
    // Here Black's Nf6 was the critical blunder allowing Qxf7# (fatal)
    const moves: ChessMoveRecord[] = [
      { ply: 1, from: "e2", to: "e4", san: "e4", uci: "e2e4", piece: "p", fenAfter: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1" },
      { ply: 2, from: "e7", to: "e5", san: "e5", uci: "e7e5", piece: "p", fenAfter: "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2" },
      { ply: 3, from: "d1", to: "h5", san: "Qh5", uci: "d1h5", piece: "q", fenAfter: "rnbqkbnr/pppp1ppp/8/4p2Q/4P3/8/PPPP1PPP/RNB1KBNR b KQkq - 1 2" },
      { ply: 4, from: "b8", to: "c6", san: "Nc6", uci: "b8c6", piece: "n", fenAfter: "r1bqkbnr/pppp1ppp/2n5/4p2Q/4P3/8/PPPP1PPP/RNB1KBNR w KQkq - 2 3" },
      { ply: 5, from: "f1", to: "c4", san: "Bc4", uci: "f1c4", piece: "b", fenAfter: "r1bqkbnr/pppp1ppp/2n5/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 3 3" },
      { ply: 6, from: "g8", to: "f6", san: "Nf6", uci: "g8f6", piece: "n", fenAfter: "r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4" },
      { ply: 7, from: "h5", to: "f7", san: "Qxf7#", uci: "h5f7", piece: "q", captured: "p", fenAfter: "r1bqkb1r/pppp1Qpp/2n2n2/4p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4" },
    ];

    const turningPoint = findGameTurningPoint(moves, "black", undefined, false);
    expect(turningPoint).not.toBeNull();
    expect(turningPoint?.moveNumber).toBe(3); // Move 3 for Black
    expect(turningPoint?.movePlayedSan).toBe("Nf6");
    expect(turningPoint?.severity).toBe("fatal");
    expect(turningPoint?.description).toContain("skakmat");
    expect(turningPoint?.historyBefore).toHaveLength(5);
  });

  it("identifies victory turning point when player wins the game", () => {
    // Fool's mate by Black against White:
    // 1. f3 e5 2. g4 Qh4#
    const moves: ChessMoveRecord[] = [
      { ply: 1, from: "f2", to: "f3", san: "f3", uci: "f2f3", piece: "p", fenAfter: "rnbqkbnr/pppppppp/8/8/8/5P2/PPPPP1PP/RNBQKBNR b KQkq - 0 1" },
      { ply: 2, from: "e7", to: "e5", san: "e5", uci: "e7e5", piece: "p", fenAfter: "rnbqkbnr/pppp1ppp/8/4p3/8/5P2/PPPPP1PP/RNBQKBNR w KQkq e6 0 2" },
      { ply: 3, from: "g2", to: "g4", san: "g4", uci: "g2g4", piece: "p", fenAfter: "rnbqkbnr/pppp1ppp/8/4p3/6P1/5P2/PPPPP2P/RNBQKBNR b KQkq g3 0 2" },
      { ply: 4, from: "d8", to: "h4", san: "Qh4#", uci: "d8h4", piece: "q", fenAfter: "rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3" },
    ];

    const turningPoint = findGameTurningPoint(moves, "black", undefined, true);
    expect(turningPoint).not.toBeNull();
    expect(turningPoint?.severity).toBe("victory_turning_point");
    expect(turningPoint?.movePlayedSan).toBe("Qh4#");
    expect(turningPoint?.moveNumber).toBe(2);
    expect(turningPoint?.headline).toContain("Titik Balik Kemenangan");
  });

  it("saves, retrieves, and clears turning point replay in sessionStorage", () => {
    expect(getPendingTurningPointReplay()).toBeNull();

    saveTurningPointReplay({
      fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
      plyIndex: 1,
      moveNumber: 1,
      history: [],
      playerColor: "white",
      createdAt: Date.now(),
    });

    const pending = getPendingTurningPointReplay();
    expect(pending).not.toBeNull();
    expect(pending?.playerColor).toBe("white");
    expect(pending?.plyIndex).toBe(1);

    clearPendingTurningPointReplay();
    expect(getPendingTurningPointReplay()).toBeNull();
  });
});
