import { LearningEvidence, MasteryStatus, SkillId, SkillMastery } from "./types";
import { ALL_SKILL_IDS } from "./skills-catalog";

export const INITIAL_SKILL_MASTERY = (skillId: SkillId): SkillMastery => ({
  skillId,
  status: "not_started",
  score: 0,
  confidence: "low",
  attemptsCount: 0,
  successCount: 0,
  mistakesCount: 0,
  hintsUsedCount: 0,
  lastTrainedAt: null,
  nextReviewAt: null,
  needsReview: false,
});

export function createInitialSkillsRecord(): Record<SkillId, SkillMastery> {
  const result = {} as Record<SkillId, SkillMastery>;
  for (const id of ALL_SKILL_IDS) {
    result[id] = INITIAL_SKILL_MASTERY(id);
  }
  return result;
}

/**
 * Calculates review interval in milliseconds based on mastery status.
 */
function getReviewIntervalMs(status: MasteryStatus): number {
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  switch (status) {
    case "in_progress":
      return 2 * ONE_DAY_MS;
    case "near_mastery":
      return 4 * ONE_DAY_MS;
    case "mastered":
      return 7 * ONE_DAY_MS;
    default:
      return 1 * ONE_DAY_MS;
  }
}

/**
 * Computes updated SkillMastery from an existing state and a new batch of evidences.
 * Uses bounded rule-based scoring and confidence thresholding.
 */
export function updateSkillMastery(
  current: SkillMastery,
  newEvidences: LearningEvidence[],
  now: Date = new Date()
): SkillMastery {
  let score = current.score;
  let attemptsCount = current.attemptsCount;
  let successCount = current.successCount;
  let mistakesCount = current.mistakesCount;
  let hintsUsedCount = current.hintsUsedCount;
  let lastTrainedAt = current.lastTrainedAt;

  for (const ev of newEvidences) {
    attemptsCount += 1;
    hintsUsedCount += ev.hintsUsed;
    lastTrainedAt = ev.timestamp;

    if (ev.outcome === "success") {
      successCount += 1;
      // High score increment for clean independent solve
      const gain = ev.hintsUsed === 0 ? 25 : Math.max(8, 20 - ev.hintsUsed * 5);
      score = Math.min(100, score + gain);
    } else if (ev.outcome === "assisted") {
      // Solution was revealed: user saw the answer so minimal mastery gained
      score = Math.min(100, score + 2);
    } else if (ev.outcome === "mistake") {
      mistakesCount += 1;
      // Mistakes decrease score gently without wiping existing mastery
      score = Math.max(0, score - 8);
    }
  }

  // Determine confidence based on quantity and diversity of attempts
  let confidence: "low" | "medium" | "high" = "low";
  if (attemptsCount >= 6 && successCount >= 3) {
    confidence = "high";
  } else if (attemptsCount >= 3) {
    confidence = "medium";
  }

  // Determine mastery status
  let status: MasteryStatus = "not_started";
  if (attemptsCount === 0) {
    status = "not_started";
  } else if (score >= 85 && confidence === "high" && successCount >= 4) {
    status = "mastered";
  } else if (score >= 60 && confidence !== "low" && successCount >= 2) {
    status = "near_mastery";
  } else {
    status = "in_progress";
  }

  // Calculate spaced repetition review date
  let nextReviewAt: string | null = null;
  let needsReview = false;

  if (lastTrainedAt && status !== "not_started") {
    const lastDate = new Date(lastTrainedAt);
    const intervalMs = getReviewIntervalMs(status);
    const nextDate = new Date(lastDate.getTime() + intervalMs);
    nextReviewAt = nextDate.toISOString();

    if (now.getTime() >= nextDate.getTime()) {
      needsReview = true;
    }
  }

  return {
    skillId: current.skillId,
    status,
    score,
    confidence,
    attemptsCount,
    successCount,
    mistakesCount,
    hintsUsedCount,
    lastTrainedAt,
    nextReviewAt,
    needsReview,
  };
}

/**
 * Evaluates entire skills record against a set of evidences.
 */
export function evaluateAllSkills(
  existingSkills: Record<SkillId, SkillMastery>,
  evidences: LearningEvidence[],
  now: Date = new Date()
): Record<SkillId, SkillMastery> {
  const result = { ...existingSkills };

  // Group evidences by skillId
  const grouped = new Map<SkillId, LearningEvidence[]>();
  for (const ev of evidences) {
    const list = grouped.get(ev.skillId) || [];
    list.push(ev);
    grouped.set(ev.skillId, list);
  }

  for (const skillId of ALL_SKILL_IDS) {
    const current = result[skillId] || INITIAL_SKILL_MASTERY(skillId);
    const skillEvidences = grouped.get(skillId) || [];
    if (skillEvidences.length > 0) {
      result[skillId] = updateSkillMastery(current, skillEvidences, now);
    } else {
      // Re-evaluate needsReview based on current time
      if (current.nextReviewAt && current.status !== "not_started") {
        const nextDate = new Date(current.nextReviewAt);
        result[skillId] = {
          ...current,
          needsReview: now.getTime() >= nextDate.getTime(),
        };
      }
    }
  }

  return result;
}
