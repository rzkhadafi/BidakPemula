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

- **Langkah berikutnya:** Tahap 2: Pendampingan Aktif (*In-Game AI Co-Pilot: Guided Undo & Socratic Hints*).
