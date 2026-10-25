import { describe, it, expect, beforeEach } from "vitest";
import { Chess, Square } from "chess.js";
import {
  ACADEMY_LESSONS,
  getLessonById,
  getNextLessonId,
} from "@/features/academy/academy-catalog";
import {
  getAcademyProgress,
  markLessonStepCompleted,
  markLessonCompleted,
  clearAcademyProgress,
} from "@/features/academy/academy-progress";

describe("Academy Curriculum & Catalog Verification", () => {
  it("contains exactly 10 structured lessons for absolute beginners", () => {
    expect(ACADEMY_LESSONS.length).toBe(10);
  });

  it("has valid sequence order from 1 to 10", () => {
    ACADEMY_LESSONS.forEach((lesson, idx) => {
      expect(lesson.order).toBe(idx + 1);
      expect(lesson.id).toBeTruthy();
      expect(lesson.title).toBeTruthy();
      expect(lesson.summary).toBeTruthy();
      expect(lesson.steps.length).toBeGreaterThan(0);
    });
  });

  it("validates all lesson steps have legal starting FENs and valid moves", () => {
    for (const lesson of ACADEMY_LESSONS) {
      for (const step of lesson.steps) {
        expect(step.id).toBeTruthy();
        expect(step.instruction).toBeTruthy();
        expect(step.hint).toBeTruthy();

        // Validate FEN with chess.js
        let c: Chess;
        if (step.fen.startsWith("8/8/8/8/8/8/8/8")) {
          c = new Chess();
          c.clear();
          expect(c.fen()).toContain("8/8/8/8/8/8/8/8");
        } else {
          c = new Chess(step.fen);
          expect(c.fen()).toBeTruthy();
        }

        if (step.expectedMoveUci) {
          const from = step.expectedMoveUci.slice(0, 2);
          const to = step.expectedMoveUci.slice(2, 4);
          const promotion = (step.expectedMoveUci[4] as "q" | "r" | "b" | "n") || undefined;
          const targetPieceBeforeMove = c.get(to as Square);

          const res = c.move({ from, to, promotion });
          expect(res).not.toBeNull();

          // Strict validation: if instruction says "Tangkap" or "Pukul", target piece must exist and match!
          if (step.instruction.startsWith("Tangkap") || step.instruction.startsWith("Pukul")) {
            expect(res?.captured).toBeTruthy();
            expect(targetPieceBeforeMove).not.toBeNull();

            if (step.instruction.includes("Kuda")) {
              expect(targetPieceBeforeMove?.type).toBe("n");
            }
            if (step.instruction.includes("Pion")) {
              expect(targetPieceBeforeMove?.type).toBe("p");
            }
            if (step.instruction.includes("Benteng")) {
              expect(targetPieceBeforeMove?.type).toBe("r");
            }
          }
        }
      }
    }
  });

  it("correctly retrieves lesson by ID and computes next lesson ID", () => {
    const firstLesson = getLessonById("mengenal-papan");
    expect(firstLesson).toBeDefined();
    expect(firstLesson?.order).toBe(1);

    const nextId = getNextLessonId("mengenal-papan");
    expect(nextId).toBe("kenalan-pasukan");

    const thirdId = getNextLessonId("kenalan-pasukan");
    expect(thirdId).toBe("gerak-benteng");

    const nonExistent = getLessonById("unknown-lesson");
    expect(nonExistent).toBeUndefined();

    const lastNext = getNextLessonId("prinsip-strategi-dasar");
    expect(lastNext).toBeNull();
  });
});

describe("Academy Progress Persistence & Subscription", () => {
  beforeEach(() => {
    clearAcademyProgress();
    window.localStorage.clear();
  });

  it("initializes with default progress", () => {
    const progress = getAcademyProgress();
    expect(progress.completedLessonIds).toEqual([]);
    expect(progress.currentLessonId).toBe("mengenal-papan");
    expect(progress.stepProgress).toEqual({});
  });

  it("updates step progress and marks lesson completed when reaching total steps", () => {
    markLessonStepCompleted("mengenal-papan", 0, 3);
    let progress = getAcademyProgress();
    expect(progress.stepProgress["mengenal-papan"]).toBe(1);
    expect(progress.completedLessonIds).not.toContain("mengenal-papan");

    markLessonStepCompleted("mengenal-papan", 2, 3);
    progress = getAcademyProgress();
    expect(progress.stepProgress["mengenal-papan"]).toBe(3);
    expect(progress.completedLessonIds).toContain("mengenal-papan");
  });

  it("marks lesson completed directly and persists", () => {
    markLessonCompleted("benteng-benteng-tangguh");
    const progress = getAcademyProgress();
    expect(progress.completedLessonIds).toContain("benteng-benteng-tangguh");
  });

  it("clears progress back to initial default state", () => {
    markLessonCompleted("benteng-benteng-tangguh");
    expect(getAcademyProgress().completedLessonIds.length).toBe(1);

    clearAcademyProgress();
    expect(getAcademyProgress().completedLessonIds).toEqual([]);
    expect(getAcademyProgress().stepProgress).toEqual({});
  });
});
