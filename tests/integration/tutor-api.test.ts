import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST as explainHandler } from "@/app/api/tutor/explain/route";
import { POST as speechHandler } from "@/app/api/tutor/speech/route";
import { NextRequest } from "next/server";

describe("Integration: Tutor API Endpoints", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("POST /api/tutor/explain", () => {
    it("returns 400 when FEN is missing or invalid", async () => {
      const req = new NextRequest("http://localhost:3000/api/tutor/explain", {
        method: "POST",
        body: JSON.stringify({
          sideToMove: "w",
          learnerLevel: "pemula",
          mode: "play",
        }),
      });

      const res = await explainHandler(req);
      expect(res.status).toBe(400);

      const json = await res.json();
      expect(json.code).toBe("INVALID_REQUEST");
    });

    it("returns 200 with valid explanation structure for standard start position", async () => {
      const req = new NextRequest("http://localhost:3000/api/tutor/explain", {
        method: "POST",
        body: JSON.stringify({
          fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
          sideToMove: "w",
          learnerLevel: "pemula",
          mode: "play",
          lastMoveSan: "e4",
        }),
      });

      const res = await explainHandler(req);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.title).toBeTruthy();
      expect(data.summary).toBeTruthy();
      expect(data.explanation).toBeTruthy();
      expect(data.spokenText).toBeTruthy();
      expect(data.concept).toBeTruthy();
      expect(Array.isArray(data.suggestedMoves)).toBe(true);
      expect(data.suggestedMoves.length).toBeGreaterThan(0);
    });
  });

  describe("POST /api/tutor/speech", () => {
    it("returns 400 when text parameter is missing or empty", async () => {
      const req = new NextRequest("http://localhost:3000/api/tutor/speech", {
        method: "POST",
        body: JSON.stringify({}),
      });

      const res = await speechHandler(req);
      expect(res.status).toBe(400);

      const json = await res.json();
      expect(json.code).toBe("INVALID_REQUEST");
    });

    it("returns 400 when text exceeds 1000 characters", async () => {
      const req = new NextRequest("http://localhost:3000/api/tutor/speech", {
        method: "POST",
        body: JSON.stringify({
          text: "kuda ".repeat(300),
        }),
      });

      const res = await speechHandler(req);
      expect(res.status).toBe(400);
    });

    it("returns 503 fallback when Gemini API key is not configured", async () => {
      delete process.env.GEMINI_API_KEY;

      const req = new NextRequest("http://localhost:3000/api/tutor/speech", {
        method: "POST",
        body: JSON.stringify({
          text: "Halo, ini penjelasan catur pemula.",
        }),
      });

      const res = await speechHandler(req);
      expect(res.status).toBe(503);

      const json = await res.json();
      expect(json.fallbackToWebSpeech).toBe(true);
    });
  });
});
