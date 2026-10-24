"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Send,
  Loader2,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Compass,
} from "lucide-react";
import { TutorExplainRequest, TutorExplainResponse, SuggestedMove } from "../types";
import { requestTutorExplanation } from "../tutor-client";
import { TutorAudioPlayer } from "./TutorAudioPlayer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface TutorPanelProps {
  requestContext: TutorExplainRequest;
  initialExplanation?: TutorExplainResponse | null;
  onHighlightMove?: (uci: string) => void;
  className?: string;
}

export const TutorPanel: React.FC<TutorPanelProps> = ({
  requestContext,
  initialExplanation = null,
  onHighlightMove,
  className = "",
}) => {
  const [explanation, setExplanation] = useState<TutorExplainResponse | null>(
    initialExplanation
  );
  const [prevInitial, setPrevInitial] = useState<TutorExplainResponse | null>(initialExplanation);
  if (prevInitial !== initialExplanation) {
    setPrevInitial(initialExplanation);
    setExplanation(initialExplanation);
  }

  const [loading, setLoading] = useState<boolean>(!initialExplanation);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [customQuestion, setCustomQuestion] = useState<string>("");
  const [activeHighlightedMove, setActiveHighlightedMove] = useState<string | null>(null);

  // Fetch initial explanation if not provided
  useEffect(() => {
    let cancelled = false;
    if (!initialExplanation) {
      requestTutorExplanation(requestContext)
        .then((data) => {
          if (!cancelled) {
            setExplanation(data);
            setLoading(false);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setLoading(false);
          }
        });
    }
    return () => {
      cancelled = true;
    };
  }, [initialExplanation, requestContext]);

  const handleAskQuestion = async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setCustomQuestion("");
    try {
      const updatedReq: TutorExplainRequest = {
        ...requestContext,
        question: trimmed,
      };
      const data = await requestTutorExplanation(updatedReq);
      setExplanation(data);
      setShowHint(false);
    } catch {
      // Error handled by tutor-client fallback
    } finally {
      setLoading(false);
    }
  };

  const handleMoveClick = (move: SuggestedMove) => {
    setActiveHighlightedMove(move.uci);
    if (onHighlightMove) {
      onHighlightMove(move.uci);
    }
  };

  return (
    <Card
      variant="surface"
      className={`space-y-4 border border-[#353B42] ${className}`}
      role="region"
      aria-label="Panel Guru Catur AI"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[#353B42]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#C7A66A]/15 border border-[#C7A66A]/30 flex items-center justify-center text-[#C7A66A]">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-[#F2F0E8] flex items-center gap-1.5">
              <span>Guru Catur AI</span>
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {explanation?.source === "gemini" ? (
            <Badge variant="accent" size="sm" className="text-[10px]">
              Tersambung (Gemini)
            </Badge>
          ) : (
            <Badge variant="muted" size="sm" className="text-[10px]">
              Panduan Mandiri
            </Badge>
          )}
        </div>
      </div>

      {loading ? (
        <div className="py-8 flex flex-col items-center justify-center text-center space-y-2">
          <Loader2 className="w-6 h-6 animate-spin text-[#C7A66A]" />
          <p className="text-xs text-[#B0B5B9]">
            Guru sedang menganalisis posisi dan merangkum penjelasan...
          </p>
        </div>
      ) : explanation ? (
        <div className="space-y-4">
          {/* Title & Core Summary */}
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-[#F2F0E8]">
              {explanation.title}
            </h4>
            <p className="text-xs text-[#B0B5B9] leading-relaxed">
              {explanation.summary}
            </p>
          </div>

          {/* Integrated Speech Audio Player */}
          <TutorAudioPlayer
            spokenText={explanation.spokenText}
            autoPlayTrigger={true}
          />

          {/* Educational Explanation */}
          <div className="p-3 rounded-lg bg-[#141619] border border-[#353B42]/70 text-xs text-[#B0B5B9] leading-relaxed space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#C7A66A] uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5" />
              <span>Konsep: {explanation.concept}</span>
            </div>
            <p className="whitespace-pre-line">{explanation.explanation}</p>
          </div>

          {/* Stepped Hint Accordion */}
          {explanation.hint && (
            <div className="rounded-lg border border-[#353B42] bg-[#24292E]/60 overflow-hidden text-xs">
              <button
                type="button"
                onClick={() => setShowHint(!showHint)}
                className="w-full flex items-center justify-between p-2.5 text-left text-xs font-medium text-[#C7A66A] hover:bg-[#2C3238] transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>{showHint ? "Sembunyikan Petunjuk" : "Butuh Petunjuk Tambahan?"}</span>
                </div>
                {showHint ? (
                  <ChevronUp className="w-3.5 h-3.5 text-[#8A9299]" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-[#8A9299]" />
                )}
              </button>
              {showHint && (
                <div className="p-2.5 pt-0 text-[11px] text-[#F2F0E8] leading-relaxed border-t border-[#353B42]/50">
                  {explanation.hint}
                </div>
              )}
            </div>
          )}

          {/* Suggested Legal Candidate Moves */}
          {explanation.suggestedMoves && explanation.suggestedMoves.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8A9299] block">
                Langkah yang Disarankan:
              </span>
              <div className="space-y-1.5">
                {explanation.suggestedMoves.map((m) => (
                  <div
                    key={m.uci}
                    className={`flex items-start justify-between p-2 rounded-lg border text-xs transition-colors ${
                      activeHighlightedMove === m.uci
                        ? "bg-[#C7A66A]/15 border-[#C7A66A] text-[#F2F0E8]"
                        : "bg-[#141619] border-[#353B42] text-[#B0B5B9]"
                    }`}
                  >
                    <div className="space-y-0.5 flex-1 pr-2">
                      <div className="flex items-center gap-1.5 font-medium text-[#F2F0E8]">
                        <span className="px-1.5 py-0.5 rounded bg-[#24292E] font-mono text-[11px] text-[#C7A66A]">
                          {m.san}
                        </span>
                        <span className="text-[11px] text-[#8A9299]">({m.uci})</span>
                      </div>
                      <p className="text-[11px] text-[#8A9299] leading-snug">
                        {m.description}
                      </p>
                    </div>

                    {onHighlightMove && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMoveClick(m)}
                        className="text-[10px] h-6 px-2 text-[#C7A66A] hover:bg-[#C7A66A]/20 shrink-0"
                      >
                        Tampilkan
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Follow-up Question Prompts & Custom Input */}
          <div className="space-y-2 pt-1 border-t border-[#353B42]">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8A9299] block">
              Tanyakan Kepada Guru:
            </span>

            {/* Quick Chips */}
            <div className="flex flex-wrap gap-1.5">
              {[
                "Kenapa langkah ini penting?",
                "Apa ancaman utama lawan?",
                "Bisa jelaskan lebih sederhana?",
              ].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handleAskQuestion(chip)}
                  disabled={loading}
                  className="px-2 py-1 rounded-md text-[11px] bg-[#141619] border border-[#353B42] text-[#8A9299] hover:text-[#F2F0E8] hover:border-[#C7A66A] transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Custom Question Text Input */}
            <div className="flex items-center gap-1.5 pt-1">
              <input
                type="text"
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAskQuestion(customQuestion);
                  }
                }}
                placeholder="Ajukan pertanyaan seputar posisi ini..."
                maxLength={500}
                disabled={loading}
                className="flex-1 bg-[#141619] border border-[#353B42] focus:border-[#C7A66A] rounded-lg px-2.5 py-1.5 text-xs text-[#F2F0E8] placeholder:text-[#8A9299] focus:outline-none transition-colors"
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleAskQuestion(customQuestion)}
                disabled={!customQuestion.trim() || loading}
                className="px-2.5 text-xs"
                aria-label="Kirim pertanyaan"
              >
                <Send className="w-3.5 h-3.5 text-[#C7A66A]" />
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </Card>
  );
};
