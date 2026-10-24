import { PuzzleProgress, PuzzleProgressSummary, ChessPuzzle } from "./types";

const STORAGE_KEY = "chess_archive_puzzle_progress_v1";
const SCHEMA_VERSION = 1;

// In-memory cache for SSR-safe reading and synchronization
let memoryCache: Record<string, PuzzleProgress> | null = null;
const listeners = new Set<() => void>();

function notifyListeners(): void {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.error("Error in puzzle progress listener:", e);
    }
  });
}

function parseStoredProgress(raw: string | null): Record<string, PuzzleProgress> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};

    // Validate and sanitize each item
    const sanitized: Record<string, PuzzleProgress> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (
        value &&
        typeof value === "object" &&
        "puzzleId" in value &&
        typeof (value as PuzzleProgress).puzzleId === "string"
      ) {
        const item = value as PuzzleProgress;
        sanitized[key] = {
          schemaVersion: item.schemaVersion || SCHEMA_VERSION,
          puzzleId: item.puzzleId,
          attempts: typeof item.attempts === "number" ? item.attempts : 0,
          mistakes: typeof item.mistakes === "number" ? item.mistakes : 0,
          hintsUsed: typeof item.hintsUsed === "number" ? item.hintsUsed : 0,
          solved: Boolean(item.solved),
          solutionRevealed: Boolean(item.solutionRevealed),
          lastPlayedAt: item.lastPlayedAt || new Date().toISOString(),
          solvedAt: item.solvedAt,
        };
      }
    }
    return sanitized;
  } catch (err) {
    console.warn("Failed to parse puzzle progress from localStorage:", err);
    return {};
  }
}

export function getAllPuzzleProgress(): Record<string, PuzzleProgress> {
  if (typeof window === "undefined") {
    return {};
  }

  if (memoryCache !== null) {
    return memoryCache;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    memoryCache = parseStoredProgress(raw);
  } catch {
    memoryCache = {};
  }

  return memoryCache;
}

export function getPuzzleProgress(puzzleId: string): PuzzleProgress | null {
  const all = getAllPuzzleProgress();
  return all[puzzleId] || null;
}

export function saveAllPuzzleProgress(data: Record<string, PuzzleProgress>): void {
  memoryCache = data;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.error("Failed to save puzzle progress to localStorage:", err);
    }
  }
  notifyListeners();
}

export function recordPuzzleAttempt(puzzleId: string, isMistake: boolean): void {
  const all = { ...getAllPuzzleProgress() };
  const existing = all[puzzleId] || {
    schemaVersion: SCHEMA_VERSION,
    puzzleId,
    attempts: 0,
    mistakes: 0,
    hintsUsed: 0,
    solved: false,
    solutionRevealed: false,
    lastPlayedAt: new Date().toISOString(),
  };

  const updated: PuzzleProgress = {
    ...existing,
    attempts: existing.attempts + 1,
    mistakes: isMistake ? existing.mistakes + 1 : existing.mistakes,
    lastPlayedAt: new Date().toISOString(),
  };

  all[puzzleId] = updated;
  saveAllPuzzleProgress(all);
}

export function recordHintUsed(puzzleId: string, hintLevel: number): void {
  const all = { ...getAllPuzzleProgress() };
  const existing = all[puzzleId] || {
    schemaVersion: SCHEMA_VERSION,
    puzzleId,
    attempts: 0,
    mistakes: 0,
    hintsUsed: 0,
    solved: false,
    solutionRevealed: false,
    lastPlayedAt: new Date().toISOString(),
  };

  const updated: PuzzleProgress = {
    ...existing,
    hintsUsed: Math.max(existing.hintsUsed, hintLevel),
    lastPlayedAt: new Date().toISOString(),
  };

  all[puzzleId] = updated;
  saveAllPuzzleProgress(all);
}

export function recordPuzzleSolved(puzzleId: string, solutionRevealed: boolean): void {
  const all = { ...getAllPuzzleProgress() };
  const existing = all[puzzleId] || {
    schemaVersion: SCHEMA_VERSION,
    puzzleId,
    attempts: 1,
    mistakes: 0,
    hintsUsed: 0,
    solved: false,
    solutionRevealed: false,
    lastPlayedAt: new Date().toISOString(),
  };

  const isSelfSolved = !solutionRevealed && !existing.solutionRevealed;

  const updated: PuzzleProgress = {
    ...existing,
    // Only mark solved if solved autonomously without viewing solution
    solved: isSelfSolved ? true : existing.solved,
    solutionRevealed: solutionRevealed || existing.solutionRevealed,
    lastPlayedAt: new Date().toISOString(),
    solvedAt: isSelfSolved ? existing.solvedAt || new Date().toISOString() : existing.solvedAt,
  };

  all[puzzleId] = updated;
  saveAllPuzzleProgress(all);
}

export function clearPuzzleProgress(): void {
  memoryCache = {};
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.error("Failed to remove puzzle progress:", err);
    }
  }
  notifyListeners();
}

export function calculateProgressSummary(
  catalog: ChessPuzzle[],
  progressMap: Record<string, PuzzleProgress>
): PuzzleProgressSummary {
  const totalPuzzles = catalog.length;
  let solvedCount = 0;
  let attemptedCount = 0;
  let solutionRevealedCount = 0;

  for (const puzzle of catalog) {
    const prog = progressMap[puzzle.id];
    if (prog) {
      if (prog.attempts > 0 || prog.solved || prog.solutionRevealed) {
        attemptedCount++;
      }
      if (prog.solved) {
        solvedCount++;
      } else if (prog.solutionRevealed) {
        solutionRevealedCount++;
      }
    }
  }

  const accuracyPercent =
    attemptedCount > 0 ? Math.round((solvedCount / attemptedCount) * 100) : 0;

  return {
    totalPuzzles,
    solvedCount,
    attemptedCount,
    solutionRevealedCount,
    accuracyPercent,
  };
}

// React 19 useSyncExternalStore integrations
export function subscribeToPuzzleProgress(callback: () => void): () => void {
  listeners.add(callback);

  const handleStorageEvent = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      memoryCache = parseStoredProgress(event.newValue);
      callback();
    }
  };

  if (typeof window !== "undefined") {
    window.addEventListener("storage", handleStorageEvent);
  }

  return () => {
    listeners.delete(callback);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", handleStorageEvent);
    }
  };
}

const EMPTY_RECORD: Record<string, PuzzleProgress> = {};

export function getPuzzleProgressSnapshot(): Record<string, PuzzleProgress> {
  return getAllPuzzleProgress();
}

export function getPuzzleProgressServerSnapshot(): Record<string, PuzzleProgress> {
  return EMPTY_RECORD;
}
