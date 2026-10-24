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
   * Play speech for given text using Gemini TTS with cache and Web Speech fallback.
   */
  public async speak(text: string, voice?: string): Promise<void> {
    const trimmed = text.trim();
    if (!trimmed) return;

    // Stop existing playback
    this.stop();

    const selectedVoice = voice || getTutorPreferences().voice;
    this.updateState({
      playbackState: "loading",
      errorMessage: null,
      currentText: trimmed,
    });

    const cacheKey = generateAudioCacheKey(trimmed, selectedVoice);

    // 1. Try local cache
    try {
      const cachedBlob = await getCachedAudioBlob(cacheKey);
      if (cachedBlob) {
        this.playBlob(cachedBlob, "gemini");
        return;
      }
    } catch {
      // Ignore cache read error, continue to fetch
    }

    // 2. Fetch from server API
    try {
      const res = await fetch("/api/tutor/speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: trimmed,
          voice: selectedVoice,
          speed: this.state.speed,
        }),
      });

      if (res.ok) {
        const audioBlob = await res.blob();
        saveAudioBlobToCache(cacheKey, audioBlob).catch(() => {});
        this.playBlob(audioBlob, "gemini");
        return;
      }

      // If server responds with 503 or error, try Web Speech API
      console.warn("Gemini TTS unavailable, falling back to Web Speech API.");
      this.fallbackToWebSpeech(trimmed);
    } catch (err) {
      console.warn("Fetch to /api/tutor/speech failed, trying Web Speech fallback:", err);
      this.fallbackToWebSpeech(trimmed);
    }
  }

  private playBlob(blob: Blob, source: SpeechSource): void {
    if (this.currentObjectUrl) {
      URL.revokeObjectURL(this.currentObjectUrl);
      this.currentObjectUrl = null;
    }

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
            this.updateState({ playbackState: "playing" });
          })
          .catch((err) => {
            // Check if autoplay was blocked by browser
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
      this.updateState({
        playbackState: "error",
        errorMessage: "Gagal memproses berkas audio.",
      });
    }
  }

  private fallbackToWebSpeech(text: string): void {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      this.updateState({
        playbackState: "error",
        errorMessage: "Peramban Anda tidak mendukung pemutar suara bawaan.",
      });
      return;
    }

    try {
      window.speechSynthesis.cancel();
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
        this.updateState({
          playbackState: "playing",
          source: "webspeech",
        });
      };

      utterance.onend = () => {
        this.updateState({
          playbackState: "idle",
          source: null,
        });
        this.activeUtterance = null;
      };

      utterance.onerror = () => {
        this.updateState({
          playbackState: "error",
          errorMessage: "Gagal memutar suara perangkat.",
        });
        this.activeUtterance = null;
      };

      this.activeUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    } catch {
      this.updateState({
        playbackState: "error",
        errorMessage: "Gagal menginisialisasi suara perangkat.",
      });
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

  public stop(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    this.activeUtterance = null;
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
    if (this.currentObjectUrl) {
      URL.revokeObjectURL(this.currentObjectUrl);
      this.currentObjectUrl = null;
    }
    this.listeners.clear();
  }
}

// Global singleton instance for app-wide speech coordination
export const tutorSpeech = new SpeechController();
