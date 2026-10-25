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

  it("renders Radar Panah toggle button and toggles its state on click", () => {
    const chess = new Chess();
    render(
      <InteractiveChessboard
        {...defaultProps}
        chess={chess}
        selectedSquare={null}
        legalDestinations={[]}
        lastMove={null}
        onSquareClick={vi.fn()}
      />
    );

    const radarBtn = screen.getByRole("button", { name: /Radar Panah/i });
    expect(radarBtn).toBeDefined();
    expect(radarBtn.textContent).toContain("Radar Panah");

    // Click to toggle
    fireEvent.click(radarBtn);
    expect(radarBtn.getAttribute("aria-pressed")).toBe("false");

    fireEvent.click(radarBtn);
    expect(radarBtn.getAttribute("aria-pressed")).toBe("true");
  });

  it("renders RadarArrowsOverlay SVG with pointer-events-none when a piece is selected", () => {
    const chess = new Chess();
    const { container } = render(
      <InteractiveChessboard
        {...defaultProps}
        chess={chess}
        selectedSquare="e2"
        legalDestinations={["e3", "e4"]}
        lastMove={null}
        onSquareClick={vi.fn()}
      />
    );

    // Look for SVG with radar-arrow markers or viewBox 0 0 800 800
    const radarSvg = container.querySelector("svg[viewBox='0 0 800 800']");
    expect(radarSvg).not.toBeNull();
    expect(radarSvg?.getAttribute("class")).toContain("pointer-events-none");

    // Check that path markers exist for safe move
    const markerSafe = container.querySelector("#radar-arrow-safe");
    expect(markerSafe).not.toBeNull();
  });

  it("applies animate-piece-glide with correct offset when a piece moves", () => {
    const chess = new Chess();
    const onSquareClick = vi.fn();

    const { rerender } = render(
      <InteractiveChessboard
        {...defaultProps}
        chess={chess}
        selectedSquare={null}
        legalDestinations={[]}
        lastMove={null}
        onSquareClick={onSquareClick}
      />
    );

    // Initial mount should NOT have animation
    const initialE4Square = screen.getByRole("button", { name: /Petak e4/i });
    expect(initialE4Square.querySelector(".animate-piece-glide")).toBeNull();

    // Now White plays e2 -> e4
    chess.move({ from: "e2", to: "e4" });
    rerender(
      <InteractiveChessboard
        {...defaultProps}
        chess={chess}
        selectedSquare={null}
        legalDestinations={[]}
        lastMove={{ from: "e2", to: "e4" }}
        onSquareClick={onSquareClick}
      />
    );

    // Target square e4 should now contain the gliding piece
    const updatedE4Square = screen.getByRole("button", { name: /Petak e4/i });
    const glidingPiece = updatedE4Square.querySelector(".animate-piece-glide") as HTMLElement;
    expect(glidingPiece).not.toBeNull();
    expect(glidingPiece.style.getPropertyValue("--glide-from-x")).toBe("0%");
    expect(glidingPiece.style.getPropertyValue("--glide-from-y")).toBe("200%");
  });

  it("renders dissolving captured piece when a piece captures an opponent piece", () => {
    const fen = "rnbqkbnr/pppp1ppp/8/4p3/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 2";
    const chess = new Chess(fen);
    const onSquareClick = vi.fn();

    const { rerender } = render(
      <InteractiveChessboard
        {...defaultProps}
        chess={chess}
        selectedSquare={null}
        legalDestinations={[]}
        lastMove={null}
        onSquareClick={onSquareClick}
      />
    );

    // White captures on e5: d4xe5
    chess.move({ from: "d4", to: "e5" });
    rerender(
      <InteractiveChessboard
        {...defaultProps}
        chess={chess}
        selectedSquare={null}
        legalDestinations={[]}
        lastMove={{ from: "d4", to: "e5" }}
        onSquareClick={onSquareClick}
      />
    );

    const squareE5 = screen.getByRole("button", { name: /Petak e5/i });
    const capturedGhost = squareE5.querySelector(".animate-piece-captured");
    expect(capturedGhost).not.toBeNull();

    const glidingPiece = squareE5.querySelector(".animate-piece-glide") as HTMLElement;
    expect(glidingPiece).not.toBeNull();
  });
});
