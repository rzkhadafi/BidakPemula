import { describe, it, expect, beforeEach } from "vitest";
import {
  getUnlockedBadges,
  unlockBadge,
  isBadgeUnlocked,
  resetBadges,
  subscribeBadgeUnlocked,
  ALL_BADGES,
  BADGES_CATALOG,
} from "@/features/badges";

describe("Beginner Badges of Honor (Badge Manager & Catalog)", () => {
  beforeEach(() => {
    window.localStorage.clear();
    resetBadges();
  });

  it("contains all 10 curated beginner badges in the catalog", () => {
    expect(ALL_BADGES).toHaveLength(10);
    expect(BADGES_CATALOG.first_move).toBeDefined();
    expect(BADGES_CATALOG.first_capture).toBeDefined();
    expect(BADGES_CATALOG.first_castle).toBeDefined();
    expect(BADGES_CATALOG.first_check).toBeDefined();
    expect(BADGES_CATALOG.first_promotion).toBeDefined();
    expect(BADGES_CATALOG.active_knights).toBeDefined();
    expect(BADGES_CATALOG.first_win).toBeDefined();
    expect(BADGES_CATALOG.puzzle_solver).toBeDefined();
    expect(BADGES_CATALOG.curious_student).toBeDefined();
    expect(BADGES_CATALOG.turning_point_hero).toBeDefined();
  });

  it("initializes with no badges unlocked", () => {
    const unlocked = getUnlockedBadges();
    expect(Object.keys(unlocked)).toHaveLength(0);
    expect(isBadgeUnlocked("first_move")).toBe(false);
  });

  it("unlocks a badge for the first time and returns badge definition", () => {
    const result = unlockBadge("first_castle");
    expect(result).not.toBeNull();
    expect(result?.id).toBe("first_castle");
    expect(result?.title).toBe("Benteng Kokoh");
    expect(isBadgeUnlocked("first_castle")).toBe(true);

    const unlocked = getUnlockedBadges();
    expect(unlocked.first_castle).toBeDefined();
    expect(unlocked.first_castle?.unlockedAt).toBeDefined();
  });

  it("does not unlock the same badge twice (returns null on second attempt)", () => {
    const firstResult = unlockBadge("first_move");
    expect(firstResult).not.toBeNull();

    const secondResult = unlockBadge("first_move");
    expect(secondResult).toBeNull();
  });

  it("notifies subscribers via custom event when a badge is unlocked", () => {
    let notifiedBadgeId: string | null = null;
    const unsubscribe = subscribeBadgeUnlocked((badge) => {
      notifiedBadgeId = badge.id;
    });

    unlockBadge("first_win");
    expect(notifiedBadgeId).toBe("first_win");

    unsubscribe();
  });

  it("resets all unlocked badges cleanly", () => {
    unlockBadge("first_move");
    unlockBadge("first_capture");
    expect(Object.keys(getUnlockedBadges())).toHaveLength(2);

    resetBadges();
    expect(Object.keys(getUnlockedBadges())).toHaveLength(0);
    expect(isBadgeUnlocked("first_move")).toBe(false);
  });
});
