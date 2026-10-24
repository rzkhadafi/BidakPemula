"use client";

import { useSyncExternalStore, useMemo } from "react";
import {
  subscribeToLearningProfile,
  getLearningProfileSnapshot,
  getLearningProfileServerSnapshot,
  calculateLearningSummary,
  recordActivityEvidence,
  clearLearningProfile,
  syncWithExistingProgress,
} from "./learning-storage";
import { LearningEvidence, LearningProfile, LearningSummary } from "./types";

export function useLearningProfile() {
  const profile: LearningProfile = useSyncExternalStore(
    subscribeToLearningProfile,
    getLearningProfileSnapshot,
    getLearningProfileServerSnapshot
  );

  const summary: LearningSummary = useMemo(() => {
    return calculateLearningSummary(profile);
  }, [profile]);

  const isNewUser = useMemo(() => {
    return (
      profile.processedEvidenceIds.length === 0 &&
      summary.masteredCount === 0 &&
      summary.inProgressCount === 0
    );
  }, [profile.processedEvidenceIds.length, summary.masteredCount, summary.inProgressCount]);

  return {
    profile,
    recommendation: profile.activeRecommendation,
    summary,
    isNewUser,
    recordActivity: (ev: Omit<LearningEvidence, "id"> & { id?: string }) => {
      recordActivityEvidence(ev);
    },
    sync: () => {
      syncWithExistingProgress(profile);
    },
    reset: () => {
      clearLearningProfile();
    },
  };
}
