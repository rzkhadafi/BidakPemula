"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Compass,
  CheckCircle2,
  Clock,
  RotateCcw,
  Sparkles,
  ArrowRight,
  BookOpen,
  Volume2,
  Award,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useLearningProfile } from "@/features/learning";
import { getSkillDefinition } from "@/features/learning/skills-catalog";
import { SpeechController } from "@/features/tutor/speech-controller";
import { BadgeCollectionGrid } from "@/features/badges";

// Singleton speech controller for the page
let pageSpeechController: SpeechController | null = null;
function getPageSpeechController(): SpeechController {
  if (!pageSpeechController) {
    pageSpeechController = new SpeechController();
  }
  return pageSpeechController;
}

export default function ProgressPage() {
  const { profile, recommendation, summary, isNewUser } = useLearningProfile();
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);

  const skillsList = Object.values(profile.skills);
  const masteredSkills = skillsList.filter((s) => s.status === "mastered");
  const inProgressSkills = skillsList.filter(
    (s) => s.status === "in_progress" || s.status === "near_mastery"
  );
  const reviewSkills = skillsList.filter((s) => s.needsReview && s.status !== "not_started");

  const handleSpeakRecommendation = () => {
    if (!recommendation) return;
    const controller = getPageSpeechController();

    if (isPlayingVoice) {
      controller.stop();
      setIsPlayingVoice(false);
      return;
    }

    const textToSpeak = `Halo! Langkah latihan berikutnya yang saya sarankan adalah ${recommendation.targetTitle}. ${recommendation.reason}`;
    setIsPlayingVoice(true);

    controller.speak(textToSpeak).finally(() => {
      setIsPlayingVoice(false);
    });
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#353B42]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-semibold text-[#F2F0E8]">
              Perkembangan Belajar Personal
            </h1>
            <Badge variant="accent">Analisis Adaptif Lokal</Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#B0B5B9] mt-1">
            Menilai pemahaman caturmu dari hasil latihan nyata, mengenali topik yang perlu diulang, dan menyarankan langkah berikutnya.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1C2024] border border-[#353B42] text-xs text-[#B0B5B9]">
          <Compass className="w-4 h-4 text-[#C7A66A]" />
          <span>
            Tingkat Penguasaan: <strong className="text-[#F2F0E8]">{summary.overallMasteryPercent}%</strong>
          </span>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card variant="surface" className="p-3 sm:p-4 text-center">
          <span className="text-2xl sm:text-3xl font-bold text-[#73B894] block">
            {summary.masteredCount}
          </span>
          <span className="text-xs text-[#8A9299] mt-1 block">Sudah Dikuasai</span>
        </Card>

        <Card variant="surface" className="p-3 sm:p-4 text-center">
          <span className="text-2xl sm:text-3xl font-bold text-[#C7A66A] block">
            {summary.inProgressCount + summary.nearMasteryCount}
          </span>
          <span className="text-xs text-[#8A9299] mt-1 block">Sedang Dilatih</span>
        </Card>

        <Card variant="surface" className="p-3 sm:p-4 text-center">
          <span className="text-2xl sm:text-3xl font-bold text-[#E3B66F] block">
            {summary.needsReviewCount}
          </span>
          <span className="text-xs text-[#8A9299] mt-1 block">Perlu Diulang</span>
        </Card>

        <Card variant="surface" className="p-3 sm:p-4 text-center">
          <span className="text-2xl sm:text-3xl font-bold text-[#8A9299] block">
            {summary.notStartedCount}
          </span>
          <span className="text-xs text-[#8A9299] mt-1 block">Belum Dimulai</span>
        </Card>
      </div>

      {/* Bagian 1: Apa yang sebaiknya saya lakukan sekarang? (Rekomendasi Utama) */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#C7A66A]" />
          <h2 className="text-sm font-semibold text-[#F2F0E8] uppercase tracking-wider">
            Saran Langkah Berikutnya
          </h2>
        </div>

        {recommendation ? (
          <Card
            variant="raised"
            className="p-5 border-[#C7A66A]/50 bg-gradient-to-r from-[#1C2024] to-[#24292E] space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="accent" size="sm">
                    {recommendation.type === "lesson"
                      ? "Pelajaran Akademi"
                      : recommendation.type === "puzzle"
                      ? "Latihan Taktik"
                      : "Pengulangan Terencana"}
                  </Badge>
                  <span className="text-xs text-[#B0B5B9] font-medium">
                    Topik: {recommendation.skillName}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-[#F2F0E8]">
                  {recommendation.targetTitle}
                </h3>
                {recommendation.targetSubtitle && (
                  <p className="text-xs text-[#C7A66A] -mt-1">
                    {recommendation.targetSubtitle}
                  </p>
                )}

                <div className="p-3 rounded-lg bg-[#141619]/60 border border-[#353B42] text-xs text-[#F2F0E8] leading-relaxed">
                  <strong className="text-[#C7A66A] block mb-1">
                    Mengapa materi ini disarankan?
                  </strong>
                  {recommendation.reason}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:self-center shrink-0">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleSpeakRecommendation}
                  className="text-xs flex items-center gap-1.5"
                >
                  <Volume2
                    className={`w-3.5 h-3.5 ${
                      isPlayingVoice ? "text-[#73B894] animate-pulse" : "text-[#C7A66A]"
                    }`}
                  />
                  <span>{isPlayingVoice ? "Berhenti" : "Dengarkan Guru Catur"}</span>
                </Button>

                <Link href={recommendation.href}>
                  <Button variant="primary" size="sm" className="w-full sm:w-auto">
                    <span>{recommendation.actionLabel}</span>
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ) : (
          <Card variant="surface" className="p-5 text-center text-xs text-[#8A9299]">
            Belum ada rekomendasi aktif. Mulai dari kurikulum Akademi.
          </Card>
        )}
      </section>

      {/* Bagian 2: Apa yang sudah saya kuasai? */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[#73B894]" />
            <h2 className="text-sm font-semibold text-[#F2F0E8] uppercase tracking-wider">
              Keterampilan yang Sudah Dikuasai ({masteredSkills.length})
            </h2>
          </div>
        </div>

        {masteredSkills.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {masteredSkills.map((skill) => {
              const def = getSkillDefinition(skill.skillId);
              return (
                <Card key={skill.skillId} variant="surface" className="p-3.5 space-y-2 border-[#73B894]/30">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#F2F0E8]">
                      {def.name}
                    </span>
                    <Badge variant="success" size="sm" className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Dikuasai
                    </Badge>
                  </div>
                  <p className="text-[11px] text-[#B0B5B9] leading-relaxed">
                    {def.description}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-[#8A9299] pt-1 border-t border-[#353B42]">
                    <span>Konsistensi: {skill.successCount}x Berhasil</span>
                    <span>Tingkat Percaya Diri: Tinggi</span>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card variant="surface" className="p-5 text-center space-y-2">
            <BookOpen className="w-6 h-6 text-[#8A9299] mx-auto" />
            <p className="text-xs text-[#B0B5B9]">
              Kamu belum memiliki materi berstatus dikuasai.
            </p>
            <p className="text-[11px] text-[#8A9299]">
              Selesaikan latihan gerakan bidak atau puzzle taktik secara mandiri untuk mengumpulkan bukti penguasaan pertamamu.
            </p>
          </Card>
        )}
      </section>

      {/* Bagian 3: Materi apa yang masih perlu saya latih? */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#C7A66A]" />
          <h2 className="text-sm font-semibold text-[#F2F0E8] uppercase tracking-wider">
            Materi yang Sedang Dilatih ({inProgressSkills.length})
          </h2>
        </div>

        {inProgressSkills.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {inProgressSkills.map((skill) => {
              const def = getSkillDefinition(skill.skillId);
              return (
                <Card key={skill.skillId} variant="surface" className="p-3.5 space-y-2 border-[#C7A66A]/30">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#F2F0E8]">
                      {def.name}
                    </span>
                    <Badge variant="warning" size="sm">
                      {skill.status === "near_mastery" ? "Hampir Dikuasai" : "Sedang Dipelajari"}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-[#B0B5B9] leading-relaxed">
                    {def.description}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-[#8A9299] pt-1 border-t border-[#353B42]">
                    <span>{skill.attemptsCount}x Latihan ({skill.mistakesCount} koreksi)</span>
                    <span>Skor Pemahaman: {skill.score}%</span>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card variant="surface" className="p-4 text-center text-xs text-[#8A9299]">
            {isNewUser
              ? "Pilih salah satu materi di Akademi untuk memulai perjalanan belajar."
              : "Semua materi yang kamu mulai saat ini sudah dikuasai dengan baik!"}
          </Card>
        )}
      </section>

      {/* Bagian 4: Pengulangan Terencana (Spaced Repetition) */}
      {reviewSkills.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-[#E3B66F]" />
            <h2 className="text-sm font-semibold text-[#F2F0E8] uppercase tracking-wider">
              Materi yang Waktunya Diulang ({reviewSkills.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {reviewSkills.map((skill) => {
              const def = getSkillDefinition(skill.skillId);
              return (
                <Card key={skill.skillId} variant="surface" className="p-3.5 space-y-2 border-[#E3B66F]/40 bg-[#1C2024]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#F2F0E8]">
                      {def.name}
                    </span>
                    <Badge variant="warning" size="sm">
                      Perlu Diulang
                    </Badge>
                  </div>
                  <p className="text-[11px] text-[#B0B5B9]">
                    Konsep ini sudah beberapa hari tidak kamu latih. Pengulangan berkala menjaga insting catur tetap tajam.
                  </p>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Bagian 4: Koleksi Lencana Kehormatan Pemula */}
      <section className="pt-2 border-t border-[#353B42]">
        <BadgeCollectionGrid />
      </section>

      {/* Bagian 5: Riwayat Aktivitas Belajar */}
      {profile.evidenceHistory.length > 0 && (
        <section className="space-y-3 pt-2 border-t border-[#353B42]">
          <h2 className="text-sm font-semibold text-[#F2F0E8] uppercase tracking-wider">
            Riwayat Aktivitas Terakhir
          </h2>
          <div className="space-y-2">
            {profile.evidenceHistory.slice(0, 5).map((ev) => {
              const def = getSkillDefinition(ev.skillId);
              const dateStr = new Date(ev.timestamp).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={ev.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-[#1C2024] border border-[#353B42] text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        ev.outcome === "success"
                          ? "bg-[#73B894]"
                          : ev.outcome === "assisted"
                          ? "bg-[#C7A66A]"
                          : "bg-[#E17C78]"
                      }`}
                    />
                    <span className="text-[#F2F0E8] font-medium">{def.name}</span>
                    <span className="text-[#8A9299]">
                      ({ev.sourceKind === "lesson_step" ? "Akademi" : "Puzzle"})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[#8A9299] text-[11px]">
                    <span>
                      {ev.outcome === "success"
                        ? "Berhasil Mandiri"
                        : ev.outcome === "assisted"
                        ? "Melihat Solusi"
                        : "Koreksi Langkah"}
                    </span>
                    <span>&bull;</span>
                    <span>{dateStr}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
