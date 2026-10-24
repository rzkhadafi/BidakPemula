"use client";

import React, { useEffect } from "react";
import { Sparkles, X } from "lucide-react";
import { TutorPanel } from "./TutorPanel";
import { TutorExplainRequest } from "../types";
import { tutorSpeech } from "../speech-controller";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface PlayTutorModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestContext: TutorExplainRequest | null;
  onHighlightMove?: (uci: string) => void;
  className?: string;
}

/**
 * Panel Penjelasan Guru Catur AI (Non-Modal / Docked Side Panel)
 * Menggantikan modal pop-up agar papan catur selalu 100% terlihat dan tidak tertutup saat belajar.
 */
export const PlayTutorModal: React.FC<PlayTutorModalProps> = ({
  isOpen,
  onClose,
  requestContext,
  onHighlightMove,
  className = "",
}) => {
  // Hentikan suara saat panel ditutup atau berganti
  useEffect(() => {
    if (!isOpen) {
      tutorSpeech.stop();
    }
  }, [isOpen]);

  if (!isOpen || !requestContext) return null;

  return (
    <Card
      variant="surface"
      className={`p-4 space-y-3 border border-[#C7A66A]/60 bg-gradient-to-b from-[#1C2024] to-[#141619] shadow-xl rounded-2xl animate-in fade-in ${className}`}
      role="region"
      aria-label="Panel Bimbingan Guru Catur AI"
    >
      {/* Header Panel */}
      <div className="flex items-start justify-between pb-2.5 border-b border-[#353B42]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#C7A66A]/20 border border-[#C7A66A]/60 flex items-center justify-center text-[#C7A66A] shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#F2F0E8] flex items-center gap-1.5">
              <span>Bimbingan Guru Catur AI</span>
              <span className="w-2 h-2 rounded-full bg-[#73B894] animate-pulse" />
            </h2>
            <p className="text-[11px] text-[#C7A66A]">
              Analisis dan penjelasan suara mengenai langkah dan situasi papan terkini.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup Penjelasan"
          className="text-[#8A9299] hover:text-[#F2F0E8] hover:bg-[#24292E] p-1.5 rounded-lg transition-colors cursor-pointer"
          title="Tutup penjelasan dan kembali ke kontrol permainan"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body: Konten Interaktif TutorPanel */}
      <div className="pt-1">
        <TutorPanel
          requestContext={requestContext}
          onHighlightMove={onHighlightMove}
          className="border-0 shadow-none p-0 bg-transparent"
        />
      </div>

      {/* Footer Button: Kembali ke Permainan */}
      <div className="pt-2 border-t border-[#353B42]">
        <Button
          variant="secondary"
          size="sm"
          onClick={onClose}
          className="w-full justify-center text-xs"
        >
          Tutup Penjelasan & Lanjut Main
        </Button>
      </div>
    </Card>
  );
};
