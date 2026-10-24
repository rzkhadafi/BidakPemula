import {
  LearningProfile,
  LearningRecommendation,
  SkillMastery,
} from "./types";
import {
  ALL_SKILL_IDS,
  getSkillDefinition,
  SKILL_DEFINITIONS,
} from "./skills-catalog";
import { ACADEMY_LESSONS, getLessonById } from "../academy/academy-catalog";
import { PUZZLE_CATALOG, getPuzzleById } from "../puzzles/puzzle-catalog";

/**
 * Generates the single best next learning recommendation for a user.
 * Deterministic, offline, and based entirely on real user evidence.
 */
export function generateNextRecommendation(
  profile: LearningProfile
): LearningRecommendation {
  const skills = profile.skills;

  // --------------------------------------------------------------------------
  // PRIORITAS 1: Prasyarat Belum Terpenuhi
  // --------------------------------------------------------------------------
  for (const skillId of ALL_SKILL_IDS) {
    const mastery = skills[skillId];
    if (mastery && mastery.status === "in_progress") {
      const def = getSkillDefinition(skillId);
      for (const prereqId of def.prerequisiteIds) {
        const prereqMastery = skills[prereqId];
        if (!prereqMastery || prereqMastery.status === "not_started" || prereqMastery.score < 40) {
          const prereqDef = getSkillDefinition(prereqId);
          // Find an active lesson for the prerequisite
          if (prereqDef.relatedLessonIds.length > 0) {
            const lesson = getLessonById(prereqDef.relatedLessonIds[0]);
            if (lesson) {
              return {
                id: `rec-prereq-${prereqId}`,
                type: "lesson",
                targetId: lesson.id,
                targetTitle: lesson.title,
                targetSubtitle: lesson.subtitle,
                skillId: prereqId,
                skillName: prereqDef.name,
                reason: `Untuk memahami ${def.name} dengan lancar, kuasai terlebih dahulu ${prereqDef.name}.`,
                priority: 100,
                href: `/academy/${lesson.id}`,
                actionLabel: "Pelajari Prasyarat",
              };
            }
          }
        }
      }
    }
  }

  // --------------------------------------------------------------------------
  // PRIORITAS 2: Kelemahan Nyata Berdasarkan Riwayat Kesalahan
  // --------------------------------------------------------------------------
  const weaknessCandidates = ALL_SKILL_IDS.map((id) => skills[id])
    .filter((m): m is SkillMastery => Boolean(m))
    .filter((m) => m.mistakesCount > 0 && m.status !== "mastered")
    .sort((a, b) => b.mistakesCount - a.mistakesCount || a.score - b.score);

  if (weaknessCandidates.length > 0) {
    const targetWeakness = weaknessCandidates[0];
    const def = getSkillDefinition(targetWeakness.skillId);

    // Prefer puzzle if available and not yet mastered
    if (def.relatedPuzzleIds.length > 0) {
      // Find a puzzle in this skill that had mistakes or was not solved
      const puzzleId = def.relatedPuzzleIds[0];
      const puz = getPuzzleById(puzzleId);
      if (puz) {
        return {
          id: `rec-weakness-${puz.id}`,
          type: "puzzle",
          targetId: puz.id,
          targetTitle: puz.title,
          targetSubtitle: `Taktik ${puz.theme}`,
          skillId: targetWeakness.skillId,
          skillName: def.name,
          reason: `Kamu masih beberapa kali keliru pada ${def.name}. Latihan ini membantumu melatih kepekaan posisi tersebut.`,
          priority: 90,
          href: `/puzzles/${puz.id}`,
          actionLabel: "Latih Kembali",
        };
      }
    } else if (def.relatedLessonIds.length > 0) {
      const lesson = getLessonById(def.relatedLessonIds[0]);
      if (lesson) {
        return {
          id: `rec-weakness-lesson-${lesson.id}`,
          type: "lesson",
          targetId: lesson.id,
          targetTitle: lesson.title,
          targetSubtitle: lesson.subtitle,
          skillId: targetWeakness.skillId,
          skillName: def.name,
          reason: `Mari segarkan kembali materi ${def.name} agar langkahmu semakin matang dan percaya diri.`,
          priority: 85,
          href: `/academy/${lesson.id}`,
          actionLabel: "Ulangi Latihan",
        };
      }
    }
  }

  // --------------------------------------------------------------------------
  // PRIORITAS 3: Pengulangan Materi Terencana (Spaced Repetition)
  // --------------------------------------------------------------------------
  const reviewCandidates = ALL_SKILL_IDS.map((id) => skills[id])
    .filter((m): m is SkillMastery => Boolean(m))
    .filter((m) => m.needsReview && m.status !== "not_started")
    .sort((a, b) => (a.score || 0) - (b.score || 0));

  if (reviewCandidates.length > 0) {
    const targetReview = reviewCandidates[0];
    const def = getSkillDefinition(targetReview.skillId);

    if (def.relatedPuzzleIds.length > 0) {
      const puz = getPuzzleById(def.relatedPuzzleIds[0]);
      if (puz) {
        return {
          id: `rec-review-${puz.id}`,
          type: "review",
          targetId: puz.id,
          targetTitle: puz.title,
          targetSubtitle: `Pengulangan Terencana`,
          skillId: targetReview.skillId,
          skillName: def.name,
          reason: `Sudah waktunya mengulang konsep ${def.name} agar memorimu tetap kuat saat bertanding.`,
          priority: 80,
          href: `/puzzles/${puz.id}`,
          actionLabel: "Mulai Pengulangan",
        };
      }
    } else if (def.relatedLessonIds.length > 0) {
      const lesson = getLessonById(def.relatedLessonIds[0]);
      if (lesson) {
        return {
          id: `rec-review-lesson-${lesson.id}`,
          type: "review",
          targetId: lesson.id,
          targetTitle: lesson.title,
          targetSubtitle: lesson.subtitle,
          skillId: targetReview.skillId,
          skillName: def.name,
          reason: `Konsep ${def.name} sudah beberapa hari tidak dilatih. Mari tinjau kembali sebentar.`,
          priority: 75,
          href: `/academy/${lesson.id}`,
          actionLabel: "Tinjau Materi",
        };
      }
    }
  }

  // --------------------------------------------------------------------------
  // PRIORITAS 4: Langkah Berikutnya dalam Kurikulum Akademi
  // --------------------------------------------------------------------------
  for (const lesson of ACADEMY_LESSONS) {
    const def = Object.values(SKILL_DEFINITIONS).find((s) => s.relatedLessonIds.includes(lesson.id));
    if (def) {
      const mastery = skills[def.id];
      if (!mastery || mastery.status === "not_started" || mastery.status === "in_progress") {
        return {
          id: `rec-curriculum-${lesson.id}`,
          type: "lesson",
          targetId: lesson.id,
          targetTitle: lesson.title,
          targetSubtitle: lesson.subtitle,
          skillId: def.id,
          skillName: def.name,
          reason: `Langkah belajar terstruktur berikutnya untuk melengkapi pemahaman catur dasarmu.`,
          priority: 70,
          href: `/academy/${lesson.id}`,
          actionLabel: "Lanjutkan Materi",
        };
      }
    }
  }

  // --------------------------------------------------------------------------
  // PRIORITAS 5: Tantangan Taktik Baru
  // --------------------------------------------------------------------------
  for (const puz of PUZZLE_CATALOG) {
    const def = Object.values(SKILL_DEFINITIONS).find((s) => s.relatedPuzzleIds.includes(puz.id));
    if (def) {
      const mastery = skills[def.id];
      if (!mastery || mastery.status !== "mastered") {
        return {
          id: `rec-challenge-${puz.id}`,
          type: "puzzle",
          targetId: puz.id,
          targetTitle: puz.title,
          targetSubtitle: `Taktik ${puz.theme}`,
          skillId: def.id,
          skillName: def.name,
          reason: `Kamu sudah memahami dasar-dasar bidak dengan baik. Saatnya mengasah insting taktis dengan tantangan ini!`,
          priority: 60,
          href: `/puzzles/${puz.id}`,
          actionLabel: "Coba Tantangan",
        };
      }
    }
  }

  // --------------------------------------------------------------------------
  // DEFAULT / FALLBACK (Jika semua kurikulum sudah diselesaikan)
  // --------------------------------------------------------------------------
  const firstLesson = ACADEMY_LESSONS[0];
  return {
    id: `rec-default-${firstLesson.id}`,
    type: "lesson",
    targetId: firstLesson.id,
    targetTitle: firstLesson.title,
    targetSubtitle: firstLesson.subtitle,
    skillId: "board-coordinates",
    skillName: "Mengenal Papan & Koordinat",
    reason: `Mulai petualangan caturmu dari fondasi paling mendasar: mengenal medan papan 64 petak.`,
    priority: 50,
    href: `/academy/${firstLesson.id}`,
    actionLabel: "Mulai Belajar",
  };
}
