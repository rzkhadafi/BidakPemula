import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TutorAudioPlayer } from "@/features/tutor/components/TutorAudioPlayer";
import { TutorPanel } from "@/features/tutor/components/TutorPanel";
import { PlayTutorModal } from "@/features/tutor/components/PlayTutorModal";
import { TutorExplainResponse, TutorExplainRequest } from "@/features/tutor/types";

describe("Tutor UI Components", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockExplanation,
    } as Response);
  });

  const mockExplanation: TutorExplainResponse = {
    title: "Analisis Pembukaan: 1. e4",
    summary: "Putih membuka dengan langkah pion e4 untuk menguasai pusat.",
    explanation: "Pion e4 langsung mengendalikan petak d5 dan f5 serta membuka jalan bagi menteri dan gajah putih.",
    spokenText: "Putih memulai permainan dengan mendorong pion ke e4 untuk menguasai pusat papan.",
    concept: "Penguasaan Pusat Papan",
    suggestedMoves: [
      { uci: "e7e5", san: "e5", description: "Langkah simetris untuk membalas kendali pusat." },
    ],
    hint: "Pertimbangkan untuk mengimbangi penguasaan petak pusat.",
    followUpQuestion: "Bagaimana tanggapan terbaik Hitam terhadap langkah ini?",
    analysisStatus: "available",
    source: "local-curated",
  };

  const mockRequest: TutorExplainRequest = {
    fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
    sideToMove: "b",
    learnerLevel: "pemula",
    mode: "play",
    lastMoveSan: "e4",
  };

  it("renders TutorAudioPlayer with controls and speed options", () => {
    render(<TutorAudioPlayer spokenText="Uji coba narasi suara." />);

    expect(screen.getByText("Penjelasan Suara")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Dengarkan penjelasan/i })).toBeInTheDocument();
    expect(screen.getByText("0.85x")).toBeInTheDocument();
    expect(screen.getByText("1x")).toBeInTheDocument();
    expect(screen.getByText("1.25x")).toBeInTheDocument();
    expect(screen.getByLabelText(/Putar penjelasan berikutnya secara otomatis/i)).toBeInTheDocument();
  });

  it("renders TutorPanel with structured content, hint toggle, and candidate move", () => {
    const handleHighlight = vi.fn();
    render(
      <TutorPanel
        requestContext={mockRequest}
        initialExplanation={mockExplanation}
        onHighlightMove={handleHighlight}
      />
    );

    expect(screen.getByText("Guru Catur AI")).toBeInTheDocument();
    expect(screen.getByText("Analisis Pembukaan: 1. e4")).toBeInTheDocument();
    expect(screen.getByText(/Penguasaan Pusat Papan/i)).toBeInTheDocument();
    expect(screen.getByText("e5")).toBeInTheDocument();

    // Hint accordion
    const hintButton = screen.getByRole("button", { name: /Butuh Petunjuk Tambahan/i });
    expect(hintButton).toBeInTheDocument();
    fireEvent.click(hintButton);
    expect(screen.getByText(/Pertimbangkan untuk mengimbangi penguasaan petak pusat/i)).toBeInTheDocument();

    // Highlight candidate move
    const showMoveButton = screen.getByRole("button", { name: /Tampilkan/i });
    fireEvent.click(showMoveButton);
    expect(handleHighlight).toHaveBeenCalledWith("e7e5");
  });

  it("renders PlayTutorModal when isOpen is true and stops speech on close", () => {
    const handleClose = vi.fn();
    const { rerender } = render(
      <PlayTutorModal
        isOpen={true}
        onClose={handleClose}
        requestContext={mockRequest}
      />
    );

    expect(screen.getByText("Bimbingan Guru Catur AI")).toBeInTheDocument();

    rerender(
      <PlayTutorModal
        isOpen={false}
        onClose={handleClose}
        requestContext={mockRequest}
      />
    );

    expect(screen.queryByText("Bimbingan Guru Catur AI")).not.toBeInTheDocument();
  });
});
