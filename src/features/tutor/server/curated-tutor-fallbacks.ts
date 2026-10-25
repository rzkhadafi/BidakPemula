import { Chess } from "chess.js";
import { TutorExplainRequest, TutorExplainResponse, SuggestedMove } from "../types";

/**
 * Curated offline rule-based Indonesian explanations.
 * Acts as high-quality fallback when Gemini API key is absent, quota is reached, or network is offline.
 */
export function getCuratedTutorExplanation(request: TutorExplainRequest): TutorExplainResponse {
  const { fen, sideToMove, mode, lastMoveSan, analysis, lessonTitle, lessonStepInstruction, question } = request;

  let chess: Chess;
  try {
    chess = new Chess(fen);
  } catch {
    chess = new Chess();
  }

  const isCheck = chess.inCheck();
  const turnLabel = sideToMove === "w" ? "Putih" : "Hitam";

  // Compute legal candidate moves as verified suggestions
  const legalMoves = chess.moves({ verbose: true });
  const suggestedMoves: SuggestedMove[] = [];

  if (analysis?.bestMoveUci) {
    const from = analysis.bestMoveUci.slice(0, 2);
    const to = analysis.bestMoveUci.slice(2, 4);
    const found = legalMoves.find((m) => m.from === from && m.to === to);
    if (found) {
      suggestedMoves.push({
        uci: analysis.bestMoveUci,
        san: found.san,
        description: `Langkah yang paling direkomendasikan untuk menekan posisi lawan.`,
      });
    }
  }

  // Add 1-2 more safe candidate moves if available
  for (const m of legalMoves) {
    if (suggestedMoves.length >= 3) break;
    const uci = `${m.from}${m.to}${m.promotion || ""}`;
    if (!suggestedMoves.some((s) => s.uci === uci)) {
      let desc = `Menggerakkan bidak ke ${m.to}.`;
      if (m.captured) desc = `Memukul perwira lawan di petak ${m.to}.`;
      else if (m.piece === "n" || m.piece === "b") desc = `Mengembangkan perwira minor ke petak aktif ${m.to}.`;
      else if (m.piece === "p") desc = `Mendorong pion untuk memperkuat kendali teritori.`;

      suggestedMoves.push({
        uci,
        san: m.san,
        description: desc,
      });
    }
  }

  // Handle direct player questions (quick chips or custom input)
  if (question && question.trim().length > 0) {
    return answerTutorQuestion(request, chess, suggestedMoves, turnLabel);
  }

  // Specific handling for Academy Lesson mode
  if (mode === "lesson") {
    const title = lessonTitle || "Panduan Materi Belajar";
    const instruction = lessonStepInstruction || "Pahami langkah pada papan catur.";
    return {
      title: `Panduan: ${title}`,
      summary: instruction,
      explanation: `Dalam materi ini, kita mempelajari bagaimana bidak catur berinteraksi di atas 64 petak. Perhatikan petak tujuan dan jalur yang terbuka agar perwira Anda dapat bergerak secara maksimal tanpa terancam oleh lawan.`,
      spokenText: `Halo! Mari kita perhatikan papan ini bersama. ${instruction} Ingat prinsip dasarnya: jalankan bidak Anda ke petak yang aman dan aktif, serta selalu lindungi perwira dari ancaman lawan.`,
      concept: "Fondasi Gerakan & Penempatan Bidak",
      suggestedMoves: suggestedMoves.slice(0, 2),
      hint: "Perhatikan petak yang disorot atau jalur bebas di depan bidak Anda.",
      followUpQuestion: "Apakah Anda ingin mencoba langkah lain atau mengulangi peragaan ini?",
      analysisStatus: "unavailable",
      source: "local-curated",
    };
  }

  // In Check position
  if (isCheck) {
    return {
      title: "Raja Sedang Berada Dalam Ancaman Skak!",
      summary: `Raja ${turnLabel} diserang langsung oleh perwira lawan. Prioritas utama adalah menyelamatkan raja.`,
      explanation: `Ketika posisi skak terjadi, Anda memiliki tiga opsi pertahanan utama: 1) Melarikan raja ke petak yang aman, 2) Menghalangi jalur serangan lawan dengan bidak lain, atau 3) Memukul bidak lawan yang sedang menyerang jika memungkinkan.`,
      spokenText: `Perhatian! Raja ${turnLabel} sedang dalam kondisi skak. Anda harus segera menyelamatkan raja dengan melangkah ke petak aman, menutup jalur serangan, atau memukul bidak yang menyerang.`,
      concept: "Pertahanan Terhadap Serangan Skak",
      suggestedMoves,
      hint: "Cari petak di sekitar raja yang tidak dijaga oleh perwira lawan.",
      followUpQuestion: "Bagaimana cara terbaik menyelamatkan raja tanpa merugikan posisi perwira lain?",
      analysisStatus: analysis?.bestMoveUci ? "available" : "unavailable",
      source: "local-curated",
    };
  }

  // Play mode with last move context
  if (lastMoveSan) {
    const evalDesc = analysis?.evaluationCp !== undefined
      ? analysis.evaluationCp > 100
        ? "Posisi Putih sedang lebih unggul secara taktis."
        : analysis.evaluationCp < -100
        ? "Posisi Hitam sedang memegang inisiatif serangan."
        : "Posisi kedua kubu relatif seimbang dan dinamis."
      : "Evaluasi mesin mandiri sedang memantau kestabilan posisi.";

    return {
      title: `Analisis Langkah Terakhir: ${lastMoveSan}`,
      summary: `Langkah ${lastMoveSan} baru saja dieksekusi di papan. Giliran ${turnLabel} untuk merespons.`,
      explanation: `Langkah ini mengubah dinamika medan tempur. ${evalDesc} Selalu amati petak-petak kunci di pusat papan (d4, e4, d5, e5) serta perhatikan apakah ada bidak Anda yang tidak terlindungi setelah perpindahan ini.`,
      spokenText: `Langkah ${lastMoveSan} baru saja dimainkan. ${evalDesc} Sekarang giliran ${turnLabel} melangkah. Pastikan untuk mengawasi petak pusat dan keselamatan raja Anda.`,
      concept: "Dinamika Perpindahan & Kendali Petak",
      suggestedMoves,
      hint: "Pertimbangkan untuk mengaktifkan perwira yang belum bergerak sebelum melancarkan serangan.",
      followUpQuestion: question ? "Ada pertanyaan spesifik lain mengenai langkah ini?" : "Mengapa langkah ini mempengaruhi koordinasi pertahanan Anda?",
      analysisStatus: analysis?.bestMoveUci ? "available" : "unavailable",
      source: "local-curated",
    };
  }

  // Standard general position
  return {
    title: `Tinjauan Posisi: Giliran ${turnLabel}`,
    summary: `Pertandingan sedang berlangsung dengan ${legalMoves.length} opsi langkah legal bagi ${turnLabel}.`,
    explanation: `Pada fase ini, fokuskan perhatian pada tiga pilar utama catur: 1) Kendalikan empat petak pusat, 2) Kembangkan perwira seperti kuda dan gajah ke petak aktif, dan 3) Amankan posisi raja dengan rokade sedini mungkin.`,
    spokenText: `Saat ini giliran ${turnLabel} melangkah. Fokuskan strategi Anda untuk menguasai petak pusat, mengaktifkan perwira, dan menjaga raja tetap terlindungi di belakang barisan pion.`,
    concept: "Prinsip Pengembangan & Keamanan Posisi",
    suggestedMoves,
    hint: "Kuda dan gajah adalah perwira yang paling baik dikembangkan di awal permainan.",
    followUpQuestion: "Langkah manakah yang menurut Anda paling memperkuat posisi?",
    analysisStatus: analysis?.bestMoveUci ? "available" : "unavailable",
    source: "local-curated",
  };
}

/**
 * Intelligent context-aware answers to user questions (quick chips or custom input).
 * Ensures instant, reliable, high-quality responses even when Gemini API is offline or quota is exhausted.
 */
function answerTutorQuestion(
  request: TutorExplainRequest,
  chess: Chess,
  suggestedMoves: SuggestedMove[],
  turnLabel: string
): TutorExplainResponse {
  const qRaw = (request.question || "").trim();
  const qLower = qRaw.toLowerCase();
  const { mode, lessonTitle, lessonStepInstruction, lastMoveSan, fen } = request;

  // 1. Kenapa langkah ini penting?
  if (
    qLower.includes("kenapa langkah ini penting") ||
    qLower.includes("mengapa langkah ini penting") ||
    qLower.includes("kenapa penting") ||
    qLower.includes("mengapa penting") ||
    qLower.includes("alasan langkah")
  ) {
    if (mode === "lesson") {
      const stepContext = lessonStepInstruction || lessonTitle || "Langkah latihan ini";
      return {
        title: "Penjelasan Guru: Mengapa Langkah Ini Penting",
        summary: `Langkah pada materi "${lessonTitle || "Latihan"}" ini melatih insting dasar penempatan bidak Anda.`,
        explanation: `Langkah ini sangat penting karena:\n\n1. Membaca Jalur Terbuka: Melalui instruksi "${stepContext}", Anda melatih kepekaan mengenali petak bebas dan jalur pergerakan alami bidak tanpa terhalang bidak kawan sendiri.\n\n2. Efisiensi & Tempo Bermain: Dalam catur, setiap giliran sangat berharga. Menempatkan bidak di petak yang tepat dalam sekali jalan mencegah pemborosan langkah di masa depan.\n\n3. Koordinasi Saling Menjaga: Bidak yang berdiri di petak ideal akan saling memperkuat perwira lainnya dan membatasi ruang gerak lawan!`,
        spokenText: `Pertanyaan bagus! Langkah ini penting karena melatih Anda melihat petak strategis dan jalur bebas di atas papan. Ingat prinsipnya: menempatkan bidak di petak yang tepat membuat perwira Anda aktif dan saling melindungi dengan kokoh!`,
        concept: "Efisiensi Tempo & Penempatan Petak Kunci",
        suggestedMoves: suggestedMoves.slice(0, 2),
        hint: "Perhatikan bagaimana langkah ini membuka ruang gerak yang lebih leluasa bagi perwira Anda.",
        followUpQuestion: "Apakah Anda melihat bagaimana langkah ini membuka ruang bagi perwira lain?",
        analysisStatus: "available",
        source: "local-curated",
      };
    }

    // Play or Puzzle mode
    let specificDetail = "mengembangkan perwira ke petak strategis dan memperkuat kendali posisi.";
    if (lastMoveSan?.includes("O-O")) {
      specificDetail = "mengamankan raja ke sudut pertahanan yang terlindung sekaligus langsung mengaktifkan benteng ke lajur tengah.";
    } else if (lastMoveSan?.includes("x")) {
      specificDetail = "memangkas kekuatan perwira lawan dan mengubah keseimbangan materi di atas papan.";
    } else if (lastMoveSan?.includes("+")) {
      specificDetail = "memberikan ancaman skak langsung kepada raja lawan, membatasi pilihannya untuk bertahan.";
    } else if (lastMoveSan?.startsWith("N")) {
      specificDetail = "membawa kuda melompat ke petak aktif untuk mengontrol petak-petak penting di sekitar pusat.";
    } else if (lastMoveSan?.startsWith("B")) {
      specificDetail = "mengembangkan gajah ke diagonal terbuka untuk mengancam jalur panjang lawan.";
    } else if (lastMoveSan?.startsWith("R")) {
      specificDetail = "menempatkan benteng di lajur terbuka atau semi-terbuka untuk menekan pertahanan lawan.";
    } else if (lastMoveSan?.startsWith("Q")) {
      specificDetail = "mengaktifkan menteri untuk memberikan tekanan ganda terhadap posisi lawan.";
    }

    return {
      title: "Penjelasan Guru: Mengapa Langkah Ini Penting",
      summary: `Langkah ${lastMoveSan ? `"${lastMoveSan}"` : "ini"} berfungsi ${specificDetail}`,
      explanation: `Dalam fase permainan ini, langkah ${lastMoveSan ? `(${lastMoveSan})` : ""} bernilai krusial karena ${specificDetail}\n\nPemain catur handal tidak melangkah tanpa rencana. Setiap gerakan memiliki tiga tujuan utama: memperbaiki posisi perwira Anda, mempersempit opsi langkah lawan, dan menjaga raja tetap dalam kondisi aman.`,
      spokenText: `Pertanyaan cerdas! Langkah ini penting karena berfungsi ${specificDetail} Selalu tanyakan pada diri sendiri sebelum melangkah: apakah langkah ini membuat perwira saya lebih aktif atau justru terkurung?`,
      concept: "Tujuan Strategis & Keaktifan Perwira",
      suggestedMoves,
      hint: "Bandingkan posisi perwira sebelum dan sesudah langkah tersebut dimainkan.",
      followUpQuestion: "Langkah lanjutan apa yang akan Anda siapkan setelah ini?",
      analysisStatus: "available",
      source: "local-curated",
    };
  }

  // 2. Apa ancaman utama lawan?
  if (
    qLower.includes("ancaman utama lawan") ||
    qLower.includes("apa ancaman") ||
    qLower.includes("bahaya lawan") ||
    qLower.includes("serangan lawan") ||
    qLower.includes("apakah berbahaya")
  ) {
    let threatSummary = "Lawan belum memiliki ancaman taktis langsung yang membahayakan.";
    let threatDetail = "Bidak-bidak Anda saat ini berada dalam koordinasi yang aman. Ancaman umum lawan pada posisi ini adalah mencoba merebut dominasi petak pusat dan mengaktifkan perwiranya.";
    let threatSpoken = "Kabar baik! Saat ini lawan tidak memiliki ancaman taktis langsung yang berbahaya. Posisi Anda relatif aman. Manfaatkan kesempatan ini untuk memegang kendali!";

    if (chess.inCheck()) {
      threatSummary = `Raja ${turnLabel} sedang dalam ancaman skak langsung!`;
      threatDetail = `Ancaman paling mendesak adalah perwira lawan yang sedang menyerang raja Anda secara langsung. Anda WAJIB mengatasi skak ini sekarang juga dengan: melarikan raja, menutup jalur serangan, atau memukul bidak penyerang.`;
      threatSpoken = `Waspada! Ancaman terbesar saat ini adalah raja Anda sedang terkena skak langsung. Segera selamatkan raja ke petak yang aman atau tutupi jalurnya!`;
    } else {
      try {
        const fenTokens = fen.split(" ");
        fenTokens[1] = request.sideToMove === "w" ? "b" : "w";
        const oppFen = fenTokens.join(" ");
        const oppChess = new Chess(oppFen);
        const oppCaptures = oppChess.moves({ verbose: true }).filter((m) => m.captured);

        if (oppCaptures.length > 0) {
          const targetSquares = Array.from(new Set(oppCaptures.map((c) => c.to))).slice(0, 3);
          threatSummary = `Lawan memiliki potensi memukul bidak Anda di petak: ${targetSquares.join(", ")}.`;
          threatDetail = `Perhatikan petak sasaran lawan! Lawan memiliki perwira yang dapat menjangkau petak ${targetSquares.join(", ")}. Periksa apakah bidak di petak tersebut sudah memiliki penjaga (kawan yang melindungi). Jika tidak dijaga, bidak tersebut bisa hilang gratis (hanging piece)!`;
          threatSpoken = `Perhatikan baik-baik! Lawan sedang membidik petak ${targetSquares[0]}. Pastikan bidak di sana memiliki pengawal atau pindahkan ke petak yang aman.`;
        }
      } catch {
        // Fallback default
      }
    }

    return {
      title: "Penjelasan Guru: Membaca Ancaman Lawan",
      summary: threatSummary,
      explanation: `${threatDetail}\n\nTips Melatih Kewaspadaan (Profilaksis):\nSebelum Anda memutuskan langkah Anda sendiri, selalu tanyakan: "Jika lawan melangkah lagi sekarang, ke mana dia ingin menyerang?". Dengan membiasakan kebiasaan ini, Anda tidak akan pernah terkena jebakan tiba-tiba!`,
      spokenText: threatSpoken,
      concept: "Kesadaran Ancaman (Profilaksis)",
      suggestedMoves,
      hint: "Cari bidak Anda yang tidak dijaga oleh bidak lain.",
      followUpQuestion: "Apakah Anda memiliki bidak yang berada di bawah bidikan perwira lawan?",
      analysisStatus: "available",
      source: "local-curated",
    };
  }

  // 3. Bisa jelaskan lebih sederhana?
  if (
    qLower.includes("lebih sederhana") ||
    qLower.includes("jelaskan sederhana") ||
    qLower.includes("terlalu rumit") ||
    qLower.includes("mudah dipahami") ||
    qLower.includes("bahasa simpel") ||
    qLower.includes("simpel")
  ) {
    return {
      title: "Penjelasan Guru: Ringkas & Sederhana",
      summary: "Kuasai bagian tengah papan dan jangan tinggalkan bidak tanpa penjaga.",
      explanation: `Tentu, mari kita sederhanakan menjadi 3 aturan emas yang sangat mudah diingat:\n\n1. Jangan Jalan Sendirian: Setiap bidak yang maju harus punya teman di belakangnya yang menjaga. Jangan biarkan bidak 'menggantung' gratis.\n\n2. Rebut Lapangan Tengah: Anggap papan catur seperti lapangan bola. 4 kotak di tengah adalah area paling berharga. Dorong bidakmu mendekati tengah!\n\n3. Amankan Raja: Raja adalah nyawa permainan. Jangan biarkan raja berdiri di tengah medan perang terbuka.\n\nPada posisi ini, fokus Anda sederhana: pilih salah satu langkah yang disarankan di bawah untuk menjaga perwira Anda tetap aman dan aktif!`,
      spokenText: `Tentu! Sangat sederhana: anggap catur seperti menguasai lapangan. Cukup ingat tiga hal: jangan biarkan bidakmu tanpa penjaga, bawa perwira mendekati tengah, dan amankan raja. Pilih langkah yang paling nyaman untuk Anda!`,
      concept: "3 Aturan Emas Catur Pemula",
      suggestedMoves,
      hint: "Pilih perwira yang paling dekat dengan tengah untuk digerakkan.",
      followUpQuestion: "Apakah penjelasan ini terasa lebih jelas dan mudah dicoba?",
      analysisStatus: "available",
      source: "local-curated",
    };
  }

  // 4. Custom Keyword Matching (Kuda, Gajah, Benteng, Menteri, Raja, Pion, Rokade, Garpu, Skak, Menyerang, Bertahan)
  if (qLower.includes("kuda")) {
    return {
      title: "Penjelasan Guru: Peran Perwira Kuda",
      summary: "Kuda melompat dengan pola huruf L dan sangat kuat di petak tengah.",
      explanation: "Kuda bergerak dengan pola huruf L dan merupakan satu-satunya perwira yang bisa melompati bidak lain. Keistimewaan ini membuat kuda sangat berbahaya di posisi yang tertutup atau padat. Tempatkan kuda di petak tengah (d4, e4, d5, e5) di mana kuda dapat mengendalikan hingga 8 petak sekaligus!",
      spokenText: "Kuda bergerak membentuk huruf L dan bisa melompati bidak lain. Bawa kuda Anda ke petak tengah agar jangkauan serangannya maksimal!",
      concept: "Karakteristik & Manuver Kuda",
      suggestedMoves,
      hint: "Kuda di sudut hanya mengontrol 2 petak, sedangkan di tengah mengontrol 8 petak.",
      analysisStatus: "available",
      source: "local-curated",
    };
  }

  if (qLower.includes("gajah")) {
    return {
      title: "Penjelasan Guru: Peran Perwira Gajah",
      summary: "Gajah bergerak diagonal menyusuri petak sewarna dan menyukai jalur terbuka.",
      explanation: "Gajah adalah penembak jitu jarak jauh. Satu gajah bergerak di petak terang, dan satu lagi di petak gelap. Gajah paling kuat jika diagonal jalurnya tidak terhalang oleh barisan pion Anda sendiri.",
      spokenText: "Gajah adalah penembak jarak jauh diagonal. Buka jalur pion Anda agar gajah dapat membidik dari jauh dengan leluasa!",
      concept: "Karakteristik & Diagonal Gajah",
      suggestedMoves,
      hint: "Perhatikan warna petak gajah Anda dan pastikan diagonalnya tidak terblokir.",
      analysisStatus: "available",
      source: "local-curated",
    };
  }

  if (qLower.includes("benteng")) {
    return {
      title: "Penjelasan Guru: Peran Perwira Benteng",
      summary: "Benteng bergerak lurus horisontal dan vertikal, sangat kuat di lajur terbuka.",
      explanation: "Benteng bernilai 5 poin. Benteng menyukai lajur yang sudah bersih dari pion (lajur terbuka). Di babak akhir, benteng yang menguasai baris ke-7 lawan akan memberikan tekanan yang luar biasa dahsyat.",
      spokenText: "Benteng bergerak lurus vertikal dan horizontal. Tempatkan benteng di lajur terbuka untuk mengontrol jalur utama permainan!",
      concept: "Karakteristik & Lajur Terbuka Benteng",
      suggestedMoves,
      hint: "Hubungkan kedua benteng Anda dengan melakukan rokade terlebih dahulu.",
      analysisStatus: "available",
      source: "local-curated",
    };
  }

  if (qLower.includes("menteri") || qLower.includes("ratu")) {
    return {
      title: "Penjelasan Guru: Peran Perwira Menteri",
      summary: "Menteri adalah perwira terkuat (9 poin), gabungan kekuatan benteng dan gajah.",
      explanation: "Karena kekuatannya yang sangat besar, jangan keluarkan menteri terlalu dini di awal permainan tanpa perlindungan. Lawan bisa mengembangkan perwira kecilnya sambil menyerang menteri Anda, membuat Anda kehilangan banyak langkah untuk melarikan diri.",
      spokenText: "Menteri adalah perwira terkuat Anda. Jaga menteri dengan baik dan jangan buru-buru mengeluarkannya sendirian sebelum perwira lain siap!",
      concept: "Karakteristik & Perlindungan Menteri",
      suggestedMoves,
      hint: "Gunakan menteri sebagai penyerang penyelesai setelah kuda dan gajah aktif.",
      analysisStatus: "available",
      source: "local-curated",
    };
  }

  if (qLower.includes("rokade")) {
    return {
      title: "Penjelasan Guru: Manuver Rokade",
      summary: "Rokade mengamankan raja sekaligus mengaktifkan benteng dalam satu gerakan.",
      explanation: "Rokade adalah manuver spesial di mana raja berpindah dua petak ke arah benteng, dan benteng melompati raja ke petak sebelahnya. Lakukan rokade sedini mungkin agar raja Anda tidak menjadi sasaran empuk di tengah medan perang.",
      spokenText: "Rokade adalah langkah pengaman terbaik! Amankan raja Anda ke sudut dan hubungkan benteng ke pertempuran dalam satu langkah.",
      concept: "Keamanan Raja & Manuver Rokade",
      suggestedMoves,
      hint: "Pastikan petak di antara raja dan benteng sudah kosong dan raja tidak sedang diskak.",
      analysisStatus: "available",
      source: "local-curated",
    };
  }

  // 5. Generic Custom Question Answer
  return {
    title: `Jawaban Guru: "${qRaw.length > 35 ? qRaw.slice(0, 32) + "..." : qRaw}"`,
    summary: `Pertanyaan Anda: "${qRaw}". Berikut arahan guru untuk situasi posisi ini.`,
    explanation: `Mengenai pertanyaan Anda ("${qRaw}"):\n\nDalam situasi posisi saat ini (giliran ${turnLabel}), pertimbangan terpenting adalah menjaga stabilitas perwira Anda dan melihat peluang terbaik untuk melangkah.\n\nPerhatikan rekomendasi langkah di bawah ini: langkah-langkah tersebut telah diverifikasi secara legal dan membantu Anda menjaga koordinasi bidak yang kokoh. Cobalah salah satu langkah yang disarankan!`,
    spokenText: `Pertanyaan yang menarik! Untuk posisi ini, fokuslah pada koordinasi perwira Anda dan pilih salah satu langkah yang kami sarankan di bawah agar posisi Anda tetap kuat dan aktif.`,
    concept: "Konsultasi Posisi & Strategi Catur",
    suggestedMoves,
    hint: "Klik tombol 'Tampilkan' pada salah satu langkah di bawah untuk melihat lintasannya di papan.",
    followUpQuestion: "Apakah Anda ingin mencoba langkah yang disarankan tersebut?",
    analysisStatus: "available",
    source: "local-curated",
  };
}
