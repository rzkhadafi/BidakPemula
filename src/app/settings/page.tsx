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
  Navigation,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { clearArchivedGames } from "@/lib/storage/game-archive";
import { clearAcademyProgress } from "@/features/academy/academy-progress";
import { clearPuzzleProgress } from "@/features/puzzles/puzzle-progress";
import { clearAudioCache } from "@/features/tutor/audio-cache";
import { clearLearningProfile } from "@/features/learning";
import {
  getTutorPreferences,
  saveTutorPreferences,
} from "@/features/tutor/tutor-preferences";
import { tutorSpeech } from "@/features/tutor/speech-controller";
import { chessAudio } from "@/lib/audio/chess-audio";
import {
  getRadarArrowsSetting,
  setRadarArrowsSetting,
} from "@/features/chessboard/radar-arrows";

export default function SettingsPage() {
  const [boardOrientation, setBoardOrientation] = useState<"white" | "black">("white");
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(() => chessAudio.isEnabled());
  const [radarArrowsEnabled, setRadarArrowsEnabled] = useState(() => getRadarArrowsSetting());
  const [tutorAutoplay, setTutorAutoplay] = useState(() => getTutorPreferences().autoplay);
  const [tutorSpeed, setTutorSpeed] = useState(() => getTutorPreferences().speed);
  const [tutorVoice, setTutorVoice] = useState(() => getTutorPreferences().voice);

  const handleSoundToggle = (enabled: boolean) => {
    setSoundEnabled(enabled);
    chessAudio.setEnabled(enabled);
  };

  const handleRadarArrowsToggle = (enabled: boolean) => {
    setRadarArrowsEnabled(enabled);
    setRadarArrowsSetting(enabled);
  };

  const handleAutoplayToggle = (checked: boolean) => {
    if (checked) {
      tutorSpeech.unlockAudio();
    }
    setTutorAutoplay(checked);
    saveTutorPreferences({ autoplay: checked });
  };

  const handleSpeedChange = (speed: 0.85 | 1.0 | 1.25) => {
    setTutorSpeed(speed);
    saveTutorPreferences({ speed });
  };

  const handleVoiceChange = (voice: string) => {
    setTutorVoice(voice);
    saveTutorPreferences({ voice });
  };

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: "history" | "progress" | "audioCache" | null;
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
              onChange={(e) => handleSoundToggle(e.target.checked)}
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

          <div className="flex items-center justify-between pt-2 border-t border-[#353B42]">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-[#73B894]" />
              <div>
                <span className="text-xs sm:text-sm font-medium text-[#F2F0E8] block">
                  Mode Garis Radar Panah Bidak (Ghost Aim)
                </span>
                <span className="text-xs text-[#8A9299]">
                  Menampilkan garis panah visual lintasan aman dan sasaran tangkap saat mengeklik perwira
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={radarArrowsEnabled}
              onChange={(e) => handleRadarArrowsToggle(e.target.checked)}
              className="accent-[#73B894] w-4 h-4 cursor-pointer"
              aria-label="Toggle Mode Garis Radar Panah Bidak"
            />
          </div>
        </Card>

        {/* Status & Preferensi Guru AI */}
        <Card variant="surface" className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#353B42]">
            <Sparkles className="w-4 h-4 text-[#C7A66A]" />
            <h2 className="text-sm font-semibold text-[#F2F0E8]">
              Guru Catur AI & Penjelasan Suara
            </h2>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs sm:text-sm font-medium text-[#F2F0E8] block">
                Status Layanan Guru AI
              </span>
              <span className="text-xs text-[#8A9299]">
                Didukung model Gemini & sintesis suara bahasa Indonesia di sisi server
              </span>
            </div>
            <Badge variant="accent">Aktif (Server-Side)</Badge>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#353B42]">
            <div>
              <span className="text-xs sm:text-sm font-medium text-[#F2F0E8] block">
                Putar Suara Otomatis
              </span>
              <span className="text-xs text-[#8A9299]">
                Membacakan narasi secara otomatis saat materi atau penjelasan dibuka
              </span>
            </div>
            <input
              type="checkbox"
              checked={tutorAutoplay}
              onChange={(e) => handleAutoplayToggle(e.target.checked)}
              className="accent-[#C7A66A] w-4 h-4 cursor-pointer"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-[#353B42]">
            <div>
              <span className="text-xs sm:text-sm font-medium text-[#F2F0E8] block">
                Karakter Suara Guru AI (Gemini TTS)
              </span>
              <span className="text-xs text-[#8A9299]">
                Pilihan intonasi dan warna suara manusiawi dari model Gemini
              </span>
            </div>
            <select
              value={tutorVoice}
              onChange={(e) => handleVoiceChange(e.target.value)}
              className="bg-[#141619] text-[#F2F0E8] border border-[#353B42] rounded-lg px-3 py-1.5 text-xs font-medium focus:outline-none focus:border-[#C7A66A] cursor-pointer"
            >
              <option value="Aoede">Aoede — Hangat & Artikulatif (Rekomendasi)</option>
              <option value="Puck">Puck — Kasual & Ceria</option>
              <option value="Charon">Charon — Tenang & Berwibawa</option>
              <option value="Fenrir">Fenrir — Energik & Tegas</option>
              <option value="Kore">Kore — Lembut & Santai</option>
            </select>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#353B42]">
            <div>
              <span className="text-xs sm:text-sm font-medium text-[#F2F0E8] block">
                Kecepatan Narasi Suara
              </span>
              <span className="text-xs text-[#8A9299]">
                Kecepatan pemutaran audio penjelasan
              </span>
            </div>
            <div className="inline-flex rounded-lg border border-[#353B42] p-0.5 bg-[#141619]">
              {([0.85, 1.0, 1.25] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleSpeedChange(s)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    tutorSpeed === s
                      ? "bg-[#C7A66A] text-[#141619] font-semibold"
                      : "text-[#8A9299] hover:text-[#F2F0E8]"
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
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

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#353B42]">
            <div>
              <span className="text-xs sm:text-sm font-medium text-[#F2F0E8] block">
                Kosongkan Cache Audio Suara
              </span>
              <span className="text-xs text-[#8A9299]">
                Menghapus berkas suara yang tersimpan di IndexedDB peramban lokal.
              </span>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                setConfirmModal({
                  isOpen: true,
                  type: "audioCache",
                  title: "Kosongkan Cache Audio Guru Catur?",
                  description:
                    "Berkas audio yang tersimpan di memori peramban akan dihapus. Suara baru akan diunduh kembali saat Anda mendengarkan materi.",
                })
              }
            >
              <Trash2 className="w-3.5 h-3.5 mr-1 text-[#C7A66A]" />
              Kosongkan Cache
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
                if (confirmModal.type === "history") {
                  clearArchivedGames();
                  showToast("Riwayat pertandingan telah dikosongkan.");
                } else if (confirmModal.type === "audioCache") {
                  clearAudioCache().then(() => {
                    showToast("Cache audio Guru Catur berhasil dikosongkan.");
                  });
                } else {
                  clearAcademyProgress();
                  clearPuzzleProgress();
                  clearLearningProfile();
                  showToast("Progres belajar dan profil perkembangan telah direset.");
                }
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
