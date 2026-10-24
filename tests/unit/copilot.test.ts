import { describe, it, expect } from "vitest";
import { Chess } from "chess.js";
import {
  evaluateMoveSafety,
  generateSocraticHint,
  getCoPilotPreferences,
  setCoPilotPreferences,
} from "@/features/copilot";

describe("In-Game AI Co-Pilot: Blunder Detector & Socratic Hints", () => {
  describe("Blunder Detector (Bantalan Blunder)", () => {
    it("approves safe normal opening moves", () => {
      const chess = new Chess();
      // 1. e4
      const report = evaluateMoveSafety(chess, "e2", "e4", undefined, "w");
      expect(report.isBlunder).toBe(false);
      expect(report.severity).toBe("safe");
    });

    it("detects when a player blunders a Queen to an undefended square attacked by enemy", () => {
      const chess = new Chess();
      // Setup position: Black Bishop on c5 attacking f2
      // White Queen on d1 moves to f3? Wait:
      // Let's create a position where White Queen moves directly into an attack:
      // FEN: 4k3/8/8/2b5/8/8/4P3/3QK3 w - - 0 1
      chess.load("4k3/8/8/2b5/8/8/4P3/3QK3 w - - 0 1");
      // White plays Qd5 (c5 is Black Bishop which attacks d5: no, c5 to d5 is horizontal, bishop moves diagonal!)
      // Black Bishop is on c5. Diagonal is: c5, d4, e3, f2, g1.
      // If White plays Qd4: square d4 is attacked by c5 Bishop!
      const report = evaluateMoveSafety(chess, "d1", "d4", undefined, "w");

      expect(report.isBlunder).toBe(true);
      expect(report.severity).toBe("blunder");
      expect(report.reason).toContain("Menteri");
      expect(report.reason).toContain("D4");
    });

    it("detects when a player move allows an immediate checkmate (Mate in 1)", () => {
      const chess = new Chess();
      // Scholar's Mate setup:
      // 1. e4 e5 2. Qh5 Nc6 3. Bc4 Nf6??
      // Black plays Nf6 (allowing 4. Qxf7#)
      chess.move("e4");
      chess.move("e5");
      chess.move("Qh5");
      chess.move("Nc6");
      chess.move("Bc4");

      // Now evaluate Black's blunder: Nf6
      const report = evaluateMoveSafety(chess, "g8", "f6", undefined, "b");
      expect(report.isBlunder).toBe(true);
      expect(report.severity).toBe("fatal");
      expect(report.mateInOneThreat).toBe(true);
      expect(report.reason).toContain("skakmat");
    });

    it("detects when moving a defender leaves another major piece hanging", () => {
      const chess = new Chess();
      // White Knight on d2 defending White Rook on d1. Black Rook on d8 attacking d1.
      // If White moves Knight away (e.g. Nd2-b3 or Nd2-e4), White Rook on d1 becomes hanging!
      // FEN: 3r2k1/8/8/8/8/8/3N4/3R2K1 w - - 0 1
      chess.load("3r2k1/8/8/8/8/8/3N4/3R2K1 w - - 0 1");

      const report = evaluateMoveSafety(chess, "d2", "e4", undefined, "w");
      expect(report.isBlunder).toBe(true);
      expect(report.severity).toBe("blunder");
      expect(report.reason).toContain("Benteng");
      expect(report.reason).toContain("D1");
    });
  });

  describe("Socratic Engine (Petunjuk Bertingkat)", () => {
    it("generates 3 progressive pedagogical tiers from best move", () => {
      const chess = new Chess();
      // Starting position, best move e2e4 or g1f3
      const hint = generateSocraticHint(chess, "e2e4");

      expect(hint).not.toBeNull();
      if (!hint) return;

      expect(hint.san).toBe("e4");
      expect(hint.from).toBe("e2");
      expect(hint.to).toBe("e4");

      // Tier 1: Observation
      expect(hint.tier1Observation.clue.length).toBeGreaterThan(15);
      expect(hint.tier1Observation.targetSector).toBe("center");
      expect(hint.tier1Observation.spokenText).toContain("pusat");

      // Tier 2: Key piece identified without destination
      expect(hint.tier2Piece.pieceSquare).toBe("e2");
      expect(hint.tier2Piece.pieceName).toBe("Pion");
      expect(hint.tier2Piece.clue).toContain("E2");

      // Tier 3: Concrete destination and strategic rationale
      expect(hint.tier3Concrete.moveSan).toBe("e4");
      expect(hint.tier3Concrete.to).toBe("e4");
      expect(hint.tier3Concrete.rationale.length).toBeGreaterThan(10);
    });

    it("tailors clue for castling", () => {
      const chess = new Chess();
      // Position where White can castle kingside: e1g1
      chess.load("r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4");

      const hint = generateSocraticHint(chess, "e1g1");
      expect(hint).not.toBeNull();
      if (!hint) return;

      expect(hint.san).toBe("O-O");
      expect(hint.tier1Observation.clue).toContain("raja");
      expect(hint.tier2Piece.clue).toContain("rokade");
      expect(hint.tier3Concrete.rationale).toContain("Rokade");
    });

    it("ensures clean typography without raw markdown asterisks or backticks", () => {
      const chess = new Chess();
      const hint = generateSocraticHint(chess, "b1c3");
      expect(hint).not.toBeNull();
      if (!hint) return;

      expect(hint.tier1Observation.clue).not.toContain("**");
      expect(hint.tier1Observation.clue).not.toContain("`");
      expect(hint.tier2Piece.clue).not.toContain("**");
      expect(hint.tier2Piece.clue).not.toContain("`");
      expect(hint.tier3Concrete.clue).not.toContain("**");
      expect(hint.tier3Concrete.clue).not.toContain("`");
      expect(hint.tier3Concrete.rationale).not.toContain("**");
      expect(hint.tier3Concrete.rationale).not.toContain("`");

      // Check specific natural Bahasa Indonesia text formatting without asterisks
      expect(hint.tier2Piece.clue).toContain("Kuda");
      expect(hint.tier2Piece.clue).toContain("B1");
      expect(hint.tier3Concrete.clue).toContain("Langkahkan Kuda dari B1 ke C3 (Nc3)");
    });
  });

  describe("Co-Pilot Storage Preferences", () => {
    it("returns a stable cached reference on consecutive calls for useSyncExternalStore", () => {
      const snap1 = getCoPilotPreferences();
      const snap2 = getCoPilotPreferences();
      expect(snap1).toBe(snap2); // Strict identity equality
    });

    it("reads default preferences and allows updates", () => {
      const prefs = getCoPilotPreferences();
      expect(prefs.enabled).toBe(true);
      expect(prefs.blunderSafetyNet).toBe(true);
      expect(prefs.socraticHintsEnabled).toBe(true);

      setCoPilotPreferences({ blunderSafetyNet: false });
      expect(getCoPilotPreferences().blunderSafetyNet).toBe(false);

      // Restore
      setCoPilotPreferences({ blunderSafetyNet: true });
      expect(getCoPilotPreferences().blunderSafetyNet).toBe(true);
    });
  });
});
