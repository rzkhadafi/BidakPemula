"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Chess, Square } from "chess.js";
import { ChessPuzzle, PuzzleGameStatus } from "./types";
import {
  recordPuzzleAttempt,
  recordHintUsed,
  recordPuzzleSolved,
} from "./puzzle-progress";
import { chessAudio } from "@/lib/audio/chess-audio";
import { getSkillByPuzzleId, recordActivityEvidence } from "@/features/learning";
import { unlockBadge } from "@/features/badges";

export function usePuzzleGame(puzzle: ChessPuzzle) {
  const [chess, setChess] = useState<Chess>(() => new Chess(puzzle.startingFen));
  const chessRef = useRef<Chess>(chess);

  useEffect(() => {
    chessRef.current = chess;
  }, [chess]);

  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalDestinations, setLegalDestinations] = useState<string[]>([]);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: string; to: string } | null>(null);

  const [status, setStatus] = useState<PuzzleGameStatus>("waiting_player");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [currentPlyIndex, setCurrentPlyIndex] = useState<number>(0);
  const [hintsUnlocked, setHintsUnlocked] = useState<number>(0);
  const [solutionRevealed, setSolutionRevealed] = useState<boolean>(false);

  const opponentTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activePuzzleIdRef = useRef<string>(puzzle.id);

  // Sync state during render when puzzle changes (official React pattern)
  const [prevPuzzleId, setPrevPuzzleId] = useState<string>(puzzle.id);
  if (prevPuzzleId !== puzzle.id) {
    setPrevPuzzleId(puzzle.id);
    const fresh = new Chess(puzzle.startingFen);
    setChess(fresh);
    setSelectedSquare(null);
    setLegalDestinations([]);
    setLastMove(null);
    setPendingPromotion(null);
    setStatus("waiting_player");
    setFeedback(null);
    setCurrentPlyIndex(0);
    setHintsUnlocked(0);
    setSolutionRevealed(false);
  }

  // Record attempt and handle side effects outside render
  useEffect(() => {
    activePuzzleIdRef.current = puzzle.id;
    if (opponentTimeoutRef.current) {
      clearTimeout(opponentTimeoutRef.current);
    }
    recordPuzzleAttempt(puzzle.id, false);
  }, [puzzle.id]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (opponentTimeoutRef.current) {
        clearTimeout(opponentTimeoutRef.current);
      }
    };
  }, []);

  const resetPuzzle = useCallback(() => {
    if (opponentTimeoutRef.current) {
      clearTimeout(opponentTimeoutRef.current);
    }
    const fresh = new Chess(puzzle.startingFen);
    chessRef.current = fresh;
    setChess(fresh);
    setSelectedSquare(null);
    setLegalDestinations([]);
    setLastMove(null);
    setPendingPromotion(null);
    setStatus("waiting_player");
    setFeedback(null);
    setCurrentPlyIndex(0);
  }, [puzzle.startingFen]);

  const requestHint = useCallback(() => {
    if (hintsUnlocked < 3) {
      const nextLevel = hintsUnlocked + 1;
      setHintsUnlocked(nextLevel);
      recordHintUsed(puzzle.id, nextLevel);
    }
  }, [hintsUnlocked, puzzle.id]);

  const revealSolution = useCallback(() => {
    if (opponentTimeoutRef.current) {
      clearTimeout(opponentTimeoutRef.current);
    }

    // Play through the first solution line
    const firstLine = puzzle.solutionLinesUci[0];
    if (!firstLine) return;

    const sim = new Chess(puzzle.startingFen);
    let lastM: { from: string; to: string } | null = null;

    for (const uci of firstLine) {
      const from = uci.slice(0, 2) as Square;
      const to = uci.slice(2, 4) as Square;
      const promotion = uci.length > 4 ? (uci[4] as "q" | "r" | "b" | "n") : undefined;
      try {
        sim.move({ from, to, promotion });
        lastM = { from, to };
      } catch {}
    }

    chessRef.current = sim;
    setChess(new Chess(sim.fen()));
    setLastMove(lastM);
    setSelectedSquare(null);
    setLegalDestinations([]);
    setPendingPromotion(null);
    setStatus("solution_revealed");
    setSolutionRevealed(true);
    setFeedback("Solusi ditampilkan. Pelajari langkah-langkah di atas untuk memahami motif taktisnya.");
    recordPuzzleSolved(puzzle.id, true);
  }, [puzzle.id, puzzle.solutionLinesUci, puzzle.startingFen]);

  // Check move legality & puzzle line match
  const executePlayerMove = useCallback(
    (from: string, to: string, promotion?: "q" | "r" | "b" | "n") => {
      const c = chessRef.current;
      if (status !== "waiting_player" && status !== "wrong_step") return;

      const playerUci = `${from}${to}${promotion || ""}`;

      // Check if move matches any accepted solution line at current ply
      const matchingLines = puzzle.solutionLinesUci.filter(
        (line) => line[currentPlyIndex] === playerUci
      );

      let moveRes;
      try {
        moveRes = c.move({
          from: from as Square,
          to: to as Square,
          promotion,
        });
      } catch {
        return;
      }

      if (!moveRes) return;

      const newChess = new Chess(c.fen());
      chessRef.current = newChess;
      setChess(newChess);
      setLastMove({ from, to });
      setSelectedSquare(null);
      setLegalDestinations([]);
      setPendingPromotion(null);

      // Sound
      const isCastle = moveRes.san.startsWith("O-O");
      if (newChess.inCheck()) {
        chessAudio.playCheck();
      } else if (isCastle) {
        chessAudio.playCastle();
      } else if (moveRes.captured) {
        chessAudio.playCapture();
      } else {
        chessAudio.playMove();
      }

      if (matchingLines.length > 0) {
        // Move is correct!
        const nextPly = currentPlyIndex + 1;
        setCurrentPlyIndex(nextPly);

        // Check if there is an opponent reply at nextPly
        const lineWithReply = matchingLines.find((l) => l.length > nextPly);
        if (lineWithReply) {
          const opponentUci = lineWithReply[nextPly];
          setStatus("opponent_turn");
          setFeedback("Langkah tepat! Menunggu balasan lawan...");

          opponentTimeoutRef.current = setTimeout(() => {
            if (activePuzzleIdRef.current !== puzzle.id) return;

            const oppFrom = opponentUci.slice(0, 2) as Square;
            const oppTo = opponentUci.slice(2, 4) as Square;
            const oppProm = opponentUci.length > 4 ? (opponentUci[4] as "q" | "r" | "b" | "n") : undefined;

            try {
              const oppRes = chessRef.current.move({
                from: oppFrom,
                to: oppTo,
                promotion: oppProm,
              });

              if (oppRes) {
                const afterOppChess = new Chess(chessRef.current.fen());
                chessRef.current = afterOppChess;
                setChess(afterOppChess);
                setLastMove({ from: oppFrom, to: oppTo });

                const isOppCastle = oppRes.san.startsWith("O-O");
                if (afterOppChess.inCheck()) {
                  chessAudio.playCheck();
                } else if (isOppCastle) {
                  chessAudio.playCastle();
                } else if (oppRes.captured) {
                  chessAudio.playCapture();
                } else {
                  chessAudio.playOpponentMove();
                }

                const plyAfterOpp = nextPly + 1;
                setCurrentPlyIndex(plyAfterOpp);

                // Check if further player move required
                if (lineWithReply.length > plyAfterOpp) {
                  setStatus("waiting_player");
                  setFeedback("Langkah bagus! Temukan kelanjutan serangan berikutnya.");
                } else {
                  // Puzzle completed!
                  setStatus("completed");
                  setFeedback("Luar biasa! Puzzle berhasil dipecahkan.");
                  chessAudio.playGameOver(true);
                  chessAudio.playSuccess();
                  recordPuzzleSolved(puzzle.id, solutionRevealed);
                  unlockBadge("puzzle_solver");

                  const skillDef = getSkillByPuzzleId(puzzle.id);
                  if (skillDef) {
                    recordActivityEvidence({
                      skillId: skillDef.id,
                      sourceKind: "puzzle",
                      sourceId: puzzle.id,
                      timestamp: new Date().toISOString(),
                      outcome: solutionRevealed ? "assisted" : "success",
                      hintsUsed: hintsUnlocked,
                      weight: solutionRevealed ? 0.2 : hintsUnlocked === 0 ? 1.0 : 0.7,
                    });
                  }
                }
              }
            } catch {}
          }, 450);
        } else {
          // Direct finish (e.g. mate in 1 or final blow)
          setStatus("completed");
          setFeedback("Luar biasa! Puzzle berhasil dipecahkan.");
          chessAudio.playGameOver(true);
          chessAudio.playSuccess();
          recordPuzzleSolved(puzzle.id, solutionRevealed);
          unlockBadge("puzzle_solver");

          const skillDef = getSkillByPuzzleId(puzzle.id);
          if (skillDef) {
            recordActivityEvidence({
              skillId: skillDef.id,
              sourceKind: "puzzle",
              sourceId: puzzle.id,
              timestamp: new Date().toISOString(),
              outcome: solutionRevealed ? "assisted" : "success",
              hintsUsed: hintsUnlocked,
              weight: solutionRevealed ? 0.2 : hintsUnlocked === 0 ? 1.0 : 0.7,
            });
          }
        }
      } else {
        // Legal move, but not the puzzle tactical solution
        setStatus("wrong_step");
        setFeedback("Langkah sah, namun bukan solusi taktis terbaik. Coba cari alternatif lain!");
        chessAudio.playError();
        recordPuzzleAttempt(puzzle.id, true);

        const skillDef = getSkillByPuzzleId(puzzle.id);
        if (skillDef) {
          recordActivityEvidence({
            skillId: skillDef.id,
            sourceKind: "puzzle",
            sourceId: `${puzzle.id}-err-${Date.now()}`,
            timestamp: new Date().toISOString(),
            outcome: "mistake",
            hintsUsed: hintsUnlocked,
            weight: 0.5,
          });
        }

        // Revert move after 600ms so board returns to retryable state
        opponentTimeoutRef.current = setTimeout(() => {
          if (activePuzzleIdRef.current !== puzzle.id) return;
          try {
            chessRef.current.undo();
            const reverted = new Chess(chessRef.current.fen());
            chessRef.current = reverted;
            setChess(reverted);
            setLastMove(null);
            setStatus("waiting_player");
          } catch {}
        }, 650);
      }
    },
    [currentPlyIndex, hintsUnlocked, puzzle.id, puzzle.solutionLinesUci, solutionRevealed, status]
  );

  const handleSquareClick = useCallback(
    (squareCoord: string) => {
      const c = chessRef.current;
      if (status !== "waiting_player" && status !== "wrong_step") return;

      const sq = squareCoord as Square;

      if (selectedSquare) {
        if (selectedSquare === sq) {
          setSelectedSquare(null);
          setLegalDestinations([]);
          return;
        }

        if (legalDestinations.includes(sq)) {
          const piece = c.get(selectedSquare as Square);
          const isPromotion =
            piece?.type === "p" &&
            ((piece.color === "w" && sq.endsWith("8")) || (piece.color === "b" && sq.endsWith("1")));

          if (isPromotion) {
            setPendingPromotion({ from: selectedSquare, to: sq });
            return;
          }

          executePlayerMove(selectedSquare, sq);
          return;
        }

        const clickedPiece = c.get(sq);
        if (clickedPiece && clickedPiece.color === c.turn()) {
          setSelectedSquare(sq);
          const moves = c.moves({ square: sq, verbose: true });
          setLegalDestinations(moves.map((m) => m.to));
          return;
        }

        setSelectedSquare(null);
        setLegalDestinations([]);
        return;
      }

      const piece = c.get(sq);
      if (piece && piece.color === c.turn()) {
        setSelectedSquare(sq);
        const moves = c.moves({ square: sq, verbose: true });
        setLegalDestinations(moves.map((m) => m.to));
      }
    },
    [executePlayerMove, legalDestinations, selectedSquare, status]
  );

  return {
    chess,
    selectedSquare,
    legalDestinations,
    lastMove,
    pendingPromotion,
    status,
    feedback,
    hintsUnlocked,
    solutionRevealed,
    handleSquareClick,
    confirmPromotion: (piece: "q" | "r" | "b" | "n") => {
      if (pendingPromotion) {
        executePlayerMove(pendingPromotion.from, pendingPromotion.to, piece);
      }
    },
    cancelPromotion: () => {
      setPendingPromotion(null);
      setSelectedSquare(null);
      setLegalDestinations([]);
    },
    resetPuzzle,
    requestHint,
    revealSolution,
  };
}
