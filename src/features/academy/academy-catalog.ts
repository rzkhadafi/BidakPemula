import { AcademyLesson } from "./types";

export const ACADEMY_LESSONS: AcademyLesson[] = [
  // ==========================================
  // PELAJARAN 1: MENGENAL PAPAN CATUR
  // ==========================================
  {
    id: "mengenal-papan",
    order: 1,
    title: "Mengenal Papan Catur",
    subtitle: "64 petak, lajur a–h, dan baris 1–8",
    summary: "Memahami struktur medan tempur catur: 64 petak hitam dan putih, cara membaca koordinat petak, serta orientasi papan yang benar.",
    duration: "4 menit",
    conceptHeading: "Medan Pertempuran Catur",
    conceptBody: [
      "Papan catur terdiri dari 64 petak datar dengan warna terang dan gelap yang berselang-seling.",
      "Lajur vertikal diberi nama huruf alfabet 'a' sampai 'h' dari kiri ke kanan (sudut pandang putih).",
      "Baris horizontal diberi nomor '1' sampai '8' dari sisi putih ke sisi hitam.",
      "Aturan penting: Petak di sudut kanan bawah setiap pemain harus selalu berwarna TERANG.",
    ],
    takeaways: [
      "Papan catur memiliki 64 petak (8 lajur × 8 baris).",
      "Setiap petak memiliki alamat unik berupa huruf lajur dan angka baris (misalnya e4 atau d5).",
      "Empat petak di tengah (d4, e4, d5, e5) disebut pusat papan dan merupakan wilayah paling penting.",
    ],
    steps: [
      {
        id: "papan-step-1",
        stepNumber: 1,
        instruction: "Tunjukkan Petak Pusat e4",
        subText: "Klik atau sentuh petak e4 pada papan catur (pertemuan lajur e dan baris 4).",
        fen: "8/8/8/8/8/8/8/8 w - - 0 1",
        targetSquare: "e4",
        hint: "Cari huruf 'e' di bagian bawah papan dan angka '4' di sisi kiri papan.",
        explanationOnSuccess: "Tepat sekali! Petak e4 adalah salah satu dari 4 petak pusat utama tempat pertempuran sering berawal.",
      },
      {
        id: "papan-step-2",
        stepNumber: 2,
        instruction: "Tunjukkan Petak Pusat d5",
        subText: "Klik petak d5 yang merupakan petak pusat kunci bagi kubu hitam.",
        fen: "8/8/8/8/8/8/8/8 w - - 0 1",
        targetSquare: "d5",
        hint: "Temukan lajur 'd' dan naik ke baris nomor '5'.",
        explanationOnSuccess: "Luar biasa! Bersama petak e4, d4, dan e5, petak d5 membentuk jantung pertarungan papan.",
      },
      {
        id: "papan-step-3",
        stepNumber: 3,
        instruction: "Tunjukkan Sudut Kanan Bawah Putih (h1)",
        subText: "Ingat prinsip: 'Sudut kanan selalu terang'. Klik petak h1.",
        fen: "8/8/8/8/8/8/8/8 w - - 0 1",
        targetSquare: "h1",
        hint: "Cari petak paling kanan di baris pertama (lajur h, baris 1).",
        explanationOnSuccess: "Sempurna! Petak h1 selalu menjadi patokan bahwa orientasi papan sudah terpasang dengan benar.",
      },
    ],
  },

  // ==========================================
  // PELAJARAN 2: GERAKAN BENTENG
  // ==========================================
  {
    id: "gerak-benteng",
    order: 2,
    title: "Gerakan Bidak: Benteng",
    subtitle: "Meluncur lurus vertikal dan horizontal",
    summary: "Benteng adalah perwira berat yang memiliki daya jelajah lurus tanpa batas sejauh jalurnya tidak terhalang bidak lain.",
    duration: "5 menit",
    conceptHeading: "Kekuatan Garis Lurus Benteng",
    conceptBody: [
      "Benteng bergerak lurus ke depan, belakang, kiri, atau kanan sebanyak petak yang diinginkan.",
      "Benteng tidak bisa melompati bidak teman maupun lawan.",
      "Benteng menangkap bidak lawan dengan menempati petak tempat bidak lawan berada.",
    ],
    takeaways: [
      "Benteng menguasai lajur dan baris terbuka.",
      "Nilai benteng setara dengan 5 poin (perwira berat).",
      "Dua benteng yang saling terhubung di baris yang sama memiliki kekuatan pertahanan dan serangan ganda.",
    ],
    steps: [
      {
        id: "benteng-step-1",
        stepNumber: 1,
        instruction: "Luncurkan Benteng ke Baris 7 (d7)",
        subText: "Klik benteng di d4, lalu klik petak sasaran d7 untuk meluncur lurus ke depan.",
        fen: "8/8/8/8/3R4/8/8/4K2k w - - 0 1",
        expectedMoveUci: "d4d7",
        hint: "Pindahkan benteng dari d4 lurus ke atas hingga mencapai petak d7.",
        explanationOnSuccess: "Hebat! Benteng meluncur cepat ke baris 7, posisi strategis untuk mengancam wilayah lawan.",
      },
      {
        id: "benteng-step-2",
        stepNumber: 2,
        instruction: "Tangkap Pion Lawan di g7",
        subText: "Luncurkan benteng secara horizontal ke kanan untuk memukul pion hitam di g7.",
        fen: "8/3R2p1/8/8/8/8/8/4K2k w - - 0 1",
        expectedMoveUci: "d7g7",
        hint: "Klik benteng di d7, lalu klik petak g7 tempat pion hitam berada.",
        explanationOnSuccess: "Bagus sekali! Benteng menangkap bidak lawan dengan menyingkirkannya dan menduduki petak tersebut.",
      },
    ],
  },

  // ==========================================
  // PELAJARAN 3: GERAKAN GAJAH
  // ==========================================
  {
    id: "gerak-gajah",
    order: 3,
    title: "Gerakan Bidak: Gajah",
    subtitle: "Meluncur miring diagonal sesuai warna petak",
    summary: "Gajah bergerak diagonal tanpa batas jarak, namun terikat selamanya pada satu warna petak tempat ia memulai permainan.",
    duration: "5 menit",
    conceptHeading: "Penjelajah Diagonal Papan",
    conceptBody: [
      "Setiap pemain memiliki dua gajah: satu gajah petak terang dan satu gajah petak gelap.",
      "Gajah bergerak miring (diagonal) sejauh tidak ada bidak yang menghalangi.",
      "Gajah tidak pernah bisa berpindah ke warna petak yang berlawanan sepanjang permainan.",
    ],
    takeaways: [
      "Gajah bernilai sekitar 3 poin (perwira ringan).",
      "Gajah sangat kuat di posisi terbuka dengan diagonal panjang tanpa halangan pion.",
      "Sepasang gajah (gajah terang dan gajah gelap) saling melengkapi untuk mengontrol seluruh warna petak.",
    ],
    steps: [
      {
        id: "gajah-step-1",
        stepNumber: 1,
        instruction: "Gerakkan Gajah Diagonal ke f7",
        subText: "Langkahkan gajah petak terang dari c4 miring ke petak f7.",
        fen: "8/8/8/8/2B5/8/8/4K2k w - - 0 1",
        expectedMoveUci: "c4f7",
        hint: "Ikuti garis miring warna terang dari c4 menuju f7.",
        explanationOnSuccess: "Tepat! Gajah meluncur mulus sepanjang diagonal petak terang.",
      },
      {
        id: "gajah-step-2",
        stepNumber: 2,
        instruction: "Tangkap Kuda Lawan di g8",
        subText: "Lanjutkan gerakan miring gajah untuk menangkap kuda hitam di g8.",
        fen: "8/5B2/8/8/8/8/8/4K1nk w - - 0 1",
        expectedMoveUci: "f7g8",
        hint: "Klik gajah di f7, lalu klik kuda hitam di g8.",
        explanationOnSuccess: "Bagus! Anda berhasil memanfaatkan garis diagonal gajah untuk menumbangkan perwira lawan.",
      },
    ],
  },

  // ==========================================
  // PELAJARAN 4: GERAKAN MENTERI
  // ==========================================
  {
    id: "gerak-menteri",
    order: 4,
    title: "Gerakan Bidak: Menteri (Ratu)",
    subtitle: "Perpaduan kekuatan benteng dan gajah",
    summary: "Menteri adalah perwira paling fleksibel dan mematikan di atas papan karena dapat meluncur lurus maupun miring ke segala arah.",
    duration: "5 menit",
    conceptHeading: "Perwira Terkuat di Papan Catur",
    conceptBody: [
      "Menteri bisa bergerak lurus seperti benteng (baris dan lajur) DAN miring seperti gajah (diagonal).",
      "Menteri tidak bisa melompati bidak lain.",
      "Karena nilainya yang sangat tinggi (9 poin), jaga menteri Anda agar tidak ditukar dengan perwira bernilai lebih rendah.",
    ],
    takeaways: [
      "Menteri bernilai 9 poin (perwira terkuat).",
      "Hindari mengeluarkan menteri terlalu dini di awal permainan agar tidak menjadi sasaran empuk serangan lawan.",
      "Menteri paling efektif saat dikombinasikan dengan perwira pendukung seperti benteng atau kuda.",
    ],
    steps: [
      {
        id: "menteri-step-1",
        stepNumber: 1,
        instruction: "Gerakkan Menteri secara Diagonal ke a7",
        subText: "Tunjukkan kemampuan menteri bergerak miring dengan meluncur dari d4 ke a7.",
        fen: "8/8/8/8/3Q4/8/8/4K2k w - - 0 1",
        expectedMoveUci: "d4a7",
        hint: "Klik menteri di d4, lalu klik petak a7 di sudut kiri atas.",
        explanationOnSuccess: "Hebat! Menteri menguasai diagonal panjang ke sayap menteri.",
      },
      {
        id: "menteri-step-2",
        stepNumber: 2,
        instruction: "Luncurkan Menteri Lurus untuk Menangkap Benteng di g7",
        subText: "Dari petak a7, gerakkan menteri lurus secara horizontal ke kanan untuk memukul benteng g7.",
        fen: "8/Q5r1/8/8/8/8/8/4K2k w - - 0 1",
        expectedMoveUci: "a7g7",
        hint: "Manfaatkan gerakan horizontal menteri dari a7 langsung ke petak g7.",
        explanationOnSuccess: "Sempurna! Kombinasi gerak lurus dan miring menjadikan menteri senjata pamungkas dalam catur.",
      },
    ],
  },

  // ==========================================
  // PELAJARAN 5: GERAKAN KUDA
  // ==========================================
  {
    id: "gerak-kuda",
    order: 5,
    title: "Gerakan Bidak: Kuda",
    subtitle: "Lompatan unik berbentuk huruf 'L'",
    summary: "Kuda adalah satu-satunya bidak yang dapat melompati bidak lain dengan pola langkah 2 petak lurus dan 1 petak belok.",
    duration: "6 menit",
    conceptHeading: "Sang Pelompat Papan",
    conceptBody: [
      "Gerakan kuda membentuk huruf 'L': dua petak lurus (ke arah mana saja), lalu satu petak belok 90 derajat.",
      "Kuda adalah SATU-SATUNYA bidak yang bisa melompati bidak kawan maupun lawan.",
      "Setiap kali melompat, kuda selalu berpindah ke petak yang BERLAWANAN warna dari petak asalnya.",
    ],
    takeaways: [
      "Kuda bernilai 3 poin (setara gajah).",
      "Kuda sangat tangguh di posisi tertutup karena kemampuannya melompati rintangan.",
      "Kuda di pusat papan dapat mengontrol hingga 8 petak sekaligus.",
    ],
    steps: [
      {
        id: "kuda-step-1",
        stepNumber: 1,
        instruction: "Lompatkan Kuda Pola 'L' ke f5",
        subText: "Gerakkan kuda dari d4 ke petak f5 (2 petak ke kanan, 1 petak ke atas).",
        fen: "8/8/8/8/3N4/8/8/4K2k w - - 0 1",
        expectedMoveUci: "d4f5",
        hint: "Hitung dua petak ke kanan (e4, f4) lalu belok satu petak ke atas menuju f5.",
        explanationOnSuccess: "Luar biasa! Lompatan huruf L dieksekusi dengan sempurna.",
      },
      {
        id: "kuda-step-2",
        stepNumber: 2,
        instruction: "Tangkap Pion Hitam di g7",
        subText: "Lompatkan kuda melewati baris pertahanan untuk memukul pion g7.",
        fen: "8/6p1/8/5N2/8/8/8/4K2k w - - 0 1",
        expectedMoveUci: "f5g7",
        hint: "Dari f5, kuda melompat 1 petak ke kanan dan 2 petak ke atas menuju g7.",
        explanationOnSuccess: "Hebat! Kuda mengunci sasaran tanpa terhalang apa pun di jalurnya.",
      },
    ],
  },

  // ==========================================
  // PELAJARAN 6: GERAKAN PION
  // ==========================================
  {
    id: "gerak-pion",
    order: 6,
    title: "Gerakan Bidak: Pion",
    subtitle: "Maju pantang mundur, memukul secara miring",
    summary: "Pion adalah prajurit garis depan. Pion melangkah maju lurus satu petak, namun memukul bidak lawan secara diagonal.",
    duration: "5 menit",
    conceptHeading: "Prajurit Garis Depan",
    conceptBody: [
      "Pion hanya bisa bergerak MAJU, tidak pernah bisa mundur.",
      "Dari petak awalnya di baris ke-2 (putih) atau baris ke-7 (hitam), pion boleh memilih maju 1 atau 2 petak sekaligus.",
      "Pion memukul lawan secara DIAGONAL satu petak ke depan. Pion tidak bisa memukul lurus ke depan.",
    ],
    takeaways: [
      "Pion bernilai 1 poin dasar perwira.",
      "Struktur pion menentukan medan pertempuran (jalur terbuka atau tertutup).",
      "Pion yang berhasil mencapai baris ujung lawan akan dipromosikan menjadi perwira tinggi!",
    ],
    steps: [
      {
        id: "pion-step-1",
        stepNumber: 1,
        instruction: "Dorong Pion Maju Dua Petak (e2 ke e4)",
        subText: "Karena masih di petak awal, pion putih boleh langsung melesat 2 petak ke e4.",
        fen: "8/8/8/8/8/8/4P3/4K2k w - - 0 1",
        expectedMoveUci: "e2e4",
        hint: "Klik pion di e2, lalu dorong dua langkah ke petak e4.",
        explanationOnSuccess: "Sempurna! Langkah pembuka klasik untuk menguasai pusat papan.",
      },
      {
        id: "pion-step-2",
        stepNumber: 2,
        instruction: "Pukul Pion Lawan secara Miring (e4xd5)",
        subText: "Tangkap pion hitam di d5 dengan gerakan miring satu petak ke depan kiri.",
        fen: "8/8/8/3p4/4P3/8/8/4K2k w - - 0 1",
        expectedMoveUci: "e4d5",
        hint: "Ingat: pion memukul miring! Klik pion di e4 lalu klik pion lawan di d5.",
        explanationOnSuccess: "Bagus sekali! Anda memahami perbedaan gerak melangkah dan gerak memukul pada pion.",
      },
    ],
  },

  // ==========================================
  // PELAJARAN 7: RAJA & SKAK
  // ==========================================
  {
    id: "gerak-raja-dan-skak",
    order: 7,
    title: "Raja, Skak, dan Skakmat",
    subtitle: "Melindungi pemimpin dan menuntaskan kemenangan",
    summary: "Raja adalah bidak terpenting. Jika raja diserang, Anda berada dalam kondisi skak dan wajib menyelamatkannya seketika.",
    duration: "6 menit",
    conceptHeading: "Jantung Permainan Catur",
    conceptBody: [
      "Raja bergerak satu petak ke segala arah (vertikal, horizontal, atau diagonal).",
      "SKAK (Check) adalah kondisi saat raja sedang diserang oleh bidak lawan. Anda WAJIB merespons skak dengan 3 cara: Menyingkirkan raja, Menutup serangan, atau Memukul penyerang.",
      "SKAKMAT (Checkmate) terjadi jika raja terkena skak dan TIDAK ADA SATUPUN cara legal untuk menyelamatkannya. Ini adalah tanda akhir kemenangan!",
      "Raja tidak pernah boleh melangkah ke petak yang sedang diserang lawan.",
    ],
    takeaways: [
      "Raja tidak memiliki nilai poin karena kehilangan raja berarti kekalahan seketika.",
      "Tiga cara lepas dari skak: Lari, Tutup, atau Pukul (L-T-P).",
      "Stalemate (remis jalan buntu) terjadi jika raja TIDAK dalam keadaan skak, tetapi pemain tidak memiliki satupun langkah legal.",
    ],
    steps: [
      {
        id: "raja-step-1",
        stepNumber: 1,
        instruction: "Selamatkan Raja dari Skak Benteng",
        subText: "Raja putih di e1 sedang diserang lurus oleh benteng hitam di e8. Langkahkan raja ke petak aman di d2.",
        fen: "4r2k/8/8/8/8/8/8/4K3 w - - 0 1",
        allowedMovesUci: ["e1d2", "e1d1", "e1f1", "e1f2"],
        hint: "Raja harus menyingkir keluar dari lajur e yang sedang dikuasai benteng hitam.",
        explanationOnSuccess: "Hebat! Raja berhasil melangkah ke petak aman yang bebas dari ancaman garis serangan lawan.",
      },
    ],
  },

  // ==========================================
  // PELAJARAN 8: GERAKAN KHUSUS
  // ==========================================
  {
    id: "gerakan-khusus",
    order: 8,
    title: "Gerakan Khusus: Rokade & Promosi",
    subtitle: "Manuver gabungan dan kebangkitan menteri",
    summary: "Dua aturan istimewa yang mengubah dinamika permainan: rokade untuk mengamankan raja dan promosi pion menjadi perwira tertinggi.",
    duration: "6 menit",
    conceptHeading: "Aturan Istimewa Catur",
    conceptBody: [
      "ROKADE (Castling): Satu-satunya langkah di mana raja dan benteng bergerak bersamaan. Raja melangkah 2 petak ke arah benteng, lalu benteng melompati raja ke petak sebelahnya.",
      "Syarat rokade: Raja dan benteng belum pernah bergerak, tidak ada bidak di antara keduanya, dan raja tidak sedang atau melewati petak skak.",
      "PROMOSI PION (Pawn Promotion): Saat pion berhasil berjuang menembus hingga baris ke-8 lawan, pion dapat langsung berubah wujud menjadi Menteri, Benteng, Gajah, atau Kuda!",
    ],
    takeaways: [
      "Rokade sangat krusial di awal permainan untuk membawa raja ke sudut aman dan mengaktifkan benteng ke pusat.",
      "Promosi pion hampir selalu memilih Menteri (Queen) karena kekuatannya yang tertinggi (disebut Queening).",
    ],
    steps: [
      {
        id: "khusus-step-1",
        stepNumber: 1,
        instruction: "Lakukan Rokade Pendek (Kingside Castling)",
        subText: "Amankan raja dengan melangkah 2 petak dari e1 ke g1. Benteng h1 akan otomatis melompat ke f1.",
        fen: "r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1",
        expectedMoveUci: "e1g1",
        hint: "Klik raja di e1, lalu klik petak g1 untuk mengeksekusi rokade pendek.",
        explanationOnSuccess: "Sempurna! Raja kini aman di sudut pertahanan dan benteng siap beraksi di lajur pusat.",
      },
      {
        id: "khusus-step-2",
        stepNumber: 2,
        instruction: "Promosikan Pion Menjadi Menteri di e8",
        subText: "Dorong pion dari e7 ke baris akhir e8 dan pilih Menteri sebagai perwira pengganti.",
        fen: "8/4P3/8/8/8/8/8/4K2k w - - 0 1",
        allowedMovesUci: ["e7e8q", "e7e8r", "e7e8b", "e7e8n"],
        hint: "Dorong pion ke petak e8, lalu konfirmasi pilihan promosi Menteri.",
        explanationOnSuccess: "Luar biasa! Pion Anda telah berevolusi menjadi Menteri baru, siap memenangkan pertandingan!",
      },
    ],
  },

  // ==========================================
  // PELAJARAN 9: STRATEGI DASAR PEMULA
  // ==========================================
  {
    id: "strategi-dasar",
    order: 9,
    title: "Prinsip Strategi untuk Pemula",
    subtitle: "Empat pilar utama di langkah-langkah awal",
    summary: "Pelajari cara memulai pertandingan seperti pemain terampil: kuasai pusat, aktifkan perwira, amankan raja, dan jangan beri bidak gratis.",
    duration: "6 menit",
    conceptHeading: "Prinsip Emas Pembukaan Catur",
    conceptBody: [
      "1. KUASAI PUSAT: Tempatkan pion di petak pusat (e4, d4) untuk mendominasi ruang gerak papan.",
      "2. KEMBANGKAN PERWIRA: Utamakan mengeluarkan kuda dan gajah terlebih dahulu sebelum perwira berat.",
      "3. AMANKAN RAJA: Lakukan rokade secepat mungkin agar raja tidak terjebak di tengah papan.",
      "4. PERIKSA KEAMANAN: Sebelum melangkah, selalu tanyakan: 'Apakah ada bidakku yang tidak terjaga?' dan 'Apa ancaman lawan?'.",
    ],
    takeaways: [
      "Jangan menggerakkan bidak yang sama berulang kali di awal permainan.",
      "Kembangkan perwira menuju pusat, bukan ke tepi papan.",
      "Catur adalah permainan kerja sama seluruh perwira, bukan pertarungan satu bidak saja.",
    ],
    steps: [
      {
        id: "strategi-step-1",
        stepNumber: 1,
        instruction: "Buka Permainan dengan Pion Pusat (e2 ke e4)",
        subText: "Mulai permainan dengan menguasai petak pusat dan membuka jalan bagi gajah dan menteri.",
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        expectedMoveUci: "e2e4",
        allowedMovesUci: ["e2e4", "d2d4"],
        hint: "Dorong pion raja dari e2 dua petak ke e4.",
        explanationOnSuccess: "Langkah terbaik! Anda kini mengontrol petak d5 dan f5 serta membuka jalan bagi perwira Anda.",
      },
      {
        id: "strategi-step-2",
        stepNumber: 2,
        instruction: "Kembangkan Kuda Menuju Pusat (Nf3)",
        subText: "Aktifkan kuda dari g1 ke f3 untuk menyerang pusat dan bersiap melakukan rokade.",
        fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
        expectedMoveUci: "g1f3",
        hint: "Lompatkan kuda dari g1 ke f3.",
        explanationOnSuccess: "Brilian! Anda menerapkan prinsip dasar: mengembangkan perwira sambil menekan pion pusat lawan di e5.",
      },
    ],
  },
];

export function getLessonById(id: string): AcademyLesson | undefined {
  return ACADEMY_LESSONS.find((l) => l.id === id);
}

export function getNextLessonId(id: string): string | null {
  const idx = ACADEMY_LESSONS.findIndex((l) => l.id === id);
  if (idx >= 0 && idx < ACADEMY_LESSONS.length - 1) {
    return ACADEMY_LESSONS[idx + 1].id;
  }
  return null;
}
