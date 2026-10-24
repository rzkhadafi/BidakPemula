import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SocraticHintModal } from "@/features/copilot/components/SocraticHintModal";
import { SocraticHint } from "@/features/copilot/types";

describe("SocraticHintModal Component", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const mockHint1: SocraticHint = {
    fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
    bestMoveUci: "e7e5",
    from: "e7",
    to: "e5",
    pieceType: "p",
    san: "e5",
    tier1Observation: {
      clue: "Fokuskan pandanganmu ke bagian tengah papan.",
      targetSector: "center",
      spokenText: "Fokuskan pandanganmu ke tengah.",
    },
    tier2Piece: {
      clue: "Bidak kunci yang perlu kamu perhatikan adalah Pion di petak E7.",
      pieceSquare: "e7",
      pieceName: "Pion",
      spokenText: "Perhatikan bidak kunci pion di petak E7.",
    },
    tier3Concrete: {
      clue: "Langkahkan Pion dari E7 ke E5 (e5). Merebut kendali pusat.",
      moveSan: "e5",
      from: "e7",
      to: "e5",
      rationale: "Langkah ini merebut pusat.",
      spokenText: "Langkah terbaik adalah e5.",
    },
  };

  const mockHint2: SocraticHint = {
    fen: "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
    bestMoveUci: "f1c4",
    from: "f1",
    to: "c4",
    pieceType: "b",
    san: "Bc4",
    tier1Observation: {
      clue: "Perhatikan sayap raja kawan yang siap berkembang.",
      targetSector: "kingside",
      spokenText: "Perhatikan sayap raja.",
    },
    tier2Piece: {
      clue: "Bidak kunci yang perlu kamu perhatikan adalah Gajah di petak F1.",
      pieceSquare: "f1",
      pieceName: "Gajah",
      spokenText: "Perhatikan gajah di petak F1.",
    },
    tier3Concrete: {
      clue: "Langkahkan Gajah dari F1 ke C4 (Bc4). Mengincar titik lemah f7 lawan.",
      moveSan: "Bc4",
      from: "f1",
      to: "c4",
      rationale: "Menyerang sayap raja.",
      spokenText: "Langkah terbaik adalah gajah ke c4.",
    },
  };

  it("renders Tier 1 by default and highlights nothing on board", () => {
    const handleHighlight = vi.fn();
    render(
      <SocraticHintModal
        isOpen={true}
        hint={mockHint1}
        onClose={vi.fn()}
        onHighlightSquare={handleHighlight}
      />
    );

    expect(screen.getByText("Petunjuk Sokrates Bertingkat")).toBeInTheDocument();
    expect(screen.getByText("Tingkat 1: Arah Pandang")).toBeInTheDocument();
    expect(screen.getByText(/Fokuskan pandanganmu ke bagian tengah papan/i)).toBeInTheDocument();
    expect(handleHighlight).toHaveBeenCalledWith(null);
  });

  it("switches to Tier 2 and highlights key piece square", () => {
    const handleHighlight = vi.fn();
    render(
      <SocraticHintModal
        isOpen={true}
        hint={mockHint1}
        onClose={vi.fn()}
        onHighlightSquare={handleHighlight}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /2\. Bidak Kunci/i }));

    expect(screen.getByText("Tingkat 2: Perwira Kunci")).toBeInTheDocument();
    expect(screen.getByText(/Bidak kunci yang perlu kamu perhatikan adalah Pion di petak E7/i)).toBeInTheDocument();
    expect(handleHighlight).toHaveBeenCalledWith("e7");
  });

  it("switches to Tier 3 and highlights destination square", () => {
    const handleHighlight = vi.fn();
    render(
      <SocraticHintModal
        isOpen={true}
        hint={mockHint1}
        onClose={vi.fn()}
        onHighlightSquare={handleHighlight}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /3\. Solusi Lengkap/i }));

    expect(screen.getByText("Tingkat 3: Langkah Solusi Lengkap")).toBeInTheDocument();
    expect(screen.getByText(/Langkahkan Pion dari E7 ke E5/i)).toBeInTheDocument();
    expect(handleHighlight).toHaveBeenCalledWith("e5");
  });

  it("preserves Tier 3 across moves when a new hint position arrives", () => {
    const handleHighlight = vi.fn();
    const { rerender } = render(
      <SocraticHintModal
        isOpen={true}
        hint={mockHint1}
        onClose={vi.fn()}
        onHighlightSquare={handleHighlight}
      />
    );

    // Player selects Tier 3 (Solution)
    fireEvent.click(screen.getByRole("button", { name: /3\. Solusi Lengkap/i }));
    expect(screen.getByText("Tingkat 3: Langkah Solusi Lengkap")).toBeInTheDocument();
    expect(handleHighlight).toHaveBeenCalledWith("e5");

    // Player makes move, bot responds: new hint arrives with different FEN
    rerender(
      <SocraticHintModal
        isOpen={true}
        hint={mockHint2}
        onClose={vi.fn()}
        onHighlightSquare={handleHighlight}
      />
    );

    // Tier 3 MUST REMAIN ACTIVE for the new move instead of reverting to Tier 1
    expect(screen.getByText("Tingkat 3: Langkah Solusi Lengkap")).toBeInTheDocument();
    expect(screen.getByText(/Langkahkan Gajah dari F1 ke C4/i)).toBeInTheDocument();
    expect(handleHighlight).toHaveBeenCalledWith("c4");
  });

  it("preserves Tier 2 across moves when a new hint position arrives", () => {
    const handleHighlight = vi.fn();
    const { rerender } = render(
      <SocraticHintModal
        isOpen={true}
        hint={mockHint1}
        onClose={vi.fn()}
        onHighlightSquare={handleHighlight}
      />
    );

    // Player selects Tier 2 (Piece)
    fireEvent.click(screen.getByRole("button", { name: /2\. Bidak Kunci/i }));
    expect(screen.getByText("Tingkat 2: Perwira Kunci")).toBeInTheDocument();
    expect(handleHighlight).toHaveBeenCalledWith("e7");

    // Next turn arrives with new FEN
    rerender(
      <SocraticHintModal
        isOpen={true}
        hint={mockHint2}
        onClose={vi.fn()}
        onHighlightSquare={handleHighlight}
      />
    );

    // Tier 2 MUST REMAIN ACTIVE for the new move
    expect(screen.getByText("Tingkat 2: Perwira Kunci")).toBeInTheDocument();
    expect(screen.getByText(/Bidak kunci yang perlu kamu perhatikan adalah Gajah di petak F1/i)).toBeInTheDocument();
    expect(handleHighlight).toHaveBeenCalledWith("f1");
  });

  it("displays transitional loading and clears highlight while bot is thinking", () => {
    const handleHighlight = vi.fn();
    render(
      <SocraticHintModal
        isOpen={true}
        hint={mockHint1}
        isBotThinking={true}
        onClose={vi.fn()}
        onHighlightSquare={handleHighlight}
      />
    );

    expect(screen.getByText(/Bot sedang merespons langkahmu/i)).toBeInTheDocument();
    expect(handleHighlight).toHaveBeenCalledWith(null);
  });
});
