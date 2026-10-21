import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";
import PlayPage from "@/app/play/page";
import AcademyPage from "@/app/academy/page";
import PuzzlesPage from "@/app/puzzles/page";
import ArchivePage from "@/app/archive/page";
import SettingsPage from "@/app/settings/page";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { saveArchivedGame, CURRENT_SCHEMA_VERSION } from "@/lib/storage/game-archive";

describe("Smoke Tests: P0 Pages and Shells", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

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

  it("renders Play Page with interactive board and control buttons", () => {
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

  it("renders Archive Page with empty state when no games are stored", () => {
    render(<ArchivePage />);
    expect(screen.getByText("Arsip Pertandingan Lokal")).toBeInTheDocument();
    expect(screen.getByText("Belum ada arsip permainan")).toBeInTheDocument();
  });

  it("renders Archive Page with game list when games exist in storage", () => {
    saveArchivedGame({
      schemaVersion: CURRENT_SCHEMA_VERSION,
      id: "game-smoke-test",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      playerColor: "white",
      botLevel: "Pemula",
      timeControlId: "5m",
      timeControlLabel: "5 Menit",
      result: "white_win",
      termination: "Skakmat",
      initialFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      finalFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      pgn: "1. e4",
      moves: [],
      durationMs: 12000,
    });

    render(<ArchivePage />);
    expect(screen.getByText("vs Bot Pemula")).toBeInTheDocument();
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
