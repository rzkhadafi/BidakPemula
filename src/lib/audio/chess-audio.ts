/**
 * Chess Audio System.
 * Supports authentic chess.com sound effects with Web Audio API zero-latency playback
 * and graceful acoustic physical synthesis fallback.
 */

export type ChessSoundType =
  | "move"
  | "move-opponent"
  | "capture"
  | "castle"
  | "check"
  | "promote"
  | "game-end"
  | "game-start";

class ChessAudioEngine {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private isMuted: boolean = false;
  private audioBuffers: Map<string, AudioBuffer> = new Map();
  private loadingBuffers: Set<string> = new Set();
  private isPreloaded: boolean = false;

  constructor() {
    if (typeof window !== "undefined") {
      try {
        const saved = window.localStorage.getItem("chess_archive_sound_enabled");
        if (saved !== null) {
          this.soundEnabled = saved === "true";
        }
      } catch {
        this.soundEnabled = true;
      }
    }
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public isEnabled(): boolean {
    return this.soundEnabled && !this.isMuted;
  }

  public setEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem("chess_archive_sound_enabled", String(enabled));
      } catch {}
    }
  }

  public toggleSound(): boolean {
    const next = !this.soundEnabled;
    this.setEnabled(next);
    return next;
  }

  /**
   * Preload audio files into Web Audio buffers for instant zero-latency playback
   */
  public preloadSounds(): void {
    if (typeof window === "undefined" || this.isPreloaded) return;
    this.isPreloaded = true;

    const soundNames: ChessSoundType[] = [
      "move",
      "move-opponent",
      "capture",
      "castle",
      "check",
      "promote",
      "game-end",
      "game-start",
    ];

    const ctx = this.getAudioContext();
    if (!ctx || typeof fetch !== "function") return;

    soundNames.forEach(async (name) => {
      if (this.audioBuffers.has(name) || this.loadingBuffers.has(name)) return;
      this.loadingBuffers.add(name);
      try {
        const res = await fetch(`/sounds/${name}.mp3`);
        if (res.ok) {
          const arrayBuf = await res.arrayBuffer();
          const decoded = await ctx.decodeAudioData(arrayBuf);
          this.audioBuffers.set(name, decoded);
        }
      } catch {
        // Fallback is handled transparently
      } finally {
        this.loadingBuffers.delete(name);
      }
    });
  }

  /**
   * Play preloaded buffer or HTMLAudioElement; returns true if audio playback started
   */
  private playSoundFile(name: ChessSoundType): boolean {
    if (typeof window === "undefined") return false;

    if (!this.isPreloaded) {
      this.preloadSounds();
    }

    try {
      // 1. Try zero-latency Web Audio buffer
      const ctx = this.getAudioContext();
      const buffer = this.audioBuffers.get(name);
      if (ctx && buffer) {
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(0);
        return true;
      }

      // 2. Try HTMLAudioElement
      if (typeof Audio !== "undefined") {
        const audio = new Audio(`/sounds/${name}.mp3`);
        audio.volume = 0.9;
        const playPromise = audio.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(() => {});
        }
        return true;
      }
    } catch {
      return false;
    }

    return false;
  }

  /**
   * Authentic wooden board thud (Player move)
   */
  public playMove(): void {
    if (!this.isEnabled()) return;
    if (this.playSoundFile("move")) return;
    this.playSyntheticMove();
  }

  /**
   * Authentic wooden board thud (Opponent move)
   */
  public playOpponentMove(): void {
    if (!this.isEnabled()) return;
    if (this.playSoundFile("move-opponent")) return;
    if (this.playSoundFile("move")) return;
    this.playSyntheticMove();
  }

  /**
   * Authentic chess.com castling sound (two realistic rapid wooden thuds)
   */
  public playCastle(): void {
    if (!this.isEnabled()) return;
    if (this.playSoundFile("castle")) return;
    this.playSyntheticCastle();
  }

  /**
   * Tactile capture knock (piece striking piece and settling on board)
   */
  public playCapture(): void {
    if (!this.isEnabled()) return;
    if (this.playSoundFile("capture")) return;
    this.playSyntheticCapture();
  }

  /**
   * King in check alert chime / knock
   */
  public playCheck(): void {
    if (!this.isEnabled()) return;
    if (this.playSoundFile("check")) return;
    this.playSyntheticCheck();
  }

  /**
   * Pawn promotion trumpet / flourish
   */
  public playPromotion(): void {
    if (!this.isEnabled()) return;
    if (this.playSoundFile("promote")) return;
    this.playMove();
  }

  /**
   * Game end sound (victory or defeat resolution)
   */
  public playGameOver(won: boolean = true): void {
    if (!this.isEnabled()) return;
    if (this.playSoundFile("game-end")) return;
    this.playSyntheticGameOver(won);
  }

  /**
   * Game start sound
   */
  public playGameStart(): void {
    if (!this.isEnabled()) return;
    if (this.playSoundFile("game-start")) return;
  }

  /**
   * Joyful, bright major arpeggio chime for correct moves and solved challenges
   */
  public playSuccess(): void {
    if (!this.isEnabled()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // High-vibrancy C-major arpeggio: C5 (523Hz), E5 (659Hz), G5 (784Hz), C6 (1046Hz)
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const start = now + idx * 0.07;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.001, start);
        gain.gain.linearRampToValueAtTime(0.2, start + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.38);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + 0.4);
      });
    } catch {}
  }

  /**
   * Warm, gentle error reminder for incorrect moves or failed attempts
   */
  public playError(): void {
    if (!this.isEnabled()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Soft descending reminder tones: 310Hz -> 220Hz
      const tones = [310, 220];
      tones.forEach((freq, idx) => {
        const start = now + idx * 0.1;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.001, start);
        gain.gain.linearRampToValueAtTime(0.22, start + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.16);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + 0.18);
      });
    } catch {}
  }

  /**
   * High-fidelity physical wooden board thud synthesis fallback
   */
  private playSyntheticMove(): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Low body resonance of the wooden board
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(55, now + 0.08);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);

      // High-frequency surface impact click
      const clickOsc = ctx.createOscillator();
      const clickGain = ctx.createGain();
      clickOsc.type = "triangle";
      clickOsc.frequency.setValueAtTime(1400, now);
      clickOsc.frequency.exponentialRampToValueAtTime(300, now + 0.015);
      clickGain.gain.setValueAtTime(0.18, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
      clickOsc.connect(clickGain);
      clickGain.connect(ctx.destination);
      clickOsc.start(now);
      clickOsc.stop(now + 0.025);
    } catch {}
  }

  /**
   * Physical wooden castling synthesis: two distinct thuds spaced ~125ms apart
   */
  private playSyntheticCastle(): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      [0, 0.125].forEach((offset) => {
        const t = now + offset;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(155, t);
        osc.frequency.exponentialRampToValueAtTime(58, t + 0.07);

        gain.gain.setValueAtTime(0.32, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.09);
      });
    } catch {}
  }

  /**
   * Physical wooden capture synthesis fallback
   */
  private playSyntheticCapture(): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // First impact: piece-on-piece
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "triangle";
      osc1.frequency.setValueAtTime(450, now);
      osc1.frequency.exponentialRampToValueAtTime(120, now + 0.035);
      gain1.gain.setValueAtTime(0.28, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.045);

      // Second impact: piece on board landing
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(180, now + 0.02);
      osc2.frequency.exponentialRampToValueAtTime(60, now + 0.1);
      gain2.gain.setValueAtTime(0.3, now + 0.02);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.02);
      osc2.stop(now + 0.12);
    } catch {}
  }

  /**
   * Crisp alert chime for King in Check
   */
  private playSyntheticCheck(): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(660, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch {}
  }

  /**
   * Harmonious resolution sound for Checkmate / Game Over
   */
  private playSyntheticGameOver(won: boolean = true): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const freqs = won ? [440, 554, 659, 880] : [440, 415, 370, 330];

      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = now + i * 0.08;

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.18, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + 0.4);
      });
    } catch {}
  }
}

export const chessAudio = new ChessAudioEngine();
