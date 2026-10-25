import { SkillDefinition, SkillId } from "./types";

export const SKILL_DEFINITIONS: Record<SkillId, SkillDefinition> = {
  // ==========================================
  // A. DASAR PERMAINAN (FUNDAMENTALS)
  // ==========================================
  "board-coordinates": {
    id: "board-coordinates",
    name: "Mengenal Papan & Koordinat",
    category: "fundamentals",
    categoryLabel: "Dasar Permainan",
    description: "Memahami 64 petak, membaca lajur a–h dan baris 1–8, serta orientasi papan yang benar.",
    prerequisiteIds: [],
    relatedLessonIds: ["mengenal-papan", "kenalan-pasukan"],
    relatedPuzzleIds: [],
  },
  "piece-rook": {
    id: "piece-rook",
    name: "Gerakan Benteng",
    category: "fundamentals",
    categoryLabel: "Dasar Permainan",
    description: "Menguasai garis lurus vertikal dan horizontal serta cara menangkap bidak lawan dengan benteng.",
    prerequisiteIds: ["board-coordinates"],
    relatedLessonIds: ["gerak-benteng"],
    relatedPuzzleIds: ["puz-mate-02"],
  },
  "piece-bishop": {
    id: "piece-bishop",
    name: "Gerakan Gajah",
    category: "fundamentals",
    categoryLabel: "Dasar Permainan",
    description: "Menguasai garis diagonal warna petak yang konsisten sepanjang permainan.",
    prerequisiteIds: ["board-coordinates"],
    relatedLessonIds: ["gerak-gajah"],
    relatedPuzzleIds: ["puz-pin-01", "puz-skew-01"],
  },
  "piece-queen": {
    id: "piece-queen",
    name: "Gerakan Menteri",
    category: "fundamentals",
    categoryLabel: "Dasar Permainan",
    description: "Memaksimalkan perwira paling berkuasa yang memadukan kekuatan benteng dan gajah.",
    prerequisiteIds: ["piece-rook", "piece-bishop"],
    relatedLessonIds: ["gerak-menteri"],
    relatedPuzzleIds: ["puz-mate-01", "puz-skew-02"],
  },
  "piece-knight": {
    id: "piece-knight",
    name: "Gerakan Kuda",
    category: "fundamentals",
    categoryLabel: "Dasar Permainan",
    description: "Menguasai pola huruf L dan keistimewaan kuda yang dapat melompati bidak lain.",
    prerequisiteIds: ["board-coordinates"],
    relatedLessonIds: ["gerak-kuda"],
    relatedPuzzleIds: ["puz-fork-01", "puz-fork-02", "puz-fork-03"],
  },
  "piece-pawn": {
    id: "piece-pawn",
    name: "Gerakan Pion",
    category: "fundamentals",
    categoryLabel: "Dasar Permainan",
    description: "Memahami langkah satu petak ke depan, dorongan awal dua petak, dan pemukulan diagonal.",
    prerequisiteIds: ["board-coordinates"],
    relatedLessonIds: ["gerak-pion"],
    relatedPuzzleIds: [],
  },
  "piece-king": {
    id: "piece-king",
    name: "Gerakan Raja & Skak",
    category: "fundamentals",
    categoryLabel: "Dasar Permainan",
    description: "Menjaga keselamatan raja, mengenali ancaman skak, serta cara meloloskan diri dari bahaya.",
    prerequisiteIds: ["board-coordinates"],
    relatedLessonIds: ["gerak-raja-dan-skak"],
    relatedPuzzleIds: ["puz-mate-01", "puz-mate-03"],
  },
  "special-moves": {
    id: "special-moves",
    name: "Gerakan Khusus (Rokade & Promosi)",
    category: "fundamentals",
    categoryLabel: "Dasar Permainan",
    description: "Mengamankan raja melalui rokade, promosi pion di petak ujung, dan aturan en passant.",
    prerequisiteIds: ["piece-king", "piece-rook", "piece-pawn"],
    relatedLessonIds: ["gerakan-khusus"],
    relatedPuzzleIds: [],
  },

  // ==========================================
  // B. TAKTIK DASAR (TACTICS)
  // ==========================================
  "tactic-fork": {
    id: "tactic-fork",
    name: "Garpu / Serangan Ganda (Fork)",
    category: "tactics",
    categoryLabel: "Taktik Dasar",
    description: "Menyerang dua atau lebih perwira lawan secara bersamaan dengan satu langkah bidak.",
    prerequisiteIds: ["piece-knight"],
    relatedLessonIds: [],
    relatedPuzzleIds: ["puz-fork-01", "puz-fork-02", "puz-fork-03"],
  },
  "tactic-pin": {
    id: "tactic-pin",
    name: "Ikatan / Paku Bidak (Pin)",
    category: "tactics",
    categoryLabel: "Taktik Dasar",
    description: "Mengunci perwira lawan agar tidak bisa melangkah karena ada target lebih bernilai di belakangnya.",
    prerequisiteIds: ["piece-bishop", "piece-rook"],
    relatedLessonIds: [],
    relatedPuzzleIds: ["puz-pin-01", "puz-pin-02", "puz-pin-03"],
  },
  "tactic-skewer": {
    id: "tactic-skewer",
    name: "Serangan Tusuk (Skewer)",
    category: "tactics",
    categoryLabel: "Taktik Dasar",
    description: "Menyerang bidak bernilai tinggi di depan sehingga ketika ia menghindar, bidak di belakangnya tertangkap.",
    prerequisiteIds: ["piece-bishop", "piece-rook"],
    relatedLessonIds: [],
    relatedPuzzleIds: ["puz-skew-01", "puz-skew-02", "puz-skew-03"],
  },
  "tactic-discovered-attack": {
    id: "tactic-discovered-attack",
    name: "Serangan Terbuka (Discovered Attack)",
    category: "tactics",
    categoryLabel: "Taktik Dasar",
    description: "Melangkahkan satu bidak untuk membuka jalur tembak tak terduga dari perwira di belakangnya.",
    prerequisiteIds: ["piece-bishop", "piece-rook"],
    relatedLessonIds: [],
    relatedPuzzleIds: ["puz-disc-01", "puz-disc-02", "puz-disc-03"],
  },
  "tactic-remove-defender": {
    id: "tactic-remove-defender",
    name: "Menyingkirkan Bidak Penjaga",
    category: "tactics",
    categoryLabel: "Taktik Dasar",
    description: "Memukul atau mengusir bidak yang sedang melindungi perwira lawan agar sasaran utama dapat ditangkap.",
    prerequisiteIds: ["tactic-fork", "tactic-pin"],
    relatedLessonIds: [],
    relatedPuzzleIds: ["puz-rem-01", "puz-rem-02", "puz-rem-03"],
  },
  "tactic-checkmate": {
    id: "tactic-checkmate",
    name: "Pola Skakmat Sederhana",
    category: "tactics",
    categoryLabel: "Taktik Dasar",
    description: "Mengenali pola jaring mat klasik seperti lorong baris belakang (back-rank) dan bantuan menteri.",
    prerequisiteIds: ["piece-king", "piece-queen", "piece-rook"],
    relatedLessonIds: ["gerak-raja-dan-skak"],
    relatedPuzzleIds: ["puz-mate-01", "puz-mate-02", "puz-mate-03"],
  },

  // ==========================================
  // C. STRATEGI PEMULA (STRATEGY)
  // ==========================================
  "strategy-center-control": {
    id: "strategy-center-control",
    name: "Penguasaan Pusat Papan",
    category: "strategy",
    categoryLabel: "Strategi Pemula",
    description: "Menempatkan pion dan perwira untuk mengontrol petak-petak jantung pertempuran (d4, e4, d5, e5).",
    prerequisiteIds: ["piece-pawn", "piece-knight", "piece-bishop"],
    relatedLessonIds: ["strategi-dasar"],
    relatedPuzzleIds: [],
  },
  "strategy-piece-development": {
    id: "strategy-piece-development",
    name: "Pengembangan Perwira",
    category: "strategy",
    categoryLabel: "Strategi Pemula",
    description: "Mengaktifkan kuda dan gajah ke petak ideal pada babak pembukaan sebelum melancarkan serangan.",
    prerequisiteIds: ["strategy-center-control"],
    relatedLessonIds: ["strategi-dasar"],
    relatedPuzzleIds: [],
  },
  "strategy-king-safety": {
    id: "strategy-king-safety",
    name: "Keamanan Raja & Kewaspadaan",
    category: "strategy",
    categoryLabel: "Strategi Pemula",
    description: "Melakukan rokade tepat waktu, mempertahankan benteng perlindungan, dan menghindari blunder.",
    prerequisiteIds: ["special-moves", "piece-king"],
    relatedLessonIds: ["gerakan-khusus", "strategi-dasar"],
    relatedPuzzleIds: ["puz-mate-03"],
  },
};

export const ALL_SKILL_IDS = Object.keys(SKILL_DEFINITIONS) as SkillId[];

export function getSkillDefinition(id: SkillId): SkillDefinition {
  return SKILL_DEFINITIONS[id];
}

export function getSkillsByCategory(category: SkillDefinition["category"]): SkillDefinition[] {
  return Object.values(SKILL_DEFINITIONS).filter((s) => s.category === category);
}

/**
 * Finds which skill is linked to a given Academy lesson ID.
 */
export function getSkillByLessonId(lessonId: string): SkillDefinition | undefined {
  return Object.values(SKILL_DEFINITIONS).find((s) => s.relatedLessonIds.includes(lessonId));
}

/**
 * Finds which skill is linked to a given Puzzle ID.
 */
export function getSkillByPuzzleId(puzzleId: string): SkillDefinition | undefined {
  return Object.values(SKILL_DEFINITIONS).find((s) => s.relatedPuzzleIds.includes(puzzleId));
}
