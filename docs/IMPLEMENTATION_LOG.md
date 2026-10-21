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

- **Langkah berikutnya:** Menunggu instruksi untuk memulai Fase 1 (Playable Chess: integrasi aturan catur `chess.js`, Web Worker Stockfish, interaksi click/tap dan drag-and-drop, validasi promosi/skakmat/remis, jam catur, dan penyimpanan hasil lokal).
