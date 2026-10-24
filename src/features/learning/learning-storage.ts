import {
  LearningEvidence,
  LearningProfile,
  LearningSummary,
} from "./types";
import {
  ALL_SKILL_IDS,
  getSkillByLessonId,
  getSkillByPuzzleId,
} from "./skills-catalog";
import {
  createInitialSkillsRecord,
  evaluateAllSkills,
  updateSkillMastery,
} from "./mastery-evaluator";
import { generateNextRecommendation } from "./recommendation-engine";
import { getAcademyProgress } from "../academy/academy-progress";
import { getAllPuzzleProgress } from "../puzzles/puzzle-progress";

const STORAGE_KEY = "chess_archive_learning_profile_v1";
const SCHEMA_VERSION = 1;

let memoryCache: LearningProfile | null = null;
const listeners = new Set<() => void>();

function notifyListeners(): void {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (err) {
      console.error("Error in learning profile listener:", err);
    }
  });
}

export function subscribeToLearningProfile(callback: () => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

export function createDefaultProfile(): LearningProfile {
  const skills = createInitialSkillsRecord();
  const profile: LearningProfile = {
    schemaVersion: SCHEMA_VERSION,
    processedEvidenceIds: [],
    skills,
    evidenceHistory: [],
    lastEvaluatedAt: new Date().toISOString(),
    activeRecommendation: null,
  };
  profile.activeRecommendation = generateNextRecommendation(profile);
  return profile;
}

export function getLearningProfileServerSnapshot(): LearningProfile {
  return createDefaultProfile();
}

export function getLearningProfileSnapshot(): LearningProfile {
  return getLearningProfile();
}

/**
 * Retrieves the current LearningProfile from local storage or memory cache.
 * Auto-syncs with existing Academy and Puzzle progress on first read.
 */
export function getLearningProfile(): LearningProfile {
  if (typeof window === "undefined") {
    return createDefaultProfile();
  }

  if (memoryCache !== null) {
    return memoryCache;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = createDefaultProfile();
      memoryCache = syncWithExistingProgress(initial);
      saveLearningProfile(memoryCache);
      return memoryCache;
    }

    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && parsed.skills) {
      // Validate schema version
      const skills = createInitialSkillsRecord();
      for (const id of ALL_SKILL_IDS) {
        if (parsed.skills[id]) {
          skills[id] = {
            ...skills[id],
            ...parsed.skills[id],
          };
        }
      }

      const profile: LearningProfile = {
        schemaVersion: parsed.schemaVersion || SCHEMA_VERSION,
        processedEvidenceIds: Array.isArray(parsed.processedEvidenceIds)
          ? parsed.processedEvidenceIds
          : [],
        skills,
        evidenceHistory: Array.isArray(parsed.evidenceHistory)
          ? parsed.evidenceHistory
          : [],
        lastEvaluatedAt: parsed.lastEvaluatedAt || new Date().toISOString(),
        activeRecommendation: parsed.activeRecommendation || null,
      };

      // Always ensure an active recommendation is populated
      profile.activeRecommendation = generateNextRecommendation(profile);
      memoryCache = syncWithExistingProgress(profile);
      return memoryCache;
    }
  } catch (err) {
    console.warn("Failed to parse learning profile, resetting to default:", err);
  }

  memoryCache = createDefaultProfile();
  return memoryCache;
}

export function saveLearningProfile(profile: LearningProfile): void {
  memoryCache = profile;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch (err) {
      console.error("Failed to save learning profile to localStorage:", err);
    }
  }
  notifyListeners();
}

/**
 * Synchronizes with past Academy & Puzzle progress so past activities are honored.
 * Idempotent: previously synced activities will not be counted twice.
 */
export function syncWithExistingProgress(profile: LearningProfile): LearningProfile {
  if (typeof window === "undefined") return profile;

  let hasNewEvidence = false;
  const processedSet = new Set(profile.processedEvidenceIds);
  const newEvidences: LearningEvidence[] = [];

  // 1. Sync Academy Progress
  try {
    const academy = getAcademyProgress();
    if (academy && academy.completedLessonIds) {
      for (const lessonId of academy.completedLessonIds) {
        const syncId = `sync-academy-${lessonId}`;
        if (!processedSet.has(syncId)) {
          processedSet.add(syncId);
          const skillDef = getSkillByLessonId(lessonId);
          if (skillDef) {
            newEvidences.push({
              id: syncId,
              skillId: skillDef.id,
              sourceKind: "lesson_step",
              sourceId: lessonId,
              timestamp: academy.lastStudiedAt || new Date().toISOString(),
              outcome: "success",
              hintsUsed: 0,
              weight: 1.0,
            });
            hasNewEvidence = true;
          }
        }
      }
    }
  } catch {}

  // 2. Sync Puzzle Progress
  try {
    const puzzles = getAllPuzzleProgress();
    if (puzzles && typeof puzzles === "object") {
      for (const [puzId, pData] of Object.entries(puzzles)) {
        if (pData && pData.attempts > 0) {
          const syncId = `sync-puz-${puzId}-${pData.attempts}-${pData.mistakes}`;
          if (!processedSet.has(syncId)) {
            processedSet.add(syncId);
            const skillDef = getSkillByPuzzleId(puzId);
            if (skillDef) {
              const outcome = pData.solved
                ? pData.solutionRevealed
                  ? "assisted"
                  : "success"
                : "mistake";

              newEvidences.push({
                id: syncId,
                skillId: skillDef.id,
                sourceKind: "puzzle",
                sourceId: puzId,
                timestamp: pData.lastPlayedAt || new Date().toISOString(),
                outcome,
                hintsUsed: pData.hintsUsed || 0,
                weight: outcome === "success" ? 1.0 : outcome === "assisted" ? 0.2 : 0.5,
              });
              hasNewEvidence = true;
            }
          }
        }
      }
    }
  } catch {}

  if (!hasNewEvidence) {
    return profile;
  }

  // Evaluate skills with new evidences
  const updatedSkills = evaluateAllSkills(profile.skills, newEvidences);
  const updatedHistory = [...newEvidences, ...profile.evidenceHistory].slice(0, 50);

  const updatedProfile: LearningProfile = {
    ...profile,
    processedEvidenceIds: Array.from(processedSet),
    skills: updatedSkills,
    evidenceHistory: updatedHistory,
    lastEvaluatedAt: new Date().toISOString(),
  };

  updatedProfile.activeRecommendation = generateNextRecommendation(updatedProfile);
  saveLearningProfile(updatedProfile);
  return updatedProfile;
}

/**
 * Records a single new learning evidence with strict idempotency.
 */
export function recordActivityEvidence(
  evidenceInput: Omit<LearningEvidence, "id"> & { id?: string }
): void {
  const current = getLearningProfile();
  const id =
    evidenceInput.id ||
    `ev-${evidenceInput.skillId}-${evidenceInput.sourceId}-${Date.now()}`;

  // Idempotency check: ignore if already processed
  if (current.processedEvidenceIds.includes(id)) {
    return;
  }

  const evidence: LearningEvidence = {
    ...evidenceInput,
    id,
  };

  const processedEvidenceIds = [...current.processedEvidenceIds, id];
  const existingMastery =
    current.skills[evidence.skillId] || createInitialSkillsRecord()[evidence.skillId];

  const updatedMastery = updateSkillMastery(existingMastery, [evidence]);
  const skills = {
    ...current.skills,
    [evidence.skillId]: updatedMastery,
  };

  const evidenceHistory = [evidence, ...current.evidenceHistory].slice(0, 50);

  const updatedProfile: LearningProfile = {
    ...current,
    processedEvidenceIds,
    skills,
    evidenceHistory,
    lastEvaluatedAt: new Date().toISOString(),
  };

  updatedProfile.activeRecommendation = generateNextRecommendation(updatedProfile);
  saveLearningProfile(updatedProfile);
}

/**
 * Resets learning progress safely while preserving match records and settings.
 */
export function clearLearningProfile(): void {
  const defaultProfile = createDefaultProfile();
  memoryCache = defaultProfile;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }
  notifyListeners();
}

/**
 * Calculates human-readable summary stats from a LearningProfile.
 */
export function calculateLearningSummary(profile: LearningProfile): LearningSummary {
  const list = Object.values(profile.skills);
  let masteredCount = 0;
  let nearMasteryCount = 0;
  let inProgressCount = 0;
  let needsReviewCount = 0;
  let notStartedCount = 0;
  let totalScore = 0;

  for (const m of list) {
    totalScore += m.score;
    if (m.status === "mastered") masteredCount += 1;
    else if (m.status === "near_mastery") nearMasteryCount += 1;
    else if (m.status === "in_progress") inProgressCount += 1;
    else notStartedCount += 1;

    if (m.needsReview) needsReviewCount += 1;
  }

  const totalSkills = list.length;
  const overallMasteryPercent = Math.round(totalScore / totalSkills);

  const topStrengths = [...list]
    .filter((m) => m.status === "mastered" || m.status === "near_mastery")
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const focusAreas = [...list]
    .filter((m) => m.status === "in_progress" || m.needsReview)
    .sort((a, b) => b.mistakesCount - a.mistakesCount || a.score - b.score)
    .slice(0, 3);

  return {
    masteredCount,
    nearMasteryCount,
    inProgressCount,
    needsReviewCount,
    notStartedCount,
    totalSkills,
    overallMasteryPercent,
    topStrengths,
    focusAreas,
  };
}
