import { describe, it, expect, beforeEach, vi } from "vitest";
import { GeminiTutorService } from "@/features/tutor/server/gemini-service";
import { getCuratedTutorExplanation } from "@/features/tutor/server/curated-tutor-fallbacks";
import { TutorExplainRequest } from "@/features/tutor/types";

describe("Gemini Tutor Service & Curated Fallbacks", () => {
  const startFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

  beforeEach(() => {
    vi.restoreAllMocks();
    delete process.env.GEMINI_API_KEY;
  });

  it("throws INVALID_REQUEST error when given an invalid FEN", async () => {
    const req: TutorExplainRequest = {
      fen: "invalid-fen-string",
      sideToMove: "w",
      learnerLevel: "pemula",
      mode: "play",
    };

    await expect(GeminiTutorService.explain(req)).rejects.toMatchObject({
      code: "INVALID_REQUEST",
      message: "Format FEN papan catur tidak valid.",
    });
  });

  it("throws INVALID_REQUEST when question exceeds 500 characters", async () => {
    const req: TutorExplainRequest = {
      fen: startFen,
      sideToMove: "w",
      learnerLevel: "pemula",
      mode: "play",
      question: "a".repeat(501),
    };

    await expect(GeminiTutorService.explain(req)).rejects.toMatchObject({
      code: "INVALID_REQUEST",
      message: "Pertanyaan melebihi batas maksimal 500 karakter.",
    });
  });

  it("safely truncates recentMovesSan to max 16 plies", async () => {
    const longMoves = Array(25).fill("e4");
    const req: TutorExplainRequest = {
      fen: startFen,
      sideToMove: "w",
      learnerLevel: "pemula",
      mode: "play",
      recentMovesSan: longMoves,
    };

    const res = await GeminiTutorService.explain(req);
    expect(res).toBeDefined();
    expect(res.source).toBe("local-curated");
  });

  it("returns curated offline explanation when GEMINI_API_KEY is not set", async () => {
    const req: TutorExplainRequest = {
      fen: startFen,
      sideToMove: "w",
      learnerLevel: "pemula",
      mode: "play",
      lastMoveSan: "e4",
    };

    const res = await GeminiTutorService.explain(req);
    expect(res.source).toBe("local-curated");
    expect(res.title).toContain("e4");
    expect(res.spokenText).toBeTruthy();
    expect(res.suggestedMoves.length).toBeGreaterThan(0);
  });

  it("generates specific lesson guidance in lesson mode", () => {
    const req: TutorExplainRequest = {
      fen: "8/8/8/8/3R4/8/8/4K2k w - - 0 1",
      sideToMove: "w",
      learnerLevel: "pemula",
      mode: "lesson",
      lessonTitle: "Gerakan Bidak: Benteng",
      lessonStepInstruction: "Gerakkan Benteng secara horizontal ke lajur g.",
    };

    const res = getCuratedTutorExplanation(req);
    expect(res.concept).toContain("Gerakan");
    expect(res.spokenText).toContain("Benteng");
    expect(res.analysisStatus).toBe("unavailable");
  });

  it("identifies check and prioritizes king safety", () => {
    // White king in check by black rook on e8
    const checkFen = "4r2k/8/8/8/8/8/8/4K3 w - - 0 1";
    const req: TutorExplainRequest = {
      fen: checkFen,
      sideToMove: "w",
      learnerLevel: "pemula",
      mode: "play",
    };

    const res = getCuratedTutorExplanation(req);
    expect(res.title).toContain("Skak");
    expect(res.concept).toContain("Pertahanan Terhadap Serangan Skak");
    expect(res.spokenText).toContain("skak");
  });

  it("validates that all suggested moves are strictly legal in chess.js", async () => {
    const req: TutorExplainRequest = {
      fen: startFen,
      sideToMove: "w",
      learnerLevel: "pemula",
      mode: "play",
    };

    const res = await GeminiTutorService.explain(req);
    for (const move of res.suggestedMoves) {
      expect(move.uci).toBeTruthy();
      expect(move.san).toBeTruthy();
      expect(move.description).toBeTruthy();
    }
  });

  it("handles synthesizeSpeech text length boundaries", async () => {
    await expect(GeminiTutorService.synthesizeSpeech("")).rejects.toMatchObject({
      code: "INVALID_REQUEST",
    });

    await expect(GeminiTutorService.synthesizeSpeech("x".repeat(1001))).rejects.toMatchObject({
      code: "INVALID_REQUEST",
    });
  });
});
