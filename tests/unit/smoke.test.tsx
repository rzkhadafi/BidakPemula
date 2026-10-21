import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";
import PlayPage from "@/app/play/page";
import AcademyPage from "@/app/academy/page";
import PuzzlesPage from "@/app/puzzles/page";
import ArchivePage from "@/app/archive/page";
import SettingsPage from "@/app/settings/page";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

describe("Smoke Tests: P0 Pages and Shells", () => {
  it("renders Navbar with brand and main links", () => {
    render(<Navbar />);
    expect(screen.getByText("CHESS ARCHIVE")).toBeInTheDocument();
    expect(screen.getByText("Beranda")).toBeInTheDocument();
    expect(screen.getByText("Main Catur")).toBeInTheDocument();
    expect(screen.getByText("Akademi")).toBeInTheDocument();
    expect(screen.getByText("Puzzle")).toBeInTheDocument();
    expect(screen.getByText("Arsip Saya")).toBeInTheDocument();
  });

  it("renders Footer with copyright and local privacy notice", () => {
    render(<Footer />);
    expect(
      screen.getByText(/Ruang Belajar & Arsip Strategi Mandiri/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Penyimpanan lokal di peramban/i)
    ).toBeInTheDocument();
  });

  it("renders Home Page without errors", () => {
    render(<HomePage />);
    expect(
      screen.getByRole("heading", {
        name: /Ruang arsip strategi dan latihan catur mandiri/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Mulai Permainan/i })
    ).toBeInTheDocument();
  });

  it("renders Play Page with 2D board placeholder and control buttons", () => {
    render(<PlayPage />);
    expect(screen.getByText("Main Catur vs Bot")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Undo" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Mulai Ulang" })).toBeDisabled();
  });

  it("renders Academy Page with curriculum list", () => {
    render(<AcademyPage />);
    expect(screen.getByText("Akademi Catur")).toBeInTheDocument();
    expect(
      screen.getByText("Mengenal Papan dan Koordinat")
    ).toBeInTheDocument();
    expect(screen.getByText("Prinsip Pembukaan Catur")).toBeInTheDocument();
  });

  it("renders Puzzles Page with objective and categories", () => {
    render(<PuzzlesPage />);
    expect(screen.getByText("Puzzle Taktik Catur")).toBeInTheDocument();
    expect(screen.getByText("Semua Kategori")).toBeInTheDocument();
    expect(screen.getByText("Tujuan Puzzle")).toBeInTheDocument();
  });

  it("renders Archive Page with games list", () => {
    render(<ArchivePage />);
    expect(screen.getByText("Arsip Pertandingan Lokal")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Hapus Seluruh Arsip Pertandingan/i })
    ).toBeInTheDocument();
  });

  it("renders Settings Page with options", () => {
    render(<SettingsPage />);
    expect(screen.getByText("Pengaturan Aplikasi")).toBeInTheDocument();
    expect(screen.getByText("Tema & Tampilan")).toBeInTheDocument();
    expect(screen.getByText("Preferensi Papan Catur")).toBeInTheDocument();
  });
});
