"use client";

import React, { useSyncExternalStore } from "react";
import Link from "next/link";
import { GraduationCap, Swords, Sparkles, ArrowRight, Play, Compass } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  subscribeToAcademyProgress,
  getAcademyProgressSnapshot,
  getAcademyProgressServerSnapshot,
} from "@/features/academy/academy-progress";
import { useLearningProfile } from "@/features/learning";

export default function HomePage() {
  useSyncExternalStore(
    subscribeToAcademyProgress,
    getAcademyProgressSnapshot,
    getAcademyProgressServerSnapshot
  );

  const { recommendation, isNewUser, summary } = useLearningProfile();

  return (
    <div className="space-y-10 py-4 sm:py-8 max-w-4xl mx-auto">
      {/* Hero Section */}
      <section className="space-y-4 text-center sm:text-left">
        <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-[#F2F0E8] leading-tight">
          Belajar catur, satu langkah demi satu langkah.
        </h1>

        <p className="text-base sm:text-lg text-[#B0B5B9] leading-relaxed max-w-2xl">
          Siapa pun bisa mulai dari nol. Pelajari cara setiap bidak bergerak melalui papan interaktif, pahami strategi dasarnya, dan mulailah bermain catur dengan percaya diri.
        </p>

        {/* Primary Call to Action */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <Link href="/academy" className="w-full sm:w-auto">
            <Button variant="primary" size="lg" className="w-full text-base font-medium">
              <GraduationCap className="w-5 h-5 mr-2 text-[#141619]" />
              Mulai Belajar dari Nol
            </Button>
          </Link>

          <Link href="/play" className="w-full sm:w-auto">
            <Button variant="secondary" size="lg" className="w-full text-base">
              <Swords className="w-5 h-5 mr-2 text-[#C7A66A]" />
              Langsung Main Catur
            </Button>
          </Link>
        </div>
      </section>

      {/* Saran Belajar Adaptif Personal */}
      {!isNewUser && recommendation && (
        <section className="animate-in fade-in duration-200">
          <Card variant="raised" className="p-5 border-[#C7A66A]/40 bg-[#1C2024] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Badge variant="accent" size="sm">
                    Saran Belajar Berikutnya
                  </Badge>
                  <span className="text-xs text-[#8A9299]">
                    {summary.masteredCount} Keterampilan Dikuasai
                  </span>
                </div>
                <h2 className="text-base font-semibold text-[#F2F0E8]">
                  {recommendation.targetTitle}
                </h2>
                <p className="text-xs text-[#B0B5B9] leading-relaxed">
                  {recommendation.reason}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0">
                <Link href={recommendation.href} className="w-full sm:w-auto">
                  <Button variant="primary" size="sm" className="w-full sm:w-auto whitespace-nowrap">
                    <span>{recommendation.actionLabel}</span>
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="pt-2 border-t border-[#353B42] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5 text-xs">
              <span className="text-[#8A9299]">
                Rekomendasi disesuaikan dari hasil latihan pribadimu
              </span>
              <Link
                href="/progress"
                className="text-[#C7A66A] hover:underline flex items-center gap-1 font-medium"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Lihat Detail Perkembangan</span>
              </Link>
            </div>
          </Card>
        </section>
      )}

      {/* Simple Practice Teaser Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {/* Latihan Singkat */}
        <Card variant="surface" className="flex flex-col justify-between hover:border-[#C7A66A]/40 transition-colors">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-lg bg-[#24292E] border border-[#353B42] flex items-center justify-center text-[#E3B66F]">
                <Sparkles className="w-5 h-5" />
              </div>
              <Badge variant="warning" size="sm">
                Latihan Mandiri
              </Badge>
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#F2F0E8]">
                Latihan & Puzzle Taktis
              </h3>
              <p className="text-xs text-[#B0B5B9] mt-1 leading-relaxed">
                Asah insting taktik Anda dengan posisi catur nyata: garpu kuda, serangan tusuk, dan pola skakmat sederhana.
              </p>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-[#353B42] flex items-center justify-between">
            <span className="text-xs text-[#8A9299]">Tersedia 3 tingkat kesulitan</span>
            <Link
              href="/puzzles"
              className="text-xs text-[#C7A66A] hover:underline flex items-center gap-1 font-medium"
            >
              Coba Latihan <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Card>

        {/* Bermain Lawan Bot */}
        <Card variant="surface" className="flex flex-col justify-between hover:border-[#C7A66A]/40 transition-colors">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-lg bg-[#24292E] border border-[#353B42] flex items-center justify-center text-[#73B894]">
                <Play className="w-5 h-5" />
              </div>
              <Badge variant="accent" size="sm">
                Mode Santai
              </Badge>
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#F2F0E8]">
                Bermain Lawan Komputer
              </h3>
              <p className="text-xs text-[#B0B5B9] mt-1 leading-relaxed">
                Uji kemampuan Anda melawan bot catur berkecepatan natural. Anda bisa membatalkan langkah (undo) kapan saja untuk belajar dari kesalahan.
              </p>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-[#353B42] flex items-center justify-between">
            <span className="text-xs text-[#8A9299]">Level bot ramah pemula</span>
            <Link
              href="/play"
              className="text-xs text-[#C7A66A] hover:underline flex items-center gap-1 font-medium"
            >
              Mulai Bermain <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Card>
      </section>
    </div>
  );
}
