import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Chess } from "chess.js";
import { InteractiveChessboard } from "./InteractiveChessboard";

const defaultProps = {
  isCheck: false,
  pendingPromotion: null,
  onConfirmPromotion: vi.fn(),
  onCancelPromotion: vi.fn(),
};

describe("InteractiveChessboard lastMove clickability and captures", () => {
  it("allows clicking on a square that was part of lastMove (e5 capture target)", () => {
    const fen = "rnbqkbnr/pppp3p/3p2p1/4p3/3P1P2/4B3/PPP1Q1PP/RN2KBNR w KQkq - 0 9";
    const chess = new Chess(fen);
    const onSquareClick = vi.fn();

    render(
      <InteractiveChessboard
        {...defaultProps}
        chess={chess}
        selectedSquare="d4"
        legalDestinations={["d5", "e5"]}
        lastMove={{ from: "f6", to: "e5" }}
        onSquareClick={onSquareClick}
      />
    );

    // Square e5 is the target of last move AND a legal capture destination
    const squareE5 = screen.getByRole("button", { name: /Petak e5/i });
    expect(squareE5).toBeDefined();

    // The square must NOT have pointer-events-none on its container
    expect(squareE5.className).not.toContain("pointer-events-none");

    // Clicking square e5 should trigger onSquareClick with 'e5'
    fireEvent.click(squareE5);
    expect(onSquareClick).toHaveBeenCalledWith("e5");
  });

  it("allows clicking on a square that was the origin of lastMove (f6)", () => {
    const fen = "rnbqkbnr/pppp3p/3p2p1/4p3/3P1P2/4B3/PPP1Q1PP/RN2KBNR w KQkq - 0 9";
    const chess = new Chess(fen);
    const onSquareClick = vi.fn();

    render(
      <InteractiveChessboard
        {...defaultProps}
        chess={chess}
        selectedSquare="d4"
        legalDestinations={["d5", "e5"]}
        lastMove={{ from: "f6", to: "e5" }}
        onSquareClick={onSquareClick}
      />
    );

    const squareF6 = screen.getByRole("button", { name: /Petak f6/i });
    expect(squareF6.className).not.toContain("pointer-events-none");

    fireEvent.click(squareF6);
    expect(onSquareClick).toHaveBeenCalledWith("f6");
  });

  it("triggers onSquareClick when clicking directly on the piece SVG inside a capture square", () => {
    const fen = "rnbqkbnr/pppp3p/3p2p1/4p3/3P1P2/4B3/PPP1Q1PP/RN2KBNR w KQkq - 0 9";
    const chess = new Chess(fen);
    const onSquareClick = vi.fn();

    render(
      <InteractiveChessboard
        {...defaultProps}
        chess={chess}
        selectedSquare="d4"
        legalDestinations={["d5", "e5"]}
        lastMove={{ from: "f6", to: "e5" }}
        onSquareClick={onSquareClick}
      />
    );

    const squareE5 = screen.getByRole("button", { name: /Petak e5/i });
    const pieceSvg = squareE5.querySelector("svg");
    expect(pieceSvg).not.toBeNull();

    if (pieceSvg) {
      fireEvent.click(pieceSvg);
      expect(onSquareClick).toHaveBeenCalledWith("e5");
    }
  });

  it("supports drag and drop to capture a piece on a square that was part of lastMove", () => {
    const fen = "rnbqkbnr/pppp3p/3p2p1/4p3/3P1P2/4B3/PPP1Q1PP/RN2KBNR w KQkq - 0 9";
    const chess = new Chess(fen);
    const onSquareClick = vi.fn();

    render(
      <InteractiveChessboard
        {...defaultProps}
        chess={chess}
        selectedSquare="d4"
        legalDestinations={["d5", "e5"]}
        lastMove={{ from: "f6", to: "e5" }}
        onSquareClick={onSquareClick}
      />
    );

    const squareE5 = screen.getByRole("button", { name: /Petak e5/i });

    // Simulate drop on e5 with dataTransfer containing 'd4'
    fireEvent.drop(squareE5, {
      dataTransfer: {
        getData: (type: string) => (type === "text/plain" ? "d4" : ""),
      },
    });

    expect(onSquareClick).toHaveBeenCalledWith("e5");
  });
});
