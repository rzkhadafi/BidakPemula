# Chess Archive — Project Documentation Pack

Dokumentasi ini adalah sumber kebenaran awal untuk membangun Chess Archive dari proyek kosong menggunakan Antigravity.

## Mulai di sini

1. Buka folder ini sebagai workspace/project di Antigravity.
2. Baca `AGENTS.md` dan `ANTIGRAVITY_START_HERE.md`.
3. Ikuti instruksi pada `ANTIGRAVITY_START_HERE.md` untuk meminta agen menganalisis spesifikasi terlebih dahulu. Jangan meminta seluruh aplikasi dibuat dalam satu prompt.
4. Selesaikan gerbang setiap fase di `docs/IMPLEMENTATION_PLAN.md` sebelum pindah ke fase berikutnya.
5. Gunakan `docs/TEST_PLAN.md` untuk menguji hasil. Jangan menganggap build sukses hanya berdasarkan klaim agen; jalankan perintahnya dan lihat keluarannya.

## Struktur dokumen

- `PRD.md` — visi produk, target, ruang lingkup, dan acceptance criteria.
- `AGENTS.md` — aturan tetap untuk coding agent.
- `ANTIGRAVITY_START_HERE.md` — prompt siap pakai untuk memulai dan menjalankan fase.
- `docs/DESIGN_SYSTEM.md` — token visual dan komponen.
- `docs/UI_UX_SPEC.md` — alur, navigasi, interaksi, aksesibilitas, dan responsivitas.
- `docs/SCREEN_SPEC.md` — spesifikasi per layar.
- `docs/TECH_ARCHITECTURE.md` — stack, struktur, batas modul, keamanan, dan integrasi.
- `docs/CHESS_ENGINE_SPEC.md` — aturan permainan, bot, analisis, dan rating bot.
- `docs/AI_TUTOR_SPEC.md` — Gemini sebagai guru catur berbahasa Indonesia.
- `docs/DATA_MODEL.md` — bentuk data dan penyimpanan lokal.
- `docs/IMPLEMENTATION_PLAN.md` — fase, urutan, dan gerbang penyelesaian.
- `docs/TEST_PLAN.md` — pengujian logika, UI, AI, aksesibilitas, dan build.
- `docs/REFERENCES.md` — referensi teknis dan catatan lisensi.

## Status

Dokumen ini merupakan baseline produk v1.0, tanggal 21 Oktober 2026. Implementasi harus memverifikasi versi paket, kompatibilitas, kuota API, serta syarat layanan terbaru sebelum deployment. Dokumen tidak mengunci nomor versi dependensi secara sembarang.

## Prinsip utama

- Bahasa antarmuka utama: Bahasa Indonesia.
- Produk harus berguna meskipun API Gemini tidak dikonfigurasi atau kuotanya habis.
- Aturan catur ditangani pustaka catur; model bahasa tidak menentukan legalitas langkah.
- Jangan menampilkan angka Elo sebagai rating terkalibrasi sebelum bot diuji melalui pertandingan.
- Jangan mengirim API key ke client/browser atau menyimpannya di Git.
- Tidak boleh ada tombol utama yang hanya dekoratif. Jika fitur belum dibuat, sembunyikan atau tandai sebagai rencana secara eksplisit.
