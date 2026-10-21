import { describe, it, expect, beforeEach } from "vitest";
import {
  getArchivedGames,
  getArchivedGameById,
  saveArchivedGame,
  deleteArchivedGame,
  clearArchivedGames,
  CURRENT_SCHEMA_VERSION,
} from "@/lib/storage/game-archive";
import { ArchivedGame } from "@/types/chess";

describe("Local Storage Persistence (game-archive)", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  const sampleGame: ArchivedGame = {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    id: "game-test-01",
    createdAt: "2026-10-21T10:00:00.000Z",
    updatedAt: "2026-10-21T10:00:00.000Z",
    playerColor: "white",
    botLevel: "Pemula",
    timeControlId: "5m",
    timeControlLabel: "5 Menit",
    result: "white_win",
    termination: "Skakmat",
    initialFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    finalFen: "rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3",
    pgn: "1. f3 e5 2. g4 Qh4#",
    moves: [
      {
        ply: 1,
        san: "f3",
        uci: "f2f3",
        from: "f2",
        to: "f3",
        piece: "p",
        fenAfter: "rnbqkbnr/pppppppp/8/8/8/5P2/PPPPP1PP/RNBQKBNR b KQkq - 0 1",
      },
      {
        ply: 2,
        san: "e5",
        uci: "e7e5",
        from: "e7",
        to: "e5",
        piece: "p",
        fenAfter: "rnbqkbnr/pppp1ppp/8/4p3/8/5P2/PPPPP1PP/RNBQKBNR w KQkq - 0 2",
      },
    ],
    durationMs: 45000,
  };

  it("returns empty array when no games are stored", () => {
    expect(getArchivedGames()).toEqual([]);
  });

  it("saves a completed game record and retrieves it", () => {
    const ok = saveArchivedGame(sampleGame);
    expect(ok).toBe(true);

    const list = getArchivedGames();
    expect(list.length).toBe(1);
    expect(list[0].id).toBe("game-test-01");
    expect(list[0].result).toBe("white_win");
  });

  it("retrieves a single game by ID", () => {
    saveArchivedGame(sampleGame);
    const found = getArchivedGameById("game-test-01");
    expect(found).not.toBeNull();
    expect(found?.termination).toBe("Skakmat");

    const notFound = getArchivedGameById("non-existent");
    expect(notFound).toBeNull();
  });

  it("deletes a single game by ID", () => {
    saveArchivedGame(sampleGame);
    expect(getArchivedGames().length).toBe(1);

    const deleted = deleteArchivedGame("game-test-01");
    expect(deleted).toBe(true);
    expect(getArchivedGames().length).toBe(0);
  });

  it("clears all archived games", () => {
    saveArchivedGame(sampleGame);
    saveArchivedGame({ ...sampleGame, id: "game-test-02" });
    expect(getArchivedGames().length).toBe(2);

    clearArchivedGames();
    expect(getArchivedGames().length).toBe(0);
  });

  it("recovers gracefully from corrupted JSON in localStorage", () => {
    window.localStorage.setItem("chess_archive_games_v1", "{ not-valid-json ]");
    const games = getArchivedGames();
    expect(games).toEqual([]);
  });

  it("prevents duplicate record insertion for the same game ID", () => {
    saveArchivedGame(sampleGame);
    saveArchivedGame(sampleGame); // save again
    expect(getArchivedGames().length).toBe(1);
  });
});
