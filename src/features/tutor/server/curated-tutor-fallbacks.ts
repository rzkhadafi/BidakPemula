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
