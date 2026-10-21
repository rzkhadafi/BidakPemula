# Data Model — Chess Archive

## 1. Prinsip

- Data awal disimpan lokal; tidak membutuhkan akun atau remote database.
- Akses penyimpanan melalui repository/adapters agar storage backend dapat diganti nanti.
- Validasi semua data yang dibaca dari storage karena versi lama bisa tidak lengkap atau rusak.
- Simpan versi schema untuk mempermudah migrasi lokal.

## 2. App settings

```ts
type AppSettings = {
  schemaVersion: number;
  boardOrientation: "white" | "black";
  animationEnabled: boolean;
  soundEnabled: boolean; // if sound is implemented
  defaultBotLevel: "beginner" | "casual" | "intermediate" | "advanced" | "strong";
  defaultTimeControlId: string | null;
  language: "id"; // Indonesian is the MVP default
};
```

Penyimpanan disarankan: localStorage untuk preferensi kecil.

## 3. Game record

```ts
type ArchivedGame = {
  schemaVersion: number;
  id: string;
  createdAt: string;        // ISO timestamp
  updatedAt: string;
  playerColor: "white" | "black";
  botLevel: string;
  timeControlId: string | null;
  result: "white_win" | "black_win" | "draw" | "aborted";
  termination: string;      // normalized enum/string, e.g. checkmate, stalemate, resign
  initialFen: string;
  finalFen: string;
  pgn: string;
  moves: ArchivedMove[];
  durationMs?: number;
  engineVersion?: string;
  notes?: string;
};

type ArchivedMove = {
  ply: number;
  san: string;
  uci: string;
  fenAfter: string;
  clockMsRemaining?: number;
};
```

Simpan FEN/PGN dari rules library. Jangan menghitung hasil akhir hanya dari string teks UI.

## 4. Academy content and progress

```ts
type Lesson = {
  id: string;
  order: number;
  title: string;
  summary: string;
  objectives: string[];
  sections: Array<{
    id: string;
    heading: string;
    body: string;           // curated Indonesian text
    fen?: string;
    interaction?: "demonstration" | "quiz";
  }>;
  quizIds?: string[];
  estimatedMinutes: number;
};

type LessonProgress = {
  schemaVersion: number;
  lessonId: string;
  status: "not_started" | "in_progress" | "completed";
  completedAt?: string;
  lastSectionId?: string;
  attempts: number;
};
```

Konten lesson disimpan sebagai data lokal versi kontrol kode. Progres disimpan lokal.

## 5. Puzzle data

```ts
type ChessPuzzle = {
  id: string;
  title: string;
  category: "basics" | "tactics" | "defense" | "checkmate" | "endgame";
  difficulty: "beginner" | "casual" | "intermediate" | "advanced";
  startingFen: string;
  sideToMove: "w" | "b";
  goal: string;
  solutionLinesUci: string[][];
  hints: string[];
  explanation: string;
  lessonIds?: string[];
};

type PuzzleProgress = {
  schemaVersion: number;
  puzzleId: string;
  attempts: number;
  solved: boolean;
  bestHintUsed?: number;
  solvedAt?: string;
};
```

Semua puzzle P0 perlu dikurasi dan solusi legalnya divalidasi saat test/build. Jangan meminta Gemini menciptakan puzzle runtime yang belum tervalidasi.

## 6. Tutor interaction — jika disimpan

```ts
type TutorHistoryItem = {
  id: string;
  createdAt: string;
  contextKind: "lesson" | "puzzle" | "gameReview";
  contextId?: string;
  question: string;
  answer: string;
};
```

MVP tidak wajib menyimpan percakapan. Jika diimplementasikan, simpan lokal dengan jumlah maksimum, sediakan penghapusan, dan jangan menyimpan API key atau raw provider data.

## 7. P1 analysis and variations

```ts
type GameAnalysis = {
  gameId: string;
  engineId: string;
  analyzedAt: string;
  positions: Array<{
    ply: number;
    fen: string;
    evaluationCp?: number;
    mateIn?: number | null;
    bestMoveUci?: string;
    pvUci?: string[];
    depth?: number;
  }>;
};

type VariationBranch = {
  id: string;
  gameId: string;
  anchorPly: number;
  parentBranchId?: string;
  movesUci: string[];
  label?: string;
  createdAt: string;
};
```

Simpan branch terpisah dari PGN utama. Eval disimpan dengan perspective/normalization yang jelas; jangan membandingkan nilai tanpa mengetahui perspektif warna.

## 8. Storage strategy

- localStorage: preferensi dan penanda versi ringan.
- IndexedDB atau repository terisolasi: game records, moves, analysis, puzzle progress jika mulai besar.
- Saat awal load, tangani data corrupt dengan recovery path; jangan crash seluruh app.
- Beri fitur export PGN sebelum pengguna menghapus riwayat jika export sudah diimplementasikan.
- Data lokal tidak berpindah antar browser/perangkat. Jelaskan hal ini dalam UI.

## 9. Schema migration

Sediakan `schemaVersion` untuk record persisten. Jika versi lama tidak bisa dimigrasi, jangan hapus diam-diam; jelaskan masalah dan minta pengguna memilih reset atau recovery bila memungkinkan.
