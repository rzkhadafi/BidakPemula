import { describe, it, expect, beforeEach, vi } from "vitest";
import { GeminiTutorService, pcmToWav } from "@/features/tutor/server/gemini-service";
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

  it("converts raw PCM buffer into valid standard WAV container with 44-byte RIFF header", () => {
    // 240 samples of 16-bit silence (480 bytes)
    const mockPcm = Buffer.alloc(480);
    const wav = pcmToWav(mockPcm, 24000, 1, 16);

    expect(wav.length).toBe(44 + 480);
    expect(wav.subarray(0, 4).toString()).toBe("RIFF");
    expect(wav.readUInt32LE(4)).toBe(36 + 480);
    expect(wav.subarray(8, 12).toString()).toBe("WAVE");
    expect(wav.subarray(12, 16).toString()).toBe("fmt ");
    expect(wav.readUInt32LE(16)).toBe(16); // PCM fmt chunk size
    expect(wav.readUInt16LE(20)).toBe(1); // Audio format 1 = PCM
    expect(wav.readUInt16LE(22)).toBe(1); // 1 channel
    expect(wav.readUInt32LE(24)).toBe(24000); // Sample rate 24kHz
    expect(wav.readUInt32LE(28)).toBe(48000); // Byte rate (24000 * 1 * 16 / 8)
    expect(wav.readUInt16LE(32)).toBe(2); // Block align
    expect(wav.readUInt16LE(34)).toBe(16); // Bits per sample
    expect(wav.subarray(36, 40).toString()).toBe("data");
    expect(wav.readUInt32LE(40)).toBe(480);
  });

  describe("Tutor Question Answering (Quick Chips & Custom Input)", () => {
    it("answers 'Kenapa langkah ini penting?' with contextual reasons", () => {
      const req: TutorExplainRequest = {
        fen: startFen,
        sideToMove: "w",
        learnerLevel: "pemula",
        mode: "lesson",
        lessonTitle: "Mengenal Papan Catur",
        lessonStepInstruction: "Tunjukkan Petak Pusat e4",
        question: "Kenapa langkah ini penting?",
      };

      const res = getCuratedTutorExplanation(req);
      expect(res.title).toContain("Mengapa Langkah Ini Penting");
      expect(res.explanation).toContain("Jalur Terbuka");
      expect(res.spokenText).toContain("Pertanyaan bagus");
      expect(res.concept).toContain("Penempatan Petak Kunci");
    });

    it("answers 'Apa ancaman utama lawan?' by analyzing opposing threats", () => {
      // Opponent black rook on e8 attacks e4
      const threatFen = "4r2k/8/8/8/4P3/8/8/4K3 w - - 0 1";
      const req: TutorExplainRequest = {
        fen: threatFen,
        sideToMove: "w",
        learnerLevel: "pemula",
        mode: "play",
        question: "Apa ancaman utama lawan?",
      };

      const res = getCuratedTutorExplanation(req);
      expect(res.title).toContain("Membaca Ancaman Lawan");
      expect(res.explanation).toContain("Lawan memiliki perwira");
      expect(res.spokenText).toBeTruthy();
      expect(res.concept).toContain("Profilaksis");
    });

    it("answers 'Bisa jelaskan lebih sederhana?' with 3 golden rules", () => {
      const req: TutorExplainRequest = {
        fen: startFen,
        sideToMove: "w",
        learnerLevel: "pemula",
        mode: "play",
        question: "Bisa jelaskan lebih sederhana?",
      };

      const res = getCuratedTutorExplanation(req);
      expect(res.title).toContain("Ringkas & Sederhana");
      expect(res.explanation).toContain("3 aturan emas");
      expect(res.spokenText).toContain("sederhana");
      expect(res.concept).toContain("3 Aturan Emas Catur Pemula");
    });

    it("answers custom question about a specific piece like Kuda", () => {
      const req: TutorExplainRequest = {
        fen: startFen,
        sideToMove: "w",
        learnerLevel: "pemula",
        mode: "play",
        question: "Bagaimana cara terbaik menggerakkan kuda?",
      };

      const res = getCuratedTutorExplanation(req);
      expect(res.title).toContain("Kuda");
      expect(res.explanation).toContain("huruf L");
      expect(res.concept).toContain("Kuda");
    });
  });
});
