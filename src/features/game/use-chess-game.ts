"use client";

import { useState, useEffect, useRef, useCallback, useSyncExternalStore } from "react";
import { Chess, Square } from "chess.js";
import {
  PlayerColor,
  BotDifficultyLevel,
  TimeControlId,
  GameStatus,
  GameResult,
  ChessMoveRecord,
  EngineStatus,
  ArchivedGame,
} from "@/types/chess";
import {
  getDifficultyConfig,
  applyControlledDifficultyMove,
} from "@/features/engine/difficulty";
import {
  IChessEngine,
  StockfishWorkerEngine,
} from "@/features/engine/stockfish-adapter";
import { saveArchivedGame, CURRENT_SCHEMA_VERSION } from "@/lib/storage/game-archive";
import { chessAudio } from "@/lib/audio/chess-audio";
import {
  evaluateMoveSafety,
  generateSocraticHint,
  getCoPilotPreferences,
  subscribeCoPilotPreferences,
  DEFAULT_COPILOT_PREFERENCES,
  BlunderReport,
  SocraticHint,
} from "@/features/copilot";
import { recordActivityEvidence } from "@/features/learning";

export interface ChessGameConfig {
  playerColor: PlayerColor;
  botDifficulty: BotDifficultyLevel;
  timeControl: TimeControlId;
  isPracticeMode: boolean;
}

const DEFAULT_CONFIG: ChessGameConfig = {
  playerColor: "white",
  botDifficulty: "beginner",
  timeControl: "5m",
  isPracticeMode: true,
};

// Natural human-like minimum thinking delay (in ms)
const BOT_MIN_THINKING_DELAYS: Record<BotDifficultyLevel, number> = {
  beginner: 650,     // Santai
  casual: 850,       // Pemula
  intermediate: 1100, // Berkembang
  advanced: 1300,    // Menantang
  master: 1500,      // Kuat
};

function getInitialTimeMs(timeControl: TimeControlId): number {
  switch (timeControl) {
    case "3m":
      return 3 * 60 * 1000;
    case "5m":
      return 5 * 60 * 1000;
    case "10m":
      return 10 * 60 * 1000;
    case "unlimited":
    default:
      return 0;
  }
}

export function useChessGame(
  initialConfig: ChessGameConfig = DEFAULT_CONFIG,
  customEngine?: IChessEngine
) {
  const [config, setConfig] = useState<ChessGameConfig>(initialConfig);
  const [chess, setChess] = useState<Chess>(() => new Chess());
  const chessRef = useRef<Chess>(chess);

  // Keep chessRef in sync with chess state
  useEffect(() => {
    chessRef.current = chess;
  }, [chess]);

  const engineRef = useRef<IChessEngine | null>(customEngine || null);

  const [fen, setFen] = useState<string>(() => new Chess().fen());
  const [turn, setTurn] = useState<"w" | "b">("w");
  const [isCheck, setIsCheck] = useState<boolean>(false);
  const [gameStatus, setGameStatus] = useState<GameStatus>("not_started");
  const gameStatusRef = useRef<GameStatus>("not_started");

  const [gameResult, setGameResult] = useState<GameResult>("ongoing");
  const [terminationReason, setTerminationReason] = useState<string>("");
  const [history, setHistory] = useState<ChessMoveRecord[]>([]);
  const historyRef = useRef<ChessMoveRecord[]>([]);

  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);

  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalDestinations, setLegalDestinations] = useState<string[]>([]);
  const [pendingPromotion, setPendingPromotion] = useState<{
    from: string;
    to: string;
  } | null>(null);

  const [botThinking, setBotThinking] = useState<boolean>(false);
  const [engineStatus, setEngineStatus] = useState<EngineStatus>("loading");

  // In-Game AI Co-Pilot State
  const coPilotPreferences = useSyncExternalStore(
    subscribeCoPilotPreferences,
    getCoPilotPreferences,
    () => DEFAULT_COPILOT_PREFERENCES
  );
  const [pendingBlunder, setPendingBlunder] = useState<{
    from: Square;
    to: Square;
    promotion?: "q" | "r" | "b" | "n";
    report: BlunderReport;
  } | null>(null);
  const [currentHint, setCurrentHint] = useState<SocraticHint | null>(null);
  const [hintLoading, setHintLoading] = useState<boolean>(false);
  const [isSocraticActive, setIsSocraticActive] = useState<boolean>(false);
  const isSocraticActiveRef = useRef<boolean>(false);
  const currentHintRequestIdRef = useRef<number>(0);
  const [undoFeedback, setUndoFeedback] = useState<string | null>(null);

  // Real-time delta clocks
  const initialTime = getInitialTimeMs(initialConfig.timeControl);
  const [whiteClockMs, setWhiteClockMs] = useState<number>(initialTime);
  const [blackClockMs, setBlackClockMs] = useState<number>(initialTime);
  const lastTickTimeRef = useRef<number>(0);
  const clockIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Search ID tracking and game over guard
  const currentSearchIdRef = useRef<number>(0);
  const gameSavedRef = useRef<boolean>(false);
  const gameStartTimeRef = useRef<number>(0);

  // Initialize engine
  useEffect(() => {
    if (!engineRef.current) {
      engineRef.current = new StockfishWorkerEngine("/engine/stockfish.js");
    }

    const eng = engineRef.current;
    eng
      .init()
      .then((ok) => {
        setEngineStatus(ok ? "ready" : "error");
      })
      .catch(() => {
        setEngineStatus("error");
      });

    return () => {
      eng.destroy();
    };
  }, []);

  // Check game termination status from chess.js
  const evaluateGameTermination = useCallback((): {
    status: GameStatus;
    result: GameResult;
    reason: string;
  } | null => {
    const c = chessRef.current;
    if (c.isCheckmate()) {
      const winner = c.turn() === "w" ? "black_win" : "white_win";
      const reason = "Skakmat";
      return { status: "checkmate", result: winner, reason };
    }
    if (c.isStalemate()) {
      return { status: "stalemate", result: "draw", reason: "Remis (Stalemate / Jalan Buntu)" };
    }
    if (c.isThreefoldRepetition()) {
      return {
        status: "threefold_repetition",
        result: "draw",
        reason: "Remis (Pengulangan Posisi Tiga Kali)",
      };
    }
    if (c.isInsufficientMaterial()) {
      return {
        status: "insufficient_material",
        result: "draw",
        reason: "Remis (Materi Tidak Cukup untuk Skakmat)",
      };
    }
    if (c.isDraw()) {
      return {
        status: "fifty_move_rule",
        result: "draw",
        reason: "Remis (Aturan 50 Langkah)",
      };
    }
    return null;
  }, []);

  // Save game record on game over
  const recordGameOver = useCallback(
    (
      status: GameStatus,
      result: GameResult,
      reason: string,
      currentHistory: ChessMoveRecord[]
    ) => {
      if (gameSavedRef.current) return;
      gameSavedRef.current = true;

      gameStatusRef.current = status;
      setGameStatus(status);
      setGameResult(result);
      setTerminationReason(reason);
      setBotThinking(false);
      setIsSocraticActive(false);
      isSocraticActiveRef.current = false;
      currentHintRequestIdRef.current++;
      setCurrentHint(null);

      if (clockIntervalRef.current) {
        clearInterval(clockIntervalRef.current);
        clockIntervalRef.current = null;
      }

      // Audio notification on game over
      const playerWon =
        (config.playerColor === "white" && result === "white_win") ||
        (config.playerColor === "black" && result === "black_win");
      chessAudio.playGameOver(playerWon);

      // Map result to ArchivedGame format
      let mappedResult: "white_win" | "black_win" | "draw" | "aborted" = "draw";
      if (result === "white_win") mappedResult = "white_win";
      else if (result === "black_win") mappedResult = "black_win";
      else if (status === "aborted") mappedResult = "aborted";

      const startTime = gameStartTimeRef.current || Date.now();
      const archived: ArchivedGame = {
        schemaVersion: CURRENT_SCHEMA_VERSION,
        id: `game-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        playerColor: config.playerColor,
        botLevel: getDifficultyConfig(config.botDifficulty).label,
        timeControlId: config.timeControl,
        timeControlLabel: config.timeControl === "unlimited" ? "Tanpa Waktu" : config.timeControl,
        result: mappedResult,
        termination: reason,
        initialFen: new Chess().fen(),
        finalFen: chessRef.current.fen(),
        pgn: chessRef.current.pgn(),
        moves: currentHistory,
        durationMs: Math.max(0, Date.now() - startTime),
        engineVersion: "Stockfish 19 Lite",
      };

      saveArchivedGame(archived);
    },
    [config]
  );

  // Accurate Clock countdown using monotonic timestamp delta
  useEffect(() => {
    if (config.timeControl === "unlimited" || gameStatus !== "ongoing") {
      if (clockIntervalRef.current) {
        clearInterval(clockIntervalRef.current);
        clockIntervalRef.current = null;
      }
      return;
    }

    lastTickTimeRef.current = Date.now();

    clockIntervalRef.current = setInterval(() => {
      const now = Date.now();
      const deltaMs = Math.max(0, now - lastTickTimeRef.current);
      lastTickTimeRef.current = now;

      const currentTurn = chessRef.current.turn();
      if (currentTurn === "w") {
        setWhiteClockMs((prev) => {
          const next = prev - deltaMs;
          if (next <= 0) {
            recordGameOver("timeout", "black_win", "Waktu Habis (Hitam Menang)", historyRef.current);
            return 0;
          }
          return next;
        });
      } else {
        setBlackClockMs((prev) => {
          const next = prev - deltaMs;
          if (next <= 0) {
            recordGameOver("timeout", "white_win", "Waktu Habis (Putih Menang)", historyRef.current);
            return 0;
          }
          return next;
        });
      }
    }, 100);

    return () => {
      if (clockIntervalRef.current) {
        clearInterval(clockIntervalRef.current);
        clockIntervalRef.current = null;
      }
    };
  }, [config.timeControl, gameStatus, recordGameOver]);

  // Helper to fetch Socratic hint for a specific FEN position
  const fetchSocraticHintForFen = useCallback(
    async (targetFen?: string) => {
      const c = chessRef.current;
      if (c.isGameOver()) return;

      const requestId = ++currentHintRequestIdRef.current;
      const fenToAnalyze = targetFen || c.fen();
      setHintLoading(true);
      try {
        let bestMoveUci = "";
        if (engineRef.current && engineRef.current.getStatus() === "ready") {
          const searchRes = await engineRef.current.search({
            fen: fenToAnalyze,
            depth: 10,
            moveTimeMs: 400,
            skillLevel: 10,
            searchId: `hint-${Date.now()}`,
          });
          bestMoveUci = searchRes.bestMoveUci;
        }

        let socratic = bestMoveUci ? generateSocraticHint(c, bestMoveUci) : null;
        if (!socratic) {
          const legal = c.moves({ verbose: true });
          if (legal.length > 0) {
            const fallbackUci = `${legal[0].from}${legal[0].to}${legal[0].promotion || ""}`;
            socratic = generateSocraticHint(c, fallbackUci);
          }
        }

        if (socratic && requestId === currentHintRequestIdRef.current) {
          setCurrentHint(socratic);
          try {
            recordActivityEvidence({
              skillId: "strategy-piece-development",
              sourceKind: "game",
              sourceId: `socratic-hint-${Date.now()}`,
              timestamp: new Date().toISOString(),
              outcome: "assisted",
              hintsUsed: 1,
              weight: 0.5,
            });
          } catch {
            // Abaikan
          }
        }
      } catch (err) {
        console.error("Gagal meminta petunjuk Sokrates:", err);
      } finally {
        if (requestId === currentHintRequestIdRef.current) {
          setHintLoading(false);
        }
      }
    },
    []
  );

  // Execute bot move with natural thinking delay & clock ticking
  const triggerBotMove = useCallback(
    async (currentFen: string, currentHistory: ChessMoveRecord[]) => {
      const c = chessRef.current;
      if (c.isGameOver() || !engineRef.current) {
        return;
      }

      setBotThinking(true);
      const searchId = ++currentSearchIdRef.current;
      const diffConfig = getDifficultyConfig(config.botDifficulty);
      const minDelay = customEngine ? 0 : (BOT_MIN_THINKING_DELAYS[config.botDifficulty] || 800);
      const searchStartTime = Date.now();

      try {
        const legalMoves = c.moves({ verbose: true });
        if (legalMoves.length === 0) {
          setBotThinking(false);
          return;
        }

        const legalUciMoves = legalMoves.map((m) => `${m.from}${m.to}${m.promotion || ""}`);

        // Search via engine
        const searchResult = await engineRef.current.search({
          fen: currentFen,
          depth: diffConfig.depth,
          moveTimeMs: diffConfig.moveTimeMs,
          skillLevel: diffConfig.skillLevel,
          searchId: String(searchId),
        });

        // Enforce natural minimum human-like delay
        const searchElapsed = Date.now() - searchStartTime;
        if (searchElapsed < minDelay) {
          await new Promise((resolve) => setTimeout(resolve, minDelay - searchElapsed));
        }

        // Check if searchId is still valid (user didn't reset/undo in between)
        if (searchId !== currentSearchIdRef.current || chessRef.current.isGameOver()) {
          setBotThinking(false);
          return;
        }

        // Apply difficulty controller
        const chosenUci = applyControlledDifficultyMove(
          legalUciMoves,
          searchResult.bestMoveUci,
          config.botDifficulty
        );

        const from = chosenUci.slice(0, 2) as Square;
        const to = chosenUci.slice(2, 4) as Square;
        const promotion = (chosenUci[4] as "q" | "r" | "b" | "n") || undefined;

        // Apply move in chess.js safely
        let moveRes;
        try {
          moveRes = c.move({ from, to, promotion });
        } catch {
          moveRes = null;
        }

        if (!moveRes) {
          console.warn("Bot produced invalid move:", chosenUci);
          setBotThinking(false);
          return;
        }

        const newFen = c.fen();
        const moveRecord: ChessMoveRecord = {
          ply: currentHistory.length + 1,
          san: moveRes.san,
          uci: `${moveRes.from}${moveRes.to}${moveRes.promotion || ""}`,
          from: moveRes.from,
          to: moveRes.to,
          piece: moveRes.piece,
          captured: moveRes.captured,
          promotion: moveRes.promotion,
          fenAfter: newFen,
        };

        const updatedHistory = [...currentHistory, moveRecord];
        historyRef.current = updatedHistory;
        setHistory(updatedHistory);
        setFen(newFen);
        setTurn(c.turn());
        const checkState = c.inCheck();
        setIsCheck(checkState);
        setLastMove({ from: moveRes.from, to: moveRes.to });
        setBotThinking(false);

        // Sound effect
        if (checkState) {
          chessAudio.playCheck();
        } else if (moveRes.captured) {
          chessAudio.playCapture();
        } else {
          chessAudio.playMove();
        }

        // Check termination after bot move
        const term = evaluateGameTermination();
        if (term) {
          recordGameOver(term.status, term.result, term.reason, updatedHistory);
        } else if (isSocraticActiveRef.current) {
          fetchSocraticHintForFen(newFen);
        }
      } catch (err) {
        console.error("Bot search failed, falling back to safe legal move:", err);
        // Fallback: pick safe legal move
        const legal = c.moves({ verbose: true });
        if (legal.length > 0 && searchId === currentSearchIdRef.current) {
          const fallback = legal[0];
          let moveRes;
          try {
            moveRes = c.move({
              from: fallback.from,
              to: fallback.to,
              promotion: fallback.promotion,
            });
          } catch {
            moveRes = null;
          }

          if (moveRes) {
            const newFen = c.fen();
            const moveRecord: ChessMoveRecord = {
              ply: currentHistory.length + 1,
              san: moveRes.san,
              uci: `${moveRes.from}${moveRes.to}${moveRes.promotion || ""}`,
              from: moveRes.from,
              to: moveRes.to,
              piece: moveRes.piece,
              captured: moveRes.captured,
              promotion: moveRes.promotion,
              fenAfter: newFen,
            };
            const updatedHistory = [...currentHistory, moveRecord];
            historyRef.current = updatedHistory;
            setHistory(updatedHistory);
            setFen(newFen);
            setTurn(c.turn());
            const checkState = c.inCheck();
            setIsCheck(checkState);
            setLastMove({ from: moveRes.from, to: moveRes.to });

            if (checkState) {
              chessAudio.playCheck();
            } else if (moveRes.captured) {
              chessAudio.playCapture();
            } else {
              chessAudio.playMove();
            }

            const term = evaluateGameTermination();
            if (term) {
              recordGameOver(term.status, term.result, term.reason, updatedHistory);
            } else if (isSocraticActiveRef.current) {
              fetchSocraticHintForFen(newFen);
            }
          }
        }
        setBotThinking(false);
      }
    },
    [config.botDifficulty, customEngine, evaluateGameTermination, fetchSocraticHintForFen, recordGameOver]
  );

  // Apply player move
  const applyPlayerMove = useCallback(
    (from: Square, to: Square, promotion?: "q" | "r" | "b" | "n") => {
      const c = chessRef.current;
      if (c.isGameOver() || botThinking) return false;

      // Validate and make move with try-catch
      let moveRes;
      try {
        moveRes = c.move({ from, to, promotion });
      } catch {
        return false;
      }

      if (!moveRes) return false;

      if (!gameStartTimeRef.current) {
        gameStartTimeRef.current = Date.now();
      }

      gameStatusRef.current = "ongoing";
      setGameStatus("ongoing");

      const newFen = c.fen();
      const moveRecord: ChessMoveRecord = {
        ply: historyRef.current.length + 1,
        san: moveRes.san,
        uci: `${moveRes.from}${moveRes.to}${moveRes.promotion || ""}`,
        from: moveRes.from,
        to: moveRes.to,
        piece: moveRes.piece,
        captured: moveRes.captured,
        promotion: moveRes.promotion,
        fenAfter: newFen,
      };

      const updatedHistory = [...historyRef.current, moveRecord];
      historyRef.current = updatedHistory;
      setHistory(updatedHistory);
      setFen(newFen);
      setTurn(c.turn());
      const checkState = c.inCheck();
      setIsCheck(checkState);
      setLastMove({ from: moveRes.from, to: moveRes.to });
      setSelectedSquare(null);
      setLegalDestinations([]);

      // Invalidate in-flight hint and reset active hint to null while bot responds
      currentHintRequestIdRef.current++;
      if (isSocraticActiveRef.current) {
        setCurrentHint(null);
      }

      // Sound effect
      if (checkState) {
        chessAudio.playCheck();
      } else if (moveRes.captured) {
        chessAudio.playCapture();
      } else {
        chessAudio.playMove();
      }

      // Check game termination
      const term = evaluateGameTermination();
      if (term) {
        recordGameOver(term.status, term.result, term.reason, updatedHistory);
      } else {
        // Trigger bot move
        triggerBotMove(newFen, updatedHistory);
      }

      return true;
    },
    [botThinking, evaluateGameTermination, recordGameOver, triggerBotMove]
  );

  // Square selection / move attempt handler
  const handleSquareClick = useCallback(
    (square: string) => {
      const c = chessRef.current;
      if (c.isGameOver() || botThinking) return;

      const isPlayerTurn =
        (config.playerColor === "white" && c.turn() === "w") ||
        (config.playerColor === "black" && c.turn() === "b");

      if (!isPlayerTurn) return;

      const sq = square as Square;

      // If a piece is already selected
      if (selectedSquare) {
        // If clicking the same square, deselect
        if (selectedSquare === sq) {
          setSelectedSquare(null);
          setLegalDestinations([]);
          return;
        }

        // If clicking a legal destination
        if (legalDestinations.includes(sq)) {
          const piece = c.get(selectedSquare as Square);
          const isPawnPromotion =
            piece?.type === "p" &&
            ((piece.color === "w" && sq.endsWith("8")) ||
              (piece.color === "b" && sq.endsWith("1")));

          if (isPawnPromotion) {
            setPendingPromotion({ from: selectedSquare, to: sq });
            return;
          }

          // Intersep blunder jika Co-Pilot aktif pada Mode Latihan
          if (
            config.isPracticeMode &&
            coPilotPreferences.enabled &&
            coPilotPreferences.blunderSafetyNet
          ) {
            const safety = evaluateMoveSafety(
              c,
              selectedSquare as Square,
              sq,
              undefined,
              config.playerColor === "white" ? "w" : "b"
            );
            if (safety.isBlunder && (safety.severity === "blunder" || safety.severity === "fatal")) {
              setPendingBlunder({
                from: selectedSquare as Square,
                to: sq,
                report: safety,
              });
              return;
            }
          }

          applyPlayerMove(selectedSquare as Square, sq);
          return;
        }

        // If clicking another piece of player's own color, switch selection
        const clickedPiece = c.get(sq);
        if (clickedPiece && clickedPiece.color === c.turn()) {
          setSelectedSquare(sq);
          const moves = c.moves({ square: sq, verbose: true });
          setLegalDestinations(moves.map((m) => m.to));
          return;
        }

        // Otherwise deselect
        setSelectedSquare(null);
        setLegalDestinations([]);
        return;
      }

      // No square selected: select piece if it belongs to current player's turn
      const piece = c.get(sq);
      if (piece && piece.color === c.turn()) {
        setSelectedSquare(sq);
        const moves = c.moves({ square: sq, verbose: true });
        setLegalDestinations(moves.map((m) => m.to));
      }
    },
    [
      applyPlayerMove,
      botThinking,
      coPilotPreferences.blunderSafetyNet,
      coPilotPreferences.enabled,
      config.isPracticeMode,
      config.playerColor,
      legalDestinations,
      selectedSquare,
    ]
  );

  const confirmPromotion = useCallback(
    (piece: "q" | "r" | "b" | "n") => {
      if (pendingPromotion) {
        if (
          config.isPracticeMode &&
          coPilotPreferences.enabled &&
          coPilotPreferences.blunderSafetyNet
        ) {
          const safety = evaluateMoveSafety(
            chessRef.current,
            pendingPromotion.from as Square,
            pendingPromotion.to as Square,
            piece,
            config.playerColor === "white" ? "w" : "b"
          );
          if (safety.isBlunder && (safety.severity === "blunder" || safety.severity === "fatal")) {
            setPendingBlunder({
              from: pendingPromotion.from as Square,
              to: pendingPromotion.to as Square,
              promotion: piece,
              report: safety,
            });
            setPendingPromotion(null);
            return;
          }
        }

        applyPlayerMove(
          pendingPromotion.from as Square,
          pendingPromotion.to as Square,
          piece
        );
        setPendingPromotion(null);
        setSelectedSquare(null);
        setLegalDestinations([]);
      }
    },
    [
      applyPlayerMove,
      coPilotPreferences.blunderSafetyNet,
      coPilotPreferences.enabled,
      config.isPracticeMode,
      config.playerColor,
      pendingPromotion,
    ]
  );

  const cancelBlunderMove = useCallback(() => {
    if (pendingBlunder) {
      try {
        recordActivityEvidence({
          skillId: "strategy-king-safety",
          sourceKind: "game",
          sourceId: `blunder-saved-${Date.now()}`,
          timestamp: new Date().toISOString(),
          outcome: "success",
          hintsUsed: 0,
          weight: 0.8,
        });
      } catch {
        // Abaikan
      }
    }
    setPendingBlunder(null);
    setSelectedSquare(null);
    setLegalDestinations([]);
  }, [pendingBlunder]);

  const proceedBlunderMove = useCallback(() => {
    if (pendingBlunder) {
      applyPlayerMove(
        pendingBlunder.from,
        pendingBlunder.to,
        pendingBlunder.promotion
      );
      setPendingBlunder(null);
    }
  }, [applyPlayerMove, pendingBlunder]);

  const requestSocraticHint = useCallback(async () => {
    const c = chessRef.current;
    if (c.isGameOver() || botThinking) return;

    setIsSocraticActive(true);
    isSocraticActiveRef.current = true;
    await fetchSocraticHintForFen(c.fen());
  }, [botThinking, fetchSocraticHintForFen]);

  const clearHint = useCallback(() => {
    setIsSocraticActive(false);
    isSocraticActiveRef.current = false;
    currentHintRequestIdRef.current++;
    setCurrentHint(null);
    setHintLoading(false);
  }, []);

  const cancelPromotion = useCallback(() => {
    setPendingPromotion(null);
    setSelectedSquare(null);
    setLegalDestinations([]);
  }, []);

  // Resign
  const resignGame = useCallback(() => {
    if (gameStatusRef.current === "ongoing" || historyRef.current.length > 0) {
      const winner = config.playerColor === "white" ? "black_win" : "white_win";
      recordGameOver("resigned", winner, "Pemain Menyerah", historyRef.current);
    }
  }, [config.playerColor, recordGameOver]);

  // Undo move (practice mode only)
  const undoMove = useCallback(() => {
    if (!config.isPracticeMode || historyRef.current.length === 0 || botThinking) return;

    // Invalidate current search
    currentSearchIdRef.current++;
    if (engineRef.current) {
      engineRef.current.stop();
    }

    const c = chessRef.current;
    // Determine how many plies to undo:
    // If playing as White and it's White's turn, bot already replied -> undo 2 plies
    // If only 1 move was made -> undo 1 ply
    const pliesToUndo = historyRef.current.length >= 2 ? 2 : 1;

    for (let i = 0; i < pliesToUndo; i++) {
      c.undo();
    }

    const updatedHistory = historyRef.current.slice(0, historyRef.current.length - pliesToUndo);
    historyRef.current = updatedHistory;
    setHistory(updatedHistory);
    setFen(c.fen());
    setTurn(c.turn());
    setIsCheck(c.inCheck());

    const prevMove = updatedHistory[updatedHistory.length - 1];
    setLastMove(prevMove ? { from: prevMove.from, to: prevMove.to } : null);
    setSelectedSquare(null);
    setLegalDestinations([]);
    setPendingPromotion(null);
    setBotThinking(false);

    if (updatedHistory.length === 0) {
      gameStatusRef.current = "not_started";
      setGameStatus("not_started");
    }

    // Refresh socratic hint if active on restored board position
    if (isSocraticActiveRef.current && !c.isGameOver()) {
      currentHintRequestIdRef.current++;
      setCurrentHint(null);
      fetchSocraticHintForFen(c.fen());
    } else {
      setCurrentHint(null);
    }

    setUndoFeedback(
      "Langkah ditarik kembali. Amati petak aman atau pengawalan perwira sebelum melangkah lagi."
    );
  }, [botThinking, config.isPracticeMode, fetchSocraticHintForFen]);

  // Start new game
  const startNewGame = useCallback(
    (newConfig?: Partial<ChessGameConfig>) => {
      currentSearchIdRef.current++;
      if (engineRef.current) {
        engineRef.current.stop();
      }

      const resolvedConfig: ChessGameConfig = {
        ...config,
        ...(newConfig || {}),
      };

      const newChessInstance = new Chess();
      chessRef.current = newChessInstance;
      setChess(newChessInstance);

      const freshFen = newChessInstance.fen();
      gameSavedRef.current = false;
      gameStartTimeRef.current = Date.now();
      lastTickTimeRef.current = Date.now();

      setConfig(resolvedConfig);
      setFen(freshFen);
      setTurn("w");
      setIsCheck(false);
      gameStatusRef.current = "ongoing";
      setGameStatus("ongoing");
      setGameResult("ongoing");
      setTerminationReason("");
      historyRef.current = [];
      setHistory([]);
      setLastMove(null);
      setSelectedSquare(null);
      setLegalDestinations([]);
      setPendingPromotion(null);
      setPendingBlunder(null);
      setIsSocraticActive(false);
      isSocraticActiveRef.current = false;
      currentHintRequestIdRef.current++;
      setCurrentHint(null);
      setHintLoading(false);
      setUndoFeedback(null);
      setBotThinking(false);

      const tMs = getInitialTimeMs(resolvedConfig.timeControl);
      setWhiteClockMs(tMs);
      setBlackClockMs(tMs);

      // If player is Black, bot plays White and makes first move immediately
      if (resolvedConfig.playerColor === "black") {
        triggerBotMove(freshFen, []);
      }
    },
    [config, triggerBotMove]
  );

  // Reset current game
  const resetGame = useCallback(() => {
    startNewGame(config);
  }, [config, startNewGame]);

  // Play from custom position (e.g. Turning Point replay)
  const playFromPosition = useCallback(
    (
      fenToPlay: string,
      historyPrefix?: ChessMoveRecord[],
      customPlayerColor?: PlayerColor
    ) => {
      currentSearchIdRef.current++;
      if (engineRef.current) {
        engineRef.current.stop();
      }

      let restoredChess: Chess;
      try {
        restoredChess = new Chess(fenToPlay);
      } catch {
        restoredChess = new Chess();
      }

      chessRef.current = restoredChess;
      setChess(restoredChess);
      setFen(restoredChess.fen());
      setTurn(restoredChess.turn());
      setIsCheck(restoredChess.inCheck());

      const newHistory = historyPrefix ? [...historyPrefix] : [];
      historyRef.current = newHistory;
      setHistory(newHistory);

      const lastMoveItem = newHistory[newHistory.length - 1];
      setLastMove(lastMoveItem ? { from: lastMoveItem.from, to: lastMoveItem.to } : null);

      setSelectedSquare(null);
      setLegalDestinations([]);
      setPendingPromotion(null);
      setPendingBlunder(null);
      setBotThinking(false);

      gameSavedRef.current = false;
      gameStartTimeRef.current = Date.now();
      lastTickTimeRef.current = Date.now();
      gameStatusRef.current = "ongoing";
      setGameStatus("ongoing");
      setGameResult("ongoing");
      setTerminationReason("");

      if (customPlayerColor && customPlayerColor !== config.playerColor) {
        setConfig((prev) => ({ ...prev, playerColor: customPlayerColor }));
      }

      const activePlayerColor = customPlayerColor || config.playerColor;
      const playerColorCode = activePlayerColor === "white" ? "w" : "b";

      setUndoFeedback(
        "Permainan diputar ulang dari Titik Balik. Silakan coba langkah alternatif yang lebih kokoh!"
      );

      // Refresh socratic hint if active on restored board position
      if (isSocraticActiveRef.current && !restoredChess.isGameOver()) {
        currentHintRequestIdRef.current++;
        setCurrentHint(null);
        fetchSocraticHintForFen(restoredChess.fen());
      } else {
        setCurrentHint(null);
      }

      // If it is bot's turn, trigger bot move immediately
      if (restoredChess.turn() !== playerColorCode && !restoredChess.isGameOver()) {
        triggerBotMove(
          restoredChess.fen(),
          newHistory
        );
      }
    },
    [config.playerColor, fetchSocraticHintForFen, triggerBotMove]
  );

  return {
    chess,
    fen,
    turn,
    isCheck,
    gameStatus,
    gameResult,
    terminationReason,
    history,
    lastMove,
    selectedSquare,
    legalDestinations,
    pendingPromotion,
    whiteClockMs,
    blackClockMs,
    botThinking,
    engineStatus,
    config,
    // Co-Pilot Pendampingan Aktif
    coPilotPreferences,
    isSocraticActive,
    pendingBlunder,
    cancelBlunderMove,
    proceedBlunderMove,
    requestSocraticHint,
    currentHint,
    clearHint,
    hintLoading,
    undoFeedback,
    setUndoFeedback,
    handleSquareClick,
    confirmPromotion,
    cancelPromotion,
    undoMove,
    resignGame,
    startNewGame,
    resetGame,
    playFromPosition,
  };
}
