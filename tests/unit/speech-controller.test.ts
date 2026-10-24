import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  generateAudioCacheKey,
  getCachedAudioBlob,
  saveAudioBlobToCache,
  clearAudioCache,
} from "@/features/tutor/audio-cache";
import {
  getTutorPreferences,
  saveTutorPreferences,
} from "@/features/tutor/tutor-preferences";
import { SpeechController } from "@/features/tutor/speech-controller";

describe("Tutor Audio Cache & Speech Controller", () => {
  beforeEach(async () => {
    window.localStorage.clear();
    await clearAudioCache();
    vi.restoreAllMocks();
  });

  it("generates deterministic cache keys based on text and voice", () => {
    const key1 = generateAudioCacheKey("Halo catur pemula", "Puck");
    const key2 = generateAudioCacheKey("Halo catur pemula", "Puck");
    const key3 = generateAudioCacheKey("Halo catur pemula", "Kore");

    expect(key1).toBe(key2);
    expect(key1).not.toBe(key3);
  });

  it("stores and retrieves audio blob from cache", async () => {
    const dummyBlob = new Blob(["dummy audio bytes"], { type: "audio/wav" });
    const key = generateAudioCacheKey("Langkah pion ke e4", "Puck");

    await saveAudioBlobToCache(key, dummyBlob);
    const cached = await getCachedAudioBlob(key);

    expect(cached).not.toBeNull();
    expect(cached?.size).toBe(dummyBlob.size);
  });

  it("clears cached audio blobs", async () => {
    const dummyBlob = new Blob(["dummy audio"], { type: "audio/wav" });
    const key = generateAudioCacheKey("Test clear", "Puck");

    await saveAudioBlobToCache(key, dummyBlob);
    expect(await getCachedAudioBlob(key)).not.toBeNull();

    await clearAudioCache();
    expect(await getCachedAudioBlob(key)).toBeNull();
  });

  it("manages tutor preferences in localStorage", () => {
    expect(getTutorPreferences().autoplay).toBe(false);
    expect(getTutorPreferences().speed).toBe(1.0);

    saveTutorPreferences({ autoplay: true, speed: 1.25 });
    expect(getTutorPreferences().autoplay).toBe(true);
    expect(getTutorPreferences().speed).toBe(1.25);
  });

  it("controls speech playback state transitions", async () => {
    const controller = new SpeechController();
    expect(controller.getState().playbackState).toBe("idle");

    // Mock fetch for /api/tutor/speech
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      blob: async () => new Blob(["audio-bytes"], { type: "audio/wav" }),
    } as Response);

    // Mock URL.createObjectURL
    global.URL.createObjectURL = vi.fn().mockReturnValue("blob:dummy-url");
    global.URL.revokeObjectURL = vi.fn();

    // Trigger speech
    await controller.speak("Selamat datang di pembelajaran catur.");

    // Update speed
    controller.setSpeed(1.25);
    expect(controller.getState().speed).toBe(1.25);

    // Pause, Resume, Stop
    controller.pause();
    expect(controller.getState().playbackState).toBe("paused");

    controller.resume();
    expect(controller.getState().playbackState).toBe("playing");

    controller.stop();
    expect(controller.getState().playbackState).toBe("idle");

    controller.destroy();
  });
});
