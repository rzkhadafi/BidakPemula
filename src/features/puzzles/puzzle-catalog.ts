import { ChessPuzzle } from "./types";

export const PUZZLE_CATALOG: ChessPuzzle[] = [
  // ==========================================
  // TEMA 1: GARPU (FORK)
  // ==========================================
  {
    id: "puz-fork-01",
    title: "Garpu Kuda Kerajaan",
    description: "Manfaatkan lompatan kuda ke petak c7 untuk menyerang raja dan benteng sekaligus.",
    theme: "fork",
    difficulty: "beginner",
    startingFen: "r3k2r/ppp2ppp/2n5/3N4/1b6/8/PPP2PPP/R1B2RK1 w kq - 1 12",
    sideToMove: "w",
    goal: "Lakukan garpu kuda terhadap raja dan benteng lawan untuk meraih keunggulan perwira.",
    solutionLinesUci: [
      ["d5c7", "e8d8", "c7a8"],
      ["d5c7", "e8d7", "c7a8"],
      ["d5c7", "e8e7", "c7a8"],
      ["d5c7", "e8f8", "c7a8"],
    ],
    hints: [
      "Perhatikan posisi raja hitam di e8 dan benteng di a8 yang berada dalam jangkauan lompatan kuda.",
      "Petak c7 tidak dikawal oleh perwira hitam mana pun.",
      "Langkahkan kuda dari d5 ke c7 untuk memberikan skak sekaligus mengunci benteng a8.",
    ],
    explanation: {
      motif: "Garpu Kuda (Knight Fork)",
      threat: "Kuda melompat ke c7 memberikan ancaman ganda terhadap raja di e8 dan benteng di a8.",
      keyMove: "Nd5-c7+ memaksa raja bergerak dan membiarkan benteng a8 tanpa perlindungan.",
      opponentResponse: "Raja hitam terpaksa melangkah menghindar dari skak, sehingga benteng a8 dapat ditangkap secara gratis.",
      takeaway: "Selalu waspadai petak c2 atau c7 ketika raja lawan belum melakukan rokade.",
    },
    metadata: {
      source: "Arsip Taktik Chess Archive",
      verified: true,
      verdictNote: "Langkah legal terverifikasi dan menghasilkan keunggulan mutlak.",
    },
  },
  {
    id: "puz-fork-02",
    title: "Defleksi dan Garpu Kuda",
    description: "Kombinasikan pengorbanan benteng untuk memancing raja lawan ke petak garpu kuda.",
    theme: "fork",
    difficulty: "intermediate",
    startingFen: "6k1/5ppp/8/8/1n6/8/r4PPP/2R2K2 b - - 0 1",
    sideToMove: "b",
    goal: "Lakukan kombinasi taktis untuk memenangkan benteng putih.",
    solutionLinesUci: [
      ["a2f2", "f1f2", "b4d3", "f2e3", "d3c1"],
      ["a2f2", "f1g1", "b4d3"],
    ],
    hints: [
      "Perhatikan posisi benteng putih di c1 dan raja putih di f1.",
      "Kuda hitam di b4 siap melompat ke d3 jika raja putih berhasil dipancing ke petak f2.",
      "Korbankan benteng dengan Ra2-f2+ untuk memaksa Kxf2, lalu sambut dengan garpu kuda Nd3+.",
    ],
    explanation: {
      motif: "Defleksi diikuti Garpu Kuda",
      threat: "Benteng putih di c1 tidak terlindungi dari serangan diagonal kuda setelah raja terdefleksi.",
      keyMove: "1... Rxf2+! mengalihkan raja putih ke petak f2 yang rentan terhadap garpu kuda.",
      opponentResponse: "Setelah 2. Kxf2, hitam membalas 2... Nd3+ menyerang raja dan benteng c1.",
      takeaway: "Pengorbanan defleksi sering kali menjadi kunci membuka pola garpu yang mematikan.",
    },
    metadata: {
      source: "Arsip Taktik Chess Archive",
      verified: true,
      verdictNote: "Taktik memenangkan benteng bersih dengan kombinasi langkah teratur.",
    },
  },
  {
    id: "puz-fork-03",
    title: "Garpu Kuda di Sayap Belakang",
    description: "Temukan lompatan taktis kuda untuk menjebak benteng yang tidak terkawal di baris 8.",
    theme: "fork",
    difficulty: "advanced",
    startingFen: "2r3k1/pp3ppp/8/3N4/8/1P5P/P4PP1/3R2K1 w - - 0 1",
    sideToMove: "w",
    goal: "Menangkan benteng lawan dengan garpu kuda dari petak e7.",
    solutionLinesUci: [
      ["d5e7", "g8f8", "e7c8"],
      ["d5e7", "g8h8", "e7c8"],
    ],
    hints: [
      "Perhatikan posisi benteng hitam di c8 yang tidak memiliki penjaga.",
      "Kuda putih di d5 memiliki akses ke petak e7 yang memberikan skak pada raja g8.",
      "Jalankan Nd5-e7+ untuk memberikan skak sekaligus menyerang benteng c8.",
    ],
    explanation: {
      motif: "Garpu Kuda Baris Belakang",
      threat: "Benteng hitam di c8 tidak dijaga oleh perwira lain.",
      keyMove: "Ne7+ memanfaatkan petak e7 yang kosong untuk menyerang raja dan benteng secara serentak.",
      opponentResponse: "Hitam terpaksa melangkahkan raja, membiarkan benteng c8 ditangkap pada langkah berikutnya.",
      takeaway: "Perwira yang tidak terkawal (undefended pieces) adalah magnet utama bagi taktik garpu.",
    },
    metadata: {
      source: "Arsip Taktik Chess Archive",
      verified: true,
      verdictNote: "Memenangkan kualitas benteng bersih.",
    },
  },

  // ==========================================
  // TEMA 2: IKATAN (PIN)
  // ==========================================
  {
    id: "puz-pin-01",
    title: "Ikatan Mutlak Terhadap Menteri",
    description: "Gunakan benteng untuk mengikat menteri putih ke rajanya di baris pertama.",
    theme: "pin",
    difficulty: "beginner",
    startingFen: "3r2k1/ppp2ppp/8/8/8/1P2B3/P1q2PPP/4Q1K1 b - - 0 1",
    sideToMove: "b",
    goal: "Manfaatkan ikatan mutlak untuk memenangkan menteri putih.",
    solutionLinesUci: [
      ["d8d1", "g1f1", "d1e1"],
      ["d8d1", "h2h3", "d1e1"],
      ["d8d1", "h2h4", "d1e1"],
      ["d8d1", "f2f3", "d1e1"],
      ["d8d1", "f2f4", "d1e1"],
      ["d8d1", "e3d2", "d1d2"],
    ],
    hints: [
      "Menteri putih berada di e1 di depan rajanya di g1.",
      "Lajur d terbuka bagi benteng hitam untuk menusuk baris pertama.",
      "Langkahkan benteng ke d1 (Rd8-d1) untuk mengikat menteri putih ke raja secara mutlak.",
    ],
    explanation: {
      motif: "Ikatan Mutlak (Absolute Pin)",
      threat: "Menteri putih di e1 tidak dapat melarikan diri karena akan mengekspos raja pada ancaman skak.",
      keyMove: "1... Rd1 mengikat Qe1 ke Kg1 sehingga menteri putih tidak memiliki langkah legal untuk kabur.",
      opponentResponse: "Putih tidak memiliki pembelaan yang memadai dan harus menyerahkan menterinya.",
      takeaway: "Perwira yang terikat pada raja tidak memiliki kebebasan bergerak (pinned piece loses mobility).",
    },
    metadata: {
      source: "Arsip Taktik Chess Archive",
      verified: true,
      verdictNote: "Menghasilkan kemenangan menteri mutlak.",
    },
  },
  {
    id: "puz-pin-02",
    title: "Eksploitasi Gajah Terikat",
    description: "Serang perwira yang terikat pada raja sebelum lawan sempat membebaskannya.",
    theme: "pin",
    difficulty: "intermediate",
    startingFen: "4k3/1pp1bppp/8/8/8/2P1B3/PP3PPP/4R1K1 w - - 0 1",
    sideToMove: "w",
    goal: "Eksploitasi ikatan gajah di e7 untuk memenangkan perwira.",
    solutionLinesUci: [
      ["e3c5", "e8d7", "e1e7"],
      ["e3c5", "e8d8", "c5e7"],
    ],
    hints: [
      "Gajah hitam di e7 terikat mutlak oleh benteng putih di e1 terhadap raja e8.",
      "Gajah putih di e3 dapat menyerang petak e7 melalui jalur c5.",
      "Mainkan Be3-c5 untuk melipatgandakan serangan pada gajah e7 yang terikat.",
    ],
    explanation: {
      motif: "Menyerang Bidak Terikat (Attacking the Pinned Piece)",
      threat: "Gajah di e7 tidak dapat bergerak karena melindungi raja di e8.",
      keyMove: "1. Bc5 menambah penyerang kedua pada gajah e7 yang hanya dijaga oleh rajanya.",
      opponentResponse: "Raja hitam terpaksa melangkah menghindar, namun gajah e7 tetap jatuh ke tangan putih.",
      takeaway: "Prinsip emas ikatan: selalu tambahkan tekanan pada perwira yang sedang terikat.",
    },
    metadata: {
      source: "Arsip Taktik Chess Archive",
      verified: true,
      verdictNote: "Menghasilkan kemenangan gajah bersih.",
    },
  },
  {
    id: "puz-pin-03",
    title: "Ikatan Diagonal Mematikan",
    description: "Manfaatkan ikatan diagonal untuk menjatuhkan benteng lawan di lajur terbuka.",
    theme: "pin",
    difficulty: "advanced",
    startingFen: "2r1r1k1/pp3ppp/4b3/8/8/2B5/PP3PPP/R4RK1 w - - 1 18",
    sideToMove: "w",
    goal: "Aktifkan tekanan taktis menggunakan posisi gajah di diagonal utama.",
    solutionLinesUci: [
      ["f1e1", "e6d7", "e1e8"],
      ["f1e1", "f7f6", "e1e6"],
    ],
    hints: [
      "Perhatikan posisi benteng hitam di e8 dan gajah hitam di e6.",
      "Lajur e adalah jalur gesekan utama antara benteng kedua belah pihak.",
      "Pindahkan benteng putih ke e1 (Rf1-e1) untuk menekan gajah e6 yang berhadapan langsung dengan bentengnya.",
    ],
    explanation: {
      motif: "Tekanan Garis Pin Lajur Terbuka",
      threat: "Gajah hitam di e6 terikat pada perlindungan benteng e8.",
      keyMove: "1. Rfe1 mendominasi lajur terbuka dan memaksa hitam melepaskan salah satu perwira aktifnya.",
      opponentResponse: "Hitam terpaksa mundur atau menukar perwira dalam posisi yang merugikan.",
      takeaway: "Kuasai lajur terbuka dengan menempatkan benteng berhadapan dengan perwira lawan.",
    },
    metadata: {
      source: "Arsip Taktik Chess Archive",
      verified: true,
      verdictNote: "Dominasi posisi dan kemenangan taktis.",
    },
  },

  // ==========================================
  // TEMA 3: SERANGAN TUSUK (SKEWER)
  // ==========================================
  {
    id: "puz-skew-01",
    title: "Tusukan Benteng Sayap Raja",
    description: "Tembus raja lawan dengan benteng untuk merebut perwira berharga di belakangnya.",
    theme: "skewer",
    difficulty: "beginner",
    startingFen: "8/2k4r/8/8/8/8/4K3/R7 w - - 0 1",
    sideToMove: "w",
    goal: "Gunakan serangan tusuk (skewer) untuk memenangkan benteng hitam.",
    solutionLinesUci: [
      ["a1a7", "c7b6", "a7h7"],
      ["a1a7", "c7c6", "a7h7"],
      ["a1a7", "c7d6", "a7h7"],
      ["a1a7", "c7b8", "a7h7"],
      ["a1a7", "c7d8", "a7h7"],
    ],
    hints: [
      "Raja hitam di c7 dan benteng hitam di h7 berada pada baris horizontal yang sama (baris ke-7).",
      "Benteng putih di a1 dapat meluncur ke baris ke-7.",
      "Jalankan Ra1-a7+ untuk menusuk raja; setelah raja menyingkir, tangkap benteng di h7.",
    ],
    explanation: {
      motif: "Serangan Tusuk Horizontal (Horizontal Skewer)",
      threat: "Raja hitam berada di depan bentengnya pada baris ke-7.",
      keyMove: "1. Ra7+ memberikan skak langsung pada raja di c7.",
      opponentResponse: "Karena terkena skak, raja terpaksa menyingkir, mengekspos benteng h7 di belakangnya.",
      takeaway: "Serangan tusuk adalah kebalikan dari pin: sasaran bernilai lebih tinggi berada di depan.",
    },
    metadata: {
      source: "Arsip Taktik Chess Archive",
      verified: true,
      verdictNote: "Memenangkan benteng penuh dalam ending murni.",
    },
  },
  {
    id: "puz-skew-02",
    title: "Tusukan Gajah di Diagonal Terbuka",
    description: "Manfaatkan diagonal panjang untuk menusuk raja lawan dan menangkap benteng di sudut.",
    theme: "skewer",
    difficulty: "intermediate",
    startingFen: "r7/5ppp/1p6/3k4/8/8/PP3PPP/3B2K1 w - - 0 1",
    sideToMove: "w",
    goal: "Berikan skak menusuk dengan gajah untuk memenangkan benteng a8.",
    solutionLinesUci: [
      ["d1f3", "d5e5", "f3a8"],
      ["d1f3", "d5d6", "f3a8"],
      ["d1f3", "d5c5", "f3a8"],
      ["d1f3", "d5e6", "f3a8"],
      ["d1f3", "d5c4", "f3a8"],
    ],
    hints: [
      "Raja hitam di d5 dan benteng di a8 berada pada diagonal yang sama menuju petak f3.",
      "Gajah putih di d1 dapat bermanuver ke diagonal f3-a8.",
      "Jalankan Bd1-f3+ untuk menusuk raja di d5 dan mengambil benteng a8 di belakangnya.",
    ],
    explanation: {
      motif: "Tusukan Gajah Diagonal (Diagonal Bishop Skewer)",
      threat: "Raja hitam berada di jalur diagonal yang sama dengan benteng a8.",
      keyMove: "1. Bf3+ memaksa raja bergerak, membuka jalur penangkapan benteng a8.",
      opponentResponse: "Raja hitam harus melangkah menghindar dari skak gajah, membiarkan benteng a8 jatuh.",
      takeaway: "Gajah di diagonal panjang memiliki daya jangkau mematikan untuk taktik tusukan.",
    },
    metadata: {
      source: "Arsip Taktik Chess Archive",
      verified: true,
      verdictNote: "Memenangkan benteng bersih di a8.",
    },
  },
  {
    id: "puz-skew-03",
    title: "Tusukan Menteri Penentu Kemenangan",
    description: "Gunakan mobilitas menteri di baris kedua untuk mengeksekusi serangan tusuk.",
    theme: "skewer",
    difficulty: "advanced",
    startingFen: "8/8/8/8/8/8/2k4r/Q3K3 w - - 0 1",
    sideToMove: "w",
    goal: "Eksekusi serangan tusuk dengan menteri untuk memenangkan benteng hitam.",
    solutionLinesUci: [
      ["a1a2", "c2c3", "a2h2"],
      ["a1a2", "c2c1", "a2h2"],
      ["a1a2", "c2d3", "a2h2"],
    ],
    hints: [
      "Perhatikan bahwa raja hitam di c2 dan benteng hitam di h2 sejajar di baris ke-2.",
      "Menteri putih di a1 memiliki akses langsung ke petak a2.",
      "Mainkan Qa1-a2+ untuk memberikan skak pada raja c2 sekaligus mengincar benteng h2.",
    ],
    explanation: {
      motif: "Tusukan Baris Menteri (Queen Rank Skewer)",
      threat: "Raja dan benteng hitam berada pada baris horizontal yang sama tanpa perlindungan timbal-balik.",
      keyMove: "1. Qa2+ menyerang raja di c2 dan benteng di h2 secara bersamaan sepanjang baris kedua.",
      opponentResponse: "Raja hitam wajib menghindar dari skak, sehingga menteri putih menangkap benteng h2.",
      takeaway: "Jangan pernah membiarkan raja dan perwira berat berada pada garis yang sama tanpa penjagaan.",
    },
    metadata: {
      source: "Arsip Taktik Chess Archive",
      verified: true,
      verdictNote: "Menang mutlak dengan menangkap benteng h2.",
    },
  },

  // ==========================================
  // TEMA 4: SERANGAN TERBUKA (DISCOVERED ATTACK)
  // ==========================================
  {
    id: "puz-disc-01",
    title: "Serangan Terbuka ke Arah Menteri",
    description: "Korbankan gajah dengan skak untuk membuka serangan menteri putih ke menteri hitam.",
    theme: "discovered_attack",
    difficulty: "beginner",
    startingFen: "r1b2rk1/ppp2ppp/8/3qp3/8/3B1N2/PPP2PPP/R1BQK2R w KQ - 0 9",
    sideToMove: "w",
    goal: "Lakukan pengorbanan gajah untuk memenangkan menteri hitam secara cuma-cuma.",
    solutionLinesUci: [
      ["d3h7", "g8h7", "d1d5"],
      ["d3h7", "g8h8", "d1d5"],
    ],
    hints: [
      "Menteri putih di d1 dan menteri hitam di d5 saling berhadapan di lajur d.",
      "Gajah putih di d3 menghalangi lajur tersebut, namun dapat melangkah dengan memberikan skak.",
      "Korbankan gajah dengan Bd3xh7+! Saat raja hitam merespons skak, menteri putih bebas menangkap Qd5.",
    ],
    explanation: {
      motif: "Serangan Terbuka dengan Skak (Discovered Attack with Check)",
      threat: "Menteri hitam di d5 tidak terlindungi dan berada di lajur yang sama dengan menteri putih.",
      keyMove: "1. Bxh7+ memberikan skak dengan tempo tinggi, membuka lajur d bagi menteri putih.",
      opponentResponse: "Hitam terpaksa merespons skak pada rajanya, tidak sempat menyelamatkan menteri di d5.",
      takeaway: "Ketika langkah pembuka menghasilkan skak (discovered check), lawan tidak memiliki tempo untuk membalas ancaman kedua.",
    },
    metadata: {
      source: "Arsip Taktik Chess Archive",
      verified: true,
      verdictNote: "Menghasilkan keuntungan menteri bersih (+9).",
    },
  },
  {
    id: "puz-disc-02",
    title: "Serangan Terbuka Pembongkar Sayap Menteri",
    description: "Langkahkan kuda untuk menyerang menteri lawan sekaligus membuka serangan gajah.",
    theme: "discovered_attack",
    difficulty: "intermediate",
    startingFen: "r1bqk2r/pp3ppp/2n1pn2/2b5/3NP3/2N1B3/PPP3PP/R2QKB1R w KQkq - 1 9",
    sideToMove: "w",
    goal: "Dapatkan keunggulan satu perwira ringan melalui serangan terbuka gajah.",
    solutionLinesUci: [
      ["d4c6", "d8d1", "a1d1"],
      ["d4c6", "b7c6", "e3c5"],
    ],
    hints: [
      "Perhatikan posisi gajah hitam di c5 dan gajah putih di e3.",
      "Kuda putih di d4 menghalangi garis pandang gajah e3 ke gajah c5.",
      "Langkahkan kuda ke c6 (Nd4-c6) untuk menyerang menteri hitam sekaligus membuka serangan gajah ke c5.",
    ],
    explanation: {
      motif: "Serangan Terbuka Ganda (Dual Discovered Threat)",
      threat: "Kuda menyerang menteri d8 sementara gajah di e3 mengincar gajah c5 yang tak terjaga cukup.",
      keyMove: "1. Nxc6! menciptakan dua ancaman mematikan secara serentak.",
      opponentResponse: "Jika hitam menukar menteri, benteng putih mengambil alih lajur d dengan ancaman skakmat baris belakang.",
      takeaway: "Singkirkan perwira penghalang dengan langkah agresif untuk melancarkan serangan terbuka.",
    },
    metadata: {
      source: "Arsip Taktik Chess Archive",
      verified: true,
      verdictNote: "Memenangkan satu perwira minor bersih.",
    },
  },
  {
    id: "puz-disc-03",
    title: "Skak Terbuka Pemburu Menteri",
    description: "Langkahkan kuda untuk membuka skak dari benteng sekaligus menyerang menteri hitam.",
    theme: "discovered_attack",
    difficulty: "advanced",
    startingFen: "4k3/ppp2ppp/8/q7/3N4/8/PPP2PPP/4R1K1 w - - 0 1",
    sideToMove: "w",
    goal: "Eksekusi skak terbuka untuk memenangkan menteri lawan secara bersih.",
    solutionLinesUci: [
      ["d4b3", "e8d8", "b3a5"],
      ["d4b3", "e8d7", "b3a5"],
      ["d4b3", "e8f8", "b3a5"],
      ["d4b3", "a5e5", "e1e5"],
    ],
    hints: [
      "Perhatikan posisi raja hitam di e8 yang berhadapan langsung dengan benteng putih di lajur e.",
      "Kuda putih di d4 dapat melompat ke petak b3 untuk menyerang menteri hitam di a5.",
      "Mainkan Nd4-b3+! Langkah ini menghadirkan skak terbuka dari benteng e1 sambil membidik menteri di a5.",
    ],
    explanation: {
      motif: "Skak Terbuka dengan Ancaman Menteri (Discovered Check with Royal Threat)",
      threat: "Lompatan kuda membuka lajur bagi benteng e1 untuk memberikan skak pada raja e8.",
      keyMove: "1. Nb3+! memanfaatkan skak terbuka sehingga hitam tidak sempat menyelamatkan menteri di a5.",
      opponentResponse: "Hitam terpaksa merespons ancaman skak pada rajanya, membiarkan menteri di a5 jatuh ke tangan kuda.",
      takeaway: "Skak terbuka memaksa lawan bereaksi pada raja, mengabaikan perwira berharga lainnya yang sedang diserang.",
    },
    metadata: {
      source: "Arsip Taktik Chess Archive",
      verified: true,
      verdictNote: "Memenangkan menteri bersih dengan skak terbuka taktis.",
    },
  },

  // ==========================================
  // TEMA 5: SINGKIRKAN PENJAGA (REMOVING THE DEFENDER)
  // ==========================================
  {
    id: "puz-rem-01",
    title: "Ancaman Mat Penyingkir Penjaga",
    description: "Gunakan ancaman skakmat untuk mengalihkan menteri dari menjaga perwira penting.",
    theme: "removing_defender",
    difficulty: "beginner",
    startingFen: "r1bqk2r/pppp1ppp/2n5/4p3/2B1n3/2P2N2/PPP2PPP/R1BQK2R w KQkq - 0 6",
    sideToMove: "w",
    goal: "Ciptakan ancaman ganda skakmat dan perwira untuk memenangkan kuda hitam.",
    solutionLinesUci: [
      ["d1d5", "e4d6", "c4b3"],
      ["d1d5", "d8e7", "d5e4"],
      ["d1d5", "e8g8", "d5e4"],
      ["d1d5", "d7d6", "d5e4"],
    ],
    hints: [
      "Pion f7 hitam adalah titik terlemah yang hanya dijaga oleh raja.",
      "Gajah putih di c4 telah membidik petak f7.",
      "Langkahkan menteri ke d5 (Qd1-d5) untuk mengancam Qxf7# sekaligus menyerang kuda di e4.",
    ],
    explanation: {
      motif: "Singkirkan Penjaga melalui Ancaman Skakmat",
      threat: "Menteri putih di d5 mengancam skakmat langsung di f7 (Qxf7#) dan kuda di e4 secara simultan.",
      keyMove: "1. Qd5! menghadirkan ancaman mat yang tidak dapat diabaikan oleh hitam.",
      opponentResponse: "Hitam terpaksa mencegah skakmat, sehingga kuda di e4 dapat ditangkap dengan cuma-cuma.",
      takeaway: "Ancaman skakmat adalah alat penyingkir penjaga paling kuat dalam catur.",
    },
    metadata: {
      source: "Arsip Taktik Chess Archive",
      verified: true,
      verdictNote: "Memenangkan kuda hitam di e4.",
    },
  },
  {
    id: "puz-rem-02",
    title: "Eliminasi Penjaga Petak Kunci",
    description: "Hancurkan perwira penjaga agar perwira di belakangnya jatuh tanpa perlindungan.",
    theme: "removing_defender",
    difficulty: "intermediate",
    startingFen: "r1b1k2r/pppp1ppp/2n5/4b3/4P3/2N2N2/PPP2PPP/R1BQKB1R w KQkq - 0 6",
    sideToMove: "w",
    goal: "Eliminasi penjaga gajah e5 untuk meraih keunggulan perwira.",
    solutionLinesUci: [
      ["f3e5", "c6e5", "c1f4"],
      ["f3e5", "d7d6", "e5f3"],
    ],
    hints: [
      "Gajah hitam di e5 berada dalam jangkauan dua kuda putih di c3 dan f3.",
      "Kuda hitam di c6 adalah satu-satunya penjaga aktif bagi gajah e5.",
      "Mulai penukaran taktis dengan Nf3xe5 untuk menghilangkan kehadiran gajah hitam yang agresif.",
    ],
    explanation: {
      motif: "Penyingkiran Perwira Pengawal",
      threat: "Gajah di e5 rentan diserang dan dieliminasi oleh perwira pusat putih.",
      keyMove: "1. Nxe5 menyingkirkan gajah agresif hitam dan memaksa struktur hitam terdistorsi.",
      opponentResponse: "Hitam harus membalas dengan Nxe5, membiarkan putih melanjutkan dominasi pusat.",
      takeaway: "Jika perwira lawan hanya memiliki satu pengawal, periksa kemungkinan menukarnya.",
    },
    metadata: {
      source: "Arsip Taktik Chess Archive",
      verified: true,
      verdictNote: "Mendominasi penguasaan pusat.",
    },
  },
  {
    id: "puz-rem-03",
    title: "Defleksi Penjaga Baris Belakang",
    description: "Alihkan benteng penjaga baris belakang untuk mengeksekusi serangan penutup.",
    theme: "removing_defender",
    difficulty: "advanced",
    startingFen: "3r2k1/pp3ppp/4b3/8/8/2N1B3/PP3PPP/3R2K1 b - - 0 1",
    sideToMove: "b",
    goal: "Lakukan pertukaran benteng untuk menyingkirkan penjaga sayap menteri.",
    solutionLinesUci: [
      ["d8d1", "c3d1", "e6a2"],
    ],
    hints: [
      "Benteng putih di d1 dijaga oleh kuda di c3.",
      "Pion putih di a2 dipertahankan secara tidak langsung oleh koordinasi perwira putih.",
      "Tukar benteng di d1 dengan Rd8xd1+, memaksa kuda menjauh dari c3 sehingga pion a2 dapat dimenangkan.",
    ],
    explanation: {
      motif: "Defleksi Penjaga Sayap (Deflecting the Guardian)",
      threat: "Pion a2 putih kehilangan pengawalan saat kuda terpaksa beralih ke petak d1.",
      keyMove: "1... Rxd1+ memaksa 2. Nxd1, menyingkirkan kuda dari petak c3 yang menjaga sayap menteri.",
      opponentResponse: "Putih harus membalas tangkapan benteng, membuka jalan bagi 2... Bxa2 yang memenangkan pion bersih.",
      takeaway: "Defleksi sederhana di satu sektor sering kali meruntuhkan pertahanan di sektor lainnya.",
    },
    metadata: {
      source: "Arsip Taktik Chess Archive",
      verified: true,
      verdictNote: "Memenangkan pion a2 dan keunggulan endgame mutlak.",
    },
  },

  // ==========================================
  // TEMA 6: POLA SKAKMAT (CHECKMATE PATTERNS)
  // ==========================================
  {
    id: "puz-mate-01",
    title: "Skakmat Koridor Baris Belakang",
    description: "Manfaatkan susunan pion sendiri yang mengurung raja lawan di baris terakhir.",
    theme: "checkmate_pattern",
    difficulty: "beginner",
    startingFen: "6k1/5ppp/8/8/8/8/1r4PP/R5K1 w - - 0 1",
    sideToMove: "w",
    goal: "Lakukan skakmat koridor (back-rank mate) terhadap raja hitam.",
    solutionLinesUci: [
      ["a1a8", "b2b8", "a8b8"],
    ],
    hints: [
      "Raja hitam di g8 terhalang oleh pion-pionnya sendiri di f7, g7, dan h7.",
      "Baris ke-8 hitam tidak memiliki perwira pelindung.",
      "Luncurkan benteng ke a8 (Ra1-a8+) untuk mengeksekusi skakmat koridor.",
    ],
    explanation: {
      motif: "Skakmat Koridor (Back-Rank Mate)",
      threat: "Raja hitam tidak memiliki petak pelarian (luft) karena terhalang oleh benteng pionnya sendiri.",
      keyMove: "1. Ra8+ menyerang baris ke-8 secara langsung.",
      opponentResponse: "Hitam hanya bisa menunda satu langkah dengan menutup memakai 1... Rb8, sebelum 2. Rxb8# menuntaskan mat.",
      takeaway: "Selalu waspadai kelemahan baris belakang ketika tidak ada 'lubang udara' (luft) untuk raja.",
    },
    metadata: {
      source: "Arsip Taktik Chess Archive",
      verified: true,
      verdictNote: "Skakmat paksa dalam 2 langkah.",
    },
  },
  {
    id: "puz-mate-02",
    title: "Pola Skakmat Arab (Arabian Mate)",
    description: "Padukan kekuatan kuda di f6 dan benteng di a7 untuk menjerat raja di sudut.",
    theme: "checkmate_pattern",
    difficulty: "intermediate",
    startingFen: "7k/R6p/5N2/8/8/8/5PPP/6K1 w - - 0 1",
    sideToMove: "w",
    goal: "Eksekusi pola skakmat legendaris Arabian Mate dalam satu langkah.",
    solutionLinesUci: [
      ["a7h7"],
    ],
    hints: [
      "Kuda putih di f6 mengontrol petak pelarian penting di g8 dan h7.",
      "Benteng putih di a7 memiliki jalur bebas menuju pion h7 di depan raja hitam.",
      "Jalankan Ra7xh7# untuk menghantarkan skakmat yang tak tertahankan.",
    ],
    explanation: {
      motif: "Skakmat Arab (Arabian Mate)",
      threat: "Kuda di f6 dan benteng di h7 saling melindungi dan menutup seluruh petak pelarian raja di sudut h8.",
      keyMove: "1. Rxh7# adalah skakmat seketika: raja tidak bisa memukul benteng karena dilindungi kuda f6.",
      opponentResponse: "Hitam tidak memiliki perwira pembela atau petak pelarian tersisa.",
      takeaway: "Kombinasi kuda dan benteng di sudut papan adalah salah satu pola mat tertua dan paling mematikan.",
    },
    metadata: {
      source: "Arsip Taktik Chess Archive",
      verified: true,
      verdictNote: "Skakmat 1 langkah klasik.",
    },
  },
  {
    id: "puz-mate-03",
    title: "Pengorbanan Menteri untuk Skakmat Koridor",
    description: "Kombinasikan pengorbanan menteri spektakuler untuk merobohkan baris belakang lawan.",
    theme: "checkmate_pattern",
    difficulty: "advanced",
    startingFen: "2r3k1/5ppp/8/8/8/8/4QPPP/4R1K1 w - - 0 1",
    sideToMove: "w",
    goal: "Lakukan pengorbanan menteri di e8 untuk menghasilkan skakmat koridor.",
    solutionLinesUci: [
      ["e2e8", "c8e8", "e1e8"],
    ],
    hints: [
      "Raja hitam di g8 terperangkap oleh pion-pionnya sendiri di baris ke-7.",
      "Benteng hitam di c8 adalah satu-satunya penjaga baris belakang.",
      "Korbankan menteri ke e8 (Qe2-e8+); setelah benteng hitam memukul Rxe8, tuntaskan dengan benteng Re1xe8#.",
    ],
    explanation: {
      motif: "Pengorbanan Defleksi Menteri (Queen Deflection Sacrifice)",
      threat: "Baris ke-8 hitam hanya dijaga oleh benteng c8.",
      keyMove: "1. Qe8+! memaksa benteng c8 melepaskan kontrol baris pertama.",
      opponentResponse: "Hitam wajib memukul 1... Rxe8, namun benteng putih langsung membalas 2. Rxe8#.",
      takeaway: "Jangan ragu mengorbankan perwira tertinggi jika langkah tersebut berujung pada skakmat pasti.",
    },
    metadata: {
      source: "Arsip Taktik Chess Archive",
      verified: true,
      verdictNote: "Pengorbanan menteri paksa menuju skakmat.",
    },
  },
];

/**
 * Helper to fetch a puzzle by its ID from the catalog.
 */
export function getPuzzleById(id: string): ChessPuzzle | undefined {
  return PUZZLE_CATALOG.find((p) => p.id === id);
}
