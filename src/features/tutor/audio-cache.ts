/**
 * Client-side audio cache utilizing IndexedDB with in-memory fallback.
 * Caches synthesized audio Blobs to minimize API usage and enable instant offline replay.
 */

const DB_NAME = "chess_archive_audio_db";
const STORE_NAME = "audio_cache";
const DB_VERSION = 1;
const MAX_CACHE_ENTRIES = 60;

// In-memory fallback if IndexedDB is disabled or unavailable
const memoryFallback = new Map<string, { blob: Blob; timestamp: number }>();

function openDatabase(): Promise<IDBDatabase | null> {
  if (typeof window === "undefined" || !("indexedDB" in window)) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "key" });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

/**
 * Generate a deterministic key based on speech text and voice
 */
export function generateAudioCacheKey(text: string, voice: string = "default"): string {
  let hash = 0;
  const str = `${voice}:${text.trim()}`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return `audio_${Math.abs(hash).toString(36)}_${str.length}`;
}

/**
 * Retrieve cached audio Blob if available
 */
export async function getCachedAudioBlob(key: string): Promise<Blob | null> {
  if (memoryFallback.has(key)) {
    return memoryFallback.get(key)!.blob;
  }

  const db = await openDatabase();
  if (!db) return null;

  return new Promise((resolve) => {
    try {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const req = store.get(key);

      req.onsuccess = () => {
        if (req.result && req.result.blob instanceof Blob) {
          resolve(req.result.blob);
        } else {
          resolve(null);
        }
      };

      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

/**
 * Save synthesized audio Blob to IndexedDB cache
 */
export async function saveAudioBlobToCache(key: string, blob: Blob): Promise<void> {
  memoryFallback.set(key, { blob, timestamp: Date.now() });

  const db = await openDatabase();
  if (!db) return;

  try {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    store.put({
      key,
      blob,
      timestamp: Date.now(),
    });

    // Prune old entries if exceeding limit
    const countReq = store.count();
    countReq.onsuccess = () => {
      if (countReq.result > MAX_CACHE_ENTRIES) {
        const cursorReq = store.openCursor();
        let deleted = 0;
        cursorReq.onsuccess = (e) => {
          const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
          if (cursor && deleted < 10) {
            cursor.delete();
            deleted++;
            cursor.continue();
          }
        };
      }
    };
  } catch (err) {
    console.warn("Failed to write audio blob to IndexedDB:", err);
  }
}

/**
 * Clear all cached audio entries
 */
export async function clearAudioCache(): Promise<void> {
  memoryFallback.clear();
  const db = await openDatabase();
  if (!db) return;

  try {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    store.clear();
  } catch (err) {
    console.warn("Failed to clear audio cache:", err);
  }
}
