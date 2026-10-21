# Chess Engine Specification

## 1. Tujuan

Memberikan permainan standar yang benar, bot dengan beberapa tingkat kesulitan, dan analisis yang dapat digunakan oleh tutor. Legalitas langkah selalu berasal dari chess rules library, bukan Gemini.

## 2. Ruang lingkup aturan

Wajib mendukung:

- Semua gerakan legal raja, ratu, benteng, gajah, kuda, dan pion.
- Menangkap bidak serta larangan meninggalkan raja dalam skak.
- Rokade pendek/panjang dengan semua prasyarat.
- En passant.
- Promosi pion menjadi ratu, benteng, gajah, atau kuda.
- Skak, skakmat, stalemate, material/positional draw sesuai dukungan pustaka, pengulangan posisi, aturan 50 langkah, dan insufficient material sesuai API rules library.
- Giliran, castling rights, en passant target, halfmove/fullmove counter di FEN.
- PGN dengan headers minimum (tanggal lokal opsional, hasil, pemain bot, level bot) dan move history.

Jangan implementasikan aturan catur manual terpisah jika library sudah mengelolanya. Tetap tulis tes untuk memastikan integrasi UI tidak merusak aturan.

## 3. Kontrak data

- Internal move: objek legal move dari rules library.
- Engine move: UCI coordinate format, misalnya `e2e4` atau `e7e8q` untuk promosi, setelah parsing/validasi.
- Display move: SAN, misalnya `Nf3`; jelaskan notasi kepada pemula.
- Position: FEN yang dihasilkan rules library.
- Game record: PGN dan metadata yang tersimpan bersama.

Jangan mencampur notasi SAN dan UCI. Validasi bahwa langkah dari engine ada di daftar langkah legal sebelum diterapkan ke game state.

## 4. Bot architecture

### Worker adapter

- Gunakan engine build browser yang kompatibel dan dikunci pada versi/package yang diverifikasi.
- Jalankan UCI komunikasi di worker.
- Inisialisasi engine sekali per sesi jika stabil, lalu gunakan ulang.
- Sediakan `start`, `stop`, `newGame`, `setDifficulty`, `searchPosition`, dan `dispose` melalui interface aplikasi.
- Parsing output dengan state machine/handler pesan, bukan mencari string secara rapuh di seluruh output.
- Tangani `uciok`, `readyok`, info/evaluation, `bestmove`, timeout, dan error.
- Jangan membekukan UI saat engine berpikir.

## 5. Tingkat bot

Tampilkan istilah tingkat kesulitan dulu: Pemula, Santai, Menengah, Mahir, Sangat Kuat. Angka Elo tidak wajib pada MVP.

Jika angka dipakai, beri label “perkiraan” sampai benchmark membuktikan kekuatan relatif. Konfigurasi Stockfish `UCI_LimitStrength`/`UCI_Elo` tidak boleh diasumsikan menyediakan semua rentang pemula; periksa dukungan pada build yang dipilih.

### Perilaku tingkat rendah

- Pilih dari sekumpulan langkah kandidat yang legal dan masih wajar menurut evaluasi mesin, dengan probabilitas dan batas blunder yang dikalibrasi lewat pengujian.
- Jangan memilih langkah ilegal atau sengaja mengabaikan semua ancaman secara acak.
- Batasi kesalahan ekstrem yang membuat permainan terasa tidak masuk akal.
- Jangan menggunakan “random move only” sebagai AI pemula kecuali sebagai mode khusus yang diberi label jelas.

### Perilaku tingkat menengah/tinggi

- Gunakan limit pencarian berbeda atau pengaturan strength yang didukung engine.
- Atur waktu/depth dan tingkat kesalahan dengan konservatif.
- Pastikan engine berhenti saat game reset atau berakhir.

## 6. Kalibrasi level

1. Sebelum benchmark, UI hanya menyebut level kesulitan.
2. Siapkan pool posisi pembuka dan variasi yang cukup untuk mengurangi bias satu pembukaan.
3. Mainkan ribuan game atau jumlah uji yang memadai antar level dan/atau lawan pembanding dengan aturan waktu yang sama. Pada prototipe, jumlah lebih kecil boleh dipakai untuk indikasi awal, bukan klaim rating resmi.
4. Catat hasil, color balance, draw rate, time control, setting engine, versi package, dan perangkat.
5. Jika rating dipublikasikan, jelaskan bahwa rating adalah estimasi internal Chess Archive, bukan rating FIDE atau situs lain.
6. Uji apakah level berurutan menunjukkan kekuatan berbeda secara statistik/praktis.

## 7. Game flow

- Pemain memilih warna/acak, level bot, mode latihan, dan kontrol waktu opsional.
- Jika pemain hitam, bot membuat langkah pertama setelah board/engine siap.
- Setelah langkah pemain legal diterima, simpan SAN/UCI, FEN, update move list, lalu periksa status game.
- Jika belum selesai, kirim posisi baru ke engine; terapkan bot move hanya setelah divalidasi legal.
- Hindari race condition akibat klik ganda atau pesan engine lama.
- Jika user membatalkan/reset, abaikan hasil pencarian yang berasal dari game generation sebelumnya.
- Saat game selesai, hentikan jam/search, tampilkan hasil, dan simpan game jika pengguna mengonfirmasi atau kebijakan autosave sudah jelas.

## 8. Mode latihan

Undo diperbolehkan dalam mode latihan, dengan kebijakan jelas apakah satu atau dua ply dikembalikan. Reset game harus menghapus variasi aktif, menghentikan worker search, dan menjaga riwayat lama yang sudah diarsipkan.

## 9. Analisis posisi

- Analisis hanya berjalan ketika diminta, setelah game selesai, atau pada posisi yang dipilih—bukan setiap render.
- Evaluasi dinormalisasi dari perspektif pemain yang sama sebelum dibandingkan.
- PV engine dikonversi/ditafsirkan dengan rules library untuk menghasilkan SAN.
- Engine evaluation bukan kebenaran mutlak; sertakan depth/time limit bila menampilkan angka.
- Kategori “blunder/mistake/inaccuracy” hanya ditampilkan jika threshold dan perspektif evaluasi sudah ditentukan serta diuji.

## 10. Fallback dan error

- Jika engine gagal dimuat, berikan opsi retry dan tetap izinkan pengguna membaca materi/puzzle lokal jika tidak butuh engine.
- Jangan memanggil fallback random secara diam-diam.
- Jangan menerapkan engine best move jika parse gagal, game sudah selesai, posisi berubah, atau move tidak legal.

## 11. Test minimum

- Legalitas gerak tiap jenis bidak.
- Rokade valid/tidak valid.
- En passant valid dan batas hak en passant.
- Semua pilihan promosi.
- Check/checkmate/stalemate.
- Threefold/repetition dan aturan draw yang didukung library.
- Reset selama engine search.
- Bot black first move.
- Game over menghentikan input dan search.
- UCI bestmove yang ilegal/malformed diabaikan dan dilog tanpa membocorkan data sensitif.
- Tingkat bot terendah/tertinggi memiliki pengaturan berbeda dan perilaku yang dapat dibuktikan.

## 12. Lisensi

Catat nama package, versi, build file, lisensi, dan sumber binary Stockfish yang didistribusikan. Stockfish dan build turunannya memiliki kewajiban GPL; verifikasi pemenuhan distribusi/source notices sesuai package aktual sebelum rilis.
