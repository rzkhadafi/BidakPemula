import React from "react";
import { notFound } from "next/navigation";
import { PUZZLE_CATALOG, getPuzzleById } from "@/features/puzzles/puzzle-catalog";
import { PuzzleViewClient } from "@/features/puzzles/PuzzleViewClient";

export function generateStaticParams() {
  return PUZZLE_CATALOG.map((puzzle) => ({
    puzzleId: puzzle.id,
  }));
}

export default async function PuzzleDetailPage({
  params,
}: {
  params: Promise<{ puzzleId: string }>;
}) {
  const { puzzleId } = await params;
  const currentIdx = PUZZLE_CATALOG.findIndex((p) => p.id === puzzleId);

  const puzzle = getPuzzleById(puzzleId);
  if (!puzzle) {
    notFound();
  }

  const prevPuzzle = currentIdx > 0 ? PUZZLE_CATALOG[currentIdx - 1] : null;
  const nextPuzzle = currentIdx < PUZZLE_CATALOG.length - 1 ? PUZZLE_CATALOG[currentIdx + 1] : null;

  return (
    <PuzzleViewClient
      puzzle={puzzle}
      prevPuzzle={prevPuzzle}
      nextPuzzle={nextPuzzle}
    />
  );
}
