"use client";

import React from "react";
import { AlertTriangle, RotateCcw, ArrowRight } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { BlunderReport } from "../types";

interface BlunderInterceptModalProps {
  report: BlunderReport | null;
  isOpen: boolean;
  onReconsider: () => void;
  onProceedAnyway: () => void;
}

export const BlunderInterceptModal: React.FC<BlunderInterceptModalProps> = ({
  report,
  isOpen,
  onReconsider,
  onProceedAnyway,
}) => {
  if (!report) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onReconsider}
      title="Bantalan Blunder (AI Co-Pilot)"
      description="Pendamping AI mendeteksi potensi bahaya fatal pada langkah yang baru saja Anda coba."
    >
      <div className="space-y-4 pt-1">
        {/* Warning Banner */}
        <div
          className={`p-3.5 rounded-xl border flex items-start gap-3 ${
            report.severity === "fatal"
              ? "bg-[#E17C78]/15 border-[#E17C78]/60 text-[#E17C78]"
              : "bg-[#E3B66F]/15 border-[#E3B66F]/60 text-[#E3B66F]"
          }`}
        >
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 animate-pulse" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider">
              {report.severity === "fatal" ? "Bahaya Fatal (Skakmat Terancam)" : "Peringatan Bidak Gantung"}
            </h4>
            <p className="text-xs text-[#F2F0E8] leading-relaxed">
              {report.reason}
            </p>
          </div>
        </div>

        <p className="text-xs text-[#B0B5B9] leading-relaxed">
          Dalam catur, melatih ketelitian sebelum melepas bidak adalah kunci berkembang. Anda dapat menarik langkah ini untuk mencari alternatif yang lebih aman, atau tetap melanjutkannya jika ini bagian dari taktik Anda.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
          <Button
            variant="primary"
            size="sm"
            onClick={onReconsider}
            className="w-full sm:flex-1 justify-center"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Pikirkan Lagi (Tarik Langkah)
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={onProceedAnyway}
            className="w-full sm:w-auto justify-center text-[#8A9299] hover:text-[#F2F0E8]"
          >
            Tetap Jalankan
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </div>
      </div>
    </Modal>
  );
};
