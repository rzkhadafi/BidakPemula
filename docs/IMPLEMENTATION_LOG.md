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

- **Langkah berikutnya:** Fase 2 & Revisi UX Pemula (Kurikulum Belajar, Peningkatan Papan & Bidak Vektor, Efek Suara, dan Sistem Taktik).

---

### 2026-10-24 — Revisi UX Pemula, Penyempurnaan Permainan, Kurikulum Belajar & Sistem Taktik

- **Tujuan:**
  Mengubah arah pengalaman produk Chess Archive agar ramah pemula mutlak (100% Bahasa Indonesia), menyederhanakan hierarki navigasi dan beranda, memperbesar dan memperhalus visual papan catur dengan bidak vektor SVG serta animasi transisi, menambahkan efek suara Web Audio API offline tanpa dependensi luar, menyempurnakan penghitungan jam catur berbasis delta timestamp dan jeda berpikir alami bot, menyediakan kurikulum belajar interaktif langkah-demi-langkah (9 modul lengkap), serta menyediakan arena latihan taktik (18 puzzle terkurasi dengan 3 tingkat petunjuk bertahap).

- **Perubahan utama:**
  1. **Hierarki Navigasi Sederhana & Rancang Ulang Beranda:**
     - Mengubah navigasi utama menjadi 3 fokus utama: **Belajar** (`/academy`), **Main Catur** (`/play`), dan **Latihan** (`/puzzles`). Fitur Arsip dan Pengaturan dialihkan ke menu sekunder yang rapi.
     - Merancang ulang beranda (`/`): Headline ramah pemula ("Belajar catur, satu langkah demi satu langkah"), tombol aksi terarah ("Mulai Belajar dari Nol" dan "Langsung Main Catur"), kartu modul belajar lanjutan otomatis, serta kartu pratinjau kurikulum dan latihan.
  2. **Penyempurnaan Papan Catur & Bidak Vektor SVG:**
     - Memperbesar ukuran maksimal papan catur pada desktop menjadi 640px–660px (`max-w-[640px] lg:max-w-[660px]`).
     - Mengganti glif teks Unicode dengan bidak vektor SVG presisi tinggi (`src/components/chessboard/ChessPieces.tsx`) untuk seluruh bidak Putih dan Hitam.
     - Menambahkan animasi perpindahan bidak yang halus (durasi 140–200ms) dengan dukungan `@media (prefers-reduced-motion: reduce)` yang mematikan animasi bagi pengguna dengan sensitivitas gerak.
     - Memperhalus visual petak terpilih (`#C7A66A`), langkah terakhir, ring bidak target yang dapat dipukul, dan highlight merah pada raja saat posisi skak.
  3. **Sistem Efek Suara (Web Audio API Synthesizer):**
     - Mengimplementasikan `src/lib/audio/chess-audio.ts` menggunakan osilator Web Audio API bawaan peramban (zero external assets, 0ms latency, offline-first).
     - Menghasilkan nada taktil kayu untuk langkah bidak, nada dampak ganda untuk pemukulan (capture), peringatan resonan untuk skak, dan akord kemenangan/kekalahan.
     - Menyediakan toggle status suara di bilah kontrol `/play` dan `/settings` dengan persistensi ke `localStorage` (`chess_archive_sound_enabled`).
  4. **Penyempurnaan Jam Catur & Waktu Berpikir Alami Bot:**
     - Menghitung waktu mundur jam catur menggunakan delta timestamp monotonik (`Date.now() - lastTickTime`) yang kebal terhadap throttle interval browser.
     - Jam catur bot kini aktif berdetik mundur selama bot menganalisis dan berpikir.
     - Menerapkan jeda berpikir alami bot (`BOT_MIN_THINKING_DELAYS`: 650ms–1500ms) agar respons bot terasa seperti lawan manusia dan tidak terjadi seketika, dengan bypass instan khusus lingkungan unit testing.
     - Memperbarui 5 tingkat kesulitan bot dengan istilah ramah pemula: **Santai**, **Pemula**, **Berkembang**, **Menantang**, dan **Kuat**.
  5. **Kurikulum Belajar Interaktif Pemula (`/academy`):**
     - Menyusun 9 modul belajar catur dari nol:
       1. *Mengenal Papan Catur* (64 petak, lajur a–h, baris 1–8, petak pusat)
       2. *Gerakan Bidak: Benteng* (lajur vertikal dan baris horizontal)
       3. *Gerakan Bidak: Gajah* (diagonal sewarna)
       4. *Gerakan Bidak: Menteri* (kombinasi benteng dan gajah)
       5. *Gerakan Bidak: Kuda* (lompatan pola 'L' menembus barisan)
       6. *Gerakan Bidak: Pion* (maju lurus, memukul miring)
       7. *Raja & Ancaman Skak* (keselamatan raja, menghindari dan membalas skak)
       8. *Gerakan Khusus* (rokade sayap raja/menteri dan promosi pion)
       9. *Prinsip Strategi Dasar* (kuasai pusat, aktifkan perwira, amankan raja)
     - Membuat komponen `InteractiveLessonBoard.tsx` yang memvalidasi langkah langsung melalui `chess.js`, memberikan umpan balik hangat seketika, petunjuk bertahap, dan tombol lanjut.
     - Menyimpan progres modul dan langkah secara persisten di `localStorage` melalui adapter SSR-safe `src/features/academy/academy-progress.ts`.
  6. **Latihan Taktik & Puzzle Terverifikasi (`/puzzles`):**
     - 18 puzzle taktis yang diverifikasi legalitas FEN dan notasi UCI-nya (`puzzle-validator.ts`), mencakup 6 tema taktis (Garpu Kuda, Pin/Paku, Tusukan/Skewer, Discovered Attack, Defleksi/Pengalihan, dan Skakmat Bertahap).
     - Tab filter latihan: *Semua*, *Taktik Dasar*, *Skakmat*, dan *Lanjutan*.
     - 3 tingkat petunjuk bertahap berbahasa Indonesia, tombol coba ulang saat salah, serta tombol buka solusi jika pemain buntu.
     - Persistensi progres latihan di `localStorage` (`puzzle-progress.ts`) dengan ringkasan akurasi dan jumlah puzzle yang diselesaikan.
  7. **Halaman Pengaturan Diperbarui (`/settings`):**
     - Penyesuaian preferensi suara, animasi, tema Dark Graphite, serta aksi pembersihan data arsip permainan dan progres kurikulum secara terpisah dengan dialog konfirmasi aman.

- **File penting yang dibuat/dimodifikasi:**
  - `src/components/chessboard/ChessPieces.tsx`
  - `src/components/chessboard/InteractiveChessboard.tsx`, `ChessboardPlaceholder.tsx`
  - `src/lib/audio/chess-audio.ts`
  - `src/features/engine/difficulty.ts`
  - `src/features/game/use-chess-game.ts`
  - `src/components/layout/Navbar.tsx`
  - `src/app/page.tsx`, `src/app/play/page.tsx`, `src/app/settings/page.tsx`
  - `src/features/academy/types.ts`, `academy-catalog.ts`, `academy-progress.ts`, `InteractiveLessonBoard.tsx`, `LessonViewClient.tsx`
  - `src/app/academy/page.tsx`, `src/app/academy/[lessonId]/page.tsx`
  - `src/features/puzzles/types.ts`, `puzzle-catalog.ts`, `puzzle-validator.ts`, `puzzle-progress.ts`, `use-puzzle-game.ts`, `PuzzleViewClient.tsx`
  - `src/app/puzzles/page.tsx`, `src/app/puzzles/[puzzleId]/page.tsx`
  - `tests/unit/academy.test.ts`, `tests/unit/puzzle-progress.test.ts`, `tests/unit/chess-audio.test.ts`, `tests/unit/interactive-game.test.tsx`, `tests/integration/play-and-archive.test.tsx`, `tests/unit/smoke.test.tsx`

- **Hasil Pemeriksaan Teknis:**
  - `npm run lint` -> **PASS** (0 errors, 0 warnings).
  - `npm run typecheck` -> **PASS** (`tsc --noEmit` 0 errors).
  - `npm run test` -> **PASS** (12 test suites, 74 tests passed 100%).
  - `npm run build` -> **PASS** (Next.js Turbopack production build selesai tanpa kendala; 39 rute statis & partial prerendering berhasil di-generate).

- **Gate:** **PASS** (Seluruh spesifikasi perombakan UX pemula, permainan catur interaktif, modul belajar pemula, latihan taktik, dan audio lokal telah terpenuhi secara lengkap).

---

### 2026-10-24 — Fase 3: Guru Catur AI Indonesia dengan Penjelasan Suara

- **Tujuan:**
  Membangun Guru Catur AI berbahasa Indonesia yang mampu menjelaskan posisi, langkah, dan konsep catur dengan bahasa yang ramah pemula mutlak, serta membacakan penjelasannya menggunakan narasi audio alami (TTS). Menjaga keamanan API key di sisi server Next.js, memvalidasi legalitas langkah catur dengan `chess.js`, menyediakan caching audio berbasis IndexedDB, fallback suara peramban (Web Speech API), serta fallback penjelasan kurasi offline ketika kunci API atau kuota tidak tersedia.

- **Perubahan utama:**
  1. **Konfigurasi Lingkungan & Keamanan (`.env.example`):**
     - Mendefinisikan variabel server: `GEMINI_API_KEY`, `GEMINI_TUTOR_MODEL` (default: `gemini-2.5-flash`), `GEMINI_TTS_MODEL` (default: `gemini-2.5-flash`), `GEMINI_TTS_VOICE` (default: `Puck`), dan `TUTOR_ENABLED`.
     - Kunci API tidak pernah diekspos ke kode peramban (`NEXT_PUBLIC_*`), bundle JavaScript, log, atau respons API.
  2. **Model Data Guru Catur (`src/features/tutor/types.ts`):**
     - Mendefinisikan antarmuka TypeScript ketat: `TutorExplainRequest`, `TutorExplainResponse`, `SuggestedMove`, `TutorAnalysisContext`, `TutorSpeechRequest`, `TutorApiError`, dan `TutorPreferences`.
  3. **Layanan Server Gemini & Fallback Kurasi (`src/features/tutor/server/`):**
     - `gemini-service.ts`: Memvalidasi FEN dan panjang input secara ketat. Mengirimkan prompt pedagogis Indonesia, memvalidasi seluruh langkah yang disarankan (`suggestedMoves`) menggunakan `chess.js` pada FEN terkait (menghapus/mengabaikan langkah ilegal), serta menangani sintesis audio biner WAV.
     - `curated-tutor-fallbacks.ts`: Menyediakan penjelasan catur lokal berkualitas tinggi untuk posisi pembukaan, ancaman skak, materi kurikulum akademi, dan tinjauan langkah terakhir saat sistem offline atau kuota habis.
  4. **Endpoint API Server:**
     - `POST /api/tutor/explain`: Menerima konteks FEN, giliran, tingkat pemula, dan riwayat langkah; mengembalikan penjelasan terstruktur beserta naskah lisan (`spokenText`).
     - `POST /api/tutor/speech`: Menerima naskah teks; mengembalikan data biner audio (`audio/wav`) langsung dari model TTS, atau respons 503 fallback jika kuota/kunci tidak tersedia.
  5. **Pengontrol Suara & Caching Audio Klien (`src/features/tutor/`):**
     - `audio-cache.ts`: Cache lokal berbasis IndexedDB (`chess_archive_audio_db`) dengan kunci hash deterministik (`text + voice`). Memungkinkan pemutaran instan tanpa request API berulang.
     - `speech-controller.ts`: Pengontrol pemutaran audio dengan state management (`idle`, `loading`, `playing`, `paused`, `error`), kontrol Play, Pause, Resume, Replay, Stop, serta pengatur kecepatan (`0.85x`, `1.0x`, `1.25x`) secara real-time via `playbackRate`. Otomatis beralih ke `window.speechSynthesis` (bahasa Indonesia) bila Gemini TTS tidak aktif.
     - `tutor-preferences.ts`: Mengelola preferensi putar otomatis (autoplay), kecepatan suara, dan pilihan model/suara di `localStorage` secara SSR-safe.
  6. **Integrasi Antarmuka Pengguna (`src/features/tutor/components/`):**
     - `TutorAudioPlayer.tsx`: Bilah kendali suara taktil Dark Graphite dengan visual gelombang suara, kontrol pemutar, opsi kecepatan instan, dan toggle autoplay.
     - `TutorPanel.tsx`: Panel pendamping guru catur dengan judul, rangkuman, naskah lisan, pemutar audio terintegrasi, accordion petunjuk bertahap (*hint*), sorotan langkah kandidat, chip pertanyaan reflektif, serta input pertanyaan lanjutan.
     - `PlayTutorModal.tsx`: Dialog modal bimbingan di halaman `/play` yang dipicu tombol *"Jelaskan Langkah Terakhir (Suara)"* tanpa mengganggu posisi papan, giliran, maupun jam catur yang sedang berjalan.
     - Halaman `/academy/[lessonId]`: Menghadirkan tab terpadu antara *Guru Catur (Suara)* dan *Panduan Materi*.
     - Halaman `/settings`: Menampilkan status Guru AI aktif di server, kontrol kecepatan suara, preferensi autoplay, dan tombol pengosongan cache audio IndexedDB.

- **File penting yang dibuat/dimodifikasi:**
  - `.env.example`
  - `src/features/tutor/types.ts`, `index.ts`
  - `src/features/tutor/server/gemini-service.ts`, `curated-tutor-fallbacks.ts`
  - `src/features/tutor/audio-cache.ts`, `speech-controller.ts`, `tutor-preferences.ts`, `tutor-client.ts`
  - `src/features/tutor/components/TutorAudioPlayer.tsx`, `TutorPanel.tsx`, `PlayTutorModal.tsx`
  - `src/app/api/tutor/explain/route.ts`, `src/app/api/tutor/speech/route.ts`
  - `src/app/academy/[lessonId]/page.tsx`, `src/features/academy/LessonViewClient.tsx`
  - `src/app/play/page.tsx`, `src/app/settings/page.tsx`
  - `tests/unit/tutor-service.test.ts`, `tests/unit/speech-controller.test.ts`, `tests/integration/tutor-api.test.ts`, `tests/unit/tutor-ui.test.tsx`
  - `docs/AI_TUTOR_SPEC.md`, `docs/IMPLEMENTATION_LOG.md`

- **Hasil Pemeriksaan Teknis:**
  - `npm run lint` -> **PASS** (0 errors, 0 warnings).
  - `npm run typecheck` -> **PASS** (`tsc --noEmit` 0 errors).
  - `npm run test` -> **PASS** (16 test suites, **95 tests lulus 100%**).
  - `npm run build` -> **PASS** (Next.js Turbopack build sukses, 41 rute berhasil di-compile termasuk 2 rute API server dinamis).
  - Verifikasi Server HTTP (Next.js production runtime):
    - `POST /api/tutor/explain` -> Status 200 OK (mengembalikan analisis terstruktur, naskah lisan, dan langkah legal tervalidasi).
    - `POST /api/tutor/speech` -> Status 503 fallback terkelola aman saat tanpa kunci API (`fallbackToWebSpeech: true`).

- **Gate:** **PASS** (Seluruh kriteria penerimaan Fase 3 terpenuhi secara penuh).

---

### 2026-10-24 — Penyempurnaan Visual: Papan Catur Klasik Wood & Bidak 3D Staunton Neo

- **Tujuan:**
  Mengimplementasikan set visual papan catur kayu klasik ("Neo-Wood") dan set bidak 3D Staunton bergradien kaya secara default di seluruh antarmuka aplikasi (`/play`, `/academy`, `/puzzles`, `/archive`, dan beranda) sesuai gambar referensi pengguna.

- **Perubahan utama:**
  1. **Visual Papan Kayu Alami (CSS Multi-Layer Texture):**
     - Memperbarui token warna di `src/app/globals.css`: `--board-light: #dfba87` (blonde maple) dan `--board-dark: #8f5d32` (rich walnut).
     - Menambahkan kelas tekstur serat kayu alami `.board-square-light` dan `.board-square-dark` menggunakan CSS `repeating-linear-gradient` bertingkat (serat vertikal 90deg, pori horizontal 0deg, dan pencahayaan diagonal 135deg). Zero external asset overhead.
     - Memperbarui bingkai papan catur dengan bezel kayu gelap berlapis (`border-[5px] sm:border-[7px] border-[#382414] shadow-[0_18px_45px_rgba(0,0,0,0.75)] bg-[#24170D]`).
  2. **Bidak Vektor 3D Staunton Neo (`ChessPieces.tsx`):**
     - Mengembangkan kembali representasi SVG untuk seluruh 6 bidak (Pawn, Rook, Knight, Bishop, Queen, King) dengan bayangan kontur ambien (`filter: feDropShadow`), gradien radial/linear multi-stop untuk badan, kepala, dan dasar tumpuan, garis aksen interior kayu, serta titik kilau specular.
     - Pion: Kepala bulat bergradien dengan specular dot, leher bergelang cincin ganda, dan dudukan berundak.
     - Benteng: Parapet berigi 3 takik bergaris cornice tajam dan siluet badan kokoh.
     - Kuda: Siluet leher melengkung dengan 3 jambul surai berundak, garis pipi/otot rahang, lubang hidung, dan mata ber-catchlight.
     - Gajah: Siluet topi miter dengan belahan diagonal khas, pita leher melengkung, serta bola finial mini.
     - Menteri: Mahkota anggun bermahkota 5 mutiara bergradien, pinggang ramping, dan gaun berundak.
     - Raja: Jubah imperial dengan sabuk permata, kubah mahkota, serta salib Latin tegak di puncaknya.
  3. **Tipografi & Kontras Koordinat Petak:**
     - Menempatkan koordinat lajur (a-h) di sudut kanan bawah dan koordinat baris (1-8) di sudut kiri atas petak terluar secara in-square.
     - Warna koordinat menyesuaikan kontras petak: `#73471F` pada petak terang, `#E8D4B8` pada petak gelap.
  4. **Harmonisasi Sorotan Gerakan & Modal Promosi:**
     - Sorotan petak terpilih (`rgba(235, 195, 60, 0.65)` dengan ring `#F5C342`) dan langkah terakhir (`rgba(220, 175, 50, 0.42)`).
     - Indikator langkah legal petak kosong menggunakan titik gelap berbingkai halus (`bg-[#1E140B]/40 border-[#FFF0D0]/30`), dan pemukulan menggunakan cincin kuning amber berdenyut (`border-[#E2B13C]/80`).
     - Modal promosi pion mengadopsi palet kayu dan menampilkan bidak 3D secara konsisten.
  5. **Penyesuaian Komponen Terkait:**
     - `InteractiveChessboard.tsx` dan `ChessboardPlaceholder.tsx` disinkronkan ke set visual baru.
     - Test unit `responsive-and-accessibility.test.tsx` disesuaikan untuk memvalidasi token warna papan kayu baru.

- **Hasil Pemeriksaan Teknis:**
  - `npm run lint` -> **PASS** (0 errors, 0 warnings).
  - `npm run typecheck` -> **PASS** (`tsc --noEmit` 0 errors).
  - `npm test` -> **PASS** (16 test suites, **95 tests lulus 100%**).
  - `npm run build` -> **PASS** (Kompilasi Next.js 16 sukses, seluruh 41 rute statis & server berhasil dibuat).

- **Gate:** **PASS** (Set visual kayu klasik dan bidak 3D Staunton Neo telah terpasang rapi di seluruh aplikasi).

---

### 2026-10-24 — Jalur Suara Gemini TTS Manusiawi: Karakter Aoede & Konverter PCM ke WAV

- **Tujuan:**
  Mengaktifkan jalur suara asli Gemini TTS berbahasa Indonesia dengan nada dan intonasi manusiawi menggunakan karakter suara ekspresif **Aoede**, mengonversi audio biner mentah Linear PCM 24kHz ke format standar WAV (RIFF header 44-byte), serta memperbarui preferensi tutor audio dan instruksi gaya tutur pada naskah lisan.

- **Perubahan utama:**
  1. **Konverter Audio PCM ke WAV (`src/features/tutor/server/gemini-service.ts`):**
     - Mengimplementasikan fungsi `pcmToWav()` untuk membungkus data audio biner mentah dari Gemini TTS (`audio/L16;codec=pcm;rate=24000`) ke dalam kontainer standar WAV dengan header RIFF 44-byte (24kHz, 16-bit mono, 48000 byte/s).
     - Menghilangkan kegagalan pemutaran di pemutar audio HTML5 sehingga browser tidak lagi terlempar ke suara robot bawaan laptop (*Web Speech fallback*).
  2. **Konfigurasi Model & Suara Aoede:**
     - Mengarahkan `GEMINI_TTS_MODEL` ke model audio resmi Google AI Studio: `gemini-2.5-flash-preview-tts`.
     - Menetapkan default karakter suara ke `Aoede` (hangat, ramah, artikulatif, dan bernada ekspresif) di `.env.example`, `.env.local`, dan `tutor-preferences.ts`.
  3. **Penyempurnaan Gaya Naskah Lisan (*Spoken Text*):**
     - Memperbarui prompt instruksi agar naskah suara yang dihasilkan bergaya bahasa tutur percakapan hangat seorang mentor catur pribadi, menghindari bahasa baku kaku buku teks dan notasi mentah.
  4. **Selektor Karakter Suara di Halaman Pengaturan (`/settings`):**
     - Menambahkan kontrol pilihan karakter suara Guru AI di pengaturan aplikasi dengan opsi `Aoede` (rekomendasi), `Puck`, `Charon`, `Fenrir`, dan `Kore`.
  5. **Pengujian Unit & Verifikasi Nyata:**
     - Menambahkan test case di `tests/unit/tutor-service.test.ts` untuk memvalidasi pembuatan header RIFF WAVE 44-byte secara presisi.
     - Melakukan uji coba pemanggilan live API Gemini TTS: berhasil menghasilkan file audio WAV 24kHz asli sebesar 269.370 byte (HTTP 200).

- **Hasil Pemeriksaan Teknis:**
  - `npm run lint` -> **PASS** (0 errors, 0 warnings).
  - `npm run typecheck` -> **PASS** (`tsc --noEmit` 0 errors).
  - `npm test` -> **PASS** (16 test suites, **96 tests lulus 100%**).
  - `npm run build` -> **PASS** (Kompilasi Next.js 16 sukses, seluruh 41 rute berhasil di-generate).

- **Gate:** **PASS** (Jalur suara asli Gemini TTS dengan karakter Aoede dan konverter WAV telah aktif sepenuhnya).

---

### 2026-10-24 — Fase 5: Perkembangan Belajar Personal (Adaptive Learning System)

- **Tujuan:**
  Membangun sistem pembelajaran personal yang memahami progres pengguna, mengenali materi yang masih perlu dilatih, dan merekomendasikan langkah belajar berikutnya berdasarkan bukti aktivitas nyata (hasil latihan Akademi, percobaan puzzle, kesalahan, penggunaan petunjuk, dan melihat solusi). Menghindari tampilan dashboard statistik yang rumit demi antarmuka editorial ramah pemula yang menjawab 4 pertanyaan inti: *Apa yang sudah saya kuasai?*, *Materi apa yang masih perlu saya latih?*, *Mengapa materi itu direkomendasikan?*, dan *Apa yang sebaiknya saya lakukan sekarang?*.

- **Perubahan utama:**
  1. **Model Kemampuan Pemain (`src/features/learning/types.ts` & `skills-catalog.ts`):**
     - Mendefinisikan 17 keterampilan catur inti ber-ID stabil yang terbagi dalam 3 kategori:
       - *Dasar Permainan* (Koordinat papan, Gerakan 6 bidak: Benteng, Gajah, Menteri, Kuda, Pion, Raja & Skak, serta Gerakan khusus: Rokade & Promosi).
       - *Taktik Dasar* (Garpu/Fork, Ikatan/Pin, Serangan Tusuk/Skewer, Serangan Terbuka/Discovered Attack, Menyingkirkan Penjaga/Remove Defender, Pola Skakmat Sederhana).
       - *Strategi Pemula* (Penguasaan Pusat Papan, Pengembangan Perwira, Keamanan Raja & Kewaspadaan).
     - Menghubungkan setiap keterampilan dengan prasyarat (*prerequisites*), modul Akademi, dan katalog Puzzle.
  2. **Pengukuran Penguasaan & Pengulangan Terencana (`mastery-evaluator.ts`):**
     - Menerapkan 4 status penguasaan yang ramah pemula: *Belum dicoba*, *Sedang dipelajari*, *Hampir dikuasai*, dan *Dikuasai*.
     - Pembobotan bukti nyata: Keberhasilan mandiri (0 hint) memberi bobot tinggi (+25), melihat solusi memberi bobot minimal (+2, tidak inflasi), dan kesalahan mengurangi skor secara lembut (-8) tanpa menghapus capaian sebelumnya.
     - Penilaian tingkat kepercayaan (*confidence* low/medium/high berdasarkan variasi dan jumlah percobaan) untuk mencegah klaim penguasaan prematur.
     - Penjadwalan pengulangan terencana (*spaced repetition*): Keterampilan yang telah dikuasai atau hampir dikuasai dijadwalkan ulang berkala (2 hari untuk *in-progress*, 4 hari untuk *near-mastery*, 7 hari untuk *mastered*) dan ditandai `needsReview = true` ketika sudah waktunya ditinjau.
  3. **Mesin Rekomendasi Adaptif Berbasis Bukti (`recommendation-engine.ts`):**
     - Algoritma deterministik 100% lokal (tanpa biaya API, bekerja instan & offline) dengan urutan prioritas:
       1. Materi prasyarat yang belum dikuasai (misal: gerakan kuda sebelum taktik garpu).
       2. Kelemahan nyata berdasarkan riwayat kesalahan/koreksi berulang.
       3. Materi yang sudah waktunya diulang (*spaced review*).
       4. Langkah terstruktur berikutnya dalam kurikulum Akademi.
       5. Tantangan taktik baru untuk keterampilan yang sudah matang.
     - Setiap rekomendasi menghasilkan alasan penjelasan yang hangat, masuk akal, dan bersahabat dalam bahasa Indonesia.
  4. **Penyimpanan Lokal Berversi & Idempotensi (`learning-storage.ts` & `use-learning-profile.ts`):**
     - Menggunakan kunci penyimpanan `chess_archive_learning_profile_v1` dengan sinkronisasi otomatis (*auto-sync*) riwayat Akademi & Puzzle yang telah selesai sebelumnya.
     - Menjamin idempotensi melalui `processedEvidenceIds` agar render ulang atau refresh tidak melipatgandakan skor.
     - Menyediakan fungsi reset profil progres terisolasi yang aman tanpa menyentuh arsip pertandingan atau pengaturan audio.
  5. **Pengalaman UI/UX & Halaman Baru (`/progress`, `/`, `/academy`, `/settings`):**
     - **Beranda (`/`):** Menampilkan kartu rekomendasi personal adaptif (*Saran Belajar Berikutnya*) bagi pemain aktif, dan sambutan ramah dari nol tanpa grafik kosong bagi pengguna baru.
     - **Akademi (`/academy`):** Menampilkan lencana penguasaan per modul (*Dikuasai*, *Sedang Dilatih*, *Perlu Diulang*) dan sorotan lembut untuk modul yang disarankan.
     - **Halaman Perkembangan (`/progress`):** Menjawab 4 pertanyaan pemula secara runtut dan menghadirkan tombol suara Guru Catur AI (Aoede) untuk membacakan rekomendasi belajar secara alami.
     - **Navigasi Sekunder:** Menambahkan pintasan *Progres* pada menu sekunder Navbar dan drawer mobile.
     - **Pengaturan (`/settings`):** Tombol *Reset Progres Belajar* diintegrasikan untuk membersihkan profil perkembangan personal secara terkonfirmasi.
  6. **Perekaman Otomatis pada Komponen Interaktif:**
     - `InteractiveLessonBoard.tsx`: Merekam keberhasilan dan koreksi langkah interaktif ke model keterampilan terkait.
     - `use-puzzle-game.ts`: Merekam keberhasilan mandiri, pemakaian petunjuk, dan pembukaan solusi ke profil taktik.

- **Hasil Pemeriksaan Teknis:**
  - `npm run lint` -> **PASS** (0 errors, 0 warnings pada seluruh file TypeScript & React).
  - `npm run typecheck` -> **PASS** (`tsc --noEmit` 0 errors).
  - `npm test` -> **PASS** (17 test suites, **108 tests lulus 100%**).
  - `npm run build` -> **PASS** (Kompilasi Next.js 16 sukses, seluruh 42 rute statis & server berhasil dibuat).

- **Gate:** **PASS** (Seluruh kriteria penerimaan Fase 5 terpenuhi secara lengkap).

---

### 2026-10-24 — Fitur Pedagogi Lanjutan: Tahap 1 — "Kacamata Catur" (Vision & Threat Heatmap)

- **Tujuan:**
  Membangun fitur "Kacamata Catur" (Vision & Threat Heatmap) sebagai Tahap 1 dari peta jalan pedagogi pemula. Fitur ini dirancang khusus untuk mengatasi kebutaan taktis pemula (*chess blindness*), seperti meninggalkan bidak tanpa perlindungan (*hanging pieces*), melewatkan peluang menangkap perwira lawan secara gratis, dan ketidaktahuan atas koordinasi perlindungan antar-perwira.

- **Perubahan utama:**
  1. **Mesin Kalkulasi Ancaman & Perlindungan Petak (`src/features/chessboard/square-threats.ts`):**
     - Memanfaatkan metode native berkecepatan tinggi `chess.attackers(sq, color)` dari `chess.js` untuk memetakan seluruh 64 petak papan catur dalam waktu < 0.5 ms tanpa memblokir rendering UI.
     - Menilai status taktis per petak:
       - `hanging_friendly`: Bidak kawan diserang lawan dan sama sekali tidak dijaga pengawal (peringatan bahaya fatal).
       - `overpowered_friendly`: Bidak kawan kalah jumlah pengawal atau diserang oleh bidak lawan yang nilainya lebih murah (misal Menteri diserang Pion/Kuda).
       - `hanging_opponent`: Bidak lawan tidak dijaga dan bisa ditangkap gratis (peluang emas).
       - `vulnerable_opponent`: Bidak lawan rentan karena diincar oleh perwira kita yang lebih murah atau kalah jumlah pengawal.
       - `defended_friendly`: Bidak kawan terlindungi aman oleh perwira kawan.
     - Memperhitungkan matriks nilai bidak standar (`P=1, N=3, B=3, R=5, Q=9, K=1000`) untuk mendeteksi ancaman pertukaran yang merugikan pemula.
     - Mengimplementasikan `computePieceScope()`: mendeteksi perwira kawan yang dilindungi oleh bidak yang dipilih (`defendedPieces`), bidak lawan yang diincar (`targetedEnemyPieces`), dan petak kosong yang dikontrol (`controlledEmptySquares`).
     - Menyediakan penyimpanan preferensi `localStorage` (`chess_archive_vision_glasses_v1`) yang tersinkronisasi aman melalui pola React 19 `useSyncExternalStore`.
  2. **Integrasi Visual pada Papan Catur (`src/components/chessboard/InteractiveChessboard.tsx`):**
     - **Tombol Toggle & Status Bar:** Menghadirkan tombol `Kacamata Catur` dengan ikon `Glasses` dan status `ON / OFF` di atas papan, lengkap dengan indikator mini jumlah bahaya (`! Terancam`) dan peluang (`★ Peluang Bebas`).
     - **Overlay Petak Non-Intrusif:** Seluruh indikator visual menggunakan `pointer-events-none` agar tidak mengganggu klik, drag-and-drop, dan eksekusi langkah catur:
       - Cincin merah berdenyut dan lencana `!` untuk bidak sendiri yang gantung tanpa pengawal.
       - Cincin oranye/kuning untuk bidak kawan yang kalah nilai pertukaran atau kalah jumlah pengawal.
       - Cincin hijau zamrud berdenyut dan lencana `★` untuk peluang menangkap bidak lawan yang gratis.
       - Lencana perisai hijau `🛡️` pada perwira kawan yang dijaga oleh bidak yang sedang diklik.
       - Lencana sasaran `🎯` pada bidak lawan yang diincar oleh bidak yang sedang diklik.
     - **Radar Taktis Pemula & Panduan Simbol:** Kartu informasi interaktif di bawah papan yang menampilkan kalimat penjelasan bahasa Indonesia yang ramah saat kursor diarahkan ke petak (*hover*) atau saat petak diklik/disentuh, serta tombol panduan legenda simbol visual.
  3. **Pengujian Unit & Komprehensif (`tests/unit/square-threats.test.ts`):**
     - Memvalidasi cakupan 64 petak, pendeteksian posisi awal, akurasi deteksi bidak gantung kawan, peluang tangkap bebas lawan, perbandingan nilai materi bidak penyerang, dan garis pandang perwira (scope).

- **Hasil Pemeriksaan Teknis:**
  - `npm run lint` -> **PASS** (0 errors, 0 warnings pada seluruh file TypeScript & React).
  - `npm run typecheck` -> **PASS** (`tsc --noEmit` 0 errors).
  - `npm test` -> **PASS** (18 test suites, **115 tests lulus 100%**).
  - `npm run build` -> **PASS** (Kompilasi Next.js 16 sukses, seluruh 42 rute statis & server berhasil dibuat).

- **Gate:** **PASS** (Tahap 1: "Kacamata Catur" telah selesai diimplementasikan, teruji bebas error, dan siap digunakan).

---

### 2026-10-24 — Fitur Pedagogi Lanjutan: Tahap 2 — Pendampingan Aktif (In-Game AI Co-Pilot: Guided Undo & Socratic Hints)

- **Tujuan:**
  Membangun sistem pendampingan aktif (*In-Game AI Co-Pilot*) untuk melindungi pemain dari blunder fatal (*blunder safety net*), membimbing langkah pembatalan (*guided undo*), dan memberikan petunjuk berpikir bertingkat (*3-Tier Socratic Hints*) yang didukung pembacaan audio manusiawi (Aoede) serta terintegrasi dengan perekaman profil perkembangan belajar personal.

- **Perubahan utama:**
  1. **Detektor Blunder Real-Time (`src/features/copilot/blunder-detector.ts`):**
     - Mengevaluasi keselamatan langkah (`evaluateMoveSafety`) secara lokal dalam < 1 ms sebelum langkah dieksekusi.
     - Mendeteksi skakmat langsung (*mate in 1*), memindahkan perwira bernilai tinggi (Menteri/Benteng/Kuda/Gajah) ke petak gantung tanpa pengawal, pertukaran merugikan (diserang bidak lawan yang lebih murah), dan perpindahan yang menyebabkan perwira kawan lain kehilangan pengawal.
  2. **Mesin Petunjuk Sokrates 3 Tingkat (`src/features/copilot/socratic-engine.ts`):**
     - Mengubah langkah terbaik Stockfish engine menjadi 3 tingkat bimbingan berpikir pedagogis:
       - *Tingkat 1: Panduan Observasi & Arah Pandang* (mengarahkan mata ke sektor sayap raja, pusat, sayap menteri, atau keamanan raja tanpa membocorkan bidak).
       - *Tingkat 2: Identifikasi Perwira Kunci* (menyorot perwira yang perlu diperhatikan dan petak asalnya tanpa membocorkan petak tujuan).
       - *Tingkat 3: Langkah Konkret & Alasan Strategis Penuh* (notasi SAN + penjelasan tujuan taktis/posisional secara lengkap).
     - Menghasilkan naskah lisan (*spokenText*) siap dibacakan oleh karakter suara Gemini TTS (Aoede).
  3. **Penyimpanan Preferensi Co-Pilot (`src/features/copilot/copilot-storage.ts`):**
     - Sinkronisasi preferensi `localStorage` (`chess_archive_copilot_v1`) aman SSR melalui pola React 19 `useSyncExternalStore`.
  4. **Komponen Dialog Pendampingan (`src/features/copilot/components/`):**
     - `BlunderInterceptModal.tsx`: Dialog konfirmasi pencegahan blunder dengan pilihan hangat *Pikirkan Lagi (Tarik Langkah)* atau *Tetap Jalankan*.
     - `SocraticHintModal.tsx`: Dialog interaktif petunjuk bertingkat (Tingkat 1-3), integrasi pemutar suara `TutorAudioPlayer` (Aoede), dan tombol coba langsung di papan.
  5. **Integrasi ke Papan Catur & Halaman Bermain (`InteractiveChessboard.tsx`, `use-chess-game.ts`, `PlayPage.tsx`):**
     - Penambahan prop `highlightedSquare` dengan animasi cincin emas berdenyut pada `InteractiveChessboard.tsx`.
     - Pengaitan intersep langkah blunder pada `handleSquareClick` dan modal promosi pion.
     - Tombol *Minta Petunjuk Guru AI (Sokrates)* dengan status loading analisis di panel kontrol pertandingan.
     - Sakelar toggle *Bantalan Blunder* di bilah kontrol pertandingan mode latihan.
     - Bimbingan mentor pada aksi *Undo* (*Guided Undo*).
     - Perekaman bukti aktivitas otomatis ke sistem pembelajaran personal (`strategy-king-safety` saat membatalkan blunder dan `strategy-piece-development` saat menggunakan petunjuk).
  6. **Pengujian Unit & Komprehensif (`tests/unit/copilot.test.ts`):**
     - 7 unit test baru memvalidasi langkah normal aman, deteksi blunder menteri gantung, deteksi ancaman skakmat lawan 1 langkah, deteksi perwira kawan yang ditinggal tanpa pengawal, 3 tingkat petunjuk Sokrates, petunjuk khusus rokade, dan persistensi preferensi.

- **Hasil Pemeriksaan Teknis:**
  - `npm run lint` -> **PASS** (0 errors, 0 warnings pada seluruh file TypeScript & React).
  - `npm run typecheck` -> **PASS** (`tsc --noEmit` 0 errors).
  - `npm test` -> **PASS** (19 test suites, **122 tests lulus 100%**).
  - `npm run build` -> **PASS** (Kompilasi Next.js 16 Turbopack sukses, seluruh 42 rute statis & server berhasil dibuat).

- **Gate:** **PASS** (Tahap 2: Pendampingan Aktif telah selesai diimplementasikan, teruji bebas error, dan siap digunakan).

---

### 2026-10-24 — Perbaikan Kritis: Masalah Petak Terkunci / Langkah Tidak Bisa Diklik pada Papan Catur

- **Gejala / Masalah yang Dilaporkan:**
  Pengguna melaporkan bahwa saat mengikuti instruksi Guru AI (misalnya pion Putih `d4` memakan pion Hitam di `e5`), bidak pada petak `e5` tidak bisa diklik / dimakan sama sekali seolah-olah "terkunci". Pengguna juga mencatat bahwa dalam permainan sebelumnya, hal serupa sering terjadi dan terasa seperti tidak diberi kebebasan melangkah.

- **Investigasi Akar Masalah (*Root Cause Analysis*):**
  1. Pada `src/components/chessboard/InteractiveChessboard.tsx`, penanda visual langkah terakhir lawan (`isLastMoveSquare`) sebelumnya menambahkan kelas styling:
     `after:absolute after:inset-0 after:bg-[rgba(220,175,50,0.42)] pointer-events-none` langsung ke atribut `className` dari elemen pembungkus petak (`div` utama petak papan catur).
  2. Tailwind CSS mengompilasi `pointer-events-none` langsung pada elemen petak itu sendiri, bukan pada pseudo-elemen `::after`.
  3. Akibatnya, pada setiap giliran catur, kedua petak yang terlibat dalam langkah terakhir lawan (`lastMove.from` dan `lastMove.to`) secara fisik kehilangan kemampuan menerima interaksi pointer (*click*, *touch*, *dragover*, *drop*).
  4. Setiap kali lawan menggerakkan bidak (misalnya Hitam memainkan `8... fxe5`), petak `e5` (dan `f6`) langsung menjadi tidak bisa diklik. Akibatnya pemain tidak bisa memakan kembali (*recapture*) bidak lawan di `e5`, dan tidak bisa melangkah ke petak asal `f6`.

- **Solusi & Perbaikan:**
  1. Menghilangkan kelas `pointer-events-none` dan `after:...` dari container utama petak catur pada `InteractiveChessboard.tsx`.
  2. Memindahkan penyorot langkah terakhir (`isLastMoveSquare && !isSelected`) menjadi elemen anak terpisah (`<div className="absolute inset-0 bg-[rgba(220,175,50,0.40)] pointer-events-none z-5" />`). Dengan demikian petak catur induk selalu 100% aktif dan dapat diklik/diseret tanpa halangan.
  3. Menambahkan unit test komprehensif pada `src/components/chessboard/InteractiveChessboard.test.tsx` untuk menguji klik pada petak target pemakanan `lastMove.to`, petak asal `lastMove.from`, klik langsung pada SVG bidak lawan, serta aksi drag-and-drop.
  4. Menambahkan test case pada `src/features/copilot/blunder-detector.test.ts` untuk memastikan langkah `d4xe5` pada posisi tersebut dinilai aman oleh Co-Pilot.

- **Hasil Pemeriksaan Teknis:**
  - `npm test` -> **PASS** (21 test suites, **128 tests lulus 100%**).
  - `npm run typecheck` -> **PASS** (`tsc --noEmit` 0 errors).
  - `npm run lint` -> **PASS** (0 errors, 0 warnings).
  - `npm run build` -> **PASS** (Kompilasi Next.js 16 sukses).

- **Gate:** **PASS** (Bug petak terkunci telah diperbaiki tuntas, pemain kini memiliki kebebasan penuh mengeksekusi semua langkah legal).

---

### 2026-10-24 — Penyempurnaan UX Pedagogis: Menghilangkan Pop-up Modal yang Menutupi Papan Catur

- **Prinsip Utama:**
  Pemain (khususnya pemula) harus selalu dapat melihat papan catur secara utuh saat mendengarkan narasi suara AI maupun membaca analisis dan petunjuk berpikir. Fitur bimbingan tidak boleh menutupi papan dengan lapisan gelap (*backdrop modal*), agar pemain tidak dipaksa mengingat-ingat letak bidak secara abstrak.

- **Perubahan yang Diterapkan:**
  1. **Migrasi `PlayTutorModal` ke Panel Samping Tersemat (*Docked Side Panel*):**
     - Mengubah komponen dari pembungkus `Modal` (yang sebelumnya menggunakan `fixed inset-0 bg-black/75` di tengah layar) menjadi kartu pendamping tersemat di panel kanan layar (`src/features/tutor/components/PlayTutorModal.tsx`).
     - Menyediakan tombol tutup `✕` dan tombol "Tutup Penjelasan & Lanjut Main" yang langsung menghentikan suara audio Aoede (`tutorSpeech.stop()`).
     - Mengaitkan penyorotan langkah interaktif (`onHighlightMove`) agar saat pemain memilih langkah kandidat, petak sasaran langsung menyala berdenyut di papan catur di sebelah kiri.
  2. **Migrasi `SocraticHintModal` ke Panel Samping Tersemat:**
     - Mengubah dialog petunjuk Sokrates 3 tingkat (`src/features/copilot/components/SocraticHintModal.tsx`) menjadi kartu tersemat non-modal.
     - Pemain kini dapat mengklik Tingkat 1 (Observasi), Tingkat 2 (Bidak Kunci), dan Tingkat 3 (Solusi Lengkap) sambil **melihat perwira kunci dan petak tujuan yang menyala di papan secara langsung tanpa terhalang apa pun**.
  3. **Migrasi `BlunderInterceptModal` ke Peringatan Bahaya Non-Modal:**
     - Mengubah intersep blunder fatal (`src/features/copilot/components/BlunderInterceptModal.tsx`) menjadi kartu peringatan darurat beraksen merah/oranye di panel samping.
     - Petak bidak yang terancam gantung (`hangingSquare`) otomatis disorot di papan catur tanpa menutupi papan dengan lapisan modal.
  4. **Penyematan Sticky Papan Desktop (`lg:sticky lg:top-4`):**
     - Kolom papan catur diatur terpancang (*sticky*) sehingga jika pengguna menggulir teks penjelasan panjang di panel kanan, papan catur di sebelah kiri selalu berada tepat di depan mata pemain.
     - Pada perangkat seluler (*mobile*), papan berada di bagian atas dan kartu bimbingan tepat di bawahnya tanpa ada pop-up penutup.

- **Hasil Pemeriksaan Teknis:**
  - `npm run lint` -> **PASS** (0 errors, 0 warnings).
  - `npm run typecheck` -> **PASS** (`tsc --noEmit` 0 errors).
  - `npm test` -> **PASS** (21 test suites, **128 tests lulus 100%**).
  - `npm run build` -> **PASS** (Kompilasi Next.js 16 Turbopack sukses, seluruh 42 rute statis & server berhasil dibuat).

- **Gate:** **PASS** (Papan catur kini selalu 100% terlihat tanpa terhalang pop-up pada seluruh fitur bimbingan AI).

---

### 2026-10-24 — Penataan Layout Ramping: Kotak Bot Sejajar Kacamata Catur & Panel Kanan Sejajar Papan

- **Tujuan Permintaan Pengguna:**
  Menghilangkan kotak lawan (*Opponent Info Bar*) yang sebelumnya tebal dan berada di atas papan catur, memindahkannya menjadi pill ramping di bilah atas papan berseberangan dengan tombol "Kacamata Catur", serta meratakan garis atas (*align top*) panel kanan dengan bagian atas papan catur agar pemain tidak perlu melakukan *scrolling* dan dapat fokus bolak-balik antara petunjuk dan papan catur secara nyaman.

- **Perubahan yang Diterapkan:**
  1. **Slot Kanan Atas Bilah Papan (`topRightSlot` pada `InteractiveChessboard.tsx`):**
     - Menambahkan prop `topRightSlot?: React.ReactNode` pada `InteractiveChessboardProps`.
     - Mengubah kontainer bilah atas utilitas papan menjadi satu baris kompak (`min-h-[34px]`) dengan `items-center justify-between`:
       - Sisi Kiri: Tombol "Kacamata Catur [OFF/ON]" + Tombol "Panduan".
       - Sisi Kanan: Pill tipis informasi Bot & Jam catur (`topRightSlot`).
  2. **Pill Bot Tipis Berseberangan dengan Kacamata Catur (`PlayPage.tsx`):**
     - Menghapus kotak lawan (*Opponent Info Bar*) yang sebelumnya setinggi ~60px di atas papan catur.
     - Menggantinya dengan pill tipis bergaya identik dengan Kacamata Catur (`px-2.5 py-1 rounded-lg text-xs font-medium border bg-[#1C2024] border-[#353B42]`): menampilkan ikon bot mini, nama level bot ("Bot (Santai)"), titik indikator status (hijau / kuning berkedip saat bot berpikir), dan jam catur lawan (jika bermain dengan jam).
  3. **Penyelarasan Presisi Garis Atas Panel Kanan (`lg:pt-[42px]`):**
     - Bilah tipis utilitas papan di kolom kiri memiliki tinggi 34px + 8px margin bawah = 42px sebelum papan catur 8x8 dimulai.
     - Kolom kanan panel samping diberi padding atas `pt-0 lg:pt-[42px]` sehingga garis batas atas kartu petunjuk di panel kanan berada tepat sejajar horizontal pada piksel yang sama dengan garis batas atas papan catur.
     - Pemain tidak perlu menggulir (*zero scroll*), mata pemain bergerak secara natural horizontal dari papan ke petunjuk.
  4. **Penyusutan Bar Pemain Bawah (`Player Info Bar`):**
     - Memperamping padding dari `py-2.5` ke `py-1.5` dan avatar dari `w-8` ke `w-6` untuk menghemat ruang vertikal tambahan.

- **Hasil Pemeriksaan Teknis:**
  - `npm run lint` -> **PASS** (0 errors, 0 warnings).
  - `npm run typecheck` -> **PASS** (`tsc --noEmit` 0 errors).
  - `npm test` -> **PASS** (21 test suites, **128 tests lulus 100%**).
  - `npm run build` -> **PASS** (Kompilasi Next.js 16 Turbopack sukses, seluruh 42 rute statis & server berhasil dibuat).

- **Gate:** **PASS** (Layout arena catur kini ramping, sejajar presisi, dan bebas scroll).

---

### 2026-10-24 — Petunjuk Sokrates Real-Time & Tipografi Bersih Bebas Tanda Bintang

- **Tujuan Permintaan Pengguna:**
  1. **Petunjuk Sokrates Bertingkat Real-Time:** Menjadikan petunjuk bertingkat sebagai pendamping langsung (*real-time companion*). Begitu pemain menjalankan langkah yang diinstruksikan dan bot membalas langkah tersebut, petunjuk otomatis menyesuaikan ke langkah selanjutnya secara real-time tanpa mengharuskan pemain menutup lalu membuka panel kembali.
  2. **Tipografi Bersih Tanpa Bintang Markdown:** Menghilangkan tanda bintang ganda (`**`) atau backtick (`` ` ``) pada teks petunjuk seperti `**Kuda** dari **B1** ke **C3**` agar format teks rapi, bersih, dan ramah pemula.

- **Perubahan yang Diterapkan:**
  1. **Pembersihan Teks Generator (`src/features/copilot/socratic-engine.ts`):**
     - Menghilangkan semua format raw markdown asterisks (`**`) dan backticks (`` ` ``) pada pembuatan string `tier2Clue` dan `tier3Clue`.
     - Teks kini dihasilkan dalam Bahasa Indonesia alami: misal `Langkahkan Kuda dari B1 ke C3 (Nc3)`.
  2. **Sanitasi Tipografi & Status Transisi Real-Time (`src/features/copilot/components/SocraticHintModal.tsx`):**
     - Menyediakan fungsi sanitasi `cleanClue(text)` yang secara otomatis membuang sisa tanda `**` atau backtick.
     - Menerima prop `isBotThinking?: boolean` dan `isLoadingNewHint?: boolean`.
     - Saat bot sedang merespons langkah pemain, kartu di panel samping menampilkan status transisi yang elegan dan menenangkan: *"Bot sedang merespons langkahmu... Papan catur diperbarui. Petunjuk langkah berikutnya akan otomatis muncul begitu giliranmu tiba."*
     - Begitu petunjuk posisi baru tiba (`hint.fen !== prevHintFen`), kartu otomatis mereset tingkat ke Tingkat 1 (Observasi) untuk langkah selanjutnya.
  3. **Manajemen Siklus Hidup Pendamping di Game Hook (`src/features/game/use-chess-game.ts`):**
     - Menambahkan state `isSocraticActive`, ref `isSocraticActiveRef`, dan `currentHintRequestIdRef`.
     - Mengimplementasikan `fetchSocraticHintForFen(targetFen)` yang asinkron dan tahan uji: jika mesin mengembalikan langkah di luar giliran atau tidak legal, sistem secara defensif memilih langkah legal pertama pemain.
     - Pada `triggerBotMove`: saat bot selesai melangkah, jika `isSocraticActiveRef.current && !c.isGameOver()`, sistem secara otomatis memanggil `fetchSocraticHintForFen(newFen)` untuk giliran berikutnya.
     - Pada `applyPlayerMove`: saat pemain melangkah, in-flight hint di-cancel dan `currentHint` disetel `null` sementara bot merespons.
     - Pada `undoMove`: petunjuk otomatis disegarkan kembali ke posisi yang dipulihkan.
     - Pada `clearHint` (saat pemain menekan tombol Tutup `✕`): `isSocraticActive` disetel `false`, bimbingan berhenti dengan rapi.
     - Mengekspor `isSocraticActive` dalam return hook.
  4. **Penyambungan Layar Bermain (`src/app/play/page.tsx`):**
     - Menghubungkan `isSocraticActive` dari `useChessGame` ke `SocraticHintModal`.
     - Panel Sokrates tetap aktif di panel samping selama mode bimbingan diaktifkan (`isOpen={isSocraticActive || Boolean(currentHint)}`).
     - Kartu Co-Pilot standar otomatis disembunyikan saat pendamping Sokrates sedang aktif, dan kembali secara mulus saat pendamping ditutup.
  5. **Pengujian Unit & Pencegahan Regresi:**
     - `tests/unit/copilot.test.ts`: Pengujian baru memastikan seluruh tingkat petunjuk Sokrates bebas dari tanda `**` dan backticks.
     - `tests/unit/interactive-game.test.tsx`: Pengujian siklus hidup real-time memastikan petunjuk otomatis terbarui saat pemain melangkah dan bot membalas.

- **Hasil Pemeriksaan Teknis:**
  - `npm run lint` -> **PASS** (0 errors, 0 warnings).
  - `npm run typecheck` -> **PASS** (`tsc --noEmit` 0 errors).
  - `npm test` -> **PASS** (21 test suites, **130 tests lulus 100%**).
  - `npm run build` -> **PASS** (Kompilasi Next.js 16 Turbopack sukses, seluruh 42 rute statis & dynamic berhasil dibuat).

- **Gate:** **PASS** (Petunjuk Sokrates kini aktif real-time tanpa perlu buka-tutup, dan teks bersih rapi tanpa bintang).

---

### 2026-10-24 — Retensi Tingkat Petunjuk Sokrates Pilihan Pemain (Tier Persistence Across Moves)

- **Tujuan Permintaan Pengguna:**
  Saat pemain memilih Nomor 2 (Bidak Kunci) atau Nomor 3 (Solusi Lengkap), dan kemudian menjalankan bidak catur di papan, tingkat petunjuk tidak boleh kembali/reset ke Nomor 1 (Observasi). Jika pemain memilih Nomor 3, bimbingan harus tetap di Nomor 3 pada langkah-langkah berikutnya; jika memilih Nomor 2, tetap di Nomor 2.

- **Penyebab:**
  Pada implementasi sebelumnya di `SocraticHintModal.tsx`, terdapat sinkronisasi FEN:
  `if (hint && hint.fen !== prevHintFen) { setPrevHintFen(hint.fen); setCurrentTier(1); }`
  Kode tersebut mereset `currentTier` kembali ke `1` secara paksa setiap kali giliran baru tiba.

- **Perubahan yang Diterapkan:**
  1. **Retensi Tingkat Pilihan (`src/features/copilot/components/SocraticHintModal.tsx`):**
     - Menghapus pemanggilan `setCurrentTier(1)` saat FEN baru tiba, sehingga `currentTier` (1, 2, atau 3) yang aktif dipilih pemain dipertahankan terus untuk langkah-langkah berikutnya.
     - Membersihkan visual tab 1, 2, dan 3 agar semuanya langsung dapat diklik kapan saja tanpa penurunan *opacity*.
     - Jika pemain memilih Tingkat 3, kartu menampilkan badge status *"Solusi Aktif Real-Time"* dan langsung menyajikan langkah solusi lengkap beserta sorotan petak tujuan di setiap giliran baru.
     - Jika pemain memilih Tingkat 2, petak bidak kunci langsung menyala di papan pada setiap giliran baru.
     - Menjamin petak sorotan dibersihkan secara aman saat bot sedang berpikir (`isBotThinking`).
  2. **Pengujian Unit Tambahan (`tests/unit/socratic-hint-modal.test.tsx`):**
     - Memverifikasi retensi Tingkat 3 saat petunjuk FEN baru tiba.
     - Memverifikasi retensi Tingkat 2 saat petunjuk FEN baru tiba.
     - Memverifikasi pembaruan highlight papan yang sesuai pada masing-masing tingkat.
     - Memverifikasi status transisi dan pembersihan highlight saat bot berpikir.
     - Total pengujian meningkat menjadi **136 tests lulus 100%**.

- **Hasil Pemeriksaan Teknis:**
  - `npm run lint` -> **PASS** (0 errors, 0 warnings).
  - `npm run typecheck` -> **PASS** (`tsc --noEmit` 0 errors).
  - `npm test` -> **PASS** (22 test suites, **136 tests lulus 100%**).
  - `npm run build` -> **PASS** (Kompilasi Next.js 16 Turbopack sukses, seluruh 42 rute statis & server berhasil dibuat).

- **Gate:** **PASS** (Tingkat petunjuk pilihan pemain kini konsisten dipertahankan pada setiap langkah).

---

### 2026-10-24 — Pop-up Modal Keberhasilan Langkah Akademi (Zero-Scroll Learning Flow)

- **Tujuan Permintaan Pengguna:**
  Pada modul Belajar (Akademi), saat pemain selesai melakukan gerakan sesuai arahan pada setiap tantangan materi, hapus kotak hijau yang sebelumnya berada di bawah kartu instruksi dan gantikan dengan **pop-up modal interaktif** tepat di tengah layar. Di dalam pop-up tersebut disajikan penjelasan keberhasilan dan tombol *"Lanjut ke Tantangan Berikutnya"*, sehingga pemain langsung paham dan tidak perlu melakukan *scrolling* ke bawah sama sekali—sangat ramah untuk pemula yang baru pertama kali menggunakan komputer atau membuka situs catur.

- **Perubahan yang Diterapkan:**
  1. **Integrasi Pop-up Modal Keberhasilan (`src/features/academy/InteractiveLessonBoard.tsx`):**
     - Mengganti banner hijau statis di bawah papan dengan dialog `Modal` terpusat yang otomatis muncul begitu petak sasaran atau langkah catur yang diharapkan berhasil dilakukan.
     - Pop-up modal menampilkan:
       - Header jelas: *"Langkah Benar!"* beserta nomor progres tantangan (contoh: *Tantangan 1 dari 3 Berhasil Diselesaikan*).
       - Penjelasan edukatif mengapa langkah tersebut tepat (`explanationOnSuccess`).
       - Tombol aksi primer terfokus otomatis (`autoFocus`): *"Lanjut ke Tantangan Berikutnya"* (atau *"Selesaikan Pelajaran Ini"* pada langkah terakhir). Pengguna keyboard di PC cukup menekan `Enter` atau `Space` untuk langsung melanjutkan.
       - Tombol sekunder: *"Ulangi Tantangan"* bagi pemain yang ingin berlatih kembali.
     - Jika pemain menutup pop-up modal untuk mengamati papan, disediakan bar tipis minimal sebagai penanda bahwa tantangan telah selesai dan dapat dilanjutkan kapan saja.
  2. **Pengujian Unit Komprehensif (`tests/unit/interactive-lesson-board.test.tsx`):**
     - Memverifikasi bahwa modal pop-up tidak aktif di awal.
     - Memverifikasi bahwa pop-up muncul secara otomatis begitu petak target (`e4`) diklik.
     - Memverifikasi navigasi ke tantangan berikutnya dan penutupan modal.
     - Memverifikasi penyelesaian seluruh pelajaran (`onLessonComplete`) saat langkah terakhir dikonfirmasi.
     - Total pengujian lulus meningkat menjadi **140 tests (23 test suites)**.

- **Hasil Pemeriksaan Teknis:**
  - `npm run lint` -> **PASS** (0 errors, 0 warnings).
  - `npm run typecheck` -> **PASS** (`tsc --noEmit` 0 errors).
  - `npm test` -> **PASS** (23 test suites, **140 tests lulus 100%**).
  - `npm run build` -> **PASS** (Kompilasi Next.js 16 Turbopack sukses untuk seluruh 42 rute).

- **Gate:** **PASS** (Alur belajar kini zero-scroll dan otomatis memandu pemula lewat pop-up yang jelas).

---

### 2026-10-24 — Sinkronisasi 100% Real-Time Tantangan Papan & Panel Guru Catur (Academy Step Sync)

- **Tujuan Permintaan Pengguna:**
  Saat pemain berada di Tantangan 3 dari 3 (*"Tunjukkan Sudut Kanan Bawah Putih (h1)"*), panel samping Guru Catur AI sebelumnya masih tertahan di instruksi langkah pertama (*"Tunjukkan Petak Pusat e4"*). Pengguna menuntut **100% sinkronisasi real-time di seluruh bagian website**: apa pun yang aktif di papan catur harus langsung tercermin secara instan di panel panduan, teks ringkasan, maupun pemutar suara tanpa keterlambatan atau data basi.

- **Penyebab:**
  Komponen `LessonViewClient.tsx` sebelumnya meng-hardcode indeks langkah pertama (`lesson.steps[0]`) saat mengoper data `requestContext` ke `TutorPanel`. Komponen papan `InteractiveLessonBoard` juga sebelumnya mengelola indeks langkahnya secara internal tanpa mengirimkan pembaruan langkah kembali ke parent. Akibatnya, saat papan berpindah ke tantangan nomor 2 dan 3, panel samping tetap terkunci di langkah nomor 1.

- **Perubahan yang Diterapkan:**
  1. **Two-Way Real-Time State Binding (`src/features/academy/InteractiveLessonBoard.tsx`):**
     - Menambahkan prop `currentStepIndex?: number` dan `onStepChange?: (stepIndex: number) => void`.
     - Saat pemain mengonfirmasi kelanjutan langkah (`handleNextStep`), fungsi `setCurrentStepIdx` langsung memberitahukan `onStepChange(nextIdx)` ke parent.
  2. **Sinkronisasi Total Panel Samping (`src/features/academy/LessonViewClient.tsx`):**
     - State `currentStepIdx` dikelola di level parent dan diturunkan ke `InteractiveLessonBoard`.
     - Panel samping `TutorPanel` kini dipasang dengan kunci unik reaktif `key={`${lesson.id}-${currentStep.id}`}` dan `requestContext` yang sepenuhnya dinamis:
       - FEN papan aktif: `currentStep.fen`
       - Instruksi materi aktif: `currentStep.instruction` (misal: *"Tunjukkan Sudut Kanan Bawah Putih (h1)"*)
     - Setiap kali tantangan berpindah, audio suara lama dihentikan seketika (`tutorSpeech.stop()`) dan penjelasan baru langsung siap diputar untuk langkah yang sedang aktif.
     - Penyelarasan siklus hidup: `<LessonViewClient key={lesson.id} ... />` di `src/app/academy/[lessonId]/page.tsx` memastikan perpindahan antar pelajaran mereset tantangan ke nomor 1 secara konsisten tanpa efek samping *cascading render*.
  3. **Pengujian Integrasi Komprehensif (`tests/unit/academy-view-client.test.tsx`):**
     - Memverifikasi bahwa ketika tantangan di papan bergerak dari langkah 1 (e4) ke langkah 2 (d5) lalu ke langkah 3 (h1), judul dan ringkasan `TutorPanel` di panel samping langsung berganti secara real-time menjadi *"Tunjukkan Sudut Kanan Bawah Putih (h1)"*.
     - Memverifikasi teks lama e4 tidak lagi muncul di panel saat langkah 3 aktif.
     - Total pengujian lulus: **142 tests (24 test suites)**.

- **Hasil Pemeriksaan Teknis:**
  - `npm run lint` -> **PASS** (0 errors, 0 warnings).
  - `npm run typecheck` -> **PASS** (`tsc --noEmit` 0 errors).
  - `npm test` -> **PASS** (24 test suites, **142 tests lulus 100%**).
  - `npm run build` -> **PASS** (Kompilasi Next.js 16 Turbopack sukses untuk seluruh 42 rute).

- **Gate:** **PASS** (Papan catur dan seluruh panel pendamping kini 100% tersinkronisasi secara real-time).

---

### Perbaikan Sistem Audio Guru AI: Eliminasi Suara Ganda & Pencegahan Tabrakan Audio (Race Condition)

- **Masalah yang Dilaporkan Pengguna:**
  1. Suara ganda / tumpang tindih (*overlapping*) untuk penjelasan yang sama: suara pria (Web Speech API) berbunyi terlebih dahulu lalu disusul oleh suara wanita (Gemini Aoede).
  2. Tabrakan audio saat melangkah cepat: ketika audio penjelasan langkah lama masih dimuat (*loading*), pemain menyelesaikan misi dan menekan tombol langkah berikutnya; permintaan audio lama yang baru saja selesai tetap berbunyi dan menimpa audio langkah yang baru.

- **Analisis Akar Masalah (Root Cause):**
  1. **Kesalahan Penanganan Abort pada Fallback Suara:** Pada implementasi sebelumnya di `speech-controller.ts`, ketika suatu permintaan `speak()` atau `stop()` membatalkan `fetch("/api/tutor/speech")`, blok `catch (err)` menangkap exception `AbortError` dan secara keliru mengeksekusi `fallbackToWebSpeech(trimmed)`. Hal ini memicu pemutar lokal peramban Windows (`Microsoft David` - suara pria) untuk mulai berbicara. Ketika permintaan suara berikutnya (atau cache) selesai, pemutar audio elemen menyetel suara wanita (`Aoede`), sehingga kedua suara berbunyi bersamaan.
  2. **Ketiadaan Token Generasi & Pembatalan Jaringan:** Kelas `SpeechController` belum menggunakan `AbortController` terpadu dan `currentRequestId`. Setiap fetch yang tertunda di latar belakang tidak dapat dibatalkan ketika pemain menekan tombol langkah berikutnya. Saat data audio langkah lama selesai diunduh beberapa ratus milidetik kemudian, ia langsung memanggil `.play()` dan menimpa langkah baru.
  3. **Inkonsistensi Nilai Default Suara:** Terdapat *fallback* `"Puck"` (suara pria Gemini) di `tutor-preferences.ts` dan `TutorAudioPlayer.tsx`, bertabrakan dengan default sistem `"Aoede"` (suara wanita).
  4. **Ketiadaan Mutex antara Elemen Audio dan Web Speech:** Pemutaran berkas audio blob tidak secara eksplisit menghentikan `speechSynthesis.cancel()`, dan `fallbackToWebSpeech` tidak menghentikan `audio.pause()`.

- **Perubahan yang Diterapkan:**
  1. **Siklus Hidup Audio & Pembatalan Terpadu (`src/features/tutor/speech-controller.ts`):**
     - Memperkenalkan `currentRequestId: number` dan `currentAbortController: AbortController | null`.
     - Setiap pemanggilan `speak()` atau `stop()` menaikkan nomor generasi `currentRequestId++` dan langsung memanggil `abort()` pada fetch yang sedang berlangsung.
     - Menambahkan fungsi pembungkaman total `silenceAllAudio()` yang menjamin `window.speechSynthesis.cancel()` dan `this.audio.pause()` dieksekusi bersamaan tanpa celah.
     - Pemeriksaan keamanan ketat: jika exception adalah `AbortError` atau jika token permintaan telah usang (`requestId !== this.currentRequestId`), proses diabaikan seketika dan **tidak akan pernah** memicu fallback Web Speech.
  2. **Deduplikasi Autoplay & Cleanup Unmount (`src/features/tutor/components/TutorAudioPlayer.tsx`):**
     - Menggunakan `useRef` untuk melacak `lastSpokenTextRef`, mencegah pemicuan berulang ketika preferensi berubah.
     - Menambahkan unmount cleanup `useEffect(() => () => tutorSpeech.stop(), [])` sehingga setiap navigasi langkah langsung menghentikan audio yang aktif.
     - Standarisasi nilai default suara ke `"Aoede"` secara seragam.
  3. **Penyelarasan Siklus Langkah Belajar (`InteractiveLessonBoard.tsx` & `LessonViewClient.tsx`):**
     - Menghentikan suara seketika (`tutorSpeech.stop()`) saat modal keberhasilan muncul, saat tombol *"Lanjut ke Tantangan Berikutnya"* ditekan, saat tombol *"Ulangi"* ditekan, dan saat berpindah tab.
     - Memoisasi `tutorRequestContext` untuk mencegah re-render yang tidak diinginkan pada `TutorPanel`.
  4. **Penambahan Unit Test Terverifikasi (`tests/unit/speech-controller.test.ts`):**
     - Pengujian pembatalan fetch in-flight saat `stop()` dipanggil tanpa memicu fallback lokal.
     - Pengujian balapan permintaan cepat (langkah 1 disusul langkah 2) yang memverifikasi hanya suara langkah terbaru yang diputar.
     - Total pengujian lulus: **144 tests (24 test suites)**.

- **Hasil Pemeriksaan Teknis:**
  - `npm run lint` -> **PASS** (0 errors, 0 warnings).
  - `npm run typecheck` -> **PASS** (`tsc --noEmit` 0 errors).
  - `npm test` -> **PASS** (24 test suites, **144 tests lulus 100%**).
  - `npm run build` -> **PASS** (Kompilasi Next.js 16 Turbopack sukses untuk 42 rute).

- **Gate:** **PASS** (Audio AI kini 100% monolitik, bebas tumpang tindih, dan langsung berhenti saat melangkah cepat).

---

### Implementasi Fitur: Ide 2 — "Mode Garis Radar Panah Bidak" (Ghost Aim Arrows on Click)

- **Latar Belakang & Kebutuhan Pengguna:**
  Pemula sering mengalami kesulitan menghafal pola jangkauan perwira (seperti gerakan 'L' pada Kuda, jangkauan diagonal Gajah, atau lajur serang Benteng). Diperlukan fitur visual elegan yang intuitif (*zero cognitive load*) di mana saat sebuah bidak diklik, muncul garis panah lintasan semi-transparan yang memperlihatkan ke mana saja perwira tersebut bisa menjangkau dan petak mana yang sedang ia incar/bisa ditangkap.

- **Perubahan yang Diterapkan:**
  1. **Modul Logika & State Radar Panah (`src/features/chessboard/radar-arrows.ts`):**
     - Fungsi `computeRadarArrows(chess, selectedSquare, legalDestinations)`:
       - Memetakan setiap petak tujuan legal menjadi struktur data `RadarArrow`.
       - Mendeteksi penangkapan perwira lawan (*capture*) vs petak kosong aman (*safe destination*), termasuk aturan khusus *en passant*.
       - Mengidentifikasi bidak Kuda (`isKnight`) untuk perlakuan lintasan kurva trajektori 'L'.
     - Manajemen preferensi tersimpan di `localStorage` (`chess_archive_radar_arrows_v1`) dengan event listener sinkronisasi SSR & multi-komponen (`useSyncExternalStore`), aktif secara default (*ON*).
  2. **Lapisan Visual SVG Polished (`src/components/chessboard/RadarArrowsOverlay.tsx`):**
     - Kanvas SVG resolusi tinggi (`viewBox="0 0 800 800"`) dengan atribut `pointer-events-none` agar tidak mengganggu klik petak atau drag-and-drop bidak.
     - Lintasan lurus/diagonal presisi untuk Pion, Benteng, Gajah, Menteri, dan Raja dengan jarak penyesuaian tepi (*offset*) agar tidak menutupi ikon bidak.
     - Lintasan kurva berbentuk 'L' halus (*smooth bezier elbow turn*) khusus perwira Kuda, memvisualisasikan aturan klasik "2 petak lurus lalu 1 petak belok".
     - Pembedaan warna taktil ramah Dark Graphite Archive:
       - **Langkah Aman (Petak Kosong)**: Garis hijau emerald lembut (`#73B894`) dengan panah arah (`marker-end`).
       - **Langkah Menangkap (Bidak Lawan)**: Garis ruby red (`#E17C78`) tebal dengan retikel sasaran putus-putus (*dashed target ring*).
       - Titik pusat lingkaran aksen emas di petak asal bidak yang dipilih.
  3. **Integrasi Papan Catur & Pengaturan (`src/components/chessboard/InteractiveChessboard.tsx` & `src/app/settings/page.tsx`):**
     - Menambahkan tombol kontrol cepat *"Radar Panah (ON/OFF)"* berdampingan dengan *"Kacamata Catur"* di bilah alat utilitas atas papan catur.
     - Menyediakan toggle preferensi pengguna di halaman Pengaturan (`/settings`) pada bagian *Preferensi Papan Catur*.
  4. **Pengujian Unit & Komponen Komprehensif:**
     - `tests/unit/radar-arrows.test.ts` (7 tests): Memverifikasi kalkulasi panah langkah pion, jangkauan Kuda 'L', penangkapan bidak lawan, penangkapan en passant, dan persistensi preferensi.
     - `src/components/chessboard/InteractiveChessboard.test.tsx` (6 tests): Memverifikasi render tombol toggle Radar Panah, interaksi klik ON/OFF, serta keberadaan elemen SVG overlay panah radar dengan `pointer-events-none`.
     - Total pengujian lulus: **153 tests (25 test suites)**.

- **Hasil Pemeriksaan Teknis:**
  - `npm run lint` -> **PASS** (0 errors, 0 warnings).
  - `npm run typecheck` -> **PASS** (`tsc --noEmit` 0 errors).
  - `npm test` -> **PASS** (25 test suites, **153 tests lulus 100%**).
  - `npm run build` -> **PASS** (Kompilasi Next.js 16 Turbopack sukses untuk 42 rute).

- **Gate:** **PASS** (Fitur Radar Panah Bidak aktif sempurna tanpa merusak fitur papan catur, kacamata catur, atau interaksi lainnya).

- **Langkah berikutnya:** Tahap 3: Evaluasi & Perbaikan Diri (*Storytelling Game Review & Play from Turning Point*).

---

### Implementasi Fitur: Ide 3 — "Putar Ulang dari Titik Balik Kesalahan" (Play from Turning Point)

- **Latar Belakang & Kebutuhan Pengguna:**
  Sesuai dengan Roadmap Tahap 3 (*Storytelling Game Review & Play from Turning Point*), saat permainan berakhir (terutama saat pemain kalah karena blunder atau membiarkan skakmat), pemula sering kali tidak mengetahui di mana letak kesalahan fatalnya dan ingin mencoba kembali dari posisi sesaat sebelum kesalahan itu terjadi tanpa harus mengulang seluruh pertandingan dari awal. Fitur ini juga mendukung skenario kemenangan untuk merayakan langkah kunci yang membalikkan keadaan.

- **Perubahan yang Diterapkan:**
  1. **Tipe Data & Deteksi Titik Balik (`src/features/autopsy/types.ts` & `src/features/autopsy/turning-point.ts`):**
     - Membangun algoritma `findGameTurningPoint(moves, playerColor, initialFen, isVictory)` yang menganalisis seluruh ply pertandingan:
       - Memanfaatkan `evaluateMoveSafety` untuk mengidentifikasi langkah pemain yang berstatus fatal (membiarkan skakmat atau menggantung Menteri/Benteng tanpa kompensasi).
       - Menghitung skor keparahan blunder (*fatal*, *blunder*, *inaccuracy*, *victory_turning_point*).
       - Secara otomatis mencari langkah legal alternatif yang aman (`suggestedAlternativeSan`).
       - Memulihkan dan memvalidasi `fenBefore` (keadaan papan 1 langkah sebelum titik balik dieksekusi).
     - Menyiapkan mekanisme persistensi `sessionStorage` aman (`saveTurningPointReplay`, `getPendingTurningPointReplay`, `clearPendingTurningPointReplay`) untuk transfer data posisi antara halaman arsip dan papan permainan.
  2. **Komponen Visual Narasi Editorial (`src/features/autopsy/components/TurningPointCard.tsx`):**
     - Kartu panduan minimalis bertema Dark Graphite yang terintegrasi di panel samping tanpa menutupi papan catur.
     - Menyajikan badge status taktis, judul langkah kunci, penjelasan bahasa Indonesia yang ramah pemula, perbandingan langkah yang dimainkan vs rekomendasi langkah aman.
     - Menyediakan tombol aksi utama *"Coba Lagi dari Titik Ini"* dengan ikon putar balik (`RotateCcw`).
     - Pada layar arsip (`/archive/[gameId]`), dilengkapi tombol *"Lihat Posisi"* (`Eye`) untuk langsung melompat ke ply tersebut di papan tayang ulang.
  3. **Kemampuan Rewind Interaktif Mesin Catur (`src/features/game/use-chess-game.ts`):**
     - Menambahkan fungsi `playFromPosition(fenToPlay, historyPrefix, customPlayerColor)`:
       - Menginisialisasi ulang instansi catur dengan FEN titik balik secara aman.
       - Memulihkan riwayat langkah sebelumnya (`historyPrefix`) sehingga notasi catur tetap utuh.
       - Mereset status permainan kembali ke `ongoing`, membersihkan status checkmate/resigned, dan menyinkronkan jam/giliran.
       - Jika posisi yang dipulihkan adalah giliran bot, langsung memicu bot untuk melangkah.
       - Memperbarui petunjuk Sokrates secara real-time pada posisi yang baru dipulihkan.
  4. **Integrasi Halaman Permainan & Arsip (`src/app/play/page.tsx` & `src/app/archive/[gameId]/page.tsx`):**
     - Pada `/play`: Menghitung `turningPoint` secara memoized saat status permainan selesai, menampilkan `TurningPointCard` di atas kontrol reset/analisis, dan otomatis mengeksekusi replay jika terdapat parameter tersimpan dari arsip.
     - Pada `/archive/[gameId]`: Menampilkan `TurningPointCard` di panel riwayat ulasan, memungkinkan pengguna meninjau posisi di papan arsip atau mengklik *"Coba Lagi dari Titik Ini"* untuk diarahkan langsung ke `/play` dengan posisi dan riwayat yang tersinkronisasi.
  5. **Pengujian Komprehensif (Unit & Integration):**
     - `tests/unit/turning-point.test.ts` (4 tests): Memverifikasi deteksi blunder Scholar's Mate, deteksi kemenangan Fool's Mate, fallback langkah krusial, dan persistensi `sessionStorage`.
     - `tests/unit/turning-point-ui.test.tsx` (3 tests): Memverifikasi render kartu titik balik, penekanan tombol *"Coba Lagi dari Titik Ini"*, dan aksi *"Lihat Posisi"* di mode arsip.
     - `tests/unit/interactive-game.test.tsx` (pembaruan): Memverifikasi eksekusi `playFromPosition` dari game resigned kembali menjadi `ongoing` dengan FEN dan riwayat langkah yang tepat.
     - Total pengujian lulus: **161 tests (27 test suites)**.

- **Hasil Pemeriksaan Teknis:**
  - `npm run lint` -> **PASS** (0 errors, 0 warnings).
  - `npm run typecheck` -> **PASS** (`tsc --noEmit` 0 errors).
  - `npm test` -> **PASS** (27 test suites, **161 tests lulus 100%**).
  - `npm run build` -> **PASS** (Kompilasi Next.js 16 Turbopack sukses untuk 42 rute).

- **Gate:** **PASS** (Fitur Putar Ulang dari Titik Balik Kesalahan telah terintegrasi sempurna di `/play` dan `/archive/[gameId]`, tanpa merusak klik papan catur, kacamata catur, radar panah, atau narasi suara).

---

### Implementasi Peningkatan Audio & Pacing Bot: Suara Hentak Catur Chess.com & Jeda Berpikir Alami

- **Latar Belakang & Kebutuhan Pengguna:**
  1. Pengguna menginginkan suara langkah yang realistis persis seperti suara hentak papan kayu di chess.com (bukan suara synthesizer sintetis/beep sederhana).
  2. Suara khusus rokade (*castling*) seperti di chess.com (dua ketukan hentakan kayu berurutan yang khas).
  3. Menambahkan jeda waktu berpikir bot agar tidak instan (robotik), melainkan memiliki jeda berpikir manusiawi yang natural layaknya bermain melawan bot di chess.com.

- **Perubahan yang Diterapkan:**
  1. **Aset Audio Otentik Chess.com (`public/sounds/`):**
     - Mengunduh dan membundel berkas audio MP3 resmi default chess.com secara offline-first ke dalam direktori `public/sounds/`:
       - `move.mp3`: Suara hentakan kayu langkah sendiri (*move-self*).
       - `move-opponent.mp3`: Suara hentakan kayu langkah lawan.
       - `capture.mp3`: Suara gertakan benturan saat memakan bidak.
       - `castle.mp3`: Suara rokade khas dua hentakan kayu cepat (*castling*).
       - `check.mp3`: Suara peringatan skak.
       - `promote.mp3`: Suara promosi bidak.
       - `game-end.mp3`: Suara akhir pertandingan.
       - `game-start.mp3`: Suara awal permainan.
  2. **Mesin Audio Berkinerja Tinggi & Fallback Akustik (`src/lib/audio/chess-audio.ts`):**
     - Mendukung pra-muat (*preload*) dan penguraian instan (`decodeAudioData`) ke dalam Web Audio API `AudioBuffer` untuk pemutaran tanpa latensi (*zero-latency playback*).
     - Menambahkan fungsi `playCastle()`, `playOpponentMove()`, `playPromotion()`, `playGameStart()`, dan `preloadSounds()`.
     - Menyediakan fallback HTMLAudioElement dan sintesis fisik papan kayu beresonansi (frekuensi 160Hz -> 55Hz + klik kontak 1400Hz) jika lingkungan tidak mendukung pemutaran berkas.
  3. **Jeda Waktu Berpikir Alami Bot Mirip Chess.com (`src/features/game/use-chess-game.ts`):**
     - Mengubah jeda berpikir minimum yang sebelumnya instan (650ms - 850ms) menjadi rentang alami dengan variasi acak organik (*natural human-like thinking delay*):
       - `beginner`: 1400ms – 2400ms (~1.9 detik)
       - `casual`: 1600ms – 2800ms (~2.2 detik)
       - `intermediate`: 1900ms – 3200ms (~2.5 detik)
       - `advanced`: 2200ms – 3800ms (~3.0 detik)
       - `master`: 2600ms – 4500ms (~3.5 detik)
     - Pemain mendapatkan waktu bernapas (*breathing room*) untuk mengamati langkahnya dan melihat status "Bot sedang berpikir..." sebelum bot melangkah.
     - Jeda otomatis di-bypass (0ms) saat pengujian unit menggunakan `customEngine` agar pengujian tetap berjalan instan.
  4. **Integrasi Suara Rokade & Langkah Lawan:**
     - `use-chess-game.ts`: Deteksi `isCastle` (`moveRes.san.startsWith("O-O")`) memicu `chessAudio.playCastle()`, langkah bot memicu `chessAudio.playOpponentMove()`.
     - `use-puzzle-game.ts`: Deteksi rokade dan suara balasan lawan yang otentik.
     - `InteractiveLessonBoard.tsx`: Pemicuan suara rokade pada materi modul rokade.
     - `tests/setup.ts`: Mocking `HTMLMediaElement` prototype (`play`, `pause`, `load`) untuk lingkungan pengujian Vitest jsdom yang bersih dari warning.

- **Hasil Pemeriksaan Teknis:**
  - `npm test` -> **PASS** (27 test suites, **161 tests lulus 100%**).
  - `npm run lint` -> **PASS** (0 errors, 0 warnings).
  - `npm run typecheck` -> **PASS** (`tsc --noEmit` 0 errors).
  - `npm run build` -> **PASS** (Kompilasi Next.js 16 Turbopack sukses untuk seluruh 42 rute).

- **Gate:** **PASS** (Suara catur otentik chess.com dan jeda berpikir natural bot telah aktif sepenuhnya).

---

### Implementasi Fitur: Ide 5 — "Lencana & Apresiasi Langkah Pertama" (Beginner Badges of Honor)

- **Latar Belakang & Kebutuhan Pengguna:**
  Pemula sering merasa ragu dan takut salah saat belajar catur serta merasa tidak melihat kemajuan bertahap. Fitur ini memberikan apresiasi visual seketika (*instant positive reinforcement*) saat pemula berhasil mempraktikkan fondasi penting catur untuk pertama kali. Apresiasi disajikan dalam bentuk pop-up notifikasi melayang (*top floating toast banner*) yang muncul dari atas layar selama beberapa detik lalu otomatis menghilang secara halus tanpa mengganggu interaksi papan.

- **Perubahan yang Diterapkan:**
  1. **Sistem & Katalog Lencana Pemula (`src/features/badges/`):**
     - Mendefinisikan 10 lencana kehormatan bertingkat dengan narasi berbahasa Indonesia yang memotivasi:
       - 👣 **Langkah Perdana** (`first_move`): Menjalankan langkah catur pertama.
       - ⚔️ **Tangkapan Pertama** (`first_capture`): Menangkap bidak lawan untuk pertama kali.
       - 🛡️ **Benteng Kokoh** (`first_castle`): Melakukan manuver Rokade untuk mengamankan Raja.
       - ⚡ **Serangan Langsung** (`first_check`): Memberikan ancaman skak kepada Raja lawan.
       - 👑 **Kelahiran Perwira** (`first_promotion`): Mempromosikan Pion ke baris terakhir.
       - 🧭 **Kuda Melompat** (`active_knights`): Mengaktifkan Kuda ke petak tengah strategis.
       - 🏆 **Kemenangan Perdana** (`first_win`): Memenangkan pertandingan melawan bot komputer.
       - 🧠 **Ahli Taktik** (`puzzle_solver`): Menyelesaikan teka-teki taktik puzzle pertama.
       - 🎓 **Langkah Sang Pelajar** (`curious_student`): Menyelesaikan latihan tantangan di Akademi Catur.
       - 🔄 **Bangkit Kembali** (`turning_point_hero`): Memutar ulang pertandingan dari Titik Balik Kesalahan.
     - Persistensi aman di `localStorage` (`chess_archive_badges_v1`) yang menjamin lencana hanya dihadiahi sekali saat pencapaian pertama tercapai.
  2. **Komponen Notifikasi Pop-up dari Atas Layar (`BadgeToastNotification.tsx`):**
     - Banner mengambang di bagian atas tengah (`fixed top-4 inset-x-0 z-[100]`) bertema Dark Graphite berbingkai emas elegan (`bg-[#1C2024]/95 border-2 border-[#C7A66A] shadow-2xl backdrop-blur-md rounded-2xl`).
     - Animasi transisi geser turun mulus (`translate-y-0 opacity-100 scale-100`) saat lencana terbuka, bertahan selama 4.8 detik, lalu meluncur kembali ke atas (`-translate-y-16 opacity-0 scale-95`).
     - Didukung antrean cerdas (*queue*): jika beberapa lencana terbuka berturut-turut, notifikasi akan bergantian tampil rapi.
     - Disertai lonceng audio perayaan halus (`chessAudio.playGameStart()`) dan tombol tutup manual (`X`).
     - Dipasang di `RootLayout` (`src/app/layout.tsx`) sehingga aktif secara global di seluruh layar aplikasi.
  3. **Tampilan Galeri Koleksi Lencana (`BadgeCollectionGrid.tsx` & `/progress`):**
     - Terintegrasi di halaman Perkembangan Belajar Personal (`/progress`).
     - Menampilkan bilah progres pencapaian (misal: "4 / 10 Lencana Diraih (40%)").
     - Filter kategori ("Semua", "Permainan", "Taktik", "Belajar", "Perjalanan").
     - Kartu lencana emas yang diraih dilengkapi tanggal perolehan; kartu lencana terkunci dilengkapi instruksi/kriteria cara membukanya.
  4. **Pemicu Otomatis di Berbagai Modul:**
     - `useChessGame`: Pemicuan pada langkah pertama, penangkapan, rokade, skak, promosi, pengembangan kuda, kemenangan, dan rewind titik balik.
     - `usePuzzleGame`: Pemicuan saat puzzle berhasil dipecahkan.
     - `InteractiveLessonBoard`: Pemicuan saat latihan tantangan akademi selesai.
  5. **Pengujian Komprehensif:**
     - `tests/unit/badges.test.ts` (6 tests): Memverifikasi integritas katalog, pembukaan pertama, pencegahan pembukaan ganda, notifikasi subscriber, dan reset data.
     - `tests/unit/badge-toast-ui.test.tsx` (4 tests): Memverifikasi kemunculan pop-up dari atas, konten teks/ikon, penutupan manual, dan sinkronisasi galeri progres.
     - Total pengujian lulus: **171 tests (29 test suites)**.

- **Hasil Pemeriksaan Teknis:**
  - `npm test` -> **PASS** (29 test suites, **171 tests lulus 100%**).
  - `npm run lint` -> **PASS** (0 errors, 0 warnings).
  - `npm run typecheck` -> **PASS** (`tsc --noEmit` 0 errors).
  - `npm run build` -> **PASS** (Kompilasi Next.js 16 Turbopack sukses untuk seluruh 42 rute).

- **Gate:** **PASS** (Fitur Lencana & Notifikasi Apresiasi Langkah Pertama aktif sempurna).

---

### Penyempurnaan Tata Letak UI Layar Permainan: Zero-Scroll Board & Independent Side Panel (Ala Chess.com)

- **Latar Belakang & Kebutuhan Pengguna:**
  1. Sebelumnya pemain harus menggulir (*scroll*) layar ke bawah hanya untuk melihat jam catur sendiri dan status giliran, serta untuk menyesuaikan posisi papan dengan panel samping.
  2. Papan catur perlu diposisikan pas di tengah layar dan terkunci diam (*stationary*), muat 100% di layar bersama jam bot di atas dan jam pemain di bawah persis seperti tata letak Chess.com yang tanpa scroll halaman (*zero page scroll*).
  3. Panel kanan (berisi riwayat langkah, saran bimbingan AI, petunjuk Sokrates, dan kontrol) harus memiliki area gulir mandiri (*independent scroll*). Jika pengguna menggulir mouse, hanya panel kanan yang bergeser, sementara papan catur tetap diam terpaku di tengah.

- **Perubahan yang Diterapkan:**
  1. **Dimensi Papan Catur Responsif Berbasis Tinggi Layar (`InteractiveChessboard.tsx`):**
     - Mengubah batas lebar dan tinggi papan dari nilai piksel statis menjadi formula dinamis:
       `max-w-[min(100%,calc(100dvh-190px))] lg:max-w-[min(600px,calc(100dvh-175px))] xl:max-w-[min(640px,calc(100dvh-170px))]`.
     - Papan catur otomatis menyesuaikan ukuran dengan tinggi area pandang peramban (*viewport height*) secara proporsional.
     - Bilah atas (jam & bot pill + tombol kacamata catur/radar panah) dan bilah bawah (jam pemain & status giliran) terikat langsung pada lebar papan yang sama persis.
     - Menjamin bahwa jam bot di atas, seluruh 64 petak catur, dan jam pemain di bawah **100% tampak bersamaan tanpa perlu scroll satu piksel pun**.
  2. **Header Permainan Ramping & Padat (`src/app/play/page.tsx`):**
     - Mengubah bilah judul menjadi flex horizontal satu baris yang sangat hemat ruang vertikal (~38px), mengintegrasikan badge bot, tombol suara, dan pengaturan pertandingan.
  3. **Penguncian Papan & Panel Kanan Independen (`src/app/play/page.tsx`):**
     - Kontainer utama permainan pada desktop (`lg:`) diberi batasan `lg:h-[calc(100dvh-92px)] lg:max-h-[calc(100dvh-92px)] lg:overflow-hidden`.
     - Kolom papan catur (`lg:col-span-7 xl:col-span-8`) bersifat diam dan terpusat (*fixed stationary column*).
     - Kolom panel kanan (`lg:col-span-5 xl:col-span-4`) dilengkapi `lg:max-h-[calc(100dvh-125px)] lg:overflow-y-auto` dengan bilah gulir halus bernuansa dark graphite.
     - Saat daftar langkah memanjang atau kartu panduan guru AI terbuka, pengguna dapat menggulir panel kanan secara bebas sementara papan catur tidak bergerak sama sekali.

- **Hasil Pemeriksaan Teknis:**
  - `npm test` -> **PASS** (29 test suites, **171 tests lulus 100%**).
  - `npm run lint` -> **PASS** (0 errors, 0 warnings).
  - `npm run typecheck` -> **PASS** (`tsc --noEmit` 0 errors).
  - `npm run build` -> **PASS** (Kompilasi Next.js 16 Turbopack sukses untuk seluruh 42 rute).

- **Gate:** **PASS** (UI layar bermain catur kini 100% bebas scroll halaman di desktop, papan dan kedua jam terlihat penuh, dan panel kanan bergulir secara independen persis seperti Chess.com).

---

### Perbaikan: Integrasi Langsung Jam Pemain (`bottomSlot`) & Pencegahan Terpotong (Zero-Clip Display)

- **Latar Belakang & Masalah:**
  Pengguna melaporkan: *"sudah bagus tapi waktu pemain tidak ada cuma ada waktu bot"*.
  - Penyebab: Elemen bilah pemain dan jam catur sebelumnya ditempatkan di luar komponen `InteractiveChessboard` di bawahnya. Ketika batas tinggi area pandang (`calc(100dvh - 190px)`) diterapkan bersama `lg:overflow-hidden`, elemen bilah pemain terdorong sekitar ~30px melewati batas bawah layar peramban dan terpotong (*clipped*) sehingga jam pemain tidak tampak di layar, sementara jam bot yang berada di bilah atas papan tetap terlihat jelas.

- **Perubahan yang Diterapkan:**
  1. **Penambahan Prop `bottomSlot` pada `InteractiveChessboard.tsx`:**
     - Mengintegrasikan slot bilah bawah langsung ke dalam satu kesatuan kontainer papan catur (`InteractiveChessboard`), persis di bawah 64 petak catur (`mt-1.5 shrink-0`).
     - Menyesuaikan formula pembatas tinggi maksimum papan menjadi `calc(100dvh-230px)` pada mobile/tablet dan `calc(100dvh-215px)` pada desktop agar seluruh 3 elemen (Bilah Bot & Jam + Papan Catur 1:1 + Bilah Pemain & Jam) memiliki ruang vertikal yang lega dan dijamin muat 100% di layar.
  2. **Penyempurnaan Bilah Pemain & Jam di `src/app/play/page.tsx`:**
     - Memasukkan `playerBar` melalui prop `bottomSlot={playerBar}` ke dalam `<InteractiveChessboard />`.
     - Menghapus kontainer pemain lama yang terpisah di luar papan untuk mengeliminasi duplikasi dan risiko terpotong.
     - Menghapus pembatas `lg:overflow-hidden` pada kontainer halaman utama agar tidak ada elemen antarmuka yang terpotong.
     - Mempertegas tampilan jam pemain:
       - Mode Waktu Terbatas: Menampilkan hitung mundur waktu (`10:00`, `09:59`, dll.) dengan bingkai emas berkedip lembut (`bg-[#C7A66A]/20 border-[#C7A66A] font-bold shadow-xs`) saat giliran pemain aktif.
       - Mode Tanpa Batas: Menampilkan simbol tak hingga (`∞`) yang bersih dan elegan.
       - Desain jam pemain dan jam bot kini simetris, selaras, dan keduanya 100% tampak bersamaan di layar tanpa perlu digulir (*zero-scroll*).

- **Hasil Pemeriksaan Teknis:**
  - `npm test` -> **PASS** (29 test suites, **171 tests lulus 100%**).
  - `npm run lint` -> **PASS** (0 errors, 0 warnings).
  - `npm run typecheck` -> **PASS** (`tsc --noEmit` 0 errors).
  - `npm run build` -> **PASS** (Kompilasi Next.js 16 Turbopack sukses untuk seluruh 42 rute).

- **Gate:** **PASS** (Jam pemain kini selalu tampil jelas tepat di bawah papan catur bersama jam bot di atasnya tanpa terpotong).

---

### Rebranding Identitas Produk: Chess Archive -> Bidak Pemula

- **Latar Belakang & Permintaan Pengguna:**
  Pengguna meminta untuk mengubah total nama website dan seluruh judul dari *"Chess Archive"* menjadi *"Bidak Pemula"*, menyelaraskan identitas resmi website dengan repositori GitHub dan visi platform belajar catur ramah pemula.

- **Perubahan yang Diterapkan:**
  1. **Metadata & Judul Dokumen (`src/app/layout.tsx`):**
     - Mengubah judul dokumen global: `title: "Bidak Pemula — Belajar & Bermain Catur Ramah Pemula"`.
     - Mengubah meta description agar menonjolkan platform belajar, bermain melawan bot komputer, dan melatih taktik catur ramah pemula.
  2. **Identitas Navigasi Header (`src/components/layout/Navbar.tsx`):**
     - Mengubah logo teks merek di pojok kiri atas menjadi `BIDAK PEMULA`.
     - Subtitle: `Belajar & Bermain Catur`.
  3. **Identitas Footer (`src/components/layout/Footer.tsx`):**
     - Mengubah teks hak cipta/merek menjadi `Bidak Pemula • Ruang Belajar & Bermain Catur Ramah Pemula`.
  4. **Katalog Taktik Puzzle (`src/features/puzzles/puzzle-catalog.ts`):**
     - Mengubah seluruh 18 sumber metadata puzzle dari *"Arsip Taktik Chess Archive"* menjadi *"Koleksi Taktik Bidak Pemula"*.
  5. **Konfigurasi Proyek (`package.json`):**
     - Mengubah nama paket aplikasi menjadi `"name": "bidak-pemula"`.
  6. **Pembaruan Tes Otomatis (`tests/unit/smoke.test.tsx`):**
     - Memperbarui ekspektasi verifikasi Navbar dan Footer untuk mencocokkan `BIDAK PEMULA`.

- **Hasil Pemeriksaan Teknis:**
  - `npm test` -> **PASS** (29 test suites, **171 tests lulus 100%**).
  - `npm run lint` -> **PASS** (0 errors, 0 warnings).
  - `npm run typecheck` -> **PASS** (`tsc --noEmit` 0 errors).
  - `npm run build` -> **PASS** (Kompilasi Next.js 16 Turbopack sukses untuk seluruh 42 rute).

- **Gate:** **PASS** (Nama merek dan seluruh judul telah resmi berganti menjadi Bidak Pemula).
