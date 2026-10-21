# Implementation Log — Chess Archive

File ini dikelola oleh Antigravity selama pengembangan. Semua catatan hasil tes dan verifikasi berasal dari perintah yang benar-benar dijalankan.

## Baseline

- Tanggal: 2026-10-21
- Status: Proyek baru (greenfield); dokumentasi produk dan arsitektur telah disiapkan.
- Current phase: Fase 0 — Foundation & Visual Shell.
- Decisions: Bahasa Indonesia sebagai bahasa utama antarmuka; tema dark graphite + ivory + aksen emas kusam (2D minimal); local-first MVP; pemisahan modul rules (`chess.js`), engine bot (Stockfish worker), persistensi lokal, dan AI tutor (Gemini server-only).

---

## Catatan Per Sesi

### 2026-10-21 — Fase 0: Foundation & Visual Shell

- **Tujuan:** 
  Membangun fondasi Next.js (App Router) + TypeScript strict, Tailwind CSS v4 dengan token tema arsip strategi catur, layout global responsif, komponen antarmuka primitif, serta shell visual untuk seluruh 6 rute P0 menggunakan data contoh berlabel jelas. Menyiapkan konfigurasi linting, typechecking, unit test runner, dan memverifikasi production build.

- **Perubahan utama:**
  1. Inisialisasi scaffolding Next.js 16.4.2, React 19.3.0, TypeScript 5.x, dan Tailwind CSS v4.
  2. Pemasangan dependensi pendukung: `lucide-react` (ikonografi), `@types/node@^24`, `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@vitejs/plugin-react`, dan `jsdom`.
  3. Konfigurasi skrip proyek di `package.json`: `dev`, `build`, `start`, `lint`, `typecheck`, `test`, `test:watch`.
  4. Implementasi CSS design tokens di `src/app/globals.css`:
     - Latar aplikasi: `--color-bg: #141619`
     - Permukaan: `--color-surface: #1C2024`, `--color-surface-raised: #24292E`, `--color-surface-muted: #2C3238`
     - Garis batas: `--color-border: #353B42`
     - Teks: `--color-text: #F2F0E8` (ivory), `--color-text-muted: #B0B5B9`, `--color-text-subtle: #8A9299`
     - Aksen: `--color-accent: #C7A66A` (emas kusam), hover: `#D8BB83`
     - Status: `--color-success: #73B894`, `--color-warning: #E3B66F`, `--color-danger: #E17C78`
     - Papan catur: `--board-light: #E8E3D8`, `--board-dark: #68716F`
     - Dukungan media query `@media (prefers-reduced-motion: reduce)`.
  5. Pembuatan komponen UI primitives:
     - `Button`: varian primary (ivory), secondary (raised border), ghost, destructive, accent; mendukung status loading dan disabled yang aksesibel.
     - `Badge`: varian status default, accent, success, warning, danger, muted.
     - `Card`: wadah surface dan raised dengan border 1px terstandarisasi.
     - `Modal`: dialog aksesibel dengan role `dialog`, backdrop dismiss, penanganan tombol Escape, dan focus isolation.
     - `ChessboardPlaceholder`: visual papan catur 2D 8x8 rasio 1:1 dengan koordinat lajur (a-h) dan baris (1-8), representasi bidak awal, dan label status prototype Fase 0.
  6. Pembuatan komponen tata letak:
     - `Navbar`: navigasi desktop & mobile dengan indikator rute aktif, akses ke Pengaturan, serta tombol hamburger mobile.
     - `Footer`: footer editorial minimalis dengan penegasan privasi lokal tanpa pelacak.
     - `RootLayout`: pembungkus shell global dengan font Geist Sans/Mono, `lang="id"`, dan pembatas `overflow-x-hidden`.
  7. Pembuatan 6 Rute Shell Visual P0:
     - `/` (Beranda): sapaan editorial, tombol utama "Mulai Permainan", akses cepat belajar/puzzle, kartu kurikulum, dan empty state arsip.
     - `/play` (Main Catur): arena papan catur 2D 1:1, status bot (avatar & level) dan pemain, jam catur dummy 05:00, daftar langkah SAN dummy, tombol aksi berlabel disabled eksplisit, serta modal konfigurasi permainan.
     - `/academy` & `/academy/[lessonId]` (Akademi Catur): kurikulum 8 modul kurasi lokal berbahasa Indonesia, indikator progres, halaman materi dengan diagram peragaan, serta status AI tutor nonaktif.
     - `/puzzles` (Puzzle): filter kategori taktik, papan catur taktis, petunjuk bertahap (hints), dan tombol kontrol latihan.
     - `/archive` & `/archive/[gameId]` (Arsip Saya): daftar riwayat permainan lokal dengan metadata, modal konfirmasi pengosongan data, serta layar tinjauan tayang ulang (replay navigation controls).
     - `/settings` (Pengaturan): konfigurasi tema Dark Graphite, animasi bidak, audio langkah, orientasi default papan, status tutor server-only, serta aksi konfirmasi destruktif pembersihan data lokal.

- **File penting:**
  - `package.json`, `tsconfig.json`, `vitest.config.mts`, `.gitignore`
  - `src/app/globals.css`, `src/app/layout.tsx`
  - `src/components/ui/Button.tsx`, `Badge.tsx`, `Card.tsx`, `Modal.tsx`
  - `src/components/chessboard/ChessboardPlaceholder.tsx`
  - `src/components/layout/Navbar.tsx`, `Footer.tsx`
  - `src/app/page.tsx`, `src/app/play/page.tsx`, `src/app/academy/page.tsx`, `src/app/academy/[lessonId]/page.tsx`, `src/app/puzzles/page.tsx`, `src/app/archive/page.tsx`, `src/app/archive/[gameId]/page.tsx`, `src/app/settings/page.tsx`
  - `tests/setup.ts`, `tests/unit/components.test.tsx`, `tests/unit/smoke.test.tsx`, `tests/unit/responsive-and-accessibility.test.tsx`

- **Tests/commands yang dijalankan:**
  - `npm run lint` -> **PASS** (0 errors, 0 warnings pada seluruh file TypeScript/React).
  - `npm run typecheck` -> **PASS** (`tsc --noEmit` selesai tanpa kesalahan tipe data).
  - `npm run test` -> **PASS** (3 test suite, 21 unit & component tests lulus 100%).
  - `npm run build` -> **PASS** (Kompilasi Next.js Turbopack sukses, seluruh 21 rute statis & partial prerendering berhasil dibuat).
  - Verifikasi HTTP Server (port 3001 via node runner):
    - `GET /` -> Status 200 OK (37.1 KB)
    - `GET /play` -> Status 200 OK (40.0 KB)
    - `GET /academy` -> Status 200 OK (60.8 KB)
    - `GET /academy/mengenal-papan` -> Status 200 OK (65.1 KB)
    - `GET /puzzles` -> Status 200 OK (37.8 KB)
    - `GET /archive` -> Status 200 OK (24.1 KB)
    - `GET /archive/game-demo-01` -> Status 200 OK (67.8 KB)
    - `GET /settings` -> Status 200 OK (26.1 KB)

- **Visual review:**
  - **Desktop (1024px – 1440px):** Tata letak grid dua kolom pada `/play`, `/academy/[lessonId]`, `/puzzles`, dan `/archive/[gameId]` menjaga papan catur tetap menjadi fokus sentral dengan ukuran seimbang (maksimal 560px), tidak tertekan oleh panel kontrol atau ulasan langkah.
  - **Mobile (360px & 390px):** Tidak ada *horizontal overflow* pada seluruh rute utama (dibentengi dengan `overflow-x-hidden` dan wadah `max-w-7xl` dengan padding responsif 16px). Papan catur mempertahankan rasio 1:1 penuh selebar kontainer. Navigasi desktop otomatis berpindah ke tombol menu hamburger dan drawer mobile vertikal.
  - **Aksesibilitas & Kontras:** Rasio kontras teks `#F2F0E8` terhadap latar `#141619` mencapai > 12:1 (jauh melampaui standar WCAG AA 4.5:1). Indikator fokus keyboard (`focus-visible:outline-[#C7A66A]`) terlihat jelas pada seluruh tombol interaktif dan link.

- **Known issues / risks:**
  - Logika catur legal, integrasi `chess.js`, dan Stockfish Web Worker belum dihubungkan pada fase ini (sesuai spesifikasi Fase 0; tombol kontrol catur berlabel disabled eksplisit untuk mencegah *fake interactions*).
  - Fitur AI Tutor pada layar pelajaran ditandai nonaktif secara visual sampai Fase 3 dikerjakan.

- **Keputusan baru dan alasannya:**
  - Menambahkan fungsi `generateStaticParams()` pada rute dinamis `/academy/[lessonId]` dan `/archive/[gameId]` serta pembungkus `<Suspense>` pada `Navbar` di `layout.tsx` untuk memastikan Next.js 16 Partial Prerendering (PPR) dapat mengompilasi halaman secara statis tanpa hambatan akses hook `usePathname()` atau `params`.

- **Gate:** **PASS** (Seluruh kriteria penerimaan Fase 0 terpenuhi).

- **Langkah berikutnya:** Fase 1 (Playable Chess: integrasi aturan catur `chess.js`, Web Worker Stockfish, interaksi click/tap dan drag-and-drop, validasi promosi/skakmat/remis, jam catur, dan penyimpanan hasil lokal).

---

### 2026-10-21 — Fase 1: Playable Chess Core & Local Persistence

- **Tujuan:** 
  Mengubah halaman `/play` dari visual placeholder menjadi permainan catur lokal yang sepenuhnya dapat dimainkan melawan bot engine Stockfish melalui Web Worker. Mengintegrasikan pustaka `chess.js` untuk validasi seluruh aturan legal catur (termasuk promosi pion interaktif, en passant, rokade, skak, skakmat, stalemate, remis), sistem jam catur nyata, undo mode latihan, persistensi lokal SSR-safe untuk riwayat permainan di `localStorage`, serta menghubungkan halaman `/archive` dan `/archive/[gameId]` dengan data pertandingan nyata dan kontrol tayang ulang (replay) langkah-per-langkah.

- **Perubahan utama:**
  1. **Pemasangan Dependensi & Aset Mesin Catur:**
     - Memasang `chess.js` (v1.4.0) untuk validasi langkah legal dan manipulasi FEN/PGN.
     - Memasang `stockfish` (v19.0.1) dan menempatkan distribusi WebAssembly single-thread di `public/engine/stockfish.js` dan `public/engine/stockfish.wasm` sehingga engine dapat berjalan offline tanpa CORS/CDN external dependency.
     - Menyimpan berkas lisensi resmi `public/engine/LICENSE-STOCKFISH.txt` (GNU GPL v3) sesuai ketentuan lisensi Stockfish.
     - Memperbarui `eslint.config.mjs` untuk mengabaikan berkas third-party minified `public/engine/stockfish.js`.
  2. **Model Data & Persistensi Lokal (`src/types/chess.ts` & `src/lib/storage/game-archive.ts`):**
     - Mendefinisikan tipe TypeScript ketat: `GameStatus`, `GameResult`, `PieceSymbol`, `Color`, `TimeControl`, `BotDifficulty`, `MoveRecord`, `ArchivedGame` (skema versi 1), dan `GameTerminationReason`.
     - Mengimplementasikan modul penyimpanan SSR-safe dengan pola `useSyncExternalStore` (`subscribeToArchivedGames`, `getArchivedGames`, `getArchivedGamesServerSnapshot`) yang mencegah hydration mismatch pada Next.js App Router.
     - Mendukung ketahanan terhadap data korup, penolakan rekaman duplikat, dan penghapusan arsip dengan konfirmasi.
  3. **Pengontrol Kesulitan Bot & Web Worker Engine:**
     - `src/features/engine/difficulty.ts`: 5 tingkat kesulitan (Pemula ~600 Elo hingga Sangat Kuat ~2000 Elo). Menggunakan `applyControlledDifficultyMove` untuk menyimulasikan ketidakakuratan taktis pada level pemula tanpa pernah menghasilkan langkah ilegal.
     - `src/features/engine/stockfish-adapter.ts`: Abstraksi Web Worker UCI yang mengelola siklus hidup engine (`uci`, `isready`, `position fen`, `go movetime`), pembatalan pencarian (`stop`), pelacakan generation token pencarian untuk mengabaikan evaluasi basi jika pemain berpindah/reset, serta `MockChessEngine` untuk pengujian otomatis.
  4. **State Machine & Game Hook (`src/features/game/use-chess-game.ts`):**
     - Hook mandiri yang mengelola seluruh siklus pertandingan: giliran, penghitungan jam catur mundur, pemilihan bidak dan petak tujuan legal, pelaksanaan langkah, penanganan respons bot asinkron, modal pemilihan promosi pion (Queen, Rook, Bishop, Knight), deteksi status skak/skakmat/remis/waktu habis, undo 2 ply pada mode latihan, dan auto-save ke arsip saat pertandingan selesai.
  5. **Papan Interaktif (`src/components/chessboard/InteractiveChessboard.tsx`):**
     - Papan catur 2D 8x8 rasio 1:1 dengan interaksi klik/tap dan drag-and-drop.
     - Indikator visual terstandarisasi: petak terpilih (`--board-selected`), langkah terakhir (`--board-last-move`), titik tujuan legal dan lingkaran tangkapan bidak, serta highlight bahaya pada raja yang sedang diserang skak (`#E17C78`).
     - Dialog modal promosi pion terpadu yang memungkinkan pemain memilih bidak promosi secara eksplisit.
  6. **Arena Bermain Terhubung (`src/app/play/page.tsx`):**
     - Menggantikan placeholder Fase 0 dengan permainan catur aktif melawan bot.
     - Jam catur real-time dengan pilihan kontrol waktu (3m, 5m, 10m, 15m), indikator giliran aktif, avatar dan level bot, tabel riwayat langkah SAN dengan scroll otomatis, banner hasil akhir pertandingan (menang, kalah, remis), tombol Menyerah (Resign), Urungkan (Undo), dan modal Mulai Ulang (New Game).
  7. **Arsip & Replay Terhubung (`src/app/archive/page.tsx` & `src/app/archive/[gameId]/page.tsx`):**
     - Menghubungkan `/archive` langsung ke `localStorage` melalui `useSyncExternalStore`. Menampilkan kartu ringkasan pertandingan nyata (hasil, alasan akhir, waktu, jumlah langkah, level bot) dan empty state informatif jika belum ada data.
     - Menghubungkan `/archive/[gameId]` ke rekaman pertandingan aktual dengan viewer tayang ulang interaktif: tombol navigasi awal (`|<<`), mundur (`<`), maju (`>`), akhir (`>>`), navigasi keyboard (`ArrowLeft`, `ArrowRight`, `Home`, `End`), lompatan langkah langsung dengan klik pada tabel notasi, dan tombol Salin PGN.
  8. **Rangkaian Pengujian Komprehensif:**
     - `tests/unit/chess-rules.test.ts` (9 pengujian aturan catur `chess.js`, promosi, skakmat, remis).
     - `tests/unit/difficulty.test.ts` (4 pengujian konfigurasi bot dan seleksi langkah terkontrol).
     - `tests/unit/storage.test.ts` (7 pengujian persistensi arsip, validasi skema, dan pencegahan duplikasi).
     - `tests/unit/interactive-game.test.tsx` (7 pengujian state machine game hook dan interaksi papan).
     - `tests/integration/play-and-archive.test.tsx` (1 pengujian alur lengkap: bermain -> menyerah -> simpan ke arsip -> muat ulang dan tayangkan di arsip).

- **File penting yang dibuat/dimodifikasi:**
  - `package.json`, `package-lock.json`, `eslint.config.mjs`
  - `public/engine/stockfish.js`, `public/engine/stockfish.wasm`, `public/engine/LICENSE-STOCKFISH.txt`
  - `src/types/chess.ts`
  - `src/lib/storage/game-archive.ts`
  - `src/features/engine/difficulty.ts`, `src/features/engine/stockfish-adapter.ts`
  - `src/features/game/use-chess-game.ts`
  - `src/components/chessboard/InteractiveChessboard.tsx`
  - `src/app/play/page.tsx`, `src/app/archive/page.tsx`, `src/app/archive/[gameId]/page.tsx`
  - `tests/unit/chess-rules.test.ts`, `tests/unit/difficulty.test.ts`, `tests/unit/storage.test.ts`, `tests/unit/interactive-game.test.tsx`, `tests/integration/play-and-archive.test.tsx`, `tests/unit/smoke.test.tsx`

- **Tests/commands yang dijalankan:**
  - `npm run lint` -> **PASS** (0 errors, 0 warnings).
  - `npm run typecheck` -> **PASS** (`tsc --noEmit` selesai dengan 0 kesalahan).
  - `npm run test` -> **PASS** (8 test files, 50 unit & integration tests lulus 100%).
  - `npm run build` -> **PASS** (Next.js Turbopack production build selesai tanpa kendala, 19 rute berhasil di-compile).

- **Visual & UX review:**
  - **Papan Catur & Interaksi:** Petak terpilih, langkah terakhir, dan indikator target legal kontras dan mudah dibaca tanpa mengaburkan bidak. Modal promosi pion muncul tepat waktu ketika pion mencapai rank 8/rank 1 dan tidak pernah otomatis memilih menteri tanpa izin pemain.
  - **Replay Viewer:** Tombol navigasi langkah dan keyboard shortcuts berjalan mulus. Mengklik langkah mana pun pada daftar notasi langsung melompat ke posisi FEN yang bersangkutan.
  - **Responsivitas:** Tata letak tetap solid pada layar desktop (grid 2 kolom) dan mobile (single column stack dengan papan proporsional 1:1).

- **Known issues / limitations:**
  - Analisis evaluasi mesin mendalam per langkah (blunder/mistake badge pada riwayat tayang ulang) dan Gemini AI Tutor belum dimasukkan karena merupakan ruang lingkup Fase 3 & Fase 4.
  - Rating bot (400-2000 Elo) merupakan estimasi target berbasis tingkat kedalaman dan waktu berpikir engine; belum dikalibrasi terhadap data turnamen riil.

- **Gate:** **PASS** (Seluruh kriteria penerimaan Fase 1 terpenuhi secara penuh).

- **Langkah berikutnya:** Menunggu arahan untuk Fase 2 (Tactics & Puzzles Core).
