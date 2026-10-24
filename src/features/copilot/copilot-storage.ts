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

export function getCoPilotPreferences(): CoPilotPreferences {
  if (typeof window === "undefined") {
    return DEFAULT_COPILOT_PREFERENCES;
  }

  try {
    const raw = localStorage.getItem(COPILOT_STORAGE_KEY);
    if (!raw) return DEFAULT_COPILOT_PREFERENCES;
    const parsed = JSON.parse(raw);
    return {
      enabled: typeof parsed.enabled === "boolean" ? parsed.enabled : DEFAULT_COPILOT_PREFERENCES.enabled,
      blunderSafetyNet: typeof parsed.blunderSafetyNet === "boolean" ? parsed.blunderSafetyNet : DEFAULT_COPILOT_PREFERENCES.blunderSafetyNet,
      socraticHintsEnabled: typeof parsed.socraticHintsEnabled === "boolean" ? parsed.socraticHintsEnabled : DEFAULT_COPILOT_PREFERENCES.socraticHintsEnabled,
      autoAudioHint: typeof parsed.autoAudioHint === "boolean" ? parsed.autoAudioHint : DEFAULT_COPILOT_PREFERENCES.autoAudioHint,
    };
  } catch {
    return DEFAULT_COPILOT_PREFERENCES;
  }
}

export function setCoPilotPreferences(prefs: Partial<CoPilotPreferences>): void {
  if (typeof window === "undefined") return;

  try {
    const current = getCoPilotPreferences();
    const updated: CoPilotPreferences = { ...current, ...prefs };
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
