"use client";

import React from "react";
import { RotateCcw, Sparkles, Compass, AlertTriangle, Eye } from "lucide-react";
import { TurningPoint } from "../types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface TurningPointCardProps {
  turningPoint: TurningPoint;
  onPlayFromHere: () => void;
  onInspectPly?: (plyIndex: number) => void;
  className?: string;
  isArchiveView?: boolean;
}

export const TurningPointCard: React.FC<TurningPointCardProps> = ({
  turningPoint,
  onPlayFromHere,
  onInspectPly,
  className = "",
  isArchiveView = false,
}) => {
  const isVictory = turningPoint.severity === "victory_turning_point";
  const isFatal = turningPoint.severity === "fatal" || turningPoint.severity === "blunder";

  return (
    <Card
      variant="surface"
      className={`space-y-3.5 border transition-all ${
        isVictory
          ? "border-[#73B894]/40 bg-[#73B894]/10"
          : isFatal
          ? "border-[#E3B66F]/50 bg-[#E3B66F]/10"
          : "border-[#353B42] bg-[#1C2024]"
      } ${className}`}
      role="region"
      aria-label="Kartu Titik Balik Pertandingan"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#353B42]/70">
        <div className="flex items-center gap-2">
          <div
            className={`w-6 h-6 rounded-md flex items-center justify-center ${
              isVictory
                ? "bg-[#73B894]/20 text-[#73B894]"
                : "bg-[#E3B66F]/20 text-[#E3B66F]"
            }`}
          >
            {isVictory ? (
              <Sparkles className="w-3.5 h-3.5" />
            ) : (
              <Compass className="w-3.5 h-3.5" />
            )}
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-[#F2F0E8] flex items-center gap-1.5">
              <span>{isVictory ? "Titik Balik Kemenangan" : "Titik Balik Kesalahan"}</span>
            </h3>
          </div>
        </div>

        <Badge
          variant={isVictory ? "success" : isFatal ? "warning" : "muted"}
          size="sm"
          className="text-[10px] font-mono"
        >
          Langkah ke-{turningPoint.moveNumber}
        </Badge>
      </div>

      {/* Narrative Headline & Body */}
      <div className="space-y-1.5 text-xs">
        <h4 className="font-medium text-[#F2F0E8] flex items-center gap-1.5">
          {isFatal && <AlertTriangle className="w-3.5 h-3.5 text-[#E3B66F] shrink-0" />}
          <span>{turningPoint.headline}</span>
        </h4>
        <p className="text-[#B0B5B9] leading-relaxed text-[11px] sm:text-xs">
          {turningPoint.description}
        </p>
      </div>

      {/* Suggested Alternative Badge */}
      {turningPoint.suggestedAlternativeSan && (
        <div className="p-2 rounded-lg bg-[#141619] border border-[#353B42] flex items-center justify-between text-xs text-[#B0B5B9]">
          <span className="text-[11px]">Saran Variasi Lebih Kokoh:</span>
          <span className="font-mono font-bold text-[#73B894] px-1.5 py-0.5 rounded bg-[#73B894]/15">
            {turningPoint.suggestedAlternativeSan}
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
        <Button
          variant="primary"
          size="sm"
          onClick={onPlayFromHere}
          className="flex-1 justify-center gap-1.5 text-xs font-semibold"
          title="Putar balik papan ke posisi 1 langkah sebelum blunder dan mainkan lagi"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Coba Lagi dari Titik Ini</span>
        </Button>

        {isArchiveView && onInspectPly && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onInspectPly(turningPoint.plyIndex)}
            className="justify-center gap-1 text-xs"
            title="Tinjau posisi ini pada papan replay arsip"
          >
            <Eye className="w-3.5 h-3.5 text-[#C7A66A]" />
            <span>Lihat Posisi</span>
          </Button>
        )}
      </div>
    </Card>
  );
};
