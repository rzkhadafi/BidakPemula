import { TutorPreferences } from "./types";

const STORAGE_KEY = "chess_archive_tutor_prefs_v1";

const DEFAULT_PREFERENCES: TutorPreferences = {
  autoplay: false,
  speed: 1.0,
  voice: "Aoede",
};

let memoryCache: TutorPreferences | null = null;
const listeners = new Set<() => void>();

function notify(): void {
  listeners.forEach((fn) => {
    try {
      fn();
    } catch {}
  });
}

export function getServerTutorPreferencesSnapshot(): TutorPreferences {
  return DEFAULT_PREFERENCES;
}

export function getTutorPreferences(): TutorPreferences {
  if (typeof window === "undefined") {
    return DEFAULT_PREFERENCES;
  }

  if (memoryCache !== null) {
    return memoryCache;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      memoryCache = DEFAULT_PREFERENCES;
      return memoryCache;
    }
    const parsed = JSON.parse(raw);
    memoryCache = {
      autoplay: Boolean(parsed.autoplay),
      speed: parsed.speed === 0.85 || parsed.speed === 1.25 ? parsed.speed : 1.0,
      voice: typeof parsed.voice === "string" && parsed.voice.trim() ? parsed.voice.trim() : "Aoede",
    };
    return memoryCache;
  } catch {
    memoryCache = DEFAULT_PREFERENCES;
    return memoryCache;
  }
}

export function saveTutorPreferences(prefs: Partial<TutorPreferences>): void {
  const current = getTutorPreferences();
  const next: TutorPreferences = {
    ...current,
    ...prefs,
  };
  memoryCache = next;

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  }

  notify();
}

export function subscribeTutorPreferences(callback: () => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}
