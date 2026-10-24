import { CoPilotPreferences } from "./types";

const COPILOT_STORAGE_KEY = "chess_archive_copilot_v1";

export const DEFAULT_COPILOT_PREFERENCES: CoPilotPreferences = {
  enabled: true,
  blunderSafetyNet: true,
  socraticHintsEnabled: true,
  autoAudioHint: false,
};

type CoPilotListener = (prefs: CoPilotPreferences) => void;
const listeners = new Set<CoPilotListener>();

// In-memory cache to guarantee reference stability for useSyncExternalStore
let memoryCache: CoPilotPreferences | null = null;

export function getCoPilotPreferences(): CoPilotPreferences {
  if (typeof window === "undefined") {
    return DEFAULT_COPILOT_PREFERENCES;
  }

  if (memoryCache !== null) {
    return memoryCache;
  }

  try {
    const raw = localStorage.getItem(COPILOT_STORAGE_KEY);
    if (!raw) {
      memoryCache = DEFAULT_COPILOT_PREFERENCES;
      return memoryCache;
    }
    const parsed = JSON.parse(raw);
    memoryCache = {
      enabled: typeof parsed.enabled === "boolean" ? parsed.enabled : DEFAULT_COPILOT_PREFERENCES.enabled,
      blunderSafetyNet: typeof parsed.blunderSafetyNet === "boolean" ? parsed.blunderSafetyNet : DEFAULT_COPILOT_PREFERENCES.blunderSafetyNet,
      socraticHintsEnabled: typeof parsed.socraticHintsEnabled === "boolean" ? parsed.socraticHintsEnabled : DEFAULT_COPILOT_PREFERENCES.socraticHintsEnabled,
      autoAudioHint: typeof parsed.autoAudioHint === "boolean" ? parsed.autoAudioHint : DEFAULT_COPILOT_PREFERENCES.autoAudioHint,
    };
  } catch {
    memoryCache = DEFAULT_COPILOT_PREFERENCES;
  }

  return memoryCache;
}

export function setCoPilotPreferences(prefs: Partial<CoPilotPreferences>): void {
  if (typeof window === "undefined") return;

  try {
    const current = getCoPilotPreferences();
    const updated: CoPilotPreferences = { ...current, ...prefs };
    memoryCache = updated;
    localStorage.setItem(COPILOT_STORAGE_KEY, JSON.stringify(updated));
    listeners.forEach((l) => l(updated));
  } catch {
    // Abaikan
  }
}

export function subscribeCoPilotPreferences(listener: CoPilotListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
