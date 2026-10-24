import { Chess, Square, Color } from "chess.js";
import { BlunderReport } from "./types";
import {
  computeBoardThreats,
  PIECE_VALUES,
  PIECE_NAMES_ID,
} from "@/features/chessboard/square-threats";

/**
 * Mengevaluasi apakah suatu langkah yang dicoba pemain tergolong blunder fatal/berbahaya.
 * Dijalankan secara lokal (< 1ms) sebelum langkah benar-benar dieksekusi.
 */
export function evaluateMoveSafety(
  chess: Chess,
  from: Square,
  to: Square,
  promotion?: "q" | "r" | "b" | "n",
  playerColor?: "w" | "b"
): BlunderReport {
  const color = (playerColor || chess.turn()) as Color;
  const originalPiece = chess.get(from);

  if (!originalPiece || originalPiece.color !== color) {
    return {
      isBlunder: false,
      severity: "safe",
      reason: "Bukan giliran bidak kawan.",
      from,
      to,
      pieceType: originalPiece?.type || "p",
    };
  }

  // Clone board untuk uji coba langkah
  let trialChess: Chess;
  try {
    trialChess = new Chess(chess.fen());
    const moveRes = trialChess.move({ from, to, promotion });
    if (!moveRes) {
      return {
        isBlunder: false,
        severity: "safe",
        reason: "Langkah tidak legal.",
        from,
        to,
        pieceType: originalPiece.type,
      };
    }
  } catch {
    return {
      isBlunder: false,
      severity: "safe",
      reason: "Gagal memvalidasi langkah.",
      from,
      to,
      pieceType: originalPiece.type,
    };
  }

  // 1. Periksa apakah lawan memiliki Skakmat Langsung (Mate in 1)
  const opponentReplies = trialChess.moves({ verbose: true });
  for (const reply of opponentReplies) {
    try {
      const mateTest = new Chess(trialChess.fen());
      mateTest.move(reply);
      if (mateTest.isCheckmate()) {
        const attackerPiece = trialChess.get(reply.from);
        const attackerName = attackerPiece ? PIECE_NAMES_ID[attackerPiece.type] : "Lawan";
        return {
          isBlunder: true,
          severity: "fatal",
          reason: `Waspada fatal! Langkah ini membiarkan lawan melakukan skakmat seketika dengan ${attackerName} (${reply.san}).`,
          from,
          to,
          pieceType: originalPiece.type,
          mateInOneThreat: true,
          attackerSquare: reply.from,
          attackerPieceType: attackerPiece?.type,
        };
      }
    } catch {
      // Lanjutkan iterasi
    }
  }

  // 2. Evaluasi ancaman sebelum vs sesudah langkah
  const threatsBefore = computeBoardThreats(chess, color);
  const threatsAfter = computeBoardThreats(trialChess, color);

  // A. Apakah bidak yang baru saja dipindahkan menjadi bidak gantung (hanging)?
  const movedReport = threatsAfter.get(to);
  if (movedReport) {
    const movedPieceType = trialChess.get(to)?.type || originalPiece.type;
    const movedPieceValue = PIECE_VALUES[movedPieceType];
    const pieceName = PIECE_NAMES_ID[movedPieceType];

    if (movedReport.status === "hanging_friendly") {
      const attackerSq = movedReport.opponentAttackers[0];
      const attackerPiece = trialChess.get(attackerSq);
      const attackerName = attackerPiece ? PIECE_NAMES_ID[attackerPiece.type] : "bidak lawan";

      // Bidak perwira bernilai tinggi (Menteri, Benteng, Perwira Ringan)
      if (movedPieceValue >= 3) {
        return {
          isBlunder: true,
          severity: "blunder",
          reason: `Perhatian! ${pieceName} di ${to.toUpperCase()} tidak memiliki pengawal dan dapat langsung ditangkap cuma-cuma oleh ${attackerName} lawan (${attackerSq.toUpperCase()}).`,
          from,
          to,
          pieceType: originalPiece.type,
          hangingSquare: to,
          hangingPieceType: movedPieceType,
          attackerSquare: attackerSq,
          attackerPieceType: attackerPiece?.type,
        };
      } else if (movedPieceValue === 1 && movedReport.opponentAttackers.length > 0) {
        // Pion gantung
        return {
          isBlunder: true,
          severity: "questionable",
          reason: `Pion di ${to.toUpperCase()} tidak terlindungi dan bisa ditangkap cuma-cuma oleh lawan.`,
          from,
          to,
          pieceType: originalPiece.type,
          hangingSquare: to,
          hangingPieceType: movedPieceType,
        };
      }
    }

    if (movedReport.status === "overpowered_friendly") {
      // Diserang bidak lebih murah (misal Menteri diserang Pion atau Kuda)
      const attackerSq = movedReport.opponentAttackers[0];
      const attackerPiece = trialChess.get(attackerSq);
      const attackerName = attackerPiece ? PIECE_NAMES_ID[attackerPiece.type] : "bidak lawan";
      const attackerVal = attackerPiece ? PIECE_VALUES[attackerPiece.type] : 1;

      if (attackerVal < movedPieceValue) {
        return {
          isBlunder: true,
          severity: "blunder",
          reason: `Pertukaran merugikan! ${pieceName} (${movedPieceValue} poin) di ${to.toUpperCase()} diserang oleh ${attackerName} lawan yang lebih murah (${attackerVal} poin).`,
          from,
          to,
          pieceType: originalPiece.type,
          hangingSquare: to,
          hangingPieceType: movedPieceType,
          attackerSquare: attackerSq,
          attackerPieceType: attackerPiece?.type,
        };
      }
    }
  }

  // B. Apakah perpindahan ini menyebabkan perwira kawan lain kehilangan pengawal?
  for (const [sq, afterRep] of threatsAfter) {
    if (sq === to || sq === from) continue;
    const pieceOnSq = trialChess.get(sq);
    if (!pieceOnSq || pieceOnSq.color !== color) continue;

    const beforeRep = threatsBefore.get(sq);
    const becameHanging =
      afterRep.status === "hanging_friendly" &&
      beforeRep?.status !== "hanging_friendly";

    if (becameHanging && PIECE_VALUES[pieceOnSq.type] >= 3) {
      const leftPieceName = PIECE_NAMES_ID[pieceOnSq.type];
      const attackerSq = afterRep.opponentAttackers[0];
      const attackerPiece = trialChess.get(attackerSq);
      const attackerName = attackerPiece ? PIECE_NAMES_ID[attackerPiece.type] : "bidak lawan";

      return {
        isBlunder: true,
        severity: "blunder",
        reason: `Waspada! Memindahkan perwira ini membuat ${leftPieceName} milikmu di ${sq.toUpperCase()} kehilangan pengawal dan terancam ditangkap oleh ${attackerName} lawan.`,
        from,
        to,
        pieceType: originalPiece.type,
        hangingSquare: sq,
        hangingPieceType: pieceOnSq.type,
        attackerSquare: attackerSq,
        attackerPieceType: attackerPiece?.type,
      };
    }
  }

  return {
    isBlunder: false,
    severity: "safe",
    reason: "Langkah aman.",
    from,
    to,
    pieceType: originalPiece.type,
  };
}
