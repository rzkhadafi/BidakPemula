import { Chess, Square } from "chess.js";
import { SocraticHint } from "./types";
import { PIECE_NAMES_ID } from "@/features/chessboard/square-threats";

/**
 * Menghasilkan petunjuk 3 tingkat (Observasi -> Bidak Kunci -> Langkah Solusi)
 * berdasarkan evaluasi langkah terbaik Stockfish engine dan aturan catur chess.js.
 */
export function generateSocraticHint(
  chess: Chess,
  bestMoveUci: string
): SocraticHint | null {
  if (!bestMoveUci || bestMoveUci.length < 4) return null;

  const from = bestMoveUci.slice(0, 2) as Square;
  const to = bestMoveUci.slice(2, 4) as Square;
  const promotion = (bestMoveUci[4] as "q" | "r" | "b" | "n") || undefined;

  const piece = chess.get(from);
  if (!piece) return null;

  // Uji coba langkah pada tiruan papan
  let san = "";
  let isCapture = false;
  let isCheck = false;
  let isCastling = false;

  try {
    const temp = new Chess(chess.fen());
    const res = temp.move({ from, to, promotion });
    if (!res) return null;
    san = res.san;
    isCapture = Boolean(res.captured);
    isCheck = temp.inCheck();
    isCastling = res.san.startsWith("O-O");
  } catch {
    return null;
  }

  const pieceName = PIECE_NAMES_ID[piece.type];
  const toFile = to[0];

  // Tentukan Sektor Target
  let targetSector: "kingside" | "queenside" | "center" | "backrank" | "general" = "general";
  if (toFile === "d" || toFile === "e") {
    targetSector = "center";
  } else if (["f", "g", "h"].includes(toFile)) {
    targetSector = "kingside";
  } else if (["a", "b", "c"].includes(toFile)) {
    targetSector = "queenside";
  }

  if (isCastling) {
    targetSector = toFile === "g" ? "kingside" : "queenside";
  }

  // --- TINGKAT 1: Observasi / Arah Pandang ---
  let tier1Clue = "";
  let tier1Spoken = "";

  if (isCastling) {
    tier1Clue =
      "Amati posisi rajamu saat ini. Pikirkan langkah khusus yang dapat mengamankan raja sekaligus mengaktifkan benteng kawan.";
    tier1Spoken =
      "Perhatikan posisi rajamu. Sekarang adalah momen yang baik untuk mengamankan raja dan mengaktifkan perwira benteng.";
  } else if (isCapture) {
    tier1Clue =
      `Perhatikan sektor ${targetSector === "center" ? "pusat" : targetSector === "kingside" ? "sayap raja" : "sayap menteri"} lawan. Ada perwira lawan yang kurang terlindungi dan bisa kamu manfaatkan.`;
    tier1Spoken =
      "Coba periksa bidak lawan yang rentan. Kamu memiliki kesempatan untuk memukul bidak yang kurang terjaga.";
  } else if (isCheck) {
    tier1Clue =
      "Perhatikan garis pertahanan raja lawan. Adakah celah untuk memberikan ancaman langsung kepada raja?";
    tier1Spoken =
      "Amati posisi raja lawan. Kamu memiliki kesempatan untuk melancarkan serangan skak langsung.";
  } else if (targetSector === "center") {
    tier1Clue =
      "Fokuskan pandanganmu ke bagian tengah papan (petak e4, d4, e5, d5). Siapa yang menguasai pusat, ia yang mengendalikan tempo permainan.";
    tier1Spoken =
      "Coba arahkan perhatianmu ke petak tengah papan. Menguasai pusat papan akan membuka jalan bagi perwira-perwiramu.";
  } else if (targetSector === "kingside") {
    tier1Clue =
      "Perhatikan sisi sayap raja (lajur f, g, h). Ada perwira kawan yang siap menambah dominasi ruang di area tersebut.";
    tier1Spoken =
      "Arahkan pandanganmu ke sayap raja. Ada ruang terbuka yang bisa kamu tempati untuk memperkuat serangan.";
  } else {
    tier1Clue =
      "Perhatikan sisi sayap menteri (lajur a, b, c). Pikirkan cara mengaktifkan perwira yang mobilitasnya masih terbatas.";
    tier1Spoken =
      "Perhatikan area sayap menteri. Ini saatnya meningkatkan koordinasi perwira di sisi tersebut.";
  }

  // --- TINGKAT 2: Perwira Kunci ---
  let tier2Clue = "";
  let tier2Spoken = "";

  if (isCastling) {
    tier2Clue = `Fokuskan pada ${pieceName} di petak ${from.toUpperCase()}. Perhatikan hak rokade yang masih kamu miliki.`;
    tier2Spoken = `Fokuskan pada ${pieceName} di petak ${from.toUpperCase()}. Kamu bisa melakukan rokade sekarang.`;
  } else {
    tier2Clue = `Bidak kunci yang perlu kamu perhatikan adalah ${pieceName} di petak ${from.toUpperCase()}. Pikirkan ke mana perwira ini paling bermanfaat untuk melangkah.`;
    tier2Spoken = `Perhatikan perwiramu yaitu ${pieceName} di petak ${from.toUpperCase()}. Pikirkan petak terbaik yang bisa dijangkau oleh ${pieceName} ini.`;
  }

  // --- TINGKAT 3: Langkah Konkret & Alasan Strategis Penuh ---
  let rationale = "";
  if (isCastling) {
    rationale = "Rokade mengamankan raja ke sudut terlindung dan mengaktifkan benteng ke lajur tengah.";
  } else if (isCheck) {
    rationale = `Langkah ini memberikan skak langsung ke raja lawan dan memaksa lawan merespons secara defensif.`;
  } else if (isCapture) {
    rationale = `Langkah ini memukul bidak lawan di petak ${to.toUpperCase()} dan menambah keunggulan materialmu.`;
  } else if (targetSector === "center") {
    rationale = `Langkah ini merebut petak pusat ${to.toUpperCase()} dan membuka ruang serang yang lebih leluasa bagi perwira kawan lainnya.`;
  } else {
    rationale = `Langkah ini meningkatkan mobilitas ${pieceName} ke petak aktif ${to.toUpperCase()} dan memperkuat struktur posisi.`;
  }

  const tier3Clue = `Langkahkan ${pieceName} dari ${from.toUpperCase()} ke ${to.toUpperCase()} (${san}). ${rationale}`;
  const tier3Spoken = `Langkah yang direkomendasikan adalah melangkahkan ${pieceName} ke ${to.toUpperCase()}, atau notasi ${san}. ${rationale}`;

  return {
    fen: chess.fen(),
    bestMoveUci,
    from,
    to,
    pieceType: piece.type,
    san,
    tier1Observation: {
      clue: tier1Clue,
      targetSector,
      spokenText: tier1Spoken,
    },
    tier2Piece: {
      clue: tier2Clue,
      pieceSquare: from,
      pieceName,
      spokenText: tier2Spoken,
    },
    tier3Concrete: {
      clue: tier3Clue,
      moveSan: san,
      from,
      to,
      rationale,
      spokenText: tier3Spoken,
    },
  };
}
