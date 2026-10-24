import { describe, it, expect } from "vitest";
import { Chess } from "chess.js";
import {
  computeBoardThreats,
  computePieceScope,
  ALL_SQUARES,
} from "@/features/chessboard/square-threats";

describe("Square Threats & Vision Heatmap (Kacamata Catur)", () => {
  it("covers all 64 squares in the board calculation", () => {
    const chess = new Chess();
    const threats = computeBoardThreats(chess, "w");

    expect(threats.size).toBe(64);
    for (const sq of ALL_SQUARES) {
      expect(threats.has(sq)).toBe(true);
    }
  });

  it("identifies defended friendly pieces and safe center squares in starting position", () => {
    const chess = new Chess();
    const threats = computeBoardThreats(chess, "w");

    // In starting position, d2 is defended by Queen (d1), King (e1), Bishop (c1), Knight (b1)
    const d2Report = threats.get("d2");
    expect(d2Report).toBeDefined();
    expect(d2Report?.status).toBe("defended_friendly");
    expect(d2Report?.friendlyDefenders.length).toBeGreaterThan(0);
    expect(d2Report?.opponentAttackers.length).toBe(0);

    // No friendly pieces are hanging at start
    for (const [, report] of threats) {
      expect(report.status).not.toBe("hanging_friendly");
    }
  });

  it("accurately detects a hanging friendly piece (bidak gantung)", () => {
    const chess = new Chess();
    // Setup position: White Knight on e4 undefended and attacked by Black Rook on e8
    // FEN: 4r1k1/8/8/8/4N3/8/8/4K3 w - - 0 1
    chess.load("4r1k1/8/8/8/4N3/8/8/4K3 w - - 0 1");

    const threats = computeBoardThreats(chess, "w");
    const e4Report = threats.get("e4");

    expect(e4Report).toBeDefined();
    expect(e4Report?.status).toBe("hanging_friendly");
    expect(e4Report?.opponentAttackers).toContain("e8");
    expect(e4Report?.friendlyDefenders.length).toBe(0);
    expect(e4Report?.summary).toContain("Bahaya!");
  });

  it("accurately detects a hanging opponent piece (peluang emas)", () => {
    const chess = new Chess();
    // After 1. e4 e5 2. Nf3: Black's e5 pawn is attacked by White's Nf3 and currently has no defenders
    chess.move("e4");
    chess.move("e5");
    chess.move("Nf3");

    const threats = computeBoardThreats(chess, "w");
    const e5Report = threats.get("e5");

    expect(e5Report).toBeDefined();
    expect(e5Report?.status).toBe("hanging_opponent");
    expect(e5Report?.friendlyDefenders).toContain("f3");
    expect(e5Report?.opponentAttackers.length).toBe(0);
    expect(e5Report?.summary).toContain("Peluang emas!");
  });

  it("flags overpowered friendly piece when attacked by a piece of lower value", () => {
    const chess = new Chess();
    // White Queen on d4 attacked by Black Pawn on c5, White Rook on d1 defending Queen, Kings on g1 and e8
    // FEN: 4k3/8/8/2p5/3Q4/8/8/3R2K1 w - - 0 1
    chess.load("4k3/8/8/2p5/3Q4/8/8/3R2K1 w - - 0 1");

    const threats = computeBoardThreats(chess, "w");
    const d4Report = threats.get("d4");

    expect(d4Report).toBeDefined();
    // Even though White has 1 defender (d1) and Black has 1 attacker (c5),
    // Black's attacker is a pawn (value 1) attacking a Queen (value 9)!
    expect(d4Report?.status).toBe("overpowered_friendly");
    expect(d4Report?.summary).toContain("Waspada!");
    expect(d4Report?.summary).toContain("lebih murah");
  });

  it("calculates piece scope correctly (defended pieces and targeted enemies)", () => {
    const chess = new Chess();
    // White Bishop on c4 defending White Pawn on f7? No, standard Italian:
    // 1. e4 e5 2. Bc4 Nc6
    chess.move("e4");
    chess.move("e5");
    chess.move("Bc4");
    chess.move("Nc6");

    const bishopScope = computePieceScope(chess, "c4");
    expect(bishopScope.square).toBe("c4");

    // Bishop on c4 targets Black pawn on f7
    expect(bishopScope.targetedEnemyPieces).toContain("f7");

    // Bishop on c4 controls empty squares d5, e6, b3, a2, etc.
    expect(bishopScope.controlledEmptySquares).toContain("d5");
    expect(bishopScope.controlledEmptySquares).toContain("b3");
  });
});
