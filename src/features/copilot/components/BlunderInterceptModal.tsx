"use client";

import React from "react";
import { AlertTriangle, RotateCcw, ArrowRight, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { BlunderReport } from "../types";

interface BlunderInterceptModalProps {
  report: BlunderReport | null;
  isOpen: boolean;
  onReconsider: () => void;
  onProceedAnyway: () => void;
  className?: string;
}

/**
 * Panel Peringatan Bantalan Blunder (Non-Modal / Docked Side Panel)
 * Menggantikan modal pop-up agar pemain dapat langsung melihat petak dan bidak yang terancam
 * pada papan catur tanpa terhalang lapisan gelap modal.
 */
export const BlunderInterceptModal: React.FC<BlunderInterceptModalProps> = ({
  report,
  isOpen,
  onReconsider,
  onProceedAnyway,
  className = "",
}) => {
  if (!isOpen || !report) return null;

  return (
    <Card
      variant="surface"
      className={`p-4 space-y-3.5 border-2 ${
        report.severity === "fatal"
          ? "border-[#E17C78] bg-gradient-to-b from-[#241719] to-[#1C2024]"
          : "border-[#E3B66F] bg-gradient-to-b from-[#242017] to-[#1C2024]"
      } shadow-xl rounded-2xl animate-in fade-in ${className}`}
      role="alert"
      aria-live="assertive"
    >
      {/* Header Panel */}
      <div className="flex items-start justify-between pb-2 border-b border-[#353B42]">
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
              report.severity === "fatal"
                ? "bg-[#E17C78]/20 border border-[#E17C78]/60 text-[#E17C78]"
                : "bg-[#E3B66F]/20 border border-[#E3B66F]/60 text-[#E3B66F]"
            }`}
          >
            <AlertTriangle className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#F2F0E8] uppercase tracking-wider">
              {report.severity === "fatal"
                ? "Bahaya Fatal (Skakmat Terancam)"
                : "Peringatan Bantalan Blunder"}
            </h3>
            <span
              className={`text-[10px] font-medium ${
                report.severity === "fatal" ? "text-[#E17C78]" : "text-[#E3B66F]"
              }`}
            >
              AI Co-Pilot Mendeteksi Bahaya Serius
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onReconsider}
          aria-label="Tarik Langkah"
          className="text-[#8A9299] hover:text-[#F2F0E8] hover:bg-[#24292E] p-1.5 rounded-lg transition-colors cursor-pointer"
          title="Tarik langkah dan coba cari alternatif lain"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Warning Box */}
      <div
        className={`p-3 rounded-xl border space-y-1.5 ${
          report.severity === "fatal"
            ? "bg-[#E17C78]/10 border-[#E17C78]/40 text-[#F2F0E8]"
            : "bg-[#E3B66F]/10 border-[#E3B66F]/40 text-[#F2F0E8]"
        }`}
      >
        <p className="text-xs leading-relaxed font-medium">
          {report.reason}
        </p>
        <p className="text-[11px] text-[#B0B5B9] leading-relaxed">
          Amati papan catur di sebelah kiri. Petak bahaya telah disorot. Anda dapat menarik langkah ini untuk mencari opsi yang lebih aman.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
        <Button
          variant="primary"
          size="sm"
          onClick={onReconsider}
          className="w-full sm:flex-1 justify-center bg-[#C7A66A] text-[#141619] font-bold text-xs shadow-md"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
          Pikirkan Lagi (Tarik Langkah)
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={onProceedAnyway}
          className="w-full sm:w-auto justify-center text-xs text-[#8A9299] hover:text-[#F2F0E8]"
        >
          Tetap Jalankan
          <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </Button>
      </div>
    </Card>
  );
};
