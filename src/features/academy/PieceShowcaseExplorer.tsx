"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import Link from "next/link";
import { Chess, Square } from "chess.js";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Volume2,
  VolumeX,
  CheckCircle2,
  ArrowRight,
  Shield,
  Crosshair,
  MapPin,
  Lightbulb,
} from "lucide-react";
import { InteractiveChessboard } from "@/components/chessboard/InteractiveChessboard";
import { AcademyLesson } from "./types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { chessAudio } from "@/lib/audio/chess-audio";
import { tutorSpeech } from "@/features/tutor/speech-controller";
import { getTutorPreferences } from "@/features/tutor/tutor-preferences";
import { unlockBadge } from "@/features/badges";
import { getSkillByLessonId, recordActivityEvidence } from "@/features/learning";

export interface PieceProfile {
  type: "p" | "n" | "b" | "r" | "q" | "k";
  name: string;
  intlName: string;
  symbol: string;
  points: number | string;
  pointsLabel: string;
  tag: string;
  tagColor: "accent" | "success" | "warning" | "default";
  subtitle: string;
  movementExplanation: string;
  captureExplanation: string;
  startingSquares: string;
  secretTip: string;
  spokenText: string;
  defaultSquare: string;
}

export const PIECE_PROFILES: Record<string, PieceProfile> = {
  p: {
    type: "p",
    name: "Pion",
    intlName: "Pawn",
    symbol: "♟",
    points: 1,
    pointsLabel: "1 Poin (Prajurit Infanteri)",
    tag: "Prajurit Tameng",
    tagColor: "default",
    subtitle: "Maju pantang mundur, jadi benteng pelindung garis depan!",
    movementExplanation:
      "Pion hanya bisa bergerak MAJU ke depan, pantang mundur. Dari posisi awal di baris ke-2, pion punya opsi spesial boleh langsung melesat 1 atau 2 petak. Setelah melangkah dari petak awal, majunya hanya 1 petak ke depan.",
    captureExplanation:
      "Ini yang unik dan sering bikin pemula kaget: pion jalannya lurus ke depan, tapi kalau mau memukul/memakan bidak musuh, arahnya harus MIRING (diagonal) satu petak ke depan!",
    startingSquares: "Berjejer rapi di baris ke-2 (petak a2 sampai h2), jumlahnya ada 8 biji.",
    secretTip:
      "Jangan sepelekan pion! Kalau pion kamu berhasil berjuang menembus sampai ke baris paling ujung lawan (baris ke-8), pion bisa berevolusi (promosi) berubah wujud jadi Menteri!",
    spokenText:
      "Pion bernilai 1 poin dan bertugas sebagai prajurit tameng garis depan. Majunya lurus ke depan, tapi makannya miring diagonal. Jika berhasil tembus ke ujung papan lawan, pion bisa promosi menjadi menteri!",
    defaultSquare: "e2",
  },
  n: {
    type: "n",
    name: "Kuda",
    intlName: "Knight",
    symbol: "♞",
    points: 3,
    pointsLabel: "3 Poin (Perwira Ringan)",
    tag: "Ksatria Pelompat",
    tagColor: "accent",
    subtitle: "Satu-satunya bidak sakti yang bisa melompati bidak siapa saja!",
    movementExplanation:
      "Langkah kuda sangat unik membentuk pola huruf 'L': dua petak lurus lalu belok satu petak ke samping. Kerennya lagi, kuda adalah satu-satunya bidak di atas papan catur yang bisa melompati bidak kawan maupun lawan tanpa terhalang!",
    captureExplanation:
      "Kuda memukul bidak musuh yang kebetulan sedang berada di petak pendaratan akhirnya (di ujung huruf L). Bidak-bidak yang dilewatinya saat melompat tidak akan terpengaruh.",
    startingSquares: "Duduk di sebelah menara benteng pada petak b1 dan g1 (Putih).",
    secretTip:
      "Kuda paling senang kalau dibawa ke petak tengah papan (pusat). Di tengah, jangkauan serangannya maksimal mengontrol hingga 8 petak sekaligus!",
    spokenText:
      "Kuda bernilai 3 poin. Langkahnya membentuk huruf L dan merupakan satu-satunya bidak yang bisa melompati bidak lain. Tempatkan kuda mendekati petak tengah agar jangkauannya maksimal!",
    defaultSquare: "b1",
  },
  b: {
    type: "b",
    name: "Gajah / Peluncur",
    intlName: "Bishop",
    symbol: "♝",
    points: 3,
    pointsLabel: "3 Poin (Perwira Ringan)",
    tag: "Sniper Diagonal",
    tagColor: "accent",
    subtitle: "Penembak jitu jarak jauh yang setia pada satu warna petak!",
    movementExplanation:
      "Gajah meluncur miring serong (diagonal) tanpa batas jarak, sejauh jalurnya tidak terhalang bidak lain. Kamu punya dua gajah: satu setia selamanya di petak terang, satu lagi setia selamanya di petak gelap!",
    captureExplanation:
      "Gajah menangkap bidak musuh yang berada di sepanjang garis lintasan diagonalnya.",
    startingSquares: "Berdiri di samping kuda pada petak c1 (petak gelap) dan f1 (petak terang).",
    secretTip:
      "Buka jalur pion di depan gajahmu sejak awal pembukaan agar gajah bisa langsung membidik perwira lawan dari kejauhan layaknya sniper!",
    spokenText:
      "Gajah bernilai 3 poin dan meluncur miring diagonal tanpa batas jarak. Gajah bertindak seperti sniper jarak jauh yang sangat kuat di posisi papan terbuka!",
    defaultSquare: "c1",
  },
  r: {
    type: "r",
    name: "Benteng",
    intlName: "Rook",
    symbol: "♜",
    points: 5,
    pointsLabel: "5 Poin (Perwira Berat)",
    tag: "Menara Penghancur",
    tagColor: "warning",
    subtitle: "Meluncur lurus tanpa ampun di seluruh baris dan lajur!",
    movementExplanation:
      "Benteng meluncur lurus lempeng ke depan, belakang, kiri, atau kanan tanpa batas jarak, mirip tank tempur. Tapi benteng tidak bisa melompat, jadi butuh jalur yang bersih tanpa hambatan.",
    captureExplanation:
      "Benteng meluncur lurus dan menabrak serta menduduki petak tempat bidak musuh berada.",
    startingSquares: "Nongkrong kokoh di sudut paling pojok papan catur (petak a1 dan h1).",
    secretTip:
      "Benteng paling dahsyat kalau ditempatkan di lajur terbuka (lajur yang sudah tidak ada pionnya) atau saling terhubung berdua di baris yang sama!",
    spokenText:
      "Benteng adalah perwira berat bernilai 5 poin dengan gerakan lurus horizontal dan vertikal. Tempatkan benteng di lajur terbuka untuk menguasai jalur utama pertempuran!",
    defaultSquare: "a1",
  },
  q: {
    type: "q",
    name: "Menteri / Ratu",
    intlName: "Queen",
    symbol: "♛",
    points: 9,
    pointsLabel: "9 Poin (Perwira Paling Sakti)",
    tag: "Senjata Pemungkas",
    tagColor: "warning",
    subtitle: "Gabungan kesaktian Benteng + Gajah sekaligus ke segala arah!",
    movementExplanation:
      "Ini dia bos tempur paling sakti di atas papan catur! Menteri bisa meluncur lurus (seperti benteng) DAN bisa meluncur miring (seperti gajah) ke segala penjuru arah tanpa batas jarak!",
    captureExplanation:
      "Bisa memukul ke segala arah lurus maupun diagonal di sepanjang jalur gerakannya.",
    startingSquares:
      "Rumus emas catur: Menteri selalu mencocokkan warna bajunya! Menteri Putih duduk di petak putih (d1), Menteri Hitam duduk di petak hitam (d8).",
    secretTip:
      "Karena nilainya sangat besar (9 poin), jangan buru-buru mengeluarkan menteri sendirian di awal permainan, nanti gampang diincar dan diusir oleh perwira musuh!",
    spokenText:
      "Menteri adalah perwira terkuat bernilai 9 poin yang memadukan gerakan benteng dan gajah sekaligus. Jaga menteri dengan baik dan jangan biarkan dia tertangkap tanpa pertukaran yang seimbang!",
    defaultSquare: "d1",
  },
  k: {
    type: "k",
    name: "Raja",
    intlName: "King",
    symbol: "♚",
    points: "Tak Ternilai",
    pointsLabel: "Nyawa Permainan (Tak Ternilai)",
    tag: "Pemimpin Tertinggi",
    tagColor: "success",
    subtitle: "Kalau dia kena skakmat, permainan langsung berakhir tamat!",
    movementExplanation:
      "Raja melangkah satu petak ke mana saja (lurus maupun miring diagonal). Walaupun langkahnya lambat, seluruh keselamatan kerajaan bertumpu padanya.",
    captureExplanation:
      "Bisa memukul bidak musuh di petak sekelilingnya, asalkan petak itu aman dan tidak dijaga oleh perwira musuh yang lain.",
    startingSquares:
      "Berdiri gagah di samping menterinya pada petak e1 bertanda mahkota dengan salib/plus di atasnya.",
    secretTip:
      "Raja tidak pernah boleh melangkah ke petak yang sedang diancam musuh. Di awal babak, amankan raja ke sudut benteng menggunakan langkah spesial bernama 'Rokade'!",
    spokenText:
      "Raja adalah pemimpin tertinggi dan nyawa permainanmu. Nilainya tak terhingga karena jika raja terkena skakmat permainan langsung berakhir. Lindungi rajamu di tempat yang aman!",
    defaultSquare: "e1",
  },
};

const STARTING_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export interface PieceShowcaseExplorerProps {
  lesson: AcademyLesson;
  prevLesson?: AcademyLesson | null;
  nextLesson?: AcademyLesson | null;
  onLessonComplete: () => void;
}

export const PieceShowcaseExplorer: React.FC<PieceShowcaseExplorerProps> = ({
  lesson,
  prevLesson,
  nextLesson,
  onLessonComplete,
}) => {
  const [selectedPieceType, setSelectedPieceType] = useState<"p" | "n" | "b" | "r" | "q" | "k">("p");
  const [selectedSquare, setSelectedSquare] = useState<string>("e2");
  const [exploredTypes, setExploredTypes] = useState<Set<string>>(() => new Set(["p"]));
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  // Dedicated stationary chess instance for showing piece movements and scopes
  const chess = useMemo(() => new Chess(STARTING_FEN), []);

  const activeProfile = PIECE_PROFILES[selectedPieceType] || PIECE_PROFILES.p;

  // Calculate legal destination indicators on the board when this piece is selected
  const legalDestinations = useMemo(() => {
    if (!selectedSquare) return [];
    try {
      const moves = chess.moves({ square: selectedSquare as Square, verbose: true });
      return moves.map((m) => m.to);
    } catch {
      return [];
    }
  }, [chess, selectedSquare]);

  // Handle square clicks on the board
  const handleSquareClick = useCallback(
    (square: string) => {
      const piece = chess.get(square as Square);
      if (piece) {
        const type = piece.type;
        setSelectedPieceType(type);
        setSelectedSquare(square);
        setExploredTypes((prev) => new Set([...prev, type]));
        chessAudio.playMove();

        // Stop any playing speech when switching pieces
        if (isPlayingAudio) {
          tutorSpeech.stop();
          setIsPlayingAudio(false);
        }
      } else {
        // If an empty square is clicked, keep current piece selected
        chessAudio.playMove();
      }
    },
    [chess, isPlayingAudio]
  );

  // Handle selecting via panel pills
  const handleSelectPieceType = useCallback(
    (type: "p" | "n" | "b" | "r" | "q" | "k") => {
      setSelectedPieceType(type);
      const profile = PIECE_PROFILES[type];
      if (profile) {
        setSelectedSquare(profile.defaultSquare);
      }
      setExploredTypes((prev) => new Set([...prev, type]));
      chessAudio.playMove();

      if (isPlayingAudio) {
        tutorSpeech.stop();
        setIsPlayingAudio(false);
      }
    },
    [isPlayingAudio]
  );

  // Toggle voice narration for active piece
  const handleToggleVoice = useCallback(() => {
    if (isPlayingAudio) {
      tutorSpeech.stop();
      setIsPlayingAudio(false);
      return;
    }

    const voice = getTutorPreferences().voice;
    setIsPlayingAudio(true);
    tutorSpeech
      .speak(activeProfile.spokenText, voice)
      .catch(() => {})
      .finally(() => {
        setIsPlayingAudio(false);
      });
  }, [activeProfile.spokenText, isPlayingAudio]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      tutorSpeech.stop();
    };
  }, []);

  const handleFinishExplorer = () => {
    tutorSpeech.stop();
    unlockBadge("curious_student");
    const skillDef = getSkillByLessonId(lesson.id);
    if (skillDef) {
      recordActivityEvidence({
        skillId: skillDef.id,
        sourceKind: "lesson_step",
        sourceId: `${lesson.id}-explorer-complete`,
        timestamp: new Date().toISOString(),
        outcome: "success",
        hintsUsed: 0,
        weight: 1.0,
      });
    }
    onLessonComplete();
  };

  const exploredCount = exploredTypes.size;
  const isAllExplored = exploredCount >= 6;

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col space-y-3 min-h-0">
      {/* Sleek Header Bar */}
      <div className="flex items-center justify-between gap-3 pb-1.5 border-b border-[#353B42] text-xs shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <Link
            href="/academy"
            className="inline-flex items-center gap-1 text-xs text-[#B0B5B9] hover:text-[#F2F0E8] transition-colors shrink-0"
            title="Kembali ke Kurikulum Belajar"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Kurikulum</span>
          </Link>
          <span className="text-[#353B42] select-none">|</span>
          <h1 className="font-semibold text-sm sm:text-base text-[#F2F0E8] truncate">
            {lesson.title}
          </h1>
          <span className="hidden md:inline text-xs text-[#C7A66A] font-medium truncate">
            • Mode Eksplorasi Pasukan
          </span>
        </div>

        <Badge variant="accent" size="sm" className="shrink-0 text-[11px]">
          Pelajaran {lesson.order} dari 10
        </Badge>
      </div>

      {/* Main Split-Screen Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 items-start flex-1 min-h-0">
        {/* Left Column: Interactive Exploration Chessboard */}
        <div className="lg:col-span-7 flex flex-col items-center w-full shrink-0">
          <div className="w-full max-w-[min(100%,480px)] lg:max-w-[min(510px,calc(100dvh-175px))] flex flex-col items-center">
            {/* Friendly guidance chip above board */}
            <div className="w-full mb-2 p-2 rounded-xl bg-[#1C2024] border border-[#353B42] flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-[#C7A66A] truncate">
                <Sparkles className="w-4 h-4 shrink-0" />
                <span className="font-medium text-[11px] sm:text-xs">
                  Sentuh bidak mana saja di papan untuk melihat profil dan cara jalannya!
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#24292E] text-[10px] text-[#B0B5B9] font-medium shrink-0">
                {exploredCount}/6 Dikenali
              </span>
            </div>

            {/* Chessboard (stationary standard starting setup) */}
            <InteractiveChessboard
              chess={chess}
              orientation="white"
              selectedSquare={selectedSquare}
              legalDestinations={legalDestinations}
              lastMove={null}
              isCheck={false}
              pendingPromotion={null}
              onSquareClick={handleSquareClick}
              onConfirmPromotion={() => {}}
              onCancelPromotion={() => {}}
              showVisionToggle={false}
              showRadarToggle={true}
              defaultRadarEnabled={true}
            />

            <p className="text-[11px] text-[#8A9299] text-center mt-2">
              Petak aktif: <span className="font-mono text-[#F2F0E8] font-bold">{selectedSquare.toUpperCase()}</span> ({activeProfile.name} {activeProfile.symbol}). Titik di papan menunjukkan petak yang bisa dilangkahi.
            </p>
          </div>
        </div>

        {/* Right Column: Piece Showcase Profile Card & Selector */}
        <div className="lg:col-span-5 w-full flex flex-col lg:max-h-[calc(100dvh-115px)] lg:sticky lg:top-1 space-y-3">
          {/* Piece Picker Tabs (6 Avatar Buttons) */}
          <div className="grid grid-cols-6 gap-1 p-1 rounded-xl bg-[#1C2024] border border-[#353B42] shrink-0">
            {(["p", "n", "b", "r", "q", "k"] as const).map((t) => {
              const prof = PIECE_PROFILES[t];
              const isSelected = selectedPieceType === t;
              const isExplored = exploredTypes.has(t);

              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleSelectPieceType(t)}
                  className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-lg transition-all text-center cursor-pointer relative ${
                    isSelected
                      ? "bg-[#C7A66A] text-[#141619] shadow-md font-semibold"
                      : "bg-[#24292E]/60 text-[#B0B5B9] hover:text-[#F2F0E8] hover:bg-[#24292E]"
                  }`}
                  title={`Kenalan dengan ${prof.name}`}
                >
                  <span className="text-lg leading-none select-none">{prof.symbol}</span>
                  <span className="text-[10px] mt-0.5 truncate w-full">{prof.name.split("/")[0].trim()}</span>
                  {isExplored && (
                    <span
                      className={`absolute top-0.5 right-0.5 w-2 h-2 rounded-full ${
                        isSelected ? "bg-[#141619]" : "bg-[#73B894]"
                      }`}
                      title="Sudah dikenali"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Detailed Piece Profile Card (Scrollable) */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 pb-2">
            <Card variant="raised" className="p-4 sm:p-5 border-[#C7A66A]/40 space-y-3.5">
              {/* Header Profile Title */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#353B42]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#C7A66A]/20 border border-[#C7A66A]/50 flex items-center justify-center text-3xl select-none shrink-0 shadow-inner">
                    {activeProfile.symbol}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base sm:text-lg font-bold text-[#F2F0E8]">
                        {activeProfile.name}
                      </h2>
                      <span className="text-xs text-[#8A9299] font-normal">
                        ({activeProfile.intlName})
                      </span>
                    </div>
                    <p className="text-xs text-[#C7A66A] font-medium mt-0.5">
                      {activeProfile.subtitle}
                    </p>
                  </div>
                </div>

                <Badge variant={activeProfile.tagColor} size="sm" className="shrink-0 text-[10px]">
                  {activeProfile.pointsLabel}
                </Badge>
              </div>

              {/* Audio Voice Narration Button */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#141619]/70 border border-[#353B42] text-xs">
                <div className="flex items-center gap-2 text-[#B0B5B9]">
                  <Sparkles className="w-3.5 h-3.5 text-[#C7A66A]" />
                  <span className="text-[11px]">Dengarkan penjelasan suara guru:</span>
                </div>
                <button
                  type="button"
                  onClick={handleToggleVoice}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                    isPlayingAudio
                      ? "bg-[#E17C78] text-white animate-pulse"
                      : "bg-[#C7A66A] text-[#141619] hover:bg-[#D8BB83]"
                  }`}
                  aria-label={isPlayingAudio ? "Hentikan suara" : "Putar suara"}
                >
                  {isPlayingAudio ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5" />
                      <span>Stop</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Dengar</span>
                    </>
                  )}
                </button>
              </div>

              {/* Info Blocks */}
              <div className="space-y-2.5 text-xs">
                {/* 1. Cara Bergerak */}
                <div className="p-2.5 rounded-lg bg-[#24292E]/60 border border-[#353B42] space-y-1">
                  <div className="flex items-center gap-1.5 text-[#C7A66A] font-semibold text-[11px]">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Cara Bergerak:</span>
                  </div>
                  <p className="text-[#F2F0E8] leading-relaxed text-[11px] sm:text-xs">
                    {activeProfile.movementExplanation}
                  </p>
                </div>

                {/* 2. Cara Menangkap / Memukul */}
                <div className="p-2.5 rounded-lg bg-[#24292E]/60 border border-[#353B42] space-y-1">
                  <div className="flex items-center gap-1.5 text-[#E17C78] font-semibold text-[11px]">
                    <Crosshair className="w-3.5 h-3.5" />
                    <span>Cara Memukul Lawan:</span>
                  </div>
                  <p className="text-[#F2F0E8] leading-relaxed text-[11px] sm:text-xs">
                    {activeProfile.captureExplanation}
                  </p>
                </div>

                {/* 3. Posisi Awal */}
                <div className="p-2.5 rounded-lg bg-[#24292E]/60 border border-[#353B42] space-y-1">
                  <div className="flex items-center gap-1.5 text-[#73B894] font-semibold text-[11px]">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Posisi Awal di Papan:</span>
                  </div>
                  <p className="text-[#B0B5B9] leading-relaxed text-[11px] sm:text-xs">
                    {activeProfile.startingSquares}
                  </p>
                </div>

                {/* 4. Tips Rahasia */}
                <div className="p-2.5 rounded-lg bg-[#C7A66A]/10 border border-[#C7A66A]/30 space-y-1">
                  <div className="flex items-center gap-1.5 text-[#C7A66A] font-semibold text-[11px]">
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>Tips Jitu Pemula:</span>
                  </div>
                  <p className="text-[#F2F0E8] leading-relaxed text-[11px] sm:text-xs">
                    {activeProfile.secretTip}
                  </p>
                </div>
              </div>
            </Card>

            {/* Completion Action Card */}
            <Card variant="surface" className="p-4 border-[#353B42] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#B0B5B9]">Status Kenalan Pasukan:</span>
                <span className="font-semibold text-[#73B894] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {exploredCount} dari 6 Bidak Sudah Dikenali
                </span>
              </div>

              <Button
                variant="primary"
                size="md"
                onClick={handleFinishExplorer}
                className="w-full justify-center text-xs sm:text-sm font-semibold py-2.5"
              >
                <span>Saya Sudah Paham Semua, Lanjut ke Gerakan Benteng</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Card>

            {/* Quick Navigation Footer */}
            <div className="flex items-center justify-between pt-1">
              {prevLesson ? (
                <Link href={`/academy/${prevLesson.id}`}>
                  <Button variant="secondary" size="sm" className="text-xs">
                    <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                    <span>Pelajaran {prevLesson.order}</span>
                  </Button>
                </Link>
              ) : (
                <div />
              )}

              {nextLesson && (
                <Link href={`/academy/${nextLesson.id}`}>
                  <Button variant="secondary" size="sm" className="text-xs">
                    <span>Pelajaran {nextLesson.order}</span>
                    <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
