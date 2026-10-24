"use client";

import React, { useSyncExternalStore, useState } from "react";
import { Lock, Sparkles, Trophy } from "lucide-react";
import { ALL_BADGES } from "../catalog";
import { BadgeCategory, BadgeDefinition, UnlockedBadge } from "../types";
import { getUnlockedBadges, subscribeUnlockedBadges } from "../badge-manager";
import { BadgeIcon } from "./BadgeIcon";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const EMPTY_BADGES: Partial<Record<BadgeDefinition["id"], UnlockedBadge>> = {};

export const BadgeCollectionGrid: React.FC = () => {
  const unlockedBadges = useSyncExternalStore(
    subscribeUnlockedBadges,
    getUnlockedBadges,
    () => EMPTY_BADGES
  );

  const [activeCategory, setActiveCategory] = useState<"all" | BadgeCategory>("all");

  const totalCount = ALL_BADGES.length;
  const unlockedCount = Object.keys(unlockedBadges).length;
  const progressPercent = Math.round((unlockedCount / totalCount) * 100);

  const filteredBadges = ALL_BADGES.filter((badge) => {
    if (activeCategory === "all") return true;
    return badge.category === activeCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header & Progress Bar */}
      <Card variant="surface" className="p-4 sm:p-5 border border-[#353B42] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#C7A66A]/15 border border-[#C7A66A]/40 flex items-center justify-center text-[#C7A66A]">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-[#F2F0E8] flex items-center gap-2">
                <span>Lencana Kehormatan Pemula</span>
                <Badge variant="accent">Apresiasi Bertahap</Badge>
              </h3>
              <p className="text-xs text-[#B0B5B9] mt-0.5">
                Raih apresiasi visual setiap kali kamu mempraktikkan fondasi catur baru.
              </p>
            </div>
          </div>

          <div className="text-right sm:text-right shrink-0">
            <span className="text-lg font-bold text-[#C7A66A]">
              {unlockedCount} / {totalCount}
            </span>
            <span className="text-xs text-[#8A9299] block">Lencana Diraih ({progressPercent}%)</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#141619] h-2.5 rounded-full overflow-hidden border border-[#353B42]/50">
          <div
            className="bg-gradient-to-r from-[#C7A66A] to-[#D8BB83] h-full transition-all duration-700 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {(
            [
              { id: "all", label: "Semua" },
              { id: "play", label: "Permainan" },
              { id: "tactics", label: "Taktik" },
              { id: "learning", label: "Belajar" },
              { id: "journey", label: "Perjalanan" },
            ] as const
          ).map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                activeCategory === cat.id
                  ? "bg-[#C7A66A] text-[#141619] font-semibold"
                  : "bg-[#24292E] text-[#B0B5B9] hover:text-[#F2F0E8] hover:bg-[#2C3238]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {filteredBadges.map((badge: BadgeDefinition) => {
          const unlocked = unlockedBadges[badge.id];
          const isUnlocked = Boolean(unlocked);

          return (
            <Card
              key={badge.id}
              variant="surface"
              className={`p-4 transition-all border ${
                isUnlocked
                  ? "border-[#C7A66A]/60 bg-[#1C2024] shadow-[0_4px_20px_rgba(199,166,106,0.08)]"
                  : "border-[#353B42]/60 bg-[#16181B] opacity-75"
              }`}
            >
              <div className="flex items-start gap-3.5">
                {/* Icon box */}
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                    isUnlocked
                      ? "bg-[#C7A66A]/20 border-[#C7A66A]/60 text-[#C7A66A] shadow-inner"
                      : "bg-[#24292E] border-[#353B42] text-[#8A9299]"
                  }`}
                >
                  {isUnlocked ? (
                    <BadgeIcon name={badge.iconName} className="w-6 h-6" />
                  ) : (
                    <Lock className="w-5 h-5 text-[#8A9299]" />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4
                      className={`text-sm font-bold truncate ${
                        isUnlocked ? "text-[#F2F0E8]" : "text-[#B0B5B9]"
                      }`}
                    >
                      {badge.title}
                    </h4>

                    {isUnlocked ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#73B894] bg-[#73B894]/15 px-2 py-0.5 rounded-full border border-[#73B894]/30 shrink-0">
                        <Sparkles className="w-3 h-3" />
                        Diraih
                      </span>
                    ) : (
                      <span className="text-[11px] text-[#8A9299] bg-[#24292E] px-2 py-0.5 rounded-full border border-[#353B42] shrink-0">
                        Terkunci
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[#B0B5B9] mt-1 line-clamp-2 leading-relaxed">
                    {badge.description}
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-[#353B42]/40 flex items-center justify-between text-[11px]">
                    <span className="text-[#8A9299] truncate">
                      Kriteria: {badge.criteria}
                    </span>

                    {isUnlocked && unlocked?.unlockedAt && (
                      <span className="text-[#C7A66A] shrink-0 font-mono text-[10px]">
                        {new Date(unlocked.unlockedAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
