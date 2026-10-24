/**
 * Chess Audio System using Web Audio API synthesis.
 * Zero external dependencies, offline-first, crisp tactile chess sounds.
 */

class ChessAudioEngine {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private isMuted: boolean = false;

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
   * Crisp tactile wood piece tap
   */
  public playMove(): void {
    if (!this.isEnabled()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Pitch sweep downward quickly simulating piece contact with wood
      osc.type = "triangle";
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.06);

      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch {}
  }

  /**
   * Deeper tactile capture click (two micro-impacts)
   */
  public playCapture(): void {
    if (!this.isEnabled()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // First impact
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "square";
      osc1.frequency.setValueAtTime(320, now);
      osc1.frequency.exponentialRampToValueAtTime(90, now + 0.04);
      gain1.gain.setValueAtTime(0.2, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.06);

      // Second resonant impact 20ms later
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(540, now + 0.02);
      osc2.frequency.exponentialRampToValueAtTime(160, now + 0.1);
      gain2.gain.setValueAtTime(0.25, now + 0.02);
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
  public playCheck(): void {
    if (!this.isEnabled()) return;
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
  public playGameOver(won: boolean = true): void {
    if (!this.isEnabled()) return;
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
