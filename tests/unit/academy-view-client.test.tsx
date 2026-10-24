import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LessonViewClient } from "@/features/academy/LessonViewClient";
import { AcademyLesson } from "@/features/academy/types";

describe("LessonViewClient - Real-Time Side Panel Step Synchronization", () => {
  const mockLesson: AcademyLesson = {
    id: "mengenal-papan",
    order: 1,
    title: "Mengenal Papan Catur",
    subtitle: "64 petak, lajur a–h, dan baris 1–8",
    summary: "Memahami struktur medan tempur catur.",
    duration: "4 menit",
    conceptHeading: "Medan Pertempuran Catur",
    conceptBody: ["Papan catur terdiri dari 64 petak."],
    takeaways: ["Lajur a-h, baris 1-8."],
    steps: [
      {
        id: "papan-step-1",
        stepNumber: 1,
        instruction: "Tunjukkan Petak Pusat e4",
        subText: "Klik petak e4.",
        fen: "8/8/8/8/8/8/8/8 w - - 0 1",
        targetSquare: "e4",
        hint: "Cari e4.",
        explanationOnSuccess: "Tepat sekali! Petak e4 adalah pusat.",
      },
      {
        id: "papan-step-2",
        stepNumber: 2,
        instruction: "Tunjukkan Petak Pusat d5",
        subText: "Klik petak d5.",
        fen: "8/8/8/8/8/8/8/8 w - - 0 1",
        targetSquare: "d5",
        hint: "Cari d5.",
        explanationOnSuccess: "Luar biasa! Petak d5.",
      },
      {
        id: "papan-step-3",
        stepNumber: 3,
        instruction: "Tunjukkan Sudut Kanan Bawah Putih (h1)",
        subText: "Klik petak h1.",
        fen: "8/8/8/8/8/8/8/8 w - - 0 1",
        targetSquare: "h1",
        hint: "Cari h1.",
        explanationOnSuccess: "Sempurna! Petak h1.",
      },
    ],
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("synchronizes the right-side TutorPanel in real-time as steps advance on the board", async () => {
    render(
      <LessonViewClient
        lesson={mockLesson}
        prevLesson={null}
        nextLesson={null}
      />
    );

    // Initial state: Step 1 (e4) on both board and side panel
    expect(screen.getAllByText("Tunjukkan Petak Pusat e4").length).toBeGreaterThanOrEqual(1);

    // Wait for initial TutorPanel load
    await waitFor(() => {
      expect(screen.getByText("Panduan: Mengenal Papan Catur")).toBeInTheDocument();
    });

    // 1. Complete Step 1 on the board
    fireEvent.click(screen.getByLabelText("Petak e4"));
    fireEvent.click(screen.getByRole("button", { name: /Lanjut ke Tantangan Berikutnya/i }));

    // Real-time synchronization check for Step 2
    expect(screen.getAllByText("Tunjukkan Petak Pusat d5").length).toBeGreaterThanOrEqual(1);

    // 2. Complete Step 2 on the board
    fireEvent.click(screen.getByLabelText("Petak d5"));
    fireEvent.click(screen.getByRole("button", { name: /Lanjut ke Tantangan Berikutnya/i }));

    // Real-time synchronization check for Step 3: MUST show "Tunjukkan Sudut Kanan Bawah Putih (h1)" in TutorPanel
    await waitFor(() => {
      const h1Matches = screen.getAllByText("Tunjukkan Sudut Kanan Bawah Putih (h1)");
      expect(h1Matches.length).toBeGreaterThanOrEqual(2); // One in board challenge bar, one in TutorPanel summary!
    });

    // The old Step 1 text MUST NO LONGER appear in TutorPanel
    const e4Matches = screen.queryAllByText("Tunjukkan Petak Pusat e4");
    expect(e4Matches.length).toBe(0);
  });
});
