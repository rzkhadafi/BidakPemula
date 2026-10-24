"use client";

import React, { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Sparkles, CheckCircle2, ChevronRight, Eye } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PUZZLE_CATALOG } from "@/features/puzzles/puzzle-catalog";
import { THEME_LABELS, DIFFICULTY_LABELS } from "@/features/puzzles/types";
import {
  subscribeToPuzzleProgress,
  getPuzzleProgressSnapshot,
  getPuzzleProgressServerSnapshot,
} from "@/features/puzzles/puzzle-progress";

type FilterTab = "all" | "tactics" | "mate" | "advanced";

export default function PuzzlesPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const progressMap = useSyncExternalStore(
    subscribeToPuzzleProgress,
    getPuzzleProgressSnapshot,
    getPuzzleProgressServerSnapshot
  );

  const filteredPuzzles = PUZZLE_CATALOG.filter((p) => {
    if (activeTab === "all") return true;
    if (activeTab === "tactics") return ["fork", "pin", "skewer", "discovered_attack", "removing_defender"].includes(p.theme);
    if (activeTab === "mate") return p.theme === "checkmate_pattern";
    if (activeTab === "advanced") return p.difficulty === "advanced";
    return true;
  });

  const totalSolved = Object.values(progressMap).filter((p) => p.solved).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#353B42]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-semibold text-[#F2F0E8]">
              Latihan Taktik & Puzzle
            </h1>
            <Badge variant="accent">18 Latihan Terverifikasi</Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#B0B5B9] mt-1">
            Asah intuisi dan ketajaman berpikir Anda dengan posisi catur nyata dan petunjuk bertahap.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#1C2024] border border-[#353B42] text-xs text-[#B0B5B9]">
          <Sparkles className="w-4 h-4 text-[#E3B66F]" />
          <span>
            Berhasil Dipecahkan: <strong className="text-[#F2F0E8]">{totalSolved}</strong> dari {PUZZLE_CATALOG.length}
          </span>
        </div>
      </div>

      {/* Simplified Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {[
          { id: "all", label: "Semua Latihan" },
          { id: "tactics", label: "Taktik Dasar (Garpu, Pin, Tusukan)" },
          { id: "mate", label: "Tantangan Skakmat" },
          { id: "advanced", label: "Tingkat Lanjutan" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as FilterTab)}
            className={`px-3.5 py-2 rounded-xl font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-[#C7A66A] ${
              activeTab === tab.id
                ? "bg-[#24292E] text-[#F2F0E8] border border-[#C7A66A]/60 shadow-xs"
                : "text-[#8A9299] hover:text-[#F2F0E8] hover:bg-[#1C2024] border border-transparent"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Puzzle Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPuzzles.map((puzzle) => {
          const prog = progressMap[puzzle.id];
          const isSolved = prog?.solved;
          const isRevealed = prog?.solutionRevealed;
          const isWhiteToMove = puzzle.sideToMove === "w";

          return (
            <Card
              key={puzzle.id}
              variant="surface"
              className={`flex flex-col justify-between transition-all duration-150 hover:border-[#C7A66A]/50 ${
                isSolved ? "border-[#73B894]/40" : ""
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Badge variant="accent" size="sm">
                      {THEME_LABELS[puzzle.theme]}
                    </Badge>
                    <Badge variant="muted" size="sm">
                      {DIFFICULTY_LABELS[puzzle.difficulty]}
                    </Badge>
                  </div>

                  {isSolved ? (
                    <Badge variant="success" size="sm" className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Selesai
                    </Badge>
                  ) : isRevealed ? (
                    <Badge variant="warning" size="sm" className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      Dilihat
                    </Badge>
                  ) : (
                    <span className="text-[11px] text-[#8A9299]">
                      {isWhiteToMove ? "Putih melangkah" : "Hitam melangkah"}
                    </span>
                  )}
                </div>

                <div>
                  <h2 className="text-base font-semibold text-[#F2F0E8] leading-snug">
                    {puzzle.title}
                  </h2>
                  <p className="text-xs text-[#B0B5B9] mt-1.5 leading-relaxed line-clamp-2">
                    {puzzle.description}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-[#353B42] flex items-center justify-between">
                <span className="text-[11px] text-[#8A9299]">
                  3 Petunjuk Bertahap
                </span>
                <Link href={`/puzzles/${puzzle.id}`}>
                  <Button
                    variant={isSolved ? "secondary" : "primary"}
                    size="sm"
                    className="text-xs"
                  >
                    <span>{isSolved ? "Ulangi" : "Latihan"}</span>
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
