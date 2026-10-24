import { AcademyProgress } from "./types";

const STORAGE_KEY = "chess_archive_academy_progress_v1";
const SCHEMA_VERSION = 1;

let memoryCache: AcademyProgress | null = null;
const listeners = new Set<() => void>();

function notify(): void {
  listeners.forEach((cb) => {
    try {
      cb();
    } catch {}
  });
}

const DEFAULT_PROGRESS: AcademyProgress = {
  schemaVersion: SCHEMA_VERSION,
  completedLessonIds: [],
  currentLessonId: "mengenal-papan",
  lastStudiedAt: new Date().toISOString(),
  stepProgress: {},
};

export function getAcademyProgress(): AcademyProgress {
  if (typeof window === "undefined") {
    return DEFAULT_PROGRESS;
  }

  if (memoryCache !== null) {
    return memoryCache;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      memoryCache = DEFAULT_PROGRESS;
      return memoryCache;
    }
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      memoryCache = {
        schemaVersion: parsed.schemaVersion || SCHEMA_VERSION,
        completedLessonIds: Array.isArray(parsed.completedLessonIds) ? parsed.completedLessonIds : [],
        currentLessonId: parsed.currentLessonId || "mengenal-papan",
        lastStudiedAt: parsed.lastStudiedAt || new Date().toISOString(),
        stepProgress: parsed.stepProgress && typeof parsed.stepProgress === "object" ? parsed.stepProgress : {},
      };
      return memoryCache;
    }
  } catch {}

  memoryCache = DEFAULT_PROGRESS;
  return memoryCache;
}

export function saveAcademyProgress(progress: AcademyProgress): void {
  memoryCache = progress;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {}
  }
  notify();
}

export function markLessonStepCompleted(lessonId: string, stepIndex: number, totalSteps: number): void {
  const current = { ...getAcademyProgress() };
  const currentStep = current.stepProgress[lessonId] || 0;
  const newStep = Math.max(currentStep, stepIndex + 1);

  current.stepProgress = {
    ...current.stepProgress,
    [lessonId]: newStep,
  };
  current.currentLessonId = lessonId;
  current.lastStudiedAt = new Date().toISOString();

  if (newStep >= totalSteps && !current.completedLessonIds.includes(lessonId)) {
    current.completedLessonIds = [...current.completedLessonIds, lessonId];
  }

  saveAcademyProgress(current);
}

export function markLessonCompleted(lessonId: string): void {
  const current = { ...getAcademyProgress() };
  if (!current.completedLessonIds.includes(lessonId)) {
    current.completedLessonIds = [...current.completedLessonIds, lessonId];
    current.lastStudiedAt = new Date().toISOString();
    saveAcademyProgress(current);
  }
}

export function clearAcademyProgress(): void {
  memoryCache = { ...DEFAULT_PROGRESS, lastStudiedAt: new Date().toISOString() };
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }
  notify();
}

export function subscribeToAcademyProgress(callback: () => void): () => void {
  listeners.add(callback);
  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      memoryCache = null;
      callback();
    }
  };
  if (typeof window !== "undefined") {
    window.addEventListener("storage", handleStorage);
  }
  return () => {
    listeners.delete(callback);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", handleStorage);
    }
  };
}

export function getAcademyProgressSnapshot(): AcademyProgress {
  return getAcademyProgress();
}

export function getAcademyProgressServerSnapshot(): AcademyProgress {
  return DEFAULT_PROGRESS;
}
