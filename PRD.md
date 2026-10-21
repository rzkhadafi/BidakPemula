# Product Requirements Document — Chess Archive

- **Versi:** 1.0 baseline
- **Tanggal:** 21 Oktober 2026
- **Status:** Siap menjadi sumber spesifikasi untuk proyek kosong
- **Nama produk:** Chess Archive (nama kerja; pemeriksaan nama/domain dilakukan sebelum publikasi)
- **Bahasa utama:** Bahasa Indonesia

## 1. Ringkasan produk

Chess Archive adalah website catur yang menggabungkan permainan melawan bot, materi belajar berbahasa Indonesia, puzzle taktik, arsip pertandingan lokal, dan guru AI opsional. Identitas produk menggunakan metafora arsip strategi: pertandingan menjadi catatan yang dapat dipelajari ulang, bukan sekadar skor yang selesai ditampilkan.

Produk tidak mencoba menjadi klon langsung platform catur besar. Pembeda utamanya adalah alur belajar: **bermain → meninjau keputusan → memahami alasan → mencoba lagi**.

## 2. Visi dan proposisi nilai

**Visi:** menjadi tempat belajar dan bermain catur yang terasa tenang, jelas, dan bersahabat bagi pemain Indonesia dari pemula hingga menengah.

**Janji produk:**

1. Catur dapat dimainkan tanpa membuat akun.
2. Materi dan UI utama menggunakan bahasa Indonesia yang konsisten.
3. Pemain bisa meminta penjelasan, tetapi tidak dipaksa menggunakan AI untuk semua hal.
4. Analisis taktis berasal dari mesin catur; AI bahasa menjelaskan analisis tersebut dengan cara yang mudah dipahami.
5. Riwayat lokal dan materi inti tetap berguna ketika Gemini tidak tersedia.

## 3. Masalah yang diselesaikan

- Pemula sering menemukan materi catur yang terlalu teknis atau tidak konsisten dalam bahasa Indonesia.
- Analisis yang hanya memberi evaluasi atau label kesalahan tidak selalu menerangkan apa yang seharusnya dipelajari pemain.
- Banyak produk catur menonjolkan rating dan kompetisi, sementara pengguna yang ingin belajar secara santai membutuhkan alur latihan bertahap.

## 4. Target pengguna

### Persona A — Pemula

Belum memahami semua aturan, membutuhkan demonstrasi visual, definisi istilah, petunjuk bertahap, dan latihan kecil.

### Persona B — Pemain kasual

Sudah bisa bermain, ingin melawan bot dengan beberapa level kesulitan dan menyimpan permainan untuk dilihat lagi.

### Persona C — Pemain yang ingin berkembang

Ingin memahami taktik yang terlewat, mengeksplorasi variasi, dan melihat pola kesalahan tanpa harus menafsirkan evaluasi mesin sendirian.

## 5. Prinsip produk

- **Board-first:** papan catur menjadi fokus utama pada layar bermain dan latihan.
- **Bahasa yang membantu:** gunakan istilah Indonesia, lalu jelaskan istilah standar seperti fork, pin, skewer, tempo, dan endgame saat pertama muncul.
- **AI jujur:** jelaskan kapan hasil berasal dari Stockfish dan kapan teks disusun oleh Gemini. Jangan menyajikan inferensi AI sebagai fakta mesin.
- **Local-first:** versi pertama tidak mewajibkan akun, server database, atau penyimpanan cloud.
- **Aksesibel:** sediakan interaksi klik/tap selain drag-and-drop serta dukungan keyboard yang layak.
- **Tidak penuh ornamen:** animasi hanya memperjelas tindakan atau perubahan status.
- **Tidak ada kontrol palsu:** semua kontrol aktif harus benar-benar berfungsi.

## 6. Ruang lingkup produk

### P0 — MVP yang wajib bekerja

1. Website responsif dengan identitas visual Chess Archive.
2. Beranda dan navigasi utama berbahasa Indonesia.
3. Permainan lokal melawan bot komputer menggunakan aturan catur standar.
4. Pemilihan warna bidak, orientasi papan, tingkat bot, mode latihan, mulai ulang, undo pada mode latihan, dan pengaturan suara/animasi bila suara memang diimplementasikan.
5. Status skak, skakmat, stalemate/remis, promosi pion, rokade, en passant, dan hasil akhir yang benar.
6. Jam catur opsional dengan pilihan preset; jam tidak boleh menjadi syarat agar permainan dasar dapat berjalan.
7. Materi Akademi Catur dasar berisi konten kurasi lokal, bukan dijawab seluruhnya oleh AI.
8. Puzzle dengan posisi awal, tujuan, solusi tervalidasi, petunjuk bertahap, dan umpan balik.
9. Tutor Gemini opsional melalui backend; bila API key belum dipasang, tampilkan keadaan tidak tersedia dengan penjelasan dan materi alternatif.
10. Arsip pertandingan dan progres belajar di perangkat pengguna.
11. Analisis Stockfish setelah pertandingan jika engine tersedia; jika tidak, tampilkan fallback yang jujur.
12. Tes otomatis untuk aturan kritis, integrasi engine, tutor API, serta alur utama.

### P1 — Pengembangan setelah MVP stabil

1. Echo Room: membuat cabang variasi dari posisi historis tanpa mengubah PGN asli.
2. Match Autopsy: memilih titik balik lalu membandingkan langkah permainan dengan alternatif mesin.
3. Rekomendasi latihan yang diturunkan dari pola kesalahan lokal.
4. Penyelesaian UX lanjutan untuk riwayat, filter, dan ekspor PGN.

### P2 — Tidak dikerjakan pada MVP

- Multiplayer real-time, matchmaking, undangan teman, chat sosial.
- Akun, autentikasi, sinkronisasi cloud, profil publik, leaderboard global.
- Pembayaran, langganan, iklan, tracking analitik pihak ketiga.
- Klaim rating resmi atau Elo bot akurat tanpa pengujian.
- Model AI yang dilatih sendiri atau integrasi beberapa LLM.

## 7. Navigasi dan rute yang diharapkan

- `/` — Beranda
- `/play` — Main Catur
- `/academy` — Akademi Catur
- `/academy/[lessonId]` — Layar pelajaran
- `/puzzles` — Puzzle
- `/archive` — Arsip Saya
- `/archive/[gameId]` — Detail pertandingan
- `/settings` — Pengaturan

Echo Room dan Match Autopsy dibuat pada P1 dan baru ditambahkan ke navigasi setelah implementasinya berfungsi. Tutor AI muncul sebagai panel kontekstual pada pelajaran/analisis, bukan sebagai halaman kosong tersendiri pada MVP.

## 8. Persyaratan fungsional

### F-01 — Navigasi

Pengguna harus dapat berpindah ke semua halaman P0 melalui navigasi yang konsisten; lokasi saat ini terlihat jelas.

### F-02 — Permainan legal

Semua langkah pemain dan bot divalidasi menggunakan pustaka aturan catur. Langkah ilegal tidak boleh mengubah posisi atau riwayat.

### F-03 — Bot

Bot mengambil langkah legal, tidak memblokir antarmuka selama berpikir, dapat dihentikan/direset saat permainan dibatalkan, dan menyediakan status berpikir yang terlihat.

### F-04 — Tingkat bot

Tampilkan level sebagai tingkat kesulitan. Angka Elo, jika ditampilkan, adalah **perkiraan target** dan harus didukung hasil benchmark. Level terendah boleh menggunakan pemilihan langkah berkualitas terkontrol; tidak boleh hanya memilih langkah acak yang membuat bot tampak rusak.

### F-05 — Materi belajar

Setiap pelajaran berisi tujuan, penjelasan, diagram/posisi yang relevan, interaksi atau latihan, progres, dan tombol navigasi pelajaran berikutnya/sebelumnya.

### F-06 — Puzzle

Puzzle memvalidasi langkah solusi, menangani variasi yang diizinkan, mendukung petunjuk bertingkat, dan memberi penjelasan setelah selesai.

### F-07 — Tutor

Tutor hanya aktif jika konfigurasi server tersedia. Request dikirim ke endpoint server, dibatasi dan divalidasi. Tutor menerima konteks posisi dan hasil analisis; ia tidak pernah langsung mengubah state papan.

### F-08 — Arsip

Simpan ID lokal, tanggal, sisi pemain, hasil, level bot, durasi bila tersedia, FEN akhir, dan PGN. Pengguna dapat membuka dan meninjau permainan tersimpan serta menghapusnya.

### F-09 — Privasi dan fallback

Tidak perlu mengumpulkan data pribadi pada MVP. Jika Gemini gagal atau kuota habis, permainan, puzzle lokal, dan pelajaran tetap berjalan.

## 9. Persyaratan nonfungsional

- TypeScript strict mode.
- Layout nyaman pada layar sekitar 360 px hingga desktop lebar.
- Tidak ada horizontal overflow pada halaman utama di mobile.
- Interaksi papan dan navigasi tetap responsif saat engine berpikir; engine berjalan dalam Worker.
- Tangani error dan loading state secara eksplisit.
- Hindari menyimpan API key dan data sensitif pada browser.
- Gunakan semantic HTML, focus state yang terlihat, kontras teks yang memadai, dan preferensi `prefers-reduced-motion`.
- Jangan memasukkan layanan eksternal yang memerlukan biaya sebelum pengguna menyetujui dampaknya.

## 10. Kriteria penerimaan MVP

1. Pengguna dapat membuka website dan memulai permainan tanpa akun.
2. Semua aturan standar termasuk promosi, rokade, en passant, skakmat dan stalemate bekerja berdasarkan tes.
3. Bot membuat langkah legal, dan UI tetap bisa merespons ketika bot berpikir.
4. Pemain dapat memainkan level yang berbeda; tingkat kesulitannya memiliki perilaku yang diuji, bukan hanya label.
5. Pengguna menyelesaikan materi dan puzzle tanpa perlu Gemini API.
6. Saat kunci Gemini tidak ada, panel tutor menampilkan fallback yang jelas, bukan error mentah.
7. Saat Gemini aktif, key hanya berada di server; request serta output mengikuti skema yang divalidasi.
8. Riwayat permainan bertahan setelah reload pada browser/perangkat yang sama dan dapat dihapus pengguna.
9. `lint`, `typecheck`, test suite, dan production build lulus; semua pengecualian dijelaskan.
10. Halaman Home, Play, Academy, Puzzle, Archive, dan Settings sudah diperiksa secara visual pada desktop dan mobile.

## 11. Bukan tujuan MVP

Chess Archive bukan platform turnamen, jejaring sosial, sistem rating kompetitif, atau konsultasi AI tanpa batas. Jangan membangun fitur tersebut sebelum ruang lingkup P0 memenuhi acceptance criteria.

## 12. Risiko dan mitigasi

- **Rating bot tidak sesuai angka:** jangan klaim akurasi Elo; benchmark bot melalui banyak game dan gunakan label tingkat kesulitan sampai tervalidasi.
- **LLM memberi analisis salah:** mesin catur adalah sumber data taktis; Gemini hanya menjelaskan konteks yang sudah diberikan.
- **Kunci API disalahgunakan:** server-side only, rate limits, panjang input/output dibatasi, kuota dipantau, fallback ketika key tidak ada.
- **Lisensi engine:** simpan metadata package/build, lisensi, dan source notices yang diperlukan.
- **Lingkup terlalu besar:** gunakan fase dan gate, jangan melompat sebelum tes fase saat ini lolos.
