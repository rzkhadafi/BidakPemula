"use client";

import React, { useState, useEffect } from "react";
import { Lightbulb, ArrowRight, Eye, Crosshair, CheckCircle2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SocraticHint, SocraticHintTier } from "../types";
import { TutorAudioPlayer } from "@/features/tutor/components/TutorAudioPlayer";
import { tutorSpeech } from "@/features/tutor/speech-controller";

interface SocraticHintModalProps {
  hint: SocraticHint | null;
  isOpen: boolean;
  onClose: () => void;
  onApplyHintMove?: (from: string, to: string) => void;
  onHighlightSquare?: (square: string | null) => void;
}

export const SocraticHintModal: React.FC<SocraticHintModalProps> = ({
  hint,
  isOpen,
  onClose,
  onHighlightSquare,
}) => {
  const [currentTier, setCurrentTier] = useState<SocraticHintTier>(1);
  const [prevHintFen, setPrevHintFen] = useState<string | null>(null);

  // Sync tier to 1 during render when a new hint arrives (official React pattern)
  if (hint && hint.fen !== prevHintFen) {
    setPrevHintFen(hint.fen);
    setCurrentTier(1);
  }

  // Stop active speech playback and clear board highlight when modal closes
  useEffect(() => {
    if (!isOpen) {
      tutorSpeech.stop();
      if (onHighlightSquare) onHighlightSquare(null);
    }
  }, [isOpen, onHighlightSquare]);

  // Update board highlight based on current tier
  useEffect(() => {
    if (!isOpen || !hint || !onHighlightSquare) return;
    if (currentTier === 2) {
      onHighlightSquare(hint.tier2Piece.pieceSquare);
    } else if (currentTier === 3) {
      onHighlightSquare(hint.tier3Concrete.to);
    } else {
      onHighlightSquare(null);
    }
  }, [currentTier, hint, isOpen, onHighlightSquare]);

  if (!hint) return null;

  const currentSpokenText =
    currentTier === 1
      ? hint.tier1Observation.spokenText
      : currentTier === 2
      ? hint.tier2Piece.spokenText
      : hint.tier3Concrete.spokenText;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Petunjuk Sokrates Bertingkat"
      description="Guru AI memandu cara berpikir Anda langkah demi langkah, tanpa langsung membocorkan jawaban."
    >
      <div className="space-y-4 pt-1">
        {/* Tier Progress Steps */}
        <div className="grid grid-cols-3 gap-1.5 pb-1">
          {[
            { tier: 1 as const, label: "1. Observasi", icon: Eye },
            { tier: 2 as const, label: "2. Bidak Kunci", icon: Crosshair },
            { tier: 3 as const, label: "3. Solusi Lengkap", icon: CheckCircle2 },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = currentTier === item.tier;
            const isUnlocked = currentTier >= item.tier;

            return (
              <button
                key={item.tier}
                type="button"
                onClick={() => setCurrentTier(item.tier)}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#C7A66A]/20 border-[#C7A66A] text-[#F2F0E8] shadow-xs"
                    : isUnlocked
                    ? "bg-[#1C2024] border-[#353B42] text-[#B0B5B9] hover:text-[#F2F0E8]"
                    : "bg-[#141619] border-[#2C3238] text-[#8A9299] opacity-60"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#C7A66A]" : "text-[#8A9299]"}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Box */}
        <div className="p-4 rounded-xl bg-[#1C2024] border border-[#353B42] space-y-3">
          <div className="flex items-center justify-between">
            <Badge variant="accent" size="sm">
              {currentTier === 1
                ? "Tingkat 1: Arah Pandang"
                : currentTier === 2
                ? "Tingkat 2: Perwira Kunci"
                : "Tingkat 3: Langkah Solusi Lengkap"}
            </Badge>

            <span className="text-[11px] text-[#8A9299]">
              {currentTier < 3 ? "Petunjuk Bertahap" : "Solusi Terbuka"}
            </span>
          </div>

          {/* Tier 1 View */}
          {currentTier === 1 && (
            <div className="space-y-2">
              <p className="text-sm text-[#F2F0E8] leading-relaxed">
                {hint.tier1Observation.clue}
              </p>
              <p className="text-xs text-[#8A9299] italic">
                Tips Mentor: Amati papan catur Anda sekarang. Coba temukan sendiri perwira yang paling cocok digerakkan sebelum meminta petunjuk berikutnya.
              </p>
            </div>
          )}

          {/* Tier 2 View */}
          {currentTier === 2 && (
            <div className="space-y-2">
              <p className="text-sm text-[#F2F0E8] leading-relaxed">
                {hint.tier2Piece.clue}
              </p>
              <p className="text-xs text-[#8A9299] italic">
                Tips Mentor: Petak perwira kunci ({hint.tier2Piece.pieceSquare.toUpperCase()}) telah ditandai di papan. Ke petak mana ia harus melangkah?
              </p>
            </div>
          )}

          {/* Tier 3 View */}
          {currentTier === 3 && (
            <div className="space-y-2">
              <p className="text-sm text-[#F2F0E8] leading-relaxed">
                {hint.tier3Concrete.clue}
              </p>
              <div className="p-2.5 rounded-lg bg-[#24292E] border border-[#353B42] text-xs text-[#B0B5B9]">
                <strong className="text-[#C7A66A]">Alasan Strategis: </strong>
                {hint.tier3Concrete.rationale}
              </div>
            </div>
          )}

          {/* Voice Player with Aoede Character */}
          <div className="pt-2 border-t border-[#353B42]">
            <TutorAudioPlayer
              spokenText={currentSpokenText}
              autoPlayTrigger={false}
              className="bg-[#141619] border-[#353B42]"
            />
          </div>
        </div>

        {/* Modal Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1">
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Tutup & Coba di Papan
          </Button>

          {currentTier < 3 ? (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setCurrentTier((prev) => (prev < 3 ? ((prev + 1) as SocraticHintTier) : prev))}
              className="w-full sm:w-auto"
            >
              <Lightbulb className="w-3.5 h-3.5 mr-1 text-[#C7A66A]" />
              {currentTier === 1 ? "Butuh Bidak Kunci? (Tingkat 2)" : "Buka Solusi Lengkap (Tingkat 3)"}
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              Saya Paham, Siap Melangkah
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
