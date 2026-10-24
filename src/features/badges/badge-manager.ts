import { BadgeDefinition, BadgeId, UnlockedBadge } from "./types";
import { BADGES_CATALOG } from "./catalog";

const BADGES_STORAGE_KEY = "chess_archive_badges_v1";
const BADGE_UNLOCKED_EVENT = "chess_badge_unlocked";
const BADGES_CHANGED_EVENT = "chess_badges_changed";

let cachedBadges: Partial<Record<BadgeId, UnlockedBadge>> | null = null;

function readBadgesFromStorage(): Partial<Record<BadgeId, UnlockedBadge>> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(BADGES_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function writeBadgesToStorage(badges: Partial<Record<BadgeId, UnlockedBadge>>): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(BADGES_STORAGE_KEY, JSON.stringify(badges));
  } catch {}
}

export function getUnlockedBadges(): Partial<Record<BadgeId, UnlockedBadge>> {
  if (!cachedBadges) {
    cachedBadges = readBadgesFromStorage();
  }
  return cachedBadges;
}

export function isBadgeUnlocked(id: BadgeId): boolean {
  const badges = getUnlockedBadges();
  return Boolean(badges[id]);
}

/**
 * Mencoba membuka lencana baru.
 * Mengembalikan BadgeDefinition jika lencana baru pertama kali didapatkan,
 * atau null jika lencana tersebut sudah pernah dibuka sebelumnya.
 */
export function unlockBadge(id: BadgeId): BadgeDefinition | null {
  if (typeof window === "undefined") return null;

  const current = getUnlockedBadges();
  if (current[id]) {
    return null; // Sudah pernah dibuka sebelumnya
  }

  const def = BADGES_CATALOG[id];
  if (!def) return null;

  const updated: Partial<Record<BadgeId, UnlockedBadge>> = {
    ...current,
    [id]: {
      id,
      unlockedAt: new Date().toISOString(),
    },
  };

  cachedBadges = updated;
  writeBadgesToStorage(updated);

  // Kirim event notifikasi untuk toast pop-up
  try {
    window.dispatchEvent(
      new CustomEvent<BadgeDefinition>(BADGE_UNLOCKED_EVENT, {
        detail: def,
      })
    );
    window.dispatchEvent(new Event(BADGES_CHANGED_EVENT));
  } catch {}

  return def;
}

export function subscribeBadgeUnlocked(
  callback: (badge: BadgeDefinition) => void
): () => void {
  if (typeof window === "undefined") return () => {};

  const handler = (event: Event) => {
    const customEvt = event as CustomEvent<BadgeDefinition>;
    if (customEvt.detail) {
      callback(customEvt.detail);
    }
  };

  window.addEventListener(BADGE_UNLOCKED_EVENT, handler);
  return () => {
    window.removeEventListener(BADGE_UNLOCKED_EVENT, handler);
  };
}

export function subscribeUnlockedBadges(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const handler = () => {
    cachedBadges = readBadgesFromStorage();
    callback();
  };

  window.addEventListener(BADGES_CHANGED_EVENT, handler);
  window.addEventListener("storage", handler);

  return () => {
    window.removeEventListener(BADGES_CHANGED_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

export function resetBadges(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(BADGES_STORAGE_KEY);
    cachedBadges = null;
    window.dispatchEvent(new Event(BADGES_CHANGED_EVENT));
  } catch {}
}
