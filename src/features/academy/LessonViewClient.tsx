"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Trophy,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { AcademyLesson } from "./types";
import { InteractiveLessonBoard } from "./InteractiveLessonBoard";
import { markLessonCompleted } from "./academy-progress";
import { TutorPanel } from "@/features/tutor/components/TutorPanel";
import { tutorSpeech } from "@/features/tutor/speech-controller";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

interface LessonViewClientProps {
  lesson: AcademyLesson;
  prevLesson: AcademyLesson | null;
  nextLesson: AcademyLesson | null;
}

export const LessonViewClient: React.FC<LessonViewClientProps> = ({
  lesson,
  prevLesson,
  nextLesson,
}) => {
  const router = useRouter();
  const [completionModalOpen, setCompletionModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"tutor" | "guide">("tutor");
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [prevLessonId, setPrevLessonId] = useState<string>(lesson.id);

  // Sync step index during render when lesson changes (official React pattern)
  if (prevLessonId !== lesson.id) {
    setPrevLessonId(lesson.id);
    setCurrentStepIdx(0);
  }

  // Stop previous speech when navigating to a different lesson or switching away to guide tab
  React.useEffect(() => {
    if (activeTab === "guide") {
      tutorSpeech.stop();
    }
  }, [activeTab]);

  React.useEffect(() => {
    tutorSpeech.stop();
  }, [lesson.id]);

  // Cleanup speech when navigating away
  React.useEffect(() => {
    return () => {
      tutorSpeech.stop();
    };
  }, []);

  const handleLessonComplete = () => {
    tutorSpeech.stop();
    markLessonCompleted(lesson.id);
    setCompletionModalOpen(true);
  };

  const currentStep = lesson.steps[currentStepIdx] || lesson.steps[0];

  const tutorRequestContext = React.useMemo(
    () => ({
      fen: currentStep.fen,
      sideToMove: "w" as const,
      learnerLevel: "pemula" as const,
      mode: "lesson" as const,
      lessonTitle: lesson.title,
      lessonStepInstruction: currentStep.instruction,
    }),
    [currentStep.fen, currentStep.instruction, lesson.title]
  );

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col space-y-2 min-h-0">
      {/* Sleek Compact Header Bar */}
      <div className="flex items-center justify-between gap-3 pb-1.5 border-b border-[#353B42] text-xs shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <Link
            href="/academy"
            className="inline-flex items-center gap-1 text-xs text-[#B0B5B9] hover:text-[#F2F0E8] transition-colors shrink-0"
            title="Kembali ke Kurikulum Belajar"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Kurikulum</span>
          </Link>
          <span className="text-[#353B42] select-none">|</span>
          <h1 className="font-semibold text-sm sm:text-base text-[#F2F0E8] truncate">
            {lesson.title}
          </h1>
          <span className="hidden md:inline text-xs text-[#C7A66A] font-medium truncate">
            • {lesson.subtitle}
          </span>
        </div>

        <Badge variant="accent" size="sm" className="shrink-0 text-[11px]">
          Pelajaran {lesson.order} dari 9
        </Badge>
      </div>

      {/* Main Split-Screen: Interactive Board (Left, Stationary) & AI Tutor / Guide (Right, Scrollable) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 items-start flex-1 min-h-0">
        {/* Left Column: Interactive Practice Board (STATIONARY / NO SCROLL) */}
        <div className="lg:col-span-7 flex flex-col items-center w-full shrink-0">
          <div className="w-full max-w-[min(510px,calc(100dvh-175px))]">
            <InteractiveLessonBoard
              lesson={lesson}
              currentStepIndex={currentStepIdx}
              onStepChange={setCurrentStepIdx}
              onLessonComplete={handleLessonComplete}
            />
          </div>
        </div>

        {/* Right Column: AI Tutor & Concept Guide (SCROLLABLE CONTAINER) */}
        <div className="lg:col-span-5 w-full flex flex-col lg:max-h-[calc(100dvh-115px)] lg:sticky lg:top-1">
          {/* Tab Selection */}
          <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[#1C2024] border border-[#353B42] shrink-0 mb-2.5">
            <button
              type="button"
              onClick={() => setActiveTab("tutor")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md text-xs font-medium transition-colors ${
                activeTab === "tutor"
                  ? "bg-[#C7A66A] text-[#141619] font-semibold"
                  : "text-[#8A9299] hover:text-[#F2F0E8]"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Guru Catur (Suara)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("guide")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md text-xs font-medium transition-colors ${
                activeTab === "guide"
                  ? "bg-[#24292E] text-[#F2F0E8] font-semibold border border-[#353B42]"
                  : "text-[#8A9299] hover:text-[#F2F0E8]"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Panduan Materi</span>
            </button>
          </div>

          {/* Independent Scrollable Container for Tutor & Guide */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 pb-2">
            {activeTab === "tutor" ? (
              <TutorPanel
                key={`${lesson.id}-${currentStep.id}`}
                requestContext={tutorRequestContext}
              />
            ) : (
              <>
                {/* Concept Guide Card */}
                <Card variant="surface" className="space-y-3">
                  <div className="flex items-center gap-2 text-xs text-[#C7A66A] font-semibold uppercase tracking-wider pb-2 border-b border-[#353B42]">
                    <BookOpen className="w-4 h-4" />
                    <span>{lesson.conceptHeading}</span>
                  </div>

                  <p className="text-xs text-[#F2F0E8] font-medium leading-relaxed">
                    {lesson.summary}
                  </p>

                  <div className="space-y-2 text-xs text-[#B0B5B9] leading-relaxed pt-1 border-t border-[#353B42]/50">
                    {lesson.conceptBody.map((paragraph, idx) => (
                      <p key={idx}>{paragraph}</p>
                    ))}
                  </div>
                </Card>

                {/* Key Takeaways Card */}
                <Card variant="surface" className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#F2F0E8] pb-1 border-b border-[#353B42]">
                    Poin Penting untuk Diingat:
                  </h3>
                  <ul className="space-y-2 text-xs text-[#B0B5B9]">
                    {lesson.takeaways.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C7A66A] mt-1.5 shrink-0" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </>
            )}

            {/* Navigation Controls */}
            <div className="flex items-center justify-between pt-2">
              {prevLesson ? (
                <Link href={`/academy/${prevLesson.id}`}>
                  <Button variant="secondary" size="sm" className="text-xs">
                    <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                    <span>Pelajaran {prevLesson.order}</span>
                  </Button>
                </Link>
              ) : (
                <div />
              )}

              {nextLesson && (
                <Link href={`/academy/${nextLesson.id}`}>
                  <Button variant="primary" size="sm" className="text-xs">
                    <span>Pelajaran {nextLesson.order}</span>
                    <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Completion Modal */}
      <Modal
        isOpen={completionModalOpen}
        onClose={() => setCompletionModalOpen(false)}
        title="Pelajaran Berhasil Diselesaikan!"
        description={`Selamat! Anda telah menguasai materi ${lesson.title}.`}
      >
        <div className="space-y-4 pt-2">
          <div className="p-4 rounded-xl bg-[#73B894]/15 border border-[#73B894]/40 flex items-center gap-3 text-xs text-[#73B894]">
            <Trophy className="w-8 h-8 text-[#C7A66A] shrink-0" />
            <div className="space-y-0.5">
              <span className="font-semibold text-sm text-[#F2F0E8] block">
                Progres Tersimpan di Perangkat Anda
              </span>
              <p className="text-[#B0B5B9]">
                Pemahaman Anda semakin tajam untuk melangkah ke materi berikutnya.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setCompletionModalOpen(false);
                router.push("/academy");
              }}
            >
              Ke Daftar Pelajaran
            </Button>

            {nextLesson ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setCompletionModalOpen(false);
                  router.push(`/academy/${nextLesson.id}`);
                }}
              >
                <span>Lanjut ke Pelajaran {nextLesson.order}</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setCompletionModalOpen(false);
                  router.push("/play");
                }}
              >
                <span>Coba Main Melawan Bot</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};
