import { describe, it, expect, beforeEach } from "vitest";
import { Chess } from "chess.js";
import {
  computeRadarArrows,
  getRadarArrowsSetting,
  setRadarArrowsSetting,
  subscribeRadarArrows,
} from "@/features/chessboard/radar-arrows";

describe("Radar Arrows (Ghost Aim) Logic & Preferences", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("defaults to enabled (true) in preferences", () => {
    expect(getRadarArrowsSetting()).toBe(true);
  });

  it("updates and persists radar arrows setting in localStorage", () => {
    let notifiedValue: boolean | null = null;
    const unsub = subscribeRadarArrows((val) => {
      notifiedValue = val;
    });

    setRadarArrowsSetting(false);
    expect(getRadarArrowsSetting()).toBe(false);
    expect(notifiedValue).toBe(false);

    setRadarArrowsSetting(true);
    expect(getRadarArrowsSetting()).toBe(true);
    expect(notifiedValue).toBe(true);

    unsub();
  });

  it("returns empty array if no square is selected or no legal destinations exist", () => {
    const chess = new Chess();
    expect(computeRadarArrows(chess, null, ["e3", "e4"])).toEqual([]);
    expect(computeRadarArrows(chess, "e2", [])).toEqual([]);
  });

  it("computes standard forward moves for pawn as safe arrows (isCapture: false)", () => {
    const chess = new Chess();
    const arrows = computeRadarArrows(chess, "e2", ["e3", "e4"]);

    expect(arrows).toHaveLength(2);
    expect(arrows[0]).toMatchObject({
      fromSquare: "e2",
      toSquare: "e3",
      isCapture: false,
      isKnight: false,
      pieceType: "p",
      pieceColor: "w",
    });
    expect(arrows[1]).toMatchObject({
      fromSquare: "e2",
      toSquare: "e4",
      isCapture: false,
      isKnight: false,
      pieceType: "p",
      pieceColor: "w",
    });
  });

  it("computes knight L-shaped moves with isKnight: true", () => {
    const chess = new Chess();
    const arrows = computeRadarArrows(chess, "b1", ["a3", "c3"]);

    expect(arrows).toHaveLength(2);
    expect(arrows.every((a) => a.isKnight)).toBe(true);
    expect(arrows.every((a) => !a.isCapture)).toBe(true);
    expect(arrows.map((a) => a.toSquare)).toEqual(["a3", "c3"]);
  });

  it("identifies opponent piece capture with isCapture: true", () => {
    // White Pawn on d4, Black Pawn on e5
    const chess = new Chess("rnbqkbnr/ppp1pppp/8/4p3/3P4/8/PPP2PPP/RNBQKBNR w KQkq - 0 2");
    const legalMovesForD4 = chess.moves({ square: "d4", verbose: true }).map((m) => m.to);

    const arrows = computeRadarArrows(chess, "d4", legalMovesForD4);
    const captureArrow = arrows.find((a) => a.toSquare === "e5");

    expect(captureArrow).toBeDefined();
    expect(captureArrow?.isCapture).toBe(true);
    expect(captureArrow?.fromSquare).toBe("d4");
  });

  it("identifies en-passant capture as isCapture: true even though target square is empty", () => {
    // En passant position: White Pawn on e5, Black plays f7-f5 -> en passant target is f6
    const chess = new Chess("rnbqkbnr/ppppp1pp/8/4Pp2/8/8/PPPP1PPP/RNBQKBNR w KQkq f6 0 3");
    const legalMoves = chess.moves({ square: "e5", verbose: true }).map((m) => m.to);

    const arrows = computeRadarArrows(chess, "e5", legalMoves);
    const epArrow = arrows.find((a) => a.toSquare === "f6");

    expect(epArrow).toBeDefined();
    expect(epArrow?.isCapture).toBe(true);
  });
});
