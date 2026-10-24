import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TurningPointCard } from "@/features/autopsy/components/TurningPointCard";
import { TurningPoint } from "@/features/autopsy/types";

const mockTurningPoint: TurningPoint = {
  plyIndex: 6,
  moveNumber: 4,
  sideToMove: "w",
  isPlayerMove: true,
  fenBefore: "r1bqkbnr/pppp1ppp/2n5/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 3 3",
  fenAfter: "r1bqkbnr/pppp1Qpp/2n5/4p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4",
  movePlayedSan: "Qxf7#",
  movePlayedUci: "h5f7",
  fromSquare: "h5",
  toSquare: "f7",
  pieceType: "q",
  severity: "blunder",
  headline: "Titik Balik Kritis: Langkah ke-4 (Qxf7#)",
  description: "Langkah ini membuat posisi Anda langsung kalah dalam satu pukulan taktis.",
  suggestedAlternativeSan: "Nf3",
  historyBefore: [],
  playerColor: "white",
};

describe("TurningPointCard Component", () => {
  it("renders turning point card with headline, description, and badge", () => {
    const onPlay = vi.fn();
    render(<TurningPointCard turningPoint={mockTurningPoint} onPlayFromHere={onPlay} />);

    expect(screen.getByText("Titik Balik Kesalahan")).toBeDefined();
    expect(screen.getByText("Langkah ke-4")).toBeDefined();
    expect(screen.getByText("Titik Balik Kritis: Langkah ke-4 (Qxf7#)")).toBeDefined();
    expect(screen.getByText(/Langkah ini membuat posisi Anda/)).toBeDefined();
    expect(screen.getByText("Nf3")).toBeDefined();
  });

  it("calls onPlayFromHere when clicking 'Coba Lagi dari Titik Ini'", () => {
    const onPlay = vi.fn();
    render(<TurningPointCard turningPoint={mockTurningPoint} onPlayFromHere={onPlay} />);

    const playBtn = screen.getByRole("button", { name: /Coba Lagi dari Titik Ini/i });
    expect(playBtn).toBeDefined();

    fireEvent.click(playBtn);
    expect(onPlay).toHaveBeenCalledOnce();
  });

  it("renders archive action 'Lihat Posisi' when isArchiveView is true", () => {
    const onPlay = vi.fn();
    const onInspect = vi.fn();
    render(
      <TurningPointCard
        turningPoint={mockTurningPoint}
        onPlayFromHere={onPlay}
        onInspectPly={onInspect}
        isArchiveView={true}
      />
    );

    const inspectBtn = screen.getByRole("button", { name: /Lihat Posisi/i });
    expect(inspectBtn).toBeDefined();

    fireEvent.click(inspectBtn);
    expect(onInspect).toHaveBeenCalledWith(6);
  });
});
