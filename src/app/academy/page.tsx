"use client";

import React, { useSyncExternalStore } from "react";
import Link from "next/link";
import { GraduationCap, ChevronRight, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ACADEMY_LESSONS } from "@/features/academy/academy-catalog";
import {
  subscribeToAcademyProgress,
  getAcademyProgressSnapshot,
  getAcademyProgressServerSnapshot,
} from "@/features/academy/academy-progress";

export default function AcademyPage() {
  const progress = useSyncExternalStore(
    subscribeToAcademyProgress,
    getAcademyProgressSnapshot,
    getAcademyProgressServerSnapshot
  );

  const completedCount = progress.completedLessonIds.length;
  const totalLessons = ACADEMY_LESSONS.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#353B42]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-semibold text-[#F2F0E8]">
              Belajar Catur dari Nol
            </h1>
            <Badge variant="accent">Kurikulum Interaktif</Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#B0B5B9] mt-1">
            Pelajari setiap langkah catur secara bertahap dengan demonstrasi interaktif berbahasa Indonesia.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#1C2024] border border-[#353B42] text-xs text-[#B0B5B9]">
          <GraduationCap className="w-4 h-4 text-[#C7A66A]" />
          <span>
            Progres: <strong className="text-[#F2F0E8]">{completedCount}</strong> dari {totalLessons} Selesai
          </span>
        </div>
      </div>

      {/* Curriculum Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ACADEMY_LESSONS.map((lesson) => {
          const isCompleted = progress.completedLessonIds.includes(lesson.id);
          const isCurrent = progress.currentLessonId === lesson.id;

          return (
            <Card
              key={lesson.id}
              variant="surface"
              className={`flex flex-col justify-between transition-all duration-150 hover:border-[#C7A66A]/50 ${
                isCompleted ? "border-[#73B894]/40" : ""
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#C7A66A]">
                    Pelajaran {lesson.order}
                  </span>
                  {isCompleted ? (
                    <Badge variant="success" size="sm" className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Selesai
                    </Badge>
                  ) : isCurrent ? (
                    <Badge variant="warning" size="sm">
                      Lanjutkan
                    </Badge>
                  ) : (
                    <Badge variant="muted" size="sm">
                      {lesson.duration}
                    </Badge>
                  )}
                </div>

                <div>
                  <h2 className="text-base font-semibold text-[#F2F0E8] leading-snug">
                    {lesson.title}
                  </h2>
                  <p className="text-[11px] text-[#C7A66A] mt-0.5 font-medium">
                    {lesson.subtitle}
                  </p>
                  <p className="text-xs text-[#B0B5B9] mt-2 leading-relaxed line-clamp-3">
                    {lesson.summary}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-[#353B42] flex items-center justify-between">
                <span className="text-[11px] text-[#8A9299]">
                  {lesson.steps.length} Latihan Interaktif
                </span>
                <Link href={`/academy/${lesson.id}`}>
                  <Button
                    variant={isCompleted ? "secondary" : "primary"}
                    size="sm"
                    className="text-xs"
                  >
                    <span>{isCompleted ? "Ulangi" : "Mulai"}</span>
                    <ChevronRight className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
