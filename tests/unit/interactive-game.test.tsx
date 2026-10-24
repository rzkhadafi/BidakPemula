import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, renderHook, act } from "@testing-library/react";
import { useChessGame } from "@/features/game/use-chess-game";
import { MockChessEngine } from "@/features/engine/stockfish-adapter";
import { InteractiveChessboard } from "@/components/chessboard/InteractiveChessboard";
import { Chess } from "chess.js";
import { getArchivedGames } from "@/lib/storage/game-archive";
import { ChessMoveRecord } from "@/types/chess";

describe("Chess Game Hook & Interactive Board (useChessGame)", () => {
  let mockEngine: MockChessEngine;

  beforeEach(() => {
    window.localStorage.clear();
    mockEngine = new MockChessEngine("e7e5");
  });

  it("initializes with starting standard position and White turn", () => {
    const { result } = renderHook(() =>
      useChessGame(
        {
          playerColor: "white",
          botDifficulty: "master",
          timeControl: "5m",
          isPracticeMode: true,
        },
        mockEngine
      )
    );

    expect(result.current.turn).toBe("w");
    expect(result.current.history.length).toBe(0);
    expect(result.current.gameStatus).toBe("not_started");
  });

  it("selects piece and computes legal destinations on square click", () => {
    const { result } = renderHook(() =>
      useChessGame(
        {
          playerColor: "white",
          botDifficulty: "master",
          timeControl: "5m",
          isPracticeMode: true,
        },
        mockEngine
      )
    );

    // Click on e2 pawn
    act(() => {
      result.current.handleSquareClick("e2");
    });

    expect(result.current.selectedSquare).toBe("e2");
    // e2 pawn can move to e3 and e4
    expect(result.current.legalDestinations).toContain("e3");
    expect(result.current.legalDestinations).toContain("e4");
  });

  it("executes player move when clicking a legal destination and triggers bot reply", async () => {
    const { result } = renderHook(() =>
      useChessGame(
        {
          playerColor: "white",
          botDifficulty: "master", // Master level uses engine best move deterministically
          timeControl: "5m",
          isPracticeMode: true,
        },
        mockEngine
      )
    );

    // 1. Select e2
    act(() => {
      result.current.handleSquareClick("e2");
    });

    // 2. Click e4 to make the move
    await act(async () => {
      result.current.handleSquareClick("e4");
    });

    // Player move executed
    expect(result.current.history.length).toBeGreaterThanOrEqual(1);
    expect(result.current.history[0].san).toBe("e4");

    // Wait for mock engine reply (e7e5)
    await act(async () => {
      await new Promise((r) => setTimeout(r, 80));
    });

    expect(result.current.history.length).toBe(2);
    expect(result.current.history[1].san).toBe("e5");
    expect(result.current.turn).toBe("w"); // Back to White's turn
  });

  it("handles practice mode undo correctly", async () => {
    const { result } = renderHook(() =>
      useChessGame(
        {
          playerColor: "white",
          botDifficulty: "master",
          timeControl: "5m",
          isPracticeMode: true,
        },
        mockEngine
      )
    );

    // Make player move e2e4 and let bot respond
    act(() => {
      result.current.handleSquareClick("e2");
    });
    await act(async () => {
      result.current.handleSquareClick("e4");
      await new Promise((r) => setTimeout(r, 80));
    });

    expect(result.current.history.length).toBe(2);

    // Undo move
    act(() => {
      result.current.undoMove();
    });

    // Both bot move and player move undone so player can move again
    expect(result.current.history.length).toBe(0);
    expect(result.current.turn).toBe("w");
  });

  it("handles resignation and records game to local archive", async () => {
    const { result } = renderHook(() =>
      useChessGame(
        {
          playerColor: "white",
          botDifficulty: "master",
          timeControl: "5m",
          isPracticeMode: true,
        },
        mockEngine
      )
    );

    // Make 1 move first
    act(() => {
      result.current.handleSquareClick("e2");
    });
    await act(async () => {
      result.current.handleSquareClick("e4");
    });

    // Resign
    act(() => {
      result.current.resignGame();
    });

    expect(result.current.gameStatus).toBe("resigned");
    expect(result.current.gameResult).toBe("black_win");

    // Check that game was saved in localStorage
    const saved = getArchivedGames();
    expect(saved.length).toBe(1);
    expect(saved[0].termination).toBe("Pemain Menyerah");
  });

  it("renders InteractiveChessboard and responds to clicks", () => {
    const chess = new Chess();
    const handleSquareClick = vi.fn();
    const handleConfirmPromotion = vi.fn();
    const handleCancelPromotion = vi.fn();

    render(
      <InteractiveChessboard
        chess={chess}
        orientation="white"
        selectedSquare="e2"
        legalDestinations={["e3", "e4"]}
        lastMove={null}
        isCheck={false}
        pendingPromotion={null}
        onSquareClick={handleSquareClick}
        onConfirmPromotion={handleConfirmPromotion}
        onCancelPromotion={handleCancelPromotion}
      />
    );

    const e2Square = screen.getByLabelText(/Petak e2/i);
    expect(e2Square).toBeInTheDocument();

    fireEvent.click(e2Square);
    expect(handleSquareClick).toHaveBeenCalledWith("e2");
  });

  it("displays promotion modal when pendingPromotion is set", () => {
    const chess = new Chess();
    const handleConfirmPromotion = vi.fn();
    const handleCancelPromotion = vi.fn();

    render(
      <InteractiveChessboard
        chess={chess}
        orientation="white"
        selectedSquare="e7"
        legalDestinations={["e8"]}
        lastMove={null}
        isCheck={false}
        pendingPromotion={{ from: "e7", to: "e8" }}
        onSquareClick={() => {}}
        onConfirmPromotion={handleConfirmPromotion}
        onCancelPromotion={handleCancelPromotion}
      />
    );

    expect(screen.getByText("Promosi Pion")).toBeInTheDocument();
    expect(screen.getByText("Menteri")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Menteri"));
    expect(handleConfirmPromotion).toHaveBeenCalledWith("q");
  });

  it("auto-updates socratic hints in real-time when player moves and bot responds", async () => {
    mockEngine.setMockMove("e2e4");
    const { result } = renderHook(() =>
      useChessGame(
        {
          playerColor: "white",
          botDifficulty: "master",
          timeControl: "5m",
          isPracticeMode: true,
        },
        mockEngine
      )
    );

    // Initial state: socratic not active
    expect(result.current.isSocraticActive).toBe(false);
    expect(result.current.currentHint).toBeNull();

    // 1. User requests Socratic hint for starting move
    await act(async () => {
      await result.current.requestSocraticHint();
    });

    expect(result.current.isSocraticActive).toBe(true);
    expect(result.current.currentHint).not.toBeNull();
    const firstHintFen = result.current.currentHint?.fen;

    // Set engine reply for bot move (e7e5) and then subsequent White hint (g1f3)
    mockEngine.setMockMove("e7e5");

    // 2. Player executes move e2e4
    act(() => {
      result.current.handleSquareClick("e2");
    });
    await act(async () => {
      result.current.handleSquareClick("e4");
    });

    // While bot responds, companion remains active
    expect(result.current.isSocraticActive).toBe(true);

    // 3. Wait for bot reply (e7e5)
    await act(async () => {
      await new Promise((r) => setTimeout(r, 80));
    });

    expect(result.current.history.length).toBe(2);
    expect(result.current.history[1].san).toBe("e5");

    // 4. Wait for real-time automatic Socratic hint fetch on White's new turn
    await act(async () => {
      await new Promise((r) => setTimeout(r, 80));
    });

    // Companion automatically updated hint for White's new turn in real time!
    expect(result.current.isSocraticActive).toBe(true);
    expect(result.current.currentHint).not.toBeNull();
    expect(result.current.currentHint?.fen).not.toBe(firstHintFen);
    expect(result.current.turn).toBe("w");

    // 5. User closes hint
    act(() => {
      result.current.clearHint();
    });
    expect(result.current.isSocraticActive).toBe(false);
    expect(result.current.currentHint).toBeNull();
  });

  it("supports playFromPosition to replay from a turning point", () => {
    const { result } = renderHook(() =>
      useChessGame(
        {
          playerColor: "white",
          botDifficulty: "master",
          timeControl: "5m",
          isPracticeMode: true,
        },
        mockEngine
      )
    );

    // Make an initial move to make game ongoing
    act(() => {
      result.current.handleSquareClick("e2");
    });
    act(() => {
      result.current.handleSquareClick("e4");
    });
    expect(result.current.gameStatus).toBe("ongoing");

    // Resign to end game
    act(() => {
      result.current.resignGame();
    });
    expect(result.current.gameStatus).toBe("resigned");

    // Replay from Turning Point (e.g. Move 1 e4 e5)
    const turningPointFen = "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2";
    const historyPrefix: ChessMoveRecord[] = [
      { ply: 1, from: "e2", to: "e4", san: "e4", uci: "e2e4", piece: "p", fenAfter: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1" },
      { ply: 2, from: "e7", to: "e5", san: "e5", uci: "e7e5", piece: "p", fenAfter: turningPointFen },
    ];

    act(() => {
      result.current.playFromPosition(turningPointFen, historyPrefix, "white");
    });

    expect(result.current.gameStatus).toBe("ongoing");
    expect(result.current.turn).toBe("w");
    expect(result.current.fen).toBe(turningPointFen);
    expect(result.current.history.length).toBe(2);
    expect(result.current.lastMove).toEqual({ from: "e7", to: "e5" });
  });
});
