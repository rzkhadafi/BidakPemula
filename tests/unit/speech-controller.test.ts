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

  it("manages tutor preferences in localStorage with Aoede as default voice", () => {
    expect(getTutorPreferences().autoplay).toBe(false);
    expect(getTutorPreferences().speed).toBe(1.0);
    expect(getTutorPreferences().voice).toBe("Aoede");

    saveTutorPreferences({ autoplay: true, speed: 1.25, voice: "Kore" });
    expect(getTutorPreferences().autoplay).toBe(true);
    expect(getTutorPreferences().speed).toBe(1.25);
    expect(getTutorPreferences().voice).toBe("Kore");
  });

  it("aborts in-flight speech request when stop() is called and prevents fallback to Web Speech", async () => {
    const controller = new SpeechController();
    const abortSpy = vi.fn();

    // Mock pending fetch with AbortSignal listening
    global.fetch = vi.fn().mockImplementation((_url, init) => {
      init?.signal?.addEventListener("abort", abortSpy);
      return new Promise((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => {
          const err = new Error("The operation was aborted");
          err.name = "AbortError";
          reject(err);
        });
      });
    });

    const speakPromise = controller.speak("Kalimat yang sedang dimuat...");
    expect(controller.getState().playbackState).toBe("loading");

    // Allow microtask to pass cache check and enter fetch
    await new Promise((r) => setTimeout(r, 0));

    // Immediately stop while fetch is in-flight
    controller.stop();
    expect(controller.getState().playbackState).toBe("idle");
    expect(abortSpy).toHaveBeenCalled();

    await speakPromise;
    // Should stay idle, NOT fallback to webspeech or set error
    expect(controller.getState().playbackState).toBe("idle");
    expect(controller.getState().source).toBeNull();

    controller.destroy();
  });

  it("aborts previous in-flight fetch when a new speak() is called and plays only latest", async () => {
    const controller = new SpeechController();
    const abortSpy1 = vi.fn();

    let resolveFetch2: (res: Response) => void;
    const fetch2Promise = new Promise<Response>((res) => {
      resolveFetch2 = res;
    });

    global.URL.createObjectURL = vi.fn().mockReturnValue("blob:dummy-url-2");
    global.URL.revokeObjectURL = vi.fn();

    global.fetch = vi
      .fn()
      .mockImplementationOnce((_url, init) => {
        init?.signal?.addEventListener("abort", abortSpy1);
        return new Promise((_res, rej) => {
          init?.signal?.addEventListener("abort", () => {
            const err = new Error("The operation was aborted");
            err.name = "AbortError";
            rej(err);
          });
        });
      })
      .mockImplementationOnce(() => fetch2Promise);

    // Call 1 (Mission 1)
    const p1 = controller.speak("Misi 1: Tunjukkan petak e4");
    expect(controller.getState().playbackState).toBe("loading");

    // Allow microtask to enter fetch 1
    await new Promise((r) => setTimeout(r, 0));

    // Call 2 (Mission 2 immediately advances)
    const p2 = controller.speak("Misi 2: Tunjukkan petak h1");
    expect(abortSpy1).toHaveBeenCalled();

    // Allow microtask to enter fetch 2
    await new Promise((r) => setTimeout(r, 0));

    // Resolve fetch 2
    resolveFetch2!({
      ok: true,
      blob: async () => new Blob(["audio-bytes-2"], { type: "audio/wav" }),
    } as Response);

    await Promise.all([p1, p2]);

    expect(controller.getState().currentText).toBe("Misi 2: Tunjukkan petak h1");
    expect(controller.getState().source).toBe("gemini");

    controller.destroy();
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
