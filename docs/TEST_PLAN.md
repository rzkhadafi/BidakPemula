# Test Plan — Chess Archive

## 1. Strategi

Gunakan beberapa lapisan: unit tests untuk aturan dan utilitas, integration tests untuk engine/storage/tutor boundaries, dan E2E/browser tests untuk alur pengguna. Jangan bergantung hanya pada screenshot atau sekadar build yang sukses.

## 2. Unit tests — rules dan game state

Wajib:

- Pion bergerak satu/dua petak dari posisi awal dengan benar.
- Gerak diagonal dan capture pion.
- Kuda bergerak dan tidak terhalang bidak.
- Gajah, benteng, ratu, raja sesuai aturan.
- Langkah yang membiarkan raja sendiri dalam skak ditolak.
- Rokade dapat/tidak dapat dilakukan sesuai semua prasyarat.
- En passant hanya berlaku pada kesempatan yang benar.
- Semua jenis promosi bekerja.
- Skak, checkmate, stalemate, dan draw state yang didukung library terdeteksi.
- FEN/PGN konsisten setelah serangkaian langkah.
- Langkah ilegal tidak mengubah posisi atau move history.

## 3. Unit/integration tests — engine

- Worker inisialisasi dan handshake selesai.
- Bot memberi langkah legal dari beberapa posisi.
- Search dapat dihentikan.
- Reset/new game mengabaikan pesan worker lama.
- Timeout/error engine menghasilkan UI fallback.
- Level kesulitan mengubah config/selection strategy yang diharapkan.
- Analisis tidak memblokir input/render.
- Move dengan promosi dari UCI diparse dan diverifikasi.
- Tidak ada duplikasi langkah akibat event ganda.

## 4. Persistence tests

- Settings bertahan setelah reload.
- Progres lesson dan puzzle bertahan setelah reload.
- Arsip game dapat diserialisasi, disimpan, dipulihkan, dan direplay.
- Record malformed tidak merusak seluruh aplikasi.
- Hapus satu game tidak menghapus lesson progress.
- Reset progress/riwayat melakukan cakupan yang dijelaskan di dialog.
- Versi schema lama dimigrasi atau memberi recovery message.

## 5. Tutor API tests

Gunakan mock provider, bukan key nyata.

- Feature flag false/key tidak tersedia: fallback response yang sesuai.
- Valid request menghasilkan response schema valid.
- Pertanyaan panjang, FEN invalid, terlalu banyak langkah, payload oversize ditolak.
- Output model dengan field hilang/salah tipe ditolak atau fallback.
- Provider timeout, HTTP 429/quota, 5xx, serta invalid JSON ditangani.
- Pesan error yang dikirim ke client tidak berisi secrets/stack trace.
- Gemini output tidak pernah diterapkan sebagai langkah game.
- Batas request/rate-limit diuji sejauh implementasi mendukung.
- Tidak ada API key atau data yang tidak perlu pada console/bundle.

## 6. E2E tests

1. Buka Home → mulai game → pilih level → mainkan satu langkah → bot membalas.
2. Pilih sebuah bidak lalu petak tujuan dengan click/tap.
3. Drag-and-drop bidak pada desktop jika fitur didukung.
4. Selesaikan game checkmate sample atau gunakan fixture posisi akhir.
5. Reload → arsip lokal masih tersedia.
6. Buka Academy → selesaikan lesson → progres terlihat.
7. Buka puzzle → salah langkah menghasilkan hint → solusi menyelesaikan puzzle.
8. Tutor tanpa key menunjukkan fallback dan tidak merusak halaman.
9. Hapus arsip memerlukan konfirmasi.
10. Gunakan keyboard untuk navigasi kontrol utama.

## 7. Visual/responsive checks

Periksa minimal viewport:

- Mobile kecil: 360×800.
- Mobile besar: 390×844.
- Tablet: sekitar 768×1024.
- Laptop: 1366×768.
- Desktop lebar: 1440×900.

Pada tiap halaman P0:
- Tidak ada horizontal overflow.
- Papan catur tetap 1:1 dan cukup besar.
- Panel/menu tidak menutupi aksi utama.
- Dialog dan dropdown tidak keluar viewport.
- Typography dan metadata terbaca.
- Focus-visible jelas dan kontrol sentuh tidak terlalu kecil.
- Reduced-motion tidak menjalankan animasi perpindahan besar.

Bandingkan implementasi dengan `DESIGN_SYSTEM.md` dan `SCREEN_SPEC.md`. Catat screenshot atau daftar temuan di implementation log. Perbaiki semua masalah visual yang menghalangi tugas utama sebelum fase dinyatakan selesai.

## 8. Accessibility checks

- Keyboard-only walkthrough untuk navigasi, dialog, papan, form, dan menu.
- Focus order masuk akal dan tidak terperangkap kecuali pada modal dengan aturan yang benar.
- Label untuk icon-only buttons dan fields.
- Kontras teks/controls diperiksa, target WCAG AA.
- Status game/analisis diumumkan dengan live region secara wajar.
- Pengguna tidak harus menggunakan drag atau hover untuk fungsi penting.

## 9. Quality commands

Tetapkan package scripts yang nyata, contohnya:

- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run test:e2e`
- `npm run build`

Jika nama script berbeda, perbarui dokumen dan README. Jangan melaporkan lulus tanpa output yang benar-benar diperoleh.

## 10. Release checklist

- [ ] Semua tes rules lulus.
- [ ] Engine tidak hang pada reset/endgame.
- [ ] Tutor tidak perlu key untuk build/test.
- [ ] API key tidak muncul di client.
- [ ] Tidak ada halaman P0 yang kosong atau link rusak.
- [ ] Hapus data dikonfirmasi.
- [ ] Responsivitas dan keyboard diperiksa.
- [ ] Lisensi paket/engine terdokumentasi.
- [ ] Build produksi lulus.
- [ ] Limit dan terms layanan hosting/API terbaru diverifikasi.
