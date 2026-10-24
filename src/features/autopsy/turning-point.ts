import { Chess, Square } from "chess.js";
import { PlayerColor, ChessMoveRecord } from "@/types/chess";
import { evaluateMoveSafety } from "@/features/copilot/blunder-detector";
import { PIECE_NAMES_ID } from "@/features/chessboard/square-threats";
import { TurningPoint, StoredTurningPointReplay, TurningPointSeverity } from "./types";

const REPLAY_TP_KEY = "chess_archive_replay_turning_point_v1";

interface CandidatePoint {
  plyIndex: number;
  moveNumber: number;
  fenBefore: string;
  fenAfter: string;
  move: ChessMoveRecord;
  severity: TurningPointSeverity;
  score: number;
  reason: string;
  suggestedAlternativeSan?: string;
}

/**
 * Menganalisis riwayat pertandingan untuk menemukan Titik Balik (Turning Point)
 * di mana permainan berubah drastis atau terjadi blunder kunci.
 */
export function findGameTurningPoint(
  moves: ChessMoveRecord[],
  playerColor: PlayerColor,
  initialFen?: string,
  isVictory = false
): TurningPoint | null {
  if (!moves || moves.length === 0) {
    return null;
  }

  const chess = new Chess(initialFen || undefined);
  const playerColorCode = playerColor === "white" ? "w" : "b";
  const candidates: CandidatePoint[] = [];

  for (let i = 0; i < moves.length; i++) {
    const m = moves[i];
    const fenBefore = chess.fen();
    const turn = chess.turn();
    const isPlayer = turn === playerColorCode;
    const moveNumber = Math.floor(i / 2) + 1;

    if (isPlayer) {
      // 1. Uji keamanan langkah menggunakan blunder detector
      const safety = evaluateMoveSafety(
        chess,
        m.from as Square,
        m.to as Square,
        m.promotion as "q" | "r" | "b" | "n" | undefined,
        playerColorCode
      );

      let candidateScore = 0;
      let candidateSeverity: TurningPointSeverity = "inaccuracy";
      let reason = safety.reason;

      if (safety.isBlunder) {
        if (safety.severity === "fatal") {
          candidateScore = 100;
          candidateSeverity = "fatal";
        } else if (safety.severity === "blunder") {
          candidateScore = 75;
          candidateSeverity = "blunder";
        } else {
          candidateScore = 50;
          candidateSeverity = "inaccuracy";
        }
      }

      // 2. Periksa apakah langkah ini langsung dibalas dengan penangkapan perwira berharga
      const nextMove = moves[i + 1];
      if (nextMove && nextMove.captured) {
        if (nextMove.captured === "q") candidateScore += 45;
        else if (nextMove.captured === "r") candidateScore += 30;
        else if (nextMove.captured === "b" || nextMove.captured === "n") candidateScore += 20;

        if (candidateScore > 40 && candidateSeverity === "inaccuracy") {
          candidateSeverity = "blunder";
          const capturedName = PIECE_NAMES_ID[nextMove.captured as keyof typeof PIECE_NAMES_ID] || "perwira";
          reason = `Langkah ${m.san} membuat ${capturedName} Anda hilang ditangkap lawan pada langkah berikutnya.`;
        }
      }

      if (candidateScore > 0) {
        // Cari alternatif langkah legal yang aman
        let alternativeSan: string | undefined;
        try {
          const legalMoves = chess.moves({ verbose: true });
          const safeAlt = legalMoves.find(
            (alt) =>
              (alt.from !== m.from || alt.to !== m.to) &&
              !evaluateMoveSafety(
                chess,
                alt.from,
                alt.to,
                alt.promotion as "b" | "q" | "r" | "n" | undefined,
                playerColorCode
              ).isBlunder
          );
          if (safeAlt) {
            alternativeSan = safeAlt.san;
          }
        } catch {
          // Abaikan
        }

        candidates.push({
          plyIndex: i,
          moveNumber,
          fenBefore,
          fenAfter: m.fenAfter,
          move: m,
          severity: candidateSeverity,
          score: candidateScore,
          reason,
          suggestedAlternativeSan: alternativeSan,
        });
      }
    }

    try {
      chess.move({
        from: m.from,
        to: m.to,
        promotion: m.promotion as "q" | "r" | "b" | "n" | undefined,
      });
    } catch {
      break;
    }
  }

  // Jika pertandingan dimenangkan oleh pemain, jadikan momen serangan/kemenangan sebagai titik balik inspiratif
  if (isVictory) {
    // Cari langkah skak, penangkapan menteri/benteng, atau langkah terakhir pemain
    let victoryPly = -1;
    for (let i = moves.length - 1; i >= 0; i--) {
      const isPlayer = (i % 2 === 0 && playerColor === "white") || (i % 2 === 1 && playerColor === "black");
      if (isPlayer) {
        victoryPly = i;
        if (moves[i].san.includes("#") || moves[i].san.includes("+") || moves[i].captured === "q") {
          break;
        }
      }
    }

    if (victoryPly !== -1) {
      const targetMove = moves[victoryPly];
      const moveNumber = Math.floor(victoryPly / 2) + 1;
      const historyBefore = moves.slice(0, victoryPly);

      // Rekonstruksi FEN sebelum langkah tersebut
      const replayChess = new Chess(initialFen || undefined);
      for (let j = 0; j < victoryPly; j++) {
        try {
          replayChess.move({
            from: moves[j].from,
            to: moves[j].to,
            promotion: moves[j].promotion,
          });
        } catch {}
      }

      return {
        plyIndex: victoryPly,
        moveNumber,
        sideToMove: playerColorCode,
        isPlayerMove: true,
        fenBefore: replayChess.fen(),
        fenAfter: targetMove.fenAfter,
        movePlayedSan: targetMove.san,
        movePlayedUci: targetMove.uci,
        fromSquare: targetMove.from as Square,
        toSquare: targetMove.to as Square,
        pieceType: targetMove.piece,
        severity: "victory_turning_point",
        headline: `Titik Balik Kemenangan: Langkah ke-${moveNumber} (${targetMove.san})`,
        description: `Langkah brilian ${targetMove.san} ini membuka keunggulan telak dan menentukan kemenangan Anda atas bot. Anda dapat memutar ulang posisi ini untuk menguji variasi lainnya!`,
        historyBefore,
        playerColor,
      };
    }
  }

  // Jika terdapat blunder yang ditemukan, pilih blunder dengan skor tertinggi
  if (candidates.length > 0) {
    candidates.sort((a, b) => b.score - a.score || a.plyIndex - b.plyIndex);
    const best = candidates[0];
    const historyBefore = moves.slice(0, best.plyIndex);

    let headline = `Titik Balik Kritis: Langkah ke-${best.moveNumber} (${best.move.san})`;
    if (best.severity === "fatal") {
      headline = `Momen Kritis: Langkah ke-${best.moveNumber} (${best.move.san})`;
    }

    let description = best.reason;
    if (best.suggestedAlternativeSan) {
      description += ` Cobalah variasi lain seperti ${best.suggestedAlternativeSan} untuk menjaga posisi tetap aman.`;
    }

    return {
      plyIndex: best.plyIndex,
      moveNumber: best.moveNumber,
      sideToMove: playerColorCode,
      isPlayerMove: true,
      fenBefore: best.fenBefore,
      fenAfter: best.fenAfter,
      movePlayedSan: best.move.san,
      movePlayedUci: best.move.uci,
      fromSquare: best.move.from as Square,
      toSquare: best.move.to as Square,
      pieceType: best.move.piece,
      severity: best.severity,
      headline,
      description,
      suggestedAlternativeSan: best.suggestedAlternativeSan,
      historyBefore,
      playerColor,
    };
  }

  // Jika tidak ada blunder fatal yang terdeteksi (misal game pendek atau timeout),
  // ambil langkah terakhir pemain agar pemain tetap bisa memutar ulang dari momen krusial akhir.
  let fallbackPly = -1;
  for (let i = moves.length - 1; i >= 0; i--) {
    const isPlayer = (i % 2 === 0 && playerColor === "white") || (i % 2 === 1 && playerColor === "black");
    if (isPlayer) {
      fallbackPly = i;
      break;
    }
  }

  if (fallbackPly !== -1) {
    const targetMove = moves[fallbackPly];
    const moveNumber = Math.floor(fallbackPly / 2) + 1;
    const historyBefore = moves.slice(0, fallbackPly);

    const replayChess = new Chess(initialFen || undefined);
    for (let j = 0; j < fallbackPly; j++) {
      try {
        replayChess.move({
          from: moves[j].from,
          to: moves[j].to,
          promotion: moves[j].promotion,
        });
      } catch {}
    }

    return {
      plyIndex: fallbackPly,
      moveNumber,
      sideToMove: playerColorCode,
      isPlayerMove: true,
      fenBefore: replayChess.fen(),
      fenAfter: targetMove.fenAfter,
      movePlayedSan: targetMove.san,
      movePlayedUci: targetMove.uci,
      fromSquare: targetMove.from as Square,
      toSquare: targetMove.to as Square,
      pieceType: targetMove.piece,
      severity: "inaccuracy",
      headline: `Titik Balik Pertandingan: Langkah ke-${moveNumber} (${targetMove.san})`,
      description: `Pada posisi langkah ke-${moveNumber}, pertarungan berada pada momen penting. Ingin mencoba kembali dari posisi ini dengan langkah yang lebih kokoh?`,
      historyBefore,
      playerColor,
    };
  }

  return null;
}

/**
 * Menyimpan konfigurasi replay titik balik ke sessionStorage untuk navigasi antar halaman.
 */
export function saveTurningPointReplay(data: StoredTurningPointReplay): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(REPLAY_TP_KEY, JSON.stringify(data));
  } catch {}
}

/**
 * Mengambil konfigurasi replay titik balik yang tertunda dari sessionStorage.
 */
export function getPendingTurningPointReplay(): StoredTurningPointReplay | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(REPLAY_TP_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Menghapus konfigurasi replay titik balik dari sessionStorage setelah dikonsumsi.
 */
export function clearPendingTurningPointReplay(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(REPLAY_TP_KEY);
  } catch {}
}
