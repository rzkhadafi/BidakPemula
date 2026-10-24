import { Chess, Square, Color, PieceSymbol } from "chess.js";

export type SquareThreatStatus =
  | "hanging_friendly"      // Bidak kawan diserang dan TIDAK dijaga (bahaya fatal!)
  | "overpowered_friendly"  // Bidak kawan diserang lebih banyak daripada penjaga ATAU diserang bidak lebih murah
  | "hanging_opponent"      // Bidak lawan diserang dan TIDAK dijaga (peluang emas!)
  | "vulnerable_opponent"   // Bidak lawan diserang lebih banyak daripada penjaga ATAU diincar bidak kawan yang lebih murah
  | "defended_friendly"     // Bidak kawan terlindungi dengan aman
  | "defended_opponent"     // Bidak lawan terlindungi
  | "danger_square"         // Petak kosong dikontrol lawan
  | "safe_square"           // Petak kosong dikontrol kawan
  | "contested_square"      // Petak kosong diperebutkan
  | "neutral";              // Netral / tanpa ancaman langsung

export interface SquareThreatReport {
  square: Square;
  friendlyDefenders: Square[];
  opponentAttackers: Square[];
  status: SquareThreatStatus;
  summary: string; // Penjelasan bahasa Indonesia yang ramah pemula
}

export interface PieceScopeReport {
  square: Square;
  defendedPieces: Square[];       // Bidak kawan yang dijaga oleh bidak ini
  targetedEnemyPieces: Square[];  // Bidak lawan yang diincar langsung oleh bidak ini
  controlledEmptySquares: Square[]; // Petak kosong yang dikontrol
}

export const PIECE_VALUES: Record<PieceSymbol, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 1000,
};

export const PIECE_NAMES_ID: Record<PieceSymbol, string> = {
  p: "Pion",
  n: "Kuda",
  b: "Gajah",
  r: "Benteng",
  q: "Menteri",
  k: "Raja",
};

export const ALL_SQUARES: Square[] = (() => {
  const squares: Square[] = [];
  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
  for (const f of files) {
    for (let r = 1; r <= 8; r++) {
      squares.push(`${f}${r}` as Square);
    }
  }
  return squares;
})();

const VISION_STORAGE_KEY = "chess_archive_vision_glasses_v1";

type VisionListener = (enabled: boolean) => void;
const visionListeners = new Set<VisionListener>();

export function getVisionGlassesSetting(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(VISION_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function setVisionGlassesSetting(enabled: boolean): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(VISION_STORAGE_KEY, String(enabled));
  } catch {
    // Abaikan
  }
  visionListeners.forEach((listener) => listener(enabled));
}

export function subscribeVisionGlasses(listener: VisionListener): () => void {
  visionListeners.add(listener);
  return () => {
    visionListeners.delete(listener);
  };
}

/**
 * Menghitung peta ancaman dan perlindungan untuk seluruh 64 petak catur.
 * Menggunakan metode c.attackers dari chess.js yang akurat dan berkinerja tinggi (< 0.5ms).
 */
export function computeBoardThreats(
  chess: Chess,
  playerColor: "w" | "b" = "w"
): Map<Square, SquareThreatReport> {
  const opponentColor: Color = playerColor === "w" ? "b" : "w";
  const result = new Map<Square, SquareThreatReport>();

  for (const sq of ALL_SQUARES) {
    const piece = chess.get(sq);
    const friendlyDefenders = chess.attackers(sq, playerColor as Color);
    const opponentAttackers = chess.attackers(sq, opponentColor);

    let status: SquareThreatStatus = "neutral";
    let summary = `Petak ${sq.toUpperCase()} netral.`;

    if (piece) {
      const isFriendly = piece.color === playerColor;
      const pieceName = PIECE_NAMES_ID[piece.type];
      const pieceVal = PIECE_VALUES[piece.type];

      if (isFriendly) {
        // Bidak Kawan
        if (opponentAttackers.length > 0 && friendlyDefenders.length === 0) {
          // Bidak gantung tanpa pengawal!
          status = "hanging_friendly";
          summary = `Bahaya! ${pieceName} di ${sq.toUpperCase()} diserang lawan tanpa ada penjaga!`;
        } else if (opponentAttackers.length > 0) {
          // Cari penyerang lawan termurah
          const opponentAttackerPieces = opponentAttackers
            .map((s) => chess.get(s))
            .filter(Boolean);
          const minOpponentVal = Math.min(
            ...opponentAttackerPieces.map((p) => PIECE_VALUES[p!.type])
          );

          if (minOpponentVal < pieceVal) {
            // Diserang bidak yang lebih murah (misal Menteri diserang Pion/Kuda)
            status = "overpowered_friendly";
            const cheapestAttacker = opponentAttackerPieces.find(
              (p) => PIECE_VALUES[p!.type] === minOpponentVal
            );
            const attackerName = cheapestAttacker
              ? PIECE_NAMES_ID[cheapestAttacker.type]
              : "Bidak lawan";
            summary = `Waspada! ${pieceName} di ${sq.toUpperCase()} diserang oleh ${attackerName} lawan yang nilainya lebih murah. Pertukaran ini merugikanmu.`;
          } else if (opponentAttackers.length > friendlyDefenders.length) {
            // Kalah jumlah pengawal
            status = "overpowered_friendly";
            summary = `Waspada! ${pieceName} di ${sq.toUpperCase()} kalah jumlah pengawal (${opponentAttackers.length} penyerang vs ${friendlyDefenders.length} penjaga).`;
          } else {
            // Dijaga aman
            status = "defended_friendly";
            summary = `Aman. ${pieceName} di ${sq.toUpperCase()} dijaga oleh ${friendlyDefenders.length} perwira kawan.`;
          }
        } else if (friendlyDefenders.length > 0) {
          status = "defended_friendly";
          summary = `${pieceName} di ${sq.toUpperCase()} dijaga oleh ${friendlyDefenders.length} perwira kawan.`;
        } else {
          status = "neutral";
          summary = `${pieceName} di ${sq.toUpperCase()} dalam posisi aman (belum diserang).`;
        }
      } else {
        // Bidak Lawan
        if (friendlyDefenders.length > 0 && opponentAttackers.length === 0) {
          // Bidak lawan gantung (gratis ditangkap!)
          status = "hanging_opponent";
          summary = `Peluang emas! ${pieceName} lawan di ${sq.toUpperCase()} tidak dijaga dan bisa kamu tangkap gratis!`;
        } else if (friendlyDefenders.length > 0) {
          // Cari penyerang kawan termurah
          const friendlyAttackerPieces = friendlyDefenders
            .map((s) => chess.get(s))
            .filter(Boolean);
          const minFriendlyVal = Math.min(
            ...friendlyAttackerPieces.map((p) => PIECE_VALUES[p!.type])
          );

          if (minFriendlyVal < pieceVal) {
            status = "vulnerable_opponent";
            summary = `Peluang taktik! ${pieceName} lawan di ${sq.toUpperCase()} diincar oleh bidakmu yang bernilai lebih murah.`;
          } else if (friendlyDefenders.length > opponentAttackers.length) {
            status = "vulnerable_opponent";
            summary = `${pieceName} lawan di ${sq.toUpperCase()} rentan karena penyerangmu (${friendlyDefenders.length}) melebihi pengawalnya (${opponentAttackers.length}).`;
          } else {
            status = "defended_opponent";
            summary = `${pieceName} lawan di ${sq.toUpperCase()} dilindungi oleh ${opponentAttackers.length} perwira.`;
          }
        } else if (opponentAttackers.length > 0) {
          status = "defended_opponent";
          summary = `${pieceName} lawan di ${sq.toUpperCase()} dilindungi lawannya.`;
        } else {
          status = "neutral";
          summary = `${pieceName} lawan di ${sq.toUpperCase()}.`;
        }
      }
    } else {
      // Petak Kosong
      if (opponentAttackers.length > 0 && friendlyDefenders.length === 0) {
        status = "danger_square";
        summary = `Petak ${sq.toUpperCase()} dikontrol penuh oleh lawan (${opponentAttackers.length} penjaga lawan). Berbahaya untuk ditempati.`;
      } else if (friendlyDefenders.length > 0 && opponentAttackers.length === 0) {
        status = "safe_square";
        summary = `Petak ${sq.toUpperCase()} dikontrol oleh perwiramu (${friendlyDefenders.length} pengawal). Aman untuk ditempati.`;
      } else if (friendlyDefenders.length > 0 && opponentAttackers.length > 0) {
        status = "contested_square";
        summary = `Petak ${sq.toUpperCase()} sedang diperebutkan (${friendlyDefenders.length} kawan vs ${opponentAttackers.length} lawan).`;
      } else {
        status = "neutral";
        summary = `Petak ${sq.toUpperCase()} terbuka/netral.`;
      }
    }

    result.set(sq, {
      square: sq,
      friendlyDefenders,
      opponentAttackers,
      status,
      summary,
    });
  }

  return result;
}

/**
 * Menghitung cakupan garis pandang dan sasaran (Scope) untuk bidak yang sedang dipilih.
 */
export function computePieceScope(chess: Chess, square: Square): PieceScopeReport {
  const piece = chess.get(square);
  if (!piece) {
    return {
      square,
      defendedPieces: [],
      targetedEnemyPieces: [],
      controlledEmptySquares: [],
    };
  }

  const defendedPieces: Square[] = [];
  const targetedEnemyPieces: Square[] = [];
  const controlledEmptySquares: Square[] = [];

  for (const sq of ALL_SQUARES) {
    if (sq === square) continue;
    const attackers = chess.attackers(sq, piece.color);
    if (attackers.includes(square)) {
      const targetPiece = chess.get(sq);
      if (!targetPiece) {
        controlledEmptySquares.push(sq);
      } else if (targetPiece.color === piece.color) {
        defendedPieces.push(sq);
      } else {
        targetedEnemyPieces.push(sq);
      }
    }
  }

  return {
    square,
    defendedPieces,
    targetedEnemyPieces,
    controlledEmptySquares,
  };
}
