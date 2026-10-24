import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import fs from "fs";
import path from "path";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import PlayPage from "@/app/play/page";
import PuzzlesPage from "@/app/puzzles/page";

describe("Accessibility and Design Tokens Verification", () => {
  it("verifies design tokens in globals.css match specifications", () => {
    const cssPath = path.resolve(import.meta.dirname, "../../src/app/globals.css");
    const cssContent = fs.readFileSync(cssPath, "utf-8");

    // Check core palette tokens from DESIGN_SYSTEM.md
    expect(cssContent).toContain("--color-bg: #141619");
    expect(cssContent).toContain("--color-surface: #1C2024");
    expect(cssContent).toContain("--color-surface-raised: #24292E");
    expect(cssContent).toContain("--color-border: #353B42");
    expect(cssContent).toContain("--color-text: #F2F0E8");
    expect(cssContent).toContain("--color-accent: #C7A66A");
    expect(cssContent).toContain("--board-light: #E8E3D8");
    expect(cssContent).toContain("--board-dark: #68716F");
    expect(cssContent).toContain("prefers-reduced-motion");
  });

  it("verifies semantic landmarks are present in layout shell", () => {
    const { container } = render(
      <div>
        <Navbar />
        <main>
          <PlayPage />
        </main>
        <Footer />
      </div>
    );

    expect(container.querySelector("header")).toBeInTheDocument();
    expect(container.querySelector("nav")).toBeInTheDocument();
    expect(container.querySelector("main")).toBeInTheDocument();
    expect(container.querySelector("footer")).toBeInTheDocument();
  });

  it("verifies icon-only buttons have accessible aria-labels", () => {
    render(<Navbar />);
    const settingsBtn = screen.getByRole("link", { name: "Pengaturan" });
    expect(settingsBtn).toBeInTheDocument();

    const mobileMenuBtn = screen.getByRole("button", { name: /Buka menu utama/i });
    expect(mobileMenuBtn).toBeInTheDocument();
  });

  it("ensures mobile overflow protection class is present on containers", () => {
    const layoutPath = path.resolve(import.meta.dirname, "../../src/app/layout.tsx");
    const layoutContent = fs.readFileSync(layoutPath, "utf-8");
    expect(layoutContent).toContain("overflow-x-hidden");
  });

  it("verifies interactive controls on play and puzzles screens have explicit disabled states or clear labels", () => {
    render(<PlayPage />);
    const undoBtn = screen.getByRole("button", { name: "Undo" });
    expect(undoBtn).toBeDisabled();

    render(<PuzzlesPage />);
    expect(screen.getByText("Semua Latihan")).toBeInTheDocument();
  });
});
