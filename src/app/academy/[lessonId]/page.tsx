import React, { Suspense } from "react";
import { ACADEMY_LESSONS, getLessonById } from "@/features/academy/academy-catalog";
import { LessonViewClient } from "@/features/academy/LessonViewClient";

export function generateStaticParams() {
  return ACADEMY_LESSONS.map((lesson) => ({
    lessonId: lesson.id,
  }));
}

async function LessonDetailContent({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  const currentLessonIndex = ACADEMY_LESSONS.findIndex((l) => l.id === lessonId);

  // If unknown lesson, default to first lesson gracefully
  const lesson = getLessonById(lessonId) || ACADEMY_LESSONS[0];
  const validIndex = currentLessonIndex >= 0 ? currentLessonIndex : 0;
  const prevLesson = validIndex > 0 ? ACADEMY_LESSONS[validIndex - 1] : null;
  const nextLesson = validIndex < ACADEMY_LESSONS.length - 1 ? ACADEMY_LESSONS[validIndex + 1] : null;

  return (
    <LessonViewClient
      lesson={lesson}
      prevLesson={prevLesson}
      nextLesson={nextLesson}
    />
  );
}

export default function LessonDetailPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="py-12 flex justify-center items-center text-xs text-[#8A9299]">
          Memuat materi pelajaran...
        </div>
      }
    >
      <LessonDetailContent params={params} />
    </Suspense>
  );
}
