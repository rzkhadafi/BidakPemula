"use client";

import React from "react";
import { RadarArrow } from "@/features/chessboard/radar-arrows";

interface RadarArrowsOverlayProps {
  arrows: RadarArrow[];
  files: string[];
  ranks: number[];
}

export const RadarArrowsOverlay: React.FC<RadarArrowsOverlayProps> = ({
  arrows,
  files,
  ranks,
}) => {
  if (arrows.length === 0) return null;

  return (
    <svg
      viewBox="0 0 800 800"
      className="absolute inset-0 w-full h-full pointer-events-none z-18 animate-in fade-in duration-150"
      aria-hidden="true"
    >
      <defs>
        {/* Safe Arrow Marker (Emerald Green / Mint) */}
        <marker
          id="radar-arrow-safe"
          viewBox="0 0 12 12"
          refX="8"
          refY="6"
          markerWidth="7"
          markerHeight="7"
          orient="auto"
        >
          <path
            d="M 1 2 L 10 6 L 1 10 L 3.5 6 Z"
            fill="#73B894"
            fillOpacity="0.95"
          />
        </marker>

        {/* Capture Arrow Marker (Ruby Red / Warning) */}
        <marker
          id="radar-arrow-capture"
          viewBox="0 0 12 12"
          refX="8"
          refY="6"
          markerWidth="8"
          markerHeight="8"
          orient="auto"
        >
          <path
            d="M 1 1.5 L 11 6 L 1 10.5 L 4 6 Z"
            fill="#E17C78"
            fillOpacity="0.98"
          />
        </marker>

        {/* Subtle drop shadow filter for dark board legibility */}
        <filter id="radar-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.6" />
        </filter>
      </defs>

      {/* Render each radar arrow */}
      {arrows.map((arrow) => {
        const fromCol = files.indexOf(arrow.fromSquare[0]);
        const fromRow = ranks.indexOf(Number(arrow.fromSquare[1]));
        const toCol = files.indexOf(arrow.toSquare[0]);
        const toRow = ranks.indexOf(Number(arrow.toSquare[1]));

        if (fromCol === -1 || fromRow === -1 || toCol === -1 || toRow === -1) {
          return null;
        }

        const fromX = fromCol * 100 + 50;
        const fromY = fromRow * 100 + 50;
        const toX = toCol * 100 + 50;
        const toY = toRow * 100 + 50;

        const dx = toX - fromX;
        const dy = toY - fromY;
        const dist = Math.hypot(dx, dy);

        if (dist === 0) return null;

        const color = arrow.isCapture ? "#E17C78" : "#73B894";
        const marker = arrow.isCapture
          ? "url(#radar-arrow-capture)"
          : "url(#radar-arrow-safe)";
        const strokeWidth = arrow.isCapture ? 5 : 4.2;
        const strokeOpacity = arrow.isCapture ? 0.9 : 0.75;

        let pathData = "";

        if (arrow.isKnight) {
          // L-shaped trajectory path for Knights
          const absDx = Math.abs(dx);
          const absDy = Math.abs(dy);

          if (absDy > absDx) {
            // 2 squares vertically, 1 horizontally
            const signY = dy > 0 ? 1 : -1;
            const signX = dx > 0 ? 1 : -1;
            const startY = fromY + signY * 18;
            const cornerY = toY;
            const elbowEndY = cornerY - signY * 18;
            const elbowEndX = fromX + signX * 18;
            const targetX = toX - signX * 22;

            pathData = `M ${fromX} ${startY} L ${fromX} ${elbowEndY} Q ${fromX} ${cornerY} ${elbowEndX} ${cornerY} L ${targetX} ${cornerY}`;
          } else {
            // 2 squares horizontally, 1 vertically
            const signX = dx > 0 ? 1 : -1;
            const signY = dy > 0 ? 1 : -1;
            const startX = fromX + signX * 18;
            const cornerX = toX;
            const elbowEndX = cornerX - signX * 18;
            const elbowEndY = fromY + signY * 18;
            const targetY = toY - signY * 22;

            pathData = `M ${startX} ${fromY} L ${elbowEndX} ${fromY} Q ${cornerX} ${fromY} ${cornerX} ${elbowEndY} L ${cornerX} ${targetY}`;
          }
        } else {
          // Direct linear path for sliding/straight pieces
          const ux = dx / dist;
          const uy = dy / dist;
          const startX = fromX + ux * 20;
          const startY = fromY + uy * 20;
          const endX = toX - ux * 22;
          const endY = toY - uy * 22;

          pathData = `M ${startX} ${startY} L ${endX} ${endY}`;
        }

        const arrowKey = `${arrow.fromSquare}-${arrow.toSquare}`;

        return (
          <g key={arrowKey} filter="url(#radar-glow)">
            {/* The main trajectory vector line */}
            <path
              d={pathData}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeOpacity={strokeOpacity}
              strokeLinecap="round"
              strokeLinejoin="round"
              markerEnd={marker}
            />

            {/* Target Reticle for Captures */}
            {arrow.isCapture && (
              <circle
                cx={toX}
                cy={toY}
                r={22}
                fill="none"
                stroke="#E17C78"
                strokeWidth={2}
                strokeOpacity={0.8}
                strokeDasharray="4 3"
              />
            )}
          </g>
        );
      })}

      {/* Origin indicator circle under the selected piece */}
      {arrows.length > 0 && (() => {
        const fromCol = files.indexOf(arrows[0].fromSquare[0]);
        const fromRow = ranks.indexOf(Number(arrows[0].fromSquare[1]));
        if (fromCol !== -1 && fromRow !== -1) {
          const fx = fromCol * 100 + 50;
          const fy = fromRow * 100 + 50;
          return (
            <circle
              cx={fx}
              cy={fy}
              r={12}
              fill="#F5C342"
              fillOpacity={0.4}
              stroke="#F5C342"
              strokeWidth={2}
              strokeOpacity={0.8}
            />
          );
        }
        return null;
      })()}
    </svg>
  );
};
