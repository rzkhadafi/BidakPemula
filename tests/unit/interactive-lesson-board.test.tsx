import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { InteractiveLessonBoard } from "@/features/academy/InteractiveLessonBoard";
import { AcademyLesson } from "@/features/academy/types";

describe("InteractiveLessonBoard - Pop-up Step Completion Modal", () => {
  const mockLesson: AcademyLesson = {
    id: "mengenal-papan",
    order: 1,
    title: "Mengenal Papan Catur & Notasi",
    subtitle: "Pondasi membaca peta medan laga catur",
    summary: "Pelajari koordinat lajur, baris, dan petak pusat catur.",
    duration: "3 menit",
    conceptHeading: "Konsep Dasar Papan Catur",
    conceptBody: ["Papan catur terdiri dari 64 petak."],
    takeaways: ["Lajur adalah kolom vertikal a-h.", "Baris adalah horizontal 1-8."],
    steps: [
      {
        id: "step-1",
        stepNumber: 1,
        instruction: "Tunjukkan Petak Pusat e4",
        subText: "Klik atau sentuh petak e4 pada papan catur.",
        fen: "8/8/8/8/8/8/8/8 w - - 0 1",
        targetSquare: "e4",
        hint: "Cari pertemuan lajur e dan baris 4.",
        explanationOnSuccess: "Tepat sekali! Petak e4 adalah salah satu dari 4 petak pusat utama.",
      },
      {
        id: "step-2",
        stepNumber: 2,
        instruction: "Tunjukkan Petak Pusat d5",
        subText: "Klik atau sentuh petak d5 pada papan catur.",
        fen: "8/8/8/8/8/8/8/8 w - - 0 1",
        targetSquare: "d5",
        hint: "Cari pertemuan lajur d dan baris 5.",
        explanationOnSuccess: "Luar biasa! Petak d5 adalah petak pusat strategis.",
      },
    ],
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders step 1 instruction and does not show success modal initially", () => {
    render(<InteractiveLessonBoard lesson={mockLesson} onLessonComplete={vi.fn()} />);

    expect(screen.getAllByText("Tunjukkan Petak Pusat e4").length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens celebratory pop-up modal when clicking correct target square without scrolling", () => {
    render(<InteractiveLessonBoard lesson={mockLesson} onLessonComplete={vi.fn()} />);

    // Click on target square e4
    const e4Square = screen.getByLabelText("Petak e4");
    fireEvent.click(e4Square);

    // Dialog pop-up modal MUST appear
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText("Langkah Benar!")).toBeInTheDocument();
    expect(
      screen.getByText("Tepat sekali! Petak e4 adalah salah satu dari 4 petak pusat utama.")
    ).toBeInTheDocument();

    // Contains prominent "Lanjut ke Tantangan Berikutnya" button
    const nextBtn = screen.getByRole("button", { name: /Lanjut ke Tantangan Berikutnya/i });
    expect(nextBtn).toBeInTheDocument();
  });

  it("advances to next step and closes modal when clicking 'Lanjut ke Tantangan Berikutnya'", () => {
    render(<InteractiveLessonBoard lesson={mockLesson} onLessonComplete={vi.fn()} />);

    // Complete step 1
    fireEvent.click(screen.getByLabelText("Petak e4"));

    const nextBtn = screen.getByRole("button", { name: /Lanjut ke Tantangan Berikutnya/i });
    fireEvent.click(nextBtn);

    // Modal closes and step 2 is active
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getAllByText("Tunjukkan Petak Pusat d5").length).toBeGreaterThanOrEqual(1);
  });

  it("calls onLessonComplete when final step is completed and confirmed", () => {
    const handleLessonComplete = vi.fn();
    render(<InteractiveLessonBoard lesson={mockLesson} onLessonComplete={handleLessonComplete} />);

    // Step 1
    fireEvent.click(screen.getByLabelText("Petak e4"));
    fireEvent.click(screen.getByRole("button", { name: /Lanjut ke Tantangan Berikutnya/i }));

    // Step 2 (final step)
    fireEvent.click(screen.getByLabelText("Petak d5"));

    // Modal appears for final step with completion text
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    const completeBtn = screen.getByRole("button", { name: /Selesaikan Pelajaran Ini/i });
    expect(completeBtn).toBeInTheDocument();

    fireEvent.click(completeBtn);
    expect(handleLessonComplete).toHaveBeenCalledTimes(1);
  });

  it("notifies onStepChange when advancing steps so side panels sync in real time", () => {
    const handleStepChange = vi.fn();
    render(
      <InteractiveLessonBoard
        lesson={mockLesson}
        currentStepIndex={0}
        onStepChange={handleStepChange}
        onLessonComplete={vi.fn()}
      />
    );

    // Complete step 1
    fireEvent.click(screen.getByLabelText("Petak e4"));
    fireEvent.click(screen.getByRole("button", { name: /Lanjut ke Tantangan Berikutnya/i }));

    expect(handleStepChange).toHaveBeenCalledWith(1);
  });

  it("opens pop-up modal when clicking wrong target square and resets step on 'Coba Lagi'", () => {
    render(<InteractiveLessonBoard lesson={mockLesson} onLessonComplete={vi.fn()} />);

    // Click on wrong square e5 instead of e4
    fireEvent.click(screen.getByLabelText("Petak e5"));

    // Error modal MUST appear
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText("Langkah Belum Tepat")).toBeInTheDocument();
    expect(
      screen.getByText("Petak yang Anda klik adalah E5. Coba cari petak E4.")
    ).toBeInTheDocument();

    // Verify "Coba Lagi" button is present and functional
    const retryBtn = screen.getByRole("button", { name: /Coba Lagi/i });
    expect(retryBtn).toBeInTheDocument();

    fireEvent.click(retryBtn);

    // Modal closes and board is ready to retry
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
