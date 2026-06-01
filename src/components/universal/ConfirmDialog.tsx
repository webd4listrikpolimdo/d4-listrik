"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { HiXMark, HiOutlineExclamationTriangle, HiOutlineQuestionMarkCircle } from "react-icons/hi2";

interface ConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** "danger" uses red styling for the confirm button, "default" uses primary blue */
  variant?: "danger" | "default";
}

export default function ConfirmDialog({
  isOpen,
  onConfirm,
  onCancel,
  title = "Konfirmasi",
  message,
  confirmLabel = "OK",
  cancelLabel = "Batal",
  variant = "default",
}: ConfirmDialogProps) {
  const [mounted, setMounted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset processing state when dialog closes
  useEffect(() => {
    if (!isOpen) setIsProcessing(false);
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isProcessing) onCancel();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel, isProcessing]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const isDanger = variant === "danger";

  const handleConfirmClick = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      await onConfirm();
    } finally {
      setIsProcessing(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={isProcessing ? undefined : onCancel}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[calc(100vh-2rem)] flex flex-col overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 pt-4 sm:pt-5 pb-0 flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              isDanger ? "bg-red-100 text-red-600" : "bg-primary-100 text-primary-600"
            }`}>
              {isDanger ? (
                <HiOutlineExclamationTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <HiOutlineQuestionMarkCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50 flex-shrink-0"
            title="Tutup"
          >
            <HiXMark className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 overflow-y-auto flex-1 min-h-0">
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{message}</p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 sm:gap-3 px-4 sm:px-6 pb-4 sm:pb-5 pt-2 flex-shrink-0 border-t border-gray-50">
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirmClick}
            disabled={isProcessing}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-medium text-white transition-colors disabled:opacity-50 ${
              isDanger
                ? "bg-red-600 hover:bg-red-700"
                : "bg-primary-600 hover:bg-primary-700"
            }`}
          >
            {isProcessing ? "Memproses..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
