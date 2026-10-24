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

  // Cleanup speech when navigating away
  React.useEffect(() => {
    return () => {
      tutorSpeech.stop();
    };
  }, []);

  const handleLessonComplete = () => {
    markLessonCompleted(lesson.id);
    setCompletionModalOpen(true);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between pb-3 border-b border-[#353B42]">
        <Link
          href="/academy"
          className="inline-flex items-center gap-1.5 text-xs text-[#B0B5B9] hover:text-[#F2F0E8] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Kembali ke Kurikulum Belajar</span>
        </Link>
        <Badge variant="accent">Pelajaran {lesson.order} dari 9</Badge>
      </div>

      {/* Lesson Header */}
      <div className="space-y-1">
        <h1 className="text-xl sm:text-3xl font-semibold text-[#F2F0E8]">
          {lesson.title}
        </h1>
        <p className="text-xs sm:text-sm text-[#C7A66A] font-medium">
          {lesson.subtitle}
        </p>
        <p className="text-xs sm:text-sm text-[#B0B5B9] leading-relaxed pt-1 max-w-3xl">
          {lesson.summary}
        </p>
      </div>

      {/* Main Grid: Interactive Board & Lesson Guide */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Practice Board */}
        <div className="lg:col-span-7 flex flex-col items-center w-full">
          <InteractiveLessonBoard
            lesson={lesson}
            onLessonComplete={handleLessonComplete}
          />
        </div>

        {/* Right Column: AI Tutor & Concept Guide */}
        <div className="lg:col-span-5 space-y-4 w-full">
          {/* Tab Selection */}
          <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[#1C2024] border border-[#353B42]">
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

          {activeTab === "tutor" ? (
            <TutorPanel
              requestContext={{
                fen: lesson.steps[0].fen,
                sideToMove: "w",
                learnerLevel: "pemula",
                mode: "lesson",
                lessonTitle: lesson.title,
                lessonStepInstruction: lesson.steps[0].instruction,
              }}
            />
          ) : (
            <>
              {/* Concept Guide Card */}
              <Card variant="surface" className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-[#C7A66A] font-semibold uppercase tracking-wider pb-2 border-b border-[#353B42]">
                  <BookOpen className="w-4 h-4" />
                  <span>{lesson.conceptHeading}</span>
                </div>

                <div className="space-y-2.5 text-xs text-[#B0B5B9] leading-relaxed">
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
