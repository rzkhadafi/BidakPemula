import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, renderHook, act } from "@testing-library/react";
import { useChessGame } from "@/features/game/use-chess-game";
import { MockChessEngine } from "@/features/engine/stockfish-adapter";
import { InteractiveChessboard } from "@/components/chessboard/InteractiveChessboard";
import { Chess } from "chess.js";
import { getArchivedGames } from "@/lib/storage/game-archive";

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
    expect(screen.getByText(/Menteri \(Q\)/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/Menteri \(Q\)/i));
    expect(handleConfirmPromotion).toHaveBeenCalledWith("q");
  });
});
