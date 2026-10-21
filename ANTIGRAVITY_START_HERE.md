# Antigravity — Start Here

Gunakan file ini sebagai panduan menjalankan proyek. Salin satu prompt setiap kali, bukan semuanya sekaligus.

## Sebelum mulai

1. Ekstrak paket dokumen ini ke folder proyek yang ingin kamu gunakan, misalnya `chess-archive`.
2. Buka folder itu sebagai Project/Workspace di Antigravity.
3. Pastikan Node.js memenuhi persyaratan Next.js yang dipilih dari dokumentasi resmi saat setup.
4. Jangan membuat atau menambahkan Gemini API key dulu. Produk harus bisa dibangun dan diuji tanpa key.
5. Mulai dengan Prompt 0 di bawah ini.

## Prompt 0 — Baca spesifikasi dan rencanakan (jangan coding dulu)

```text
Kita membangun Chess Archive dari proyek kosong. Sebelum mengubah atau membuat kode aplikasi, baca dan pahami:
- AGENTS.md
- PRD.md
- docs/DESIGN_SYSTEM.md
- docs/UI_UX_SPEC.md
- docs/SCREEN_SPEC.md
- docs/TECH_ARCHITECTURE.md
- docs/CHESS_ENGINE_SPEC.md
- docs/AI_TUTOR_SPEC.md
- docs/DATA_MODEL.md
- docs/IMPLEMENTATION_PLAN.md
- docs/TEST_PLAN.md
- docs/REFERENCES.md

Jangan mulai coding pada langkah ini. Berikan:
1. Ringkasan pemahaman produk dan MVP.
2. Daftar keputusan teknis yang sudah ditetapkan.
3. Konflik, risiko, dependency, atau detail yang perlu diverifikasi terhadap dokumentasi terbaru.
4. Rencana implementasi untuk Fase 0 saja, dengan file yang akan dibuat/diubah dan acceptance criteria.
5. Cara kamu akan memverifikasi UI secara visual serta menjalankan lint, typecheck, tests, dan production build.
Jangan mengubah ruang lingkup atau desain tanpa mencatat alasannya. Setelah laporan ini, tunggu instruksi berikutnya.
```

## Prompt 1 — Fase 0: fondasi dan visual shell

```text
Implementasikan Fase 0 dari docs/IMPLEMENTATION_PLAN.md saja. Ikuti AGENTS.md dan seluruh spesifikasi yang relevan. Buat fondasi Next.js + TypeScript, konfigurasi lint/test yang jelas, layout global, design tokens, navigasi responsif, dan shell visual untuk halaman P0 menggunakan data placeholder yang diberi label jelas. Belum perlu mengimplementasikan logika catur atau memanggil Gemini.

Jaga desain tetap 2D, minimal, dark graphite dengan papan/permukaan ivory dan aksen emas kusam; hindari gradient, 3D, efek neon, dan dashboard generik. Setelah implementasi, jalankan semua pemeriksaan yang tersedia, buka halaman di browser, tinjau desktop dan mobile, perbaiki temuan, lalu laporkan hasil nyata dan gap yang tersisa. Jangan lanjut ke Fase 1.
```

## Prompt 2 — Fase 1: playable chess

```text
Setelah gerbang Fase 0 lulus, implementasikan Fase 1 sesuai docs/IMPLEMENTATION_PLAN.md dan docs/CHESS_ENGINE_SPEC.md. Integrasikan pustaka aturan catur yang sudah diverifikasi dan Stockfish melalui worker adapter. Pastikan drag-and-drop dan click/tap-to-move bekerja, promosi pion ditangani dengan benar, semua status akhir valid, dan engine tidak membekukan UI. Jangan menambahkan Gemini, multiplayer, atau fitur P1 pada fase ini.

Tambahkan tes untuk aturan kritis dan interaksi utama. Jalankan lint, typecheck, tests, production build, serta pemeriksaan visual desktop/mobile. Laporkan bukti tes dan isu yang belum selesai. Jangan lanjut ke Fase 2.
```

## Prompt 3 — Fase 2: Akademi dan puzzle

```text
Implementasikan Fase 2 sesuai docs/IMPLEMENTATION_PLAN.md, docs/SCREEN_SPEC.md, dan docs/DATA_MODEL.md. Materi harus berupa konten lokal berbahasa Indonesia dengan tujuan pelajaran yang jelas, progres yang disimpan lokal, serta puzzle dengan posisi/solusi dan petunjuk yang tervalidasi. Fitur belajar wajib tetap berjalan tanpa Gemini API. Uji semua puzzle contoh dan alur pengguna; jangan lanjut ke Fase 3.
```

## Prompt 4 — Fase 3: Tutor Gemini yang aman

```text
Implementasikan Fase 3 sesuai docs/AI_TUTOR_SPEC.md dan docs/TECH_ARCHITECTURE.md. Semua panggilan Gemini hanya dari server. Gunakan variabel lingkungan, validasi input/output, payload yang dibatasi, penanganan error/quota, dan fallback saat key tidak tersedia. Jangan pernah mengekspos key dalam client bundle, console, respons API, atau nama variabel NEXT_PUBLIC_*. Gemini berperan sebagai penjelas; aturan dan analisis catur berasal dari pustaka/Stockfish. Tambahkan tes dengan provider dimock dan tidak memerlukan API key nyata. Jangan lanjut ke fase berikutnya.
```

## Prompt 5 — Fase 4 dan 5: arsip mendalam, Echo Room, Match Autopsy, QA

```text
Lanjutkan hanya setelah fase sebelumnya memenuhi gate. Ikuti docs/IMPLEMENTATION_PLAN.md, docs/DATA_MODEL.md, dan docs/TEST_PLAN.md. Bangun Echo Room dan Match Autopsy tanpa merusak PGN asli atau mengubah sejarah pertandingan. Kemudian jalankan audit akhir untuk aturan catur, keyboard/touch, responsivitas, aksesibilitas, error states, lisensi, keamanan key, lint, typecheck, tests, dan production build. Jangan menambah multiplayer atau autentikasi kecuali diminta secara eksplisit.
```

## Cara menilai jawaban agen

Jangan puas dengan kalimat “sudah selesai”. Minta daftar perintah yang benar-benar dijalankan, hasilnya, file penting yang dibuat, screenshot/preview halaman yang diperiksa, bug yang ditemukan, dan sisa pekerjaan. Bila sebuah perintah gagal, minta agen memperbaikinya sebelum mengumumkan fase selesai.
