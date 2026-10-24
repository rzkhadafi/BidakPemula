export type SkillCategory = "fundamentals" | "tactics" | "strategy";

export type SkillId =
  // Dasar Permainan (Fundamentals)
  | "board-coordinates"
  | "piece-rook"
  | "piece-bishop"
  | "piece-queen"
  | "piece-knight"
  | "piece-pawn"
  | "piece-king"
  | "special-moves"
  // Taktik Dasar (Tactics)
  | "tactic-fork"
  | "tactic-pin"
  | "tactic-skewer"
  | "tactic-discovered-attack"
  | "tactic-remove-defender"
  | "tactic-checkmate"
  // Strategi Pemula (Strategy)
  | "strategy-center-control"
  | "strategy-piece-development"
  | "strategy-king-safety";

export type MasteryStatus =
  | "not_started"     // Belum dicoba
  | "in_progress"     // Sedang dipelajari
  | "near_mastery"    // Hampir dikuasai
  | "mastered";       // Dikuasai

export interface SkillDefinition {
  id: SkillId;
  name: string;
  category: SkillCategory;
  categoryLabel: string;
  description: string;
  prerequisiteIds: SkillId[];
  relatedLessonIds: string[];
  relatedPuzzleIds: string[];
}

export interface LearningEvidence {
  id: string; // Unique, deterministic ID to avoid double counting
  skillId: SkillId;
  sourceKind: "lesson_step" | "puzzle" | "game";
  sourceId: string;
  timestamp: string;
  outcome: "success" | "mistake" | "assisted";
  hintsUsed: number;
  weight: number;
}

export interface SkillMastery {
  skillId: SkillId;
  status: MasteryStatus;
  score: number; // 0 - 100
  confidence: "low" | "medium" | "high";
  attemptsCount: number;
  successCount: number;
  mistakesCount: number;
  hintsUsedCount: number;
  lastTrainedAt: string | null;
  nextReviewAt: string | null;
  needsReview: boolean;
}

export type RecommendationType = "lesson" | "puzzle" | "review";

export interface LearningRecommendation {
  id: string;
  type: RecommendationType;
  targetId: string;
  targetTitle: string;
  targetSubtitle?: string;
  skillId: SkillId;
  skillName: string;
  reason: string;
  priority: number;
  href: string;
  actionLabel: string;
}

export interface LearningProfile {
  schemaVersion: number;
  processedEvidenceIds: string[];
  skills: Record<SkillId, SkillMastery>;
  evidenceHistory: LearningEvidence[];
  lastEvaluatedAt: string;
  activeRecommendation: LearningRecommendation | null;
}

export interface LearningSummary {
  masteredCount: number;
  nearMasteryCount: number;
  inProgressCount: number;
  needsReviewCount: number;
  notStartedCount: number;
  totalSkills: number;
  overallMasteryPercent: number;
  topStrengths: SkillMastery[];
  focusAreas: SkillMastery[];
}
