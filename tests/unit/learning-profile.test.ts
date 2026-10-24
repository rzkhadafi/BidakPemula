import { describe, it, expect, beforeEach } from "vitest";
import {
  createDefaultProfile,
  createInitialSkillsRecord,
  updateSkillMastery,
  calculateLearningSummary,
  generateNextRecommendation,
  recordActivityEvidence,
  getLearningProfile,
  clearLearningProfile,
  ALL_SKILL_IDS,
} from "@/features/learning";
import { LearningEvidence } from "@/features/learning/types";

describe("Adaptive Learning System — Mastery Evaluator & Skills", () => {
  beforeEach(() => {
    clearLearningProfile();
  });

  it("initializes with all 17 skills in not_started state", () => {
    const profile = createDefaultProfile();
    expect(ALL_SKILL_IDS.length).toBe(17);
    expect(Object.keys(profile.skills).length).toBe(17);

    for (const skillId of ALL_SKILL_IDS) {
      const s = profile.skills[skillId];
      expect(s.status).toBe("not_started");
      expect(s.score).toBe(0);
      expect(s.confidence).toBe("low");
      expect(s.attemptsCount).toBe(0);
      expect(s.successCount).toBe(0);
      expect(s.mistakesCount).toBe(0);
    }
  });

  it("differentiates independent success from assisted solve (viewing solution)", () => {
    const initial = createInitialSkillsRecord()["tactic-fork"];

    // Independent success
    const evSuccess: LearningEvidence = {
      id: "ev-1",
      skillId: "tactic-fork",
      sourceKind: "puzzle",
      sourceId: "puz-fork-01",
      timestamp: new Date().toISOString(),
      outcome: "success",
      hintsUsed: 0,
      weight: 1.0,
    };
    const updatedSuccess = updateSkillMastery(initial, [evSuccess]);
    expect(updatedSuccess.score).toBe(25);
    expect(updatedSuccess.successCount).toBe(1);

    // Assisted solve (revealed solution)
    const evAssisted: LearningEvidence = {
      id: "ev-2",
      skillId: "tactic-fork",
      sourceKind: "puzzle",
      sourceId: "puz-fork-01",
      timestamp: new Date().toISOString(),
      outcome: "assisted",
      hintsUsed: 3,
      weight: 0.2,
    };
    const updatedAssisted = updateSkillMastery(initial, [evAssisted]);
    expect(updatedAssisted.score).toBe(2); // Only 2 points, no mastery inflation
    expect(updatedAssisted.status).toBe("in_progress");
  });

  it("ensures mistakes decrease score gently without completely erasing progress", () => {
    let mastery = createInitialSkillsRecord()["piece-knight"];

    // 2 successes
    mastery = updateSkillMastery(mastery, [
      {
        id: "ev-1",
        skillId: "piece-knight",
        sourceKind: "lesson_step",
        sourceId: "kuda-step-1",
        timestamp: new Date().toISOString(),
        outcome: "success",
        hintsUsed: 0,
        weight: 1.0,
      },
      {
        id: "ev-2",
        skillId: "piece-knight",
        sourceKind: "lesson_step",
        sourceId: "kuda-step-2",
        timestamp: new Date().toISOString(),
        outcome: "success",
        hintsUsed: 0,
        weight: 1.0,
      },
    ]);
    expect(mastery.score).toBe(50);

    // 1 mistake
    mastery = updateSkillMastery(mastery, [
      {
        id: "ev-3",
        skillId: "piece-knight",
        sourceKind: "lesson_step",
        sourceId: "kuda-step-3",
        timestamp: new Date().toISOString(),
        outcome: "mistake",
        hintsUsed: 0,
        weight: 0.5,
      },
    ]);
    expect(mastery.score).toBe(42); // 50 - 8 = 42 (retains progress)
    expect(mastery.mistakesCount).toBe(1);
    expect(mastery.status).toBe("in_progress");
  });

  it("does not grant 'mastered' status prematurely with few attempts", () => {
    let mastery = createInitialSkillsRecord()["piece-rook"];

    // 2 successes give score 50, but confidence is low
    mastery = updateSkillMastery(mastery, [
      {
        id: "ev-1",
        skillId: "piece-rook",
        sourceKind: "lesson_step",
        sourceId: "benteng-1",
        timestamp: new Date().toISOString(),
        outcome: "success",
        hintsUsed: 0,
        weight: 1.0,
      },
      {
        id: "ev-2",
        skillId: "piece-rook",
        sourceKind: "lesson_step",
        sourceId: "benteng-2",
        timestamp: new Date().toISOString(),
        outcome: "success",
        hintsUsed: 0,
        weight: 1.0,
      },
    ]);

    expect(mastery.status).toBe("in_progress");
    expect(mastery.confidence).toBe("low");
  });

  it("awards 'mastered' status only after consistent independent successes", () => {
    let mastery = createInitialSkillsRecord()["board-coordinates"];

    const evidences: LearningEvidence[] = Array.from({ length: 6 }).map((_, i) => ({
      id: `ev-board-${i}`,
      skillId: "board-coordinates",
      sourceKind: "lesson_step",
      sourceId: `papan-step-${i}`,
      timestamp: new Date().toISOString(),
      outcome: "success",
      hintsUsed: 0,
      weight: 1.0,
    }));

    mastery = updateSkillMastery(mastery, evidences);
    expect(mastery.score).toBe(100);
    expect(mastery.confidence).toBe("high");
    expect(mastery.status).toBe("mastered");
    expect(mastery.nextReviewAt).toBeTruthy();
  });

  it("ignores duplicate activity IDs for strict idempotency", () => {
    const ev = {
      id: "unique-event-id-123",
      skillId: "piece-bishop" as const,
      sourceKind: "lesson_step" as const,
      sourceId: "gajah-step-1",
      timestamp: new Date().toISOString(),
      outcome: "success" as const,
      hintsUsed: 0,
      weight: 1.0,
    };

    recordActivityEvidence(ev);
    const firstRead = getLearningProfile();
    expect(firstRead.skills["piece-bishop"].attemptsCount).toBe(1);

    // Call again with exact same ID
    recordActivityEvidence(ev);
    const secondRead = getLearningProfile();
    expect(secondRead.skills["piece-bishop"].attemptsCount).toBe(1); // Not incremented!
  });
});

describe("Adaptive Learning System — Recommendation Engine", () => {
  it("recommends foundational lesson 'mengenal-papan' for new users", () => {
    const profile = createDefaultProfile();
    const rec = generateNextRecommendation(profile);

    expect(rec).toBeDefined();
    expect(rec.type).toBe("lesson");
    expect(rec.targetId).toBe("mengenal-papan");
    expect(rec.reason).toContain("pemahaman catur");
  });

  it("prioritizes unfulfilled prerequisites before tackling advanced topics", () => {
    const profile = createDefaultProfile();

    // User attempts fork tactics without having learned knight moves
    profile.skills["tactic-fork"] = {
      ...profile.skills["tactic-fork"],
      status: "in_progress",
      attemptsCount: 1,
      score: 10,
    };
    profile.skills["piece-knight"] = {
      ...profile.skills["piece-knight"],
      status: "not_started",
      score: 0,
    };

    const rec = generateNextRecommendation(profile);
    expect(rec.skillId).toBe("piece-knight");
    expect(rec.href).toContain("gerak-kuda");
    expect(rec.reason).toContain("kuasai terlebih dahulu");
  });

  it("prioritizes documented weaknesses with high mistake counts", () => {
    const profile = createDefaultProfile();

    // Mark knight as learned so prereq doesn't block
    profile.skills["piece-knight"] = {
      ...profile.skills["piece-knight"],
      status: "mastered",
      score: 90,
      confidence: "high",
    };

    // User has 3 mistakes on fork tactics
    profile.skills["tactic-fork"] = {
      ...profile.skills["tactic-fork"],
      status: "in_progress",
      attemptsCount: 4,
      successCount: 1,
      mistakesCount: 3,
      score: 20,
    };

    const rec = generateNextRecommendation(profile);
    expect(rec.skillId).toBe("tactic-fork");
    expect(rec.type).toBe("puzzle");
    expect(rec.reason).toContain("keliru");
  });

  it("prioritizes spaced review when a skill is flagged as needsReview", () => {
    const profile = createDefaultProfile();

    // Bishop skill needs review
    profile.skills["piece-bishop"] = {
      ...profile.skills["piece-bishop"],
      status: "near_mastery",
      score: 75,
      confidence: "medium",
      needsReview: true,
      lastTrainedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    };

    const rec = generateNextRecommendation(profile);
    expect(rec.skillId).toBe("piece-bishop");
    expect(rec.reason).toContain("mengulang");
  });

  it("calculates learning summary stats accurately", () => {
    const profile = createDefaultProfile();
    profile.skills["board-coordinates"].status = "mastered";
    profile.skills["board-coordinates"].score = 100;

    profile.skills["piece-rook"].status = "in_progress";
    profile.skills["piece-rook"].score = 40;

    profile.skills["piece-bishop"].status = "in_progress";
    profile.skills["piece-bishop"].score = 50;
    profile.skills["piece-bishop"].needsReview = true;

    const summary = calculateLearningSummary(profile);
    expect(summary.masteredCount).toBe(1);
    expect(summary.inProgressCount).toBe(2);
    expect(summary.needsReviewCount).toBe(1);
    expect(summary.totalSkills).toBe(17);
    expect(summary.overallMasteryPercent).toBeGreaterThan(0);
  });
});
