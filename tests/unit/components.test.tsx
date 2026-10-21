import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { ChessboardPlaceholder } from "@/components/chessboard/ChessboardPlaceholder";

describe("UI Primitives & Design System", () => {
  it("renders Button with proper styles and responds to clicks", () => {
    const handleClick = vi.fn();
    render(
      <Button variant="primary" onClick={handleClick}>
        Mulai Permainan
      </Button>
    );

    const button = screen.getByRole("button", { name: "Mulai Permainan" });
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("disables Button when disabled or isLoading is true", () => {
    const handleClick = vi.fn();
    const { rerender } = render(
      <Button disabled onClick={handleClick}>
        Tombol Nonaktif
      </Button>
    );

    const button = screen.getByRole("button", { name: "Tombol Nonaktif" });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();

    rerender(
      <Button isLoading onClick={handleClick}>
        Memuat
      </Button>
    );
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("renders Badge variants correctly", () => {
    render(<Badge variant="accent">Materi Dasar</Badge>);
    expect(screen.getByText("Materi Dasar")).toBeInTheDocument();
  });

  it("renders Card container with content", () => {
    render(
      <Card variant="surface">
        <span>Konten Kartu Arsip</span>
      </Card>
    );
    expect(screen.getByText("Konten Kartu Arsip")).toBeInTheDocument();
  });

  it("renders Modal dialog with accessible title and triggers onClose on Escape", () => {
    const handleClose = vi.fn();
    render(
      <Modal
        isOpen={true}
        onClose={handleClose}
        title="Konfirmasi Tindakan"
        description="Deskripsi tindakan destruktif"
      >
        <p>Isi modal dialog</p>
      </Modal>
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Konfirmasi Tindakan")).toBeInTheDocument();
    expect(screen.getByText("Deskripsi tindakan destruktif")).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("does not render Modal when isOpen is false", () => {
    render(
      <Modal isOpen={false} onClose={() => {}} title="Dialog Tertutup">
        <p>Konten</p>
      </Modal>
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

describe("ChessboardPlaceholder 2D", () => {
  it("renders an 8x8 grid of 64 squares", () => {
    const { container } = render(<ChessboardPlaceholder />);
    const squares = container.querySelectorAll("[data-square]");
    expect(squares.length).toBe(64);
  });

  it("renders rank and file coordinates", () => {
    render(<ChessboardPlaceholder orientation="white" />);
    // Check files a to h and ranks 1 to 8 presence
    expect(screen.getByText("a")).toBeInTheDocument();
    expect(screen.getByText("h")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
  });
});
