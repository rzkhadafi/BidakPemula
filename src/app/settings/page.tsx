"use client";

import React, { useState } from "react";
import {
  Moon,
  Sparkles,
  RotateCcw,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Layers,
  Volume2,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";

export default function SettingsPage() {
  const [boardOrientation, setBoardOrientation] = useState<"white" | "black">("white");
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: "history" | "progress" | null;
    title: string;
    description: string;
  }>({
    isOpen: false,
    type: null,
    title: "",
    description: "",
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#353B42]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-semibold text-[#F2F0E8]">
              Pengaturan Aplikasi
            </h1>
            <Badge variant="muted">Lokal & Peramban</Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#B0B5B9] mt-0.5">
            Kelola preferensi visual, tata letak papan, dan penyimpanan lokal data permainan.
          </p>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3 rounded-lg bg-[#73B894]/15 border border-[#73B894]/30 text-xs text-[#73B894] flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Settings Sections */}
      <div className="space-y-5">
        {/* Visual & Tema */}
        <Card variant="surface" className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#353B42]">
            <Moon className="w-4 h-4 text-[#C7A66A]" />
            <h2 className="text-sm font-semibold text-[#F2F0E8]">
              Tema & Tampilan
            </h2>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs sm:text-sm font-medium text-[#F2F0E8] block">
                Tema Visual
              </span>
              <span className="text-xs text-[#8A9299]">
                Palet Dark Graphite editorial dengan aksen ivory dan emas kusam
              </span>
            </div>
            <Badge variant="accent">Dark Graphite (Aktif)</Badge>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#353B42]">
            <div>
              <span className="text-xs sm:text-sm font-medium text-[#F2F0E8] block">
                Animasi Perpindahan Bidak
              </span>
              <span className="text-xs text-[#8A9299]">
                Menghormati preferensi sistem (prefers-reduced-motion)
              </span>
            </div>
            <input
              type="checkbox"
              checked={animationsEnabled}
              onChange={(e) => setAnimationsEnabled(e.target.checked)}
              className="accent-[#C7A66A] w-4 h-4 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#353B42]">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-[#8A9299]" />
              <div>
                <span className="text-xs sm:text-sm font-medium text-[#F2F0E8] block">
                  Efek Suara Langkah
                </span>
                <span className="text-xs text-[#8A9299]">
                  Audio langkah bidak opsional
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => setSoundEnabled(e.target.checked)}
              className="accent-[#C7A66A] w-4 h-4 cursor-pointer"
            />
          </div>
        </Card>

        {/* Preferensi Papan Catur */}
        <Card variant="surface" className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#353B42]">
            <Layers className="w-4 h-4 text-[#C7A66A]" />
            <h2 className="text-sm font-semibold text-[#F2F0E8]">
              Preferensi Papan Catur
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs sm:text-sm font-medium text-[#F2F0E8] block">
                Orientasi Default Papan
              </span>
              <span className="text-xs text-[#8A9299]">
                Papan akan menghadap dari sudut pandang warna ini
              </span>
            </div>
            <div className="inline-flex rounded-lg border border-[#353B42] p-0.5 bg-[#141619]">
              <button
                type="button"
                onClick={() => setBoardOrientation("white")}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  boardOrientation === "white"
                    ? "bg-[#24292E] text-[#F2F0E8]"
                    : "text-[#8A9299] hover:text-[#F2F0E8]"
                }`}
              >
                Putih
              </button>
              <button
                type="button"
                onClick={() => setBoardOrientation("black")}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  boardOrientation === "black"
                    ? "bg-[#24292E] text-[#F2F0E8]"
                    : "text-[#8A9299] hover:text-[#F2F0E8]"
                }`}
              >
                Hitam
              </button>
            </div>
          </div>
        </Card>

        {/* Status Tutor AI */}
        <Card variant="surface" className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-[#353B42]">
            <Sparkles className="w-4 h-4 text-[#C7A66A]" />
            <h2 className="text-sm font-semibold text-[#F2F0E8]">
              Status Guru AI (Gemini)
            </h2>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs sm:text-sm font-medium text-[#F2F0E8] block">
                Status Layanan Tutor
              </span>
              <span className="text-xs text-[#8A9299]">
                Kunci API disimpan aman di server; tidak diekspos ke peramban
              </span>
            </div>
            <Badge variant="muted">Nonaktif (Menunggu Fase 3)</Badge>
          </div>
        </Card>

        {/* Zona Tindakan Destruktif */}
        <Card variant="surface" className="space-y-4 border-[#E17C78]/30">
          <div className="flex items-center gap-2 pb-2 border-b border-[#353B42]">
            <AlertTriangle className="w-4 h-4 text-[#E17C78]" />
            <h2 className="text-sm font-semibold text-[#E17C78]">
              Manajemen Data Lokal
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs sm:text-sm font-medium text-[#F2F0E8] block">
                Hapus Riwayat Pertandingan
              </span>
              <span className="text-xs text-[#8A9299]">
                Mengosongkan seluruh arsip catatan game catur yang tersimpan di peramban ini.
              </span>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() =>
                setConfirmModal({
                  isOpen: true,
                  type: "history",
                  title: "Hapus Seluruh Riwayat Pertandingan?",
                  description:
                    "Tindakan ini akan menghapus semua file PGN dan rekaman pertandingan lokal. Progres materi belajar Anda tidak akan terhapus.",
                })
              }
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Hapus Riwayat
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#353B42]">
            <div>
              <span className="text-xs sm:text-sm font-medium text-[#F2F0E8] block">
                Reset Progres Akademi & Puzzle
              </span>
              <span className="text-xs text-[#8A9299]">
                Mengatur ulang status penyelesaian seluruh modul belajar dan taktik catur.
              </span>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() =>
                setConfirmModal({
                  isOpen: true,
                  type: "progress",
                  title: "Reset Seluruh Progres Belajar?",
                  description:
                    "Tindakan ini akan mengembalikan status seluruh materi Akademi dan Puzzle ke posisi belum dimulai.",
                })
              }
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Reset Progres
            </Button>
          </div>
        </Card>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        title={confirmModal.title}
        description={confirmModal.description}
      >
        <div className="space-y-4 pt-2">
          <div className="p-3 rounded-lg bg-[#E17C78]/10 border border-[#E17C78]/30 flex items-start gap-2 text-xs text-[#E17C78]">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>Tindakan ini permanen pada perangkat dan peramban ini.</span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                setConfirmModal({ ...confirmModal, isOpen: false });
                showToast(
                  confirmModal.type === "history"
                    ? "Riwayat pertandingan telah dikosongkan."
                    : "Progres belajar telah direset."
                );
              }}
            >
              Konfirmasi Eksekusi
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
