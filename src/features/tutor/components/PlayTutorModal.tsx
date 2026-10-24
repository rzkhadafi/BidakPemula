"use client";

import React, { useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { TutorPanel } from "./TutorPanel";
import { TutorExplainRequest } from "../types";
import { tutorSpeech } from "../speech-controller";

interface PlayTutorModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestContext: TutorExplainRequest | null;
  onHighlightMove?: (uci: string) => void;
}

export const PlayTutorModal: React.FC<PlayTutorModalProps> = ({
  isOpen,
  onClose,
  requestContext,
  onHighlightMove,
}) => {
  // Stop active speech playback when modal closes
  useEffect(() => {
    if (!isOpen) {
      tutorSpeech.stop();
    }
  }, [isOpen]);

  if (!requestContext) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bimbingan Guru Catur AI"
      description="Analisis dan penjelasan suara mengenai langkah dan situasi papan terkini."
    >
      <div className="pt-1">
        <TutorPanel
          requestContext={requestContext}
          onHighlightMove={onHighlightMove}
          className="border-0 shadow-none p-0 bg-transparent"
        />
      </div>
    </Modal>
  );
};
