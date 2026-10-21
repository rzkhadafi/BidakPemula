# Screen Specification — Chess Archive

Spesifikasi ini mengatur fungsi dan hierarki tiap layar. Detail token visual berada di `DESIGN_SYSTEM.md`.

## 1. Global shell

- Logo teks Chess Archive dan navigasi utama.
- Penanda halaman aktif.
- Akses ke Pengaturan.
- Layout konten mengikuti max-width dan responsive spacing.
- Pada mobile, menu tidak boleh menutupi status permainan secara permanen.

## 2. Beranda — `/`

### Tujuan
Memulai permainan atau melanjutkan belajar dalam satu pilihan yang jelas.

### Hierarki
1. Header sederhana: sapaan singkat/statement produk, bukan marketing hero yang terlalu tinggi.
2. Aksi utama “Mulai permainan”.
3. Akses sekunder “Lanjutkan belajar” dan “Pecahkan puzzle”.
4. Bagian “Lanjutkan” jika ada game/lesson terakhir.
5. Ringkasan progres minimal: pelajaran selesai, puzzle terakhir, permainan terbaru—hanya tampil jika ada data.

### Interaksi
- Klik Mulai permainan membuka konfigurasi singkat sebelum board.
- Jika tidak ada progres, tampilkan empty state dengan ajakan yang jelas.
- Jangan menampilkan statistik palsu atau data placeholder sebagai data nyata.

## 3. Main Catur — `/play`

### Tujuan
Memberi pengalaman bermain langsung yang nyaman dan stabil.

### Desktop layout
- Papan catur 1:1 sebagai elemen utama, idealnya sekitar 520–680 px tergantung viewport.
- Di dekat papan: pemain/lawan, avatar/badge sederhana, jam jika aktif, status giliran.
- Panel samping: daftar langkah, tindakan game, level bot, bantuan/analisis kontekstual.
- Jangan menempatkan AI chat terbuka secara default jika membuat papan sempit.

### Mobile layout
- Info lawan dan jam di atas papan.
- Papan selebar area yang tersedia.
- Panel daftar langkah dan tutor berada di bawah papan atau pada sheet.
- Tombol kontrol utama mudah dijangkau dan tidak bertumpuk.

### State penting
- Sebelum game: modal/layar pilih level, warna pemain (putih/hitam/acak), kontrol waktu opsional, mode latihan.
- Sedang bermain: highlight legal move, last move, selected square, skak, thinking state.
- Promosi: pilih Q/R/B/N, termasuk simbol dan label aksesibel.
- Game selesai: hasil, alasan akhir, simpan ke arsip, tinjau permainan, permainan baru.
- Engine gagal: notifikasi jelas dan opsi retry/reset; jangan menggantung pada indikator berpikir selamanya.

## 4. Akademi Catur — `/academy`

### Tujuan
Mengarahkan pelajar ke urutan materi.

### Konten awal yang direkomendasikan
1. Mengenal papan dan koordinat.
2. Cara gerak setiap bidak.
3. Langkah legal, giliran, dan menangkap bidak.
4. Skak, skakmat, dan stalemate.
5. Rokade, promosi pion, en passant.
6. Nilai relatif bidak dan keselamatan raja.
7. Fork, pin, dan serangan ganda dasar.
8. Prinsip pembukaan: mengembangkan bidak, menguasai pusat, melindungi raja.

### Layout
- Progres materi dengan label “Belum dimulai”, “Sedang dipelajari”, atau “Selesai”.
- Jelaskan urutan rekomendasi, tetapi izinkan mengulang materi.
- Jangan memakai lock palsu; jika pelajaran dikunci, jelaskan syaratnya.

## 5. Pelajaran — `/academy/[lessonId]`

### Layout
- Judul, tujuan pelajaran, dan posisi dalam kurikulum.
- Penjelasan pendek per bagian.
- Diagram/papan interaktif jika konsep membutuhkan gerakan.
- Bagian latihan dan umpan balik langsung.
- Aksi “Pelajaran sebelumnya”, “Tandai selesai”, “Lanjut pelajaran”.
- Tutor AI opsional di panel yang dapat dibuka, bukan menguasai halaman.

### Interaksi
- Materi dapat diselesaikan tanpa API.
- Jawaban salah diberi petunjuk yang mendidik.
- Progres hanya ditandai selesai setelah pengguna menekan aksi yang jelas atau menyelesaikan latihan yang ditetapkan.

## 6. Puzzle — `/puzzles`

### Tujuan
Melatih pengenalan taktik dan membuat sesi singkat yang mudah diulang.

### Konten
- Kategori: dasar, taktik, bertahan, skakmat, endgame.
- Kesulitan berupa level relatif, bukan klaim Elo terkalibrasi.
- Target puzzle selalu jelas, misalnya “Temukan langkah terbaik” atau “Skakmat dalam dua langkah”.

### Interaksi
- Posisi awal harus dimuat dari data puzzle yang valid.
- Puzzle memvalidasi langkah target menggunakan daftar solusi yang sudah dikurasi.
- Jika salah, tampilkan hint; jangan langsung mengungkap solusi kecuali pengguna meminta.
- Setelah selesai, tawarkan puzzle berikutnya dan tombol ulangi.

## 7. Arsip Saya — `/archive`

### Tujuan
Menemukan permainan dan melanjutkan analisis.

### Tampilan
- Daftar riwayat berurutan terbaru dahulu.
- Metadata: tanggal, hasil, warna pemain, level bot, durasi jika ada.
- Empty state bila belum ada pertandingan.
- Filter/sort hanya jika benar-benar berfungsi.

### Tindakan
- Buka detail, tinjau, hapus dengan konfirmasi, ekspor PGN jika diimplementasikan.
- Hapus riwayat tidak menghapus progres belajar kecuali pengguna memilih reset seluruh data.

## 8. Detail pertandingan — `/archive/[gameId]`

- Papan dapat diputar ulang maju/mundur.
- Daftar langkah tersinkron dengan posisi papan.
- Tampilkan hasil yang sebenarnya tersimpan.
- Analisis engine dipisahkan secara visual dari penjelasan Gemini.
- Jika data lama tidak lengkap atau analisis gagal, tampilkan apa yang tersedia tanpa merusak halaman.
- Pada P0: replay dan metadata dasar. Fitur review mendalam dapat dibangun di P1.

## 9. Pengaturan — `/settings`

Pengaturan minimum:
- Tema: dark sebagai default; opsi lain hanya jika benar-benar didukung.
- Animasi gerak dan reduced motion.
- Orientasi default papan.
- Notasi langkah jika ada lebih dari satu format.
- Hapus riwayat pertandingan.
- Reset progres Akademi/Puzzle.
- Status tutor: tersedia/tidak tersedia; jangan pernah menampilkan API key.

Tindakan destruktif memerlukan konfirmasi yang menjelaskan dampaknya.

## 10. P1 — Echo Room

- Buka posisi dari langkah tertentu.
- Buat variasi/cabang langkah terpisah dari jalur PGN asli.
- Beri label variasi dan opsi hapus cabang.
- Pengguna dapat kembali ke jalur utama.
- Simpan pohon variasi dalam data terpisah; jangan menimpa riwayat asli.

## 11. P1 — Match Autopsy

- Tampilkan momen penting berdasarkan perubahan evaluasi mesin dan legalitas posisi.
- Jelaskan bahwa klasifikasi engine adalah petunjuk analisis, bukan penilaian moral pemain.
- Pengguna memilih sebuah momen, melihat langkah alternatif, kemudian bisa mencoba variasi.
- Tutor menjelaskan alternatif berdasarkan hasil engine yang tersedia.

## 12. Rute yang belum diimplementasikan

Jangan menampilkan route P1/P2 seolah-olah sudah siap. Jika ada preview, beri label “Direncanakan” dan jangan pasang tombol aktif yang berujung pada halaman kosong.
