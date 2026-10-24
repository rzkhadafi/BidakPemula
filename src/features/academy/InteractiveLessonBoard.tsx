"use client";

import React, { useState, useCallback } from "react";
import { Chess, Square } from "chess.js";
import { CheckCircle2, HelpCircle, RotateCcw, ArrowRight, Sparkles } from "lucide-react";
import { InteractiveChessboard } from "@/components/chessboard/InteractiveChessboard";
import { AcademyLesson, LessonStep } from "./types";
import { markLessonStepCompleted } from "./academy-progress";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { chessAudio } from "@/lib/audio/chess-audio";

interface InteractiveLessonBoardProps {
  lesson: AcademyLesson;
  initialStepIndex?: number;
  onLessonComplete: () => void;
}

function initChessWithFen(fen: string): Chess {
  const c = new Chess();
  if (fen.startsWith("8/8/8/8/8/8/8/8")) {
    c.clear();
    return c;
  }
  try {
    c.load(fen);
    return c;
  } catch {
    return c;
  }
}

export const InteractiveLessonBoard: React.FC<InteractiveLessonBoardProps> = ({
  lesson,
  initialStepIndex = 0,
  onLessonComplete,
}) => {
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(initialStepIndex);
  const step: LessonStep = lesson.steps[currentStepIdx] || lesson.steps[0];

  const [chess, setChess] = useState<Chess>(() => initChessWithFen(step.fen));
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalDestinations, setLegalDestinations] = useState<string[]>([]);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: string; to: string } | null>(null);

  const [status, setStatus] = useState<"idle" | "correct" | "incorrect">("idle");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);

  // Sync state during render when step changes (official React pattern)
  const [prevStepId, setPrevStepId] = useState<string>(step.id);
  if (prevStepId !== step.id) {
    setPrevStepId(step.id);
    setChess(initChessWithFen(step.fen));
    setSelectedSquare(null);
    setLegalDestinations([]);
    setLastMove(null);
    setPendingPromotion(null);
    setStatus("idle");
    setFeedback(null);
    setShowHint(false);
  }

  const executeMove = useCallback(
    (from: string, to: string, promotion?: "q" | "r" | "b" | "n") => {
      const moveUci = `${from}${to}${promotion || ""}`;
      const isExpected =
        (step.expectedMoveUci && step.expectedMoveUci === moveUci) ||
        (step.allowedMovesUci && step.allowedMovesUci.some((m) => m.startsWith(`${from}${to}`)));

      try {
        const res = chess.move({
          from: from as Square,
          to: to as Square,
          promotion,
        });

        if (!res) return;

        setChess(new Chess(chess.fen()));
        setLastMove({ from, to });
        setSelectedSquare(null);
        setLegalDestinations([]);
        setPendingPromotion(null);

        if (isExpected) {
          setStatus("correct");
          setFeedback(step.explanationOnSuccess);
          chessAudio.playMove();
          markLessonStepCompleted(lesson.id, currentStepIdx, lesson.steps.length);
        } else {
          setStatus("incorrect");
          setFeedback("Langkah tersebut legal, tetapi belum sesuai dengan sasaran latihan. Klik 'Ulangi' untuk mencoba kembali.");
        }
      } catch {
        setStatus("incorrect");
        setFeedback("Gerakan tidak diperbolehkan menurut aturan catur.");
      }
    },
    [chess, currentStepIdx, lesson.id, lesson.steps.length, step.allowedMovesUci, step.expectedMoveUci, step.explanationOnSuccess]
  );

  const handleSquareClick = useCallback(
    (squareCoord: string) => {
      if (status === "correct") return;

      // Mode A: Click target square directly (e.g. learning board coordinates)
      if (step.targetSquare) {
        if (squareCoord.toLowerCase() === step.targetSquare.toLowerCase()) {
          setStatus("correct");
          setFeedback(step.explanationOnSuccess);
          chessAudio.playMove();
          markLessonStepCompleted(lesson.id, currentStepIdx, lesson.steps.length);
        } else {
          setStatus("incorrect");
          setFeedback(`Petak yang Anda klik adalah ${squareCoord.toUpperCase()}. Coba cari petak ${step.targetSquare.toUpperCase()}.`);
        }
        return;
      }

      // Mode B: Make a chess move
      const sq = squareCoord as Square;

      if (selectedSquare) {
        if (selectedSquare === sq) {
          setSelectedSquare(null);
          setLegalDestinations([]);
          return;
        }

        if (legalDestinations.includes(sq)) {
          const piece = chess.get(selectedSquare as Square);
          const isPromotion =
            piece?.type === "p" &&
            ((piece.color === "w" && sq.endsWith("8")) || (piece.color === "b" && sq.endsWith("1")));

          if (isPromotion) {
            setPendingPromotion({ from: selectedSquare, to: sq });
            return;
          }

          executeMove(selectedSquare, sq);
          return;
        }

        const clickedPiece = chess.get(sq);
        if (clickedPiece && clickedPiece.color === chess.turn()) {
          setSelectedSquare(sq);
          const moves = chess.moves({ square: sq, verbose: true });
          setLegalDestinations(moves.map((m) => m.to));
          return;
        }

        setSelectedSquare(null);
        setLegalDestinations([]);
        return;
      }

      const piece = chess.get(sq);
      if (piece && piece.color === chess.turn()) {
        setSelectedSquare(sq);
        const moves = chess.moves({ square: sq, verbose: true });
        setLegalDestinations(moves.map((m) => m.to));
      }
    },
    [chess, currentStepIdx, executeMove, legalDestinations, lesson.id, lesson.steps.length, selectedSquare, status, step.explanationOnSuccess, step.targetSquare]
  );

  const handleNextStep = () => {
    if (currentStepIdx < lesson.steps.length - 1) {
      setCurrentStepIdx((prev) => prev + 1);
    } else {
      onLessonComplete();
    }
  };

  const handleResetStep = () => {
    const fresh = new Chess(step.fen);
    setChess(fresh);
    setSelectedSquare(null);
    setLegalDestinations([]);
    setLastMove(null);
    setPendingPromotion(null);
    setStatus("idle");
    setFeedback(null);
    setShowHint(false);
  };

  return (
    <div className="space-y-4 w-full">
      {/* Step Header */}
      <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-[#1C2024] border border-[#353B42]">
        <div className="flex items-center gap-2">
          <Badge variant="accent" size="sm">
            Tantangan {currentStepIdx + 1} dari {lesson.steps.length}
          </Badge>
          <span className="text-xs text-[#F2F0E8] font-medium hidden sm:inline">
            {step.instruction}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetStep}
            className="text-xs text-[#8A9299] hover:text-[#F2F0E8] h-7 px-2"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            Ulangi
          </Button>
        </div>
      </div>

      {/* Interactive Chessboard */}
      <InteractiveChessboard
        chess={chess}
        orientation="white"
        selectedSquare={selectedSquare}
        legalDestinations={legalDestinations}
        lastMove={lastMove}
        isCheck={chess.inCheck()}
        disabled={status === "correct"}
        pendingPromotion={pendingPromotion}
        onSquareClick={handleSquareClick}
        onConfirmPromotion={(p) => {
          if (pendingPromotion) {
            executeMove(pendingPromotion.from, pendingPromotion.to, p);
          }
        }}
        onCancelPromotion={() => {
          setPendingPromotion(null);
          setSelectedSquare(null);
          setLegalDestinations([]);
        }}
      />

      {/* Instruction & Feedback Card */}
      <Card variant="surface" className="space-y-3">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-[#F2F0E8] flex items-center gap-2">
            <span>{step.instruction}</span>
          </h3>
          <p className="text-xs text-[#B0B5B9] leading-relaxed">
            {step.subText}
          </p>
        </div>

        {/* Dynamic Feedback Banner */}
        {status === "correct" && (
          <div className="p-3 rounded-lg bg-[#73B894]/15 border border-[#73B894]/40 text-xs text-[#73B894] space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#73B894]" />
              <span>Langkah Benar!</span>
            </div>
            <p className="text-[#F2F0E8] leading-relaxed">
              {feedback}
            </p>
            <div className="pt-1">
              <Button
                variant="primary"
                size="sm"
                onClick={handleNextStep}
                className="w-full sm:w-auto text-xs"
              >
                <span>
                  {currentStepIdx < lesson.steps.length - 1
                    ? "Lanjut ke Tantangan Berikutnya"
                    : "Selesaikan Pelajaran Ini"}
                </span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          </div>
        )}

        {status === "incorrect" && (
          <div className="p-3 rounded-lg bg-[#E3B66F]/10 border border-[#E3B66F]/30 text-xs text-[#E3B66F] space-y-2 animate-in fade-in duration-200">
            <p className="leading-relaxed">{feedback}</p>
            <div className="flex items-center gap-2 pt-1">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleResetStep}
                className="text-xs"
              >
                Coba Lagi
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHint(true)}
                className="text-xs text-[#E3B66F] hover:text-[#F2F0E8]"
              >
                <HelpCircle className="w-3.5 h-3.5 mr-1" />
                Lihat Petunjuk
              </Button>
            </div>
          </div>
        )}

        {/* Hint Section */}
        {showHint && status !== "correct" && (
          <div className="p-2.5 rounded-lg bg-[#24292E] border border-[#353B42] text-xs text-[#B0B5B9] space-y-1 animate-in fade-in">
            <span className="font-medium text-[#C7A66A] flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Petunjuk Arahan:
            </span>
            <p className="leading-relaxed">{step.hint}</p>
          </div>
        )}

        {status === "idle" && !showHint && (
          <div className="pt-1 flex items-center justify-between text-xs text-[#8A9299]">
            <span>Lakukan gerakan langsung pada papan catur di atas.</span>
            <button
              type="button"
              onClick={() => setShowHint(true)}
              className="hover:text-[#F2F0E8] underline flex items-center gap-1 text-[11px]"
            >
              <HelpCircle className="w-3 h-3" />
              Butuh Petunjuk?
            </button>
          </div>
        )}
      </Card>
    </div>
  );
};
