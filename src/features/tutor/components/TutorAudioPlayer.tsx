"use client";

import React, { useState, useEffect, useRef, useSyncExternalStore } from "react";
import {
  Volume2,
  Play,
  Pause,
  RotateCcw,
  Square,
  Loader2,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { tutorSpeech, SpeechControllerState } from "../speech-controller";
import {
  getTutorPreferences,
  saveTutorPreferences,
  subscribeTutorPreferences,
  getServerTutorPreferencesSnapshot,
} from "../tutor-preferences";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface TutorAudioPlayerProps {
  spokenText: string;
  autoPlayTrigger?: boolean; // Trigger auto play if user has enabled autoplay
  className?: string;
}

export const TutorAudioPlayer: React.FC<TutorAudioPlayerProps> = ({
  spokenText,
  autoPlayTrigger = false,
  className = "",
}) => {
  const [controllerState, setControllerState] = useState<SpeechControllerState>(() =>
    tutorSpeech.getState()
  );

  const preferences = useSyncExternalStore(
    subscribeTutorPreferences,
    getTutorPreferences,
    getServerTutorPreferencesSnapshot
  );

  const lastSpokenTextRef = useRef<string | null>(null);

  useEffect(() => {
    const unsubscribe = tutorSpeech.subscribe((s) => {
      setControllerState(s);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // Handle user-opted autoplay when spokenText changes
  useEffect(() => {
    if (autoPlayTrigger && preferences.autoplay && spokenText) {
      if (lastSpokenTextRef.current !== spokenText) {
        lastSpokenTextRef.current = spokenText;
        tutorSpeech.speak(spokenText, preferences.voice).catch(() => {});
      }
    }
  }, [autoPlayTrigger, preferences.autoplay, spokenText, preferences.voice]);

  // Clean up any ongoing audio when the player component unmounts
  useEffect(() => {
    return () => {
      tutorSpeech.stop();
    };
  }, []);

  const { playbackState, source, speed, errorMessage } = controllerState;

  const handlePlay = () => {
    tutorSpeech.unlockAudio();
    lastSpokenTextRef.current = spokenText;
    tutorSpeech.speak(spokenText, preferences.voice);
  };

  const handlePause = () => {
    tutorSpeech.pause();
  };

  const handleResume = () => {
    tutorSpeech.resume();
  };

  const handleReplay = () => {
    tutorSpeech.unlockAudio();
    lastSpokenTextRef.current = spokenText;
    tutorSpeech.speak(spokenText, preferences.voice);
  };

  const handleStop = () => {
    tutorSpeech.stop();
  };

  const handleSpeedChange = (newSpeed: 0.85 | 1.0 | 1.25) => {
    tutorSpeech.setSpeed(newSpeed);
  };

  const handleAutoplayToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    saveTutorPreferences({ autoplay: checked });
    if (checked) {
      tutorSpeech.unlockAudio();
      if (spokenText && controllerState.playbackState === "idle") {
        lastSpokenTextRef.current = spokenText;
        tutorSpeech.speak(spokenText, preferences.voice).catch(() => {});
      }
    } else {
      tutorSpeech.stop();
    }
  };

  return (
    <div
      className={`rounded-xl p-3.5 bg-[#24292E] border border-[#353B42] space-y-3 ${className}`}
      role="region"
      aria-label="Pemutar audio penjelasan Guru Catur"
    >
      {/* Top Header & Status */}
      <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              playbackState === "playing"
                ? "bg-[#C7A66A]/20 text-[#C7A66A] animate-pulse"
                : "bg-[#1C2024] text-[#8A9299]"
            }`}
          >
            <Volume2 className="w-4 h-4" />
          </div>
          <div>
            <span className="font-medium text-[#F2F0E8] block text-xs">
              Penjelasan Suara
            </span>
            <span className="text-[11px] text-[#8A9299]">
              {playbackState === "loading"
                ? "Menyiapkan suara..."
                : playbackState === "playing"
                ? "Sedang membaca penjelasan..."
                : playbackState === "paused"
                ? "Suara dijeda"
                : "Audio Bahasa Indonesia"}
            </span>
          </div>
        </div>

        {/* Source Badge */}
        <div className="flex items-center gap-1.5">
          {source === "gemini" && (
            <Badge variant="accent" size="sm" className="text-[10px] gap-1">
              <Sparkles className="w-3 h-3 text-[#C7A66A]" />
              Suara Guru Catur
            </Badge>
          )}
          {source === "webspeech" && (
            <Badge variant="muted" size="sm" className="text-[10px]">
              Suara Perangkat
            </Badge>
          )}
        </div>
      </div>

      {/* Main Playback Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#353B42]/60">
        <div className="flex items-center gap-1.5">
          {playbackState === "loading" ? (
            <Button variant="secondary" size="sm" disabled className="gap-1.5 text-xs">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C7A66A]" />
              <span>Memuat...</span>
            </Button>
          ) : playbackState === "playing" ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={handlePause}
              className="gap-1.5 text-xs"
              aria-label="Jeda suara"
            >
              <Pause className="w-3.5 h-3.5 text-[#C7A66A]" />
              <span>Jeda</span>
            </Button>
          ) : playbackState === "paused" ? (
            <Button
              variant="primary"
              size="sm"
              onClick={handleResume}
              className="gap-1.5 text-xs"
              aria-label="Lanjutkan suara"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Lanjutkan</span>
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={handlePlay}
              className="gap-1.5 text-xs"
              aria-label="Dengarkan penjelasan"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Dengarkan</span>
            </Button>
          )}

          {/* Replay Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReplay}
            disabled={playbackState === "loading"}
            title="Ulangi dari awal"
            aria-label="Ulangi suara"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#8A9299] hover:text-[#F2F0E8]" />
          </Button>

          {/* Stop Button */}
          {playbackState !== "idle" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleStop}
              title="Hentikan suara"
              aria-label="Hentikan suara"
            >
              <Square className="w-3 h-3 text-[#E17C78] fill-current" />
            </Button>
          )}
        </div>

        {/* Speed Selector */}
        <div className="flex items-center gap-1">
          <span className="text-[11px] text-[#8A9299] mr-1">Kecepatan:</span>
          {([0.85, 1.0, 1.25] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => handleSpeedChange(s)}
              className={`px-1.5 py-0.5 rounded text-[11px] font-mono transition-colors ${
                speed === s
                  ? "bg-[#C7A66A] text-[#141619] font-bold"
                  : "bg-[#1C2024] text-[#8A9299] hover:text-[#F2F0E8] border border-[#353B42]"
              }`}
              title={`Kecepatan ${s}x`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Autoplay Preference Option */}
      <div className="flex items-center justify-between pt-1 border-t border-[#353B42]/50 text-[11px] text-[#8A9299]">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={preferences.autoplay}
            onChange={handleAutoplayToggle}
            className="w-3.5 h-3.5 rounded accent-[#C7A66A] cursor-pointer"
          />
          <span>Putar penjelasan berikutnya secara otomatis</span>
        </label>
      </div>

      {/* Error Notice */}
      {errorMessage && (
        <div className="flex items-center gap-2 p-2 rounded bg-[#E17C78]/10 border border-[#E17C78]/30 text-xs text-[#E17C78]">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span className="flex-1 text-[11px]">{errorMessage}</span>
          <button
            type="button"
            onClick={handlePlay}
            className="text-[11px] underline hover:text-[#F2F0E8]"
          >
            Coba Lagi
          </button>
        </div>
      )}
    </div>
  );
};
