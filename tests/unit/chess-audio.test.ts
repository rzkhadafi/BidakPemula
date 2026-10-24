import { describe, it, expect, beforeEach } from "vitest";
import { chessAudio } from "@/lib/audio/chess-audio";

describe("Chess Audio Engine (Web Audio API Synthesizer)", () => {
  beforeEach(() => {
    window.localStorage.clear();
    chessAudio.setEnabled(true);
  });

  it("initializes with sound enabled by default", () => {
    expect(chessAudio.isEnabled()).toBe(true);
  });

  it("persists sound enabled state to localStorage", () => {
    chessAudio.setEnabled(false);
    expect(chessAudio.isEnabled()).toBe(false);
    expect(window.localStorage.getItem("chess_archive_sound_enabled")).toBe("false");

    chessAudio.setEnabled(true);
    expect(chessAudio.isEnabled()).toBe(true);
    expect(window.localStorage.getItem("chess_archive_sound_enabled")).toBe("true");
  });

  it("toggles sound correctly", () => {
    chessAudio.setEnabled(true);
    const toggledOff = chessAudio.toggleSound();
    expect(toggledOff).toBe(false);
    expect(chessAudio.isEnabled()).toBe(false);

    const toggledOn = chessAudio.toggleSound();
    expect(toggledOn).toBe(true);
    expect(chessAudio.isEnabled()).toBe(true);
  });

  it("gracefully executes sound trigger methods without throwing errors when audio context is unavailable", () => {
    expect(() => chessAudio.preloadSounds()).not.toThrow();
    expect(() => chessAudio.playMove()).not.toThrow();
    expect(() => chessAudio.playOpponentMove()).not.toThrow();
    expect(() => chessAudio.playCastle()).not.toThrow();
    expect(() => chessAudio.playCapture()).not.toThrow();
    expect(() => chessAudio.playCheck()).not.toThrow();
    expect(() => chessAudio.playPromotion()).not.toThrow();
    expect(() => chessAudio.playGameOver(true)).not.toThrow();
    expect(() => chessAudio.playGameOver(false)).not.toThrow();
    expect(() => chessAudio.playGameStart()).not.toThrow();
  });
});
