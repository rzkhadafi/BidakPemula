import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, renderHook, act } from "@testing-library/react";
import { useChessGame } from "@/features/game/use-chess-game";
import { MockChessEngine } from "@/features/engine/stockfish-adapter";
import {
  getArchivedGames,
  getArchivedGameById,
  clearArchivedGames,
} from "@/lib/storage/game-archive";
import ArchivePage from "@/app/archive/page";

describe("Integration: Play Game -> Save to Local Storage -> Review in Archive", () => {
  let mockEngine: MockChessEngine;

  beforeEach(() => {
    window.localStorage.clear();
    mockEngine = new MockChessEngine("c7c5"); // Bot replies with Sicilian Defense
  });

  it("plays a game, saves on completion, and shows in archive", async () => {
    // 1. Play game via useChessGame
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

    // Player moves 1. e4
    act(() => {
      result.current.handleSquareClick("e2");
    });
    await act(async () => {
      result.current.handleSquareClick("e4");
    });

    expect(result.current.history.length).toBe(1);
    expect(result.current.history[0].san).toBe("e4");

    // Wait for bot reply
    await act(async () => {
      await new Promise((r) => setTimeout(r, 80));
    });

    expect(result.current.history.length).toBe(2);
    expect(result.current.history[1].san).toBe("c5");

    // Resign game to trigger completion
    act(() => {
      result.current.resignGame();
    });

    expect(result.current.gameStatus).toBe("resigned");
    expect(result.current.gameResult).toBe("black_win");

    // 2. Verify stored in localStorage
    const storedGames = getArchivedGames();
    expect(storedGames.length).toBe(1);
    const saved = storedGames[0];
    expect(saved.playerColor).toBe("white");
    expect(saved.moves.length).toBe(2);
    expect(saved.moves[0].san).toBe("e4");
    expect(saved.moves[1].san).toBe("c5");
    expect(saved.termination).toBe("Pemain Menyerah");

    // 3. Verify ArchivePage displays the saved game
    const { unmount } = render(<ArchivePage />);
    expect(screen.getByText(/Arsip Pertandingan Lokal/i)).toBeInTheDocument();
    expect(screen.getByText(/vs Bot Kuat/i)).toBeInTheDocument();
    expect(screen.getByText(/2 langkah/i)).toBeInTheDocument();
    expect(screen.getByText(/Kalah • Pemain Menyerah/i)).toBeInTheDocument();
    unmount();

    // 4. Verify retrieving single game
    const single = getArchivedGameById(saved.id);
    expect(single).not.toBeNull();
    expect(single?.id).toBe(saved.id);

    // 5. Verify clearing archive
    clearArchivedGames();
    expect(getArchivedGames().length).toBe(0);
  });
});
