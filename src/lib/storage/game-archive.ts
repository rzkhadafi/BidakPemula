import { ArchivedGame } from "@/types/chess";

const STORAGE_KEY = "chess_archive_games_v1";
export const CURRENT_SCHEMA_VERSION = 1;

let listeners: Array<() => void> = [];
let cachedGames: ArchivedGame[] | null = null;

function notifyListeners() {
  cachedGames = null;
  for (const listener of listeners) {
    try {
      listener();
    } catch {
      // ignore
    }
  }
}

export function subscribeToArchivedGames(callback: () => void): () => void {
  listeners.push(callback);
  return () => {
    listeners = listeners.filter((l) => l !== callback);
  };
}

/**
 * Checks if local storage is available in the current environment (browser).
 */
function isStorageAvailable(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

const EMPTY_GAMES: ArchivedGame[] = [];

/**
 * Retrieves all archived games from local storage, sorted latest first.
 * Memoized for useSyncExternalStore compatibility.
 */
export function getArchivedGames(): ArchivedGame[] {
  if (!isStorageAvailable()) {
    return EMPTY_GAMES;
  }

  if (cachedGames !== null) {
    return cachedGames;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      cachedGames = EMPTY_GAMES;
      return cachedGames;
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      console.warn("Archived games data in localStorage is corrupted (not an array).");
      cachedGames = EMPTY_GAMES;
      return cachedGames;
    }

    // Filter valid objects that match expected basic shape
    const validGames = parsed.filter(
      (item): item is ArchivedGame =>
        item &&
        typeof item === "object" &&
        typeof item.id === "string" &&
        typeof item.finalFen === "string" &&
        typeof item.result === "string"
    );

    // Sort by createdAt descending (newest first)
    cachedGames = validGames.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return cachedGames;
  } catch (error) {
    console.error("Failed to read archived games from localStorage:", error);
    cachedGames = EMPTY_GAMES;
    return cachedGames;
  }
}

/**
 * Server snapshot for SSR.
 */
export function getArchivedGamesServerSnapshot(): ArchivedGame[] {
  return EMPTY_GAMES;
}

/**
 * Retrieves a single archived game by its ID.
 */
export function getArchivedGameById(id: string): ArchivedGame | null {
  if (!id) return null;
  const games = getArchivedGames();
  return games.find((g) => g.id === id) || null;
}

/**
 * Saves or updates a completed game record into local storage.
 * Prevents unintended duplication.
 */
export function saveArchivedGame(game: ArchivedGame): boolean {
  if (!isStorageAvailable() || !game || !game.id) {
    return false;
  }

  try {
    const existing = getArchivedGames();
    const existingIndex = existing.findIndex((g) => g.id === game.id);

    let updated: ArchivedGame[];
    if (existingIndex >= 0) {
      // Update existing record
      updated = [...existing];
      updated[existingIndex] = {
        ...game,
        updatedAt: new Date().toISOString(),
      };
    } else {
      // Prepend new record
      updated = [game, ...existing];
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    notifyListeners();
    return true;
  } catch (error) {
    console.error("Failed to save archived game to localStorage:", error);
    return false;
  }
}

/**
 * Deletes a single game by its ID.
 */
export function deleteArchivedGame(id: string): boolean {
  if (!isStorageAvailable() || !id) {
    return false;
  }

  try {
    const existing = getArchivedGames();
    const filtered = existing.filter((g) => g.id !== id);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    notifyListeners();
    return true;
  } catch (error) {
    console.error("Failed to delete game from localStorage:", error);
    return false;
  }
}

/**
 * Clears all archived games from local storage.
 */
export function clearArchivedGames(): boolean {
  if (!isStorageAvailable()) {
    return false;
  }

  try {
    window.localStorage.removeItem(STORAGE_KEY);
    notifyListeners();
    return true;
  } catch (error) {
    console.error("Failed to clear archived games from localStorage:", error);
    return false;
  }
}
