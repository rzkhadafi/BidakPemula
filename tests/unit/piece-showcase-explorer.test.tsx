import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PieceShowcaseExplorer } from "@/features/academy/PieceShowcaseExplorer";
import { ACADEMY_LESSONS } from "@/features/academy/academy-catalog";

describe("PieceShowcaseExplorer - Free Piece Showroom without Quiz Modals", () => {
  const lesson = ACADEMY_LESSONS.find((l) => l.id === "kenalan-pasukan")!;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with Pion selected by default and displays casual profile information", () => {
    const onComplete = vi.fn();
    render(<PieceShowcaseExplorer lesson={lesson} onLessonComplete={onComplete} />);

    // Check heading and profile title
    expect(screen.getByRole("heading", { name: "Pion" })).toBeInTheDocument();
    expect(screen.getByText("(Pawn)")).toBeInTheDocument();
    expect(screen.getByText(/1 Poin/i)).toBeInTheDocument();
    expect(screen.getByText(/Maju pantang mundur/i)).toBeInTheDocument();

    // Check explanation sections
    expect(screen.getByText(/Cara Bergerak:/i)).toBeInTheDocument();
    expect(screen.getByText(/Cara Memukul Lawan:/i)).toBeInTheDocument();
    expect(screen.getByText(/Tips Jitu Pemula:/i)).toBeInTheDocument();
    expect(screen.getByText(/Posisi Awal di Papan:/i)).toBeInTheDocument();

    // Progress counter should show 1 of 6 explored
    expect(screen.getByText(/1\/6 Dikenali/i)).toBeInTheDocument();
  });

  it("switches piece profile when a selector button is clicked without error popups", () => {
    const onComplete = vi.fn();
    render(<PieceShowcaseExplorer lesson={lesson} onLessonComplete={onComplete} />);

    // Click on Kuda button
    const kudaBtn = screen.getByRole("button", { name: /kuda/i });
    fireEvent.click(kudaBtn);

    // Kuda profile should be displayed
    expect(screen.getByRole("heading", { name: "Kuda" })).toBeInTheDocument();
    expect(screen.getByText("(Knight)")).toBeInTheDocument();
    expect(screen.getByText(/3 Poin/i)).toBeInTheDocument();
    expect(screen.getByText(/huruf 'L'/i)).toBeInTheDocument();

    // No error modals should be rendered
    expect(screen.queryByText(/Langkah Belum Tepat/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Coba Lagi/i)).not.toBeInTheDocument();

    // Counter now shows 2 / 6
    expect(screen.getByText(/2\/6 Dikenali/i)).toBeInTheDocument();
  });

  it("completes lesson when finish button is clicked", () => {
    const onComplete = vi.fn();
    render(<PieceShowcaseExplorer lesson={lesson} onLessonComplete={onComplete} />);

    const finishBtn = screen.getByRole("button", {
      name: /Saya Sudah Paham Semua, Lanjut ke Gerakan Benteng/i,
    });
    fireEvent.click(finishBtn);

    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
