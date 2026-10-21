import React from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { ChessboardPlaceholder } from "@/components/chessboard/ChessboardPlaceholder";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LESSONS } from "../page";

export function generateStaticParams() {
  return LESSONS.map((lesson) => ({
    lessonId: lesson.id,
  }));
}

export default async function LessonDetailPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  const currentLessonIndex = LESSONS.findIndex((l) => l.id === lessonId);

  // If unknown lesson, default to first lesson or handle gracefully
  const lesson = LESSONS[currentLessonIndex] ?? LESSONS[0];
  const prevLesson = currentLessonIndex > 0 ? LESSONS[currentLessonIndex - 1] : null;
  const nextLesson =
    currentLessonIndex < LESSONS.length - 1 ? LESSONS[currentLessonIndex + 1] : null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between pb-2 border-b border-[#353B42]">
        <Link
          href="/academy"
          className="inline-flex items-center gap-1.5 text-xs text-[#B0B5B9] hover:text-[#F2F0E8] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Kembali ke Kurikulum Akademi</span>
        </Link>
        <Badge variant="accent">Modul {lesson.order} dari 8</Badge>
      </div>

      {/* Lesson Header */}
      <div className="space-y-2">
        <h1 className="text-xl sm:text-3xl font-semibold text-[#F2F0E8]">
          {lesson.title}
        </h1>
        <p className="text-sm text-[#B0B5B9] leading-relaxed">
          {lesson.summary}
        </p>
      </div>

      {/* Two-column layout: Demonstration Board & Reading Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Diagram */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <Card variant="surface" className="w-full space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#353B42]">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#B0B5B9]">
                Diagram Peragaan
              </span>
              <span className="text-xs text-[#8A9299]">Posisi Awal Catur</span>
            </div>
            <ChessboardPlaceholder
              caption="Diagram papan 2D untuk visualisasi materi peragaan."
            />
          </Card>
        </div>

        {/* Right Column: Explanations & Tutor Context */}
        <div className="lg:col-span-5 space-y-4">
          {/* Content Card */}
          <Card variant="surface" className="space-y-4">
            <div className="flex items-center gap-2 text-xs text-[#C7A66A] font-medium uppercase tracking-wider">
              <BookOpen className="w-4 h-4" />
              <span>Tujuan Pembelajaran</span>
            </div>
            <ul className="text-xs sm:text-sm text-[#B0B5B9] space-y-2 list-disc list-inside">
              <li>Mengenali struktur petak catur (lajur a-h dan baris 1-8).</li>
              <li>Mengetahui orientasi petak terang di sudut kanan bawah setiap pemain.</li>
              <li>Menempatkan posisi perwira dan pion secara akurat.</li>
            </ul>

            <div className="pt-3 border-t border-[#353B42] text-xs text-[#B0B5B9] space-y-2">
              <h3 className="font-medium text-[#F2F0E8]">Catatan Penting:</h3>
              <p className="leading-relaxed">
                Papan catur terdiri dari 64 petak datar. Memahami koordinat adalah fondasi utama dalam membaca notasi catur standar (SAN) dan mengikuti ulasan langkah catur.
              </p>
            </div>
          </Card>

          {/* AI Tutor Card (Shell / Disabled State) */}
          <Card variant="raised" className="space-y-2.5 border-[#353B42]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#F2F0E8]">
                <Sparkles className="w-4 h-4 text-[#C7A66A]" />
                <span>Guru Catur AI (Gemini)</span>
              </div>
              <Badge variant="muted" size="sm">
                Fase 3
              </Badge>
            </div>
            <p className="text-xs text-[#8A9299] leading-relaxed">
              Penjelasan kontekstual guru AI akan aktif pada <strong>Fase 3</strong>. Materi inti akademi tetap dapat dipelajari secara lengkap tanpa memerlukan API key.
            </p>
          </Card>
        </div>
      </div>

      {/* Lesson Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-[#353B42]">
        {prevLesson ? (
          <Link href={`/academy/${prevLesson.id}`}>
            <Button variant="secondary" size="sm">
              <ChevronLeft className="w-4 h-4 mr-1" />
              {prevLesson.title}
            </Button>
          </Link>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            disabled
            title="Penyimpanan progres lokal aktif di Fase 2"
          >
            <CheckCircle className="w-4 h-4 mr-1 text-[#73B894]" />
            Tandai Selesai
          </Button>

          {nextLesson && (
            <Link href={`/academy/${nextLesson.id}`}>
              <Button variant="primary" size="sm">
                Lanjut: {nextLesson.title}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
