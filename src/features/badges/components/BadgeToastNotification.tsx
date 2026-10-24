"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { Sparkles, X } from "lucide-react";
import { BadgeDefinition } from "../types";
import { subscribeBadgeUnlocked } from "../badge-manager";
import { BadgeIcon } from "./BadgeIcon";
import { chessAudio } from "@/lib/audio/chess-audio";

const DISPLAY_DURATION_MS = 4800;

export const BadgeToastNotification: React.FC = () => {
  const [currentBadge, setCurrentBadge] = useState<BadgeDefinition | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const queueRef = useRef<BadgeDefinition[]>([]);
  const isDisplayingRef = useRef(false);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const unmountTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showNextBadgeRef = useRef<() => void>(() => {});

  const dismissCurrent = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }

    setIsVisible(false);

    // Allow 400ms for slide-up exit animation to finish before processing next
    unmountTimeoutRef.current = setTimeout(() => {
      showNextBadgeRef.current();
    }, 400);
  }, []);

  const showNextBadge = useCallback(() => {
    if (queueRef.current.length === 0) {
      isDisplayingRef.current = false;
      setCurrentBadge(null);
      setIsVisible(false);
      return;
    }

    isDisplayingRef.current = true;
    const next = queueRef.current.shift()!;
    setCurrentBadge(next);
    setIsVisible(true);

    // Play cheerful chime
    try {
      chessAudio.playGameStart();
    } catch {}

    // Clear any prior timers
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    if (unmountTimeoutRef.current) clearTimeout(unmountTimeoutRef.current);

    // Auto-dismiss after DISPLAY_DURATION_MS
    hideTimeoutRef.current = setTimeout(() => {
      dismissCurrent();
    }, DISPLAY_DURATION_MS);
  }, [dismissCurrent]);

  useEffect(() => {
    showNextBadgeRef.current = showNextBadge;
  }, [showNextBadge]);

  useEffect(() => {
    const unsubscribe = subscribeBadgeUnlocked((badge) => {
      queueRef.current.push(badge);
      if (!isDisplayingRef.current) {
        showNextBadge();
      }
    });

    return () => {
      unsubscribe();
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      if (unmountTimeoutRef.current) clearTimeout(unmountTimeoutRef.current);
    };
  }, [showNextBadge]);

  if (!currentBadge && !isVisible) {
    return null;
  }

  return (
    <div
      className="fixed top-4 sm:top-6 inset-x-0 z-[100] flex justify-center pointer-events-none px-4"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div
        className={`pointer-events-auto max-w-md w-full bg-[#1C2024]/95 border-2 border-[#C7A66A] shadow-[0_12px_40px_rgba(0,0,0,0.7)] backdrop-blur-md rounded-2xl p-4 flex items-start gap-3.5 transform transition-all duration-500 ease-out ${
          isVisible
            ? "translate-y-0 opacity-100 scale-100"
            : "-translate-y-16 opacity-0 scale-95"
        }`}
      >
        {/* Golden Badge Icon */}
        <div className="relative shrink-0">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#C7A66A]/30 to-[#C7A66A]/10 border border-[#C7A66A]/60 flex items-center justify-center text-[#C7A66A] shadow-inner">
            {currentBadge && <BadgeIcon name={currentBadge.iconName} className="w-6 h-6" />}
          </div>
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C7A66A] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#C7A66A]"></span>
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#C7A66A] mb-0.5">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>Lencana Baru Diraih!</span>
          </div>

          <h4 className="text-sm sm:text-base font-bold text-[#F2F0E8] leading-tight truncate">
            {currentBadge?.title}
          </h4>

          <p className="text-xs text-[#B0B5B9] mt-1 leading-relaxed line-clamp-2">
            {currentBadge?.description}
          </p>

          <p className="text-[10px] text-[#8A9299] mt-1.5 italic">
            {currentBadge?.criteria}
          </p>
        </div>

        {/* Manual Dismiss Button */}
        <button
          onClick={dismissCurrent}
          className="text-[#8A9299] hover:text-[#F2F0E8] transition-colors p-1 rounded-lg hover:bg-[#2C3238] shrink-0"
          aria-label="Tutup notifikasi lencana"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
