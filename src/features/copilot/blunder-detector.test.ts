import { describe, it, expect } from "vitest";
import { Chess } from "chess.js";
import { evaluateMoveSafety } from "./blunder-detector";

describe("evaluateMoveSafety user screenshot position", () => {
  it("evaluates d4xe5 in user position", () => {
    const fen = "rnbqkbnr/pppp3p/3p2p1/4p3/3P1P2/4B3/PPP1Q1PP/RN2KBNR w KQkq - 0 9";
    const chess = new Chess(fen);
    const safety = evaluateMoveSafety(chess, "d4", "e5", undefined, "w");
    console.log("SAFETY REPORT FOR d4 to e5:", JSON.stringify(safety, null, 2));
    expect(safety).toBeDefined();
  });
});
