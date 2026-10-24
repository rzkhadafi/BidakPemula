import {
  generateAudioCacheKey,
  getCachedAudioBlob,
  saveAudioBlobToCache,
} from "./audio-cache";
import { getTutorPreferences, saveTutorPreferences } from "./tutor-preferences";

export type PlaybackState = "idle" | "loading" | "playing" | "paused" | "error";
export type SpeechSource = "gemini" | "webspeech" | null;

export interface SpeechControllerState {
  playbackState: PlaybackState;
  source: SpeechSource;
  speed: 0.85 | 1.0 | 1.25;
  errorMessage: string | null;
  currentText: string | null;
}

export class SpeechController {
  private audio: HTMLAudioElement | null = null;
  private currentObjectUrl: string | null = null;
  private state: SpeechControllerState;
  private listeners = new Set<(state: SpeechControllerState) => void>();
  private activeUtterance: SpeechSynthesisUtterance | null = null;
  private currentRequestId = 0;
  private currentAbortController: AbortController | null = null;

  constructor() {
    const prefs = getTutorPreferences();
    this.state = {
      playbackState: "idle",
      source: null,
      speed: prefs.speed,
      errorMessage: null,
      currentText: null,
    };
  }

  public getState(): SpeechControllerState {
    return { ...this.state };
  }

  public subscribe(listener: (state: SpeechControllerState) => void): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    const s = this.getState();
    this.listeners.forEach((fn) => {
      try {
        fn(s);
      } catch {}
    });
  }

  private updateState(updates: Partial<SpeechControllerState>): void {
    this.state = { ...this.state, ...updates };
    this.notify();
  }

  private getAudioElement(): HTMLAudioElement {
    if (!this.audio) {
      this.audio = new Audio();
      this.audio.preload = "auto";

      this.audio.onended = () => {
        this.updateState({ playbackState: "idle" });
      };

      this.audio.onpause = () => {
        if (this.state.playbackState === "playing") {
          this.updateState({ playbackState: "paused" });
        }
      };

      this.audio.onplay = () => {
        this.updateState({ playbackState: "playing" });
      };

      this.audio.onerror = () => {
        if (this.state.playbackState !== "idle") {
          this.updateState({
            playbackState: "error",
            errorMessage: "Gagal memutar berkas audio.",
          });
        }
      };
    }

    this.audio.playbackRate = this.state.speed;
    return this.audio;
  }

  /**
   * Instantly silences all active sound engines (both HTMLAudioElement and Web Speech API).
   */
  private silenceAllAudio(): void {
    if (this.audio) {
      try {
        this.audio.pause();
        this.audio.currentTime = 0;
        this.audio.removeAttribute("src");
        this.audio.load();
      } catch {}
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }

    this.activeUtterance = null;

    if (this.currentObjectUrl) {
      try {
        URL.revokeObjectURL(this.currentObjectUrl);
      } catch {}
      this.currentObjectUrl = null;
    }
  }

  /**
   * Play speech for given text using Gemini TTS with cache and Web Speech fallback.
   * Guaranteed single active audio stream with generation locking and AbortController.
   */
  public async speak(text: string, voice?: string): Promise<void> {
    const trimmed = text.trim();
    if (!trimmed) {
      this.stop();
      return;
    }

    // Invalidate any ongoing speech request or async promise
    this.currentRequestId++;
    const requestId = this.currentRequestId;

    // Abort pending network fetch if active
    if (this.currentAbortController) {
      this.currentAbortController.abort();
      this.currentAbortController = null;
    }

    // Silence active audio immediately
    this.silenceAllAudio();

    const abortController = new AbortController();
    this.currentAbortController = abortController;

    const selectedVoice = voice || getTutorPreferences().voice;
    this.updateState({
      playbackState: "loading",
      errorMessage: null,
      currentText: trimmed,
      source: null,
    });

    const cacheKey = generateAudioCacheKey(trimmed, selectedVoice);

    // 1. Try local IndexedDB cache
    try {
      const cachedBlob = await getCachedAudioBlob(cacheKey);
      if (requestId !== this.currentRequestId) {
        return; // Superseded by a newer request or stop()
      }

      if (cachedBlob) {
        this.playBlob(cachedBlob, "gemini", requestId);
        return;
      }
    } catch {
      // Ignore cache read error, continue to fetch
    }

    if (requestId !== this.currentRequestId) {
      return;
    }

    // 2. Fetch from server Gemini TTS API with abort signal
    try {
      const res = await fetch("/api/tutor/speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortController.signal,
        body: JSON.stringify({
          text: trimmed,
          voice: selectedVoice,
          speed: this.state.speed,
        }),
      });

      if (requestId !== this.currentRequestId) {
        return; // Superseded during fetch
      }

      if (res.ok) {
        const audioBlob = await res.blob();
        if (requestId !== this.currentRequestId) {
          return; // Superseded during blob conversion
        }

        saveAudioBlobToCache(cacheKey, audioBlob).catch(() => {});
        this.playBlob(audioBlob, "gemini", requestId);
        return;
      }

      // If server responds with non-ok (503 / quota exhausted), fall back to Web Speech
      if (requestId !== this.currentRequestId) {
        return;
      }
      console.warn("Gemini TTS unavailable, falling back to Web Speech API.");
      this.fallbackToWebSpeech(trimmed, requestId);
    } catch (err: unknown) {
      // If deliberately aborted (e.g. step changed or user stopped), DO NOT trigger Web Speech fallback!
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }

      if (requestId !== this.currentRequestId) {
        return;
      }

      console.warn("Fetch to /api/tutor/speech failed, trying Web Speech fallback:", err);
      this.fallbackToWebSpeech(trimmed, requestId);
    }
  }

  private playBlob(blob: Blob, source: SpeechSource, requestId: number): void {
    if (requestId !== this.currentRequestId) {
      return;
    }

    // Silence any lingering speech synthesis before starting element playback
    this.silenceAllAudio();

    try {
      const audio = this.getAudioElement();
      this.currentObjectUrl = URL.createObjectURL(blob);
      audio.src = this.currentObjectUrl;
      audio.playbackRate = this.state.speed;

      this.updateState({ source });

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            if (requestId === this.currentRequestId) {
              this.updateState({ playbackState: "playing" });
            }
          })
          .catch((err) => {
            if (requestId !== this.currentRequestId) {
              return;
            }
            if (err.name === "NotAllowedError") {
              this.updateState({
                playbackState: "idle",
                errorMessage: "Klik tombol putar untuk mendengarkan suara.",
              });
            } else {
              this.updateState({
                playbackState: "error",
                errorMessage: "Tidak dapat memutar audio.",
              });
            }
          });
      }
    } catch {
      if (requestId === this.currentRequestId) {
        this.updateState({
          playbackState: "error",
          errorMessage: "Gagal memproses berkas audio.",
        });
      }
    }
  }

  private fallbackToWebSpeech(text: string, requestId: number): void {
    if (requestId !== this.currentRequestId) {
      return;
    }

    // Ensure audio element is completely silent
    this.silenceAllAudio();

    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      this.updateState({
        playbackState: "error",
        errorMessage: "Peramban Anda tidak mendukung pemutar suara bawaan.",
      });
      return;
    }

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "id-ID";
      utterance.rate = this.state.speed;

      // Select Indonesian voice if available
      const voices = window.speechSynthesis.getVoices();
      const idVoice = voices.find(
        (v) => v.lang.startsWith("id") || v.lang.startsWith("in")
      );
      if (idVoice) {
        utterance.voice = idVoice;
      }

      utterance.onstart = () => {
        if (requestId === this.currentRequestId) {
          this.updateState({
            playbackState: "playing",
            source: "webspeech",
          });
        }
      };

      utterance.onend = () => {
        if (requestId === this.currentRequestId) {
          this.updateState({
            playbackState: "idle",
            source: null,
          });
          this.activeUtterance = null;
        }
      };

      utterance.onerror = (ev) => {
        // Ignore canceled / interrupted errors caused by intentional stop() calls
        if (ev.error === "canceled" || ev.error === "interrupted") {
          return;
        }

        if (requestId === this.currentRequestId) {
          this.updateState({
            playbackState: "error",
            errorMessage: "Gagal memutar suara perangkat.",
          });
          this.activeUtterance = null;
        }
      };

      this.activeUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    } catch {
      if (requestId === this.currentRequestId) {
        this.updateState({
          playbackState: "error",
          errorMessage: "Gagal menginisialisasi suara perangkat.",
        });
      }
    }
  }

  public pause(): void {
    if (this.state.source === "gemini" && this.audio) {
      this.audio.pause();
      this.updateState({ playbackState: "paused" });
    } else if (this.state.source === "webspeech" && typeof window !== "undefined") {
      window.speechSynthesis.pause();
      this.updateState({ playbackState: "paused" });
    }
  }

  public resume(): void {
    if (this.state.source === "gemini" && this.audio) {
      try {
        const p = this.audio.play();
        if (p && typeof p.catch === "function") p.catch(() => {});
      } catch {}
      this.updateState({ playbackState: "playing" });
    } else if (this.state.source === "webspeech" && typeof window !== "undefined") {
      window.speechSynthesis.resume();
      this.updateState({ playbackState: "playing" });
    } else if (this.state.currentText) {
      this.speak(this.state.currentText);
    }
  }

  public replay(): void {
    if (this.state.source === "gemini" && this.audio) {
      this.audio.currentTime = 0;
      try {
        const p = this.audio.play();
        if (p && typeof p.catch === "function") p.catch(() => {});
      } catch {}
      this.updateState({ playbackState: "playing" });
    } else if (this.state.currentText) {
      this.speak(this.state.currentText);
    }
  }

  /**
   * Completely stops any current speech, invalidates in-flight network requests,
   * and silences both audio element and speech synthesis.
   */
  public stop(): void {
    this.currentRequestId++;

    if (this.currentAbortController) {
      this.currentAbortController.abort();
      this.currentAbortController = null;
    }

    this.silenceAllAudio();

    this.updateState({
      playbackState: "idle",
      source: null,
    });
  }

  public setSpeed(speed: 0.85 | 1.0 | 1.25): void {
    this.updateState({ speed });
    saveTutorPreferences({ speed });

    if (this.audio) {
      this.audio.playbackRate = speed;
    }
  }

  public destroy(): void {
    this.stop();
    this.listeners.clear();
  }
}

// Global singleton instance for app-wide speech coordination
export const tutorSpeech = new SpeechController();
