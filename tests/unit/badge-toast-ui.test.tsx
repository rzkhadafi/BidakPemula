import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import {
  BadgeToastNotification,
  BadgeCollectionGrid,
  unlockBadge,
  resetBadges,
} from "@/features/badges";

describe("BadgeToastNotification & BadgeCollectionGrid Components", () => {
  beforeEach(() => {
    window.localStorage.clear();
    resetBadges();
  });

  it("does not render any visible toast notification initially", () => {
    const { container } = render(<BadgeToastNotification />);
    expect(container.firstChild).toBeNull();
  });

  it("slides down notification toast when a new badge is unlocked", async () => {
    render(<BadgeToastNotification />);

    act(() => {
      unlockBadge("first_castle");
    });

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Lencana Baru Diraih!")).toBeInTheDocument();
    expect(screen.getByText("Benteng Kokoh")).toBeInTheDocument();
    expect(
      screen.getByText(/Melakukan manuver Rokade untuk pertama kali/i)
    ).toBeInTheDocument();
  });

  it("allows user to dismiss toast via close button", async () => {
    render(<BadgeToastNotification />);

    act(() => {
      unlockBadge("first_capture");
    });

    expect(screen.getByText("Tangkapan Pertama")).toBeInTheDocument();

    const closeBtn = screen.getByLabelText("Tutup notifikasi lencana");
    act(() => {
      fireEvent.click(closeBtn);
    });

    // The toast starts exit transition
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renders BadgeCollectionGrid with all badges and tracks unlocked progress", () => {
    render(<BadgeCollectionGrid />);

    expect(screen.getByText("Lencana Kehormatan Pemula")).toBeInTheDocument();
    expect(screen.getByText("0 / 10")).toBeInTheDocument();

    // Unlock a badge
    act(() => {
      unlockBadge("first_win");
    });

    expect(screen.getByText("1 / 10")).toBeInTheDocument();
    expect(screen.getByText("Kemenangan Perdana")).toBeInTheDocument();
    expect(screen.getByText("Diraih")).toBeInTheDocument();
  });
});
