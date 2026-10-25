"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-lg bg-[#1C2024] border border-[#353B42] rounded-xl shadow-2xl p-4 sm:p-6 text-[#F2F0E8] max-h-[90dvh] overflow-y-auto">
        <div className="flex items-start justify-between gap-3 mb-3 sm:mb-4">
          <div className="min-w-0 pr-1">
            <h2 id="modal-title" className="text-base sm:text-lg font-semibold text-[#F2F0E8] leading-snug">
              {title}
            </h2>
            {description && (
              <p className="text-xs sm:text-sm text-[#B0B5B9] mt-1 leading-relaxed">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup dialog"
            className="p-1.5 rounded-lg text-[#B0B5B9] hover:text-[#F2F0E8] hover:bg-[#2C3238] transition-colors focus-visible:outline-2 focus-visible:outline-[#C7A66A] shrink-0 min-w-[32px] min-h-[32px] flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};
