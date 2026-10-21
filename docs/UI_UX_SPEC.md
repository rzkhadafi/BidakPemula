# UI/UX Specification — Chess Archive

## 1. Tujuan pengalaman

Chess Archive harus terasa seperti ruang kerja pribadi untuk bermain dan mempelajari catur, bukan dashboard analitik yang padat. Pengguna selalu memahami:

1. Di mana mereka berada.
2. Tindakan utama apa yang bisa dilakukan.
3. Apa yang baru saja terjadi.
4. Cara kembali atau membatalkan tindakan bila aman.
5. Apakah tutor/analisis sedang berjalan, selesai, atau tidak tersedia.

## 2. Arsitektur informasi

Navigasi utama desktop:

- Beranda
- Main Catur
- Akademi Catur
- Puzzle
- Arsip Saya

Pengaturan berada sebagai item sekunder di area profil/toolbar. Pada mobile, gunakan top bar sederhana dan bottom navigation atau menu yang jelas; jangan menyusutkan sidebar desktop menjadi ikon tanpa label jika hal itu membuat navigasi ambigu.

Echo Room dan Match Autopsy ditambahkan ke navigasi hanya setelah P1 berfungsi. Tutor menjadi panel kontekstual pada halaman pelajaran/analisis.

## 3. Alur pengguna inti

### Alur A — bermain

Beranda → Mulai permainan → pilih level/warna/jam → bermain → hasil akhir → simpan lokal → tinjau langkah atau kembali ke beranda.

Pengguna boleh memulai permainan tanpa akun. Sebelum meninggalkan permainan aktif, tampilkan konfirmasi hanya jika tindakan akan membuang progres yang belum tersimpan.

### Alur B — belajar

Beranda → Akademi → pilih pelajaran → baca/demonstrasikan konsep → jawab latihan singkat → umpan balik → tandai selesai → lanjut materi berikutnya.

Pelajaran inti tidak memerlukan API. Progres disimpan lokal dan dapat direset dari pengaturan.

### Alur C — puzzle

Puzzle → baca tujuan → buat langkah → validasi → jika salah, jelaskan tanpa mempermalukan → petunjuk berikutnya → selesai → rekomendasi puzzle lain.

### Alur D — bertanya pada tutor

Pengguna memilih “Jelaskan langkah” atau mengirim pertanyaan → UI menampilkan konteks yang akan dipakai → request ke server → loading yang dapat dipahami → penjelasan ringkas → petunjuk atau latihan lanjutan. Jika API tidak tersedia, tampilkan analisis mesin/konten lokal dan jelaskan statusnya.

## 4. Pola interaksi catur

- Mendukung click/tap pada bidak lalu tap petak tujuan serta drag-and-drop bila perangkat mendukungnya.
- Hanya langkah legal yang diterapkan.
- Petak terpilih, langkah terakhir, tujuan legal, raja sedang skak, dan variasi analisis memiliki visual berbeda.
- Saat promosi, tampilkan pilihan bidak yang jelas; jangan otomatis memilih ratu tanpa memberi opsi.
- Umpan balik gerakan tidak mengandalkan suara.
- Input tidak boleh diterima setelah permainan selesai kecuali dalam mode analisis/variasi.
- Bot menunjukkan status berpikir dan dapat dibatalkan saat game direset.
- Jam berhenti sesuai aturan lokal yang ditetapkan; tangani kehilangan fokus/tab dengan kebijakan yang konsisten dan jelaskan bahwa MVP adalah permainan lokal.
- Undo tersedia untuk mode latihan melawan bot. Pada mode permainan normal, tentukan kebijakan sebelum memulai dan tunjukkan dengan jelas agar pengguna tidak kaget.

## 5. Pola AI tutor

- Tutor tidak otomatis memanggil API pada setiap langkah; gunakan tombol eksplisit atau tindakan kontekstual.
- Tunjukkan status AI yang ringkas: “Menganalisis konteks…” dan “Menyiapkan penjelasan…”.
- Penjelasan utama maksimal beberapa paragraf pendek, disusul poin “Perhatikan”, “Mengapa”, dan “Coba sendiri” bila relevan.
- Jangan mengungkap evaluasi centipawn saja tanpa menerjemahkan maknanya.
- Jika analisis mesin belum ada, beri tahu pengguna dan jalankan analisis dahulu bila engine tersedia.
- Jika kuota habis, timeout, offline, atau key belum dikonfigurasi, tampilkan pesan yang tidak menyalahkan pengguna dan berikan opsi mencoba lagi atau membaca materi lokal.
- AI tidak boleh menjalankan langkah, mengubah hasil, atau mengedit PGN secara otomatis.

## 6. Loading, empty, error, dan confirmation state

Setiap screen utama memiliki:

- Loading state yang stabil, tidak menyebabkan layout meloncat besar.
- Empty state yang menerangkan cara memulai.
- Error state dengan pesan ramah, tindakan yang dapat dicoba, dan detail teknis hanya di log internal.
- Disabled state untuk fitur yang tidak relevan dengan status saat ini.
- Confirmation untuk hapus riwayat, reset progres, menyerah, atau meninggalkan game yang belum selesai.
- Success state untuk penyelesaian pelajaran/puzzle tanpa confetti berlebihan.

## 7. Responsivitas

### Desktop

- Beranda memakai navigasi samping atau top navigation ringkas, area konten utama, dan komponen lanjutan secukupnya.
- Layar bermain membagi area papan dan panel informasi tanpa menenggelamkan papan.

### Tablet

- Panel samping dapat dipersempit atau berpindah ke bawah.
- Semua aksi penting tetap dapat ditemukan tanpa hover.

### Mobile

- Papan selebar area konten yang tersedia, rasio 1:1.
- Panel langkah, tutor, dan informasi lawan ditata di bawah papan atau dalam sheet yang dapat dibuka.
- Jam dan status pemain terlihat tanpa scrolling berlebihan.
- Tombol tap memiliki target sentuh yang memadai.
- Hindari modal yang memotong papan saat promosi; gunakan overlay yang responsif.

## 8. Aksesibilitas

- Semantic landmarks: header, nav, main, aside bila sesuai.
- Seluruh tombol dan dialog utama dapat dioperasikan dengan keyboard.
- Focus ring jelas; jangan menghapus outline tanpa pengganti.
- Gunakan live region secukupnya untuk mengumumkan giliran, langkah, hasil game, atau status analisis; jangan mengumumkan setiap perubahan visual kecil.
- Label koordinat papan dan deskripsi move disediakan untuk teknologi bantu bila dimungkinkan oleh komponen.
- Uji kontras dan reduced motion.

## 9. Perilaku data dan privasi

- Sebelum ada akun, data pertandingan dan progres disimpan pada browser pengguna.
- Beri kontrol untuk menghapus riwayat dan reset progres.
- Jangan kirim riwayat seluruh game ke Gemini jika konteks posisi terakhir sudah cukup. Kirim data minimal yang dibutuhkan.
- Jangan menyimpan percakapan tutor selamanya tanpa kebutuhan jelas; kalau disimpan lokal, pengguna dapat menghapusnya.
- Jangan menambahkan analytics/tracking pada MVP.

## 10. Prinsip evaluasi UX

Sebuah halaman baru dianggap selesai jika:

1. Tujuan halaman jelas dalam beberapa detik.
2. Aksi utama terlihat.
3. Kontrol aktif benar-benar bekerja.
4. Tidak ada overflow horizontal pada mobile.
5. Loading/error/empty state punya desain.
6. Pengguna bisa menyelesaikan alur tanpa bantuan teks instruksi dari developer.
7. Tampilan tidak menyimpang dari `DESIGN_SYSTEM.md`.
