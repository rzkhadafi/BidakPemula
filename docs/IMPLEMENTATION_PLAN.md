# Implementation Plan — Chess Archive

## Aturan pelaksanaan

- Tiap fase diselesaikan secara end-to-end: implementasi, tes, visual review, dan catatan hasil.
- Antigravity tidak boleh melanjutkan ke fase berikutnya jika acceptance gate saat ini gagal.
- Jangan membangun semua halaman P1/P2 sebagai placeholder interaktif selama P0 belum stabil.
- Buat/pertahankan `docs/IMPLEMENTATION_LOG.md` sebagai jurnal perkembangan.

## Fase 0 — Foundation & Visual Shell

### Lingkup
- Scaffold Next.js App Router + TypeScript strict.
- Tailwind/CSS tokens, layout global, typography, icon system, component primitives.
- Route shells: Home, Play, Academy, Puzzle, Archive, Settings.
- Navigation desktop/mobile dan empty/loading/error states utama.
- Setup lint, typecheck, unit test runner, E2E test baseline jika dapat dijalankan.
- README instalasi, `.env.example`, dan struktur folder domain.

### Tidak termasuk
- Game engine, Gemini API, database, akun, multiplayer.

### Acceptance gate
- `npm run lint`, `npm run typecheck` (jika script terpisah), test command, dan `npm run build` lulus.
- Enam route P0 dapat dibuka tanpa error.
- Tidak ada horizontal overflow pada viewport mobile representatif.
- Design system konsisten dengan tema yang disepakati.
- Navigasi, tombol dan states yang ditampilkan berfungsi atau secara eksplisit disabled.
- Catatan screenshot/visual inspection desktop dan mobile ditambahkan di implementation log.

## Fase 1 — Playable Chess

### Lingkup
- Chessboard adapter, game state dengan rules library, click/tap move dan drag/drop.
- Semua aturan standar, promosi, giliran, game-over state.
- Engine worker adapter dan bot level kesulitan.
- Pemilihan warna, level, mode latihan, reset, undo latihan, time control opsional.
- Move list, status jam bila aktif, export/import internal PGN bila perlu.
- Autosave lokal setelah game selesai atau save flow yang jelas.

### Acceptance gate
- Semua unit tests aturan kritis lulus.
- Bot hanya membuat langkah legal.
- Engine search tidak membekukan UI dan dapat dibatalkan/reset.
- Promosi, game over, orientasi, dan input mobile berfungsi.
- Tingkat kesulitan memiliki perilaku berbeda yang dapat diuji; jangan klaim Elo terkalibrasi.
- Production build lulus dan browser console tidak punya error yang diketahui.

## Fase 2 — Academy + Puzzles + Local Archive

### Lingkup
- Kurikulum awal Bahasa Indonesia.
- Pelajaran demonstratif/interaktif dan progres lokal.
- Puzzle lokal dengan posisi, solusi, hints dan feedback.
- List/detail arsip, replay, delete confirmation, penyimpanan lokal.
- Pengaturan untuk reset progres/riwayat.

### Acceptance gate
- Pengguna dapat menyelesaikan satu pelajaran dan melihat progres bertahan setelah reload.
- Puzzle contoh memiliki solusi legal dan jawaban benar/salah teruji.
- Arsip game dapat dibuka dan di-replay dari PGN/record.
- Fitur belajar berfungsi ketika offline setelah aset yang diperlukan sudah termuat/cached jika offline caching sudah ditambahkan; jangan menjanjikan offline penuh tanpa PWA/service worker yang dites.
- Tes, lint, typecheck, build, dan visual review lulus.

## Fase 3 — Gemini Tutor

### Lingkup
- Server route `/api/tutor/explain`.
- SDK resmi yang sesuai dokumentasi terbaru, schema validation, prompt template, bounded output.
- UI tutor kontekstual, status, retry, quota/error fallback.
- Provider dimock dalam tests; aplikasi tetap berfungsi tanpa key.
- README instruksi setting `GEMINI_API_KEY` di `.env.local`/host secrets.

### Acceptance gate
- Tidak ada API key di bundle browser/source maps/response logs.
- Missing key dan `TUTOR_ENABLED=false` tidak menyebabkan crash.
- Invalid payload ditolak; output model divalidasi.
- Tutor tidak bisa mengubah board/game state.
- 429/quota, timeout, output malformed, dan provider unavailable memberi fallback baik.
- Tidak memerlukan API nyata saat test CI.
- Rujuk dokumentasi resmi terbaru untuk nama model, free tier, limits, dan penggunaan data.

## Fase 4 — Analysis Archive, Echo Room, Match Autopsy (P1)

### Lingkup
- Ulasan langkah dan engine evaluation yang dinormalisasi.
- Replay interaktif dengan sinkronisasi board/move list.
- Echo Room dengan branch variasi tanpa overwrite PGN asli.
- Match Autopsy dengan momen penting, alternatif dan penjelasan.
- Export PGN jika belum ada.

### Acceptance gate
- PGN asli tetap utuh saat cabang variasi dibuat/dihapus.
- Perspektif evaluasi sebelum/sesudah konsisten.
- Tidak ada label blunder/mistake jika data engine tidak mencukupi.
- Analisis dapat gagal/di-cancel tanpa merusak arsip.

## Fase 5 — Hardening & Release

### Lingkup
- Browser compatibility dan accessibility review.
- Performance/worker/memory checks.
- Security review endpoint tutor dan secrets.
- License/source-notice check untuk dependencies dan Stockfish build.
- Deployment staging, environment variables, health/error verification.
- Dokumentasi known limitations dan proses update.

### Acceptance gate
- Semua command CI dan production build lulus.
- Smoke test deployed preview lulus.
- Secrets tidak ada di repository/client bundle.
- Free-tier limits dan terms hosting/API diverifikasi sebelum publikasi.
- Known limitations tertulis, tidak ada tombol palsu atau halaman placeholder yang menyamar sebagai fitur selesai.

## Fase P2 — hanya setelah prioritas eksplisit

- Auth, cloud sync, multiplayer real-time, matchmaking, dan fitur sosial.
- Rancang backend dan threat model terpisah sebelum implementasi; jangan menempelkan multiplayer pada arsitektur lokal tanpa perencanaan.

## Definition of Done untuk tiap fase

1. Acceptance criteria diselesaikan.
2. Perubahan kode ter-review dengan tes relevan.
3. Lint, typecheck, test, build dijalankan dan hasil dicatat.
4. UI diperiksa dalam desktop dan mobile.
5. Error console/network yang diketahui diselesaikan atau dicatat secara eksplisit.
6. README dan implementation log diperbarui.
